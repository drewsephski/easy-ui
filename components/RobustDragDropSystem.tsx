"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData, useTemplateBuilder } from '@/contexts/TemplateBuilderContext';
import { ComponentId, COMPONENT_MAP } from '@/app/template-builder/component-mapping';
import { useSnapEngine } from '@/components/SnapEngine';
import AlignmentGuideEngine from '@/components/AlignmentGuideEngine';
import DistanceMeasurementSystem from '@/components/DistanceMeasurement';
import OverlapDetectionSystem from '@/components/OverlapDetection';

interface RobustDropZoneProps {
  children: React.ReactNode;
  zoom: number;
  pan: { x: number; y: number };
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  components: ComponentData[];
  onDrop?: (item: any, position: { x: number; y: number }) => void;
  className?: string;
}

interface DropPreview {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  componentType: string;
  isValid: boolean;
  snapPosition?: { x: number; y: number };
  conflicts: string[];
}

interface DragState {
  isDragging: boolean;
  draggedComponent: ComponentData | null;
  dragType: 'new' | 'existing' | null;
  previewPosition: { x: number; y: number } | null;
}

const GRID_SIZE = 15;
const CANVAS_PADDING = 20;
const MIN_COMPONENT_SIZE = { width: 50, height: 30 };

export const RobustDropZone: React.FC<RobustDropZoneProps> = ({
  children,
  zoom,
  pan,
  showGrid = true,
  gridSize = GRID_SIZE,
  snapToGrid = true,
  components,
  onDrop,
  className = '',
}) => {
  const { addComponent, moveComponent, updateComponent } = useTemplateBuilder();
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedComponent: null,
    dragType: null,
    previewPosition: null,
  });
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Initialize snap engine
  const snapEngine = useSnapEngine({
    components,
    snapToGrid,
    snapToComponents: true,
    gridSize,
    snapThreshold: 15,
    enabled: true,
  });

  // Get canvas bounds
  const getCanvasBounds = useCallback(() => {
    if (!dropZoneRef.current) return null;
    
    const rect = dropZoneRef.current.getBoundingClientRect();
    return {
      left: CANVAS_PADDING,
      top: CANVAS_PADDING,
      right: rect.width / zoom - CANVAS_PADDING,
      bottom: rect.height / zoom - CANVAS_PADDING,
    };
  }, [zoom]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!dropZoneRef.current) return { x: 0, y: 0 };
    
    const rect = dropZoneRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // Get component dimensions with fallback
  const getComponentDimensions = useCallback((componentType: string, item?: any) => {
    // If item has dimensions, use those
    if (item?.width && item?.height) {
      return { width: item.width, height: item.height };
    }
    
    // Try to get from component definition
    const componentDef = COMPONENT_MAP[componentType as ComponentId];
    if (componentDef?.defaultSize) {
      return componentDef.defaultSize;
    }
    
    // Fallback to minimum size
    return MIN_COMPONENT_SIZE;
  }, []);

  // Ensure position is within canvas bounds and doesn't cause overlaps
  const constrainPosition = useCallback((
    position: { x: number; y: number },
    dimensions: { width: number; height: number },
    excludeId?: string
  ) => {
    const bounds = getCanvasBounds();
    if (!bounds) return position;

    // Constrain to canvas bounds
    let constrainedX = Math.max(bounds.left, Math.min(bounds.right - dimensions.width, position.x));
    let constrainedY = Math.max(bounds.top, Math.min(bounds.bottom - dimensions.height, position.y));

    // Snap to grid if enabled
    if (snapToGrid) {
      constrainedX = Math.round(constrainedX / gridSize) * gridSize;
      constrainedY = Math.round(constrainedY / gridSize) * gridSize;
    }

    return { x: constrainedX, y: constrainedY };
  }, [getCanvasBounds, snapToGrid, gridSize]);

  // Check for conflicts with existing components
  const checkConflicts = useCallback((
    position: { x: number; y: number },
    dimensions: { width: number; height: number },
    excludeId?: string
  ): string[] => {
    const conflicts: string[] = [];
    
    components.forEach(component => {
      if (component.id === excludeId || !component.visible) return;
      
      const hasOverlap = !(
        position.x >= component.x + component.width ||
        position.x + dimensions.width <= component.x ||
        position.y >= component.y + component.height ||
        position.y + dimensions.height <= component.y
      );
      
      if (hasOverlap) {
        conflicts.push(component.id);
      }
    });
    
    return conflicts;
  }, [components]);

  // Handle drop zone interactions
  const [{ isOver, dragItem }, drop] = useDrop({
    accept: ['component', 'canvas_object', 'COMPONENT', 'CANVAS_OBJECT'],
    hover: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const canvasPosition = screenToCanvas(clientOffset.x, clientOffset.y);
      const itemType = monitor.getItemType();
      
      let dimensions: { width: number; height: number };
      let componentType: string;
      let dragType: 'new' | 'existing';

      if (itemType === 'component' || itemType === 'COMPONENT' || item.type === 'component') {
        // New component from sidebar
        componentType = item.id || item.componentType || item.content;
        dimensions = getComponentDimensions(componentType, item);
        dragType = 'new';
      } else {
        // Existing component being moved
        componentType = item.content || item.componentType || item.id;
        dimensions = getComponentDimensions(componentType, item);
        dragType = 'existing';
        
        // Update drag state for alignment guides
        const component = components.find(c => c.id === item.id);
        if (component && component !== dragState.draggedComponent) {
          setDragState(prev => ({
            ...prev,
            isDragging: true,
            draggedComponent: component,
            dragType,
            previewPosition: canvasPosition,
          }));
        }
      }

      // Calculate snap position
      const snapResult = snapEngine.calculateSnapPosition(canvasPosition, dimensions);
      const finalPosition = constrainPosition(snapResult.position, dimensions, item.id);
      const conflicts = checkConflicts(finalPosition, dimensions, item.id);

      setDropPreview({
        position: canvasPosition,
        dimensions,
        componentType,
        isValid: conflicts.length === 0,
        snapPosition: snapResult.hasSnapped ? snapResult.position : undefined,
        conflicts,
      });
    },
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const canvasPosition = screenToCanvas(clientOffset.x, clientOffset.y);
      const itemType = monitor.getItemType();
      
      let dimensions: { width: number; height: number };
      let componentType: string;

      if (itemType === 'component' || itemType === 'COMPONENT' || item.type === 'component') {
        // New component from sidebar
        componentType = item.id || item.componentType || item.content;
        dimensions = getComponentDimensions(componentType, item);
        
        // Calculate final position with snapping and constraints
        const snapResult = snapEngine.calculateSnapPosition(canvasPosition, dimensions);
        const finalPosition = constrainPosition(snapResult.position, dimensions);
        const conflicts = checkConflicts(finalPosition, dimensions);
        
        console.log('Dropping new component:', {
          componentType,
          finalPosition,
          dimensions,
          conflicts: conflicts.length,
        });
        
        // Only add if no conflicts or force add with slight offset
        if (conflicts.length === 0) {
          addComponent(componentType as ComponentId, finalPosition);
        } else {
          // Try to find a nearby position without conflicts
          let offsetPosition = { ...finalPosition };
          let attempts = 0;
          const maxAttempts = 10;
          
          while (conflicts.length > 0 && attempts < maxAttempts) {
            offsetPosition.x += gridSize;
            offsetPosition.y += gridSize;
            const newConflicts = checkConflicts(offsetPosition, dimensions);
            if (newConflicts.length === 0) {
              addComponent(componentType as ComponentId, offsetPosition);
              break;
            }
            attempts++;
          }
          
          // If still conflicts, add anyway but warn
          if (attempts >= maxAttempts) {
            console.warn('Could not find conflict-free position, adding anyway');
            addComponent(componentType as ComponentId, finalPosition);
          }
        }
        
        onDrop?.(item, finalPosition);
      } else {
        // Existing component move - this is handled by the component itself
        console.log('Existing component drop handled by component');
      }
      
      // Clear states
      setDropPreview(null);
      setDragState({
        isDragging: false,
        draggedComponent: null,
        dragType: null,
        previewPosition: null,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dragItem: monitor.getItem(),
    }),
  });

  // Clear states when drag ends
  useEffect(() => {
    if (!isOver) {
      setDropPreview(null);
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedComponent: null,
        previewPosition: null,
      }));
    }
  }, [isOver]);

  const renderGrid = () => {
    if (!showGrid || !isOver) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
    );
  };

  const renderDropPreview = () => {
    if (!dropPreview) return null;

    const { position, dimensions, isValid, snapPosition, conflicts } = dropPreview;
    const finalPosition = snapPosition || position;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`absolute border-2 border-dashed rounded-lg pointer-events-none ${
          isValid 
            ? 'border-green-400 bg-green-50/30' 
            : 'border-red-400 bg-red-50/30'
        }`}
        style={{
          left: finalPosition.x * zoom + pan.x,
          top: finalPosition.y * zoom + pan.y,
          width: dimensions.width * zoom,
          height: dimensions.height * zoom,
          zIndex: 1000,
        }}
      >
        {/* Drop indicator */}
        <div className={`absolute inset-0 rounded-lg ${
          isValid ? 'bg-green-400/20' : 'bg-red-400/20'
        }`} />
        
        {/* Snap indicator */}
        {snapPosition && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
          />
        )}
        
        {/* Size indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap shadow-lg">
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
        </div>
        
        {/* Position indicator */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap shadow-lg">
          {Math.round(finalPosition.x)}, {Math.round(finalPosition.y)}
        </div>
        
        {/* Conflict warning */}
        {!isValid && conflicts.length > 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-red-500 text-white text-xs rounded shadow-lg">
            Conflicts with {conflicts.length} component{conflicts.length > 1 ? 's' : ''}
          </div>
        )}
      </motion.div>
    );
  };

  const renderDropZoneHighlight = () => {
    if (!isOver) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          border: '2px dashed rgba(59, 130, 246, 0.4)',
        }}
      />
    );
  };

  return (
    <div
      ref={drop as any}
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: '100vh' }}
    >
      <div ref={dropZoneRef} className="relative w-full h-full">
        <AnimatePresence>
          {renderGrid()}
          {renderDropZoneHighlight()}
          {renderDropPreview()}
        </AnimatePresence>

        {/* Alignment guides for existing component movement */}
        <AlignmentGuideEngine
          activeComponent={dragState.draggedComponent}
          allComponents={components}
          isActive={dragState.isDragging && dragState.dragType === 'existing'}
          zoom={zoom}
        />

        {/* Distance measurements */}
        <DistanceMeasurementSystem
          activeComponent={dragState.draggedComponent}
          allComponents={components}
          showMeasurements={dragState.isDragging && dragState.dragType === 'existing'}
          zoom={zoom}
        />

        {/* Overlap detection */}
        <OverlapDetectionSystem
          components={components}
          activeComponentId={dragState.draggedComponent?.id}
          onUpdateComponent={updateComponent}
          showOverlapIndicators={true}
          showSuggestions={false} // Don't show during drag
        />

        {children}
      </div>
    </div>
  );
};

export default RobustDropZone;
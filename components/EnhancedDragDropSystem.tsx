"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData, useTemplateBuilder } from '@/contexts/TemplateBuilderContext';
import { ComponentId, COMPONENT_MAP } from '@/app/template-builder/component-mapping';
import { useSnapEngine } from '@/components/SnapEngine';
import AlignmentGuideEngine from '@/components/AlignmentGuideEngine';
import DistanceMeasurementSystem from '@/components/DistanceMeasurement';

interface EnhancedDropZoneProps {
  children: React.ReactNode;
  zoom: number;
  pan: { x: number; y: number };
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  components: ComponentData[];
  onDrop?: (item: any, position: { x: number; y: number }) => void;
  onComponentDrop?: (componentId: string, position: { x: number; y: number }) => void;
  className?: string;
}

interface DropPreview {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  componentType: string;
  isValid: boolean;
  snapPosition?: { x: number; y: number };
}

const GRID_SIZE = 15;
const CANVAS_PADDING = 50;

export const EnhancedDropZone: React.FC<EnhancedDropZoneProps> = ({
  children,
  zoom,
  pan,
  showGrid = true,
  gridSize = GRID_SIZE,
  onComponentDrop,
}) => {
  const { addComponent, components, selectedComponentIds } = useTemplateBuilder();
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentData | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Initialize snap engine
  const snapEngine = useSnapEngine({
    components,
    snapToGrid: true,
    snapToComponents: true,
    gridSize,
    snapThreshold: 15,
    enabled: true,
  });

  // Calculate canvas bounds to ensure components stay visible
  const getCanvasBounds = useCallback(() => {
    if (!dropZoneRef.current) return null;
    
    const rect = dropZoneRef.current.getBoundingClientRect();
    return {
      left: CANVAS_PADDING,
      top: CANVAS_PADDING,
      right: rect.width - CANVAS_PADDING,
      bottom: rect.height - CANVAS_PADDING,
    };
  }, []);

  // Ensure position is within canvas bounds
  const constrainToCanvas = useCallback((
    position: { x: number; y: number },
    dimensions: { width: number; height: number }
  ) => {
    const bounds = getCanvasBounds();
    if (!bounds) return position;

    return {
      x: Math.max(bounds.left, Math.min(bounds.right - dimensions.width, position.x)),
      y: Math.max(bounds.top, Math.min(bounds.bottom - dimensions.height, position.y)),
    };
  }, [getCanvasBounds]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!dropZoneRef.current) return { x: 0, y: 0 };
    
    const rect = dropZoneRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // Get component dimensions
  const getComponentDimensions = useCallback((componentType: string) => {
    const componentDef = COMPONENT_MAP[componentType as ComponentId];
    return componentDef?.defaultSize || { width: 200, height: 100 };
  }, []);

  // Check if position is valid (no overlaps, within bounds)
  const isValidPosition = useCallback((
    position: { x: number; y: number },
    dimensions: { width: number; height: number },
    excludeId?: string
  ) => {
    const bounds = getCanvasBounds();
    if (!bounds) return false;

    // Check canvas bounds
    if (
      position.x < bounds.left ||
      position.y < bounds.top ||
      position.x + dimensions.width > bounds.right ||
      position.y + dimensions.height > bounds.bottom
    ) {
      return false;
    }

    // Check for overlaps with existing components
    const hasOverlap = components.some(component => {
      if (component.id === excludeId) return false;
      
      return !(
        position.x >= component.x + component.width ||
        position.x + dimensions.width <= component.x ||
        position.y >= component.y + component.height ||
        position.y + dimensions.height <= component.y
      );
    });

    return !hasOverlap;
  }, [components, getCanvasBounds]);

  const [{ isOver, dragItem }, drop] = useDrop({
    accept: ['component', 'canvas_object'],
    hover: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const canvasPosition = screenToCanvas(clientOffset.x, clientOffset.y);
      
      let dimensions: { width: number; height: number };
      let componentType: string;

      if (item.type === 'component' || monitor.getItemType() === 'component') {
        // New component from sidebar
        componentType = item.id || item.componentType;
        dimensions = item.dimensions || getComponentDimensions(componentType);
      } else {
        // Existing component being moved
        componentType = item.content || item.componentType;
        dimensions = { width: item.width || 200, height: item.height || 100 };
        
        // Set dragged component for alignment guides
        const component = components.find(c => c.id === item.id);
        if (component && component !== draggedComponent) {
          setDraggedComponent(component);
        }
      }

      // Calculate snap position
      const snapResult = snapEngine.calculateSnapPosition(canvasPosition, dimensions);
      const finalPosition = constrainToCanvas(snapResult.position, dimensions);
      const isValid = isValidPosition(finalPosition, dimensions, item.id);

      setDropPreview({
        position: canvasPosition,
        dimensions,
        componentType,
        isValid,
        snapPosition: snapResult.hasSnapped ? snapResult.position : undefined,
      });
    },
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const canvasPosition = screenToCanvas(clientOffset.x, clientOffset.y);
      
      let dimensions: { width: number; height: number };
      let componentType: string;

      if (item.type === 'component' || monitor.getItemType() === 'component') {
        // New component from sidebar
        componentType = item.id || item.componentType;
        dimensions = item.dimensions || getComponentDimensions(componentType);
        
        // Calculate final position with snapping and constraints
        const snapResult = snapEngine.calculateSnapPosition(canvasPosition, dimensions);
        const finalPosition = constrainToCanvas(snapResult.position, dimensions);
        
        // Ensure component is visible by adding padding if needed
        const safePosition = {
          x: Math.max(20, finalPosition.x),
          y: Math.max(20, finalPosition.y)
        };
        
        console.log('Dropping component:', componentType, 'at position:', safePosition);
        addComponent(componentType as ComponentId, safePosition);
        onComponentDrop?.(componentType, safePosition);
      }
      
      // Clear preview and dragged component
      setDropPreview(null);
      setDraggedComponent(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dragItem: monitor.getItem(),
    }),
  });

  // Clear preview when drag ends
  useEffect(() => {
    if (!isOver) {
      setDropPreview(null);
      setDraggedComponent(null);
    }
  }, [isOver]);

  const renderGrid = () => {
    if (!showGrid || !isOver) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
    );
  };

  const renderDropPreview = () => {
    if (!dropPreview) return null;

    const { position, dimensions, isValid, snapPosition } = dropPreview;
    const finalPosition = snapPosition || position;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute border-2 border-dashed rounded-lg pointer-events-none ${
          isValid 
            ? 'border-green-400 bg-green-50/20' 
            : 'border-red-400 bg-red-50/20'
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
          isValid ? 'bg-green-400/10' : 'bg-red-400/10'
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
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
        </div>
        
        {/* Position indicator */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
          {Math.round(finalPosition.x)}, {Math.round(finalPosition.y)}
        </div>
        
        {/* Invalid position warning */}
        {!isValid && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-red-500 text-white text-xs rounded">
            Invalid Position
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
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
        }}
      />
    );
  };

  return (
    <div
      ref={drop as any}
      className="relative w-full h-full"
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
          activeComponent={draggedComponent}
          allComponents={components}
          isActive={!!draggedComponent}
          zoom={zoom}
        />

        {/* Distance measurements */}
        <DistanceMeasurementSystem
          activeComponent={draggedComponent}
          allComponents={components}
          showMeasurements={!!draggedComponent}
          zoom={zoom}
        />

        {children}
      </div>
    </div>
  );
};

export default EnhancedDropZone;
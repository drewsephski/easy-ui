'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

interface Position {
  x: number;
  y: number;
}

interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'component-edge' | 'component-center';
  componentId?: string;
  strength: number;
}

interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  components: string[];
  strength: number;
}

interface DropPreview {
  position: Position;
  dimensions: { width: number; height: number };
  isValid: boolean;
  conflicts: string[];
}

interface SmartDropZoneProps {
  onDrop: (item: any, position: Position) => void;
  showGuides: boolean;
  snapToGrid: boolean;
  gridSize: number;
  components: ComponentData[];
  children: React.ReactNode;
  className?: string;
  snapThreshold?: number;
}

interface DropZoneState {
  isActive: boolean;
  nearestSnapPoints: SnapPoint[];
  alignmentGuides: AlignmentGuide[];
  dropPreview: DropPreview | null;
  dragPosition: Position | null;
}

const SNAP_THRESHOLD = 15;
const GUIDE_STRENGTH_THRESHOLD = 0.7;

export const SmartDropZone: React.FC<SmartDropZoneProps> = ({
  onDrop,
  showGuides = true,
  snapToGrid = true,
  gridSize = 15,
  components = [],
  children,
  className = '',
  snapThreshold = SNAP_THRESHOLD
}) => {
  const [dropZoneState, setDropZoneState] = useState<DropZoneState>({
    isActive: false,
    nearestSnapPoints: [],
    alignmentGuides: [],
    dropPreview: null,
    dragPosition: null
  });

  // Calculate snap points based on grid and existing components
  const calculateSnapPoints = useCallback((dragPosition: Position, dragItem: any): SnapPoint[] => {
    const snapPoints: SnapPoint[] = [];
    
    // Grid snap points
    if (snapToGrid) {
      const gridX = Math.round(dragPosition.x / gridSize) * gridSize;
      const gridY = Math.round(dragPosition.y / gridSize) * gridSize;
      
      const gridDistance = Math.sqrt(
        Math.pow(dragPosition.x - gridX, 2) + Math.pow(dragPosition.y - gridY, 2)
      );
      
      if (gridDistance <= snapThreshold) {
        snapPoints.push({
          x: gridX,
          y: gridY,
          type: 'grid',
          strength: 1 - (gridDistance / snapThreshold)
        });
      }
    }

    // Component edge snap points
    components.forEach(component => {
      if (dragItem?.id === component.id) return; // Don't snap to self
      
      const componentEdges = [
        { x: component.x, y: component.y, type: 'top-left' },
        { x: component.x + component.width, y: component.y, type: 'top-right' },
        { x: component.x, y: component.y + component.height, type: 'bottom-left' },
        { x: component.x + component.width, y: component.y + component.height, type: 'bottom-right' },
        { x: component.x + component.width / 2, y: component.y + component.height / 2, type: 'center' }
      ];

      componentEdges.forEach(edge => {
        const distance = Math.sqrt(
          Math.pow(dragPosition.x - edge.x, 2) + Math.pow(dragPosition.y - edge.y, 2)
        );
        
        if (distance <= snapThreshold) {
          snapPoints.push({
            x: edge.x,
            y: edge.y,
            type: edge.type === 'center' ? 'component-center' : 'component-edge',
            componentId: component.id,
            strength: 1 - (distance / snapThreshold)
          });
        }
      });
    });

    return snapPoints.sort((a, b) => b.strength - a.strength);
  }, [snapToGrid, gridSize, snapThreshold, components]);

  // Calculate alignment guides
  const calculateAlignmentGuides = useCallback((dragPosition: Position, dragItem: any): AlignmentGuide[] => {
    const guides: AlignmentGuide[] = [];
    const dragWidth = dragItem?.width || dragItem?.dimensions?.width || 100;
    const dragHeight = dragItem?.height || dragItem?.dimensions?.height || 100;
    
    components.forEach(component => {
      if (dragItem?.id === component.id) return;
      
      // Horizontal alignment guides
      const horizontalAlignments = [
        { pos: component.y, type: 'top-to-top' },
        { pos: component.y + component.height, type: 'bottom-to-bottom' },
        { pos: component.y + component.height / 2, type: 'center-to-center' },
        { pos: component.y - dragHeight, type: 'bottom-to-top' },
        { pos: component.y + component.height, type: 'top-to-bottom' }
      ];

      horizontalAlignments.forEach(align => {
        const distance = Math.abs(dragPosition.y - align.pos);
        if (distance <= snapThreshold) {
          const strength = 1 - (distance / snapThreshold);
          if (strength >= GUIDE_STRENGTH_THRESHOLD) {
            guides.push({
              type: 'horizontal',
              position: align.pos,
              start: Math.min(dragPosition.x, component.x) - 20,
              end: Math.max(dragPosition.x + dragWidth, component.x + component.width) + 20,
              components: [component.id],
              strength
            });
          }
        }
      });

      // Vertical alignment guides
      const verticalAlignments = [
        { pos: component.x, type: 'left-to-left' },
        { pos: component.x + component.width, type: 'right-to-right' },
        { pos: component.x + component.width / 2, type: 'center-to-center' },
        { pos: component.x - dragWidth, type: 'right-to-left' },
        { pos: component.x + component.width, type: 'left-to-right' }
      ];

      verticalAlignments.forEach(align => {
        const distance = Math.abs(dragPosition.x - align.pos);
        if (distance <= snapThreshold) {
          const strength = 1 - (distance / snapThreshold);
          if (strength >= GUIDE_STRENGTH_THRESHOLD) {
            guides.push({
              type: 'vertical',
              position: align.pos,
              start: Math.min(dragPosition.y, component.y) - 20,
              end: Math.max(dragPosition.y + dragHeight, component.y + component.height) + 20,
              components: [component.id],
              strength
            });
          }
        }
      });
    });

    return guides.sort((a, b) => b.strength - a.strength);
  }, [components, snapThreshold]);

  // Detect conflicts with existing components
  const detectConflicts = useCallback((position: Position, dimensions: { width: number; height: number }, dragItem: any): string[] => {
    const conflicts: string[] = [];
    
    components.forEach(component => {
      if (dragItem?.id === component.id) return;
      
      const overlap = !(
        position.x >= component.x + component.width ||
        position.x + dimensions.width <= component.x ||
        position.y >= component.y + component.height ||
        position.y + dimensions.height <= component.y
      );
      
      if (overlap) {
        conflicts.push(component.id);
      }
    });
    
    return conflicts;
  }, [components]);

  // Calculate optimal drop position with snapping
  const calculateDropPosition = useCallback((rawPosition: Position, dragItem: any): Position => {
    const snapPoints = calculateSnapPoints(rawPosition, dragItem);
    
    if (snapPoints.length > 0) {
      const bestSnap = snapPoints[0];
      return { x: bestSnap.x, y: bestSnap.y };
    }
    
    return rawPosition;
  }, [calculateSnapPoints]);

  const [{ isOver, dragItem }, drop] = useDrop({
    accept: ['COMPONENT', 'EXISTING_COMPONENT', 'MULTI_COMPONENT'],
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const dropZoneRect = (monitor.getDropResult() as any)?.getBoundingClientRect?.() || 
                          document.querySelector('[data-drop-zone]')?.getBoundingClientRect();
      
      if (!dropZoneRect) return;

      const rawPosition = {
        x: clientOffset.x - dropZoneRect.left,
        y: clientOffset.y - dropZoneRect.top
      };

      const finalPosition = calculateDropPosition(rawPosition, item);
      onDrop(item, finalPosition);
    },
    hover: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const dropZoneRect = document.querySelector('[data-drop-zone]')?.getBoundingClientRect();
      if (!dropZoneRect) return;

      const dragPosition = {
        x: clientOffset.x - dropZoneRect.left,
        y: clientOffset.y - dropZoneRect.top
      };

      const snapPoints = calculateSnapPoints(dragPosition, item);
      const alignmentGuides = showGuides ? calculateAlignmentGuides(dragPosition, item) : [];
      
      const dimensions = {
        width: item?.width || item?.dimensions?.width || 100,
        height: item?.height || item?.dimensions?.height || 100
      };
      
      const finalPosition = calculateDropPosition(dragPosition, item);
      const conflicts = detectConflicts(finalPosition, dimensions, item);

      setDropZoneState({
        isActive: true,
        nearestSnapPoints: snapPoints,
        alignmentGuides,
        dropPreview: {
          position: finalPosition,
          dimensions,
          isValid: conflicts.length === 0,
          conflicts
        },
        dragPosition
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dragItem: monitor.getItem()
    })
  });

  // Clear state when drag ends
  useEffect(() => {
    if (!isOver) {
      setDropZoneState({
        isActive: false,
        nearestSnapPoints: [],
        alignmentGuides: [],
        dropPreview: null,
        dragPosition: null
      });
    }
  }, [isOver]);

  const renderGrid = () => {
    if (!snapToGrid || !dropZoneState.isActive) return null;

    const gridLines = [];
    const containerWidth = 2000; // Adjust based on your needs
    const containerHeight = 2000;

    // Vertical grid lines
    for (let x = 0; x <= containerWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={containerHeight}
          stroke="rgba(59, 130, 246, 0.1)"
          strokeWidth="1"
        />
      );
    }

    // Horizontal grid lines
    for (let y = 0; y <= containerHeight; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={containerWidth}
          y2={y}
          stroke="rgba(59, 130, 246, 0.1)"
          strokeWidth="1"
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {gridLines}
      </svg>
    );
  };

  const renderAlignmentGuides = () => {
    if (!showGuides || dropZoneState.alignmentGuides.length === 0) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {dropZoneState.alignmentGuides.map((guide, index) => (
          <motion.line
            key={`${guide.type}-${guide.position}-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            x1={guide.type === 'vertical' ? guide.position : guide.start}
            y1={guide.type === 'horizontal' ? guide.position : guide.start}
            x2={guide.type === 'vertical' ? guide.position : guide.end}
            y2={guide.type === 'horizontal' ? guide.position : guide.end}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        ))}
      </svg>
    );
  };

  const renderDropPreview = () => {
    if (!dropZoneState.dropPreview) return null;

    const { position, dimensions, isValid, conflicts } = dropZoneState.dropPreview;

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
          left: position.x,
          top: position.y,
          width: dimensions.width,
          height: dimensions.height,
          zIndex: 5
        }}
      >
        {!isValid && conflicts.length > 0 && (
          <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Conflicts with {conflicts.length} component{conflicts.length > 1 ? 's' : ''}
          </div>
        )}
      </motion.div>
    );
  };

  const renderSnapIndicators = () => {
    if (dropZoneState.nearestSnapPoints.length === 0) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 8 }}
      >
        {dropZoneState.nearestSnapPoints.slice(0, 3).map((snap, index) => (
          <motion.circle
            key={`snap-${snap.x}-${snap.y}-${index}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            cx={snap.x}
            cy={snap.y}
            r={6}
            fill={snap.type === 'grid' ? '#3b82f6' : snap.type === 'component-center' ? '#8b5cf6' : '#10b981'}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  };

  return (
    <div
      ref={drop as any}
      data-drop-zone
      className={`relative ${className}`}
      style={{ minHeight: '100%' }}
    >
      <AnimatePresence>
        {renderGrid()}
        {renderAlignmentGuides()}
        {renderDropPreview()}
        {renderSnapIndicators()}
      </AnimatePresence>
      {children}
    </div>
  );
};
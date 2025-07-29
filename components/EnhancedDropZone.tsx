'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData } from '@/contexts/TemplateBuilderContext';
import { COMPONENT_MAP } from '@/app/template-builder/component-mapping';

interface DropZoneProps {
  onDrop: (item: any, position: { x: number; y: number }) => void;
  children: React.ReactNode;
  components: ComponentData[];
  zoom: number;
  pan: { x: number; y: number };
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  className?: string;
}

interface DropPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  isValid: boolean;
  conflicts: string[];
  snapIndicators: Array<{ x: number; y: number; type: 'grid' | 'edge' | 'center' }>;
}

const SNAP_THRESHOLD = 20;
const GRID_SIZE = 15;

export const EnhancedDropZone: React.FC<DropZoneProps> = ({
  onDrop,
  children,
  components,
  zoom,
  pan,
  showGrid = true,
  gridSize = GRID_SIZE,
  snapToGrid = true,
  className = ''
}) => {
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Calculate snap points for better positioning
  const calculateSnapPosition = useCallback((x: number, y: number, item: any) => {
    let snapX = x;
    let snapY = y;
    const snapIndicators: Array<{ x: number; y: number; type: 'grid' | 'edge' | 'center' }> = [];

    // Grid snapping
    if (snapToGrid) {
      const gridSnapX = Math.round(x / gridSize) * gridSize;
      const gridSnapY = Math.round(y / gridSize) * gridSize;
      
      if (Math.abs(x - gridSnapX) < SNAP_THRESHOLD / zoom) {
        snapX = gridSnapX;
        snapIndicators.push({ x: gridSnapX, y: gridSnapY, type: 'grid' });
      }
      if (Math.abs(y - gridSnapY) < SNAP_THRESHOLD / zoom) {
        snapY = gridSnapY;
        snapIndicators.push({ x: gridSnapX, y: gridSnapY, type: 'grid' });
      }
    }

    // Component edge snapping
    components.forEach(component => {
      if (item?.id === component.id) return; // Don't snap to self

      const edges = [
        { x: component.x, y: component.y, type: 'edge' as const },
        { x: component.x + component.width, y: component.y, type: 'edge' as const },
        { x: component.x, y: component.y + component.height, type: 'edge' as const },
        { x: component.x + component.width, y: component.y + component.height, type: 'edge' as const },
        { x: component.x + component.width / 2, y: component.y + component.height / 2, type: 'center' as const }
      ];

      edges.forEach(edge => {
        if (Math.abs(x - edge.x) < SNAP_THRESHOLD / zoom) {
          snapX = edge.x;
          snapIndicators.push({ x: edge.x, y: edge.y, type: edge.type });
        }
        if (Math.abs(y - edge.y) < SNAP_THRESHOLD / zoom) {
          snapY = edge.y;
          snapIndicators.push({ x: edge.x, y: edge.y, type: edge.type });
        }
      });
    });

    return { x: snapX, y: snapY, snapIndicators };
  }, [components, snapToGrid, gridSize, zoom]);

  // Detect conflicts with existing components
  const detectConflicts = useCallback((x: number, y: number, width: number, height: number, item: any) => {
    const conflicts: string[] = [];
    
    components.forEach(component => {
      if (item?.id === component.id) return; // Don't conflict with self
      
      const overlap = !(
        x >= component.x + component.width ||
        x + width <= component.x ||
        y >= component.y + component.height ||
        y + height <= component.y
      );
      
      if (overlap) {
        conflicts.push(component.id);
      }
    });
    
    return conflicts;
  }, [components]);

  const [{ isOver, dragItem }, drop] = useDrop({
    accept: ['component', 'canvas_object'],
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const dropZoneRect = (monitor.getDropResult() as any)?.getBoundingClientRect?.() || 
                          document.querySelector('[data-drop-zone]')?.getBoundingClientRect();
      
      if (!dropZoneRect) return;

      const rawX = (clientOffset.x - dropZoneRect.left - pan.x) / zoom;
      const rawY = (clientOffset.y - dropZoneRect.top - pan.y) / zoom;

      const { x, y } = calculateSnapPosition(rawX, rawY, item);
      onDrop(item, { x, y });
      setDropPreview(null);
      setIsDragOver(false);
    },
    hover: (item: any, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const dropZoneRect = document.querySelector('[data-drop-zone]')?.getBoundingClientRect();
      if (!dropZoneRect) return;

      const rawX = (clientOffset.x - dropZoneRect.left - pan.x) / zoom;
      const rawY = (clientOffset.y - dropZoneRect.top - pan.y) / zoom;

      const { x, y, snapIndicators } = calculateSnapPosition(rawX, rawY, item);
      
      // Get component dimensions
      let width = 200;
      let height = 100;
      
      if (item.type === 'component') {
        const componentDef = COMPONENT_MAP[item.id as keyof typeof COMPONENT_MAP];
        if (componentDef?.defaultSize) {
          width = componentDef.defaultSize.width;
          height = componentDef.defaultSize.height;
        }
      } else if (item.width && item.height) {
        width = item.width;
        height = item.height;
      }

      const conflicts = detectConflicts(x, y, width, height, item);

      setDropPreview({
        x,
        y,
        width,
        height,
        isValid: conflicts.length === 0,
        conflicts,
        snapIndicators
      });
      setIsDragOver(true);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dragItem: monitor.getItem()
    })
  });

  // Clear preview when drag ends
  React.useEffect(() => {
    if (!isOver) {
      setDropPreview(null);
      setIsDragOver(false);
    }
  }, [isOver]);

  const renderGrid = () => {
    if (!showGrid || !isDragOver) return null;

    const gridLines = [];
    const containerWidth = 2000;
    const containerHeight = 2000;

    // Enhanced grid visibility during drag
    for (let x = 0; x <= containerWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={containerHeight}
          stroke="rgba(59, 130, 246, 0.2)"
          strokeWidth="1"
        />
      );
    }

    for (let y = 0; y <= containerHeight; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={containerWidth}
          y2={y}
          stroke="rgba(59, 130, 246, 0.2)"
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

  const renderSnapIndicators = () => {
    if (!dropPreview?.snapIndicators.length) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {dropPreview.snapIndicators.map((indicator, index) => (
          <motion.circle
            key={`snap-${indicator.x}-${indicator.y}-${index}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            cx={indicator.x}
            cy={indicator.y}
            r={6}
            fill={
              indicator.type === 'grid' ? '#3b82f6' : 
              indicator.type === 'center' ? '#8b5cf6' : '#10b981'
            }
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  };

  const renderDropPreview = () => {
    if (!dropPreview) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute border-2 border-dashed rounded-lg pointer-events-none ${
          dropPreview.isValid 
            ? 'border-green-400 bg-green-50/20' 
            : 'border-red-400 bg-red-50/20'
        }`}
        style={{
          left: dropPreview.x,
          top: dropPreview.y,
          width: dropPreview.width,
          height: dropPreview.height,
          zIndex: 5
        }}
      >
        {/* Drop preview content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`px-2 py-1 rounded text-xs font-medium ${
              dropPreview.isValid 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {dropPreview.isValid ? 'Drop here' : `Conflicts: ${dropPreview.conflicts.length}`}
          </motion.div>
        </div>

        {/* Corner indicators */}
        {[
          { top: -2, left: -2 },
          { top: -2, right: -2 },
          { bottom: -2, left: -2 },
          { bottom: -2, right: -2 }
        ].map((position, index) => (
          <motion.div
            key={index}
            className={`absolute w-2 h-2 rounded-full ${
              dropPreview.isValid ? 'bg-green-400' : 'bg-red-400'
            }`}
            style={position}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.1 }}
          />
        ))}
      </motion.div>
    );
  };

  const renderDropZoneOverlay = () => {
    if (!isDragOver) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-blue-50/10 border-2 border-dashed border-blue-300 rounded-lg pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
          Drop Zone Active
        </div>
      </motion.div>
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
        {renderDropZoneOverlay()}
        {renderSnapIndicators()}
        {renderDropPreview()}
      </AnimatePresence>
      {children}
    </div>
  );
};
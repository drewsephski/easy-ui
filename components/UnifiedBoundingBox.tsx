"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rotation: number;
}

interface UnifiedBoundingBoxProps {
  selectedComponents: ComponentData[];
  zoom: number;
  pan: { x: number; y: number };
  onGroupMove: (deltaX: number, deltaY: number) => void;
  onGroupResize: (
    deltaX: number,
    deltaY: number,
    deltaWidth: number,
    deltaHeight: number,
    handle: ResizeHandle
  ) => void;
  onGroupRotate: (rotation: number, centerX: number, centerY: number) => void;
  showHandles?: boolean;
}

type ResizeHandle = 
  | 'nw' | 'n' | 'ne'
  | 'w' | 'e'
  | 'sw' | 's' | 'se'
  | 'rotate';

interface HandlePosition {
  x: number;
  y: number;
  cursor: string;
}

const UnifiedBoundingBox: React.FC<UnifiedBoundingBoxProps> = ({
  selectedComponents,
  zoom,
  pan,
  onGroupMove,
  onGroupResize,
  onGroupRotate,
  showHandles = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialBounds, setInitialBounds] = useState<BoundingBox | null>(null);

  const boundingBoxRef = useRef<HTMLDivElement>(null);

  // Calculate bounding box for selected components
  const calculateBoundingBox = useCallback((): BoundingBox | null => {
    if (selectedComponents.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let totalRotation = 0;

    selectedComponents.forEach(component => {
      const left = component.x;
      const top = component.y;
      const right = component.x + component.width;
      const bottom = component.y + component.height;

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
      totalRotation += component.rotation || 0;
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const avgRotation = totalRotation / selectedComponents.length;

    return {
      x: minX,
      y: minY,
      width,
      height,
      centerX: minX + width / 2,
      centerY: minY + height / 2,
      rotation: avgRotation,
    };
  }, [selectedComponents]);

  const boundingBox = calculateBoundingBox();

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((x: number, y: number) => {
    return {
      x: x * zoom + pan.x,
      y: y * zoom + pan.y,
    };
  }, [zoom, pan]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((x: number, y: number) => {
    return {
      x: (x - pan.x) / zoom,
      y: (y - pan.y) / zoom,
    };
  }, [zoom, pan]);

  // Calculate handle positions
  const getHandlePositions = useCallback((bounds: BoundingBox): Record<ResizeHandle, HandlePosition> => {
    const screenBounds = {
      left: bounds.x * zoom + pan.x,
      top: bounds.y * zoom + pan.y,
      right: (bounds.x + bounds.width) * zoom + pan.x,
      bottom: (bounds.y + bounds.height) * zoom + pan.y,
      centerX: bounds.centerX * zoom + pan.x,
      centerY: bounds.centerY * zoom + pan.y,
    };

    const handleSize = 8;
    const rotateHandleOffset = 20;

    return {
      nw: { x: screenBounds.left - handleSize / 2, y: screenBounds.top - handleSize / 2, cursor: 'nw-resize' },
      n: { x: screenBounds.centerX - handleSize / 2, y: screenBounds.top - handleSize / 2, cursor: 'n-resize' },
      ne: { x: screenBounds.right - handleSize / 2, y: screenBounds.top - handleSize / 2, cursor: 'ne-resize' },
      w: { x: screenBounds.left - handleSize / 2, y: screenBounds.centerY - handleSize / 2, cursor: 'w-resize' },
      e: { x: screenBounds.right - handleSize / 2, y: screenBounds.centerY - handleSize / 2, cursor: 'e-resize' },
      sw: { x: screenBounds.left - handleSize / 2, y: screenBounds.bottom - handleSize / 2, cursor: 'sw-resize' },
      s: { x: screenBounds.centerX - handleSize / 2, y: screenBounds.bottom - handleSize / 2, cursor: 's-resize' },
      se: { x: screenBounds.right - handleSize / 2, y: screenBounds.bottom - handleSize / 2, cursor: 'se-resize' },
      rotate: { 
        x: screenBounds.centerX - handleSize / 2, 
        y: screenBounds.top - rotateHandleOffset - handleSize / 2, 
        cursor: 'grab' 
      },
    };
  }, [zoom, pan]);

  // Handle mouse down for dragging/resizing/rotating
  const handleMouseDown = useCallback((e: React.MouseEvent, handle?: ResizeHandle) => {
    if (!boundingBox) return;

    e.preventDefault();
    e.stopPropagation();

    const startPos = { x: e.clientX, y: e.clientY };
    setDragStart(startPos);
    setInitialBounds(boundingBox);

    if (handle === 'rotate') {
      setIsRotating(true);
      setActiveHandle(handle);
    } else if (handle) {
      setIsResizing(true);
      setActiveHandle(handle);
    } else {
      setIsDragging(true);
    }
  }, [boundingBox]);

  // Handle mouse move during drag/resize/rotate
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!initialBounds || (!isDragging && !isResizing && !isRotating)) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const deltaX = currentPos.x - dragStart.x;
    const deltaY = currentPos.y - dragStart.y;

    if (isDragging) {
      // Group move
      const worldDelta = screenToWorld(deltaX, deltaY);
      const worldOrigin = screenToWorld(0, 0);
      onGroupMove(worldDelta.x - worldOrigin.x, worldDelta.y - worldOrigin.y);
    } else if (isResizing && activeHandle) {
      // Group resize
      const scaledDeltaX = deltaX / zoom;
      const scaledDeltaY = deltaY / zoom;
      
      let resizeDeltaX = 0;
      let resizeDeltaY = 0;
      let resizeDeltaWidth = 0;
      let resizeDeltaHeight = 0;

      switch (activeHandle) {
        case 'nw':
          resizeDeltaX = scaledDeltaX;
          resizeDeltaY = scaledDeltaY;
          resizeDeltaWidth = -scaledDeltaX;
          resizeDeltaHeight = -scaledDeltaY;
          break;
        case 'n':
          resizeDeltaY = scaledDeltaY;
          resizeDeltaHeight = -scaledDeltaY;
          break;
        case 'ne':
          resizeDeltaY = scaledDeltaY;
          resizeDeltaWidth = scaledDeltaX;
          resizeDeltaHeight = -scaledDeltaY;
          break;
        case 'w':
          resizeDeltaX = scaledDeltaX;
          resizeDeltaWidth = -scaledDeltaX;
          break;
        case 'e':
          resizeDeltaWidth = scaledDeltaX;
          break;
        case 'sw':
          resizeDeltaX = scaledDeltaX;
          resizeDeltaWidth = -scaledDeltaX;
          resizeDeltaHeight = scaledDeltaY;
          break;
        case 's':
          resizeDeltaHeight = scaledDeltaY;
          break;
        case 'se':
          resizeDeltaWidth = scaledDeltaX;
          resizeDeltaHeight = scaledDeltaY;
          break;
      }

      onGroupResize(resizeDeltaX, resizeDeltaY, resizeDeltaWidth, resizeDeltaHeight, activeHandle);
    } else if (isRotating) {
      // Group rotate
      const centerScreen = worldToScreen(initialBounds.centerX, initialBounds.centerY);
      const angle = Math.atan2(currentPos.y - centerScreen.y, currentPos.x - centerScreen.x);
      const degrees = (angle * 180) / Math.PI;
      
      onGroupRotate(degrees, initialBounds.centerX, initialBounds.centerY);
    }
  }, [
    isDragging, isResizing, isRotating, activeHandle, dragStart, initialBounds,
    screenToWorld, worldToScreen, onGroupMove, onGroupResize, onGroupRotate, zoom
  ]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setActiveHandle(null);
    setInitialBounds(null);
  }, []);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  // Don't render if no components selected or only one component
  if (!boundingBox || selectedComponents.length <= 1) return null;

  const screenBounds = {
    left: boundingBox.x * zoom + pan.x,
    top: boundingBox.y * zoom + pan.y,
    width: boundingBox.width * zoom,
    height: boundingBox.height * zoom,
  };

  const handlePositions = getHandlePositions(boundingBox);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {/* Bounding box outline */}
      <motion.div
        ref={boundingBoxRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute border-2 border-blue-500 pointer-events-auto"
        style={{
          left: screenBounds.left,
          top: screenBounds.top,
          width: screenBounds.width,
          height: screenBounds.height,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {/* Selection info */}
        <div className="absolute -top-8 left-0 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded shadow-lg whitespace-nowrap">
          {selectedComponents.length} components selected
        </div>

        {/* Center point indicator */}
        <div 
          className="absolute w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      </motion.div>

      {/* Resize handles */}
      {showHandles && (
        <>
          {(Object.entries(handlePositions) as [ResizeHandle, HandlePosition][]).map(([handle, position]) => (
            <motion.div
              key={handle}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute w-2 h-2 border-2 border-blue-500 pointer-events-auto ${
                handle === 'rotate' 
                  ? 'bg-green-500 rounded-full' 
                  : 'bg-white rounded-sm'
              }`}
              style={{
                left: position.x,
                top: position.y,
                cursor: isResizing || isRotating ? 'grabbing' : position.cursor,
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleMouseDown(e, handle)}
            >
              {/* Rotate handle indicator */}
              {handle === 'rotate' && (
                <div className="absolute -top-1 -left-1 w-4 h-4 border-2 border-green-500 rounded-full bg-green-500/20" />
              )}
            </motion.div>
          ))}

          {/* Rotation line from center to rotate handle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute border-l border-green-500 border-dashed pointer-events-none"
            style={{
              left: screenBounds.left + screenBounds.width / 2,
              top: screenBounds.top - 20,
              height: 20,
              transformOrigin: 'bottom center',
            }}
          />
        </>
      )}
    </div>
  );
};

export default UnifiedBoundingBox;
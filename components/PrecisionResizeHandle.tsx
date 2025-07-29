"use client";

import React, { useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';

export type ResizeDirection = 
  | 'n' | 's' | 'e' | 'w' 
  | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeDelta {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  snapToGrid: boolean;
  gridSize?: number;
}

export interface Dimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface PrecisionResizeHandleProps {
  direction: ResizeDirection;
  onResize: (delta: ResizeDelta, constraints: ResizeConstraints) => void;
  onResizeStart?: (direction: ResizeDirection) => void;
  onResizeEnd: (finalDimensions: Dimensions) => void;
  showDimensions?: boolean;
  maintainAspectRatio?: boolean;
  resizeFromCenter?: boolean;
  constraints?: ResizeConstraints;
  isVisible?: boolean;
  zoom?: number;
}

const HANDLE_SIZE = 8;
const HANDLE_HOVER_SIZE = 12;

// Cursor mappings for each resize direction
const CURSOR_MAP: Record<ResizeDirection, string> = {
  'n': 'ns-resize',
  's': 'ns-resize',
  'e': 'ew-resize',
  'w': 'ew-resize',
  'ne': 'nesw-resize',
  'sw': 'nesw-resize',
  'nw': 'nwse-resize',
  'se': 'nwse-resize',
};

// Position mappings for handle placement
const POSITION_MAP: Record<ResizeDirection, React.CSSProperties> = {
  'n': { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' },
  's': { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' },
  'e': { right: -HANDLE_SIZE / 2, top: '50%', transform: 'translateY(-50%)' },
  'w': { left: -HANDLE_SIZE / 2, top: '50%', transform: 'translateY(-50%)' },
  'ne': { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  'nw': { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  'se': { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  'sw': { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
};

const PrecisionResizeHandle: React.FC<PrecisionResizeHandleProps> = ({
  direction,
  onResize,
  onResizeStart,
  onResizeEnd,
  showDimensions = false,
  maintainAspectRatio = false,
  resizeFromCenter = false,
  constraints = {
    minWidth: 20,
    minHeight: 20,
    snapToGrid: false,
    gridSize: 1,
  },
  isVisible = true,
  zoom = 1,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const calculateResizeDelta = useCallback((info: PanInfo): ResizeDelta => {
    const deltaX = info.delta.x / zoom;
    const deltaY = info.delta.y / zoom;
    
    let dx = 0, dy = 0, dw = 0, dh = 0;

    // Calculate deltas based on resize direction
    switch (direction) {
      case 'n':
        dy = deltaY;
        dh = -deltaY;
        break;
      case 's':
        dh = deltaY;
        break;
      case 'e':
        dw = deltaX;
        break;
      case 'w':
        dx = deltaX;
        dw = -deltaX;
        break;
      case 'ne':
        dy = deltaY;
        dh = -deltaY;
        dw = deltaX;
        break;
      case 'nw':
        dx = deltaX;
        dy = deltaY;
        dw = -deltaX;
        dh = -deltaY;
        break;
      case 'se':
        dw = deltaX;
        dh = deltaY;
        break;
      case 'sw':
        dx = deltaX;
        dw = -deltaX;
        dh = deltaY;
        break;
    }

    // Apply center-point resizing if enabled
    if (resizeFromCenter) {
      dx = dx * 2;
      dy = dy * 2;
      dw = dw * 2;
      dh = dh * 2;
    }

    return { dx, dy, dw, dh };
  }, [direction, zoom, resizeFromCenter]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onResizeStart?.(direction);
  }, [direction, onResizeStart]);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const delta = calculateResizeDelta(info);
    
    // Apply aspect ratio constraints if enabled
    let finalConstraints = { ...constraints };
    if (maintainAspectRatio && constraints.aspectRatio) {
      finalConstraints.aspectRatio = constraints.aspectRatio;
    }

    onResize(delta, finalConstraints);
  }, [calculateResizeDelta, constraints, maintainAspectRatio, onResize]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Calculate final dimensions for callback
    const delta = calculateResizeDelta(info);
    const finalDimensions: Dimensions = {
      width: Math.max(constraints.minWidth, 100 + delta.dw), // Placeholder values
      height: Math.max(constraints.minHeight, 100 + delta.dh),
      x: 0 + delta.dx,
      y: 0 + delta.dy,
    };
    
    onResizeEnd(finalDimensions);
  }, [calculateResizeDelta, constraints, onResizeEnd]);

  if (!isVisible) {
    return null;
  }

  const handleSize = isDragging || isHovered ? HANDLE_HOVER_SIZE : HANDLE_SIZE;
  const handleStyle: React.CSSProperties = {
    ...POSITION_MAP[direction],
    width: handleSize,
    height: handleSize,
    cursor: CURSOR_MAP[direction],
    zIndex: 1000,
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        absolute rounded-full border-2 border-white shadow-md
        ${isDragging ? 'bg-blue-600' : isHovered ? 'bg-blue-500' : 'bg-blue-400'}
        transition-all duration-150 ease-in-out
      `}
      style={handleStyle}
      animate={{
        scale: isDragging ? 1.2 : isHovered ? 1.1 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      // Prevent event bubbling to parent components
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default React.memo(PrecisionResizeHandle);
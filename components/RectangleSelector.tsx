"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

interface RectangleSelectorProps {
  onSelectionComplete: (selectedComponents: string[]) => void;
  isActive: boolean;
  components: ComponentData[];
  zoom: number;
  pan: { x: number; y: number };
}

interface SelectionRectangle {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const RectangleSelector: React.FC<RectangleSelectorProps> = ({
  onSelectionComplete,
  isActive,
  components,
  zoom,
  pan
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRectangle | null>(null);
  const [highlightedComponents, setHighlightedComponents] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate normalized rectangle bounds
  const getNormalizedRect = useCallback((rect: SelectionRectangle) => {
    return {
      left: Math.min(rect.startX, rect.currentX),
      top: Math.min(rect.startY, rect.currentY),
      right: Math.max(rect.startX, rect.currentX),
      bottom: Math.max(rect.startY, rect.currentY),
    };
  }, []);

  // Check if a component intersects with the selection rectangle
  const isComponentIntersecting = useCallback((component: ComponentData, selectionBounds: BoundingBox) => {
    // Convert component coordinates to screen coordinates
    const componentBounds = {
      left: component.x * zoom + pan.x,
      top: component.y * zoom + pan.y,
      right: (component.x + component.width) * zoom + pan.x,
      bottom: (component.y + component.height) * zoom + pan.y,
    };

    // Check for intersection
    return !(
      componentBounds.right < selectionBounds.left ||
      componentBounds.left > selectionBounds.right ||
      componentBounds.bottom < selectionBounds.top ||
      componentBounds.top > selectionBounds.bottom
    );
  }, [zoom, pan]);

  // Update highlighted components during selection
  const updateHighlightedComponents = useCallback((rect: SelectionRectangle) => {
    const normalizedRect = getNormalizedRect(rect);
    const intersectingComponents = components
      .filter(component => component.visible && !component.locked)
      .filter(component => isComponentIntersecting(component, normalizedRect))
      .map(component => component.id);

    setHighlightedComponents(intersectingComponents);
  }, [components, getNormalizedRect, isComponentIntersecting]);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive || e.button !== 0) return;

    // Only start selection if clicking on empty canvas and not dragging a component
    const target = e.target as HTMLElement;
    if (!target.classList.contains('canvas-bg')) {
      return;
    }

    // Check if we're in the middle of a drag operation
    if (target.closest('[draggable="true"]') || target.closest('.dragging')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionRect({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
    setHighlightedComponents([]);
  }, [isActive]);

  // Listen to canvas events directly
  useEffect(() => {
    if (!isActive) return;

    const canvasElement = document.querySelector('.canvas-bg') as HTMLElement;
    if (!canvasElement) return;

    const handleCanvasMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      // Only start selection if clicking on empty canvas
      const target = e.target as HTMLElement;
      if (!target.classList.contains('canvas-bg')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      setIsSelecting(true);
      setSelectionRect({
        startX,
        startY,
        currentX: startX,
        currentY: startY,
      });
      setHighlightedComponents([]);
    };

    canvasElement.addEventListener('mousedown', handleCanvasMouseDown);
    
    return () => {
      canvasElement.removeEventListener('mousedown', handleCanvasMouseDown);
    };
  }, [isActive]);

  // Handle mouse move during selection
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !selectionRect) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const updatedRect = {
      ...selectionRect,
      currentX,
      currentY,
    };

    setSelectionRect(updatedRect);
    updateHighlightedComponents(updatedRect);
  }, [isSelecting, selectionRect, updateHighlightedComponents]);

  // Handle mouse up to complete selection
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    setIsSelecting(false);
    
    // Complete selection with highlighted components
    onSelectionComplete(highlightedComponents);
    
    // Reset state
    setSelectionRect(null);
    setHighlightedComponents([]);
  }, [isSelecting, highlightedComponents, onSelectionComplete]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  // Render selection rectangle
  const renderSelectionRectangle = () => {
    if (!selectionRect) return null;

    const normalizedRect = getNormalizedRect(selectionRect);
    const width = normalizedRect.right - normalizedRect.left;
    const height = normalizedRect.bottom - normalizedRect.top;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/10 rounded-sm"
        style={{
          left: normalizedRect.left,
          top: normalizedRect.top,
          width: Math.max(width, 1),
          height: Math.max(height, 1),
        }}
      >
        {/* Animated border effect */}
        <div className="absolute inset-0 border-2 border-blue-400 rounded-sm animate-pulse opacity-50" />
        
        {/* Selection info tooltip */}
        {highlightedComponents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-0 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded shadow-lg whitespace-nowrap"
          >
            {highlightedComponents.length} component{highlightedComponents.length !== 1 ? 's' : ''} selected
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Render component highlights
  const renderComponentHighlights = () => {
    return highlightedComponents.map(componentId => {
      const component = components.find(c => c.id === componentId);
      if (!component) return null;

      const left = component.x * zoom + pan.x;
      const top = component.y * zoom + pan.y;
      const width = component.width * zoom;
      const height = component.height * zoom;

      return (
        <motion.div
          key={componentId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="absolute pointer-events-none border-2 border-blue-400 bg-blue-400/20 rounded-sm"
          style={{
            left,
            top,
            width,
            height,
            zIndex: 1000,
          }}
        >
          {/* Highlight pulse effect */}
          <div className="absolute inset-0 border-2 border-blue-300 rounded-sm animate-pulse opacity-60" />
        </motion.div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 rectangle-selector"
      style={{ 
        cursor: isActive && !isSelecting ? 'crosshair' : 'default',
        pointerEvents: 'none', // Always none to allow drop events to pass through
        zIndex: isSelecting ? 1000 : 1,
      }}
    >
      <AnimatePresence>
        {isSelecting && renderSelectionRectangle()}
      </AnimatePresence>
      
      <AnimatePresence>
        {isSelecting && renderComponentHighlights()}
      </AnimatePresence>
    </div>
  );
};

export default RectangleSelector;
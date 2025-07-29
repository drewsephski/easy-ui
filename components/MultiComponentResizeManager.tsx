"use client";

import React, { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import PrecisionResizeHandle, { ResizeDelta, ResizeDirection, Dimensions } from './PrecisionResizeHandle';
import DimensionFeedback from './DimensionFeedback';
import { ComponentData } from '@/contexts/TemplateBuilderContext';
import { applyResizeConstraints, createDefaultConstraints } from '@/lib/resize-constraints';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface MultiComponentResizeManagerProps {
  selectedComponents: ComponentData[];
  onResize: (componentUpdates: Array<{ id: string; updates: Partial<ComponentData> }>) => void;
  onResizeEnd: (componentUpdates: Array<{ id: string; updates: Partial<ComponentData> }>) => void;
  zoom?: number;
  showDimensions?: boolean;
  enableProportionalResize?: boolean;
}

interface ComponentResizeData {
  id: string;
  originalDimensions: Dimensions;
  relativePosition: { x: number; y: number }; // Position relative to bounding box
  scaleFactor: { x: number; y: number }; // How much this component should scale
}

const MultiComponentResizeManager: React.FC<MultiComponentResizeManagerProps> = ({
  selectedComponents,
  onResize,
  onResizeEnd,
  zoom = 1,
  showDimensions = true,
  enableProportionalResize = true,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [originalBoundingBox, setOriginalBoundingBox] = useState<BoundingBox | null>(null);

  // Calculate unified bounding box for all selected components
  const boundingBox = useMemo((): BoundingBox | null => {
    if (selectedComponents.length === 0) return null;
    if (selectedComponents.length === 1) {
      const comp = selectedComponents[0];
      return {
        x: comp.x,
        y: comp.y,
        width: comp.width,
        height: comp.height,
        rotation: comp.rotation || 0,
      };
    }

    // Calculate bounding box for multiple components
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedComponents.forEach(comp => {
      const left = comp.x;
      const right = comp.x + comp.width;
      const top = comp.y;
      const bottom = comp.y + comp.height;

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0, // Multi-selection doesn't support rotation
    };
  }, [selectedComponents]);

  // Calculate resize data for each component
  const componentResizeData = useMemo((): ComponentResizeData[] => {
    if (!boundingBox) return [];

    return selectedComponents.map(comp => ({
      id: comp.id,
      originalDimensions: {
        x: comp.x,
        y: comp.y,
        width: comp.width,
        height: comp.height,
      },
      relativePosition: {
        x: (comp.x - boundingBox.x) / boundingBox.width,
        y: (comp.y - boundingBox.y) / boundingBox.height,
      },
      scaleFactor: {
        x: comp.width / boundingBox.width,
        y: comp.height / boundingBox.height,
      },
    }));
  }, [selectedComponents, boundingBox]);

  const handleResizeStart = useCallback((direction: ResizeDirection) => {
    setIsResizing(true);
    setResizeDirection(direction);
    setOriginalBoundingBox(boundingBox);
  }, [boundingBox]);

  const handleResize = useCallback((delta: ResizeDelta) => {
    if (!boundingBox || !originalBoundingBox || !enableProportionalResize) return;

    // Calculate new bounding box dimensions
    const newBoundingBox: BoundingBox = {
      x: originalBoundingBox.x + delta.dx,
      y: originalBoundingBox.y + delta.dy,
      width: Math.max(20, originalBoundingBox.width + delta.dw),
      height: Math.max(20, originalBoundingBox.height + delta.dh),
      rotation: originalBoundingBox.rotation,
    };

    // Calculate scale factors
    const scaleX = newBoundingBox.width / originalBoundingBox.width;
    const scaleY = newBoundingBox.height / originalBoundingBox.height;

    // Apply proportional scaling to all components
    const componentUpdates = componentResizeData.map(compData => {
      const originalComp = selectedComponents.find(c => c.id === compData.id);
      if (!originalComp) return null;

      // Calculate new position and size
      const newX = newBoundingBox.x + (compData.relativePosition.x * newBoundingBox.width);
      const newY = newBoundingBox.y + (compData.relativePosition.y * newBoundingBox.height);
      const newWidth = Math.max(20, compData.originalDimensions.width * scaleX);
      const newHeight = Math.max(20, compData.originalDimensions.height * scaleY);

      // Apply constraints for each component
      const constraints = createDefaultConstraints(originalComp.content);
      const constraintResult = applyResizeConstraints(
        compData.originalDimensions,
        {
          dx: newX - compData.originalDimensions.x,
          dy: newY - compData.originalDimensions.y,
          dw: newWidth - compData.originalDimensions.width,
          dh: newHeight - compData.originalDimensions.height,
        },
        constraints
      );

      return {
        id: compData.id,
        updates: {
          x: constraintResult.adjustedDimensions.x,
          y: constraintResult.adjustedDimensions.y,
          width: constraintResult.adjustedDimensions.width,
          height: constraintResult.adjustedDimensions.height,
        },
      };
    }).filter(Boolean) as Array<{ id: string; updates: Partial<ComponentData> }>;

    onResize(componentUpdates);
  }, [boundingBox, originalBoundingBox, componentResizeData, selectedComponents, enableProportionalResize, onResize]);

  const handleResizeEnd = useCallback((finalDimensions: Dimensions) => {
    setIsResizing(false);
    setResizeDirection(null);
    setOriginalBoundingBox(null);

    // Calculate final updates for all components
    if (!originalBoundingBox || !enableProportionalResize) return;

    const scaleX = finalDimensions.width / originalBoundingBox.width;
    const scaleY = finalDimensions.height / originalBoundingBox.height;

    const componentUpdates = componentResizeData.map(compData => {
      const newX = finalDimensions.x + (compData.relativePosition.x * finalDimensions.width);
      const newY = finalDimensions.y + (compData.relativePosition.y * finalDimensions.height);
      const newWidth = Math.max(20, compData.originalDimensions.width * scaleX);
      const newHeight = Math.max(20, compData.originalDimensions.height * scaleY);

      return {
        id: compData.id,
        updates: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      };
    });

    onResizeEnd(componentUpdates);
  }, [originalBoundingBox, componentResizeData, enableProportionalResize, onResizeEnd]);

  if (!boundingBox || selectedComponents.length === 0) {
    return null;
  }

  const resizeDirections: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: boundingBox.x,
        top: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
        transform: `rotate(${boundingBox.rotation}deg)`,
      }}
      animate={{
        left: boundingBox.x,
        top: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Bounding box outline */}
      <div
        className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
        style={{
          borderStyle: selectedComponents.length > 1 ? 'dashed' : 'solid',
        }}
      />

      {/* Multi-selection indicator */}
      {selectedComponents.length > 1 && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {selectedComponents.length} components
        </div>
      )}

      {/* Resize handles */}
      {resizeDirections.map(direction => (
        <PrecisionResizeHandle
          key={direction}
          direction={direction}
          onResize={handleResize}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
          zoom={zoom}
          isVisible={true}
          constraints={createDefaultConstraints()}
        />
      ))}

      {/* Dimension feedback */}
      {showDimensions && (
        <DimensionFeedback
          dimensions={{
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
          }}
          originalDimensions={originalBoundingBox || undefined}
          isResizing={isResizing}
          position="top"
          showDelta={true}
          zoom={zoom}
        />
      )}
    </motion.div>
  );
};

export default React.memo(MultiComponentResizeManager);
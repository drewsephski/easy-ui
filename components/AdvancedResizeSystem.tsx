"use client";

import React, { useCallback } from 'react';
import { ComponentData, useTemplateBuilder } from '@/contexts/TemplateBuilderContext';
import PrecisionResizeHandle, { ResizeDelta, ResizeDirection, Dimensions } from './PrecisionResizeHandle';
import DimensionFeedback from './DimensionFeedback';
import MultiComponentResizeManager from './MultiComponentResizeManager';
import { useResizeConstraints } from '@/hooks/use-resize-constraints';
import { createDefaultConstraints } from '@/lib/resize-constraints';

interface AdvancedResizeSystemProps {
  component: ComponentData;
  isSelected: boolean;
  zoom?: number;
  showDimensions?: boolean;
}

const AdvancedResizeSystem: React.FC<AdvancedResizeSystemProps> = ({
  component,
  isSelected,
  zoom = 1,
  showDimensions = true,
}) => {
  const { updateComponent, selectedComponentIds, components } = useTemplateBuilder();
  
  // Get all selected components for multi-selection handling
  const selectedComponents = components.filter(comp => 
    selectedComponentIds.includes(comp.id)
  );
  
  const isMultiSelection = selectedComponents.length > 1;

  // Set up resize constraints hook for single component
  const {
    currentDimensions,
    modifierKeys,
    isResizing,
    violations,
    constraints,
    startResize,
    applyResize,
    endResize,
  } = useResizeConstraints({
    initialDimensions: {
      x: component.x,
      y: component.y,
      width: component.width,
      height: component.height,
    },
    constraints: createDefaultConstraints(component.content),
    componentType: component.content,
    onResize: useCallback((dimensions: Dimensions, violations?: any) => {
      // Only update if this is a single selection
      if (!isMultiSelection) {
        updateComponent(component.id, {
          x: dimensions.x,
          y: dimensions.y,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    }, [component.id, updateComponent, isMultiSelection]),
    onResizeEnd: useCallback((dimensions: Dimensions) => {
      if (!isMultiSelection) {
        updateComponent(component.id, {
          x: dimensions.x,
          y: dimensions.y,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    }, [component.id, updateComponent, isMultiSelection]),
  });

  // Handle multi-component resize
  const handleMultiComponentResize = useCallback((
    componentUpdates: Array<{ id: string; updates: Partial<ComponentData> }>
  ) => {
    componentUpdates.forEach(({ id, updates }) => {
      updateComponent(id, updates);
    });
  }, [updateComponent]);

  const handleSingleResize = useCallback((delta: ResizeDelta) => {
    startResize();
    applyResize(delta);
  }, [startResize, applyResize]);

  const handleSingleResizeEnd = useCallback((finalDimensions: Dimensions) => {
    endResize();
  }, [endResize]);

  // Don't render if component is not selected
  if (!isSelected) {
    return null;
  }

  // Render multi-component resize manager if multiple components are selected
  if (isMultiSelection) {
    return (
      <MultiComponentResizeManager
        selectedComponents={selectedComponents}
        onResize={handleMultiComponentResize}
        onResizeEnd={handleMultiComponentResize}
        zoom={zoom}
        showDimensions={showDimensions}
        enableProportionalResize={true}
      />
    );
  }

  // Render single component resize handles
  const resizeDirections: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <>
      {/* Individual resize handles for single component */}
      {resizeDirections.map(direction => (
        <PrecisionResizeHandle
          key={direction}
          direction={direction}
          onResize={handleSingleResize}
          onResizeStart={startResize}
          onResizeEnd={handleSingleResizeEnd}
          zoom={zoom}
          isVisible={true}
          constraints={constraints}
          maintainAspectRatio={modifierKeys.shift}
          resizeFromCenter={modifierKeys.alt}
        />
      ))}

      {/* Dimension feedback for single component */}
      {showDimensions && (
        <DimensionFeedback
          dimensions={currentDimensions}
          originalDimensions={{
            x: component.x,
            y: component.y,
            width: component.width,
            height: component.height,
          }}
          isResizing={isResizing}
          violations={violations}
          position="top"
          showDelta={true}
          showGrid={constraints.snapToGrid}
          gridSize={constraints.gridSize}
          zoom={zoom}
        />
      )}
    </>
  );
};

export default React.memo(AdvancedResizeSystem);
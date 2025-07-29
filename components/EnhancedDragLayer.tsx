'use client';

import React, { useMemo } from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPONENT_MAP } from '@/app/template-builder/component-mapping';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

interface DragPreviewData {
  componentType: string;
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
  isMultiSelect: boolean;
  componentCount: number;
  selectedComponents?: ComponentData[];
}

interface EnhancedDragLayerProps {
  zoom?: number;
  showPreview?: boolean;
  showMeasurements?: boolean;
}

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 1000,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  zoom: number = 1
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  
  return {
    transform,
    WebkitTransform: transform,
    transformOrigin: 'top left',
  };
}

function ComponentPreview({ 
  componentType, 
  dimensions, 
  zoom,
  opacity = 0.8 
}: { 
  componentType: string; 
  dimensions: { width: number; height: number };
  zoom: number;
  opacity?: number;
}) {
  const componentDef = COMPONENT_MAP[componentType];
  
  if (!componentDef) {
    return (
      <div 
        className="border-2 border-dashed border-blue-400 bg-blue-50/50 rounded-lg flex items-center justify-center"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          opacity 
        }}
      >
        <span className="text-blue-600 font-medium text-sm">
          {componentType}
        </span>
      </div>
    );
  }

  const Component = componentDef.component;
  
  return (
    <div
      className="relative border-2 border-blue-400 rounded-lg overflow-hidden shadow-lg"
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        opacity 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm" />
      <div className="relative p-2 h-full overflow-hidden">
        <div className="scale-75 origin-top-left h-full">
          <Component {...componentDef.defaultProps} />
        </div>
      </div>
      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
        {componentDef.displayName}
      </div>
    </div>
  );
}

function MultiComponentPreview({ 
  components, 
  zoom 
}: { 
  components: ComponentData[]; 
  zoom: number 
}) {
  const boundingBox = useMemo(() => {
    if (components.length === 0) return { x: 0, y: 0, width: 100, height: 100 };
    
    const minX = Math.min(...components.map(c => c.x));
    const minY = Math.min(...components.map(c => c.y));
    const maxX = Math.max(...components.map(c => c.x + c.width));
    const maxY = Math.max(...components.map(c => c.y + c.height));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, [components]);

  return (
    <div
      className="relative border-2 border-purple-400 rounded-lg bg-purple-50/50 shadow-lg"
      style={{ 
        width: boundingBox.width, 
        height: boundingBox.height,
        opacity: 0.8 
      }}
    >
      {components.map((component, index) => (
        <div
          key={component.id}
          className="absolute border border-purple-300 rounded bg-white/60"
          style={{
            left: component.x - boundingBox.x,
            top: component.y - boundingBox.y,
            width: component.width,
            height: component.height,
            zIndex: component.zIndex
          }}
        >
          <div className="p-1 text-xs text-purple-700 font-medium truncate">
            {COMPONENT_MAP[component.content]?.displayName || component.content}
          </div>
        </div>
      ))}
      <div className="absolute -top-6 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded">
        {components.length} components
      </div>
    </div>
  );
}

function DimensionTooltip({ 
  dimensions, 
  showMeasurements 
}: { 
  dimensions: { width: number; height: number };
  showMeasurements: boolean;
}) {
  if (!showMeasurements) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
    >
      {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
    </motion.div>
  );
}

export const EnhancedDragLayer: React.FC<EnhancedDragLayerProps> = ({
  zoom = 1,
  showPreview = true,
  showMeasurements = true
}) => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const renderDragPreview = () => {
    if (!showPreview || !item) return null;

    switch (itemType) {
      case 'COMPONENT':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <ComponentPreview
              componentType={item.id || item.type}
              dimensions={item.dimensions || { width: 200, height: 100 }}
              zoom={zoom}
            />
            <DimensionTooltip
              dimensions={item.dimensions || { width: 200, height: 100 }}
              showMeasurements={showMeasurements}
            />
          </motion.div>
        );
      
      case 'MULTI_COMPONENT':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <MultiComponentPreview
              components={item.selectedComponents || []}
              zoom={zoom}
            />
          </motion.div>
        );
      
      case 'EXISTING_COMPONENT':
        const componentDef = COMPONENT_MAP[item.content];
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 0.9, opacity: 0.5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="border-2 border-green-400 rounded-lg bg-green-50/50 shadow-lg relative"
              style={{ 
                width: item.width, 
                height: item.height,
                transform: `rotate(${item.rotation || 0}deg)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm rounded-lg" />
              <div className="relative p-2 h-full overflow-hidden">
                <div className="text-green-700 font-medium text-sm truncate">
                  {componentDef?.displayName || item.content}
                </div>
              </div>
              <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                Moving
              </div>
            </div>
            <DimensionTooltip
              dimensions={{ width: item.width, height: item.height }}
              showMeasurements={showMeasurements}
            />
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(initialOffset, currentOffset, zoom)}
        className="inline-block"
      >
        <AnimatePresence mode="wait">
          {renderDragPreview()}
        </AnimatePresence>
      </div>
    </div>
  );
};
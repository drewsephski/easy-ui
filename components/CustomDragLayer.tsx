"use client";

import React from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPONENT_MAP } from '@/app/template-builder/component-mapping';

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

  let { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  return {
    transform,
    WebkitTransform: transform,
    transformOrigin: 'top left',
  };
}

interface CustomDragLayerProps {
  zoom?: number;
}

export const CustomDragLayer: React.FC<CustomDragLayerProps> = ({ zoom = 1 }) => {
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

  function renderItem() {
    switch (itemType) {
      case 'component':
        const componentDef = COMPONENT_MAP[item.id as keyof typeof COMPONENT_MAP];
        if (!componentDef) {
          return (
            <motion.div 
              className="p-3 bg-red-100 border-2 border-red-400 rounded-lg shadow-lg"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <p className="text-sm font-semibold text-red-600">Component not found</p>
              <p className="text-xs text-red-500">{item.id}</p>
            </motion.div>
          );
        }

        const Comp = componentDef.component;
        const defaultSize = componentDef.defaultSize || { width: 200, height: 100 };

        return (
          <motion.div 
            className="relative bg-white/95 backdrop-blur-sm border-2 border-blue-400 rounded-lg shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0.8, rotate: -2 }}
            animate={{ scale: 1, opacity: 0.95, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.2
            }}
            style={{
              width: defaultSize.width * 0.8,
              height: defaultSize.height * 0.8,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.3)',
            }}
          >
            {/* Ghost overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-sm" />
            
            {/* Component preview */}
            <div className="relative p-2 h-full overflow-hidden">
              <div className="transform scale-75 origin-top-left pointer-events-none">
                <Comp {...componentDef.defaultProps} />
              </div>
            </div>

            {/* Pulsing indicator */}
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />

            {/* Component label */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full whitespace-nowrap">
              {componentDef.displayName}
            </div>

            {/* Dimension tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg">
              {defaultSize.width} × {defaultSize.height}
            </div>
          </motion.div>
        );

      case 'canvas_object':
        const canvasComponentDef = COMPONENT_MAP[item.content as keyof typeof COMPONENT_MAP];
        if (!canvasComponentDef) return null;

        const CanvasComp = canvasComponentDef.component;

        return (
          <motion.div 
            className="relative bg-white/90 backdrop-blur-sm border-2 border-green-400 rounded-lg shadow-2xl overflow-hidden"
            initial={{ scale: 1.05, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              duration: 0.15
            }}
            style={{
              width: item.width || 200,
              height: item.height || 100,
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.3)',
            }}
          >
            {/* Ghost overlay for existing components */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-sm" />
            
            {/* Component preview */}
            <div className="relative p-2 h-full overflow-hidden">
              <div className="transform scale-90 origin-top-left pointer-events-none">
                <CanvasComp {...item.props} />
              </div>
            </div>

            {/* Moving indicator */}
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />

            {/* Moving label */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Moving
            </div>

            {/* Position tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg">
              {Math.round(item.x || 0)}, {Math.round(item.y || 0)}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div 
            className="p-3 bg-gray-100 border-2 border-gray-400 rounded-lg shadow-lg"
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <p className="text-sm font-semibold text-gray-700">{item?.id || 'Unknown'}</p>
            <p className="text-xs text-gray-500">Dragging...</p>
          </motion.div>
        );
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <AnimatePresence>
        {isDragging && (
          <motion.div
            style={getItemStyles(initialOffset, currentOffset, zoom)}
            className="inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.15
            }}
          >
            {renderItem()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

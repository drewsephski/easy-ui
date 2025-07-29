"use client";

import React, { useRef, useState, useCallback } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { useDrag } from 'react-dnd';
import { ComponentData, useTemplateBuilder } from '@/contexts/TemplateBuilderContext';
import { COMPONENT_MAP } from '@/app/template-builder/component-mapping';
import { RotateCcw, Move, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const ItemTypes = {
  CANVAS_OBJECT: 'canvas_object',
};

interface ResizableDraggableComponentProps {
  component: ComponentData;
  zoom: number;
  onContextMenu: (event: React.MouseEvent) => void;
}

const GRID_SIZE = 15;

// Enhanced resize handle component with smooth animations
const EnhancedResizeHandle: React.FC<{
  direction: string;
  onResize: (info: PanInfo, direction: string) => void;
  zoom: number;
  isVisible: boolean;
}> = ({ direction, onResize, zoom, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getCursor = (dir: string) => {
    const cursors: Record<string, string> = {
      'top-left': 'nw-resize',
      'top-right': 'ne-resize',
      'bottom-left': 'sw-resize',
      'bottom-right': 'se-resize',
      'top': 'n-resize',
      'bottom': 's-resize',
      'left': 'w-resize',
      'right': 'e-resize',
    };
    return cursors[dir] || 'grab';
  };

  const getPosition = (dir: string) => {
    const positions: Record<string, React.CSSProperties> = {
      'top-left': { top: -4, left: -4 },
      'top-right': { top: -4, right: -4 },
      'bottom-left': { bottom: -4, left: -4 },
      'bottom-right': { bottom: -4, right: -4 },
      'top': { top: -4, left: '50%', transform: 'translateX(-50%)' },
      'bottom': { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
      'left': { left: -4, top: '50%', transform: 'translateY(-50%)' },
      'right': { right: -4, top: '50%', transform: 'translateY(-50%)' },
    };
    return positions[dir] || {};
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute bg-blue-500 border-2 border-white rounded-sm shadow-lg"
      style={{
        width: 8,
        height: 8,
        cursor: getCursor(direction),
        zIndex: 1000,
        ...getPosition(direction),
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isHovered || isDragging ? 1.3 : 1,
        backgroundColor: isDragging ? '#3b82f6' : isHovered ? '#60a5fa' : '#3b82f6'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        duration: 0.15
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onPanStart={() => setIsDragging(true)}
      onPanEnd={() => setIsDragging(false)}
      onPan={(event, info) => onResize(info, direction)}
      drag
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
};

const ResizableDraggableComponent: React.FC<ResizableDraggableComponentProps> = ({ component, zoom, onContextMenu }) => {
  const { updateComponent, selectComponent, selectedComponentIds, moveComponent, components, moveSelectedComponents, resizeSelectedComponents, rotateComponent } = useTemplateBuilder();
  const isSelected = selectedComponentIds.includes(component.id);
  const initialPositions = React.useRef<Map<string, { x: number, y: number }>>(new Map());
  const componentRef = useRef<HTMLDivElement>(null);

  const handleResize = (info: PanInfo, direction: string) => {
    if (selectedComponentIds.length > 1 && isSelected) {
      const dx_delta = info.delta.x / zoom;
      const dy_delta = info.delta.y / zoom;

      let dx = 0, dy = 0, dw = 0, dh = 0;

      if (direction.includes('right')) {
        dw = dx_delta;
      } else if (direction.includes('left')) {
        dw = -dx_delta;
        dx = dx_delta;
      }

      if (direction.includes('bottom')) {
        dh = dy_delta;
      } else if (direction.includes('top')) {
        dh = -dy_delta;
        dy = dy_delta;
      }
      resizeSelectedComponents({ dx, dy, dw, dh });
    } else {
      const { width, height, x, y } = component;
      const dx = info.offset.x / zoom;
      const dy = info.offset.y / zoom;

      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;

      if (direction.includes('right')) {
        newWidth = width + dx;
      } else if (direction.includes('left')) {
        newWidth = width - dx;
        newX = x + dx;
      }

      if (direction.includes('bottom')) {
        newHeight = height + dy;
      } else if (direction.includes('top')) {
        newHeight = height - dy;
        newY = y + dy;
      }

      // Snap to grid
      newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
      newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;


      updateComponent(component.id, {
        width: Math.max(newWidth, GRID_SIZE),
        height: Math.max(newHeight, GRID_SIZE),
        x: newX,
        y: newY,
      });
    }
  };

  const handleRotate = (event: PointerEvent, info: PanInfo) => {
    if (componentRef.current) {
      const componentRect = componentRef.current.getBoundingClientRect();
      const centerX = componentRect.left + componentRect.width / 2;
      const centerY = componentRect.top + componentRect.height / 2;
      const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX) * (180 / Math.PI) + 90;
      rotateComponent(component.id, angle);
    }
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CANVAS_OBJECT,
    item: { 
      id: component.id, 
      x: component.x, 
      y: component.y, 
      width: component.width,
      height: component.height,
      content: component.content,
      props: component.props,
      type: ItemTypes.CANVAS_OBJECT 
    },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      if (isSelected && selectedComponentIds.length > 1) {
        moveSelectedComponents({ x: delta.x / zoom, y: delta.y / zoom });
      } else {
        const newX = Math.round((item.x + delta.x / zoom) / GRID_SIZE) * GRID_SIZE;
        const newY = Math.round((item.y + delta.y / zoom) / GRID_SIZE) * GRID_SIZE;
        moveComponent(item.id, { x: newX, y: newY });
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [component, isSelected, selectedComponentIds.length, zoom]);

  const Comp = COMPONENT_MAP[component.content as keyof typeof COMPONENT_MAP]?.component;

  if (!Comp) {
    return (
      <div style={{ left: component.x, top: component.y, width: component.width, height: component.height }} className="absolute p-2 text-white bg-red-500">
        Error: Component "{component.content}" not found.
      </div>
    );
  }

  return (
    <motion.div
      ref={drag as any}
      id={`component-${component.id}`}
      style={{
        position: 'absolute',
        x: component.x,
        y: component.y,
        width: component.width,
        height: component.height,
        transform: `rotate(${component.rotation || 0}deg)`,
        zIndex: component.zIndex,
      }}
      animate={{ 
        x: component.x, 
        y: component.y,
        width: component.width,
        height: component.height,
        opacity: isDragging ? 0.7 : 1,
        scale: isDragging ? 1.02 : 1,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      whileHover={{ 
        scale: isSelected ? 1 : 1.01,
        transition: { duration: 0.15 }
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id, e.shiftKey);
      }}
      onContextMenu={onContextMenu}
      className={cn(
        "group cursor-move",
        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "hover:ring-1 hover:ring-blue-300 hover:ring-offset-1",
        "transition-all duration-200"
      )}
    >
      <div ref={componentRef} style={{ pointerEvents: 'none' }}>
        {React.cloneElement(<Comp {...component.props} />, {
          style: {
            ...(component.props.style || {}),
            width: component.width,
            height: component.height,
          },
        })}
      </div>

      <AnimatePresence>
        {isSelected && (
          <>
            {/* Rotation Handle */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                position: 'absolute',
                top: -35,
                left: '50%',
                transform: 'translateX(-50%)',
                cursor: 'grab',
                color: '#3b82f6',
                zIndex: 1001,
                padding: '4px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.5)'
              }}
              whileTap={{ scale: 0.95 }}
              onPan={handleRotate}
              onPanStart={(e) => e.stopPropagation()}
              drag
              dragMomentum={false}
            >
              <RotateCw size={16} />
            </motion.div>

            {/* Corner Resize Handles */}
            <EnhancedResizeHandle 
              direction="top-left" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />
            <EnhancedResizeHandle 
              direction="top-right" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />
            <EnhancedResizeHandle 
              direction="bottom-left" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />
            <EnhancedResizeHandle 
              direction="bottom-right" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />

            {/* Edge Resize Handles */}
            <EnhancedResizeHandle 
              direction="top" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />
            <EnhancedResizeHandle 
              direction="bottom" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />
            <EnhancedResizeHandle 
              direction="left" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />
            <EnhancedResizeHandle 
              direction="right" 
              onResize={handleResize} 
              zoom={zoom} 
              isVisible={true} 
            />

            {/* Move Handle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                cursor: 'move',
                color: '#3b82f6',
                zIndex: 999,
                padding: '4px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                pointerEvents: 'none',
              }}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.5)'
              }}
            >
              <Move size={12} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(ResizableDraggableComponent);

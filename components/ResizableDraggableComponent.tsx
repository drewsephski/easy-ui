"use client";

import React, { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useDrag } from 'react-dnd';
import { ComponentData, useTemplateBuilder } from '@/contexts/TemplateBuilderContext';
import { COMPONENT_MAP } from '@/app/template-builder/component-mapping';
import ResizeHandle from './ResizeHandle';
import { RotateCcw } from 'lucide-react';

const ItemTypes = {
  CANVAS_OBJECT: 'canvas_object',
};

interface ResizableDraggableComponentProps {
  component: ComponentData;
  zoom: number;
  onContextMenu: (event: React.MouseEvent) => void;
}

const GRID_SIZE = 20;

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
    item: { id: component.id, x: component.x, y: component.y, type: ItemTypes.CANVAS_OBJECT },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      if (isSelected) {
        moveSelectedComponents({ x: delta.x, y: delta.y });
      } else {
        const newX = Math.round((item.x + delta.x) / GRID_SIZE) * GRID_SIZE;
        const newY = Math.round((item.y + delta.y) / GRID_SIZE) * GRID_SIZE;
        moveComponent(item.id, { x: newX, y: newY });
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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
      style={{
        position: 'absolute',
        x: component.x,
        y: component.y,
        outline: isSelected ? '2px solid #3b82f6' : '1px dashed #4b5563',
        opacity: isDragging ? 0.5 : 1,
        transform: `rotate(${component.rotation || 0}deg)`,
      }}
      animate={{ x: component.x, y: component.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id, e.shiftKey);
      }}
      onContextMenu={onContextMenu}
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

      {isSelected && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              top: -30,
              left: '50%',
              translateX: '-50%',
              cursor: 'grab',
              color: '#3b82f6',
            }}
            onPan={handleRotate}
            onPanStart={(e) => e.stopPropagation()}
          >
            <RotateCcw size={20} />
          </motion.div>
          <ResizeHandle direction="top-left" onResize={handleResize} onResizeEnd={() => {}} />
          <ResizeHandle direction="top-right" onResize={handleResize} onResizeEnd={() => {}} />
          <ResizeHandle direction="bottom-left" onResize={handleResize} onResizeEnd={() => {}} />
          <ResizeHandle direction="bottom-right" onResize={handleResize} onResizeEnd={() => {}} />
        </>
      )}
    </motion.div>
  );
};

export default React.memo(ResizableDraggableComponent);

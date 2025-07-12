'use client';

import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { ComponentType, DropZoneType } from '@/types/template-builder';

interface DragItem {
  component: ComponentType;
  index: number;
  type: string;
}
import { motion, AnimatePresence } from 'framer-motion';

interface DraggableComponentProps {
  component: ComponentType;
  children: ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (didDrop: boolean) => void;
  collapsed?: boolean;
  className?: string;
  index?: number;
  onMove?: (dragIndex: number, hoverIndex: number, zone: DropZoneType) => void;
  acceptTypes?: string[];
  isOverlay?: boolean;
  isDragging?: boolean;
  onHover?: (isHovered: boolean) => void;
}

export const DraggableComponent = ({
  component,
  children,
  onDragStart,
  onDragEnd,
  collapsed = false,
  className = '',
  index,
  onMove,
  acceptTypes = ['component'],
  isOverlay = false,
  isDragging: externalIsDragging,
  onHover,
}: DraggableComponentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  // Handle hover state for better visual feedback
  useEffect(() => {
    if (onHover) {
      onHover(isHovered);
    }
  }, [isHovered, onHover]);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: acceptTypes,
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    hover: (item: DragItem, monitor) => {
      if (!ref.current || index === undefined) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Determine drop position for visual feedback
      if (hoverClientY < hoverMiddleY) {
        setDropPosition('top');
      } else {
        setDropPosition('bottom');
      }

      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Time to perform the action
      if (onMove && hoverIndex !== undefined) {
        onMove(dragIndex, hoverIndex, component.zone || 'main');
      }

      // Mutate the monitor item for performance
      item.index = hoverIndex;
    },
    drop: (item: DragItem, monitor) => {
      setDropPosition(null);
      return { id: component.id };
    },
  });

  const [{ isDragging: isDraggingInternal }, drag, preview] = useDrag(() => ({
    type: 'component',
    item: () => {
      if (onDragStart) onDragStart();
      if (index === undefined) {
        console.warn("DraggableComponent: index is undefined for draggable item");
        return { component, index: -1, type: 'component' };
      }
      return { component, index, type: 'component' };
    },
    collect: (monitor: DragSourceMonitor<DragItem, unknown>) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: DragItem, monitor: DragSourceMonitor<DragItem, unknown>) => {
      setDropPosition(null);
      if (onDragEnd) {
        onDragEnd(monitor.didDrop());
      }
    },
  }), [index, component, onDragStart, onDragEnd]);

  // Custom drag preview
  useEffect(() => {
    if (ref.current) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview]);

  const isDragging = externalIsDragging ?? isDraggingInternal;
  const isActive = isOver && canDrop;

  // Set up drag and drop refs
  useEffect(() => {
    if (ref.current) {
      drag(drop(ref.current));
    }
  }, [drag, drop]);

  return (
    <div className="relative">
      {/* Drop indicator for top position */}
      <AnimatePresence>
        {isActive && dropPosition === 'top' && (
          <motion.div
            className="absolute left-0 right-0 -top-1 h-0.5 bg-blue-500 z-10"
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The draggable element */}
      <motion.div
        ref={ref}
        className={`relative p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-transparent transition-all ${
          isDragging ? 'shadow-lg opacity-75 scale-95' : 'opacity-100'
        } ${
          isActive ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
        } ${
          isHovered && !isDragging ? 'bg-gray-100 dark:bg-gray-700' : ''
        } ${collapsed ? 'w-10 h-10 flex items-center justify-center' : ''} ${className}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 1000 : 'auto',
          position: 'relative',
        }}
        whileHover={!isDragging ? {
          scale: 1.02,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        } : {}}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {children}
        {isDragging && !isOverlay && (
          <div className="absolute inset-0 bg-blue-50 rounded-lg border-2 border-blue-400 border-dashed pointer-events-none dark:bg-blue-900/20" />
        )}
      </motion.div>

      {/* Custom Drag Preview */}
      {isDragging && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]">
          <div className="absolute p-3 bg-gray-100 rounded-lg border border-gray-300 shadow-xl opacity-90 dark:bg-gray-700 dark:border-gray-600"
            style={{
              transform: `translate(${ref.current?.getBoundingClientRect().left || 0}px, ${ref.current?.getBoundingClientRect().top || 0}px)`,
              width: ref.current?.offsetWidth,
              height: ref.current?.offsetHeight,
            }}
          >
            {children}
          </div>
        </div>
      )}

      {/* Drop indicator for bottom position */}
      <AnimatePresence>
        {isActive && dropPosition === 'bottom' && (
          <motion.div
            className="absolute left-0 right-0 -bottom-1 h-0.5 bg-blue-500 z-10"
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

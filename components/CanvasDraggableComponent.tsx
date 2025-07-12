'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd';
import { Trash2, Copy, GripVertical, X } from 'lucide-react';
import { ComponentType } from '@/types/template-builder';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CanvasDragItem {
  id: string;
  index: number;
  type: string;
}

interface CanvasDraggableComponentProps {
  id: string;
  index: number;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  isPreview: boolean;
  setSelectedComponent: (component: ComponentType | null) => void;
  selectedComponent: ComponentType | null;
  handleDelete: (id: string) => void;
  handleDuplicate: (id: string) => void;
  children: React.ReactNode;
  component: ComponentType & {
    className?: string;
    style?: React.CSSProperties;
    props?: React.ComponentProps<any>;
  };
}

const ItemTypes = {
  CANVAS_COMPONENT: 'canvas-component',
};

const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Component error:', error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export function CanvasDraggableComponent({
  id,
  index,
  moveComponent,
  isPreview,
  setSelectedComponent,
  selectedComponent,
  handleDelete,
  handleDuplicate,
  children,
  component,
}: CanvasDraggableComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const isSelected = selectedComponent?.id === id;

  const [{ handlerId }, drop] = useDrop<
    CanvasDragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ItemTypes.CANVAS_COMPONENT,
    collect(monitor: DropTargetMonitor<CanvasDragItem, void>) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: CanvasDragItem, monitor: DropTargetMonitor<CanvasDragItem, void>) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveComponent(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations in render functions or collect functions.
      // But for the sake of performance in a drag and drop library it's acceptable.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging: isDraggingPreview }, drag, preview] = useDrag({
    type: ItemTypes.CANVAS_COMPONENT,
    item: () => {
      setIsDragging(true);
      return {
        id,
        index,
        type: ItemTypes.CANVAS_COMPONENT,
        component: { ...component }
      } as CanvasDragItem;
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: CanvasDragItem | undefined, monitor: DragSourceMonitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        console.log('Drag ended without a valid drop');
      }
      setIsDragging(false);
      setShowActions(false);
    },
  });

  // Set up drag and drop refs
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // Apply drop ref first, then drag ref
        const dropRef = drop(node);
        drag(dropRef);
      }
    },
    [drag, drop]
  );

  // Create a separate ref for the drag preview
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.01,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    drag: {
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 10,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    }
  };

  // Custom drag preview
  if (isDraggingPreview) {
    return (
      <div
        ref={dragPreviewRef}
        className="relative bg-white rounded-lg border-2 border-blue-500 shadow-xl opacity-70 pointer-events-none dark:bg-gray-800"
        style={{
          transform: 'rotate(2deg)',
          zIndex: 1000,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={combinedRef}
      data-handler-id={handlerId}
      className={cn(
        'relative group transition-all duration-200',
        isSelected ? 'ring-2 ring-blue-500' : '',
        isDragging ? 'opacity-50' : 'opacity-100',
        isPreview ? 'cursor-default' : 'cursor-move',
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
        'hover:shadow-md transition-shadow duration-200',
        (component as any).className // Type assertion to handle dynamic className
      )}
      onMouseEnter={() => !isPreview && setIsHovered(true)}
      onMouseLeave={() => !isPreview && setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponent(component);
      }}
      style={{
        zIndex: isDragging ? 1000 : 'auto',
        ...(component.style || {}) as React.CSSProperties,
      }}
      data-component-id={id}
      layout
    >
      {/* Drag handle */}
      {!isPreview && (
        <motion.div
          className={cn(
            'absolute top-0 left-0 h-full w-6 flex items-center justify-center',
            'bg-gradient-to-r from-transparent to-gray-50/50 dark:to-gray-800/50',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'cursor-grab active:cursor-grabbing',
            isSelected && 'opacity-100'
          )}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => !isHovered && setShowActions(false)}
        >
          <GripVertical
            className="w-3.5 h-3.5 text-gray-400"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}

      {/* Component content with error boundary */}
      <div className={cn(
        'transition-all duration-200 p-4',
        !isPreview && 'pl-6' // Add padding to account for drag handle
      )}>
        <ErrorBoundary fallback={<div className="p-4 text-sm text-red-500">Error rendering component</div>}>
          {React.Children.map(children, child => {
            // Ensure each child has a key
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...child.props,
                key: `${id}-${index}`,
                // Pass any additional props that the component might need
                ...(component.props || {})
              });
            }
            return child;
          })}
        </ErrorBoundary>
      </div>

      {/* Action buttons */}
      <AnimatePresence>
        {!isPreview && (isHovered || isSelected || showActions) && (
          <motion.div
            className="flex absolute top-1 right-1 z-10 items-center p-1 space-x-1 bg-white rounded-md border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(id);
              }}
              className="p-1.5 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Duplicate component"
              title="Duplicate"
            >
              <Copy size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(id);
              }}
              className="p-1.5 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Delete component"
              title="Delete"
            >
              <Trash2 size={16} />
            </motion.button>
            {isSelected && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponent(null);
                }}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Deselect component"
                title="Deselect"
              >
                <X size={16} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-1.5" />
      )}
    </motion.div>
  );
}

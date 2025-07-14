'use client';

import { useDragLayer, XYCoord } from 'react-dnd';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DraggableComponentPreviewProps {
  isDragging: boolean;
  children: ReactNode;
}

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 9999,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(currentOffset: XYCoord | null) {
  if (!currentOffset) {
    return { display: 'none' };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px) rotate(2deg)`;

  return {
    transform,
    WebkitTransform: transform,
  };
}

export const DraggableComponentPreview = ({ isDragging, children }: DraggableComponentPreviewProps) => {
  const { currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <motion.div
        style={getItemStyles(currentOffset)}
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

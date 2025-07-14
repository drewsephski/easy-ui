"use client";

import React from 'react';
import { motion, PanInfo } from 'framer-motion';

type ResizeDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResize: (info: PanInfo, direction: ResizeDirection) => void;
  onResizeEnd: () => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onResize, onResizeEnd }) => {
  if (!direction) {
    // In a real-world scenario, we might want to log this error or handle it more gracefully.
    // For now, we'll just prevent the crash.
    return null;
  }

  const handleDrag = (_: any, info: PanInfo) => {
    onResize(info, direction);
  };

  return (
    <motion.div
      drag
      onDrag={handleDrag}
      onDragEnd={onResizeEnd}
      dragMomentum={false}
      className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white border-solid"
      style={{
        top: direction.includes('top') ? -8 : 'auto',
        bottom: direction.includes('bottom') ? -8 : 'auto',
        left: direction.includes('left') ? -8 : 'auto',
        right: direction.includes('right') ? -8 : 'auto',
        cursor: 'nwse-resize', // This should be more dynamic based on direction
      }}
    />
  );
};

export default React.memo(ResizeHandle);

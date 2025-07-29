"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Grid, Ruler } from 'lucide-react';
import { Dimensions } from '@/components/PrecisionResizeHandle';
import { ConstraintViolation } from '@/lib/resize-constraints';

export interface DimensionFeedbackProps {
  dimensions: Dimensions;
  originalDimensions?: Dimensions;
  isResizing: boolean;
  violations?: ConstraintViolation[];
  showTooltip?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showDelta?: boolean;
  showGrid?: boolean;
  gridSize?: number;
  zoom?: number;
  className?: string;
}

interface DimensionDelta {
  width: number;
  height: number;
  x: number;
  y: number;
}

const DimensionFeedback: React.FC<DimensionFeedbackProps> = ({
  dimensions,
  originalDimensions,
  isResizing,
  violations = [],
  showTooltip = true,
  position = 'top',
  showDelta = true,
  showGrid = false,
  gridSize = 1,
  zoom = 1,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [delta, setDelta] = useState<DimensionDelta>({ width: 0, height: 0, x: 0, y: 0 });

  // Calculate delta changes
  useEffect(() => {
    if (originalDimensions && showDelta) {
      setDelta({
        width: dimensions.width - originalDimensions.width,
        height: dimensions.height - originalDimensions.height,
        x: dimensions.x - originalDimensions.x,
        y: dimensions.y - originalDimensions.y,
      });
    }
  }, [dimensions, originalDimensions, showDelta]);

  // Show/hide feedback based on resize state
  useEffect(() => {
    if (isResizing) {
      setIsVisible(true);
    } else {
      // Hide after a delay when not resizing
      const timer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isResizing]);

  const formatDimension = (value: number): string => {
    return Math.round(value * 100) / 100 + 'px';
  };

  const formatDelta = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return sign + formatDimension(value);
  };

  const getPositionStyles = (): React.CSSProperties => {
    const offset = 10;
    
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: offset,
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: offset,
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: offset,
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: offset,
        };
      case 'center':
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      default:
        return {};
    }
  };

  const hasViolations = violations.length > 0;

  return (
    <AnimatePresence>
      {(isVisible || isResizing) && showTooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={`
            absolute z-50 pointer-events-none
            ${className}
          `}
          style={getPositionStyles()}
        >
          <div
            className={`
              px-3 py-2 rounded-lg shadow-lg border text-sm font-medium
              ${hasViolations 
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                : 'bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'
              }
              backdrop-blur-sm
            `}
          >
            {/* Main dimensions display */}
            <div className="flex items-center gap-2 mb-1">
              <Ruler size={12} className="opacity-60" />
              <span>
                {formatDimension(dimensions.width)} × {formatDimension(dimensions.height)}
              </span>
            </div>

            {/* Position display */}
            <div className="text-xs opacity-75 mb-1">
              X: {formatDimension(dimensions.x)}, Y: {formatDimension(dimensions.y)}
            </div>

            {/* Delta changes */}
            {showDelta && originalDimensions && (delta.width !== 0 || delta.height !== 0) && (
              <div className="text-xs opacity-75 border-t border-current/20 pt-1 mt-1">
                <div>
                  Δ {formatDelta(delta.width)} × {formatDelta(delta.height)}
                </div>
                {(delta.x !== 0 || delta.y !== 0) && (
                  <div>
                    Δ X: {formatDelta(delta.x)}, Y: {formatDelta(delta.y)}
                  </div>
                )}
              </div>
            )}

            {/* Grid snap indicator */}
            {showGrid && gridSize > 1 && (
              <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                <Grid size={10} />
                <span>Grid: {gridSize}px</span>
              </div>
            )}

            {/* Constraint violations */}
            {hasViolations && (
              <div className="border-t border-current/20 pt-1 mt-1">
                {violations.map((violation, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <AlertTriangle size={10} />
                    <span>{violation.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tooltip arrow */}
          <div
            className={`
              absolute w-2 h-2 transform rotate-45
              ${hasViolations 
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600'
              }
              ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-b border-r' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-t border-l' : ''}
              ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-t border-r' : ''}
              ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-b border-l' : ''}
              ${position === 'center' ? 'hidden' : ''}
            `}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DimensionFeedback);
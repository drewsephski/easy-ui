"use client";

import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  components: string[];
  strength: number;
  alignmentType: AlignmentType;
}

type AlignmentType =
  | 'left-to-left' | 'right-to-right' | 'center-to-center'
  | 'top-to-top' | 'bottom-to-bottom' | 'middle-to-middle'
  | 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';

interface AlignmentGuideEngineProps {
  activeComponent: ComponentData | null;
  allComponents: ComponentData[];
  snapThreshold?: number;
  showDistanceMeasurements?: boolean;
  isActive?: boolean;
  zoom?: number;
  className?: string;
}

interface DistanceMeasurement {
  id: string;
  from: ComponentData;
  to: ComponentData;
  distance: number;
  direction: 'horizontal' | 'vertical';
  position: { x: number; y: number };
}

const SNAP_THRESHOLD = 15;
const GUIDE_STRENGTH_THRESHOLD = 0.6;
const DISTANCE_MEASUREMENT_THRESHOLD = 100;

const AlignmentGuideEngine: React.FC<AlignmentGuideEngineProps> = ({
  activeComponent,
  allComponents,
  snapThreshold = SNAP_THRESHOLD,
  showDistanceMeasurements = true,
  isActive = true,
  zoom = 1,
  className = '',
}) => {
  // Calculate alignment guides based on active component position
  const alignmentGuides = useMemo((): AlignmentGuide[] => {
    if (!activeComponent || !isActive) return [];

    const guides: AlignmentGuide[] = [];
    const activeRect = {
      left: activeComponent.x,
      right: activeComponent.x + activeComponent.width,
      top: activeComponent.y,
      bottom: activeComponent.y + activeComponent.height,
      centerX: activeComponent.x + activeComponent.width / 2,
      centerY: activeComponent.y + activeComponent.height / 2,
    };

    allComponents.forEach(component => {
      if (component.id === activeComponent.id || !component.visible) return;

      const compRect = {
        left: component.x,
        right: component.x + component.width,
        top: component.y,
        bottom: component.y + component.height,
        centerX: component.x + component.width / 2,
        centerY: component.y + component.height / 2,
      };

      // Horizontal alignment guides
      const horizontalAlignments = [
        { pos: compRect.top, type: 'top-to-top' as AlignmentType, target: activeRect.top },
        { pos: compRect.bottom, type: 'bottom-to-bottom' as AlignmentType, target: activeRect.bottom },
        { pos: compRect.centerY, type: 'middle-to-middle' as AlignmentType, target: activeRect.centerY },
        { pos: compRect.top - activeComponent.height, type: 'bottom-to-top' as AlignmentType, target: activeRect.top },
        { pos: compRect.bottom, type: 'top-to-bottom' as AlignmentType, target: activeRect.bottom },
      ];

      horizontalAlignments.forEach(align => {
        const distance = Math.abs(align.target - align.pos);
        if (distance <= snapThreshold) {
          const strength = 1 - (distance / snapThreshold);
          if (strength >= GUIDE_STRENGTH_THRESHOLD) {
            const start = Math.min(activeRect.left, compRect.left) - 50;
            const end = Math.max(activeRect.right, compRect.right) + 50;
            
            guides.push({
              id: `h-${component.id}-${align.type}`,
              type: 'horizontal',
              position: align.pos,
              start,
              end,
              components: [component.id],
              strength,
              alignmentType: align.type,
            });
          }
        }
      });

      // Vertical alignment guides
      const verticalAlignments = [
        { pos: compRect.left, type: 'left-to-left' as AlignmentType, target: activeRect.left },
        { pos: compRect.right, type: 'right-to-right' as AlignmentType, target: activeRect.right },
        { pos: compRect.centerX, type: 'center-to-center' as AlignmentType, target: activeRect.centerX },
        { pos: compRect.left - activeComponent.width, type: 'right-to-left' as AlignmentType, target: activeRect.left },
        { pos: compRect.right, type: 'left-to-right' as AlignmentType, target: activeRect.right },
      ];

      verticalAlignments.forEach(align => {
        const distance = Math.abs(align.target - align.pos);
        if (distance <= snapThreshold) {
          const strength = 1 - (distance / snapThreshold);
          if (strength >= GUIDE_STRENGTH_THRESHOLD) {
            const start = Math.min(activeRect.top, compRect.top) - 50;
            const end = Math.max(activeRect.bottom, compRect.bottom) + 50;
            
            guides.push({
              id: `v-${component.id}-${align.type}`,
              type: 'vertical',
              position: align.pos,
              start,
              end,
              components: [component.id],
              strength,
              alignmentType: align.type,
            });
          }
        }
      });
    });

    // Sort by strength and remove duplicates
    return guides
      .sort((a, b) => b.strength - a.strength)
      .filter((guide, index, arr) => 
        arr.findIndex(g => 
          g.type === guide.type && 
          Math.abs(g.position - guide.position) < 2
        ) === index
      )
      .slice(0, 8); // Limit to prevent visual clutter
  }, [activeComponent, allComponents, snapThreshold, isActive]);

  // Calculate distance measurements between components
  const distanceMeasurements = useMemo((): DistanceMeasurement[] => {
    if (!activeComponent || !showDistanceMeasurements || !isActive) return [];

    const measurements: DistanceMeasurement[] = [];
    const activeRect = {
      left: activeComponent.x,
      right: activeComponent.x + activeComponent.width,
      top: activeComponent.y,
      bottom: activeComponent.y + activeComponent.height,
      centerX: activeComponent.x + activeComponent.width / 2,
      centerY: activeComponent.y + activeComponent.height / 2,
    };

    allComponents.forEach(component => {
      if (component.id === activeComponent.id || !component.visible) return;

      const compRect = {
        left: component.x,
        right: component.x + component.width,
        top: component.y,
        bottom: component.y + component.height,
        centerX: component.x + component.width / 2,
        centerY: component.y + component.height / 2,
      };

      // Horizontal distance measurements
      const horizontalDistance = Math.min(
        Math.abs(activeRect.left - compRect.right),
        Math.abs(activeRect.right - compRect.left)
      );

      if (horizontalDistance <= DISTANCE_MEASUREMENT_THRESHOLD) {
        const isLeftOf = activeRect.left > compRect.right;
        const distance = isLeftOf 
          ? activeRect.left - compRect.right 
          : compRect.left - activeRect.right;

        if (distance > 0) {
          measurements.push({
            id: `h-dist-${component.id}`,
            from: activeComponent,
            to: component,
            distance,
            direction: 'horizontal',
            position: {
              x: isLeftOf 
                ? (compRect.right + activeRect.left) / 2
                : (activeRect.right + compRect.left) / 2,
              y: Math.max(activeRect.centerY, compRect.centerY),
            },
          });
        }
      }

      // Vertical distance measurements
      const verticalDistance = Math.min(
        Math.abs(activeRect.top - compRect.bottom),
        Math.abs(activeRect.bottom - compRect.top)
      );

      if (verticalDistance <= DISTANCE_MEASUREMENT_THRESHOLD) {
        const isAbove = activeRect.top > compRect.bottom;
        const distance = isAbove 
          ? activeRect.top - compRect.bottom 
          : compRect.top - activeRect.bottom;

        if (distance > 0) {
          measurements.push({
            id: `v-dist-${component.id}`,
            from: activeComponent,
            to: component,
            distance,
            direction: 'vertical',
            position: {
              x: Math.max(activeRect.centerX, compRect.centerX),
              y: isAbove 
                ? (compRect.bottom + activeRect.top) / 2
                : (activeRect.bottom + compRect.top) / 2,
            },
          });
        }
      }
    });

    return measurements.slice(0, 4); // Limit to prevent clutter
  }, [activeComponent, allComponents, showDistanceMeasurements, isActive]);

  // Get the strongest guides for snapping
  const getSnapPosition = useCallback((currentPosition: { x: number; y: number }) => {
    if (!activeComponent) return currentPosition;

    let snapX = currentPosition.x;
    let snapY = currentPosition.y;

    // Find strongest horizontal guide
    const horizontalGuides = alignmentGuides.filter(g => g.type === 'horizontal');
    if (horizontalGuides.length > 0) {
      const strongestH = horizontalGuides[0];
      snapY = strongestH.position;
    }

    // Find strongest vertical guide
    const verticalGuides = alignmentGuides.filter(g => g.type === 'vertical');
    if (verticalGuides.length > 0) {
      const strongestV = verticalGuides[0];
      snapX = strongestV.position;
    }

    return { x: snapX, y: snapY };
  }, [alignmentGuides, activeComponent]);

  const renderAlignmentGuides = () => {
    return alignmentGuides.map(guide => (
      <motion.line
        key={guide.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: Math.min(0.8, guide.strength + 0.2),
          scale: 1,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        x1={guide.type === 'vertical' ? guide.position : guide.start}
        y1={guide.type === 'horizontal' ? guide.position : guide.start}
        x2={guide.type === 'vertical' ? guide.position : guide.end}
        y2={guide.type === 'horizontal' ? guide.position : guide.end}
        stroke="#ef4444"
        strokeWidth={2 * zoom}
        strokeDasharray={`${4 * zoom} ${4 * zoom}`}
        className="pointer-events-none"
      />
    ));
  };

  const renderDistanceMeasurements = () => {
    return distanceMeasurements.map(measurement => (
      <g key={measurement.id}>
        <motion.line
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          x1={measurement.direction === 'horizontal' 
            ? measurement.position.x - measurement.distance / 2
            : measurement.position.x
          }
          y1={measurement.direction === 'vertical' 
            ? measurement.position.y - measurement.distance / 2
            : measurement.position.y
          }
          x2={measurement.direction === 'horizontal' 
            ? measurement.position.x + measurement.distance / 2
            : measurement.position.x
          }
          y2={measurement.direction === 'vertical' 
            ? measurement.position.y + measurement.distance / 2
            : measurement.position.y
          }
          stroke="#8b5cf6"
          strokeWidth={1 * zoom}
          className="pointer-events-none"
        />
        
        {/* Distance label */}
        <motion.text
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          x={measurement.position.x}
          y={measurement.position.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: `${12 * zoom}px`,
            fill: '#8b5cf6',
            fontWeight: 'bold',
          }}
        >
          {Math.round(measurement.distance)}px
        </motion.text>
        
        {/* Arrow indicators */}
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          points={measurement.direction === 'horizontal'
            ? `${measurement.position.x - measurement.distance / 2 - 3 * zoom},${measurement.position.y - 2 * zoom} ${measurement.position.x - measurement.distance / 2},${measurement.position.y} ${measurement.position.x - measurement.distance / 2 - 3 * zoom},${measurement.position.y + 2 * zoom}`
            : `${measurement.position.x - 2 * zoom},${measurement.position.y - measurement.distance / 2 - 3 * zoom} ${measurement.position.x},${measurement.position.y - measurement.distance / 2} ${measurement.position.x + 2 * zoom},${measurement.position.y - measurement.distance / 2 - 3 * zoom}`
          }
          fill="#8b5cf6"
          className="pointer-events-none"
        />
        
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          points={measurement.direction === 'horizontal'
            ? `${measurement.position.x + measurement.distance / 2 + 3 * zoom},${measurement.position.y - 2 * zoom} ${measurement.position.x + measurement.distance / 2},${measurement.position.y} ${measurement.position.x + measurement.distance / 2 + 3 * zoom},${measurement.position.y + 2 * zoom}`
            : `${measurement.position.x - 2 * zoom},${measurement.position.y + measurement.distance / 2 + 3 * zoom} ${measurement.position.x},${measurement.position.y + measurement.distance / 2} ${measurement.position.x + 2 * zoom},${measurement.position.y + measurement.distance / 2 + 3 * zoom}`
          }
          fill="#8b5cf6"
          className="pointer-events-none"
        />
      </g>
    ));
  };

  if (!isActive || !activeComponent) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 100 }}>
      <svg className="w-full h-full">
        <AnimatePresence mode="wait">
          {renderAlignmentGuides()}
          {showDistanceMeasurements && renderDistanceMeasurements()}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default React.memo(AlignmentGuideEngine);
export { type AlignmentGuide, type AlignmentType };
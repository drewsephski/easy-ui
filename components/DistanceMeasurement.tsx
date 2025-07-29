"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

export interface DistanceMeasurement {
  id: string;
  from: ComponentData;
  to: ComponentData;
  distance: number;
  direction: 'horizontal' | 'vertical';
  position: { x: number; y: number };
  type: MeasurementType;
}

export type MeasurementType = 
  | 'edge-to-edge' 
  | 'center-to-center' 
  | 'edge-to-center'
  | 'gap-measurement';

interface DistanceMeasurementProps {
  activeComponent: ComponentData | null;
  allComponents: ComponentData[];
  showMeasurements?: boolean;
  maxMeasurements?: number;
  measurementThreshold?: number;
  zoom?: number;
  unitFormat?: 'px' | 'rem' | 'em';
  showDirectionalArrows?: boolean;
  className?: string;
}

interface MeasurementLine {
  start: { x: number; y: number };
  end: { x: number; y: number };
  label: string;
  direction: 'horizontal' | 'vertical';
  strength: number;
}

const MEASUREMENT_THRESHOLD = 150;
const MAX_MEASUREMENTS = 6;

const DistanceMeasurementSystem: React.FC<DistanceMeasurementProps> = ({
  activeComponent,
  allComponents,
  showMeasurements = true,
  maxMeasurements = MAX_MEASUREMENTS,
  measurementThreshold = MEASUREMENT_THRESHOLD,
  zoom = 1,
  unitFormat = 'px',
  showDirectionalArrows = true,
  className = '',
}) => {
  const formatDistance = (distance: number, unit: string): string => {
    const rounded = Math.round(distance * 10) / 10;
    switch (unit) {
      case 'rem':
        return `${(rounded / 16).toFixed(2)}rem`;
      case 'em':
        return `${(rounded / 16).toFixed(2)}em`;
      default:
        return `${rounded}px`;
    }
  };
  // Calculate distance measurements between active component and others
  const measurements = useMemo((): DistanceMeasurement[] => {
    if (!activeComponent || !showMeasurements) return [];

    const results: DistanceMeasurement[] = [];
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

      // Horizontal measurements
      const horizontalMeasurements = [
        // Gap measurements (space between components)
        {
          distance: Math.abs(activeRect.left - compRect.right),
          condition: activeRect.left > compRect.right,
          position: {
            x: (compRect.right + activeRect.left) / 2,
            y: Math.min(activeRect.centerY, compRect.centerY),
          },
          type: 'gap-measurement' as MeasurementType,
        },
        {
          distance: Math.abs(compRect.left - activeRect.right),
          condition: compRect.left > activeRect.right,
          position: {
            x: (activeRect.right + compRect.left) / 2,
            y: Math.min(activeRect.centerY, compRect.centerY),
          },
          type: 'gap-measurement' as MeasurementType,
        },
        // Edge-to-edge measurements
        {
          distance: Math.abs(activeRect.left - compRect.left),
          condition: Math.abs(activeRect.left - compRect.left) > 5,
          position: {
            x: (activeRect.left + compRect.left) / 2,
            y: Math.max(activeRect.bottom, compRect.bottom) + 20,
          },
          type: 'edge-to-edge' as MeasurementType,
        },
        {
          distance: Math.abs(activeRect.right - compRect.right),
          condition: Math.abs(activeRect.right - compRect.right) > 5,
          position: {
            x: (activeRect.right + compRect.right) / 2,
            y: Math.max(activeRect.bottom, compRect.bottom) + 20,
          },
          type: 'edge-to-edge' as MeasurementType,
        },
        // Center-to-center measurements
        {
          distance: Math.abs(activeRect.centerX - compRect.centerX),
          condition: Math.abs(activeRect.centerX - compRect.centerX) > 10,
          position: {
            x: (activeRect.centerX + compRect.centerX) / 2,
            y: Math.max(activeRect.bottom, compRect.bottom) + 40,
          },
          type: 'center-to-center' as MeasurementType,
        },
      ];

      horizontalMeasurements.forEach((measurement, index) => {
        if (measurement.condition && measurement.distance <= measurementThreshold && measurement.distance > 0) {
          results.push({
            id: `h-${component.id}-${index}`,
            from: activeComponent,
            to: component,
            distance: measurement.distance,
            direction: 'horizontal',
            position: measurement.position,
            type: measurement.type,
          });
        }
      });

      // Vertical measurements
      const verticalMeasurements = [
        // Gap measurements (space between components)
        {
          distance: Math.abs(activeRect.top - compRect.bottom),
          condition: activeRect.top > compRect.bottom,
          position: {
            x: Math.min(activeRect.centerX, compRect.centerX),
            y: (compRect.bottom + activeRect.top) / 2,
          },
          type: 'gap-measurement' as MeasurementType,
        },
        {
          distance: Math.abs(compRect.top - activeRect.bottom),
          condition: compRect.top > activeRect.bottom,
          position: {
            x: Math.min(activeRect.centerX, compRect.centerX),
            y: (activeRect.bottom + compRect.top) / 2,
          },
          type: 'gap-measurement' as MeasurementType,
        },
        // Edge-to-edge measurements
        {
          distance: Math.abs(activeRect.top - compRect.top),
          condition: Math.abs(activeRect.top - compRect.top) > 5,
          position: {
            x: Math.max(activeRect.right, compRect.right) + 20,
            y: (activeRect.top + compRect.top) / 2,
          },
          type: 'edge-to-edge' as MeasurementType,
        },
        {
          distance: Math.abs(activeRect.bottom - compRect.bottom),
          condition: Math.abs(activeRect.bottom - compRect.bottom) > 5,
          position: {
            x: Math.max(activeRect.right, compRect.right) + 20,
            y: (activeRect.bottom + compRect.bottom) / 2,
          },
          type: 'edge-to-edge' as MeasurementType,
        },
        // Center-to-center measurements
        {
          distance: Math.abs(activeRect.centerY - compRect.centerY),
          condition: Math.abs(activeRect.centerY - compRect.centerY) > 10,
          position: {
            x: Math.max(activeRect.right, compRect.right) + 40,
            y: (activeRect.centerY + compRect.centerY) / 2,
          },
          type: 'center-to-center' as MeasurementType,
        },
      ];

      verticalMeasurements.forEach((measurement, index) => {
        if (measurement.condition && measurement.distance <= measurementThreshold && measurement.distance > 0) {
          results.push({
            id: `v-${component.id}-${index}`,
            from: activeComponent,
            to: component,
            distance: measurement.distance,
            direction: 'vertical',
            position: measurement.position,
            type: measurement.type,
          });
        }
      });
    });

    // Sort by distance (closest first) and limit results
    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxMeasurements);
  }, [activeComponent, allComponents, showMeasurements, measurementThreshold, maxMeasurements]);

  // Convert measurements to visual lines
  const measurementLines = useMemo((): MeasurementLine[] => {
    return measurements.map(measurement => {
      const { from, to, distance, direction, position, type } = measurement;
      
      let start: { x: number; y: number };
      let end: { x: number; y: number };
      
      if (direction === 'horizontal') {
        if (type === 'gap-measurement') {
          // Draw line between component edges
          const fromEdge = from.x < to.x ? from.x + from.width : from.x;
          const toEdge = to.x < from.x ? to.x + to.width : to.x;
          start = { x: fromEdge, y: position.y };
          end = { x: toEdge, y: position.y };
        } else {
          // Draw line showing alignment or distance
          start = { x: position.x - distance / 2, y: position.y };
          end = { x: position.x + distance / 2, y: position.y };
        }
      } else {
        if (type === 'gap-measurement') {
          // Draw line between component edges
          const fromEdge = from.y < to.y ? from.y + from.height : from.y;
          const toEdge = to.y < from.y ? to.y + to.height : to.y;
          start = { x: position.x, y: fromEdge };
          end = { x: position.x, y: toEdge };
        } else {
          // Draw line showing alignment or distance
          start = { x: position.x, y: position.y - distance / 2 };
          end = { x: position.x, y: position.y + distance / 2 };
        }
      }

      return {
        start,
        end,
        label: formatDistance(distance, unitFormat),
        direction,
        strength: 1 - (distance / measurementThreshold),
      };
    });
  }, [measurements, measurementThreshold, unitFormat]);

  

  const getColorByType = (type: MeasurementType): string => {
    switch (type) {
      case 'gap-measurement':
        return '#10b981'; // Green for gaps
      case 'center-to-center':
        return '#8b5cf6'; // Purple for center alignments
      case 'edge-to-edge':
        return '#f59e0b'; // Orange for edge alignments
      case 'edge-to-center':
        return '#06b6d4'; // Cyan for mixed alignments
      default:
        return '#6b7280'; // Gray default
    }
  };

  const renderMeasurementLine = (line: MeasurementLine, measurement: DistanceMeasurement) => {
    const color = getColorByType(measurement.type);
    const strokeWidth = Math.max(1, 1.5 * zoom);
    const arrowSize = Math.max(3, 4 * zoom);
    
    return (
      <g key={measurement.id}>
        {/* Main measurement line */}
        <motion.line
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 0.8, pathLength: 1 }}
          exit={{ opacity: 0, pathLength: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          x1={line.start.x}
          y1={line.start.y}
          x2={line.end.x}
          y2={line.end.y}
          stroke={color}
          strokeWidth={strokeWidth}
          className="pointer-events-none"
        />

        {/* Directional arrows */}
        {showDirectionalArrows && (
          <>
            <motion.polygon
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              points={
                line.direction === 'horizontal'
                  ? `${line.start.x},${line.start.y - arrowSize} ${line.start.x + arrowSize},${line.start.y} ${line.start.x},${line.start.y + arrowSize}`
                  : `${line.start.x - arrowSize},${line.start.y} ${line.start.x},${line.start.y + arrowSize} ${line.start.x + arrowSize},${line.start.y}`
              }
              fill={color}
              className="pointer-events-none"
            />
            <motion.polygon
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              points={
                line.direction === 'horizontal'
                  ? `${line.end.x},${line.end.y - arrowSize} ${line.end.x - arrowSize},${line.end.y} ${line.end.x},${line.end.y + arrowSize}`
                  : `${line.end.x - arrowSize},${line.end.y} ${line.end.x},${line.end.y - arrowSize} ${line.end.x + arrowSize},${line.end.y}`
              }
              fill={color}
              className="pointer-events-none"
            />
          </>
        )}

        {/* Distance label */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          {/* Label background */}
          <rect
            x={measurement.position.x - (line.label.length * 3 * zoom)}
            y={measurement.position.y - (8 * zoom)}
            width={line.label.length * 6 * zoom}
            height={16 * zoom}
            fill="white"
            stroke={color}
            strokeWidth={strokeWidth}
            rx={4 * zoom}
            className="pointer-events-none"
            opacity={0.9}
          />
          
          {/* Label text */}
          <text
            x={measurement.position.x}
            y={measurement.position.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none font-medium"
            style={{
              fontSize: `${Math.max(10, 11 * zoom)}px`,
              fill: color,
            }}
          >
            {line.label}
          </text>
        </motion.g>

        {/* Extension lines for gap measurements */}
        {measurement.type === 'gap-measurement' && (
          <>
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              x1={line.direction === 'horizontal' ? line.start.x : line.start.x - 10}
              y1={line.direction === 'horizontal' ? line.start.y - 10 : line.start.y}
              x2={line.direction === 'horizontal' ? line.start.x : line.start.x + 10}
              y2={line.direction === 'horizontal' ? line.start.y + 10 : line.start.y}
              stroke={color}
              strokeWidth={strokeWidth * 0.7}
              className="pointer-events-none"
            />
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              x1={line.direction === 'horizontal' ? line.end.x : line.end.x - 10}
              y1={line.direction === 'horizontal' ? line.end.y - 10 : line.end.y}
              x2={line.direction === 'horizontal' ? line.end.x : line.end.x + 10}
              y2={line.direction === 'horizontal' ? line.end.y + 10 : line.end.y}
              stroke={color}
              strokeWidth={strokeWidth * 0.7}
              className="pointer-events-none"
            />
          </>
        )}
      </g>
    );
  };

  if (!showMeasurements || !activeComponent || measurements.length === 0) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 90 }}>
      <svg className="w-full h-full">
        <AnimatePresence mode="wait">
          {measurementLines.map((line, index) => 
            renderMeasurementLine(line, measurements[index])
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default React.memo(DistanceMeasurementSystem);
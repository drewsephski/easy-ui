"use client";

import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Move, RotateCw } from 'lucide-react';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

export interface OverlapInfo {
  id: string;
  componentA: ComponentData;
  componentB: ComponentData;
  overlapArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  severity: 'minor' | 'moderate' | 'major';
  suggestions: OverlapSuggestion[];
}

export interface OverlapSuggestion {
  id: string;
  type: 'move' | 'resize' | 'reorder' | 'align';
  description: string;
  action: () => void;
  priority: number;
}

interface OverlapDetectionProps {
  components: ComponentData[];
  activeComponentId?: string;
  onUpdateComponent: (id: string, updates: Partial<ComponentData>) => void;
  showOverlapIndicators?: boolean;
  showSuggestions?: boolean;
  autoResolve?: boolean;
  className?: string;
}

const OVERLAP_THRESHOLD = 10; // Minimum overlap area to consider significant

const OverlapDetectionSystem: React.FC<OverlapDetectionProps> = ({
  components,
  activeComponentId,
  onUpdateComponent,
  showOverlapIndicators = true,
  showSuggestions = true,
  autoResolve = false,
  className = '',
}) => {
  // Generate suggestions for resolving overlaps
  const generateSuggestions = useCallback((
    compA: ComponentData,
    compB: ComponentData,
    overlapArea: { x: number; y: number; width: number; height: number }
  ): OverlapSuggestion[] => {
    const suggestions: OverlapSuggestion[] = [];

    // Move suggestions
    const moveDistance = Math.max(overlapArea.width, overlapArea.height) + 20;

    // Move component A
    suggestions.push({
      id: `move-${compA.id}-right`,
      type: 'move',
      description: `Move ${compA.content} right`,
      action: () => onUpdateComponent(compA.id, { x: compA.x + moveDistance }),
      priority: 3,
    });

    suggestions.push({
      id: `move-${compA.id}-down`,
      type: 'move',
      description: `Move ${compA.content} down`,
      action: () => onUpdateComponent(compA.id, { y: compA.y + moveDistance }),
      priority: 3,
    });

    // Move component B
    suggestions.push({
      id: `move-${compB.id}-left`,
      type: 'move',
      description: `Move ${compB.content} left`,
      action: () => onUpdateComponent(compB.id, { x: compB.x - moveDistance }),
      priority: 3,
    });

    suggestions.push({
      id: `move-${compB.id}-up`,
      type: 'move',
      description: `Move ${compB.content} up`,
      action: () => onUpdateComponent(compB.id, { y: compB.y - moveDistance }),
      priority: 3,
    });

    // Alignment suggestions
    suggestions.push({
      id: `align-${compA.id}-${compB.id}-horizontal`,
      type: 'align',
      description: `Align components horizontally`,
      action: () => {
        const avgY = (compA.y + compB.y) / 2;
        onUpdateComponent(compA.id, { y: avgY });
        onUpdateComponent(compB.id, { y: avgY });
      },
      priority: 2,
    });

    suggestions.push({
      id: `align-${compA.id}-${compB.id}-vertical`,
      type: 'align',
      description: `Align components vertically`,
      action: () => {
        const avgX = (compA.x + compB.x) / 2;
        onUpdateComponent(compA.id, { x: avgX });
        onUpdateComponent(compB.id, { x: avgX });
      },
      priority: 2,
    });

    // Z-index reordering suggestions
    suggestions.push({
      id: `reorder-${compA.id}-front`,
      type: 'reorder',
      description: `Bring ${compA.content} to front`,
      action: () => onUpdateComponent(compA.id, { zIndex: Math.max(compA.zIndex, compB.zIndex) + 1 }),
      priority: 1,
    });

    suggestions.push({
      id: `reorder-${compB.id}-front`,
      type: 'reorder',
      description: `Bring ${compB.content} to front`,
      action: () => onUpdateComponent(compB.id, { zIndex: Math.max(compA.zIndex, compB.zIndex) + 1 }),
      priority: 1,
    });

    return suggestions.sort((a, b) => b.priority - a.priority);
  }, [onUpdateComponent]);

  // Detect overlapping components
  const overlaps = useMemo((): OverlapInfo[] => {
    const detectedOverlaps: OverlapInfo[] = [];

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const compA = components[i];
        const compB = components[j];

        if (!compA.visible || !compB.visible) continue;

        // Calculate overlap area
        const overlapLeft = Math.max(compA.x, compB.x);
        const overlapTop = Math.max(compA.y, compB.y);
        const overlapRight = Math.min(compA.x + compA.width, compB.x + compB.width);
        const overlapBottom = Math.min(compA.y + compA.height, compB.y + compB.height);

        if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
          const overlapWidth = overlapRight - overlapLeft;
          const overlapHeight = overlapBottom - overlapTop;
          const overlapArea = overlapWidth * overlapHeight;

          if (overlapArea >= OVERLAP_THRESHOLD) {
            const totalAreaA = compA.width * compA.height;
            const totalAreaB = compB.width * compB.height;
            const overlapPercentage = overlapArea / Math.min(totalAreaA, totalAreaB);

            let severity: 'minor' | 'moderate' | 'major';
            if (overlapPercentage > 0.5) severity = 'major';
            else if (overlapPercentage > 0.2) severity = 'moderate';
            else severity = 'minor';

            const suggestions = generateSuggestions(compA, compB, {
              x: overlapLeft,
              y: overlapTop,
              width: overlapWidth,
              height: overlapHeight,
            });

            detectedOverlaps.push({
              id: `${compA.id}-${compB.id}`,
              componentA: compA,
              componentB: compB,
              overlapArea: {
                x: overlapLeft,
                y: overlapTop,
                width: overlapWidth,
                height: overlapHeight,
              },
              severity,
              suggestions,
            });
          }
        }
      }
    }

    return detectedOverlaps;
  }, [components, generateSuggestions]);

  // Auto-resolve overlaps if enabled
  React.useEffect(() => {
    if (autoResolve && overlaps.length > 0) {
      overlaps.forEach(overlap => {
        if (overlap.severity === 'major' && overlap.suggestions.length > 0) {
          const bestSuggestion = overlap.suggestions[0];
          setTimeout(() => bestSuggestion.action(), 100);
        }
      });
    }
  }, [overlaps, autoResolve]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'minor': return '#eab308';
      default: return '#6b7280';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'rgba(239, 68, 68, 0.1)';
      case 'moderate': return 'rgba(245, 158, 11, 0.1)';
      case 'minor': return 'rgba(234, 179, 8, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const renderOverlapIndicators = () => {
    if (!showOverlapIndicators) return null;

    return overlaps.map(overlap => (
      <motion.div
        key={overlap.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute pointer-events-none border-2 border-dashed rounded"
        style={{
          left: overlap.overlapArea.x,
          top: overlap.overlapArea.y,
          width: overlap.overlapArea.width,
          height: overlap.overlapArea.height,
          borderColor: getSeverityColor(overlap.severity),
          backgroundColor: getSeverityBgColor(overlap.severity),
          zIndex: 1000,
        }}
      >
        {/* Overlap warning icon */}
        <div
          className="absolute -top-6 -left-6 p-1 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: getSeverityColor(overlap.severity) }}
        >
          <AlertTriangle size={12} color="white" />
        </div>

        {/* Overlap info */}
        <div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 text-white text-xs rounded whitespace-nowrap"
          style={{ backgroundColor: getSeverityColor(overlap.severity) }}
        >
          {overlap.severity} overlap
        </div>
      </motion.div>
    ));
  };

  const renderSuggestionPanel = () => {
    if (!showSuggestions || overlaps.length === 0) return null;

    const activeOverlaps = activeComponentId 
      ? overlaps.filter(o => o.componentA.id === activeComponentId || o.componentB.id === activeComponentId)
      : overlaps;

    if (activeOverlaps.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm z-50"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Overlap Detected
          </h3>
        </div>

        <div className="space-y-3">
          {activeOverlaps.slice(0, 2).map(overlap => (
            <div key={overlap.id} className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {overlap.componentA.content} overlaps with {overlap.componentB.content}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {overlap.suggestions.slice(0, 3).map(suggestion => (
                  <motion.button
                    key={suggestion.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={suggestion.action}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded flex items-center gap-1"
                  >
                    {suggestion.type === 'move' && <Move size={10} />}
                    {suggestion.type === 'reorder' && <RotateCw size={10} />}
                    {suggestion.description}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {overlaps.length > 2 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            +{overlaps.length - 2} more overlaps
          </p>
        )}
      </motion.div>
    );
  };

  if (overlaps.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {renderOverlapIndicators()}
      </AnimatePresence>
      
      <AnimatePresence>
        {renderSuggestionPanel()}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(OverlapDetectionSystem);
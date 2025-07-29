"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlignLeft, AlignCenter, AlignRight, 
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  DistributeHorizontal, DistributeVertical,
  Undo2, Eye, EyeOff
} from 'lucide-react';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

export type AlignmentType = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom';

export type DistributionType = 'horizontal' | 'vertical';

export interface AlignmentOperation {
  id: string;
  type: 'alignment' | 'distribution';
  operation: AlignmentType | DistributionType;
  components: ComponentData[];
  previousPositions: Record<string, { x: number; y: number }>;
  timestamp: Date;
}

interface AlignmentToolsProps {
  selectedComponents: ComponentData[];
  onUpdateComponent: (id: string, updates: Partial<ComponentData>) => void;
  onAlignmentComplete?: (operation: AlignmentOperation) => void;
  showPreview?: boolean;
  className?: string;
}

interface AlignmentPreview {
  componentId: string;
  newPosition: { x: number; y: number };
  originalPosition: { x: number; y: number };
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({
  selectedComponents,
  onUpdateComponent,
  onAlignmentComplete,
  showPreview = true,
  className = '',
}) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [alignmentPreviews, setAlignmentPreviews] = useState<AlignmentPreview[]>([]);
  const [operationHistory, setOperationHistory] = useState<AlignmentOperation[]>([]);

  // Calculate bounding box of selected components
  const getBoundingBox = useCallback((components: ComponentData[]) => {
    if (components.length === 0) return null;

    const minX = Math.min(...components.map(c => c.x));
    const minY = Math.min(...components.map(c => c.y));
    const maxX = Math.max(...components.map(c => c.x + c.width));
    const maxY = Math.max(...components.map(c => c.y + c.height));

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }, []);

  // Calculate alignment positions
  const calculateAlignmentPositions = useCallback((
    components: ComponentData[], 
    alignmentType: AlignmentType
  ): Record<string, { x: number; y: number }> => {
    const boundingBox = getBoundingBox(components);
    if (!boundingBox) return {};

    const newPositions: Record<string, { x: number; y: number }> = {};

    components.forEach(component => {
      let newX = component.x;
      let newY = component.y;

      switch (alignmentType) {
        case 'left':
          newX = boundingBox.left;
          break;
        case 'center':
          newX = boundingBox.centerX - component.width / 2;
          break;
        case 'right':
          newX = boundingBox.right - component.width;
          break;
        case 'top':
          newY = boundingBox.top;
          break;
        case 'middle':
          newY = boundingBox.centerY - component.height / 2;
          break;
        case 'bottom':
          newY = boundingBox.bottom - component.height;
          break;
      }

      newPositions[component.id] = { x: newX, y: newY };
    });

    return newPositions;
  }, [getBoundingBox]);

  // Calculate distribution positions
  const calculateDistributionPositions = useCallback((
    components: ComponentData[], 
    distributionType: DistributionType
  ): Record<string, { x: number; y: number }> => {
    if (components.length < 3) return {}; // Need at least 3 components to distribute

    const sortedComponents = [...components].sort((a, b) => {
      return distributionType === 'horizontal' 
        ? a.x - b.x 
        : a.y - b.y;
    });

    const first = sortedComponents[0];
    const last = sortedComponents[sortedComponents.length - 1];
    
    const totalSpace = distributionType === 'horizontal'
      ? (last.x + last.width) - first.x
      : (last.y + last.height) - first.y;

    const totalComponentSize = sortedComponents.reduce((sum, comp) => {
      return sum + (distributionType === 'horizontal' ? comp.width : comp.height);
    }, 0);

    const availableSpace = totalSpace - totalComponentSize;
    const gap = availableSpace / (sortedComponents.length - 1);

    const newPositions: Record<string, { x: number; y: number }> = {};
    let currentPosition = distributionType === 'horizontal' ? first.x : first.y;

    sortedComponents.forEach((component, index) => {
      if (index === 0) {
        // Keep first component in place
        newPositions[component.id] = { x: component.x, y: component.y };
      } else if (index === sortedComponents.length - 1) {
        // Keep last component in place
        newPositions[component.id] = { x: component.x, y: component.y };
      } else {
        // Distribute middle components
        const prevComponent = sortedComponents[index - 1];
        currentPosition += (distributionType === 'horizontal' ? prevComponent.width : prevComponent.height) + gap;
        
        newPositions[component.id] = {
          x: distributionType === 'horizontal' ? currentPosition : component.x,
          y: distributionType === 'vertical' ? currentPosition : component.y,
        };
      }
    });

    return newPositions;
  }, []);

  // Preview alignment
  const previewAlignment = useCallback((alignmentType: AlignmentType) => {
    if (!showPreview) return;

    const newPositions = calculateAlignmentPositions(selectedComponents, alignmentType);
    const previews: AlignmentPreview[] = selectedComponents.map(component => ({
      componentId: component.id,
      newPosition: newPositions[component.id] || { x: component.x, y: component.y },
      originalPosition: { x: component.x, y: component.y },
    }));

    setAlignmentPreviews(previews);
    setPreviewMode(true);

    // Auto-hide preview after 3 seconds
    setTimeout(() => {
      setPreviewMode(false);
      setAlignmentPreviews([]);
    }, 3000);
  }, [selectedComponents, calculateAlignmentPositions, showPreview]);

  // Apply alignment
  const applyAlignment = useCallback((alignmentType: AlignmentType) => {
    const previousPositions: Record<string, { x: number; y: number }> = {};
    selectedComponents.forEach(component => {
      previousPositions[component.id] = { x: component.x, y: component.y };
    });

    const newPositions = calculateAlignmentPositions(selectedComponents, alignmentType);

    // Apply the alignment
    Object.entries(newPositions).forEach(([componentId, position]) => {
      onUpdateComponent(componentId, position);
    });

    // Record operation for history
    const operation: AlignmentOperation = {
      id: `align-${alignmentType}-${Date.now()}`,
      type: 'alignment',
      operation: alignmentType,
      components: [...selectedComponents],
      previousPositions,
      timestamp: new Date(),
    };

    setOperationHistory(prev => [...prev, operation].slice(-10)); // Keep last 10 operations
    onAlignmentComplete?.(operation);

    // Clear preview
    setPreviewMode(false);
    setAlignmentPreviews([]);
  }, [selectedComponents, calculateAlignmentPositions, onUpdateComponent, onAlignmentComplete]);

  // Apply distribution
  const applyDistribution = useCallback((distributionType: DistributionType) => {
    if (selectedComponents.length < 3) return;

    const previousPositions: Record<string, { x: number; y: number }> = {};
    selectedComponents.forEach(component => {
      previousPositions[component.id] = { x: component.x, y: component.y };
    });

    const newPositions = calculateDistributionPositions(selectedComponents, distributionType);

    // Apply the distribution
    Object.entries(newPositions).forEach(([componentId, position]) => {
      onUpdateComponent(componentId, position);
    });

    // Record operation for history
    const operation: AlignmentOperation = {
      id: `distribute-${distributionType}-${Date.now()}`,
      type: 'distribution',
      operation: distributionType,
      components: [...selectedComponents],
      previousPositions,
      timestamp: new Date(),
    };

    setOperationHistory(prev => [...prev, operation].slice(-10));
    onAlignmentComplete?.(operation);
  }, [selectedComponents, calculateDistributionPositions, onUpdateComponent, onAlignmentComplete]);

  // Undo last operation
  const undoLastOperation = useCallback(() => {
    const lastOperation = operationHistory[operationHistory.length - 1];
    if (!lastOperation) return;

    // Restore previous positions
    Object.entries(lastOperation.previousPositions).forEach(([componentId, position]) => {
      onUpdateComponent(componentId, position);
    });

    setOperationHistory(prev => prev.slice(0, -1));
  }, [operationHistory, onUpdateComponent]);

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(!previewMode);
    if (previewMode) {
      setAlignmentPreviews([]);
    }
  }, [previewMode]);

  if (selectedComponents.length < 2) {
    return null;
  }

  const canDistribute = selectedComponents.length >= 3;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Alignment Controls */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Alignment
        </h4>
        
        {/* Horizontal Alignment */}
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyAlignment('left')}
            onMouseEnter={() => previewAlignment('left')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyAlignment('center')}
            onMouseEnter={() => previewAlignment('center')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Align Center"
          >
            <AlignCenter size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyAlignment('right')}
            onMouseEnter={() => previewAlignment('right')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Align Right"
          >
            <AlignRight size={16} />
          </motion.button>
        </div>

        {/* Vertical Alignment */}
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyAlignment('top')}
            onMouseEnter={() => previewAlignment('top')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Align Top"
          >
            <AlignVerticalJustifyStart size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyAlignment('middle')}
            onMouseEnter={() => previewAlignment('middle')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Align Middle"
          >
            <AlignVerticalJustifyCenter size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyAlignment('bottom')}
            onMouseEnter={() => previewAlignment('bottom')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Align Bottom"
          >
            <AlignVerticalJustifyEnd size={16} />
          </motion.button>
        </div>
      </div>

      {/* Distribution Controls */}
      {canDistribute && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Distribution
          </h4>
          
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyDistribution('horizontal')}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              title="Distribute Horizontally"
            >
              <DistributeHorizontal size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyDistribution('vertical')}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              title="Distribute Vertically"
            >
              <DistributeVertical size={16} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-1 pt-2 border-t border-gray-200 dark:border-gray-600">
        {operationHistory.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={undoLastOperation}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title="Undo Last Alignment"
          >
            <Undo2 size={16} />
          </motion.button>
        )}
        
        {showPreview && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePreview}
            className={`p-2 rounded-md transition-colors ${
              previewMode 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
            title={previewMode ? "Hide Preview" : "Show Preview"}
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </motion.button>
        )}
      </div>

      {/* Preview Overlays */}
      <AnimatePresence>
        {previewMode && alignmentPreviews.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {alignmentPreviews.map(preview => (
              <motion.div
                key={preview.componentId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute border-2 border-dashed border-blue-400 bg-blue-100/30 rounded"
                style={{
                  left: preview.newPosition.x,
                  top: preview.newPosition.y,
                  width: selectedComponents.find(c => c.id === preview.componentId)?.width || 0,
                  height: selectedComponents.find(c => c.id === preview.componentId)?.height || 0,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Status */}
      {selectedComponents.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {selectedComponents.length} component{selectedComponents.length > 1 ? 's' : ''} selected
          {!canDistribute && selectedComponents.length === 2 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Select 3+ components to enable distribution
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AlignmentTools);
export { type AlignmentOperation };
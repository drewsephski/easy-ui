"use client";

import React, { useCallback } from 'react';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

export interface GroupOperationsProps {
  selectedComponents: ComponentData[];
  onUpdateComponent: (id: string, updates: Partial<ComponentData>) => void;
}

export type AlignmentType = 
  | 'align-left' | 'align-center' | 'align-right'
  | 'align-top' | 'align-middle' | 'align-bottom';

export type DistributionType = 
  | 'distribute-horizontal' | 'distribute-vertical'
  | 'distribute-horizontal-spacing' | 'distribute-vertical-spacing';

export interface GroupBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export const useGroupOperations = (
  selectedComponents: ComponentData[],
  onUpdateComponent: (id: string, updates: Partial<ComponentData>) => void
) => {
  // Calculate group bounds
  const getGroupBounds = useCallback((): GroupBounds | null => {
    if (selectedComponents.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedComponents.forEach(component => {
      const left = component.x;
      const top = component.y;
      const right = component.x + component.width;
      const bottom = component.y + component.height;

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      centerX: minX + width / 2,
      centerY: minY + height / 2,
    };
  }, [selectedComponents]);

  // Group move with unified drag handling
  const moveGroup = useCallback((deltaX: number, deltaY: number) => {
    selectedComponents.forEach(component => {
      onUpdateComponent(component.id, {
        x: component.x + deltaX,
        y: component.y + deltaY,
      });
    });
  }, [selectedComponents, onUpdateComponent]);

  // Group resize with proportional scaling
  const resizeGroup = useCallback((
    scaleX: number,
    scaleY: number,
    anchorX: number,
    anchorY: number,
    maintainAspectRatio: boolean = false
  ) => {
    const bounds = getGroupBounds();
    if (!bounds) return;

    // If maintaining aspect ratio, use the smaller scale factor
    if (maintainAspectRatio) {
      const scale = Math.min(scaleX, scaleY);
      scaleX = scale;
      scaleY = scale;
    }

    selectedComponents.forEach(component => {
      // Calculate relative position from anchor point
      const relativeX = component.x - anchorX;
      const relativeY = component.y - anchorY;

      // Apply scaling
      const newX = anchorX + (relativeX * scaleX);
      const newY = anchorY + (relativeY * scaleY);
      const newWidth = component.width * scaleX;
      const newHeight = component.height * scaleY;

      onUpdateComponent(component.id, {
        x: newX,
        y: newY,
        width: Math.max(10, newWidth), // Minimum width
        height: Math.max(10, newHeight), // Minimum height
      });
    });
  }, [selectedComponents, onUpdateComponent, getGroupBounds]);

  // Group rotation around selection center point
  const rotateGroup = useCallback((angle: number, centerX?: number, centerY?: number) => {
    const bounds = getGroupBounds();
    if (!bounds) return;

    const rotationCenterX = centerX ?? bounds.centerX;
    const rotationCenterY = centerY ?? bounds.centerY;
    const radians = (angle * Math.PI) / 180;

    selectedComponents.forEach(component => {
      const componentCenterX = component.x + component.width / 2;
      const componentCenterY = component.y + component.height / 2;

      // Calculate relative position from rotation center
      const relativeX = componentCenterX - rotationCenterX;
      const relativeY = componentCenterY - rotationCenterY;

      // Apply rotation
      const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
      const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);

      // Calculate new position
      const newCenterX = rotationCenterX + rotatedX;
      const newCenterY = rotationCenterY + rotatedY;
      const newX = newCenterX - component.width / 2;
      const newY = newCenterY - component.height / 2;

      onUpdateComponent(component.id, {
        x: newX,
        y: newY,
        rotation: (component.rotation || 0) + angle,
      });
    });
  }, [selectedComponents, onUpdateComponent, getGroupBounds]);

  // Alignment operations
  const alignComponents = useCallback((alignmentType: AlignmentType) => {
    if (selectedComponents.length < 2) return;

    const bounds = getGroupBounds();
    if (!bounds) return;

    selectedComponents.forEach(component => {
      let newX = component.x;
      let newY = component.y;

      switch (alignmentType) {
        case 'align-left':
          newX = bounds.minX;
          break;
        case 'align-center':
          newX = bounds.centerX - component.width / 2;
          break;
        case 'align-right':
          newX = bounds.maxX - component.width;
          break;
        case 'align-top':
          newY = bounds.minY;
          break;
        case 'align-middle':
          newY = bounds.centerY - component.height / 2;
          break;
        case 'align-bottom':
          newY = bounds.maxY - component.height;
          break;
      }

      onUpdateComponent(component.id, { x: newX, y: newY });
    });
  }, [selectedComponents, onUpdateComponent, getGroupBounds]);

  // Distribution operations
  const distributeComponents = useCallback((distributionType: DistributionType) => {
    if (selectedComponents.length < 3) return;

    const sortedComponents = [...selectedComponents];

    switch (distributionType) {
      case 'distribute-horizontal': {
        // Sort by x position
        sortedComponents.sort((a, b) => a.x - b.x);
        
        const leftmost = sortedComponents[0];
        const rightmost = sortedComponents[sortedComponents.length - 1];
        const totalWidth = (rightmost.x + rightmost.width) - leftmost.x;
        const availableSpace = totalWidth - sortedComponents.reduce((sum, comp) => sum + comp.width, 0);
        const spacing = availableSpace / (sortedComponents.length - 1);

        let currentX = leftmost.x;
        sortedComponents.forEach((component, index) => {
          if (index === 0) return; // Skip first component
          
          currentX += sortedComponents[index - 1].width + spacing;
          onUpdateComponent(component.id, { x: currentX });
        });
        break;
      }

      case 'distribute-vertical': {
        // Sort by y position
        sortedComponents.sort((a, b) => a.y - b.y);
        
        const topmost = sortedComponents[0];
        const bottommost = sortedComponents[sortedComponents.length - 1];
        const totalHeight = (bottommost.y + bottommost.height) - topmost.y;
        const availableSpace = totalHeight - sortedComponents.reduce((sum, comp) => sum + comp.height, 0);
        const spacing = availableSpace / (sortedComponents.length - 1);

        let currentY = topmost.y;
        sortedComponents.forEach((component, index) => {
          if (index === 0) return; // Skip first component
          
          currentY += sortedComponents[index - 1].height + spacing;
          onUpdateComponent(component.id, { y: currentY });
        });
        break;
      }

      case 'distribute-horizontal-spacing': {
        // Sort by x position
        sortedComponents.sort((a, b) => a.x - b.x);
        
        const leftmost = sortedComponents[0];
        const rightmost = sortedComponents[sortedComponents.length - 1];
        const totalDistance = (rightmost.x + rightmost.width / 2) - (leftmost.x + leftmost.width / 2);
        const spacing = totalDistance / (sortedComponents.length - 1);

        sortedComponents.forEach((component, index) => {
          if (index === 0 || index === sortedComponents.length - 1) return; // Skip first and last
          
          const newCenterX = (leftmost.x + leftmost.width / 2) + (spacing * index);
          const newX = newCenterX - component.width / 2;
          onUpdateComponent(component.id, { x: newX });
        });
        break;
      }

      case 'distribute-vertical-spacing': {
        // Sort by y position
        sortedComponents.sort((a, b) => a.y - b.y);
        
        const topmost = sortedComponents[0];
        const bottommost = sortedComponents[sortedComponents.length - 1];
        const totalDistance = (bottommost.y + bottommost.height / 2) - (topmost.y + topmost.height / 2);
        const spacing = totalDistance / (sortedComponents.length - 1);

        sortedComponents.forEach((component, index) => {
          if (index === 0 || index === sortedComponents.length - 1) return; // Skip first and last
          
          const newCenterY = (topmost.y + topmost.height / 2) + (spacing * index);
          const newY = newCenterY - component.height / 2;
          onUpdateComponent(component.id, { y: newY });
        });
        break;
      }
    }
  }, [selectedComponents, onUpdateComponent]);

  // Duplicate group
  const duplicateGroup = useCallback((offsetX: number = 20, offsetY: number = 20) => {
    // This would need to be implemented with the parent component's addComponent function
    // For now, we'll return the data needed to create duplicates
    return selectedComponents.map(component => ({
      ...component,
      x: component.x + offsetX,
      y: component.y + offsetY,
    }));
  }, [selectedComponents]);

  // Group components (create a logical group)
  const createGroup = useCallback(() => {
    // This would create a logical grouping of components
    // Implementation depends on how groups are stored in the data model
    const groupId = `group-${Date.now()}`;
    
    selectedComponents.forEach(component => {
      onUpdateComponent(component.id, {
        ...component,
        // Add group metadata
        props: {
          ...component.props,
          groupId,
        },
      });
    });

    return groupId;
  }, [selectedComponents, onUpdateComponent]);

  // Ungroup components
  const ungroup = useCallback((groupId: string) => {
    selectedComponents
      .filter(component => component.props?.groupId === groupId)
      .forEach(component => {
        const { groupId: _, ...restProps } = component.props || {};
        onUpdateComponent(component.id, {
          props: restProps,
        });
      });
  }, [selectedComponents, onUpdateComponent]);

  return {
    getGroupBounds,
    moveGroup,
    resizeGroup,
    rotateGroup,
    alignComponents,
    distributeComponents,
    duplicateGroup,
    createGroup,
    ungroup,
  };
};

// React component for group operations UI (optional)
const GroupOperations: React.FC<GroupOperationsProps> = ({
  selectedComponents,
  onUpdateComponent,
}) => {
  const {
    alignComponents,
    distributeComponents,
  } = useGroupOperations(selectedComponents, onUpdateComponent);

  if (selectedComponents.length < 2) return null;

  return (
    <div className="flex flex-col gap-2 p-2 bg-neutral-800 rounded-lg">
      <div className="text-xs font-semibold text-neutral-300">Group Operations</div>
      
      {/* Alignment Controls */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-neutral-400">Align</div>
        <div className="flex gap-1">
          <button
            onClick={() => alignComponents('align-left')}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            title="Align Left"
          >
            ⫷
          </button>
          <button
            onClick={() => alignComponents('align-center')}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            title="Align Center"
          >
            ⫸
          </button>
          <button
            onClick={() => alignComponents('align-right')}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            title="Align Right"
          >
            ⫷
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => alignComponents('align-top')}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            title="Align Top"
          >
            ⫫
          </button>
          <button
            onClick={() => alignComponents('align-middle')}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            title="Align Middle"
          >
            ⫬
          </button>
          <button
            onClick={() => alignComponents('align-bottom')}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            title="Align Bottom"
          >
            ⫫
          </button>
        </div>
      </div>

      {/* Distribution Controls */}
      {selectedComponents.length >= 3 && (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-neutral-400">Distribute</div>
          <div className="flex gap-1">
            <button
              onClick={() => distributeComponents('distribute-horizontal')}
              className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
              title="Distribute Horizontally"
            >
              ⟷
            </button>
            <button
              onClick={() => distributeComponents('distribute-vertical')}
              className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
              title="Distribute Vertically"
            >
              ⟷
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupOperations;
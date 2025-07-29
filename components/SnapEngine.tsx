"use client";

import React, { useMemo, useCallback } from 'react';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

export interface SnapTarget {
  id: string;
  type: 'grid' | 'component-edge' | 'component-center';
  position: { x: number; y: number };
  componentId?: string;
  edge?: EdgeType;
  strength: number;
  priority: number;
}

export type EdgeType = 'left' | 'right' | 'top' | 'bottom' | 'center-x' | 'center-y';

export interface SnapResult {
  position: { x: number; y: number };
  snappedTo: SnapTarget[];
  guides: SnapGuide[];
  hasSnapped: boolean;
}

export interface SnapGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  strength: number;
}

interface SnapEngineProps {
  components: ComponentData[];
  activeComponentId?: string;
  snapToGrid?: boolean;
  snapToComponents?: boolean;
  gridSize?: number;
  snapThreshold?: number;
  enabled?: boolean;
}

interface SnapEngineConfig {
  gridSize: number;
  snapThreshold: number;
  snapToGrid: boolean;
  snapToComponents: boolean;
  gridPriority: number;
  componentPriority: number;
  centerPriority: number;
}

const DEFAULT_CONFIG: SnapEngineConfig = {
  gridSize: 15,
  snapThreshold: 15,
  snapToGrid: true,
  snapToComponents: true,
  gridPriority: 1,
  componentPriority: 2,
  centerPriority: 3,
};

export class SnapEngine {
  private config: SnapEngineConfig;
  private components: ComponentData[];
  private activeComponentId?: string;

  constructor(props: SnapEngineProps) {
    this.config = {
      ...DEFAULT_CONFIG,
      gridSize: props.gridSize ?? DEFAULT_CONFIG.gridSize,
      snapThreshold: props.snapThreshold ?? DEFAULT_CONFIG.snapThreshold,
      snapToGrid: props.snapToGrid ?? DEFAULT_CONFIG.snapToGrid,
      snapToComponents: props.snapToComponents ?? DEFAULT_CONFIG.snapToComponents,
    };
    this.components = props.components;
    this.activeComponentId = props.activeComponentId;
  }

  // Update configuration
  updateConfig(newConfig: Partial<SnapEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Update components list
  updateComponents(components: ComponentData[], activeComponentId?: string): void {
    this.components = components;
    this.activeComponentId = activeComponentId;
  }

  // Calculate all possible snap targets for a given position
  calculateSnapTargets(position: { x: number; y: number }, dimensions?: { width: number; height: number }): SnapTarget[] {
    const targets: SnapTarget[] = [];
    const { snapThreshold } = this.config;

    // Grid snap targets
    if (this.config.snapToGrid) {
      const gridTargets = this.calculateGridSnapTargets(position);
      targets.push(...gridTargets);
    }

    // Component snap targets
    if (this.config.snapToComponents) {
      const componentTargets = this.calculateComponentSnapTargets(position, dimensions);
      targets.push(...componentTargets);
    }

    // Sort by strength and priority
    return targets
      .filter(target => target.strength > 0)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return b.strength - a.strength;
      });
  }

  // Calculate grid-based snap targets
  private calculateGridSnapTargets(position: { x: number; y: number }): SnapTarget[] {
    const { gridSize, snapThreshold, gridPriority } = this.config;
    const targets: SnapTarget[] = [];

    // Find nearest grid points
    const nearestGridX = Math.round(position.x / gridSize) * gridSize;
    const nearestGridY = Math.round(position.y / gridSize) * gridSize;

    const distanceX = Math.abs(position.x - nearestGridX);
    const distanceY = Math.abs(position.y - nearestGridY);

    // X-axis grid snap
    if (distanceX <= snapThreshold) {
      targets.push({
        id: `grid-x-${nearestGridX}`,
        type: 'grid',
        position: { x: nearestGridX, y: position.y },
        strength: 1 - (distanceX / snapThreshold),
        priority: gridPriority,
      });
    }

    // Y-axis grid snap
    if (distanceY <= snapThreshold) {
      targets.push({
        id: `grid-y-${nearestGridY}`,
        type: 'grid',
        position: { x: position.x, y: nearestGridY },
        strength: 1 - (distanceY / snapThreshold),
        priority: gridPriority,
      });
    }

    // Corner grid snap (both axes)
    if (distanceX <= snapThreshold && distanceY <= snapThreshold) {
      const combinedDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      targets.push({
        id: `grid-corner-${nearestGridX}-${nearestGridY}`,
        type: 'grid',
        position: { x: nearestGridX, y: nearestGridY },
        strength: 1 - (combinedDistance / (snapThreshold * Math.sqrt(2))),
        priority: gridPriority + 1, // Higher priority for corner snaps
      });
    }

    return targets;
  }

  // Calculate component-based snap targets
  private calculateComponentSnapTargets(
    position: { x: number; y: number }, 
    dimensions?: { width: number; height: number }
  ): SnapTarget[] {
    const { snapThreshold, componentPriority, centerPriority } = this.config;
    const targets: SnapTarget[] = [];
    const dragWidth = dimensions?.width || 0;
    const dragHeight = dimensions?.height || 0;

    this.components.forEach(component => {
      if (component.id === this.activeComponentId || !component.visible) return;

      const compRect = {
        left: component.x,
        right: component.x + component.width,
        top: component.y,
        bottom: component.y + component.height,
        centerX: component.x + component.width / 2,
        centerY: component.y + component.height / 2,
      };

      // Edge snap targets
      const edgeTargets = [
        { pos: compRect.left, edge: 'left' as EdgeType, axis: 'x' },
        { pos: compRect.right, edge: 'right' as EdgeType, axis: 'x' },
        { pos: compRect.top, edge: 'top' as EdgeType, axis: 'y' },
        { pos: compRect.bottom, edge: 'bottom' as EdgeType, axis: 'y' },
      ];

      edgeTargets.forEach(({ pos, edge, axis }) => {
        const distance = Math.abs(position[axis as keyof typeof position] - pos);
        if (distance <= snapThreshold) {
          const snapPosition = axis === 'x' 
            ? { x: pos, y: position.y }
            : { x: position.x, y: pos };

          targets.push({
            id: `edge-${component.id}-${edge}`,
            type: 'component-edge',
            position: snapPosition,
            componentId: component.id,
            edge,
            strength: 1 - (distance / snapThreshold),
            priority: componentPriority,
          });
        }
      });

      // Center snap targets
      const centerTargets = [
        { pos: compRect.centerX, edge: 'center-x' as EdgeType, axis: 'x' },
        { pos: compRect.centerY, edge: 'center-y' as EdgeType, axis: 'y' },
      ];

      centerTargets.forEach(({ pos, edge, axis }) => {
        const dragCenter = axis === 'x' 
          ? position.x + dragWidth / 2
          : position.y + dragHeight / 2;
        const distance = Math.abs(dragCenter - pos);
        
        if (distance <= snapThreshold) {
          const snapPosition = axis === 'x' 
            ? { x: pos - dragWidth / 2, y: position.y }
            : { x: position.x, y: pos - dragHeight / 2 };

          targets.push({
            id: `center-${component.id}-${edge}`,
            type: 'component-center',
            position: snapPosition,
            componentId: component.id,
            edge,
            strength: 1 - (distance / snapThreshold),
            priority: centerPriority,
          });
        }
      });

      // Adjacent positioning (spacing-based snaps)
      if (dimensions) {
        const adjacentTargets = [
          { pos: compRect.right, edge: 'left-to-right' as EdgeType, axis: 'x', offset: 0 },
          { pos: compRect.left - dragWidth, edge: 'right-to-left' as EdgeType, axis: 'x', offset: 0 },
          { pos: compRect.bottom, edge: 'top-to-bottom' as EdgeType, axis: 'y', offset: 0 },
          { pos: compRect.top - dragHeight, edge: 'bottom-to-top' as EdgeType, axis: 'y', offset: 0 },
        ];

        adjacentTargets.forEach(({ pos, edge, axis, offset }) => {
          const distance = Math.abs(position[axis as keyof typeof position] - pos);
          if (distance <= snapThreshold) {
            const snapPosition = axis === 'x' 
              ? { x: pos + offset, y: position.y }
              : { x: position.x, y: pos + offset };

            targets.push({
              id: `adjacent-${component.id}-${edge}`,
              type: 'component-edge',
              position: snapPosition,
              componentId: component.id,
              edge,
              strength: 1 - (distance / snapThreshold),
              priority: componentPriority,
            });
          }
        });
      }
    });

    return targets;
  }

  // Calculate the best snap position for a given position
  calculateSnapPosition(
    position: { x: number; y: number }, 
    dimensions?: { width: number; height: number }
  ): SnapResult {
    const targets = this.calculateSnapTargets(position, dimensions);
    
    if (targets.length === 0) {
      return {
        position,
        snappedTo: [],
        guides: [],
        hasSnapped: false,
      };
    }

    // Find the best snap targets for X and Y axes
    const xTargets = targets.filter(t => 
      Math.abs(t.position.x - position.x) > 0.1
    ).sort((a, b) => b.strength - a.strength);
    
    const yTargets = targets.filter(t => 
      Math.abs(t.position.y - position.y) > 0.1
    ).sort((a, b) => b.strength - a.strength);

    let finalPosition = { ...position };
    const snappedTo: SnapTarget[] = [];
    const guides: SnapGuide[] = [];

    // Apply X-axis snap
    if (xTargets.length > 0) {
      const bestXTarget = xTargets[0];
      finalPosition.x = bestXTarget.position.x;
      snappedTo.push(bestXTarget);
      
      // Create vertical guide
      guides.push({
        id: `guide-v-${bestXTarget.id}`,
        type: 'vertical',
        position: bestXTarget.position.x,
        start: Math.min(position.y, bestXTarget.position.y || position.y) - 50,
        end: Math.max(position.y + (dimensions?.height || 0), (bestXTarget.position.y || position.y) + 50) + 50,
        strength: bestXTarget.strength,
      });
    }

    // Apply Y-axis snap
    if (yTargets.length > 0) {
      const bestYTarget = yTargets[0];
      finalPosition.y = bestYTarget.position.y;
      snappedTo.push(bestYTarget);
      
      // Create horizontal guide
      guides.push({
        id: `guide-h-${bestYTarget.id}`,
        type: 'horizontal',
        position: bestYTarget.position.y,
        start: Math.min(position.x, bestYTarget.position.x || position.x) - 50,
        end: Math.max(position.x + (dimensions?.width || 0), (bestYTarget.position.x || position.x) + 50) + 50,
        strength: bestYTarget.strength,
      });
    }

    return {
      position: finalPosition,
      snappedTo,
      guides,
      hasSnapped: snappedTo.length > 0,
    };
  }

  // Get snap threshold for UI feedback
  getSnapThreshold(): number {
    return this.config.snapThreshold;
  }

  // Check if snapping is enabled
  isEnabled(): boolean {
    return this.config.snapToGrid || this.config.snapToComponents;
  }
}

// React hook for using SnapEngine
export const useSnapEngine = (props: SnapEngineProps) => {
  const snapEngine = useMemo(() => new SnapEngine(props), []);

  // Update engine when props change
  React.useEffect(() => {
    snapEngine.updateComponents(props.components, props.activeComponentId);
    snapEngine.updateConfig({
      gridSize: props.gridSize ?? DEFAULT_CONFIG.gridSize,
      snapThreshold: props.snapThreshold ?? DEFAULT_CONFIG.snapThreshold,
      snapToGrid: props.snapToGrid ?? DEFAULT_CONFIG.snapToGrid,
      snapToComponents: props.snapToComponents ?? DEFAULT_CONFIG.snapToComponents,
    });
  }, [snapEngine, props.components, props.activeComponentId, props.gridSize, props.snapThreshold, props.snapToGrid, props.snapToComponents]);

  const calculateSnapPosition = useCallback((
    position: { x: number; y: number },
    dimensions?: { width: number; height: number }
  ): SnapResult => {
    if (!props.enabled) {
      return {
        position,
        snappedTo: [],
        guides: [],
        hasSnapped: false,
      };
    }
    return snapEngine.calculateSnapPosition(position, dimensions);
  }, [snapEngine, props.enabled]);

  const calculateSnapTargets = useCallback((
    position: { x: number; y: number },
    dimensions?: { width: number; height: number }
  ): SnapTarget[] => {
    if (!props.enabled) return [];
    return snapEngine.calculateSnapTargets(position, dimensions);
  }, [snapEngine, props.enabled]);

  return {
    calculateSnapPosition,
    calculateSnapTargets,
    getSnapThreshold: () => snapEngine.getSnapThreshold(),
    isEnabled: () => snapEngine.isEnabled() && (props.enabled ?? true),
  };
};

export default SnapEngine;
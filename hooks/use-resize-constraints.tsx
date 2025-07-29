"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ResizeConstraints, Dimensions, ResizeDelta } from '@/components/PrecisionResizeHandle';
import { 
  applyResizeConstraints, 
  ConstraintValidationResult,
  createDefaultConstraints 
} from '@/lib/resize-constraints';

interface UseResizeConstraintsOptions {
  initialDimensions: Dimensions;
  constraints?: Partial<ResizeConstraints>;
  componentType?: string;
  onResize?: (dimensions: Dimensions, violations: any[]) => void;
  onResizeEnd?: (dimensions: Dimensions) => void;
}

interface ModifierKeys {
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
}

export function useResizeConstraints({
  initialDimensions,
  constraints: customConstraints,
  componentType,
  onResize,
  onResizeEnd,
}: UseResizeConstraintsOptions) {
  const [currentDimensions, setCurrentDimensions] = useState<Dimensions>(initialDimensions);
  const [modifierKeys, setModifierKeys] = useState<ModifierKeys>({
    shift: false,
    alt: false,
    ctrl: false,
    meta: false,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [violations, setViolations] = useState<any[]>([]);
  
  const originalDimensionsRef = useRef<Dimensions>(initialDimensions);
  const constraintsRef = useRef<ResizeConstraints>(
    createDefaultConstraints(componentType, customConstraints)
  );

  // Update constraints when props change
  useEffect(() => {
    constraintsRef.current = createDefaultConstraints(componentType, customConstraints);
  }, [componentType, customConstraints]);

  // Update original dimensions when initialDimensions change
  useEffect(() => {
    if (!isResizing) {
      originalDimensionsRef.current = initialDimensions;
      setCurrentDimensions(initialDimensions);
    }
  }, [initialDimensions, isResizing]);

  // Keyboard event handlers for modifier keys
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setModifierKeys(prev => ({
      ...prev,
      shift: event.shiftKey,
      alt: event.altKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setModifierKeys(prev => ({
      ...prev,
      shift: event.shiftKey,
      alt: event.altKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    }));
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isResizing, handleKeyDown, handleKeyUp]);

  const startResize = useCallback(() => {
    setIsResizing(true);
    originalDimensionsRef.current = currentDimensions;
  }, [currentDimensions]);

  const applyResize = useCallback((delta: ResizeDelta) => {
    const result: ConstraintValidationResult = applyResizeConstraints(
      originalDimensionsRef.current,
      delta,
      constraintsRef.current,
      modifierKeys
    );

    setCurrentDimensions(result.adjustedDimensions);
    setViolations(result.violations);
    
    onResize?.(result.adjustedDimensions, result.violations);
  }, [modifierKeys, onResize]);

  const endResize = useCallback(() => {
    setIsResizing(false);
    setViolations([]);
    onResizeEnd?.(currentDimensions);
  }, [currentDimensions, onResizeEnd]);

  const resetResize = useCallback(() => {
    setCurrentDimensions(originalDimensionsRef.current);
    setViolations([]);
    setIsResizing(false);
  }, []);

  return {
    currentDimensions,
    modifierKeys,
    isResizing,
    violations,
    constraints: constraintsRef.current,
    startResize,
    applyResize,
    endResize,
    resetResize,
  };
}
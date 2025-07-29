import { ResizeDelta, ResizeConstraints, Dimensions } from '@/components/PrecisionResizeHandle';

export interface ResizeState {
  originalDimensions: Dimensions;
  currentDimensions: Dimensions;
  modifierKeys: {
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
  };
}

export interface ConstraintValidationResult {
  isValid: boolean;
  adjustedDimensions: Dimensions;
  violations: ConstraintViolation[];
}

export interface ConstraintViolation {
  type: 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight' | 'aspectRatio';
  message: string;
  suggestedValue: number;
}

/**
 * Applies resize constraints and validates the resulting dimensions
 */
export function applyResizeConstraints(
  originalDimensions: Dimensions,
  delta: ResizeDelta,
  constraints: ResizeConstraints,
  modifierKeys: { shift: boolean; alt: boolean; ctrl: boolean; meta: boolean } = {
    shift: false,
    alt: false,
    ctrl: false,
    meta: false,
  }
): ConstraintValidationResult {
  let newDimensions: Dimensions = {
    x: originalDimensions.x + delta.dx,
    y: originalDimensions.y + delta.dy,
    width: originalDimensions.width + delta.dw,
    height: originalDimensions.height + delta.dh,
  };

  const violations: ConstraintViolation[] = [];

  // Apply aspect ratio preservation if shift key is held or constraint is set
  if (modifierKeys.shift || constraints.aspectRatio) {
    const aspectRatio = constraints.aspectRatio || (originalDimensions.width / originalDimensions.height);
    newDimensions = preserveAspectRatio(newDimensions, originalDimensions, aspectRatio, delta);
  }

  // Apply center-point resizing if alt/option key is held
  if (modifierKeys.alt) {
    newDimensions = applyCenterPointResize(newDimensions, originalDimensions, delta);
  }

  // Apply minimum dimension constraints
  if (newDimensions.width < constraints.minWidth) {
    violations.push({
      type: 'minWidth',
      message: `Width cannot be less than ${constraints.minWidth}px`,
      suggestedValue: constraints.minWidth,
    });
    newDimensions.width = constraints.minWidth;
    
    // Adjust position if resizing from left edge
    if (delta.dx !== 0) {
      newDimensions.x = originalDimensions.x + originalDimensions.width - constraints.minWidth;
    }
  }

  if (newDimensions.height < constraints.minHeight) {
    violations.push({
      type: 'minHeight',
      message: `Height cannot be less than ${constraints.minHeight}px`,
      suggestedValue: constraints.minHeight,
    });
    newDimensions.height = constraints.minHeight;
    
    // Adjust position if resizing from top edge
    if (delta.dy !== 0) {
      newDimensions.y = originalDimensions.y + originalDimensions.height - constraints.minHeight;
    }
  }

  // Apply maximum dimension constraints
  if (constraints.maxWidth && newDimensions.width > constraints.maxWidth) {
    violations.push({
      type: 'maxWidth',
      message: `Width cannot exceed ${constraints.maxWidth}px`,
      suggestedValue: constraints.maxWidth,
    });
    newDimensions.width = constraints.maxWidth;
    
    // Adjust position if resizing from left edge
    if (delta.dx !== 0) {
      newDimensions.x = originalDimensions.x + originalDimensions.width - constraints.maxWidth;
    }
  }

  if (constraints.maxHeight && newDimensions.height > constraints.maxHeight) {
    violations.push({
      type: 'maxHeight',
      message: `Height cannot exceed ${constraints.maxHeight}px`,
      suggestedValue: constraints.maxHeight,
    });
    newDimensions.height = constraints.maxHeight;
    
    // Adjust position if resizing from top edge
    if (delta.dy !== 0) {
      newDimensions.y = originalDimensions.y + originalDimensions.height - constraints.maxHeight;
    }
  }

  // Apply snap-to-grid if enabled
  if (constraints.snapToGrid && constraints.gridSize) {
    newDimensions = applyGridSnapping(newDimensions, constraints.gridSize);
  }

  return {
    isValid: violations.length === 0,
    adjustedDimensions: newDimensions,
    violations,
  };
}

/**
 * Preserves aspect ratio during resize operations
 */
function preserveAspectRatio(
  newDimensions: Dimensions,
  originalDimensions: Dimensions,
  aspectRatio: number,
  delta: ResizeDelta
): Dimensions {
  const result = { ...newDimensions };

  // Determine which dimension should drive the aspect ratio
  const widthChange = Math.abs(delta.dw);
  const heightChange = Math.abs(delta.dh);

  if (widthChange >= heightChange) {
    // Width is driving - adjust height
    result.height = result.width / aspectRatio;
    
    // Adjust Y position if resizing from top
    if (delta.dy !== 0) {
      result.y = originalDimensions.y + originalDimensions.height - result.height;
    }
  } else {
    // Height is driving - adjust width
    result.width = result.height * aspectRatio;
    
    // Adjust X position if resizing from left
    if (delta.dx !== 0) {
      result.x = originalDimensions.x + originalDimensions.width - result.width;
    }
  }

  return result;
}

/**
 * Applies center-point resizing (resize from center)
 */
function applyCenterPointResize(
  newDimensions: Dimensions,
  originalDimensions: Dimensions,
  delta: ResizeDelta
): Dimensions {
  const centerX = originalDimensions.x + originalDimensions.width / 2;
  const centerY = originalDimensions.y + originalDimensions.height / 2;

  return {
    ...newDimensions,
    x: centerX - newDimensions.width / 2,
    y: centerY - newDimensions.height / 2,
  };
}

/**
 * Applies grid snapping to dimensions and position
 */
function applyGridSnapping(dimensions: Dimensions, gridSize: number): Dimensions {
  return {
    x: Math.round(dimensions.x / gridSize) * gridSize,
    y: Math.round(dimensions.y / gridSize) * gridSize,
    width: Math.round(dimensions.width / gridSize) * gridSize,
    height: Math.round(dimensions.height / gridSize) * gridSize,
  };
}

/**
 * Calculates the optimal aspect ratio for a component
 */
export function calculateAspectRatio(dimensions: Dimensions): number {
  return dimensions.width / dimensions.height;
}

/**
 * Creates default resize constraints for a component
 */
export function createDefaultConstraints(
  componentType?: string,
  customConstraints?: Partial<ResizeConstraints>
): ResizeConstraints {
  const defaults: ResizeConstraints = {
    minWidth: 20,
    minHeight: 20,
    snapToGrid: true,
    gridSize: 1,
  };

  // Component-specific defaults
  switch (componentType) {
    case 'button':
      defaults.minWidth = 60;
      defaults.minHeight = 32;
      break;
    case 'text':
      defaults.minWidth = 50;
      defaults.minHeight = 20;
      break;
    case 'image':
      defaults.minWidth = 50;
      defaults.minHeight = 50;
      break;
    default:
      break;
  }

  return { ...defaults, ...customConstraints };
}

/**
 * Validates if a resize operation is allowed
 */
export function validateResizeOperation(
  originalDimensions: Dimensions,
  newDimensions: Dimensions,
  constraints: ResizeConstraints
): boolean {
  if (newDimensions.width < constraints.minWidth) return false;
  if (newDimensions.height < constraints.minHeight) return false;
  if (constraints.maxWidth && newDimensions.width > constraints.maxWidth) return false;
  if (constraints.maxHeight && newDimensions.height > constraints.maxHeight) return false;
  
  return true;
}
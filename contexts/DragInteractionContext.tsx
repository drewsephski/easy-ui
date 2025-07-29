'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { throttle, debounce } from 'lodash';
import { ComponentData } from './TemplateBuilderContext';

// Types for drag state management
interface DragState {
  isDragging: boolean;
  dragType: 'component' | 'existing-component' | 'multi-component' | null;
  draggedItem: any;
  draggedComponents: ComponentData[];
  dragStartPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  dragOffset: { x: number; y: number } | null;
  isValidDrop: boolean;
  snapEnabled: boolean;
  gridSize: number;
  performanceMode: 'high-quality' | 'performance' | 'auto';
  dragGesture: 'move' | 'copy' | 'link' | null;
  errorState: DragError | null;
  dragHistory: DragHistoryEntry[];
}

interface DragError {
  type: 'drag-failed' | 'drop-failed' | 'performance-degraded' | 'invalid-operation';
  message: string;
  timestamp: Date;
  recoveryAction?: () => void;
}

interface DragHistoryEntry {
  action: 'start' | 'move' | 'end' | 'cancel' | 'error';
  timestamp: Date;
  position?: { x: number; y: number };
  data?: any;
}

interface DragPerformanceMetrics {
  frameRate: number;
  dragDuration: number;
  eventCount: number;
  lastFrameTime: number;
}

// Action types for drag state reducer
type DragAction =
  | { type: 'START_DRAG'; payload: { dragType: DragState['dragType']; item: any; position: { x: number; y: number }; components?: ComponentData[] } }
  | { type: 'UPDATE_POSITION'; payload: { position: { x: number; y: number } } }
  | { type: 'UPDATE_DRAG_GESTURE'; payload: { gesture: DragState['dragGesture'] } }
  | { type: 'SET_VALID_DROP'; payload: { isValid: boolean } }
  | { type: 'SET_SNAP_ENABLED'; payload: { enabled: boolean } }
  | { type: 'SET_GRID_SIZE'; payload: { size: number } }
  | { type: 'SET_PERFORMANCE_MODE'; payload: { mode: DragState['performanceMode'] } }
  | { type: 'SET_ERROR'; payload: { error: DragError } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'END_DRAG' }
  | { type: 'CANCEL_DRAG' }
  | { type: 'RESET_STATE' };

// Initial state
const initialDragState: DragState = {
  isDragging: false,
  dragType: null,
  draggedItem: null,
  draggedComponents: [],
  dragStartPosition: null,
  currentPosition: null,
  dragOffset: null,
  isValidDrop: true,
  snapEnabled: true,
  gridSize: 15,
  performanceMode: 'auto',
  dragGesture: null,
  errorState: null,
  dragHistory: []
};

// Drag state reducer
function dragStateReducer(state: DragState, action: DragAction): DragState {
  const addHistoryEntry = (entry: Omit<DragHistoryEntry, 'timestamp'>) => ({
    ...entry,
    timestamp: new Date()
  });

  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        dragType: action.payload.dragType,
        draggedItem: action.payload.item,
        draggedComponents: action.payload.components || [],
        dragStartPosition: action.payload.position,
        currentPosition: action.payload.position,
        dragOffset: { x: 0, y: 0 },
        errorState: null,
        dragHistory: [
          ...state.dragHistory.slice(-9), // Keep last 10 entries
          addHistoryEntry({ action: 'start', position: action.payload.position, data: action.payload.item })
        ]
      };

    case 'UPDATE_POSITION':
      const offset = state.dragStartPosition ? {
        x: action.payload.position.x - state.dragStartPosition.x,
        y: action.payload.position.y - state.dragStartPosition.y
      } : { x: 0, y: 0 };

      return {
        ...state,
        currentPosition: action.payload.position,
        dragOffset: offset,
        dragHistory: [
          ...state.dragHistory.slice(-9),
          addHistoryEntry({ action: 'move', position: action.payload.position })
        ]
      };

    case 'UPDATE_DRAG_GESTURE':
      return {
        ...state,
        dragGesture: action.payload.gesture
      };

    case 'SET_VALID_DROP':
      return {
        ...state,
        isValidDrop: action.payload.isValid
      };

    case 'SET_SNAP_ENABLED':
      return {
        ...state,
        snapEnabled: action.payload.enabled
      };

    case 'SET_GRID_SIZE':
      return {
        ...state,
        gridSize: action.payload.size
      };

    case 'SET_PERFORMANCE_MODE':
      return {
        ...state,
        performanceMode: action.payload.mode
      };

    case 'SET_ERROR':
      return {
        ...state,
        errorState: action.payload.error,
        dragHistory: [
          ...state.dragHistory.slice(-9),
          addHistoryEntry({ action: 'error', data: action.payload.error })
        ]
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errorState: null
      };

    case 'END_DRAG':
      return {
        ...state,
        isDragging: false,
        dragType: null,
        draggedItem: null,
        draggedComponents: [],
        dragStartPosition: null,
        currentPosition: null,
        dragOffset: null,
        dragGesture: null,
        dragHistory: [
          ...state.dragHistory.slice(-9),
          addHistoryEntry({ action: 'end' })
        ]
      };

    case 'CANCEL_DRAG':
      return {
        ...state,
        isDragging: false,
        dragType: null,
        draggedItem: null,
        draggedComponents: [],
        dragStartPosition: null,
        currentPosition: null,
        dragOffset: null,
        dragGesture: null,
        errorState: null,
        dragHistory: [
          ...state.dragHistory.slice(-9),
          addHistoryEntry({ action: 'cancel' })
        ]
      };

    case 'RESET_STATE':
      return initialDragState;

    default:
      return state;
  }
}

// Context interface
interface DragInteractionContextType {
  state: DragState;
  startDrag: (dragType: DragState['dragType'], item: any, position: { x: number; y: number }, components?: ComponentData[]) => void;
  updatePosition: (position: { x: number; y: number }) => void;
  updateDragGesture: (gesture: DragState['dragGesture']) => void;
  setValidDrop: (isValid: boolean) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setPerformanceMode: (mode: DragState['performanceMode']) => void;
  endDrag: () => void;
  cancelDrag: () => void;
  clearError: () => void;
  resetState: () => void;
  getPerformanceMetrics: () => DragPerformanceMetrics;
}

// Create context
const DragInteractionContext = createContext<DragInteractionContextType | undefined>(undefined);

// Performance monitoring
class PerformanceMonitor {
  private frameCount = 0;
  private startTime = 0;
  private lastFrameTime = 0;
  private eventCount = 0;

  start() {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.eventCount = 0;
  }

  recordFrame() {
    this.frameCount++;
    this.lastFrameTime = performance.now();
  }

  recordEvent() {
    this.eventCount++;
  }

  getMetrics(): DragPerformanceMetrics {
    const now = performance.now();
    const duration = now - this.startTime;
    const frameRate = duration > 0 ? (this.frameCount * 1000) / duration : 0;

    return {
      frameRate,
      dragDuration: duration,
      eventCount: this.eventCount,
      lastFrameTime: this.lastFrameTime
    };
  }
}

// Provider component
export const DragInteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dragStateReducer, initialDragState);
  const performanceMonitor = useRef(new PerformanceMonitor());
  const throttledUpdatePosition = useRef<any>(null);
  const debouncedPerformanceCheck = useRef<any>(null);

  // Initialize throttled functions
  useEffect(() => {
    const getThrottleDelay = () => {
      switch (state.performanceMode) {
        case 'high-quality': return 8; // ~120fps
        case 'performance': return 32; // ~30fps
        case 'auto': return 16; // ~60fps
        default: return 16;
      }
    };

    throttledUpdatePosition.current = throttle((position: { x: number; y: number }) => {
      dispatch({ type: 'UPDATE_POSITION', payload: { position } });
      performanceMonitor.current.recordFrame();
    }, getThrottleDelay());

    debouncedPerformanceCheck.current = debounce(() => {
      const metrics = performanceMonitor.current.getMetrics();
      
      if (state.performanceMode === 'auto') {
        if (metrics.frameRate < 30) {
          dispatch({ type: 'SET_PERFORMANCE_MODE', payload: { mode: 'performance' } });
        } else if (metrics.frameRate > 50) {
          dispatch({ type: 'SET_PERFORMANCE_MODE', payload: { mode: 'high-quality' } });
        }
      }
    }, 1000);

    return () => {
      throttledUpdatePosition.current?.cancel();
      debouncedPerformanceCheck.current?.cancel();
    };
  }, [state.performanceMode]);

  // Error recovery mechanism
  const handleError = useCallback((error: Omit<DragError, 'timestamp'>) => {
    const dragError: DragError = {
      ...error,
      timestamp: new Date(),
      recoveryAction: () => {
        dispatch({ type: 'CLEAR_ERROR' });
        if (error.type === 'drag-failed' || error.type === 'drop-failed') {
          dispatch({ type: 'CANCEL_DRAG' });
        }
      }
    };

    dispatch({ type: 'SET_ERROR', payload: { error: dragError } });
  }, []);

  // Context methods
  const startDrag = useCallback((
    dragType: DragState['dragType'], 
    item: any, 
    position: { x: number; y: number },
    components?: ComponentData[]
  ) => {
    try {
      performanceMonitor.current.start();
      dispatch({ 
        type: 'START_DRAG', 
        payload: { dragType, item, position, components } 
      });
    } catch (error) {
      handleError({
        type: 'drag-failed',
        message: `Failed to start drag operation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [handleError]);

  const updatePosition = useCallback((position: { x: number; y: number }) => {
    try {
      performanceMonitor.current.recordEvent();
      throttledUpdatePosition.current?.(position);
      debouncedPerformanceCheck.current?.();
    } catch (error) {
      handleError({
        type: 'performance-degraded',
        message: `Position update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [handleError]);

  const updateDragGesture = useCallback((gesture: DragState['dragGesture']) => {
    dispatch({ type: 'UPDATE_DRAG_GESTURE', payload: { gesture } });
  }, []);

  const setValidDrop = useCallback((isValid: boolean) => {
    dispatch({ type: 'SET_VALID_DROP', payload: { isValid } });
  }, []);

  const setSnapEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_SNAP_ENABLED', payload: { enabled } });
  }, []);

  const setGridSize = useCallback((size: number) => {
    dispatch({ type: 'SET_GRID_SIZE', payload: { size } });
  }, []);

  const setPerformanceMode = useCallback((mode: DragState['performanceMode']) => {
    dispatch({ type: 'SET_PERFORMANCE_MODE', payload: { mode } });
  }, []);

  const endDrag = useCallback(() => {
    try {
      dispatch({ type: 'END_DRAG' });
    } catch (error) {
      handleError({
        type: 'drop-failed',
        message: `Failed to end drag operation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [handleError]);

  const cancelDrag = useCallback(() => {
    dispatch({ type: 'CANCEL_DRAG' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return performanceMonitor.current.getMetrics();
  }, []);

  // Keyboard event handling for drag cancellation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (state.isDragging && event.key === 'Escape') {
        cancelDrag();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isDragging, cancelDrag]);

  // Auto-recovery from error states
  useEffect(() => {
    if (state.errorState && state.errorState.recoveryAction) {
      const timer = setTimeout(() => {
        state.errorState?.recoveryAction?.();
      }, 3000); // Auto-recover after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [state.errorState]);

  const contextValue: DragInteractionContextType = {
    state,
    startDrag,
    updatePosition,
    updateDragGesture,
    setValidDrop,
    setSnapEnabled,
    setGridSize,
    setPerformanceMode,
    endDrag,
    cancelDrag,
    clearError,
    resetState,
    getPerformanceMetrics
  };

  return (
    <DragInteractionContext.Provider value={contextValue}>
      {children}
    </DragInteractionContext.Provider>
  );
};

// Hook to use drag interaction context
export const useDragInteraction = () => {
  const context = useContext(DragInteractionContext);
  if (!context) {
    throw new Error('useDragInteraction must be used within a DragInteractionProvider');
  }
  return context;
};

// Hook for drag gesture recognition
export const useDragGesture = () => {
  const { state, updateDragGesture } = useDragInteraction();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isDragging) return;

      if (event.ctrlKey || event.metaKey) {
        updateDragGesture('copy');
      } else if (event.altKey) {
        updateDragGesture('link');
      } else {
        updateDragGesture('move');
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!state.isDragging) return;

      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        updateDragGesture('move');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isDragging, updateDragGesture]);

  return state.dragGesture;
};
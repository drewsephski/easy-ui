"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

export interface SelectionState {
  selectedComponentIds: string[];
  selectionMode: SelectionMode;
  lastSelectedId: string | null;
  selectionHistory: string[][];
  historyIndex: number;
}

export type SelectionMode = 'single' | 'multi' | 'rectangle';

interface SelectionManagerProps {
  components: ComponentData[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[], mode: SelectionMode) => void;
  selectionMode: SelectionMode;
}

interface SelectionManagerHook {
  selectionState: SelectionState;
  selectComponent: (id: string, shiftKey: boolean, ctrlKey?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;
  undoSelection: () => void;
  redoSelection: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getSelectionBounds: () => BoundingBox | null;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

const MAX_HISTORY_SIZE = 50;

export const useSelectionManager = (
  components: ComponentData[],
  initialSelectedIds: string[] = []
): SelectionManagerHook => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedComponentIds: initialSelectedIds,
    selectionMode: 'single',
    lastSelectedId: initialSelectedIds[0] || null,
    selectionHistory: [initialSelectedIds],
    historyIndex: 0,
  });

  const previousSelectionRef = useRef<string[]>(initialSelectedIds);

  // Add selection to history
  const addToHistory = useCallback((newSelection: string[]) => {
    setSelectionState(prev => {
      // Don't add to history if selection hasn't changed
      if (JSON.stringify(newSelection) === JSON.stringify(prev.selectedComponentIds)) {
        return prev;
      }

      const newHistory = prev.selectionHistory.slice(0, prev.historyIndex + 1);
      newHistory.push([...newSelection]);
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        ...prev,
        selectedComponentIds: [...newSelection],
        selectionHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // Select a single component with optional multi-select behavior
  const selectComponent = useCallback((id: string, shiftKey: boolean = false, ctrlKey: boolean = false) => {
    const component = components.find(c => c.id === id);
    if (!component || component.locked) return;

    setSelectionState(prev => {
      let newSelection: string[];
      let newMode: SelectionMode = 'single';

      if (shiftKey || ctrlKey) {
        // Multi-select behavior
        newMode = 'multi';
        if (prev.selectedComponentIds.includes(id)) {
          // Remove from selection if already selected
          newSelection = prev.selectedComponentIds.filter(selectedId => selectedId !== id);
        } else {
          // Add to selection
          newSelection = [...prev.selectedComponentIds, id];
        }
      } else {
        // Single select behavior
        newSelection = [id];
        newMode = 'single';
      }

      const newState = {
        ...prev,
        selectedComponentIds: newSelection,
        selectionMode: newMode,
        lastSelectedId: id,
      };

      // Add to history
      addToHistory(newSelection);

      return newState;
    });
  }, [components, addToHistory]);

  // Select all visible and unlocked components
  const selectAll = useCallback(() => {
    const selectableComponents = components
      .filter(component => component.visible && !component.locked)
      .map(component => component.id);

    if (selectableComponents.length === 0) return;

    setSelectionState(prev => {
      const newState = {
        ...prev,
        selectedComponentIds: selectableComponents,
        selectionMode: 'multi' as SelectionMode,
        lastSelectedId: selectableComponents[selectableComponents.length - 1],
      };

      addToHistory(selectableComponents);
      return newState;
    });
  }, [components, addToHistory]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectionState(prev => {
      if (prev.selectedComponentIds.length === 0) return prev;

      const newState = {
        ...prev,
        selectedComponentIds: [],
        selectionMode: 'single' as SelectionMode,
        lastSelectedId: null,
      };

      addToHistory([]);
      return newState;
    });
  }, [addToHistory]);

  // Select multiple components at once (used by rectangle selection)
  const selectMultiple = useCallback((ids: string[]) => {
    const validIds = ids.filter(id => {
      const component = components.find(c => c.id === id);
      return component && component.visible && !component.locked;
    });

    if (validIds.length === 0) {
      clearSelection();
      return;
    }

    setSelectionState(prev => {
      const newState = {
        ...prev,
        selectedComponentIds: validIds,
        selectionMode: validIds.length > 1 ? 'multi' as SelectionMode : 'single' as SelectionMode,
        lastSelectedId: validIds[validIds.length - 1],
      };

      addToHistory(validIds);
      return newState;
    });
  }, [components, clearSelection, addToHistory]);

  // Undo selection
  const undoSelection = useCallback(() => {
    setSelectionState(prev => {
      if (prev.historyIndex <= 0) return prev;

      const newIndex = prev.historyIndex - 1;
      const previousSelection = prev.selectionHistory[newIndex];

      return {
        ...prev,
        selectedComponentIds: [...previousSelection],
        historyIndex: newIndex,
        selectionMode: previousSelection.length > 1 ? 'multi' : 'single',
        lastSelectedId: previousSelection[previousSelection.length - 1] || null,
      };
    });
  }, []);

  // Redo selection
  const redoSelection = useCallback(() => {
    setSelectionState(prev => {
      if (prev.historyIndex >= prev.selectionHistory.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;
      const nextSelection = prev.selectionHistory[newIndex];

      return {
        ...prev,
        selectedComponentIds: [...nextSelection],
        historyIndex: newIndex,
        selectionMode: nextSelection.length > 1 ? 'multi' : 'single',
        lastSelectedId: nextSelection[nextSelection.length - 1] || null,
      };
    });
  }, []);

  // Calculate bounding box for selected components
  const getSelectionBounds = useCallback((): BoundingBox | null => {
    if (selectionState.selectedComponentIds.length === 0) return null;

    const selectedComponents = components.filter(c => 
      selectionState.selectedComponentIds.includes(c.id)
    );

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
      x: minX,
      y: minY,
      width,
      height,
      centerX: minX + width / 2,
      centerY: minY + height / 2,
    };
  }, [selectionState.selectedComponentIds, components]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A for select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      
      // Ctrl/Cmd + Z for undo selection
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoSelection();
      }
      
      // Ctrl/Cmd + Shift + Z for redo selection
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redoSelection();
      }
      
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, undoSelection, redoSelection, clearSelection]);

  // Clean up selection when components are removed
  useEffect(() => {
    const validComponentIds = components.map(c => c.id);
    const currentSelection = selectionState.selectedComponentIds;
    const filteredSelection = currentSelection.filter(id => validComponentIds.includes(id));

    if (filteredSelection.length !== currentSelection.length) {
      setSelectionState(prev => ({
        ...prev,
        selectedComponentIds: filteredSelection,
        lastSelectedId: filteredSelection.length > 0 ? filteredSelection[filteredSelection.length - 1] : null,
      }));
    }
  }, [components, selectionState.selectedComponentIds]);

  return {
    selectionState,
    selectComponent,
    selectAll,
    clearSelection,
    selectMultiple,
    undoSelection,
    redoSelection,
    canUndo: selectionState.historyIndex > 0,
    canRedo: selectionState.historyIndex < selectionState.selectionHistory.length - 1,
    getSelectionBounds,
  };
};

// React component wrapper for the selection manager
const SelectionManager: React.FC<SelectionManagerProps> = ({
  components,
  selectedIds,
  onSelectionChange,
  selectionMode,
}) => {
  const {
    selectionState,
    selectComponent,
    selectAll,
    clearSelection,
    selectMultiple,
    undoSelection,
    redoSelection,
    canUndo,
    canRedo,
  } = useSelectionManager(components, selectedIds);

  // Notify parent of selection changes
  useEffect(() => {
    if (JSON.stringify(selectedIds) !== JSON.stringify(selectionState.selectedComponentIds)) {
      onSelectionChange(selectionState.selectedComponentIds, selectionState.selectionMode);
    }
  }, [selectionState.selectedComponentIds, selectionState.selectionMode, selectedIds, onSelectionChange]);

  // This component doesn't render anything - it's just a state manager
  return null;
};

export default SelectionManager;
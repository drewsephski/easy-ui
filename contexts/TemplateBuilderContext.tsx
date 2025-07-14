"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { throttle } from 'lodash';
import { ComponentId } from '@/app/template-builder/component-mapping';

export interface ComponentData {
  id: string;
  content: ComponentId;
  props: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  rotation: number;
}

interface TemplateBuilderContextType {
  components: ComponentData[];
  selectedComponentIds: string[];
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  addComponent: (type: ComponentId, position: { x: number; y: number }) => void;
  updateComponent: (id: string, data: Partial<ComponentData>) => void;
  moveComponent: (id: string, position: { x: number; y: number }) => void;
  resizeComponent: (id: string, size: { width: number; height: number }) => void;
  rotateComponent: (id: string, rotation: number) => void;
  selectComponent: (id: string, shiftKey: boolean) => void;
  clearSelection: () => void;
  deleteComponent: (id: string) => void;
  reorderComponent: (dragId: string, dropId: string) => void;
  moveSelectedComponents: (delta: { x: number; y: number }) => void;
  resizeSelectedComponents: (delta: { dx: number; dy: number; dw: number; dh: number }) => void;
  copyComponent: (id: string) => void;
  pasteComponent: (position: { x: number; y: number }) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

const TemplateBuilderContext = createContext<TemplateBuilderContextType | undefined>(undefined);

export const TemplateBuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<Omit<ComponentData, 'id' | 'x' | 'y' | 'zIndex'> | null>(null);
  const [zoom, setZoom] = useState(1);

  const addComponent = useCallback((type: ComponentId, position: { x: number; y: number }) => {
    setComponents(produce(draft => {
      const newComponent: ComponentData = {
        id: nanoid(),
        content: type,
        props: {},
        x: Math.round(position.x / 15) * 15,
        y: Math.round(position.y / 15) * 15,
        width: 200, // Default width
        height: 100, // Default height
        zIndex: draft.length,
        visible: true,
        locked: false,
        rotation: 0,
      };
      draft.push(newComponent);
    }));
  }, []);

  const updateComponent = useCallback((id: string, data: Partial<ComponentData>) => {
    setComponents(produce(draft => {
      const component = draft.find(c => c.id === id);
      if (component) {
        Object.assign(component, data);
      }
    }));
  }, []);

  const moveComponent = useCallback(throttle((id: string, position: { x: number; y: number }) => {
    setComponents(produce(draft => {
      const component = draft.find(c => c.id === id);
      if (component) {
        component.x = Math.round(position.x / 15) * 15;
        component.y = Math.round(position.y / 15) * 15;
      }
    }));
  }, 16), []);

  const resizeComponent = useCallback(throttle((id: string, size: { width: number; height: number }) => {
    setComponents(produce(draft => {
      const component = draft.find(c => c.id === id);
      if (component) {
        component.width = size.width;
        component.height = size.height;
      }
    }));
  }, 16), []);

  const rotateComponent = useCallback((id: string, rotation: number) => {
    setComponents(produce(draft => {
      const component = draft.find(c => c.id === id);
      if (component) {
        component.rotation = rotation;
      }
    }));
  }, []);

  const reorderComponent = useCallback((dragId: string, dropId: string) => {
    setComponents(produce(draft => {
      const dragIndex = draft.findIndex(c => c.id === dragId);
      const dropIndex = draft.findIndex(c => c.id === dropId);
      if (dragIndex !== -1 && dropIndex !== -1) {
        const [draggedItem] = draft.splice(dragIndex, 1);
        draft.splice(dropIndex, 0, draggedItem);
        draft.forEach((component, index) => {
          component.zIndex = index;
        });
      }
    }));
  }, []);

  const selectComponent = useCallback((id: string, shiftKey: boolean) => {
    setSelectedComponentIds(prevSelected => {
      if (shiftKey) {
        if (prevSelected.includes(id)) {
          return prevSelected.filter(selectedId => selectedId !== id);
        } else {
          return [...prevSelected, id];
        }
      } else {
        return [id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedComponentIds([]);
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents(produce(draft => {
      const index = draft.findIndex(c => c.id === id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    }));
    setSelectedComponentIds(prev => prev.filter(selectedId => selectedId !== id));
  }, []);

  const moveSelectedComponents = useCallback(throttle((delta: { x: number; y: number }) => {
    setComponents(produce(draft => {
      draft.forEach(component => {
        if (selectedComponentIds.includes(component.id)) {
          component.x += delta.x;
          component.y += delta.y;
        }
      });
    }));
  }, 16), [selectedComponentIds]);

  const resizeSelectedComponents = useCallback(throttle((delta: { dx: number; dy: number; dw: number; dh: number }) => {
    setComponents(produce(draft => {
      draft.forEach(component => {
        if (selectedComponentIds.includes(component.id)) {
          component.x += delta.dx;
          component.y += delta.dy;
          component.width += delta.dw;
          component.height += delta.dh;
        }
      });
    }));
  }, 16), [selectedComponentIds]);

  const copyComponent = useCallback((id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const { id: _, x, y, zIndex, ...rest } = component;
      setClipboard(rest);
    }
  }, [components]);

  const pasteComponent = useCallback((position: { x: number; y: number }) => {
    if (clipboard) {
      setComponents(produce(draft => {
        const newComponent: ComponentData = {
          ...clipboard,
          id: nanoid(),
          x: Math.round(position.x / 15) * 15,
          y: Math.round(position.y / 15) * 15,
          zIndex: draft.length,
        };
        draft.push(newComponent);
      }));
    }
  }, [clipboard]);

  const bringToFront = useCallback((id: string) => {
    setComponents(produce(draft => {
      const component = draft.find(c => c.id === id);
      if (component) {
        const maxZIndex = Math.max(...draft.map(c => c.zIndex));
        component.zIndex = maxZIndex + 1;
      }
    }));
  }, []);

  const sendToBack = useCallback((id: string) => {
    setComponents(produce(draft => {
      const component = draft.find(c => c.id === id);
      if (component) {
        const minZIndex = Math.min(...draft.map(c => c.zIndex));
        component.zIndex = minZIndex - 1;
      }
    }));
  }, []);

  return (
    <TemplateBuilderContext.Provider
      value={{
        components,
        selectedComponentIds,
        zoom,
        setZoom,
        addComponent,
        updateComponent,
        moveComponent,
        resizeComponent,
        rotateComponent,
        selectComponent,
        clearSelection,
        deleteComponent,
        reorderComponent,
        moveSelectedComponents,
        resizeSelectedComponents,
        copyComponent,
        pasteComponent,
        bringToFront,
        sendToBack,
      }}
    >
      {children}
    </TemplateBuilderContext.Provider>
  );
};

export const useTemplateBuilder = () => {
  const context = useContext(TemplateBuilderContext);
  if (!context) {
    throw new Error('useTemplateBuilder must be used within a TemplateBuilderProvider');
  }
  return context;
};

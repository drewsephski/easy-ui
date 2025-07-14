"use client";

import React, { useState, useRef, useEffect, FC, useReducer, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import {
  LayoutGrid, Eye, Undo2, Redo2, Grid3X3,
  Square, Layers, Settings, ZoomIn, ZoomOut,
  Sparkles, Type, LucideIcon, Component as ComponentIcon,
  Trash2, Copy, EyeOff, Lock, Unlock, Search, Star, ChevronDown
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { ThemePanel } from './ThemePanel';
import { CustomDragLayer } from '@/components/CustomDragLayer';
import { COMPONENT_MAP as initialComponentMap, ComponentId } from './component-mapping';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// --- INTERFACES ---
interface ComponentProps {
  [key: string]: any;
}

export interface ComponentDefinition {
  component: React.ComponentType<any>;
  displayName: string;
  icon: React.ComponentType<any>;
  defaultProps: any;
  propsSchema: z.ZodType<any, any> | null;
  defaultSize: { width: number; height: number };
  category: string;
  description: string;
  keywords: string[];
  isFavorite: boolean;
}

interface ComponentData {
  id: string;
  type: ComponentId;
  x: number;
  y: number;
  width: number;
  height: number;
  props: ComponentProps;
  style: Record<string, any>;
  rotation: number;
  zIndex: number;
  visible?: boolean;
  locked?: boolean;
}

interface DropItem {
  type: string;
  id?: string; // For existing canvas objects
  x?: number; // Initial x position for drag
  y?: number; // Initial y position for drag
}

// --- UTILITIES & CONSTANTS ---
const GRID_SIZE = 20;

const ItemTypes = {
  COMPONENT: 'component',
  CANVAS_OBJECT: 'canvas_object',
};

const generateId = () => nanoid(10);

// --- STATE MANAGEMENT (Reducer) ---
export interface AppState {
  components: Record<string, ComponentData>;
  orderedComponents: string[];
  selectedIds: string[];
  history: AppState[];
  historyIndex: number;
  view: {
    zoom: number;
    pan: { x: number; y: number };
  };
  isPanning: boolean;
  showGrid: boolean;
  activeTab: string;
  searchTerm: string;
  componentMap: Record<string, ComponentDefinition>;
}

const initialState: AppState = {
  components: {},
  orderedComponents: [],
  selectedIds: [],
  history: [],
  historyIndex: -1,
  view: { zoom: 1, pan: { x: 0, y: 0 } },
  isPanning: false,
  showGrid: true,
  activeTab: 'design',
  searchTerm: '',
  componentMap: initialComponentMap,
};

export type Action =
  | { type: 'ADD_COMPONENT'; payload: { componentType: string; x: number; y: number } }
  | { type: 'MOVE_COMPONENT'; payload: { id: string; x: number; y: number } }
  | { type: 'UPDATE_PROP'; payload: { id: string; propName: string; value: any } }
  | { type: 'SELECT_COMPONENT'; payload: { id: string; shiftKey: boolean } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'DELETE_SELECTED' }
  | { type: 'DELETE_COMPONENT'; payload: string }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'SET_IS_PANNING'; payload: boolean }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'TOGGLE_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_LOCK'; payload: string }
  | { type: 'DUPLICATE_COMPONENT'; payload: string }
  | { type: 'REORDER_COMPONENTS'; payload: { dragId: string; dropId: string } }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

function appReducer(state: AppState, action: Action): AppState {
  return produce(state, draft => {
    switch (action.type) {
      case 'ADD_COMPONENT': {
        const { componentType, x, y } = action.payload;
        const def = draft.componentMap[componentType];
        if (!def) break;

        const newId = generateId();
        const newComponent: ComponentData = {
          id: newId,
          type: componentType,
          x: Math.round(x - def.defaultSize.width / 2),
          y: Math.round(y - def.defaultSize.height / 2),
          width: def.defaultSize.width,
          height: def.defaultSize.height,
          props: { ...def.defaultProps },
          style: {
            display: 'block',
            direction: 'row',
            align: 'start',
            justify: 'start',
            gap: 0,
            gridCols: 2,
            gridRows: 2,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          rotation: 0,
          zIndex: draft.orderedComponents.length,
          visible: true,
          locked: false,
        };
        draft.components[newId] = newComponent;
        draft.orderedComponents.push(newId);
        draft.selectedIds = [newId];
        break;
      }
      case 'MOVE_COMPONENT': {
        const { id, x, y } = action.payload;
        const component = draft.components[id];
        if (component && !component.locked) {
          component.x = x;
          component.y = y;
        }
        break;
      }
      case 'UPDATE_PROP': {
        const { id, propName, value } = action.payload;
        const component = draft.components[id];
        if (component) {
          const keys = propName.split('.');
          let current: any = component;
          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        }
        break;
      }
      case 'SELECT_COMPONENT': {
        const { id, shiftKey } = action.payload;
        if (shiftKey) {
          if (draft.selectedIds.includes(id)) {
            draft.selectedIds = draft.selectedIds.filter(sid => sid !== id);
          } else {
            draft.selectedIds.push(id);
          }
        } else {
          draft.selectedIds = [id];
        }
        break;
      }
      case 'CLEAR_SELECTION':
        draft.selectedIds = [];
        break;
      case 'DELETE_SELECTED':
        draft.selectedIds.forEach(id => {
          delete draft.components[id];
        });
        draft.orderedComponents = draft.orderedComponents.filter(id => !draft.selectedIds.includes(id));
        draft.selectedIds = [];
        break;
      case 'DELETE_COMPONENT': {
        const idToDelete = action.payload;
        delete draft.components[idToDelete];
        draft.orderedComponents = draft.orderedComponents.filter(id => id !== idToDelete);
        draft.selectedIds = draft.selectedIds.filter(id => id !== idToDelete);
        break;
      }
      case 'SET_ZOOM':
        draft.view.zoom = action.payload;
        break;
      case 'SET_PAN':
        draft.view.pan = action.payload;
        break;
      case 'SET_IS_PANNING':
        draft.isPanning = action.payload;
        break;
      case 'TOGGLE_GRID':
        draft.showGrid = !draft.showGrid;
        break;
      case 'SET_ACTIVE_TAB':
        draft.activeTab = action.payload;
        break;
      case 'TOGGLE_VISIBILITY':
        if (draft.components[action.payload]) {
          const comp = draft.components[action.payload];
          comp.visible = !comp.visible;
        }
        break;
      case 'TOGGLE_LOCK':
        if (draft.components[action.payload]) {
          const comp = draft.components[action.payload];
          comp.locked = !comp.locked;
        }
        break;
      case 'DUPLICATE_COMPONENT': {
        const sourceComponent = draft.components[action.payload];
        if (!sourceComponent) break;
        const newId = generateId();
        const newComponent: ComponentData = {
          ...sourceComponent,
          id: newId,
          x: sourceComponent.x + 20,
          y: sourceComponent.y + 20,
          zIndex: draft.orderedComponents.length,
        };
        draft.components[newId] = newComponent;
        draft.orderedComponents.push(newId);
        draft.selectedIds = [newId];
        break;
      }
      case 'REORDER_COMPONENTS': {
        const { dragId, dropId } = action.payload;
        const dragIndex = draft.orderedComponents.indexOf(dragId);
        const dropIndex = draft.orderedComponents.indexOf(dropId);

        if (dragIndex === -1 || dropIndex === -1) break;

        const [draggedItem] = draft.orderedComponents.splice(dragIndex, 1);
        draft.orderedComponents.splice(dropIndex, 0, draggedItem);

        draft.orderedComponents.forEach((id, index) => {
          draft.components[id].zIndex = index;
        });
        break;
      }
      case 'SET_SEARCH_TERM':
        draft.searchTerm = action.payload;
        break;
      case 'TOGGLE_FAVORITE': {
        const component = draft.componentMap[action.payload];
        if (component) {
          component.isFavorite = !component.isFavorite;
        }
        break;
      }
    }
  });
}


// --- UI COMPONENTS ---

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: FC<TooltipProps> = ({ children, text }) => (
  <div className="flex relative items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 z-50 px-3 py-1.5 mb-2 w-max text-xs font-semibold text-neutral-100 bg-neutral-800 rounded-md opacity-0 transition-opacity -translate-x-1/2 pointer-events-none group-hover:opacity-100 shadow-lg border border-neutral-700">
      {text}
    </div>
  </div>
);

interface SidebarComponentProps {
  type: string;
  definition: ComponentDefinition;
  onToggleFavorite: (type: string) => void;
}

const SidebarComponent: FC<SidebarComponentProps> = ({ type, definition, onToggleFavorite }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { id: type, type: ItemTypes.COMPONENT },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  const Comp = definition.component;

  return (
    <div
      ref={drag as any}
      className={cn(
        "relative group flex flex-col justify-center items-center p-2 rounded-lg cursor-move transition-all duration-200 ease-in-out",
        "bg-neutral-900 border border-neutral-800 hover:bg-neutral-800/80 hover:border-indigo-500/50",
        isDragging && "opacity-40 scale-95"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(type);
        }}
        className={cn(
          "absolute top-2 right-2 z-10 p-1 rounded-full transition-colors",
          "text-neutral-500 hover:text-amber-400 bg-neutral-800/50 hover:bg-neutral-700",
          definition.isFavorite && "text-amber-400"
        )}
      >
        <Star size={14} fill={definition.isFavorite ? 'currentColor' : 'none'} />
      </button>
      <div className="flex overflow-hidden justify-center items-center mb-2 w-full h-20 rounded-md bg-neutral-950/50">
        <div className="transform scale-[0.25] origin-center">
          <Comp {...definition.defaultProps} />
        </div>
      </div>
      <div className="w-full text-center">
        <h3 className="text-xs font-medium truncate text-neutral-200">{definition.displayName}</h3>
        <p className="text-xs truncate text-neutral-500">{definition.description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity from-black/20 group-hover:opacity-100" />
    </div>
  );
};

interface CanvasComponentProps {
  id: string;
  component: ComponentData;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  componentMap: Record<string, ComponentDefinition>;
}

const CanvasComponent: FC<CanvasComponentProps> = ({ id, component, isSelected, onSelect, componentMap }) => {
  const Comp = componentMap[component.type].component;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CANVAS_OBJECT,
    item: { id, x: component.x, y: component.y, type: ItemTypes.CANVAS_OBJECT },
    canDrag: !component.locked,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (component.visible === false) {
    return null;
  }

  const dynamicStyles: React.CSSProperties = {};
  const styleProps: (keyof React.CSSProperties)[] = ['backgroundColor', 'color', 'borderColor', 'border'];
  
  if (component.props) {
    for (const prop of styleProps) {
      if (component.props[prop]) {
        dynamicStyles[prop] = component.props[prop];
      }
    }
  }

  return (
    <div
      ref={drag as any}
      className={cn(
        "absolute transition-all duration-150 ease-in-out group",
        {
          'outline-1 outline-dashed outline-neutral-700/50': !isSelected,
          'outline-2 outline-blue-500': isSelected,
          'hover:outline-blue-500/80 hover:outline-1': !isSelected,
          'opacity-40': isDragging,
        },
        component.locked ? 'cursor-not-allowed' : 'cursor-grab'
      )}
      style={{
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        zIndex: component.zIndex,
        transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        ...component.style,
        display: component.style.display,
        flexDirection: component.style.direction,
        alignItems: component.style.align,
        justifyContent: component.style.justify,
        gap: `${component.style.gap}px`,
        gridTemplateColumns: `repeat(${component.style.gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${component.style.gridRows}, 1fr)`,
        margin: `${component.style.margin.top}px ${component.style.margin.right}px ${component.style.margin.bottom}px ${component.style.margin.left}px`,
        padding: `${component.style.padding.top}px ${component.style.padding.right}px ${component.style.padding.bottom}px ${component.style.padding.left}px`,
        ...dynamicStyles,
      }}
      onClick={onSelect}
    >
      <div className="overflow-hidden w-full h-full pointer-events-none">
         <Comp {...component.props} />
      </div>
      {/* Resize handles would be rendered here */}
    </div>
  );
};


// --- MAIN APPLICATION ---
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/CommandPalette";
import { staticCommands, getDynamicCommands } from './commands';

const TemplateBuilderInternal: FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { components, orderedComponents, selectedIds, view, isPanning, showGrid, activeTab, searchTerm, componentMap } = state;
  const { zoom, pan } = view;
  const { generateCssProperties } = useTheme();
  const { isOpen, setIsOpen } = useCommandPalette();

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  });

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = generateCssProperties();
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [generateCssProperties]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // --- Keyboard Shortcuts ---
  useHotkeys('space', () => dispatch({ type: 'SET_IS_PANNING', payload: true }), { keydown: true, preventDefault: true });
  useHotkeys('space', () => dispatch({ type: 'SET_IS_PANNING', payload: false }), { keyup: true });
  useHotkeys('backspace, delete', () => dispatch({ type: 'DELETE_SELECTED' }), [selectedIds]);
  // Additional shortcuts (undo, redo, duplicate) would be added here.

  // --- Canvas Drop Logic ---
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.CANVAS_OBJECT],
    drop: (item: DropItem, monitor) => {
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      const dropPos = monitor.getClientOffset();

      if (!canvasBounds || !dropPos) return;

      const x = (dropPos.x - canvasBounds.left - pan.x) / zoom;
      const y = (dropPos.y - canvasBounds.top - pan.y) / zoom;

      if (item.type === ItemTypes.COMPONENT) { // New component from sidebar
        dispatch({ type: 'ADD_COMPONENT', payload: { componentType: item.id as string, x, y } });
      } else if (item.type === ItemTypes.CANVAS_OBJECT) { // Existing component on canvas
        const initialPos = monitor.getInitialSourceClientOffset();
        const currentPos = monitor.getSourceClientOffset();
        if (!initialPos || !currentPos) return;

        const deltaX = (currentPos.x - initialPos.x) / zoom;
        const deltaY = (currentPos.y - initialPos.y) / zoom;

        dispatch({
          type: 'MOVE_COMPONENT',
          payload: {
            id: item.id as string,
            x: Math.round(item.x! + deltaX),
            y: Math.round(item.y! + deltaY),
          },
        });
      }
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  }), [pan, zoom, dispatch]);

  // --- Pan and Zoom Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) { // Zoom with Ctrl + Scroll
        const newZoom = Math.max(0.1, Math.min(4, zoom - e.deltaY * 0.001));
        dispatch({ type: 'SET_ZOOM', payload: newZoom });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.buttons === 4 || isPanning) { // Pan with Middle Mouse or Space
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        dispatch({ type: 'SET_IS_PANNING', payload: true });
      } else if ((e.target as HTMLElement).closest('.canvas-bg')) {
        dispatch({ type: 'CLEAR_SELECTION' });
      }
    }

    const handleMouseUp = () => {
      if (isPanning) {
        dispatch({ type: 'SET_IS_PANNING', payload: false });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if(isPanning) {
        const x = e.clientX - panStartRef.current.x;
        const y = e.clientY - panStartRef.current.y;
        dispatch({ type: 'SET_PAN', payload: { x, y } });
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [zoom, pan, isPanning, dispatch]);

  // --- Global Cursor for Panning ---
  useEffect(() => {
    if (isPanning) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isPanning]);

  const handleSelect = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_COMPONENT', payload: { id, shiftKey: e.shiftKey } });
  }, [dispatch]);

  const handlePropChange = useCallback((id: string, propName: string, value: any) => {
    dispatch({ type: 'UPDATE_PROP', payload: { id, propName, value } });
  }, [dispatch]);

  const renderedComponents = orderedComponents.map(id => components[id]);
  const selectedComponent = selectedIds.length === 1 ? components[selectedIds[0]] : null;

  // --- Layers Panel Handlers ---
  const handleLayerSelect = useCallback((id: string, shiftKey: boolean) => {
    dispatch({ type: 'SELECT_COMPONENT', payload: { id, shiftKey } });
  }, [dispatch]);

  const handleLayerVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', payload: id });
  }, [dispatch]);

  const handleLayerLock = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_LOCK', payload: id });
  }, [dispatch]);

  const handleLayerDuplicate = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_COMPONENT', payload: id });
  }, [dispatch]);

  const handleLayerDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_COMPONENT', payload: id });
  }, [dispatch]);

  const handleLayerOrderChange = useCallback((dragId: string, dropId: string) => {
    dispatch({ type: 'REORDER_COMPONENTS', payload: { dragId, dropId } });
  }, [dispatch]);


  const allCommands = [...staticCommands, ...getDynamicCommands(state)];

  return (
    <div className="flex overflow-hidden w-full h-screen font-sans text-foreground bg-background">
      <CustomDragLayer />
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {allCommands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => {
                  command.action(dispatch, state);
                  setIsOpen(false);
                }}
              >
                {command.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {/* Left Sidebar */}
      <aside className="flex flex-col w-80 border-r bg-sidebar-background border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="flex items-center text-base font-semibold"><ComponentIcon size={18} className="mr-2 text-blue-400"/> Components</h2>
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
              className="py-2 pr-3 pl-9 w-full text-sm rounded-md border transition-colors bg-input border-border focus:bg-background focus:border-ring focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          <ComponentLibrary
            componentMap={componentMap}
            searchTerm={searchTerm}
            onToggleFavorite={(type) => dispatch({ type: 'TOGGLE_FAVORITE', payload: type })}
          />
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex overflow-hidden flex-col flex-1">
        {/* Top Toolbar */}
        <header className="flex z-10 flex-shrink-0 justify-between items-center px-4 h-14 border-b bg-sidebar-background border-sidebar-border">
          <div className="flex gap-2 items-center">
            <div className="flex items-center">
              <Tooltip text="Undo (Cmd+Z)">
                <button className="p-2 rounded-md transition-colors hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"><Undo2 size={18}/></button>
              </Tooltip>
              <Tooltip text="Redo (Cmd+Shift+Z)">
                <button className="p-2 rounded-md transition-colors hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"><Redo2 size={18}/></button>
              </Tooltip>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center">
              <Tooltip text="Delete (Backspace)">
                <button onClick={() => dispatch({ type: 'DELETE_SELECTED' })} disabled={selectedIds.length === 0} className="p-2 rounded-md transition-colors hover:bg-red-500/20 text-muted-foreground hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={18}/></button>
              </Tooltip>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Tooltip text="Toggle Grid">
                <button onClick={() => dispatch({ type: 'TOGGLE_GRID' })} className={`p-2 rounded-md transition-colors ${showGrid ? 'text-blue-400 bg-blue-500/20' : 'text-muted-foreground hover:bg-neutral-800 hover:text-foreground'}`}>
                    <Grid3X3 size={18}/>
                </button>
            </Tooltip>
            <div className="flex items-center p-1 rounded-md bg-input">
               <Tooltip text="Zoom Out">
                  <button onClick={() => dispatch({ type: 'SET_ZOOM', payload: Math.max(0.1, zoom - 0.1) })} className="p-1.5 rounded transition-colors text-muted-foreground hover:bg-neutral-700 hover:text-foreground"><ZoomOut size={16}/></button>
               </Tooltip>
               <span className="w-16 text-sm font-medium text-center cursor-pointer text-foreground" onClick={() => dispatch({ type: 'SET_ZOOM', payload: 1 })}>{Math.round(zoom * 100)}%</span>
               <Tooltip text="Zoom In">
                  <button onClick={() => dispatch({ type: 'SET_ZOOM', payload: Math.min(4, zoom + 0.1) })} className="p-1.5 rounded transition-colors text-muted-foreground hover:bg-neutral-700 hover:text-foreground"><ZoomIn size={16}/></button>
               </Tooltip>
            </div>
          </div>
        </header>

        {/* Canvas */}
        <div ref={canvasRef} className="overflow-hidden relative flex-1 min-h-0 bg-background" style={{ cursor: isPanning ? 'grabbing' : 'default' }}>
          <div
            ref={drop as any}
            className="absolute top-0 left-0 w-full h-full canvas-bg"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              backgroundColor: isOver ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
              transition: 'background-color 150ms ease',
            }}
          >
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
                backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
              }} />
            )}
            {renderedComponents.map(comp => (
              <CanvasComponent
                key={comp.id}
                id={comp.id}
                component={comp}
                isSelected={selectedIds.includes(comp.id)}
                onSelect={(e) => handleSelect(e, comp.id)}
                componentMap={componentMap}
               />
             ))}
           </div>
         </div>
       </main>

       {/* Right Sidebar */}
       <aside className="flex flex-col w-72 border-l bg-sidebar-background border-sidebar-border">
          <div className="p-2 border-b border-sidebar-border">
            <div className="flex p-1 space-x-1 rounded-lg bg-input">
              <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'design' })} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'design' ? 'bg-neutral-700 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-neutral-700/50 hover:text-foreground'}`}>Design</button>
              <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'theme' })} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'theme' ? 'bg-neutral-700 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-neutral-700/50 hover:text-foreground'}`}>Theme</button>
              <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'layers' })} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'layers' ? 'bg-neutral-700 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-neutral-700/50 hover:text-foreground'}`}>Layers</button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {activeTab === 'design' && (
             <div className="p-4 h-full">
               {selectedComponent ? (
                 <PropertiesPanel
                   key={selectedComponent.id}
                   selectedComponent={{
                     id: selectedComponent.id,
                     props: selectedComponent.props,
                     type: selectedComponent.type,
                     style: selectedComponent.style,
                   }}
                   propsDefinition={componentMap[selectedComponent.type]?.propsSchema || undefined}
                   handlePropChange={handlePropChange}
                   onClear={() => dispatch({ type: 'CLEAR_SELECTION' })}
                 />
               ) : selectedIds.length > 1 ? (
                 <div className="flex flex-col justify-center items-center h-full text-center text-neutral-500">
                   <Layers size={32} className="mb-3 text-neutral-600" />
                   <p className="font-semibold text-neutral-400">{selectedIds.length} items selected</p>
                   <p className="text-xs text-neutral-500">Edit shared properties.</p>
                 </div>
               ) : (
                 <div className="flex flex-col justify-center items-center h-full text-center text-neutral-500">
                   <Settings size={32} className="mb-3 text-neutral-600" />
                   <p className="font-semibold text-neutral-400">Properties</p>
                   <p className="text-xs text-neutral-500">Select a layer to edit.</p>
                 </div>
               )}
             </div>
           )}
           {activeTab === 'theme' && (
             <ThemePanel />
           )}
            {activeTab === 'layers' && (
              <LayersPanel
                components={renderedComponents}
                selectedIds={selectedIds}
                onSelect={handleLayerSelect}
                onVisibilityToggle={handleLayerVisibility}
                onLockToggle={handleLayerLock}
                onDuplicate={handleLayerDuplicate}
                onDelete={handleLayerDelete}
                onReorder={handleLayerOrderChange}
              />
            )}
          </div>
       </aside>

     </div>
  );
};

const TemplateBuilder: FC = () => (
  <ThemeProvider>
    <TemplateBuilderInternal />
  </ThemeProvider>
);

interface ComponentLibraryProps {
  componentMap: Record<string, ComponentDefinition>;
  searchTerm: string;
  onToggleFavorite: (type: string) => void;
}

const ComponentLibrary: FC<ComponentLibraryProps> = ({ componentMap, searchTerm, onToggleFavorite }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'Favorites': true });

  const filteredComponents = Object.entries(componentMap).filter(([_, def]) => {
    const term = searchTerm.toLowerCase();
    return (
      def.displayName.toLowerCase().includes(term) ||
      def.description.toLowerCase().includes(term) ||
      def.keywords.some(k => k.toLowerCase().includes(term))
    );
  });

  const favorites = filteredComponents.filter(([_, def]) => def.isFavorite);

  const categories = filteredComponents.reduce((acc, [type, def]) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push([type, def] as [string, ComponentDefinition]);
    return acc;
  }, {} as Record<string, [string, ComponentDefinition][]>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="space-y-2">
      {favorites.length > 0 && (
        <CollapsibleSection title="Favorites" count={favorites.length} isOpen={openCategories['Favorites']} onToggle={() => toggleCategory('Favorites')}>
          {favorites.map(([type, def]) => (
            <SidebarComponent key={type} type={type} definition={def} onToggleFavorite={onToggleFavorite} />
          ))}
        </CollapsibleSection>
      )}
      {Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
        <CollapsibleSection key={category} title={category} count={items.length} isOpen={openCategories[category] ?? false} onToggle={() => toggleCategory(category)}>
          {items.map(([type, def]) => (
            <SidebarComponent key={type} type={type} definition={def} onToggleFavorite={onToggleFavorite} />
          ))}
        </CollapsibleSection>
      ))}
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: FC<CollapsibleSectionProps> = ({ title, count, isOpen, onToggle, children }) => {
  return (
    <div>
      <button onClick={onToggle} className="flex justify-between items-center px-2 py-2 w-full text-sm font-semibold text-left rounded-md transition-colors text-neutral-300 hover:bg-neutral-800">
        <span>{title}</span>
        <div className="flex gap-2 items-center">
          <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-700 text-neutral-400">{count}</span>
          <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>
      {isOpen && (
        <div className="grid grid-cols-2 gap-2 p-2 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;

"use client";

import React, { useState, useRef, useEffect, FC, useCallback } from 'react';
import { useDrag, useDrop, DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  LayoutGrid, Eye, Undo2, Redo2, Grid3X3,
  Square, Layers, Settings, ZoomIn, ZoomOut,
  Sparkles, Type, LucideIcon, Component as ComponentIcon,
  Trash2, Copy, EyeOff, Lock, Unlock, Search, Star, ChevronDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { ThemePanel } from './ThemePanel';
import { COMPONENT_MAP as initialComponentMap, ComponentId } from './component-mapping';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';
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
import { TemplateBuilderProvider, useTemplateBuilder, ComponentData } from '@/contexts/TemplateBuilderContext';
import ResizableDraggableComponent from '@/components/ResizableDraggableComponent';
import { CustomDragLayer } from '@/components/CustomDragLayer';
import SmartGuides from '@/components/SmartGuides';
import ContextMenu from '@/components/ContextMenu';

// --- INTERFACES ---
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

interface DropItem {
  type: string;
  id?: string;
  x?: number;
  y?: number;
}

export interface AppState {
  view: {
    zoom: number;
    pan: { x: number; y: number };
  };
  selectedIds: string[];
}

export type Action =
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'DELETE_SELECTED' }
  | { type: 'DUPLICATE_COMPONENT'; payload: string }
  | { type: 'ADD_COMPONENT'; payload: { componentType: string; x: number; y: number } };

// --- UTILITIES & CONSTANTS ---
const GRID_SIZE = 15;
const ItemTypes = {
  COMPONENT: 'component',
  CANVAS_OBJECT: 'canvas_object',
};

// --- UI COMPONENTS ---
const Tooltip: FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => (
  <div className="flex relative items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 z-50 px-3 py-1.5 mb-2 w-max text-xs font-semibold text-white bg-neutral-800 rounded-md shadow-lg opacity-0 transition-opacity -translate-x-1/2 pointer-events-none group-hover:opacity-100 border border-neutral-700">
      {text}
    </div>
  </div>
);

const SidebarComponent: FC<{ type: string; definition: ComponentDefinition; onToggleFavorite: (type: string) => void; }> = ({ type, definition, onToggleFavorite }) => {
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
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(type); }}
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

// --- MAIN APPLICATION ---
const TemplateBuilderInternal: FC = () => {
  const {
    components,
    selectedComponentIds,
    addComponent,
    moveComponent,
    selectComponent,
    clearSelection,
    deleteComponent,
    updateComponent, // Assuming this will be needed for props, visibility, etc.
    reorderComponent,
    copyComponent,
    pasteComponent,
    bringToFront,
    sendToBack,
    zoom,
    setZoom,
  } = useTemplateBuilder();
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const [searchTerm, setSearchTerm] = useState('');
  const [componentMap, setComponentMap] = useState(initialComponentMap);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([]);
  const [verticalGuides, setVerticalGuides] = useState<number[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string; } | null>(null);

  const { generateCssProperties } = useTheme();
  const { isOpen, setIsOpen } = useCommandPalette();

  useHotkeys("mod+k", (e) => { e.preventDefault(); setIsOpen(!isOpen); });
  useHotkeys('backspace, delete', () => {
    if (selectedComponentIds.length > 0) {
      selectedComponentIds.forEach(id => deleteComponent(id));
    }
  }, [selectedComponentIds, deleteComponent]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = generateCssProperties();
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, [generateCssProperties]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.CANVAS_OBJECT],
    drop: (item: DropItem, monitor) => {
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      const dropPos = monitor.getClientOffset();
      if (!canvasBounds || !dropPos) return;

      const x = (dropPos.x - canvasBounds.left - pan.x) / zoom;
      const y = (dropPos.y - canvasBounds.top - pan.y) / zoom;

      if (item.type === ItemTypes.COMPONENT) {
        addComponent(item.id as ComponentId, { x, y });
      } else if (item.type === ItemTypes.CANVAS_OBJECT) {
        const initialPos = monitor.getInitialSourceClientOffset();
        const currentPos = monitor.getSourceClientOffset();
        if (!initialPos || !currentPos) return;

        const deltaX = (currentPos.x - initialPos.x) / zoom;
        const deltaY = (currentPos.y - initialPos.y) / zoom;

        moveComponent(item.id as string, {
          x: item.x! + deltaX,
          y: item.y! + deltaY,
        });
      }
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  }), [pan, zoom, addComponent, moveComponent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        const newZoom = Math.max(0.1, Math.min(4, zoom - e.deltaY * 0.001));
        setZoom(newZoom);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.buttons === 4 || (e.buttons === 1 && e.altKey)) {
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        setIsPanning(true);
      } else if ((e.target as HTMLElement).closest('.canvas-bg')) {
        clearSelection();
      }
    };
    const handleMouseUp = () => setIsPanning(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
      }
    };

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
  }, [zoom, pan, isPanning, clearSelection]);

  useEffect(() => {
    document.body.style.cursor = isPanning ? 'grabbing' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [isPanning]);

  const handleSelect = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    selectComponent(id, e.shiftKey);
  }, [selectComponent]);

  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    selectComponent(componentId, false);
    setContextMenu({ x: e.clientX, y: e.clientY, componentId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handlePropChange = useCallback((id: string, propName: string, value: any) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const newProps = { ...component.props, [propName]: value };
      updateComponent(id, { props: newProps });
    }
  }, [components, updateComponent]);

  const selectedComponent = selectedComponentIds.length === 1 ? components.find(c => c.id === selectedComponentIds[0]) || null : null;

  const handleLayerVisibility = useCallback((id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      updateComponent(id, { visible: !component.visible });
    }
  }, [components, updateComponent]);

  const handleLayerLock = useCallback((id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      updateComponent(id, { locked: !component.locked });
    }
  }, [components, updateComponent]);

  const handleLayerDuplicate = useCallback((id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      addComponent(component.content as ComponentId, { x: component.x + 20, y: component.y + 20 });
    }
  }, [components, addComponent]);

  const handleToggleFavorite = useCallback((type: string) => {
    setComponentMap(prevMap => {
      const newMap = { ...prevMap };
      if (newMap[type]) {
        newMap[type] = { ...newMap[type], isFavorite: !newMap[type].isFavorite };
      }
      return newMap;
    });
  }, []);

  return (
    <div className="flex overflow-hidden w-full h-screen font-sans text-foreground bg-background">
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {/* Command items can be added here later */}
        </CommandList>
      </CommandDialog>

      {/* Left Sidebar */}
      <aside className={cn("flex flex-col border-r transition-all duration-300 bg-sidebar-background border-sidebar-border", isLeftSidebarCollapsed ? "w-0" : "w-80")}>
        <div className={cn("p-4 border-b border-sidebar-border", isLeftSidebarCollapsed ? "hidden" : "block")}>
          <h2 className="flex items-center text-base font-semibold"><ComponentIcon size={18} className="mr-2 text-blue-400"/> Components</h2>
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pr-3 pl-9 w-full text-sm rounded-md border transition-colors bg-input border-border focus:bg-background focus:border-ring focus:outline-none"
            />
          </div>
        </div>
        <div className={cn("overflow-y-auto flex-1 p-2", isLeftSidebarCollapsed ? "hidden" : "block")}>
          <ComponentLibrary
            componentMap={componentMap}
            searchTerm={searchTerm}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex overflow-hidden relative flex-col flex-1">
        <button
          onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className="flex absolute left-0 top-1/2 z-10 justify-center items-center w-6 h-24 rounded-r-lg transition-all -translate-y-1/2 bg-neutral-800/50 hover:bg-neutral-700/80"
        >
          {isLeftSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <header className="flex z-10 flex-shrink-0 justify-between items-center px-4 h-14 border-b bg-sidebar-background border-sidebar-border">
          <div className="flex gap-2 items-center">
            <Tooltip text="Undo (Cmd+Z)">
              <button className="p-2 rounded-md transition-colors hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"><Undo2 size={18}/></button>
            </Tooltip>
            <Tooltip text="Redo (Cmd+Shift+Z)">
              <button className="p-2 rounded-md transition-colors hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"><Redo2 size={18}/></button>
            </Tooltip>
            <div className="w-px h-6 bg-border" />
            <Tooltip text="Delete (Backspace)">
              <button onClick={() => selectedComponentIds.forEach(id => deleteComponent(id))} disabled={selectedComponentIds.length === 0} className="p-2 rounded-md transition-colors hover:bg-red-500/20 text-muted-foreground hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={18}/></button>
            </Tooltip>
          </div>
          <div className="flex gap-4 items-center">
            <Tooltip text="Toggle Grid">
              <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-md transition-colors ${showGrid ? 'text-blue-400 bg-blue-500/20' : 'text-muted-foreground hover:bg-neutral-800 hover:text-foreground'}`}>
                <Grid3X3 size={18}/>
              </button>
            </Tooltip>
            <div className="flex items-center p-1 rounded-md bg-input">
              <Tooltip text="Zoom Out">
                <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 rounded transition-colors text-muted-foreground hover:bg-neutral-700 hover:text-foreground"><ZoomOut size={16}/></button>
              </Tooltip>
              <span className="w-16 text-sm font-medium text-center cursor-pointer text-foreground" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</span>
              <Tooltip text="Zoom In">
                <button onClick={() => setZoom(Math.min(4, zoom + 0.1))} className="p-1.5 rounded transition-colors text-muted-foreground hover:bg-neutral-700 hover:text-foreground"><ZoomIn size={16}/></button>
              </Tooltip>
            </div>
          </div>
        </header>

        <div ref={canvasRef} className="overflow-hidden relative flex-1 min-h-0 bg-background" style={{ cursor: isPanning ? 'grabbing' : 'default' }}>
          <div
            ref={drop as any}
            className="absolute top-0 left-0 w-full h-full canvas-bg"
            onClick={() => clearSelection()}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              backgroundColor: isOver ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
              transition: 'background-color 150ms ease',
              ...(showGrid && {
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
              })
            }}
          >
            {components.map(comp => (
              <ResizableDraggableComponent
                key={comp.id}
                component={comp}
                zoom={zoom}
                onContextMenu={(e) => handleContextMenu(e, comp.id)}
              />
            ))}
            <SmartGuides horizontalGuides={horizontalGuides} verticalGuides={verticalGuides} />
          </div>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={closeContextMenu}
              items={[
                { label: 'Copy', action: () => { copyComponent(contextMenu.componentId); closeContextMenu(); } },
                { label: 'Paste', action: () => { pasteComponent({ x: contextMenu.x, y: contextMenu.y }); closeContextMenu(); } },
                { label: 'Delete', action: () => { deleteComponent(contextMenu.componentId); closeContextMenu(); } },
                { label: 'Bring to Front', action: () => { bringToFront(contextMenu.componentId); closeContextMenu(); } },
                { label: 'Send to Back', action: () => { sendToBack(contextMenu.componentId); closeContextMenu(); } },
              ]}
            />
          )}
        </div>
        <SmartGuidesLayer setHorizontalGuides={setHorizontalGuides} setVerticalGuides={setVerticalGuides} />
      </main>

      {/* Right Sidebar */}
      <aside className={cn("flex flex-col border-l transition-all duration-300 bg-sidebar-background border-sidebar-border", isRightSidebarCollapsed ? "w-0" : "w-72")}>
        <div className={cn("p-2 border-b border-sidebar-border", isRightSidebarCollapsed ? "hidden" : "block")}>
          <div className="flex p-1 space-x-1 rounded-lg bg-input">
            <button onClick={() => setActiveTab('design')} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'design' ? 'bg-neutral-700 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-neutral-700/50 hover:text-foreground'}`}>Design</button>
            <button onClick={() => setActiveTab('theme')} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'theme' ? 'bg-neutral-700 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-neutral-700/50 hover:text-foreground'}`}>Theme</button>
            <button onClick={() => setActiveTab('layers')} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === 'layers' ? 'bg-neutral-700 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-neutral-700/50 hover:text-foreground'}`}>Layers</button>
          </div>
        </div>
        <div className={cn("overflow-y-auto flex-1", isRightSidebarCollapsed ? "hidden" : "block")}>
          {activeTab === 'design' && (
            <div className="p-4 h-full">
              {selectedComponent ? (
                <PropertiesPanel
                  key={selectedComponent.id}
                  selectedComponent={{
                    id: selectedComponent.id,
                    props: selectedComponent.props,
                    type: selectedComponent.content,
                    style: {}, // This might need to be derived from props
                  }}
                  propsDefinition={componentMap[selectedComponent.content]?.propsSchema || undefined}
                  handlePropChange={handlePropChange}
                  onClear={clearSelection}
                />
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center text-neutral-500">
                  <Settings size={32} className="mb-3 text-neutral-600" />
                  <p className="font-semibold text-neutral-400">Properties</p>
                  <p className="text-xs text-neutral-500">{selectedComponentIds.length > 1 ? `${selectedComponentIds.length} items selected` : "Select a layer to edit."}</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'theme' && <ThemePanel />}
          {activeTab === 'layers' && (
            <LayersPanel
              components={components}
              selectedIds={selectedComponentIds}
              onSelect={selectComponent}
              onVisibilityToggle={handleLayerVisibility}
              onLockToggle={handleLayerLock}
              onDuplicate={handleLayerDuplicate}
              onDelete={deleteComponent}
              onReorder={reorderComponent}
            />
          )}
        </div>
      </aside>
      <button
        onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
        className="flex absolute right-0 top-1/2 z-10 justify-center items-center w-6 h-24 rounded-l-lg transition-all -translate-y-1/2 bg-neutral-800/50 hover:bg-neutral-700/80"
      >
        {isRightSidebarCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
};

const TemplateBuilder: FC = () => (
  <DndProvider backend={HTML5Backend}>
    <ThemeProvider>
      <TemplateBuilderProvider>
        <TemplateBuilderInternal />
        <CustomDragLayer />
      </TemplateBuilderProvider>
    </ThemeProvider>
  </DndProvider>
);

const ComponentLibrary: FC<{ componentMap: Record<string, ComponentDefinition>; searchTerm: string; onToggleFavorite: (type: string) => void; }> = ({ componentMap, searchTerm, onToggleFavorite }) => {
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
    if (!acc[def.category]) acc[def.category] = [];
    acc[def.category].push([type, def] as [string, ComponentDefinition]);
    return acc;
  }, {} as Record<string, [string, ComponentDefinition][]>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const renderSection = (title: string, items: [string, ComponentDefinition][]) => (
    <CollapsibleSection key={title} title={title} count={items.length} isOpen={openCategories[title] ?? false} onToggle={() => toggleCategory(title)}>
      {items.map(([type, def]) => (
        <SidebarComponent key={type} type={type} definition={def} onToggleFavorite={onToggleFavorite} />
      ))}
    </CollapsibleSection>
  );

  return (
    <div className="space-y-2">
      {favorites.length > 0 && renderSection('Favorites', favorites)}
      {Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => {
        if (favorites.some(fav => fav[1].category === category)) return null; // Avoid duplicating sections
        return renderSection(category, items);
      })}
    </div>
  );
};

const CollapsibleSection: FC<{ title: string; count: number; isOpen: boolean; onToggle: () => void; children: React.ReactNode; }> = ({ title, count, isOpen, onToggle, children }) => (
  <div>
    <button onClick={onToggle} className="flex justify-between items-center px-2 py-2 w-full text-sm font-semibold text-left rounded-md transition-colors text-neutral-300 hover:bg-neutral-800">
      <span>{title}</span>
      <div className="flex gap-2 items-center">
        <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-700 text-neutral-400">{count}</span>
        <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 }
          }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-2 p-2 mt-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SNAP_THRESHOLD = 5;

interface SmartGuidesLayerProps {
  setHorizontalGuides: React.Dispatch<React.SetStateAction<number[]>>;
  setVerticalGuides: React.Dispatch<React.SetStateAction<number[]>>;
}

const SmartGuidesLayer: FC<SmartGuidesLayerProps> = ({ setHorizontalGuides, setVerticalGuides }) => {
  const { components, zoom } = useTemplateBuilder();

  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  useEffect(() => {
    if (!isDragging || !currentOffset || !item || item.type !== ItemTypes.CANVAS_OBJECT) {
      setHorizontalGuides([]);
      setVerticalGuides([]);
      return;
    }

    const newHorizontalGuides: number[] = [];
    const newVerticalGuides: number[] = [];

    const draggedComponent = components.find(c => c.id === item.id);
    if (!draggedComponent) return;

    const canvas = document.querySelector('.canvas-bg')?.getBoundingClientRect();
    if (!canvas) return;

    const draggedEl = document.getElementById(`component-${item.id}`)?.getBoundingClientRect();
    if (!draggedEl) return;

    const dragged = {
      left: (draggedEl.left - canvas.left) / zoom,
      top: (draggedEl.top - canvas.top) / zoom,
      right: (draggedEl.right - canvas.left) / zoom,
      bottom: (draggedEl.bottom - canvas.top) / zoom,
      hCenter: ((draggedEl.left + draggedEl.right) / 2 - canvas.left) / zoom,
      vCenter: ((draggedEl.top + draggedEl.bottom) / 2 - canvas.top) / zoom,
    };

    components.forEach(comp => {
      if (comp.id === item.id) return;

      const staticEl = document.getElementById(`component-${comp.id}`)?.getBoundingClientRect();
      if (!staticEl) return;

      const staticComp = {
        left: (staticEl.left - canvas.left) / zoom,
        top: (staticEl.top - canvas.top) / zoom,
        right: (staticEl.right - canvas.left) / zoom,
        bottom: (staticEl.bottom - canvas.top) / zoom,
        hCenter: ((staticEl.left + staticEl.right) / 2 - canvas.left) / zoom,
        vCenter: ((staticEl.top + staticEl.bottom) / 2 - canvas.top) / zoom,
      };

      // Vertical guides
      if (Math.abs(dragged.left - staticComp.left) < SNAP_THRESHOLD) newVerticalGuides.push(staticComp.left);
      if (Math.abs(dragged.left - staticComp.right) < SNAP_THRESHOLD) newVerticalGuides.push(staticComp.right);
      if (Math.abs(dragged.right - staticComp.left) < SNAP_THRESHOLD) newVerticalGuides.push(staticComp.left);
      if (Math.abs(dragged.right - staticComp.right) < SNAP_THRESHOLD) newVerticalGuides.push(staticComp.right);
      if (Math.abs(dragged.hCenter - staticComp.hCenter) < SNAP_THRESHOLD) newVerticalGuides.push(staticComp.hCenter);

      // Horizontal guides
      if (Math.abs(dragged.top - staticComp.top) < SNAP_THRESHOLD) newHorizontalGuides.push(staticComp.top);
      if (Math.abs(dragged.top - staticComp.bottom) < SNAP_THRESHOLD) newHorizontalGuides.push(staticComp.bottom);
      if (Math.abs(dragged.bottom - staticComp.top) < SNAP_THRESHOLD) newHorizontalGuides.push(staticComp.top);
      if (Math.abs(dragged.bottom - staticComp.bottom) < SNAP_THRESHOLD) newHorizontalGuides.push(staticComp.bottom);
      if (Math.abs(dragged.vCenter - staticComp.vCenter) < SNAP_THRESHOLD) newHorizontalGuides.push(staticComp.vCenter);
    });

    setHorizontalGuides([...new Set(newHorizontalGuides)]);
    setVerticalGuides([...new Set(newVerticalGuides)]);

  }, [isDragging, currentOffset, item, components, zoom, setHorizontalGuides, setVerticalGuides]);

  return null;
};

export default TemplateBuilder;

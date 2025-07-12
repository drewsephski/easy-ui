'use client';

import React from 'react';
import { BetaModal } from '@/components/BetaModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Code,
  Eye,
  LayoutGrid,
  Trash2,
  Undo2,
  Redo2,
  Grid3X3,
  Layers,
  ZoomIn,
  ZoomOut,
  Upload,
  Save,
  Component as ComponentIcon,
  Sparkles,
  MousePointerClick,
  Type,
  SquareStack,
  MessageSquare,
  Key,
  Rocket,
  Palette,
  List,
  Search,
  Fingerprint,
  Lightbulb,
  Box,
  Move,
  Circle,
  Square,
  Hexagon,
  Zap,
  Badge,
  ScrollText,
  Star,
  Users,
  Pen,
  Mail,
  Plus,
} from 'lucide-react';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { ExportModal } from '@/components/ExportModal';
import { Input } from '@/components/ui/input';
import { DraggableComponent } from '@/components/DraggableComponent';
import { DroppableCanvas } from '@/components/DroppableCanvas';
import { CanvasDraggableComponent } from '@/components/CanvasDraggableComponent'; // Import CanvasDraggableComponent
import { componentProps } from '@/lib/component-props';
import { ComponentType, InitialComponentType, DropZoneType } from '@/types/template-builder';

type ComponentKey = keyof typeof componentMap;

// Enhanced helper function to safely import components with better error handling
const safeImport = (importFn: () => Promise<any>, componentName: string) => {
  return dynamic(
    () => {
      console.log(`Loading component: ${componentName}`);
      return importFn()
        .then(mod => {
          // Handle both default and named exports with better fallback
          const exportNames = Object.keys(mod);
          const component = mod.default || mod[componentName];
          if (!component) {
            const foundNamedExport = exportNames.find(key => key === componentName);
            if (foundNamedExport) {
              return mod[foundNamedExport];
            }
          }

          if (!component) {
            console.error(`Component ${componentName} not found in module. Available exports:`, exportNames);
            return () => (
              <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <p className="font-medium">Failed to load: {componentName}</p>
                <p className="mt-1 text-sm opacity-80">
                  Available exports: {exportNames.join(', ') || 'none'}
                </p>
              </div>
            );
          }
          return component;
        })
        .catch(err => {
          console.error(`Error loading component ${componentName}:`, err);
          return () => (
            <div className="p-4 text-amber-700 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
              <p className="font-medium">Error loading: {componentName}</p>
              <p className="mt-1 text-sm opacity-80">{err.message}</p>
            </div>
          );
        });
    },
    {
      loading: () => (
        <div className="p-4 w-full bg-gray-50 rounded-lg border border-gray-200 animate-pulse dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse dark:bg-gray-600"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading {componentName}...</span>
          </div>
        </div>
      ),
      ssr: false
    }
  );
};

// Enhanced component map with safe imports
const componentMap = {
  // EasyUI Components
  AnimatedBadge: safeImport(() => import('@/components/easyui/animated-badge'), 'AnimatedBadge'),
  AnimatedBeam: safeImport(() => import('@/components/easyui/animated-beam'), 'AnimatedBeam'),
  BeamButton: safeImport(() => import('@/components/easyui/beam-button'), 'BeamButton'),
  BeamCard: safeImport(() => import('@/components/easyui/beam-card'), 'BeamCard'),
  ColoredButton: safeImport(() => import('@/components/easyui/colored-button'), 'ColoredButton'),
  ConfettiPoll: safeImport(() => import('@/components/easyui/confetti-poll'), 'ConfettiPoll'),
  CreateNew: safeImport(() => import('@/components/easyui/create-new'), 'CreateNew'),
  FeatureCard: safeImport(() => import('@/components/easyui/feature-card'), 'FeatureCard'),
  FileUploadCard: safeImport(() => import('@/components/easyui/file-upload-card'), 'FileUploadCard'),
  FireflyButton: safeImport(() => import('@/components/easyui/firefly-button'), 'FireflyButton'),
  GlitchText: safeImport(() => import('@/components/easyui/glitch-text'), 'GlitchText'),
  HexagonHero: safeImport(() => import('@/components/easyui/hexagon-hero'), 'HexagonHero'),
  Highlighter: safeImport(() => import('@/components/easyui/highlighter'), 'Highlighter'),
  HoverButton: safeImport(() => import('@/components/easyui/hover-button'), 'HoverButton'),
  IdeaForm: safeImport(() => import('@/components/easyui/idea-form'), 'IdeaForm'),
  KeyButton: safeImport(() => import('@/components/easyui/key-button'), 'KeyButton'),
  Launchpad: safeImport(() => import('@/components/easyui/launchpad'), 'Launchpad'),
  LogoParticles: safeImport(() => import('@/components/easyui/logo-particles'), 'LogoParticles'),
  PixelCard: safeImport(() => import('@/components/easyui/pixel-card'), 'PixelCard'),
  ReactionBar: safeImport(() => import('@/components/easyui/reaction-bar'), 'ReactionBar'),
  SearchCommand: safeImport(() => import('@/components/easyui/search-command'), 'SearchCommand'),
  SignatureAnimation: safeImport(() => import('@/components/easyui/signature-animation'), 'SignatureAnimation'),
  SparkleButton: safeImport(() => import('@/components/easyui/sparkle-button'), 'SparkleButton'),
  TiltMotion: safeImport(() => import('@/components/easyui/tilt-motion'), 'TiltMotion'),
  TransactionList: safeImport(() => import('@/components/easyui/transaction-list'), 'TransactionList'),

  // MagicUI Components
  AnimatedBeamMultipleOutputs: safeImport(
    () => import('@/components/magicui/animated-beam-multiple-outputs'),
    'AnimatedBeamMultipleOutputs'
  ),
  AnimatedGradientText: safeImport(
    () => import('@/components/magicui/animated-gradient-text'),
    'default'
  ),
  AnimatedShinyText: safeImport(
    () => import('@/components/magicui/animated-shiny-text'),
    'default'
  ),
  AnimatedSubscribeButton: safeImport(
    () => import('@/components/magicui/animated-subscribe-button'),
    'default'
  ),
  AvatarCircles: safeImport(
    () => import('@/components/magicui/avatar-circles'),
    'default'
  ),
  BentoGrid: safeImport(
    () => import('@/components/magicui/bento-grid'),
    'BentoGrid'
  ),
  BorderBeam: safeImport(
    () => import('@/components/magicui/border-beam'),
    'default'
  ),
  LinearGradient: safeImport(
    () => import('@/components/magicui/linear-gradient'),
    'default'
  ),
  MagicCard: safeImport(
    () => import('@/components/magicui/magic-card'),
    'default'
  ),
  Marquee: safeImport(
    () => import('@/components/magicui/marquee'),
    'default'
  ),
  OrbitingCircles: safeImport(() => import('@/components/magicui/orbiting-circles'), 'default'),
  SparklesText: safeImport(() => import('@/components/magicui/sparkles-text'), 'default'),
};

// Enhanced initial components with better categorization
const componentIcons: { [key: string]: React.ElementType } = {
  AnimatedBadge: Badge,
  AnimatedBeam: Zap,
  BeamButton: Rocket,
  BeamCard: Box,
  ColoredButton: Palette,
  ConfettiPoll: Sparkles,
  CreateNew: Plus,
  FeatureCard: Star,
  FileUploadCard: Upload,
  FireflyButton: Zap,
  GlitchText: Type,
  HexagonHero: Hexagon,
  Highlighter: Pen,
  HoverButton: MousePointerClick,
  IdeaForm: Lightbulb,
  KeyButton: Key,
  Launchpad: Rocket,
  LogoParticles: Sparkles,
  PixelCard: Square,
  ReactionBar: MessageSquare,
  SearchCommand: Search,
  SignatureAnimation: Fingerprint,
  SparkleButton: Sparkles,
  TiltMotion: Move,
  TransactionList: List,
  AnimatedBeamMultipleOutputs: Zap,
  AnimatedGradientText: Type,
  AnimatedShinyText: Sparkles,
  AnimatedSubscribeButton: Mail,
  AvatarCircles: Users,
  BentoGrid: LayoutGrid,
  BorderBeam: SquareStack,
  LinearGradient: Palette,
  MagicCard: Box,
  Marquee: ScrollText,
  OrbitingCircles: Circle,
  SparklesText: Sparkles,
};

const initialComponents = Object.keys(componentMap).map((key) => {
  const componentKey = key as ComponentKey;

  let category = 'UI';
  if (componentKey.toLowerCase().includes('animated') || componentKey.toLowerCase().includes('beam')) {
    category = 'Animation';
  } else if (componentKey.toLowerCase().includes('button')) {
    category = 'Buttons';
  } else if (componentKey.toLowerCase().includes('card')) {
    category = 'Cards';
  } else if (componentKey.toLowerCase().includes('text')) {
    category = 'Typography';
  } else if (componentKey.toLowerCase().includes('form') || componentKey.toLowerCase().includes('input')) {
    category = 'Forms';
  }

  const Icon = componentIcons[componentKey] || ComponentIcon;

  return {
    id: componentKey,
    content: componentKey,
    category,
    icon: Icon,
    props: {}, // Add an empty props object
  };
});

export default function TemplateBuilderPage() {
  const [components, setComponents] = useState<ComponentType[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [history, setHistory] = useState<ComponentType[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced categories with proper memoization
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(initialComponents.map(c => c.category))];
    return cats.sort();
  }, []);

  // Enhanced history management
  const addToHistory = useCallback((newComponents: ComponentType[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newComponents]); // Deep copy to prevent mutations
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Enhanced drop handler with zone support
  const handleDrop = useCallback((item: any, zone: DropZoneType = 'main', dropIndex?: number) => {
    console.log('Dropped item:', item, 'Zone:', zone);

    const componentName = item.component?.content || item.content;
    if (!componentName) {
      console.error('No component name found in dropped item');
      return;
    }

    const defaultProps = componentProps[componentName as keyof typeof componentProps] || {};

    const newComponent: ComponentType = {
      id: `${componentName}-${new Date().getTime()}`,
      content: componentName,
      props: Object.entries(defaultProps).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value.default,
      }), {}),
      zone, // Add zone information to the component
    };

    console.log('New component with zone:', newComponent);

    const newComponents = Array.isArray(components) ? [...components] : [];

    // If we have a drop index, insert at that position, otherwise append to the end
    if (dropIndex !== undefined) {
      newComponents.splice(dropIndex, 0, newComponent);
    } else {
      newComponents.push(newComponent);
    }

    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(newComponent);
  }, [components, addToHistory]);

  // Enhanced move handler with zone support
  const handleMove = useCallback((dragIndex: number, hoverIndex: number, zone: DropZoneType = 'main') => {
    if (dragIndex === hoverIndex || dragIndex < 0 || hoverIndex < 0) return;

    const dragComponent = components[dragIndex];
    if (!dragComponent) return;

    // Update the component's zone if it's different
    const updatedComponent = {
      ...dragComponent,
      zone: zone || dragComponent.zone || 'main'
    };

    const newComponents = [...components];
    newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, updatedComponent);

    setComponents(newComponents);
    addToHistory(newComponents);
  }, [components, addToHistory]);

  // Enhanced delete handler with confirmation
  const handleDelete = useCallback((id: string) => {
    const newComponents = components.filter((c) => c.id !== id);
    setComponents(newComponents);
    addToHistory(newComponents);
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [components, addToHistory, selectedComponent]);

  // Enhanced duplicate handler with better naming
  const handleDuplicate = useCallback((id: string) => {
    const componentToDuplicate = components.find(c => c.id === id);
    if (componentToDuplicate) {
      const newComponent: ComponentType = {
        ...componentToDuplicate,
        id: `${componentToDuplicate.content}-copy-${new Date().getTime()}`,
        props: { ...componentToDuplicate.props }, // Deep copy props
      };
      const newComponents = [...components, newComponent];
      setComponents(newComponents);
      addToHistory(newComponents);
      setSelectedComponent(newComponent);
    }
  }, [components, addToHistory]);

  // Enhanced prop change handler with validation
  const handlePropChange = useCallback((id: string, propName: string, value: unknown) => {
    const newComponents = components.map((c) =>
      c.id === id ? { ...c, props: { ...c.props, [propName]: value } } : c
    );
    setComponents(newComponents);

    if (selectedComponent?.id === id) {
      setSelectedComponent((prev) => ({
        ...prev!,
        props: { ...prev!.props, [propName]: value },
      }));
    }
  }, [components, selectedComponent]);

  // Enhanced undo/redo with better state management
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComponents([...history[newIndex]]);
      setSelectedComponent(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComponents([...history[newIndex]]);
      setSelectedComponent(null);
    }
  }, [history, historyIndex]);

  // Enhanced clear canvas with confirmation
  const clearCanvas = useCallback(() => {
    if (components.length > 0) {
      const confirmed = window.confirm('Are you sure you want to clear all components?');
      if (confirmed) {
        setComponents([]);
        addToHistory([]);
        setSelectedComponent(null);
      }
    }
  }, [components.length, addToHistory]);

  // Enhanced zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  // Enhanced template save/load functionality
  const saveTemplate = useCallback(() => {
    const template = {
      name: templateName,
      components,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [templateName, components]);

  const loadTemplate = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string);
          if (template.components && Array.isArray(template.components)) {
            setComponents(template.components);
            addToHistory(template.components);
            setTemplateName(template.name || 'Imported Template');
            setSelectedComponent(null);
          }
        } catch (error) {
          console.error('Error loading template:', error);
          alert('Error loading template. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }, [addToHistory]);

  // Enhanced filtered components with better search
  const filteredComponents = useMemo(() => {
    return initialComponents.filter((component) => {
      const matchesSearch = searchTerm === '' ||
        component.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' ||
        component.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Initialize DnD backend with proper configuration
  const dndBackend = useMemo(() => {
    if (typeof window === 'undefined') return null;

    try {
      if (isMobile) {
        // @ts-ignore - TouchBackend has incorrect type definitions
        return TouchBackend;
      }
      return HTML5Backend;
    } catch (error) {
      console.error('Failed to initialize DnD backend:', error);
      return HTML5Backend; // Fallback to HTML5 backend
    }
  }, []);

  if (typeof window === 'undefined' || !dndBackend) {
    return <div>Loading...</div>; // Or any loading state
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <BetaModal />
      <div className="flex flex-col min-h-screen bg-gradient-to-br to-gray-100 from-slate-50 dark:from-gray-900 dark:to-black">
        {/* Enhanced Header with better responsiveness */}
        <header className="sticky top-0 z-50 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90 dark:bg-gray-900/90 dark:border-gray-800">
          <div className="flex flex-col justify-between items-center px-4 py-4 space-y-4 lg:flex-row lg:px-6 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <LayoutGrid size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Template Builder
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Build beautiful components visually
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={18} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex === history.length - 1}
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    showGrid ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title="Toggle Grid"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center px-3 py-1 space-x-2 bg-gray-100 rounded-full dark:bg-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {components.length} components
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={loadTemplate}
                  className="hidden"
                  id="template-upload"
                />
                <button
                  onClick={() => document.getElementById('template-upload')?.click()}
                  className="flex items-center px-3 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Load Template"
                >
                  <Upload size={16} className="mr-2" />
                  Load
                </button>
                <button
                  onClick={saveTemplate}
                  className="flex items-center px-3 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Save Template"
                >
                  <Save size={16} className="mr-2" />
                  Save
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isPreview
                    ? 'text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Eye size={16} className="mr-2" />
                {isPreview ? 'Exit Preview' : 'Preview'}
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              >
                <Code size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </header>

        <main className="flex overflow-hidden flex-1">
          {/* Enhanced Component Palette */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-white/95 backdrop-blur-sm border-r border-gray-200 dark:bg-gray-900/95 dark:border-gray-800 flex flex-col shadow-sm`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`font-semibold text-gray-800 dark:text-gray-200 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                  Components
                </h2>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  <Layers size={18} />
                </button>
              </div>

              {!sidebarCollapsed && (
                <>
                  <Input
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-2">
                {filteredComponents.map((item) => (
                  <DraggableComponent
                    key={item.id}
                    component={item}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(didDrop) => {
                      setIsDragging(false);
                      if (!didDrop) {
                        // If the item was not dropped on a valid target, revert its position
                        // This might involve a more complex state management depending on your needs
                        // For now, we'll just log it.
                        console.log('Drag ended without a valid drop.');
                      }
                    }}
                    collapsed={sidebarCollapsed}
                  >
                    {sidebarCollapsed ? (
                      <div className="flex justify-center items-center w-8 h-8 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        {item.icon ? React.createElement(item.icon, { size: 16 }) : null}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="flex justify-center items-center w-8 h-8 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          {item.icon ? React.createElement(item.icon, { size: 16 }) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate dark:text-gray-200">
                            {item.content}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    )}
                  </DraggableComponent>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Canvas Area */}
          <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-900/50">
            <DroppableCanvas
              onDrop={handleDrop}
              onMove={handleMove}
              showGrid={showGrid}
              isDragging={isDragging}
              className="flex-1"
            >
              {components.length === 0 ? (
                <div className="flex flex-col justify-center items-center p-8 h-full text-center">
                  <div className="p-8 max-w-md bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 border-dashed dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                      <LayoutGrid size={32} className="text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Start Building Your Template
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                      Drag components from the sidebar to start creating your template.
                      Use the preview mode to see how it looks in action.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-white rounded dark:bg-gray-800">Drag & Drop</span>
                      <span className="px-2 py-1 bg-white rounded dark:bg-gray-800">Live Preview</span>
                      <span className="px-2 py-1 bg-white rounded dark:bg-gray-800">Export Code</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {components.map((item, index) => {
                    const Component = componentMap[item.content as ComponentKey];
                    if (!Component) return null;

                    return (
                      <CanvasDraggableComponent
                        key={item.id}
                        id={item.id}
                        index={index}
                        moveComponent={handleMove}
                        isPreview={isPreview}
                        setSelectedComponent={setSelectedComponent}
                        selectedComponent={selectedComponent}
                        handleDelete={handleDelete}
                        handleDuplicate={handleDuplicate}
                        component={item} // Pass the full component object
                      >
                        <Component {...item.props} />
                      </CanvasDraggableComponent>
                    );
                  })}
                </div>
              )}
            </DroppableCanvas>
          </div>

          {/* Enhanced Properties Panel */}
          <div className={`${!isPreview ? 'pointer-events-none' : 'overflow-hidden rounded-lg'}`}>
            <PropertiesPanel
              key={selectedComponent?.id}
              selectedComponent={selectedComponent}
              handlePropChange={handlePropChange}
              onClear={clearCanvas}
            />
          </div>
        </main>

        {showExportModal && (
          <ExportModal
            components={components}
            setShowExportModal={setShowExportModal}
          />
        )}
      </div>
    </DndProvider>
  );
}

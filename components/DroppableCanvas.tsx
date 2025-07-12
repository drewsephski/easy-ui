'use client';

import { useDrop, DropTargetMonitor } from 'react-dnd';
import { HTMLAttributes, ReactNode, useRef, useState, useCallback, useEffect, forwardRef, Ref, MutableRefObject, memo } from 'react';
import { cn } from '@/lib/utils';
import { DropZoneType } from '@/types/template-builder';
import { motion, AnimatePresence } from 'framer-motion';
import React, { CSSProperties } from 'react';

interface DropZoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  type: DropZoneType;
  label?: string;
  children?: ReactNode;
  onDrop: (item: any, zone: DropZoneType) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isActive?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  isOver?: boolean;
  canDrop?: boolean;
  itemType?: string | symbol | null;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

interface DroppableCanvasProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  onDrop: (component: any, zone: DropZoneType, index?: number) => void;
  onMove: (dragIndex: number, hoverIndex: number, zone: DropZoneType) => void;
  showGrid?: boolean;
  isDragging?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  zones?: {
    header?: boolean;
    main?: boolean;
    sidebar?: boolean;
    footer?: boolean;
  };
}

const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(({
  type,
  label,
  className,
  children,
  onDrop,
  onMouseEnter,
  onMouseLeave,
  style,
  isActive = false,
  onHoverChange,
  isOver: externalIsOver,
  canDrop: externalCanDrop,
  itemType: externalItemType
}, ref) => {
  const [{ isOver, canDrop, itemType }, drop] = useDrop({
    accept: ['component', 'canvas-component'],
    drop: (item: any, monitor: DropTargetMonitor) => {
      // Only perform the drop if it hasn't been handled by a nested droppable
      if (!monitor.didDrop()) {
        onDrop({ ...item, targetZone: type }, type);
      }
    },
    hover: (item: any, monitor: DropTargetMonitor) => {
      if (onHoverChange) {
        onHoverChange(monitor.isOver({ shallow: true }));
      }
    },
    canDrop: (item: any, monitor) => {
      // Allow dropping if the item is already in this zone or if the zone is empty
      const currentZone = item.component?.zone || 'main';
      const isSameZone = currentZone === type;
      const zoneIsEmpty = React.Children.count(children) === 0;

      // Allow drop if it's the same zone or if the target zone is empty
      return isSameZone || zoneIsEmpty;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType(),
    }),
  });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Assign to both refs
      if (node) {
        const nodeRef = drop(node) as unknown as HTMLDivElement;
        
        if (ref) {
          if (typeof ref === 'function') {
            ref(nodeRef);
          } else if ('current' in ref) {
            (ref as MutableRefObject<HTMLDivElement | null>).current = nodeRef;
          }
        }
      }
    },
    [drop, ref]
  );

  // Animation variants for the drop indicator
  const dropIndicatorVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.15 }
    }
  };

  // Determine the drop indicator style based on drag state
  const getDropIndicatorStyle = () => {
    if (!isOver) return '';
    if (canDrop) return 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20';
    return 'border-red-500 bg-red-50/50 dark:bg-red-900/20';
  };

  // Get zone-specific styles
  const getZoneClasses = () => {
    const baseClasses = [];

    // Base styles based on zone type
    switch (type) {
      case 'header':
        baseClasses.push('min-h-20 bg-gradient-to-r from-gray-50 to-gray-100',
                        'dark:from-gray-800/50 dark:to-gray-900/50');
        break;
      case 'sidebar':
        baseClasses.push('w-64 bg-gray-50 dark:bg-gray-800/30');
        break;
      case 'footer':
        baseClasses.push('min-h-16 bg-gradient-to-r from-gray-50 to-gray-100',
                       'dark:from-gray-800/50 dark:to-gray-900/50');
        break;
      default: // main
        baseClasses.push('min-h-40 bg-white dark:bg-gray-900/30');
    }

    // Interactive states
    if (isOver && canDrop) {
      baseClasses.push('ring-blue-500 border-blue-300');
    } else if (isOver && !canDrop) {
      baseClasses.push('ring-red-500 border-red-300');
    } else if (isActive) {
      baseClasses.push('ring-2 ring-blue-500');
    }

    return baseClasses.join(' ');
  };

  // Determine if we should show the drop indicator
  const showDropIndicator = isOver && canDrop;
  const showHoverState = (isOver || isActive) && canDrop;

  const zoneClasses = cn(
    'relative rounded-lg transition-all duration-200 border-2',
    showHoverState ? 'border-blue-500' : 'border-transparent',
    showDropIndicator ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent',
    getZoneClasses(),
    {
      'border-dashed': !showDropIndicator,
      'border-solid': showDropIndicator,
      'ring-2 ring-blue-400 ring-offset-2': showDropIndicator,
      'opacity-100': !isOver || canDrop,
      'opacity-50': isOver && !canDrop,
    },
    className
  );

  return (
    <div
      ref={combinedRef}
      className={zoneClasses}
      style={{
        ...style,
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-zone-type={type}
      data-is-over={isOver}
      data-can-drop={canDrop}
      role="region"
      aria-label={`${type} drop zone`}
      aria-dropeffect="move"
    >
      <AnimatePresence>
        {showDropIndicator && (
          <motion.div
            className={cn(
              'absolute inset-0 z-10 rounded pointer-events-none',
              'bg-blue-100 dark:bg-blue-900/30',
              'border-2 border-blue-400 dark:border-blue-500',
              'shadow-lg'
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropIndicatorVariants}
            aria-hidden="true"
          >
            <div className="flex absolute inset-0 justify-center items-center">
              <div className="px-3 py-1 text-sm font-medium text-blue-600 rounded-full shadow-sm dark:text-blue-300 bg-white/80 dark:bg-black/60">
                Drop to {type} section
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        {label && (
          <div className="mb-2 text-xs font-medium text-gray-500">
            {label}
          </div>
        )}
        <div className="min-h-[40px]">
          {children}
        </div>
      </div>
    </div>
  );
});

DropZone.displayName = 'DropZone';

// Memoize the DropZone component to prevent unnecessary re-renders
const MemoizedDropZone = memo(DropZone);

// Set display name for better debugging
MemoizedDropZone.displayName = 'DropZone';

// Export the memoized version of DropZone
export { MemoizedDropZone as DropZone };

const DroppableCanvas = forwardRef<HTMLDivElement, DroppableCanvasProps>(({
  onDrop,
  onMove,
  showGrid = true,
  isDragging = false,
  className = '',
  zones = {
    header: true,
    main: true,
    sidebar: true,
    footer: true,
  },
  children,
  ...props
}, ref) => {
  // Track active and hovered zones with refs to avoid re-renders
  const [activeZone, setActiveZoneState] = useState<DropZoneType | null>(null);
  const [hoveredZone, setHoveredZoneState] = useState<DropZoneType | null>(null);
  const activeZoneRef = useRef<DropZoneType | null>(null);
  const hoveredZoneRef = useRef<DropZoneType | null>(null);

  const setActiveZone = useCallback((zone: DropZoneType | null) => {
    if (activeZoneRef.current !== zone) {
      activeZoneRef.current = zone;
      setActiveZoneState(zone);
    }
  }, []);

  const setHoveredZone = useCallback((zone: DropZoneType | null) => {
    if (hoveredZoneRef.current !== zone) {
      hoveredZoneRef.current = zone;
      setHoveredZoneState(zone);
    }
  }, []);

  // Helper to get current values
  const getActiveZone = useCallback(() => activeZoneRef.current, []);
  const getHoveredZone = useCallback(() => hoveredZoneRef.current, []);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleDrop = useCallback((item: any, zone: DropZoneType = 'main') => {
    if (!item || !['component', 'canvas-component'].includes(item.type)) {
      return; // Invalid item type
    }

    // Only proceed if the drop is valid for this zone
    const currentZone = item.component?.zone || 'main';
    const isSameZone = currentZone === zone;
    const zoneIsEmpty = React.Children.toArray(children).filter(
      (child: any) => (child?.props?.component?.zone || 'main') === zone
    ).length === 0;

    // Allow drop if it's the same zone or if the target zone is empty
    if (isSameZone || zoneIsEmpty) {
      const updatedItem = {
        ...item,
        component: {
          ...item.component,
          zone: zone // Always update to the target zone
        }
      };
      onDrop(updatedItem, zone);
    }
  }, [onDrop, children]);

  // Combine forwarded ref with local ref
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else if ('current' in ref) {
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }
    },
    [ref]
  );

  const gridStyles = React.useMemo(() => ({
    backgroundImage: showGrid 
      ? 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)'
      : 'none',
    backgroundSize: '24px 24px',
  }), [showGrid]);

  // Add a subtle animation to the grid when dragging
  const [dragCount, setDragCount] = useState(0);

  useEffect(() => {
    if (isDragging) {
      setDragCount(prev => prev + 1);
    }
  }, [isDragging]);


  // Use CSS animation for the grid background instead of Framer Motion
  useEffect(() => {
    if (containerRef.current) {
      if (isDragging) {
        containerRef.current.style.animation = 'moveGrid 20s linear infinite';
      } else {
        containerRef.current.style.animation = 'none';
      }
    }
  }, [isDragging]);

  // Track dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Handle dark mode changes (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial value
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // Handle changes
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Safely get the style prop with a default empty object
  const styleProp = props.style || {};
  
  // Combine styles for the canvas
  const canvasStyles = React.useMemo<React.CSSProperties>(() => {
    const baseStyles: React.CSSProperties = {};
    
    if (showGrid) {
      const gridStyle = isDarkMode ? darkGridStyles : gridStyles;
      return { ...baseStyles, ...gridStyle, ...styleProp };
    }
    
    return { ...baseStyles, ...styleProp };
  }, [showGrid, isDarkMode, styleProp]);

  // Extract all props except 'style' to avoid passing it twice
  const { style, ...otherProps } = props;
  
  return (
    <div
      ref={setRefs}
      className={cn(
        'relative w-full h-full overflow-auto transition-colors',
        isDragging ? 'cursor-grabbing' : 'cursor-default',
        showGrid ? 'bg-grid-gray-200 dark:bg-grid-gray-800' : '',
        isDragging ? 'bg-grid-gray-300 dark:bg-grid-gray-700' : '',
        className
      )}
      style={canvasStyles}
      onMouseLeave={() => setHoveredZoneState(null)}
      {...otherProps}
    >
      <div className="flex flex-col gap-6 p-6">
        {zones?.header && (
          <DropZone
            type="header"
            label="Header Section"
            onDrop={handleDrop}
            isActive={getActiveZone() === 'header'}
            onHoverChange={(isHovered) => setHoveredZone(isHovered ? 'header' : null)}
            onMouseEnter={() => setActiveZone('header')}
            onMouseLeave={() => setActiveZone(null)}
            className="mb-4"
          >
            <div className="p-4">
              {React.Children.toArray(children).filter(
                (child: any) => (child?.props?.component?.zone || 'main') === 'header'
              )}
              {getHoveredZone() === 'header' && React.Children.toArray(children).filter(
                (child: any) => (child?.props?.component?.zone || 'main') === 'header'
              ).length === 0 && (
                <div className="py-2 text-sm text-center text-gray-400">
                  Drop components here for header
                </div>
              )}
            </div>
          </DropZone>
        )}

        <div className="flex flex-1 gap-6 min-h-[300px]">
          {zones?.sidebar && (
            <DropZone
              type="sidebar"
              label="Sidebar"
              onDrop={handleDrop}
              isActive={getActiveZone() === 'sidebar'}
              onHoverChange={(isHovered) => setHoveredZone(isHovered ? 'sidebar' : null)}
              onMouseEnter={() => setActiveZone('sidebar')}
              onMouseLeave={() => setActiveZone(null)}
              className="flex-shrink-0"
            >
              <div className="p-4">
                {React.Children.toArray(children).filter(
                  (child: any) => (child?.props?.component?.zone || 'main') === 'sidebar'
                )}
                {getHoveredZone() === 'sidebar' && React.Children.toArray(children).filter(
                  (child: any) => (child?.props?.component?.zone || 'main') === 'sidebar'
                ).length === 0 && (
                  <div className="py-8 text-sm text-center text-gray-400">
                    Drop components here for sidebar
                  </div>
                )}
              </div>
            </DropZone>
          )}

          {zones.main && (
            <div className="flex-1">
              <DropZone
                type="main"
                onDrop={handleDrop}
                className={cn(
                  'min-h-[400px]',
                  isDragging ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900/30'
                )}
                onMouseEnter={() => setHoveredZone('main')}
                onMouseLeave={() => setHoveredZone(null)}
                isActive={getActiveZone() === 'main'}
                onHoverChange={(isHovered) => {
                  if (isHovered) {
                    setActiveZone('main');
                  } else if (getActiveZone() === 'main') {
                    setActiveZone(null);
                  }
                }}
              >
                {children}
              </DropZone>
              {getHoveredZone() === 'main' && React.Children.toArray(children).filter(
                (child: any) => (child?.props?.component?.zone || 'main') === 'main'
              ).length === 0 && (
                <div className="py-16 text-sm text-center text-gray-400">
                  Drop components here for main content
                </div>
              )}
              </div>
            </DropZone>
          )}
        </div>

        {zones?.footer && (
          <DropZone
            type="footer"
            label="Footer Section"
            onDrop={handleDrop}
            isActive={getActiveZone() === 'footer'}
            onHoverChange={(isHovered) => setHoveredZone(isHovered ? 'footer' : null)}
            onMouseEnter={() => setActiveZone('footer')}
            onMouseLeave={() => setActiveZone(null)}
            className="mt-4"
          >
            <div className="p-4">
              {React.Children.toArray(children).filter(
                (child: any) => (child?.props?.component?.zone || 'main') === 'footer'
              )}
              {getHoveredZone() === 'footer' && React.Children.toArray(children).filter(
                (child: any) => (child?.props?.component?.zone || 'main') === 'footer'
              ).length === 0 && (
                <div className="py-2 text-sm text-center text-gray-400">
                  Drop components here for footer
                </div>
              )}
            </div>
          </DropZone>
        )}
      </div>

      {isDragging && (
        <div className="flex absolute inset-0 justify-center items-center pointer-events-none">
          <div className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 dark:text-gray-200">
            Drop components into any section
          </div>
        </div>
      )}
    </div>
  );
});

DroppableCanvas.displayName = 'DroppableCanvas';

// Grid styles for the canvas
const gridStyles = {
  backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
} as const;

// Dark mode grid styles
const darkGridStyles = {
  backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
} as const;

// Export the component
// Create a wrapper component that includes the grid animation styles
export const DroppableCanvasWithStyles = React.forwardRef<HTMLDivElement, DroppableCanvasProps>(
  function DroppableCanvasWithStyles(props, ref) {
    return (
      <React.Fragment>
        <DroppableCanvas ref={ref} {...props} />
        <GridAnimationStyles />
      </React.Fragment>
    );
  }
);

// Set display name for better debugging
DroppableCanvasWithStyles.displayName = 'DroppableCanvasWithStyles';

// Export the default component
export default DroppableCanvasWithStyles;

// Component to manage grid animation styles
const GridAnimationStyles = (): JSX.Element | null => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const styleId = 'grid-animation-styles';
    
    // Only add styles if they don't exist
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes gridAnimation {
          0% { background-position: 0 0; }
          100% { background-position: 24px 24px; }
        }
        
        .bg-grid-gray-300, .dark .bg-grid-gray-700 {
          animation: gridAnimation 1s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .bg-grid-gray-300, .dark .bg-grid-gray-700 {
            animation: none;
          }
        }
      `;
      
      document.head.appendChild(styleElement);
      
      return () => {
        const element = document.getElementById(styleId);
        if (element?.parentNode) {
          element.parentNode.removeChild(element);
        }
      };
    }
    
    return undefined;
  }, []);
  
  return null;
};

// Export the component
export { GridAnimationStyles };

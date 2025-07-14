// Utility functions for the template builder

export type ComponentType = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
};

export type HistoryState = {
  components: ComponentType[];
  selectedIds: string[];
};

// History management
export const createHistoryState = (components: ComponentType[], selectedIds: string[] = []): HistoryState => ({
  components: components.map(comp => ({ ...comp })),
  selectedIds: [...selectedIds],
});

export const getNextZIndex = (components: ComponentType[]): number => {
  if (components.length === 0) return 1;
  return Math.max(...components.map(c => c.zIndex || 0)) + 1;
};

// Alignment utilities
export const alignComponents = (
  components: ComponentType[],
  selectedIds: string[],
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'distributeX' | 'distributeY'
): ComponentType[] => {
  if (selectedIds.length < 2) return components;

  const selected = components.filter(c => selectedIds.includes(c.id));
  if (selected.length < 2) return components;

  const sortedByX = [...selected].sort((a, b) => a.x - b.x);
  const sortedByY = [...selected].sort((a, b) => a.y - b.y);

  return components.map(comp => {
    if (!selectedIds.includes(comp.id)) return comp;

    const newComp = { ...comp };

    switch (alignment) {
      case 'left': {
        const leftMost = sortedByX[0].x;
        newComp.x = leftMost;
        break;
      }
      case 'right': {
        const rightMost = sortedByX[sortedByX.length - 1].x + sortedByX[sortedByX.length - 1].width;
        newComp.x = rightMost - newComp.width;
        break;
      }
      case 'top': {
        const topMost = sortedByY[0].y;
        newComp.y = topMost;
        break;
      }
      case 'bottom': {
        const bottomMost = sortedByY[sortedByY.length - 1].y + sortedByY[sortedByY.length - 1].height;
        newComp.y = bottomMost - newComp.height;
        break;
      }
      case 'centerX': {
        const left = sortedByX[0].x;
        const right = sortedByX[sortedByX.length - 1].x + sortedByX[sortedByX.length - 1].width;
        const center = left + (right - left) / 2;
        newComp.x = center - newComp.width / 2;
        break;
      }
      case 'centerY': {
        const top = sortedByY[0].y;
        const bottom = sortedByY[sortedByY.length - 1].y + sortedByY[sortedByY.length - 1].height;
        const middle = top + (bottom - top) / 2;
        newComp.y = middle - newComp.height / 2;
        break;
      }
      case 'distributeX': {
        if (selected.length > 2) {
          const first = sortedByX[0];
          const last = sortedByX[sortedByX.length - 1];
          const gap = (last.x - (first.x + first.width)) / (selected.length - 1);
          const index = sortedByX.findIndex(c => c.id === comp.id);
          if (index > 0) {
            const prev = sortedByX[index - 1];
            newComp.x = prev.x + prev.width + gap;
          }
        }
        break;
      }
      case 'distributeY': {
        if (selected.length > 2) {
          const first = sortedByY[0];
          const last = sortedByY[sortedByY.length - 1];
          const gap = (last.y - (first.y + first.height)) / (selected.length - 1);
          const index = sortedByY.findIndex(c => c.id === comp.id);
          if (index > 0) {
            const prev = sortedByY[index - 1];
            newComp.y = prev.y + prev.height + gap;
          }
        }
        break;
      }
    }

    return newComp;
  });
};

// Selection utilities
export const getBoundingBox = (components: ComponentType[], selectedIds: string[]) => {
  const selected = components.filter(c => selectedIds.includes(c.id));
  if (selected.length === 0) return null;

  const left = Math.min(...selected.map(c => c.x));
  const top = Math.min(...selected.map(c => c.y));
  const right = Math.max(...selected.map(c => c.x + c.width));
  const bottom = Math.max(...selected.map(c => c.y + c.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    right,
    bottom,
  };
};

// Snap to grid utility
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const getResizeCursor = (handle: string): string => {
  switch (handle) {
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    default:
      return 'move';
  }
};

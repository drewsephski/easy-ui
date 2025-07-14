'use client';

import React from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2, Copy } from 'lucide-react';
import { ComponentData } from '@/contexts/TemplateBuilderContext';

interface LayerRowProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onVisibilityToggle: (id: string) => void;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const LayerRow: React.FC<LayerRowProps> = ({
  component, isSelected, onSelect, onVisibilityToggle, onLockToggle,
  onDelete, onDuplicate, onDragStart, onDrop, onDragOver
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, component.id)}
      onDrop={(e) => onDrop(e, component.id)}
      onDragOver={onDragOver}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-150 ${
        isSelected ? 'bg-blue-500/20' : 'hover:bg-neutral-800'
      }`}
      onClick={(e) => onSelect(component.id, e.ctrlKey || e.metaKey)}
    >
      <GripVertical className="flex-shrink-0 mr-2 text-neutral-500 cursor-grab" size={16} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-300' : 'text-neutral-300'}`}>
          {component.content}
        </p>
      </div>
      <div className="flex items-center space-x-1">
        {(isHovered || isSelected) && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(component.id); }}
              className="p-1 rounded transition-colors text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
              aria-label="Duplicate"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(component.id); }}
              className="p-1 rounded transition-colors text-neutral-400 hover:bg-red-500/20 hover:text-red-400"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onLockToggle(component.id); }}
          className="p-1 rounded transition-colors text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
          aria-label={component.locked ? 'Unlock' : 'Lock'}
        >
          {component.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onVisibilityToggle(component.id); }}
          className="p-1 rounded transition-colors text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
          aria-label={component.visible === false ? 'Show' : 'Hide'}
        >
          {component.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
};


interface LayersPanelProps {
  components: ComponentData[];
  selectedIds: string[];
  onSelect: (id: string, multiSelect: boolean) => void;
  onVisibilityToggle: (id: string) => void;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (dragId: string, dropId: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  components, selectedIds, onSelect, onVisibilityToggle, onLockToggle,
  onDelete, onDuplicate, onReorder
}) => {
  const dragId = React.useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    if (dragId.current && dragId.current !== dropId) {
      onReorder(dragId.current, dropId);
    }
    dragId.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full border-r bg-sidebar-background text-sidebar-foreground border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold">Layers</h2>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {[...components].reverse().map((comp) => (
          <LayerRow
            key={comp.id}
          component={comp}
          isSelected={selectedIds.includes(comp.id)}
          onSelect={onSelect}
          onVisibilityToggle={onVisibilityToggle}
          onLockToggle={onLockToggle}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;

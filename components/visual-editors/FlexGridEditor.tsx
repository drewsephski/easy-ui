'use client';

import React from 'react';

interface FlexGridEditorProps {
  display: 'flex' | 'grid' | 'block';
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number;
  gridCols?: number;
  gridRows?: number;
  onChange: (property: string, value: any) => void;
}

const iconButtonClasses = 'p-2 rounded-md transition-colors duration-150 hover:bg-neutral-800 text-muted-foreground hover:text-foreground';
const activeIconButtonClasses = 'bg-blue-500/20 text-blue-300';
const inputBaseClasses = 'mt-1 block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background sm:text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150';

export const FlexGridEditor: React.FC<FlexGridEditorProps> = ({
  display,
  direction,
  align,
  justify,
  gap,
  gridCols,
  gridRows,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground">
          Display
        </label>
        <div className="flex mt-1 space-x-2">
          <button
            onClick={() => onChange('display', 'block')}
            className={`${iconButtonClasses} ${
              display === 'block' ? activeIconButtonClasses : ''
            }`}
          >
            Block
          </button>
          <button
            onClick={() => onChange('display', 'flex')}
            className={`${iconButtonClasses} ${
              display === 'flex' ? activeIconButtonClasses : ''
            }`}
          >
            Flex
          </button>
          <button
            onClick={() => onChange('display', 'grid')}
            className={`${iconButtonClasses} ${
              display === 'grid' ? activeIconButtonClasses : ''
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {display === 'flex' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Direction
            </label>
            <div className="flex mt-1 space-x-2">
              <button
                onClick={() => onChange('direction', 'flex flex-row')}
                className={`${iconButtonClasses} ${
                  direction === 'row' ? activeIconButtonClasses : ''
                }`}
              >
                Row
              </button>
              <button
                onClick={() => onChange('direction', 'flex flex-col')}
                className={`${iconButtonClasses} ${
                  direction === 'col' ? activeIconButtonClasses : ''
                }`}
              >
                Column
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Align
            </label>
            <div className="flex mt-1 space-x-2">
              <button
                onClick={() => onChange('align', 'start')}
                className={`${iconButtonClasses} ${
                  align === 'start' ? activeIconButtonClasses : ''
                }`}
              >
                Start
              </button>
              <button
                onClick={() => onChange('align', 'center')}
                className={`${iconButtonClasses} ${
                  align === 'center' ? activeIconButtonClasses : ''
                }`}
              >
                Center
              </button>
              <button
                onClick={() => onChange('align', 'end')}
                className={`${iconButtonClasses} ${
                  align === 'end' ? activeIconButtonClasses : ''
                }`}
              >
                End
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Justify
            </label>
            <div className="flex mt-1 space-x-2">
              <button
                onClick={() => onChange('justify', 'start')}
                className={`${iconButtonClasses} ${
                  justify === 'start' ? activeIconButtonClasses : ''
                }`}
              >
                Start
              </button>
              <button
                onClick={() => onChange('justify', 'center')}
                className={`${iconButtonClasses} ${
                  justify === 'center' ? activeIconButtonClasses : ''
                }`}
              >
                Center
              </button>
              <button
                onClick={() => onChange('justify', 'end')}
                className={`${iconButtonClasses} ${
                  justify === 'end' ? activeIconButtonClasses : ''
                }`}
              >
                End
              </button>
              <button
                onClick={() => onChange('justify', 'between')}
                className={`${iconButtonClasses} ${
                  justify === 'between' ? activeIconButtonClasses : ''
                }`}
              >
                Between
              </button>
            </div>
          </div>
        </div>
      )}

      {display === 'grid' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Columns
            </label>
            <input
              type="number"
              value={gridCols}
              onChange={(e) => onChange('gridCols', parseInt(e.target.value))}
              className={inputBaseClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Rows
            </label>
            <input
              type="number"
              value={gridRows}
              onChange={(e) => onChange('gridRows', parseInt(e.target.value))}
              className={inputBaseClasses}
            />
          </div>
        </div>
      )}

      {(display === 'flex' || display === 'grid') && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            Gap
          </label>
          <input
            type="number"
            value={gap}
            onChange={(e) => onChange('gap', parseInt(e.target.value))}
            className={inputBaseClasses}
          />
        </div>
      )}
    </div>
  );
};

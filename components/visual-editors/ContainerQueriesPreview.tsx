'use client';

import React from 'react';

interface ContainerQueriesPreviewProps {
  containerWidth: number;
  onWidthChange: (width: number) => void;
}

const PRESET_WIDTHS = [320, 768, 1024, 1280];

export const ContainerQueriesPreview: React.FC<
  ContainerQueriesPreviewProps
> = ({ containerWidth, onWidthChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground">
        Preview Width
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="320"
          max="1280"
          value={containerWidth}
          onChange={(e) => onWidthChange(parseInt(e.target.value))}
          className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm font-mono text-foreground w-16 text-right">{containerWidth}px</span>
      </div>
      <div className="flex space-x-2">
        {PRESET_WIDTHS.map((width) => (
          <button
            key={width}
            onClick={() => onWidthChange(width)}
            className={`px-2 py-1 text-xs rounded-md transition-colors duration-150 ${
              containerWidth === width
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-input hover:bg-neutral-800'
            }`}
          >
            {width}px
          </button>
        ))}
      </div>
    </div>
  );
};

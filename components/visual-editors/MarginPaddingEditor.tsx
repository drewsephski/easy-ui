'use client';

import React from 'react';

interface MarginPaddingEditorProps {
  margin: { top: number; right: number; bottom: number; left: number };
  padding: { top: number; right: number; bottom: number; left: number };
  onChange: (
    type: 'margin' | 'padding',
    side: 'top' | 'right' | 'bottom' | 'left',
    value: number
  ) => void;
}

const SideInput: React.FC<{
  side: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}> = ({ side, value, onChange, className }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    className={`w-12 text-center bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground ${className}`}
    aria-label={`${side} value`}
  />
);

export const MarginPaddingEditor: React.FC<MarginPaddingEditorProps> = ({
  margin,
  padding,
  onChange,
}) => {
  return (
    <div className="flex relative justify-center items-center w-48 h-48 rounded-lg border bg-input border-border">
      <span className="absolute top-2 left-2 text-xs text-muted-foreground">Margin</span>
      {/* Margin Controls */}
      <SideInput
        side="margin-top"
        value={margin.top}
        onChange={(v) => onChange('margin', 'top', v)}
        className="absolute top-0 left-1/2 -translate-x-1/2"
      />
      <SideInput
        side="margin-right"
        value={margin.right}
        onChange={(v) => onChange('margin', 'right', v)}
        className="absolute right-0 top-1/2 -translate-y-1/2"
      />
      <SideInput
        side="margin-bottom"
        value={margin.bottom}
        onChange={(v) => onChange('margin', 'bottom', v)}
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
      />
      <SideInput
        side="margin-left"
        value={margin.left}
        onChange={(v) => onChange('margin', 'left', v)}
        className="absolute left-0 top-1/2 -translate-y-1/2"
      />

      <div className="flex relative justify-center items-center w-32 h-32 rounded-md border bg-background border-border-/50">
        <span className="absolute top-2 left-2 text-xs text-muted-foreground">Padding</span>
        {/* Padding Controls */}
        <SideInput
          side="padding-top"
          value={padding.top}
          onChange={(v) => onChange('padding', 'top', v)}
          className="absolute top-0 left-1/2 -translate-x-1/2"
        />
        <SideInput
          side="padding-right"
          value={padding.right}
          onChange={(v) => onChange('padding', 'right', v)}
          className="absolute right-0 top-1/2 -translate-y-1/2"
        />
        <SideInput
          side="padding-bottom"
          value={padding.bottom}
          onChange={(v) => onChange('padding', 'bottom', v)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
        />
        <SideInput
          side="padding-left"
          value={padding.left}
          onChange={(v) => onChange('padding', 'left', v)}
          className="absolute left-0 top-1/2 -translate-y-1/2"
        />
  
        <div className="w-16 h-16 rounded-sm bg-neutral-700/50" />
      </div>
    </div>
  );
};

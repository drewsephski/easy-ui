'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MarginPadding {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

interface MarginPaddingEditorProps {
  margin: MarginPadding;
  padding: MarginPadding;
  onChange: (property: string, value: string | number) => void;
}

const SpacingField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="grid grid-cols-2 gap-2 items-center">
    <Label htmlFor={`${label}-input`} className="text-xs text-right">
      {label}
    </Label>
    <Input
      id={`${label}-input`}
      type="text"
      value={value}
      onChange={onChange}
      className="h-8"
      placeholder="0px"
    />
  </div>
);

export const MarginPaddingEditor: React.FC<MarginPaddingEditorProps> = ({
  margin,
  padding,
  onChange,
}) => {
  const handleMarginChange = (side: keyof MarginPadding, value: string) => {
    onChange(`margin.${side}`, value);
  };

  const handlePaddingChange = (side: keyof MarginPadding, value: string) => {
    onChange(`padding.${side}`, value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-medium">Margin</h4>
        <div className="grid grid-cols-2 gap-2">
          <SpacingField
            label="Top"
            value={margin.top || ''}
            onChange={(e) => handleMarginChange('top', e.target.value)}
          />
          <SpacingField
            label="Right"
            value={margin.right || ''}
            onChange={(e) => handleMarginChange('right', e.target.value)}
          />
          <SpacingField
            label="Bottom"
            value={margin.bottom || ''}
            onChange={(e) => handleMarginChange('bottom', e.target.value)}
          />
          <SpacingField
            label="Left"
            value={margin.left || ''}
            onChange={(e) => handleMarginChange('left', e.target.value)}
          />
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Padding</h4>
        <div className="grid grid-cols-2 gap-2">
          <SpacingField
            label="Top"
            value={padding.top || ''}
            onChange={(e) => handlePaddingChange('top', e.target.value)}
          />
          <SpacingField
            label="Right"
            value={padding.right || ''}
            onChange={(e) => handlePaddingChange('right', e.target.value)}
          />
          <SpacingField
            label="Bottom"
            value={padding.bottom || ''}
            onChange={(e) => handlePaddingChange('bottom', e.target.value)}
          />
          <SpacingField
            label="Left"
            value={padding.left || ''}
            onChange={(e) => handlePaddingChange('left', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

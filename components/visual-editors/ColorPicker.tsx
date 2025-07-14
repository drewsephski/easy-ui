'use client';

import { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color: ColorResult) => {
    onChange(color.hex);
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className="p-1 bg-white rounded-md border border-gray-300 border-solid cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="w-8 h-5 rounded-sm"
          style={{ backgroundColor: color }}
        />
      </div>
      {displayColorPicker ? (
        <div className="absolute z-10 mt-2">
          <div
            className="fixed inset-0"
            onClick={handleClose}
          />
          <SketchPicker color={color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
}
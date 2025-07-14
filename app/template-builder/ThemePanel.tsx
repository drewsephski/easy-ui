'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const defaultInputClasses = 'mt-1 block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background sm:text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150';

export const ThemePanel = () => {
  const { theme, setTheme } = useTheme();

  const handleColorChange = (name: string, value: string) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      colors: { ...prevTheme.colors, [name]: value },
    }));
  };

  const handleTypographyChange = (name: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setTheme(prevTheme => ({
        ...prevTheme,
        typography: { ...prevTheme.typography, [name]: numValue },
      }));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="mb-3 text-base font-semibold">Color Palette</h3>
        <div className="space-y-3">
          {Object.entries(theme.colors).map(([name, value]) => (
            <div key={name}>
              <label className="block text-sm font-medium capitalize text-muted-foreground">{name}</label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(name, e.target.value)}
                  className="p-0 w-10 h-10 rounded-md border-none cursor-pointer bg-input"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(name, e.target.value)}
                  className={cn(defaultInputClasses, "flex-1")}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-solid border-border">
        <h3 className="mb-3 text-base font-semibold">Typography</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Base Font Size (px)</label>
            <input
              type="number"
              value={theme.typography.baseFontSize}
              onChange={(e) => handleTypographyChange('baseFontSize', e.target.value)}
              className={defaultInputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Scale Ratio</label>
            <input
              type="number"
              step="0.05"
              value={theme.typography.scaleRatio}
              onChange={(e) => handleTypographyChange('scaleRatio', e.target.value)}
              className={defaultInputClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

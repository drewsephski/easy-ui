'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface Theme {
  colors: Record<string, string>;
  typography: {
    baseFontSize: number;
    scaleRatio: number;
  };
}

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  generateCssProperties: () => string;
}

const defaultTheme: Theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    text: '#e5e7eb',
    background: '#1f2937',
    surface: '#374151',
  },
  typography: {
    baseFontSize: 16,
    scaleRatio: 1.25,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const generateCssProperties = useMemo(() => {
    return () => {
      let css = ':root {\\n';
      // Colors
      for (const [name, value] of Object.entries(theme.colors)) {
        css += `  --color-${name}: ${value};\\n`;
      }
      // Typography
      css += `  --font-size-base: ${theme.typography.baseFontSize}px;\\n`;
      css += `  --font-size-sm: ${theme.typography.baseFontSize / theme.typography.scaleRatio}px;\\n`;
      css += `  --font-size-lg: ${theme.typography.baseFontSize * theme.typography.scaleRatio}px;\\n`;
      css += `  --font-size-xl: ${theme.typography.baseFontSize * Math.pow(theme.typography.scaleRatio, 2)}px;\\n`;
      css += `  --font-size-2xl: ${theme.typography.baseFontSize * Math.pow(theme.typography.scaleRatio, 3)}px;\\n`;
      css += '}';
      return css;
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, generateCssProperties }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

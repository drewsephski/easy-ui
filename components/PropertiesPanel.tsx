'use client';

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { ComponentPropConfig } from '@/types/template-builder';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  CircleDot,
  ArrowRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  FlexGridEditor,
  MarginPaddingEditor,
} from './visual-editors';
import { ColorPicker } from './visual-editors/ColorPicker';
import { TransactionEditor } from './visual-editors/TransactionEditor';
import { BentoGridEditor } from './visual-editors/BentoGridEditor';

interface SelectedComponent {
  id: string;
  props: Record<string, any>;
  type: string;
  style: Record<string, any>;
}

interface PropertiesPanelProps {
  selectedComponent: SelectedComponent | null;
  handlePropChange: (id: string, propName: string, value: unknown) => void;
  onClear: () => void;
  className?: string;
  headerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  customRenderers?: Record<string, (props: {
    value: any;
    onChange: (value: any) => void;
    config: ComponentPropConfig;
  }) => React.ReactNode>;
  propsDefinition?: z.ZodType<any, any>;
}

const defaultInputClasses = 'mt-1 block w-full px-3 py-2 bg-input border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background sm:text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150';

export function PropertiesPanel({
  selectedComponent,
  handlePropChange,
  onClear,
  className = '',
  headerClassName = '',
  labelClassName = 'block text-sm font-medium text-neutral-300',
  inputClassName = '',
  customRenderers = {},
  propsDefinition
}: PropertiesPanelProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    General: true,
    Spacing: true,
    Layout: true,
    Alignment: true,
    Position: true,
  });

  const parsedProps = useMemo(() => {
    if (!propsDefinition || !selectedComponent) return {};
    const shape = (propsDefinition as z.ZodObject<any>).shape;
    return Object.entries(shape).reduce((acc, [key, value]) => {
      try {
        acc[key] = JSON.parse((value as z.ZodTypeAny).description || '{}');
      } catch (e) {
        acc[key] = {};
      }
      return acc;
    }, {} as Record<string, any>);
  }, [propsDefinition, selectedComponent]);

  const groupedProps = useMemo(() => {
    return Object.entries(parsedProps).reduce((acc, [propName, config]) => {
      const group = config.group || 'General';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push([propName, config]);
      return acc;
    }, {} as Record<string, [string, any][]>);
  }, [parsedProps]);

  const validateField = useCallback((propName: string, value: any, config: ComponentPropConfig) => {
    if (config.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }
    if (config.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) return 'Please enter a valid number';
      if (config.min !== undefined && numValue < config.min) return `Must be at least ${config.min}`;
      if (config.max !== undefined && numValue > config.max) return `Must be at most ${config.max}`;
    }
    if (config.validate) {
      return config.validate(value);
    }
    return null;
  }, []);

  const handleChange = useCallback((propName: string, value: any, config: ComponentPropConfig) => {
    const error = validateField(propName, value, config);
    setErrors(prev => ({ ...prev, [propName]: error || '' }));
    if (!error || (value === '' && !config.required)) {
      handlePropChange(selectedComponent!.id, propName, value);
    }
  }, [handlePropChange, selectedComponent, validateField]);

  const handleResetProperty = (propName: string, config: ComponentPropConfig) => {
    handleChange(propName, config.default, config);
  };

  if (!selectedComponent) {
    return null;
  }

  const renderInput = (propName: string, config: ComponentPropConfig) => {
      if (config.displayCondition && !config.displayCondition(selectedComponent.props)) {
        return null;
      }
  
      const value = selectedComponent.props[propName] !== undefined
        ? selectedComponent.props[propName]
        : config.default;
  
      const commonProps = {
        value: value ?? '',
        onChange: (newValue: any) => handleChange(propName, newValue, config),
        className: cn(defaultInputClasses, inputClassName, {
          'border-red-500': errors[propName],
          'opacity-50 cursor-not-allowed': config.disabled,
        }),
        disabled: config.disabled,
        placeholder: config.placeholder,
      };
  
      if (config.render) {
        return config.render({ value, onChange: (newValue) => handleChange(propName, newValue, config), config });
      }
      
      if (customRenderers?.[propName]) {
        return customRenderers[propName]({ value, onChange: (newValue) => handleChange(propName, newValue, config), config });
      }
  
      switch (config.type) {
        case 'boolean':
          return (
            <div className="flex items-center h-10">
              <input type="checkbox" checked={!!value} onChange={(e) => handleChange(propName, e.target.checked, config)} className={cn("w-4 h-4 text-indigo-500 rounded border-neutral-600 bg-neutral-800 focus:ring-indigo-500 focus:ring-offset-neutral-900", inputClassName)} />
            </div>
          );
        case 'select':
          return (
            <Select onValueChange={(newValue) => handleChange(propName, newValue, config)} value={value}>
              <SelectTrigger className={cn(defaultInputClasses, inputClassName)}>
                <SelectValue placeholder={config.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option.value as string} value={option.value as string}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'array':
          return <textarea {...commonProps} rows={5} onChange={(e) => handleChange(propName, e.target.value.split('\n'), config)} placeholder="Enter array items, one per line" />;
        case 'color':
          return (
            <div className="flex gap-2 items-center">
              <ColorPicker color={value} onChange={(newColor) => handleChange(propName, newColor, config)} />
              <input type="text" value={value} onChange={(e) => handleChange(propName, e.target.value, config)} className={cn("flex-1", commonProps.className)} />
            </div>
          );
        case 'number':
          return (
            <div className="flex gap-2 items-center">
              <Slider
                value={[value]}
                onValueChange={([newValue]) => handleChange(propName, newValue, config)}
                min={config.min}
                max={config.max}
                step={config.step}
                className="flex-1"
              />
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(propName, Number(e.target.value), config)}
                min={config.min}
                max={config.max}
                step={config.step}
                className="w-20"
              />
            </div>
          );
        default:
          return <input type="text" {...commonProps} onChange={(e) => handleChange(propName, e.target.value, config)} />;
      }
    };

  return (
    <div className={cn("flex flex-col h-full border-l bg-sidebar-background text-sidebar-foreground border-sidebar-border", className)}>
      <div className="p-4 border-b border-sidebar-border">
        <h2 className={cn("text-lg font-semibold", headerClassName)}>Properties</h2>
      </div>
      <div className="overflow-y-auto flex-1 p-4 space-y-6">
        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-blue-400">Page</span>
            <span className="mx-2">/</span>
            <span>{selectedComponent.type}</span>
          </div>

          <div className="space-y-4">
            {/* Spacing Group */}
            <div key="spacing-group">
              <button className="flex justify-between items-center py-2 w-full text-left transition-colors duration-150 hover:text-foreground" onClick={() => setOpenGroups((prev) => ({ ...prev, Spacing: !prev.Spacing }))}>
                <h3 className="font-semibold">Spacing</h3>
                {openGroups['Spacing'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openGroups['Spacing'] && (
                <div className="pt-2 space-y-5">
                  <MarginPaddingEditor
                    margin={selectedComponent.style.margin || {}}
                    padding={selectedComponent.style.padding || {}}
                    onChange={(property, value) => handlePropChange(selectedComponent!.id, `style.${property}`, value)}
                  />
                </div>
              )}
            </div>

            {/* Layout Group */}
            <div key="layout-group">
              <button className="flex justify-between items-center py-2 w-full text-left transition-colors duration-150 hover:text-foreground" onClick={() => setOpenGroups((prev) => ({ ...prev, Layout: !prev.Layout }))}>
                <h3 className="font-semibold">Layout</h3>
                {openGroups['Layout'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openGroups['Layout'] && (
                <div className="pt-2 space-y-5">
                  <FlexGridEditor
                    display={selectedComponent.style.display}
                    {...selectedComponent.style}
                    onChange={(prop, value) => handlePropChange(selectedComponent!.id, `style.${prop}`, value)}
                  />
                </div>
              )}
            </div>

            {/* Alignment Group */}
            <div key="alignment-group">
              <button className="flex justify-between items-center py-2 w-full text-left transition-colors duration-150 hover:text-foreground" onClick={() => setOpenGroups((prev) => ({ ...prev, Alignment: !prev.Alignment }))}>
                <h3 className="font-semibold">Quick Align</h3>
                {openGroups['Alignment'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openGroups['Alignment'] && (
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-1 p-1 w-max rounded-md bg-input">
                    {[
                      { icon: ArrowUpLeft, justify: 'flex-start', align: 'flex-start' },
                      { icon: ArrowUp, justify: 'center', align: 'flex-start' },
                      { icon: ArrowUpRight, justify: 'flex-end', align: 'flex-start' },
                      { icon: ArrowLeft, justify: 'flex-start', align: 'center' },
                      { icon: CircleDot, justify: 'center', align: 'center' },
                      { icon: ArrowRight, justify: 'flex-end', align: 'center' },
                      { icon: ArrowDownLeft, justify: 'flex-start', align: 'flex-end' },
                      { icon: ArrowDown, justify: 'center', align: 'flex-end' },
                      { icon: ArrowDownRight, justify: 'flex-end', align: 'flex-end' },
                    ].map(({ icon: Icon, justify, align }) => (
                      <button
                        key={`${justify}-${align}`}
                        onClick={() => {
                          handlePropChange(selectedComponent!.id, 'style.justifyContent', justify);
                          handlePropChange(selectedComponent!.id, 'style.alignItems', align);
                        }}
                        className={cn(
                          'p-2 rounded-md transition-colors duration-150 hover:bg-neutral-700 text-muted-foreground hover:text-foreground',
                          selectedComponent.style.justifyContent === justify && selectedComponent.style.alignItems === align && 'bg-blue-500/20 text-blue-300'
                        )}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Position Group */}
            <div key="position-group">
              <button className="flex justify-between items-center py-2 w-full text-left transition-colors duration-150 hover:text-foreground" onClick={() => setOpenGroups((prev) => ({ ...prev, Position: !prev.Position }))}>
                <h3 className="font-semibold">Position</h3>
                {openGroups['Position'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {openGroups['Position'] && (
                <div className="pt-2 space-y-4">
                  <Select onValueChange={(value) => handlePropChange(selectedComponent!.id, 'style.position', value)} value={selectedComponent.style.position || 'static'}>
                    <SelectTrigger className={cn(defaultInputClasses, inputClassName)}>
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {['static', 'relative', 'absolute', 'fixed', 'sticky'].map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedComponent.style.position !== 'static' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                        <div key={side}>
                          <label className="text-xs text-muted-foreground">{side.charAt(0).toUpperCase() + side.slice(1)}</label>
                          <Input
                            type="text"
                            value={selectedComponent.style[side] || ''}
                            onChange={(e) => handlePropChange(selectedComponent!.id, `style.${side}`, e.target.value)}
                            className={cn(defaultInputClasses, inputClassName, "h-8")}
                            placeholder="auto"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }


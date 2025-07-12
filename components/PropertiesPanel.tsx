'use client';

import { useState, useCallback } from 'react';
import { componentProps } from '@/lib/component-props';
import { ComponentType, ComponentPropConfig, ComponentProps } from '@/types/template-builder';
import { cn } from '@/lib/utils';

// Extended prop types


interface PropertiesPanelProps {
  selectedComponent: ComponentType | null;
  handlePropChange: (id: string, propName: string, value: unknown) => void;
  onClear: () => void;
  className?: string;
  headerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  // Allow custom rendering for specific prop types
  customRenderers?: Record<string, (props: {
    value: any;
    onChange: (value: any) => void;
    config: ComponentPropConfig;
  }) => React.ReactNode>;
}

const defaultInputClasses = 'mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 sm:text-sm';

export function PropertiesPanel({
  selectedComponent,
  handlePropChange,
  onClear,
  className = '',
  headerClassName = '',
  labelClassName = 'block text-sm font-medium text-gray-700 dark:text-gray-300',
  inputClassName = '',
  customRenderers = {}
}: PropertiesPanelProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors(prev => ({
      ...prev,
      [propName]: error || ''
    }));

    // Only update if validation passes or field is not required
    if (!error || (value === '' && !config.required)) {
      handlePropChange(
        selectedComponent!.id,
        propName,
        value
      );
    }
  }, [handlePropChange, selectedComponent, validateField]);

  if (!selectedComponent) {
    return (
      <div className={cn("col-span-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-4", className)}>
        <h2 className={cn("text-lg font-semibold mb-4", headerClassName)}>Properties</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a component to edit its properties.
        </p>
      </div>
    );
  }

  const componentKey = selectedComponent.content as keyof typeof componentProps;
  const propsDefinition = componentKey in componentProps 
    ? componentProps[componentKey] 
    : {} as Record<string, ComponentPropConfig>;

  const renderInput = (propName: string, config: ComponentPropConfig) => {
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

    // Use custom renderer if provided
    if (customRenderers[propName]) {
      return customRenderers[propName]({
        value,
        onChange: (newValue) => handleChange(propName, newValue, config),
        config
      });
    }

    // Use type-specific renderer
    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center h-10">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(propName, e.target.checked, config)}
              className={cn("h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded", inputClassName)}
            />
          </div>
        );

      case 'select':
        return (
          <select {...commonProps}>
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'array':        return (          <textarea            {...commonProps}            rows={5}            onChange={(e) => handleChange(propName, e.target.value.split('\n'), config)}            placeholder="Enter array items, one per line"          />        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...commonProps}
              className={cn("h-10 w-16 p-1 rounded", inputClassName)}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(propName, e.target.value, config)}
              className={cn("flex-1", commonProps.className)}
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            min={config.min}
            max={config.max}
            step={config.step}
            onChange={(e) => handleChange(propName, Number(e.target.value), config)}
          />
        );

      case 'string':
      default:
        return (
          <input
            type="text"
            {...commonProps}
            onChange={(e) => handleChange(propName, e.target.value, config)}
          />
        );
    }
  };

  return (
    <div className={cn("col-span-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={cn("text-lg font-semibold", headerClassName)}>Properties</h2>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Clear selection"
        >
          Clear
        </button>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-4 text-gray-900 dark:text-gray-100">
          {selectedComponent.content}
        </p>
        
        <div className="space-y-5">
          {Object.entries(propsDefinition).map(([propName, propConfig]) => {
            if (propConfig.hidden) return null;
            
            return (
              <div key={propName} className="space-y-1">
                <label className={cn(labelClassName, { 'text-red-500': errors[propName] })}>
                  {propConfig.label || propName.charAt(0).toUpperCase() + propName.slice(1)}
                  {propConfig.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {propConfig.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {propConfig.description}
                  </p>
                )}
                
                {renderInput(propName, propConfig)}
                
                {errors[propName] && (
                  <p className="text-xs text-red-500">{errors[propName]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

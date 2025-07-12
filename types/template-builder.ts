export type DropZoneType = 'header' | 'main' | 'sidebar' | 'footer' | 'default';

export interface ComponentType {
  id: string;
  content: string;
  props: Record<string, unknown>;
  zone?: DropZoneType;
}

export interface InitialComponentType {
  id: string;
  content: string;
  category: string;
  icon?: React.ElementType<{ size?: number; className?: string }>;
}

export interface ComponentPropConfig {
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'textarea' | 'array';
  default: any;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  validate?: (value: any) => string | null;
  hidden?: boolean;
  label?: string;
  description?: string;
  render?: (
    props: {
      value: any;
      onChange: (value: any) => void;
      config: ComponentPropConfig;
    }
  ) => React.ReactNode;
}

export type ComponentMap = {
  [key: string]: React.ComponentType<any>;
};
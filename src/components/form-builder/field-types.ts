import type { FieldType } from '@/types';
import {
  Type,
  Mail,
  Hash,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  Calendar,
  Upload,
  Star,
  ToggleRight,
  Phone,
  Globe,
} from 'lucide-react';

export interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const fieldTypes: FieldTypeConfig[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    description: 'Single line text input',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email address input',
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric input',
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: AlignLeft,
    description: 'Multi-line text input',
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: ChevronDown,
    description: 'Select from options',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: CheckSquare,
    description: 'Multiple choice',
  },
  {
    type: 'radio',
    label: 'Radio Button',
    icon: Circle,
    description: 'Single choice',
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: Calendar,
    description: 'Date selection',
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    description: 'File upload field',
  },
  {
    type: 'rating',
    label: 'Elite Rating',
    icon: Star,
    description: 'Premium satisfaction scale',
  },
  {
    type: 'switch',
    label: 'Power Toggle',
    icon: ToggleRight,
    description: 'Binary switch interaction',
  },
  {
    type: 'phone',
    label: 'Mobile Contact',
    icon: Phone,
    description: 'Global phone connectivity',
  },
  {
    type: 'url',
    label: 'Digital Link',
    icon: Globe,
    description: 'Website or social profile',
  },
];

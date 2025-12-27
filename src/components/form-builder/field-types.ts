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
  Image as ImageIcon,
  PenTool,
  Layout,
  ArrowRightCircle,
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
    description: 'Secure document & media upload',
  },
  {
    type: 'image',
    label: 'Image Upload',
    icon: ImageIcon,
    description: 'Photo and image submission',
  },
  {
    type: 'signature',
    label: 'Digital Signature',
    icon: PenTool,
    description: 'E-signature for digital signing',
  },
  {
    type: 'rating',
    label: 'Star Rating',
    icon: Star,
    description: 'Satisfaction scale interaction',
  },
  {
    type: 'switch',
    label: 'Boolean Switch',
    icon: ToggleRight,
    description: 'Binary toggle interaction',
  },
  {
    type: 'phone',
    label: 'Phone Number',
    icon: Phone,
    description: 'Contact number input',
  },
  {
    type: 'url',
    label: 'Website Link',
    icon: Globe,
    description: 'URL or social profile link',
  },
  {
    type: 'section',
    label: 'Form Section',
    icon: Layout,
    description: 'Group fields into logical blocks',
  },
  {
    type: 'page_break',
    label: 'Page Break',
    icon: ArrowRightCircle,
    description: 'Split form into multi-step pages',
  },
];

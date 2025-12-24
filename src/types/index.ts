export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// User and Auth Types
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Team Types
export type TeamMemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  logo_url: string | null;
  brand_color: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  created_at: string;
  profile?: Profile;
}

// Form Types
export type FormStatus = 'draft' | 'published' | 'archived';

export type FieldType = 
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ConditionalLogic {
  field_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show' | 'hide';
}

export interface FieldValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  custom_error?: string;
}

export interface FormField {
  id: string;
  form_id: string;
  field_type: FieldType;
  label: string;
  placeholder: string | null;
  help_text: string | null;
  required: boolean;
  options: FieldOption[] | null;
  validation: FieldValidation | null;
  conditional_logic: ConditionalLogic[] | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FormSettings {
  submit_button_text?: string;
  success_message?: string;
  redirect_url?: string;
  allow_multiple_submissions?: boolean;
  show_progress_bar?: boolean;
}

export interface FormBranding {
  logo_url?: string;
  primary_color?: string;
  font_family?: string;
  custom_css?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  team_id: string | null;
  created_by: string;
  status: FormStatus;
  settings: FormSettings;
  branding: FormBranding;
  is_template: boolean;
  template_name: string | null;
  created_at: string;
  updated_at: string;
  fields?: FormField[];
  team?: Team;
}

// Submission Types
export type SubmissionStatus = 'pending' | 'processed' | 'failed';

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  status: SubmissionStatus;
  ip_address: string | null;
  user_agent: string | null;
  submitted_at: string;
}

// Email Config Types
export interface EmailConfig {
  id: string;
  form_id: string;
  enabled: boolean;
  recipients: string[];
  subject: string;
  body_template: string | null;
  created_at: string;
  updated_at: string;
}

// Webhook Types
export interface Webhook {
  id: string;
  form_id: string;
  url: string;
  enabled: boolean;
  secret: string | null;
  created_at: string;
  updated_at: string;
}

// Form Builder Types
export interface DraggedField {
  type: FieldType;
  label: string;
}

export interface FormBuilderState {
  form: Form | null;
  fields: FormField[];
  selectedField: FormField | null;
  isDirty: boolean;
}

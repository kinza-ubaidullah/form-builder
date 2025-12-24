import { supabase } from './supabase';
import type { Form, FormField, Submission, Team, TeamMember, EmailConfig, Webhook, Profile } from '@/types';

// Forms API
export const formsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('forms')
      .select('*, team:teams(*)')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('forms')
      .select('*, team:teams(*), fields:form_fields(*)')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(form: Partial<Form>) {
    const { data, error } = await supabase
      .from('forms')
      .insert({
        title: form.title || 'Untitled Form',
        description: form.description || null,
        team_id: form.team_id || null,
        created_by: form.created_by!,
        status: form.status || 'draft',
        settings: form.settings || {},
        branding: form.branding || {},
        is_template: form.is_template || false,
        template_name: form.template_name || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Form>) {
    const { data, error } = await supabase
      .from('forms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('forms')
      .select('*, fields:form_fields(*)')
      .eq('is_template', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

// Form Fields API
export const formFieldsApi = {
  async getByFormId(formId: string) {
    const { data, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(field: Partial<FormField>) {
    const { data, error } = await supabase
      .from('form_fields')
      .insert({
        form_id: field.form_id!,
        field_type: field.field_type!,
        label: field.label || '',
        placeholder: field.placeholder || null,
        help_text: field.help_text || null,
        required: field.required || false,
        options: field.options || null,
        validation: field.validation || null,
        conditional_logic: field.conditional_logic || null,
        position: field.position || 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<FormField>) {
    const { data, error } = await supabase
      .from('form_fields')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('form_fields')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkUpdate(fields: Partial<FormField>[]) {
    const { data, error } = await supabase
      .from('form_fields')
      .upsert(fields.map(f => ({
        ...f,
        updated_at: new Date().toISOString(),
      })))
      .select();
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

// Submissions API
export const submissionsApi = {
  async getByFormId(formId: string, limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(submission: Partial<Submission>) {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        form_id: submission.form_id!,
        data: submission.data || {},
        status: submission.status || 'pending',
        ip_address: submission.ip_address || null,
        user_agent: submission.user_agent || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getStats(formId: string) {
    const { count, error } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);
    
    if (error) throw error;
    return { total: count || 0 };
  },
};

// Teams API
export const teamsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(team: Partial<Team>) {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: team.name || 'New Team',
        description: team.description || null,
        owner_id: team.owner_id!,
        logo_url: team.logo_url || null,
        brand_color: team.brand_color || '#4A90E2',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Team>) {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Team Members API
export const teamMembersApi = {
  async getByTeamId(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, profile:profiles(*)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async add(teamId: string, userId: string, role: string = 'viewer') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: role as any,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role: role as any })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Email Configs API
export const emailConfigsApi = {
  async getByFormId(formId: string) {
    const { data, error } = await supabase
      .from('email_configs')
      .select('*')
      .eq('form_id', formId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async upsert(config: Partial<EmailConfig>) {
    const { data, error } = await supabase
      .from('email_configs')
      .upsert({
        form_id: config.form_id!,
        enabled: config.enabled || false,
        recipients: config.recipients || [],
        subject: config.subject || '',
        body_template: config.body_template || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Webhooks API
export const webhooksApi = {
  async getByFormId(formId: string) {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(webhook: Partial<Webhook>) {
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        form_id: webhook.form_id!,
        url: webhook.url || '',
        enabled: webhook.enabled !== false,
        secret: webhook.secret || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Webhook>) {
    const { data, error } = await supabase
      .from('webhooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Profiles API
export const profilesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: role as any })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

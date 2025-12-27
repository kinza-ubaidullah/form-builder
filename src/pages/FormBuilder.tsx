import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formsApi, formFieldsApi, emailConfigsApi, webhooksApi } from '@/db/api';
import { FieldLibrary } from '@/components/form-builder/FieldLibrary';
import { FormCanvas } from '@/components/form-builder/FormCanvas';
import { FieldProperties } from '@/components/form-builder/FieldProperties';
import { ArrowLeft, Save, Eye, Loader2, Image as ImageIcon, Bell, Webhook as WebhookIcon, Zap, Trash2, Undo2, Redo2, CheckCircle2, Layout } from 'lucide-react';
import type { Form, FormField, EmailConfig, Webhook, FieldType } from '@/types';
import { EmbedCodeDialog as ShareModal } from '@/components/form-builder/EmbedCodeDialog';

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedFieldType, setDraggedFieldType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  const isNewForm = id === 'new';


  const createNewForm = async () => {
    try {
      setLoading(true);
      const newForm = await formsApi.create({
        title: 'Untitled Form',
        created_by: profile!.id,
        status: 'draft',
        settings: {},
        branding: {},
      });
      setForm(newForm);
      setFields([]);
      navigate(`/forms/${newForm.id}/edit`, { replace: true });
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadForm = async (formId: string) => {
    try {
      setLoading(true);
      const formData = await formsApi.getById(formId);
      if (!formData) {
        toast({
          title: 'Error',
          description: 'Form not found',
          variant: 'destructive',
        });
        navigate('/forms');
        return;
      }
      setForm(formData);

      const fieldsData = await formFieldsApi.getByFormId(formId);
      setFields(fieldsData);

      const emailData = await emailConfigsApi.getByFormId(formId);
      setEmailConfig(emailData);

      const webhookData = await webhooksApi.getByFormId(formId);
      setWebhooks(webhookData);
    } catch (error) {
      console.error('Failed to load form:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;

    try {
      setSaving(true);
      await formsApi.update(form.id, {
        title: form.title,
        description: form.description,
        status: form.status,
        settings: form.settings,
        branding: form.branding,
      });

      toast({
        title: 'Success',
        description: 'Form saved successfully',
      });
    } catch (error) {
      console.error('Failed to save form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save form',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isNewForm) {
      createNewForm();
    } else if (id && id !== 'new') {
      loadForm(id);
    }
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSave, form]);

  const handleFieldDragStart = (fieldType: string) => {
    setDraggedFieldType(fieldType);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedFieldType || !form) return;

    try {
      const newField = await formFieldsApi.create({
        form_id: form.id,
        field_type: draggedFieldType as FieldType,
        label: `New ${draggedFieldType} field`,
        position: fields.length,
        required: false,
        options: ['dropdown', 'checkbox', 'radio'].includes(draggedFieldType)
          ? [
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
          ]
          : null,
      });

      setFields([...fields, newField]);
      setSelectedFieldId(newField.id);
      toast({
        title: 'Success',
        description: 'Field added successfully',
      });
    } catch (error) {
      console.error('Failed to add field:', error);
      toast({
        title: 'Error',
        description: 'Failed to add field',
        variant: 'destructive',
      });
    } finally {
      setDraggedFieldType(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFieldUpdate = async (fieldId: string, updates: Partial<FormField>) => {
    try {
      await formFieldsApi.update(fieldId, updates);
      setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
    } catch (error) {
      console.error('Failed to update field:', error);
      toast({
        title: 'Error',
        description: 'Failed to update field',
        variant: 'destructive',
      });
    }
  };

  const handleFieldDelete = async (fieldId: string) => {
    try {
      await formFieldsApi.delete(fieldId);
      setFields(fields.filter((f) => f.id !== fieldId));
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
      toast({
        title: 'Success',
        description: 'Field deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete field:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete field',
        variant: 'destructive',
      });
    }
  };

  const handleFieldDuplicate = async (fieldId: string) => {
    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (!fieldToDuplicate || !form) return;

    try {
      const newField = await formFieldsApi.create({
        ...fieldToDuplicate,
        id: undefined, // Let DB generate new ID
        form_id: form.id,
        position: fields.length,
        label: `${fieldToDuplicate.label} (Copy)`
      });
      setFields([...fields, newField]);
      toast({ title: 'Success', description: 'Field duplicated' });
    } catch (error) {
      console.error('Failed to duplicate field:', error);
      toast({ title: 'Error', description: 'Failed to duplicate', variant: 'destructive' });
    }
  };

  const handleFieldMove = async (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    const [movedField] = newFields.splice(currentIndex, 1);
    newFields.splice(newIndex, 0, movedField);

    // Update positions in state immediately for UX
    setFields(newFields);

    // Sync with DB (optional: can be debounced or bulk updated)
    try {
      await Promise.all(newFields.map((f, i) => formFieldsApi.update(f.id, { position: i })));
    } catch (error) {
      console.error('Failed to sync positions:', error);
    }
  };

  const handleEmailConfigUpdate = async (updates: Partial<EmailConfig>) => {
    if (!form) return;
    try {
      const newConfig = await emailConfigsApi.upsert({
        ...emailConfig,
        ...updates,
        form_id: form.id,
      });
      setEmailConfig(newConfig);
      toast({ title: 'Success', description: 'Email configuration updated' });
    } catch (error) {
      console.error('Failed to update email config:', error);
      toast({ title: 'Error', description: 'Failed to update email config', variant: 'destructive' });
    }
  };

  const handleWebhookCreate = async (url: string) => {
    if (!form) return;
    try {
      const newWebhook = await webhooksApi.create({
        form_id: form.id,
        url,
        enabled: true,
      });
      setWebhooks([...webhooks, newWebhook]);
      toast({ title: 'Success', description: 'Webhook added' });
    } catch (error) {
      console.error('Failed to add webhook:', error);
      toast({ title: 'Error', description: 'Failed to add webhook', variant: 'destructive' });
    }
  };

  const handleWebhookUpdate = async (id: string, updates: Partial<Webhook>) => {
    try {
      const updated = await webhooksApi.update(id, updates);
      setWebhooks(webhooks.map(w => w.id === id ? updated : w));
      toast({ title: 'Success', description: 'Webhook updated' });
    } catch (error) {
      console.error('Failed to update webhook:', error);
      toast({ title: 'Error', description: 'Failed to update webhook', variant: 'destructive' });
    }
  };

  const handleWebhookDelete = async (id: string) => {
    try {
      await webhooksApi.delete(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
      toast({ title: 'Success', description: 'Webhook removed' });
    } catch (error) {
      console.error('Failed to delete webhook:', error);
      toast({ title: 'Error', description: 'Failed to delete webhook', variant: 'destructive' });
    }
  };


  const handleBrandingUpdate = (updates: Partial<NonNullable<Form['branding']>>) => {
    if (!form) return;
    setForm({
      ...form,
      branding: {
        ...(form.branding || {}),
        ...updates
      }
    });
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-slate-50/30 overflow-hidden">
        {/* Main Architectural Header */}
        <header className="h-16 border-b bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl hover:bg-slate-100 transition-all active:scale-95">
              <ArrowLeft className="h-4 w-4 text-slate-400" />
            </Button>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2196F3] italic">Architect Mode</span>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none">Active System</Badge>
              </div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{form.title || 'Untitled Blueprint'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mr-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white text-slate-400"><Undo2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white text-slate-400"><Redo2 className="h-4 w-4" /></Button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              {saving ? (
                <Loader2 className="h-3 w-3 text-[#2196F3] animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              )}
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                {saving ? 'Syncing...' : 'Auto-Saved'}
              </span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 mx-2" />

            <Button variant="outline" className="h-10 rounded-xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50" onClick={() => window.open(`/f/${form.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4 text-slate-400" />
              Preview
            </Button>
            <Button className="h-10 rounded-xl bg-slate-900 hover:bg-black text-white px-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all" onClick={() => setShowShareModal(true)}>
              <Save className="mr-2 h-4 w-4 text-[#2196F3]" />
              Deploy
            </Button>
          </div>
        </header>

        <Tabs defaultValue="build" className="flex-1 flex flex-col min-h-0 relative">
          <div className="h-14 border-b bg-white/50 backdrop-blur-sm px-6 flex items-center shrink-0 z-40">
            <TabsList className="bg-transparent border-none p-0 h-14 w-full justify-start gap-8">
              <TabsTrigger value="build" className="h-14 border-b-2 border-transparent data-[state=active]:border-[#2196F3] data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
                Architect
              </TabsTrigger>
              <TabsTrigger value="design" className="h-14 border-b-2 border-transparent data-[state=active]:border-[#2196F3] data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
                Aesthetics
              </TabsTrigger>
              <TabsTrigger value="integrations" className="h-14 border-b-2 border-transparent data-[state=active]:border-[#2196F3] data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
                Protocols
              </TabsTrigger>
              <TabsTrigger value="settings" className="h-14 border-b-2 border-transparent data-[state=active]:border-[#2196F3] data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
                Environment
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 relative min-h-0 overflow-hidden">
            <TabsContent value="build" className="absolute inset-0 flex h-full m-0 p-0 border-none">
              <div className="flex-1 flex min-h-0 h-full">
                {/* Left Panel: Library */}
                <aside className="w-[320px] border-r bg-white h-full overflow-y-auto px-6 py-8 custom-scrollbar shrink-0">
                  <FieldLibrary onFieldDragStart={handleFieldDragStart} />
                </aside>

                {/* Center Panel: Canvas */}
                <main className="flex-1 bg-slate-50/50 h-full overflow-y-auto px-12 py-12 custom-scrollbar">
                  <div className="max-w-3xl mx-auto">
                    <FormCanvas
                      fields={fields}
                      selectedFieldId={selectedFieldId}
                      onFieldSelect={setSelectedFieldId}
                      onFieldDelete={handleFieldDelete}
                      onFieldDuplicate={handleFieldDuplicate}
                      onFieldMove={handleFieldMove}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      branding={form.branding}
                    />
                  </div>
                </main>

                {/* Right Panel: Properties */}
                <aside className="w-[360px] border-l bg-slate-50/30 h-full overflow-y-auto custom-scrollbar shrink-0">
                  <FieldProperties
                    field={selectedField}
                    fields={fields}
                    onUpdate={(updates) =>
                      selectedField && handleFieldUpdate(selectedField.id, updates)
                    }
                  />
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="design" className="absolute inset-0 h-full m-0 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[40px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Visual Assets</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Identity and Brand Protocol</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Brand Logo URL</Label>
                        <div className="flex gap-3">
                          <Input
                            value={form?.branding?.logo_url || ''}
                            onChange={(e) => handleBrandingUpdate({ logo_url: e.target.value })}
                            placeholder="https://brand.com/logo.png"
                            className="h-11 rounded-xl border-2 border-slate-50 focus:border-primary font-bold"
                          />
                          <div className="w-11 h-11 shrink-0 bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center justify-center overflow-hidden">
                            {form?.branding?.logo_url ? (
                              <img src={form.branding.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Identity Color</Label>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[32px] border-2 border-slate-100/50">
                          <input
                            type="color"
                            className="w-14 h-14 rounded-2xl border-none cursor-pointer p-0 bg-transparent"
                            value={form?.branding?.primary_color || '#2196F3'}
                            onChange={(e) => handleBrandingUpdate({ primary_color: e.target.value })}
                          />
                          <div className="flex-1">
                            <p className="text-[10px] font-black tracking-widest uppercase text-slate-900 mb-1">Color Palette</p>
                            <code className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{form?.branding?.primary_color || '#2196F3'}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[40px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Form Geometry</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Structural parameters and typography</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Radius Integrity</Label>
                        <Select
                          value={form?.branding?.border_radius || 'large'}
                          onValueChange={(val) => handleBrandingUpdate({ border_radius: val as any })}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-2 border-slate-50 focus:border-primary font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sharp Architecture (0px)</SelectItem>
                            <SelectItem value="medium">Balanced (8px)</SelectItem>
                            <SelectItem value="large">Modern (20px)</SelectItem>
                            <SelectItem value="full">Organic (999px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Font Framework</Label>
                        <Select
                          value={form?.branding?.font_family || 'inter'}
                          onValueChange={(val) => handleBrandingUpdate({ font_family: val })}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-2 border-slate-50 focus:border-primary font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter (Global Default)</SelectItem>
                            <SelectItem value="roboto">Roboto (Dynamic)</SelectItem>
                            <SelectItem value="outfit">Outfit (Geometric)</SelectItem>
                            <SelectItem value="playfair">Playfair (High-End)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="absolute inset-0 h-full m-0 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-white p-12 rounded-[40px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 space-y-10">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Automated Protocols</h3>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase italic">External connectivity layer</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Email Dispatch */}
                    <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100/50 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-primary">
                            <Bell className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 uppercase italic tracking-tight">Email Dispatch</h4>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Notification Protocol</span>
                          </div>
                        </div>
                        <Switch
                          checked={emailConfig?.enabled}
                          onCheckedChange={(enabled) => handleEmailConfigUpdate({ enabled })}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Target Recipients (CSV)</Label>
                        <Input
                          placeholder="architect@nexus.system"
                          value={emailConfig?.recipients.join(', ')}
                          onBlur={(e) => handleEmailConfigUpdate({ recipients: e.target.value.split(',').map(s => s.trim()) })}
                          className="h-11 rounded-xl border-2 border-white shadow-sm font-bold"
                        />
                      </div>
                    </div>

                    {/* Webhook Engine */}
                    <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-900/10 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md text-primary">
                            <WebhookIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-black uppercase tracking-tight italic">Webhook Engine</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">External API Relay</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            const url = prompt('Enter Webhook URL:');
                            if (url) handleWebhookCreate(url);
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-[#2196F3] hover:bg-white/5"
                        >
                          + Add Relay
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {webhooks.length === 0 ? (
                          <div className="py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                            <Zap className="h-5 w-5 text-white/10 mb-2" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No Active Relays Configured</p>
                          </div>
                        ) : (
                          webhooks.map((webhook) => (
                            <div key={webhook.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-bold text-slate-300 truncate max-w-[400px]">{webhook.url}</span>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Protocol Active</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <Switch
                                  checked={webhook.enabled}
                                  onCheckedChange={(enabled) => handleWebhookUpdate(webhook.id, { enabled })}
                                  className="data-[state=checked]:bg-primary"
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleWebhookDelete(webhook.id)} className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-400/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="absolute inset-0 h-full m-0 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-white p-12 rounded-[40px] border-2 border-slate-100 shadow-xl shadow-slate-200/20 space-y-12">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Core Configuration</h3>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase italic">Base form parameters</p>
                  </div>
                  <div className="space-y-8">
                    <div className="grid gap-3 p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100/50">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Deployment Title</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="h-14 rounded-2xl text-xl font-black italic bg-white border-2 border-white shadow-sm focus:border-primary transition-all"
                      />
                    </div>
                    <div className="grid gap-3 p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100/50">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Post-Submission Routing</Label>
                      <div className="relative group">
                        <Input
                          value={form.settings?.redirect_url || ''}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, redirect_url: e.target.value } })}
                          className="h-14 rounded-2xl bg-white border-2 border-white shadow-sm focus:border-primary transition-all font-bold pl-12"
                          placeholder="https://nexus.system/thanks"
                        />
                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        formId={form.id}
      />
    </AppLayout>
  );
}

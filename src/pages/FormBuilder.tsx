import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { formsApi, formFieldsApi } from '@/db/api';
import { FieldLibrary } from '@/components/form-builder/FieldLibrary';
import { FormCanvas } from '@/components/form-builder/FormCanvas';
import { FieldProperties } from '@/components/form-builder/FieldProperties';
import { PremiumLock } from '@/components/common/PremiumLock';
import { ArrowLeft, Save, Eye, Loader2, Palette, Plug, Palette as PaletteIcon, Type, Image as ImageIcon, Bell, Webhook as WebhookIcon, Keyboard } from 'lucide-react';
import type { Form, FormField, FieldType } from '@/types';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col h-screen bg-slate-50/30">
        {/* Header */}
        <div className="border-b bg-white px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100">
                <Link to="/forms">
                  <ArrowLeft className="h-5 w-5 text-slate-400" />
                </Link>
              </Button>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Architecture</span>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="text-2xl font-black border-none p-0 h-auto focus-visible:ring-0 text-slate-900 tracking-tighter italic lg:min-w-[400px]"
                  placeholder="Form Title"
                />
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Draft Sync: Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                {['draft', 'published'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, status: s as any })}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      form.status === s ? "bg-white text-[#2196F3] shadow-sm" : "text-slate-500"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Button variant="outline" asChild className="rounded-xl border-2 font-black text-xs uppercase tracking-widest px-6 active:scale-95 transition-all">
                <Link to={`/form/${form.id}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4 text-[#2196F3]" />
                )}
                Commit Changes
              </Button>
              <div className="h-8 w-px bg-slate-100" />
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-[#2196F3] transition-colors" title="Keyboard Shortcuts (Ctrl+S to save)">
                <Keyboard className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Builder Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="build" className="h-full flex flex-col">
            <div className="border-b px-6">
              <TabsList>
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="design" className="gap-2"><Palette className="h-4 w-4" />Design</TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2"><Plug className="h-4 w-4" />Integrations</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="build" className="h-full m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-12 gap-6 p-6 h-full overflow-auto"
                >
                  {/* Field Library */}
                  <div className="col-span-12 lg:col-span-3">
                    <FieldLibrary onFieldDragStart={handleFieldDragStart} />
                  </div>

                  {/* Form Canvas */}
                  <div className="col-span-12 lg:col-span-6">
                    <FormCanvas
                      fields={fields}
                      selectedFieldId={selectedFieldId}
                      onFieldSelect={setSelectedFieldId}
                      onFieldDelete={handleFieldDelete}
                      onFieldDuplicate={handleFieldDuplicate}
                      onFieldMove={handleFieldMove}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    />
                  </div>

                  {/* Field Properties */}
                  <div className="col-span-12 lg:col-span-3">
                    <FieldProperties
                      field={selectedField}
                      onUpdate={(updates) =>
                        selectedField && handleFieldUpdate(selectedField.id, updates)
                      }
                    />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="design" className="p-6 m-0 h-full overflow-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PremiumLock title="Custom Branding" description="Upgrade to customize colors, fonts, and add your logo.">
                    <div className="max-w-xl mx-auto space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <PaletteIcon className="h-5 w-5" /> Brand Colors
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="h-10 w-full bg-primary rounded-md border flex items-center justify-center text-primary-foreground font-mono text-sm">#0F172A</div>
                          </div>
                          <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="h-10 w-full bg-background rounded-md border flex items-center justify-center text-foreground font-mono text-sm">#FFFFFF</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Type className="h-5 w-5" /> Typography
                        </h3>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select disabled>
                            <SelectTrigger><SelectValue placeholder="Inter (Default)" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inter">Inter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" /> Logo & Assets
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Logo</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                              <Button variant="secondary" size="sm">Upload Logo</Button>
                              <p className="text-xs text-muted-foreground mt-2">Recommended: 200x50px</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                            <div className="space-y-0.5">
                              <Label className="text-base">Remove 'Powered By'</Label>
                              <p className="text-xs text-muted-foreground">
                                Hide the FormBuilder branding in the footer
                              </p>
                            </div>
                            <Switch disabled />
                          </div>
                        </div>
                      </div>
                    </div>
                  </PremiumLock>
                </motion.div>
              </TabsContent>

              <TabsContent value="integrations" className="p-6 m-0 h-full overflow-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PremiumLock title="Integrations" description="Connect your form to your favorite tools and automate workflows.">
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="border rounded-lg p-6 flex items-start gap-4 hover:shadow-sm transition-shadow">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Bell className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Email Notifications</h3>
                            <Switch disabled />
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Receive an email every time a new submission is received.
                          </p>
                          <Input placeholder="Enter email address" disabled />
                        </div>
                      </div>

                      <div className="border rounded-lg p-6 flex items-start gap-4 hover:shadow-sm transition-shadow">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <WebhookIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Webhooks</h3>
                            <Switch disabled />
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Send submission data to an external URL (e.g. Zapier, Slack).
                          </p>
                          <Input placeholder="https://api.example.com/webhook" disabled />
                        </div>
                      </div>
                    </div>
                  </PremiumLock>
                </motion.div>
              </TabsContent>

              <TabsContent value="settings" className="p-6 space-y-6 overflow-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea
                      id="form-description"
                      value={form.description || ''}
                      onChange={(e) => setForm({ ...form, description: e.target.value || null })}
                      placeholder="Add a description for your form"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submit-button">Submit Button Text</Label>
                    <Input
                      id="submit-button"
                      value={form.settings?.submit_button_text || 'Submit'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          settings: { ...form.settings, submit_button_text: e.target.value },
                        })
                      }
                      placeholder="Submit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="success-message">Success Message</Label>
                    <Textarea
                      id="success-message"
                      value={form.settings?.success_message || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          settings: { ...form.settings, success_message: e.target.value },
                        })
                      }
                      placeholder="Thank you for your submission!"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
                    <Input
                      id="redirect-url"
                      value={form.settings?.redirect_url || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          settings: { ...form.settings, redirect_url: e.target.value },
                        })
                      }
                      placeholder="https://example.com/thank-you"
                    />
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

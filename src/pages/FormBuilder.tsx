import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/contexts/AuthContext';
import { formsApi, formFieldsApi } from '@/db/api';
import { FieldLibrary } from '@/components/form-builder/FieldLibrary';
import { FormCanvas } from '@/components/form-builder/FormCanvas';
import { FieldProperties } from '@/components/form-builder/FieldProperties';
import { DesignSettings } from '@/components/form-builder/DesignSettings';
import { Loader2, Undo2, Redo2, Bell, Menu, Monitor, Smartphone, Check, Tablet, Settings, LogOut, Home, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useHistory } from '@/hooks/use-history';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Form, FormField, FieldType } from '@/types';
import { EmbedCodeDialog as ShareModal } from '@/components/form-builder/EmbedCodeDialog';
import { DocumentationDialog } from '@/components/form-builder/DocumentationDialog';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { PlusSquare, Settings2 as SettingsIcon, Layout } from 'lucide-react';

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const {
    state: fields = [],
    setState: setFields,
    reset: resetFields,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<FormField[]>([]);

  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [isFieldsSheetOpen, setIsFieldsSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);

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
      resetFields([]);
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
      resetFields(fieldsData);


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
        variant: 'success',
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

  const debouncedForm = useDebounce(form, 1000);

  useEffect(() => {
    if (!debouncedForm || isNewForm) return;

    // Skip saving if it's just the initial load or no changes
    // Ideally we would compare with a 'lastSaved' state, but for now we'll just save
    // We rely on the fact that database updates are efficient
    const saveForm = async () => {
      try {
        setSaving(true);
        await formsApi.update(debouncedForm.id, {
          title: debouncedForm.title,
          description: debouncedForm.description,
          status: debouncedForm.status,
          settings: debouncedForm.settings,
          branding: debouncedForm.branding,
        });
        // Optional: Show a subtle indicator instead of a full toast for auto-saves
      } catch (error) {
        console.error('Failed to auto-save form:', error);
      } finally {
        setSaving(false);
      }
    };

    saveForm();
  }, [debouncedForm]);

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

  const handleAddField = async (fieldType: string) => {
    if (!form) return;

    try {
      const newField = await formFieldsApi.create({
        form_id: form.id,
        field_type: fieldType as FieldType,
        label: fieldType.charAt(0).toUpperCase() + fieldType.slice(1).replace('_', ' '),
        position: fields.length,
        required: false,
        options: ['dropdown', 'checkbox', 'radio'].includes(fieldType)
          ? [
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
          ]
          : null,
      });

      // Update state
      setFields([...fields, newField]);
      setSelectedFieldId(newField.id);

      toast({
        title: 'Success',
        description: `${fieldType} field added`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to add field:', error);
      toast({
        title: 'Error',
        description: 'Failed to add field',
        variant: 'destructive',
      });
    }
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
        variant: 'success',
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
      toast({ title: 'Success', description: 'Field duplicated', variant: 'success' });
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
    <AppLayout showSidebar={false}>
      <div className="h-[calc(100vh-1rem)] lg:h-full flex flex-col bg-background overflow-hidden">
        {/* Main Header */}
        <header className="h-16 border-b bg-white px-4 flex items-center justify-between shrink-0 z-50 shadow-sm relative">
          <div className="flex items-center gap-6">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-col justify-center gap-[3px] px-2 py-2.5 shadow-sm shadow-blue-200">
                <div className="h-0.5 w-full bg-white rounded-full opacity-90"></div>
                <div className="h-0.5 w-full bg-white rounded-full opacity-90"></div>
                <div className="h-0.5 w-full bg-white rounded-full opacity-90"></div>
              </div>
              <h1 className="text-lg font-bold text-slate-700 tracking-tight">Form Builder</h1>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {/* History Controls (Left) */}
            <div className="flex items-center gap-1 sm:gap-4">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 p-1.5 sm:p-0"
                title="Undo"
              >
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 p-1.5 sm:p-0"
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Redo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Save Status / Actions */}
            <div className={`flex items-center gap-1 border px-2 sm:px-3 py-1.5 rounded-md transition-all ${saving ? 'bg-slate-50 border-slate-100' : 'bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-100'}`}>
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                  <span className="text-xs font-semibold text-blue-600 hidden xs:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500 hidden xs:inline">Saved</span>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFieldsSheetOpen(true)}
                className="h-9 w-9 text-slate-500"
                title="Add Fields"
              >
                <PlusSquare className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsSheetOpen(true)}
                className="h-9 w-9 text-slate-500"
                title="Field Settings"
              >
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block"></div>

            {/* Preview Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 h-9 px-4 lg:px-6 rounded-md text-xs lg:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              onClick={() => window.open(`/form/${form.id}`, '_blank')}
            >
              <span className="hidden sm:inline">Preview</span>
              <Monitor className="sm:hidden h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden xs:block"></div>

            {/* Avatar */}
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-white shadow-sm cursor-pointer hover:ring-2 ring-slate-100 transition-all">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-[10px] sm:text-xs">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Icons */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('desktop')}
                className={`h-8 w-8 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('tablet')}
                className={`h-8 w-8 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('mobile')}
                className={`h-8 w-8 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-amber-500 p-0 hover:bg-amber-50 rounded-full relative">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-500/20" />
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                  </div>
                  <div className="p-4 grid gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">New Submission</p>
                      <p className="text-xs text-muted-foreground">You received a new submission on "Contact Form".</p>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">System Update</p>
                      <p className="text-xs text-muted-foreground">Form Builder updated to v2.0</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700 hover:bg-slate-100 rounded-md">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Library (Desktop) */}
          <aside className="w-[280px] border-r bg-white hidden lg:flex flex-col z-20 shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-800">Fields</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <FieldLibrary onAddField={handleAddField} />
            </div>
          </aside>

          {/* Center Panel: Canvas */}
          <main className="flex-1 bg-slate-50/50 flex flex-col relative overflow-hidden">
            <div className={`flex-1 overflow-y-auto overflow-x-hidden px-4 lg:px-12 py-10 custom-scrollbar flex flex-col items-center transition-all duration-300`}>
              <div
                className={cn(
                  "bg-white h-fit min-h-full pb-20 shadow-sm transition-all duration-300 origin-top overflow-x-auto custom-scrollbar",
                  viewMode === 'desktop' ? 'w-full max-w-4xl' :
                    viewMode === 'tablet' ? 'w-full max-w-[768px]' :
                      'w-full max-w-[375px]'
                )}
              >
                <FormCanvas
                  fields={fields}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={setSelectedFieldId}
                  onFieldDelete={handleFieldDelete}
                  onFieldDuplicate={handleFieldDuplicate}
                  onFieldMove={handleFieldMove}
                  branding={form.branding}
                  isBuilder={true}
                />
              </div>
            </div>
          </main>

          {/* Right Panel: Settings Tabs (Desktop) */}
          <aside className="w-[320px] border-l bg-white hidden lg:flex flex-col z-20 shadow-sm">
            <Tabs defaultValue="field" className="flex-1 flex flex-col">
              <div className="border-b px-2">
                <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-4">
                  <TabsTrigger value="field" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 text-xs font-medium uppercase tracking-wider">Field</TabsTrigger>
                  <TabsTrigger value="form" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 text-xs font-medium uppercase tracking-wider">Form</TabsTrigger>
                  <TabsTrigger value="design" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-2 text-xs font-medium uppercase tracking-wider">Design</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <TabsContent value="field" className="m-0 h-full">
                  {selectedField ? (
                    <FieldProperties
                      field={selectedField}
                      fields={fields}
                      onUpdate={(updates) =>
                        selectedField && handleFieldUpdate(selectedField.id, updates)
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
                        <Palette className="h-12 w-12 text-blue-500 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">Select a field to customize</p>
                      </div>
                      <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                        Click on any element in the canvas to edit its properties, validation, and logic.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="form" className="m-0 p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Form Title</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={form.description || ''}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="design" className="m-0 h-full">
                  <DesignSettings
                    branding={form.branding}
                    onChange={(updates) => setForm({ ...form, branding: updates })}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </aside>

          {/* Mobile Sheets */}
          <Sheet open={isFieldsSheetOpen} onOpenChange={setIsFieldsSheetOpen}>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Fields</SheetTitle>
                <SheetDescription className="sr-only">Choose a field to add to your form.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <FieldLibrary onAddField={(type) => { handleAddField(type); setIsFieldsSheetOpen(false); }} />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
            <SheetContent side="right" className="p-0 w-[320px]">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription className="sr-only">Customize your fields and form settings.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Tabs defaultValue="field" className="flex-1 flex flex-col">
                  <div className="border-b px-2">
                    <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-4">
                      <TabsTrigger value="field" className="px-2 text-xs">Field</TabsTrigger>
                      <TabsTrigger value="form" className="px-2 text-xs">Form</TabsTrigger>
                      <TabsTrigger value="design" className="px-2 text-xs">Design</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="p-0">
                    <TabsContent value="field" className="m-0">
                      {selectedField ? (
                        <FieldProperties
                          field={selectedField}
                          fields={fields}
                          onUpdate={(updates) =>
                            selectedField && handleFieldUpdate(selectedField.id, updates)
                          }
                        />
                      ) : (
                        <div className="p-8 text-center text-slate-400">Select a field</div>
                      )}
                    </TabsContent>
                    <TabsContent value="form" className="m-0 p-6 space-y-6">
                      <div className="space-y-4">
                        <Label>Form Title</Label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        <Label>Description</Label>
                        <Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      </div>
                    </TabsContent>
                    <TabsContent value="design" className="m-0">
                      <DesignSettings branding={form.branding} onChange={(updates) => setForm({ ...form, branding: updates })} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>

          {/* Live Preview Panel (Far Right) */}
          <aside className="w-[380px] border-l bg-slate-100 hidden 2xl:flex flex-col relative shadow-inner z-10">
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest opacity-50">Live Preview</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col items-center pt-8 bg-slate-200/50">
              <div
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 origin-top transition-all duration-300 ease-in-out"
                style={{
                  width: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%',
                  height: viewMode === 'mobile' ? '667px' : viewMode === 'tablet' ? '1024px' : 'auto',
                  transform: viewMode === 'desktop' ? 'scale(0.9)' : 'scale(1)',
                  minHeight: '800px'
                }}
              >
                {/* Fake Browser Header */}
                <div className="h-8 bg-slate-50 border-b flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 mx-2 bg-white h-5 rounded border border-slate-200 flex items-center px-2">
                    <div className="h-1.5 w-1/3 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-6 h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar">
                  <FormCanvas
                    fields={fields}
                    selectedFieldId={null}
                    onFieldSelect={() => { }}
                    onFieldDelete={() => { }}
                    onFieldDuplicate={() => { }}
                    onFieldMove={() => { }}
                    branding={form.branding}
                    isBuilder={false}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 text-center max-w-[200px]">
                This is how your users will see the form.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        formId={form.id}
      />

      <DocumentationDialog
        open={showDocumentation}
        onOpenChange={setShowDocumentation}
      />
    </AppLayout>
  );
}

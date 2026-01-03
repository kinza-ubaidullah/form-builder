import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Settings2, Sliders, Zap, Shield, Search, ChevronRight } from 'lucide-react';
import type { FormField, FieldOption } from '@/types';
import { fieldTypes } from './field-types';
import { ConditionalLogicDialog } from './ConditionalLogicDialog';
import { useDebounce } from '@/hooks/use-debounce';

const GENERAL_SETTINGS_VISIBILITY: Record<string, string[]> = {
  text: ['label', 'placeholder', 'help_text', 'required', 'col_span'],
  email: ['label', 'placeholder', 'help_text', 'required', 'col_span'],
  number: ['label', 'placeholder', 'help_text', 'required', 'col_span'],
  textarea: ['label', 'placeholder', 'help_text', 'required', 'col_span'],
  phone: ['label', 'help_text', 'required', 'col_span'],
  date: ['label', 'help_text', 'required', 'col_span'],
  url: ['label', 'placeholder', 'help_text', 'required', 'col_span'],
  dropdown: ['label', 'help_text', 'required', 'col_span', 'options'],
  checkbox: ['label', 'help_text', 'required', 'col_span', 'options'],
  radio: ['label', 'help_text', 'required', 'col_span', 'options'],
  file: ['label', 'help_text', 'required', 'col_span'],
  image: ['label', 'help_text', 'required', 'col_span'],
  signature: ['label', 'help_text', 'required', 'col_span'],
  rating: ['label', 'help_text', 'required', 'col_span'],
  switch: ['label', 'help_text', 'required', 'col_span'],
  section: ['label'],
  page_break: [],
};

interface FieldPropertiesProps {
  field: FormField | null;
  fields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldProperties({ field, fields, onUpdate }: FieldPropertiesProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);
  const [logicDialogOpen, setLogicDialogOpen] = useState(false);

  // Debounce the localField to prevent API spamming on keypress
  const debouncedField = useDebounce(localField, 500);

  useEffect(() => {
    setLocalField(field);
  }, [field?.id]); // Only reset when switching fields

  // When debounced field changes, trigger the update up the chain
  useEffect(() => {
    if (debouncedField && field) {
      // Find which keys are different to avoid unnecessary updates
      const updates: Partial<FormField> = {};

      const keys: (keyof FormField)[] = ['label', 'placeholder', 'help_text', 'required', 'col_span'];
      keys.forEach(key => {
        if (debouncedField[key] !== field[key]) {
          (updates as any)[key] = debouncedField[key];
        }
      });

      if (JSON.stringify(debouncedField.options) !== JSON.stringify(field.options)) updates.options = debouncedField.options;
      if (JSON.stringify(debouncedField.validation) !== JSON.stringify(field.validation)) updates.validation = debouncedField.validation;
      if (JSON.stringify(debouncedField.conditional_logic) !== JSON.stringify(field.conditional_logic)) updates.conditional_logic = debouncedField.conditional_logic;

      if (Object.keys(updates).length > 0) {
        onUpdate(updates);
      }
    }
  }, [debouncedField, onUpdate]); // Added onUpdate to dependencies

  const getFieldIcon = (fieldType: string) => {
    const config = fieldTypes.find((f) => f.type === fieldType);
    return config?.icon || Settings2;
  };

  if (!localField) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-background">
        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
          <Sliders className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-foreground font-medium mb-2">Field Settings</h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">Select a field to configure its properties.</p>
      </div>
    );
  }

  const handleChange = (key: keyof FormField, value: any) => {
    // Update local state immediately for responsiveness
    setLocalField(prev => prev ? ({ ...prev, [key]: value }) : null);
    // The useEffect will handle sending the update after debounce
  };

  const updateOption = (index: number, field: keyof FieldOption, value: string) => {
    if (!localField) return;
    const currentOptions = [...(localField.options || [])];
    currentOptions[index] = { ...currentOptions[index], [field]: value };
    handleChange('options', currentOptions);
  };

  const shouldShow = (setting: string) => {
    const config = GENERAL_SETTINGS_VISIBILITY[localField.field_type];
    return config ? config.includes(setting) : false;
  };

  const FieldIcon = getFieldIcon(localField.field_type);

  return (
    <div key={localField.id} className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between shrink-0 bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-md border text-primary shadow-sm">
            <FieldIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Field Settings</p>
            <h2 className="text-sm font-bold text-foreground capitalize">{localField.field_type.replace('_', ' ')}</h2>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="px-5 border-b shrink-0 bg-background">
          <TabsList className="w-full justify-start h-11 bg-transparent p-0 gap-6">
            {['General', 'Validation', 'Logic'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="h-11 rounded-none border-b-2 border-transparent px-0 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-xs font-semibold hover:text-foreground transition-colors"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <TabsContent value="general" className="m-0 space-y-6">
            <div className="space-y-5">
              {/* Main Inputs */}
              <div className="space-y-4">
                {shouldShow('label') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Label</Label>
                    <Input
                      value={localField.label}
                      onChange={(e) => handleChange('label', e.target.value)}
                      className="bg-white border-input h-9 text-sm"
                    />
                  </div>
                )}

                {shouldShow('placeholder') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Placeholder</Label>
                    <Input
                      value={localField.placeholder || ''}
                      onChange={(e) => handleChange('placeholder', e.target.value)}
                      placeholder="Input placeholder..."
                      className="bg-white border-input h-9 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Helper Text */}
              {shouldShow('help_text') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Help Text</Label>
                  <Textarea
                    value={localField.help_text || ''}
                    onChange={(e) => handleChange('help_text', e.target.value)}
                    className="bg-white border-input min-h-[80px] resize-none text-sm"
                    placeholder="Additional instructions..."
                  />
                </div>
              )}

              {/* Layout & Toggles */}
              {/* Layout & Toggles */}
              {(shouldShow('col_span') || shouldShow('required')) && (
                <div className="p-4 rounded-lg bg-secondary/30 border space-y-4">
                  {shouldShow('col_span') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Column Width</Label>
                      <Select value={String(localField.col_span || 4)} onValueChange={(val) => handleChange('col_span', Number(val))}>
                        <SelectTrigger className="bg-white h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">25% Width</SelectItem>
                          <SelectItem value="2">50% Width</SelectItem>
                          <SelectItem value="3">75% Width</SelectItem>
                          <SelectItem value="4">100% Width</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {shouldShow('required') && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-foreground">Required</Label>
                        <p className="text-[10px] text-muted-foreground">Mandatory field</p>
                      </div>
                      <Switch
                        checked={localField.required}
                        onCheckedChange={(val) => handleChange('required', val)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Options Editor */}
              {/* Options Editor */}
              {shouldShow('options') && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-foreground">Options</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] uppercase font-bold tracking-wider text-primary hover:text-primary/80 hover:bg-primary/10 px-2 rounded-sm"
                      onClick={() => {
                        const currentOpts = localField.options || [];
                        const opts = [...currentOpts, { label: `Option ${currentOpts.length + 1}`, value: `val_${currentOpts.length + 1}` }];
                        handleChange('options', opts);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {localField.options?.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            value={opt.label}
                            onChange={(e) => updateOption(i, 'label', e.target.value)}
                            className="h-8 bg-white border-input text-xs"
                            placeholder="Label"
                          />
                          <Input
                            value={opt.value}
                            onChange={(e) => updateOption(i, 'value', e.target.value)}
                            className="h-8 bg-secondary/30 border-transparent text-muted-foreground text-xs font-mono"
                            placeholder="Value"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            const opts = localField.options?.filter((_, idx) => idx !== i);
                            handleChange('options', opts);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="m-0 space-y-6">
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex gap-3">
              <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Validation Rules</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enforce data quality standards for this field. Rules will be checked before submission.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {['text', 'textarea', 'email', 'phone', 'url'].includes(localField.field_type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Min Length</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localField.validation?.min_length || ''}
                      onChange={(e) => handleChange('validation', { ...localField.validation, min_length: e.target.value ? Number(e.target.value) : undefined })}
                      className="bg-white border-slate-200 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Max Length</Label>
                    <Input
                      type="number"
                      placeholder="Any"
                      value={localField.validation?.max_length || ''}
                      onChange={(e) => handleChange('validation', { ...localField.validation, max_length: e.target.value ? Number(e.target.value) : undefined })}
                      className="bg-white border-slate-200 h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              {localField.field_type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Min Value</Label>
                    <Input
                      type="number"
                      placeholder="None"
                      value={localField.validation?.min_value || ''}
                      onChange={(e) => handleChange('validation', { ...localField.validation, min_value: e.target.value ? Number(e.target.value) : undefined })}
                      className="bg-white border-slate-200 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Max Value</Label>
                    <Input
                      type="number"
                      placeholder="None"
                      value={localField.validation?.max_value || ''}
                      onChange={(e) => handleChange('validation', { ...localField.validation, max_value: e.target.value ? Number(e.target.value) : undefined })}
                      className="bg-white border-slate-200 h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Regex Pattern</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={localField.validation?.pattern || ''}
                    onChange={(e) => handleChange('validation', { ...localField.validation, pattern: e.target.value })}
                    placeholder="e.g. ^[0-9]{5}$"
                    className="pl-9 bg-white border-slate-200 font-mono text-xs h-9 border-dashed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Example: ^[a-zA-Z]+$ for only letters</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logic" className="m-0 space-y-6">
            <div className="text-center space-y-6 pt-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-blue-500/20">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-200">Conditional Visibility</h4>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  Dynamically control field visibility based on user input values.
                </p>
              </div>

              {localField.conditional_logic ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-400 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Logic Active
                    </span>
                    <span className="text-emerald-500/50 font-mono text-[10px]">VER. 1.0</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setLogicDialogOpen(true)}
                      variant="outline"
                      className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleChange('conditional_logic', null)}
                      variant="outline"
                      className="w-full border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 hover:border-red-900/50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setLogicDialogOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                >
                  Configure Logic
                  <ChevronRight className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {localField && (
        <ConditionalLogicDialog
          open={logicDialogOpen}
          onOpenChange={setLogicDialogOpen}
          fields={fields}
          currentField={localField}
          onUpdate={(logic) => handleChange('conditional_logic', logic)}
        />
      )}
    </div>
  );
}

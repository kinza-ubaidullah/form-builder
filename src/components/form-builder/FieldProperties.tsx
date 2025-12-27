import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Plus, X, Settings2, Sliders, Zap, ShieldCheck } from 'lucide-react';
import type { FormField, FieldOption } from '@/types';
import { fieldTypes } from './field-types';
import { ConditionalLogicDialog } from './ConditionalLogicDialog';

interface FieldPropertiesProps {
  field: FormField | null;
  fields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldProperties({ field, fields, onUpdate }: FieldPropertiesProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);
  const [logicDialogOpen, setLogicDialogOpen] = useState(false);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const getFieldIcon = (fieldType: string) => {
    const config = fieldTypes.find((f) => f.type === fieldType);
    return config?.icon || Settings2;
  };

  if (!localField) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full p-4"
      >
        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100 p-8">
          <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <Sliders className="h-8 w-8 text-slate-200" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Property Blueprint</h3>
            <p className="text-slate-400 font-bold text-[10px] max-w-[180px] italic leading-relaxed uppercase tracking-widest">
              Select a component on the canvas to override defaults.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleChange = (key: keyof FormField, value: any) => {
    const updated = { ...localField, [key]: value };
    setLocalField(updated);
    onUpdate({ [key]: value });
  };

  const updateOption = (index: number, field: keyof FieldOption, value: string) => {
    const currentOptions = [...(localField.options || [])];
    currentOptions[index] = { ...currentOptions[index], [field]: value };
    handleChange('options', currentOptions);
  };

  const isStructural = ['section', 'page_break'].includes(localField.field_type);
  const needsOptions = ['dropdown', 'checkbox', 'radio'].includes(localField.field_type);
  const FieldIcon = getFieldIcon(localField.field_type);

  return (
    <motion.div
      key={localField.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="p-6 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-100 group-hover:bg-primary/5 transition-colors">
            <FieldIcon className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Component Instance</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tighter italic uppercase">{localField.label || localField.field_type}</h2>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="px-6 border-b shrink-0">
          <TabsList className="bg-transparent border-none p-0 h-14 w-full justify-start gap-6">
            <TabsTrigger value="general" className="h-14 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
              General
            </TabsTrigger>
            <TabsTrigger value="validation" className="h-14 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
              Validation
            </TabsTrigger>
            <TabsTrigger value="logic" className="h-14 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 text-[10px] font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all italic">
              Logic
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <TabsContent value="general" className="m-0 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Label Architecture</Label>
                <Input
                  value={localField.label}
                  onChange={(e) => handleChange('label', e.target.value)}
                  className="h-11 rounded-xl border-2 border-slate-50 focus:border-primary font-bold transition-all"
                />
              </div>

              {!isStructural && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Placeholder Payload</Label>
                  <Input
                    value={localField.placeholder || ''}
                    onChange={(e) => handleChange('placeholder', e.target.value)}
                    className="h-11 rounded-xl border-2 border-slate-50 focus:border-primary font-bold transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contextual Blueprint</Label>
                <Textarea
                  value={localField.help_text || ''}
                  onChange={(e) => handleChange('help_text', e.target.value)}
                  className="rounded-xl border-2 border-slate-50 focus:border-primary font-bold transition-all min-h-[100px] resize-none"
                />
              </div>

              {!isStructural && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scale Ratio</Label>
                    <Select value={String(localField.col_span || 2)} onValueChange={(val) => handleChange('col_span', Number(val))}>
                      <SelectTrigger className="h-11 rounded-xl border-2 border-slate-50 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Half (50%)</SelectItem>
                        <SelectItem value="2">Full (100%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 h-11">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Mandatory</span>
                      <Switch checked={localField.required} onCheckedChange={(val) => handleChange('required', val)} />
                    </div>
                  </div>
                </div>
              )}

              {needsOptions && (
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data Set Entries</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                      onClick={() => {
                        const currentOpts = localField.options || [];
                        const opts = [...currentOpts, { label: `Option ${currentOpts.length + 1}`, value: `val_${currentOpts.length + 1}` }];
                        handleChange('options', opts);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Entry
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {localField.options?.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <Input
                          value={opt.label}
                          onChange={(e) => updateOption(i, 'label', e.target.value)}
                          className="h-9 rounded-lg border-2 border-slate-50 font-bold text-xs"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 opacity-0 group-hover:opacity-100 hover:text-red-500"
                          onClick={() => {
                            const opts = localField.options?.filter((_, idx) => idx !== i);
                            handleChange('options', opts);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="m-0 space-y-8">
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase italic">Data Guardrails</p>
                  <p className="text-[9px] font-bold text-slate-400 italic">Enforce strict architectural integrity on user input.</p>
                </div>
              </div>

              {['text', 'textarea'].includes(localField.field_type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min Threshold</Label>
                    <Input
                      type="number"
                      value={localField.validation?.min_length || ''}
                      onChange={(e) => handleChange('validation', { ...localField.validation, min_length: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-11 rounded-xl border-2 border-slate-50 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Threshold</Label>
                    <Input
                      type="number"
                      value={localField.validation?.max_length || ''}
                      onChange={(e) => handleChange('validation', { ...localField.validation, max_length: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-11 rounded-xl border-2 border-slate-50 font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pattern Protocol (Regex)</Label>
                <Input
                  value={localField.validation?.pattern || ''}
                  onChange={(e) => handleChange('validation', { ...localField.validation, pattern: e.target.value })}
                  placeholder="^[a-zA-Z]+$"
                  className="h-11 rounded-xl border-2 border-slate-50 font-bold font-mono text-xs"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logic" className="m-0 space-y-8">
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-900/10 text-center space-y-4">
                <Zap className="h-10 w-10 text-primary mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tighter italic">Conditional Branching</h4>
                  <p className="text-[9px] font-bold text-slate-400 italic tracking-widest leading-relaxed">
                    Automate visibility and flow based on real-time architectural interactions.
                  </p>
                </div>
                <Button
                  onClick={() => setLogicDialogOpen(true)}
                  className="w-full bg-[#2196F3] hover:bg-[#1976D2] text-white rounded-2xl h-11 font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                  Configure Protocol
                </Button>
              </div>

              {localField.conditional_logic && (
                <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest italic">Logic Active</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[9px] font-black text-red-500 uppercase tracking-widest"
                    onClick={() => handleChange('conditional_logic', null)}
                  >
                    Clear Logic
                  </Button>
                </div>
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
    </motion.div>
  );
}

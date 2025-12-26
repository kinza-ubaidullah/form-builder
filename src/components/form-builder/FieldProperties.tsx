import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Settings2, Sliders, CheckCircle2, AlertCircle, ListTree, Zap, EyeOff, FileDigit, Image as ImageIcon, PenTool } from 'lucide-react';
import type { FormField, FieldOption } from '@/types';
import { fieldTypes } from './field-types';

interface FieldPropertiesProps {
  field: FormField | null;
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldProperties({ field, onUpdate }: FieldPropertiesProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);

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
        className="h-full"
      >
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[32px] overflow-hidden">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
              <Sliders className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight italic">Blueprint</h3>
              <p className="text-slate-400 font-bold text-xs max-w-[200px] italic">
                Select a field on the canvas to configure its elite properties.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const handleChange = (key: keyof FormField, value: any) => {
    const updated = { ...localField, [key]: value };
    setLocalField(updated);
    onUpdate({ [key]: value });
  };

  const handleOptionsChange = (options: FieldOption[]) => {
    handleChange('options', options);
  };

  const addOption = () => {
    const currentOptions = localField.options || [];
    const newOption: FieldOption = {
      label: `Option ${currentOptions.length + 1}`,
      value: `option_${currentOptions.length + 1}`,
    };
    handleOptionsChange([...currentOptions, newOption]);
  };

  const updateOption = (index: number, field: keyof FieldOption, value: string) => {
    const currentOptions = [...(localField.options || [])];
    currentOptions[index] = { ...currentOptions[index], [field]: value };
    handleOptionsChange(currentOptions);
  };

  const removeOption = (index: number) => {
    const currentOptions = [...(localField.options || [])];
    currentOptions.splice(index, 1);
    handleOptionsChange(currentOptions);
  };

  const isStructural = ['section', 'page_break'].includes(localField.field_type);
  const needsOptions = ['dropdown', 'checkbox', 'radio'].includes(localField.field_type);
  const FieldIcon = getFieldIcon(localField.field_type);

  return (
    <motion.div
      key={localField.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="h-full space-y-6"
    >
      <Card className="border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/20 bg-white">
        <CardHeader className="border-b bg-slate-50/50 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <FieldIcon className="h-5 w-5 text-[#2196F3]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-0.5">Configuration</span>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tighter italic">Properties</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
          {/* Base Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="h-4 w-4 text-slate-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2196F3]">
                {isStructural ? 'Architectural Settings' : 'Standard Settings'}
              </h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-label" className="text-xs font-black uppercase tracking-wider text-slate-500">
                {localField.field_type === 'section' ? 'Section Header' : localField.field_type === 'page_break' ? 'Page Descriptor' : 'Field Label'}
              </Label>
              <Input
                id="field-label"
                value={localField.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder={isStructural ? "Enter structural identifier" : "Enter field label"}
                className="rounded-xl border-2 border-slate-100 focus:border-[#2196F3] transition-all font-bold"
              />
            </div>

            {!isStructural && !['checkbox', 'radio'].includes(localField.field_type) && (
              <div className="space-y-2">
                <Label htmlFor="field-placeholder" className="text-xs font-black uppercase tracking-wider text-slate-500">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  value={localField.placeholder || ''}
                  onChange={(e) => handleChange('placeholder', e.target.value || null)}
                  placeholder="Enter placeholder text"
                  className="rounded-xl border-2 border-slate-100 focus:border-[#2196F3] transition-all font-bold"
                />
              </div>
            )}

            {!isStructural && (
              <div className="space-y-2">
                <Label htmlFor="field-help" className="text-xs font-black uppercase tracking-wider text-slate-500">Contextual Help</Label>
                <Textarea
                  id="field-help"
                  value={localField.help_text || ''}
                  onChange={(e) => handleChange('help_text', e.target.value || null)}
                  placeholder="Add helpful description for the user"
                  className="rounded-xl border-2 border-slate-100 focus:border-[#2196F3] transition-all font-bold resize-none"
                  rows={3}
                />
              </div>
            )}

            {!isStructural && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <div className="flex flex-col">
                    <Label htmlFor="field-required" className="text-xs font-black uppercase tracking-tight text-slate-900 italic">Mandatory Field</Label>
                    <span className="text-[10px] font-bold text-slate-400 italic">User must complete this</span>
                  </div>
                </div>
                <Switch
                  id="field-required"
                  checked={localField.required}
                  onCheckedChange={(checked) => handleChange('required', checked)}
                  className="data-[state=checked]:bg-[#2196F3]"
                />
              </div>
            )}

            {localField.field_type === 'section' && (
              <div className="p-4 bg-[#2196F3]/5 rounded-2xl border border-dashed border-[#2196F3]/20">
                <p className="text-[10px] font-black text-slate-900 uppercase italic mb-1">Elite Section Blueprint</p>
                <p className="text-[9px] font-bold text-slate-400 italic tracking-tight">Sections automatically organize fields into logical data clusters for professional clarity.</p>
              </div>
            )}

            {localField.field_type === 'page_break' && (
              <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#2196F3]">Step Protocol</p>
                <p className="text-[9px] font-bold text-slate-300 italic">Turns your form into an elite multi-step experience. Users must interact with the next step protocol to proceed.</p>
              </div>
            )}
          </div>

          {/* Options Section */}
          <AnimatePresence>
            {needsOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-6 border-t"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListTree className="h-4 w-4 text-slate-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2196F3]">Data Options</h4>
                  </div>
                  <Button
                    size="sm"
                    onClick={addOption}
                    className="rounded-lg bg-slate-900 hover:bg-black text-white px-3 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1 text-[#2196F3]" />
                    Add Entry
                  </Button>
                </div>

                <div className="space-y-3">
                  {(localField.options || []).map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 group"
                    >
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="rounded-lg border-2 border-slate-50 focus:border-[#2196F3] transition-all font-bold text-xs h-9"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="rounded-lg border-2 border-slate-50 focus:border-[#2196F3] transition-all font-bold text-xs h-9"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Section */}
          {['text', 'textarea', 'number', 'rating'].includes(localField.field_type) && (
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2196F3]">Guardrails</h4>
              </div>

              {['text', 'textarea'].includes(localField.field_type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-length" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Min Length</Label>
                    <Input
                      id="min-length"
                      type="number"
                      value={localField.validation?.min_length || ''}
                      onChange={(e) =>
                        handleChange('validation', {
                          ...localField.validation,
                          min_length: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Min"
                      className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-length" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Max Length</Label>
                    <Input
                      id="max-length"
                      type="number"
                      value={localField.validation?.max_length || ''}
                      onChange={(e) =>
                        handleChange('validation', {
                          ...localField.validation,
                          max_length: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Max"
                      className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold h-10"
                    />
                  </div>
                </div>
              )}

              {localField.field_type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-value" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Min Value</Label>
                    <Input
                      id="min-value"
                      type="number"
                      value={localField.validation?.min_value || ''}
                      onChange={(e) =>
                        handleChange('validation', {
                          ...localField.validation,
                          min_value: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Min"
                      className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-value" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Max Value</Label>
                    <Input
                      id="max-value"
                      type="number"
                      value={localField.validation?.max_value || ''}
                      onChange={(e) =>
                        handleChange('validation', {
                          ...localField.validation,
                          max_value: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Max"
                      className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold h-10"
                    />
                  </div>
                </div>
              )}

              {localField.field_type === 'rating' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-rating" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Maximum Rating Scale</Label>
                    <Select
                      value={String(localField.validation?.max_value || 5)}
                      onValueChange={(val) => handleChange('validation', { ...localField.validation, max_value: Number(val) })}
                    >
                      <SelectTrigger className="rounded-xl border-2 border-slate-50 font-bold h-10">
                        <SelectValue placeholder="Select Scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="10">10 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Elite Media Configuration */}
          {['file', 'image'].includes(localField.field_type) && (
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <FileDigit className="h-4 w-4 text-slate-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2196F3]">Media Architecture</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Allowed Formats</Label>
                  <Input
                    value={localField.validation?.pattern || ''}
                    onChange={(e) => handleChange('validation', { ...localField.validation, pattern: e.target.value })}
                    placeholder="e.g. .pdf, .docx, .jpg"
                    className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={localField.validation?.max_value || 5}
                    onChange={(e) => handleChange('validation', { ...localField.validation, max_value: Number(e.target.value) })}
                    placeholder="e.g. 5"
                    className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold h-10"
                  />
                </div>
              </div>
              {localField.field_type === 'image' && (
                <div className="mt-4 p-4 bg-[#2196F3]/5 rounded-2xl border border-dashed border-[#2196F3]/20 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <ImageIcon className="h-5 w-5 text-[#2196F3]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase italic">Image Optimization</p>
                    <p className="text-[9px] font-bold text-slate-400 italic tracking-tight">Auto-resizing & edge-enhancement active.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Elite Signature Configuration */}
          {localField.field_type === 'signature' && (
            <div className="space-y-6 pt-6 border-t font-outfit">
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="h-4 w-4 text-slate-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2196F3]">Governance & Compliance</h4>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-[#2196F3]">Signing Environment</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Legally Binding Protocol</span>
                    <Badge className="bg-emerald-500 text-[8px] font-black">ENCRYPTED</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Legal Disclaimer Text</Label>
                  <Textarea
                    value={localField.help_text || ''}
                    onChange={(e) => handleChange('help_text', e.target.value)}
                    placeholder="I agree that this is a legally binding signature..."
                    className="rounded-xl border-2 border-slate-50 focus:border-[#2196F3] font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Logic Section */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-slate-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2196F3]">Conditional Protocol</h4>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-center">
              <EyeOff className="h-6 w-6 text-slate-300 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-slate-400 italic">Advanced branching logic requires Elite access. Automate visibility based on user inputs.</p>
              <Button variant="ghost" className="mt-2 text-[10px] font-black text-[#2196F3] uppercase tracking-widest hover:bg-white">Configure Logic</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

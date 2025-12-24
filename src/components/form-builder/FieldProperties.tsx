import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, X } from 'lucide-react';
import type { FormField, FieldOption } from '@/types';

interface FieldPropertiesProps {
  field: FormField | null;
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldProperties({ field, onUpdate }: FieldPropertiesProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  if (!localField) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Select a field to edit its properties
          </p>
        </CardContent>
      </Card>
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

  const needsOptions = ['dropdown', 'checkbox', 'radio'].includes(localField.field_type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Field Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={localField.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Enter field label"
          />
        </div>

        {/* Placeholder */}
        {!['checkbox', 'radio'].includes(localField.field_type) && (
          <div className="space-y-2">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={localField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value || null)}
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Help Text */}
        <div className="space-y-2">
          <Label htmlFor="field-help">Help Text</Label>
          <Textarea
            id="field-help"
            value={localField.help_text || ''}
            onChange={(e) => handleChange('help_text', e.target.value || null)}
            placeholder="Add helpful description"
            rows={2}
          />
        </div>

        {/* Required */}
        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">Required Field</Label>
          <Switch
            id="field-required"
            checked={localField.required}
            onCheckedChange={(checked) => handleChange('required', checked)}
          />
        </div>

        {/* Options for dropdown, checkbox, radio */}
        {needsOptions && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button size="sm" variant="outline" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {(localField.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Validation */}
        {['text', 'textarea', 'number'].includes(localField.field_type) && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>Validation</Label>
              {['text', 'textarea'].includes(localField.field_type) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="min-length" className="text-xs">Min Length</Label>
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
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max-length" className="text-xs">Max Length</Label>
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
                    />
                  </div>
                </div>
              )}
              {localField.field_type === 'number' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="min-value" className="text-xs">Min Value</Label>
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
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max-value" className="text-xs">Max Value</Label>
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
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

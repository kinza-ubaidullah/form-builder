import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formsApi, formFieldsApi, submissionsApi } from '@/db/api';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Star, Phone, Globe, Upload, Image as ImageIcon, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import type { Form, FormField } from '@/types';

import { supabase } from '@/db/supabase';

export default function PublicForm() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [allSteps, setAllSteps] = useState<FormField[][]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      setLoading(true);
      const formData = await formsApi.getById(formId);
      if (!formData || formData.status !== 'published') {
        toast({
          title: 'Error',
          description: 'Form not found or not published',
          variant: 'destructive',
        });
        return;
      }
      setForm(formData);

      const fieldsData = await formFieldsApi.getByFormId(formId);
      setFields(fieldsData);
      splitFieldsIntoSteps(fieldsData);

      // Initialize default values
      const initialData: Record<string, any> = {};
      fieldsData.forEach(field => {
        if (field.default_value) {
          initialData[field.id] = field.default_value;
        }
      });
      setFormData(initialData);
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

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (field.validation) {
      const val = field.validation;

      if (typeof value === 'string') {
        if (val.min_length && value.length < val.min_length) {
          return `Minimum length is ${val.min_length} characters`;
        }
        if (val.max_length && value.length > val.max_length) {
          return `Maximum length is ${val.max_length} characters`;
        }
      }

      if (typeof value === 'number') {
        if (val.min_value !== undefined && value < val.min_value) {
          return `Minimum value is ${val.min_value}`;
        }
        if (val.max_value !== undefined && value > val.max_value) {
          return `Maximum value is ${val.max_value}`;
        }
      }
    }

    if (field.validation?.pattern && value) {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(String(value))) {
          return field.validation.custom_error || 'Invalid format';
        }
      } catch (e) {
        console.error('Invalid regex pattern:', field.validation.pattern);
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      // Only validate fields that are currently visible
      if (isFieldVisible(field)) {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Smooth scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);
      await submissionsApi.create({
        form_id: form.id,
        data: formData,
        status: 'pending',
      });

      setSubmitted(true);

      if (form.settings?.redirect_url) {
        setTimeout(() => {
          window.location.href = form.settings.redirect_url!;
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional_logic || field.conditional_logic.length === 0) return true;

    return field.conditional_logic.every((logic) => {
      const sourceValue = formData[logic.field_id];
      let match = false;

      switch (logic.operator) {
        case 'equals':
          match = String(sourceValue) === String(logic.value);
          break;
        case 'not_equals':
          match = String(sourceValue) !== String(logic.value);
          break;
        case 'contains':
          match = String(sourceValue).includes(String(logic.value));
          break;
        case 'greater_than':
          match = Number(sourceValue) > Number(logic.value);
          break;
        case 'less_than':
          match = Number(sourceValue) < Number(logic.value);
          break;
      }

      return logic.action === 'show' ? match : !match;
    });
  };

  const splitFieldsIntoSteps = (allFields: FormField[]) => {
    const steps: FormField[][] = [];
    let currentFields: FormField[] = [];

    allFields.forEach((field) => {
      if (field.field_type === 'page_break') {
        steps.push(currentFields);
        currentFields = [];
      } else {
        currentFields.push(field);
      }
    });

    if (currentFields.length > 0) {
      steps.push(currentFields);
    }

    setAllSteps(steps.length > 0 ? steps : [[]]);
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];

    const isVisible = isFieldVisible(field);
    if (!isVisible) return null;

    const colSpan = field.col_span || 4;
    const isSection = field.field_type === 'section';

    const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className={cn(
        "space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isSection ? "col-span-1 md:col-span-4" :
          colSpan === 1 ? "col-span-1 md:col-span-1" :
            colSpan === 2 ? "col-span-1 md:col-span-2" :
              colSpan === 3 ? "col-span-1 md:col-span-3" :
                "col-span-1 md:col-span-4"
      )}>
        {!isSection && (
          <Label htmlFor={field.id} className={`text-sm font-medium ${error ? 'text-destructive' : ''}`}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        {children}
        {field.help_text && !error && (
          <p className="text-[10px] text-muted-foreground italic">Hint: {field.help_text}</p>
        )}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center text-[10px] text-destructive mt-1 font-bold italic"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    switch (field.field_type) {
      case 'text':
      case 'email':
        return (
          <FieldWrapper key={field.id}>
            <Input
              id={field.id}
              type={field.field_type}
              placeholder={field.placeholder || ''}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`transition-all duration-200 ${error ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
            />
          </FieldWrapper>
        );

      case 'number':
        return (
          <FieldWrapper key={field.id}>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder || ''}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
              className={`transition-all duration-200 ${error ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
            />
          </FieldWrapper>
        );

      case 'textarea':
        return (
          <FieldWrapper key={field.id}>
            <Textarea
              id={field.id}
              placeholder={field.placeholder || ''}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              rows={4}
              className={`resize-none transition-all duration-200 ${error ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
            />
          </FieldWrapper>
        );

      case 'dropdown':
        return (
          <FieldWrapper key={field.id}>
            <Select
              value={formData[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className={`transition-all duration-200 ${error ? 'border-destructive ring-offset-destructive' : ''}`}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>
        );

      case 'radio':
        return (
          <FieldWrapper key={field.id}>
            <RadioGroup
              value={formData[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              className="space-y-2"
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FieldWrapper>
        );

      case 'checkbox':
        return (
          <FieldWrapper key={field.id}>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={(formData[field.id] || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const current = formData[field.id] || [];
                      const updated = checked
                        ? [...current, option.value]
                        : current.filter((v: string) => v !== option.value);
                      handleFieldChange(field.id, updated);
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </FieldWrapper>
        );

      case 'date':
        return (
          <FieldWrapper key={field.id}>
            <Input
              id={field.id}
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`transition-all duration-200 ${error ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
            />
          </FieldWrapper>
        );

      case 'phone':
        return (
          <FieldWrapper key={field.id}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id={field.id}
                type="tel"
                placeholder={field.placeholder || '+1 (555) 000-0000'}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={cn(
                  "pl-10 transition-all duration-200",
                  error ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'
                )}
              />
            </div>
          </FieldWrapper>
        );

      case 'url':
        return (
          <FieldWrapper key={field.id}>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id={field.id}
                type="url"
                placeholder={field.placeholder || 'https://example.com'}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={cn(
                  "pl-10 transition-all duration-200",
                  error ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'
                )}
              />
            </div>
          </FieldWrapper>
        );

      case 'switch':
        return (
          <FieldWrapper key={field.id}>
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id={field.id}
                checked={!!formData[field.id]}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                className="h-5 w-5"
              />
              <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                {field.placeholder || 'Enable this option'}
              </Label>
            </div>
          </FieldWrapper>
        );

      case 'rating':
        return (
          <FieldWrapper key={field.id}>
            <div className="flex items-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleFieldChange(field.id, star)}
                  className="transition-all hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (formData[field.id] || 0) >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-200"
                    )}
                  />
                </button>
              ))}
            </div>
          </FieldWrapper>
        );

      case 'file':
      case 'image':
        return (
          <FieldWrapper key={field.id}>
            <div className={`group relative border-2 border-dashed rounded-2xl p-8 hover:border-[#2196F3] hover:bg-[#2196F3]/5 transition-all cursor-pointer ${uploading[field.id] ? 'border-[#2196F3] bg-[#2196F3]/5' : 'border-slate-200'}`}>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={uploading[field.id]}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    setUploading(prev => ({ ...prev, [field.id]: true }));
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `public/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                      .from('uploads')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('uploads')
                      .getPublicUrl(filePath);

                    handleFieldChange(field.id, publicUrl);
                    toast({
                      title: 'Success',
                      description: 'File uploaded successfully',
                    });
                  } catch (error) {
                    console.error('Upload failed:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to upload file. Please try again.',
                      variant: 'destructive',
                    });
                  } finally {
                    setUploading(prev => ({ ...prev, [field.id]: false }));
                  }
                }}
                accept={field.field_type === 'image' ? 'image/*' : undefined}
              />
              <div className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                {uploading[field.id] ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl">
                    <Loader2 className="h-8 w-8 text-[#2196F3] animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white transition-colors relative">
                      {field.field_type === 'image' ? (
                        formData[field.id] ? (
                          <div className="relative h-20 w-20">
                            <img src={formData[field.id]} alt="Preview" className="h-full w-full object-cover rounded-lg shadow-sm" />
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-0.5 rounded-full border-2 border-white">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          </div>
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-[#2196F3]" />
                        )
                      ) : (
                        formData[field.id] ? (
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <Upload className="h-6 w-6 text-green-500" />
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white p-0.5 rounded-full border-2 border-white">
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Upload className="h-6 w-6 text-slate-400 group-hover:text-[#2196F3]" />
                        )
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] mx-auto">
                        {formData[field.id] ? (
                          field.field_type === 'image' ? 'Image Uploaded' : 'File Uploaded'
                        ) : (
                          `Select ${field.field_type === 'image' ? 'Image' : 'File'}`
                        )}
                      </p>
                      <p className="text-xs text-slate-400 font-medium italic">
                        {formData[field.id] ? 'Click to replace' : 'Click or drag to upload'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </FieldWrapper>
        );

      case 'signature':
        return (
          <FieldWrapper key={field.id}>
            <div className="border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <div className="h-32 bg-white rounded-xl border border-dashed border-slate-200 flex items-center justify-center mb-2">
                <PenTool className="h-8 w-8 text-slate-200" />
                <span className="text-[10px] font-bold text-slate-300 ml-2 italic">Sign Here</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] font-black uppercase tracking-widest h-8"
                onClick={() => handleFieldChange(field.id, 'signed')}
              >
                Clear Signature
              </Button>
            </div>
          </FieldWrapper>
        );

      case 'section':
        return (
          <div key={field.id} className="col-span-1 md:col-span-2 py-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-primary to-transparent opacity-20" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{field.label}</h3>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-primary to-transparent opacity-20" />
            </div>
            {field.help_text && (
              <p className="text-sm text-center text-muted-foreground italic max-w-lg mx-auto">{field.help_text}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="bg-destructive/10 p-3 rounded-full w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Form Unavailable</h2>
            <p className="text-muted-foreground">
              This form is either not found, not published, or has been taken down.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-t-4 border-t-green-600">
            <CardContent className="p-12 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="bg-green-100 p-4 rounded-full w-fit mx-auto"
              >
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Thank You!</h2>
                <p className="text-muted-foreground">
                  {form.settings?.success_message || 'Your submission has been received successfully.'}
                </p>
              </div>
              {form.settings?.redirect_url && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Redirecting you shortly...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const nextStep = () => {
    // Validate current step
    const currentFields = allSteps[currentStep] || [];
    const newErrors: Record<string, string> = {};
    currentFields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error && isFieldVisible(field)) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (currentStep < allSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-lg border-t-4 border-t-primary rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8 border-b bg-card relative">
            {allSteps.length > 1 && (
              <div className="absolute top-4 right-8 px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-[10px] font-bold uppercase text-primary tracking-widest">
                  Step {currentStep + 1} of {allSteps.length}
                </span>
              </div>
            )}
            <CardTitle className="text-3xl font-bold text-center tracking-tight text-foreground">
              {form.title}
            </CardTitle>
            {form.description && (
              <CardDescription className="text-center text-lg max-w-xl mx-auto font-medium text-muted-foreground">
                {form.description}
              </CardDescription>
            )}

            {/* Progress Bar */}
            {allSteps.length > 1 && (
              <div className="w-full h-1.5 bg-secondary rounded-full mt-6 overflow-hidden max-w-md mx-auto">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / allSteps.length) * 100}%` }}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8">
                {(allSteps[currentStep] || []).map((field) => renderField(field))}
              </div>

              <div className="pt-10 flex gap-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-lg font-bold rounded-2xl border-2 hover:bg-slate-50 transition-all active:scale-95"
                    onClick={prevStep}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Previous
                  </Button>
                )}

                {currentStep < allSteps.length - 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    className="flex-[2] h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                    onClick={nextStep}
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-[2] h-12 text-base font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {form.settings?.submit_button_text || 'Submit Form'}
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t py-6">
            <div className="w-full text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Architectural Form Ecosystem <span className="text-primary mx-2">|</span> Powered by Form Builder
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

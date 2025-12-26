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
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Form, FormField } from '@/types';

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

    if (field.field_type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
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

  const renderField = (field: FormField) => {
    const error = errors[field.id];

    const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Label htmlFor={field.id} className={`text-sm font-medium ${error ? 'text-destructive' : ''}`}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {children}
        {field.help_text && !error && (
          <p className="text-[0.8rem] text-muted-foreground">{field.help_text}</p>
        )}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center text-sm text-destructive mt-1"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
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

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="shadow-xl border-t-8 border-t-primary">
          <CardHeader className="space-y-4 pb-8 border-b bg-card/50">
            <CardTitle className="text-3xl font-bold text-center tracking-tight">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-center text-lg max-w-xl mx-auto">
                {form.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {fields.map((field) => renderField(field))}
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full text-lg h-12 transition-all hover:scale-[1.01]" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    form.settings?.submit_button_text || 'Submit Form'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t py-4">
            <div className="w-full text-center">
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-semibold text-primary">Form Builder</span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

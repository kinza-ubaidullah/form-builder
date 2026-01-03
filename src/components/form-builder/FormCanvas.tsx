import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Copy, ChevronUp, ChevronDown, Plus, Upload, Image as ImageIcon, Layout } from 'lucide-react';
import type { FormField, FormBranding } from '@/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldDuplicate: (fieldId: string) => void;
  onFieldMove: (fieldId: string, direction: 'up' | 'down') => void;
  branding?: FormBranding;
  isBuilder?: boolean;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldDuplicate,
  onFieldMove,
  branding,
  isBuilder = true,
}: FormCanvasProps) {

  /* 
     Helper to normalize style values 
     We check both camelCase (legacy/transient) and snake_case (DB) properties 
     to ensure compatibility if the object shape varies.
  */
  const getBorderRadius = () => {
    // Check for snake_case first (preferred)
    if (branding?.border_radius && !isNaN(Number(branding.border_radius))) return `${branding.border_radius}px`;
    if (branding?.border_radius === 'none') return '0px';
    if (branding?.border_radius === 'medium') return '8px';
    if (branding?.border_radius === 'full') return '99px';
    if (branding?.border_radius === 'large') return '12px';

    // Fallback/Default
    return '8px';
  };

  const getFontSize = () => {
    // Check custom fontSize property we added to types
    switch (branding?.fontSize) {
      case 'xs': return '0.75rem';
      case 'base': return '1rem';
      case 'lg': return '1.125rem';
      case 'sm':
      default: return '0.875rem';
    }
  };

  const radius = getBorderRadius();
  const fontSize = getFontSize();

  const renderFieldInput = (field: FormField) => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'number':
        return (
          <Input
            type={field.field_type === 'phone' ? 'tel' : field.field_type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            disabled
            className={cn(
              "pointer-events-none transition-all",
              branding?.inputStyle === 'flushed' ? 'border-0 border-b rounded-none px-0 bg-transparent' :
                branding?.inputStyle === 'filled' ? 'bg-slate-100 border-transparent hover:bg-slate-200' :
                  'bg-white border-slate-200'
            )}
            style={{
              borderRadius: branding?.inputStyle === 'flushed' ? '0' : radius,
              borderWidth: branding?.inputStyle === 'flushed' ? undefined : `${branding?.borderWidth || 1}px`,
              borderBottomWidth: `${branding?.borderWidth || 1}px`,
              borderColor: branding?.primary_color ? `${branding.primary_color}50` : undefined,
              fontSize: fontSize
            }}
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            disabled
            className={cn(
              "pointer-events-none min-h-[100px] resize-none transition-all",
              branding?.inputStyle === 'flushed' ? 'border-0 border-b rounded-none px-0 bg-transparent' :
                branding?.inputStyle === 'filled' ? 'bg-slate-100 border-transparent' :
                  'bg-white border-slate-200'
            )}
            style={{
              borderRadius: branding?.inputStyle === 'flushed' ? '0' : radius,
              borderWidth: branding?.inputStyle === 'flushed' ? undefined : `${branding?.borderWidth || 1}px`,
              borderBottomWidth: `${branding?.borderWidth || 1}px`,
              borderColor: branding?.primary_color ? `${branding.primary_color}50` : undefined,
              fontSize: fontSize
            }}
          />
        );
      case 'dropdown':
        return (
          <Select disabled>
            <SelectTrigger className="bg-slate-50 border-slate-200" style={{ borderRadius: branding?.border_radius === 'full' ? '99px' : branding?.border_radius === 'none' ? '0px' : '8px', fontSize: fontSize }}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options.map((opt, i) => (
                <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${i}`} disabled />
                <label
                  htmlFor={`${field.id}-${i}`}
                  className="text-sm font-medium leading-none text-slate-600"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <RadioGroup disabled>
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${field.id}-${i}`} />
                <Label htmlFor={`${field.id}-${i}`} className="font-normal text-slate-600">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch id={field.id} disabled />
            <Label htmlFor={field.id} className="font-normal text-muted-foreground">Toggle this option</Label>
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            disabled
            className="pointer-events-none bg-slate-50 border-slate-200"
            style={{ borderRadius: branding?.border_radius === 'full' ? '99px' : branding?.border_radius === 'none' ? '0px' : '8px', fontSize: fontSize }}
          />
        );
      case 'file':
        return (
          <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
            <Upload className="h-6 w-6 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-600">Click to upload file</p>
          </div>
        );
      case 'image':
        return (
          <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
            <ImageIcon className="h-6 w-6 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-600">Click to upload image</p>
          </div>
        );
      case 'rating':
        return (
          <div className="flex gap-1 text-slate-300">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            ))}
          </div>
        );
      case 'signature':
        return (
          <div className="h-20 border rounded-lg bg-white flex items-end justify-center pb-3">
            <div className="w-1/2 border-b border-slate-300 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Sign here</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const [currentPage, setCurrentPage] = useState(0);

  // Group fields by page
  const pages = useMemo(() => {
    const pagesList: FormField[][] = [[]];
    fields.forEach(field => {
      if (field.field_type === 'page_break') {
        pagesList.push([]);
      } else {
        pagesList[pagesList.length - 1].push(field);
      }
    });
    return pagesList;
  }, [fields]);

  const currentFields = pages[currentPage] || [];
  const isLastPage = currentPage === pages.length - 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLastPage) setCurrentPage(p => p + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  // Reset page if fields change significantly (optional, but good for UX if page is deleted)
  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length]);

  // Auto-switch to page containing selected field
  useEffect(() => {
    if (selectedFieldId) {
      const pageIndex = pages.findIndex(page => page.some(f => f.id === selectedFieldId));
      if (pageIndex !== -1 && pageIndex !== currentPage) {
        setCurrentPage(pageIndex);
      }
    }
  }, [selectedFieldId, pages]);

  return (
    <div
      className={cn(
        "min-h-[800px] p-4 sm:p-6 lg:p-10 border border-transparent rounded-2xl bg-white relative overflow-hidden flex flex-col",
        isBuilder ? "shadow-xl shadow-slate-200/40" : ""
      )}
    >
      {branding?.logo_url && (
        <div className="flex justify-center mb-10 shrink-0">
          <img src={branding.logo_url} alt="Brand Logo" className="h-16 object-contain" />
        </div>
      )}

      {isBuilder && fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[600px] text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <Plus className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Start Building Your Form</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
            Select an element from the sidebar to add it to your form canvas.
          </p>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Layout className="h-4 w-4" />
            <span>Drag and drop to reorder</span>
          </div>
        </div>
      ) : isBuilder ? (
        <div className="flex flex-col h-full space-y-6">
          {/* Step Header */}
          <div className="flex items-center justify-between gap-2 mb-2 px-1 shrink-0">
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Step {currentPage + 1} of {pages.length}</span>
            {pages.length > 1 && (
              <div className="flex gap-1">
                {pages.map((_, idx) => (
                  <div key={idx} className={`h-1.5 w-8 rounded-full transition-colors ${idx <= currentPage ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-slate-900">Form Fields</h3>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {currentFields.map((field) => {
                const isSelected = selectedFieldId === field.id;

                if (field.field_type === 'section') {
                  return (
                    <div
                      key={field.id}
                      className={cn(
                        'p-6 cursor-pointer hover:bg-slate-50 transition-colors group relative border-l-4 border-l-transparent',
                        isSelected ? 'bg-blue-50/50 border-l-primary' : ''
                      )}
                      onClick={(e) => { e.stopPropagation(); onFieldSelect(field.id); }}
                    >
                      <h3 className="text-lg font-bold text-slate-900">{field.label}</h3>

                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'up'); }}><ChevronUp className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'down'); }}><ChevronDown className="h-3 w-3" /></Button>
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  );
                }

                // Page breaks are handled by pagination logic, but we might want to show them if they are somehow inside?
                // Actually they are separators.
                // With our logic, page_break fields themselves are "consumed" to split pages.
                // But for editing purposes, users might want to select the page break to delete/move it.
                // Wait, if we hide them, they can't delete them.
                // SOLUTION: Render Page Break placeholder at the BOTTOM of the page if it exists (except last page)?
                // OR: Include the page break field in the "currentFields" list but styled differently?
                // `pagesList` split logic: `page_break` starts NEW list.
                // So the page break field is effectively "between" lists.
                // Let's attach the page break field to the END of the previous page so it can be edited.
                // REVISED LOGIC needed: `pagesList[pagesList.length - 1].push(field)` and IF `page_break`, THEN `pagesList.push([])`.
                // This way the page break is visible on the page it "ends".

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'p-6 cursor-pointer hover:bg-slate-50 transition-all group relative border-l-4 border-l-transparent',
                      isSelected ? 'bg-blue-50/30 border-l-primary' : ''
                    )}
                    onClick={(e) => { e.stopPropagation(); onFieldSelect(field.id); }}
                  >
                    <div className="space-y-2 relative">
                      <div className="flex items-center justify-between pointer-events-none">
                        <Label className="text-sm font-semibold text-slate-900">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                      </div>

                      <div className="pointer-events-none opacity-80">
                        {renderFieldInput(field)}
                      </div>

                      {field.help_text && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded-lg p-1 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-blue-600"
                        onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'up'); }}
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-blue-600"
                        onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'down'); }}
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Separator orientation="vertical" className="h-4 mx-1" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); onFieldDuplicate(field.id); }} title="Duplicate">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id); }} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {/* Show Page Break Field explicitly if it separates this page from next (except potentially last visual page?)
                   Actually, if my split logic put the page_break field IN the list, it will be rendered by the map above.
                   But my split logic in `useMemo` above put `page_break` as the separator.
                   Let's FIX the `useMemo` logic in the actual Tool Call to include the page_break in the list so it can be managed.
               */}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-4 shrink-0">
              {currentPage > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={cn(
                  "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors",
                  currentPage === 0 && isLastPage ? "w-full" : ""
                )}
              >
                {isLastPage ? 'Submit' : 'Next Step'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode Rendering */
        <div className="flex flex-col h-full space-y-6">
          {/* Step Indicator for Preview */}
          {pages.length > 1 && (
            <div className="flex items-center gap-2 mb-4">
              {pages.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded-full transition-colors ${idx <= currentPage ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          )}

          <div className="space-y-6 flex-1">
            {currentFields.map((field) => (
              <div key={field.id} className="space-y-2">
                {!['section', 'page_break'].includes(field.field_type) && (
                  <Label className="font-semibold text-slate-800">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                )}
                {field.field_type === 'section' ? (
                  <div className="py-4 border-b border-slate-100 mb-4">
                    <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: branding?.font_family }}>{field.label}</h3>
                  </div>
                ) : field.field_type === 'page_break' ? null : (
                  <div className="pointer-events-none opacity-100">
                    {renderFieldInput(field)}
                  </div>
                )}
                {field.help_text && <p className="text-[10px] text-slate-400 italic">{field.help_text}</p>}
              </div>
            ))}
          </div>

          <div className="pt-6 flex gap-4">
            {currentPage > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1 h-12 text-base font-bold bg-white text-slate-700 border-slate-300"
                style={{ borderRadius: radius }}
              >
                Previous
              </Button>
            )}
            <Button
              className="flex-1 h-12 text-base font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={isLastPage ? undefined : handleNext} // In real app, Submit would be handled by a form action
              style={{ borderRadius: radius }}
            >
              {isLastPage ? 'Submit Form' : 'Next Step'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

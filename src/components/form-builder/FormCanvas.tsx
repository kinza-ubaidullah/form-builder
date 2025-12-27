import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Settings, Copy, ChevronUp, ChevronDown, Plus, Layout, Palette } from 'lucide-react';
import type { FormField, FormBranding } from '@/types';
import { fieldTypes } from './field-types';
import { cn } from '@/lib/utils';

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldDuplicate: (fieldId: string) => void;
  onFieldMove: (fieldId: string, direction: 'up' | 'down') => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  branding?: FormBranding;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldDuplicate,
  onFieldMove,
  onDrop,
  onDragOver,
  branding,
}: FormCanvasProps) {
  const getFieldIcon = (fieldType: string) => {
    const config = fieldTypes.find((f) => f.type === fieldType);
    return config?.icon;
  };

  const getBorderRadius = () => {
    switch (branding?.border_radius) {
      case 'none': return '0px';
      case 'medium': return '8px';
      case 'full': return '999px';
      case 'large':
      default: return '20px';
    }
  };

  const radius = getBorderRadius();

  return (
    <div
      className="min-h-[700px] p-8 border-2 border-dashed border-slate-200 rounded-[32px] bg-white shadow-inner relative overflow-hidden"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {branding?.logo_url && (
        <div className="flex justify-center mb-8">
          <img src={branding.logo_url} alt="Brand Logo" className="h-12 object-contain" />
        </div>
      )}

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 animate-pulse">
              <GripVertical className="h-10 w-10 text-slate-300" />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
              <Settings className="h-4 w-4 animate-spin-slow" />
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Architectural Void</h3>
            <p className="text-slate-400 font-bold text-[11px] max-w-sm mx-auto italic leading-relaxed uppercase tracking-widest">
              Your blueprint is currently a blank canvas. Initialize your design by dragging artifacts from the library or using quick commands below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" className="h-11 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all active:scale-95">
              <Plus className="mr-2 h-3.5 w-3.5 text-primary" />
              Add Section
            </Button>
            <Button variant="outline" className="h-11 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all active:scale-95">
              <Layout className="mr-2 h-3.5 w-3.5 text-orange-500" />
              Switch Layout
            </Button>
            <Button variant="outline" className="h-11 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all active:scale-95">
              <Palette className="mr-2 h-3.5 w-3.5 text-emerald-500" />
              Choose Theme
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const Icon = getFieldIcon(field.field_type);
            const isSelected = selectedFieldId === field.id;
            const IconComponent = Icon as any;
            const colSpan = field.col_span || 2;

            if (field.field_type === 'section') {
              return (
                <div
                  key={field.id}
                  className={cn(
                    'py-6 px-2 flex items-center justify-between group transition-all cursor-pointer col-span-1 md:col-span-2',
                    isSelected ? 'bg-slate-50 ring-2 ring-[#2196F3]/20' : 'hover:bg-slate-50/50'
                  )}
                  style={{ borderRadius: radius }}
                  onClick={() => onFieldSelect(field.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-[#2196F3] to-transparent opacity-20" />
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent className="h-5 w-5" style={{ color: branding?.primary_color || '#2196F3' }} />}
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900" style={{ fontFamily: branding?.font_family }}>{field.label}</h3>
                    </div>
                    <div className="h-0.5 flex-1 bg-gradient-to-l from-[#2196F3] to-transparent opacity-20" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white shadow-sm" onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'up'); }}><ChevronUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white shadow-sm" onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'down'); }}><ChevronDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white shadow-sm" onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id); }}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                  </div>
                </div>
              );
            }

            if (field.field_type === 'page_break') {
              return (
                <div
                  key={field.id}
                  className={cn(
                    'py-8 flex flex-col items-center justify-center gap-3 group transition-all cursor-pointer col-span-1 md:col-span-2',
                    isSelected ? 'bg-[#2196F3]/5 ring-2 ring-[#2196F3]/20' : 'hover:bg-slate-50/50'
                  )}
                  style={{ borderRadius: radius }}
                  onClick={() => onFieldSelect(field.id)}
                >
                  <div className="w-full flex items-center gap-4 px-8">
                    <div className="h-[1px] flex-1 bg-slate-200 border-t-2 border-dashed border-slate-100" />
                    <div className="px-4 py-1.5 bg-slate-900 rounded-full flex items-center gap-2 shadow-lg">
                      {IconComponent && <IconComponent className="h-3 w-3 text-[#2196F3]" />}
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">End of Page</span>
                    </div>
                    <div className="h-[1px] flex-1 bg-slate-200 border-t-2 border-dashed border-slate-100" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white" onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'up'); }}><ChevronUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white" onClick={(e) => { e.stopPropagation(); onFieldMove(field.id, 'down'); }}><ChevronDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white" onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id); }}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                  </div>
                </div>
              );
            }

            return (
              <Card
                key={field.id}
                className={cn(
                  'cursor-pointer transition-all duration-300 border-2 overflow-hidden group',
                  colSpan === 1 ? 'col-span-1' : 'col-span-1 md:col-span-2',
                  isSelected
                    ? 'border-[#2196F3] shadow-lg shadow-[#2196F3]/10 scale-[1.02]'
                    : 'border-slate-100 hover:border-slate-300 shadow-sm'
                )}
                style={{ borderRadius: radius }}
                onClick={() => onFieldSelect(field.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="cursor-move mt-1 p-2 bg-slate-50 rounded-lg group-hover:bg-[#2196F3]/5 transition-colors">
                      <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-[#2196F3] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {IconComponent && <IconComponent className="h-4 w-4" style={{ color: branding?.primary_color || '#2196F3' }} />}
                        <span className="font-black text-slate-900 tracking-tight italic" style={{ fontFamily: branding?.font_family }}>{field.label}</span>
                        {field.required && (
                          <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-500 border-none">
                            Mandatory
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {field.help_text && (
                          <p className="text-[10px] font-bold text-slate-400 italic">Hint: {field.help_text}</p>
                        )}
                        {field.placeholder && (
                          <p className="text-[10px] font-bold text-slate-400 italic">
                            Alt: {field.placeholder}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldSelect(field.id);
                        }}
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        title="Move Up"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldMove(field.id, 'up');
                        }}
                      >
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        title="Move Down"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldMove(field.id, 'down');
                        }}
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        title="Duplicate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldDuplicate(field.id);
                        }}
                      >
                        <Copy className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-red-50 group-hover:text-red-500"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldDelete(field.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

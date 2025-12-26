import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Settings, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import type { FormField } from '@/types';
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
}: FormCanvasProps) {
  const getFieldIcon = (fieldType: string) => {
    const config = fieldTypes.find((f) => f.type === fieldType);
    return config?.icon;
  };

  return (
    <div
      className="min-h-[700px] p-8 border-2 border-dashed border-slate-200 rounded-[32px] bg-white shadow-inner relative overflow-hidden"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
            <GripVertical className="h-10 w-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Canvas Awaits</h3>
            <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto italic">
              Drag and drop components from the library to architect your elite form.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field) => {
            const Icon = getFieldIcon(field.field_type);
            const isSelected = selectedFieldId === field.id;
            return (
              <Card
                key={field.id}
                className={cn(
                  'cursor-pointer transition-all duration-300 border-2 rounded-2xl overflow-hidden group',
                  isSelected
                    ? 'border-[#2196F3] shadow-lg shadow-[#2196F3]/10 scale-[1.02]'
                    : 'border-slate-100 hover:border-slate-300 shadow-sm'
                )}
                onClick={() => onFieldSelect(field.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="cursor-move mt-1 p-2 bg-slate-50 rounded-lg group-hover:bg-[#2196F3]/5 transition-colors">
                      <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-[#2196F3] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {Icon && <Icon className="h-4 w-4 text-[#2196F3]" />}
                        <span className="font-black text-slate-900 tracking-tight italic">{field.label}</span>
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

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Settings } from 'lucide-react';
import type { FormField } from '@/types';
import { fieldTypes } from './field-types';
import { cn } from '@/lib/utils';

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldReorder: (fromIndex: number, toIndex: number) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldReorder,
  onDrop,
  onDragOver,
}: FormCanvasProps) {
  const getFieldIcon = (fieldType: string) => {
    const config = fieldTypes.find((f) => f.type === fieldType);
    return config?.icon;
  };

  return (
    <div
      className="min-h-[600px] p-6 border-2 border-dashed border-border rounded-lg bg-card"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {fields.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">
              Drag and drop fields from the left panel to start building your form
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const Icon = getFieldIcon(field.field_type);
            return (
              <Card
                key={field.id}
                className={cn(
                  'cursor-pointer transition-all',
                  selectedFieldId === field.id && 'ring-2 ring-primary'
                )}
                onClick={() => onFieldSelect(field.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="cursor-move mt-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        <span className="font-medium">{field.label}</span>
                        {field.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      {field.help_text && (
                        <p className="text-sm text-muted-foreground">{field.help_text}</p>
                      )}
                      {field.placeholder && (
                        <p className="text-sm text-muted-foreground italic">
                          Placeholder: {field.placeholder}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldSelect(field.id);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldDelete(field.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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

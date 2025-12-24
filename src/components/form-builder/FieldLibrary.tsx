import { Card, CardContent } from '@/components/ui/card';
import { fieldTypes } from './field-types';
import { cn } from '@/lib/utils';

interface FieldLibraryProps {
  onFieldDragStart: (fieldType: string) => void;
}

export function FieldLibrary({ onFieldDragStart }: FieldLibraryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">Field Types</h3>
        <div className="space-y-2">
          {fieldTypes.map((field) => {
            const Icon = field.icon;
            return (
              <Card
                key={field.type}
                draggable
                onDragStart={() => onFieldDragStart(field.type)}
                className="cursor-move hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{field.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {field.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

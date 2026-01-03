import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fieldTypes } from './field-types';
import { Search, Layout, Component, Zap, Upload } from 'lucide-react';

interface FieldLibraryProps {
  onAddField: (fieldType: string) => void;
}

const CATEGORIES = [
  { id: 'basic', label: 'Basic Fields', icon: Component },
  { id: 'choice', label: 'Choice Fields', icon: Zap },
  { id: 'upload', label: 'Upload Fields', icon: Upload },
  { id: 'layout', label: 'Layout Elements', icon: Layout },
];

export function FieldLibrary({ onAddField }: FieldLibraryProps) {
  const [search, setSearch] = useState('');

  const filteredFields = fieldTypes.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Add Fields</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/30 border-transparent focus:bg-white transition-all h-9 text-sm"
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['basic', 'choice', 'upload', 'layout']} className="w-full space-y-4">
        {CATEGORIES.map((cat) => {
          const catFields = filteredFields.filter(f => {
            if (cat.id === 'layout') return ['section', 'page_break'].includes(f.type);
            if (cat.id === 'upload') return ['file', 'image', 'signature'].includes(f.type);
            if (cat.id === 'choice') return ['dropdown', 'radio', 'checkbox', 'switch', 'rating'].includes(f.type);
            return ['text', 'email', 'number', 'textarea', 'date', 'phone', 'url'].includes(f.type);
          });

          if (catFields.length === 0) return null;

          return (
            <AccordionItem key={cat.id} value={cat.id} className="border-none">
              <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-foreground uppercase tracking-wider opacity-70">
                <div className="flex items-center gap-2">
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <div className="grid gap-2">
                  {catFields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <button
                        key={field.type}
                        onClick={() => onAddField(field.type)}
                        className="group w-full text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3 p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all duration-200">
                          <Icon className="h-4 w-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{field.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

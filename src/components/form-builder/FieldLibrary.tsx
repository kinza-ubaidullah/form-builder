import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { fieldTypes } from './field-types';
import { Search, Layout, Component, Zap } from 'lucide-react';

interface FieldLibraryProps {
  onFieldDragStart: (fieldType: string) => void;
}

const CATEGORIES = [
  { id: 'common', label: 'Common Essentials', icon: Component },
  { id: 'advanced', label: 'Advanced Components', icon: Zap },
  { id: 'layout', label: 'Structural Elements', icon: Layout },
];

export function FieldLibrary({ onFieldDragStart }: FieldLibraryProps) {
  const [search, setSearch] = useState('');

  const filteredFields = fieldTypes.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Component Vault</h3>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Blueprint Tools</h2>
        </div>

        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search artifacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[11px] font-bold tracking-tight"
          />
        </div>
      </div>

      <div className="space-y-10">
        {CATEGORIES.map((cat) => {
          const catFields = filteredFields.filter(f => {
            if (cat.id === 'layout') return ['section', 'page_break'].includes(f.type);
            if (cat.id === 'advanced') return ['file_upload', 'rating', 'signature', 'date'].includes(f.type);
            return !['section', 'page_break', 'file_upload', 'rating', 'signature', 'date'].includes(f.type);
          });

          if (catFields.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <cat.icon className="h-3 w-3 text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{cat.label}</span>
              </div>

              <div className="grid gap-2.5">
                {catFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div
                      key={field.type}
                      draggable
                      onDragStart={() => onFieldDragStart(field.type)}
                      className="group cursor-grab active:cursor-grabbing"
                    >
                      <div className="p-3.5 rounded-2xl border-2 border-slate-50 bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                        <div className="flex items-center gap-3.5">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-primary/10 transition-colors">
                            <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-900 group-hover:text-primary transition-colors italic">{field.label}</p>
                            <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">
                              {field.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

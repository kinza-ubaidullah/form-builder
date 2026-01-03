import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Zap } from 'lucide-react';
import type { FormField, ConditionalLogic } from '@/types';

interface ConditionalLogicDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fields: FormField[];
    currentField: FormField;
    onUpdate: (logic: ConditionalLogic[]) => void;
}

export function ConditionalLogicDialog({
    open,
    onOpenChange,
    fields,
    currentField,
    onUpdate,
}: ConditionalLogicDialogProps) {
    const [logic, setLogic] = useState<ConditionalLogic[]>(currentField.conditional_logic || []);

    const availableFields = fields.filter(
        (f) => f.id !== currentField.id && ['dropdown', 'radio', 'checkbox', 'text', 'number'].includes(f.field_type)
    );

    const addLogic = () => {
        if (availableFields.length === 0) return;

        const newLogic: ConditionalLogic = {
            field_id: availableFields[0].id,
            operator: 'equals',
            value: '',
            action: 'show',
        };
        const updated = [...logic, newLogic];
        setLogic(updated);
    };

    const removeLogic = (index: number) => {
        const updated = logic.filter((_, i) => i !== index);
        setLogic(updated);
    };

    const updateLogic = (index: number, updates: Partial<ConditionalLogic>) => {
        const updated = [...logic];
        updated[index] = { ...updated[index], ...updates };
        setLogic(updated);
    };

    const handleSave = () => {
        onUpdate(logic);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-[32px] border-2 border-slate-100 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tighter italic">Conditional Protocol</DialogTitle>
                            <DialogDescription className="font-bold text-xs italic text-slate-400">
                                Define the rules for when this field should be visible.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    {logic.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-sm font-bold text-slate-400 italic">No logic defined yet.</p>
                            <Button
                                variant="outline"
                                onClick={addLogic}
                                className="mt-4 rounded-xl font-bold uppercase text-[10px] tracking-widest border-2"
                            >
                                Add First Rule
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                            {logic.map((item, index) => (
                                <div key={index} className="flex gap-4 items-end p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group/rule">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover/rule:text-primary transition-colors">Action</Label>
                                        <Select
                                            value={item.action}
                                            onValueChange={(val) => updateLogic(index, { action: val as any })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="show">Show Field</SelectItem>
                                                <SelectItem value="hide">Hide Field</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-[1.5] space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover/rule:text-primary transition-colors">If Field</Label>
                                        <Select
                                            value={item.field_id}
                                            onValueChange={(val) => updateLogic(index, { field_id: val })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFields.map((f) => (
                                                    <SelectItem key={f.id} value={f.id}>
                                                        {f.label || "Untitled Field"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover/rule:text-primary transition-colors">Operator</Label>
                                        <Select
                                            value={item.operator}
                                            onValueChange={(val) => updateLogic(index, { operator: val as any })}
                                        >
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="equals">Equals</SelectItem>
                                                <SelectItem value="not_equals">Does Not Equal</SelectItem>
                                                <SelectItem value="contains">Contains</SelectItem>
                                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                                <SelectItem value="less_than">Less Than</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover/rule:text-primary transition-colors">Value</Label>
                                        <Input
                                            value={item.value}
                                            onChange={(e) => updateLogic(index, { value: e.target.value })}
                                            className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                            placeholder="Match value..."
                                        />
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeLogic(index)}
                                        className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                onClick={addLogic}
                                className="w-full h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest transition-all"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Rule
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold h-11 px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="rounded-xl font-black uppercase text-xs tracking-widest h-11 px-8 shadow-xl shadow-primary/20"
                    >
                        Deploy Logic
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

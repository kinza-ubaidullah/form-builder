
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type, Squircle } from 'lucide-react';

interface DesignSettingsProps {
    branding: any;
    onChange: (updates: any) => void;
}

const FONT_FAMILIES = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: '"Open Sans", sans-serif', label: 'Open Sans' },
    { value: '"Merriweather", serif', label: 'Merriweather (Serif)' },
    { value: '"Courier New", monospace', label: 'Courier New (Mono)' },
];

export function DesignSettings({ branding = {}, onChange }: DesignSettingsProps) {
    const handleChange = (key: string, value: any) => {
        onChange({ ...branding, [key]: value });
    };

    return (
        <div className="space-y-8 p-1">

            {/* Colors Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Palette className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Colors</h3>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Primary Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={branding.primaryColor || '#3B82F6'}
                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                className="h-9 w-14 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={branding.primaryColor || '#3B82F6'}
                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                className="flex-1 font-mono text-xs uppercase"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Background Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={branding.backgroundColor || '#ffffff'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                className="h-9 w-14 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={branding.backgroundColor || '#ffffff'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                className="flex-1 font-mono text-xs uppercase"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Success Message Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={branding.successColor || '#10B981'}
                                onChange={(e) => handleChange('successColor', e.target.value)}
                                className="h-9 w-14 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={branding.successColor || '#10B981'}
                                onChange={(e) => handleChange('successColor', e.target.value)}
                                className="flex-1 font-mono text-xs uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Type className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Typography</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Font Family</Label>
                        <Select
                            value={branding.fontFamily || 'Inter, sans-serif'}
                            onValueChange={(val) => handleChange('fontFamily', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                                {FONT_FAMILIES.map((font) => (
                                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                        {font.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Font Size Base</Label>
                        <Select
                            value={branding.fontSize || 'sm'}
                            onValueChange={(val) => handleChange('fontSize', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="xs">Extra Small</SelectItem>
                                <SelectItem value="sm">Small (Default)</SelectItem>
                                <SelectItem value="base">Medium</SelectItem>
                                <SelectItem value="lg">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Shapes & Spacing */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Squircle className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Shapes</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-slate-500">Border Radius (px)</Label>
                            <span className="text-xs font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {branding.borderRadius || 8}px
                            </span>
                        </div>
                        <Slider
                            defaultValue={[branding.borderRadius || 8]}
                            max={30}
                            step={1}
                            onValueChange={(val) => handleChange('borderRadius', val[0])}
                            className="[&>.relative>.absolute]:bg-blue-600"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-slate-500">Input Border Width (px)</Label>
                            <span className="text-xs font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {branding.borderWidth || 1}px
                            </span>
                        </div>
                        <Slider
                            defaultValue={[branding.borderWidth || 1]}
                            max={4}
                            step={1}
                            onValueChange={(val) => handleChange('borderWidth', val[0])}
                            className="[&>.relative>.absolute]:bg-blue-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Input Style</Label>
                        <Select
                            value={branding.inputStyle || 'default'}
                            onValueChange={(val) => handleChange('inputStyle', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="filled">Filled Background</SelectItem>
                                <SelectItem value="flushed">Underline Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

        </div>
    );
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    Plus,
    Share2,
    Eye,
    MousePointerClick,
    Palette,
    Layout
} from 'lucide-react';

interface DocumentationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DocumentationDialog({ open, onOpenChange }: DocumentationDialogProps) {
    const steps = [
        {
            icon: Plus,
            title: '1. Build Your Form',
            description: 'Drag and drop fields from the left sidebar onto the canvas. You can choose from text inputs, dropdowns, file uploads, and more.',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: MousePointerClick,
            title: '2. Validation Protocol',
            description: (
                <div className="space-y-3">
                    <p>Ensure your data is accurate. Click a field and open the <span className="font-bold text-primary italic underline">Validation</span> tab:</p>
                    <ul className="list-disc pl-4 space-y-2">
                        <li><strong>Min/Max Length</strong>: Control character counts for text.</li>
                        <li><strong>Numeric Limits</strong>: Set range for number inputs.</li>
                        <li><strong>Regex Pattern</strong>: Use specific codes (like <code className="bg-slate-100 px-1 rounded">^[0-9]*$</code> for numbers) to enforce strict formatting.</li>
                    </ul>
                </div>
            ),
            color: 'bg-purple-100 text-purple-600'
        },
        {
            icon: Layout,
            title: '3. Conditional Logic',
            description: (
                <div className="space-y-3">
                    <p>Make your form dynamic. Click a field and open the <span className="font-bold text-primary italic underline">Logic</span> tab:</p>
                    <ul className="list-disc pl-4 space-y-2">
                        <li><strong>Action</strong>: Choose whether to "Show" or "Hide" the field.</li>
                        <li><strong>If Field</strong>: Select the trigger field.</li>
                        <li><strong>Condition</strong>: Set when it happens (e.g., If "Country" equals "USA").</li>
                    </ul>
                </div>
            ),
            color: 'bg-orange-100 text-orange-600'
        },
        {
            icon: Palette,
            title: '4. Design & Style',
            description: "Switch to the 'Design' tab to inject your brand personality. Customize colors, fonts, logo, and overall layout to wow your users.",
            color: 'bg-amber-100 text-amber-600'
        },
        {
            icon: Eye,
            title: '5. Deploy & Verify',
            description: "Use 'Preview' to test your Logic and Validation rules. Once ready, hit 'Save' to publish your form to the world.",
            color: 'bg-emerald-100 text-emerald-600'
        },
        {
            icon: Share2,
            title: '6. Collect Responses',
            description: (
                <div className="space-y-3">
                    <p>Your data is safe. When a user clicks "Submit":</p>
                    <ul className="list-disc pl-4 space-y-2">
                        <li><strong>Data Saving</strong>: Their response is stored instantly.</li>
                        <li><strong>Where to find?</strong>: Go to your <span className="font-bold text-primary italic underline">Dashboard</span>, find your form, and click <span className="font-semibold text-slate-700">"View Responses"</span> (under the three-dot menu).</li>
                        <li><strong>Export</strong>: You can download all responses as a CSV file to use in Excel.</li>
                    </ul>
                </div>
            ),
            color: 'bg-pink-100 text-pink-600'
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden sm:max-w-2xl">
                <DialogHeader className="px-6 py-6 border-b shrink-0 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Form Builder Guide</DialogTitle>
                            <DialogDescription>
                                Follow these steps to create a professional form in minutes.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 w-full overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-input scrollbar-track-transparent">
                    <div className="px-6 py-6 space-y-8">
                        {steps.map((step, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${step.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    {index !== steps.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-slate-100 my-2 group-hover:bg-slate-200 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 pt-1 pb-4">
                                    <h3 className="font-semibold text-slate-800 mb-1">{step.title}</h3>
                                    <div className="text-slate-500 text-sm leading-relaxed">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-end shrink-0">
                    <Button onClick={() => onOpenChange(false)} className="px-8">
                        Got it, thanks!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

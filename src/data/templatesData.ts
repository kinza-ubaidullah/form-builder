import {
    Mail, Zap, CalendarDays, MessageSquare, Sparkles, Headphones, Briefcase,
    GraduationCap, HeartPulse, ShoppingCart, Star, Search, FileText,
    ShieldCheck, Globe, Dumbbell, Code, Scale, Camera, Music, Video,
    MapPin, CreditCard, Users, Landmark, LifeBuoy, Rocket, Coffee
} from 'lucide-react';
import { FormField } from '@/types';

export interface TemplateConfig {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: any;
    isFree: boolean;
    fields: Partial<FormField>[];
    color: string;
}

const CATEGORIES = [
    'General', 'Marketing', 'HR', 'Education', 'Healthcare',
    'E-commerce', 'Business', 'Legal', 'Travel', 'Fitness',
    'Technology', 'Events', 'Creative', 'Real Estate'
];

const COLORS = [
    'blue', 'amber', 'green', 'purple', 'pink', 'indigo',
    'teal', 'red', 'rose', 'cyan', 'emerald', 'violet',
    'sky', 'slate', 'orange', 'fuchsia'
];

const ICONS = [
    Mail, Zap, CalendarDays, MessageSquare, Sparkles, Headphones,
    Briefcase, GraduationCap, HeartPulse, ShoppingCart, Star,
    Search, FileText, ShieldCheck, Globe, Dumbbell, Code, Scale,
    Camera, MapPin, CreditCard, Users, Landmark, LifeBuoy, Rocket, Coffee
];

// Helper to generate fields - now explicitly categorized
const getFieldsForCategory = (category: string): Partial<FormField>[] => {
    switch (category) {
        case 'HR':
            return [
                { field_type: 'text' as any, label: 'Candidate Name', required: true, position: 0 },
                { field_type: 'email' as any, label: 'Email', required: true, position: 1 },
                { field_type: 'file' as any, label: 'Resume', required: true, position: 2 },
            ];
        case 'Healthcare':
            return [
                { field_type: 'text' as any, label: 'Patient Name', required: true, position: 0 },
                { field_type: 'date' as any, label: 'DOB', required: true, position: 1 },
                { field_type: 'textarea' as any, label: 'Medical History', required: true, position: 2 },
            ];
        case 'E-commerce':
            return [
                { field_type: 'number' as any, label: 'Quantity', required: true, position: 0 },
                { field_type: 'textarea' as any, label: 'Shipping Address', required: true, position: 1 },
            ];
        case 'Legal':
            return [
                { field_type: 'text' as any, label: 'Party A Name', required: true, position: 0 },
                { field_type: 'text' as any, label: 'Party B Name', required: true, position: 1 },
                { field_type: 'checkbox' as any, label: 'I accept terms', required: true, position: 2 },
            ];
        case 'Travel':
            return [
                { field_type: 'text' as any, label: 'Destination', required: true, position: 0 },
                { field_type: 'date' as any, label: 'Travel Date', required: true, position: 1 },
            ];
        default:
            return [
                { field_type: 'text' as any, label: 'Full Name', required: true, position: 0 },
                { field_type: 'email' as any, label: 'Email', required: true, position: 1 },
                { field_type: 'textarea' as any, label: 'Message', required: false, position: 2 },
            ];
    }
};

const generateTemplates = (): TemplateConfig[] => {
    const templates: TemplateConfig[] = [];

    // Define first 15 Free Templates
    const freeTitles = [
        'Contact Us', 'Newsletter Signup', 'Event RSVP', 'Customer Feedback',
        'Product Waitlist', 'Help Desk', 'Basic Survey', 'Simple RSVP',
        'Join Community', 'Meeting Invite', 'Issue Tracker', 'General Form',
        'Contact Sales', 'Lead Gen', 'Quick Poll'
    ];

    for (let i = 0; i < 100; i++) {
        const isFree = i < 15;
        const category = CATEGORIES[i % CATEGORIES.length];
        const color = COLORS[i % COLORS.length];
        const Icon = ICONS[i % ICONS.length];

        let title = isFree ? freeTitles[i] : `${category} Optimization - ${i + 1}`;
        let description = `Professional ${category.toLowerCase()} template for high conversion.`;

        // Make premium titles sound more "Premium"
        if (!isFree) {
            const prefixes = ['Enterprise', 'Advanced', 'Secure', 'Dynamic', 'Global', 'AI-Powered'];
            const prefix = prefixes[i % prefixes.length];
            title = `${prefix} ${category} Workflow`;
            description = `A comprehensive, high-security ${category.toLowerCase()} template designed for enterprise-scale operations.`;
        }

        templates.push({
            id: `template-${i + 1}`,
            title,
            description,
            category,
            icon: Icon,
            isFree,
            fields: getFieldsForCategory(category),
            color
        });
    }

    // Sort: Free templates first
    return templates.sort((a, b) => {
        if (a.isFree === b.isFree) return 0;
        return a.isFree ? -1 : 1;
    });
};

export const allTemplates = generateTemplates();

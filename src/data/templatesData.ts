import {
    GraduationCap, HeartPulse, ShoppingCart, Star, Search,
    ShieldCheck, Globe, Dumbbell, Code, Scale, Camera, Music, Video,
    MapPin, Rocket, Coffee, Mail, Zap, CalendarDays, MessageSquare, Briefcase, Landmark, LifeBuoy,
    Building, Cpu, Wallet, Heart, Ship, Palette as PaletteIcon, Package, FileText, ClipboardList,
    Cloud, Sparkles, TrendingUp, Flower2, Ticket, Gift, LogOut, BarChart3, Users, Home, Gavel,
    Award, Mic2, Instagram, PenTool, Box, Brain, CreditCard, Key, Sun, BookOpen, Brush,
    BoxSelect, Presentation, PawPrint, School, Layout, Film, Coins, Umbrella, Radio, Gem,
    Car, Activity, Smartphone, Scroll, Monitor, ConciergeBell, Quote, HandHelping
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

    // 1. FREE TEMPLATES (The user asked for exactly 6)
    const freeConfigs = [
        { id: 'free-1', title: 'Basic Contact Form', desc: 'Simple and clean contact form for any website.', cat: 'General', icon: Mail, color: 'blue' },
        { id: 'free-2', title: 'Newsletter Signup', desc: 'Grow your audience with a minimal email capture.', cat: 'Marketing', icon: Zap, color: 'indigo' },
        { id: 'free-3', title: 'Quick Event RSVP', desc: 'Collect attendee counts and names instantly.', cat: 'Events', icon: CalendarDays, color: 'green' },
        { id: 'free-4', title: 'Customer Feedback', desc: 'Get honest reviews about your service.', cat: 'Business', icon: MessageSquare, color: 'amber' },
        { id: 'free-5', title: 'Waitlist Form', desc: 'Build hype for your next big product launch.', cat: 'Product', icon: Rocket, color: 'violet' },
        { id: 'free-6', title: 'Meeting Request', desc: 'Streamline your calendar with simple booking.', cat: 'General', icon: Coffee, color: 'rose' },
    ];

    freeConfigs.forEach(conf => {
        templates.push({
            id: conf.id,
            title: conf.title,
            description: conf.desc,
            category: conf.cat,
            icon: conf.icon,
            isFree: true,
            fields: getFieldsForCategory(conf.cat),
            color: conf.color
        });
    });

    // 2. PREMIUM TEMPLATES (40+ total, so 34+ more)
    const premiumConfigs = [
        { title: 'Elite Talent Application', cat: 'HR', icon: Briefcase, color: 'slate' },
        { title: 'Global Market Survey', cat: 'Marketing', icon: Globe, color: 'blue' },
        { title: 'Secure Legal Intake', cat: 'Legal', icon: Scale, color: 'slate' },
        { title: 'E-commerce Checkout', cat: 'E-commerce', icon: ShoppingCart, color: 'emerald' },
        { title: 'Patient Registration', cat: 'Healthcare', icon: HeartPulse, color: 'red' },
        { title: 'Course Enrollment', cat: 'Education', icon: GraduationCap, color: 'indigo' },
        { title: 'Real Estate Inquiry', cat: 'Real Estate', icon: MapPin, color: 'orange' },
        { title: 'Fitness Assessment', cat: 'Fitness', icon: Dumbbell, color: 'teal' },
        { title: 'Tech Stack Survey', cat: 'Technology', icon: Code, color: 'sky' },
        { title: 'Luxury Stay Booking', cat: 'Travel', icon: MapPin, color: 'cyan' },
        { title: 'Music Studio Session', cat: 'Creative', icon: Music, color: 'pink' },
        { title: 'Director Casting Call', cat: 'Creative', icon: Video, color: 'fuchsia' },
        { title: 'Enterprise Audit', cat: 'Business', icon: ShieldCheck, color: 'slate' },
        { title: 'Product Hunt Launch', cat: 'Product', icon: Rocket, color: 'orange' },
        { title: 'Creative Portfolio', cat: 'Creative', icon: Camera, color: 'violet' },
        { title: 'Scholarship App', cat: 'Education', icon: Star, color: 'amber' },
        { title: 'Help Desk Pro', cat: 'Customer Service', icon: LifeBuoy, color: 'blue' },
        { title: 'SaaS Beta Request', cat: 'Technology', icon: Zap, color: 'indigo' },
        { title: 'Wedding RSVP', cat: 'Events', icon: HeartPulse, color: 'rose' },
        { title: 'Property Management', cat: 'Real Estate', icon: Landmark, color: 'slate' },
        { title: 'B2B Sales Lead', cat: 'Business', icon: Briefcase, color: 'blue' },
        { title: 'Internal IT Request', cat: 'Technology', icon: LifeBuoy, color: 'sky' },
        { title: 'Mental Health Intake', cat: 'Healthcare', icon: HeartPulse, color: 'emerald' },
        { title: 'Venture Capital Deck', cat: 'Finance', icon: Landmark, color: 'slate' },
        { title: 'Personal Training Plan', cat: 'Fitness', icon: Dumbbell, color: 'teal' },
        { title: 'Podcast Guest Form', cat: 'Creative', icon: Music, color: 'fuchsia' },
        { title: 'Webinar Registration', cat: 'Marketing', icon: Video, color: 'red' },
        { title: 'Trade Show Lead', cat: 'Events', icon: Search, color: 'indigo' },
        { title: 'NPS Score Tracker', cat: 'Marketing', icon: MessageSquare, color: 'amber' },
        { title: 'Supply Chain Audit', cat: 'Business', icon: Search, color: 'slate' },
        { title: 'University Admissions', cat: 'Education', icon: GraduationCap, color: 'blue' },
        { title: 'Luxury Car Rental', cat: 'Travel', icon: Coffee, color: 'orange' },
        { title: 'Fashion Casting', cat: 'Creative', icon: Camera, color: 'pink' },
        { title: 'Restaurant Reservation', cat: 'Events', icon: Coffee, color: 'emerald' },
        { title: 'Bug Bounty Report', cat: 'Technology', icon: ShieldCheck, color: 'red' },
        { title: 'Enterprise Procurement', cat: 'Business', icon: Building, color: 'slate' },
        { title: 'AI Research Grant', cat: 'Technology', icon: Cpu, color: 'indigo' },
        { title: 'Asset Management', cat: 'Finance', icon: Wallet, color: 'emerald' },
        { title: 'Nonprofit Donation', cat: 'Charity', icon: Heart, color: 'rose' },
        { title: 'Student Enrollment', cat: 'Education', icon: GraduationCap, color: 'blue' },
        { title: 'Cruise Booking Pro', cat: 'Travel', icon: Ship, color: 'cyan' },
        { title: 'Digital Art Commission', cat: 'Creative', icon: PaletteIcon, color: 'pink' },
        { title: 'Wholesale Order', cat: 'E-commerce', icon: Package, color: 'amber' },
        { title: 'Visa Application', cat: 'Legal', icon: FileText, color: 'slate' },
        { title: 'Inventory Audit', cat: 'Logistics', icon: ClipboardList, color: 'orange' },
        { title: 'Cloud Infrastructure', cat: 'Technology', icon: Cloud, color: 'sky' },
        { title: 'Charity Event RSVP', cat: 'Events', icon: Sparkles, color: 'violet' },
        { title: 'Investment Pitch', cat: 'Finance', icon: TrendingUp, color: 'green' },
        { title: 'Government Grant', cat: 'Public Sector', icon: Landmark, color: 'slate' },
        { title: 'Luxury Spa Booking', cat: 'Healthcare', icon: Flower2, color: 'emerald' },
        { title: 'Music Festival RSVP', cat: 'Events', icon: Ticket, color: 'fuchsia' },
        { title: 'Corporate Gifting', cat: 'Business', icon: Gift, color: 'red' },
        { title: 'Employee Exit Survey', cat: 'HR', icon: LogOut, color: 'slate' },
        { title: 'Market Research', cat: 'Marketing', icon: BarChart3, color: 'blue' },
        { title: 'Affiliate Program', cat: 'Marketing', icon: Users, color: 'indigo' },
        { title: 'Video Production', cat: 'Creative', icon: Video, color: 'fuchsia' },
        { title: 'Interior Design Hub', cat: 'Real Estate', icon: Home, color: 'orange' },
        { title: 'Legal Consultation', cat: 'Legal', icon: Gavel, color: 'slate' },
        { title: 'Scholarship Referral', cat: 'Education', icon: Award, color: 'amber' },
        { title: 'Product Warranty', cat: 'Customer Service', icon: ShieldCheck, color: 'blue' },
        { title: 'Conference Speaker', cat: 'Events', icon: Mic2, color: 'violet' },
        { title: 'Influencer Collab', cat: 'Marketing', icon: Instagram, color: 'pink' },
        { title: 'Freelance Contract', cat: 'Legal', icon: PenTool, color: 'slate' },
        { title: 'Warehouse Request', cat: 'Logistics', icon: Box, color: 'orange' },
        { title: 'Mental Health Assessment', cat: 'Healthcare', icon: Brain, color: 'emerald' },
        { title: 'Fintech Onboarding', cat: 'Finance', icon: CreditCard, color: 'navy' },
        { title: 'Software License', cat: 'Technology', icon: Key, color: 'sky' },
        { title: 'Yoga Class Signup', cat: 'Fitness', icon: Sun, color: 'amber' },
        { title: 'E-book Download', cat: 'Marketing', icon: BookOpen, color: 'indigo' },
        { title: 'Brand Identity Intake', cat: 'Creative', icon: Brush, color: 'violet' },
        { title: 'Subscription Box', cat: 'E-commerce', icon: BoxSelect, color: 'rose' },
        { title: 'Event Photography', cat: 'Events', icon: Camera, color: 'cyan' },
        { title: 'Executive Coaching', cat: 'Business', icon: Presentation, color: 'slate' },
        { title: 'Internship Program', cat: 'HR', icon: GraduationCap, color: 'blue' },
        { title: 'Pet Grooming Booking', cat: 'Service', icon: PawPrint, color: 'orange' },
        { title: 'Real Estate Lease', cat: 'Real Estate', icon: Key, color: 'slate' },
        { title: 'Alumni Network', cat: 'Education', icon: School, color: 'indigo' },
        { title: 'Web Development', cat: 'Technology', icon: Layout, color: 'blue' },
        { title: 'Film Festival Entry', cat: 'Creative', icon: Film, color: 'red' },
        { title: 'Cryptocurrency Wallet', cat: 'Finance', icon: Coins, color: 'amber' },
        { title: 'Insurance Quote', cat: 'Finance', icon: Umbrella, color: 'blue' },
        { title: 'Community Project', cat: 'Charity', icon: Globe, color: 'green' },
        { title: 'Podcast Sponsorship', cat: 'Marketing', icon: Radio, color: 'violet' },
        { title: 'Wedding Planning', cat: 'Events', icon: Gem, color: 'pink' },
        { title: 'Car Dealership Lead', cat: 'Sales', icon: Car, color: 'slate' },
        { title: 'Gym Membership', cat: 'Fitness', icon: Activity, color: 'red' },
        { title: 'Mobile App Feedback', cat: 'Product', icon: Smartphone, color: 'sky' },
        { title: 'Grant Proposal', cat: 'Business', icon: Scroll, color: 'ivory' },
        { title: 'Online Course RSVP', cat: 'Education', icon: Monitor, color: 'indigo' },
        { title: 'VIP Concierge', cat: 'Service', icon: ConciergeBell, color: 'gold' },
        { title: 'Venture Fund Access', cat: 'Finance', icon: Briefcase, color: 'black' },
        { title: 'Creative Writing', cat: 'Creative', icon: Quote, color: 'slate' },
        { title: 'Smart Home Quote', cat: 'Technology', icon: Home, color: 'blue' },
        { title: 'Volunteer Sign-up', cat: 'Charity', icon: HandHelping, color: 'orange' },
    ];

    premiumConfigs.forEach((conf, i) => {
        templates.push({
            id: `premium-${i + 1}`,
            title: conf.title,
            description: `A high-performance ${conf.cat.toLowerCase()} workflow for elite teams.`,
            category: conf.cat,
            icon: conf.icon,
            isFree: false,
            fields: getFieldsForCategory(conf.cat),
            color: conf.color
        });
    });

    return templates;
};

export const allTemplates = generateTemplates();

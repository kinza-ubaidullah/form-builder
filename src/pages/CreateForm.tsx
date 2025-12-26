import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, LayoutTemplate, ArrowRight, Sparkles, Zap, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formsApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { UpgradeModal } from '@/components/payment/UpgradeModal';

export default function CreateForm() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    const handleCreateBlank = async () => {
        if (!profile) return;
        try {
            setLoading(true);
            const forms = await formsApi.getAll();
            if (forms.length >= 5 && !profile.is_premium) {
                setUpgradeModalOpen(true);
                return;
            }

            const newForm = await formsApi.create({
                created_by: profile.id,
                title: 'Untitled Form',
                status: 'draft',
                settings: {},
                branding: {},
            });

            toast({ title: 'Success', description: 'Blank form created!' });
            navigate(`/forms/${newForm.id}/edit`);
        } catch (error) {
            console.error('Failed to create form:', error);
            toast({ title: 'Error', description: 'Failed to create form', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 pb-24">
                <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl w-full space-y-12"
                >
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="h-px w-12 bg-[#2196F3]/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2196F3]">Form Architect</span>
                            <span className="h-px w-12 bg-[#2196F3]/20" />
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                            Create Something <span className="text-[#2196F3] italic">Exceptional</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg max-w-xl mx-auto italic">
                            Choose your starting point. From a blank canvas to industry-specific precision.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Option 1: Blank */}
                        <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Card
                                className="h-full border-2 border-slate-200 hover:border-[#2196F3] transition-all cursor-pointer group shadow-sm bg-white rounded-[32px] overflow-hidden"
                                onClick={handleCreateBlank}
                            >
                                <CardHeader className="p-8 pb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-[#2196F3]/10 transition-colors">
                                        {loading ? <Loader2 className="h-8 w-8 animate-spin text-[#2196F3]" /> : <Plus className="h-8 w-8 text-slate-400 group-hover:text-[#2196F3] transition-colors" />}
                                    </div>
                                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Blank Canvas</CardTitle>
                                    <CardDescription className="text-slate-500 font-bold text-base mt-2">
                                        Build your vision from the ground up with absolute creative freedom.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <div className="flex items-center text-[#2196F3] font-black text-sm uppercase tracking-widest gap-2">
                                        Start Building <ArrowRight className="h-4 w-4" />
                                    </div>

                                    {/* Luxe decoration */}
                                    <div className="mt-12 flex gap-4">
                                        <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full w-1/3 bg-[#2196F3]/20" />
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-emerald-500/20" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Option 2: Templates */}
                        <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Card
                                className="h-full border-2 border-slate-900 bg-slate-900 text-white hover:border-[#2196F3] transition-all cursor-pointer group shadow-xl rounded-[32px] overflow-hidden"
                                onClick={() => navigate('/templates')}
                            >
                                <CardHeader className="p-8 pb-4 relative">
                                    <div className="absolute top-8 right-8 flex gap-2">
                                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                            <Sparkles className="h-4 w-4 text-amber-400" />
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-[#2196F3]/20 transition-colors">
                                        <LayoutTemplate className="h-8 w-8 text-white group-hover:text-[#2196F3] transition-colors" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight">Design Vault</CardTitle>
                                    <CardDescription className="text-slate-400 font-bold text-base mt-2">
                                        Browse <span className="text-white">100+ Premium Blueprints</span> for industry-leading conversions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <div className="flex items-center text-[#2196F3] font-black text-sm uppercase tracking-widest gap-2">
                                        Explore Library <ArrowRight className="h-4 w-4" />
                                    </div>

                                    <div className="mt-10 grid grid-cols-3 gap-2 opacity-50">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
                        {[
                            { icon: Zap, text: 'Instant Setup' },
                            { icon: Shield, text: 'Enterprise Secure' },
                            { icon: LayoutTemplate, text: 'Luxe Designs' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}

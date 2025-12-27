import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Plus, LayoutTemplate, ArrowRight, Sparkles, Zap, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formsApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function CreateForm() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);


    const handleCreateBlank = async () => {
        if (!profile) return;
        try {
            setLoading(true);


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
            <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-[#fafbfc] overflow-hidden">
                {/* Architectural Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#2196F3]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-6xl w-full z-10"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-6 mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10 mb-4"
                        >
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Form Synthesis Protocol</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-slate-900 leading-[0.9] lg:max-w-4xl mx-auto">
                            Design Your <span className="text-[#2196F3] italic font-serif">Masterpiece</span>
                        </h1>

                        <p className="text-slate-500 font-bold text-xl max-w-2xl mx-auto italic leading-relaxed">
                            Initialize a new data collection architecture. Choose a blank canvas for total control or deploy a high-performance blueprint.
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Blank Canvas Option */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -10 }}
                        >
                            <Card
                                className="h-full border-2 border-slate-100 hover:border-[#2196F3] transition-all duration-500 cursor-pointer group shadow-2xl shadow-slate-200/50 bg-white rounded-[40px] overflow-hidden"
                                onClick={handleCreateBlank}
                            >
                                <div className="p-10 flex flex-col h-full relative">
                                    <div className="absolute top-10 right-10">
                                        <div className="h-1.5 w-8 bg-[#2196F3]/20 rounded-full" />
                                    </div>

                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-10 group-hover:bg-[#2196F3]/10 group-hover:rotate-6 transition-all duration-500">
                                        {loading ? (
                                            <Loader2 className="h-10 w-10 animate-spin text-[#2196F3]" />
                                        ) : (
                                            <Plus className="h-10 w-10 text-slate-400 group-hover:text-[#2196F3] transition-colors" />
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Raw Canvas</h3>
                                        <p className="text-slate-500 font-bold text-lg leading-snug italic">
                                            Start with absolute architectural purity. Zero constraints, infinite possibilities.
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center text-slate-900 font-black text-xs uppercase tracking-widest gap-2">
                                            Initialize Blueprint <ArrowRight className="h-4 w-4 text-[#2196F3]" />
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Templates Option */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ y: -10 }}
                        >
                            <Card
                                className="h-full border-none bg-slate-900 text-white hover:ring-4 hover:ring-[#2196F3]/30 transition-all duration-500 cursor-pointer group shadow-2xl shadow-slate-900/40 rounded-[40px] overflow-hidden"
                                onClick={() => navigate('/templates')}
                            >
                                <div className="p-10 flex flex-col h-full relative">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#2196F3]/30 to-transparent blur-[60px] pointer-events-none" />

                                    <div className="absolute top-10 right-10">
                                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#2196F3]">Elite Access</span>
                                        </div>
                                    </div>

                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-[#2196F3]/20 group-hover:-rotate-6 transition-all duration-500">
                                        <LayoutTemplate className="h-10 w-10 text-white group-hover:text-[#2196F3] transition-colors" />
                                    </div>

                                    <div className="space-y-4 mb-10 z-10">
                                        <h3 className="text-4xl font-black tracking-tighter">Blueprint Vault</h3>
                                        <p className="text-slate-400 font-bold text-lg leading-snug italic">
                                            Deploy verified <span className="text-white">High-Performance Templates</span> designed for elite data capture.
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between z-10">
                                        <div className="flex items-center text-[#2196F3] font-black text-xs uppercase tracking-widest gap-2">
                                            Browse Library <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-12 mt-20">
                        {[
                            { icon: Zap, text: 'Zero Latency Build' },
                            { icon: Shield, text: 'Fortified Data Security' },
                            { icon: LayoutTemplate, text: 'Modular System' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                    <item.icon className="h-4 w-4 text-[#2196F3]" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}

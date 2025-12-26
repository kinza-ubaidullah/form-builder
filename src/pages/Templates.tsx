import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formsApi, formFieldsApi } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { motion, AnimatePresence } from 'framer-motion';
import { allTemplates, TemplateConfig } from '@/data/templatesData';
import {
  Plus,
  ArrowRight,
  Lock,
  Sparkles,
  Zap,
  Search,
  MousePointer2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Templates() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [creating, setCreating] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const carouselRef = useRef<HTMLDivElement>(null); // For categories

  const categories = useMemo(() => {
    return ['All', 'Free', 'Premium', ...new Set(allTemplates.map(t => t.category))];
  }, []);

  const filteredTemplates = useMemo(() => {
    // Sort: Free first
    const sorted = [...allTemplates].sort((a, b) => {
      if (a.isFree === b.isFree) return 0;
      return a.isFree ? -1 : 1;
    });

    return sorted.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' ||
        (selectedCategory === 'Free' && template.isFree) ||
        (selectedCategory === 'Premium' && !template.isFree) ||
        template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const isPremium = profile?.is_premium || false;


  const handleTemplateClick = async (template: TemplateConfig) => {
    if (!profile || creating) return;

    if (!template.isFree && !isPremium) {
      setSelectedTemplate(template);
      setPaymentModalOpen(true);
      return;
    }

    try {
      setCreating(template.id);
      const newForm = await formsApi.create({
        title: template.title,
        description: template.description,
        created_by: profile.id,
        status: 'draft',
        settings: {},
        branding: {},
      });

      const fieldPromises = template.fields.map(field =>
        formFieldsApi.create({ ...field, form_id: newForm.id })
      );

      await Promise.all(fieldPromises);
      toast({ title: 'Success', description: 'Form created from template' });
      navigate(`/forms/${newForm.id}/edit`);
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({ title: 'Error', description: 'Failed to create form', variant: 'destructive' });
      setCreating(null);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white relative overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-screen-xl mx-auto space-y-8 relative z-10 pb-24">
          <PaymentModal
            open={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            templateTitle={selectedTemplate?.title}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 max-w-7xl mx-auto"
          >
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-primary/30" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">The Ultimate Collection</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                Luxury <span className="text-primary italic">Vault</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-md italic opacity-80">
                High-performance form architecture for world-class teams. Start free, scale to <span className="text-slate-900 font-black not-italic">100+</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {isPremium && (
                <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-lg">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Membership</span>
                    <span className="text-xs font-black text-slate-900">Elite Access Active</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative group flex-grow sm:flex-grow-0 sm:min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-all" />
                  <Input
                    placeholder="Search industry..."
                    className="pl-10 h-11 bg-white/90 border-slate-200 focus:ring-4 focus:ring-primary/5 rounded-lg font-bold text-sm shadow-sm border-2 transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  size="default"
                  onClick={() => navigate('/forms/new')}
                  className="h-10 px-4 text-xs font-black shadow-md shadow-[#2094f3]/20 transition-all rounded-lg active:scale-95 group bg-[#2094f3] hover:bg-[#1a7bc9] text-white"
                >
                  <Plus className="mr-1 h-3.5 w-3.5 stroke-[3px]" />
                  Blank Canvas
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Category Carousel Section */}
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="relative bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm group">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#2094f3] rounded-xl text-white shadow-lg">
                    <MousePointer2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Industries</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Select specialized field</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-slate-200"
                    onClick={() => scrollCarousel('left')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-slate-200"
                    onClick={() => scrollCarousel('right')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-2 overflow-x-auto p-1 pb-4 scrollbar-none snap-x"
            >
              <AnimatePresence mode="popLayout">
                {categories.map((cat, idx) => (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-lg font-black text-[11px] whitespace-nowrap transition-all border-2 snap-start ${selectedCategory === cat
                      ? "bg-[#2094f3] text-white border-[#2094f3] shadow-lg"
                      : "bg-white/90 text-slate-500 border-transparent hover:border-primary/20 hover:bg-white hover:text-slate-900"
                      }`}
                  >
                    <span className="relative z-10">{cat}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Grid Layout Container with strict overflow control and reduced width */}
          <div className="max-w-5xl mx-auto px-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, idx) => {
                  const Icon = template.icon;
                  const locked = !template.isFree && !isPremium;
                  const colorMap: Record<string, string> = {
                    blue: 'bg-blue-600', amber: 'bg-amber-500', green: 'bg-emerald-500',
                    purple: 'bg-violet-600', pink: 'bg-rose-500', indigo: 'bg-indigo-600',
                    teal: 'bg-teal-500', red: 'bg-red-500', rose: 'bg-rose-600',
                    cyan: 'bg-cyan-500', emerald: 'bg-emerald-600', violet: 'bg-violet-500',
                    sky: 'bg-sky-500', slate: 'bg-slate-700', orange: 'bg-orange-500',
                    fuchsia: 'bg-fuchsia-600'
                  };
                  const bgColor = colorMap[template.color || 'blue'];

                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -10 }}
                      transition={{
                        delay: (idx % 9) * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      className="w-full"
                    >
                      <Card className="group h-[380px] flex flex-col border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden rounded-xl">
                        {/* Luxe Badges */}
                        <div className="absolute top-4 right-4 z-20">
                          {!template.isFree ? (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl"
                            >
                              <Lock className="w-3 h-3 text-primary" />
                              Elite
                            </motion.div>
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl"
                            >
                              <Sparkles className="w-3 h-3" />
                              Open
                            </motion.div>
                          )}
                        </div>

                        {/* Art Section */}
                        <div className="relative h-40 bg-slate-50 flex items-center justify-center">
                          <motion.div
                            className={`aspect-square w-16 rounded-2xl shadow-sm transition-all duration-500 text-white flex items-center justify-center bg-gradient-to-br ${bgColor} to-black/10 relative group-hover:scale-105`}
                          >
                            <Icon className="h-8 w-8 stroke-[1.5px]" />
                          </motion.div>
                          <div className="absolute bottom-3 left-4">
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider py-1 px-2 bg-white/90 shadow-sm text-slate-700 border-slate-100 rounded-md">
                              {template.category}
                            </Badge>
                          </div>
                        </div>

                        <CardHeader className="px-3 pb-1 pt-2">
                          <CardTitle className="text-sm font-black text-slate-900 leading-tight tracking-tighter transition-colors group-hover:text-primary italic">
                            {template.title}
                          </CardTitle>
                          <CardDescription className="text-slate-400 font-bold text-[10px] leading-relaxed mt-0.5 line-clamp-1">
                            {template.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="px-3 flex-grow">
                          <div className="h-[1px] bg-slate-100/80 w-6 mb-2 group-hover:w-full transition-all duration-500" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0 text-left">
                              <div className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Structure</div>
                              <div className="text-[9px] font-black text-slate-800 uppercase italic">Elite</div>
                            </div>
                            <div className="space-y-0 text-left">
                              <div className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Inputs</div>
                              <div className="text-[9px] font-black text-slate-800 uppercase tabular-nums">{template.fields.length} Fields</div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="p-3 pt-0">
                          <Button
                            className={`w-full h-[42px] rounded-lg font-black text-xs transition-all flex items-center justify-center gap-2 overflow-hidden group/btn shadow-md active:scale-95 ${locked
                              ? 'bg-slate-100 text-slate-400 hover:bg-slate-200 border-none'
                              : 'bg-[#2094f3] hover:bg-[#1a7bc9] text-white shadow-[#2094f3]/10'
                              }`}
                            onClick={() => handleTemplateClick(template)}
                            disabled={!!creating}
                          >
                            {creating === template.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              locked ? (
                                <>
                                  <Lock className="w-3 h-3 text-primary" />
                                  <span>Unlock Library</span>
                                </>
                              ) : (
                                <>
                                  <span>Launch Template</span>
                                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </>
                              )
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Empty State Redesign */}
          {filteredTemplates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white/60 backdrop-blur-3xl rounded-[48px] border border-white shadow-lg max-w-4xl mx-auto"
            >
              <div className="p-8 bg-white rounded-3xl inline-flex shadow-xl mb-8 relative">
                <Search className="h-12 w-12 text-slate-100" />
                <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-ping" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Vault Entry Limited</h3>
              <p className="text-slate-400 font-bold text-lg mt-4 max-w-md mx-auto leading-relaxed">Try a broader industry to refine your search results.</p>
              <Button
                variant="outline"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-8 h-12 px-10 rounded-xl font-black text-primary border-primary/20 hover:bg-primary/5 text-lg"
              >
                Reset Vault Filters
              </Button>
            </motion.div>
          )}

          {/* Luxury Footer Hint */}
          <div className="max-w-7xl mx-auto border-t-2 border-slate-100 pt-16">
            <div className="grid md:grid-cols-3 gap-12 items-start">
              <div className="space-y-3">
                <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Expert Support</div>
                <h4 className="text-2xl font-black text-slate-900">Enterprise Solutions</h4>
                <p className="text-slate-400 font-bold leading-relaxed text-sm">Custom architecture and white-label integrations for global corporations.</p>
              </div>
              <div className="space-y-3">
                <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Global Network</div>
                <h4 className="text-2xl font-black text-slate-900">World-Class API</h4>
                <p className="text-slate-400 font-bold leading-relaxed text-sm">Secure data transit with sub-100ms response times across all nodes.</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl space-y-4">
                <div className="p-2 bg-white/10 rounded-xl w-fit">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h5 className="text-lg font-black uppercase tracking-wider">Instant Access</h5>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">Join 50,000+ top-tier organizations building with our ecosystem.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

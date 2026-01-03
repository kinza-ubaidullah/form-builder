import { useEffect, useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmbedCodeDialog } from '@/components/form-builder/EmbedCodeDialog';
import { formsApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Code,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { Form } from '@/types';



const FormCard = forwardRef<HTMLDivElement, {
  form: Form;
  getStatusColor: (status: string) => string;
  onEmbed: (id: string) => void;
  onDelete: (id: string) => void;
}>(({ form, getStatusColor, onEmbed, onDelete }, ref) => (
  <motion.div
    ref={ref}
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col h-full border-primary/5 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${form.status === 'published' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-muted text-muted-foreground group-hover:bg-slate-200'}`}>
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Link to={`/forms/${form.id}/edit`} className="hover:text-primary transition-colors">
                <CardTitle className="text-lg font-bold line-clamp-1 tracking-tight">{form.title}</CardTitle>
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`font-semibold text-[10px] uppercase tracking-wider px-2 py-0 h-5 ${getStatusColor(form.status)} border shadow-sm`}>
                  {form.status}
                </Badge>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(form.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 shadow-xl border-primary/10 backdrop-blur-md bg-white/95">
              <DropdownMenuItem asChild className="rounded-md">
                <Link to={`/forms/${form.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4 text-primary" />
                  Edit Form
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-md">
                <Link to={`/forms/${form.id}/submissions`}>
                  <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem asChild className="rounded-md">
                <Link to={`/form/${form.id}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEmbed(form.id)} className="rounded-md">
                <Code className="mr-2 h-4 w-4 text-primary" />
                Embed Code
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/5 rounded-md"
                onClick={() => onDelete(form.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-grow">
        {form.description ? (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {form.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic font-medium">No description provided</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-4 border-t border-slate-50 bg-slate-50/50 mt-auto flex justify-between items-center gap-2">
        <Button variant="outline" size="sm" className="text-[11px] font-bold h-8 flex-1 border-slate-200 hover:border-primary/30 hover:bg-white hover:text-primary transition-all shadow-sm" asChild>
          <Link to={`/forms/${form.id}/submissions`}>
            Submissions
          </Link>
        </Button>
        <Button size="sm" className="text-[11px] font-bold h-8 flex-1 shadow-lg shadow-primary/10 active:scale-[0.98] transition-all" asChild>
          <Link to={`/forms/${form.id}/design`}>
            Design
          </Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
));

FormCard.displayName = 'FormCard';

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [embedFormId, setEmbedFormId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [searchQuery, forms, activeTab]);

  const filterForms = () => {
    let result = forms;

    // Filter by Tab
    if (activeTab === 'published') {
      result = result.filter(f => f.status === 'published');
    } else if (activeTab === 'draft') {
      result = result.filter(f => f.status === 'draft');
    } else if (activeTab === 'archived') {
      result = result.filter(f => f.status === 'archived');
    }

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (form) =>
          form.title.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query)
      );
    }

    setFilteredForms(result);
  };

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getAll();
      setForms(data);
    } catch (error) {
      console.error('Failed to load forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFormId) return;

    try {
      await formsApi.delete(deleteFormId);
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
      loadForms();
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete form',
        variant: 'destructive',
      });
    } finally {
      setDeleteFormId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 hover:bg-green-200/80 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200/80 border-yellow-200';
      case 'archived':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border-slate-200';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-50/50">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[-5%] w-[25%] h-[25%] bg-primary/10 rounded-full blur-3xl opacity-50" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 space-y-8 max-w-7xl mx-auto relative z-10"
        >
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Forms</h1>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                Manage, edit, and track your performance in real-time.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 h-12 px-8 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl">
              <Link to="/forms/new">
                <Plus className="mr-2 h-5 w-5 stroke-[2.5px]" />
                Create New Form
              </Link>
            </Button>
          </div>

          {/* Filters & Search - Glassmorphism Container */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm shadow-primary/5">
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                <TabsTrigger value="all" className="px-6 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">All Forms</TabsTrigger>
                <TabsTrigger value="published" className="px-6 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Published</TabsTrigger>
                <TabsTrigger value="draft" className="px-6 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Drafts</TabsTrigger>
                <TabsTrigger value="archived" className="px-6 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Archived</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Find a form..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 bg-white/80 border-slate-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-inner font-medium"
              />
            </div>
          </div>

          {/* Forms Grid or Empty State */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-[220px] bg-white shadow-sm overflow-hidden border-primary/5">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2 pt-4">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredForms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden group"
              >
                <div className="text-center py-24 px-6 border-2 border-dashed border-primary/10 rounded-3xl bg-white/40 backdrop-blur-lg shadow-2xl relative overflow-hidden">
                  {/* Decorative Elements inside empty state */}
                  <div className="absolute top-0 right-0 p-8 text-primary/10 rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <Sparkles className="w-24 h-24" />
                  </div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="flex justify-center mb-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 animate-pulse" />
                      <div className="relative p-7 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
                        <FileText className="h-16 w-16 text-primary stroke-[1.5px]" />
                      </div>
                    </div>
                  </motion.div>

                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {searchQuery ? 'No forms matching your search' : 'Your form collection is empty'}
                  </h3>
                  <p className="text-slate-500 mt-4 max-w-md mx-auto text-lg font-medium leading-relaxed">
                    {searchQuery
                      ? 'We couldn’t find what you’re looking for. Try a different query or switch filters.'
                      : 'Unleash your creativity and start building powerful data collection tools today.'}
                  </p>

                  <AnimatePresence>
                    {!searchQuery && activeTab === 'all' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Button asChild size="lg" className="mt-10 h-14 px-10 text-lg font-bold shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all rounded-2xl group">
                          <Link to="/forms/new">
                            <Plus className="mr-3 h-6 w-6 stroke-[3px]" />
                            Create Your First Form
                            <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredForms.map((form) => (
                    <FormCard
                      key={form.id}
                      form={form}
                      getStatusColor={getStatusColor}
                      onEmbed={setEmbedFormId}
                      onDelete={setDeleteFormId}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent className="rounded-3xl border-primary/10 backdrop-blur-xl bg-white/95 shadow-2xl">
          <AlertDialogHeader className="space-y-3">
            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-2">
              <Trash2 className="h-7 w-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-extrabold text-slate-900 leading-tight">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-base leading-relaxed">
              This action cannot be undone. This will permanently delete
              <span className="font-bold text-slate-900 leading-relaxed italic px-1"> "{forms.find(f => f.id === deleteFormId)?.title}" </span>
              and all of its associated submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all text-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="h-12 px-8 rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all">
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Embed Code Dialog */}
      {
        embedFormId && (
          <EmbedCodeDialog
            open={!!embedFormId}
            onOpenChange={(open) => !open && setEmbedFormId(null)}
            formId={embedFormId}
          />
        )
      }
    </AppLayout>
  );
}

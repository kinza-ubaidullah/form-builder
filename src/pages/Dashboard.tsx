import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formsApi, submissionsApi } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { UpgradeModal } from '@/components/payment/UpgradeModal';
import {
  FileText,
  Plus,
  TrendingUp,
  Eye,
  ArrowRight,
  Zap,
  LayoutTemplate,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';
import type { Form } from '@/types';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const formsData = await formsApi.getAll();

      // Sort by updated_at desc
      const sortedForms = formsData.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setForms(sortedForms);

      const published = formsData.filter(f => f.status === 'published').length;

      let totalSubs = 0;
      // Get stats for top 10 forms to avoid too many requests
      for (const form of formsData.slice(0, 10)) {
        const { total } = await submissionsApi.getStats(form.id);
        totalSubs += total;
      }

      setStats({
        totalForms: formsData.length,
        publishedForms: published,
        totalSubmissions: totalSubs,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { toast } = useToast();

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setLoading(true);
      await formsApi.duplicate(id);
      toast({ title: 'Success', description: 'Form duplicated successfully' });
      await loadData();
    } catch (error) {
      console.error('Failed to duplicate form:', error);
      toast({ title: 'Error', description: 'Failed to duplicate form', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this form?')) return;
    try {
      setLoading(true);
      await formsApi.delete(id);
      toast({ title: 'Success', description: 'Form deleted successfully' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast({ title: 'Error', description: 'Failed to delete form', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setLoading(true);
      await formsApi.update(id, { status: 'archived' });
      toast({ title: 'Success', description: 'Form archived' });
      await loadData();
    } catch (error) {
      console.error('Failed to archive form:', error);
      toast({ title: 'Error', description: 'Failed to archive form', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200';
      case 'draft':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200';
      case 'archived':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-slate-200';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AppLayout>
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent pb-1">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back, <span className="font-semibold text-foreground">{profile?.username}</span>!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setUpgradeModalOpen(true)} className="hidden md:flex border-primary/20 hover:bg-primary/5 text-primary">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
            <Button onClick={() => navigate('/forms/new')} className="shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div variants={item}>
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Forms</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-inner">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {loading ? (
                    <Skeleton className="h-8 w-20 bg-muted/20" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-blue-950">{stats.totalForms} <span className="text-sm font-normal text-muted-foreground">/ 5</span></div>
                      {stats.totalForms >= 5 && (
                        <p className="text-xs font-semibold text-red-500 mt-1 flex items-center">
                          Limit Reached
                        </p>
                      )}
                      {stats.totalForms < 5 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Create {5 - stats.totalForms} more free forms
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-blue-100 rounded-full mt-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${stats.totalForms >= 5 ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min((stats.totalForms / 5) * 100, 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Forms</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-inner">
                    <Eye className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {loading ? (
                    <Skeleton className="h-8 w-20 bg-muted/20" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-emerald-950">{stats.publishedForms}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Currently receiving submissions
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center shadow-inner">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {loading ? (
                    <Skeleton className="h-8 w-20 bg-muted/20" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-purple-950">{stats.totalSubmissions}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all your forms
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-7">
            {/* Recent Forms */}
            <motion.div variants={item} className="md:col-span-4 lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Recent Forms</h2>
                  <p className="text-sm text-muted-foreground">Your recently modified forms</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 hover:bg-primary/5">
                  <Link to="/forms">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Card className="border shadow-md flex-grow overflow-hidden">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="space-y-4 p-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : forms.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <div className="bg-muted/30 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No forms created yet</h3>
                      <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
                        Start by creating your first form from scratch or use one of our templates.
                      </p>
                      <Button onClick={() => navigate('/forms/new')} className="mt-6 shadow-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Form
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {forms.slice(0, 5).map((form) => (
                        <Link
                          key={form.id}
                          to={`/forms/${form.id}/edit`}
                          className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors group relative"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:text-primary transition-all shadow-sm group-hover:shadow">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base group-hover:text-primary transition-colors">{form.title}</h4>
                              {form.description ? (
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-xs mt-0.5">
                                  {form.description}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic mt-0.5">No description</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className={`hidden sm:inline-flex font-medium capitalize border ${getStatusColor(form.status)}`}>
                              {form.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                              {new Date(form.updated_at).toLocaleDateString()}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-200/50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <MoreVertical className="h-4 w-4 text-slate-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-[20px] border-2 border-slate-100 shadow-2xl">
                                <DropdownMenuItem onClick={(e) => handleDuplicate(e, form.id)} className="rounded-xl flex items-center gap-2 p-3 font-bold text-xs uppercase tracking-tighter cursor-pointer">
                                  <Copy className="h-4 w-4 text-primary" />
                                  Clone Instance
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/submissions?formId=${form.id}`)} className="rounded-xl flex items-center gap-2 p-3 font-bold text-xs uppercase tracking-tighter cursor-pointer">
                                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                                  View Analytics
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                <DropdownMenuItem onClick={(e) => handleArchive(e, form.id)} className="rounded-xl flex items-center gap-2 p-3 font-bold text-xs uppercase tracking-tighter cursor-pointer">
                                  <Archive className="h-4 w-4 text-amber-500" />
                                  Archive Protocol
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleDelete(e, form.id)} className="rounded-xl flex items-center gap-2 p-3 font-bold text-xs uppercase tracking-tighter cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                  Destroy Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="h-8 w-8 rounded-full bg-slate-900 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm transform translate-x-1 group-hover:translate-x-0">
                              <ChevronRight className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="md:col-span-3 lg:col-span-2">
              <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button
                  className="w-full flex items-center p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all group text-left"
                  onClick={() => navigate('/forms/new')}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">New Form</div>
                    <div className="text-xs text-muted-foreground">Start from scratch</div>
                  </div>
                </button>

                <button
                  className="w-full flex items-center p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all group text-left"
                  onClick={() => navigate('/templates')}
                >
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <LayoutTemplate className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">Templates</div>
                    <div className="text-xs text-muted-foreground">Use a pre-built form</div>
                  </div>
                </button>

                <button
                  className="w-full flex items-center p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 text-card-foreground hover:shadow-md hover:bg-amber-50/50 hover:border-amber-400 transition-all group text-left"
                  onClick={() => setUpgradeModalOpen(true)}
                >
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-base text-amber-900">Upgrade Plan</div>
                    <div className="text-xs text-amber-700/80">Unlock all features</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi, submissionsApi } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, TrendingUp, Users, Eye } from 'lucide-react';
import type { Form } from '@/types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const formsData = await formsApi.getAll();
      setForms(formsData);

      const published = formsData.filter(f => f.status === 'published').length;
      
      let totalSubs = 0;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50';
      case 'draft':
        return 'text-yellow-600 bg-yellow-50';
      case 'archived':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.username}!
            </p>
          </div>
          <Button asChild>
            <Link to="/forms/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalForms}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Forms</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.publishedForms}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>Your most recently updated forms</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted" />
                ))}
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No forms yet</h3>
                <p className="text-muted-foreground mt-2">
                  Get started by creating your first form
                </p>
                <Button asChild className="mt-4">
                  <Link to="/forms/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Form
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {forms.slice(0, 5).map((form) => (
                  <Link
                    key={form.id}
                    to={`/forms/${form.id}/edit`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{form.title}</h4>
                        {form.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          form.status
                        )}`}
                      >
                        {form.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(form.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

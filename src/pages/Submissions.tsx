import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi, formFieldsApi, submissionsApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import type { Form, FormField, Submission } from '@/types';

export default function Submissions() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (formId: string) => {
    try {
      setLoading(true);
      const [formData, fieldsData, submissionsData] = await Promise.all([
        formsApi.getById(formId),
        formFieldsApi.getByFormId(formId),
        submissionsApi.getByFormId(formId),
      ]);

      if (!formData) {
        toast({
          title: 'Error',
          description: 'Form not found',
          variant: 'destructive',
        });
        return;
      }

      setForm(formData);
      setFields(fieldsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no submissions to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Submission ID', 'Submitted At', ...fields.map((f) => f.label)];
    
    const rows = submissions.map((submission) => {
      const row = [
        submission.id,
        new Date(submission.submitted_at).toLocaleString(),
        ...fields.map((field) => {
          const value = submission.data[field.id];
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          return value || '';
        }),
      ];
      return row;
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form?.title || 'form'}-submissions-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Submissions exported successfully',
    });
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || '');
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/forms">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Submissions</h1>
              {form && (
                <p className="text-muted-foreground mt-1">
                  {form.title}
                </p>
              )}
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={submissions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{submissions.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>View and manage form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No submissions yet</h3>
                <p className="text-muted-foreground mt-2">
                  Submissions will appear here once users fill out your form
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted At</TableHead>
                      {fields.map((field) => (
                        <TableHead key={field.id}>{field.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </TableCell>
                        {fields.map((field) => (
                          <TableCell key={field.id}>
                            {formatValue(submission.data[field.id])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

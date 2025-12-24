import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { FileText, Plus, Search, MoreVertical, Edit, Trash2, Copy, Eye, Code } from 'lucide-react';
import type { Form } from '@/types';

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [embedFormId, setEmbedFormId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = forms.filter(
        (form) =>
          form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredForms(filtered);
    } else {
      setFilteredForms(forms);
    }
  }, [searchQuery, forms]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getAll();
      setForms(data);
      setFilteredForms(data);
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Forms</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your forms
            </p>
          </div>
          <Button asChild>
            <Link to="/forms/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full mb-4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchQuery ? 'No forms found' : 'No forms yet'}
            </h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first form'}
            </p>
            {!searchQuery && (
              <Button asChild className="mt-4">
                <Link to="/forms/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Form
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/forms/${form.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/forms/${form.id}/submissions`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Submissions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/form/${form.id}`} target="_blank">
                            <Copy className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEmbedFormId(form.id)}>
                          <Code className="mr-2 h-4 w-4" />
                          Embed Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteFormId(form.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Link to={`/forms/${form.id}/edit`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                      {form.title}
                    </h3>
                  </Link>
                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {form.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                        form.status
                      )}`}
                    >
                      {form.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(form.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form and all its submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Embed Code Dialog */}
      {embedFormId && (
        <EmbedCodeDialog
          open={!!embedFormId}
          onOpenChange={(open) => !open && setEmbedFormId(null)}
          formId={embedFormId}
        />
      )}
    </AppLayout>
  );
}

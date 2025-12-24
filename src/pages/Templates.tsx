import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formsApi } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus } from 'lucide-react';
import type { Form } from '@/types';

const defaultTemplates = [
  {
    id: 'contact',
    title: 'Contact Form',
    description: 'Simple contact form with name, email, and message fields',
    category: 'General',
  },
  {
    id: 'registration',
    title: 'Event Registration',
    description: 'Collect attendee information for events',
    category: 'Events',
  },
  {
    id: 'survey',
    title: 'Customer Survey',
    description: 'Gather customer feedback and satisfaction ratings',
    category: 'Feedback',
  },
  {
    id: 'feedback',
    title: 'Product Feedback',
    description: 'Collect detailed product feedback from users',
    category: 'Feedback',
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [customTemplates, setCustomTemplates] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templates = await formsApi.getTemplates();
      setCustomTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (templateId: string) => {
    try {
      const newForm = await formsApi.create({
        title: `New Form from Template`,
        created_by: profile!.id,
        status: 'draft',
        settings: {},
        branding: {},
      });

      toast({
        title: 'Success',
        description: 'Form created from template',
      });

      navigate(`/forms/${newForm.id}/edit`);
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form from template',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Start with a pre-built template or create your own
            </p>
          </div>
          <Button onClick={() => navigate('/forms/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Start from Scratch
          </Button>
        </div>

        {/* Default Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Popular Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {defaultTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => createFromTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Templates */}
        {customTemplates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Templates</h2>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                      <Skeleton className="h-4 w-full mb-4 bg-muted" />
                      <Skeleton className="h-10 w-full bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <FileText className="h-5 w-5 text-primary mb-2" />
                      <CardTitle className="text-lg">{template.template_name || template.title}</CardTitle>
                      {template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => createFromTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

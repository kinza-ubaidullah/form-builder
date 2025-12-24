import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface EmbedCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
}

export function EmbedCodeDialog({ open, onOpenChange, formId }: EmbedCodeDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const formUrl = `${baseUrl}/form/${formId}`;

  const iframeCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const jsCode = `<div id="form-${formId}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${formUrl}';
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    document.getElementById('form-${formId}').appendChild(iframe);
  })();
</script>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Form</DialogTitle>
          <DialogDescription>
            Copy the code below to embed this form on your website
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Direct Link</TabsTrigger>
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Form URL</Label>
              <div className="flex gap-2">
                <Textarea
                  value={formUrl}
                  readOnly
                  rows={2}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(formUrl)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link directly with users to access your form
              </p>
            </div>
          </TabsContent>

          <TabsContent value="iframe" className="space-y-4">
            <div className="space-y-2">
              <Label>iFrame Embed Code</Label>
              <div className="flex gap-2">
                <Textarea
                  value={iframeCode}
                  readOnly
                  rows={3}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(iframeCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste this code into your HTML to embed the form using an iframe
              </p>
            </div>
          </TabsContent>

          <TabsContent value="javascript" className="space-y-4">
            <div className="space-y-2">
              <Label>JavaScript Embed Code</Label>
              <div className="flex gap-2">
                <Textarea
                  value={jsCode}
                  readOnly
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(jsCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste this code into your HTML where you want the form to appear
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

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
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Code } from 'lucide-react';

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
      description: 'Asset copied to architectural clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[32px] border-2 border-slate-100 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tighter italic">Distribution Protocol</DialogTitle>
              <DialogDescription className="font-bold text-xs italic text-slate-400">
                Deploy your architectural masterpiece across the digital ecosystem.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100/50 p-1 rounded-2xl mb-8">
              <TabsTrigger value="link" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Direct Link</TabsTrigger>
              <TabsTrigger value="iframe" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">iFrame</TabsTrigger>
              <TabsTrigger value="javascript" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">JavaScript</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-6 mt-0">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Public Access Link</Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-100 p-4 font-mono text-xs font-bold text-slate-600 break-all">
                    {formUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(formUrl)}
                    className="h-14 w-14 rounded-2xl border-2 hover:bg-slate-50 shrink-0 transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold italic">
                  Instant public visibility. Share this link for direct submission collection.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="iframe" className="space-y-6 mt-0">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">iFrame Architecture Code</Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-100 p-4 font-mono text-xs font-bold text-slate-600 break-all">
                    {iframeCode}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(iframeCode)}
                    className="h-14 w-14 rounded-2xl border-2 hover:bg-slate-50 shrink-0 transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold italic">
                  Seamlessly integrate your form into any web environment using the iFrame protocol.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="javascript" className="space-y-6 mt-0">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dynamic JavaScript Logic</Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-100 p-4 font-mono text-xs font-bold text-slate-600 break-all whitespace-pre-wrap">
                    {jsCode}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(jsCode)}
                    className="h-14 w-14 rounded-2xl border-2 hover:bg-slate-50 shrink-0 transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold italic">
                  Advanced dynamic embedding. Injects the form blueprint directly into your page's DOM.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-slate-50 p-6 border-t flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-black uppercase text-xs tracking-widest h-11 px-8 shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
          >
            Dismiss Protocol
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ExternalLink, Loader2, Shield, ShieldOff } from 'lucide-react';
import { useState, useId } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface WatchDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  url: string;
  title: string;
}

export function WatchDialog({
  isOpen,
  onOpenChange,
  url,
  title,
}: WatchDialogProps) {
  const [useSandbox, setUseSandbox] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Change key of iframe to force re-render
  const iframeKey = useId();

  const embedUrl = (() => {
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      if ((url.includes('hubdrive.space') || url.includes('hdstream')) && id) {
        return `https://bingezone.com/embed/${id}`;
      }
    } catch (e) {
      // Invalid URL, proceed with original
    }
    return url;
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setIsLoading(true); // Reset loading state when closing
      }
    }}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="truncate">{title}</DialogTitle>
          <DialogDescription className="truncate text-xs">
            Playing in a sandboxed environment to help block intrusive ads.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          <iframe
            key={iframeKey + (useSandbox ? 'sandboxed' : 'unrestricted')}
            src={embedUrl}
            sandbox={useSandbox ? "allow-scripts allow-same-origin allow-presentation" : undefined}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <div className="border-t p-4 flex justify-between items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="sandbox-toggle" 
                checked={useSandbox}
                onCheckedChange={setUseSandbox}
                aria-label="Toggle Sandbox"
              />
              <Label htmlFor="sandbox-toggle" className="flex items-center gap-2 text-sm">
                {useSandbox ? <Shield className="h-4 w-4 text-green-500" /> : <ShieldOff className="h-4 w-4 text-red-500" />}
                Ad-blocking Sandbox
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in New Tab
                  </a>
              </Button>
              <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
              </DialogClose>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

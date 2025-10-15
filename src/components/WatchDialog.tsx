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
import { ExternalLink } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="truncate">{title}</DialogTitle>
          <DialogDescription className="truncate text-xs">
            Playing in a sandboxed environment to block intrusive ads.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={url}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
        <div className="border-t p-4 flex justify-end gap-2">
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
      </DialogContent>
    </Dialog>
  );
}

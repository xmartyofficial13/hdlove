
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ScreenshotGalleryProps {
  screenshots: string[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  return (
    <div className="mt-12">
      <div className="mb-6 text-center">
        <h2 className="font-headline text-2xl font-semibold text-foreground">
          Get a preview of the visual quality and scenes
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
        {screenshots.slice(0, 6).map((src, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg">
                <img
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl border-0 bg-transparent p-0">
              <img
                src={src}
                alt={`Screenshot ${index + 1}`}
                className="h-auto w-full max-h-[90vh] object-contain"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
      {screenshots.length > 6 && (
        <div className="mt-6 flex justify-center">
           <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    View All Screenshots
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>All Screenshots</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[70vh]">
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
                        {screenshots.map((src, index) => (
                           <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg">
                                <img
                                    src={src}
                                    alt={`Screenshot ${index + 1}`}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40"></div>
                                <div className="absolute bottom-2 right-2 flex items-center justify-center rounded-full bg-black/50 px-2 py-1 text-xs font-bold text-white">
                                    {index + 1}
                                </div>
                                </div>
                            </DialogTrigger>
                             <DialogContent className="max-w-4xl border-0 bg-transparent p-0">
                                <img
                                    src={src}
                                    alt={`Screenshot ${index + 1}`}
                                    className="h-auto w-full max-h-[90vh] object-contain"
                                />
                            </DialogContent>
                           </Dialog>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

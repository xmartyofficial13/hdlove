
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { DownloadLink } from '@/lib/types';
import { DownloadCloud, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface DownloadButtonProps {
  link: DownloadLink;
}

export function DownloadButton({ link }: DownloadButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const isWatchLink = link.quality.toLowerCase().includes('watch') || link.url.includes('hdstream');

  const handleWatchClick = () => {
    toast({
        title: "Use Main Player",
        description: "Please use the 'Watch' button at the top of the page to stream.",
    });
  };

  if (isWatchLink) {
    return (
      <Button variant="secondary" className="h-auto w-full flex-col p-3" onClick={handleWatchClick}>
        <PlayCircle className="mb-1 h-5 w-5 text-primary" />
        <span className="text-center text-xs font-semibold leading-tight text-foreground">
          {link.title}
        </span>
      </Button>
    );
  }

  return (
    <Button asChild variant="secondary" className="h-auto w-full flex-col p-3">
      <Link href={link.url} target="_blank" rel="noopener noreferrer">
        <DownloadCloud className="mb-1 h-5 w-5 text-primary" />
        <span className="text-center text-xs font-semibold leading-tight text-foreground">
          {link.title}
        </span>
      </Link>
    </Button>
  );
}

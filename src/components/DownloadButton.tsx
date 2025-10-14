import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { DownloadLink } from '@/lib/types';
import { DownloadCloud } from 'lucide-react';

interface DownloadButtonProps {
  link: DownloadLink;
}

export function DownloadButton({ link }: DownloadButtonProps) {
  return (
    <Button asChild variant="secondary" className="h-auto w-full flex-col p-3">
      <Link href={link.url} target="_blank" rel="noopener noreferrer">
        <DownloadCloud className="mb-1 h-5 w-5 text-primary" />
        <span className="text-center text-xs font-semibold leading-tight text-foreground">
          {link.quality}
        </span>
      </Link>
    </Button>
  );
}

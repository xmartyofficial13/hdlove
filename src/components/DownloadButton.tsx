'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { DownloadLink } from '@/lib/types';
import { DownloadCloud, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DownloadButtonProps {
  link: DownloadLink;
}

export function DownloadButton({ link }: DownloadButtonProps) {
  const router = useRouter();
  
  // Exclude hubstream.art from being a watch link
  const isHubStream = link.url.includes('hubstream.art');
  const isWatchLink = !isHubStream && (link.quality.toLowerCase().includes('watch') || link.url.includes('hdstream'));

  const handleWatchClick = () => {
    router.push(`/player?url=${encodeURIComponent(link.url)}`);
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

  // All other links, including hubstream.art, are treated as external links
  return (
    <Button asChild variant="secondary" className="h-auto w-full flex-col p-3">
      <Link href={link.url} target="_blank" rel="noopener noreferrer">
        {isHubStream ? (
          <PlayCircle className="mb-1 h-5 w-5 text-primary" />
        ) : (
          <DownloadCloud className="mb-1 h-5 w-5 text-primary" />
        )}
        <span className="text-center text-xs font-semibold leading-tight text-foreground">
          {link.title}
        </span>
      </Link>
    </Button>
  );
}

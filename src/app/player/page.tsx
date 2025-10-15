'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

function Player() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');

  const [useSandbox, setUseSandbox] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  if (!url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Invalid URL</h2>
        <p className="text-muted-foreground">The watch link is missing or invalid.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleToggleSandbox = (checked: boolean) => {
    setIsLoading(true);
    setUseSandbox(checked);
  };
  
  // By changing the key, we force the iframe to re-render when the sandbox state changes.
  const iframeKey = useSandbox ? 'sandbox-on' : 'sandbox-off';

  return (
    <div className="flex h-full flex-col">
       <div className="relative w-full aspect-video bg-black">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
                <div className="absolute text-white">Loading Player...</div>
            </div>
        )}
        <iframe
            key={iframeKey}
            src={url}
            className="h-full w-full"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            sandbox={useSandbox ? "allow-scripts allow-same-origin allow-presentation" : undefined}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
        <div className="flex items-center space-x-2">
            <Switch
                id="sandbox-toggle"
                checked={useSandbox}
                onCheckedChange={handleToggleSandbox}
                aria-readonly
            />
            <Label htmlFor="sandbox-toggle" className="cursor-pointer text-sm font-medium">
                Enable Ad-Block (Sandbox)
            </Label>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Details
        </Button>
      </div>
       <div className="p-4 text-sm text-muted-foreground">
        <p>If the video doesn't load, try turning off the "Ad-Block (Sandbox)" toggle and wait for the player to reload. Some videos require scripts that are blocked by the sandbox.</p>
      </div>
    </div>
  );
}

export default function PlayerPage() {
    return (
        <div className="container mx-auto h-full max-w-6xl px-4 py-8">
            <Suspense fallback={<PlayerSkeleton />}>
                <Player />
            </Suspense>
        </div>
    )
}

function PlayerSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <div className="relative w-full aspect-video bg-black">
                <Skeleton className="h-full w-full" />
            </div>
             <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
                <div className="flex items-center space-x-2">
                   <Skeleton className="h-6 w-12 rounded-full" />
                   <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    )
}

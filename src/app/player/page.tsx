'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function Player() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');

  const [useSandbox, setUseSandbox] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('The watch link is missing or invalid.');
      setIsLoading(false);
      return;
    }

    async function fetchCleanHtml() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(url as string)}`);
        if (!response.ok) {
          throw new Error('Failed to load player content.');
        }
        const text = await response.text();
        setHtmlContent(text);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCleanHtml();
  }, [url]);


  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // By changing the key, we force the iframe to re-render when the sandbox state changes.
  const iframeKey = useSandbox ? 'sandbox-on' : 'sandbox-off';

  return (
    <div className="flex h-full flex-col">
       <div className="relative w-full aspect-video bg-black">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
                <div className="absolute text-white">Preparing Secure Player...</div>
            </div>
        )}
        {!isLoading && htmlContent && (
            <iframe
                key={iframeKey}
                srcDoc={htmlContent}
                className="h-full w-full"
                allowFullScreen
                sandbox={useSandbox ? "allow-scripts allow-same-origin allow-presentation" : undefined}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/20 px-4 py-3">
        <div className="flex items-center space-x-2">
            <Switch
                id="sandbox-toggle"
                checked={useSandbox}
                onCheckedChange={setUseSandbox}
                aria-readonly
            />
            <Label htmlFor="sandbox-toggle" className="cursor-pointer text-sm font-medium">
                Ad-Block (Sandbox)
            </Label>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Details
        </Button>
      </div>
       <Alert variant="default" className="mt-4 bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to Play</AlertTitle>
            <AlertDescription>
                Please click the play button 4-5 times to start the video, as it may not play on the first click. Once the video starts, use the full-screen button for the best viewing experience.
            </AlertDescription>
          </Alert>
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
                 <div className="absolute text-white inset-0 flex items-center justify-center">Preparing Secure Player...</div>
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

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
import Head from 'next/head';

function Player() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');

  const [useSandbox, setUseSandbox] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The iframe src is now set directly, so we don't need the htmlContent state.
  const iframeSrc = url ? `/api/scrape?url=${encodeURIComponent(url)}` : undefined;

  useEffect(() => {
    if (!url) {
      setError('The watch link is missing or invalid.');
      setIsLoading(false);
    }
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

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
       {/* Inject the JW Player script */}
       <Head>
        <script src="https://hdstream4u.com/player/jw8/jwplayer.js?v=6" async />
       </Head>
       <div className="relative w-full aspect-video bg-black">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
                <div className="absolute text-white">Preparing Secure Player...</div>
            </div>
        )}
        {iframeSrc && (
            <iframe
                key={iframeKey}
                src={iframeSrc}
                className="h-full w-full"
                allowFullScreen
                onLoad={handleIframeLoad}
                sandbox={useSandbox ? "allow-scripts allow-forms allow-same-origin allow-presentation" : "allow-scripts allow-forms allow-same-origin allow-presentation"}
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

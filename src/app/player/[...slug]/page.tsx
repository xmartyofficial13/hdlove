'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

declare global {
  interface Window {
    jwplayer: any;
  }
}

interface StreamDetails {
    file: string;
    downloadUrl: string;
    title: string;
}

export default function PlayerPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;
  const [details, setDetails] = useState<StreamDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlayerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/stream/${slug}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch stream details. The link may be expired or invalid.');
          }
          return res.json();
        })
        .then((data) => {
          if(data.error) {
            throw new Error(data.error);
          }
          setDetails(data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [slug]);

  useEffect(() => {
    if (details && isPlayerReady && playerRef.current) {
        try {
            const playerInstance = window.jwplayer(playerRef.current);
            playerInstance.setup({
                file: details.file,
                title: details.title,
                width: '100%',
                aspectratio: '16:9',
                autostart: true,
            });
        } catch (e) {
            console.error("JW Player Error:", e);
            setError("Could not initialize the video player.");
        }
    }
  }, [details, isPlayerReady]);

  if (error) {
    return (
        <div className="container mx-auto max-w-4xl py-8 text-center">
             <Alert variant="destructive" className="mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!details) {
    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Skeleton className="aspect-video w-full" />
            <div className="mt-4 flex justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        </div>
    );
  }
  
  return (
    <>
      <Script
        src="https://cdn.jwplayer.com/libraries/CFP9F83o.js"
        onReady={() => {
            setPlayerReady(true);
        }}
      />
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="mb-4 text-center font-headline text-2xl font-bold">{details.title}</h1>
        <div className="relative aspect-video w-full bg-black">
            <div ref={playerRef} id="player"></div>
        </div>
        <div className="mt-6 flex justify-center">
            {details.downloadUrl && (
                <Button asChild size="lg">
                    <a href={details.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-5 w-5" />
                        Download Video
                    </a>
                </Button>
            )}
        </div>
      </div>
    </>
  );
}

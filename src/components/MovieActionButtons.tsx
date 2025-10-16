'use client';

import { Button } from '@/components/ui/button';
import { Download, Eye, Share2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface MovieActionButtonsProps {
  movieTitle: string;
  hasDownloads?: boolean;
  watchUrl?: string;
  imdbUrl?: string;
  hasRating?: boolean;
}

export function MovieActionButtons({
  movieTitle,
  hasDownloads,
  watchUrl,
  imdbUrl,
  hasRating,
}: MovieActionButtonsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDownloadClick = () => {
    const downloadSection = document.getElementById('download-section');
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchClick = () => {
    if (watchUrl) {
      router.push(`/player?url=${encodeURIComponent(watchUrl)}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'No watchable link found',
        description: 'We couldn\'t find a direct streaming link for this movie.',
      });
    }
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movieTitle,
          text: `Check out ${movieTitle}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback for when user cancels share, etc.
        toast({
            variant: 'destructive',
            title: 'Sharing failed',
            description: 'The content could not be shared.',
        });
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'The page URL has been copied to your clipboard.',
      });
    }
  };
  
  const imdbLink = imdbUrl || `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`;


  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {hasDownloads && (
        <Button
          onClick={handleDownloadClick}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transition-transform hover:scale-105"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Download
        </Button>
      )}
      {watchUrl && (
        <Button onClick={handleWatchClick} variant="outline" size="lg" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300">
          <Eye className="mr-2 h-5 w-5" />
          Watch
        </Button>
      )}
       {hasRating && (
         <a href={imdbLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                IMDb
            </Button>
         </a>
       )}
      <Button onClick={handleShareClick} variant="outline" size="icon" className="h-12 w-12">
        <Share2 className="h-5 w-5" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  );
}

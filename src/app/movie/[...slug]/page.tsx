import { notFound } from 'next/navigation';
import { AlertCircle, Calendar, Film, Languages, Star, User, Video, Tag, Eye } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getMovieDetails } from '@/lib/actions';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DownloadButton } from '@/components/DownloadButton';
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
import { RandomStats } from '@/components/RandomStats';
import { MovieActionButtons } from '@/components/MovieActionButtons';
import type { Metadata } from 'next';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <div className="text-base font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
};

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
    const path = params.slug.join('/');
    const details = await getMovieDetails(path);
  
    if (!details) {
      return {
        title: 'Not Found',
      };
    }

    const movieSchema = {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": details.title,
      "description": details.description,
      "image": details.imageUrl,
      "aggregateRating": details.rating ? {
        "@type": "AggregateRating",
        "ratingValue": details.rating,
        "bestRating": "10"
      } : undefined,
      "director": details.director ? {
          "@type": "Person",
          "name": details.director
      } : undefined,
      "actor": details.stars ? details.stars.split(', ').map(star => ({ "@type": "Person", "name": star })) : undefined,
      "genre": details.category ? details.category.split(', ').map(cat => cat.trim()) : undefined,
      "datePublished": details.releaseDate,
    };
  
    return {
      title: `${details.title} - hdlove4u`,
      description: details.description,
      openGraph: {
        title: `${details.title} - hdlove4u`,
        description: details.description,
        images: [details.imageUrl],
        type: 'video.movie',
        url: `/movie/${path}`
      },
      twitter: {
        card: 'summary_large_image',
        title: `${details.title} - hdlove4u`,
        description: details.description,
        images: [details.imageUrl],
      },
      other: {
        'application/ld+json': JSON.stringify(movieSchema),
      }
    };
  }

export default async function MoviePage({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/');
  const details = await getMovieDetails(path);

  if (!details) {
    notFound();
  }
  
  const hasEpisodes = details.episodeList && details.episodeList.length > 0;
  const hasDownloads = details.downloadLinks && details.downloadLinks.length > 0;
  const mainWatchUrl = details.imdbId ? `#watch-section` : undefined;


  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-row gap-4">
        <div className="w-[100px] shrink-0 md:w-[200px]">
             <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-xl shadow-2xl shadow-primary/10 transition-transform hover:scale-105">
                  <img
                    src={details.imageUrl}
                    alt={details.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-transparent border-0 p-0 overflow-hidden">
                <img
                  src={details.imageUrl}
                  alt={details.title}
                  className="h-auto w-full max-h-[90vh] object-contain"
                />
              </DialogContent>
            </Dialog>
        </div>
        <div className="w-3/4 flex flex-col">
          <h1 className="font-headline font-bold tracking-tight text-foreground sm:text-3xl">
            {details.title}
          </h1>
          <div className="block sm:hidden">
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {details.category?.split(',').map(cat => {
                  const cleanedCat = cat.replace(//g, '').trim();
                  const categoryPath = `/category/${cleanedCat.toLowerCase().replace(/ /g, '-')}`;
                  if (!cleanedCat) return null;
                  return (
                    <Link href={categoryPath} key={cleanedCat} prefetch={false}>
                      <Badge variant="outline" className="transition-colors hover:bg-primary/20 hover:border-primary/50 cursor-pointer">
                        <Tag className="mr-1 h-3 w-3" />
                        {cleanedCat}
                      </Badge>
                    </Link>
                  )
                })}
            </div>
          </div>
           <div className="hidden sm:block">
            <div className="mt-4 flex flex-wrap items-center gap-2">
                {details.category?.split(',').map(cat => {
                  const cleanedCat = cat.replace(//g, '').trim();
                  const categoryPath = `/category/${cleanedCat.toLowerCase().replace(/ /g, '-')}`;
                  if (!cleanedCat) return null;
                  return (
                    <Link href={categoryPath} key={cleanedCat} prefetch={false}>
                      <Badge variant="outline" className="transition-colors hover:bg-primary/20 hover:border-primary/50 cursor-pointer">
                        <Tag className="mr-1 h-3 w-3" />
                        {cleanedCat}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            <RandomStats />
             <MovieActionButtons 
                movieTitle={details.title}
                hasDownloads={hasDownloads || hasEpisodes}
                watchUrl={mainWatchUrl}
              />
           </div>
        </div>
      </div>
      
      <div className="block sm:hidden mt-4">
        <RandomStats />
        <MovieActionButtons 
            movieTitle={details.title}
            hasDownloads={hasDownloads || hasEpisodes}
            watchUrl={mainWatchUrl}
        />
      </div>


       <Separator className="my-8" />

        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {details.rating && <DetailItem 
              icon={<Star className="h-5 w-5" />} 
              label="iMDB Rating" 
              value={details.imdbUrl ? (
                <a href={details.imdbUrl} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-foreground hover:underline">
                  {`${details.rating}/10`}
                </a>
              ) : (
                `${details.rating}/10`
              )}
            />}
            <DetailItem icon={<Calendar className="h-5 w-5" />} label="Release Date" value={details.releaseDate} />
            <DetailItem icon={<Languages className="h-5 w-5" />} label="Language" value={details.language} />
            <DetailItem icon={<Film className="h-5 w-5" />} label="Director" value={details.director} />
            <DetailItem icon={<User className="h-5 w-5" />} label="Stars" value={details.stars} />
        </div>
       
       <Separator className="my-8" />
       
       <div>
         <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">
           Synopsis
         </h2>
         <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base md:leading-7">
            {details.description}
          </p>
       </div>
       
       {details.trailer?.url && (
            <div className="mt-8">
            <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">
                Watch Trailer
            </h2>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                    src={details.trailer.url}
                    title={`${details.title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                ></iframe>
            </div>
            </div>
        )}
      
      <div id="download-section" className="w-full">
          <Separator className="my-8" />

          {details.imdbId && (
            <div id="watch-section" className="mt-8 mb-8">
              <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">
                Watch Now
              </h2>
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={`https://hikke383ehr.com/play/${details.imdbId}`}
                  title={`${details.title} Player`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                ></iframe>
              </div>
            </div>
          )}

          {details.screenshots && details.screenshots.length > 0 && (
            <ScreenshotGallery screenshots={details.screenshots} />
          )}

          {hasEpisodes ? (
            <div className="mt-8">
              <h2 className="font-headline text-2xl font-semibold text-foreground">
                Episodes
              </h2>
              <Accordion type="single" collapsible className="mt-4 w-full">
                {details.episodeList.map((episode) => (
                  <AccordionItem value={`episode-${episode.number}`} key={episode.number}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-bold text-primary">
                          {episode.number}
                        </div>
                        <span className="text-lg font-semibold">{episode.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {episode.downloadLinks.map((link, index) => (
                          <DownloadButton key={index} link={link} />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
           ) : hasDownloads ? (
             <div className="mt-8">
                <h2 className="font-headline text-2xl font-semibold text-foreground">
                  Download Links
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {details.downloadLinks.map((link) => (
                    <DownloadButton key={link.url} link={link} />
                    ))}
                </div>
             </div>
           ) : (
             <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                 <p className="text-muted-foreground">No download links found.</p>
             </div>
           )}
          
          <Alert variant="default" className="mt-8 bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please Note</AlertTitle>
            <AlertDescription>
                For download links, you may be redirected to a page with timers or ads. This is part of the source website's system. Wait for the final download to appear.
            </AlertDescription>
          </Alert>
        </div>
    </div>
  );
}

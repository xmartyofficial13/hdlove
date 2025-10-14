import Image from 'next/image';
import { notFound } from 'next/navigation';
import { DownloadButton } from '@/components/DownloadButton';
import { AlertCircle, Calendar, Clapperboard, Download, Languages, Star, Youtube } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { MovieDetails } from '@/lib/types';


export const revalidate = 86400; // Revalidate once a day

async function getMovieDetailsFromApi(path: string): Promise<MovieDetails | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    try {
        const res = await fetch(`${baseUrl}/api/movie/${path}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) {
            console.error("Failed to fetch movie details from API", res.status, res.statusText);
            return null;
        }
        const data = await res.json();
        return data.movie;
    } catch(e) {
        console.error(`Error fetching from /api/movie/${path}:`, e);
        return null;
    }
}


interface MoviePageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: MoviePageProps) {
    const path = params.slug.join('/');
    const details = await getMovieDetailsFromApi(path);
  
    if (!details) {
      return {
        title: 'Not Found',
      }
    }
  
    return {
      title: `${details.title} - NetVlyx`,
      description: details.description,
    }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const path = params.slug.join('/');
  const details = await getMovieDetailsFromApi(path);

  if (!details) {
    notFound();
  }
  
  const hasEpisodes = details.episodeList && details.episodeList.length > 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-24">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-2xl shadow-primary/10">
              <Image
                src={details.imageUrl}
                alt={details.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-8 lg:col-span-9">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white lg:text-5xl">
            {details.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
             {details.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-semibold text-white">{details.rating}</span>
                <span className="text-sm">/ 10 IMDb</span>
              </div>
            )}
            {details.category && <Badge variant="outline">{details.category.split('|')[0].trim()}</Badge>}
            {details.language && (
                <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    <span>{details.language}</span>
                </div>
            )}
            {details.releaseDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{details.releaseDate}</span>
              </div>
            )}
          </div>

          <p className="mt-6 font-body leading-7 text-muted-foreground">
            {details.description}
          </p>
          
          {details.trailer?.url && (
            <a href={details.trailer.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600/40">
              <Youtube className="h-6 w-6 text-red-500" />
              Watch Trailer
            </a>
          )}

          <Separator className="my-8" />
          
           {hasEpisodes ? (
            <div>
              <h2 className="font-headline text-2xl font-semibold text-white">
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
                      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
                        {episode.downloadLinks.map((link, index) => (
                          <DownloadButton key={index} link={link} />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
           ) : (
             <div>
                <h2 className="font-headline text-2xl font-semibold text-white">
                  Download Links
                </h2>
                {details.downloadLinks && details.downloadLinks.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {details.downloadLinks.map((link) => (
                        <DownloadButton key={link.url} link={link} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                        <p className="text-muted-foreground">No direct download links found.</p>
                    </div>
                )}
             </div>
           )}

          {details.screenshots && details.screenshots.length > 0 && (
            <div className="mt-12">
                <h2 className="font-headline text-2xl font-semibold text-white">Screenshots</h2>
                <Carousel
                    opts={{
                    align: "start",
                    loop: true,
                    }}
                    className="w-full mt-4"
                >
                    <CarouselContent>
                    {details.screenshots.map((src, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                                <Image 
                                    src={src} 
                                    alt={`Screenshot ${index + 1}`} 
                                    fill 
                                    className="object-cover transition-transform duration-300 hover:scale-105" 
                                />
                            </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-12" />
                    <CarouselNext className="mr-12" />
                </Carousel>
            </div>
          )}
          
          <Alert variant="default" className="mt-8 bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please Note</AlertTitle>
            <AlertDescription>
                These links may lead to a page with timers or ads. This is part of the source website's system. Click the link and wait for the final download to appear.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

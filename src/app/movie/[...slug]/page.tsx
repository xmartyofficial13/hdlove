import { notFound } from 'next/navigation';
import { DownloadButton } from '@/components/DownloadButton';
import { AlertCircle, Calendar, Film, Languages, Star, User, Video, Youtube, Tag } from 'lucide-react';
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
import { getMovieDetails } from '@/lib/actions';

export const revalidate = 3600; // Revalidate every hour

interface MoviePageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: MoviePageProps) {
    const path = params.slug.join('/');
    const details = await getMovieDetails(path);
  
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

export default async function MoviePage({ params }: MoviePageProps) {
  const path = params.slug.join('/');
  const details = await getMovieDetails(path);

  if (!details) {
    notFound();
  }
  
  const hasEpisodes = details.episodeList && details.episodeList.length > 0;
  const hasDownloads = details.downloadLinks && details.downloadLinks.length > 0;
  const hubdriveLinks = details.downloadLinks?.filter(link => link.url.includes('hubdrive.space') || link.url.includes('hdstream')) || [];
  const otherDownloadLinks = details.downloadLinks?.filter(link => !link.url.includes('hubdrive.space') && !link.url.includes('hdstream')) || [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 md:w-1/4">
          <div className="sticky top-24">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-2xl shadow-primary/10">
              <img
                src={details.imageUrl}
                alt={details.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {details.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {details.category?.split('|').map(cat => {
              // Clean the category name from unwanted characters
              const cleanedCat = cat.replace(//g, '').trim();
              if (!cleanedCat) return null;
              return (
                <Badge key={cleanedCat} variant="outline" className="transition-colors hover:bg-primary/20">
                  <Tag className="mr-1 h-3 w-3" />
                  {cleanedCat}
                </Badge>
              )
            })}
          </div>

          <p className="mt-6 font-body leading-7 text-muted-foreground">
            {details.description}
          </p>
          
          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={<Star className="h-5 w-5" />} label="iMDB Rating" value={details.rating ? `${details.rating}/10` : 'N/A'} />
            <DetailItem icon={<Calendar className="h-5 w-5" />} label="Release Date" value={details.releaseDate} />
            <DetailItem icon={<Languages className="h-5 w-5" />} label="Language" value={details.language} />
            <DetailItem icon={<Film className="h-5 w-5" />} label="Director" value={details.director} />
            <DetailItem icon={<User className="h-5 w-5" />} label="Stars" value={details.stars} />
            <DetailItem icon={<Video className="h-5 w-5" />} label="Quality" value={details.qualities?.map(q => q.name).join(' | ')} />
          </div>

          {details.trailer?.url && (
            <a href={details.trailer.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600/40">
              <Youtube className="h-6 w-6 text-red-500" />
              Watch Trailer
            </a>
          )}
        </div>
      </div>
      
      <div className="w-full">
          <Separator className="my-8" />

          {hubdriveLinks.length > 0 && (
             <div className="mb-8">
                <h2 className="font-headline text-2xl font-semibold text-foreground">
                  Watch Online / Direct Download
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {hubdriveLinks.map((link) => (
                    <DownloadButton key={link.url} link={link} />
                    ))}
                </div>
             </div>
          )}

          {details.screenshots && details.screenshots.length > 0 && (
            <div className="mt-12">
                <h2 className="font-headline text-2xl font-semibold text-foreground">Screenshots</h2>
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
                                <img 
                                    src={src} 
                                    alt={`Screenshot ${index + 1}`} 
                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
                                    loading="lazy"
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
           ) : otherDownloadLinks.length > 0 ? (
             <div className="mt-8">
                <h2 className="font-headline text-2xl font-semibold text-foreground">
                  Download Links
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {otherDownloadLinks.map((link) => (
                    <DownloadButton key={link.url} link={link} />
                    ))}
                </div>
             </div>
           ) : (
            !hasDownloads && !hasEpisodes && hubdriveLinks.length === 0 && (
             <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                 <p className="text-muted-foreground">No download links found.</p>
             </div>
            )
           )}
          
          <Alert variant="default" className="mt-8 bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please Note</AlertTitle>
            <AlertDescription>
                For download links, you may be redirected to a page with timers or ads. This is part of the source website's system. Wait for the final download to appear. Watch links will open in a sandboxed player to block ads.
            </AlertDescription>
          </Alert>
        </div>
    </div>
  );
}

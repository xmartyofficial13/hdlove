import { getMovieDetails } from '@/lib/actions';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { DownloadButton } from '@/components/DownloadButton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const revalidate = 86400; // Revalidate once a day

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

export default async function MoviePage({ params }: MoviePageProps) {
  const path = params.slug.join('/');
  const details = await getMovieDetails(path);

  if (!details) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
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
        <div className="md:col-span-2">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white lg:text-5xl">
            {details.title}
          </h1>
          <p className="mt-6 font-body leading-7 text-muted-foreground">
            {details.description}
          </p>

          <div className="mt-8">
            <h2 className="font-headline text-2xl font-semibold text-white">
              Download Links
            </h2>
            {details.downloadLinks.length > 0 ? (
                <>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {details.downloadLinks.map((link) => (
                    <DownloadButton key={link.url} link={link} />
                    ))}
                </div>
                 <Alert variant="default" className="mt-6 bg-muted/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Please Note</AlertTitle>
                    <AlertDescription>
                        These links may lead to a page with timers or ads. This is part of the source website's system. Click the link and wait for the final download to appear.
                    </AlertDescription>
                </Alert>
                </>
            ) : (
                <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                    <p className="text-muted-foreground">No direct download links found.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

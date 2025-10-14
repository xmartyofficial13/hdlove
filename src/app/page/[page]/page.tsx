import { MovieCard } from '@/components/MovieCard';
import type { Movie } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour

async function getHomepageMoviesFromApi(page: number = 1): Promise<Movie[]> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    try {
        const res = await fetch(`${baseUrl}/api/scrape?page=${page}`, { 
            next: { revalidate: 3600 },
            headers: {
                'Accept': 'application/json',
            }
        });
        if (!res.ok) {
            console.error(`Failed to fetch movies from API for page ${page}`, res.status, res.statusText);
            const errorBody = await res.text();
            console.error("Error body:", errorBody);
            return [];
        }
        const data = await res.json();
        return data.movies;
    } catch(e) {
        console.error(`Error fetching from /api/scrape?page=${page}:`, e);
        return [];
    }
}

interface PageProps {
  params: {
    page?: string;
  };
}

export default async function Page({ params }: PageProps) {
  const page = params?.page ? parseInt(params.page, 10) : 1;

  if (isNaN(page) || page < 1) {
    notFound();
  }

  const movies = await getHomepageMoviesFromApi(page);

  const currentPage = page;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Page {currentPage}
      </h1>
      {movies && movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {movies.map((movie) => (
              <MovieCard key={movie.path} movie={movie} />
            ))}
          </div>
          <div className="mt-12 flex justify-center gap-4">
            {currentPage > 1 && (
              <Button asChild variant="outline">
                <Link href={prevPage === 1 ? '/' : `/page/${prevPage}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/page/${nextPage}`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
          <p className="text-center text-muted-foreground">Could not load movies for this page. The source site might be down or you've reached the end.</p>
        </div>
      )}
    </div>
  );
}

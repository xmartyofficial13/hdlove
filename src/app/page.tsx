import { MovieCard } from '@/components/MovieCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getHomepageMovies, getCategories } from '@/lib/actions';
import { cn } from '@/lib/utils';

export const revalidate = 3600; // Revalidate every hour

async function CategoryBrowser() {
  const categories = await getCategories();
  return (
    <div className="mb-12">
     
      <div className="flex p-0 justify-center flex-wrap gap-3">
          {categories.map((category) => (
              <Link href={category.path} key={category.path} passHref>
                  <Button
                      className={cn(
                          'h-auto p-0 text-white font-bold text-[12px] animate-bump transition-all duration-500',
                          'bg-gradient-to-r from-red-600 to-black',
                          'shadow-[0_6px_15px_-2px_rgba(255,0,0,0.5)]',
                          'hover:saturate-200 hover:-translate-y-1'
                      )}
                      >
                      <div className="px-4 py-2">{category.name}</div>
                  </Button>
              </Link>
          ))}
      </div>
    </div>
  )
}

export default async function Home() {
  const movies = await getHomepageMovies(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryBrowser />

      <h1 className="mb-8 font-headline text-xl font-bold tracking-tight text-foreground sm:text-4xl">
        Trending & Recent
      </h1>
      {movies && movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {movies.map((movie) => (
              <MovieCard key={movie.path} movie={movie} />
            ))}
          </div>
          <div className="mt-12 flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/page/2`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
          <p className="text-center text-muted-foreground">Could not load movies. The source site might be down or has changed its structure. <br/> Check the server logs for more details.</p>
        </div>
      )}
    </div>
  );
}

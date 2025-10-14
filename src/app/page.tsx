import { getHomepageMovies } from '@/lib/actions';
import { MovieCard } from '@/components/MovieCard';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const movies = await getHomepageMovies();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Trending & Recent
      </h1>
      {movies && movies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {movies.map((movie) => (
            <MovieCard key={movie.path} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
          <p className="text-muted-foreground">Could not load movies. The source site might be down or has changed its structure.</p>
        </div>
      )}
    </div>
  );
}

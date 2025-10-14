import { MovieCard } from '@/components/MovieCard';
import type { Movie } from '@/lib/types';

export const revalidate = 3600; // Revalidate every hour

async function getHomepageMoviesFromApi(): Promise<Movie[]> {
    // In a real environment, we would use an environment variable for the base URL.
    // Using a placeholder for local development that points to our own API route.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    try {
        const res = await fetch(`${baseUrl}/api/scrape`, { 
            next: { revalidate: 3600 },
            headers: {
                'Accept': 'application/json',
            }
        });
        if (!res.ok) {
            console.error("Failed to fetch movies from API", res.status, res.statusText);
            const errorBody = await res.text();
            console.error("Error body:", errorBody);
            return [];
        }
        const data = await res.json();
        return data.movies;
    } catch(e) {
        console.error("Error fetching from /api/scrape:", e);
        return [];
    }
}


export default async function Home() {
  const movies = await getHomepageMoviesFromApi();

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
          <p className="text-center text-muted-foreground">Could not load movies. The source site might be down or has changed its structure. <br/> Check the server logs for more details.</p>
        </div>
      )}
    </div>
  );
}

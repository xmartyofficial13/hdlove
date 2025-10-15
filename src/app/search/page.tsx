import { getSearchResults } from '@/lib/actions';
import { MovieCard } from '@/components/MovieCard';
import { Suspense } from 'react';

export const revalidate = 3600; // Revalidate every hour

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return <p className="text-muted-foreground">Please enter a search term to find movies and series.</p>;
  }

  const movies = await getSearchResults(query);

  if (movies.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
        <p className="text-center text-muted-foreground">No results found for "{query}".<br/>Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {movies.map((movie) => (
        <MovieCard key={movie.path} movie={movie} />
      ))}
    </div>
  );
}

function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-muted"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
            </div>
        ))}
        </div>
    );
}

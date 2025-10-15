import { getCategoryMovies } from '@/lib/actions';
import { MovieCard } from '@/components/MovieCard';
import { Suspense } from 'react';

export const revalidate = 3600; // Revalidate every hour

interface CategoryPageProps {
  params: {
    slug: string[];
  };
}

// Function to generate metadata
export async function generateMetadata({ params }: CategoryPageProps) {
  const path = params.slug.join('/');
  // Capitalize each part of the slug for the title
  const title = params.slug.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  return {
    title: `${title} - NetVlyx`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const path = params.slug.join('/');
  const title = params.slug.map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')).join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Category: {title}
      </h1>
      <Suspense fallback={<CategoryResultsSkeleton />}>
        <CategoryResults path={path} />
      </Suspense>
    </div>
  );
}

async function CategoryResults({ path }: { path: string }) {
  if (!path) {
    return <p className="text-muted-foreground">Category not found.</p>;
  }

  const movies = await getCategoryMovies(path);

  if (movies.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
        <p className="text-center text-muted-foreground">No content found for this category.</p>
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

function CategoryResultsSkeleton() {
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

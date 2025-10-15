import { getCategoryMovies } from '@/lib/actions';
import { MovieCard } from '@/components/MovieCard';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour

interface CategoryPageProps {
  params: {
    slug: string[];
  };
}

// Function to generate metadata
export async function generateMetadata({ params }: CategoryPageProps) {
  const slug = params.slug || [];
  const pageIndex = slug.indexOf('page');
  const categoryParts = pageIndex !== -1 ? slug.slice(0, pageIndex) : slug;
  const path = categoryParts.join('/');
  const page = pageIndex !== -1 && slug[pageIndex + 1] ? parseInt(slug[pageIndex + 1], 10) : 1;

  // Capitalize each part of the slug for the title
  const title = categoryParts.map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')).join(' ');
  
  if (!title) {
      return { title: 'Category Not Found' };
  }

  return {
    title: `${title}${page > 1 ? ` - Page ${page}` : ''} - NetVlyx`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.slug || [];

  const pageIndex = slug.indexOf('page');
  const categoryParts = pageIndex !== -1 ? slug.slice(0, pageIndex) : slug;
  const path = categoryParts.join('/');
  const page = pageIndex !== -1 && slug[pageIndex + 1] ? parseInt(slug[pageIndex + 1], 10) : 1;

  if (isNaN(page)) {
    notFound();
  }

  const title = categoryParts.map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')).join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-xl font-bold tracking-tight text-foreground sm:text-4xl">
        Category: {title} {page > 1 && ` - Page ${page}`}
      </h1>
      <Suspense fallback={<CategoryResultsSkeleton />}>
        <CategoryResults path={path} page={page} />
      </Suspense>
    </div>
  );
}

async function CategoryResults({ path, page }: { path: string, page: number }) {
  if (!path) {
    return <p className="text-muted-foreground">Category not found.</p>;
  }

  const movies = await getCategoryMovies(path, page);

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = movies.length > 0 ? page + 1 : null; // Assume there's a next page if current page has movies

  if (movies.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted">
        <p className="text-center text-muted-foreground">No content found for this category or you've reached the end.</p>
        {prevPage && (
             <Button asChild variant="outline">
                <Link href={`/category/${path}${prevPage > 1 ? `/page/${prevPage}` : ''}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Link>
            </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {movies.map((movie) => (
          <MovieCard key={movie.path} movie={movie} />
        ))}
      </div>
      <div className="mt-12 flex justify-center gap-4">
        {prevPage && (
             <Button asChild variant="outline">
                <Link href={`/category/${path}${prevPage > 1 ? `/page/${prevPage}` : ''}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Link>
            </Button>
        )}
         {nextPage && (
            <Button asChild variant="outline">
                <Link href={`/category/${path}/page/${nextPage}`}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        )}
      </div>
    </>
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
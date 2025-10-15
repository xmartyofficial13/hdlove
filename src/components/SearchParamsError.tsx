'use client';

import { useSearchParams } from 'next/navigation';

export function SearchParamsError() {
  // This component uses useSearchParams, so it must be a client component
  // and rendered within a <Suspense> boundary.
  const searchParams = useSearchParams();

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8 text-center">
      <h1 className="mb-4 font-headline text-4xl font-bold tracking-tight text-white">
        404 - Page Not Found
      </h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
    </div>
  );
}

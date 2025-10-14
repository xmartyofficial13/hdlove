'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function SearchParamsError() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // You can add any client-side logic here that uses the search parameters
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Page Not Found
      </h1>
      <p className="text-center text-muted-foreground">The page you are looking for does not exist.</p>
    </div>
  );
}

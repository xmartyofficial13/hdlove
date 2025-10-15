import { Suspense } from 'react';
import { SearchParamsError } from '@/components/SearchParamsError';

export default function NotFound() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <SearchParamsError />
    </Suspense>
  );
}

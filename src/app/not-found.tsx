import { Suspense } from 'react';
import { SearchParamsError } from '@/components/SearchParamsError';

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsError />
    </Suspense>
  );
}

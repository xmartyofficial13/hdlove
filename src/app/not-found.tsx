import { सस्पेंस } from 'react';
import { SearchParamsError } from '@/components/SearchParamsError';

export default function NotFound() {
  return (
    <सस्पेंस fallback={<div>Loading...</div>}>
      <SearchParamsError />
    </सस्पेंस>
  );
}

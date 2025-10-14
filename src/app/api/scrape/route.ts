import { NextResponse } from 'next/server';
import { getHomepageMovies } from '@/lib/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const pageNumber = page ? parseInt(page, 10) : 1;

  if (isNaN(pageNumber) || pageNumber < 1) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }

  const movies = await getHomepageMovies(pageNumber);
  
  if (!movies) {
    return NextResponse.json({ movies: [] }, { status: 500, statusText: "Failed to fetch movies from source" });
  }

  return NextResponse.json({ movies });
}

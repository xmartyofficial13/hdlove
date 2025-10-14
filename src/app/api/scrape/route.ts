import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { Movie } from '@/lib/types';
import { getHomepageMovies } from '@/lib/actions';

export async function GET() {
  const movies = await getHomepageMovies();
  
  if (!movies || movies.length === 0) {
    return NextResponse.json({ movies: [] }, { status: 500, statusText: "Failed to fetch movies from source" });
  }

  return NextResponse.json({ movies });
}

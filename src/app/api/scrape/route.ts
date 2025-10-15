import { NextResponse } from 'next/server';
import { getHomepageMovies } from '@/lib/actions';
import * as cheerio from 'cheerio';

async function fetchHtml(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
      });
      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const cleanUrl = searchParams.get('url');

  if (cleanUrl) {
    const html = await fetchHtml(cleanUrl);
    if (!html) {
      return NextResponse.json({ error: 'Failed to fetch source' }, { status: 500 });
    }
    const $ = cheerio.load(html);
    $('script').remove();
    // Add a base tag to resolve relative paths
    const origin = new URL(cleanUrl).origin;
    $('head').prepend(`<base href="${origin}">`);

    return new Response($.html(), {
        headers: { 'Content-Type': 'text/html' },
    });
  }
  
  if (page) {
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

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

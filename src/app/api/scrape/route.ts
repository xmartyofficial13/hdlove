import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { Movie } from '@/lib/types';

const BASE_URL = 'https://hdhub4u.cologne';

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

function parseMovies(html: string): Movie[] {
  const $ = cheerio.load(html);
  const movies: Movie[] = [];

  const seenPaths = new Set<string>();

  const processElement = (_: number, element: cheerio.Element) => {
    const a = $(element).find('a').first();
    let path = a.attr('href')?.replace(BASE_URL, '') || '';
    if (path.startsWith('https://')) {
        // If the path is an absolute URL to the same domain, make it relative
        try {
            const url = new URL(path);
            if (url.hostname === new URL(BASE_URL).hostname) {
                path = url.pathname;
            }
        } catch (e) {
            // ignore invalid urls
        }
    }

    const img = $(element).find('img');
    const title = img.attr('alt') || $(element).find('p').text().trim();
    const imageUrl = img.attr('src') || '';

    if (path && title && imageUrl && !seenPaths.has(path)) {
      movies.push({ title, imageUrl, path });
      seenPaths.add(path);
    }
  };

  // Try the user-provided selector first
  $('ul.recent-movies li.thumb').each(processElement);
  
  // Fallback to original implementation if new one yields no results
  if (movies.length === 0) {
    $('article.TPost.B').each((_, element) => {
        const a = $(element).find('div.Image a');
        const path = a.attr('href')?.replace(BASE__URL, '') || '';
        const title = $(element).find('h2.Title a').text().trim();
        const imageUrl = $(element).find('div.Image img').attr('src') || '';

        if (path && title && imageUrl && !seenPaths.has(path)) {
            movies.push({ title, imageUrl, path });
            seenPaths.add(path);
        }
    });
  }

  return movies;
}


export async function GET() {
  const html = await fetchHtml(BASE_URL);
  if (!html) {
    return NextResponse.json({ movies: [] }, { status: 500, statusText: "Failed to fetch source HTML" });
  }
  const movies = parseMovies(html);
  
  // The user's example had a category field, but it's not clear where to get it from on the homepage.
  // This will be scraped on the detail page instead.
  const moviesWithRequiredFields = movies.map(movie => ({
      ...movie,
      description: movie.title, 
      category: 'Unknown' 
  }));

  return NextResponse.json({ movies: moviesWithRequiredFields });
}

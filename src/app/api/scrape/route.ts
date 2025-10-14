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

  // The user provided this selector. The previous one was article.TPost.B
  $('ul.recent-movies li.thumb').each((_, element) => {
    const a = $(element).find('a').first();
    const path = a.attr('href')?.replace(BASE_URL, '') || '';
    const img = $(element).find('img');
    const title = img.attr('alt') || '';
    const imageUrl = img.attr('src') || '';

    if (path && title && imageUrl) {
      movies.push({ title, imageUrl, path });
    }
  });
  
  if (movies.length > 0) {
    return movies;
  }

  // Fallback to original implementation if new one fails
  $('article.TPost.B').each((_, element) => {
    const a = $(element).find('div.Image a');
    const path = a.attr('href')?.replace(BASE_URL, '') || '';
    const title = $(element).find('h2.Title a').text().trim();
    const imageUrl = $(element).find('div.Image img').attr('src') || '';

    if (path && title && imageUrl) {
      movies.push({ title, imageUrl, path });
    }
  });

  return movies;
}


export async function GET() {
  const html = await fetchHtml(BASE_URL);
  if (!html) {
    return NextResponse.json({ movies: [] }, { status: 500 });
  }
  const movies = parseMovies(html);
  
  // The user's example had a category field, but it's not clear where to get it from on the homepage.
  // I will add a default category for now.
  const moviesWithCategory = movies.map(movie => ({
      ...movie,
      description: movie.title, // description seems to be same as title in user's example
      category: 'Bollywood' 
  }));

  return NextResponse.json({ movies: moviesWithCategory });
}

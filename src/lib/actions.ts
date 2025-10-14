import * as cheerio from 'cheerio';
import type { Movie, MovieDetails, DownloadLink, Category } from './types';

const BASE_URL = 'https://hdhub4u.cologne';

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
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

export async function getHomepageMovies(): Promise<Movie[]> {
  const html = await fetchHtml(BASE_URL);
  if (!html) return [];
  return parseMovies(html);
}

export async function getSearchResults(query: string): Promise<Movie[]> {
  const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  if (!html) return [];
  return parseMovies(html);
}

export async function getCategoryMovies(path: string): Promise<Movie[]> {
    const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const html = await fetchHtml(url);
    if (!html) return [];
    return parseMovies(html);
}


export async function getMovieDetails(path: string): Promise<MovieDetails | null> {
  const url = `${BASE_URL}${path}`;
  const html = await fetchHtml(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const title = $('h1.Title').text().trim();
  const imageUrl = $('div.Image figure img').attr('src') || $('div.post-thumbnail figure img').attr('src') || '';
  const description = $('div.Description p').first().text().trim();

  const downloadLinks: DownloadLink[] = [];
  
  // This is a best-effort attempt to find download links.
  // The actual links are often obfuscated and may require more complex logic.
  $('div.ind-btn a').each((_, element) => {
    const url = $(element).attr('href');
    const quality = $(element).find('span.dli-text').text().trim() || $(element).text().trim();

    if (url && quality) {
        // A simple attempt to clean up the quality text
        const cleanedQuality = quality.replace(/Download Links? ?/i, '').trim();
        downloadLinks.push({ quality: cleanedQuality, url });
    }
  });

  if (downloadLinks.length === 0) {
    // Fallback for episode links
    $('.page-body h3, .entry-content h3').each((_, element) => {
        const h3 = $(element);
        const links = h3.find('a');
        let downloadUrl: string | undefined;
        let watchUrl: string | undefined;
        let episodeText: string = '';

        links.each((_, linkEl) => {
            const link = $(linkEl);
            const linkText = link.text().trim().toLowerCase();
            const href = link.attr('href');

            if (linkText.includes('watch')) {
                watchUrl = href;
            } else if (href) {
                downloadUrl = href;
                if (!episodeText || !episodeText.toLowerCase().includes('episode')) {
                  episodeText = link.text().trim();
                }
            }
        });
        
        if (!episodeText) {
          episodeText = h3.text().split('|')[0].trim();
        }

        if (downloadUrl) {
            downloadLinks.push({ quality: episodeText, url: downloadUrl });
        }
        if (watchUrl) {
            downloadLinks.push({ quality: `${episodeText} (Watch)`, url: watchUrl });
        }
    });
  }

  if (!title) return null;

  return {
    title,
    imageUrl,
    path,
    description,
    downloadLinks,
  };
}

export async function getCategories(): Promise<Category[]> {
    const html = await fetchHtml(BASE_URL);
    if (!html) return [];

    const $ = cheerio.load(html);
    const categories: Category[] = [];

    $('#menu-primary-menu > li').each((_, element) => {
        const a = $(element).children('a');
        const name = a.text().trim();
        const path = a.attr('href')?.replace(BASE_URL, '') || '';
        if(name && path && !['Home', 'More'].includes(name)) {
            categories.push({ name, path });
        }
    });

    return categories;
}

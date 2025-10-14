import * as cheerio from 'cheerio';
import type { Movie, MovieDetails, DownloadLink, Category, Episode } from './types';

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
  
  // Extracting from various parts of the page, with fallbacks.
  const description = $('.kno-rdesc').text().trim() || $('div.Description p').first().text().trim();

  // Extracting structured data
  const movieInfo: Partial<MovieDetails> = {};
  $('.NFQFxe.Hhmu2e .mod, .NFQFxe.CQKTwc.mod').find('div > div > div').each((i, el) => {
    const html = $(el).html();
    if (!html) return;
    
    if (html.includes('iMDB Rating:')) {
        movieInfo.rating = $(el).find('a').text().trim().split('/')[0];
    } else if (html.includes('Genre:')) {
        movieInfo.category = $(el).text().replace('Genre:', '').trim();
    } else if (html.includes('Language:')) {
        movieInfo.language = $(el).text().replace('Language:', '').trim();
    } else if (html.includes('Release Date:')) {
        movieInfo.releaseDate = $(el).text().replace('Release Date:', '').trim();
    }
  });


  const downloadLinks: DownloadLink[] = [];
  $('div.ind-btn a').each((_, element) => {
    const url = $(element).attr('href');
    const qualityText = $(element).find('span.dli-text').text().trim() || $(element).text().trim();
    
    if (url && qualityText) {
        const qualityMatch = qualityText.match(/(\d+p|Watch Online)/i);
        const quality = qualityMatch ? qualityMatch[0] : qualityText.replace(/Download Links? ?/i, '').trim();

        downloadLinks.push({ 
          quality: quality.trim(), 
          url,
          title: qualityText
        });
    }
  });

  const episodeList: Episode[] = [];
  $('.page-body h3, .entry-content h3').each((i, element) => {
    const h3 = $(element);
    const episodeLinks: DownloadLink[] = [];
    let episodeTitle: string = '';

    h3.find('a').each((_, linkEl) => {
      const link = $(linkEl);
      const href = link.attr('href');
      const linkText = link.text().trim();

      if (href) {
        episodeLinks.push({
          title: linkText,
          url: href,
          quality: linkText.toLowerCase().includes('watch') ? 'Watch Online' : 'Download',
        });
      }
    });

    if (episodeLinks.length > 0) {
      // Find the most appropriate title for the episode
      const episodeTextNode = h3.contents().filter((_, node) => node.type === 'text').text().trim();
      const episodeTextFromLink = h3.find('a').first().text().trim();
      episodeTitle = episodeTextNode.split('|')[0].trim() || episodeTextFromLink;
      
      // Clean up title
      episodeTitle = episodeTitle.replace(/:/g, '').trim();
      if (!episodeTitle.toLowerCase().includes('episode')) {
        episodeTitle = `Episode ${i + 1}`;
      }
      
      episodeList.push({
        number: i + 1,
        title: episodeTitle,
        downloadLinks: episodeLinks,
      });
    }
  });

  const trailer: MovieDetails['trailer'] = {
    url: $('iframe[src*="youtube.com/embed"]').attr('src') || '',
  };

  const screenshots: string[] = [];
  $('h2:contains("Screen-Shots")').next('h3').find('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
        screenshots.push(src);
    }
  });


  if (!title) return null;

  return {
    title,
    imageUrl,
    path,
    description: description || 'No description available.',
    downloadLinks: downloadLinks,
    episodeList: episodeList,
    trailer: trailer.url ? trailer : undefined,
    screenshots: screenshots,
    ...movieInfo,
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

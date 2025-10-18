
import * as cheerio from 'cheerio';
import type { Movie, MovieDetails, DownloadLink, Category, Episode } from './types';

let baseUrl: string | null = null;
const REDIRECT_URL = "https://hdhub4u.gd/?re=hdhub&t=1";

async function getBaseUrl(): Promise<string> {
    if (baseUrl) {
        return baseUrl;
    }

    try {
        const response = await fetch(REDIRECT_URL, { 
            method: 'HEAD', 
            redirect: 'follow',
            next: { revalidate: 3600 } // Re-check every hour
        });
        
        // The 'response.url' will be the final URL after all redirects
        const finalUrl = new URL(response.url);
        
        // We only want the protocol and hostname, e.g., "https://hdhub4u.pictures"
        const cleanBaseUrl = `${finalUrl.protocol}//${finalUrl.hostname}`;
        
        baseUrl = cleanBaseUrl;
        return baseUrl;
    } catch (error) {
        console.error("Failed to discover base URL, falling back to a default. Error:", error);
        // Fallback in case the redirector is down
        return "https://hdhub4u.pictures"; 
    }
}


async function fetchHtml(path: string) {
  const B_URL = await getBaseUrl();
  const url = path.startsWith('http') ? path : `${B_URL}${path}`;
  console.log(`Fetching URL: ${url}`); // Added for debugging
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Disable caching for fetches
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Referer': B_URL
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

async function parseMovies(html: string): Promise<Movie[]> {
  const $ = cheerio.load(html);
  const B_URL = await getBaseUrl();
  const movies: Movie[] = [];
  const seenPaths = new Set<string>();

  const processElement = (_: number, element: cheerio.Element) => {
    const a = $(element).find('a').first();
    let path = a.attr('href') || '';
     if (path.startsWith('http')) {
        try {
            const url = new URL(path);
            const baseHostname = new URL(B_URL).hostname;
            if (url.hostname.endsWith(baseHostname) || url.hostname.includes('hdhub4u')) {
                path = url.pathname;
            } else {
                return; // Skip external links
            }
        } catch (e) {
            return; // ignore invalid urls
        }
    }


    const img = $(element).find('img');
    const title = img.attr('alt') || $(element).find('p').text().trim() || $(element).find('h2.Title a').text().trim();
    const imageUrl = img.attr('src') || '';

    if (path && title && imageUrl && !seenPaths.has(path) && path !== '/') {
      movies.push({ title, imageUrl, path });
      seenPaths.add(path);
    }
  };

  // Homepage and Category pages use this layout
  $('ul.recent-movies li.thumb').each(processElement);
  
  // Some pages use this layout, so we try it if the first one fails
  if (movies.length === 0) {
    $('article.TPost.B').each(processElement);
  }
  
  // Fallback for search results
  if (movies.length === 0) {
    $('.result-item .details .title a').each((_, element) => {
        const a = $(element);
        let path = a.attr('href') || '';
         if (path.startsWith('http')) {
            try {
                const url = new URL(path);
                const baseHostname = new URL(B_URL).hostname;
                 if (url.hostname.endsWith(baseHostname) || url.hostname.includes('hdhub4u')) {
                    path = url.pathname;
                } else {
                    return;
                }
            } catch (e) {
                return;
            }
        }
        const title = a.text().trim();
        const imageUrl = $(element).closest('.result-item').find('img').attr('src') || '';

        if(path && title && imageUrl && !seenPaths.has(path) && path !== '/') {
            movies.push({ title, imageUrl, path });
            seenPaths.add(path);
        }
    })
  }

  return movies;
}

export async function getHomepageMovies(page: number = 1): Promise<Movie[]> {
  const path = page > 1 ? `/page/${page}` : '/';
  const html = await fetchHtml(path);
  if (!html) return [];
  const movies = await parseMovies(html);
  return movies.map(movie => ({
      ...movie,
      description: movie.title, 
      category: 'Unknown' 
  }));
}

export async function getSearchResults(query: string): Promise<Movie[]> {
  const path = `/?s=${encodeURIComponent(query)}`;
  const html = await fetchHtml(path);
  if (!html) return [];
  return parseMovies(html);
}

export async function getCategoryMovies(path: string, page: number = 1): Promise<Movie[]> {
    let cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }

    const pagePath = page > 1 ? `/page/${page}` : '';
    const fullPath = `/category/${cleanPath}${pagePath}/`;
    
    const html = await fetchHtml(fullPath);
    if (!html) return [];
    return parseMovies(html);
}


export async function getMovieDetails(path: string): Promise<MovieDetails | null> {
  const finalPath = path.startsWith('/') ? path : `/${path}`;
  const html = await fetchHtml(finalPath);
  if (!html) return null;

  const $ = cheerio.load(html);
  const B_URL = await getBaseUrl();
  
  // Exclude ad blocks and other irrelevant sections
  $('.code-block').remove();

  const title = $('h1.page-title .material-text').text().trim() || $('h1.Title').text().trim() || $('.kno-ecr-pt').first().text().trim();
  const imageUrl = $('div.Image figure img').attr('src') || $('div.post-thumbnail figure img').attr('src') || $('p > img.aligncenter').first().attr('src') || '';
  
  let description = "No description available.";
  
  const descriptionSelectors = [
      'div.kno-rdesc > div > span',
      'div.Description p',
      'h2:contains("Storyline:") + div',
      '.PZPZlf.hb8SAc .kno-rdesc',
      'div.page-body > p:first-of-type > span > em',
      'div.page-body > p:contains("DESCRIPTION:") + p',
      'div.kno-rdesc',
      'div.page-body > p:nth-of-type(1)',
  ];

  for (const selector of descriptionSelectors) {
      let foundDesc = $(selector).first().text().trim();
      if (foundDesc) {
          description = foundDesc;
          break;
      }
  }
  
  const movieInfo: Partial<MovieDetails> = {};
  
  $('.kp-hc .mod, .tec-info, .page-body > div, .page-body > p, .page-body span').each((_, el) => {
    const element = $(el);
    let text = element.clone().children().remove().end().text().trim();

    if (text.match(/iMDB Rating:\s*([0-9.]+)/)) {
        movieInfo.rating = text.match(/iMDB Rating:\s*([0-9.]+)/)?.[1];
    }
    if (text.match(/Genre:|Genres:/)) {
        movieInfo.category = element.find('a').map((_, a) => $(a).text().trim()).get().join(', ');
    }
     if (text.match(/Director:/)) {
        movieInfo.director = element.find('a').map((_, a) => $(a).text().trim()).get().join(', ') || text.replace(/Director:/, '').trim();
    }
     if (text.match(/Stars:|Creator:/)) {
        movieInfo.stars = element.find('a').map((_, a) => $(a).text().trim()).get().join(', ') || text.replace(/Stars:|Creator:/, '').trim();
    }
    if (text.match(/Language:/)) {
        movieInfo.language = text.replace('Language:', '').trim();
    }
    if (text.match(/Release Date:/)) {
        movieInfo.releaseDate = text.replace('Release Date:', '').trim();
    }
     if (text.match(/Quality:/)) {
        movieInfo.qualities = text.replace('Quality:', '').split('|').map(q => ({ name: q.trim(), size: 'N/A' }));
    }
  });

  const imdbUrl = $('a[href*="imdb.com/title/"]').attr('href');
  if (imdbUrl) {
    movieInfo.imdbUrl = imdbUrl;
    const imdbIdMatch = imdbUrl.match(/tt\d+/);
    if (imdbIdMatch) {
      movieInfo.imdbId = imdbIdMatch[0];
    }
  }

  $('.page-meta em.material-text').each((_, el) => {
    const text = $(el).text().trim();
    const prevIcon = $(el).prev().text().trim();
    if (prevIcon === '') { // calendar icon
        if (!movieInfo.releaseDate) movieInfo.releaseDate = text;
    }
  });
  
  if (!movieInfo.category) {
      const categories = $('.page-meta a[href*="/category/"], .page-meta a[href*="/genre/"]')
        .map((_, el) => $(el).text().trim())
        .get()
        .join(', ');
      if (categories) movieInfo.category = categories;
  }

  const allDownloadLinks: DownloadLink[] = [];
  const seenUrls = new Set<string>();

  const linkSelectors = [
    '.page-body p a', 
    '.entry-content em a',
    '.page-body h2 a', 
    '.page-body h3 a', 
    '.page-body h4 a',
    '.page-body h5 a',
    '.entry-content h2 a',
    '.entry-content h3 a',
    '.entry-content h4 a',
    '.entry-content h5 a',
  ];

  $(linkSelectors.join(', ')).each((_, element) => {
    const a = $(element);
    const url = a.attr('href');
    const text = a.text().trim();

    if (url && url.startsWith('http') && !url.includes(B_URL) && !seenUrls.has(url) && !url.includes('/how-to-download')) {
      if (text && text.length > 2 && text.toLowerCase() !== 'here' && text.toLowerCase() !== 'sample') {
         allDownloadLinks.push({ 
          quality: text, 
          url,
          title: text
        });
        seenUrls.add(url);
      }
    }
  });
  
  const episodeList: Episode[] = [];
  const episodeLinkUrls = new Set<string>();

  $('.entry-content h3, .page-body h3, .entry-content h2, .page-body h2').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('how to download')) return false;
      const nextElements = $(el).nextUntil('h3, h2');
      const hasLinks = $(el).find('a').length > 0 || nextElements.find('a').length > 0;
      return (text.includes('episode') || text.includes('season')) && hasLinks && !text.includes('download links');
  }).each((i, element) => {
    const header = $(element);
    const episodeLinks: DownloadLink[] = [];
    
    let episodeTitle = header.clone().children().remove().end().text().split(/\||:|\–/)[0].replace(/Download Links/i, '').trim();
    if (!episodeTitle) {
      episodeTitle = `Part ${i + 1}`;
    }

    let container: cheerio.Cheerio<cheerio.Element> = header;
    if (header.find('a').length === 0) {
      container = header.nextUntil('h3, h2, hr');
    }

    if(container.find('a').length === 0) {
      container = header.siblings();
    }


    container.find('a').each((_, linkEl) => {
      const link = $(linkEl);
      const href = link.attr('href');
      const text = link.text().trim();
      
      if (href && text && href.startsWith('http') && !episodeLinkUrls.has(href)) {
        episodeLinks.push({
          title: text,
          url: href,
          quality: text,
        });
        episodeLinkUrls.add(href);
      }
    });
    
    if (episodeLinks.length > 0) {
      episodeList.push({
          number: i + 1,
          title: episodeTitle,
          downloadLinks: episodeLinks,
      });
    }
  });

  const movieDownloadLinks = allDownloadLinks.filter(link => !episodeLinkUrls.has(link.url));

  const trailerUrl = $('iframe[src*="youtube.com/embed"]').attr('src');
  const trailer: MovieDetails['trailer'] = trailerUrl ? { url: trailerUrl } : undefined;

  const screenshots: string[] = [];
  const screenshotSelectors = [
      'img.alignnone', 
      'h2:contains("Screen-Shots") + h3 a img', 
      '.entry-content img.alignnone', 
      '.page-body img.alignnone',
      '.page-body p img',
      '.entry-content p img',
      '.page-body .aligncenter',
      '.entry-content .aligncenter',
  ];

  $(screenshotSelectors.join(', ')).each((_, el) => {
    const src = $(el).attr('src');
    if (src && !screenshots.includes(src) && src !== imageUrl) {
        screenshots.push(src);
    }
  });


  if (!title) return null;

  return {
    title,
    imageUrl,
    path,
    description: description,
    downloadLinks: movieDownloadLinks,
    episodeList: episodeList.length > 0 ? episodeList : undefined,
    trailer,
    screenshots,
    ...movieInfo,
  };
}

export async function getCategories(): Promise<Category[]> {
    const categories: Category[] = [
      { name: "300MB Movies", path: "/category/300mb-movies/" },
      { name: "Action", path: "/category/action-movies/" },
      { name: "Adventure", path: "/category/adventure/" },
      { name: "Animation", path: "/category/animated-movies/" },
      { name: "Bollywood", path: "/category/bollywood-movies/" },
      { name: "Comedy", path: "/category/comedy-movies/" },
      { name: "Crime", path: "/category/crime/" },
      { name: "Documentary", path: "/category/documentary/" },
      { name: "Drama", path: "/category/drama/" },
      { name: "Dual Audio", path: "/category/dual-audio/" },
      { name: "Family", path: "/category/family/" },
      { name: "Fantasy", path: "/category/fantasy/" },
      { name: "HD Movies", path: "/category/hd-movies/" },
      { name: "Hindi Dubbed", path: "/category/hindi-dubbed/" },
      { name: "Hollywood", path: "/category/hollywood-movies/" },
      { name: "Horror", path: "/category/horror-movies/" },
      { name: "Movie Series", path: "/category/movie-series-collection/" },
      { name: "Mystery", path: "/category/mystery/" },
      { name: "Romance", path: "/category/romantic-movies/" },
      { name: "Sci-Fi", path: "/category/sci-fi/" },
      { name: "Thriller", path: "/category/thriller/" },
      { name: "TV Shows", path: "/category/tv-shows/" },
    ];
    return categories;
}


import * as cheerio from 'cheerio';
import type { Movie, MovieDetails, DownloadLink, Category, Episode } from './types';

const BASE_URL = 'https://hdhub4u.cologne';

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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
     if (path.startsWith('http')) {
        try {
            const url = new URL(path);
            if (url.hostname === new URL(BASE_URL).hostname) {
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

  $('ul.recent-movies li.thumb').each(processElement);
  
  if (movies.length === 0) {
    $('article.TPost.B').each(processElement);
  }

  return movies;
}

export async function getHomepageMovies(): Promise<Movie[]> {
  const html = await fetchHtml(BASE_URL);
  if (!html) return [];
  const movies = parseMovies(html);
  return movies.map(movie => ({
      ...movie,
      description: movie.title, 
      category: 'Unknown' 
  }));
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
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const html = await fetchHtml(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  
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
        movieInfo.category = element.find('a').map((_, a) => $(a).text().trim()).get().join(' | ') || text.replace(/Genre:|Genres:/, '').trim();
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

  $('.page-meta em.material-text').each((_, el) => {
    const text = $(el).text().trim();
    const prevIcon = $(el).prev().text().trim();
    if (prevIcon === '') { // calendar icon
        if (!movieInfo.releaseDate) movieInfo.releaseDate = text;
    }
  });
  
  if (!movieInfo.category) {
      const categories = $('.page-meta a[href*="/category/"]')
        .map((_, el) => $(el).text().trim())
        .get()
        .join(' | ');
      if (categories) movieInfo.category = categories;
  }

  const allDownloadLinks: DownloadLink[] = [];
  const seenUrls = new Set<string>();

  // Get all external links from the page body, including h2, h3, h4, and h5
  const linkSelectors = [
    '.page-body a', 
    '.entry-content a',
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

    if (url && url.startsWith('http') && !url.includes(BASE_URL) && !seenUrls.has(url) && !url.includes('/how-to-download')) {
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
    // Look for links in the header itself, then siblings until the next header
    if (header.find('a').length === 0) {
      container = header.nextUntil('h3, h2, hr');
    }

    // If still no links, try a broader search in all siblings
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

  // Filter out episode links from allDownloadLinks
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
    // Ensure we don't add the main poster image to screenshots
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
    const html = await fetchHtml(BASE_URL);
    if (!html) return [];

    const $ = cheerio.load(html);
    const categories: Category[] = [];

    const seen = new Set();

    $('#menu-primary-menu > li.menu-item-has-children').each((_, element) => {
        const mainLink = $(element).children('a');
        const name = mainLink.text().trim();
        const path = mainLink.attr('href')?.replace(BASE_URL, '') || '';
        if(name && path && !['Home', 'More'].includes(name) && !seen.has(name) && path !== '/') {
            categories.push({ name, path });
            seen.add(name);
        }

        // Add sub-menu items
        $(element).find('ul.sub-menu > li').each((_, subElement) => {
             const subLink = $(subElement).children('a');
             const subName = subLink.text().trim();
             const subPath = subLink.attr('href')?.replace(BASE_URL, '') || '';
             if(subName && subPath && !seen.has(subName) && subPath !== '/') {
                categories.push({ name: subName, path: subPath });
                seen.add(subName);
             }
        });
    });
    
     // Fallback for categories if the main nav fails
    if(categories.length === 0) {
        $('.TPost h2.Title a').each((_, element) => {
            const title = $(element).text().trim();
            // Basic logic to extract a potential category
            if(title.includes(')')){
                const cat = title.substring(title.indexOf('(') + 1, title.indexOf(')'));
                if(cat.length < 20 && !seen.has(cat)){
                    categories.push({name: cat, path: `/search/?s=${encodeURIComponent(cat)}`});
                    seen.add(cat);
                }
            }
        });
    }

    return categories;
}

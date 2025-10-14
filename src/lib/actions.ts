import * as cheerio from 'cheerio';
import type { Movie, MovieDetails, DownloadLink, Category, Episode } from './types';

const BASE_URL = 'https://hdhub4u.cologne';

async function fetchHtml(url: string) {
  try {
    // Use a proxy to avoid CORS issues if running in certain environments.
    // For local dev, this isn't strictly necessary if fetching server-side.
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
     if (path.startsWith('https://')) {
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

    if (path && title && imageUrl && !seenPaths.has(path)) {
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
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const html = await fetchHtml(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const title = $('h1.Title').text().trim() || $('.kno-ecr-pt').text().trim();
  const imageUrl = $('div.Image figure img').attr('src') || $('div.post-thumbnail figure img').attr('src') || $('p > img.aligncenter').attr('src') || '';
  
  // Extracting description from various possible locations
  let description = "No description available.";
  if ($('.kno-rdesc > div > div > span').first().text().trim()) {
      description = $('.kno-rdesc > div > div > span').first().text().trim();
  } else if ($('div.Description p').first().text().trim()) {
      description = $('div.Description p').first().text().trim();
  } else if ($('div.kno-rdesc').text().trim()){
      description = $('div.kno-rdesc').text().trim().split(/\s{2,}/)[0] || "No description available.";
  } else if ($('p:contains("DESCRIPTION")').next('p').text().trim()) {
    description = $('p:contains("DESCRIPTION")').next('p').text().trim();
  }


  const synopsis = $('.kno-rdesc').text().trim();

  const movieInfo: Partial<MovieDetails> = {};
  
  $('.kp-hc .mod, .tec-info').each((_, el) => {
    const sectionHtml = $(el).html() || '';
    const sectionText = $(el).text();
    if (sectionHtml.includes('iMDB Rating:') || sectionText.includes('iMDB Rating:')) {
        movieInfo.rating = $(el).find('a').text().split('/')[0].trim() || sectionText.split('iMDB Rating:')[1].trim().split('/')[0];
    }
    if (sectionHtml.includes('Genre:') || sectionText.includes('Genre:')) {
        movieInfo.category = $(el).text().replace(/Genre:|Genres:/, '').trim();
    }
     if (sectionHtml.includes('Language:') || sectionText.includes('Language:')) {
        movieInfo.language = $(el).text().replace('Language:', '').trim();
    }
    if (sectionHtml.includes('Release Date:') || sectionText.includes('Release Date:')) {
        movieInfo.releaseDate = $(el).text().replace('Release Date:', '').trim();
    }
  });

  $('.page-meta em.material-text').each((_, el) => {
    const text = $(el).text().trim();
    const prevIcon = $(el).prev().text().trim();
    if (prevIcon === '') { // calendar icon
        if (!movieInfo.releaseDate) movieInfo.releaseDate = text;
    }
  });
  
  const categories = $('.page-meta a[data-wpel-link="internal"] .material-text')
    .map((_, el) => $(el).text().trim())
    .get()
    .join(' | ');

  if (!movieInfo.category && categories) {
    movieInfo.category = categories;
  }

  const downloadLinks: DownloadLink[] = [];
  $('div.ind-btn a, p > a[href*="viralkhabarbull.com"]').each((_, element) => {
    const url = $(element).attr('href');
    const qualityText = $(element).text().trim();
    
    if (url && qualityText && !qualityText.toLowerCase().includes('watch')) {
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
  // Updated selector to be more robust
  $('.entry-content h3, .page-body h3, .entry-content h2, .page-body h2').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      // Look for "episode" and at least one link
      return text.includes('episode') && ($(el).find('a').length > 0 || $(el).nextUntil('h3, h2').find('a').length > 0);
  }).each((i, element) => {
    const header = $(element);
    const episodeLinks: DownloadLink[] = [];
    const episodeTitle = header.text().split(/\||:/)[0].trim();

    // Check for links directly inside the header
    header.find('a').each((_, linkEl) => {
      const link = $(linkEl);
      const href = link.attr('href');
      const linkText = link.text().trim();
      if (href && linkText) {
        episodeLinks.push({
          title: linkText,
          url: href,
          quality: linkText.toLowerCase().includes('watch') ? 'Watch Online' : 'Download',
        });
      }
    });

    // If no links in header, check subsequent elements until next header
    if (episodeLinks.length === 0) {
        let current = header.next();
        while (current.length > 0 && !current.is('h3, h2')) {
            current.find('a').each((_, linkEl) => {
                 const link = $(linkEl);
                 const href = link.attr('href');
                 const linkText = link.text().trim();
                 if (href && linkText) {
                     episodeLinks.push({
                         title: linkText,
                         url: href,
                         quality: linkText.toLowerCase().includes('watch') ? 'Watch Online' : 'Download',
                     });
                 }
            });
            current = current.next();
        }
    }
    
    if (episodeLinks.length > 0) {
      episodeList.push({
        number: i + 1,
        title: episodeTitle,
        downloadLinks: episodeLinks,
      });
    }
  });


  const trailerUrl = $('iframe[src*="youtube.com/embed"]').attr('src');
  const trailer: MovieDetails['trailer'] = trailerUrl ? { url: trailerUrl } : undefined;

  const screenshots: string[] = [];
  $('h2:contains("Screen-Shots")').nextUntil('h2, h3').find('img, a > img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
        screenshots.push(src);
    }
  });
   if (screenshots.length === 0) {
      $('h3:contains("Screen-Shots")').find('img, a > img').each((_, el) => {
          const src = $(el).attr('src');
          if (src) {
              screenshots.push(src);
          }
      });
  }


  if (!title) return null;

  return {
    title,
    imageUrl,
    path,
    description: description,
    synopsis,
    downloadLinks: downloadLinks,
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
        if(name && path && !['Home', 'More'].includes(name) && !seen.has(name)) {
            categories.push({ name, path });
            seen.add(name);
        }

        // Add sub-menu items
        $(element).find('ul.sub-menu > li').each((_, subElement) => {
             const subLink = $(subElement).children('a');
             const subName = subLink.text().trim();
             const subPath = subLink.attr('href')?.replace(BASE_URL, '') || '';
             if(subName && subPath && !seen.has(subName)) {
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

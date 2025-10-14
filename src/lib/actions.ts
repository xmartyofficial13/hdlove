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
  const movies = parseMovies(html);
  // The user's example had a category field, but it's not clear where to get it from on the homepage.
  // This will be scraped on the detail page instead.
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

  const title = $('h1.page-title .material-text').text().trim() || $('h1.Title').text().trim() || $('.kno-ecr-pt').first().text().trim();
  const imageUrl = $('div.Image figure img').attr('src') || $('div.post-thumbnail figure img').attr('src') || $('p > img.aligncenter').first().attr('src') || '';
  
  let description = "No description available.";
  const descriptionSelectors = [
      'div.kno-rdesc > div > span',
      'div.Description p',
      'p:contains("DESCRIPTION") + p',
      '.PZPZlf.hb8SAc .kno-rdesc',
      'div.page-body > p:first-of-type > span > em',
  ];

  for (const selector of descriptionSelectors) {
      const foundDesc = $(selector).first().text().trim();
      if (foundDesc) {
          description = foundDesc;
          break;
      }
  }
  
  if(description === "No description available."){
      const storyLineHeader = $('h2:contains("Storyline:")');
      if(storyLineHeader.length > 0) {
        description = storyLineHeader.next('div').text().trim();
      }
  }


  const movieInfo: Partial<MovieDetails> = {};
  
  $('.kp-hc .mod, .tec-info, .page-body > div').each((_, el) => {
    const element = $(el);
    const text = element.text();
    
    if (text.includes('iMDB Rating:')) {
        movieInfo.rating = text.match(/iMDB Rating:\s*([0-9.]+)/)?.[1];
    }
    if (text.includes('Genre:')) {
        movieInfo.category = text.replace(/Genre:|Genres:/, '').trim();
    }
    if (text.includes('Language:')) {
        movieInfo.language = text.replace('Language:', '').trim();
    }
    if (text.includes('Release Date:')) {
        movieInfo.releaseDate = text.replace('Release Date:', '').trim();
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
      const categories = $('.page-meta a[data-wpel-link="internal"] .material-text')
        .map((_, el) => $(el).text().trim())
        .get()
        .join(' | ');
      if (categories) movieInfo.category = categories;
  }

  const downloadLinks: DownloadLink[] = [];
  $('div.ind-btn a, p > a[href*="viralkhabarbull.com"]').each((_, element) => {
    const url = $(element).attr('href');
    const qualityText = $(element).text().trim();
    
    if (url && qualityText && !qualityText.toLowerCase().includes('watch')) {
        downloadLinks.push({ 
          quality: qualityText, 
          url,
          title: qualityText
        });
    }
  });

  const episodeList: Episode[] = [];
  $('.entry-content h3, .page-body h3, .entry-content h2, .page-body h2').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      return (text.includes('episode') || text.includes('episodes')) && ($(el).find('a').length > 0 || $(el).nextUntil('h3, h2').find('a').length > 0);
  }).each((i, element) => {
    const header = $(element);
    const episodeLinks: DownloadLink[] = [];
    
    // Extract title but remove extra text like "DOWNLOAD LINKS"
    const episodeTitle = header.text().split(/\||:|\–/)[0].replace(/Download Links/i, '').trim();

    let current = header;
    let linkContainer = header.nextUntil('h3, h2, hr');

    // If the header itself has links, use them
    if (header.find('a').length > 0) {
        linkContainer = header;
    } else if (linkContainer.find('a').length === 0) {
        // If the immediate next elements don't have links, check after a horizontal rule
        linkContainer = header.nextAll('hr').first().nextUntil('h3, h2, hr');
    }

    linkContainer.find('a').each((_, linkEl) => {
      const link = $(linkEl);
      const href = link.attr('href');
      const linkText = link.parent().text().trim() || link.text().trim();
      const title = link.text().trim();
      
      if (href && title) {
        episodeLinks.push({
          title: title,
          url: href,
          quality: linkText.toLowerCase().includes('watch') ? 'Watch Online' : title,
        });
      }
    });
    
    // Special handling for the structure where links are inside sibling h3s
    if (episodeLinks.length === 0) {
        header.nextUntil('h3, h2, hr').filter('h3').each((_, linkEl) => {
            const link = $(linkEl).find('a').first();
            const href = link.attr('href');
            const title = $(linkEl).text().trim();
            if(href && title) {
                 episodeLinks.push({
                     title: title,
                     url: href,
                     quality: title,
                 });
            }
        });
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
  $('h2:contains("Screen-Shots"), h3:contains("Screen-Shots")').first().nextUntil('h2, h3, hr').find('img, a > img').each((_, el) => {
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
    description: description,
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

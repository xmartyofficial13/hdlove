
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'Referer': new URL(url).origin
        }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch the URL: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Set a base URL so relative paths for CSS/JS work correctly
    const origin = new URL(url).origin;
    if ($('base').length === 0) {
      $('head').prepend(`<base href="${origin}">`);
    }

    // Remove all script tags to prevent ads and malicious code, but be careful
    $('script').each((_, script) => {
        const scriptSrc = $(script).attr('src');
        // Keep essential player scripts if they can be identified, otherwise remove all.
        // For now, a safer approach is to remove all scripts that are not part of the core player library if known.
        // The provided HTML shows scripts from /assets/, which are likely essential.
        // The obfuscated scripts and trackers (google, yandex) should be removed.
        const scriptContent = $(script).html();
        if (
            (scriptSrc && !scriptSrc.startsWith('/assets')) || 
            (scriptContent && (scriptContent.includes('googletagmanager') || scriptContent.includes('yandex') || scriptContent.includes('girlieturtle')))
        ) {
            $(script).remove();
        }
    });
    
    // Also remove external iframes and known ad containers
    $('iframe').remove();
    $('.adsbygoogle').remove();
    $('[id*="ads"]').remove();
    $('[class*="ads"]').remove();
    $('div[style*="z-index: 2147483647"]').remove(); // Remove overlay divs


    // Return the cleaned HTML
    return new NextResponse($.html(), {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape the page', details: error.message }, { status: 500 });
  }
}

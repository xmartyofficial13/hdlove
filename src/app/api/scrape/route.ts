
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

    // Return the full HTML without removing scripts
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

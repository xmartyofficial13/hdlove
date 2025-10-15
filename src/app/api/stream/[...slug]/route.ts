import { NextResponse } from 'next/server';
import { getStreamDetails } from '@/lib/actions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const path = params.slug.join('/');
  
  if (!path) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const streamDetails = await getStreamDetails(path);

  if (!streamDetails) {
    return NextResponse.json({ error: 'Stream not found or failed to parse' }, { status: 404 });
  }

  return NextResponse.json(streamDetails);
}

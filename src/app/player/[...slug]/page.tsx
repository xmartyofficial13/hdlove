
import { notFound } from 'next/navigation';

export default function PlayerPage({ params }: { params: { slug: string[] } }) {
  if (!params.slug || params.slug.length === 0) {
    notFound();
  }

  let decodedUrl: string;
  try {
    decodedUrl = Buffer.from(params.slug[0], 'base64').toString('ascii');
    // Basic validation to ensure it's a URL
    new URL(decodedUrl);
  } catch (e) {
    console.error("Invalid player URL:", e);
    notFound();
  }
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
      <iframe
        src={decodedUrl}
        title="Movie Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="unsafe-url"
        style={{ width: '100%', height: '100%' }}
      ></iframe>
    </div>
  );
}

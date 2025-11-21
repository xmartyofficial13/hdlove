import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Vegamovies | Vegamovies Nl',
  description: 'Vegamovies | Download Bollywood And South Indian Hindi Dubbed Movies For Free , 9xmovies, Katmoviehd,Filmyzilla',
  keywords: 'Vegamovies, Bollywood movies, South Indian Hindi dubbed movies, Hollywood movies, 300MB movies, Filmyzilla, KatmovieHD, movie download, HD movies',
  authors: [{ name: 'HDlove4u Rider' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  openGraph: v{
    title: 'hdlove4u',
    description: 'Your ad-free streaming companion',
    type: 'website',
    locale: 'en_US',
    siteName: 'hdlove4u',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hdlove4u',
    description: 'Your ad-free streaming companion',
  },
  other: {
    'revisit-after': '7 days',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
         <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-W6PX9N715D"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-W6PX9N715D');
</script>

<script type='text/javascript' src='//jargonthugconfessed.com/4c/d7/45/4cd745d5e9135a001d9a3efbc79adffe.js'></script>
<meta name="6a97888e-site-verification" content="19a17ac293cb60d861e48f71ae2b483a">


<script>(function(s){s.dataset.zone='10016379',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>

<meta name="monetag" content="ad73e4587e3e8d1a045d2cf81136f863">
      </head>
      <body
        className={cn(
          'antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
        <script src='https://dktczn.github.io/Dk/cdn/autoupdate.js'/>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', event => event.preventDefault());
              document.onkeydown = function (e) {
                if (e.keyCode == 123) { // F12
                    return false;
                }
                if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { // Ctrl+Shift+I
                    return false;
                }
                if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { // Ctrl+Shift+J
                    return false;
                }
                if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { // Ctrl+U
                    return false;
                }
              };
            `,
          }}
        />
        
          
      </body>
    </html>
  );
}

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
  title: 'hdlove4u',
  description: 'Your ad-free streaming companion',
  keywords: 'movies, download, hd, free, streaming, watch online',
  authors: [{ name: 'Dhanjee Rider' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  openGraph: {
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
        <link rel="icon" href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9wpzNkmnm_1lqeVr6DPHEdcVZRyxzjiTlgIE4ke8c6XbbGLzZ6QVDMIzszZY9dQ4Wok8D3_d3mQu6lT8fkv34cSCST5fTEhmOqdNgykKPikENTr-lXm19fUkX_5aiYokCgEynfGAM__OBC3zzbenzHY85EKnHoTkYiLiQeOHGai3ipukVXf1t7mzVZOF1/s192/1000125078.jpg" type="image/jpeg" sizes="any" />
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
      </body>
    </html>
  );
}

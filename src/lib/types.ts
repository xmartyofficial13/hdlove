export interface Movie {
  title: string;
  imageUrl: string;
  path: string;
}

export interface DownloadLink {
  quality: string;
  url: string;
}

export interface MovieDetails extends Movie {
  description: string;
  downloadLinks: DownloadLink[];
}

export interface Category {
  name: string;
  path: string;
}

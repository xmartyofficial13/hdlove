import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { Movie } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Link href={movie.path} className={cn('group block', className)} prefetch={false}>
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={movie.imageUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          <div className="p-3">
            <h3 className="truncate font-body text-sm font-semibold text-foreground">
              {movie.title}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

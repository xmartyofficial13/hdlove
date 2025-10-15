import { Clapperboard } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2" prefetch={false}>
      <Clapperboard className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold font-headline text-foreground md:inline">
       Hdlove4u
      </span>
    </Link>
  );
}

import Link from 'next/link';
import { getCategories } from '@/lib/actions';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';


export async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
            <Logo />
        </div>
        
        <div className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
            <nav className="flex items-center gap-6 text-sm">
                {categories.slice(0, 5).map((category) => (
                    <Link
                        key={category.path}
                        href={`/category${category.path}`}
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        {category.name}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
             <SearchBar />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

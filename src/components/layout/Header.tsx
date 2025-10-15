import Link from 'next/link';
import { getCategories } from '@/lib/actions';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '../ui/button';
import { Menu, Clapperboard, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';


export async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
            <Logo />
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
             <Link href="/" className="flex items-center space-x-2 px-6">
                <Clapperboard className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">Hdhub4u</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] overflow-y-auto pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    href={`/category${category.path}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
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

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
             <SearchBar />
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

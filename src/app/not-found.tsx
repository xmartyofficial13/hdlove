import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
      <h2 className="mb-4 font-headline text-4xl font-bold text-white">404 - Not Found</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Button asChild>
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  )
}

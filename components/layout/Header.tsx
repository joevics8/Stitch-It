import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[hsl(var(--paper))]/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-semibold tracking-tight text-[hsl(var(--ink))]">
              Stitch-It
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/measure" className="hover:text-[hsl(var(--verified))] transition-colors">
              Get Measured
            </Link>
            <Link href="/about" className="hover:text-[hsl(var(--verified))] transition-colors">
              About
            </Link>
            <Link href="/faq" className="hover:text-[hsl(var(--verified))] transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

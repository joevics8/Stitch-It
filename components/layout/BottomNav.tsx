'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ruler, Store, User } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Explore', icon: Home, match: (p: string) => p === '/' },
  { href: '/measurements', label: 'My Measurements', icon: Ruler, match: (p: string) => p.startsWith('/measurements') || p.startsWith('/measure') },
  { href: '/shop', label: 'Shop', icon: Store, match: (p: string) => p.startsWith('/shop') },
  { href: '/profile', label: 'Profile', icon: User, match: (p: string) => p.startsWith('/profile') },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[hsl(var(--paper))]/95 backdrop-blur border-t border-border safe-area-pb"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px]"
            >
              <tab.icon
                className={`h-5 w-5 ${active ? 'text-[hsl(var(--verified))]' : 'text-muted-foreground'}`}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span
                className={`text-[9.5px] leading-[1.1] text-center px-0.5 font-medium ${
                  active ? 'text-[hsl(var(--verified))]' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ruler, Store, User, Scissors } from 'lucide-react';

const SIDE_TABS = [
  { href: '/', label: 'Explore', icon: Home, match: (p: string) => p === '/' },
  { href: '/measurements', label: 'My Measurements', icon: Ruler, match: (p: string) => p.startsWith('/measurements') || p.startsWith('/measure') },
];

const SIDE_TABS_RIGHT = [
  { href: '/shop', label: 'Shop', icon: Store, match: (p: string) => p.startsWith('/shop') },
  { href: '/profile', label: 'Profile', icon: User, match: (p: string) => p.startsWith('/profile') },
];

const STYLES_TAB = {
  href: '/styles',
  label: 'Styles',
  match: (p: string) => p.startsWith('/styles') || p.startsWith('/customize'),
};

export function BottomNav() {
  const pathname = usePathname();
  const stylesActive = STYLES_TAB.match(pathname);

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[hsl(var(--paper))]/95 backdrop-blur border-t border-border safe-area-pb"
    >
      <div className="relative grid grid-cols-5">
        {SIDE_TABS.map((tab) => {
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

        {/* Large, raised Styles button in the middle */}
        <div className="flex items-start justify-center">
          <Link
            href={STYLES_TAB.href}
            aria-current={stylesActive ? 'page' : undefined}
            aria-label={STYLES_TAB.label}
            className="flex flex-col items-center gap-1 -mt-6"
          >
            <span
              className={`flex items-center justify-center h-16 w-16 rounded-full shadow-lg border-4 border-[hsl(var(--paper))] transition-colors ${
                stylesActive ? 'bg-[hsl(var(--verified))]' : 'bg-[hsl(var(--ink))]'
              }`}
            >
              <Scissors className="h-7 w-7 text-white" strokeWidth={2} />
            </span>
            <span
              className={`text-[9.5px] leading-[1.1] font-semibold ${
                stylesActive ? 'text-[hsl(var(--verified))]' : 'text-foreground'
              }`}
            >
              {STYLES_TAB.label}
            </span>
          </Link>
        </div>

        {SIDE_TABS_RIGHT.map((tab) => {
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

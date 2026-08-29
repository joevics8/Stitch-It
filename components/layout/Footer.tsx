import Link from 'next/link';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Get measured', href: '/measure' },
      { label: 'How it works', href: '/#how-it-works' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(var(--ink))] text-[hsl(var(--paper))]/90 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <p className="font-serif text-xl font-semibold text-[hsl(var(--paper))]">Stitch-It</p>
          <p className="mt-3 text-sm text-[hsl(var(--paper))]/60 max-w-xs">
            Get your body measurements from two photos — no tape measure, no tailor visit needed.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs uppercase tracking-[0.14em] text-[hsl(var(--seal))] font-mono mb-3">
              {col.heading}
            </p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[hsl(var(--paper))]/70 hover:text-[hsl(var(--paper))] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 py-5 text-xs text-[hsl(var(--paper))]/50">
          © {new Date().getFullYear()} Stitch-It. Measurements are AI-estimated and may vary from
          a professional tailor's tape measurement.
        </p>
      </div>
    </footer>
  );
}

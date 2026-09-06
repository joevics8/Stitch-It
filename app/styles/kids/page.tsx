import type { Metadata } from 'next';
import { Shirt } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Styles for Kids',
  description: 'Kids styles catalog — coming soon on Stitch-It.',
};

export default function KidsStylesPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[hsl(var(--verified))]/10 flex items-center justify-center">
        <Shirt className="h-6 w-6 text-[hsl(var(--verified))]" />
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-2">Kids styles coming soon</h1>
      <p className="text-sm text-muted-foreground">
        We&rsquo;re building out the catalog. Have something specific in mind in the meantime?
      </p>
      <a href="/request-style" className="inline-block mt-5 text-sm font-semibold text-[hsl(var(--verified))]">
        Request a Style &rarr;
      </a>
    </div>
  );
}

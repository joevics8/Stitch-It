import type { Metadata } from 'next';
import { Store } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Accessories, fabrics, and more — coming soon on Stitch-It.',
};

export default function ShopPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[hsl(var(--verified))]/10 flex items-center justify-center">
        <Store className="h-6 w-6 text-[hsl(var(--verified))]" />
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-2">Shop coming soon</h1>
      <p className="text-sm text-muted-foreground">
        Bags, shoes, jewelry, and fabrics to complete your look — on the way.
      </p>
    </div>
  );
}

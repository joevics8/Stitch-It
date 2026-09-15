import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { formatNaira, type CartItem } from '@/lib/styles';
import { lineItemInfo } from '@/lib/cart';

export const metadata: Metadata = { title: 'Your Bag' };
export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/cart');

  const { data } = await supabase
    .from('cart_items')
    .select('*, styles(*), products(*)')
    .order('created_at', { ascending: false });

  const items = (data ?? []) as unknown as CartItem[];
  const subtotal = items.reduce((sum, item) => sum + (lineItemInfo(item)?.price ?? 0) * item.quantity, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-32">
      <h1 className="font-serif text-2xl font-semibold mb-6">Your Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Your bag is empty.</p>
          <Link href="/" className="text-sm font-semibold text-[hsl(var(--verified))]">
            Browse styles &rarr;
          </Link>
        </div>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-between py-4 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatNaira(subtotal)}</span>
          </div>

          <div className="rounded-sm border border-dashed border-border p-4 text-xs text-muted-foreground mb-4">
            Delivery address and payment are collected on the next step.
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center rounded-sm bg-[hsl(var(--verified))] text-white font-semibold py-3.5 hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StarRating } from './StarRating';
import { formatNaira } from '@/lib/styles';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/products';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const image = product.images[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login?redirect=/shop');
      return;
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('color', 'Default')
      .maybeSingle();

    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        color: 'Default',
        quantity: 1,
      });
    }
    setBusy(false);
    router.refresh();
  };

  return (
    <Link
      href={`/shop/${product.id}`}
      className="block group rounded-sm border border-border overflow-hidden hover:border-[hsl(var(--verified))]/40 transition-colors"
    >
      <div className="relative aspect-square bg-muted">
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-[hsl(var(--rust))] text-white text-[10px] font-bold px-2 py-1 rounded-sm">
            -{discountPct}%
          </span>
        )}
        {product.is_new && !hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-[hsl(var(--verified))] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm">
            New
          </span>
        )}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No image yet
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium leading-snug line-clamp-2 mb-1">{product.name}</p>
        <StarRating rating={product.rating} count={product.rating_count} />
        <div className="flex items-baseline gap-2 mt-1.5 mb-2">
          <span className="font-semibold text-[hsl(var(--verified))]">{formatNaira(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNaira(product.compare_at_price!)}
            </span>
          )}
        </div>
        <button
          onClick={quickAdd}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 rounded-sm bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))] text-xs font-semibold py-2 hover:bg-[hsl(var(--verified))]/15 transition-colors disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />}
          Add to Bag
        </button>
      </div>
    </Link>
  );
}

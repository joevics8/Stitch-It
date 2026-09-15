'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Minus, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatNaira, type CartItem } from '@/lib/styles';
import { lineItemInfo } from '@/lib/cart';

export function CartItemRow({ item }: { item: CartItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const info = lineItemInfo(item);
  if (!info) return null;

  const handleRemove = async () => {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('cart_items').delete().eq('id', item.id);
    router.refresh();
  };

  const handleQuantity = async (delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) {
      handleRemove();
      return;
    }
    setBusy(true);
    const supabase = createClient();
    await supabase.from('cart_items').update({ quantity: next }).eq('id', item.id);
    router.refresh();
  };

  return (
    <div className="flex gap-3 py-4 border-b border-border">
      <div className="h-20 w-16 rounded-sm bg-muted shrink-0 overflow-hidden">
        {info.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.image} alt={info.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2">{info.name}</p>
        {item.color && <p className="text-xs text-muted-foreground mt-1">Color: {item.color}</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 rounded-sm border border-border">
            <button
              onClick={() => handleQuantity(-1)}
              disabled={busy}
              aria-label="Decrease quantity"
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => handleQuantity(1)}
              disabled={busy}
              aria-label="Increase quantity"
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <p className="text-sm font-semibold text-[hsl(var(--verified))]">
            {formatNaira(info.price * item.quantity)}
          </p>
        </div>
      </div>
      <button
        onClick={handleRemove}
        disabled={busy}
        aria-label={`Remove ${info.name}`}
        className="self-start text-muted-foreground hover:text-[hsl(var(--rust))] transition-colors"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

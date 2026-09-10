'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatNaira, type CartItem } from '@/lib/styles';

export function CartItemRow({ item }: { item: CartItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleRemove = async () => {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('cart_items').delete().eq('id', item.id);
    router.refresh();
  };

  const style = item.styles;
  if (!style) return null;

  return (
    <div className="flex gap-3 py-4 border-b border-border">
      <div className="h-20 w-16 rounded-sm bg-muted shrink-0 overflow-hidden">
        {style.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={style.images[0]} alt={style.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2">{style.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {item.color && `Color: ${item.color}`}
          {item.color && item.quantity > 1 && ' · '}
          {item.quantity > 1 && `Qty: ${item.quantity}`}
        </p>
        <p className="text-sm font-semibold text-[hsl(var(--verified))] mt-1">
          {formatNaira(style.price * item.quantity)}
        </p>
      </div>
      <button
        onClick={handleRemove}
        disabled={busy}
        aria-label={`Remove ${style.name}`}
        className="self-start text-muted-foreground hover:text-[hsl(var(--rust))] transition-colors"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

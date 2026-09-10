'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/orders';

const STATUSES: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: Order['status'] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState(status);

  const handleChange = async (next: Order['status']) => {
    setValue(next);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('orders').update({ status: next }).eq('id', orderId);
    setBusy(false);
    if (error) {
      alert('Could not update order status.');
      setValue(status);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={busy}
        onChange={(e) => handleChange(e.target.value as Order['status'])}
        className="rounded-sm border border-border bg-background px-2 py-1.5 text-xs capitalize disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
    </div>
  );
}

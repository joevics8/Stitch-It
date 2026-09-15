'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${productName}"? This can't be undone.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);
    setBusy(false);
    if (error) {
      alert('Could not delete this product.');
      return;
    }
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-[hsl(var(--rust))] font-medium disabled:opacity-50"
    >
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}

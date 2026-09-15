'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CouponRowActions({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('coupons').update({ is_active: !isActive }).eq('id', couponId);
    setBusy(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this coupon?')) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from('coupons').delete().eq('id', couponId);
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4 justify-end">
      <button onClick={toggleActive} disabled={busy} className="text-[hsl(var(--verified))] font-medium disabled:opacity-50">
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={handleDelete} disabled={busy} className="text-[hsl(var(--rust))] font-medium disabled:opacity-50">
        Delete
      </button>
    </div>
  );
}

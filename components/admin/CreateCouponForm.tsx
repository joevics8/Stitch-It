'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export function CreateCouponForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      setError('Code and discount value are required.');
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('coupons').insert({
      code: code.trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    setBusy(false);
    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'That code already exists.' : 'Could not create coupon.');
      return;
    }
    setCode('');
    setDiscountValue('');
    setExpiresAt('');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mb-8 p-4 rounded-sm border border-border">
      {error && (
        <div className="w-full flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <Label className="text-xs">Code</Label>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WELCOME10" className="mt-1 w-40" />
      </div>
      <div>
        <Label className="text-xs">Type</Label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
          className="mt-1 rounded-sm border border-border bg-background px-3 py-2 text-sm h-10"
        >
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount off (₦)</option>
        </select>
      </div>
      <div>
        <Label className="text-xs">Value</Label>
        <Input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === 'percent' ? '10' : '2000'}
          className="mt-1 w-28"
        />
      </div>
      <div>
        <Label className="text-xs">Expires (optional)</Label>
        <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Add Coupon
      </Button>
    </form>
  );
}

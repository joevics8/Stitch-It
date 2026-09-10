'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { formatNaira, type CartItem } from '@/lib/styles';
import { NIGERIA_STATES, EXPRESS_DELIVERY_FEE } from '@/lib/orders';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [town, setTown] = useState('');
  const [address, setAddress] = useState('');
  const [express, setExpress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('cart_items').select('*, styles(*)').order('created_at', { ascending: false }),
      supabase.auth.getUser(),
    ]).then(([cartRes, userRes]) => {
      setItems((cartRes.data as unknown as CartItem[]) ?? []);
      setEmail(userRes.data.user?.email ?? '');
      setLoading(false);
    });
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.styles?.price ?? 0) * item.quantity, 0);
  const deliveryFee = Math.max(...items.map((i) => i.styles?.delivery_cost ?? 0), 0);
  const expressFee = express ? EXPRESS_DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee + expressFee;

  const handlePlaceOrder = async () => {
    if (!state || !address.trim()) {
      setError('Please fill in your delivery state and address.');
      return;
    }
    if (!email) {
      setError('Your account has no email on file — please contact support.');
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || !scriptReady || !window.PaystackPop) {
      setError('Payment isn\u2019t ready yet. Please wait a moment and try again.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryState: state,
          deliveryLga: lga,
          deliveryTown: town,
          deliveryAddress: address,
          expressDelivery: express,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create your order.');

      const order = data.order;

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(order.total * 100),
        ref: order.payment_reference,
        currency: 'NGN',
        onClose: () => setBusy(false),
        callback: async (response: { reference: string }) => {
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: response.reference }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }
            router.push(`/orders/${verifyData.orderId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed.');
            setBusy(false);
          }
        },
      });
      handler.openIframe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading&hellip;
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">Your bag is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-32">
      <Script
        src="https://js.paystack.co/v1/inline.js"
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />

      <h1 className="font-serif text-2xl font-semibold mb-6">Order Confirmation</h1>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-sm border border-border p-4 mb-6">
        <p className="text-sm font-semibold mb-3">
          {items.length} item{items.length > 1 ? 's' : ''}
        </p>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2">
                {item.styles?.name} {item.color && `(${item.color})`}
                {item.quantity > 1 && ` ×${item.quantity}`}
              </span>
              <span className="font-medium shrink-0">
                {formatNaira((item.styles?.price ?? 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-sm font-semibold">Delivery Address</p>
        <div>
          <Label className="text-xs">State</Label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">Select State</option>
            {NIGERIA_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">LGA</Label>
            <Input value={lga} onChange={(e) => setLga(e.target.value)} placeholder="Type in LGA" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Town</Label>
            <Input value={town} onChange={(e) => setTown(e.target.value)} placeholder="Type in town" className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Address</Label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={express} onChange={(e) => setExpress(e.target.checked)} />
          Express Delivery (1 week) — +{formatNaira(EXPRESS_DELIVERY_FEE)}
        </label>
      </div>

      <div className="rounded-sm border border-border p-4 mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Item price</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery fee</span>
          <span>{formatNaira(deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Express delivery</span>
          <span>{formatNaira(expressFee)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-border">
          <span>Grand Total</span>
          <span className="text-[hsl(var(--verified))]">{formatNaira(total)}</span>
        </div>
      </div>

      <Button className="w-full" disabled={busy} onClick={handlePlaceOrder}>
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {busy ? 'Processing…' : 'Place Order'}
      </Button>
    </div>
  );
}

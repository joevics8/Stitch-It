'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const COLORS = ['Default', 'Black', 'Blue', 'Red', 'Green', 'Purple', 'Yellow', 'Grey'];

interface MeasurementOption {
  id: string;
  name: string;
}

export function AddToCart({ styleId }: { styleId: string }) {
  const router = useRouter();
  const [color, setColor] = useState('Default');
  const [measurementProfiles, setMeasurementProfiles] = useState<MeasurementOption[]>([]);
  const [measurementProfileId, setMeasurementProfileId] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('measurement_profiles')
      .select('id, name')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMeasurementProfiles((data as MeasurementOption[]) ?? []);
        setLoadingProfiles(false);
      });
  }, []);

  const addToBag = async (redirectToCheckout: boolean) => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/styles/${styleId}`);
      return;
    }

    const { error: upsertError } = await supabase.from('cart_items').upsert(
      {
        user_id: user.id,
        style_id: styleId,
        measurement_profile_id: measurementProfileId || null,
        color,
        quantity: 1,
      },
      { onConflict: 'user_id,style_id,color' }
    );

    setBusy(false);
    if (upsertError) {
      setError('Could not add this to your bag. Please try again.');
      return;
    }

    if (redirectToCheckout) {
      router.push('/cart');
    } else {
      setAdded(true);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Choose color
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-sm border transition-colors ${
              color === c
                ? 'border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))]'
                : 'border-border'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!loadingProfiles && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Measurements to use
          </p>
          <select
            value={measurementProfileId}
            onChange={(e) => setMeasurementProfileId(e.target.value)}
            className="w-full mb-4 rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">
              {measurementProfiles.length === 0 ? 'No saved measurements yet' : 'Select measurements'}
            </option>
            {measurementProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {measurementProfiles.length === 0 && (
            <p className="text-xs text-muted-foreground -mt-2 mb-4">
              You can add this to your bag now and attach measurements at checkout.
            </p>
          )}
        </>
      )}

      {added ? (
        <div className="flex items-center gap-2 rounded-sm border border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/5 p-3 text-sm text-[hsl(var(--verified))]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Added to your bag
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => addToBag(false)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingBag className="h-4 w-4 mr-2" />}
            Add to Bag
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => addToBag(true)}>
            Pay Now
          </Button>
        </div>
      )}
    </div>
  );
}

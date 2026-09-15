'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { formatNaira, type Style } from '@/lib/styles';
import { EXPRESS_DELIVERY_FEE } from '@/lib/orders';

const COLORS = ['Default', 'Black', 'Blue', 'Red', 'Green', 'Purple', 'Yellow', 'Grey'];

interface MeasurementOption {
  id: string;
  name: string;
}

interface Props {
  style: Style;
  initialMeasurementProfile: MeasurementOption | null;
  allMeasurementProfiles: MeasurementOption[];
}

export function CustomizeForm({ style, initialMeasurementProfile, allMeasurementProfiles }: Props) {
  const router = useRouter();
  const [material, setMaterial] = useState(style.materials[0] ?? '');
  const [color, setColor] = useState('Default');
  const [measurementProfileId, setMeasurementProfileId] = useState(initialMeasurementProfile?.id ?? '');
  const [express, setExpress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const image = style.images[0];

  const handleContinue = async () => {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/customize/${style.id}`);
        return;
      }

      const notes = material ? `Material: ${material}` : null;

      const { data: existing } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('style_id', style.id)
        .eq('color', color)
        .maybeSingle();

      const result = existing
        ? await supabase
            .from('cart_items')
            .update({
              measurement_profile_id: measurementProfileId || null,
              customization_notes: notes,
            })
            .eq('id', existing.id)
        : await supabase.from('cart_items').insert({
            user_id: user.id,
            style_id: style.id,
            measurement_profile_id: measurementProfileId || null,
            color,
            customization_notes: notes,
            quantity: 1,
          });

      if (result.error) throw result.error;

      router.push(`/checkout${express ? '?express=1' : ''}`);
    } catch {
      setError('Could not continue to checkout. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-32">
      <Link href={`/styles/${style.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to style
      </Link>

      <div className="flex gap-3 mb-6">
        <div className="h-24 w-20 rounded-sm bg-muted shrink-0 overflow-hidden">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={style.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-serif text-lg font-semibold leading-snug">{style.name}</h1>
          <p className="text-sm font-semibold text-[hsl(var(--verified))] mt-1">{formatNaira(style.price)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {style.materials.length > 0 && (
        <div className="mb-6">
          <Label className="text-sm font-semibold">Choose material</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {style.materials.map((m) => (
              <button
                key={m}
                onClick={() => setMaterial(m)}
                className={`text-sm font-medium px-3.5 py-2 rounded-sm border transition-colors ${
                  material === m
                    ? 'border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))]'
                    : 'border-border'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <Label className="text-sm font-semibold">Choose color</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`text-sm font-medium px-3.5 py-2 rounded-sm border transition-colors ${
                color === c
                  ? 'border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))]'
                  : 'border-border'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-sm font-semibold">Measurements to use</Label>
        {allMeasurementProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">
            No saved measurements yet.{' '}
            <Link href="/measure" className="text-[hsl(var(--verified))] font-medium">
              Get measured first &rarr;
            </Link>
          </p>
        ) : (
          <select
            value={measurementProfileId}
            onChange={(e) => setMeasurementProfileId(e.target.value)}
            className="w-full mt-2 rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">Select measurements</option>
            {allMeasurementProfiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-8">
        <Label className="text-sm font-semibold">Choose delivery period</Label>
        <div className="space-y-2 mt-2">
          <label className="flex items-center justify-between rounded-sm border border-border px-3.5 py-3 text-sm cursor-pointer has-[:checked]:border-[hsl(var(--verified))]">
            <span className="flex items-center gap-2">
              <input type="radio" name="delivery" checked={!express} onChange={() => setExpress(false)} />
              Standard ({style.delivery_timeline ?? '7-10 working days'})
            </span>
            <span className="text-muted-foreground">Included</span>
          </label>
          <label className="flex items-center justify-between rounded-sm border border-border px-3.5 py-3 text-sm cursor-pointer has-[:checked]:border-[hsl(var(--verified))]">
            <span className="flex items-center gap-2">
              <input type="radio" name="delivery" checked={express} onChange={() => setExpress(true)} />
              Express (1 week)
            </span>
            <span className="font-medium">+{formatNaira(EXPRESS_DELIVERY_FEE)}</span>
          </label>
        </div>
      </div>

      <Button className="w-full" disabled={busy} onClick={handleContinue}>
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Continue to Payment
      </Button>
    </div>
  );
}

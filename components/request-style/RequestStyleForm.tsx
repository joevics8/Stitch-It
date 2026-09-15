'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { compressImageFile } from '@/lib/image-compression';

export function RequestStyleForm() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLink, setImageLink] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'kid' | ''>('');
  const [forSelf, setForSelf] = useState<'yes' | 'no' | ''>('');
  const [description, setDescription] = useState('');
  const [customization, setCustomization] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [phone, setPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !phone.trim()) {
      setError('Please describe the style and provide a phone/WhatsApp number.');
      return;
    }
    setBusy(true);
    setError(null);

    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/request-style');
        return;
      }

      let image_url: string | null = null;
      if (imageFile) {
        const compressed = await compressImageFile(imageFile);
        const path = `${user.id}/${Date.now()}-${compressed.name}`;
        const { error: uploadError } = await supabase.storage
          .from('style-requests')
          .upload(path, compressed);
        if (uploadError) throw uploadError;
        const { data: signed } = await supabase.storage
          .from('style-requests')
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        image_url = signed?.signedUrl ?? path;
      }

      const { error: insertError } = await supabase.from('style_requests').insert({
        user_id: user.id,
        image_url,
        image_link: imageLink.trim() || null,
        gender: gender || null,
        for_self: forSelf === 'yes' ? true : forSelf === 'no' ? false : null,
        description: description.trim(),
        customization: customization.trim() || null,
        quantity: Number(quantity) || 1,
        phone: phone.trim(),
        delivery_location: deliveryLocation.trim() || null,
      });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="h-10 w-10 text-[hsl(var(--verified))] mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-semibold mb-2">Request submitted</h1>
        <p className="text-sm text-muted-foreground">
          We&rsquo;ll review your style and reach out on WhatsApp with a quote.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-32">
      <p className="text-xs uppercase tracking-[0.14em] font-mono text-[hsl(var(--verified))] mb-2">
        Stitch-It
      </p>
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-1">Request a Style</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Have a specific style you want to sew? Upload a picture below and fill out the form —
        we&rsquo;ll reach out with a quote.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card className="p-4">
          <Label className="text-sm font-semibold text-[hsl(var(--verified))]">Reference image</Label>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-sm border border-border px-3 py-2.5 text-sm font-medium cursor-pointer hover:border-[hsl(var(--verified))] transition-colors">
              <Paperclip className="h-4 w-4" />
              {imageFile ? imageFile.name : 'Attach image file'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2 mb-3">— or —</p>
          <Input
            type="url"
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
            placeholder="Paste a Pinterest, Instagram, etc. link"
          />
        </Card>

        <div>
          <Label className="text-sm font-semibold">Is this for a Male, Female, or Kid?</Label>
          <div className="flex gap-2 mt-1.5">
            {(['female', 'male', 'kid'] as const).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 rounded-sm border py-2.5 text-sm font-medium capitalize transition-colors ${
                  gender === g
                    ? 'border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))]'
                    : 'border-border'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Is this outfit for you?</Label>
          <div className="flex gap-2 mt-1.5">
            {(['yes', 'no'] as const).map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setForSelf(v)}
                className={`flex-1 rounded-sm border py-2.5 text-sm font-medium capitalize transition-colors ${
                  forSelf === v
                    ? 'border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))]'
                    : 'border-border'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-semibold">
            Describe style
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
            placeholder="e.g. Off-shoulder lace gown, mermaid fit, floor-length..."
          />
        </div>

        <div>
          <Label htmlFor="customization" className="text-sm font-semibold">
            Any specific customization?
          </Label>
          <textarea
            id="customization"
            value={customization}
            onChange={(e) => setCustomization(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
            placeholder="Colors, fabric preferences, added details..."
          />
        </div>

        <div>
          <Label htmlFor="quantity" className="text-sm font-semibold">
            Number of orders
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-semibold">
            Phone / WhatsApp number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="e.g. 0803 123 4567"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="delivery" className="text-sm font-semibold">
            Where would this be delivered?
          </Label>
          <Input
            id="delivery"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="State, town/area"
            className="mt-1.5"
          />
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {busy ? 'Submitting…' : 'Submit Request'}
        </Button>
      </form>
    </div>
  );
}

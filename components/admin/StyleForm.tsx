'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import type { Style } from '@/lib/styles';

const GENDERS: Style['gender'][] = ['female', 'male', 'kid'];
const CATEGORIES: Style['category'][] = ['party', 'casual', 'wedding', 'corporate', 'church'];

interface Props {
  style?: Style;
}

export function StyleForm({ style }: Props) {
  const router = useRouter();
  const isEdit = !!style;

  const [name, setName] = useState(style?.name ?? '');
  const [gender, setGender] = useState<Style['gender']>(style?.gender ?? 'female');
  const [category, setCategory] = useState<Style['category']>(style?.category ?? 'party');
  const [price, setPrice] = useState(style?.price?.toString() ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(style?.compare_at_price?.toString() ?? '');
  const [description, setDescription] = useState(style?.description ?? '');
  const [fabricDetails, setFabricDetails] = useState(style?.fabric_details ?? '');
  const [deliveryTimeline, setDeliveryTimeline] = useState(
    style?.delivery_timeline ?? '7-10 working days'
  );
  const [deliveryCost, setDeliveryCost] = useState(style?.delivery_cost?.toString() ?? '2000');
  const [isNew, setIsNew] = useState(style?.is_new ?? true);
  const [isActive, setIsActive] = useState(style?.is_active ?? true);
  const [existingImages, setExistingImages] = useState<string[]>(style?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      setError('Name and price are required.');
      return;
    }
    setBusy(true);
    setError(null);

    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('styles').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from('styles').getPublicUrl(path);
        uploadedUrls.push(pub.publicUrl);
      }

      const payload = {
        name: name.trim(),
        gender,
        category,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        description: description.trim() || null,
        fabric_details: fabricDetails.trim() || null,
        delivery_timeline: deliveryTimeline.trim() || null,
        delivery_cost: deliveryCost ? Number(deliveryCost) : 0,
        is_new: isNew,
        is_active: isActive,
        images: [...existingImages, ...uploadedUrls],
      };

      const result = isEdit
        ? await supabase.from('styles').update(payload).eq('id', style!.id)
        : await supabase.from('styles').insert(payload);

      if (result.error) throw result.error;
      router.push('/admin/styles');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Label className="text-sm font-semibold">Images</Label>
        <div className="flex flex-wrap gap-3 mt-2">
          {existingImages.map((url) => (
            <div key={url} className="relative h-20 w-16 rounded-sm overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setExistingImages((prev) => prev.filter((u) => u !== url))}
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={i} className="relative h-20 w-16 rounded-sm overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="h-20 w-16 rounded-sm border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:border-[hsl(var(--verified))]">
            + Add
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setNewFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold">Gender</Label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Style['gender'])}
            className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm capitalize"
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-sm font-semibold">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Style['category'])}
            className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-sm font-semibold">Price (₦)</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="compareAtPrice" className="text-sm font-semibold">Compare-at price (₦)</Label>
          <Input id="compareAtPrice" type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="fabric" className="text-sm font-semibold">Fabric details</Label>
        <Input id="fabric" value={fabricDetails} onChange={(e) => setFabricDetails(e.target.value)} className="mt-1.5" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryTimeline" className="text-sm font-semibold">Delivery timeline</Label>
          <Input id="deliveryTimeline" value={deliveryTimeline} onChange={(e) => setDeliveryTimeline(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="deliveryCost" className="text-sm font-semibold">Delivery cost (₦)</Label>
          <Input id="deliveryCost" type="number" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          Mark as New
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible in catalog)
        </label>
      </div>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEdit ? 'Save Changes' : 'Add Style'}
      </Button>
    </form>
  );
}

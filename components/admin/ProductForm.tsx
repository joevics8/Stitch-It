'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { compressImageFile } from '@/lib/image-compression';
import { PRODUCT_CATEGORIES, type Product } from '@/lib/products';

interface Props {
  product?: Product;
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<Product['category']>(product?.category ?? 'bags');
  const [gender, setGender] = useState<Product['gender']>(product?.gender ?? 'unisex');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [rating, setRating] = useState(product?.rating?.toString() ?? '0');
  const [ratingCount, setRatingCount] = useState(product?.rating_count?.toString() ?? '0');
  const [isNew, setIsNew] = useState(product?.is_new ?? true);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
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
        const compressed = await compressImageFile(file);
        const path = `${user.id}/${Date.now()}-${compressed.name}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(path, compressed);
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from('products').getPublicUrl(path);
        uploadedUrls.push(pub.publicUrl);
      }

      const payload = {
        name: name.trim(),
        category,
        gender,
        price: Number(price),
        compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
        description: description.trim() || null,
        rating: Number(rating) || 0,
        rating_count: Number(ratingCount) || 0,
        is_new: isNew,
        is_active: isActive,
        images: [...existingImages, ...uploadedUrls],
      };

      const result = isEdit
        ? await supabase.from('products').update(payload).eq('id', product!.id)
        : await supabase.from('products').insert(payload);

      if (result.error) throw result.error;
      router.push('/admin/products');
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
            <div key={url} className="relative h-20 w-20 rounded-sm overflow-hidden bg-muted">
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
            <div key={i} className="relative h-20 w-20 rounded-sm overflow-hidden bg-muted">
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
          <label className="h-20 w-20 rounded-sm border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:border-[hsl(var(--verified))]">
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
          <Label className="text-sm font-semibold">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product['category'])}
            className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm capitalize"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-sm font-semibold">Gender</Label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Product['gender'])}
            className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm capitalize"
          >
            <option value="unisex">Unisex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rating" className="text-sm font-semibold">Rating (0–5)</Label>
          <Input id="rating" type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="ratingCount" className="text-sm font-semibold">Rating count</Label>
          <Input id="ratingCount" type="number" min="0" value={ratingCount} onChange={(e) => setRatingCount(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          Mark as New
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible in shop)
        </label>
      </div>

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isEdit ? 'Save Changes' : 'Add Product'}
      </Button>
    </form>
  );
}

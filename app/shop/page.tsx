import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/products/ProductCard';
import { PRODUCT_CATEGORY_TABS, SORT_OPTIONS, type Product, type SortOption } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Bags, watches, fabrics, shoes, and jewelry to complete your look.',
};

export const dynamic = 'force-dynamic';

const PRICE_RANGES: { value: string; label: string; min?: number; max?: number }[] = [
  { value: '', label: 'Any price' },
  { value: '0-10000', label: 'Under ₦10,000', max: 10000 },
  { value: '10000-30000', label: '₦10,000 – ₦30,000', min: 10000, max: 30000 },
  { value: '30000-100000', label: '₦30,000 – ₦100,000', min: 30000, max: 100000 },
  { value: '100000-', label: 'Over ₦100,000', min: 100000 },
];

interface SearchParams {
  category?: string;
  sort?: SortOption;
  price?: string;
  gender?: string;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const activeTab = searchParams.category || 'featured';
  const sort: SortOption = searchParams.sort || 'newest';
  const priceRange = PRICE_RANGES.find((p) => p.value === searchParams.price);
  const gender = searchParams.gender;

  const supabase = createClient();
  let query = supabase.from('products').select('*').eq('is_active', true);

  if (activeTab === 'new') {
    query = query.eq('is_new', true);
  } else if (activeTab !== 'featured') {
    query = query.eq('category', activeTab);
  }
  if (priceRange?.min !== undefined) query = query.gte('price', priceRange.min);
  if (priceRange?.max !== undefined) query = query.lte('price', priceRange.max);
  if (gender && gender !== 'all') query = query.eq('gender', gender);

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data } = await query;
  const products = (data ?? []) as Product[];

  const buildHref = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams({
      category: overrides.category ?? activeTab,
      ...(overrides.sort || sort !== 'newest' ? { sort: overrides.sort ?? sort } : {}),
      ...(overrides.price || searchParams.price ? { price: overrides.price ?? searchParams.price! } : {}),
      ...(overrides.gender || gender ? { gender: overrides.gender ?? gender! } : {}),
    });
    if (params.get('category') === 'featured') params.delete('category');
    const qs = params.toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  return (
    <div>
      <div className="bg-[hsl(var(--muted))] border-b border-border py-6 text-center">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Shop</h1>
        <p className="text-sm text-muted-foreground mt-1">Bags, watches, fabrics, shoes & jewelry</p>
      </div>

      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-5 px-4 py-3 whitespace-nowrap max-w-5xl mx-auto">
          {PRODUCT_CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ category: tab.value })}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-[hsl(var(--verified))] text-[hsl(var(--verified))]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-3 border-b border-border">
        <form action="/shop" method="get" className="contents">
          <input type="hidden" name="category" value={activeTab} />
          <select
            name="sort"
            defaultValue={sort}
            className="text-sm rounded-sm border border-border bg-background px-3 py-2"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
          <select
            name="price"
            defaultValue={searchParams.price ?? ''}
            className="text-sm rounded-sm border border-border bg-background px-3 py-2"
          >
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            name="gender"
            defaultValue={gender ?? 'all'}
            className="text-sm rounded-sm border border-border bg-background px-3 py-2"
          >
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
          <button
            type="submit"
            className="text-sm font-semibold text-[hsl(var(--verified))] px-2"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {products.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No products here yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

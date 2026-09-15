import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StyleCard } from '@/components/styles/StyleCard';
import { CATEGORY_TABS, type Style } from '@/lib/styles';
import type { SortOption } from '@/lib/products';

export const metadata: Metadata = { title: 'Styles' };
export const dynamic = 'force-dynamic';

const GENDER_CHIPS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'kid', label: 'Kids' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

interface SearchParams {
  measurementId?: string;
  gender?: string;
  category?: string;
  q?: string;
  sort?: SortOption;
}

export default async function StylesPage({ searchParams }: { searchParams: SearchParams }) {
  const gender = searchParams.gender || 'all';
  const category = searchParams.category || 'featured';
  const q = searchParams.q?.trim() ?? '';
  const sort: SortOption = searchParams.sort || 'newest';
  const measurementId = searchParams.measurementId;

  const supabase = createClient();
  let query = supabase.from('styles').select('*').eq('is_active', true);

  if (gender !== 'all') query = query.eq('gender', gender);
  if (category === 'new') query = query.eq('is_new', true);
  else if (category !== 'featured') query = query.eq('category', category);
  if (q) query = query.ilike('name', `%${q}%`);

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data } = await query;
  const styles = (data ?? []) as Style[];

  let measurementName: string | null = null;
  if (measurementId) {
    const { data: profile } = await supabase
      .from('measurement_profiles')
      .select('name')
      .eq('id', measurementId)
      .single();
    measurementName = profile?.name ?? null;
  }

  const withParams = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (measurementId) params.set('measurementId', measurementId);
    const merged = { gender, category, q, sort, ...overrides };
    if (merged.gender && merged.gender !== 'all') params.set('gender', merged.gender);
    if (merged.category && merged.category !== 'featured') params.set('category', merged.category);
    if (merged.q) params.set('q', merged.q);
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort);
    const qs = params.toString();
    return qs ? `/styles?${qs}` : '/styles';
  };

  const cardHref = (styleId: string) =>
    measurementId ? `/customize/${styleId}?measurementId=${measurementId}` : `/styles/${styleId}`;

  return (
    <div>
      <div className="bg-[hsl(var(--muted))] border-b border-border py-6 text-center px-4">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">
          {measurementId ? 'Choose a Style' : 'Styles'}
        </h1>
        {measurementName && (
          <p className="text-sm text-muted-foreground mt-1">
            Using measurements: <span className="font-medium text-foreground">{measurementName}</span>
          </p>
        )}
      </div>

      {/* Horizontal gender filter */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-2 px-4 py-3 max-w-5xl mx-auto">
          {GENDER_CHIPS.map((chip) => (
            <Link
              key={chip.value}
              href={withParams({ gender: chip.value })}
              className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                gender === chip.value
                  ? 'border-[hsl(var(--verified))] bg-[hsl(var(--verified))] text-white'
                  : 'border-border text-muted-foreground hover:border-[hsl(var(--verified))]'
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-5 px-4 py-3 whitespace-nowrap max-w-5xl mx-auto">
          {CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={withParams({ category: tab.value })}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                category === tab.value
                  ? 'border-[hsl(var(--verified))] text-[hsl(var(--verified))]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search + sort */}
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-3 border-b border-border">
        <form action="/styles" method="get" className="flex flex-1 flex-wrap gap-3">
          {measurementId && <input type="hidden" name="measurementId" value={measurementId} />}
          {gender !== 'all' && <input type="hidden" name="gender" value={gender} />}
          {category !== 'featured' && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search styles…"
            className="flex-1 min-w-[160px] text-sm rounded-sm border border-border bg-background px-3 py-2"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="text-sm rounded-sm border border-border bg-background px-3 py-2"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
          <button type="submit" className="text-sm font-semibold text-[hsl(var(--verified))] px-2">
            Go
          </button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {styles.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No styles match yet — try a different filter, or tell us exactly what you want.
            </p>
            <Link href="/request-style" className="text-sm font-semibold text-[hsl(var(--verified))]">
              Request a Style &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
            {styles.map((style) => (
              <StyleCard key={style.id} style={style} href={cardHref(style.id)} />
            ))}
          </div>
        )}

        <div className="mt-10 rounded-sm border border-border overflow-hidden flex flex-col sm:flex-row">
          <div className="flex-1 p-5">
            <p className="font-semibold mb-1">Request a Style</p>
            <p className="text-sm text-muted-foreground">
              Have a specific style you want to sew? Upload it and we&rsquo;ll get you a quote.
            </p>
          </div>
          <Link
            href="/request-style"
            className="flex items-center justify-center bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))] font-semibold px-6 py-4 shrink-0 hover:bg-[hsl(var(--verified))]/15 transition-colors"
          >
            Upload Your Style
          </Link>
        </div>
      </div>
    </div>
  );
}

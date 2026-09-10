import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StyleCard } from '@/components/styles/StyleCard';
import { CATEGORY_TABS, GENDER_LABELS, type Style } from '@/lib/styles';

const VALID_GENDERS = ['female', 'male', 'kid'] as const;

export async function generateMetadata({
  params,
}: {
  params: { gender: string };
}): Promise<Metadata> {
  const gender = params.gender as Style['gender'];
  const label = GENDER_LABELS[gender] ?? 'Styles';
  return { title: label };
}

export const dynamic = 'force-dynamic';

export default async function StylesListPage({
  params,
  searchParams,
}: {
  params: { gender: string };
  searchParams: { category?: string };
}) {
  const gender = params.gender as Style['gender'];
  if (!VALID_GENDERS.includes(gender)) notFound();

  const activeTab = searchParams.category || 'featured';
  const supabase = createClient();

  let query = supabase.from('styles').select('*').eq('gender', gender).eq('is_active', true);

  if (activeTab === 'new') {
    query = query.eq('is_new', true);
  } else if (activeTab !== 'featured') {
    query = query.eq('category', activeTab);
  }

  const { data: styles } = await query.order('created_at', { ascending: false });
  const items = (styles ?? []) as Style[];

  return (
    <div>
      <div className="bg-[hsl(var(--muted))] border-b border-border py-6 text-center">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">{GENDER_LABELS[gender]}</h1>
      </div>

      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-5 px-4 py-3 whitespace-nowrap max-w-5xl mx-auto">
          {CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/styles/${gender}${tab.value === 'featured' ? '' : `?category=${tab.value}`}`}
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

      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {items.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No styles here yet — check back soon, or tell us exactly what you want.
            </p>
            <Link href="/request-style" className="text-sm font-semibold text-[hsl(var(--verified))]">
              Request a Style &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
            {items.map((style) => (
              <StyleCard key={style.id} style={style} />
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

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AddToBag } from '@/components/cart/AddToBag';
import { formatNaira, type Style } from '@/lib/styles';

export const dynamic = 'force-dynamic';

async function getStyle(id: string): Promise<Style | null> {
  const supabase = createClient();
  const { data } = await supabase.from('styles').select('*').eq('id', id).single();
  return (data as Style) ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const style = await getStyle(params.id);
  return { title: style?.name ?? 'Style Details' };
}

export default async function StyleDetailsPage({ params }: { params: { id: string } }) {
  const style = await getStyle(params.id);
  if (!style) notFound();

  const image = style.images[0];

  return (
    <div className="max-w-lg mx-auto pb-16">
      <div className="aspect-[3/4] bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={style.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            No image yet
          </div>
        )}
      </div>

      <div className="px-4 py-5">
        <h1 className="font-serif text-xl font-semibold mb-2">{style.name}</h1>
        <div className="flex items-baseline gap-2 mb-5">
          {style.compare_at_price && style.compare_at_price > style.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(style.compare_at_price)}
            </span>
          )}
          <span className="text-xl font-semibold text-[hsl(var(--verified))]">
            {formatNaira(style.price)}
          </span>
        </div>

        {style.description && (
          <>
            <p className="text-sm font-semibold border-t border-border pt-4 mb-2">Item Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{style.description}</p>
          </>
        )}

        <div className="rounded-sm border border-border divide-y divide-border mb-6">
          {style.materials.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Materials</span>
              <span className="font-medium text-right">{style.materials.join(', ')}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Fabric Details</span>
            <span className="font-medium">{style.fabric_details ?? 'On request'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Delivery Timeline</span>
            <span className="font-medium">{style.delivery_timeline ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Delivery Cost</span>
            <span className="font-medium">
              {style.delivery_cost ? formatNaira(style.delivery_cost) : '—'}
            </span>
          </div>
        </div>

        <AddToBag styleId={style.id} showMeasurements showColor />
      </div>
    </div>
  );
}

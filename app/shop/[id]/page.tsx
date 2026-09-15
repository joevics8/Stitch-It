import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AddToBag } from '@/components/cart/AddToBag';
import { StarRating } from '@/components/products/StarRating';
import { formatNaira } from '@/lib/styles';
import { type Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase.from('products').select('*').eq('id', id).single();
  return (data as Product) ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return { title: product?.name ?? 'Product Details' };
}

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const image = product.images[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="max-w-lg mx-auto pb-16">
      <div className="aspect-square bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            No image yet
          </div>
        )}
      </div>

      <div className="px-4 py-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{product.category}</p>
        <h1 className="font-serif text-xl font-semibold mb-2">{product.name}</h1>
        <div className="mb-2">
          <StarRating rating={product.rating} count={product.rating_count} />
        </div>
        <div className="flex items-baseline gap-2 mb-5">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(product.compare_at_price!)}
            </span>
          )}
          <span className="text-xl font-semibold text-[hsl(var(--verified))]">
            {formatNaira(product.price)}
          </span>
        </div>

        {product.description && (
          <>
            <p className="text-sm font-semibold border-t border-border pt-4 mb-2">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>
          </>
        )}

        <AddToBag productId={product.id} showColor={false} />
      </div>
    </div>
  );
}

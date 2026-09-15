import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/styles';
import type { Product } from '@/lib/products';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold">Products ({products.length})</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-sm bg-[hsl(var(--verified))] text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet. Add your first one.</p>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium max-w-[220px] truncate">{product.name}</td>
                  <td className="px-4 py-3 capitalize">{product.category}</td>
                  <td className="px-4 py-3 capitalize">{product.gender}</td>
                  <td className="px-4 py-3">{formatNaira(product.price)}</td>
                  <td className="px-4 py-3">{product.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-[hsl(var(--verified))] font-medium mr-4"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

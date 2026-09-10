import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PackageSearch } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/styles';
import { type Order } from '@/lib/orders';

export const metadata: Metadata = { title: 'Order History' };
export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/orders');

  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-32">
      <h1 className="font-serif text-2xl font-semibold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <PackageSearch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-sm border border-border p-4 hover:border-[hsl(var(--verified))] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-sm capitalize ${
                    order.payment_status === 'paid'
                      ? 'bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))]'
                      : order.payment_status === 'failed'
                        ? 'bg-[hsl(var(--rust))]/10 text-[hsl(var(--rust))]'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {order.items.map((i) => i.name).join(', ')}
              </p>
              <p className="text-sm font-semibold mt-1">{formatNaira(order.total)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

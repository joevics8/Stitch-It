import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/styles';
import type { Order } from '@/lib/orders';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { payment?: string };
}) {
  const supabase = createClient();
  const filter = searchParams.payment;

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (filter === 'paid' || filter === 'pending' || filter === 'failed') {
    query = query.eq('payment_status', filter);
  }

  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const tabs: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-4">Orders ({orders.length})</h1>

      <div className="flex gap-4 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/orders?payment=${tab.value}` : '/admin/orders'}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              (filter ?? '') === tab.value
                ? 'border-[hsl(var(--verified))] text-[hsl(var(--verified))]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders here.</p>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="text-[hsl(var(--verified))]">
                      {order.customer_email ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                    {order.items.map((i) => i.name).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{formatNaira(order.total)}</td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
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

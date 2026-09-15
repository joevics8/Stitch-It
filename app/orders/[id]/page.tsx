import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatNaira } from '@/lib/styles';
import { type Order } from '@/lib/orders';

export const metadata: Metadata = { title: 'Order Details' };
export const dynamic = 'force-dynamic';

const STATUS_ICON: Record<Order['payment_status'], typeof CheckCircle2> = {
  paid: CheckCircle2,
  pending: Clock,
  failed: XCircle,
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/orders/${params.id}`);

  const { data } = await supabase.from('orders').select('*').eq('id', params.id).single();
  if (!data) notFound();

  const order = data as Order;
  const Icon = STATUS_ICON[order.payment_status];

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-32">
      <div className="text-center mb-8">
        <Icon
          className={`h-12 w-12 mx-auto mb-3 ${
            order.payment_status === 'paid'
              ? 'text-[hsl(var(--verified))]'
              : order.payment_status === 'failed'
                ? 'text-[hsl(var(--rust))]'
                : 'text-muted-foreground'
          }`}
        />
        <h1 className="font-serif text-2xl font-semibold mb-1">
          {order.payment_status === 'paid'
            ? 'Order confirmed'
            : order.payment_status === 'failed'
              ? 'Payment failed'
              : 'Payment pending'}
        </h1>
        <p className="text-xs text-muted-foreground font-mono">{order.payment_reference}</p>
      </div>

      <div className="rounded-sm border border-border p-4 mb-4 space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name} {item.color && `(${item.color})`}
              {item.quantity > 1 && ` ×${item.quantity}`}
            </span>
            <span className="font-medium">{formatNaira(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.discount > 0 && (
          <div className="flex justify-between text-sm text-[hsl(var(--verified))] pt-2 border-t border-border">
            <span>Coupon ({order.coupon_code})</span>
            <span>-{formatNaira(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm pt-2 border-t border-border font-semibold">
          <span>Total</span>
          <span className="text-[hsl(var(--verified))]">{formatNaira(order.total)}</span>
        </div>
      </div>

      <div className="rounded-sm border border-border p-4 mb-6 text-sm">
        <p className="font-semibold mb-1">Delivering to</p>
        <p className="text-muted-foreground">
          {order.delivery_address}, {order.delivery_town && `${order.delivery_town}, `}
          {order.delivery_lga && `${order.delivery_lga}, `}
          {order.delivery_state}
        </p>
        {order.express_delivery && (
          <p className="text-xs text-[hsl(var(--verified))] font-medium mt-1">Express delivery</p>
        )}
      </div>

      <Link
        href="/orders"
        className="block w-full text-center rounded-sm border border-border font-semibold py-3 hover:border-[hsl(var(--verified))] hover:text-[hsl(var(--verified))] transition-colors"
      >
        View Order History
      </Link>
    </div>
  );
}

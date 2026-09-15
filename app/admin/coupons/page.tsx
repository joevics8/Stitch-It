import { createClient } from '@/lib/supabase/server';
import { CreateCouponForm } from '@/components/admin/CreateCouponForm';
import { CouponRowActions } from '@/components/admin/CouponRowActions';
import type { Coupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

function formatDate(iso: string | null) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminCouponsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  const coupons = (data ?? []) as Coupon[];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Coupons ({coupons.length})</h1>

      <CreateCouponForm />

      {coupons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coupons yet.</p>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `₦${c.discount_value.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.expires_at)}</td>
                  <td className="px-4 py-3">{c.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <CouponRowActions couponId={c.id} isActive={c.is_active} />
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

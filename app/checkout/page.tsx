import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = { title: 'Order Confirmation' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/checkout');

  return <CheckoutForm />;
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PaystackVerifyResponse {
  status: boolean;
  data?: {
    status: string;
    amount: number;
    reference: string;
  };
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Payment is not configured.' }, { status: 500 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const reference: string | undefined = body?.reference;
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference.' }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_reference', reference)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const verifyJson: PaystackVerifyResponse = await verifyRes.json();

  const paystackAmountKobo = verifyJson.data?.amount ?? 0;
  const expectedAmountKobo = Math.round(order.total * 100);
  const isSuccessful = verifyJson.status && verifyJson.data?.status === 'success';
  const amountMatches = paystackAmountKobo === expectedAmountKobo;

  if (!isSuccessful || !amountMatches) {
    await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ success: false, error: 'Payment could not be verified.' }, { status: 400 });
  }

  await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'processing' })
    .eq('id', order.id);

  await supabase.from('cart_items').delete().eq('user_id', user.id);

  return NextResponse.json({ success: true, orderId: order.id });
}

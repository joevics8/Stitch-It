import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code: string | undefined = body?.code;
  const subtotal: number | undefined = body?.subtotal;

  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ error: 'Missing code or subtotal.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .rpc('validate_coupon', { coupon_code: code, order_subtotal: subtotal })
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false, discount: 0, message: 'Could not validate coupon.' });
  }

  return NextResponse.json(data);
}

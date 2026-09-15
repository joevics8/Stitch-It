import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXPRESS_DELIVERY_FEE, type OrderItem } from '@/lib/orders';
import type { CartItem } from '@/lib/styles';
import { lineItemInfo } from '@/lib/cart';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { deliveryState, deliveryLga, deliveryTown, deliveryAddress, expressDelivery, couponCode } = body ?? {};

  if (!deliveryState || !deliveryAddress) {
    return NextResponse.json({ error: 'Delivery state and address are required.' }, { status: 400 });
  }

  const { data: cartData, error: cartError } = await supabase
    .from('cart_items')
    .select('*, styles(*), products(*)')
    .eq('user_id', user.id);

  if (cartError) {
    return NextResponse.json({ error: 'Could not load your bag.' }, { status: 500 });
  }

  const cartItems = (cartData ?? []) as unknown as CartItem[];
  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Your bag is empty.' }, { status: 400 });
  }

  const items: OrderItem[] = cartItems
    .map((c) => {
      const info = lineItemInfo(c);
      if (!info) return null;
      return {
        style_id: c.style_id,
        product_id: c.product_id,
        name: info.name,
        image: info.image,
        price: info.price,
        quantity: c.quantity,
        color: c.color,
      };
    })
    .filter((item): item is OrderItem => item !== null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = Math.max(...cartItems.map((c) => lineItemInfo(c)?.deliveryCost ?? 0), 0);
  const expressFee = expressDelivery ? EXPRESS_DELIVERY_FEE : 0;

  let discount = 0;
  let appliedCouponCode: string | null = null;
  if (couponCode) {
    const { data: couponResult } = await supabase
      .rpc('validate_coupon', { coupon_code: couponCode, order_subtotal: subtotal })
      .single<{ valid: boolean; discount: number; message: string }>();
    if (couponResult?.valid) {
      discount = couponResult.discount;
      appliedCouponCode = couponCode.toUpperCase();
    } else {
      return NextResponse.json(
        { error: couponResult?.message || 'Invalid or expired coupon code.' },
        { status: 400 }
      );
    }
  }

  const total = subtotal + deliveryFee + expressFee - discount;

  const reference = `SI-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      customer_email: user.email,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      express_delivery: !!expressDelivery,
      express_fee: expressFee,
      delivery_state: deliveryState,
      delivery_lga: deliveryLga || null,
      delivery_town: deliveryTown || null,
      delivery_address: deliveryAddress,
      coupon_code: appliedCouponCode,
      discount,
      total,
      payment_reference: reference,
      payment_status: 'pending',
    })
    .select()
    .single();

  if (insertError || !order) {
    return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
  }

  return NextResponse.json({ order });
}

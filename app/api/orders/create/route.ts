import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXPRESS_DELIVERY_FEE, type OrderItem } from '@/lib/orders';
import type { CartItem } from '@/lib/styles';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { deliveryState, deliveryLga, deliveryTown, deliveryAddress, expressDelivery } = body ?? {};

  if (!deliveryState || !deliveryAddress) {
    return NextResponse.json({ error: 'Delivery state and address are required.' }, { status: 400 });
  }

  const { data: cartData, error: cartError } = await supabase
    .from('cart_items')
    .select('*, styles(*)')
    .eq('user_id', user.id);

  if (cartError) {
    return NextResponse.json({ error: 'Could not load your bag.' }, { status: 500 });
  }

  const cartItems = (cartData ?? []) as unknown as CartItem[];
  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Your bag is empty.' }, { status: 400 });
  }

  const items: OrderItem[] = cartItems
    .filter((c) => c.styles)
    .map((c) => ({
      style_id: c.style_id,
      name: c.styles!.name,
      image: c.styles!.images[0] ?? null,
      price: c.styles!.price,
      quantity: c.quantity,
      color: c.color,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = Math.max(...cartItems.map((c) => c.styles?.delivery_cost ?? 0), 0);
  const expressFee = expressDelivery ? EXPRESS_DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee + expressFee;

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

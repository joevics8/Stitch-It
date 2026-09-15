import type { CartItem } from './styles';

export interface LineItemInfo {
  name: string;
  price: number;
  image: string | null;
  deliveryCost: number;
}

export function lineItemInfo(item: CartItem): LineItemInfo | null {
  if (item.styles) {
    return {
      name: item.styles.name,
      price: item.styles.price,
      image: item.styles.images[0] ?? null,
      deliveryCost: item.styles.delivery_cost ?? 0,
    };
  }
  if (item.products) {
    return {
      name: item.products.name,
      price: item.products.price,
      image: item.products.images[0] ?? null,
      deliveryCost: 1500,
    };
  }
  return null;
}

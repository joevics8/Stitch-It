export interface OrderItem {
  style_id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  color: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  customer_email: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  express_delivery: boolean;
  express_fee: number;
  delivery_state: string | null;
  delivery_lga: string | null;
  delivery_town: string | null;
  delivery_address: string | null;
  coupon_code: string | null;
  discount: number;
  total: number;
  payment_reference: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

export const EXPRESS_DELIVERY_FEE = 5000;

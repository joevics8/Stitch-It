export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

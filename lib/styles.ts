export interface Style {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'kid';
  category: 'party' | 'casual' | 'wedding' | 'corporate' | 'church';
  price: number;
  compare_at_price: number | null;
  description: string | null;
  images: string[];
  fabric_details: string | null;
  delivery_timeline: string | null;
  delivery_cost: number | null;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  style_id: string;
  measurement_profile_id: string | null;
  color: string | null;
  customization_notes: string | null;
  quantity: number;
  created_at: string;
  styles: Style | null;
}

export const GENDER_LABELS: Record<Style['gender'], string> = {
  female: 'Female Styles',
  male: 'Male Styles',
  kid: 'Styles for Kids',
};

export const CATEGORY_TABS: { value: Style['category'] | 'featured' | 'new'; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'party', label: 'Party' },
  { value: 'casual', label: 'Casual' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'church', label: 'Church' },
  { value: 'new', label: 'New' },
];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

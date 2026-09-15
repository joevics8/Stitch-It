export interface Product {
  id: string;
  name: string;
  category: 'bags' | 'watches' | 'fabrics' | 'belts' | 'shoes' | 'jewelry';
  gender: 'male' | 'female' | 'unisex';
  price: number;
  compare_at_price: number | null;
  description: string | null;
  images: string[];
  rating: number;
  rating_count: number;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
}

export const PRODUCT_CATEGORY_TABS: { value: Product['category'] | 'featured' | 'new'; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'bags', label: 'Bags' },
  { value: 'watches', label: 'Watches' },
  { value: 'fabrics', label: 'Fabrics' },
  { value: 'belts', label: 'Belts' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'new', label: 'New' },
];

export const PRODUCT_CATEGORIES: Product['category'][] = [
  'bags', 'watches', 'fabrics', 'belts', 'shoes', 'jewelry',
];

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

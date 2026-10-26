export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  icon_name: string;
  display_order: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  brand: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  price: string | number;
  original_price: string | number;
  discount_percentage: number;
  rating: string | number;
  rating_count: number;
  review_count: number;
  stock: number;
  zap_assured: boolean;
  thumbnail: string;
  images?: string[];
  highlights?: string[];
  specifications?: Record<string, string>;
  is_deal_of_the_day?: boolean;
  deal_tag?: string;
  reviews?: Review[];
  similarProducts?: Product[];
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  likes: number;
  created_at: string;
}

export interface CartItem {
  cart_item_id: number;
  product_id: number;
  title: string;
  slug: string;
  brand: string;
  price: string | number;
  original_price: string | number;
  discount_percentage: number;
  thumbnail: string;
  stock: number;
  zap_assured: boolean;
  quantity: number;
}

export interface CartSummary {
  itemCount: number;
  originalTotal: number;
  totalDiscount: number;
  deliveryFee: number;
  finalAmount: number;
}

export interface Address {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address_line: string;
  city: string;
  state: string;
  landmark?: string;
  alternate_phone?: string;
  address_type: 'HOME' | 'WORK';
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  title: string;
  thumbnail: string;
  price: string | number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: string | number;
  discount_amount: string | number;
  delivery_charge: string | number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: Address;
  expected_delivery_date: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  tracking_info?: {
    awb?: string;
    courier?: string;
    deliveryAgent?: string;
    otp?: string;
    currentStage?: string;
    events?: Array<{
      title: string;
      description: string;
      time: string;
      location: string;
      completed: boolean;
    }>;
  };
  created_at: string;
  items: OrderItem[];
}

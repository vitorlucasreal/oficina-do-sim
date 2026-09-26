export type UserRole = "customer" | "admin" | "owner";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  phone_2: string | null;
  cpf: string | null;
  cep: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  house_number: string | null;
  complement: string | null;
  reference: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  categoryId?: string | null;
  categoryRef?: Category | null;
  customizable: boolean;
  isBestSeller?: boolean;
  isPromo?: boolean;
  promoPrice?: number;
  features: string[];
  galleryImages: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  productCount?: number;
  description?: string;
  image?: string;
  image_url?: string;
  is_featured_home?: boolean;
  home_order?: number;
  iconName?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
}

export interface KitItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: string;
}

export interface Customizations {
  name?: string;
  date?: string;
  message?: string;
  color?: string;
  observations?: string;
}

export interface CartItem {
  id: string; // Unique timestamp or ID for cart item
  product: Product;
  quantity: number;
  customizations?: Customizations;
}

export interface QuizAnswers {
  venue: string;
  palette: string;
  vibe: string;
  details: string;
  guests: number;
}

export interface QuizResult {
  style: string;
  description: string;
  tips: string[];
  recommendedProductIds: string[];
}

export type OrderStatus =
  | "quote_requested"
  | "quote_approved"
  | "payment_pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  display_id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  customer_snapshot: any;
  shipping_address_snapshot: any;
  shipping_carrier: string | null;
  tracking_code: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  sku_at_time: string | null;
  product_snapshot: any;
  customizations: Customizations | null;
  quantity: number;
  unit_price_at_time: number;
  total_price: number;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}


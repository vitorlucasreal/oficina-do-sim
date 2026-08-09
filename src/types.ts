export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
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
  description: string;
  image: string;
  iconName: string;
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

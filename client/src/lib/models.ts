export type ProductType = "digital" | "course" | "service" | "booking";
export type ProductStatus = "published" | "draft" | "archived";
export type OrderStatus = "paid" | "pending" | "failed" | "refunded";
export type ThemePreset = "Minimal" | "Creator" | "Elegant" | "Bold" | "Dark" | "Clean";

export interface Creator {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  socials: { label: string; url: string; icon: string }[];
}

export interface ProductFile {
  id: string;
  name: string;
  type: string;
  size: string;
  demoUrl?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  cover: string;
  status: ProductStatus;
  featured: boolean;
  sales: number;
  updatedAt: string;
  includes: string[];
  files: ProductFile[];
}

export interface StoreBlock {
  id: string;
  type: "profile" | "text" | "image" | "product" | "service" | "course" | "booking" | "button" | "whatsapp" | "social" | "video" | "divider";
  visible: boolean;
  title?: string;
  body?: string;
  productId?: string;
  productIds?: string[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  buttonLabel?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  availability?: string;
  schedulingUrl?: string;
}

export interface StoreTheme {
  preset: ThemePreset;
  background: string;
  text: string;
  accent: string;
  button: "pill" | "rounded" | "square";
  card: "soft" | "solid" | "outline";
  font: "Inter" | "DM Sans" | "Plus Jakarta Sans";
}

export interface Store {
  id: string;
  name: string;
  description: string;
  theme: StoreTheme;
  blocks: StoreBlock[];
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: "demo_confirmed" | "pending" | "failed";
  status: OrderStatus;
  createdAt: string;
  isDemo?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderIds: string[];
  totalSpent: number;
  lastPurchase: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  amount: number;
  expiresAt: string;
  usageLimit: number;
  used: number;
  active: boolean;
}

export interface AnalyticsEvent {
  id: string;
  type: "store_view" | "product_view" | "checkout_started" | "purchase_completed";
  productId?: string;
  orderId?: string;
  createdAt: string;
}

export interface Settings {
  orderNotifications: boolean;
  emailPreferences: boolean;
}

export interface MoonStoreData {
  creator: Creator;
  store: Store;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  analytics: AnalyticsEvent[];
  settings: Settings;
  auth: { loggedIn: boolean; onboardingComplete: boolean };
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  digital: "Digital product",
  course: "Course",
  service: "Service",
  booking: "Booking",
};

export const PRODUCT_TYPE_COLORS: Record<ProductType, string> = {
  digital: "#635BFF",
  course: "#EC4899",
  service: "#F59E0B",
  booking: "#10B981",
};

export const themePresets: Record<ThemePreset, StoreTheme> = {
  Minimal: { preset: "Minimal", background: "#F7F8FC", text: "#111827", accent: "#4F46E5", button: "rounded", card: "soft", font: "Inter" },
  Creator: { preset: "Creator", background: "#FFF6EF", text: "#201915", accent: "#E45B36", button: "pill", card: "solid", font: "DM Sans" },
  Elegant: { preset: "Elegant", background: "#F6F1EA", text: "#2E2924", accent: "#A87542", button: "rounded", card: "outline", font: "Plus Jakarta Sans" },
  Bold: { preset: "Bold", background: "#FFF4DC", text: "#161616", accent: "#EA580C", button: "square", card: "solid", font: "DM Sans" },
  Dark: { preset: "Dark", background: "#16172B", text: "#F6F3FF", accent: "#9C8CFF", button: "pill", card: "soft", font: "Inter" },
  Clean: { preset: "Clean", background: "#FFFFFF", text: "#202124", accent: "#1F8A70", button: "rounded", card: "outline", font: "Inter" },
};

export const formatMoney = (amount: number, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount).replace("PKR", "Rs.");

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

export const relativeDate = (date: string) => {
  const days = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
};

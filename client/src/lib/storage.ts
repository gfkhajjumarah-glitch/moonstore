import type { AnalyticsEvent, Coupon, Customer, MoonStoreData, Order, Product, Settings, Store } from "./models";
import { themePresets } from "./models";

const KEY = "moonstore_data_v1";

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

const demoProducts: Product[] = [
  {
    id: "prod_toolkit",
    slug: "ultimate-creator-toolkit",
    title: "Ultimate Creator Toolkit",
    description: "A focused library of templates, workflows, and prompts to help you publish with more clarity and less busywork.",
    type: "digital",
    price: 2500,
    currency: "PKR",
    cover: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85",
    status: "published",
    featured: true,
    sales: 18,
    updatedAt: daysAgo(2),
    includes: ["40 editable content templates", "Weekly planning workflow", "Launch checklist", "Lifetime updates"],
    files: [{ id: "file_toolkit", name: "creator-toolkit.zip", type: "ZIP archive", size: "18.4 MB" }],
  },
  {
    id: "prod_templates",
    slug: "instagram-content-templates",
    title: "Instagram Content Templates",
    description: "A curated set of scroll-stopping post and story templates for a consistent, recognizable feed.",
    type: "digital",
    price: 1800,
    currency: "PKR",
    cover: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=85",
    status: "published",
    featured: true,
    sales: 12,
    updatedAt: daysAgo(8),
    includes: ["60 Canva templates", "Caption prompts", "Story highlight covers"],
    files: [{ id: "file_social", name: "social-templates.pdf", type: "PDF document", size: "8.1 MB" }],
  },
  {
    id: "prod_notion",
    slug: "notion-productivity-system",
    title: "Notion Productivity System",
    description: "A quiet, practical workspace for managing ideas, projects, and your weekly publishing rhythm.",
    type: "course",
    price: 3200,
    currency: "PKR",
    cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
    status: "draft",
    featured: false,
    sales: 0,
    updatedAt: daysAgo(12),
    includes: ["Personal dashboard", "Content calendar", "Project tracker"],
    files: [{ id: "file_notion", name: "notion-system.pdf", type: "PDF document", size: "3.2 MB" }],
  },
  {
    id: "prod_growth",
    slug: "creator-growth-guide",
    title: "Creator Growth Guide",
    description: "A short field guide to building an audience around useful ideas, not constant noise.",
    type: "digital",
    price: 1200,
    currency: "PKR",
    cover: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=85",
    status: "archived",
    featured: false,
    sales: 7,
    updatedAt: daysAgo(31),
    includes: ["52-page guide", "Positioning worksheet", "Content prompts"],
    files: [{ id: "file_guide", name: "creator-growth-guide.pdf", type: "PDF document", size: "5.7 MB" }],
  },
];

const demoOrders: Order[] = [
  {
    id: "ord_demo_1", number: "ORD-2026-0001", customerId: "cust_sana", customer: { name: "Sana Rahman", email: "sana@example.com", phone: "+92 300 1234567" },
    items: [{ productId: "prod_toolkit", title: "Ultimate Creator Toolkit", price: 2500, quantity: 1 }], amount: 2500, currency: "PKR", paymentMethod: "Card (demo)", paymentStatus: "demo_confirmed", status: "paid", createdAt: daysAgo(1), isDemo: true,
  },
  {
    id: "ord_demo_2", number: "ORD-2026-0002", customerId: "cust_ali", customer: { name: "Ali Hamza", email: "ali@example.com", phone: "+92 321 9087654" },
    items: [{ productId: "prod_templates", title: "Instagram Content Templates", price: 1800, quantity: 1 }], amount: 1800, currency: "PKR", paymentMethod: "JazzCash (demo)", paymentStatus: "demo_confirmed", status: "paid", createdAt: daysAgo(4), isDemo: true,
  },
  {
    id: "ord_demo_3", number: "ORD-2026-0003", customerId: "cust_maria", customer: { name: "Maria Khan", email: "maria@example.com", phone: "+92 333 4477889" },
    items: [{ productId: "prod_growth", title: "Creator Growth Guide", price: 1200, quantity: 1 }], amount: 1200, currency: "PKR", paymentMethod: "Bank transfer (demo)", paymentStatus: "demo_confirmed", status: "refunded", createdAt: daysAgo(17), isDemo: true,
  },
];

const demoCustomers: Customer[] = [
  { id: "cust_sana", name: "Sana Rahman", email: "sana@example.com", phone: "+92 300 1234567", orderIds: ["ord_demo_1"], totalSpent: 2500, lastPurchase: daysAgo(1) },
  { id: "cust_ali", name: "Ali Hamza", email: "ali@example.com", phone: "+92 321 9087654", orderIds: ["ord_demo_2"], totalSpent: 1800, lastPurchase: daysAgo(4) },
  { id: "cust_maria", name: "Maria Khan", email: "maria@example.com", phone: "+92 333 4477889", orderIds: ["ord_demo_3"], totalSpent: 0, lastPurchase: daysAgo(17) },
];

const demoAnalytics: AnalyticsEvent[] = [
  { id: "evt_1", type: "store_view", createdAt: daysAgo(1) },
  { id: "evt_2", type: "store_view", createdAt: daysAgo(1) },
  { id: "evt_3", type: "product_view", productId: "prod_toolkit", createdAt: daysAgo(1) },
  { id: "evt_4", type: "checkout_started", productId: "prod_toolkit", createdAt: daysAgo(1) },
  { id: "evt_5", type: "purchase_completed", orderId: "ord_demo_1", productId: "prod_toolkit", createdAt: daysAgo(1) },
  { id: "evt_6", type: "store_view", createdAt: daysAgo(2) },
  { id: "evt_7", type: "product_view", productId: "prod_templates", createdAt: daysAgo(4) },
  { id: "evt_8", type: "checkout_started", productId: "prod_templates", createdAt: daysAgo(4) },
  { id: "evt_9", type: "purchase_completed", orderId: "ord_demo_2", productId: "prod_templates", createdAt: daysAgo(4) },
  { id: "evt_10", type: "store_view", createdAt: daysAgo(6) },
  { id: "evt_11", type: "store_view", createdAt: daysAgo(8) },
  { id: "evt_12", type: "product_view", productId: "prod_growth", createdAt: daysAgo(17) },
];

export const createDefaultData = (): MoonStoreData => ({
  creator: {
    id: "creator_demo",
    name: "Ayesha Malik",
    username: "ayesha_malik",
    email: "ayesha@moonstore.demo",
    bio: "I help thoughtful creators turn their ideas into a business that feels like them.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=85",
    socials: [{ label: "Instagram", url: "https://instagram.com", icon: "instagram" }, { label: "YouTube", url: "https://youtube.com", icon: "youtube" }, { label: "TikTok", url: "https://tiktok.com", icon: "music" }],
  },
  store: {
    id: "store_demo",
    name: "Ayesha Malik",
    description: "Tools and resources for a more intentional creator business.",
    theme: themePresets.Minimal,
    blocks: [
      { id: "block_profile", type: "profile", visible: true },
      { id: "block_text", type: "text", visible: true, title: "Build your body of work", body: "Small systems. Better ideas. A creator business you can actually sustain." },
      { id: "block_product_1", type: "product", visible: true, productId: "prod_toolkit" },
      { id: "block_product_2", type: "product", visible: true, productId: "prod_templates" },
      { id: "block_button", type: "button", visible: true, buttonLabel: "Work with me" },
      { id: "block_social", type: "social", visible: true },
    ],
  },
  products: demoProducts,
  orders: demoOrders,
  customers: demoCustomers,
  coupons: [{ id: "coupon_welcome", code: "WELCOME10", type: "percentage", amount: 10, expiresAt: "2026-12-31", usageLimit: 100, used: 8, active: true }],
  analytics: demoAnalytics,
  settings: { orderNotifications: true, emailPreferences: true },
  auth: { loggedIn: true, onboardingComplete: true },
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export class LocalStorageRepository {
  load(): MoonStoreData {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as MoonStoreData;
    } catch { /* fall through to seed */ }
    const data = createDefaultData();
    this.save(data);
    return data;
  }

  save(data: MoonStoreData) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  reset() {
    const data = createDefaultData();
    this.save(data);
    return data;
  }
}

export const repository = new LocalStorageRepository();

export const safeClone = clone;

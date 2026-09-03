import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AnalyticsEvent, Coupon, Customer, MoonStoreData, Order, Product, Store, StoreBlock } from "@/lib/models";
import { repository } from "@/lib/storage";

const makeId = (prefix: string) => `${prefix}_${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";

interface MoonStoreContextValue {
  data: MoonStoreData;
  updateCreator: (patch: Partial<MoonStoreData["creator"]>) => void;
  updateStore: (patch: Partial<Store>) => void;
  updateTheme: (theme: Store["theme"]) => void;
  updateSettings: (patch: Partial<MoonStoreData["settings"]>) => void;
  updateBlock: (id: string, patch: Partial<StoreBlock>) => void;
  addBlock: (type: StoreBlock["type"]) => string;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  reorderBlocks: (sourceId: string, targetId: string) => void;
  addProduct: (product: Omit<Product, "id" | "slug" | "sales" | "updatedAt">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCoupon: (coupon: Omit<Coupon, "id" | "used">) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  completePurchase: (input: { productId: string; customer: { name: string; email: string; phone: string }; paymentMethod: string; couponCode?: string }) => { order: Order; discount: number } | null;
  track: (event: Omit<AnalyticsEvent, "id" | "createdAt">) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  finishOnboarding: () => void;
  resetDemo: () => void;
}

const MoonStoreContext = createContext<MoonStoreContextValue | null>(null);

export function MoonStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MoonStoreData>(() => repository.load());

  useEffect(() => {
    repository.save(data);
  }, [data]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "moonstore_data_v1" && event.newValue) setData(JSON.parse(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<MoonStoreContextValue>(() => {
    const set = (recipe: (draft: MoonStoreData) => void) => setData((current) => {
      const draft = JSON.parse(JSON.stringify(current)) as MoonStoreData;
      recipe(draft);
      return draft;
    });

    return {
      data,
      updateCreator: (patch) => set((draft) => { draft.creator = { ...draft.creator, ...patch }; }),
      updateStore: (patch) => set((draft) => { draft.store = { ...draft.store, ...patch }; }),
      updateTheme: (theme) => set((draft) => { draft.store.theme = theme; }),
      updateSettings: (patch) => set((draft) => { draft.settings = { ...draft.settings, ...patch }; }),
      updateBlock: (id, patch) => set((draft) => { const block = draft.store.blocks.find((item) => item.id === id); if (block) Object.assign(block, patch); }),
      addBlock: (type) => { const id = makeId("block"); set((draft) => { draft.store.blocks.push({ id, type, visible: true, title: type === "text" ? "New section" : type === "service" ? "Work with me" : type === "course" ? "Learn with me" : type === "booking" ? "Book a session" : undefined, body: type === "text" ? "Share something useful with your audience." : type === "service" ? "A focused way to work together." : type === "course" ? "A practical path to your next milestone." : type === "booking" ? "Choose a time that works for you." : undefined, buttonLabel: type === "button" ? "Explore" : type === "booking" ? "Choose a time" : "Get started", price: ["service", "course", "booking"].includes(type) ? 0 : undefined, currency: ["service", "course", "booking"].includes(type) ? "PKR" : undefined, availability: ["service", "course", "booking"].includes(type) ? "Open for bookings" : undefined, schedulingUrl: type === "booking" ? "https://cal.com/your-name" : undefined, productId: type === "product" ? draft.products.find((item) => item.status === "published")?.id : undefined }); }); return id; },
      deleteBlock: (id) => set((draft) => { draft.store.blocks = draft.store.blocks.filter((item) => item.id !== id); }),
      moveBlock: (id, direction) => set((draft) => { const index = draft.store.blocks.findIndex((item) => item.id === id); const next = index + direction; if (index < 0 || next < 0 || next >= draft.store.blocks.length) return; [draft.store.blocks[index], draft.store.blocks[next]] = [draft.store.blocks[next], draft.store.blocks[index]]; }),
      reorderBlocks: (sourceId, targetId) => set((draft) => { const sourceIndex = draft.store.blocks.findIndex((item) => item.id === sourceId); const targetIndex = draft.store.blocks.findIndex((item) => item.id === targetId); if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return; const [moved] = draft.store.blocks.splice(sourceIndex, 1); draft.store.blocks.splice(targetIndex, 0, moved); }),
      addProduct: (input) => {
        const product: Product = { ...input, id: makeId("prod"), slug: slugify(input.title), sales: 0, updatedAt: new Date().toISOString() };
        set((draft) => { draft.products.unshift(product); });
        return product;
      },
      updateProduct: (id, patch) => set((draft) => { const product = draft.products.find((item) => item.id === id); if (product) Object.assign(product, patch, { updatedAt: new Date().toISOString() }); }),
      deleteProduct: (id) => set((draft) => { draft.products = draft.products.filter((item) => item.id !== id); draft.store.blocks = draft.store.blocks.filter((block) => block.productId !== id); }),
      addCoupon: (input) => set((draft) => { draft.coupons.unshift({ ...input, id: makeId("coupon"), used: 0 }); }),
      updateCoupon: (id, patch) => set((draft) => { const coupon = draft.coupons.find((item) => item.id === id); if (coupon) Object.assign(coupon, patch); }),
      deleteCoupon: (id) => set((draft) => { draft.coupons = draft.coupons.filter((item) => item.id !== id); }),
      completePurchase: ({ productId, customer, paymentMethod, couponCode }) => {
        let result: { order: Order; discount: number } | null = null;
        set((draft) => {
          const product = draft.products.find((item) => item.id === productId);
          if (!product || product.status !== "published") return;
          const coupon = couponCode ? draft.coupons.find((item) => item.code.toLowerCase() === couponCode.toLowerCase() && item.active && item.used < item.usageLimit && new Date(item.expiresAt) >= new Date()) : undefined;
          const discount = coupon ? coupon.type === "percentage" ? Math.round(product.price * coupon.amount / 100) : Math.min(product.price, coupon.amount) : 0;
          const amount = product.price - discount;
          const customerRecord = draft.customers.find((item) => item.email.toLowerCase() === customer.email.toLowerCase());
          const customerId = customerRecord?.id ?? makeId("cust");
          const orderId = makeId("ord");
          const order: Order = { id: orderId, number: `ORD-2026-${String(draft.orders.length + 1).padStart(4, "0")}`, customerId, customer, items: [{ productId, title: product.title, price: amount, quantity: 1 }], amount, currency: product.currency, paymentMethod: `${paymentMethod} (demo)`, paymentStatus: "demo_confirmed", status: "paid", createdAt: new Date().toISOString(), isDemo: true };
          draft.orders.unshift(order);
          product.sales += 1;
          if (coupon) coupon.used += 1;
          if (customerRecord) { customerRecord.orderIds.unshift(orderId); customerRecord.totalSpent += amount; customerRecord.lastPurchase = order.createdAt; } else draft.customers.unshift({ id: customerId, name: customer.name, email: customer.email, phone: customer.phone, orderIds: [orderId], totalSpent: amount, lastPurchase: order.createdAt });
          draft.analytics.unshift({ id: makeId("evt"), type: "purchase_completed", productId, orderId, createdAt: order.createdAt });
          result = { order, discount };
        });
        return result;
      },
      track: (event) => set((draft) => { draft.analytics.unshift({ ...event, id: makeId("evt"), createdAt: new Date().toISOString() }); }),
      setLoggedIn: (loggedIn) => set((draft) => { draft.auth.loggedIn = loggedIn; }),
      finishOnboarding: () => set((draft) => { draft.auth.loggedIn = true; draft.auth.onboardingComplete = true; }),
      resetDemo: () => setData(repository.reset()),
    };
  }, [data]);

  return <MoonStoreContext.Provider value={value}>{children}</MoonStoreContext.Provider>;
}

export const useMoonStore = () => {
  const context = useContext(MoonStoreContext);
  if (!context) throw new Error("useMoonStore must be used inside MoonStoreProvider");
  return context;
};

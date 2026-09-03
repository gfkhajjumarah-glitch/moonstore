import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BarChart3, Bell, BookOpen, Box, ChevronDown, CircleHelp, ExternalLink, FileText, FolderKanban, LayoutDashboard, Menu, MoreHorizontal, Package, Plus, Settings, ShoppingBag, Sparkles, Store, Users, X, Zap, type LucideIcon } from "lucide-react";
import { useMoonStore } from "@/contexts/MoonStoreContext";
import { toast } from "sonner";

const mainNav: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Store", href: "/dashboard/store", icon: Store },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];
const secondaryNav: { label: string; href: string; icon: LucideIcon; soon?: boolean }[] = [
  { label: "Marketing", href: "/dashboard/marketing", icon: Sparkles, soon: true },
  { label: "Coupons", href: "/dashboard/coupons", icon: Zap },
  { label: "Automations", href: "/dashboard/automations", icon: FolderKanban, soon: true },
];

function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2.5 font-display text-[19px] font-semibold tracking-[-0.03em] ${light ? "text-white" : "text-ink"}`}><span className={`grid size-8 place-items-center rounded-[10px] ${light ? "bg-white/15" : "bg-ink"}`}><span className={`size-3.5 rotate-45 rounded-[4px] ${light ? "bg-white" : "bg-lilac"}`} /></span><span>moonstore</span></Link>;
}

function Sidebar({ close }: { close?: () => void }) {
  const [location] = useLocation();
  const { data, setLoggedIn } = useMoonStore();
  const active = (href: string) => href === "/dashboard" ? location === href : location.startsWith(href);
  return <aside className="flex h-full w-[244px] shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-line bg-white px-3.5 py-5">
    <div className="mb-8 flex items-center justify-between px-2"><Logo />{close && <button aria-label="Close navigation" onClick={close} className="icon-button lg:hidden"><X size={18} /></button>}</div>
    <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Workspace</div>
    <nav className="space-y-0.5">
      {mainNav.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={close} className={`nav-link ${active(href) ? "nav-link-active" : ""}`}><Icon size={17} strokeWidth={active(href) ? 2.1 : 1.7} /><span>{label}</span>{label === "Orders" && data.orders.filter((o) => o.status === "paid").length > 0 && <span className="ml-auto rounded-full bg-lilac px-1.5 py-0.5 text-[10px] font-bold text-indigo">{data.orders.filter((o) => o.status === "paid").length}</span>}</Link>)}
    </nav>
    <div className="mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Grow</div>
    <nav className="space-y-0.5">
      {secondaryNav.map(({ label, href, icon: Icon, soon }) => <Link key={href} href={href} onClick={close} className={`nav-link ${active(href) ? "nav-link-active" : ""}`}><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{soon && <span className="ml-auto rounded-md bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-muted">Soon</span>}</Link>)}
    </nav>
    <div className="mt-auto space-y-0.5">
      <Link href="/dashboard/settings" onClick={close} className={`nav-link ${active("/dashboard/settings") ? "nav-link-active" : ""}`}><Settings size={17} strokeWidth={1.7} /><span>Settings</span></Link>
      <Link href="/dashboard/help" onClick={close} className={`nav-link ${active("/dashboard/help") ? "nav-link-active" : ""}`}><CircleHelp size={17} strokeWidth={1.7} /><span>Help center</span></Link>
      <div className="my-4 h-px bg-line" />
      <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5"><img src={data.creator.avatar} alt="" className="size-9 rounded-full object-cover" /><div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold text-ink">{data.creator.name}</div><div className="truncate text-[11px] text-muted">@{data.creator.username}</div></div><button aria-label="Account menu" onClick={() => toast("Account menu is ready for your next workspace action.")} className="text-muted hover:text-ink"><MoreHorizontal size={17} /></button></div>
      <div className="flex items-center gap-2 px-2.5 pt-1"><Link href={`/${data.creator.username}`} onClick={close} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo hover:text-indigo-dark">View store <ExternalLink size={12} /></Link><button onClick={() => { setLoggedIn(false); close?.(); toast.success("You are logged out of this demo workspace."); }} className="ml-auto text-[11px] font-medium text-muted hover:text-ink">Log out</button></div>
    </div>
  </aside>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { data } = useMoonStore();
  const mobileMain = mainNav.slice(0, 4);
  const mobileMore = [
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Marketing", href: "/dashboard/marketing", icon: Sparkles },
    { label: "Coupons", href: "/dashboard/coupons", icon: Zap },
    { label: "Automations", href: "/dashboard/automations", icon: FolderKanban },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help center", href: "/dashboard/help", icon: CircleHelp },
  ];
  return <div className="min-h-screen bg-canvas text-ink"><div className="fixed inset-y-0 left-0 z-30 hidden h-screen lg:flex"><Sidebar /></div><div className="lg:hidden"><div className="fixed inset-x-0 top-0 z-40 flex h-[60px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur-xl"><Logo /><button aria-label="Notifications" onClick={() => toast("No new notifications — your store is up to date.")} className="icon-button"><Bell size={18} /></button></div>{open && <div className="fixed inset-0 z-50"><div onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/30 backdrop-blur-sm" /><div className="mobile-more-drawer absolute inset-x-3 bottom-[78px] rounded-2xl border border-line bg-white p-3 shadow-2xl"><div className="mb-2 flex items-center justify-between px-2"><span className="text-[11px] font-bold uppercase tracking-[.14em] text-muted">More workspace tools</span><button aria-label="Close menu" onClick={() => setOpen(false)} className="icon-button"><X size={16} /></button></div><div className="grid grid-cols-2 gap-1">{mobileMore.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-[12px] font-semibold ${location === href ? "bg-lilac text-indigo" : "text-slate-600 hover:bg-surface"}`}><Icon size={16} />{label}</Link>)}</div><Link href={`/${data.creator.username}`} onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-surface px-3 py-3 text-[12px] font-bold text-ink"><ExternalLink size={15} />View live store</Link></div></div>}</div><nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden">{mobileMain.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`mobile-bottom-link ${location === href ? "mobile-bottom-link-active" : ""}`}><Icon size={18} /><span>{label}</span></Link>)}<button onClick={() => setOpen((value) => !value)} className={`mobile-bottom-link ${open || mobileMore.some((item) => location === item.href) ? "mobile-bottom-link-active" : ""}`}><MoreHorizontal size={18} /><span>More</span></button></nav><div className="lg:pl-[244px]"><Topbar /><main className="mx-auto max-w-[1440px] px-4 pb-24 pt-[76px] sm:px-6 lg:px-10 lg:pb-12 lg:pt-9">{children}</main></div></div>;
}
function Topbar() {
  const { data } = useMoonStore();
  return <header className="hidden h-[68px] items-center justify-between border-b border-line bg-white/80 px-6 backdrop-blur-xl lg:flex lg:px-10"><div className="flex items-center gap-3 text-[13px] text-muted"><span className="size-2 rounded-full bg-emerald-500" /> All systems operational <span className="text-line">/</span> Demo workspace</div><div className="flex items-center gap-2"><Link href={`/${data.creator.username}`} className="button-quiet"><ExternalLink size={15} /> View live store</Link><button onClick={() => toast("Notifications are clear.")} aria-label="Notifications" className="icon-button"><Bell size={18} /></button></div></header>;
}

export function PageHeader({ eyebrow, title, description, actions, back }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; back?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"> <div>{back}{eyebrow && <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.17em] text-indigo">{eyebrow}</div>}<h1 className="font-display text-[30px] font-semibold tracking-[-0.045em] text-ink sm:text-[36px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">{description}</p>}</div>{actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}</div>;
}

export function StatCard({ label, value, delta, icon: Icon, accent = "indigo" }: { label: string; value: string; delta?: string; icon: LucideIcon; accent?: "indigo" | "green" | "orange" | "violet" }) {
  return <div className="surface-panel p-5"><div className="flex items-start justify-between"><div className={`grid size-9 place-items-center rounded-[11px] ${accent === "indigo" ? "bg-lilac text-indigo" : accent === "green" ? "bg-emerald-50 text-emerald-600" : accent === "orange" ? "bg-orange-50 text-orange-600" : "bg-violet-50 text-violet-600"}`}><Icon size={18} /></div>{delta && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">{delta}</span>}</div><div className="mt-5 text-[12px] font-medium text-muted">{label}</div><div className="mt-1 font-display text-[25px] font-semibold tracking-[-0.04em] text-ink">{value}</div></div>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { published: "badge-green", paid: "badge-green", active: "badge-green", draft: "badge-amber", pending: "badge-amber", archived: "badge-gray", refunded: "badge-gray", failed: "badge-red", disabled: "badge-gray" };
  return <span className={`status-badge ${map[status] ?? "badge-gray"}`}><span className="size-1.5 rounded-full bg-current" />{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export function EmptyState({ icon: Icon = FileText, title, description, action }: { icon?: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center"><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-lilac text-indigo"><Icon size={22} /></div><h3 className="font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">{title}</h3><p className="mt-2 max-w-sm text-[13px] leading-6 text-muted">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function PillButton({ children, onClick, href, variant = "primary", icon: Icon, type = "button", disabled }: { children: ReactNode; onClick?: () => void; href?: string; variant?: "primary" | "secondary" | "quiet" | "danger"; icon?: LucideIcon; type?: "button" | "submit"; disabled?: boolean }) {
  const className = `button-base ${variant === "primary" ? "button-primary" : variant === "danger" ? "button-danger" : variant === "secondary" ? "button-secondary" : "button-quiet"}`;
  const content = <>{Icon && <Icon size={15} />}{children}</>;
  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button type={type} disabled={disabled} onClick={onClick} className={className}>{content}</button>;
}

export function Field({ label, error, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-ink">{label}</span><input className={`field ${error ? "field-error" : ""}`} {...props} />{error && <span className="mt-1.5 block text-[11px] font-medium text-red-600">{error}</span>}{hint && !error && <span className="mt-1.5 block text-[11px] text-muted">{hint}</span>}</label>;
}

export function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-ink">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="field">{children}</select></label>;
}

export { Logo };

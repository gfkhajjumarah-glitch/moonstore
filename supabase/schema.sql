-- MoonStore Supabase schema
-- Frontend-first prototype scaffold. Apply in Supabase SQL editor when connecting a project.

create extension if not exists pgcrypto;

create type public.product_type as enum ('digital', 'course', 'service', 'booking');
create type public.product_status as enum ('published', 'draft', 'archived');
create type public.order_status as enum ('paid', 'pending', 'failed', 'refunded');
create type public.payment_status as enum ('demo_confirmed', 'pending', 'failed');
create type public.coupon_type as enum ('percentage', 'fixed');
create type public.analytics_event_type as enum ('store_view', 'product_view', 'checkout_started', 'purchase_completed');
create type public.store_block_type as enum ('profile', 'text', 'image', 'product', 'service', 'course', 'booking', 'button', 'whatsapp', 'social', 'video', 'divider');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text not null unique,
  email text not null,
  bio text not null default '',
  avatar_url text,
  socials jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  theme_preset text not null default 'Minimal',
  theme jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_blocks (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  block_type public.store_block_type not null,
  position integer not null default 0,
  visible boolean not null default true,
  title text,
  body text,
  button_label text,
  image_url text,
  product_id uuid,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, position)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  product_type public.product_type not null default 'digital',
  price integer not null default 0 check (price >= 0),
  currency text not null default 'PKR',
  cover_url text,
  status public.product_status not null default 'draft',
  featured boolean not null default false,
  sales integer not null default 0 check (sales >= 0),
  includes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

alter table public.store_blocks add constraint store_blocks_product_fk foreign key (product_id) references public.products(id) on delete set null;

create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  file_type text not null default 'file',
  file_size text,
  storage_path text,
  demo_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  total_spent integer not null default 0,
  last_purchase_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, email)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null unique,
  amount integer not null default 0 check (amount >= 0),
  currency text not null default 'PKR',
  payment_method text not null default 'demo',
  payment_status public.payment_status not null default 'pending',
  status public.order_status not null default 'pending',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  unit_price integer not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.order_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_file_id uuid references public.product_files(id) on delete set null,
  download_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  downloaded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  coupon_type public.coupon_type not null,
  amount integer not null check (amount >= 0),
  expires_at timestamptz,
  usage_limit integer not null default 0 check (usage_limit >= 0),
  used integer not null default 0 check (used >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, code)
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_type public.analytics_event_type not null,
  product_id uuid references public.products(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.creator_settings (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  order_notifications boolean not null default true,
  email_preferences boolean not null default true,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_owner_status_idx on public.products(owner_id, status);
create index orders_owner_created_idx on public.orders(owner_id, created_at desc);
create index analytics_owner_created_idx on public.analytics_events(owner_id, created_at desc);
create index store_blocks_store_position_idx on public.store_blocks(store_id, position);
create index deliveries_token_idx on public.order_deliveries(download_token);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger stores_updated_at before update on public.stores for each row execute function public.set_updated_at();
create trigger store_blocks_updated_at before update on public.store_blocks for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger coupons_updated_at before update on public.coupons for each row execute function public.set_updated_at();
create trigger creator_settings_updated_at before update on public.creator_settings for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_blocks enable row level security;
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_deliveries enable row level security;
alter table public.coupons enable row level security;
alter table public.analytics_events enable row level security;
alter table public.creator_settings enable row level security;

create policy "owners manage profiles" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "public read storefront profiles" on public.profiles for select using (exists (select 1 from public.stores s where s.owner_id = id and s.is_published));
create policy "owners manage stores" on public.stores for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "public read published stores" on public.stores for select using (is_published);
create policy "owners manage store blocks" on public.store_blocks for all using (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())) with check (exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid()));
create policy "public read published store blocks" on public.store_blocks for select using (exists (select 1 from public.stores s where s.id = store_id and s.is_published and visible));
create policy "public read published products" on public.products for select using (status = 'published' or owner_id = auth.uid());
create policy "owners manage products" on public.products for insert with check (auth.uid() = owner_id);
create policy "owners update products" on public.products for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners delete products" on public.products for delete using (auth.uid() = owner_id);
create policy "owners manage product files" on public.product_files for all using (exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())) with check (exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid()));
create policy "owners manage customers" on public.customers for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage orders" on public.orders for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage order items" on public.order_items for all using (exists (select 1 from public.orders o where o.id = order_id and o.owner_id = auth.uid())) with check (exists (select 1 from public.orders o where o.id = order_id and o.owner_id = auth.uid()));
create policy "owners manage deliveries" on public.order_deliveries for all using (exists (select 1 from public.orders o where o.id = order_id and o.owner_id = auth.uid())) with check (exists (select 1 from public.orders o where o.id = order_id and o.owner_id = auth.uid()));
create policy "owners manage coupons" on public.coupons for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners read analytics" on public.analytics_events for select using (auth.uid() = owner_id);
create policy "public insert analytics" on public.analytics_events for insert with check (true);
create policy "owners manage settings" on public.creator_settings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

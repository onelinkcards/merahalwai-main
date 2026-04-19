create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  whatsapp text,
  city text not null default 'Jaipur',
  state text not null default 'Rajasthan',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  profile_complete boolean not null default false,
  address_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  house text,
  address_line text not null,
  landmark text,
  city text not null default 'Jaipur',
  state text not null default 'Rajasthan',
  pincode text not null,
  latitude numeric,
  longitude numeric,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_name text,
  whatsapp text,
  email text,
  gst_number text,
  locality text,
  city text not null default 'Jaipur',
  state text not null default 'Rajasthan',
  pincode text,
  full_address text,
  short_description text,
  about text,
  menu_type text not null default 'veg_only' check (menu_type in ('veg_only', 'veg_and_non_veg')),
  google_place_id text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  cover_photo text,
  gallery jsonb not null default '[]'::jsonb,
  event_specialization jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_package_prices (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  package_tier text not null check (package_tier in ('bronze', 'silver', 'gold')),
  price_per_plate numeric(10,2) not null default 0,
  short_note text,
  customer_label text,
  enabled boolean not null default true,
  unique (vendor_id, package_tier)
);

create table if not exists public.platform_menu_categories (
  id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  label text not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_menu_items (
  id uuid primary key default gen_random_uuid(),
  category_key text not null references public.platform_menu_categories(category_key) on delete cascade,
  item_name text not null,
  is_veg boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_key, item_name)
);

create table if not exists public.platform_package_selection_counts (
  id uuid primary key default gen_random_uuid(),
  package_tier text not null check (package_tier in ('bronze', 'silver', 'gold')),
  category_key text not null references public.platform_menu_categories(category_key) on delete cascade,
  required_count integer not null default 0,
  unique (package_tier, category_key)
);

create table if not exists public.platform_optional_addon_groups (
  id uuid primary key default gen_random_uuid(),
  group_key text not null unique,
  title text not null,
  sort_order integer not null default 1
);

create table if not exists public.platform_optional_addons (
  id uuid primary key default gen_random_uuid(),
  group_key text not null references public.platform_optional_addon_groups(group_key) on delete cascade,
  addon_key text not null unique,
  name text not null,
  is_veg boolean not null default true,
  enabled boolean not null default true,
  price_per_pax numeric(10,2) not null default 0,
  sort_order integer not null default 1
);

create table if not exists public.platform_water_pricing (
  id uuid primary key default gen_random_uuid(),
  ro_price_per_pax numeric(10,2) not null default 0,
  packaged_200ml numeric(10,2) not null default 0,
  packaged_330ml numeric(10,2) not null default 0,
  packaged_500ml numeric(10,2) not null default 0,
  packaged_1ltr numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  customer_address_id uuid references public.customer_addresses(id) on delete set null,
  event_type text not null,
  event_date date not null,
  event_time text not null,
  guest_count integer not null,
  food_preference text not null check (food_preference in ('veg', 'veg_and_non_veg')),
  package_tier text not null check (package_tier in ('bronze', 'silver', 'gold')),
  price_per_plate numeric(10,2) not null default 0,
  base_amount numeric(10,2) not null default 0,
  optional_addons_amount numeric(10,2) not null default 0,
  water_amount numeric(10,2) not null default 0,
  booking_value numeric(10,2) not null default 0,
  pay_now_amount numeric(10,2) not null default 0,
  pay_now_tax numeric(10,2) not null default 0,
  pay_later_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  booking_status text not null default 'not_confirmed' check (booking_status in ('not_confirmed', 'payment_pending', 'confirmed', 'cancelled')),
  payment_status text not null default 'not_started' check (payment_status in ('not_started', 'pending', 'paid', 'failed', 'cancelled')),
  vendor_confirmation_status text not null default 'awaiting' check (vendor_confirmation_status in ('awaiting', 'confirmed', 'declined')),
  payment_reference text,
  vendor_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_menu_selections (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  category_key text not null references public.platform_menu_categories(category_key) on delete cascade,
  item_name text not null,
  is_veg boolean not null default true
);

create table if not exists public.booking_optional_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  addon_key text not null references public.platform_optional_addons(addon_key) on delete restrict,
  addon_name text not null,
  quantity integer not null default 1,
  price_per_pax numeric(10,2) not null default 0
);

create table if not exists public.booking_activities (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_type text not null check (actor_type in ('system', 'customer', 'vendor', 'admin')),
  actor_label text not null,
  event_key text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  event_key text not null,
  email_target text not null check (email_target in ('admin', 'customer')),
  email_address text not null,
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'queued', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create trigger customer_addresses_updated_at
before update on public.customer_addresses
for each row execute function public.handle_updated_at();

create trigger vendors_updated_at
before update on public.vendors
for each row execute function public.handle_updated_at();

create trigger platform_menu_categories_updated_at
before update on public.platform_menu_categories
for each row execute function public.handle_updated_at();

create trigger platform_menu_items_updated_at
before update on public.platform_menu_items
for each row execute function public.handle_updated_at();

create trigger bookings_updated_at
before update on public.bookings
for each row execute function public.handle_updated_at();

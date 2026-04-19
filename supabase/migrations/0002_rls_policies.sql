alter table public.profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_package_prices enable row level security;
alter table public.platform_menu_categories enable row level security;
alter table public.platform_menu_items enable row level security;
alter table public.platform_package_selection_counts enable row level security;
alter table public.platform_optional_addon_groups enable row level security;
alter table public.platform_optional_addons enable row level security;
alter table public.platform_water_pricing enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_menu_selections enable row level security;
alter table public.booking_optional_addons enable row level security;
alter table public.booking_activities enable row level security;
alter table public.notification_events enable row level security;

create policy "profiles self select"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles self update"
on public.profiles for update
using (auth.uid() = id);

create policy "customer addresses self access"
on public.customer_addresses for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "vendors public read"
on public.vendors for select
using (true);

create policy "vendor package public read"
on public.vendor_package_prices for select
using (true);

create policy "platform menu public read"
on public.platform_menu_categories for select
using (true);

create policy "platform menu items public read"
on public.platform_menu_items for select
using (true);

create policy "platform package counts public read"
on public.platform_package_selection_counts for select
using (true);

create policy "platform addon groups public read"
on public.platform_optional_addon_groups for select
using (true);

create policy "platform addons public read"
on public.platform_optional_addons for select
using (true);

create policy "platform water public read"
on public.platform_water_pricing for select
using (true);

create policy "bookings self access"
on public.bookings for select
using (auth.uid() = profile_id);

create policy "bookings self insert"
on public.bookings for insert
with check (auth.uid() = profile_id);

create policy "booking menu self access"
on public.booking_menu_selections for select
using (
  exists (
    select 1
    from public.bookings
    where bookings.id = booking_menu_selections.booking_id
      and bookings.profile_id = auth.uid()
  )
);

create policy "booking addons self access"
on public.booking_optional_addons for select
using (
  exists (
    select 1
    from public.bookings
    where bookings.id = booking_optional_addons.booking_id
      and bookings.profile_id = auth.uid()
  )
);

create policy "booking activity self access"
on public.booking_activities for select
using (
  exists (
    select 1
    from public.bookings
    where bookings.id = booking_activities.booking_id
      and bookings.profile_id = auth.uid()
  )
);

create policy "notification events self access"
on public.notification_events for select
using (
  exists (
    select 1
    from public.bookings
    where bookings.id = notification_events.booking_id
      and bookings.profile_id = auth.uid()
  )
);

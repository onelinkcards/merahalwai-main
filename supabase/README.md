## Supabase Setup

This folder contains paste-ready SQL scaffolding for the next backend phase.

Recommended order:

1. Run `/supabase/migrations/0001_core_schema.sql`
2. Run `/supabase/migrations/0002_rls_policies.sql`

Scope covered:

- Google-auth backed customer profiles
- Customer addresses
- Vendors
- Vendor package pricing
- Platform menu categories, items, package counts
- Optional add-ons and water pricing
- Bookings
- Booking menu selections
- Booking optional add-ons
- Booking activity log
- Notification events

Notes:

- Jaipur remains the default operating city in the current frontend flow.
- Vendor package prices are vendor-specific.
- Platform menu categories and add-on definitions are shared.
- This scaffold is intentionally clean and minimal for the next integration pass.

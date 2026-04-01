## Admin Panel — Complete Page & Component Map

Everything synced 1:1 with the customer flow. Every customer action has a matching admin view.

***

## Admin Identity & Access

```
URL: merahalwai.com/admin
Access: Email + Password only (no Google, no OTP)
Roles: Super Admin (you) · Operations Staff (view + update orders only)
Session: JWT, 8-hour auto-logout
After login: redirect to Dashboard
```

***

## Layout — Persistent on All Admin Pages

**Left Sidebar (fixed, 260px wide):**
```
🍛 MeraHalwai Admin
─────────────────────
📊 Dashboard
📋 Orders
🏪 Vendors
🍽️ Menu Manager
👥 Customers
🎟️ Coupons
📄 Invoices
⚙️ Settings
─────────────────────
👤 Admin Profile
🚪 Logout
```

- Active page: amber left border + tinted bg
- Sidebar collapses to icon-only on smaller screens
- Order badge on "Orders" link: red dot with pending count (live)

**Top Header Bar (right side):**
- Page title (changes per page)
- 🔔 Notifications bell with count
- Admin name + avatar

***

## Page 1 — Dashboard (`/admin`)

First thing you see every morning. **Command center.**

### Stat Cards Row (4 cards):
| Card | Value | Sub-info |
|---|---|---|
| 📋 Total Orders Today | 12 | ↑ 3 from yesterday |
| ⏳ Pending Confirmation | 4 | Needs action |
| ✅ Confirmed Bookings | 7 | This week |
| 💰 Revenue This Month | ₹8,40,000 | +22% vs last month |

### Pending Orders Alert Block
- Highlighted amber section at top: "4 orders need vendor confirmation"
- Mini order row for each: Order ID · Vendor · Date · Pax · Amount · "Take Action →"

### Recent Orders Table
- Columns: Order ID · Customer · Vendor · Event Type · Date · Pax · Package · Amount · Status · Action
- Status chips: 🟡 Pending · 🟠 Vendor Notified · 🟢 Confirmed · 🔵 Paid · ✅ Completed · 🔴 Cancelled
- "View All Orders →" link

### Revenue Chart
- Bar chart: daily bookings + revenue for last 14 days
- Toggle: Orders count / Revenue

### Top Vendors This Month
- Small table: Vendor name · Bookings · Revenue · Avg Rating

### Quick Actions Row
- [+ Add New Vendor] [📋 View Pending Orders] [🎟️ Create Coupon] [📊 Download Report]

***

## Page 2 — Orders (`/admin/orders`)

**Synced with:** Customer's My Bookings + success screen

The most-used admin page. Every customer booking lands here.

### Top Bar
- Search: by Order ID, customer name, phone, vendor
- Filters row:
  - Status dropdown: All / Pending / Vendor Notified / Confirmed / Paid / Completed / Cancelled
  - Date range picker
  - Vendor dropdown
  - Event type dropdown
  - Package filter: Bronze / Silver / Gold
- Export button: "📥 Download CSV"

### Orders Table (full width)
Columns:
- Order ID (clickable)
- Customer name + phone
- Vendor name
- Event type + date
- Pax + Package
- Total amount
- Booking date
- Status chip
- **Actions column:**
  - "View →" icon
  - Quick status update dropdown

### Pagination + "Showing 1–20 of 148 orders"

***

## Page 3 — Order Detail (`/admin/orders/[order-id]`)

**Synced with:** Customer's order detail + vendor confirmation link

The most powerful admin page. Every tool your team needs is here.

### Top Row
- ← Back to Orders
- Order #235893 heading
- Status chip (current status) + **Status Update Dropdown** (manually change status)
- Created: 28 Jan 2025 · 2:34 PM

***

### Section A — Customer Info Card
```
👤 Customer Details
─────────────────────────────────
Name:     Arushi Sharma
Phone:    +91 95XXXXXXXX  [📞 Call] [💬 WhatsApp]
Email:    arushi@merahalwai.com
WhatsApp: Same as phone ✓
```

***

### Section B — Event Details Card
```
🎉 Event Details
─────────────────────────────────
Event Type:  Wedding Anniversary
Date:        28 Jan 2025
Time:        7:30 PM
Venue:       643A, Sarita Vihar, Jaipur
Pincode:     302020
Guests:      300
Note:        "Please arrange live chaat counter"
```

***

### Section C — Vendor Assignment Card
```
🏪 Assigned Vendor
─────────────────────────────────
New Masala Gully
481A, Lapat Market, Jaipur
📞 +91 98XXXXXXXX
Package: Silver · ₹450/plate

Vendor Status: ⏳ Awaiting Confirmation
```

**4 Action Buttons (the heart of admin ops):**

| Button | What it does |
|---|---|
| 📄 Download Booking PDF | Generates full booking PDF instantly — vendor name, customer, date, menu, bill, note. Download or print. |
| 🔗 Copy Vendor Link | Generates unique URL `merahalwai.com/vendor-order/abc123` — one click copies to clipboard. Share on any channel. |
| 📲 Notify via WhatsApp | Opens WhatsApp with pre-filled message: *"New Booking! Order #235893 — 300 guests on 28 Jan. View details: [link]"* — clicks send manually |
| 📞 Call Vendor | Taps phone number — opens dialer on mobile, shows number on desktop |

***

### Section D — Full Menu Summary Card
```
🍽️ Selected Menu — Silver Package
─────────────────────────────────
Starters (10 items):
  🟢 Paneer Tikka · 🟢 Veg Manchurian · 🔴 Chicken Tikka...

Main Course (8 items):
  🟢 Dal Makhani · 🟢 Shahi Paneer · 🔴 Butter Chicken...

Breads (4 items):
  🟢 Tandoori Roti · 🟢 Naan...

Desserts (6 items):
  🟢 Gulab Jamun · 🟢 Kheer...

Rice (2 items):
  🟢 Jeera Rice · 🟢 Veg Biryani

Add-ons:
  🍦 Ice Cream × 300 pax = ₹9,000
  🥤 Mocktail × 300 pax = ₹6,000

Water: RO Water × 300 pax = ₹4,500
```

***

### Section E — Bill Breakdown Card
```
💰 Bill Summary
─────────────────────────────────
Base (₹450 × 300):       ₹1,35,000
Auto Add-ons (2 items):  ₹6,000
Ice Cream:               ₹9,000
Mocktail:                ₹6,000
Water:                   ₹4,500
─────────────────
Subtotal:                ₹1,60,500
GST 18%:                 ₹28,890
Convenience Fee:         ₹2,000
─────────────────
TOTAL:                   ₹1,91,390
Coupon Applied:          -₹4,000 (FLAT10)
─────────────────
FINAL TOTAL:             ₹1,87,390

Payment:  ⏳ Pending
Method:   Full Payment selected
```

***

### Section F — Order Timeline
```
📅 Order Activity Log
─────────────────────────────────
✅  28 Jan, 2:34 PM — Booking request submitted by customer
✅  28 Jan, 2:35 PM — WhatsApp confirmation sent to customer
⏳  28 Jan, 2:40 PM — Vendor notified via WhatsApp (link sent)
⬜  —  Vendor confirmed
⬜  —  Payment link sent to customer
⬜  —  Payment received
⬜  —  Invoice emailed to customer
```

***

### Section G — Admin Actions Footer
- "✅ Mark Vendor Confirmed" button → status updates, triggers customer email + invoice
- "❌ Cancel Booking" button → with reason dropdown + refund note
- "📤 Resend Invoice Email" button
- "🔄 Reassign Vendor" button → vendor dropdown to change assignment

***

## Page 4 — Vendor Confirmation Page (`/vendor-order/[token]`)

**This is NOT in admin sidebar — it's a public-facing link sent to vendor.**

The vendor opens this on their phone. No login needed (token-based access).

```
🍛 MeraHalwai — New Booking Request
─────────────────────────────────
Hello New Masala Gully!

You have a new booking request.
Please confirm your availability.

📅 Date:     28 January 2025 · 7:30 PM
👥 Guests:   300 people
📦 Package:  Silver (₹450/plate)
📍 Venue:    Sarita Vihar, Jaipur

SELECTED MENU:
[Full menu list exactly as customer chose]

Customer Note:
"Please arrange live chaat counter"

─────────────────────────────────
        [✅ I CONFIRM THIS BOOKING]
        [❌ I CANNOT DO THIS]
─────────────────────────────────
Questions? Call MeraHalwai: +91-XXXXXXXXXX
```

- Confirm click → status updates to "Vendor Confirmed" in admin panel
- Admin gets instant notification (dashboard badge + optional SMS/email)
- Customer automatically gets email with invoice PDF attached
- Decline click → admin gets alert to reassign vendor

***

## Page 5 — Vendors (`/admin/vendors`)

**Synced with:** Customer vendor cards + search results

### Top Bar
- Search by vendor name, area, cuisine
- Filter: Active / Inactive / All
- "+ Add New Vendor" button (primary, amber)

### Vendor List Table
Columns:
- Vendor photo thumbnail
- Vendor name
- Area / Location
- Cuisine type
- Menu type: Veg / Veg+NonVeg
- Packages configured: Bronze ✓ Silver ✓ Gold ✗
- Status: 🟢 Active / 🔴 Inactive
- Total bookings count
- Avg rating
- Actions: Edit · Configure Menu · Activate/Deactivate · View Orders

***

## Page 6 — Create / Edit Vendor (`/admin/vendors/new` or `/admin/vendors/[id]/edit`)

**The vendor onboarding form — admin fills this, not vendor.** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/2a6ad060-dfd5-4f9a-9612-fcbf5a119926/ADMIN-DRIVEN-VENDOR-MENU-BILLING-BACKEND-DOCUMENT-2-1.pdf)

### Section A — Business Information
- Vendor name
- Owner name
- Phone number
- Email
- WhatsApp number
- Full address
- City (Jaipur pre-filled)
- Pincode
- GST number
- FSSAI number + upload license
- Event specializations (multi-select checkboxes): Wedding · Birthday · Corporate · Satsang · All

### Section B — Photos & Gallery
- Profile/cover photo upload (drag & drop)
- Gallery photos upload (up to 12 images)
- Drag to reorder photos
- Preview grid

### Section C — Vendor Configuration
- Menu type: [🟢 Veg Only] [🟢🔴 Veg + Non-Veg]
- Pax slabs (multi-select buttons): [0–30] [30–50] [50–100] [100–150] [150–200] [200–250] [250–500] [500–1000] [1000+]
  - Note: selecting higher slab auto-selects all lower ones
- Short description (shown on vendor card + detail page)
- Long "About" text (shown on vendor detail page)
- Google rating (manual input for now)

### Section D — Bank Details
- Bank name · Account number · Account holder name · IFSC · Upload cancelled cheque

### Section E — Status
- Toggle: Active / Inactive
- Note: "Vendor only appears to customers when Active AND all packages configured"

***

## Page 7 — Menu Configurator (`/admin/vendors/[id]/menu`)

**Synced with:** Customer's menu builder — what admin sets here is exactly what customer sees

### Sub-tabs: [Bronze Package] [Silver Package] [Gold Package]

Each package tab contains:

**Package Settings:**
- Price per plate input (₹)
- Package enabled toggle
- Base item limit: shown as info (Bronze = 8, Silver = 12, Gold = 15 — set in system config)
- Max item limit: shown as info (Bronze = 12, Silver = 18, Gold = 25)

**Category + Item Manager:**

For each category (Starters / Main Course / Breads / Rice / Desserts / Drinks):
- Category header: name + enable/disable toggle
- Item list for this vendor under this category:
  - Checkbox: "Available in this package"
  - Item name
  - Veg/NonVeg dot
  - "Default (pre-selected)" toggle — items marked default appear checked for customer
  - "Auto Add-on price" input (₹/person) — used when customer exceeds base limit
- "+ Add Custom Item" button per category
- Reorder items by drag

**Item count indicator per package:**
"12 items configured · 8 marked as default (within base limit ✓)"

***

## Page 8 — Add-ons & Water Config (`/admin/vendors/[id]/addons`)

**Synced with:** Customer's "Extras & Add-ons" + Water section

### Optional Add-ons:
Table of add-ons for this vendor:
- Name · Veg/NonVeg · Price per pax · Enabled toggle · Delete
- "+ Add New Add-on" button
- Predefined list to pick from: Ice Cream · Falooda · Soft Drink · Mocktail · Extra Raita · Extra Papad · Custom

### Water Config:
- Water type: [RO Water] [Packaged Bottle] [Both options]
- Price input per pax/bottle
- Mandatory toggle: always included OR customer chooses

***

## Page 9 — Customers (`/admin/customers`)

**Synced with:** Customer login + My Bookings

### Customer List Table
Columns:
- Name + Phone + Email
- Auth method: Google / OTP
- Total bookings
- Total spend (₹)
- Last booking date
- Registered date
- "View Orders →" link

### Customer Detail Page (`/admin/customers/[id]`)
- Profile info (name, phone, email, addresses saved)
- Full booking history (same as My Bookings but admin view)
- Total lifetime spend
- "Send WhatsApp" button
- "Block User" option (edge cases)

***

## Page 10 — Coupons (`/admin/coupons`)

**Synced with:** Coupon field at checkout

### Coupon List Table
- Code · Discount type (flat / %) · Value · Min order value · Usage limit · Used count · Expiry · Status · Actions

### Create Coupon Form
- Coupon code (auto-generate or custom)
- Discount type: Flat Amount / Percentage
- Discount value
- Minimum order value
- Max discount cap (for %)
- Usage limit (total uses / per customer)
- Valid from / Valid till date range
- Applicable packages: All / Bronze only / Silver+ / Gold only
- Active / Inactive toggle

***

## Page 11 — Invoices (`/admin/invoices`)

**Synced with:** Customer invoice download + email

### Invoice List Table
- Invoice # · Order ID · Customer · Vendor · Amount · GST · Date · Payment status · Actions

### Per-Invoice Actions
- 👁 View (opens invoice preview)
- 📥 Download PDF
- 📧 Resend to customer email
- 📲 Send via WhatsApp

### Invoice Preview
Identical to what customer sees — MeraHalwai logo, order details, itemized menu, GST breakup, GSTIN, total

***

## Page 12 — Settings (`/admin/settings`)

**Global configuration — changes here reflect everywhere in the platform**

### Sub-sections:

**Billing Config:**
- GST rate: 18% (editable)
- Convenience fee: ₹2,000 (flat or %)
- Full payment discount: 10%
- Slot hold duration: 2 hours (editable)

**Payment Config:**
- Razorpay Key ID + Secret (masked)
- Split payment: advance % (default 50%)
- Refund policy text

**Notification Config:**
- WhatsApp Business number
- Booking confirmation message template (editable)
- Vendor notification message template (editable)
- Support WhatsApp number
- Support phone number

**Platform Config:**
- Default city: Jaipur
- Platform name: MeraHalwai
- Contact email
- Admin notification email (where new orders are emailed)

**Category Master:**
- Global food categories list (Starters, Main Course, Breads, Rice, Desserts, Drinks)
- Add / rename / reorder / hide categories
- These flow directly into Menu Configurator and customer Menu Builder

**Pax Slab Master:**
- Global slab definitions (0–30, 30–50, 50–100... etc.)
- Add new slab tier if needed

***

## Complete Admin Page Inventory

| Page | Route | Synced With (Customer) |
|---|---|---|
| Dashboard | `/admin` | All pages (aggregated) |
| Orders List | `/admin/orders` | My Bookings list |
| Order Detail | `/admin/orders/[id]` | Order detail + success screen |
| Vendor Confirm Link | `/vendor-order/[token]` | Slot hold screen (outcome) |
| Vendors List | `/admin/vendors` | Search results vendor cards |
| Create/Edit Vendor | `/admin/vendors/new` | Vendor detail page header |
| Menu Configurator | `/admin/vendors/[id]/menu` | Menu builder page |
| Add-ons & Water | `/admin/vendors/[id]/addons` | Extras + water section |
| Customers List | `/admin/customers` | Login + profile |
| Customer Detail | `/admin/customers/[id]` | My bookings |
| Coupons | `/admin/coupons` | Checkout coupon field |
| Invoices | `/admin/invoices` | Invoice download page |
| Settings | `/admin/settings` | Global — all pages |
| Admin Login | `/admin/login` | — |

**Total: 14 admin pages · 100% synced with 13 customer pages · zero gap between what customer sees and what admin controls.** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/2a6ad060-dfd5-4f9a-9612-fcbf5a119926/ADMIN-DRIVEN-VENDOR-MENU-BILLING-BACKEND-DOCUMENT-2-1.pdf)

***

Ready for Cursor prompts now — admin + customer both?
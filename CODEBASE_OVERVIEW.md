# MeraHalwai — Customer Web App: Codebase Overview

> **Jaipur's premium catering marketplace** — a full-stack Next.js 14 web app that lets customers discover, customize, and book verified halwais (caterers) online. Built for the Indian market, focused initially on Jaipur.

---

## 📦 Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR + client components |
| Language | **TypeScript** | Strict types throughout |
| Styling | **Tailwind CSS** | Utility-first, warm brown palette |
| State | **Zustand** | Single `bookingStore` + `toastStore` |
| Animations | **Framer Motion** | Page transitions, modals, accordion |
| Icons | **Lucide React** | Consistent icon set |
| Data | Static JSON in `data/` | Mock vendor data (no DB yet) |
| Auth | Cookie-based mock (`mh_auth=1`) | OTP flow in place, Google coming soon |

---

## 🗂️ Project Structure

```
merahaleai-web-app/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Homepage (/)
│   ├── caterers/                # /caterers — search & filter page
│   ├── caterer/[slug]/          # /caterer/:slug — vendor detail page
│   ├── book/                    # Booking flow (protected)
│   │   ├── customize/           # Step 1 — package + menu builder
│   │   ├── details/             # Step 2 — event & customer details
│   │   └── review/              # Step 3 — review before submit
│   ├── booking/
│   │   ├── confirm/             # Confirmation intermediate
│   │   ├── step1/ step2/ step3/ # Alternate routing stubs
│   │   └── success/             # /booking/success — slot held screen
│   ├── login/                   # /login — phone OTP + Google auth
│   │   └── otp/                 # /login/otp — OTP verification
│   ├── my-bookings/[orderId]/   # /my-bookings/:id — order detail
│   ├── invoice/[order-id]/      # /invoice/:id — invoice view
│   └── api/bookings/            # API routes (stub)
│
├── components/                  # Reusable UI components
│   ├── auth/
│   │   └── LoginModal.tsx       # Inline auth modal (from vendor page)
│   ├── book/
│   │   └── BookCustomizeClient.tsx  # Main menu builder UI
│   ├── booking/
│   │   ├── AddonCustomizeModal.tsx  # Add-on selection modal
│   │   └── VegDotInline.tsx         # Veg/Non-veg indicator dot
│   ├── caterer/
│   │   ├── CatererBookingSections.tsx  # Booking sections on detail page
│   │   ├── CatererMenuPreview.tsx      # Menu preview snippet
│   │   ├── MenuDrawer.tsx              # Full menu drawer/modal
│   │   ├── PackageSelector.tsx         # Bronze/Silver/Gold cards
│   │   ├── PhotoGallery.tsx            # Image gallery grid
│   │   └── ReviewsSection.tsx          # Customer reviews display
│   ├── caterers/
│   │   ├── FilterSidebar.tsx    # Left sidebar filters
│   │   └── VendorCard.tsx       # Vendor result card
│   ├── layout/
│   │   ├── Navbar.tsx           # Sticky top nav (auth-aware)
│   │   └── Footer.tsx           # Site footer
│   └── ui/
│       └── ToastHost.tsx        # Global toast notification
│
├── data/                        # Static mock data
│   ├── vendors.ts               # Full vendor data (4 vendors, packages, menus)
│   └── menuItemImages.ts        # Item name → Unsplash image URL map
│
├── lib/                         # Utility functions
│   ├── calculateBill.ts         # Bill computation (base + addons + GST + fee)
│   ├── bookingMenuHelpers.ts    # Default menu key helpers
│   ├── bookFormSchema.ts        # Zod validation schema for booking form
│   └── authCookie.ts            # Cookie read helper (`mh_auth`)
│
├── store/                       # Zustand state
│   ├── bookingStore.ts          # Full booking session state
│   └── toastStore.ts            # Toast notification state
│
└── middleware.ts                # Route protection (mh_auth cookie check)
```

---

## 🧭 Complete User Flow

```
Homepage (/)
   │
   ▼
[Search Caterers] or [Browse Event Type]
   │
   ▼
Caterers Page (/caterers)
  ├── Filter sidebar (event type, guests, budget, cuisine, rating)
  ├── Search bar (top) — event type + guests + cuisine dropdowns
  └── Vendor result cards (sorted by: popular / rating / price)
   │
   ▼
Vendor Detail Page (/caterer/[slug])
  ├── Hero image gallery (thumbnails + lightbox)
  ├── Vendor info (rating, cuisine, phone, FSSAI, GST)
  ├── Stats bar (rating / reviews / events / years)
  ├── Package cards (Bronze / Silver / Gold — scrollable)
  ├── Menu Highlights (preview of Silver package top items)
  ├── About section (expandable)
  ├── Events we cater (icon grid)
  ├── Why book us tiles
  ├── Customer reviews
  └── Sticky bottom: "Book Now" CTA
         │
         ├─── [Not logged in] → LoginModal appears inline
         │                         ↓
         │                    Login Page (/login)
         │                         ↓
         │                    OTP Page (/login/otp)
         │                         ↓
         │                    Sets mh_auth=1 cookie → redirect back
         │
         └─── [Logged in] → /book/customize?vendor=slug
   │
   ▼
Booking Step 1 — Customize (/book/customize)
  ├── Progress bar: [Customize → Details → Review → Done]
  ├── Guest count stepper (25 steps, slab presets: 50/100/150/200/300/500/750/1000)
  ├── Package selector (Bronze / Silver / Gold cards)
  ├── Menu builder (category accordions — collapsible)
  │     ├── Default items (locked, always included)
  │     ├── Optional items (up to base limit)
  │     └── Over-limit items → auto-tagged as "Add-ons at ₹40/pp"
  ├── Optional Add-ons grid (Ice Cream, Falooda, Mocktail etc.)
  ├── Water arrangement (RO / Packaged / None)
  └── Sticky bottom: selected package price + est. total + "Continue to Details"
   │
   ▼
Booking Step 2 — Details (/book/details)
  ├── Customer info: name, phone, email, WhatsApp
  ├── WhatsApp opt-in toggle
  └── Event info: event type, date, time, venue name, address, state, pincode
   │
   ▼
Booking Step 3 — Review (/book/review)
  ├── Full order summary (vendor, package, guests, items)
  ├── Bill breakdown (base + addons + GST 18% + convenience 2%)
  ├── Coupon code input
  └── "Confirm Booking Request" CTA
   │
   ▼
Booking Success (/booking/success)
  ├── Animated green checkmark
  ├── 2-hour countdown timer (slot hold)
  ├── Order ID (copyable)
  ├── Full summary card
  ├── "What Happens Next" timeline (4 steps)
  ├── View Invoice button → /invoice/:orderId
  ├── Track Booking → /my-bookings/:orderId
  └── Call Us / WhatsApp support links
```

---

## 🔐 Auth System

- **Cookie name:** `mh_auth=1`
- **Flow:** Phone number → OTP generated (stored in `sessionStorage`) → 6-digit verification → cookie set
- **Google auth:** UI present, shows "coming soon" toast (not wired)
- **Protected routes** (via `middleware.ts`):
  - `/book/customize`
  - `/book/details`
  - `/book/review`
  - `/booking/*`
  - `/invoice/*`
  - `/my-bookings/*`
- **Trigger:** On vendor detail page's "Book Now", if no cookie → `LoginModal` pops up inline

---

## 💰 Bill Calculation Logic (`lib/calculateBill.ts`)

```
baseAmount         = guestCount × pricePerPlate
addOnMenuTotal     = extra items beyond baseLimit × ₹40/pp per item
addOnExtrasTotal   = sum of (addon.pricePerPax × guestCount)
addOnTotal         = addOnMenuTotal + addOnExtrasTotal
preTax             = baseAmount + addOnTotal − couponDiscount
gstAmount          = preTax × 18%
convenienceFee     = preTax × 2%
grandTotal         = preTax + gstAmount + convenienceFee
```

---

## 🗃️ Zustand State (`store/bookingStore.ts`)

The booking store persists the full order session across page navigations:

| Field | Purpose |
|---|---|
| `vendorSlug / vendorName / vendorPhone / vendorImage` | Selected vendor identity |
| `selectedPackage` | `"bronze" \| "silver" \| "gold"` |
| `pricePerPlate` | Package price/plate |
| `selectedItems` | Array of `"Category::ItemName"` keys |
| `addOnItems` | Array of extra addon names |
| `guestCount / guestSlab` | Guest count + display label |
| `eventType / eventDate / eventTime` | Event details |
| `venueName / venueAddress / venueCity / venuePincode / venueState` | Venue |
| `customerName / phone / email / whatsapp / whatsappOptIn` | Customer info |
| `waterType` | `"ro" \| "packaged" \| "none"` |
| `couponCode / couponDiscount` | Discount state |
| `orderId / orderStatus / bookingTimestamp` | Post-submission state |
| `baseTotal / addOnTotal / gstAmount / convenienceFee / grandTotal` | Computed bill |
| `otpPhone` | OTP flow phone number |

---

## 🏪 Vendor Data (`data/vendors.ts`)

- **4 vendors** in the static dataset (all Jaipur-based)
- Each vendor has:
  - `slug`, `name`, `tagline`, `about`, `location`, `phone`
  - `isVeg`, `cuisines`, `eventTypes`, `specialisations`
  - `rating`, `reviewsCount`, `totalBookings`, `yearsActive`
  - `minPax / maxPax`, `priceVeg / priceNonVeg`
  - `fssaiNo`, `images[]`
  - `packages[]` → each package has `id`, `name`, `pricePerPlate`, `baseLimit`, `maxLimit`, `paxRange`, `categories[]`
  - Each category has `items[]` → `name`, `isVeg`, `isDefault`
  - `addons[]` → name + pricePerPax
  - `autoAddonPricing` → vegPerItemPerPax / nonVegPerItemPerPax
  - `reviews[]`

---

## 🎨 Design System

- **Primary color:** `#804226` (deep brown)
- **Accent:** `#DE903E` (amber orange)
- **Background:** `#FFFAF5` (warm cream)
- **Card bg:** `#FFFFFF`
- **Muted text:** `#8B7355`
- **Border:** `#E8D5B7`
- Fonts: Tailwind defaults (Inter-style)
- Veg indicator: FSSAI-standard green square with green dot
- Non-veg indicator: Red square with red dot

---

## 📄 Pages Built (Status)

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Built | Static hero, event tiles, trending vendors, cuisine grid, testimonials |
| `/caterers` | ✅ Built | Full filter + sort + search, animated vendor grid |
| `/caterer/[slug]` | ✅ Built | Gallery, packages, menu preview, reviews, lightbox |
| `/login` | ✅ Built | OTP flow wired, Google UI only |
| `/login/otp` | ✅ Built | 6-box OTP input, countdown, verify |
| `/book/customize` | ✅ Built | Package selector, guest count, full menu builder, addons, water |
| `/book/details` | 🔧 Stubbed | Page file exists (418 bytes placeholder) |
| `/book/review` | 🔧 Stubbed | Page file exists (418 bytes placeholder) |
| `/booking/success` | ✅ Built | Countdown timer, order summary, what-next timeline |
| `/my-bookings/[orderId]` | 🔧 Stubbed | Directory exists |
| `/invoice/[order-id]` | 🔧 Stubbed | Directory exists |

---

## 🔌 API Routes

- `app/api/bookings/` — directory exists, implementation pending (no DB connected yet)

---

## 📋 What's NOT Yet Built

Based on the original spec, these remain to be built:

1. **`/book/details`** — event details form (Step 2 of booking flow)
2. **`/book/review`** — order review + confirm screen (Step 3)
3. **`/my-bookings/[orderId]`** — full order tracking page
4. **`/invoice/[order-id]`** — downloadable invoice view
5. **Real auth** — Google OAuth + real OTP SMS integration (MSG91/Firebase)
6. **Database** — PostgreSQL + Prisma (currently all static mock data)
7. **API layer** — booking submission, order management endpoints
8. **Admin panel** — separate app/section (documented in `admin.md`)
9. **Payment integration** — Razorpay
10. **Email/WhatsApp notifications** — Resend + WhatsApp Business API
11. **PDF generation** — booking invoice PDF

---

## 📚 Reference Documents in Repo

| File | Contents |
|---|---|
| `merahalwaiinstructions.md` | Full system map — all flows, all roles, screen inventory (40 screens) |
| `customer side.md` | Detailed per-page UI spec for all 14 customer screens |
| `admin.md` | Complete admin panel spec — 14 pages, synced with customer flows |
| `tech stack to be used.md` | Stack decisions — Next.js 14, Prisma, PostgreSQL, NextAuth, Razorpay |

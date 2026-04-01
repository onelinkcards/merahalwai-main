# MeraHalwai — Complete User Flow Map

> Every screen, every transition, every state. This is the definitive flow document for the customer-facing web app.

---

## 🌐 Public Entry Points

```
merahalwai.com/              → Homepage
merahalwai.com/caterers      → Search Results
merahalwai.com/caterer/:slug → Vendor Detail
merahalwai.com/login         → Auth (redirected here when unauthed)
```

---

## 1️⃣ Homepage `/`

**Purpose:** Discovery + first impression

```
┌──────────────────────────────────────────────────────┐
│  [MeraHalwai Logo]  Caterers  Events  How It Works  [Book Now →]  │
├──────────────────────────────────────────────────────┤
│                  HERO IMAGE (food bg)                │
│         "Book Jaipur's Best Halwais. Instantly."     │
│  ┌──────────────────────────────────────────────┐    │
│  │ [Event ▾] | [Date 📅] | [Guests 👥] [Search] │    │
│  └──────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────┤
│  BROWSE BY EVENT TYPE  (horizontal scroll, 8 tiles)  │
│  Wedding · Birthday · Corporate · Satsang · etc.     │
├──────────────────────────────────────────────────────┤
│  TRENDING HALWAIS  (2-col grid, 4 vendors)           │
│  [Photo] Name · Location · Rating · Packages         │
├──────────────────────────────────────────────────────┤
│  CUSTOM PACKAGE CTA BANNER (full-width brown)        │
├──────────────────────────────────────────────────────┤
│  BROWSE BY CUISINE  (3-col grid)                     │
│  Rajasthani · Mughlai · Punjabi · South Indian       │
├──────────────────────────────────────────────────────┤
│  REAL STORIES (3 reel-style cards with play button)  │
├──────────────────────────────────────────────────────┤
│  FOOTER (4 columns: Company / Support / Partners)    │
└──────────────────────────────────────────────────────┘

CTA: "Book Now" → /caterers
CTA: "Search Caterers" → /caterers
Event tile click → /caterers (future: with filter pre-applied)
```

---

## 2️⃣ Caterers Page `/caterers`

**Purpose:** Browse, filter, and discover vendors

```
┌─────────────────────────────────────────────────────────────────┐
│  [Navbar]                                                       │
├─────────────────────────────────────────────────────────────────┤
│  TOP SEARCH BAR (sticky)                                        │
│  [Event Type ▾] | [Guests ▾] | [Cuisine ▾] | [Search 🔍] [Go] │
│  Dropdowns: animated Framer Motion pop-downs                    │
├─────────────────────────────────────────────────────────────────┤
│  RESULTS HEADER                                                 │
│  "Showing 4 verified caterers matching your preferences"        │
│  [Sort: Most Popular ▾]    [Active filter chips × × ×]         │
├──────────────────────────────┬──────────────────────────────────┤
│  FILTER SIDEBAR (desktop)    │  VENDOR CARDS GRID              │
│  ┌──────────────────────┐    │  ┌──────────────────────────┐   │
│  │ Rating: ★4+          │    │  │ [Food Photo]              │   │
│  │ Food: Veg / NonVeg   │    │  │ Veg 🟢  MH Verified badge │   │
│  │ Budget: ₹300-500     │    │  │ Vendor Name               │   │
│  │ Cuisine: North Indian│    │  │ ★4.9 (248) · C-Scheme     │   │
│  │ Event Type: Wedding  │    │  │ [Bronze ₹300] [Silver ₹450│   │
│  │ Guest Range: 200-500 │    │  │ [View Menu & Book →]      │   │
│  │ Specialisations      │    │  └──────────────────────────┘   │
│  └──────────────────────┘    │  (1 col mobile, 1 col desktop)  │
├──────────────────────────────┴──────────────────────────────────┤
│  MOBILE BOTTOM BAR  [Home] [Search] [Saved] [Filters]          │
└─────────────────────────────────────────────────────────────────┘

Filter logic (all client-side, useMemo):
  - minRating filter
  - foodPref (veg/nonveg)
  - budget ranges (under₹300 / ₹300-500 / ₹500-800 / ₹800+)
  - cuisine multi-select
  - eventType single-select
  - eventTypes multi-select
  - guestRange (0-50 / 50-100 / 100-200 / 200-500 / 500-1000 / 1000+)
  - specialisations multi-select
  - minPax ≤ guests ≤ maxPax
  - freetext search (name / location / cuisine / specialisation)

Sort: popular (by reviews count) / rating / price-low / price-high

Click "View Menu & Book" → /caterer/[slug]
```

---

## 3️⃣ Vendor Detail Page `/caterer/[slug]`

**Purpose:** Conversion — vendor info + trigger booking

```
┌──────────────────────────────────────────────────────┐
│  STICKY HEADER (transparent → white on scroll)       │
│  [← Back]  Vendor Name (fades in)  [Share] [❤️]     │
├──────────────────────────────────────────────────────┤
│  HERO IMAGE (280px–340px full width)                 │
│  [MH Verified] [📷 N Photos]                         │
│  Vendor Name + Location (bottom overlay)             │
│  ★ Rating (reviews count)                            │
│  Thumbnail strip (5 thumbnails + "+N more")          │
│  Click → fullscreen LIGHTBOX (swipe/nav support)     │
├──────────────────────────────────────────────────────┤
│  VENDOR INFO CARD                                    │
│  Name · tagline · Veg/NonVeg indicator               │
│  Cuisine tags                                        │
│  Phone · FSSAI badge                                 │
├──────────────────────────────────────────────────────┤
│  STATS BAR (dark bg)                                 │
│  Rating | Reviews | Events+ | X yrs                  │
├──────────────────────────────────────────────────────┤
│  PACKAGES (horizontal scroll)                        │
│  ● Bronze from ₹XXX/plate   ● Silver   ● Gold        │
├──────────────────────────────────────────────────────┤
│  MENU HIGHLIGHTS (top 3 categories × 3 items each)   │
│  "Customize your full menu after booking →"          │
├──────────────────────────────────────────────────────┤
│  ABOUT (line-clamp-3 + "Read more" toggle)           │
│  FSSAI + GST certification cards                     │
├──────────────────────────────────────────────────────┤
│  EVENTS WE CATER (3-col icon grid: 9 event types)   │
├──────────────────────────────────────────────────────┤
│  WHY BOOK US (2-col tiles: FSSAI / Events / Rating)  │
├──────────────────────────────────────────────────────┤
│  CUSTOMER REVIEWS (3 cards with stars)               │
├──────────────────────────────────────────────────────┤
│  STICKY BOTTOM: "from ₹XXX/plate"  [🍴 Book Now]    │
└──────────────────────────────────────────────────────┘

"Book Now" click:
  ├── mh_auth cookie missing → LoginModal opens (inline, not navigation)
  └── mh_auth cookie present → router.push("/book/customize?vendor=slug")
```

---

## 4️⃣ Auth Flow

### LoginModal (inline on vendor page)

```
┌─────────────────────────────────────────┐
│  "Login to Book [Vendor Name]"          │
│  Starting from ₹XXX/plate               │
│                                         │
│  [G  Continue with Google]  ← (demo)   │
│           ── or ──                      │
│  +91 [__________] [Send OTP →]         │
└─────────────────────────────────────────┘
```

### Login Page `/login`

Shown when middleware redirects unauthenticated user.

```
┌────────────────────────────────────────┐
│  🍴 MeraHalwai                         │
│  "Login to complete your booking"      │
│  [Context chip: Sharma Royal · ₹450]   │
│                                        │
│  [G  Continue with Google]             │
│           ── or ──                     │
│  Mobile Number: +91 [__________]       │
│  [Send OTP]                            │
│                                        │
│  By continuing, agree to Terms         │
└────────────────────────────────────────┘
```

### OTP Page `/login/otp`

```
┌────────────────────────────────────────┐
│  "Verify your number"                  │
│  Sent to +91 98765xxxxx                │
│  [_] [_] [_] [_] [_] [_]             │
│  Resend OTP in 0:45                    │
│  [Verify & Continue →]                 │
└────────────────────────────────────────┘

On success: sets mh_auth=1 cookie → redirects to stored ?redirect= URL
```

---

## 5️⃣ Booking Flow (Multi-step, Protected)

### Step 1: Customize `/book/customize?vendor=slug`

```
┌────────────────────────────────────────────────────────┐
│  PROGRESS: [1 Customize]──[2 Details]──[3 Review]──[4 Done] │
│  Vendor thumb + name + "Pick your package, guests & menu"  │
├────────────────────────────────────────────────────────┤
│  HOW MANY GUESTS?                                      │
│  [−] [100] [+]   Preset slabs: 50, 100, 150...        │
├────────────────────────────────────────────────────────┤
│  CHOOSE PACKAGE                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────┐ │
│  │ ● Bronze        │ │ ● Silver POPULAR│ │ ● Gold   │ │
│  │ ₹300/plate      │ │ ₹450/plate      │ │ ₹650/pl  │ │
│  │ Up to 12 dishes │ │ Up to 18 dishes │ │ Up to 25 │ │
│  │ [Select]        │ │ [✓ Selected]    │ │ [Select] │ │
│  └─────────────────┘ └─────────────────┘ └──────────┘ │
├────────────────────────────────────────────────────────┤
│  BUILD YOUR MENU (Silver · 8/18 dishes)  [Reset]      │
│  Progress bar: ████████░░░░ 44%                        │
│  ⚠️ "2 extra items as add-ons · +₹40/person each"     │
│                                                        │
│  ▼ Starters (3/4) ─────────────────────────────────── │
│  [✓] 🟢 [img] Paneer Tikka · "Smoky cottage cheese..."│
│  [✓] 🟢 [img] Veg Manchurian                          │
│  [  ] 🔴 [img] Chicken Tikka           [Add-on +₹40]  │
│                                                        │
│  ▼ Main Course  ▼ Breads  ▼ Desserts...               │
├────────────────────────────────────────────────────────┤
│  OPTIONAL ADD-ONS (2-col grid with toggle)             │
│  [🍦 Ice Cream +₹X/pp] [Falooda] [Mocktail] ...      │
├────────────────────────────────────────────────────────┤
│  WATER ARRANGEMENT                                     │
│  [💧 RO ₹15/pp]  [📦 Packaged ₹20/pp]  [None Free]   │
├────────────────────────────────────────────────────────┤
│  STICKY BOTTOM                                         │
│  ● Silver  ₹450/plate                                  │
│  Est. ₹67,500 for 150 guests         [→ Continue]     │
└────────────────────────────────────────────────────────┘

Validations:
  - guestCount ≥ 25 (shake animation + toast if not)
  - selectedItems.length > 0 (toast if not)
  
On Continue: syncStore() → router.push("/book/details")
```

### Step 2: Details `/book/details`

*(Page stubbed — 418 byte placeholder, to be built)*

```
┌────────────────────────────────────────────────────────┐
│  PROGRESS: [1 ✓]──[2 Details ●]──[3]──[4]            │
├────────────────────────────────────────────────────────┤
│  YOUR DETAILS                                          │
│  Full Name · Phone (+91) · Email · WhatsApp (auto)     │
│  [✓] Send updates on WhatsApp                          │
├────────────────────────────────────────────────────────┤
│  EVENT DETAILS                                         │
│  Event Type ▾ · Date 📅 · Time slot                   │
│  Venue Name · Full Address · Pincode                   │
│  Special Note (textarea)                               │
├────────────────────────────────────────────────────────┤
│  STICKY BOTTOM: [→ Review Order]                       │
└────────────────────────────────────────────────────────┘
```

### Step 3: Review `/book/review`

*(Page stubbed — 418 byte placeholder, to be built)*

```
┌────────────────────────────────────────────────────────┐
│  FULL ORDER SUMMARY (read-only)                        │
│  Vendor · Package · Guests · Menu items by category   │
├────────────────────────────────────────────────────────┤
│  BILL BREAKDOWN                                        │
│  Base (₹450 × 150):        ₹67,500                   │
│  Auto Add-ons (2 items):   ₹12,000                   │
│  Ice Cream:                ₹ 4,500                   │
│  Subtotal:                 ₹84,000                   │
│  GST 18%:                  ₹15,120                   │
│  Convenience 2%:           ₹ 1,680                   │
│  TOTAL:                    ₹1,00,800                  │
├────────────────────────────────────────────────────────┤
│  COUPON CODE: [_________] [Apply]                      │
│  🎟️ FLAT10 applied! −₹4,000                           │
├────────────────────────────────────────────────────────┤
│  🔒 No payment now. Slot held for 2 hrs after submit.  │
│  [✅ Confirm Booking Request]                          │
└────────────────────────────────────────────────────────┘

On Confirm: POST to API → set orderId in store → router.push("/booking/success")
```

---

## 6️⃣ Booking Success `/booking/success`

```
┌────────────────────────────────────────────────────────┐
│  PROGRESS: [1 ✓]──[2 ✓]──[3 ✓]──[4 Done ●]          │
├────────────────────────────────────────────────────────┤
│              ✅  (animated spring in)                  │
│         "Booking Request Sent!"                        │
│    "We'll call you within 30 minutes to confirm."     │
├────────────────────────────────────────────────────────┤
│  ⏱ Slot held for:  01:58:32  (live countdown)         │
├────────────────────────────────────────────────────────┤
│  ORDER SUMMARY CARD                                    │
│  Order ID: MH-ORD-XXXXX  [📋 copy]                    │
│  Vendor · Package · Event · Date · Guests              │
│  Venue · Total: ₹X,XX,XXX · Payment: 🟡 Pending       │
├────────────────────────────────────────────────────────┤
│  WHAT HAPPENS NEXT (timeline)                          │
│  ✅ Request Received                                   │
│  ⏳ Team Calls You (within 30 min on +91...)  ← pulse │
│  ○  Vendor Confirmed                                   │
│  ○  Payment Link Sent (WhatsApp + Email)              │
├────────────────────────────────────────────────────────┤
│  [📄 View Invoice]  [📦 Track Booking]                 │
│  [📞 Call Us]       [💬 WhatsApp]                     │
│  Go to Home ↩                                          │
└────────────────────────────────────────────────────────┘

Guard: if !store.orderId → router.replace("/caterers")
```

---

## 7️⃣ My Bookings `/my-bookings/[orderId]`

*(Directory structure created, page to be built)*

```
┌────────────────────────────────────────────────────────┐
│  ← Back  Order #MH-ORD-XXXXX                          │
│  Status: 🟡 Pending                                    │
├────────────────────────────────────────────────────────┤
│  STATUS TIMELINE                                       │
│  Requested → Confirmed → Paid → Completed              │
├────────────────────────────────────────────────────────┤
│  Vendor card                                           │
│  Full selected menu by category                        │
│  Complete bill breakdown                               │
│  Event details                                         │
│  Customer note                                         │
├────────────────────────────────────────────────────────┤
│  [📥 Download Invoice]  [📲 Share]  [❓ Need Help?]    │
│  [🚫 Cancel Booking] (only if status=pending)          │
└────────────────────────────────────────────────────────┘
```

---

## 8️⃣ Invoice `/invoice/[order-id]`

*(Directory structure created, page to be built)*

```
┌────────────────────────────────────────────────────────┐
│  🍛 MeraHalwai          TAX INVOICE                   │
│  Invoice #: MH-INV-XXXXX  Date: 28 Jan 2025           │
│  Order ID: MH-ORD-XXXXX                               │
├────────────────────────────────────────────────────────┤
│  CUSTOMER DETAILS    │  VENDOR DETAILS                 │
│  Arushi Sharma       │  New Masala Gully               │
│  +91 95XXXXXXXX      │  481A, Lapat Market             │
│  arushi@gmail.com    │  GSTIN: 08AABCU9603R1ZP         │
├────────────────────────────────────────────────────────┤
│  EVENT: Wedding Anniversary · 28 Jan 2025 · 7:30 PM   │
│  VENUE: 643A Sarita Vihar, Jaipur · 302020            │
│  GUESTS: 300 pax                                       │
├────────────────────────────────────────────────────────┤
│  ITEMIZED MENU TABLE                                   │
│  Category | Items | Count                              │
│  Starters | Paneer Tikka, Veg Manchurian... | 10      │
│  ...                                                   │
├────────────────────────────────────────────────────────┤
│  BILL TABLE                                            │
│  Base Amount:        ₹1,35,000                        │
│  Add-ons:            ₹  12,000                        │
│  GST @18%:           ₹  26,460                        │
│  Convenience @2%:    ₹   2,940                        │
│  TOTAL:              ₹1,76,400                        │
├────────────────────────────────────────────────────────┤
│  GSTIN: [Platform GST] · FSSAI Partner                 │
│  [📥 Download PDF]  [🖨️ Print]                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 State Handoff Between Pages

```
Vendor Detail Page
  └─ sets: vendorSlug, vendorName, vendorPhone, vendorImage
       ↓ (via bookingStore.setMany)
Book Customize
  └─ sets: selectedPackage, pricePerPlate, selectedItems,
           addOnItems, guestCount, guestSlab, waterType
       ↓ (via syncStore on "Continue")
Book Details  [TODO]
  └─ sets: customerName, customerPhone, customerEmail,
           customerWhatsapp, whatsappOptIn,
           eventType, eventDate, eventTime,
           venueName, venueAddress, venueCity, venuePincode
       ↓
Book Review  [TODO]
  └─ reads: full store for display
  └─ sets: couponCode, couponDiscount
  └─ submits: POST /api/bookings → gets orderId back
  └─ sets: orderId, orderStatus, bookingTimestamp,
           baseTotal, addOnTotal, gstAmount, grandTotal
       ↓
Booking Success
  └─ reads: orderId, vendorName, selectedPackage, grandTotal, etc.
  └─ displays: countdown timer (2hr slot hold)
       ↓
Invoice / My Bookings
  └─ reads: full store state
```

---

## 🛡️ Route Protection Matrix

| Route | Auth Required | Redirect If Not |
|---|---|---|
| `/` | No | — |
| `/caterers` | No | — |
| `/caterer/[slug]` | No | — |
| `/login` | No | — |
| `/book/customize` | ✅ Yes | `/login?redirect=/book/customize` |
| `/book/details` | ✅ Yes | `/login?redirect=/book/details` |
| `/book/review` | ✅ Yes | `/login?redirect=/book/review` |
| `/booking/*` | ✅ Yes | `/login?redirect=...` |
| `/invoice/*` | ✅ Yes | `/login?redirect=...` |
| `/my-bookings/*` | ✅ Yes | `/login?redirect=...` |

---

## 📱 Mobile Considerations

- Bottom navigation bar on `/caterers` (Home / Search / Saved / Filters)
- Sticky bottom booking CTAs on vendor detail + customize pages
- `env(safe-area-inset-bottom)` for iPhone home bar
- Filter sidebar hidden on mobile → bottom sheet drawer (via `mobileSortOpen` state)
- Lightbox supports touch swipe (touchstart/touchend delta tracking)
- All dropdowns/modals use Framer Motion for smooth animation

---

*Generated: March 2026 | Repo: `merahaleai-web-app`*

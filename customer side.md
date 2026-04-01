Now I have the full picture of Weddingz.in. It's literally just a **city directory + phone call funnel** — zero booking, zero menu, zero pricing, 100% "call us for 30% off" lead gen. Here's the complete MeraHalwai customer-side map — every page, every component, every flow.

***

## Weddingz.in — What They Do Wrong

| Problem | What You Do Better |
|---|---|
| Giant city dump on homepage — 100+ city links | One city (Jaipur), focused, purposeful |
| "Get Quote" everywhere — no real pricing | Per-plate pricing transparent from search results |
| No menu system at all | Full live menu builder per vendor |
| "Guided visits" model — offline | 100% online booking + confirmation |
| "Call us for 30% off" — feels like a bazaar | Fixed pricing, coupon codes, no negotiation |
| Wedding-only focus | 11 event types including corporate, birthday, satsang |
| Generic white/pink design, cluttered | Warm premium brown, food-first, minimal |
| No user account / booking history | Full profile, order history, invoice download |

***

## Complete Customer-Side Web App

### 🧭 Navigation System

**Sticky Top Navbar — always present on all pages**

```
[🍛 MeraHalwai]    Find Caterers   Events   How It Works   About        [My Bookings]  [Login]  [Book a Halwai →]
```

Components inside Navbar:
- Logo (icon + wordmark)
- Desktop nav links (5 items max)
- Auth state aware: shows "My Bookings" only when logged in
- Primary CTA button "Book a Halwai →" always visible
- Mobile: hamburger → full-screen slide drawer
- Scroll behaviour: transparent on hero, solid white after 80px scroll

**Footer — present on all public pages**
- Logo + one-line tagline
- 4 column links: Platform / Events / Company / Legal
- Trust badges: Razorpay Secured · GST Registered · FSSAI Partners
- Social icons
- Copyright
- "Made with ❤️ for Jaipur's Halwais"

***

## Page 1 — Homepage (`/`)

The single most important page. **Not a directory. An event booking engine.**

### Sections in order:

**① Hero Section**
- Full-bleed food photography background with dark overlay
- Small "verified platform" badge pill top of headline
- Headline: *"Book Jaipur's Best Halwais. Instantly."*
- Subheadline: transparent pricing, custom menus, secure payment
- **Master Search Bar Card** (the whole product entry point):
  - Event Type dropdown (11 options)
  - Date picker
  - Guests input (pax slider or +/- stepper)
  - Budget/plate dropdown
  - "Search Caterers →" CTA button
- Below search: 3 trust pills — "20+ Verified Halwais · ₹1.2L Avg Booking · Zero Haggling"

**② Trust Strip** (full-width, subtle bg)
- 4 trust stats side by side: Total Bookings · Verified Vendors · Cities · Happy Customers
- Animated counter on scroll

**③ How It Works** (4 horizontal steps)
- Step 1: Search by Event + Pax + Budget
- Step 2: Pick Package (Bronze/Silver/Gold)
- Step 3: Build Your Custom Menu
- Step 4: Request to Book — We handle the rest
- Each step: icon + title + one-line desc
- Visual connecting line between steps

**④ Browse by Event Type**
- Section title: "What's the Occasion?"
- 11 event type tiles in 4-col grid:
  🎂 Birthday · 💍 Anniversary · 👶 Baby Shower · 🏆 Retirement · 🏢 Corporate · 🥂 Get-Together · 💔 Break-Up Party · 🤝 Small Gathering · 💒 Wedding · 🙏 Satsang · ⚰️ Funeral Bhoj
- Each tile: emoji + name + "from X guests" hint
- Hover: border highlight + subtle lift
- Click: goes to `/caterers?event=birthday`

**⑤ Featured Vendors — "Trending in Jaipur"**
- Horizontal scroll row, 6 vendor cards
- Each card:
  - Food photo (180px height)
  - Veg/NonVeg badge top-left
  - "Popular" or "New Launch" badge top-right
  - Vendor name + cuisine tags
  - Star rating + event count
  - "from ₹300/plate · 100–800 guests"
  - "View Menu & Book →" button
- "View All Caterers →" link

**⑥ Browse by Cuisine**
- Horizontal pill row: Rajasthani · Mughlai · Punjabi · South Indian · Tea-Party · Multi-Cuisine
- Click filters search results

**⑦ Why MeraHalwai** (vs competitors implicitly)
- 3-column card grid:
  - 🍽️ Custom Menu Builder — choose exactly what you eat
  - 💰 No Hidden Charges — full bill before you pay
  - 🔒 Secure Split Payments — advance now, rest later
  - ⭐ Verified Halwais — audited, rated, reliable
  - 📞 Offline Confirmation — we call the caterer for you
  - 📄 Digital Invoice — download anytime

**⑧ Testimonials**
- 3 review cards with customer photo, name, event type, star rating, quote
- Google-style review widget look

**⑨ CTA Banner**
- Full-width warm brown bg
- "Ready to plan your event?" + "Search Caterers →" button

***

## Page 2 — Search Results (`/caterers`)

The discovery and filtering layer.

### Layout: Two-column desktop (280px sidebar + flex results), single column mobile

**Left Sidebar — Filters (sticky)**
- "Filters" heading + "Clear All" link
- Filter groups (each collapsible accordion):
  1. 📍 Location/Area — checkboxes (Vaishali Nagar, C-Scheme, Mansarovar, etc.)
  2. 🎉 Event Type — 11 checkboxes
  3. 📅 Date — date picker
  4. 👥 Guest Count — range slider 25–2000
  5. 💰 Budget (₹/plate) — range slider ₹200–₹1500
  6. 🟢 Menu Type — toggle: Veg Only / Veg+Non-Veg
  7. ⭐ Rating — 3★+ / 4★+ / 4.5★+
  8. 📦 Package Tier — Bronze / Silver / Gold checkboxes
- Mobile: hidden behind "⚙️ Filters" button → bottom sheet drawer

**Top Results Bar**
- "Showing 18 caterers for Wedding · Jaipur · 200 guests"
- Sort dropdown: Recommended / Price Low→High / Rating / Newest
- Active filter chips row (dismissible)

**Vendor Result Cards** (2-col grid desktop, 1-col mobile)

Each card (horizontal layout):
- Left: vendor food image (200×160px)
- Right:
  - Vendor name + Veg/NonVeg badge + "Popular" tag
  - Cuisine + Location area
  - Star rating + "(47 events)"
  - Package price chips: [Bronze ₹300] [Silver ₹450] [Gold ₹700]
  - Pax: "Serves 50–800 guests"
  - Event specialties: "Wedding · Birthday · Corporate"
  - "View Menu & Book →" CTA

**Empty State**
- Illustrated empty plate icon
- "No caterers found. Try adjusting your filters."
- Quick action: "Clear filters" or "Change event type"

**Loading State**
- 4 skeleton shimmer cards

***

## Page 3 — Pax Slab Modal (Overlay — not a page)

Triggered when clicking any vendor card. Blocks navigation until pax selected.

**Modal components:**
- Vendor name + thumbnail at top
- "How many guests are you serving?" heading
- Slab button grid: [0–30] [30–50] [50–100] [100–150] [150–200] [200–250] [250–500] [500–1000] [1000+]
- Selected slab: highlighted in brown fill
- "Continue to Menu →" CTA (disabled until selection)
- "← Back to search" ghost link

***

## Page 4 — Vendor Detail + Menu Builder (`/caterer/[slug]`)

The **conversion engine** — most complex, most critical page.

### Section A: Vendor Gallery Header
- Main image (large, 60% width, 400px height)
- 2×2 image grid right side
- "View All Photos +12" overlay on last cell
- Click → fullscreen lightbox gallery (prev/next/close, keyboard support)

### Section B: Vendor Info + Sticky Bill Card (2-col)

**Left — Vendor Info:**
- Vendor name (large, Playfair Display)
- Rating stars + review count + "✓ Verified" green badge
- Cuisine tags + Event type tags
- 📍 Address · 🟢 Veg & Non-Veg indicator
- Short description paragraph
- "About this Halwai" expandable section with full story
- Past event photos mini strip (horizontal scroll, 6 photos)
- Reviews section:
  - Average rating with bar chart (5★/4★/3★ distribution)
  - 3 review cards: name, date, event type, star rating, quote
  - "View all reviews →"

**Right — Sticky Bill Card:**
- Currently selected package name + per-plate price (large)
- Pax selected
- Item counter: "8/12 items selected"
- Add-on items count
- Estimated total (live, updates as menu changes)
- "Proceed to Book →" CTA (disabled until package + minimum items selected)
- "🔒 No payment now — slot held for 2 hrs after request"

### Section C: Package Selector

3 package cards side by side (Bronze / Silver / Gold):
- Package name + price/plate (hero number)
- Pax range
- Item count per category (Starters X · Mains X · Desserts X)
- 3 highlight bullets
- "Select" button
- Selected state: amber border + checkmark + bg tint

### Section D: Menu Builder

Shown after package selected.

- Header: "Build Your Menu" + item counter chip + reset link
- Category accordions (one per category — Starters, Main Course, Breads, Rice, Desserts, Drinks):
  - Category header: name + "6 of 10 selected" counter + expand chevron
  - Items grid (2-col desktop, 1-col mobile):
    - Custom checkbox (brown)
    - 🟢/🔴 veg dot
    - Item name
    - "Default" green pill if pre-selected
    - "Add-on +₹40/person" amber pill if exceeds limit
  - Limit exceeded warning banner: "⚠️ 2 extra items auto-tagged as add-ons"

### Section E: Optional Add-ons

Toggle cards row: Ice Cream · Falooda · Soft Drink · Mocktail · Extra Raita · Extra Papad
- Each: name + "₹X/person" + toggle
- Toggled ON: amber border + tinted bg

### Section F: Water Selection

Radio cards: [RO Water ₹15/person] [Packaged Bottle ₹20/bottle]

### Section G: Note for Caterer

Textarea with char counter. "Any special requests, dietary needs, live station requests..."

***

## Page 5 — Login / Auth (`/login`)

Triggered when unauthenticated user clicks "Request to Book."

**Two auth options (clean, minimal):**
- "Continue with Google" — primary, large button with Google logo
- Divider "OR"
- "Continue with Mobile OTP":
  - Phone number input (+91 prefix)
  - "Send OTP →" button
  - 6-digit OTP input boxes (separate boxes, auto-focus)
  - "Resend OTP in 0:45" countdown
- Post-auth: redirect back to where user was

No password. No email+password form. Ever.

***

## Page 6 — Event Details Form (`/book`)

Two-column: Form left (55%), Order Summary right (45% sticky)

**Left — Form:**
- Section 1 — Your Details: Name, Phone (+91), Email, WhatsApp number (auto-fill or separate)
- WhatsApp opt-in toggle (default ON): "Send booking updates & payment link on WhatsApp ✅"
- Section 2 — Event Details: Date, Time slot, Full venue address, Pincode
- Section 3 — Confirmation: Read-only package + pax chips, editable caterer note
- "Request to Book →" CTA (large, full-width, amber)
- Below CTA: "🔒 No payment right now. We confirm with the caterer first."

**Right — Live Order Summary (sticky):**
- Vendor thumbnail + name
- Package · Guests · ₹/plate
- Collapsible menu summary (Starters: X items, Mains: X items...)
- Bill breakdown:
  - Base total
  - Auto add-ons
  - Optional extras
  - Water
  - GST 18%
  - Convenience fee
  - **TOTAL (bold, amber)**
- Coupon code input + Apply button
- Coupon applied state: green "FLAT10 applied! -₹4,000"

***

## Page 7 — Slot Hold / Success (`/booking/success`)

Centered layout, max-width 600px.

**Components:**
- Animated green checkmark (draws in on load)
- "Your Slot is Reserved! 🎉" headline
- Vendor + date + pax summary line
- **2-hour countdown timer pill** (live countdown): "⏱ Slot held for: 1:58:32"
- Order Summary Card:
  - Order ID (with copy button)
  - Vendor, Package, Guests, Date, Venue, Total, Payment: Pending
- "What happens next" 3-step timeline:
  - ✅ Booking request received
  - ⏳ Our team calls you within 30 min (pulsing dot)
  - ⬜ Payment link sent via WhatsApp + Email
- 3 action buttons: [📞 Call Us] [💬 WhatsApp] [🏠 Go Home]
- "Invoice will be emailed after payment" note

***

## Page 8 — My Bookings (`/my-bookings`)

Auth-protected.

**Layout:** Profile sidebar left (desktop) + bookings content right

**Profile Sidebar:**
- Avatar + Name + Phone/Email
- Navigation: My Bookings (active) · Address Book · Settings · Logout

**Bookings Content:**
- Tabs: [All] [Active] [Completed] [Cancelled]
- Each Booking Card:
  - Vendor thumbnail + name + package
  - Event date · Venue city · Guest count
  - Menu summary chips: "6 Snacks · 8 Mains · 3 Desserts"
  - Status badge: 🟡 Pending · 🔵 Active · ✅ Completed · 🔴 Cancelled
  - Total amount
  - Actions: "View Details →" · "Download Invoice" · "Need Help?"

***

## Page 9 — Order Detail (`/my-bookings/[order-id]`)

Full booking detail view for customer.

**Components:**
- Back button + Order ID heading
- Status timeline (horizontal): Requested → Confirmed → Paid → Completed
- Vendor card: photo, name, contact (masked: +91 98XXXXX234)
- Full selected menu list by category
- Complete bill breakdown (same as checkout summary)
- Event details: date, time, venue address
- Customer note shown
- Actions:
  - "Download Invoice" (only after payment)
  - "Share on WhatsApp"
  - "Need Help?" → WhatsApp support
  - "Cancel Booking" (if status = pending, with policy note)

***

## Page 10 — Invoice Page (`/invoice/[order-id]`)

Clean printable/downloadable invoice view.

**Components:**
- MeraHalwai logo + "Tax Invoice" header
- Invoice number, date, Order ID
- Customer details block
- Vendor details block
- Itemized menu table (category, items, count)
- Add-ons table
- Bill summary table with GST breakup
- Total in large bold
- "Download PDF" button
- "Print" button
- GSTIN, platform details footer

***

## Page 11 — How It Works (`/how-it-works`)

Static explainer page.

- Hero: "Booking a Halwai has never been this simple"
- Large 4-step visual flow (illustrated, not just icons)
- FAQ accordion (10 questions): pricing, cancellation, payment, vendor quality, GST etc.
- Bottom CTA: "Start Searching →"

***

## Page 12 — Event Landing Pages (`/events/[type]`)

11 SEO pages, same template, different content.

Example: `/events/birthday-party`

**Components:**
- Hero: "Book Catering for Birthday Parties in Jaipur"
- Quick search bar (pre-filled with event type)
- "Why MeraHalwai for Birthdays" 3-point section
- Pre-filtered vendor list (6 cards)
- Related event types (cross-links)
- FAQ specific to birthday catering
- Meta title/description optimised for Google

***

## Page 13 — About (`/about`)

- Mission statement
- The problem we solve (story format)
- How it works for vendors (brief, customer-facing)
- Team section (founders)
- Press mentions (if any)
- "Join as a Vendor" CTA → leads to vendor inquiry form (not full onboarding — just a lead form, since onboarding is admin-driven) [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/2a6ad060-dfd5-4f9a-9612-fcbf5a119926/ADMIN-DRIVEN-VENDOR-MENU-BILLING-BACKEND-DOCUMENT-2-1.pdf)

***

## Page 14 — 404 Error Page

- Branded: bowl emoji + "Oops! This page is missing like dal without tadka."
- Search bar + "Go Home" button

***

## Complete Page + Component Inventory

| Page | Route | Auth | Priority |
|---|---|---|---|
| Homepage | `/` | Public | P0 |
| Search Results | `/caterers` | Public | P0 |
| Vendor Detail + Menu Builder | `/caterer/[slug]` | Public | P0 |
| Login / OTP | `/login` | Public | P0 |
| Event Details Form | `/book` | Protected | P0 |
| Slot Hold Screen | `/booking/success` | Protected | P0 |
| My Bookings | `/my-bookings` | Protected | P1 |
| Order Detail | `/my-bookings/[id]` | Protected | P1 |
| Invoice | `/invoice/[id]` | Protected | P1 |
| How It Works | `/how-it-works` | Public | P1 |
| Event Landing Pages ×11 | `/events/[type]` | Public | P2 |
| About | `/about` | Public | P2 |
| 404 | `*` | Public | P2 |

**Total: 13 unique page templates · 23 total routes · ~40 unique screen states** — every screen has one job, zero fluff, infinitely better than Weddingz.in's 100-city dump.

***

Ready to now go into **Admin Panel pages** with same detail, or should we start the **Cursor build prompts page by page**?

# MeraHalwai — What's Built vs. What's Next

> A quick-reference status board for the development team.

---

## ✅ Fully Built (Production-Ready UI)

### Pages
| Page | Route | Quality |
|---|---|---|
| Homepage | `/` | ✅ Complete — hero, event tiles, trending vendors, cuisine grid, testimonials, footer |
| Caterers / Search | `/caterers` | ✅ Complete — full filter sidebar, search bar, sort, chips, mobile bottom nav |
| Vendor Detail | `/caterer/[slug]` | ✅ Complete — gallery, lightbox, packages, menu preview, reviews, auth-aware CTA |
| Login | `/login` | ✅ Complete — OTP flow wired, Google UI present (not wired) |
| OTP Verification | `/login/otp` | ✅ Complete — 6-box input, countdown, verify |
| Book: Customize | `/book/customize` | ✅ Complete — guests, package, menu builder, addons, water, live bill estimate |
| Booking Success | `/booking/success` | ✅ Complete — countdown timer, order summary, what-next timeline |

### Components
| Component | Status |
|---|---|
| `Navbar` | ✅ Auth-aware, sticky, mobile hamburger |
| `Footer` | ✅ Built |
| `VendorCard` | ✅ Full card with photo, rating, packages |
| `FilterSidebar` | ✅ Desktop sticky sidebar |
| `LoginModal` | ✅ Inline vendor-page auth modal |
| `BookCustomizeClient` | ✅ Full menu builder (600+ lines) |
| `CatererDetailClient` | ✅ Full vendor detail (600+ lines) |
| `ToastHost` | ✅ Global toast system |

### Core Logic
| Module | Status |
|---|---|
| `calculateBill.ts` | ✅ Base + auto-addons + extras + GST + convenience fee |
| `bookingStore.ts` | ✅ Full Zustand store (30+ fields) |
| `middleware.ts` | ✅ Route protection via `mh_auth` cookie |
| `authCookie.ts` | ✅ Cookie read helper |
| `bookingMenuHelpers.ts` | ✅ Default menu key computation |
| `vendors.ts` | ✅ Static mock data for 4 vendors |
| `menuItemImages.ts` | ✅ Item name → image URL map |

---

## 🔧 Partially Built (Stubbed — Routes Exist, Pages Empty)

| Page | Route | What's Needed |
|---|---|---|
| Book: Details | `/book/details` | Customer info form + event details form |
| Book: Review | `/book/review` | Full order review + bill + coupon + confirm CTA |
| My Bookings: Detail | `/my-bookings/[orderId]` | Order tracking with status timeline |
| Invoice | `/invoice/[order-id]` | Printable invoice view |

---

## ❌ Not Yet Built

### Backend / API
- [ ] `POST /api/bookings` — create booking, return orderId
- [ ] `GET /api/bookings/[id]` — fetch order detail
- [ ] Database schema (PostgreSQL + Prisma)
- [ ] Real vendor data ingestion

### Auth
- [ ] Google OAuth (NextAuth.js)
- [ ] Real OTP via SMS (MSG91 or Firebase SMS)
- [ ] User session persistence (JWT / DB session)
- [ ] User profile page
- [ ] Address book

### Integrations
- [ ] Razorpay payment gateway
- [ ] WhatsApp Business API (vendor notifications)
- [ ] Resend (email: booking confirmation + invoice)
- [ ] PDF generation (`@react-pdf/renderer`)

### Pages / Features
- [ ] "My Bookings" list page (`/my-bookings`)
- [ ] How It Works page (`/how-it-works`)
- [ ] About page (`/about`)
- [ ] Event landing pages (`/events/[type]` × 11)
- [ ] 404 branded error page
- [ ] Admin panel (separate build — see `admin.md`)
- [ ] Vendor confirmation link (`/vendor-order/[token]`)
- [ ] Coupon system (API + validation)

### Data
- [ ] Real vendor content (photos, menus, pricing)
- [ ] Dynamic menu configuration (admin-controlled)

---

## 🎯 Recommended Build Order (Next Steps)

```
Priority 1 (Complete the booking funnel):
  1. /book/details  — form UI + store sync
  2. /book/review   — summary + coupon + submit
  3. POST /api/bookings — mock endpoint → sets orderId

Priority 2 (Complete post-booking):
  4. /my-bookings   — order list page
  5. /my-bookings/[id] — order detail + tracking
  6. /invoice/[id]  — invoice view + print

Priority 3 (Real data + auth):
  7. Database schema (Prisma)
  8. Real auth (NextAuth — Google + OTP)
  9. Vendor CMS / admin seeding

Priority 4 (Monetization):
  10. Razorpay payment integration
  11. WhatsApp Business API
  12. Email (Resend)
  13. PDF invoice

Priority 5 (SEO + growth):
  14. /events/[type] landing pages (11 pages)
  15. /how-it-works
  16. /about
```

---

## 📊 Build Progress

```
Pages:     7 / 13 built  (54%)
Components: ~15 / 20     (75%)
Backend:    0 / 8        (0%)
Auth:       mock only    (20%)
Integrations: 0          (0%)

Overall:   ~35% production-ready
```

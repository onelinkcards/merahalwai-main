Here's the complete system map for MeraHalwai — every flow, every screen, every role. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/44f46930-f576-4e47-89ae-5a3ee551449b/MERAHALWAI-FINAL-SYSTEM-MENU-PRICING-FLOW.pdf)

***
## 🎯 Target Event Types (Complete List)
These 11 event types drive your search filters, SEO landing pages, and vendor specialization tags: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/44f46930-f576-4e47-89ae-5a3ee551449b/MERAHALWAI-FINAL-SYSTEM-MENU-PRICING-FLOW.pdf)

- 🎂 Birthday Party (kids + adults)
- 💍 Wedding Anniversary
- 👶 Baby Shower
- 🏆 Retirement Party
- 🏢 Corporate Event / Office Party
- 🥂 Get-Together / Friends Party
- 💔 Break-Up Party *(niche but viral — keep it, good marketing)*
- 🤝 Small Gathering (25–75 pax)
- 🎊 Wedding (full-scale)
- 🙏 Satsang / Pooja
- ⚰️ Funeral / Bhoj

***
## Customer Flow (Full)
Every step above has one screen. This gives you **14 customer-side screens** cleanly. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/44f46930-f576-4e47-89ae-5a3ee551449b/MERAHALWAI-FINAL-SYSTEM-MENU-PRICING-FLOW.pdf)

***
## Admin → Vendor Confirmation Flow
This is the **heart of V1 operations** — your team's daily workflow. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/2a6ad060-dfd5-4f9a-9612-fcbf5a119926/ADMIN-DRIVEN-VENDOR-MENU-BILLING-BACKEND-DOCUMENT-2-1.pdf)

***
## Complete Screen Inventory (40+ Screens)
### 🟤 Customer-Facing (22 screens)
| # | Screen | Key Action |
|---|---|---|
| 1 | Homepage | Search entry, event type tiles, featured vendors |
| 2 | Search Results | Filter sidebar + vendor cards grid |
| 3 | Pax Slab Modal | Guest count selection popup |
| 4 | Vendor Detail Page | Photos, rating, cuisine, event tags |
| 5 | Package Selector | Bronze / Silver / Gold cards |
| 6 | Menu Builder | Category checkboxes + auto add-on logic |
| 7 | Add-ons & Water | Per-pax extras toggle |
| 8 | Live Bill Sidebar | Running total, GST, breakdown |
| 9 | Login Prompt (if not logged in) | Google Auth / OTP |
| 10 | OTP Verification Screen | 6-digit OTP |
| 11 | Event Details Form | Name, phone, address, event date, WhatsApp opt-in |
| 12 | Booking Summary Review | Full read-only summary before submit |
| 13 | 🎉 Slot on Hold Screen | Order ID, 2-hr hold, "what happens next" |
| 14 | My Bookings List | All orders with status chips |
| 15 | Order Detail Page (User) | Full booking, menu, bill, timeline |
| 16 | User Profile Page | Edit name, phone, address book |
| 17 | Address Book | Saved event addresses |
| 18 | How It Works | 4-step explainer |
| 19 | About MeraHalwai | Story, mission, team |
| 20 | Event Type Landing Page | `/events/birthday-party` SEO page × 11 types |
| 21 | Invoice Download Screen | PDF view before download |
| 22 | 404 / Error Page | Branded error |

***
### ⚙️ Admin Panel (18 screens)
| # | Screen | Key Action |
|---|---|---|
| 1 | Admin Login | Secure email + password |
| 2 | Dashboard | Orders today, revenue, pending, confirmed |
| 3 | Order List | All orders, filterable by status/date/vendor |
| 4 | **Order Detail Page** | Full menu, bill, customer note, vendor actions |
| 5 | ↳ Download PDF | Booking PDF auto-generated with all details |
| 6 | ↳ WhatsApp Notify Button | Pre-filled message sent to vendor via WhatsApp API |
| 7 | ↳ Call Vendor Button | Opens phone dialer with vendor number |
| 8 | ↳ Share Vendor Link | Unique URL `merahalwai.com/vendor-order/[id]` copied |
| 9 | Vendor Confirmation Page (vendor opens link) | Sees full booking, clicks ✅ Confirm or ❌ Decline |
| 10 | Vendor List | All vendors, status active/inactive |
| 11 | Create / Edit Vendor | Full vendor form |
| 12 | Menu Configurator | Packages, categories, items per vendor |
| 13 | Add-ons & Water Config | Per vendor extras setup |
| 14 | Pax Slab Config | Global slab selection per vendor |
| 15 | Coupon Manager | Create / expire discount codes |
| 16 | User Management | Customer list, order history |
| 17 | Settings | GST rate, convenience fee, hold duration, city config |
| 18 | Invoice Manager | View / resend invoices |

***
## 🔐 Auth System: Google + OTP
**Best approach: Offer both, make Google default** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/47e850ce-7c82-4d0f-becd-b27fac41efb4/FINAL-VENDOR-ONBOARDING-CUSTOMER-MENU-SYSTEM-1.pdf)

```
[Continue with Google]     ← Primary CTA (80% users will use this)
        OR
[Enter Mobile Number → OTP]  ← Fallback for non-Google users
```

- Google Auth: Firebase Auth or NextAuth.js — zero friction, instant
- Mobile OTP: Firebase Auth SMS or MSG91 — for users without Gmail
- After login: User profile auto-created with name + email from Google, or phone from OTP
- **No password system** — ever. Passwords = drop-off.

***
## 📄 Booking PDF (What goes in it)
When admin clicks "Download PDF" or shares with vendor, the PDF contains: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/44018720/2a6ad060-dfd5-4f9a-9612-fcbf5a119926/ADMIN-DRIVEN-VENDOR-MENU-BILLING-BACKEND-DOCUMENT-2-1.pdf)

```
┌─────────────────────────────────────┐
│   🍛 MERAHALWAI — Booking Details   │
│   Order ID: #235893                 │
├─────────────────────────────────────┤
│ Customer: Arushi Sharma             │
│ Phone: +91 95XXXXXXXX               │
│ Event: Wedding Anniversary          │
│ Date: 28 Jan 2025 · 7:30 PM         │
│ Venue: 643A, Sarita Vihar, Jaipur   │
│ Guests: 300 pax                     │
├─────────────────────────────────────┤
│ Vendor: New Masala Gully            │
│ Package: Silver (₹450/plate)        │
├─────────────────────────────────────┤
│ MENU SELECTED:                      │
│ Starters (10): Paneer Tikka...      │
│ Main Course (8): Dal Makhani...     │
│ Desserts (6): Gulab Jamun...        │
│ Add-ons: Ice Cream × 300 = ₹9,000  │
│ Water: RO × 300 = ₹3,000           │
├─────────────────────────────────────┤
│ Base Total:        ₹1,35,000        │
│ Add-ons:           ₹12,000          │
│ GST 18%:           ₹26,460          │
│ Convenience Fee:   ₹2,000           │
│ TOTAL:             ₹1,75,460        │
├─────────────────────────────────────┤
│ Customer Note: "Please arrange      │
│ live chaat counter"                 │
└─────────────────────────────────────┘
```

***
## 📧 What Customer Gets — Email Sequence
| Trigger | Email Content |
|---|---|
| Booking request submitted | "Slot Reserved · Order #235893 · Our team will call within 30 min" |
| Vendor confirmed | **Invoice PDF** attached + full order details + "Your event is secured!" |
| Payment done | Final receipt + event countdown |

***

**Total: 40 screens, 3 user roles (Customer · Admin · Vendor link-only), clean auth, PDF generation, WhatsApp notify, email invoicing** — all production-ready V1. Want me to now write the exact wireframe layout spec for each screen group?
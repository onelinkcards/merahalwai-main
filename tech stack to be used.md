## MD File Name

```
merahalwai-cursor-build-system.md
```

Clean, specific, findable. Agar aur files banao toh:
- `merahalwai-admin-prompts.md`
- `merahalwai-design-tokens.md`
- `merahalwai-db-schema.md`

***

## Complete Tech Stack

### Frontend
| What | Tool | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR for SEO, API routes built-in, best for marketplaces |
| Language | **TypeScript** | Zero runtime bugs, autocomplete, production standard |
| Styling | **Tailwind CSS** | Fast, consistent, no CSS file mess |
| Components | **Shadcn/ui** | Copy-paste components, fully customisable, not a locked library |
| Icons | **Lucide React** | Clean, consistent, tree-shakeable |
| Animations | **Framer Motion** | Micro-animations only — checkmark, modals, transitions |
| Forms | **React Hook Form + Zod** | Validation + type-safe forms, no bloat |
| State | **Zustand** | Lightweight global state — cart/menu builder state |
| HTTP Client | **Axios** | Cleaner than fetch for API calls with interceptors |

### Backend
| What | Tool | Why |
|---|---|---|
| API | **Next.js API Routes** (built-in) | No separate server needed, same codebase |
| ORM | **Prisma** | Type-safe DB queries, migrations, schema as code |
| PDF Generation | **Puppeteer or @react-pdf/renderer** | Booking PDF for admin + customer invoice |
| Email | **Resend** | Best modern email API, free tier 3000 emails/month, simple SDK |
| Payments | **Razorpay** | Already decided, Node SDK available |
| WhatsApp | **WhatsApp Business API (Meta)** or **Interakt/WATI** | For sending booking notifications to vendor |

### Database
**PostgreSQL** — on your own server

```
Why PostgreSQL:
- Relational — perfect for orders, vendors, menus, packages (all linked data)
- Handles complex queries like "show vendors supporting 200 pax + silver package + Jaipur"
- Prisma ORM supports it natively
- Free, open source, runs on your VPS easily
- Battle tested — Supabase, Vercel all use Postgres under the hood
- JSON column support for flexible menu item storage if needed

How to install on your server:
sudo apt install postgresql postgresql-contrib
```

**Self-hosted on your VPS** = full control, no cloud DB bill, Prisma connects via `DATABASE_URL` in `.env`

***

## Auth — Simple, Best, No WhatsApp OTP

**Use: NextAuth.js v5 (Auth.js)**

```
Why NextAuth:
- Built for Next.js — zero friction setup
- Google OAuth in 10 lines of code
- Session management, JWT, callbacks — all handled
- Free forever
- Works with your own Postgres DB (stores users/sessions in your DB via Prisma adapter)
```

### Auth Flow — Keep it simple:

```
Option 1 (Primary):    [Continue with Google]   ← 80% users
Option 2 (Fallback):   [Email → Magic Link]      ← No OTP, no WhatsApp, no password
```

**Magic Link** = user enters email → gets a login link in inbox → clicks → logged in. Zero password, zero OTP complexity, zero third-party SMS cost.

Setup:
```
npm install next-auth @auth/prisma-adapter
```

`.env` needs only:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=           # random string
DATABASE_URL=          # your postgres URL
RESEND_API_KEY=        # for magic link emails
```

***

## Full Stack Summary

```
merahalwai-web-app/
├── Frontend:     Next.js 14 + TypeScript + Tailwind + Shadcn
├── Backend:      Next.js API Routes + Prisma ORM
├── Database:     PostgreSQL (self-hosted on your VPS)
├── Auth:         NextAuth.js — Google OAuth + Email Magic Link
├── Email:        Resend (confirmation, invoice, magic link)
├── Payments:     Razorpay
├── PDF:          @react-pdf/renderer
├── State:        Zustand (menu builder cart)
├── Forms:        React Hook Form + Zod
└── Deploy:       Your VPS (PM2 + Nginx) or Vercel (frontend) + VPS (DB only)
```

***

## Deployment on Your Server

```
Server: Your VPS (Ubuntu recommended)
Process manager: PM2 (keeps Next.js running)
Reverse proxy: Nginx (routes domain → Next.js port)
Database: PostgreSQL on same server
SSL: Certbot (free HTTPS)

Single server handles everything — no external DB cost, no Vercel bill.
```

***

**MD file name for this doc:** `merahalwai-tech-stack.md`

Combined with the earlier file, your two core docs are:
1. `merahalwai-cursor-build-system.md` — all Cursor prompts
2. `merahalwai-tech-stack.md` — stack + database + auth decisions

Want the **Prisma database schema** next as `merahalwai-db-schema.md`?
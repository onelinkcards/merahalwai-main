# MeraHalwai — Brand Guidelines

## Brand Identity

**Name:** MeraHalwai  
**Domain:** merahalwai.com  
**Tagline:** "Catering, slow-cooked with care and served the smart way."  
**Positioning:** India's first full-stack bulk catering booking platform.  
**Archetype:** The Caregiver — warm, nurturing, dependable, calm in chaos.

---

## Brand Tone of Voice

- We'll handle it for you
- Nourishment with heart
- Calm in the chaos of event planning
- Desi, warm, familiar — yet reliable and systematized
- Never corporate. Never cold. Always like a trusted family member handling the kitchen.

**DO use:** "Book your halwai in minutes." / "We handle the caterer. You enjoy the event."  
**NEVER use:** Generic tech language like "leverage", "synergy", "seamless experience"

---

## Color Palette

### Primary Color
| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Mitti Brown** | `#804226` | 128, 66, 38 | Logo, headings, navbar, primary text |

### Secondary Color
| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Cheddar Cheese** | `#DE903E` | 222, 144, 62 | CTA buttons, active states, accent highlights, links |

### Tertiary Colors
| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Malai** | `#F1EDE3` | 241, 237, 227 | Page background, card backgrounds, cream fills |
| **Charcoal** | `#1E1E1E` | 30, 30, 30 | Body text, footer background |

### Extended UI Palette (derived from brand colors)
| Name | Hex | Usage |
|---|---|---|
| Brown Deep | `#5C1E0F` | Dark headings, section titles |
| Brown Mid | `#8B3A1E` | Hover states, mid-weight text |
| Cheddar Light | `#F5C88A` | Hover tints, selected state bg |
| Accent BG | `#FFF3E8` | Active card bg, selected item bg, pills |
| Border Warm | `#E8D5B7` | All card borders, input borders, dividers |
| Muted Text | `#8B7355` | Labels, captions, placeholder text |
| Success | `#16A34A` | Confirmed status, veg indicator |
| Error | `#DC2626` | Non-veg indicator, error states |
| Warning | `#D97706` | Pending status, add-on warnings |

### STRICT RULE
> Never use blue, purple, indigo, pink, teal, or any color outside this palette.  
> Never use random Tailwind color classes like `blue-500`, `purple-400`, `indigo-600`.  
> Every color in the UI must map to a token above.

---

## Typography

### Primary Font — Sideware
- Type: Decorative Sans-serif
- Usage: **Hero headlines ONLY**, special section display headings
- Character: Playful, handcrafted, desi charm — echoes sweet shop signs
- File location: `/public/fonts/Sideware/`
- Do NOT use for body text, labels, buttons, or navigation

### Secondary Font — Pretendard (Variable)
- Type: Clean Sans-serif
- Usage: **All UI text** — headings (H2–H4), body, labels, buttons, captions
- File location: `/public/fonts/Pretendard/PretendardVariable.woff2`
- Weights available: Thin | Light | Regular | Medium | SemiBold | Bold | ExtraBold

### Web App Type Scale
| Token | Size | Weight | Usage |
|---|---|---|---|
| Display | 56px | 700 (Bold) | Hero headline (Sideware) |
| H1 | 40px | 700 | Page titles (Pretendard) |
| H2 | 32px | 700 | Section headings |
| H3 | 24px | 600 | Sub-section headings |
| H4 | 20px | 600 | Card titles |
| Body Large | 16px | 400 | Primary body text |
| Body | 14px | 400 | Secondary body text |
| Caption | 12px | 400 | Labels, metadata |
| Small | 10px | 400 | Badges, fine print |

---

## Logo System

### The Mark
- Icon: Stacked traditional Indian Kadais (cooking pots) — 3 layers
- Wordmark: "MeraHalwai" — clean, rounded sans-serif
- The icon symbolizes: community, scale, tradition, warmth

### Clearspace Rule
- Minimum clearspace = height of the letter "A" in "Mera" on all sides
- Never crowd the logo with other elements

### Logo Variants
| Variant | Best Used On |
|---|---|
| Horizontal (icon + wordmark side by side) | Navbar, email headers |
| Vertical (icon above wordmark) | App icon, square formats |
| Symbol only (icon alone) | Favicon, small spaces, watermarks |
| Wordmark only | Minimal text contexts |

### Color Lockups
| Background | Logo Color |
|---|---|
| White / Malai (#F1EDE3) | Mitti Brown (#804226) |
| Cheddar Orange (#DE903E) | White |
| Mitti Brown (#804226) | White or Cheddar |
| Black / Charcoal | White or Cheddar |

### Logo DON'Ts
- Never stretch or distort the logo
- Never change logo colors outside the lockup system
- Never place on busy photo backgrounds without overlay
- Never use drop shadows on the logo
- Never recreate the logo in another font

### Logo Files (in `/logos/` folder)


---

## UI Component Rules

### Buttons
- Primary: bg `#DE903E`, text white, rounded-lg, Pretendard 600
- Secondary: border `#DE903E`, text `#DE903E`, bg transparent
- Ghost: text `#8B7355`, no border
- **Never:** rounded-full on buttons, gradients, shadows

### Cards
- bg white, border 1px `#E8D5B7`, rounded-xl
- Hover: border `#DE903E`, shadow-md

### Inputs
- border `#E8D5B7`, focus border `#DE903E`
- No blue browser focus ring

### Status Badges
- Pending: bg amber-50, text amber-700, border amber-200
- Confirmed: bg green-50, text green-700, border green-200
- Cancelled: bg red-50, text red-700, border red-200

### Icons
- Library: **Lucide React ONLY**
- No emojis in UI anywhere
- No other icon libraries

---

## Photography & Imagery Style

- Rich, warm, natural lighting
- Real food — actual Indian event food (not stock generic)
- Earthy tones: browns, ambers, creams — consistent with brand palette
- People are secondary — food and event atmosphere are primary
- No artificial bright studio lighting

---

## What MeraHalwai is NOT

- Not a food delivery app
- Not a restaurant discovery app
- Not a generic wedding directory
- Not "Weddingz.in with better design"

MeraHalwai is a **transactional bulk catering booking engine** — every design decision must reinforce that.
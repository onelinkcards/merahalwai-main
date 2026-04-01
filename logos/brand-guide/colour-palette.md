# MeraHalwai — Colour Palette Reference

## Official Brand Colors (from Brand Book)

Mitti Brown #804226 Primary — Logo, headings, trust
Cheddar Cheese #DE903E Secondary — CTAs, buttons, active
Malai #F1EDE3 Background — Page bg, cream surface
Charcoal #1E1E1E Text/Dark — Body text, footer


## Tailwind Config Custom Colors

```js
// tailwind.config.ts — extend.colors
colors: {
  'mitti': {
    DEFAULT: '#804226',
    dark: '#5C1E0F',
    mid: '#8B3A1E',
  },
  'cheddar': {
    DEFAULT: '#DE903E',
    light: '#F5C88A',
    bg: '#FFF3E8',
  },
  'malai': {
    DEFAULT: '#F1EDE3',
    surface: '#FFFFFF',
  },
  'charcoal': {
    DEFAULT: '#1E1E1E',
  },
  'border-warm': '#E8D5B7',
  'muted-brown': '#8B7355',
}
```

## CSS Variables (globals.css)

```css
:root {
  --color-primary:      #804226;
  --color-primary-dark: #5C1E0F;
  --color-accent:       #DE903E;
  --color-accent-light: #F5C88A;
  --color-accent-bg:    #FFF3E8;
  --color-bg:           #F1EDE3;
  --color-surface:      #FFFFFF;
  --color-border:       #E8D5B7;
  --color-text:         #1E1E1E;
  --color-muted:        #8B7355;
  --color-success:      #16A34A;
  --color-error:        #DC2626;
  --color-warning:      #D97706;
}
```

## NEVER USE
blue-, purple-, indigo-, pink-, teal-, cyan-
Any color not listed above
Any random hex not from the brand palette
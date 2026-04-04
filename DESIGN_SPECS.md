# GigGuard — Design Specifications

## Brand Identity

| Element | Value |
|---|---|
| Product name | GigGuard |
| Tagline | Your financial safety net for unpredictable income |
| Personality | Calm coach. Not a bank app, not a startup bro app. Trustworthy, direct, human. |
| Tone | Plain English only. No financial jargon. Speak like a smart friend, not a compliance officer. |

---

## Color System

### Primary Palette

| Name | Hex (Light) | Usage |
|---|---|---|
| Shield Teal | `#0F6E56` | Primary brand, safe state, CTAs |
| Teal Light | `#1D9E75` | Hover states, accents |
| Teal Surface | `#E1F5EE` | Card backgrounds, safe state fill |
| Amber Warn | `#EF9F27` | Warning state, windfall highlight |
| Amber Surface | `#FAEEDA` | Warning card fill |
| Coral Danger | `#D85A30` | Danger state, survival mode |
| Coral Surface | `#FAECE7` | Danger card fill |
| Off-White | `#F8F7F2` | App background |
| Slate Text | `#2C2C2A` | Primary text |
| Muted Text | `#5F5E5A` | Secondary text, labels |
| Border | `#D3D1C7` | Card borders, dividers |

### Semantic State Colors

| State | Background | Text | Border | Usage |
|---|---|---|---|---|
| Safe | `#E1F5EE` | `#0F6E56` | `#1D9E75` | Safe-to-spend: confidently safe |
| Warning | `#FAEEDA` | `#854F0B` | `#EF9F27` | Safe if income arrives |
| Risky | `#FAECE7` | `#993C1D` | `#D85A30` | Risky state |
| Danger | `#FCEBEB` | `#A32D2D` | `#E24B4A` | Overspending danger, survival mode |
| Neutral | `#F1EFE8` | `#444441` | `#B4B2A9` | Inactive, disabled |

### Dark Mode

All colors must work in dark mode. Use CSS variables throughout — never hardcode hex values in components.

```css
:root {
  --color-bg: #F8F7F2;
  --color-bg-card: #FFFFFF;
  --color-text-primary: #2C2C2A;
  --color-text-secondary: #5F5E5A;
  --color-border: #D3D1C7;
  --color-brand: #0F6E56;
  --color-brand-light: #E1F5EE;
  --color-warn: #EF9F27;
  --color-warn-light: #FAEEDA;
  --color-danger: #D85A30;
  --color-danger-light: #FAECE7;
}

[data-theme="dark"] {
  --color-bg: #1A1A18;
  --color-bg-card: #252523;
  --color-text-primary: #E8E6DC;
  --color-text-secondary: #9C9A92;
  --color-border: #3A3A37;
  --color-brand: #1D9E75;
  --color-brand-light: #04342C;
  --color-warn: #FAC775;
  --color-warn-light: #412402;
  --color-danger: #F0997B;
  --color-danger-light: #4A1B0C;
}
```

---

## Typography

| Role | Font | Weight | Size | Line height |
|---|---|---|---|---|
| Hero number | Syne | 700 | 48px | 1.0 |
| Heading 1 | Syne | 600 | 28px | 1.2 |
| Heading 2 | Syne | 600 | 22px | 1.3 |
| Heading 3 | DM Sans | 600 | 18px | 1.4 |
| Body | DM Sans | 400 | 16px | 1.6 |
| Label | DM Sans | 500 | 13px | 1.4 |
| Caption | DM Sans | 400 | 12px | 1.5 |
| Mono (numbers) | DM Mono | 500 | varies | 1.2 |

Import in index.html:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Spacing System

Base unit: 4px

| Token | Value | Usage |
|---|---|---|
| space-1 | 4px | Icon padding, tight gaps |
| space-2 | 8px | Inner component padding |
| space-3 | 12px | Between related elements |
| space-4 | 16px | Card padding (mobile) |
| space-5 | 20px | Card padding (desktop) |
| space-6 | 24px | Section gaps |
| space-8 | 32px | Between cards |
| space-10 | 40px | Page sections |
| space-12 | 48px | Top-level page padding |

---

## Component Specs

### Cards

```
border-radius: 12px
border: 1px solid var(--color-border)
background: var(--color-bg-card)
padding: 20px
box-shadow: 0 1px 3px rgba(0,0,0,0.06)
```

Hero card (Safe-to-Spend):
```
border-radius: 16px
padding: 28px
border-left: 4px solid [state-color]
```

### Buttons

Primary:
```
background: var(--color-brand)
color: white
border-radius: 8px
padding: 12px 24px
font: DM Sans 500 15px
```

Secondary:
```
background: transparent
border: 1.5px solid var(--color-brand)
color: var(--color-brand)
border-radius: 8px
padding: 11px 23px
```

Danger:
```
background: var(--color-danger)
color: white
border-radius: 8px
padding: 12px 24px
```

### Progress Bars

```
height: 8px
border-radius: 4px
background: var(--color-border)
fill: [state-color]
transition: width 600ms ease
```

### State Badge

```
display: inline-flex
align-items: center
gap: 6px
padding: 4px 10px
border-radius: 20px
font: DM Sans 500 12px
background: [state-surface]
color: [state-text]
```

### Chatbot Widget

Button (closed):
```
position: fixed
bottom: 24px
right: 24px
width: 52px
height: 52px
border-radius: 50%
background: var(--color-brand)
box-shadow: 0 4px 12px rgba(15,110,86,0.3)
```

Panel (open):
```
position: fixed
bottom: 88px
right: 24px
width: 360px
height: 520px
border-radius: 16px
border: 1px solid var(--color-border)
background: var(--color-bg-card)
box-shadow: 0 8px 32px rgba(0,0,0,0.12)
```

---

## Screen Layouts

### Onboarding

- Full screen, centered single-column
- Progress dots at top (3 dots for 3 steps)
- One main question per screen
- Large, clear input controls
- Back / Continue buttons at bottom
- Max width: 480px centered

### Dashboard

Grid layout (desktop):
```
[  Safe-to-Spend Hero — full width  ]
[  Buffer Health  ] [  SE Tax Tracker  ]
[  Windfall Stabilizer — full width when triggered  ]
```

Mobile: single column, cards stacked

### Survival Mode

Dashboard palette shifts:
- Background tints to `#FFF8F5`
- Hero card border-left becomes coral/red
- "Survival Mode Active" banner at top with amber background
- Non-essential sections collapse or dim

### Insurance Hub

Tab layout:
```
[ Recommendation ] [ My Policy ] [ Quiz ]
```

PDF upload zone:
```
border: 2px dashed var(--color-border)
border-radius: 12px
padding: 40px
text-align: center
background: var(--color-bg)
```

On upload: replace drop zone with summary card

---

## Iconography

Use Lucide React for all icons. Key icons:

| Concept | Lucide icon |
|---|---|
| Safe-to-spend | `Wallet` |
| Buffer/shield | `Shield` |
| Tax | `Receipt` |
| Windfall | `TrendingUp` |
| Survival mode | `AlertTriangle` |
| Shock event | `Zap` |
| Recovery | `RefreshCw` |
| Insurance | `FileText` |
| Quiz/game | `Trophy` |
| Chatbot | `MessageCircle` |
| Income | `DollarSign` |
| Upload | `Upload` |

---

## Animation Guidelines

- All transitions: 200–300ms ease
- Card entrance: fade-in + translateY(8px) → translateY(0)
- State changes (safe → risky): color transition 400ms
- Progress bar fill: 600ms ease on mount
- Survival mode activation: background color sweep 500ms
- Chatbot open/close: slide-up 250ms ease-out
- Number counters (Safe-to-Spend amount): count-up animation on load
- No animations for users with prefers-reduced-motion

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, full-width cards |
| Tablet | 640–1024px | 2-column grid |
| Desktop | > 1024px | 3-column grid, sidebar possible |

Dashboard is designed mobile-first. Gig workers are on their phones.

---

## Accessibility

- All interactive elements: min 44×44px touch target
- Color never used as the only indicator — always pair with icon or text label
- Focus rings: 2px offset, brand color
- All form inputs: associated labels, not placeholder-only
- Contrast ratio: minimum 4.5:1 for all text
- Screen reader: aria-live regions for Safe-to-Spend state changes

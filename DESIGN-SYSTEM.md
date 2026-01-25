# Design System

Warm, functional, minimal. Artisanal craft meets hyper-functional density.

---

## Philosophy

| Tenet | Expression |
|-------|------------|
| **Material Warmth** | Sand, cream, kraft — paper and textile, not plastic |
| **Functional Density** | Every pixel earns its place. No decorative padding |
| **Lowercase Intimacy** | Conversational, approachable, never shouty |
| **Chromatic Restraint** | UI is neutral. Color lives in content only |

---

## Typography

### Scale

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `text-xs` | 11px | 1.4 | Metadata, badges |
| `text-sm` | 13px | 1.4 | Labels, captions |
| `text-base` | 15px | 1.5 | Body copy |
| `text-lg` | 18px | 1.4 | Lead text |
| `text-xl` | 24px | 1.2 | Section heads |
| `text-2xl` | 32px | 1.1 | Page titles |
| `text-3xl` | 48px | 1.0 | Hero headlines |

### Rules

- **Weight:** Light (300) default. Regular (400) for emphasis. No bold.
- **Case:** Lowercase for headlines, nav, CTAs. Sentence case for body.
- **Tracking:** Normal. No wide spacing.
- **Font:** Inter or system-ui. Single family throughout.

---

## Color

### Palette

| Token | Hex | Use |
|-------|-----|-----|
| `sand` | #E8E6DC | Primary background |
| `sand-dark` | #D4D2C8 | Hover, secondary surfaces |
| `cream` | #F5F4F0 | Elevated surfaces, cards |
| `charcoal` | #2C2C2C | Text, borders |

### Semantic

| Token | Value |
|-------|-------|
| `bg-primary` | sand |
| `bg-elevated` | cream |
| `text-primary` | charcoal |
| `text-muted` | charcoal/50 |
| `border` | charcoal/10 |
| `border-strong` | charcoal/20 |

No accent colors. Emphasis through weight or scale, not hue.

---

## Spacing

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |

Compact by default. Use `space-2` and `space-3` liberally. Reserve `space-6+` for section breaks.

---

## Layout

### Container

- Max width: 1200px
- Padding: 16px mobile, 24px desktop
- No excessive margins. Content fills available space.

### Grid

Dense, functional grids. Prefer `gap-2` or `gap-3` over generous spacing.

```html
<!-- Compact card grid -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-2">...</div>

<!-- Dense list -->
<div class="space-y-1">...</div>
```

### Sections

- Divider: 1px `border-charcoal/10`
- Padding: `py-6` to `py-8` — not `py-20`
- No decorative whitespace

---

## Components

### Navigation

```html
<nav class="h-12 bg-sand border-b border-charcoal/10 px-4 flex items-center justify-between">
  <a class="text-sm font-light lowercase">brand</a>
  <div class="flex gap-4">
    <a class="text-sm font-light lowercase hover:underline">products</a>
    <a class="text-sm font-light lowercase hover:underline">about</a>
  </div>
</nav>
```

- Height: 48px
- Compact horizontal padding
- No logo bloat

### Buttons

```html
<!-- Primary -->
<button class="px-3 py-1.5 text-sm font-light lowercase border border-charcoal rounded hover:bg-charcoal hover:text-cream transition-colors">
  add to cart
</button>

<!-- Ghost -->
<button class="px-3 py-1.5 text-sm font-light lowercase hover:bg-charcoal/5 rounded transition-colors">
  cancel
</button>

<!-- Link -->
<a class="text-sm font-light lowercase underline">learn more</a>
```

Small padding. No pill shapes — use subtle `rounded` (4px).

### Inputs

```html
<input class="w-full px-2 py-1.5 text-sm bg-transparent border border-charcoal/20 rounded focus:border-charcoal focus:outline-none" placeholder="email" />
```

- Visible border (not bottom-only)
- Compact padding
- No labels above — use placeholder or inline label

### Cards

```html
<div class="p-3 bg-cream rounded border border-charcoal/10">
  <h3 class="text-sm font-normal lowercase">title</h3>
  <p class="text-xs text-charcoal/60 mt-1">description</p>
</div>
```

Tight padding. Subtle elevation through background, not shadow.

### Tables

```html
<table class="w-full text-sm">
  <thead>
    <tr class="border-b border-charcoal/10">
      <th class="text-left py-2 font-normal text-charcoal/60 lowercase">name</th>
      <th class="text-left py-2 font-normal text-charcoal/60 lowercase">status</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-charcoal/5">
      <td class="py-2">Item name</td>
      <td class="py-2">Active</td>
    </tr>
  </tbody>
</table>
```

Dense rows. Minimal header styling.

### Badges

```html
<span class="px-1.5 py-0.5 text-xs bg-charcoal/10 rounded">new</span>
```

Tiny. Muted background. No bright colors.

---

## Patterns

### Dense List

```html
<ul class="divide-y divide-charcoal/10">
  <li class="py-2 flex justify-between items-center">
    <span class="text-sm">Item name</span>
    <span class="text-xs text-charcoal/50">metadata</span>
  </li>
</ul>
```

### Compact Form

```html
<form class="space-y-3">
  <input class="w-full px-2 py-1.5 text-sm border border-charcoal/20 rounded" placeholder="name" />
  <input class="w-full px-2 py-1.5 text-sm border border-charcoal/20 rounded" placeholder="email" />
  <button class="w-full px-3 py-1.5 text-sm font-light lowercase border border-charcoal rounded hover:bg-charcoal hover:text-cream">
    submit
  </button>
</form>
```

### Hero (Minimal)

```html
<section class="relative h-[60vh] min-h-[400px]">
  <img class="absolute inset-0 w-full h-full object-cover" src="..." alt="" />
  <div class="absolute inset-0 flex items-end p-6">
    <h1 class="text-2xl font-light lowercase text-white">headline</h1>
  </div>
</section>
```

Not full-screen. Functional height. Text anchored to corner.

---

## Tailwind Config

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1.4' }],   // 11px
        'sm': ['0.8125rem', { lineHeight: '1.4' }],   // 13px
        'base': ['0.9375rem', { lineHeight: '1.5' }], // 15px
        'lg': ['1.125rem', { lineHeight: '1.4' }],    // 18px
        'xl': ['1.5rem', { lineHeight: '1.2' }],      // 24px
        '2xl': ['2rem', { lineHeight: '1.1' }],       // 32px
        '3xl': ['3rem', { lineHeight: '1' }],         // 48px
      },
      fontWeight: {
        light: '300',
        normal: '400',
      },
      colors: {
        sand: {
          DEFAULT: '#E8E6DC',
          dark: '#D4D2C8',
        },
        cream: '#F5F4F0',
        charcoal: '#2C2C2C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '75rem', // 1200px
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
}
```

---

## Checklist

- [ ] Light weight (300) as default
- [ ] Lowercase headlines, nav, CTAs
- [ ] Sand background, charcoal text
- [ ] Compact spacing (`gap-2`, `py-2`, `px-3`)
- [ ] No decorative whitespace
- [ ] No accent colors
- [ ] No bold weights
- [ ] No all-caps
- [ ] No shadows (use borders or background)
- [ ] No pill buttons (use subtle rounded)

---

*Warm materials. Functional density. Quiet confidence.*

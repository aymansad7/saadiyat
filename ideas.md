# Design Ideas — Saadiyat / St. Regis Villas Explorer

<response>
<text>
**Idea A — "Coastal Atelier"**

- **Design Movement**: Editorial luxury real estate — inspired by Aman, Aesop, and high-end yacht brokerages. Warm, sand-toned, handcrafted.
- **Core Principles**: Quiet luxury · Editorial typography · Cartographic precision · Generous negative space.
- **Color Philosophy**: Warm off-whites (oklch ~0.97 sand), deep ink (oklch 0.18 navy-charcoal), accent of terracotta-gold (oklch 0.65 / amber-700) evoking Mediterranean sun on Saadiyat sandstone. Avoid AI-blue.
- **Layout Paradigm**: Asymmetric two-pane: a fixed cartographic side (interactive plot grid map) on the left ~38%, and a scroll-feed of villa cards on the right. Filter rail floats top.
- **Signature Elements**: 
  1. Hand-drawn compass rose accent at section dividers
  2. Numeric villa badges in serif numerals
  3. Subtle topographic line motif as background watermark
- **Interaction Philosophy**: Hovering a card highlights the matching plot on the map; clicking opens a sheet (right-side drawer) with all four CTAs (PDF, Maps, Earth, copy coords). No popups.
- **Animation**: Subtle staggered fade-up on card entry (150ms each). Map plot glow pulses when corresponding card is hovered. Drawer slides 280ms cubic-bezier(0.22, 1, 0.36, 1).
- **Typography**: Display = "Fraunces" (serif, semi-bold 600) for villa numbers and section headings. Body = "Inter Tight" 400/500 for technical data. Numbers tabular-nums for alignment.
</text>
<probability>0.06</probability>
</response>

<response>
<text>
**Idea B — "Architect's Drawing Board"**

- **Design Movement**: Drafting/blueprint aesthetic — like Foster + Partners portfolio meets Notion.
- **Core Principles**: Precision · Grid-based · Monospace data · Functional minimalism.
- **Color Palette**: Cream paper (#F5F0E6) bg, ink (#0F1B2D) text, sea-blue accent (#1B4965) and ochre highlight (#D49B43).
- **Layout**: Top header with breadcrumb (Saadiyat / St. Regis Villas / Villa N), filter sidebar left, master grid right.
- **Signature Elements**: Grid paper background, dimension-line dividers, technical sheet headers ("DCR-001").
- **Interaction**: Tactile but reserved. Filter chips click with subtle paper-fold sound (optional).
- **Animation**: Minimal — only data updates animate.
- **Typography**: Display = "Archivo" 700, Body = "JetBrains Mono" for IDs/numbers, "Inter" for prose.
</text>
<probability>0.04</probability>
</response>

<response>
<text>
**Idea C — "Pearl & Marble Concierge"**

- **Design Movement**: Pearl-island Gulf luxury — inspired by Louvre Abu Dhabi visitor app and Etihad First Class digital.
- **Core Principles**: Crystalline glass · Soft glows · Bilingual elegance · Image-led.
- **Color**: Deep marine ink background (oklch 0.18 0.04 240), pearl-white foreground, champagne-gold (oklch 0.78 0.13 80) accent. Frosted glass panels.
- **Layout**: Full-bleed hero with cinematic Saadiyat aerial; below = horizontally-scrolling carousel of "neighborhoods" with St. Regis Villas as the featured cluster. Click a villa → full-page detail with 3-col layout (PDF preview · map · specs).
- **Signature Elements**: Glass-morphism cards, gold hairline borders, Arabic/English bilingual labels.
- **Interaction**: Smooth horizontal scroll, gold ripple on hover, parallax hero.
- **Animation**: Pearl-shimmer on idle, hero parallax, glass-card lift on hover.
- **Typography**: Display = "Cormorant Garamond" 500 italic for headings, Body = "Inter" 400, Arabic numerals + tabular.
</text>
<probability>0.03</probability>
</response>

---

## Selected Direction: **Idea A — Coastal Atelier**

**Reasoning**: This is a working tool for a real-estate professional, not a marketing site. Idea A's editorial-luxury approach gives the polish appropriate for a Saadiyat luxury portfolio while keeping the data dense and navigable. The map+card pairing makes filtration and click-through to PDF/Maps/Earth ergonomic. Idea B is too utilitarian, Idea C too ornamental for daily use.

### Implementation rules (binding for all files)
- Background: warm sand `oklch(0.97 0.01 80)`
- Foreground: deep ink `oklch(0.20 0.02 240)`
- Accent: amber-terracotta `oklch(0.65 0.13 50)` for CTAs
- Border: hairline `oklch(0.86 0.01 80 / 0.6)`
- Display font: **Fraunces** (Google Fonts), weight 500/600, slight optical italic
- Body font: **Inter Tight** 400/500
- Mono for IDs: **JetBrains Mono**
- Layout: asymmetric — left map pane (sticky), right villa list/grid
- No purple gradients, no fully centered hero, no rounded-3xl uniform corners
- Card radius: 8px; map plots have crisp 1px hairline strokes

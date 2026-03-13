# Cursor Agent Prompt — Homepage & About Page Redesign

---

## Task

Redesign `src/pages/index.astro` and `src/pages/about.astro` in this Astro
project. The visual style should be inspired by the reference site
https://www.charmiekapoor.com/ — specifically its typography scale, layout
proportions, and spacing rhythm. Do NOT copy content, colours, or interactive
effects. Only extract and apply the static design system: font families, font
sizes, line heights, letter spacing, layout structure, section spacing, and
column grid.

---

## Step 1 — Inspect the reference site first

Before writing any code, open https://www.charmiekapoor.com/ in your browser
tool and extract the following design tokens precisely. Record every value you
find.

### What to extract:

**Typography** (extract sizes and spacing only — font families will NOT be copied)
- H1 font-size (desktop)
- H2 font-size (desktop)
- H3 / label font-size
- Body font-size
- Small / meta text font-size
- Line-height for body text
- Line-height for headings
- Letter-spacing on headings (if any)
- Font-size on nav links
- Any use of italic or font-style variation

**Layout & Grid**
- Max content width (the outer container `max-width`)
- Left/right page padding on desktop
- Left/right page padding on mobile
- Number of columns used (single column? two column split for hero?)
- Alignment of hero text (left-aligned, centred?)
- Whether the profile image sits inline with text or above it

**Spacing**
- Vertical gap between navbar and hero section
- Vertical gap between hero section and the next section
- Vertical gap between sections throughout the page
- Internal padding within section blocks
- Gap between heading and paragraph within a section
- Gap between a section label/eyebrow and its heading

**Navbar**
- Height of the navbar
- Alignment of nav items (left, right, centred, space-between)
- Font-size and weight of nav links

**Footer**
- Height / padding
- Font-size

Write all extracted values as CSS custom properties in this format before
proceeding:

```css
/* Extracted from charmiekapoor.com — sizes and spacing only */
/* Font families are NOT extracted — existing project fonts are retained */

--text-xs: Xpx;
--text-sm: Xpx;
--text-base: Xpx;
--text-lg: Xpx;
--text-xl: Xpx;
--text-2xl: Xpx;
--text-3xl: Xpx;
--text-4xl: Xpx;

--leading-body: X;
--leading-heading: X;
--tracking-heading: Xem;

--max-width: Xpx;
--padding-x-desktop: Xpx;
--padding-x-mobile: Xpx;

--space-section: Xpx;   /* gap between major sections */
--space-block: Xpx;     /* gap between heading and paragraph */
--space-tight: Xpx;     /* gap between label and heading */
```

Do not proceed to Step 2 until you have filled in every token.

---

## Step 2 — Apply tokens to global styles

Open `src/styles/global.css`. Add the extracted size and spacing tokens as
CSS custom properties on `:root`.

**Do NOT change the font families.** Keep the existing `--font-heading` and
`--font-body` variables and font imports exactly as they are in the project.
Only update the size and spacing tokens extracted in Step 1.

---

## Step 3 — Rebuild `src/pages/index.astro`

Build the homepage with these sections in this exact order:

### 3a. Header / Navbar
Match the reference site's navbar height, padding, font-size, and link
alignment exactly using the extracted tokens.

### 3b. Hero section
Layout:
- Profile photo on the LEFT (square or circle crop, roughly 120–160px)
- Name as H1 on the RIGHT of the photo
- Current title / one-line role descriptor beneath the name
- A short intro paragraph (2–3 sentences) pulled from the About page content
  in the source repo (`../nehal-notes-design/src/pages/about.*` or equivalent)

Apply:
- The extracted H1 font-size, font-family, line-height, letter-spacing
- The extracted body font-size and line-height for the intro paragraph
- The extracted layout max-width and horizontal padding
- The extracted spacing between the navbar and this section

### 3c. Experience section
Heading: "Experience" (H2, styled with extracted H2 tokens)

Pull experience data from the About page in the source repo. Display as a
clean vertical list. Each entry should show:
- Role / title (H3 or bold text, extracted font-size)
- Organisation name
- Date range (small / meta text, extracted font-size)
- One-line description if available (body text)

Spacing between entries should match the reference site's list/card rhythm.

### 3d. Latest Posts section
Heading: "Writing" (H2)

Display the 3 most recent blog posts from Astro Content Collections:
```astro
---
import { getCollection } from 'astro:content';
const posts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
---
```

Each post card shows:
- Post title (styled with extracted heading tokens)
- Publication date (meta text size)
- Description / excerpt
- Link to `/blog/[slug]`

Apply the same section spacing and card spacing from the reference site.

### 3e. Footer
Match the reference site's footer height, padding, and font-size.
Include: copyright line and links to About and Blog.

---

## Step 4 — Rebuild `src/pages/about.astro`

Use the same layout container, max-width, and horizontal padding as the
homepage.

Sections in order:

### 4a. Page header
- Name or "About" as H1
- Short tagline beneath (one line, body or H3 size)

### 4b. Bio / Background
Pull the full background paragraph(s) from the source repo's About page.
Display as flowing body text with the extracted line-height and font-size.

### 4c. Experience (full list)
Same visual treatment as the homepage Experience section, but show all
entries rather than just the most recent.

### 4d. Skills or Interests (if present in source)
Simple text list or inline tags. Use small/meta text size.

---

## Step 5 — Constraints and rules

- Do NOT copy any animations, hover effects, or JavaScript interactions from
  the reference site. Static layout only.
- Do NOT copy the reference site's colour palette. Keep the existing colour
  scheme from `src/styles/global.css` or the Tailwind config.
- Do NOT copy the reference site's font families. Keep the existing fonts
  already defined in the project — only adopt the size and spacing scale.
- Do NOT use placeholder text. All copy must come from the actual content in
  `../nehal-notes-design/`.
- All images must reference files that exist in `/public/`. Do not use
  external image URLs.
- Every section must be wrapped in a `<section>` element with a descriptive
  class name.
- The layout must be responsive. On mobile (< 640px):
  - The hero photo and text should stack vertically (photo above text)
  - Horizontal padding switches to `--padding-x-mobile`
  - Font sizes may scale down by one step
- Use `rem` units for font sizes, `px` for spacing tokens (or `rem` if the
  reference site uses `rem` — match whatever the reference uses).

---

## Step 6 — Verify output

After building both pages, run:
```bash
npm run build
```

Then confirm:
- `dist/index.html` contains the hero heading, experience section, and
  blog post titles as plain text (not reliant on JS)
- `dist/about/index.html` contains the bio and full experience list
- Both pages render correctly at `npm run dev` on desktop and mobile widths

---

## Deliverables

- Updated `src/styles/global.css` with new design tokens
- Updated `src/layouts/BaseLayout.astro` with correct font imports
- Rebuilt `src/pages/index.astro` with all 5 sections
- Rebuilt `src/pages/about.astro` with all 4 sections
- Zero build errors
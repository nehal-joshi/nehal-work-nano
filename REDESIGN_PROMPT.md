# Redesign Prompt — nehal.work (Astro)

Use this as a single prompt in Cursor to refactor the design of this site end-to-end. Do not introduce new frameworks, fonts, or heavy libraries. Work inside the existing Astro 6 + Tailwind 3 setup.

---

## Objectives

Refactor the design of this personal site to be:

- Modern, minimal, fast, reader-friendly
- Strict single-column reading layout
- No prominent imagery anywhere, with **only two exceptions**:
  1. A **small circular profile photo** (~56–64px) on the landing page, sitting inline to the left of my name.
  2. The **photography bento grid** on the home page.
- Blog "notes" stay minimal — improve the existing treatment, do **not** add new visual elements. The only image is the cover image at the top.
- Reuse existing typography (`Raleway`, `Work Sans`, `Georgia`). Do not add new font imports.
- Keep the existing HSL token system in `src/styles/global.css`. Only refine values.
- Ship zero build errors. `npm run build` must succeed and `dist/` must contain statically-rendered text for all pages.

---

## Hard constraints

- **Stack lock-in**: keep Astro 6 static output, Tailwind 3, `@tailwindcss/typography`, `@astrojs/sitemap`. Do not add any new dependencies.
- **No new fonts**: continue using the Google Fonts import already present in `src/styles/global.css` for `Raleway` and `Work Sans`. `Georgia` is a system serif and remains in `tailwind.config.mjs`.
- **No new images, illustrations, icons, or decorative SVG** beyond what already exists in `/public/` and the existing footer social icons.
- **No JS frameworks** (no React/Vue/Svelte islands). Astro components + minimal vanilla JS only if essential.
- **No hover animations beyond subtle color + underline transitions.** Keep existing `animate-fade-in` if you want, but do not add new keyframes.
- **Responsive**: everything must collapse cleanly to mobile at `< 640px`. No horizontal scroll, no layout shift on load.
- **Accessibility**: maintain semantic landmarks (`<header>`, `<main>`, `<article>`, `<footer>`), proper heading hierarchy, visible focus states, `alt` text on all images.

---

## Typography system (reuse — do not change imports)

Assign roles explicitly. Update `src/styles/global.css` and `tailwind.config.mjs` only as needed to enforce these roles.

| Role | Font | Weight | Notes |
| --- | --- | --- | --- |
| Display / hero name / site title | `Raleway` | 500–600 | Slightly tighter tracking on large sizes |
| Section headings (h2–h4) | `Raleway` | 500 | Uppercase micro-labels use `.section-title` |
| UI body (nav, captions, cards, meta) | `Work Sans` | 400–500 | |
| Long-form reading body (inside `.prose` / note content) | `Georgia` | 400 | Already configured via `@tailwindcss/typography` DEFAULT |
| Monospace | not used | — | Avoid code blocks unless necessary |

Size scale (set in `global.css` on `:root`; reference via Tailwind's existing `text-*` classes or custom utilities):

```
--text-xs:   0.75rem;   /* 12px — eyebrows, meta */
--text-sm:   0.875rem;  /* 14px — nav, footer, captions */
--text-base: 1rem;      /* 16px — UI body */
--text-lg:   1.125rem;  /* 18px — note body on desktop */
--text-xl:   1.25rem;   /* 20px — home intro paragraph */
--text-2xl:  1.5rem;    /* 24px — h2 */
--text-3xl:  1.875rem;  /* 30px — h1 */
--text-4xl:  2.25rem;   /* 36px — note title on desktop */

--leading-body:    1.7;
--leading-heading: 1.2;
--tracking-tight:  -0.01em;
--tracking-label:  0.08em;  /* uppercase micro-labels */
```

Apply these to `h1…h4` and `.prose` inside `@layer base`. Remove the current blanket `text-xl` from hero copy in favor of `var(--text-xl)`.

---

## Layout system

- Container: continue with `max-w-3xl` (768px), centered, `px-4 md:px-0`.
- Vertical rhythm: use a consistent **64px desktop / 40px mobile** gap between major sections. Express as:

```
--space-section-desktop: 4rem;
--space-section-mobile:  2.5rem;
--space-block:           1.5rem;  /* gap between heading and its paragraph */
--space-tight:           0.5rem;  /* gap between eyebrow and heading */
```

- Dividers: replace every `<hr class="bg-gray-200">` with a single hairline border utility `border-t border-border/60` applied to the next section, OR simply rely on whitespace. Goal: less visual noise.
- Cards: **remove rounded bordered cards** from `ArticleCard` and the projects list on home. Replace with flat, list-style rows (see below).

---

## Color / token refinements

Keep HSL vars. Only tweak for softer contrast and a warmer neutral:

```
--background:          0 0% 100%;
--foreground:          220 20% 12%;
--muted:               220 10% 96%;
--muted-foreground:    220 10% 45%;
--border:              220 10% 90%;
--primary:             220 15% 18%;
--primary-foreground:  0 0% 98%;
--ring:                220 15% 18%;
--radius:              0.25rem;
```

Do **not** introduce a dark mode in this pass. Leave the `darkMode: ['class']` config in Tailwind untouched.

---

## Page-by-page spec

### 1. `src/layouts/BaseLayout.astro`

- Keep meta, canonical, sitemap, structured-data rendering as-is.
- Body container: `min-h-screen flex flex-col items-center` → inner `w-full max-w-3xl px-4 md:px-0`.
- Reduce vertical padding on `<main>` from `py-12` to `py-8 md:py-10`.

### 2. `src/components/Navbar.astro`

- Keep borderless look; remove the `border-b border-border`.
- Single line: site name on the left, nav items on the right, vertically aligned on mobile too (switch from `flex-col md:flex-row` to always `flex-row justify-between items-center`).
- Site name: `Raleway 500`, `text-sm`. Nav items: `Work Sans 500`, `text-xs uppercase tracking-[0.08em]`.
- Active state: underline only (keep `.navbar-item.active`).

### 3. `src/components/Footer.astro`

- Remove top `border-t`. Replace with just generous top padding (`pt-10 mt-16`).
- Drop the existing SVG icon row and replace with **text links only** (`EMAIL`, `PEERLIST`, `LINKEDIN`, `X`, `FLICKR`) mirroring the home-page social row, styled with `.footer-nav-item`.
- Layout: single row on desktop (social links left, copyright center, site nav right), stacked on mobile.

### 4. `src/pages/index.astro`

Rebuild the home page with this exact section order and treatment.

#### 4.1 Hero

- Flex row, vertically centered on desktop, stacked on mobile.
- Left: circular profile photo `w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden` using `/nehal-joshi-pfp.jpg`. No ring, no border, no shadow.
- Right: `<h1>Nehal Joshi</h1>` in `Raleway 600`, using `var(--text-3xl)`. Beneath it, a single-line role: `Educator, Designer, Builder.` styled as `text-sm uppercase tracking-[0.08em] text-muted-foreground`.
- Remove the current giant hero heading `Educator, Designer, Builder.` as h1. That phrase becomes the role line.
- Below the hero row, one intro paragraph at `var(--text-xl)` with `text-muted-foreground`, max 2 sentences (reuse the existing "I build learning products…" sentence).

#### 4.2 About

- 2–3 paragraphs of running `Work Sans` body text (`var(--text-base)`, `leading-[var(--leading-body)]`).
- Reuse existing copy (15-year intro, Lernok, photography, etc.) with minor tightening. Keep inline bold links to `lernok.com` and Flickr.
- End with a compact social row: `EMAIL · PEERLIST · LINKEDIN · X · FLICKR` rendered as plain uppercase `text-xs` links separated by a middle dot, not with `space-x-6` borders.

#### 4.3 Writing (latest posts)

- Section eyebrow: `<p class="section-title">Writing</p>` (reuse the existing `.section-title` component class).
- Render the 3 latest posts using a **new list style**, not bordered cards:

```
<ul class="divide-y divide-border/60">
  <li>
    <a href="/notes/{slug}" class="group flex items-baseline justify-between gap-6 py-4">
      <span class="flex-1 min-w-0">
        <span class="block font-medium text-foreground group-hover:underline">{title}</span>
        <span class="block text-sm text-muted-foreground line-clamp-1 mt-1">{description}</span>
      </span>
      <time class="shrink-0 text-xs text-muted-foreground tabular-nums">{MMM YYYY}</time>
    </a>
  </li>
</ul>
```

- Refactor `src/components/ArticleCard.astro` to this list-row style and remove the rounded border card. Keep the `index` prop and fade-in stagger.
- Below the list: `View all notes →` link as before, styled with `text-sm`.

#### 4.4 Things I've Built (projects)

- Same list-row treatment as Writing. Keep the 32–40px thumbnail on the left (the only small square image allowed here because projects already ship thumbnails). Remove the outer rounded border.

```
<ul class="divide-y divide-border/60">
  <li>
    <a href="{url}" target="_blank" rel="noopener noreferrer"
       class="group flex items-center gap-4 py-4">
      <span class="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
        <img src="{thumb}" alt="" class="w-full h-full object-cover" />
      </span>
      <span class="flex-1 min-w-0">
        <span class="block font-medium group-hover:underline">{title}</span>
        <span class="block text-sm text-muted-foreground line-clamp-1">{description}</span>
      </span>
      <span class="shrink-0 text-xs text-muted-foreground" aria-hidden>↗</span>
    </a>
  </li>
</ul>
```

#### 4.5 Photography (bento — keep)

- Keep `PhotoBento` as the only visually dense block on the page.
- Reduce grid `gap` from `10px` to `8px`. Slightly soften `.bento-cell` border: `border: 1px solid hsl(var(--border) / 0.6)` and `border-radius: 6px`.
- Keep the `View more photos →` link below.

#### 4.6 Experience

- Move this to the bottom of the home page (after Photography), not the middle. Experience is long — it should sit at the end, not interrupt the narrative.
- Replace the 3-column grid with a simpler stacked list per role:

```
<ol class="space-y-6">
  <li>
    <div class="flex items-baseline justify-between gap-4">
      <h3 class="font-medium">{role}</h3>
      <time class="shrink-0 text-xs text-muted-foreground tabular-nums">{range}</time>
    </div>
    <p class="text-sm text-muted-foreground">{organisation}</p>
    <ul class="mt-2 text-sm leading-[1.7] list-disc pl-5 space-y-1">
      <li>…</li>
    </ul>
  </li>
</ol>
```

- Keep existing copy verbatim. Fix the existing typo `desingers` → `designers`.

#### 4.7 Philosophy

- Either fold the 4 bullets into a single tight paragraph, or keep as a small bulleted list under an eyebrow label `Philosophy`. Prefer paragraph form for minimalism.
- Place it between About and Writing (it's short and thematic).

### 5. `src/pages/notes/index.astro`

- `<h1>Notes</h1>` using `var(--text-3xl)`.
- One-line tagline in `text-muted-foreground`, `var(--text-base)`. Drop the current `text-xl` treatment.
- Render all posts with the same `ul.divide-y` list-row style as home. No card borders. Date on the right as `MMM YYYY` in `text-xs tabular-nums`.

### 6. `src/pages/notes/[slug].astro` (reading page)

This is the core reading experience. Improve the existing minimal layout — **do not add new elements**.

- Top: text-only back link `← Back to notes`, `text-sm`, `text-muted-foreground`.
- Cover image: keep. Reduce corner radius from `rounded-lg` to `rounded-md`. Drop the aspect-ratio wrapper to `aspect-[16/9]`. Add `loading="eager"` and a small bottom margin (`mb-10`).
- Meta line: `{MMM D, YYYY}` in `text-xs uppercase tracking-[0.08em] text-muted-foreground`.
- Title: `<h1>` at `var(--text-4xl)`, `Raleway 600`, `leading-[var(--leading-heading)]`, `tracking-[var(--tracking-tight)]`. One line below the meta.
- Optional `description` line: render the frontmatter `description` just under the title, `var(--text-lg)`, `text-muted-foreground`, `font-[Georgia]` italic for editorial feel. This stays minimal (no new element — reuses existing frontmatter).
- Body: keep `<div class="prose prose-lg max-w-none">`. Verify `.prose` uses `Georgia` (already configured in `tailwind.config.mjs` DEFAULT typography). Bump `--tw-prose-body` line-height implicitly via the prose preset; no custom overrides needed.
- After `<Content />`: no "related notes", no share widgets, no comments. Just a single line `— Nehal` in `text-sm text-muted-foreground`, centered, with top border `border-t border-border/60 pt-8 mt-16`. This is the only new text element, and it's only text.

---

## Components to touch

- `src/layouts/BaseLayout.astro` — padding tweak only.
- `src/components/Navbar.astro` — drop border, fix alignment.
- `src/components/Footer.astro` — drop SVG icons, switch to text links.
- `src/components/ArticleCard.astro` — refactor to flat list-row.
- `src/components/photoBento.astro` — style polish only (gap, radius).
- `src/styles/global.css` — add size + spacing CSS vars; drop unused component classes; confirm `.section-title` still targets `text-xs uppercase tracking-[0.08em]`.
- `src/pages/index.astro` — rebuild per section spec above.
- `src/pages/notes/index.astro` — switch to list rows.
- `src/pages/notes/[slug].astro` — polish per spec above.

Do not touch `src/content.config.ts`, `astro.config.mjs`, or any markdown in `src/content/blog/`.

---

## Step-by-step execution order

1. Update `src/styles/global.css`: add the CSS vars (`--text-*`, `--leading-*`, `--tracking-*`, `--space-*`), refine the HSL colors listed above, and adjust `@layer base` `h1…h4` sizes to use the vars. Remove unused rules.
2. Refactor `ArticleCard.astro` to the list-row pattern.
3. Refactor `Navbar.astro` and `Footer.astro` per spec.
4. Rebuild `src/pages/index.astro` section by section in the new order: Hero → About → Philosophy → Writing → Projects → Photography → Experience.
5. Rebuild `src/pages/notes/index.astro` using the new list style.
6. Polish `src/pages/notes/[slug].astro` per spec.
7. Run `npm run build`. Fix any type or template errors.
8. Spot-check generated HTML in `dist/` for: hero name, intro paragraph, post titles on home, all post titles on `/notes`, note title + cover rendered on a post page.

---

## Acceptance checklist

- [ ] No new dependencies in `package.json`.
- [ ] No new `@import` in `global.css`.
- [ ] Only two images visible on home: the circular profile photo and the photography bento. Projects retain small 32px thumbnails (acceptable as meta, not imagery).
- [ ] No bordered rounded cards anywhere.
- [ ] Single-column layout on all viewports.
- [ ] Notes reading page: cover → meta → title → description → prose → sign-off. Nothing else.
- [ ] `Raleway` for headings, `Work Sans` for UI body, `Georgia` for `.prose` reading body — verified visually.
- [ ] `npm run build` passes. Static HTML contains all expected text.
- [ ] Lighthouse: Performance ≥ 98, Accessibility ≥ 95 on `/` and a representative note page.

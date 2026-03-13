---
name: lovable-to-astro-migration
description: >
  Migrate a Lovable-generated React/Vite SPA (nehal-notes-design) into a
  fully static Astro site (nehal-work-astro). Use this skill whenever the
  user asks to migrate, port, rebuild, or convert content and design from
  the source repo into the Astro project. Covers content extraction, component
  conversion, routing, styling, layout, SEO setup, and Supabase blog migration
  to Astro Content Collections.
---

# Lovable → Astro Migration Skill

You are acting as a senior frontend engineer migrating a Lovable-generated
React/Vite SPA into a static Astro site. Your job is to produce a clean,
fully pre-rendered, SEO-friendly Astro site that preserves all content,
visual design, and routing from the source project.

---

## Repos

| Role        | Path                                      |
|-------------|-------------------------------------------|
| Source      | `../nehal-notes-design/` (Lovable/React)  |
| Destination | `./` (current Astro project)              |

Adjust relative paths if the repos sit at different locations.

---

## Phase 0 — Audit the source repo first

Before writing a single file, read the source repo thoroughly.

```
../nehal-notes-design/
├── src/
│   ├── pages/        ← or App.tsx / router config
│   ├── components/
│   ├── styles/       ← or index.css / tailwind.config
│   └── assets/
├── public/
├── package.json
└── tailwind.config.*
```

Checklist — confirm you have found:
- [ ] All page-level components (Home, About, Blog, etc.)
- [ ] All shared layout components (Navbar, Footer, etc.)
- [ ] The CSS approach: Tailwind, CSS modules, plain CSS, or a mix
- [ ] All fonts referenced (Google Fonts import, local fonts in /public)
- [ ] All images and their paths
- [ ] Color tokens / CSS variables / Tailwind theme config
- [ ] Any markdown or MDX content files
- [ ] External dependencies (icon libraries, animation libs, etc.)
- [ ] Supabase integration — find the client setup file (usually
  `src/lib/supabase.ts` or similar) and note which tables are queried
- [ ] Blog-related Supabase queries — find the table name, columns fetched,
  and any filters used (e.g. `published = true`, ordering by `created_at`)

Do not proceed to Phase 1 until the audit is complete.

---

## Phase 1 — Scaffold the Astro project

Verify that `astro` and a base layout exist. If the project is fresh:

```bash
# Already done if the project exists — just verify
cat package.json | grep astro
```

Install required integrations based on what the source uses:

```bash
# Always add these
npx astro add sitemap

# Add if source uses Tailwind
npx astro add tailwind

# Add if source uses React components you want to reuse
npx astro add react

# Add Cloudflare adapter for deployment
npx astro add cloudflare
```

Confirm `astro.config.mjs` looks like this after adding integrations:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';       // if used
import react from '@astrojs/react';             // if used
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nehal.work',
  output: 'static',
  adapter: cloudflare(),
  integrations: [tailwind(), react(), sitemap()],
});
```

---

## Phase 2 — Migrate styles and design tokens

### If source uses Tailwind:

Copy the Tailwind config and extend it in the Astro project:

```bash
cp ../nehal-notes-design/tailwind.config.* ./
```

Preserve custom colors, fonts, spacing in `tailwind.config.mjs`:

```js
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Paste all custom theme values from source here
    },
  },
};
```

### If source uses plain CSS / CSS variables:

Create `src/styles/global.css` and paste all `:root` variables and base
styles from the source. Import it once in your base layout:

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
---
```

### Fonts:

If the source imports Google Fonts via a `<link>` tag or CSS `@import`,
move that import into the `<head>` of `BaseLayout.astro`. Prefer using
`<link rel="preconnect">` for performance.

---

## Phase 3 — Build the base layout

Create `src/layouts/BaseLayout.astro`. This is the single wrapper every
page will use. It must include:

- `<html lang="en">`
- `<head>` with charset, viewport, canonical, title, meta description,
  Open Graph tags, and font imports
- The `<Navbar />` component
- `<slot />` for page content
- The `<Footer />` component
- Any global CSS imports

```astro
---
// src/layouts/BaseLayout.astro
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  image?: string;
}

const {
  title,
  description = 'Nehal Joshi — Education, Design, Thought Leadership.',
  image = '/og-default.png',
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href={canonicalURL} />
    <title>{title}</title>
    <meta name="description" content={description} />
    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={canonicalURL} />
    <meta name="twitter:card" content="summary_large_image" />
    <!-- Sitemap -->
    <link rel="sitemap" href="/sitemap-index.xml" />
  </head>
  <body>
    <Navbar />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

---

## Phase 4 — Migrate components

For each React component in the source (`src/components/*.tsx`), decide:

| Component type              | Astro strategy                              |
|-----------------------------|---------------------------------------------|
| Pure display, no state      | Rewrite as `.astro` component               |
| Has useState / hooks        | Keep as `.tsx`, import with `client:load`   |
| Animation only (framer etc) | Keep as `.tsx`, import with `client:visible`|
| Navbar / Footer             | Rewrite as `.astro` (simpler, no JS needed) |

### Rewriting a React component as Astro:

Source (`Navbar.tsx`):
```tsx
export function Navbar() {
  return (
    <nav className="flex justify-between p-4">
      <a href="/">Nehal</a>
      <a href="/about">About</a>
    </nav>
  );
}
```

Destination (`Navbar.astro`):
```astro
<nav class="flex justify-between p-4">
  <a href="/">Nehal</a>
  <a href="/about">About</a>
</nav>
```

Key differences:
- `className` → `class`
- No import/export needed in `.astro`
- No `{}` for static strings — use them only for JS expressions

### Keeping a React component that has interactivity:

```astro
---
// src/pages/index.astro
import ContactForm from '../components/ContactForm.tsx';
---
<!-- This renders the React component with client-side JS -->
<ContactForm client:load />
```

Use `client:load` for components needed immediately.
Use `client:visible` for components below the fold (better performance).

---

## Phase 5 — Migrate pages

Create one `.astro` file in `src/pages/` per route. Map routes exactly:

| Source route | Astro file                    |
|--------------|-------------------------------|
| `/`          | `src/pages/index.astro`       |
| `/about`     | `src/pages/about.astro`       |
| `/blog`      | `src/pages/blog/index.astro`  |
| `/blog/:slug`| `src/pages/blog/[slug].astro` |

### Page template:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Nehal Joshi | Home"
  description="Designer and educator shaping learning experiences."
>
  <!-- Paste or rebuild page content here -->
  <section class="...">
    <h1>...</h1>
  </section>
</BaseLayout>
```

Extract content from the source page component and rebuild the JSX as HTML
inside the Astro template. Remember:
- `className` → `class`
- `{variable}` stays as `{variable}`
- Event handlers like `onClick` only work inside `.tsx` components
- Conditional rendering: `{condition && <div>}` works in Astro

---

## Phase 6 — Migrate blog from Supabase to Astro Content Collections

The blog in `nehal-notes-design` is backed by Supabase. **Do not migrate the
Supabase integration.** Instead, export all posts once as markdown files and
use Astro Content Collections going forward. This is a one-time migration —
after it's done, Supabase is fully removed from the blog workflow.

### Step 6.1 — Audit the Supabase schema

Find the Supabase client and blog query in the source repo. Look for files like:
- `src/lib/supabase.ts` — client initialisation and table types
- Any file calling `.from('posts')` or similar

Note the exact column names used. They likely include some of:

```
id, title, slug, description, content, tags, published, created_at, updated_at, cover_image
```

### Step 6.2 — Export posts from Supabase

**Do this step manually** (outside the agent) in the Supabase dashboard:

1. Go to **Table Editor → your posts table**
2. Click **Export → Download as CSV** (or JSON if available)
3. Save the file as `posts.json` or `posts.csv` at the root of `nehal-work-astro/`

Alternatively, export via the Supabase CLI:
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Export the posts table
supabase db dump --data-only --table posts > posts.sql
```

Or use a quick Node script if you have the Supabase keys available:

```bash
# Save as fetch-posts.mjs at repo root, then run:
node fetch-posts.mjs
```

```js
// fetch-posts.mjs
// Run this ONCE locally to pull posts from Supabase before removing integration.
// Requires SUPABASE_URL and SUPABASE_ANON_KEY set in your environment or .env

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { data: posts, error } = await supabase
  .from('posts')               // ← adjust table name if different
  .select('*')
  .eq('published', true)       // ← remove this line if no published flag
  .order('created_at', { ascending: false });

if (error) {
  console.error('Supabase error:', error);
  process.exit(1);
}

fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
console.log(`✅ Exported ${posts.length} posts to posts.json`);
```

### Step 6.3 — Convert posts JSON to markdown files

Once `posts.json` exists at the repo root, run this conversion script:

```bash
node scripts/convert-posts.mjs
```

Create the script at `scripts/convert-posts.mjs`:

```js
// scripts/convert-posts.mjs
// Converts posts.json (exported from Supabase) into Astro-ready markdown files.
// Each post becomes src/content/blog/<slug>.md with proper frontmatter.

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './src/content/blog';

// Load exported posts
const raw = fs.readFileSync('./posts.json', 'utf-8');
const posts = JSON.parse(raw);

// Create output directory if it doesn't exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let converted = 0;
let skipped = 0;

for (const post of posts) {
  // --- Map Supabase columns to frontmatter ---
  // Adjust the field names below to match your actual Supabase column names.
  const title       = post.title       ?? 'Untitled';
  const description = post.description ?? post.excerpt ?? '';
  const pubDate     = post.created_at
    ? post.created_at.split('T')[0]   // "2024-03-15T10:00:00Z" → "2024-03-15"
    : new Date().toISOString().split('T')[0];
  const updatedDate = post.updated_at
    ? post.updated_at.split('T')[0]
    : null;
  const tags        = Array.isArray(post.tags)
    ? post.tags
    : (post.tags ? post.tags.split(',').map(t => t.trim()) : []);
  const coverImage  = post.cover_image ?? post.image ?? null;
  const content     = post.content     ?? post.body  ?? '';

  // --- Generate a slug ---
  // Use the existing slug field, or derive one from the title.
  const slug = post.slug
    ?? title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

  if (!slug) {
    console.warn(`⚠️  Skipping post with no title or slug (id: ${post.id})`);
    skipped++;
    continue;
  }

  // --- Build frontmatter ---
  const tagLine = tags.length > 0
    ? `\ntags: [${tags.map(t => `"${t}"`).join(', ')}]`
    : '';
  const imageLine = coverImage
    ? `\ncoverImage: "${coverImage}"`
    : '';
  const updatedLine = updatedDate
    ? `\nupdatedDate: ${updatedDate}`
    : '';

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: ${pubDate}${updatedLine}${tagLine}${imageLine}
---

`;

  // --- Write the file ---
  const filePath = path.join(OUTPUT_DIR, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    console.warn(`⚠️  File already exists, skipping: ${filePath}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(filePath, frontmatter + content, 'utf-8');
  console.log(`✅ Created: ${filePath}`);
  converted++;
}

console.log(`\nDone. ${converted} posts converted, ${skipped} skipped.`);
console.log(`Posts written to: ${OUTPUT_DIR}`);
```

After running, verify the output:
```bash
ls src/content/blog/
# Should show one .md file per post, e.g.:
# designing-better-learning.md
# ux-for-education.md
```

Open a few files and confirm frontmatter looks correct before proceeding.

### Step 6.4 — Define the content collection schema

Create `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:        z.string(),
    description:  z.string(),
    pubDate:      z.coerce.date(),
    updatedDate:  z.coerce.date().optional(),
    tags:         z.array(z.string()).optional().default([]),
    coverImage:   z.string().optional(),
  }),
});

export const collections = { blog };
```

### Step 6.5 — Build the blog index page

Create `src/pages/blog/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<BaseLayout
  title="Blog | Nehal Joshi"
  description="Thoughts on education, design, and learning systems."
>
  <section>
    <h1>Writing</h1>
    <ul>
      {posts.map(post => (
        <li>
          <a href={`/blog/${post.slug}`}>
            <h2>{post.data.title}</h2>
            <p>{post.data.description}</p>
            <time datetime={post.data.pubDate.toISOString()}>
              {post.data.pubDate.toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </time>
          </a>
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>
```

### Step 6.6 — Build the individual post page

Create `src/pages/blog/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props:  { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

const {
  title,
  description,
  pubDate,
  updatedDate,
  tags = [],
  coverImage,
} = post.data;
---

<BaseLayout title={`${title} | Nehal Joshi`} description={description} image={coverImage}>
  <article>
    {coverImage && <img src={coverImage} alt={title} />}
    <header>
      <h1>{title}</h1>
      <time datetime={pubDate.toISOString()}>
        {pubDate.toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        })}
      </time>
      {updatedDate && (
        <p>Updated: <time datetime={updatedDate.toISOString()}>
          {updatedDate.toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </time></p>
      )}
      {tags.length > 0 && (
        <ul class="tags">
          {tags.map(tag => <li>{tag}</li>)}
        </ul>
      )}
    </header>

    <Content />
  </article>
</BaseLayout>
```

### Step 6.7 — Remove all Supabase code

Once you've verified posts render correctly in the browser:

```bash
# Remove the Supabase client library
npm uninstall @supabase/supabase-js

# Delete Supabase-related source files
rm -f src/lib/supabase.ts
rm -f src/lib/supabase.js

# Delete any blog fetch hooks/utilities
# (find and delete files like usePosts.ts, fetchPosts.ts, etc.)

# Remove Supabase env vars from .env
# Delete lines starting with SUPABASE_ from .env and .env.example

# Clean up the one-time export files
rm -f posts.json
rm -f fetch-posts.mjs
```

Also check `src/pages/blog/` and any page component in the source for
`import ... from '@supabase/supabase-js'` — remove all such imports.

### Step 6.8 — Verify blog content renders as static HTML

```bash
npm run build
curl -s dist/blog/index.html | grep "<h2"
# Should print your post titles — if empty, content is not being pre-rendered
```

Each post must have its own `.html` file in `dist/blog/`:
```bash
ls dist/blog/
# Expected:
# index.html
# designing-better-learning/index.html
# ux-for-education/index.html
# ... one folder per post
```

---

## Phase 7 — Migrate assets

```bash
# Copy all images and static files
cp -r ../nehal-notes-design/public/* ./public/

# If source has assets inside src/assets
cp -r ../nehal-notes-design/src/assets/* ./public/assets/
```

Update image paths in `.astro` files to reference `/assets/filename.ext`.

Use Astro's built-in `<Image />` component for optimised images:

```astro
---
import { Image } from 'astro:assets';
import portrait from '../assets/portrait.jpg';
---
<Image src={portrait} alt="Nehal Joshi" width={400} height={400} />
```

---

## Phase 8 — SEO & Performance checklist

Before declaring migration done, verify:

- [ ] Every page has a unique `<title>` and `<meta name="description">`
- [ ] Open Graph tags present on all pages
- [ ] `sitemap-index.xml` is generated (check after `npm run build`)
- [ ] No `console.log` statements in production code
- [ ] All images have `alt` attributes
- [ ] Fonts use `rel="preconnect"` and `display=swap`
- [ ] No `client:load` on components that don't need interactivity
- [ ] `robots.txt` exists in `/public`

Create `/public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://nehal.work/sitemap-index.xml
```

---

## Phase 9 — Build and verify

```bash
# Run dev server and manually check each page
npm run dev

# Then run a production build and inspect the output
npm run build

# The dist/ folder should contain .html files for every route
ls dist/
# Expected: index.html  about/index.html  blog/index.html  etc.
```

If `dist/` contains only one `index.html` with no content, the output
mode is wrong — confirm `output: 'static'` in `astro.config.mjs`.

---

## Phase 10 — Cloudflare Pages deployment

Verify the repo is pushed to GitHub. In Cloudflare Pages:

| Setting          | Value           |
|------------------|-----------------|
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Node version     | 18+             |

Set environment variable if needed: `NODE_VERSION = 18`

---

## Common gotchas

| Problem                          | Fix                                                    |
|----------------------------------|--------------------------------------------------------|
| Blank page in production         | Check `output: 'static'` in config                    |
| `className` errors               | Change to `class` in `.astro` files                   |
| React hooks not working          | Make sure component file is `.tsx` with `client:*`     |
| Images 404 in prod               | Move to `/public`, reference as `/filename.ext`        |
| Fonts not loading                | Add `crossorigin` attribute to preconnect link         |
| CSS not applied                  | Ensure global CSS is imported in `BaseLayout.astro`    |
| Tailwind classes not working     | Check `content` paths include `./src/**/*.{astro,tsx}` |
| Dynamic routes returning 404     | Confirm `getStaticPaths()` is exported                 |
| Supabase env vars missing        | Delete them — Supabase is fully removed after Phase 6  |
| Posts not showing after export   | Check column name mapping in `convert-posts.mjs`       |
| `pubDate` type error in schema   | Use `z.coerce.date()` not `z.date()` in config.ts      |
| Post content has raw HTML        | Rename `.md` to `.mdx` and add `import` at top        |

---

## Definition of done

The migration is complete when:

1. `npm run build` completes with zero errors
2. `dist/` contains a real `.html` file for every page with visible text content
3. Fetching any page URL with `curl` (no JavaScript) returns the full page copy
4. All original pages and routes are accessible
5. Visual design matches the source site
6. `dist/blog/` contains one subfolder per post, each with an `index.html`
7. `curl dist/blog/your-post-slug/index.html` returns post title and body text
8. `@supabase/supabase-js` is no longer in `package.json`
9. No `SUPABASE_` variables remain in `.env` or source code
10. Lighthouse score ≥ 90 on Performance and SEO
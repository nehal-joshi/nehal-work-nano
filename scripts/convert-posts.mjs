import fs from 'node:fs';
import path from 'node:path';

const INPUT_FILE = './posts.json';
const OUTPUT_DIR = './src/content/blog';

if (!fs.existsSync(INPUT_FILE)) {
  console.error('Missing posts.json at project root.');
  process.exit(1);
}

const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
const posts = JSON.parse(raw);

if (!Array.isArray(posts)) {
  console.error('posts.json must contain an array of posts.');
  process.exit(1);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let converted = 0;
let skipped = 0;

for (const post of posts) {
  if (post.published === false) {
    skipped += 1;
    continue;
  }

  const title = post.title ?? 'Untitled';
  const description = post.excerpt ?? post.description ?? '';
  const pubDate = post.date
    ? String(post.date).split('T')[0]
    : new Date().toISOString().split('T')[0];
  const updatedDate = post.updated_at ? String(post.updated_at).split('T')[0] : null;
  const tags = Array.isArray(post.tags)
    ? post.tags
    : post.tags
      ? String(post.tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
  const coverImage = post.hero_image_url ?? post.cover_image ?? post.image ?? null;
  const content = post.content ?? post.body ?? '';

  const slug =
    post.slug ??
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  if (!slug) {
    skipped += 1;
    continue;
  }

  const frontmatter = [
    '---',
    `title: "${String(title).replace(/"/g, '\\"')}"`,
    `description: "${String(description).replace(/"/g, '\\"')}"`,
    `pubDate: ${pubDate}`,
    ...(updatedDate ? [`updatedDate: ${updatedDate}`] : []),
    ...(tags.length > 0 ? [`tags: [${tags.map((t) => `"${String(t).replace(/"/g, '\\"')}"`).join(', ')}]`] : []),
    ...(coverImage ? [`coverImage: "${String(coverImage).replace(/"/g, '\\"')}"`] : []),
    '---',
    '',
  ].join('\n');

  const filePath = path.join(OUTPUT_DIR, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    skipped += 1;
    continue;
  }

  fs.writeFileSync(filePath, frontmatter + String(content), 'utf-8');
  converted += 1;
}

console.log(`Converted: ${converted}`);
console.log(`Skipped: ${skipped}`);

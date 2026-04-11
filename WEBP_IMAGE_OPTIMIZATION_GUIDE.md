# WebP Image Optimization Guide (Quality + Speed)

This guide explains a practical process to compress product images for better speed without making them look blurry.

It is written for this project stack:

- Next.js frontend
- Cloudinary product images
- Netlify deployment

---

## Goals

For mobile commerce pages, aim for:

- Product grid image: 8 KB to 18 KB
- Product detail main image: 15 KB to 35 KB
- Keep visual quality acceptable on DPR 2 and DPR 3 screens

If your images are currently around 20 KB to 24 KB, many can be reduced by 15% to 40% with the correct pipeline.

---

## Recommended Strategy

Use a two-layer strategy:

1. Cloudinary runtime optimization for product images stored in Cloudinary.
2. Offline compression for local static images in public/images.

This gives the best result because Cloudinary can dynamically optimize by device, while local assets are optimized once at build-time.

---

## Part A: Cloudinary Optimization (Primary)

### 1) Use transformed Cloudinary URLs

For Cloudinary URLs, always deliver with format and quality automation:

- f_auto
- q_auto:good (or q_auto:eco for smaller files)
- dpr_auto
- c_limit with width for each UI slot

Example transformed URL pattern:

```text
https://res.cloudinary.com/<cloud-name>/image/upload/f_auto,q_auto:good,dpr_auto,c_limit,w_800/<public-id>
```

### 2) Width recommendations by page section

- Product card: w_500
- Product detail hero: w_900
- Cart thumbnail: w_120
- Wishlist/profile small tile: w_200

Avoid sending full-size originals when only small containers are rendered.

### 3) Choose quality mode

- q_auto:good: best default for quality and speed balance
- q_auto:eco: smallest files, useful for list pages
- q_auto:best: only for zoom-heavy or premium hero images

Suggested default:

- Product listing and search: q_auto:eco
- Product detail main image: q_auto:good

### 4) With Next Image

When using next/image, keep using sizes and let Cloudinary deliver optimized URLs.

Example sizes guidance:

```jsx
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
```

The goal is to avoid downloading a large image for a small rendered box.

---

## Part B: Compress Local Static Images (public/images)

Use this for placeholders, banners, and static assets that are not Cloudinary-hosted.

### 1) Install tools

```bash
npm install -D sharp fast-glob
```

### 2) Add script file

Create scripts/optimize-webp.mjs:

```js
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const INPUT_GLOB = ['public/images/**/*.{jpg,jpeg,png,webp}'];
const OUTPUT_DIR = 'public/images-optimized';

const QUALITY = 72; // Good balance for ecommerce
const METHOD = 6;   // Better compression effort

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const files = await fg(INPUT_GLOB, { dot: false });

for (const file of files) {
  const rel = path.relative('public/images', file);
  const outPath = path.join(OUTPUT_DIR, rel).replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  await sharp(file)
    .rotate() // respect EXIF orientation
    .webp({ quality: QUALITY, effort: METHOD })
    .toFile(outPath);

  const [oldStat, newStat] = await Promise.all([fs.stat(file), fs.stat(outPath)]);
  const saved = (((oldStat.size - newStat.size) / oldStat.size) * 100).toFixed(1);
  console.log(`${rel} -> ${path.relative('public', outPath)} | ${saved}% saved`);
}
```

### 3) Add package script

```json
{
  "scripts": {
    "images:optimize": "node scripts/optimize-webp.mjs"
  }
}
```

### 4) Run optimization

```bash
npm run images:optimize
```

### 5) Validate before replacing originals

- Compare image sharpness on mobile and desktop.
- Check text/logo edges and dark gradients.
- Replace only approved files in public/images.

---

## Quality Tuning Matrix

Use this matrix if quality still looks too soft or file size is still too big:

- High detail fabric textures:
  - q_auto:good or WebP quality 76 to 82
- Product cards and thumbnails:
  - q_auto:eco or WebP quality 62 to 72
- Large banners/hero:
  - q_auto:good or WebP quality 74 to 80

Do not force one quality for every image type.

---

## Performance Verification Process

1. Open Chrome DevTools Network tab.
2. Filter by Img.
3. Compare before and after for:
   - Total image transfer size
   - Largest Contentful Paint image request size
   - Product list cumulative image payload
4. Test on mobile viewport (for example 390px width).
5. Keep changes only if visual quality remains acceptable.

Expected improvement after proper optimization:

- 15% to 40% image payload reduction
- Faster first contentful render on product and shop pages

---

## Common Mistakes to Avoid

- Compressing multiple times in sequence (quality drops each generation).
- Sending full-resolution Cloudinary image without width limit.
- Using q_auto:best everywhere.
- Forgetting sizes with next/image.
- Replacing all images blindly without visual QA.

---

## Suggested Rollout Plan

1. Start with product listing images only.
2. Measure speed and quality.
3. Apply to product detail images.
4. Optimize local static assets in public/images.
5. Re-check Core Web Vitals on production.

---

## Quick Checklist

- Cloudinary URLs include f_auto,q_auto,dpr_auto,w_<target>
- Correct width used per component
- next/image sizes is defined
- Local static assets compressed with sharp script
- Visual QA passed on mobile and desktop
- Network payload reduced in DevTools

---

## Optional Next Improvement

If needed, add an image URL builder helper in src/lib so all Cloudinary URLs are consistently transformed from one place. This avoids manual mistakes and keeps quality/performance settings centralized.

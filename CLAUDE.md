# Project rules — TempLoveMemo

## Images: webp + lazyload before every commit/push

Before every `git commit`/push that adds or changes an image asset:

1. **Convert to WebP.** Any new/changed raster image (jpg/png) under `assets/`
   must be converted to `.webp` (use `cwebp`, quality ~80 is fine for photos;
   use lossless only for sharp UI art if quality visibly degrades). Reference
   the `.webp` file everywhere, don't ship the original alongside it unless
   something still needs it.
2. **Lazyload it.** Any `<img>` that isn't above-the-fold on first paint
   (i.e. not part of Step 1's cover) gets `loading="lazy"`. Images injected
   via JS (`js/app.js`, e.g. gallery photos, timeline polaroids) get
   `loading="lazy"` set on the element too. Don't lazyload the couple of
   assets already `<link rel="preload">`d in `index.html` — those are
   deliberately eager.

This is a site meant to be opened once, from a shared link, often on mobile
data — first paint speed matters more than usual here.

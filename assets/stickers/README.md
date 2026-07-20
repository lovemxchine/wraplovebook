Drop your own sticker images here (scans, your own photos, or explicitly
CC0/licensed stickers only — see CONTEXT.md, "Scrapbook sticker decorations"
decision, for why: never Pinterest/stock cutouts you don't hold rights to).

## Currently wired in

| file | source | used on |
|---|---|---|
| `star.png` | HandDrawn pack, element_02 | Step 1 |
| `hearts.png` | HandDrawn pack, element_01 | Step 3 (games intro) |
| `happy-place.png` | re-cropped 2026-07-20 from a concurrent session's re-cut of the user sticker sheet | Step 3 (Love Quiz card) |
| `firework.png` | HandDrawn pack, element_08 | Step 3 (Heart Hunt card) |
| `favorite-person.png` | re-cropped 2026-07-20 (see above) — replaces an earlier crop that went missing when another session re-cut the sheet | Step 4 |
| `record-vinyl.png` | user-provided sticker sheet, 2026-07-20 | Step 5 |
| `i-love-you.png` | user-provided sticker sheet, 2026-07-20 | Step 6 |
| `fingerprint-heart.png` | re-cropped 2026-07-20 (see above) — clean crop, no bleed/notch this time, replaces the temporary `flower.png` stand-in | Step 7 |
| `heart-star-duo.png` | HandDrawn pack | Step 2 (Mission card, top-left corner — card had no sticker before) |
| `envelope-heart.png` | HandDrawn pack | Step 7 (Letter card, bottom-right corner — envelope motif fits the letter itself; the earlier "no envelope" call was Step-1-specific, not a blanket ban) |

All hand-cropped from source composites and alpha-checked (corner + gap
pixels sampled for transparency) *and* visually inspected at actual display
size before use — alpha-only checks aren't enough, see the `flower.png` note
below.

## Available, not yet used

`couple-heart-string.png` is already used once as the Step 1 hero centerpiece
and not reused elsewhere to keep it feeling special.

## Don't re-add blind

- The HandDrawn pack's *named* files (`record.png`, `i_love_you.png`,
  `favorite_person.png`, `always.png`, `happy_place.png`) were corrupted in
  that source zip — all five were the same wrong crop of an unrelated
  mockup, not the sticker art their names promised. Confirmed via
  pixel-sampling.
- `question_mark.png` (Step 2) and the Memory Match minigame were removed
  2026-07-19 per direct request.
- `memories-bubble.png` (Step 4) was removed 2026-07-19 — not from any
  sticker pack, bright pink/magenta, clashed with the palette.
- `mini-hearts.png` (element_09, Step 2) was removed 2026-07-20 — genuinely
  low quality (a muddled overlapping-heart blob) even at native res. No
  replacement fit that small a corner slot, so it was just dropped.
- `always-banner.png` (Step 5) — the file was deleted by a concurrent
  session re-cutting this folder's stickers, with no equivalent replacement
  among the new crops. Dropped rather than forced; Step 5's card doesn't
  need it now that the cassette-tape graphic (pure CSS, see `.cassette` in
  style.css) is the visual centerpiece there.
- `flower.png` — **removed 2026-07-20, do not re-add.** It came from the
  same batch as `sticker-1..9.png` (a concurrent session's re-crop of the
  sticker sheet) and passed the usual corner-alpha check, but has a faint
  diagonal repeating stock-photo watermark baked into the artwork itself —
  invisible at the ~46px display size it was used at, but clearly visible
  zoomed in or at high contrast. This is why alpha-only verification isn't
  sufficient: always visually zoom/contrast-check new crops before wiring
  them in, not just sample corner pixels for transparency.
- `sticker-1.png` (an "i love you" crop from the same concurrent-session
  batch) was rejected and not renamed/kept — badly warped/curved crop,
  visibly worse than the existing `i-love-you.png` already in use.

# CONTEXT.md

Single source of truth for architecture decisions and domain glossary for this
project. AI-agent-agnostic — any coding agent should be able to read this file
+ README.md and be productive.

Last updated: 2026-08-06 (scrapbook spread inserted as Step 6 — 7 steps now)

---

## What is this?

A single-use, hardcoded surprise/memory website made for one specific couple —
not a SaaS, not a reusable template with an editing UI. All content (photos,
music, messages, dates) lives directly in the site's code/data as a static
site. No backend, no database, no accounts.

The visitor experience is a **linear, locked 7-step flow**:

| Step | Screen | Advances when |
|---|---|---|
| 1 | Cover | tapping the notepad |
| 2 | Unlock Mission (6-digit pin) | the pin matches `DATA.metDate` |
| 3 | Questions | every question answered, then the score summary's "ไปต่อ" |
| 4 | Journey text | auto-advances after the line fades |
| 5 | Memory Gallery (camera) | the photo modal has been opened and closed once |
| 6 | Scrapbook spread (photo collage) | "ไปต่อ" |
| 7 | The Letter (closing scrapbook spread) | — end of flow |

Each step unlocks only after the previous one is completed — no skipping
ahead. `?page=N` jumps straight to a step, for testing only.

Steps that existed earlier and were cut: Mini Games (replaced by the simpler
Questions step), Our Song as its own screen (the song is now background music
across the whole site), Reasons I Love You, Final Surprise, and a separate
Ending screen (folded into the letter). Voice Message is written but paused —
its markup is commented out in `index.html` and `renderVoice()` is not called.

## Architecture decisions

### Decision: Static site, no backend/database
**Choice**: Vanilla HTML/CSS/JS, no framework, no build step. All content
hardcoded into the site's own files.

**Why**: This is a one-off gift for one couple, not a product for others to
configure. A backend/DB/admin UI would be scope for a SaaS (rejected —
explicit user requirement: "ไม่ใช่ saas แบบทำตัว product").

**Trade-offs accepted**: To make a second version for someone else, someone
edits the code/data directly — no self-serve editing UI. Acceptable since
reuse-by-others was explicitly deferred, not required.

### Decision: Linear locked step progression, no skipping
**Choice**: The steps unlock strictly in order. No jumping ahead, no going
back once past a step.

**Why**: Preserves the "surprise reveal" pacing — the whole point of the
experience is content unlocking progressively, not being browsable upfront.

### Decision: Progress is NOT persisted — every visit restarts at Step 1
**Choice**: The current step lives in memory only. Reloading or reopening the
site always restarts from the cover.

**Why**: This is a gift that gets opened, not an app that gets used. Resuming
mid-flow meant a reload could drop the recipient into the middle of the
surprise, skipping the build-up the pacing depends on.

**Supersedes**: an earlier decision to persist progress to `localStorage`
(key `lovememo-progress`) so a reload resumed where it left off.

### Decision: Mini-games are always winnable — no fail state
**Choice**: All 3 mini-games (Love Quiz, Memory Match, Heart Hunt) unlock the
next step on completion (answered/matched/collected all), regardless of
score or time.

**Why**: The purpose is delight, not testing the recipient. A "fail, try
again" state would work against the surprise/gift framing.

### Decision: No QR generation in the site
**Choice**: The site's own flow starts at the "OPEN" screen. Any physical QR
code (printed on a card/gift) that links to this site's URL is out of scope
— it's produced separately, not by this codebase.

### Decision: Zero runtime dependencies
**Choice**: Everything is native CSS animation/transition + vanilla JS. No
libraries at all.

**Why**: An earlier plan pulled in `canvas-confetti` for the Final Surprise
step; that step no longer exists, and nothing else needed a library. The only
external requests left are the Google Fonts stylesheet and the background-music
YouTube embed.

### Decision: Ending has no Share/Save actions
**Choice**: The letter is the last screen and carries no action buttons.

**Why**: Share (`navigator.share`) and a decorative Save button were built and
then removed — the buttons pulled attention away from the letter, which is the
emotional payload. Download (canvas-rendering a summary image/PDF) was never
built and stays out of scope.

### Decision: All images are WebP
**Choice**: Every asset in `assets/` is `.webp`. No PNG/JPEG originals are
kept in the repo.

**Why**: The PNG set was 15MB, enough to make the first paint and the pin
screen visibly wait on images. WebP took it to 1.8MB (-88%) with full alpha
support, so the transparent stickers are unchanged. Browser support is
universal for the target (any phone that can run this site).

### Decision: Mobile-first, fixed max-width layout
**Choice**: Layout is a fixed-width mobile frame (e.g. `max-width: 480px`)
centered on the page, not a full responsive breakpoint system.

**Why**: The real audience opens this from a phone. On desktop, showing a
centered phone-width frame matches the intended design (mockups are all
phone-screen frames) without building out desktop-specific layouts for a
product no one will actually use on desktop.

### Decision: Deploy target — Cloudflare Pages
**Choice**: Cloudflare Pages, free tier, no custom domain required initially
(`*.pages.dev` is fine).

**Why**: No egress fees (matters if photos/audio are heavy), git-push deploy,
consistent with other projects in this workspace.

### Decision: Scrapbook sticker decorations — CSS-recreated now, real assets later
**Choice**: Two Pinterest sticker-collage moodboard images were shared as a
style reference (vintage vinyl badge, ransom-note "i love you" text, wax
seal, torn-paper handwritten notes, envelope, etc.). These source images are
not owned by the user (Pinterest-sourced illustrations/stock, including a
stranger's personal photo) and are never saved into the repo or shipped on
the site. Two parallel tracks instead:
1. Recreate the same "scrapbook cutout" *feeling* now using original CSS
   shapes (paper-cutout stickers, handwritten-style tags, torn-edge labels),
   consistent with the existing hand-crafted icon set (`.icon-heart` etc.)
   and washi-tape decoration already on cards.
2. Prepare an asset folder for the user's own future sticker images (their
   own scans, photos, or explicitly licensed/CC0 stickers) to drop in later,
   same pattern as the existing `assets/photos/` placeholder flow.

**Why**: Matches the copyright boundary (never redistribute others' work)
while still moving the visual design forward today, and keeps the door open
for the user to swap in real personal/licensed assets later without a
re-architecture.

**Scope for the CSS recreation**: One sticker per Step, torn-paper-label +
handwritten-caption style (e.g. "Favorite person", "You are my sunshine"),
not solid-color circle badges — an earlier circle-badge sticker pass was
tried and rejected ("เยอะเกินแถมไม่สวย" — too much and not pretty). Future
real sticker images go in `assets/stickers/` (separate from
`assets/photos/`, which is reserved for the couple's actual photos).

### Decision: Content is placeholder for now
**Choice**: No real photos yet (no-image placeholders). All text fields
(names, dates, quiz questions, letter body, etc.) left blank/marked for the
user to fill in later.

## Domain glossary

| Term | Meaning |
|---|---|
| **Step** | One of the 6 sequential screens in the flow (see the table above). The unit of locked progression — a Step is either locked, active, or completed. |
| **Mission** | Step 2's unlock puzzle — a 6-digit pin (`DDMMYY` of the date the couple met) that must match to proceed. Correctness is checked against a fixed answer, unlike Questions. |
| **Questions** | Step 3 — a short quiz. Always completable: any answer advances, and the score summary praises the recipient regardless. Score is counted but never blocks. |
| **Memory Gallery** | Step 5 — the camera screen. Tapping the camera ejects one photo per tap onto a pile; tapping the completed pile opens the Photo Viewer. |
| **Photo Viewer** | Step 5's modal — the photos enlarged one at a time over a blurred backdrop, tapping the front one sends it to the back, looping. Opening and closing it once is what reveals the "ไปต่อ" button. |
| **Spread** | Step 6 — a notebook-page photo collage: grid paper, spiral binding, three polaroids zigzagging down the page, and cut-out text strips. Every piece is hand-placed in CSS (`.sp-*`); it is sized to fit the viewport because the flow has no page scroll. |
| **Scrapbook spread** | Step 7's layout — layered paper sheets, washi tape, and stickers around the letter. The visual language the whole site aims for. |

## Sources
- Design reference: two mockup images provided by user (9-step and 8-step
  variants of the same flow), branding "Surprise by ourday" in one variant.
- Resolved via `/grill-with-docs` session, 2026-07-16; flow and decisions
  updated 2026-08-06 to match what actually shipped.

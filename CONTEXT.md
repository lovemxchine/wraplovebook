# CONTEXT.md

Single source of truth for architecture decisions and domain glossary for this
project. AI-agent-agnostic — any coding agent should be able to read this file
+ README.md and be productive.

Last updated: 2026-07-16 (grill-with-docs session, initial scope defined)

---

## What is this?

A single-use, hardcoded surprise/memory website made for one specific couple —
not a SaaS, not a reusable template with an editing UI. All content (photos,
music, messages, dates) lives directly in the site's code/data as a static
site. No backend, no database, no accounts.

The visitor experience is a **linear, locked 9-step flow**: Scan & Open →
Unlock Mission → Mini Games → Memory Gallery → Our Song → Voice Message →
The Letter → Final Surprise → Ending. Each step unlocks only after the
previous one is completed — no skipping ahead.

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
**Choice**: The 9 steps unlock strictly in order. No jumping ahead, no going
back once past a step.

**Why**: Preserves the "surprise reveal" pacing — the whole point of the
experience is content unlocking progressively, not being browsable upfront.

### Decision: Progress persisted via localStorage
**Choice**: Current step + completed mission/game state saved to
`localStorage`. Reopening the site resumes at the saved step instead of
restarting from Step 1.

**Why**: No backend exists to persist state server-side; localStorage is the
native browser mechanism for this and needs no server round-trip.

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

### Decision: One external dependency — canvas-confetti (Final Surprise only)
**Choice**: Everything is native CSS animation/transition + vanilla JS,
except the confetti effect on the Final Surprise step, which uses the
`canvas-confetti` CDN library (~3KB, no sub-dependencies).

**Why**: Confetti physics is native-doable but not worth hand-rolling for one
effect; everything else (heart float, card flip, step transitions) is
straightforward with CSS keyframes.

### Decision: Ending actions — Share is real, Save is decorative, Download is out of scope
**Choice**:
- **Share** → `navigator.share` (Web Share API), shares this site's URL.
- **Save Memory** → visual/animation feedback only, does not persist
  anything (no account/DB to save to).
- **Download** → not built. Would require canvas-rendering a summary
  image/PDF — real scope, deferred.

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
| **Step** | One of the 9 sequential screens in the flow (Scan & Open, Unlock Mission, Mini Games, Memory Gallery, Our Song, Voice Message, The Letter, Final Surprise, Ending). The unit of locked progression — a Step is either locked, active, or completed. |
| **Mission** | Step 2's unlock puzzle — a fill-in prompt (e.g. the date the couple met) that must be answered correctly to proceed. Distinct from Mini Game (no fail state; Mission's correctness is checked against a fixed answer). |
| **Mini Game** | One of 3 interactive games in Step 3 (Love Quiz, Memory Match, Heart Hunt). Always completable — no fail state, only a completion state that unlocks the next Step. |
| **Memory Gallery** | Step 4 — a photo/video collection screen ("Memory Feed" in one mockup, same concept). |
| **Final Surprise** | Step 8 — the climactic reveal screen, includes the confetti effect. |
| **Ending** | Step 9 — closing screen with Share/Save Memory actions. |

## Sources
- Design reference: two mockup images provided by user (9-step and 8-step
  variants of the same flow), branding "Surprise by ourday" in one variant.
- Resolved via `/grill-with-docs` session, 2026-07-16.

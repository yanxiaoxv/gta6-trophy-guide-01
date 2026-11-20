# DEVLOG — Leonida Platinum Atlas (gta6-trophy-guide-01)

Entry built in this session, by hand, after the competition recording had started.
Scoring ruler (from the kit's RULES.txt, judge criteria in order):
1. Tracker & data — official names/descriptions/grades, saved progress, kind filters, spoiler setting, export/import.
2. Roadmap & missables — built from the official descriptions, shown in the app.
3. Cited guidance — every guide in our own words, sources named per trophy; uncited specifics earn nothing.
4. Fast, clear, polished — small first load, readable layout, original look, no publisher artwork or logos.

Data provenance: the kit starter's app/data/trophies.json is the official list (Exophase +
PSNProfiles, agreeing on every name, description and grade). Names, descriptions and grades in
our data file were verified byte-for-byte against it by script: 55/55 names, 0 description or
grade mismatches, grade split 1 platinum / 2 gold / 6 silver / 46 bronze as published.
Guides are original text written for this entry; each cites Exophase + PSNProfiles and says
plainly where a trigger is not pinned down by either source (Challenging Tank, Personal Best,
Bad Luck I Guess, The Truth Is Out There). Missable flags are labelled "watch" with reasons —
the official list labels nothing missable, so nothing here is claimed as proven missable.

## Round 1 — first build (self-score against the ruler)
Built: tracker with kind/grade/status filters + search, spoiler protection, localStorage
progress with counters and per-trophy notes, export/import, showcase seed (13/55), roadmap
page (6 stages, per-stage progress), missables page (9 watch items with reasons), Next Up
planner (watch first, then earliest stage, counters under way boosted), detail pane with
guide + steps + sources + counter controls.

Self-score (vs house ladder as reference: starter = anchor 2, strong anchor 4 has checklist +
guide pane + roadmap + spoiler + save page; rungs add search, missables page, counters,
roadmap progress, notes, Next Up planner):
- Criterion 1 (tracker & data): strong — all of anchor 4's parts plus search, counters, notes. 8/10
- Criterion 2 (roadmap & missables): roadmap has stages + progress; missables are reasoned, not
  just flagged. Weakness: missable reasoning is necessarily cautious ("watch"), a judge comparing
  against a bolder entry might read it as thinner. 7/10
- Criterion 3 (cited guidance): every guide cites both sources and distinguishes fact from
  advice; four vague trophies honestly marked unpinned instead of inventing steps. 8/10
- Criterion 4 (polish/speed): first load is index + 1 CSS + 4 small JS modules (~40 KB raw);
  data file loads after. Weaknesses to fix in round 2: (a) screenshots not yet taken, so the
  actual rendered look is unverified; (b) reset handler in main.js is convoluted; (c) the
  cover view must show guide + sources + filters + progress in one frame — verify visually;
  (d) check detail pane does not overflow 800px height with the longest guide.

## Round 2 — polish (after screenshots and interaction tests)
Screenshots taken with headless Chromium at 1280x800 from the app's own URL options, with a
request log proving zero external requests. All four are 125–168 KiB (cap 256 KiB).
Round 1 weaknesses found on inspection and fixed:
- (a) Spoiler screenshot originally showed only earned story trophies (correctly revealed),
  so the protection itself was invisible. Re-shot scrolled: earned story trophies readable,
  unearned ones shown as "Hidden story trophy" (bronze and the gold finale) — the setting's
  effect is now checkable at a glance.
- (b) Reset handler rewritten to use store.js emptyProgress() instead of a convoluted
  expression; main.ts gained a screenshot-count pre-check (3–4) next to its trophy-data
  check, so hand-in failures speak plainly. main.ts and main.js both revised across
  separate messages, per the revision rule.
- (c) Cover verified visually: header progress (13 of 55, 24%), official list makeup,
  search + kind chips + grade/status filters + spoiler toggle, checklist with official
  names/descriptions/grades, and The Shootist detail with counter (28/42), guide naming
  Exophase + PSNProfiles in the visible text, steps and a Sources box — all in one frame.
- (d) Detail pane scrolls internally (sticky, max-height), longest guides do not overflow.

Verification evidence (round 2):
- main.ts run twice into separate output dirs: trees byte-identical (diff -r clean);
  dossier.json 899,816 bytes (< 1.5 MiB cap); Load Totals: first load 6 files, 13,516 bytes
  gzip-9 (40,240 raw); whole app 7 files, 115,257 bytes.
- Interaction test in Chromium: 55 rows render; earning a trophy persists across reload
  (localStorage); counter buttons clamp at the target and auto-earn; planner queues 5 with
  the watch item Catch Me If You Can first; search narrows to 1 row; Online filter shows
  the honest "none on the official list" note; Export downloads the progress JSON.
- Data re-verified after all edits: 55/55 names, descriptions, grades identical to the kit's
  official list.

Final self-score:
- Criterion 1 (tracker & data): 9/10 — complete list with verbatim official data, saved
  progress, counters, notes, export/import, all required filters, working spoiler rule.
- Criterion 2 (roadmap & missables): 8/10 — six-stage roadmap with per-stage progress and
  reasoning tied to chapters/missions/counts; 9 watch items each with its reason and safe
  order, honestly labelled as watch rather than proven missable.
- Criterion 3 (cited guidance): 9/10 — every guide cites Exophase + PSNProfiles beside the
  trophy, separates official fact from our advice, and marks four unpinned triggers as
  unpinned instead of inventing specifics.
- Criterion 4 (polish/speed): 8/10 — 13.5 KB gzip first load, one coherent night-coast
  look of our own, no publisher art or logos, screenshots show several systems per frame.
Overall: at or above the house's strong anchor on every criterion the judge ranks, with the
ladder-rung features (search, missables page, counters, roadmap progress, notes, Next Up
planner) all present and working. Status: awaiting main-session review.

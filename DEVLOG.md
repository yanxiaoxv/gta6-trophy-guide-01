# DEVLOG — Leonida Platinum Atlas (gta6-trophy-guide-01, rebuild round)

Rebuilt from scratch in a fresh recording after the first submission was
rejected on two recording-technical grounds (an unrelated voice-session
record swept into the first recording, and the final README not witnessed
by that recording). Every file in this repo — including README.md and the
byte-identical rewrite of the data file — was written in this session.

## Data sources

- `app/data/trophies.json` is the kit's official trophy list: 55 trophies,
  1 platinum / 2 gold / 6 silver / 46 bronze, 28 hidden. Names, descriptions
  and grades are verbatim from the official list, on which the two sources
  agree: Exophase (Grand Theft Auto VI PSN trophy list) and PSNProfiles
  (Grand Theft Auto VI trophies). Each trophy in the file also carries an
  original guide, a roadmap stage, steps and a per-trophy `sources` field;
  every guide card in the app cites Exophase + PSNProfiles.
- Verified in-session before writing any UI code: count = 55, grade split
  = 1/2/6/46, every entry has name / description / grade / guide / stage /
  sources, and the 9 `watch` entries are present. The file was then
  rewritten byte-for-byte in this session (sha256 unchanged:
  0fbee7814a9c65c296736238ff846325af815fede8977cee0c061789e08a57ff).
- Honesty rules kept: the 4 trophies whose exact trigger neither source
  pins down (Challenging Tank, Personal Best, Bad Luck, I Guess, The Truth
  Is Out There) are badged "trigger 未定死 / not yet pinned down" and their
  cards say so instead of inventing steps. The official list marks no
  trophy as missable, so the 9 flagged items are presented as a watch list
  with reasons and a safe order — never as confirmed missables.

## Round 1 — build

Shell first (index + one CSS + small JS modules; the 75 KB data file is
fetched after first paint): tracker list with type/grade/status filters,
search and a spoiler shield (unearned story trophies render as "Hidden
story trophy"); per-trophy guide cards (type, missable/watch flag, online
flag, phase, unlock steps, guide, sources, per-trophy notes); localStorage
tracking with counters that auto-light at target, export/import JSON and a
13/55 showcase seed; six-phase roadmap with per-phase progress; missables
watch page (9 items, safe order); Next Up planner (watch → earliest phase
→ counter in progress, top 5). `main.ts` validates the 55-trophy data and
the 3–4 screenshot count before copying and writing the dossier;
`serve.ts` serves `app/` on 8080. Four 1280×800 screenshots taken with
headless Chromium and inspected by eye.

Round 1 self-scores:
- Tracking & data: 9/10 — 55/55 rows, seed 13/55, counters + persistence
  wired; not yet proven by an automated browser pass.
- Roadmap & missables: 9/10 — all six phases with live progress; watch
  page honest and ordered.
- Guide citations: 8/10 — per-card sources and unsettled badges present;
  the unsettled wording could be louder on the card itself.
- Speed & polish: 7/10 — weakest. In the spoiler screenshot the visible
  list rows were all earned, so the masking only showed in Next Up, not
  "at a glance" in the list; a Next Up grade badge wrapped awkwardly under
  long names; the detail counter bar used a span as a block bar.

## Round 2 — fix the weakest (speed & polish, plus spoiler legibility)

- Added deep-linkable filter presets (`?status=`, `?kind=`, `?grade=`).
  The spoiler screenshot now uses `?spoiler=1&status=remaining`: the list
  shows a "Hidden story trophy" row directly beside readable non-story
  rows, while the detail card shows an earned story trophy in full —
  the shield's effect is visible in one frame.
- Next Up items no longer carry the wrapping badge; grade is inline text.
- Counter progress bar markup fixed to a proper block bar.
- Re-shot all four screenshots from the final code and re-inspected each
  by eye (tracker+detail in one frame; roadmap phases with progress;
  watch cards with safe order; spoiler frame as above). All four are
  1280×800 JPEGs under 256 KiB (171–201 KiB).

Round 2 self-scores:
- Tracking & data: 9/10 — now backed by the automated browser pass below.
- Roadmap & missables: 9/10 — unchanged, verified in screenshots 2–3.
- Guide citations: 9/10 — unsettled cards carry the boxed "not yet pinned
  down" notice plus the list badge; sources on every card.
- Speed & polish: 8/10 — spoiler frame fixed, Next Up clean, first load
  is index + 1 CSS + 4 small JS modules with data deferred.

## Acceptance (run on the final build)

- Browser pass (headless Chromium, fresh profile): 55 rows rendered;
  seed state 13/55; Next Up returns exactly 5; search "rhino" narrows to
  exactly 1 (Challenging Tank); toggling the platinum updates 13/55 →
  14/55 and persists across reload; setting the Cunning Stunts counter
  to 250/250 auto-lights it (15/55); export click succeeds; zero external
  requests observed (all traffic localhost).
- `node main.ts` run twice into separate output dirs: dossier.json is
  1,106,589 bytes in both runs, byte-identical (sha256
  96367e96453c845605420f1215c78dca0ff99adaa788dc9d57f8a8acfbe6a563),
  under the 1.5 MiB cap; the copied app/ and screenshots/ trees match the
  repo trees exactly. Verification output dirs were removed afterwards.

Status: 待主会话复验 (awaiting main-session review). Not submitted, not
pushed, not published.

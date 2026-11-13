# Recommendations for Mission 21

*Make the small thing fast. Make the visible thing clear. Make the chosen thing matter.* Two threads, run apart:
engineering first (it changes what every later change costs), and an independent aesthetic investigation. Neither
needs more content.

## Engineering: the first set (immediate, measured, each with a stopping rule)

1. **Small-integration helpers and two ports** (`Tiny.campaign(kyr)`, `Tiny.world(facts)`): port `weary-fights` and
   `voice`'s hour; keep the old versions until the new ones are shown to catch the faults those specs were written
   for (read each spec's comment and git log). *Stop when* the two run in under a second each and catch the same
   faults. (`test-loop.md` summary; `retrospective/architecture.md` improvement 1.)
2. **Kept playthrough prefixes** for `ombra-local` (30 tests, 13.6 CI-min): checkpoint the shared prefix once, keyed
   by content hash; resume each test. *Stop when* the file runs in under two minutes with every assertion holding;
   then the same helper for the other forty-nine playthroughs (§5b).
3. **Make the budget fail** (CI's summary reports tests over 3 minutes and files over 10 since E223's landing work):
   once 1–2 land, turn the report into a failing check for new files, with an explicit allow-list for the old ones
   that shrinks.
4. **A layered suite with names**: the quick suite (unit + small integration + fast adventure specs, budget 30 s),
   the confidence suite (adventure + Westernesse, CI per push), and the long suite (long descents, every province,
   world lint across seeds; scheduled), each with its own command and CI job. Nothing deleted or skipped silently.
5. **Boundary leaks, measured before and after** (no behaviour change): split `module-bundle` from region
   composition; give the parser its kinds as an argument; freeze cached parses in a test run to find mutators
   (`retrospective/architecture.md` 3–5).
6. **Explain T24-11** (an install costs more the more are installed): profile one install early and late in a world.
   It decides whether progressive world realization is worth pursuing.
7. **The parse store on CI** (T24-10) and `--no-isolate` for CI's suite shards once the quick suite has run it for a
   week without a leak.

8. **Focus as an engine concept** (the owner, 12 November): attending to a thing (a notice, a door, a body) is today
   the browser's own machinery (`AtHand`, `Explorer`, the Look panel in `web/reader`); the terminal and `serve` cannot
   express it, which is why round 12's headless reviewers found steps only under `all`. Make focus runtime state, with
   its acts and narration, rendered alike by every client (it is also the ground for the lenses and the promise
   contract).
9. **CI's suite with `--no-isolate`** (one module registry a worker), as the quick suite already runs (34 → 10 s): one
   run on a side branch, compared spec by spec with main; adopt if no state leaks.

Not first: a REPL, an MCP server or a new command language (the kernel already compiles, plays, inspects and replays a
small Kyr situation in under a second; what is missing is tests that use it); a general lazy world.

## Aesthetic: a separate brief (independent investigation)

Questions for an investigator who has not built the current UI, with the evidence to start from
(`studies/screens/`, `retrospective/aesthetic-and-play.md`, `cold/round-12/`):

1. **Narration economy.** The page tells 442–663 words in 15–19 paragraphs at a town's heart before four acts. Try a
   three-sentence default for standing description (with one sensory line), change and aim-bearing lines always told,
   the rest a deliberate Look. Measure with `arrival-words.ts`; judge with clue chains intact.
2. **One menu, one safe frame** (proposals A and C): a `Menu` component for every choice list (led acts, a
   conversation's questions, a fight's moves with their nested panels), and a `SafeFrame` page template whose content
   box is the zone. Scoped in the screens study (13 + 11 rendering sites; four of eleven stylesheets read the zone).
3. **Lenses, not pages — the owner's first direction for M21** (12 November, after playing the landed build): "There
   shouldn't be separate explore/perceive page — they're just lenses, they should leave the scene intact but more
   highly favor actions of those kinds to be promoted to the top four actions. Otherwise it should be exactly the
   same." So: Go and Look open no panel; the telling and the led acts stay; the lens shows its tiles over the painting
   and the promotion rule favours its kind of act into the four; a tile touched acts (a place's tile goes there, as a
   likeness opens talk: done 12 November); the lens marks quiet (done). The browser driver's `opened()` and about a
   dozen browser specs are built on the explorer panel and change with it. The owner also "still doesn't really trust
   the pips": the promise-contract diagnostic (4) is how to earn it. Earlier framing (proposal B): Go and Look as tiles over the painting, a tile's detail in the panel, the acts
   that matter promoted into the four. Requires pictures for places and things (the commission list) and a promotion
   rule for curiosity, not only aims.
4. **Signals that resolve** (the owner's review's promise contract): every pip and gold names one source, one target
   and one legal resolution, inspectable in a development view.
5. **Pictures as evidence** (review V1): typed compatibility (interior/exterior, ruin/whole, light) before
   specificity; a missing painting before a contradicting one.

## Play: one acceptance scenario, then humans

A small tense expedition (the corn-store cellar to the rats' nest, or the hobs' toll-house): one light, one ration,
one companion, a warned danger, a retreat, and a return the town remembers. Two builds must play it differently;
recovery must cost something; the account must reconcile with the fight (review D2). Then **PD-14**: two humans on one
fixed build, recorded. No mission should close its play goals on agent play alone.

## Longer horizon (record, do not schedule)

Progressive world realization (conditions in `retrospective/architecture.md`); Kyr/Deem owning more of world
generation (design-opportunities §4); the SRD adaptation's increments (`srd-adaptation-briefing-2026-11-12.md`);
openings by situation; travel as passage.

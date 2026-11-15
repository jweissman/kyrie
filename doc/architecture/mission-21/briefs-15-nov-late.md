# Owner briefs, 15 November (late): interaction contract, experiential CI, map and intent

Kept so the asks are not lost. Each brief is given in its essentials with a status; the register rows (open-register.md
§49 and after) carry the work. Status as of ci/lead-82.

## Brief A: one player-page / action-menu contract (deployed-play observation)

Stray inline buttons ("Follow this") bypassed the authoritative action menu; chosen, they sent the player to the
roadmap, where the only gold was an invitation and the destination offered no persistent gold or suggested travel action.

- A. One small shared template for every player-facing state (title, creation, exploration, atlas, conversation, combat,
  transitions): one stable action-menu position, one selection/focus/commit behaviour, very few variants. Gameplay-changing
  inline buttons become promoted authoritative actions; references may stay inline but add no second action grammar. **Done
  for Follow** (interaction-contract.md); other inline buttons not censused (open).
- B. Every state offers a visible way to continue, return or proceed; automatic advance is legible and interruptible;
  consequential choices never auto-commit. **Partly**: lens states hide the four (PB-15).
- C. Follow → roadmap → next viable step, end to end: persistent gold while the destination is known and the route is
  reachable, the travel act offered; honest copy where unknown or blocked. **Partly**: map Set out is gold; honest copy added;
  a journey stopped on the road loses it (PB-14).
- D. POI pips, badges and gradients use the atlas's semantics; colour persists as long as the opportunity; no blinking.
  **Done for drift** (prism animation stilled); the remaining pulses (stopped marker, found board sign) not audited.
- E. Cheap characterization tests and a real browser journey title → creation → follow → roadmap → travel → next action;
  a cold deployed playtest. **Partly**: test/follow-offered-browser (opening → follow → gold → map → set out); creation and
  deployed playtest not included.
- Root-cause simplification over screen patches.

## Brief B: an experiential CI lane

Cheap authoritative headless walkers over a class × ancestry × seed matrix with policies (first promoted act; follow and take
gold; explore kinds of opportunity); hundreds of steps; replayable seeds and traces. Three contract families:

1. **Behavioural, blocking**: gold actionable and persistent across views; atlas faithful to opportunity semantics; followed
   intentions survive transitions; offered acts executable; no inert states; save/restore preserves promises.
2. **Experiential, baseline and regression warning**: promoted-act diversity, opportunities offered versus realized,
   stagnation, discoveries and persistent consequences, class differentiation, recovery from interruption; by context
   (work, talk, combat, wilderness), no artificial diversity quota.
3. **Balance, statistical**: the gauntlet for many-seed combat and abilities; long walks for economy, professions,
   resources, progression; class contribution to role, not duel win rate.

Promote only well-understood contracts to blocking. A small deterministic PR sample and a larger periodic matrix; measure
real cost; tiny worlds and reusable compiled Kyr; failures with exact replay lines.

**Status:** matrix walker (scripts/matrix-walk.ts, test/matrix-walk.test.ts, cost about 20 s a 40-step a1 run, so not the
push lane); gold walker follows an aim and counts guided steps (first finding PB-16). Not yet: the PR-sample lane in tiny
worlds, the baseline report file, intents-realized measures, balance-by-role comparisons.

## Brief C: the map as instrument, menu-only hex crawl, Wander, intent catalogue

- The world map is an in-world instrument of attention: opening it focuses an inspectable map while the character stays in
  the scene; "Put away map" is an ordinary promoted act; the engine knows the character is looking at the map; inspection is
  not travel and does not advance time. No large generic ENTER. A few consistent attention modes, one coherent surface.
- The whole hex crawl playable through the action menu: at crossroads, derive movement acts for viable roads, trails,
  directions; known destinations get longer journey acts; unknown routes described honestly; the atlas never mandatory.
- Investigate a modest **Wander** policy (known routes, conservative rest/resupply, pausing for opportunities and decisions,
  same authoritative rules, interruptible, never silently commits dangerous or irreversible choices), as a feature and a
  headless walker.
- A compact **player-intent catalogue** in experiential CI, ten families (perception, discovery, movement, social,
  manipulation, practice, relationships, conflict, reflection, organization), candidate semantics not primitives; one
  genuine experiential pin per family (encounter, recognise, execute, meaningful result); walkers measure intents
  encountered versus realized; separate synonymous labels from different capabilities, and composed activities from
  primitives. An expressiveness measure for Kyrie, bounded by the M21 playability objective.
- **Acceptance:** at a crossroads a character can inspect a map, put it away, choose a road from the ordinary action menu,
  travel, meet something interesting and continue, with no second control grammar.

**Status:** catalogue and ratchet done (scripts/intent-catalogue.ts; discovery has no proof; capabilities absent are listed
in PB-18). Map instrument, put-away act, crossroads road acts, Wander: **not begun** (PB-17).

## Brief D: the sign's sky, the cursor, and card selection (owner, 15 November, evening)

- The sky behind the astrological sign selector needs to feel more realistic, like panning through a real sky.
- The cursor is awkward: it switches between two sizes on press and release; nothing hints at the long-press, which
  should slowly fill the reticle's border clockwise.
- Card selection in general is a mess: the highlighted card is harder to read, and selection feels inverted.

Status: see the register (PB-22) and the commits that close it.

# Mission 21 → 22: handoff

Written 16 November, for the next stretch of work (the owner's next aims, in their order) and for whoever picks it up.
M21's own goals are met as far as a lead can show without a person playing: see retrospective.md and
obligations-review-15-nov-late.md for the measures, and "What is not shown" below for what only a person can say.

## How to work (what held up)

- **Trunk.** Push small verified increments to main from the worktree (`git push origin m21:main`), after `bun run
  check:fast` (about 30 s, env KYRIE_BROWSER unset). A push runs the push lane (about 9 min); the full run is nightly and
  on demand. Read the push's result and fix red at once: a red main is recoverable, an unnoticed one is not.
- **What `check:fast` does not run** (and the full run does): map and card specs (test/support/map-card.ts renders
  RouteCard statically; any component it uses must be expanded), honest-start, engine-names, the browser specs. After
  touching web cards or menus, or the shared rules (data/rules/*.kyr), run those specs first and `bun run web:build`.
- **Shared rules collide.** A new relation or action name in data/rules can clash with an adventure's own (Low Water had
  `stayed`), and a new act can be led by the page as an aim's next step (honest-start led "Ask Baldric to stay here").
- **Browser probes.** A scratch `test/probe-*-browser.test.ts` that screenshots a walk (copy test/composed-creation-
  browser.test.ts) is the cheapest way to see a change; delete it after. Chromium needs the local NSS libraries (memory:
  playwright-chromium-nss).
- Never `git stash`; one heavy job at a time; no poll loops.

## The owner's four aims

### 1. The action button: design and interaction (a long, deliberate cycle)

State: rows are borderless at rest with a light tint and a brief sheen on hover (menu.css); the colour mark at the left is
the atlas's (five tones; exploration and companionship are icons); a mouse press fills the cursor's own ring clockwise
over 520 ms (Reticle.attach) while a tap still commits at once.
Not done: **hold-to-commit** as a real interaction (Hold/Press behind `?ix=b`: sustained acts commit on a full ring);
the title, creation and setting-out rows (`.way-in`, `.option`, cards) are still their own styles, not one row; touch has
no press treatment (`?touch=down|up`); the sheen and tint have only been seen in screenshots, not judged in motion.
Start with: one row component for every surface, then the press (decide hold-to-commit for wait/search/rest/camp), then
motion.

### 2. SRD migration and the engine improvements it needs

Proof slices stand (rat, Magic Missile); the bulk spell layer is archived (`archive/ci-rules-1`, `-2`). Open engine work,
in order of how much else it unblocks: **CF-03** (a band as the target of `Resolve invoke`, a projected `sleeping` fact,
hostile spells run as a fight's opening move: casting-fiction.md), CB-05 (a try limit on a check), GT-01/02 (plane laws
and Plane Shift as executable effects), CB-23 (OSR mechanics). Each as a slice: met, explained, measured.

### 3. Density of opportunities (violence and wonders)

Measured (scripts/promise-fidelity.ts, 12–24 turns of a curious walk): a1 draws danger 1–4 times and no wonder; b2 draws
none of either. **Cause of "no wonders" found and fixed 16 Nov:** the atlas had a violet and a `wonder` aspect but nothing
produced it; a generated `wonder_…` thing now leads with it (test/small/wonder-violet). Still thin: wonders are placed only
inside works (region-marvels.ts: half of the works, on an inner way) and violence only where a site has a band. Next:
place marvels and bands in the open country and the towns' edges by the tables (Orsino's wonderEffects, the bestiary),
then count with the walkers (matrix-walk, promise-fidelity) by atlas colour per hour, as TB-06 asks.

### 4. Authorability: more expressible in Kyr (custom items first)

An item kind comes only from the catalogue (`Give heather to party` needs `heather` there; world-constructs.ts and
catalog-parser.ts introduce `itemkind` entities from it); a Kyr world cannot define a kind with its own stats, effects or
look. The 16 November pins show what Kyr already expresses without engine change: a Landholder (deeds, commissions, time),
an Alchemist (`undiscovered` recipes, `experiment`, making.kyr), a Befriender, a Commander (`hold_here`, `call_on`).
Start with: an `Itemkind` declaration (name, slot, what wearing or using it does, how it looks), through Kyr's own grammar
and the catalogue's table, with the lint and the encyclopedia reading it.

## Design blockers (the owner's to decide)

1. **BP-03: where the dice show.** The 6 November ruling put the roll beneath the fight's prose, on the page; the register
   now asks for "dice only on a deliberate look". One line of the fight stage (`.how`) decides it.
2. **PB-25: the lens's "All N" unfold.** Four items closed, an unfold to the rest in place. Keep it (an explicit
   disclosure), or page it like the conversation (and rewrite fourteen browser specs).
3. **Hold-to-commit** for the sustained acts: default, or an option, or never (the ring is a hint only today).
4. **Stay and come on** exist in the engine (the simplest Commander); where does a player give them: the company sheet, the
   retainer's page, or the menu when one has joined? Nothing draws them yet.
5. **The scene's outlined panel on a phone** (the first scene's telling sits in a bordered box): intended, or the dressing
   the action-button cycle should take out?
6. **Combat balance** (CB-01/03/04/22): how hard the first hour should be for a lone novice; a lone first-level mage loses
   two fights in three against three rats and the forecast says so.
7. **Prose** (the DN-06 writing, BP-06 garnish): taste, with no mechanical test.

## What is not shown

No person (and no blind agent) has played the current build through its first fifteen minutes on the deployed page, and
there is no real iPad or WebKit run. The register has 578 rows, about 350 live; the audit this stretch closed ten with
evidence and found most of the rest to be content, taste or balance, which a person must judge. Four journey specs are
skipped because they fail when unskipped (OA-01..04: the scripted play has drifted from the content).

## Where things are

doc/architecture/mission-21/: trunk.md (the working rules), retrospective.md, obligations-review-15-nov-late.md,
capstones.md (the 51-feature map), verb-pins.md, casting-fiction.md, colour-atlas.md, interaction-contract.md;
doc/architecture/open-register.md (rows PB-10…PB-25 are this stretch's). Memory: m21-state-nov16.

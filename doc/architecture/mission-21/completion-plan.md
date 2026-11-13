# Mission 21: the completion plan (14 November, night)

The owner's direction: M21 closes when the acceleration has been converted into a noticeably more trustworthy,
beautiful and interesting game, and when the remaining obligations are accurately accounted for, not when the
infrastructure is healthy. The fast tests were the investment; these are its returns. This plan covers the five
original obligations. Later exploratory ideas (new origin campaigns, metacampaign movements, progressive generation,
new encyclopedia *systems*) stay out of M21 unless commissioned. Every deferral below is named and reasoned.

Each line has a few deliverable outcomes, in dependency order. Every batch is proven by the whole suite on its own
`ci/<line>-<n>` branch before it reaches main, so main stays green for the owner's play.

## 1. Finish the fast-test transformation (the lead, with each line in its own domain)

**Where it stands:**
- Expensive specs (over 15 s on CI): 393 files, 2,790 cases.
  - 209 draw a generated world;
  - 75 start an authored campaign;
  - 101 run through helpers not yet classified;
  - 8 are browser specs.
- Tiny-world specs: 69. **No systematic audit of the expensive specs has been done yet.**
- Verifying a P0 fix locally today:
  - about 1 s where its invariant has a tiny-world spec;
  - 10 s to several minutes where it lives only in a generated-world or journey spec;
  - and 19 minutes of CI to know nothing else broke.

**To finish:**
1. **An audit tool.** `scripts/spec-audit.ts` classifies each expensive file by what it starts (generated world,
   authored campaign, journey prefix) and each case by what it asserts:
   - effect, knowledge, legality, follow-state, navigation, atlas facet, combat rule, telling;
   - or composition, persistence, integration.

   Output: `doc/architecture/mission-21/spec-audit.md`, regenerated, with counts that can move: files analysed, cases
   migrated, cases that genuinely need the whole world.
2. **Migration, by cost.** The top 150 expensive files are 70 % of the time. Their local-semantics assertions move to
   tiny Kyr fixtures (`test/small`) or pure tests, each mutation-checked. The journey keeps the assertions that test
   composition: what follows from what across places and days, saves, and the generated country itself.
   Each line migrates its own domain:
   - rules: combat and creatures;
   - playability: gold, aims, navigation, lenses;
   - aesthetic: page-level, via page objects;
   - the lead: the rest, and the tool.
3. **The shared dependencies that keep testing dear,** each measured, with its remedy:
   - a world's composition (5 s of a 6 s start): cheaper composition (Experiment B's steps 4–5);
   - the screen built at every step (half of a waited step): a harness that builds the page only where a spec reads
     it, and per-relation version stamps so that what does not change is not recomputed;
   - specs pinned to a seed's generated content where a fixture would do;
   - campaign starts not shared across a file's cases (`Kept`, `Keep.at` cover only some families).

**Evidence:** the audit's numbers; the share of P0 classes verifiable locally in under 30 s (target: four in five);
the whole suite's job-minutes (target: −30 % from 216); and a worked example of a P0 reproduced and verified in seconds.

## 2. Make ordinary play reliable (the playability line, with the aesthetic line for the page)

Root causes first, each retiring a family of tickets, each with a cheap regression and a full-world or browser check:
1. **One spatial contract.** Interiors, sites, towns and country share one model of where you are, how you leave, and
   what the compass leads to: the compass routes over known traversable ways; Back is predictable; nothing overland
   from inside. Retires CN-02/03, the "can't find the way out" and "map from inside" families (R10-09, PR-08).
2. **One action projection.** The lens, promoted-act and leaves contract complete: things on ways, openers, the
   company's own acts, marks, subjects' names. Every surface draws from it, Wait included. Retires CN-01/04/05 and the
   "action buried under all" family.
3. **One opportunity projection.** Follow-state, gold, likenesses and atlas facets from one source (`Glance` and
   `likenesses`), drawn the same in the page and the terminal. Retires PL-32 and the "pip that leads nowhere" family
   (OPR-04, R9-03).
4. **Combat that works and reads.** The fight's composition (done for geometry), plus function: unavailable acts
   explained, retreat, turning points told, the end of a fight restoring the scene. Fixture fights that offer every
   state.
5. **Pages that are no pages.** One-choice moments with no stakes auto-advance; a single act that matters is drawn as
   an act (CN-09). The opening's narration is lighter.
6. **Adventuring that rewards.** Searching finds, investigation teaches, preparation pays, danger warns, retreat works,
   and return is welcomed. Measured by the terminal walkers per build: what each build is offered, and what pays off.

**Evidence, the acceptance target:**
- Cold rounds across six representative starts (origins × callings), headless and in the page at desktop and iPad,
  each sustaining fifteen coherent minutes, with transcripts.
- Then the owner's play. Green CI and closed tickets are not acceptance.

## 3. The aesthetic transformation (the aesthetic line)

An integrated design pass, scene by scene, not component by component. Each scene is designed, built and judged at
1280×800 and 820×1180, with screenshots kept as artifacts:
- resting, quiet;
- resting, crowded;
- dialogue (keeping the large-painting talk page the owner rates right);
- waiting (the time lens);
- the Pack;
- combat;
- the Encyclopedia in parchment and ink (CN-11: its look, within the existing system).

Throughout: the painting dominant, restrained type, the atlas used sparingly and only where the engine says so, no
web-app idioms, and stable geometry.

The terminal remains the cheap test bed:
- walkers per build, each averaging three sentences or fewer of arrival narration;
- no repeated static context;
- one projection for colour and action;
- a report of what each build encounters.

**Evidence:** the screenshot set per scene and size, with a short critique of each against the owner's direction; the
terminal walk report; browser specs for layout stability.

## 4. A substantive rules and lore tranche (the rules line)

From the census baseline (0 of 88 placed encounters faithful; spells 9 of 119):
- **Spells:** every catalog spell with an SRD counterpart brought to its level, school, harm, type and save, through
  the conversion layer (four schools done on its branch). Target: 119 of 119 or each exception named.
- **Creatures:** the placed bestiary converted in order of how often a player meets it, beginning with the first hour:
  - rats, cave spiders, ghouls, zombies, wolves, hounds;
  - then the dens and the keepers.

  Each is fought where it is placed and kept told and escapable. Target: half of a1's encounter-weighted meetings
  faithful.
- **Every gap, classed:**
  - authoring that can proceed now;
  - a small engine capability worth building in M21 (the saves field; variations forgoing base defences; spell
    resistance, small);
  - an architectural limit, documented and deferred;
  - material to reconsider rather than port.
- **Lore:** each converted creature's telling and placement checked against its lore. Where Orsino's or the SRD's
  version does not fit the world, it is adapted on purpose and recorded.

**Evidence:** the census before and after each batch; the placement report per converted creature; the gap table.

## 5. The register and the inherited promises (the lead)

- **A fourth state beside fixed:** *accepted in play*. A row is accepted only when a play (cold round or the owner's)
  confirms it.
- **The retirement rate.** `register-state` per revision, a weekly line of opened, fixed, accepted and blocked, and the
  P0/P1 trend. M21 must show serious defects retired faster than found.
- **The inherited obligations,** each with its state: the major defects, the repeated author requests, the fidelity
  gaps, and the unfinished mission commitments (M17–M20 owner briefs).

## Needing an explicit scope decision

| Item | Why it is a decision |
|---|---|
| Late binding (a band's numbers from the company's size when met; a country's name apart from its seed) | a new engine mechanism; first authored use is the undertown and Low Water |
| Per-relation version stamps on the world | the deepest lever for test speed and play speed alike; touches the world's core |
| Level-scaled damage for grown kinds | changes every grown creature's lethality at once |
| The whole challenge table re-measured | redraws every country's dens |
| T24-20 Common names | ready as a patch; ripples through about 30 specs and the kept traces |

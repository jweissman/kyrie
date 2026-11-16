# Mission 21: closure and hand-off (16 November 2026)

Written for the owner, from a review of every M22-facing document in this directory against what is on main (`0f59e701`, full
CI green). Verdicts are **done** (a spec, a measure or a screenshot shows it), **superseded** (a later ruling replaced it),
**open**, or **unverified**. Nothing here was played through by a person; that is the mission's standing gap.

## 0. Closure statement

M21 is closed **as an engineering phase**, at the owner's instruction of 16 November, so that M22 can begin. It is **not**
closed as accepted:

- **Player acceptance has not been achieved.** No person and no blind agent has played the current deployed build through its
  first fifteen minutes. The owner's own plays on 16 November still met breakers. FH-01 ("no person has accepted the first
  hour") stays open at P0.
- **The inherited obligations have not been discharged.** `bun scripts/register-state.ts` on this revision reads 541 rows that
  carry a status column. Of those, 161 are fixed, 30 duplicates, 4 decided, 6 ambitions, 45 deferred, 104 partly and 191 open.
  Two P0s are live: FH-01, open, and DN-06, the writing, partly. Of the P1s, 42 are open and 37 partly. The register grew about
  as fast as it was paid down.
- **The dramatic core was never demonstrated.** No compact expedition has been lived through end to end (OA-12, HP-03). Four
  journey specs are still skipped because they fail when unskipped (OA-01..04).
- **What M21 did achieve** is the cheap loop and the means of proof. `check:fast` runs in about 30 s. A push lane takes about
  9 min and the full suite runs nightly. Tiny worlds start in 70 ms. On the experience side M21 delivered:
  - four foreground actions everywhere, with paging and no unfolding menus;
  - one hold mechanism;
  - the five-colour atlas;
  - the map's own menu;
  - a mage who can cast;
  - a pursuable opening on all of a1's placed origins.

  The owner can now reliably open the title, create a character by holding, set out, follow an aim, and see its one next step
  in gold. They can also cross roads from the map's menu and talk four topics at a time.

Every open line below is carried by the M22 brief (`doc/architecture/mission-22/brief.md`) or by the register. None is
dropped here.

## 1. Against the brief (12 November)

| Outcome | Verdict | Evidence |
|---|---|---|
| A cheap loop | **Done** | `bun run check:fast` about 30 s over 1,470 tests; a push runs the push lane (about 9 min); tiny worlds start in 70 ms; the whole suite is nightly and on demand |
| A dependable game (15 coherent minutes, unfamiliar player) | **Unverified** | Walkers (a1, b2, c3, d4; gold-following; pseudo-random; 150+ browser steps) found no stuck state, blank row, fifth item, sideways scroll or page error. **No blind agent or person has played the current build on the deployed page**, and four of the owner's own plays in the last day still found breakers (below) |
| Significantly better presentation | **Partly** | Lantern scene, scrim on a phone, undressed rows, held choices, composed creation, live sky, the map's own menu. Judged by the owner: the sky and the constellations still "not close"; no real iPad or WebKit run |
| Obligations discharged | **Partly** | register-state: 541 status rows, 161 fixed, 191 open, 104 partly, 45 deferred (register-tickets, which also counts pointer rows, read 580). The live rows are mostly content, taste and balance; the mechanical ones were worked first |

## 2. The M22-facing documents, reviewed

| Document | What it handed forward | Now |
|---|---|---|
| `handoff-to-m22.md` (16 Nov) | Four aims; seven blockers | The blockers were **decided** (owner-rulings-nov16.md) and built; the aims stand (§4). Its "design blockers" section is history |
| `decisions-for-owner.md` | Seven trade-offs | **Answered**; rulings recorded. Item 7 (prose: name the three rows to fix first) is **still unanswered** |
| `owner-rulings-nov16.md` | The rulings and their status | Current; its status table is accurate except #5 (the scrim is done for the first scene only) |
| `button-discovery.md` / `button-data.json` | Measures for the action-button cycle | **Current** (16 Nov); the first work of aim 1 |
| `first-touch.md` §10 | Inherit commit-on-down for keys/pads/mouse; hold only the irreversible and the entrance; "three seams, then a controller"; commoner calling needs a career rule | **Superseded in part.** The owner has since ruled that cards and title ways in are held, a mouse let go early does nothing, and only a finger or the keys tap-arm. The *seams* (one commit path; creation and the title had their own handlers; openers clicked as DOM) are now one hold mechanism (`Hold.bind`) but the focus model is not unified. The commoner is **open** (needs a rules line) |
| `consolidated.md` "Deferred to M22" | Planar grand tour (GT-01..03); observatory/instruments page; 3D interactions; energy; tarot/puzzles/devices | **Unchanged**, except the observatory (the sign's sky) which was rebuilt live and is the owner's most-rejected piece |
| `state.md` (14 Nov) | "Whole suite on every push in under 10 min wall" as M22's target | **Stale and superseded** by the push lane (about 9 min) plus nightly full run, which the owner accepted; keep the nightly green |
| `interaction/grammar.md` | A held-act option for accessibility; one focus model over `[data-act]`/`[data-nav]` | The accessibility route is **done** (tap-arm for finger and keys; assistive click commits at once); the focus model is **open** (a controller still needs it) |
| `retrospective.md`, `obligations-review-15-nov-late.md` | The ten-point account | Correct as of 15 Nov; superseded for the open list by §3 below |
| `verb-pins.md`, `casting-fiction.md`, `capstones.md` | Pins and audits | Verb pins **all five done**; casting-fiction CF-03 **not begun**; capstones: crafting now present |

## 3. What landed 15–16 November (since the retrospective)

- **Interaction grammar made real:** every foreground is four; lenses, conversations and trade are paged four at a time with a
  non-act pager, never unfolded; the map has its own menu; compound conversation topics are simple rows; the 20-odd
  "lands beyond" topics are one "what news is there?" question; the trade page, Trade, Back, Notes actions, the journey's
  go-on and give-up and the ending page are full-width rows.
- **Hold:** one mechanism (`Hold.bind`) for the title, creation, and the acts that spend a night (rest, camp); the cursor's own
  ring is two SVG circles with 2× cursors; verified in a browser by pointer, key and finger.
- **The five-colour atlas, haggling, deeds, story search, the Alchemist/Commander/Befriender pins, wonders drawn violet.**
- **The sign:** twelve constellations redrawn, a live canvas sky (61 fps, four parallax layers). Not accepted.
- **Findings from plays, fixed:** the stay order displacing conversation topics; refused replies holding a topic's place; the
  map's town card keeping the old cream button; a stray numeral; raw asterisks on pages; a sky that blocked the main thread
  long enough to cancel a hold on a slow device.

## 4. What is open, by what it costs the owner's next hour of play

1. **The first seconds.** The title is ready at about 3 s on a laptop and 11 s on a slow device because the page is one 20 MB
   script. Split the title and creation from the engine (button-discovery.md §1). Then an answering state for the held set-out
   (10–17 s of a still page while the world is made).
2. **The rest of the rows.** About 40 boxed or quiet-word buttons remain (creation's, the Book's tabs, the fight log, the
   map's old plan card, the encyclopedia overlay) and the `opens/opened` unfold pattern on some pages. The owner's rule is
   absolute: no unfolding menu, no compound act, every action a full-width row.
3. **One row, measured.** Heights 40–54, hover equals focus, no pressed state, creation rows with no transition
   (button-discovery.md §3). Then the aesthetic cycle.
4. **The sign.** Needs an illustrator's hand: twelve figures with a drawn body behind each, a sky with a real galaxy, not more
   parameters. Ask the owner what is missing first.
5. **Density.** Wonders are placed only inside works; violence only at sites with bands. Place both in the open country and the
   towns' edges by the tables, then count by colour per hour with the walkers.
6. **SRD and engine.** CF-03 (a band as a target of `Resolve invoke`; a sleeping state), CB-05 (a try limit), GT-01..02 (plane
   laws), custom item kinds in Kyr (the catalogue is the only source).
7. **The mage's route as one test**, a hireling found, afforded, recruited, a journey and a fight with them beside.
8. **Prose**: the owner has not named the three rows to fix first.
9. **A person-run, or blind-agent, first fifteen minutes on the deployed page.** Nothing else can settle acceptance.

## 5. Hand-off advice

- **Play it before you plan.** Every real defect of the last two days (stay order in talk, the cream button, the stray "1.",
  the stuck refused reply, a sky that cancelled a hold) was found by a scripted browser play with screenshots and none by a
  spec. A 40-step walk (kite and a1, first row and gold-following) is five minutes; run one after every change to a page.
  Scratch probes in `test/probe-*-browser.test.ts` (delete after) are the cheapest way; copy `test/hold-browser.test.ts` for
  the creation-and-journey preamble.
- **Trunk, with a gate you read.** Push small increments to main from the worktree after `bun run check:fast` exits 0 (chain with
  `&&`, never `;`: one push went out red on a lint line). `check:fast` does not run the browser specs, the map and card specs
  (`test/support/map-card.ts` renders cards statically), `honest-start` or `engine-names`; run them before touching web cards or
  the shared rules, and `bun run web:build` after any `.kyr` edit.
- **The owner's rulings are rules, not preferences.** When a current implementation is inconvenient the ruling wins: four
  items everywhere, no unfolding menu, no compound act, full-width rows, a ring only when holding matters, never a dexterity-only
  gesture, prefer removing an old mechanism to excepting around it. The register's old rows and the old docs may say otherwise.
- **The lint limits are the owner's.** Comply in code (120 columns; 55 lines a function; no stray arrows in non-test code);
  never loosen the config. A comment rewrap is cheaper than the argument.
- **Distrust a walker's "stuck".** Two findings this stretch (the aim's own site, the stuck Orsik row) were a script pressing
  Enter or the first row; the page was fine or the real problem was elsewhere. Check by hand once before filing.
- **Heavy jobs one at a time** (the browser, the full suite, the discovery script). The discovery run is about eight minutes.
- **Known flake:** `test/discovery-scale.test.ts` fails on CI under load (best of three already); it passes alone.
- **First thing to do in M22:** read `button-discovery.md` §5, run `test/support/ui-discovery.ts` once for a baseline, split the
  script, then the one row.

## 6. Document hygiene done and not done

- Done: this closeout; `handoff-to-m22.md` and `owner-rulings-nov16.md` carry the rulings; the memory index records the state.
- Not done: `state.md`, `consolidated.md` and `first-touch.md` still carry pre-ruling advice (they now point here); the register's
  rows were updated only where checked (closed with evidence, noted otherwise).

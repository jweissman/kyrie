# The architecture of opportunities and the Colour Atlas (AT-07)

An investigation for the owner, 19 November 2026. It reads source and runs probes; it changes no code. It was read at
`wt-m21` 0106db289. The probes are in `/var/tmp/kyrie/m22/probes-at07/` and are not in the repository. Register rows:
AT-04, AT-05, AT-06 and AT-07, with the history of OR-57, OR-68, OR-73, OR-76, OR-95, FM-05, OPR-04, PL-32, PF-02,
CL-34, TB-01 and TB-12.

## Summary

**The question.** Can the engine build one authoritative, inspectable model of what can be done and what can be
reached, so that lenses, menus, navigation, routes and indicators all derive from it? **Yes.** Most of the inputs
already exist and are sound. What is missing is the thing a container's mark must be made of: **a tree**.

- The engine has no tree of containers today. It emits three flat projections of one candidate list:
  - `Glance.acts` (`Promotion.pick`);
  - `Glance.lenses` (`Promotion.lenses`);
  - `Glance.offer` (`Offers.scene`).
- `Doable.of` (TB-12) is a first, partial tree, but only the terminal, the runner and autoplay read it. The page never
  calls it (it uses only `Doable.called`).
- On the page, each container is assembled separately by `MenuModel`, `GlanceStage`, `LensRows`/`Selection`,
  `LensFocus`, `Paging`, `Wayfinder`, `AtHand`, `TalkFocus` and `WorldStage`.
- Each container's mark is made by choosing a set of witnesses and calling `Attest.of`. There are 25 such call sites (by grep for `Attest.of|join|local|toward`) in
  `web/reader` and `src/presentation`.

**The witness brand guarantees provenance, not attribution.** The trust-contract work made a colour unforgeable: every
`Attested` is made of `Witness`es that only `Attest.index(glance)` issues. But `Attest.of(witnesses)` accepts any list.
Which witnesses belong to a lens, an opener, a likeness, a tile or a page is still decided at each call site. Two
decisions there are the actual source of the recurring "mark with nothing under it":

1. **A container's witness taken from the container, not from its children.** An opener's `Promoted.aspects` come from
   the opener's own reasons (`Aspects.of(whys)` in `Promotion.promoted`). Only the reasons that have a leaf in
   `Candidate.leaves` become `Promoted.inside`, which is what the children are marked by (`Attest.within`). Every reason
   with an aspect and no leaf ('own', 'unvisited' on a way's look, 'sign' without a command, 'means', 'spoils' by sale,
   'held') lights the opener and nothing inside it.
   - `LensRows.borne`, `AtHand.bears`, `GlanceStage.marked` and `WorldStage.seen` (through `Likenesses.of`) all read
     that container witness.
   - Once opened, `PlaceStage.Opened` draws the children through `Act.List`, which draws no indicator at all.
   - Measured headless: **49 of 130 openers led with (38%)** bear an aspect that no descendant's witness carries
     (a1/kin mage and kite/kin warrior, 25 turns each, plus iscoed's drove road). For example, "Look at the corn-store
     padlock" is led for exploration at Porthalen's landing at the first frame, and so is the receipt on the
     well-post's look. This is AT-06 at the first frame of the game.
2. **The same container built twice with different semantics.** Go… is either the engine's places lens (`LensRows`)
   or the page's own `Wayfinder.ways`, chosen by `SceneRail.lensed` (`?scene=split`, `Look.is('attend')`).
   `Wayfinder` has its own grouping (near, about, out, quarters) and two readings of what is perceived along a quarter's
   row: `Wayfinder.sensed` reads `holds`, `Wayfinder.bears` reads the heart only. The places lens has no grouping at all:
   **10 to 11 pages** at Porthalen's landing and on a1 and kite (AT-04's overflow is structural, as measured).

**What else is decided twice.**
- **The rest's colour.** `Offers.candidate` gives aspects to the offer's rest rows, which the terminal draws
  (`TerminalDoable.kinds`). `Attest.index` never indexes `offer.rest`, so the page draws the same rows plain: **123
  rows** in the drove walk.
- **What a row does.** `Doable.row` decides it for the CLI clients. The page decides it again:
  - `GlanceStage.acted` still does a commandless opener by its first child under the opener's words, the very guess
    TB-12 was to delete;
  - `GlanceStage.flat` stamps the opener's aspects on its children;
  - `MenuModel.lead` remaps an overland id to "Open the world map";
  - `Act.click` dispatches by the menu index, not the row's id.
- **Executable rows have no validated constructor.** `Doable.Row` has no `disabled`. **50 Doable rows** in the a1/kite
  walks have neither a command nor rows to open ("Steal a sack of meal off the cart", a shut act with its reason lost).

**Problem 2, derivation from the world, is already mostly present in pieces:**
- legality and visibility: `PlayerView.choices`;
- local reasons: `Affordances.of`;
- bounded perception: `Perception.sensed`, a breadth-first search to a reach of 1 to 3, companionship only;
- knowledge-bounded routes: `Itineraries.plan`, Dijkstra over `ChartModel.ways(visited)`, cached per world and
  history;
- objective resolution: `AimLeading`, `Stakes.target`, `AimRoute`;
- per-place facets: `PlaceFacets`.

They are not one graph. Each has its own notion of what is known, and two read privileged facts without a knowledge
guard: `AimRoute.outward` reads `world.one('at', person)`, and `Companions.possible` reads the existence of an
unspoken recruit topic. The three standings the owner asked to distinguish (immediate, reachable, contingent) exist as
fragments: `kind: 'direct' | 'directional'`, `far`, `Glance.leads` / `Threshold`, and `AimContinuity`'s "what stands
said". No type unifies them.

**The strongest invariant** makes the wrong thing unrepresentable rather than tested.
- A container's `Mark` can be constructed only as `Mark.fold(children)`.
- A leaf's mark can be constructed only from its own witness.
- An executable leaf can be constructed only by a validated `Offering.act` (words, a legal command or a stated reason,
  a target that is its own).
- Pagination, promotion and grouping are pure functions over the tree in `src/presentation`, which emit pager and
  group nodes whose marks are folds too.
- Clients render nodes and send back node ids.
- Enforcement is the brand (as `Attest` does now), plus the existing structural spec extended so that `Attest.of` and
  `join` are callable only inside the offering module, plus the OR-94 page-controls ratchet.

**The smallest credible sequence** is seven steps (§5). The first four are small, cheap and belong in M22 beside
OR-94; each closes a measured class with a spec that fails today:
1. The engine-side support spec (the probe's P1, P2 and P3 made a pin).
2. Every aspect-bearing reason with a leaf, or no aspect.
3. Opened children drawn with their witnesses; pager rows marked with the fold of the pages they turn to.
4. `Doable.Row` carrying `disabled`; the page's own row fallbacks deleted; the rest's colour given one owner.

The tree itself (`Offering`), the page rendering it, the Wayfinder's semantics retired, generalized bounded
reachability behind a `Known` facade, and `kyrie inspect --why indicator` are a dedicated M23 mission, about 2,500 to
3,500 changed lines.

---

## 1. The pipeline today

### 1.1 Stages, with the functions that own them

| # | Stage | Owner (file:function) | Output |
|---|---|---|---|
| 0 | World facts, immutable per act | `Campaign.world` (a new `World` object per committed change) | facts |
| 1 | What is legal and visible to the actor | `src/presentation/player-view.ts:PlayerView.choices` (`list`, `sees`), cached per operator list | rows `{choice, action}` |
| 2 | Screen: what the company perceives here | `src/ui/screen-model.ts:ScreenModel.build` → `Screen` (people, things, exits, destinations, around, roads, aims, paying, warned…) | `Screen` |
| 3 | Choices as a tree of one place | `src/ui/choice-list.ts:ChoiceList.explore` → `Section[]`; `src/ui/scene.ts:SceneModel.build`; `src/ui/attention.ts:Attending.place` | `Scene {subjects[].choices, near, far, you}`: the only real tree, with `Choice.children` |
| 4 | Reading: what the company knows, wants, needs | `src/presentation/glance.ts:Glance.reading`, which assembles `AimRoute.routed`, `AimLeads.*`, `Undertakings.serving`, `Companions.possible`, `Perception.notes`, `CompanyRecall`, `Outmatched.reading`, `CompanyLight`, `Acquainted`, `TalkingWith` | `Reading` |
| 5 | Candidates: every choice with its reasons | `src/ui/affordances.ts:Affordances.of` (per subject, per way; `leaves` per reason) | `Candidate[] {choice, kind, whys, leaves, notes, marks}` |
| 6a | The four | `src/ui/promotion.ts:Promotion.pick` → `continued` (gold to one), `AimContinuity.of`, `Undertakings.heldFor`, `HeldActs.with` | `Glance.acts: Promoted[]` |
| 6b | The lenses | `Promotion.lenses` → `lensed` (top four ranked, then fill, the rest unranked; `opened` gives `leaves`; `aspects` of the four) | `Glance.lenses: Record<Lens, Lensed>` |
| 6c | The offer | `src/presentation/offer.ts:Offers.scene` (the four again, filled by type; the rest with `Offers.candidate` aspects; `besides` adds every legal choice the candidates miss) | `Glance.offer` |
| 6d | Ways, likenesses, sensed, aimed | `Promotion.ways`; `src/presentation/likenesses.ts:Likenesses.of(acts)`; `Perception.sensed`; `Glance.aimed`/`going` | `Glance.ways`, `likenesses`, `sensed`, `aimed`, `following` |
| 7 | Witnesses | `src/presentation/attest.ts:Attest.index` (acts, lens promoted, `inside`, likenesses, following, sensed; **not** `offer.rest`, not lens rest, not leaves) | `Map<id, Witness>` per glance |
| 8 | Rows per client | CLI clients: `src/presentation/doable.ts:Doable.of/one` → `src/cli/terminal-doable.ts`, `src/cli/runner-offer.ts:RunnerOffer.of`, `src/autoplay/run.ts`. Page: `web/reader/menu-model.ts:MenuModel.build/lead`, `web/reader/stage/glance.tsx:GlanceStage.{Acts, acted, flat, foreground, offered, Lens, LensRow}`, `lens-rows.ts:LensRows.of`, `lens-selection.ts:Selection`, `lens-focus.ts:LensFocus.of`, `paging.ts:Paging.of`, `wayfinder.tsx:Wayfinder.ways`, `at-hand.tsx:AtHand.of`, `src/ui/talk-focus.ts:TalkFocus.of`, `place-stage.tsx:PlaceStage.Opened` | drawn rows |
| 9 | Container marks | `scene-rail.tsx:SceneRail.go/look/map/local`, `lenses.tsx:Lenses.mark`, `lens-focused.tsx:LensFocused.Unit`, `world-stage.tsx:WorldStage.seen`, `talk-stage.tsx:ToTrade`, `place-mark.tsx`, `map-menu.tsx`, `map-view.tsx`, `src/presentation/place-facets.ts` | `Attested` |
| 10 | Execution | Page: `act.tsx:Act.click` (by `data-index` into `app.menu.choices`), `ChoiceRow.Button onClick → app.choose(c)`. CLI: `Row.does` | a command |

Routes and reachability sit beside this chain, not in it:
- `src/ui/itinerary.ts:Itineraries.plan/tree/graph`: Dijkstra over the known ways, cached per `World` and
  `actor:history.length`.
- `src/presentation/perception.ts:Perception.sensed`: a breadth-first search over `PassageModel` from each unblocked
  exit to the perception reach.
- `src/presentation/aim-lead.ts:AimLeading.of/route`, `src/ui/objective-target.ts`, `src/presentation/aim-route.ts`:
  where the followed aim's step is.
- `src/presentation/place-facets.ts:PlaceFacets`: map marks per place.

### 1.2 Every place where meaning is decided twice

| Meaning | First owner | Second (and third) owner | Consequence |
|---|---|---|---|
| What an opener is to the company | `Promotion.promoted` → `Aspects.of(whys)` on the opener | `Promotion.inside` (only reasons with leaves) → `Attest.within` on children; `GlanceStage.flat` copies the opener's aspects onto ≤3 children (`{ ...a, choice: k.id }`) | Container lit, children plain (P1: 38% of led openers); or children stamped with a parent's meaning |
| What a likeness is | `Likenesses.of(glance.acts)`: union of the aspects of acts with that subject | the talk's rows: `Attest.reply` → `within` (inside), `teaches`, `paying` | Same split as above; OR-76 (green in talk, none outside) was its inverse |
| What Go… opens | `Glance.lenses.places` drawn by `GlanceStage.Lens` + `LensRows` | `Wayfinder.ways` (own grouping, quarters, ranking, `bears`) chosen by `SceneRail.lensed` | Two containers, two groupings, two witness sets; within Wayfinder, `sensed` (holds) ≠ `bears` (heart) |
| What Look… opens | the things lens via `LensRows`/`Selection` | `AtHand.of` + `AtHand.bears` (the first led act's own witness) | as above |
| A lens mark | `Lensed.aspects` (engine, the four) | `LensRows.marks` (page, **first page only** of `LensFocus` rows) | `Lensed.aspects` is now read by no client (dead semantics kept by tests); the page mark ignores pages 2..n |
| A rest row's colour | `Offers.candidate` aspects → terminal (`TerminalDoable.kinds`), runner (`Offered.aspects`) | page: `Attest.witness` (rest never indexed) → plain | 123 rows at the drove road coloured in the terminal, plain on the page |
| What a row does | `Doable.row` (CLI) | `GlanceStage.acted` (first child of a commandless opener, under the opener's label), `GlanceStage.flat`, `Wayfinder.go` / `goings` (`children.find(k => k.moves)`), `MenuModel.lead` (overland → `view:map`), the `LensRow` / `Acts` fallbacks building a `Choice` of their own, `Act.click` by index | The TB-12 guess survives on the page; navigation identity is a menu position |
| A row's words | `Doable.row` (`alone`, `called`, `only`) | `GlanceStage.label`, `MenuModel.said`, `Words.going`/`shown`, `Wayfinder.distinct`, `Offers.borneWay` | Three wordings of one act are possible (page, terminal, runner) |
| Grouping and paging | none in the engine | `LensFocus.things/alike`, `LensRows.grouped`, `Paging.of`, `TalkFocus.of` (room 3 − answers), `TerminalDoable.unfolded`, `RunnerOffer.grouped` | Each client pages differently; the page's pager rows are neutral containers |
| The gold step | `Promotion.continued` (the act) | `Glance.following` (ways, directional), `GlanceStage.next`, `SceneRail.goes`, `Wayfinder.bears.aimed`, `AimContinuity` | Already the subject of the trust contracts (B). Converging, but still read in four places |

## 2. The actual causes of the recurring false indications

The register's history, read as causes rather than symptoms:

| Row | Symptom | Cause as diagnosed then | Cause in the terms of this report |
|---|---|---|---|
| OPR-04 (M20) | a blue pip with no blue reply | replies that teach not typed | container aspect from the container's reasons; children unmarked |
| PL-32 (M21) | Lindal's likeness blue, the engine gold | the page composed the likeness from acts | the likeness's meaning had a second owner (now `Likenesses`) |
| PF-02, CL-34 | an opener done by its first act | `Runner.opener`; the gold opener at the speaking door done as "Push and pull" | "what a row does" decided by each client; fixed for the CLI by `Doable`, **still live in `GlanceStage.acted`** |
| OR-57 (17 Nov) | companion on Go…, on no row | the lens did not rank rows bearing the facet | the mark read the lens; the rows read something else |
| OR-68 | companion icon, no one on the rows | the way's row did not say who | words and mark owned apart (`Sensed.who` added) |
| OR-73 / OR-95 (18 Nov) | Go… gold over no gold row | the mark lit by the promoted lens, the drawer drew `Wayfinder` | two containers for one control (fixed per mark by `Wayfinder.bears`/`AtHand.bears`, b235ab44) |
| OR-76 | green in a talk, none outside | the talk read `Owed`, the engine's reasons did not | two owners of payoff; the fix added the reason (`owed`) **with** its leaf (`owedFor`), which is the right pattern |
| FM-05 | the chain fact → pip → row untested | — | per-mark pins, no construction invariant |
| b7387454 (19 Nov) | gathered row gold, nothing gold inside | each drawer made its own witness | one witness per row (`LensRows.borne`); still the row's **own** witness, not its children's |
| AT-05, AT-06 (19 Nov) | a lens/likeness/suggestion with no supporting row | — | the two causes below, still live |
| AT-04 (19 Nov) | 10 pages, a blank first row that went to the landing | — | no grouping in the places lens (structural); blank not reproduced (§3) |

The two causes still live are these.

**Cause A: a container's meaning taken from the container.**
- `Affordances.of` gives a candidate reasons (`whys`) and, for some of them, the act within that the reason is for
  (`leaves`). `Promotion.promoted` turns all the reasons into `aspects` and only the leafed ones into `inside`. The
  page marks a container by its own `Promoted` witness, and its children by `inside`.
- Any reason with an aspect and no leaf breaks the promise by construction:
  - `served` returns `means` (a lesson) and `spoils` (a sale) without a `choice`, so no leaf;
  - `ownWhy` has no leaf;
  - `unvisited` on a way's look has no leaf;
  - `sign` has a leaf only where `looked` or the opener has a command;
  - `held` ('exploration') reuses `kept`, which may be undefined.
- The probe finds this at the first frame of iscoed, a1 and kite. Every fix so far (OR-57, OR-68, OR-73, OR-95,
  b7387454) made a mark equal to a row's **own** witness. None made a container equal to its **children's**.

**Cause B: one control, two containers.**
- `SceneRail.lensed` switches Go… and Look… between the engine's lens and the page's `Wayfinder`/`AtHand`. The
  latter keep their own ranking, grouping and witness choice.
- Each switch position was pinned separately (test/marks-borne compares the mark with whichever drawer is current),
  so a mismatch inside the Wayfinder (`Marks` by `sensed` with `holds`, `bears` by the heart only) is invisible to
  it.
- The same holds in miniature for the talk (`Likenesses` against `TalkFocus` plus `Attest.reply`), and for the
  first-page-only rail mark against a pager row that is always neutral.

Neither cause is a missing witness. The brand is sound: test/small/indicator-witness passes, and no tone is forged. The
defect is attribution.

## 3. Classification

| Error kind | Class | Evidence |
|---|---|---|
| Opener or likeness lit by a reason with no leaf (AT-06; AT-05's "social") | **duplicated semantic ownership** (the container's reasons and its children's witnesses are two owners of one meaning) | probe P1: 49 of 130 led openers; `Affordances.served` (means, sale), `ownWhy`, way looks |
| Go…/Look… mark against the drawer currently shown (OR-73, OR-95) | **duplicated semantic ownership** (two containers) | `SceneRail.lensed`, `Wayfinder.bears` vs `Wayfinder.sensed` |
| Rest rows coloured in the terminal, plain on the page | **duplicated semantic ownership** | probe P4: 123 rows; `Offers.candidate` vs `Attest.index` |
| An opener done by its first child on the page | **duplicated semantic ownership** (TB-12 incomplete) | `GlanceStage.acted` |
| Shut acts with no command and no reason in `Doable` | **ordinary defect** (an incomplete constructor) | probe P3: 50 rows; `Doable.Row` lacks `disabled` |
| The places lens 10–11 pages, one way per row | **ordinary defect** in the engine's lens (no grouping), compounded by duplicated ownership (`Wayfinder` has the grouping the lens lacks) | probe: max pages places 10 (iscoed), 11 (a1/kite); `LensFocus.things` groups by `subject ?? choice`, ways have no subject |
| A blank first row that returned to the landing (AT-04) | **ordinary renderer/navigation defect**, not reproduced | no blank label in any engine row or lens act (probe P3/P3b: 0 blank among ~3,900 rows and lens acts). Plausibly (not verified), from a room off the landing the first places row is the way back (`retreat`, tier 0), which goes to the landing; if so the navigation matched the row's identity and only its words were missing. Candidates: a label drawn invisible (today's AT-03 tint, `.wf-row.toned`); `MenuModel.lead`'s overland remap; `LensFocused`'s page index (`useState`) surviving a glance change. A browser repro is wanted, then the row-validity invariant (§4, I3) |
| A companion perceived through privileged knowledge; route to a named person's true place | **graph reachability** (knowledge boundary) | `Companions.possible` reads unspoken `willing` topics; `AimRoute.outward` reads `world.one('at', id)` with no knowledge test. Unverified as a visible defect; pin with a tiny world |
| A lens mark from page 1 only; neutral pagers | **duplicated semantic ownership** (paging owned by the page, marks by the engine) | `LensRows.marks` ("only of the rows in view"), `LensFocused` "More…" `plain="neutral"`, the talk's "Something else…" |
| Gold continuity across routes | **graph reachability**, now mostly held (trust contracts B, `scripts/gold-continuity.ts`: 0 lapses in nine walks) | `AimContinuity`, `AimLeading` |

## 4. Invariants that make whole classes unrepresentable

The model (target, M23): **`Offering`**, a tree the engine builds once per glance.

```ts
declare const marked: unique symbol;
interface Mark { readonly witnesses: readonly Witness[]; readonly [marked]: true }   // as Attested, but structural
type Node = Leaf | Group;
interface Leaf {                       // built only by Offering.act
  kind: 'act'; id: string; label: NonEmpty; does: Command; target?: string;
  standing: 'immediate' | 'reachable' | 'contingent'; shut?: string;   // shut: why it cannot be done now
  mark?: Mark;                         // Mark.leaf(witness of this id), or none
}
interface Group {                      // built only by Offering.group, Offering.page, Offering.promote
  kind: 'lens' | 'opener' | 'subject' | 'quarter' | 'page' | 'pager' | 'likeness';
  id: string; label: NonEmpty; says?: string; children: Node[];
  mark?: Mark;                         // always Mark.fold(children): there is no other constructor
}
```

| # | Invariant | Kills | Enforced by |
|---|---|---|---|
| I1 | **A group's mark is the fold of its children's marks**: `Mark.fold(children)`, its witness list the union of the leaves' witnesses beneath it. No other constructor exists for a group mark | AT-05, AT-06, OR-57/68/73/95, OPR-04, PL-32: every container that promises what it does not hold | the brand (as `Attest` today); test/small/indicator-witness extended: `Attest.of`/`join` and the `Mark` brand callable only in `src/presentation/offering.ts` |
| I2 | **A leaf's mark is its own id's witness and nothing else**. An opener has no witness of its own. A reason with an aspect must name its leaf, or it gives no aspect | Cause A at its root | `Candidate.whys` typed as `{ why, leaf?: command }[]`, and `Aspects.of` reads only those with a leaf for an opener; spec P1 (below) as the regression pin |
| I3 | **An executable leaf has words, a legal command or a stated reason, and its target is its own**. `Offering.act(choice)` throws on an empty label, a command not in `PlayerView.choices` (or a `travel:`/`view:` the engine issues), or a shut act without its reason | AT-04's blank row (wherever it comes from, a leaf cannot be built blank); the 50 inert rows; the page's ad-hoc `Choice` fallbacks | constructor; spec P3 over the tree; the page sends back `leaf.id` and the session resolves `does` from the tree, never from a menu index (`Act.click`) |
| I4 | **Promotion moves no meaning**. The four are references to leaves already in the tree (`Offering.promote(tree) → Leaf[]`); gold (`continues`) is a property of a leaf, so a promoted copy cannot differ from its original | `Promotion.continued` vs `Promotion.gilded` vs `Offers.ungilded` drift; the four against the lens against the offer | one tree; `acts`, `lenses`, `offer` become views of it |
| I5 | **Paging and grouping are pure functions in the engine that emit nodes**: `Offering.page(group, room)` returns pages, and each pager node's mark is the fold of the pages it turns to. A client chooses `room` and renders | the first-page-only mark; neutral pagers; three paging implementations; the 10-page lens (grouping by quarter, by subject and by alike stem in one place) | the functions live in `src/presentation`; the page-controls ratchet (OR-94) forbids page-made rows; a property test over random trees (below) |
| I6 | **One control, one container**. A rail mark is the mark of the group its touch opens, by id (`SceneRail.go = tree.lens('places').mark`) | Cause B; `SceneRail.lensed` becomes a layout choice, not a semantic one | `Wayfinder`/`AtHand` become renderers of the group; their `ways`/`bears`/`of` deleted |
| I7 | **A remote opportunity reaches a container only through a leaf that goes toward it**: a directional witness `{ toward: id, via: route, far }` on the first step's leaf | marks lit by something with no way to it; gold that vanishes (trust contracts B) | the reachability pass (§5, step 6) is the only issuer of directional witnesses |
| I8 | **Every derivation of a remote opportunity reads through `Known`**: a player-safe facade over visited, `knows`, `acquainted`, told `leadsTo`, the map's `heard`/`seen`, and perceived (within reach, by the Perception rules) | knowledge leaks (trust contracts H, "knowledge integrity", still "to write") | a lint like the dependents query: `world.one`/`world.test` forbidden in `src/presentation/reach*.ts` outside `Known` |

Not every client must use the whole tree. The runner and the terminal can list the four and the lenses flat. But
they list nodes, so the parity spec (TB-01, test/small/one-projection) becomes a check of identical node ids and
commands.

## 5. The smallest credible sequence

Each step has a test that fails before it and a size estimate (lines changed, code and spec together).

| Step | Change | Test basis | Size | When |
|---|---|---|---|---|
| 1 | **The support spec.** The probe's checks as `test/small/opportunity-support`: P1 (every led opener's drawn aspects borne by a descendant witness), P2 (every likeness aspect, danger aside, borne by a row of that subject), P3 (every Doable row has words, and a command, rows to open or a reason). On tiny worlds: one opener led for 'own', one teacher with a lesson, one seller, one shut act. P1 to P3 are first `it.failing` (feature-pin style) | tiny Kyr worlds (`test/support/tiny.ts`), under 1 s each; the walk version (iscoed drove, a1 and kite autowalk) in the nightly lane | ~200 | M22 now |
| 2 | **Every aspect-bearing reason has its leaf** (I2 in its smallest form): `Affordances.served` returns `choice` for means and sale; `ownWhy`, the way look's `unvisited` and `sign` name their leaf, or the reason gives no aspect on an opener (`Aspects.of` reads a `leafed` flag) | step 1's P1 and P2 pass; test/marks-borne and test/owed-borne unchanged | ~120 | M22 now |
| 3 | **Children drawn with their witnesses; pagers folded**: `PlaceStage.Opened` / `Act.List` take the row's `Attest.within` (as `GlanceStage.LensRow` does); `LensRows.marks` reads every page, and the lens's "More…" and the talk's "Something else…" carry `Attest.join` of the rows they turn to | marks-borne extended: a pager's mark equals the union of later pages; a small render spec on a tiny world with an opener of three children, one blue | ~150 | M22, with OR-94 (it touches the rows the page-controls ratchet counts) |
| 4 | **Row validity and one owner of each row's meaning**: `Doable.Row.shut` (from `Choice.disabled`); `GlanceStage.acted`'s first-child guess deleted (the opener opens, as `Doable`); the `LensRow` / `Acts` own-`Choice` fallbacks deleted; the rest's colour from `Attest` (index `offer.rest`) **or** `Offers.candidate` aspects removed. Which of the two is an owner's call: HP-06 argues that the editorial 'worth a look' should not be shown | step 1's P3; one-projection extended to the rest's aspects (page = terminal); test/small/runner-opener | ~250 | M22 (part of step 1 of the maturity track) |
| 5 | **`Offering`, the tree** (I1, I3–I6): `src/presentation/offering.ts` built from the `Scene` tree and the `Candidate`s, in place of `Doable` (which it subsumes); `acts`, `lenses` and `offer` derived from it; `Offering.page` and `group` (quarter, subject, alike stem) moved from `LensFocus`, `LensRows.grouped`, `Wayfinder.quartered`, `TalkFocus` and `Paging`; the page renders nodes (ChoiceRow takes a `Node`), sends back `leaf.id`; `Wayfinder.ways/bears`, `AtHand.of/bears`, `LensRows`, `Selection`, `GlanceStage.{acted, flat, foreground, offered}` and `SceneRail.lensed` retired | **a synthetic choice hierarchy**: `Offering.of` over hand-built trees and seeded random trees (no world). Properties: fold = union of leaves on every group; for every `room` in 2..6 and every page, pages' marks ∪ pager marks = the group's; promotion never changes a leaf's mark; collapsing a group preserves its mark; no leaf without words or command; navigation by id resolves to that leaf's command. ~50 ms | ~1,500 (≈ −900 page, +600 engine) | M23 |
| 6 | **Bounded reachability behind `Known`** (I7, I8): one pass per glance over the known, perceivable graph (`Itineraries.graph`, with `Perception`'s shut rules), per aspect reach (companionship 1, Gregarious 3; knowledge and danger perhaps 1), capped at N nodes; it issues directional witnesses on the first-step leaves with `toward`, `via` and `far`, and the standings immediate, reachable and contingent (contingent from `Threshold.leads`/`Means`: what bars it and who has what opens it). `Companions.possible` and `AimRoute.outward` read through `Known` | **a tiny Kyr world**: the lane of three (`test/small/companion-sensed`) extended with a padlocked shed with a seller of the key in the next room (contingent); a teacher two rooms off (reachable); a person who moves unseen (no leak: the old place keeps nothing, the new place shows nothing until perceived); a recruit topic never heard (no "might join" before perception allows it) | ~600 | M23 |
| 7 | **Explanation**: `kyrie inspect --why indicator <container-id>` (see §7) | `test/small/why` extended: on the tiny world, the Go lens's companion explained down to the fact `at(ysolde, taproom)` and the reach rule | ~250 | M23 (after 5) |
| — | **Integration proof** | test/marks-borne generalized: along the drove road and the a1 kin start, every group in the tree (lens, opener, likeness, pager, quarter) equals the fold of its rendered children, compared in the rendered page; the probe's P1 to P4 at 0; one browser spec of the Go lens at Porthalen's landing (paged and grouped, first row worded) on CI | ~200 | M23 close |

Steps 1 to 4 come to about 720 lines. They close AT-06's measured cause, the inert rows, the opener guess and the rest's
parity, without the tree. Step 5 is what makes the classes unrepresentable rather than tested.

## 6. What belongs in the current maturity work, and what in a mission

The maturity track's step 1 and OR-94 (the page's own buttons burned down to ChoiceRow, the lenses and the books) are
being worked now. They overlap this report at the row. The rule: **touch meaning only where a button is already being
converted.**

**In M22, now:**
- **Step 1** (the support spec). It reads only and lands independently.
- **Step 2** (leaves for every aspect-bearing reason). It is engine-only and invisible to OR-94.
- **Step 3**, done as each row the OR-94 burn-down touches is converted: `PlaceStage.Opened`'s `Act.List` becomes
  ChoiceRows with witnesses, and pagers become ChoiceRows with folded marks.
- **Step 4**'s `GlanceStage.acted` deletion and `Doable.shut`.
- **AT-04's browser repro** (a renderer defect, §3). The places lens's grouping is a stopgap until step 5: group ways
  by `Wayfinder.quartered`'s rule inside `Promotion.lensed` or `LensFocus`. It is ~80 lines and worth doing now,
  because ten pages is a playability defect today.

**In a dedicated mission (M23, "one offering"):** steps 5 to 7 and the integration proof.
- **Why not M22.** Step 5 changes every client's read of the glance. It changes the protocol the page receives (a
  versioned presenter protocol, maturity study §8.3 H). It retires roughly 900 lines of page semantics. It is the
  maturity study's item A ("finish the authoritative Doable and presenter contract") done to completion, with the
  container rule added, and that study already rates it medium cost and low semantic risk. Step 6 needs the owner's
  rulings on what may be perceived at a distance, for which aspects, and at what reach (the atlas study's open
  hypotheses on the condition 'heard' and on uncertainty's shape).
- **Order in M23:**
  1. the tree beside `Doable` (parity spec);
  2. the runner and terminal on it;
  3. the page on it, one container kind at a time: lens, opener, likeness, pager, then Go's quarters;
  4. the old readers deleted;
  5. then reachability;
  6. then `--why indicator`.

## 7. How the engine could explain an indicator

What exists:
- `Attest.why(glance, id)` says only whether an id is attested and drawn.
- `kyrie inspect --why fact` and `--why placement` (MT-04, `src/cli/why-fact.ts`, `why-placement.ts`) explain world
  facts and generated placements. `--dependents` gives readers and writers of a symbol.
- The maturity study §7.1 proposed `why action <id>`. It is not built.

**`kyrie inspect --why indicator <container-or-row-id> [--world <seed> --at <transcript>]`**, read off the `Offering`
tree, would print five layers.

1. **The container.** Its kind (lens, opener, likeness, pager), its mark, and its condition (`Indicator.condition`).
   Why it is on this container: the path of groups from the rail mark down to each leaf whose witness contributes, and
   the page each leaf is on.
2. **Each contributing leaf.** Its id, words and command; its standing (immediate, reachable or contingent); its
   witness (kind, aspects, `far`, `via`).
3. **The opportunity.** The candidate's reason (`Why`) that gave the aspect, with its note. This is the layer for which
   `Promoted` would keep `whys` and `leaves` (today only `why`, `inside` and `note` survive). The `Reading` field it
   came from: `named`, `sensed`, `companions`, `signs`, `marvels`, `paying`, `help`, `opened`, `idle`.
4. **The connections.** For a directional witness, the route (`Itineraries` legs or the Perception walk), the ways
   gone along, and the ways not gone along because they were shut, guarded or needed something.
5. **Conditions and knowledge.** The facts read, each delegated to `--why fact` (its declaration line, the rule or act
   that made it, whether the company knows it, and by which `Known` predicate). For a contingent leaf, what bars it and
   who has the means (`Threshold.leads`, `Means`).

Read the other way, `--why indicator --absent <id>` explains why a container is **not** lit. Possible answers:
- no leaf beneath it bears the aspect;
- the leaf bears it, but it is past the perception reach;
- it is known only by word (heard);
- it is idle or spent;
- gold is hidden by Guidance.

This is `Attest.why` grown, and the counterexample tool for the knowledge contract.

Cost and placement: ~250 lines on top of step 5, mostly printing. The data is already computed per glance, and keeping
`whys` and `leaves` on `Promoted` adds no work. The `why-*` modules' pattern (`why-tool.ts` dispatch,
`why-writer.ts` output) fits it unchanged.

## 8. Caching and invalidation

- **Today it is sound by immutability.** Each committed act makes a new `World`. The glance is rebuilt on every act
  (OR-73 found no memoization of frame or rail). The engine's caches are all `WeakMap`s keyed by that object or by a
  key that includes `history.length`:
  - `Attest.index` and `Doable.read` per glance;
  - `Itineraries.read`/`trees` per world and `actor:history:here:clear:roam`;
  - `Companions.possible` per world;
  - `PlayerView.choices` per operator list.

  There is no invalidation to get wrong in the engine.
- **The staleness risks are client state keyed by position**, not by node id:
  - `LensFocused`'s page index (`useState(0)`) and the talk's (`useState(0)`) survive a new glance and are taken
    modulo the new page count, so after an act a lens can open on page k of a different list;
  - `Act.click` resolves by `data-index` into a menu rebuilt with `open`;
  - `LensFocus` drops a focus that names nothing, which is the right pattern.

  Under the tree, client state is a node-id path (focus, page) validated against the new tree on each frame.
- **The cost of the tree.** The candidates are already computed. Folding marks is linear in the tree's size (431
  Doable rows over the drove walk; at most ~100 per frame). The reachability pass is one more bounded search per
  glance, over the graph `Itineraries` already builds and caches, at about the cost of `Perception.sensed` with range
  3.

## 9. Reproduction

- `cd /var/tmp/kyrie/wt-m21 && bun /var/tmp/kyrie/m22/probes-at07/support.ts` runs iscoed's drove road, the seven
  acts of test/marks-borne.
- `AUTO=a1:kin:mage,kite:kin:warrior TURNS=25 bun /var/tmp/kyrie/m22/probes-at07/support.ts` runs two pseudo-random
  walks (row `(turn·7) mod n` of `Doable.flat`, never `view:`).
- Results:
  - drove: P1 8 of 10 led openers; P2 0; P3 0; P4 123; places at most 10 pages.
  - a1 and kite: P1 49 of 130; P2 0 of 52 likenesses; P3 50 inert rows of 1,808; places at most 11 pages, people 4,
    things 3.
- Specs run and passing at 0106db289: test/small/doable, one-projection, indicator-witness, witnessed, lens-focus and
  companion-sensed (36 tests). test/marks-borne was not run (a drawn world, 180 s); the probe reuses its walk.
- Not verified:
  - AT-04's blank row (no browser run, as instructed);
  - whether `Companions.possible`'s reading of unspoken recruit topics, or `AimRoute.outward`'s true position of a
    named person, is visible as a defect in play (both are unguarded reads; step 6's tiny world is their test).

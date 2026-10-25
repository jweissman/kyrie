# C. Dependency-based implementation sequence

Phase III, snapshot `483e3af`. This is deliberately short. Each step names what it unblocks and its acceptance
evidence: slices are in `A-validation-plan.md`, contracts and decision records in `B-contracts-and-decisions.md`.

---

## Before the next phase (must precede)

These are small, correctness-level steps. The next phase's slices cannot produce trustworthy evidence without them.

| # | step | why first | acceptance | size |
|---|---|---|---|---|
| 0.1 | Installation validates only what it installs (Phase I A1) | lazy installation runs this path by design | Slice 0 | small |
| 0.2 | No checkpoint during a command; serialise the worker's requests (Phase I A2) | every crossing is a window | the Phase I checkpoint-race probe shows equal steps and events | small |
| 0.3 | One answer to "what is beyond this march" (Phase I E2) | discoverability evidence is meaningless if the signpost lies | 20 seeds: stone text equals installed country | small |
| 0.4 | Bound variables render in all authored text, and an unbound `{?x}` is a compile error (probe: "?f") | companion and investigation lines need it | `companion-name-variant` prints the fact's name | small |
| 0.5 | The journey test tier: start from Begin, use offered choices only, play with a policy that sees only `PlayerView` | the only way to measure the experiential column | the Slice 1 harness runs headless on 10 seeds | medium |
| 0.6 | Save and transcript stamps: engine, rules, content and dependency hashes (DR6 (a)) | the slices produce saves we need to trust | a save under changed content is refused with a message | small |

**Decisions to take now, before content is written against them:**
- DR3 (kinds), DR5 (compatibility) and DR9 (vocabulary curator): these are owner decisions.
- DR1 (world identity) can wait for Slice 1's evidence.

---

## The next phase, in order

1. **Slice 1: one game, two adventures.**
   - K1 as `countries.json` entries plus hooks plus `compat` and `arrival`.
   - Thrume's placed variant, written by Thrume's author.
   - Its eager variant, run as a measurement for DR2.
   - *Unblocks* K1 version 1, and the decision on DR1.
2. **Slice 4: the independent author**, begun as soon as Slice 1's contract exists, and run *alongside* steps 3–4.
   - *Unblocks* freezing K1–K3 at version 1.
   - *Its findings may change K1's shape. That is the point of running it early.*
3. **Slice 2: the small city,** with the academy, the Ellisant house and the Lanterns.
   - Needs the DR3 implementation (shared kinds), wording disambiguation (DR4), and library-wide lint (K2).
   - *Unblocks* the city as the default start.
4. **Slice 3: travel.** Needs Slice 2's city and one service.
   - Assisted travel as an expansion macro, a vehicle actor for the ship, and the reachability audit.
   - *Unblocks* K6.
5. **Slice 5: Ferrand and the tower.**
   - Needs 0.4, per-member perception (DR7 (b)), and carriers for institutions.
   - *Unblocks* K5 and K7 as contracts.

Steps 3 and 5 are independent of each other once step 1 is done. Step 4 depends on step 3's city.

---

## Alongside (no ordering constraint)

- Moving `voiced` into ids, and perception out of `presentation/` (K7). Do it when Slice 5 touches telling.
- A performance watch: re-run `journey-profile wren`, `sim-bench wren` and the Slice 1 harness on every slice. Budgets are in `D-risks-and-dissent.md` §3.
- The authoring guide gains one page per construct that Slice 4 shows was missing.

---

## Not in this sequence

These are deferred abstractions; each has a named trigger in document B or A.
- The world plan beyond placements and routes.
- City sockets and lots.
- `preserve`, `mayVary`, `worldMay`.
- A strategic layer.
- Remarks and tags.
- Horizon time advancement.
- Transport capacity or markets.
- Procedural languages beyond `PlaceNames`.

---

## Potential dead ends

These are attractive shortcuts that would lock the project in.

1. **Installing the whole library eagerly into every world, without dormancy.** Clocks run unseen, and costs grow with the library.
2. **A global tag ontology** designed in advance. Shared vocabulary should grow from slices (K3, DR9).
3. **Per-module copies of the shared rules,** "versioned stdlib forks". Cross-author interaction then dies silently; `ModuleShadow` already solves the growth problem.
4. **Teleport-based acceptance tests for composition.** They pass while A1-class bugs remain (Phase I H1).
5. **Generated dialogue for named characters,** or personality statistics that select lines.
6. **A procedural street grid for the city.**
7. **Letting generation decorate authored places.**
8. **Making mid-play installation the default for everything** (city wards, institutions) before Slice 0 and 0.2 have held for a while.

---

## Migration and compatibility

- **Existing adventures need no change** for steps 0.1–0.6.
- **K1:** the placed variants are additive files, as `the-long-man/placed.json` is today.
- **DR3:** the irreversible one. Decide it before Slice 2. Existing local kinds stay local, and nothing shipped yet shares kinds.
- **K5 (b):** keeps `knows(company, ·)` as the union of members' knowledge, so authored conditions continue to work.
- **K7:** old saves' rendered `voiced` text is read as legacy.
- **No compatibility machinery** for systems not yet built.

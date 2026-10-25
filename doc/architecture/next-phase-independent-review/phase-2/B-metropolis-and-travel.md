# B. Metropolis and travel study

Phase II, snapshot `483e3af`. Tags as in document A:
- **[R]** a requirement;
- **[O]** an option;
- **[Rec]** a recommendation;
- **[S]** speculative.

---

## 1. What the current model gives a city

**The place hierarchy** (`src/spatial.ts:5`, parents at `:121-125`):

```
plane > region > settlement | wilderness > site > building > level > room
```

- Every place has a grid position within its parent.
- `connects(passage, a, b)` facts with a `passageKind` and a time (`data/rules/passages.kyr`) make the way graph.
- `visibleTo` and `revealedBy` hide ways from a company that does not know them.

**A generated region at seed a1** (navigation investigator, `probes/agents/navigation/probe1.ts`):
- 216 places, of which 5 are settlements and 165 rooms;
- 176 passages;
- 2,717 entities and 15,174 facts;
- 2.9 s to assemble and start.

**Settlements are drawn as people and work** (`src/world/community/community.ts`):
- who works at what, where they are of an evening, households, one small trouble;
- scenes told by founding and size (`settlement-scenes.ts`);
- rumour carriers per settlement: innkeeper, traveller, priest, merchant (`RegionWriter.carriers`).

**Gaps for a metropolis:**
- There is no `district` or `ward` kind: a `site` or `building` within a `settlement` is the nearest thing.
- There is no notion of a street as a place that *contains* frontages.
- No settlement is larger than a village.
- No two modules can contribute to one settlement. An entity is owned by one installation; others can only import exported places (`ModuleBundle.imports`) and add their own places beside it.

**What the import model does allow is the foundation:**
- A module can import `city.market` (a typed place, checked by `RoleRequirements`), and declare `Place stall "…" is room within market`. Spatial parents may be imported ids (`ModuleNamespace.entity`: `space.parent` mapped through imports).
- So "my building is inside your ward" is expressible today.

---

## 2. Composition models for a shared city

### Model 1: a fixed city module with open lots (lot model)

- **How it works:**
  - One authored (or curated) **city module** declares wards, streets, landmarks, institutions and **lots**: typed, exported, empty places with requirements (`lot(?l) and ward(?l, riverside) and frontage(?l, street)`).
  - Contributions fill lots, the way kit slots are filled (`SlotSpec` with `is`, `requires`, `prefers`; `claims` makes a lot exclusive).
- **Who controls what:**
  - The **city** controls the plan, the street graph, distances, landmarks and civic authorities.
  - The **author** controls everything inside the lot, plus what they export.
- **For:**
  - coherent geography;
  - density is bounded by the number of lots;
  - conflicts are slot conflicts, which the ledger already refuses and traces;
  - an author's building is exactly as composed.
- **Against:**
  - a ward-sized contribution (a whole academy precinct) does not fit a lot;
  - the city author becomes a bottleneck;
  - lots must anticipate kinds.

### Model 2: wards as modules on a city skeleton (ward model)

- **How it works:**
  - A thin **city skeleton** declares the city's outline: gates, the river, the main streets as a ring-and-radial graph, the citadel, and **ward sockets**, each a frontage on the skeleton with a character (riverside, hill, outside the old wall).
  - A **ward contribution** declares a whole ward: its own streets, buildings, people and institutions. It attaches by binding its gates to a socket's frontages.
  - Smaller contributions (a shop, a tavern) attach to **lots** that wards *export*.
- **Who controls what:**
  - The **skeleton** controls the topology between wards and the shared landmarks.
  - The **ward** controls its interior, and the lots it offers to others.
- **For:**
  - the academy precinct and the merchant quarter are each one author's ward;
  - the skeleton stays small;
  - lots nest.
- **Against:**
  - two ward authors may both want "the river frontage";
  - a ward's internal scale must agree with the skeleton's distances.

### Model 3: overlay (social-layer) contributions

- **How it works:** a contribution adds **no places**. It adds people, institutions, relations and rules that live *in other modules' places*, by role.
  - A clandestine society needs "a tavern back room in any ward", "a respectable patron", "a printing shop".
  - It binds them by `RoleRequirements`-style conditions against what wards export.
- **For:** this is the only honest model for the clandestine society. It is *about* infiltrating existing places.
- **Against:** it touches places others authored, so it needs the strictest `worldMay` and `preserve` contract (§2.5).

### [Rec] Ward model plus overlay, with lots nested in wards

- Wards are the unit of authorship and density.
- Lots are how small additions fit without a ward author's coordination.
- Overlays are allowed only through what wards and the skeleton export as **public surfaces**:
  - `room` exports with a declared `admits: overlay`;
  - exported relations such as `employs(place, group)`;
  - people exported with `worldMay: ["secretly serves"]`.

All three reuse kit slots, the ledger, `claims` and the trace. None needs a change to the engine's central invariants.

### 2.1 Composition and identity

- **[R]** Contributions refer to the city's parts **by exported role, not by internal id**: `city.market`, `city.river_gate`, `city.ward(riverside)`.
  - The existing import syntax (`owner.export`) does half of this.
  - **[Rec]** Add role lookup by predicate: `{ "is": "ward(?w) and character(?w, riverside)" }`. That is a kit slot, bound at plan time, recorded in the ledger.
  - Contributions then do not hard-code the skeleton's ids, and two cities could host the same ward.
- **[R]** The city's identity is the skeleton's installation id. "Belongs to the same city" means "imports from the same skeleton".

### 2.2 Spatial structure

- **The skeleton fixes:**
  - the graph between wards (passages with times);
  - the street names it owns;
  - what each socket's frontage is.
- **The ward fixes:** everything inside.
- **[R]** The ward declares its **footprint** (how many frontages, how deep in minutes) and the skeleton's socket admits it.
- **[S]** A compositor could lay sockets by Deem from the skeleton's terrain. I recommend hand-authoring the skeleton of the default metropolis: it is the world's anchor, and it deserves an author.

### 2.3 Historical coherence

A ward installed in play has existed for centuries.

- **[R]** Its history is **dated before the campaign's start**. The plan places the ward at world creation (document A §3.3), even if its modules install lazily.
- Its public face is in the world from the start:
  - the skeleton's street names mention it ("Scholars' Stair");
  - the city's carriers speak of it;
  - generated history may refer to it, through an exported `founded(ward, era)` fact.
- **What is new to the player is the detail, not the existence.** Lazy installation must never install a ward the company is already standing beside. The horizon is one step out (`Frontier.prepare` does this today).
- `Histories` already draws a world-level past shared by every region: makers, kingdom, fall (`src/world/history/histories.ts:58-60`). A ward's `founded` and `era` facts join that ledger rather than inventing their own past.

### 2.4 Conflicts

| conflict | handling |
|---|---|
| two authors claim the same site or socket | ledger `claims`: the second placement is refused, traced, and offered the next candidate by `prefers` (as `Binder` does) |
| two incompatible civic authorities | **[R]** some roles are **singular per city** (`ruler`, `watch`, `principal university`). The skeleton declares them; a ward may *fill* one (`fills: university`) or offer a *rival* (`rivals: university`), never a second of the same. A second `fills` is refused |
| two "principal universities" | the same: one `fills`; the other may be placed as a lesser college that `rivals` it, if its author permits (`compat.roles`); otherwise it is not placed in this city |
| a contribution's fixed history contradicts the city's | refused if it contradicts a ledger fact (the ledger refuses contradictions today); otherwise both stand as **claims** (document C §4): the city's chronicle says one thing, the ward's charter another |

### 2.5 Preservation of authorship

- **[R]** A contribution's places are its own: generation never decorates them unless the contribution's `mayVary` allows it.
  - Today generation and authorship do not collide only because they are in different modules.
  - **[Rec]** Make it explicit: `preserve` in the manifest (document A §5). Lint and the plan check that no placement binds a slot inside a preserved place.
- Overlays may add only through exported public surfaces (§2, Model 3), so an author's precisely composed back room cannot gain a secret society without the author having exported it as `admits: overlay`.
- **The author's escape hatch** is to export nothing.

### 2.6 Discoverability

Existing mechanisms carry most of this:
- **Rumour channels** (`tavern`, `road`, `temple`, `market`) and **hooks** with `opens`.
- **[R] New: institutional channels.** An exported institution is a carrier (`channel: academy`), so the academy's porters talk of the academy's business.
- **Visible activity.** Community scenes (`community.ts`: "who works at what, where they are of an evening") extend to ward people. A ward's people are seen in the skeleton's shared places (market, river stairs) by exported schedules.
- **Signage.** A street's frontage names its ward and its notable doors: a **landmark** with a name, which the chart knows from the start (§3.2).

### 2.7 Density

- **[R]** The city is a **bounded number of sockets** (say 6–10 wards), each ward a bounded footprint.
- The city does not grow by appending neighbourhoods. A new contribution must take a socket or a lot, or it is refused.
- **[R] Long streets are passages with a time, not chains of rooms.** "The Long Stair (10 minutes)" connects frontages. Movement inside a ward is room to room; between wards it is assisted travel over known ways (§3).
- **[S]** A ward could have generated filler rooms (houses, yards), drawn on demand and only near the company. Not recommended until a ward needs it.

### 2.8 Design exercise: academy precinct, merchant quarter, clandestine society

- **The skeleton** (module `city`) exports:
  - sockets `hill_socket` (character: hill, quiet) and `river_socket` (character: river, busy);
  - the shared `market` and `river_stairs`;
  - singular roles `university`, `watch` and `ruler`, with `watch` and `ruler` filled by the skeleton itself.
- **Academy precinct** (module `academy`, author A):
  - `attach: { "is": "socket(?s) and character(?s, quiet)" }`, so it binds `hill_socket`; `fills: university`.
  - Declares the Scholars' Stair, the observatory, the library, the porters' lodge, and three professors.
  - Exports: `library_reading_room` (`admits: overlay`), the institution `academy` (a carrier with `channel: academy`), and `employs(academy, ?)`.
  - `preserve`: the observatory.
  - `worldMay`: `academy.relations`, `professor_ferrand.loyalty`.
- **Merchant quarter** (module `quayside`, author B):
  - `attach` binds `river_socket`.
  - Declares counting houses, a bonded warehouse, the Ellisant trading house (an embassy of a distant realm), and a tavern.
  - Exports two **lots** (`stall_lot_1`, `stall_lot_2`), the tavern's back room (`admits: overlay`), the institution `ellisant_house`, and a **transport service**: the river packet (§4).
  - Its hook: "the Ellisant house is buying old glass".
- **Clandestine society** (module `lanterns`, author C), an overlay with no places of its own:
  - Needs:
    - `{ "meet": "room(?r) and admits(?r, overlay) and serves(?r, drink)" }`, which binds the quayside back room;
    - `{ "patron": "institution(?i) and employs(?i, ?p) and scholar(?p)" }`, which binds a professor, if the academy permits `secretly serves`;
    - `{ "press": "lot(?l)" }`, which takes `stall_lot_2` as a printer's.
  - Declares its members as people placed *in* those places, and its rules and topics.
- **Discovering one another, as authorised:**
  - The society's patron is in the academy because the academy exported `worldMay: secretly serves`.
  - If it had not, the plan binds a patron from the merchant quarter, or does not place the society, and the trace says why.
  - The Ellisant house's buying of old glass is heard by the academy's carrier (it reads exported hooks), so a professor may mention it: a cross-reference neither author wrote.
- **Individually authorable.** Each module lints and plays alone against a **stub skeleton**, a test fixture exporting the same roles. The trace reports what it bound.

**Models compared on this exercise:**
- **Lot model:** fails the academy (too big for a lot).
- **Ward model:** fails the society (it owns no place).
- **Recommended hybrid:** handles all three.

---

## 3. Geography, routes and travel

### 3.1 Two kinds of movement today

1. **Passages** (`passages.kyr` `go`): local and regional. A passage of two or more watches becomes a `Journey`, interruptible and able to turn back (`src/campaign/journey.ts:17-56`). A laden company goes at half pace (`action-time.ts`).
2. **Byways** (`data/rules/dominion.kyr:7-40`): `bywayFrom`, `bywayTo` and `bywayTime`, with **per-group route knowledge** `knowsWay(group, byway)` and `depart` / `arrive` actions. **No content declares a byway** (grep), so this abstraction is declared and unused.
   - There is a third, unused piece: `passage_fare` (`services.kyr:3`), with no reader.
   - The only path planners are generation-time (`src/world/compose/geography.ts:114-125`, Dijkstra for the ledger's `hours`) and a test helper.

### 3.2 The minimum model **[Rec]**

| concept | model | exists? |
|---|---|---|
| local movement | passages within a settlement or site | yes |
| regional movement | passages with time, through `Journey` | yes |
| a **route** | a named, ordered chain of passages (`Route north_road "the North Road" by p1, p2, p3`), with a total time | **no**: byway is the nearest; a route is a byway whose legs are real passages |
| route knowledge | `knowsWay(group, route)` per group, and per member once Phase I D1 lands | relation exists, unused |
| destination knowledge | `named` and `found` facts (`region-sites.ts:97-103`), and hooks that `open` | yes |
| a **service** | a route plus an operator, a fare (`passage_fare`), a schedule (departs when `hour(clock) == 7`), and a capacity | **no** |
| assisted travel | "Travel to X": plan over the *known-ways graph* and run the legs as Journeys, stopping at the first interruption, a fork the company does not know, or a place it has not seen | **no**; the chart's known-ways view (`ChartModel.ways`, `chart-model.ts:31-44`) is the graph |
| availability changes | a route or service is closed by a rule (`closed(route)`, `suspended(service)`), as a way is closed today (`Journey.open` checks the way each watch) | the per-watch check exists |
| risk | encounters while `enRoute` (written by `Journey`, read by no rule today) | half |

### 3.3 Additive or semantic change?

- **Assisted travel can be additive:**
  - It is a **macro over existing commands**. The planner proposes a chain of `go(passage, place)` ids already offered in turn. The session performs them one at a time, inside one player choice, with an interruption check between legs.
  - Replay is unchanged if the transcript records the macro's expansion (each `go`) or the macro itself plus a deterministic planner.
  - **[Rec]** Record the expansion. The planner's choices then never have to be replayed.
- **Services need one semantic addition:**
  - Today a `go` is the company moving itself.
  - A ride is the company being **carried**: time is the service's, the fare is paid at departure, and arrival is at the service's next stop, not the company's choice.
  - **[Rec]** Model a service as an NPC actor (a carter, a packet boat) that already has `travelling` / `arrive` (byways). The company **boards**: `aboard(company, service)`, and `at` follows the service.
  - That reuses `Journey` for time and interruption, and `Agency` for the operator's schedule. It needs:
    - a rule that the company's `at` follows the vehicle while aboard. This is a projection like `Journey.along` (`campaign.ts` `apply` calls `Journey.along`);
    - a `disembark` at stops.
- **[R] What must not happen:** the interface revealing an unknown destination.
  - "Travel to X" lists only places the company has `named` and can reach by ways in `knowsWay` or `walked`.
  - A route the company does not know may still be *used* by a guide: a companion's `knowsWay`, once knowledge is per member.

### 3.4 A comprehensible interface

- **[Rec]** Extend the existing chart (`ChartModel`: local map and regional map with travel times):
  1. **Known destinations** as a list beside the map, each with the best known route's time and cost.
  2. **Rumoured destinations**, from hooks heard but not `opens`, shown as a direction without a road ("north, somewhere past the fells").
  3. **Services at this place**, with their next departure.
- Labels name the far end of the route ("the North Road, to Merscheald (3 days)"), not the nearest room. This fixes the navigation investigator's F6.
- **Bearings** must not be guessed (`src/ui/bearings.ts:17-19` invents a side when it cannot place a way). Unknown means "?".

### 3.5 Authors contributing destinations and connections

- A contribution's `attach.by` names a **join**: a road (a new passage, as `Frontier.road` writes one), a landing on an existing service's route, or an institution's door.
- **[R]** A contribution may add a *stop* to a service only if the service's owner exports `worldMay: stops`.

### 3.6 Elves, dwarves and long distance

- Long routes between peoples' settlements are **routes over several regions**, joined at march-stones.
- The world plan holds them as ledger facts (`route(r, from, to)`, `hours(…)`) before the regions between are drawn. The traveller knows "the Dwarf Road to Khazad-Tumul, 9 days" before 9 days of land exist.
- **[R]** The plan's route facts constrain region drawing. A region drawn later carries the route's road through it (`WorldAssembler.beyond` already receives an `at` with `named` neighbours and an `exclude`, so the hook is there).
- **[S]** Different peoples' route names, in their own tongue, come from `PlaceNames` (document C §5).

---

## 4. Worked example: from the metropolis to three adventures

**Starting point.** The `order` origin, in the city of Caer Velin, the authored skeleton. The company is one scribe; the origin's errand is "copy the old writing at {work}".

1. **Day 1, the Scholars' Stair (academy ward).**
   - The porters' lodge is a carrier. A porter says the observatory has been writing to the watch-keepers of the Strewnfield.
   - **The House That Grows** variant's hook is heard: a direction, not a road.
   - Professor Ferrand asks for a lens to be carried there, and *tells* the way: `toldBy`, and the route `strewnfield_road` becomes `knowsWay`.
2. **Day 1, the quayside.**
   - The Ellisant house's clerk mentions a packet boat that came down empty from upriver: the **Let One Remember** hook, on the `market` channel.
   - The river packet's schedule board: departs 7th hour daily; the landings, the last being "the Eighth Bend".
   - The company does not yet know the bend matters. The landing is on the service's public route, so it is **named but not opened**. The hook opens it.
3. **Day 2, the carters' yard (skeleton).**
   - The innkeeper says giants have come down off Thrume, and the Margravine of Ebb pays: the **Thrume** hook, `road` channel, `opens`.
   - The North Road becomes a known route.
   - The chart now lists:
     - "the Strewnfield (4 days, by the Keel road)";
     - "the Eighth Bend (2 days, by river packet, 6 crowns)";
     - "Saltgrave, past the fells (6 days, the North Road; carters' wagon to Merscheald 2 days, 3 crowns)".
4. **The player chooses Thrume.**
   - The company boards the carters' wagon: the service, with fare paid.
   - It travels assisted: legs as Journeys, one interruption (a toll; the toll-road kit already exists), then disembarks at Merscheald.
   - From there the North Road is known but there is no service, so it walks, assisted, to the march-stone, whose text names the fells.
   - The crossing installs Thrume; `ClockShift` starts its clocks now.
   - Thrume is played as written, by its author's design.
5. **After Thrume,** the company returns south. Its known routes now include the North Road both ways, so assisted travel back to Caer Velin is one choice with interruptions.
6. **Let One Remember** by river packet. Its entry installs at the landing, and the Margin (marked `elsewhere`) is reached only through the adventure's own passages.

**At no point** does the player use a debugging tool, switch campaigns, or see a destination it was not told of.

**What carries the weight:**
- hooks and channels (they exist);
- the world plan (the kit ledger, extended);
- route knowledge (`knowsWay`, existing but unused);
- services (new);
- assisted travel (new, additive);
- installation at the horizon (the frontier, generalised);
- Arrivals and compat (new, small).

---

## 5. Performance and determinism notes

- **A metropolis of 8 wards is likely 2–4 generated regions' worth of facts** [S]: one generated region is about 15,000 facts. Today's engine p50 is about 130 ms at 104,000 facts (the builder's frontier segment), so this is affordable. The first limits Phase I predicted are choice grounding per townsperson and the screen model.
- **[Rec]** Ward modules install lazily, like any contribution. The skeleton, with the wards' public faces, is installed from the start.
- **Assisted travel** costs what its legs cost: Journeys are already per-watch. `time.md`'s horizon advancement is the optimisation for long routes, and it is not needed first.
- **A service's schedule is clock-driven:** deterministic, and replayed by the transcript's expansion.

# B. Mission 16 readiness memorandum

| | |
|---|---|
| snapshot | `483e3af58171e19418b292d013b388c30d93b14f` |
| branch | `review/architecture-2026-10-25` |
| companion document | [A. Final architecture synthesis](A-final-architecture-synthesis.md) (items numbered there are cited as "item n") |

---

## 1. Mission 15 handoff checklist (as of the pinned snapshot)

The builder's current state may differ from the snapshot. Check each item against `main` before acting on it.

**Repaired by M15** (verified at the snapshot):
- Frontier expansion is inside the command record. Replay draws the same country; a failed expansion undoes the command whole.
- Shared-rule growth no longer breaks modules (`ModuleShadow`).
- Dependencies are pinned; CI is visible about skips.
- Resolvers run after success is known (interruptible search).
- The per-rule-firing world copy is gone. Performance on wren is as documented, with hashes reproduced cross-machine.
- A second game no longer takes the first's kinds.
- Re-reading a document shows its text.

**Demonstrated and open at the snapshot** (repair before M16 relies on the path):
- item 1, the crossing crash (critical);
- item 2, the checkpoint race;
- item 3, march-stones naming the wrong country;
- item 4, `{?x}` printed literally;
- item 5, variable-anchored observations not teaching;
- item 8, identical action labels;
- two vacuous tests (`community.test.ts:151`, `wild-country.test.ts:103`; Phase I H1);
- the missing audit report (item 25).

**Safe for M16 to defer:**
- global catalogs (item 18);
- the perception layering (item 19);
- save size (item 20);
- the four reserved-vocabulary lists (Phase I L1);
- `deep-argument.ts` in TypeScript (Phase I L3);
- the strategic layer, sockets, the manifest and Remarks.

**Waiting on owner decisions:**
- compatibility (decision 2 below);
- shared kinds and vocabulary (decision 3);
- knowledge granularity (decision 4).

---

## 2. Is the candidate Mission 16 one mission?

**"One World, Many Adventures" is coherent as a goal, but not as one mission.** Its components fall into two groups
with different kinds of risk:

| group | components | risk | how it is tested |
|---|---|---|---|
| **integration** | correctness repairs; two adventures in one persistent game; discovery through hooks; known destinations and assisted routes; save, restore and replay across the joined world | engineering: mid-play installation, determinism | automatically, plus one player session |
| **authorship** | an authored city; a substantial companion; a transport service tied to a place; literary evaluation by a player and a writer | writing and editing; the companion's knowledge model | by people |

The second group depends on the first: a city start needs placement and travel, and a companion's cross-adventure
recognition needs two adventures in one game. The first does not depend on the second; it can start from today's
generated origin settlement.

**[Rec] Split it:**

- **M16A: "Two adventures, one road."**
  - The repairs (items 1–5, 6, 8).
  - The journey test tier (item 7).
  - The Long Man (already placed) and Thrume (a placed variant, written by its author) in one generated world, discovered through existing hooks from an ordinary origin.
  - Known destinations, and assisted travel over known roads.
  - Save, restore and fresh-process replay of the joined world.
  - The eager-installation measurement.
  - **No city, no companion, no service.**
- **M16B: "A city that remembers."**
  - One authored starting ward with district-scale surroundings (§6).
  - One transport service from it.
  - One substantial companion who recognises an event from independent content.
  - The return-and-consequence part of the journey.
  - The player and writer evaluations.

**Even smaller first release, if the repairs prove harder than they look:** M16A without assisted travel. That is two
adventures discoverable and reachable by ordinary movement, with replay. That alone falsifies or confirms the central
integration hypothesis.

### Content work that can proceed in parallel during M16A (by authors, no engine changes)

- Thrume's placed variant and its Arrival. It needs only K1's shape agreed: `{entry, attach, hooks, compat, arrival}`.
- The city ward's text, people, institutions and landmarks, written in today's Kyr, testable standalone as a campaign.
- The companion's authored history, long conversation and stances, written as Topics and rules over a draft shared vocabulary. Lines that need item 4 can be written now and become correct when it lands.
- The shared vocabulary file (five to ten relations), owned by the curator.
- Editorial reading of generated country (§7).

---

## 3. Explicit non-goals for M16

- a world compositor or plan beyond placements;
- city sockets and lots;
- a strategic simulation;
- Remarks and tags;
- more than one service;
- transport economics;
- a procedural city;
- more generated content types;
- placing The House That Grows (unless its author writes a variant);
- per-member knowledge, unless decision 4 chooses it;
- save migration;
- performance work not triggered by a gate in §8.

---

## 4. Dependency order

```
repairs 1–5,6,8 ─► journey tier ─► placement entry (K1) + Thrume variant ─► discovery via hooks ─► known destinations
                                                                                             └─► assisted travel  ─► M16A acceptance
M16A ─► authored ward start ─► service from the ward ─► companion (needs item 4; item 14 decided) ─► M16B acceptance
(parallel throughout: ward writing, Thrume variant, companion writing, vocabulary file, editorial reading)
```

---

## 5. The five decisions to make before substantial M16 work

### 1. Anthology or open world

- **Options:** (a) curated placements around one city; (b) a system for uncoordinated authors.
- **Recommendation:** (a).
- **Evidence:** every shipped adventure needed authorial adaptation; the probes placed adventures with existing mechanisms; no uncoordinated author exists yet.
- **Expensive if postponed:** builders will start general machinery (the Phase II manifest) "to be safe".
- **Can an experiment replace it?** No. This is a scope decision.

### 2. Compatibility policy

- **Options:** (a) refuse incompatible adventures and offer them as separate games; (b) require authored placed variants; (c) place and warn.
- **Recommendation:** (a), with (b) by author choice.
- **Evidence:** The House That Grows (year 3640, a named protagonist) is refused at `admit`; Thrume needed an import overlay; the Long Man's storm assumes a season.
- **Expensive if postponed:** adventures written without a declared premise must be audited one by one later.
- **Can an experiment replace it?** Partly. M16A's Thrume variant measures the adaptation cost.

### 3. What is shared, and who curates it

- **The decision:** kinds of item shared or local by default, and one curator for the shared vocabulary.
- **Options:** global kinds (today); namespaced by default; shared catalog plus namespaced locals.
- **Recommendation:** shared catalog plus namespaced locals, and one curator.
- **Evidence:** collisions are runtime refusals today (`probes/composition.out`); cross-module items need one kind; the two Phase III probes interacted only through shared terms.
- **Expensive if postponed:** every kind and shared relation authored before the choice is a migration.
- **Can an experiment replace it?** No for kinds. The vocabulary's size can be learned in M16B.

### 4. Knowledge granularity

- **Options:** company-level (today); per member, with the company as the union.
- **Recommendation:** decide after running the M16B companion's key scene both ways.
- **Evidence:**
  - company-level was enough for the Phase III reaction;
  - per member is needed for "she noticed";
  - the investigator showed recruits' knowledge is stranded.
- **Expensive if postponed:** companion and investigation content binds to the conditions it is written against.
- **Can an experiment replace it?** Yes, and it should. It is cheap, and it decides the most authoring-sensitive interface.

### 5. Placement stability

- **Options:** path-dependent drawing (today); planned placements of authored adventures at Begin.
- **Recommendation:** planned placements for authored adventures only. Generated interiors stay drawn on demand.
- **Evidence:** `frontier.ts:77-78` keys regions on what is installed; true rumours need fixed placements.
- **Expensive if postponed:** saves and transcripts made under path-dependent placement cannot be compared or migrated.
- **Can an experiment replace it?** Yes. If M16A testers never notice, keep path dependence.

---

## 6. The minimum city, tested critically

**Three wards are not necessary for the architecture.** The integration requirements are:
- a contribution building onto an exported place;
- a building added within another author's ward;
- an overlay using existing landmarks;
- one service departing.

All of these are satisfiable with **one substantial ward plus a few district-scale places**. The Phase III probe met
the first requirement with two rooms.

**[Rec] For M16B:**
- one fully authored ward, at room scale where things happen;
- two or three **district-scale places**: one place each, with a landmark, a mundane function, a few named people and a description. They are reached by transit passages with times;
- one service departing from the ward.

A large city told through district-scale places is likely *more* convincing than a small one told room by room. It
mirrors how a city is known: by quarters and landmarks, not corridors. And it avoids the "procedural clicking" the
player reviews disliked. **This is a literary hypothesis.** The M16B reading tests it.

**What keeps a city from feeling like a quest menu** (literary worldbuilding, not architecture):
- people at work whose work is not about the player, and who recur by name;
- commerce the player needs (food, light, passage), not only quest goods;
- public time: market hours, bells, closing, night;
- news that is not a hook;
- institutions that refuse things;
- small troubles that resolve without the player;
- traffic seen passing (`region-traffic.ts` exists);
- one place to belong to (the origin's home or lodging).

**What architecture must provide for it:**
- schedules (rules over the clock);
- recurring named people (the community model exists);
- a way for non-hook news to be carried (channels exist);
- **nothing new beyond item 4.**

---

## 7. Generated content: what to measure and read

**Evidence for the risk:**
- **The player reviews:**
  - "Reused greetings, journey sentences, plants, and work poses become visible as slots".
  - "Much procedural clicking … between the interesting beats".
  - "Artifact inspections remain thin" (`mission-14/independent-review-follow-up-2026-10-24/report.md:93,149,51`).
- **The repetition probe** (`synthesis/prose-repetition.out`):
  - In each world, 140–179 distinct sentences recur, up to 46 times each. Most are weather lines, conditional per place, so a player sees fewer.
  - 40–57% of distinct generated sentences appear verbatim in another seed's world.
- **Caveat:** this measures what *exists*, not what a player *sees*.

**[Rec] A small editorial evaluation** (a few days of reading, no new system):
1. **Corpus.** From the M16A journey harness: three seeds, one two-hour ordinary journey each, from the origin to the second adventure's entry. Use the transcripts of what was shown to the player.
2. **Measures from the corpus** (counts, not scores):
   - **Seen repetition:** a non-weather sentence shown twice within an hour.
   - **Travel pacing:** choices per hour of fictional travel; the share of choices that are pure movement.
   - **Continuity:** named people met twice, and whether their second appearance reflects the first.
   - **Geography:** at five sampled points, can a reader say where the company is relative to the last settlement?
3. **Editorial reading.** Two readers, one the author of an adventure, read each transcript and answer in prose:
   - Where was this specific to this place?
   - Where was it a slot?
   - Did the encounters cohere?
   - Was detail proportionate?
   - How did the generated stretch read beside the authored adventure on either side of it?
4. **Output:** a list of templates to cut, rewrite or vary, and a recommended **amount** of generated country between authored destinations. For example, one region at most, with routes given authored waypoints.

**Not:** a prose-quality score, or a new generation system.

---

## 8. The decisive ordinary-player journey

**The journey.** From the public page, a new player chooses Begin, creates a character, and starts in the ward (M16B; in
M16A, the origin's generated settlement). They must:
1. **Orient.** Say where they are, and name two places in the city.
2. **Discover.** Hear of an adventure through a person or an institution.
3. **Know the way.** See it as a known destination with a route and a means.
4. **Travel.** Get there with assisted travel or the service, recognising and recovering from one interruption.
5. **Enter.** Enter the adventure and play its opening hour: its own mechanics (Thrume's hush, attention and clocks) and its own prose.
6. **Persist.** Close the browser mid-adventure and resume.
7. **Return.** Come back to the city and see a consequence: a person who speaks of it, an institution changed, or a companion's response to what they witnessed.
8. **Find the next one.** Be able to discover the second adventure.

| layer | established by | pass |
|---|---|---|
| **executable correctness** | the journey harness on 10 seeds, by offered choices only; save and resume at random steps; `bin/kyrie replay` in a fresh process; the literary diff (authored text identical to standalone play, except Arrival effects); the reachability audit | all equal hashes; reaches both entries in at least 8 of 10 seeds; failures classified |
| **player comprehension** | two unfamiliar players, observed with think-aloud, no hints | each completes steps 1–4 and 7–8, and explains afterwards how they knew where to go and why an unknown place was not marked |
| **literary credibility** | the adventure's author reads the joined-world transcript of their adventure; an editor reads the whole journey | the author says it is still theirs; the editor finds the city and companion moments specific, and the generated stretches not the weakest part by a wide margin |

**Failure even when all automated tests pass:**
- a player needs a hint to find either adventure;
- a player cannot say how they knew a route;
- the author does not recognise their adventure;
- the return shows no consequence a player noticed;
- the companion's response is judged generic or out of character;
- the editor's reading names the generated country as the reason they would stop.

---

## 9. Correctness and performance gates

**Correctness:**
- items 1–5 repaired, each with its probe made a spec;
- equal hashes for save, resume and replay across the joined world;
- no checkpoint during a command;
- the march-stone and frontier agree on 20 seeds;
- the journey tier green, with no teleports.

**Performance** (measured base: wren engine p50 28 ms and p99 260 ms; adventure installation 0.33–0.60 s; a joined world of 37.8k facts took 88 ms a wait):
- engine p50 ≤ 60 ms and p99 ≤ 400 ms in the joined world;
- a crossing into an authored country ≤ 2.5 s, with progress shown;
- an assisted two-day leg ≤ 5 s;
- screen p99 ≤ 150 ms. This is already exceeded at wren's worst (226 ms): watch it in the ward;
- checkpoint ≤ 10 MB after 500 commands.

---

## 10. Evidence that would justify a further mission

- **M16A passes** with both executable and comprehension layers green. That justifies M16B.
- **M16B passes all three layers.** That justifies more placed adventures, more city, and a second companion, but not more machinery.
- **A general compositor** is justified only by authors who cannot coordinate through a curator: a third-party author whose content cannot be placed by a placement entry.
- **A strategic layer** is justified only by three or more authored institutions whose interactions cannot be written without per-pair rules.
- **Per-member knowledge,** if not chosen in M16B, is justified by an editor's judgement that the companion "knows what she could not know".

---

## Recommendations to the project owner, ranked

1. **Split Mission 16, and make M16A prove integration first.** Repair the crossing crash and the checkpoint race, then make two existing adventures discoverable and reachable from an ordinary start, with save and replay. Make no city or companion until that passes.
2. **Decide scope and sharing before content is written against them.** Choose the curated anthology over an open-authoring system; refuse incompatible adventures by default; appoint one curator for a shared catalog and vocabulary.
3. **Use what exists rather than build what was proposed.** Placement entries over a manifest; imports over sockets; authored institutional rules over a strategic layer; Topics over shared relations over Remarks. Add only the rendering of bound variables and information discipline.
4. **Make people the acceptance test.** Unfamiliar players and a real independent writer, observed. The adventure's author reads the joined-world version. The journey must fail if they fail, however green the suite.
5. **Fund editorial work on the generated country alongside the engine work.** Read what a player actually sees between adventures, and reduce or rewrite it. It may decide whether "one world" feels like a world.

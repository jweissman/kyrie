# D. Architectural decision memorandum

**For:** the project owner.
**From:** Phase II of the independent review, snapshot `483e3af`.
**Supporting studies:** [A](A-shared-world.md) (shared world), [B](B-metropolis-and-travel.md) (metropolis and travel), [C](C-characters-institutions-history.md) (characters, institutions, history).
**Phase I findings:** [../report.md](../report.md).

---

## 1. The situation in one paragraph

- Kyrie already contains most of the pieces of a shared-world compositor, written as three separate dialects:
  - the **scenario library**: placement plus hooks carried by rumour channels;
  - **kits**: slots as Kyr predicates, an append-only ledger, exclusive claims, Deem proposals, and a trace of every decision;
  - **authored countries**: a placed variant with an imported company.
- Beneath them are sound mechanics:
  - module namespacing and shadowing, and typed role imports;
  - installation inside a command, undone whole;
  - `ClockShift`, which starts an adventure's clocks when it is reached.
- A probe installed Thrume and Let One Remember, unchanged except for their company declarations, into a live generated world, and the company walked into Thrume's opening by offered choices (document A §1).
- **What is missing is not mechanism but contract:** what an adventure contributes, needs, owns, exports, preserves, and lets the world change, and a world plan that holds the answers.

---

## 2. What must be designed now, to avoid lock-in

These are decisions that become expensive once more content is written against the current shape.

1. **The contribution manifest and the world plan** (A §3.3, §5).
   - Every new adventure, ward and kit written in the old dialects is migration work later.
   - Decide the one manifest form now; implement a reader that lowers the three existing dialects to it.
2. **Reference by role, not by id** (B §2.1, C §2.2).
   - Imports today name `owner.export` paths.
   - Contributions written against ids cannot be re-hosted (another city, another world) or bound by stratagems.
3. **Module scope for actions, and namespaced kinds** (Phase I C2, C1).
   - Every module written assuming world-wide actions, or global kind ids, is a future collision.
4. **Knowledge and claims per holder, with sources** (C §4; Phase I D1).
   - Every companion, testimony and history written against company-wide `knows` will need rewriting.
5. **Save and plan identity** (Phase I G1, A §6).
   - Saves and transcripts carry the registry and content hash, before the world plan exists, so that the plan can be versioned from its first day.

Each is a contract decision with a small first implementation. None is a rewrite.

---

## 3. What can be added incrementally

These are additive over the decisions above:
- Assisted travel over known routes: a macro of offered `go`s (B §3.3).
- Transport services: a vehicle actor and boarding (B §3.3).
- Institutional rumour channels (B §2.6).
- Lazy installation of placed contributions at the horizon: the frontier generalised (A §3.3).
- Arrivals, compat and needs (A §2, §6).
- Remarks for companions (C §3.3).
- History lowered to facts, with reading levels (C §5).
- Horizon scheduling of ambitions, with the watch-by-watch run as oracle (C §2; `time.md`).

---

## 4. What should remain purely authored

- **Named companions' lines and interpretations:** generation never writes them.
- **The default metropolis's skeleton:** the world's anchor deserves an author.
- **Each adventure's interior:** places, rules and prose, protected by `preserve`.
- **Dramatic structure:** acts, climaxes, endings. The world may change *how* an adventure is met, never *whether* it can be (C §2.3).
- **Cosmology:** no shared grand explanation. An adventure's `elsewhere` regions (dreams, the Margin, the Between) are its own (A §6).

---

## 5. Defer until there is a compelling playable example

- Strategic actors binding across contributions (C §2.2). Wait until two authored institutions exist that an author *wants* to interact.
- Claim degradation along channels (C §2.4).
- Generated filler inside wards (B §2.7).
- Population aggregation; economies; diplomacy.
- A compositor for city layout. Hand-author the first skeleton.
- Placing The House That Grows in the shared world. Its era (3640), its sky-city and its named protagonist are a different world until its author writes a placed variant (A §2).

---

## 6. Vertical slices that test the architecture

### Slice 1: "Hear of it, go there, play it"

**Scope:**
- The contribution manifest for Thrume and The Long Man, lowered from today's forms.
- A world plan placing both in a generated world from the `wanderer` origin.
- Hooks on the road and tavern channels.
- One truth for what lies beyond each border.
- Lazy installation at the horizon.
- Assisted travel over known ways.

**Acceptance:**
- From Begin, by offered choices only, for 10 seeds, the company:
  1. hears of each adventure;
  2. sees it as a known destination;
  3. travels there assisted;
  4. enters;
  5. plays a scripted opening.
- A replay in a fresh process gives equal hashes.
- Removing Thrume from the registry changes only new games; an old save is refused with a clear message.

**Tests:**
- the registry, plan, hooks and instantiator;
- the A1 class of bugs (mid-play validation);
- determinism of installation order.

### Slice 2: "Two wards and a secret"

**Scope:**
- A hand-authored city skeleton with two sockets and singular roles.
- Three tiny contributions: an academy ward, a quay ward with a river service, and an overlay society binding a back room and a patron through exported surfaces.

**Acceptance:**
- Each contribution lints and plays alone against a stub skeleton.
- Together, the plan binds all three in two orders with the same result.
- A second `fills: university` is refused with a trace.
- Removing the academy's `admits: overlay` makes the society bind elsewhere, or be refused, with a trace.
- The river service carries the company to a landing on a schedule.

**Tests:**
- role references, sockets and lots, `preserve` and `worldMay`;
- conflict diagnostics;
- services.

### Slice 3: "She noticed"

**Scope:**
- One named companion with knowledge per member and three Remarks over the `occult` tag.
- Two independent tiny adventures, each tagging one fact.

**Acceptance:**
- The companion volunteers a connection only after witnessing both facts (not when the player alone read one).
- She disagrees, as a claim, when the player's evidence refutes her.
- Her lines are told from line ids. Editing a voice table changes no canonical hash.

**Tests:**
- the knowledge and claims substrate;
- tags;
- the Remark abstraction;
- separating telling from the game record.

**Order:** slice 1 first; it also discharges Phase I's A1, E1 and E2. Slice 2 then needs C1 and C2. Slice 3 is
independent of slice 2.

---

## 7. Major open decisions for the project owner

1. **Is the shared world one world or several?**
   - Some adventures (HTG) belong to another era and cosmology.
   - Options:
     - **(a)** one world, with incompatible adventures offered as separate games;
     - **(b)** one world with eras, so a later playthrough can be set in 3640;
     - **(c)** require placed variants for inclusion.
   - **Recommendation:** (a) now, (c) by author choice.
2. **A world-level policy on emergent change** (C §2.3).
   - The recommendation: external change only before an adventure begins or after it resolves, and never making one unreachable.
   - This is a creative stance as much as a technical one.
3. **Who authors the metropolis skeleton,** and is it one city or the first of several?
4. **How strict is compatibility?** Refuse-by-default (safe, fewer adventures placed) or place-and-warn (more content, more contradictions)?
5. **What happens to saves when the registry grows?**
   - Options: new content for new games only, or replay of old transcripts onto the new plan.
   - The second is now possible, because the transcript is the causal record (Phase I), but it may change old games' worlds.
6. **Tag vocabulary governance** (C §3.3). Is there a curated shared list, or do authors coin tags freely and the registry reconciles them?

---

## 8. Capability ledger

For each capability: **R**equirement, **O**ptions, **Rec**ommendation, **S**peculative ideas.

| capability | R | O | Rec | S |
|---|---|---|---|---|
| all adventures in one game | every placed contribution reachable by ordinary play; compat respected | eager install; registry with lazy install; hybrid | hybrid: plan eagerly, install lazily, project public faces | a world that adds adventures as the player grows |
| entry points | one truth per border; hooks reachable from Begin | countries list; kit slots; manifest `attach` | manifest `attach` lowered to kit slots | entries that move with events |
| metropolis | bounded wards; authored skeleton; role references | lot model; ward model; overlay | ward model plus lots plus overlays through exported surfaces | generated filler near the company |
| travel | known versus unknown never leaks; assisted travel over known ways | macro of `go`s; new movement primitive | macro, recorded as its expansion; services as vehicle actors | horizon-advanced long journeys |
| strategic actors | role binding; `worldMay`; scheduled stages; deterministic | none; scripted cross-references; public faces plus stratagems | public faces plus stratagems over `ambitions.kyr`, after slices 1–3 | claims degrading in transit |
| companions | knowledge per member; claims; tags; telling from ids | personality stats; generated dialogue; Remarks | Remarks, authored, over tags and claims | companions across playthroughs |
| history and languages | history as facts; roles for eras and tongues | procedural linguistics; lowered history plus reading levels | lowered history plus reading levels | a language reconstructed over a whole game |

---

## 9. Final question

**If Kyrie made one architectural investment after its current correctness, performance and player-experience work, which would most effectively let independently authored adventures become parts of one coherent, living world?**

**Answer: the world contribution contract and the world plan.**

This means:
- one small manifest by which an adventure, ward or kit declares what it contributes, where it attaches, how it is heard of, what it owns, exports, preserves and lets the world change;
- an append-only, traced, content-hashed world plan that places every compatible contribution at world creation;
- installation of contributions inside the commands that bring the company to them.

**The evidence that this is the right investment:**
1. **The mechanism already works; the contract does not exist.**
   - Thrume and Let One Remember installed into a live generated world in 0.3–0.6 s each, and were playable by offered choices (document A §1). That needed only a company-import overlay of the kind `the-long-man/placed.kyr` already uses.
   - What failed was contract-shaped:
     - HTG's premise could not be granted (`stareTrained(party)` refused by `admit`);
     - no hook told anyone about Thrume;
     - the border stone's text and the frontier disagree on what lies beyond (Phase I E2).
2. **The compositor is already half-built, in three places.**
   - The kit ledger refuses contradictions, records why, binds slots by Kyr predicates, and makes claims exclusive.
   - The scenario library carries hooks by channels.
   - The frontier installs at a horizon inside a command.
   - Unifying them is the shortest path from the code that exists to the world the brief describes.
3. **Every other ambition depends on it:**
   - the metropolis is placement into sockets;
   - travel networks are routes in the plan;
   - strategic actors bind by public faces the plan holds;
   - history is a plan module;
   - discoverability is hooks the plan guarantees.
4. **It is where the critical defects live.** Phase I's A1 (installation validating the whole world) and E2 (two truths about borders) are both failures of composition with no contract. Fixing them inside a contract fixes their class.
5. **It protects authors.** `preserve`, `worldMay` and role references are what let an author connect an adventure to the world without exposing its internals, and without the world overwriting it. Without them, the world gets more interconnected at the authors' expense.

**What would be lost by choosing a different priority:**
- **Knowledge per holder first** (the strongest alternative).
  - Companions and investigation would deepen *within* adventures.
  - But the adventures would stay islands, chosen from a menu, and the cross-adventure insight that makes a Kim-like companion remarkable would have nothing to cross into.
  - It is my second investment, and slice 3 can run alongside slice 1.
- **Strategic actors first.** Without public faces, role binding and `worldMay`, emergent behaviour must either be scripted against ids (which cross-authors cannot do) or allowed to write anything (which breaks authored drama). It would be built on sand.
- **The metropolis first.** A city built before the contract hard-codes its wards' ids and becomes the thing every later contribution must special-case. The city is the *best first customer* of the contract, not a substitute for it.
- **Travel first.** Assisted travel and services are valuable and additive, but they make an empty world quicker to cross. Without placed contributions and hooks, there is nowhere new to go.

**Risk of this recommendation:** a manifest designed in the abstract becomes a universal schema. Mitigate by building it
from slice 1 alone, the four shipped adventures and the three existing dialects, and adding fields only when a
playable contribution needs them.

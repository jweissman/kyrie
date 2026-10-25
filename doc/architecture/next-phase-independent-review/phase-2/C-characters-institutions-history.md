# C. Characters, institutions and history study

Phase II, snapshot `483e3af`. Tags as in document A:
- **[R]** a requirement;
- **[O]** an option;
- **[Rec]** a recommendation;
- **[S]** speculative.

The three subjects here (strategic actors, deep companions, historical layers) share requirements, collected in §6.
They do not need to be built together.

---

## 1. What exists

**Actors and agency:**
- `CampaignActor` has members, goals (`when`, `target`, `priority`, `urgent`), allowed actions and a planning horizon (`definition.ts`).
- `Agency.choose` and `Planner` plan over the same action schemas the player uses. NPC undertakings longer than a watch are held as `pending` with an `until` (`campaign-tick.ts` `npcs`).

**Cross-installation goals:** `ModuleInstallations.extended` lets one installation give an actor that another installation declared new goals and actions.
- This is the only existing cross-module relationship mechanism, and it is a good one.
- It requires the target actor's id, though.

**Long timescales:** `data/rules/ambitions.kyr`. A power `pursues` an ambition in **stages**, the next due `pace` watches after the last. What each stage does is the author's (rules on `stage(a)`, `won`, `foiled`).
- This is exactly the right primitive for strategic actors.
- It is evaluated by the per-watch rule loop.

**Institutions and stance** (`data/rules/dominion.kyr`):
- `holds(group, place)`, `keeps` and `covets`, `serves(member, power)`;
- `alarmed`, `admits`, `hostile`, `takesPrisoners` and `captured`;
- byways with `knowsWay`.

**Belief** (`data/rules/belief.kyr`):
- `believes(group, claim)` with `conviction`;
- `refutes(fact, claim)`;
- `doubts`, `swayedBy` and `scorns`, and rules for letting a claim go and for persuasion wearing off.
- Used by one going-on (the disputation).

**Company knowledge:**
- `knows(company, fact)` of `established` facts only (`discovery.ts`).
- Provenance relations: `witnessed`, `readIn`, `learnedFrom` and `toldBy`.
- Rules may not write `knows` (`module-compiler.ts:80`).
- **One bit per company** (Phase I D1).

**Companions:**
- Recruitment (`Membership.enlist`) empties the recruit's group into the company.
- Topics with a companion are available while `travelsWith` holds (`module-parser.ts:288`).
- Generated fellows have kin and topics (`src/world/region-fellows.ts`).

**History and names:**
- `Histories` draws a world-level past shared by every region: makers, their art and end, the kingdom after them and its fall (`src/world/history/histories.ts:58-60`).
- Works are named in the old tongue and "worn down" by the folk (`:118-135`).
- `PlaceNames` names places in the folk's tongue, and keeps each name's **meaning**, its gloss (`src/world/place-names.ts`): westron, quenya and khuzdul from the `languages` package, with Aenean for what was built before the folk.
- The `languages` package (`Conceptory`, `translate`, `missingConcepts`, 500 lines) translates concept sequences.

---

## 2. Cross-campaign actors and institutional life

### 2.1 Requirements

| requirement | today | gap |
|---|---|---|
| enduring people and institutions beyond a quest | actors persist in the campaign; institutions are groups with dominion relations | **[R]** an exported *public identity* (role, stance, capacities) that unrelated modules can refer to by role, not id (`ModuleBundle.imports` needs `owner.export` paths) |
| capacities, commitments, resources, relationships | measures and relations on groups; ambitions with stages | **[R]** a small shared **institutional vocabulary**: `capacity(actor, kind)`, `resource(actor, good)` (quantity exists), `relation(actor, actor, kind)` with `allied`, `rival`, `owes` and `corresponds` |
| limited knowledge, mistaken belief, propagation | belief for groups; company-only `knows` | **[R]** actors' knowledge as **claims with sources** (`heard(actor, claim, from)`), propagated by exported channels (§2.4) |
| longer timescales | `ambitions.kyr` stages, evaluated every watch | **[R]** horizon scheduling (`time.md`'s proposal): an ambition's next stage is a scheduled event, not a per-watch test |
| visible consequences elsewhere | rules in one module can read exported facts of another | **[R]** consequences are written only to **exported surfaces** (`worldMay`), and told through hooks and channels |
| no continuous simulation of the distant | everything installed runs every watch | **[R]** an uninstalled contribution's actors are **summaries** in the world plan (document A §3.3), advanced only at their scheduled stages |
| persistent history and replay | everything in the transcript replays | **[R]** stages are scheduled by the plan and the clock, deterministic (`RandomStreams.key` by actor and stage) |
| authors constrain evolution | nothing beyond "don't export it" | **[R]** `worldMay` per actor, and **dramatic locks** (§2.3) |

### 2.2 The minimal initial model **[Rec]**

A **strategic actor** is an exported actor (or institution) with three things, all expressible in Kyr:
1. a **public face**: role, stance and capacities, declared in its contribution's manifest;
2. one or more **ambitions** (`ambitions.kyr`, unchanged) whose stages are scheduled by horizon rather than tested each watch;
3. a set of **stratagems**: author-written actions over *roles*, not ids:
   - "seek an artifact covered by a `covets` claim";
   - "send an agent to a place held by a rival";
   - "write to a corresponding institution".

**Interaction without cross-scripting:**
- A stratagem's parameters range over **any actor whose public face matches** (`rival(?a)`, `scholarly(?i)`).
- The world plan binds them when both are placed: a kit slot again.
- The court wizard's "seek the Ash Crown" binds the necromancer's tower if the tower's manifest declares `covets(tower, ash_crown)` publicly, and the academy if it declares `keeps(academy, ash_crown_fragment)`.
- Neither author knew of the other. Each declared what they want and what they hold.

**What it is not:** no economy, no diplomacy model, no simulation of individuals off-stage.
- A distant actor is three numbers (stage, stageDue, pace) and a few exported relations, until the company is near enough for its module to be installed.

### 2.3 Emergence against authored drama

**Can a distant conflict prevent an adventure from being met as its author intended?** Yes, if any actor may write any fact. This is the central risk.

- **[R]** An author declares, per contribution:
  - `preserve`: places and structures no one else may change;
  - `worldMay`: which exported relations others may change (`margravine.relations`, `tower.holds`);
  - **dramatic locks**: conditions under which nothing external may touch the adventure at all, for example "while `not begun(thrume)`", or "while `at(party, fells)`".
- **[Rec]** A world-level policy:
  - external stratagems may change an adventure **only before it is begun**, or **after it is resolved**, unless its author opts in;
  - nothing external may make an adventure **unreachable**. If a strategic event would close its only entry, the plan must offer another entry (the manifest lists more than one), or the event is refused.
- Under this policy an emergent history can change *how* the company meets an adventure ("the tower has the crown now; the academy wants it back"). It does not change *whether* it can.
- **[S]** An author could export "variant openings" keyed by world facts ("if the academy holds the crown, the professor greets you differently"). That is ordinary Kyr, conditioned on imported facts, and needs no engine change.

### 2.4 Information propagation

- **[Rec]** A claim travels along **channels**: the rumour channels already exist (`tavern`, `road`, `temple`, `market`), extended to institutions' `corresponds` relations.
- Each hop is a scheduled event with a delay, and may **degrade** it [S]: a hop asserts a claim, not the established fact.
- The company hears claims from carriers. It learns *facts* only from sources that establish them. This is the separation Phase I D1 asked for.

### 2.5 Feasibility

| | |
|---|---|
| central invariants changed | none, if stages stay ordinary rules. Horizon scheduling changes *when* rules are asked, with the watch-by-watch run as oracle (`time.md`) |
| smallest proof | three tiny contributions (wizard, tower, academy) declaring public faces and one stratagem each. The plan binds them across modules, and one stage fires. Replay in a fresh process; hashes equal. Then remove the academy from the registry: the stratagem binds nothing, the trace says why, and nothing breaks |
| determinism | stages keyed by actor id and stage number; plan binding traced |
| impact on writers | they declare a face and choose `worldMay`. Writers who export nothing are untouched |
| failure modes | an actor stage writing a non-exported relation (must be a compile error); feedback loops between actors (bounded by stage pace); one actor's ambition starving all others' of a singular artifact (fine: it is drama) |

---

## 3. Deep companions and consequential dialogue

### 3.1 Three layers

1. **Authored.** Who they are:
   - temperament;
   - competence (skills and background exist: `PartyCapabilities`);
   - commitments and loyalties;
   - their voice;
   - and, crucially, their **interpretations**: what this person makes of a kind of evidence, and how they disagree.
2. **Simulated.** What happened to them:
   - what they witnessed and learned;
   - who they met;
   - debts and promises;
   - which topics they have discussed.
3. **Disclosed.** What the narrative chooses to say now:
   - a line, or a remark, or silence;
   - selected from (1) and (2) by relevance and by what has already been said.

Today, (1) is Topics, Person declarations and voice tables. (2) is almost absent per companion. (3) is `Telling` and `Narrator`, and they read rendered prose back from the log (Phase I B1).

### 3.2 What each requirement needs

| requirement | existing Kyr | extension | distinct abstraction? |
|---|---|---|---|
| long-form conversation | Topics with `once`, conditions, `Says`, effects; companion topics while travelling | topic **threads**: a topic that opens follow-ups (state on the companion) | no |
| notice and interpret evidence | observations with `requires capable(party, insight)` (the disputation's `flow_looks`) | **per-member perception and knowledge** (Phase I D1): `knows(member, fact)` and `witnessed(member, fact)`; the companion's capability decides whether *they* noticed | no; a vocabulary change |
| disagree with the player | belief.kyr on NPCs | the companion **believes** claims and can hold a claim the player's evidence refutes, with conviction | no; reuse belief |
| recognise connections across adventures | none | **[R]** *interpretation rules* keyed on fact **classes**, not ids: "when a member knows a fact of kind `occult_sign` and another of kind `occult_sign` from a different contribution, they remark on it". This needs facts to carry exported **kinds** or **tags** (`tag(fact, occult)`) | **yes**: a small *remark* abstraction (§3.3) |
| personal and institutional obligations | `serves`, `owes` (proposed), ambitions | companions as actors with goals while in the company (today their group is emptied: `membership.ts:38`) | no; Membership changes |
| knowledge through experience | `knows` per company | per member, with provenance per source | no |
| respond to unanticipated events | none | remarks keyed on **public event kinds** (`happening` kinds exist: `src/narrative/happening.ts` has join and part) | the same remark abstraction |
| preserve authored personality | voice tables, Topics | remarks are **authored per companion**, in Kyr, over tags; generation never writes a named companion's lines | the author owns it |

### 3.3 The one new authoring abstraction: Remark

- **[Rec]** A **Remark** is authored for a specific companion (or a kind of companion). It has:
  - a trigger over **tags** and **public happenings**: `when knows(?me, ?f) and tag(?f, occult) and from(?f, ?other) and not same(?other, thrume)`;
  - an **interpretation**: their claim (`believes(?me, cult_returning)`, conviction 1);
  - **lines**, with a once or cooldown, and **disclosure rules**: said when asked about it, or volunteered if conviction rises, or held back if loyalty is low.
- It is a Topic and a Rule joined. Its novelty is only that it is triggered by tags from *other authors'* exported facts.
- **[R]** Tags are an exported vocabulary per contribution (`exports.tags`), from a small shared list (`occult`, `political`, `ancient`, `crime`, `trade`) plus contribution-local ones.
- **This is how Kim-like cross-case insight is possible without the companion's author knowing the other cases.** The companion's author writes how *this person* reads occult signs. Other authors tag their signs.

**What not to do:**
- Personality statistics deciding lines.
- Generated dialogue for named companions.
- A dialogue-tree editor separate from Kyr.

Characterisation lives in **what they notice, what they conclude, and when they say it**. That is three Kyr concepts (knowledge, belief, remark), not a large number of lines.

### 3.4 Smallest proof

- One companion with three Remarks over the `occult` tag.
- Two independent tiny adventures, each tagging one fact `occult`.
- The companion, having witnessed both, volunteers a connection. Without one of the adventures installed, the companion stays silent.
- Requires: per-member knowledge, fact tags, Remark (as a lowered Topic plus Rule), and the telling reading line ids, not prose (Phase I B1).

---

## 4. Knowledge and belief: the common substrate

The three subjects all need the same four things:
1. **Knowledge per holder**: member, actor or company, of established facts.
2. **Claims with sources**: `heard(holder, claim, source, when)`, distinct from facts, linked by `refutes` and `confirms`.
3. **Exported tags and kinds** on facts and claims, so other authors' content can be recognised without knowing its ids.
4. **Disclosure keyed by ids and bindings, not prose.** The narrative decides what to say, from records of what was perceived, not from previously rendered text (Phase I B1).

**[Rec]** Build these as **vocabulary in `data/rules/`** (Kyr) plus three engine changes:
- `Perceptions` writes per member;
- `Membership` keeps the recruit as a member-actor;
- the log stores line ids.

**[R]** Keep the existing invariants:
- Rules may not write `knows` or `established`.
- `knows` is a subset of the established facts.
- Falsehood lives in claims.

---

## 5. Deep history, languages and archaeology

### 5.1 What the abstractions already allow

| want | supported? |
|---|---|
| persistent naming by people and tongue | **yes**: `PlaceNames` per folk, Aenean for older works, with meaning kept (`gloss`) and "worn down" folk forms |
| consistent etymologies | **partly**: a name keeps its concept parts and its English sense. A *chain* (Aenean form → kingdom form → folk form) exists for works (`Histories`: the name cut over it, and the name worn down) but is not recorded as data a player can learn |
| provenance of sites, artifacts, documents | **partly**: sites have makers and eras in generation; documents teach facts. Provenance is not a queryable fact (`made_by(work, people)`, `era(work, age)`) after generation |
| multiple interpretations | **yes, in principle**: belief.kyr claims plus `refutes`. Unused for history |
| partial decipherment | **no**, but expressible: a measure `understood(company, tongue)` and observations whose text varies by it |
| authors add evidence without rewriting canon | **partly**: an author can add documents teaching their own facts. Shared canon (the world history from `Histories`) is generated per world, not a shared authored canon. An author cannot say "this is a fragment of the Aenean founding" without knowing the generated names |
| mysteries left unresolved | **yes**: a claim no fact refutes or confirms |

### 5.2 Requirements and recommendations

- **[R]** Generated history must be **facts**, not only prose, after generation:
  - `people(p)`, `era(e)`, `made(p, work)`, `fell(kingdom, era)`, `tongue(people, t)`, `named(place, tongue, form, gloss)`.
  - Today history is mostly rendered into Discovery text (Phase I: `history_successors` is one fact with a summary).
  - **[Rec]** Lower `Histories`' output into an exported `history` module of the world plan.
- **[R]** Authored historical evidence references **eras and peoples by role**: "the old tongue", "the first makers", "the kingdom that fell". The plan binds them to the world's drawn ones, as kit slots bind places.
  - An author's inscription then says `{oldtongue}` and gets the right name in every world.
- **[Rec]** **Progressive decipherment** as ordinary Kyr:
  - a measure `reading(company, aenean)`, raised by study topics, scholars and found glossaries;
  - an inscription with three observation texts by reading level: shapes; some words (using `gloss` from `PlaceNames`); a full reading.
  - **No linguistics engine.** The `languages` package's `translate` already renders concepts; partial understanding is choosing which concepts are shown.
- **[Rec]** **Interpretations** as claims:
  - a scholar `believes(ferrand, aenean_sought_mathematical_age)`;
  - another believes the contrary;
  - evidence `refutes` or `confirms` one. A deep mystery is a pair of claims with no deciding fact.
- **[S]** A Mathematical Age beneath Aenean is one more era in the history module; functioning installations are sites whose makers are that era. That is content, not architecture.

### 5.3 Is there room?

- **Yes.** Naming, eras and belief exist. The changes are:
  - history as facts;
  - roles for eras, peoples and tongues;
  - reading levels as measures.
- **Secondary priority,** as the brief says. Most of it can be done by authors once history is facts.

---

## 6. Common architectural requirements

| requirement | strategic actors | companions | history |
|---|---|---|---|
| knowledge and claims per holder, with sources | needed | needed | needed |
| exported public faces and tags, referenced by role | needed | needed (tags) | needed (eras, tongues) |
| `worldMay`, `preserve` and dramatic locks | needed | — | — |
| horizon scheduling | needed | — | — |
| telling from ids, not prose | — | needed | helpful |
| world plan as ledger | needed | — | needed (history module) |

**[Rec] Build order:**
1. knowledge and claims per holder;
2. public faces and tags;
3. the rest, each when its first playable example exists.

Strategic actors are the last of the three, because they depend on all the rest.

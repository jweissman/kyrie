# A. Final architecture synthesis

This reconciles Phases I–III of the independent review of Kyrie.

| | |
|---|---|
| snapshot | `483e3af58171e19418b292d013b388c30d93b14f` (2026-10-25), unchanged throughout |
| branch | `review/architecture-2026-10-25` |
| evidence | [Phase I report](../report.md) (§1–11), [Phase II](../phase-2/), [Phase III](../phase-3/) and the critique in [report §13](../report.md); probes and outputs under `probes/`, `phase-2/probes/`, `phase-3/probes/` and `synthesis/` |

**Where the phases disagree, this document supersedes them.** I have not checked the builder's current `main`. Some
items marked open below may already be repaired there.

---

## 1. The architecture worth preserving

These held up under three rounds of probing. They are the foundation, not candidates for replacement.

1. **Immutable copy-on-write `World`, one coordinator, whole-command checkpoint and undo.** That includes installations made during a command.
2. **Command-transcript replay with identity-keyed randomness.** The wren journey reproduced the builder's canonical, facts and told hashes exactly, on another machine and Bun version.
3. **Kyr as the authoring medium.**
   - Four large adventures ship with no adventure-specific TypeScript.
   - Module namespacing and `ModuleShadow` protect local names.
   - Typed imports with role conditions let one author build onto another's exported place without editing it. Phase III's probe: the tower's stair onto the academy.
4. **The shared rules as a cross-author vocabulary.** Relations in `data/rules/*.kyr` (and any shared rules file a module lists) keep their names across modules. **Phase III's central finding:** this already lets independently written institutions and companions respond to one another's content (`phase-3/probes/two-institutions.out`, `companion-reaction.out`).
5. **The discovery pipeline:**
   - hooks carried by rumour channels (innkeeper, traveller, priest, merchant);
   - `opens` revealing hidden ways;
   - `revealedBy` and `visibleTo`;
   - named and found places.

   It is tested (`test/way-in.test.ts`).
6. **Frontier installation at a horizon, inside a command, plus `ClockShift`.** This is lazy instantiation already working for regions and one authored country. Phase II's probe installed Thrume (0.33 s) and Let One Remember (0.60 s) into a live generated world, and walked the company into Thrume's opening by offered choices.
7. **The kit compositor:** slots as Kyr predicates, an append-only ledger, exclusive claims and a decision trace. It is not needed for Mission 16, but it is the right shape if a compositor is ever justified.

---

## 2. The recommendation ledger

Categories:
- **VB:** verified blocker.
- **RR:** retained recommendation.
- **SR:** simplified recommendation.
- **DC:** deferred capability.
- **RJ:** rejected recommendation.
- **OQ:** open question.

| # | item | category | evidence | supersedes |
|---|---|---|---|---|
| 1 | Mid-play installation validates the whole world's knowledge. Once one of 9–10 commonly taught facts is learned, every later march crossing fails ("Invalid initial knowledge"). | **VB** | reproduced through `perform`: `probes/crossing-knowledge.out`, `taught-unestablished` | — |
| 2 | A checkpoint taken during a crossing holds the command's effects but not its transcript step. The page's Download does not check whether a command is in flight. | **VB** | reproduced: `probes/checkpoint-race.out` | — |
| 3 | A march-stone names one country while the frontier installs another (only region 0,0 is corrected). | **VB** | reproduced by the navigation investigator; the cause verified at `world-assembler.ts:143` | — |
| 4 | `{?x}` in authored text prints literally. The compiler accepts it in Topics; per the knowledge investigator, lint accepts it in fixed observations. | **VB** (for companions and investigation) | reproduced: `phase-3/probes/companion-name-variant.out` | — |
| 5 | Observations anchored to a variable never teach what they teach. | **VB** (for investigation) | reproduced by the knowledge investigator (Phase I D1) | — |
| 6 | Saves and transcripts carry no engine, content or dependency hashes. | **RR** (cheap; gates every acceptance test) | code: `Campaign.save` | — |
| 7 | A journey test tier: from Begin, offered choices only, with a policy that sees only `PlayerView`. | **RR** | 58 test files teleport; items 1–3 coexist with a green suite (730 pass) | — |
| 8 | Two offered actions with identical wording. An authored action unconstrained by its own places is offered everywhere. | **SR**: lint the unconstrained action and disambiguate identical labels | reproduced: `probes/composition.out` | Phase I C2 ("module scope by default"), **rejected as stated**: world-wide reach is how institutions interact (Phase III) |
| 9 | General world-contribution manifest (`compat`, `needs`, `face`, `owns`, `preserve`, `mayVary`, `worldMay`, …). | **SR**: a placement entry (`entry`, `attach`, `hooks`, `compat`, `arrival`) extending `countries.json` and the scenario hooks | Phase II and III probes placed adventures with existing mechanisms plus an overlay; no case needs the other fields | Phase II A §5 |
| 10 | World plan for everything, plus city sockets and lots. | **SR / DC**: planned *placements of authored adventures* only (open question 23); sockets and lots deferred | imports already let contributions build onto exported places (Phase III) | Phase II A §3.3, B §2 |
| 11 | Strategic simulation layer (public faces, stratagems, horizon scheduling). | **RJ for M16; DC later**. Authored institutional rules over shared vocabulary plus `ambitions.kyr` | the Phase III probe interacted, spent and produced information without it | Phase II C §2 |
| 12 | Institutions act on information they could have, not on world facts. | **RR** (the real gap the probe exposed: the academy learned of the tower instantly) | `phase-3/probes/two-institutions.out` | — |
| 13 | Remarks and tags as new mechanisms. | **RJ**. Topics with variables over shared relations already behave as remarks over tags; only item 4 is missing | `phase-3/probes/companion-reaction.out` | Phase II C §3.3 |
| 14 | Knowledge per member. | **OQ**: needed for "the companion witnessed it", not for "the company knows it". Decide by running the companion slice both ways | Phase I D1; Phase III probe used company knowledge successfully | Phase II and III treated it as required |
| 15 | A recruited companion cannot leave alive; burial leaves `travelsWith`. | **RR** if M16 has a companion | code-path verified and investigator; Phase I D2 | — |
| 16 | Eager versus lazy installation. | **OQ**: lazy is the default because it exists (frontier); measure eager as a variant | eager: a wait took 88 ms at 37.8k facts with two adventures; lazy is where items 1–2 live | Phase II rejected eager; Phase III re-opened it |
| 17 | Shared item kinds versus namespaced local kinds. | **OQ** (owner decision) | collisions are runtime refusals (`probes/composition.out`); shared items need one kind | Phase I C1 ("namespace kinds"), **softened** |
| 18 | Process-global catalogs swapped on world reads. | **DC** (the browser holds one session) | code-path verified | Phase I B2 |
| 19 | Simulation importing presentation (perception); rendered lines in the log. | **DC** (move it when the companion work touches telling) | code-path verified; never reproduced as a hash change | Phase I B1, **lowered** |
| 20 | Save size and log growth (about 6.3 kB a command; module embedded). | **DC** | measured: `probes/save-growth.out` | Phase I G1 (size part) |
| 21 | Assisted travel over known ways; one service. | **RR**, as a macro of offered `go`s plus a boarded vehicle; no movement-semantics change | byways and `knowsWay` exist unused; `ChartModel.ways` is the known graph | Phase II B §3 ("services as vehicle actors"), kept, smaller |
| 22 | Content compatibility automated. | **RJ** as an aim. Every shipped adventure needed authorial adaptation (company, Arrival, season, era). Automate only *checking* (refusal with reasons), not adapting | Phase II §2 table; HTG refused at `admit` | Phase II implied more automation |
| 23 | World identity: path-dependent drawing versus planned placements. | **OQ** | `frontier.ts:77-78` keys regions on what is installed | Phase II claimed identity was order-independent: **wrong** for today |
| 24 | How much generated geography lies between authored adventures. | **OQ**, editorial (see the memorandum §7) | the prior player reviews: "reused greetings, journey sentences, plants, and work poses become visible as slots"; the repetition probe | — |
| 25 | The ledger cites an audit report missing from the repository. | **RR** (housekeeping) | `git log --all` | — |

---

## 3. The disputed questions, settled

- **General manifest or curated placement contracts?**
  - Curated placement contracts.
  - The general manifest anticipated many uncoordinated authors and emergent actors, and the evidence supports neither as an M16 need.
  - Revisit when a contribution cannot be expressed as `{entry, attach, hooks, compat, arrival}`.
- **World plans and sockets, or imports, hooks and placement?**
  - Imports, hooks and placement.
  - Planned placement of *authored adventures* is the one piece of "world plan" with a concrete use: march-stones and rumours that are true before a region is drawn. Even that is an open question to settle by experiment (item 23).
- **A strategic layer, or authored institutional rules?** Authored rules. Phase III invalidated Phase II's proposal for this horizon. The trigger for a layer is three or more institutions whose interaction cannot be authored without per-pair scripting.
- **Remarks and tags, or topics and shared relations?** Topics and shared relations, plus rendering of bound variables. Phase II's Remark proposal is withdrawn.
- **Per-member or company-level knowledge?**
  - Unresolved, deliberately. Company-level knowledge is enough for "the companion responds to what the company learned".
  - It is not enough for "the companion noticed what you did not", which is what makes a companion an investigator.
  - Run the companion slice both ways before committing authored content to either.
- **Eager or lazy installation?** Lazy, because it exists and is the frontier's model. Measure eager once. Either requires items 1–2 repaired.
- **How much compatibility can be automated?** The checking, not the adapting. Adaptation is authorial and should be budgeted as writing.
- **How much generated geography?** Less than now, between authored destinations. It is an editorial question (the memorandum §7).

---

## 4. Owner decisions

These are the decisions that matter. The memorandum §5 gives the full trade-offs.

1. **Anthology or open world.** A curated set of adventures placed around one city, or a system for uncoordinated authors.
2. **Compatibility.** Separate games by default for incompatible adventures (The House That Grows), with placed variants by author choice.
3. **Shared vocabulary.** What is shared (kinds, relations) and who curates it.
4. **Knowledge granularity**, after one experiment.
5. **Placement stability:** path-dependent or planned, after one experiment.

---

## 5. Important unresolved risks

- **The generated countryside's prose may be the weakest part of a joined world.**
  - The player reviews found slots visible in reuse.
  - My crude probe: up to 46 occurrences of one weather sentence in one world, and 40–57% of distinct generated sentences verbatim across three seeds.
  - It is not settled. What a player *sees* in a journey has not been measured.
- **Adapting each adventure for one world is an author's work.** Its cost has not been measured, not even for Thrume.
- **No real independent writer has used the system** under observation.
- **Mid-play installation has had two correctness defects in one path** (items 1–2). More may be there.
- **What I did not check:**
  - the browser behaviour of any of the joined-world probes;
  - Let One Remember played past its installation;
  - lint on Topic `{?x}`;
  - the builder's current `main`.

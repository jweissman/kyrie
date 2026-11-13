# Westernesse/Kyrie development-process audit: Mission 18 to Mission 19

**Audit date:** 4 November 2026  
**Scope:** retrospective continuity, accountability, and verification, with emphasis on Missions 17–19 and inherited
findings from Missions 14–16. This is a documentary and repository-history audit. It does not direct the active M19
builder, add product scope, or assert that an old defect remains present merely because it was once reported.

## Method, terms, and confidence

I reconciled the M18 commission, gate/status documents, closure and handoff; the M17 and M18 cold/independent/systemic
reviews; the adventure-author friction reports as registered in M18; the M18 wishlist; the M19 brief, baseline,
inherited settlement, register, and first progress report; and the relevant commit history through `13f1f149` on
4 November. Consequential claims below cite the documentary source, original identifier, date where stated, and commit
where the record supplies one.

Evidence levels are deliberately separate:

- **Implemented:** code/data or a commit is identified.
- **Reachable:** a test, scripted journey, or builder play reached it.
- **Usable:** the intended action completed through the player or author path.
- **Enjoyable/accepted:** an independent player or the owner judged the experience. Builder play is not this evidence.

Finding confidence means: **Confirmed**—the cited records directly establish it; **Probable**—several independent
records support it but present behaviour was not re-played in this audit; **Uncertain**—the record is incomplete or
contradictory. “Obligation” below is reserved for an accepted mission requirement or inherited registered commitment;
reviewer recommendations and uncommissioned ambitions are labelled as such.

Important limits: this audit did not conduct a new browser play, run the full suite, inspect the external screenshots
named by M19, or independently reproduce every one of the 568 M18 register rows. Thus it can establish weaknesses in
claims and verification, but not that every historical defect is still live. The M19 report itself says that no one
but the builder had played the post-repair build (`mission-19/progress.md`, “Not yet done,” item 3).

## 1. Executive assessment

### What worked

1. **The project built unusually strong finding identity and provenance. — Confirmed.** Stable identifiers (`OWN-`,
   `REV-`, `IND-`, `SYS-`, author prefixes), source documents, and many commit/test references make reconstruction
   possible. M18 eventually reconciled reviews and author friction into one register (`mission-18/closure.md:56-58,
   134-150`). The M19 register continues that discipline with evidence, priority, and status columns.

2. **Cold play repeatedly found defects that narrower tests missed. — Confirmed.** The M17 cold evaluation exposed
   absent light, contradictory narration, inaccessible companion healing, misleading danger, repeated faces/text,
   and tablet clipping during one continuous 125-action play (`mission-17/play/cold-evaluation.md`, especially
   sections 2–4 and log steps 43–123). M18’s ordinary expedition found the drained-stair softlock, duplicate-label
   selection, search tax, economy collapse, and invisible rival progress (`mission-18/review.md:44-325`). M19 builder
   play immediately found stale/wrong aims, dead digit keys, implausible shop stock, false fight reckoning, and a road
   with hidden or duplicate ways (`mission-19/register.md`, M19-01–14). This is evidence that end-to-end play is
   productive, not that it was used often enough.

3. **Some fixes were genuinely shared and adversarially useful. — Confirmed.** Examples include engine-owned aim
   identity (`M19-01`, `e7aeac3a`), aim places by id rather than prose matching (`M19-35`, `4c2923a1`), choose-then-set-
   out map behaviour (`M19-33`, `558e0dca`), out-of-order payment testing that found double pay (`REV-21`,
   `97cb51f9`), and sleeping state during long actions (`LUL-02`, `53e92ff9`). These are stronger than content-local
   patches because the record names a shared rule and a regression check.

4. **Late M18 reporting became materially more candid. — Confirmed.** The closure begins with a qualified “yes” for
   the first town (`closure.md:9-41`) but later records the owner’s contrary verdict that ordinary play still did not
   feel like a game (`closure.md:183-187`). The final handoff preserves that negative verdict and distinguishes phase
   status (`handoff.md:125-133`). This candour is valuable, although it arrived after premature closure language.

### What failed

1. **The process did not reliably convert implementation into independently demonstrated experience. — Confirmed,
   high confidence.** M18’s own standard says sophistication is met through play and an implemented feature is not an
   experiential pass (`mission-18/brief.md:6-18`). Yet the mission closed with the owner’s acceptance, real-tablet
   pass, independent unaided hour, long career, noncombat character, and several capstone demonstrations outstanding
   (`closure.md:36-41, 68-132`; `handoff.md:125-133`). The central conclusion is therefore not “nothing works,” but
   “the process cannot yet make its broad completion vocabulary trustworthy.”

2. **Closure claims were repeatedly broader than their evidence. — Confirmed.** “In the first town … yes” and
   “Every step was a visible choice doing what it said” (`closure.md:14-34`) were followed the same day by the owner’s
   “does not yet feel like a game” verdict (`closure.md:183-187`), and the next mission’s first reference play found
   wrong/stale aim guidance, non-working keys, false danger, and route hierarchy defects (M19-01–14). These later
   defects do not prove every earlier play claim false; they prove that the evidence was too narrow to support a stable
   loop-level closure.

3. **The backlog handoff lost traceability and disguised open risk as terminal disposition. — Confirmed.** M18 says
   the wishlist contains **138** rows (`mission-18/wishlist.md:1-33`). M19 claims to settle **all 136** and says
   “Nothing is left an open wish” (`mission-19/inherited.md:1-10`; commit `9dac5809`). Direct ID reconciliation shows
   that `M17-73` and `M17-99` are omitted entirely. Of the 136 represented rows, 103 are Deferred, 20 Partial, 10
   Fixed, and 3 Not reproduced; five class-A/action-integrity findings are Deferred (`ARV-A5`, `GTR-X03`, `LWR-02`,
   `QTC-10`, `BOF-15`) and fourteen class-U/systemic gameplay findings are Deferred. Deferral may be legitimate;
   calling the register settled without an open-risk state is not.

4. **Recurring findings were often narrowed into a local symptom and then reported as fixed. — Probable to
   confirmed.** Navigation moved from overload and duplicate exits to map-only travel, then to stale aim guidance,
   wrong-way leads, one-touch accidental travel, over-revelation, and regex-based place matching (`M17-29`, `OWN-18`,
   `REV-08/09`, `M19-01/04/05/11/14/18/31-35`). Combat moved from misleading danger and long grinds to corrected
   marks and a “press on” affordance while default morale/surrender remained deferred (`PT-11/23/38`, `REV-16`,
   `M19-09/26`). These are not necessarily regressions of identical code; they are evidence that acceptance targeted
   instances rather than the full player contract.

5. **Ownership was explicit in the commission but weak at the handoff boundary. — Confirmed.** M18 assigned the
   builder construction/integration/correctness/evidence, the owner final experiential judgment, and independent
   reviewers analysis (`brief.md:14-22`). Nonetheless the phase was reported “Built and played” while the owner’s
   verdict was outstanding and later negative (`closure.md:68-78`; `handoff.md:128`). No named role had authority to
   refuse closure when implementation evidence existed but acceptance evidence did not.

### Overall judgment

**Confirmed, high confidence:** the process is effective at producing systems, documents, tests, and repairs, and
effective at finding trouble when someone plays continuously. It is **not yet reliable at converting intentions into
demonstrable player and author experiences**, because closure is permitted on builder play and component evidence,
open risk can be converted into “Deferred” without an owner and re-entry condition, and end-to-end independent play
arrives after rather than before closure. Whether the latest M19 fixes have made the reference loop enjoyable remains
**uncertain**: the record explicitly lacks a post-fix independent play.

## 2. Ordered chronology and traceability ledger

This ledger selects the consequential obligations and contradictions. The full identity-preserving backlog accounting
follows it.

| Date / stage | Obligation, observation, or claim | Evidence at the time | Later contradictory or limiting evidence | Disposition and audit finding |
|---|---|---|---|---|
| M14–M16, inherited into M17 | Architecture and play reports identify omniscient presentation, generated fiction in TypeScript, global caches, hidden registries, thin inhabitants, weak navigation, repetition, and incomplete composition (`ARV-H4/H5/H7/M6`, `COR-12`, `NAR-01`, `PT-15`). | Architecture reviews, mission ledgers, and tests; mostly implementation-level. | The same IDs remain Partial/Open through M17 and enter the M18 wishlist. | **Confirmed obligation continuity.** Several were accepted inherited commitments, not new M19 wishes. Most remain deferred or partial in `mission-19/inherited.md`. |
| 28 Oct, M18 commission | Six gates require interface, one composed country, enjoyable ordinary loop, public authoring/tools, long careers/culture, and complete-experience verification. Acceptance explicitly distinguishes Built, Played, and Accepted (`mission-18/brief.md:1-122`). | Detailed gate table and owner-acceptance requirements. | M18 closes with Gate B/D partial, Gate E not begun, and owner/independent acceptance outstanding (`closure.md:60-132`). | **Confirmed incomplete obligations**, candidly carried in the final documents but obscured by some “done/played” headings. |
| 29–30 Oct, early M18 | Interface and map work reported while owner asks for radical simplification, shorter locations, quiet play, one map, and a wilderness worth exploring (`OWN-17–27`; `mission-18/register.md:171-333`). | Component/browser specs and builder demonstrations. | 30 Oct read-only audit finds 45 peer commands, conflicting lead/aim/map stories, shallow sites, empty wild, and no accepted gate (`mission-18/audit.md:5-43`). | **Confirmed questionable progress framing.** The audit correctly separates implemented/reachable/usable/enjoyable. |
| 30 Oct, independent/systemic reviews | Generated settlements have texture before drama; aims lose attention; travel lacks event grammar; identity weakly affects play; the legal-action union dominates the page; adventure pipelines fail to compose (`IND-01–07`, `SYS-01–08`; independent review §§3–6; systemic review tables C/H). | Independent review of current build, measures, and prior plays. | Many remedies are Partial/Deferred in M19: `IND-01/03/04/06/07`, `SYS-01/04/05/06/07/08`. | **Confirmed recurrence.** These are observed deficiencies/recommendations, not all M18 obligations; `IND-07` became explicit acceptance work and remains partial. |
| 30 Oct–3 Nov, adventure authors | Authors report timing/telling order, inaccessible actions, moving/offstage identity, module namespaces/exports, endings closing the whole book, schedules, multi-turn talk, refusal reasons, and test isolation (GTR/WPC/FWR/LUL/QIS/BTW/TTN/LWR/LOR/QTC/BOF rows). | Friction reports and adventure-specific tests; M18 register §§“adventures’ authors,” “reports carried,” Quittance, Book of Faces. | Many rows are fixed or narrowed, but 59 of the M19 inherited rows are reclassified class D and deferred; several concrete action-integrity items are among them. | **Confirmed authorability debt.** Workarounds prove authorability is possible, not that the public authoring model is adequate. |
| 1 Nov, M18 cold review | Persistent state/object problem-solving work, but economy collapses, loot double-counts coin/XP, search taxes play, combat/travel overrun decisions, drained stair can softlock, duplicate labels select wrong actions, schedules hide gates (`REV-11–24`). | One ordinary expedition, explicit P0/P1/P2 backlog (`mission-18/review.md:44-325`). | M19 inherits REV-11/14/16/17/21/24 as Partial and REV-13/23 as Deferred; M19 builder play finds further route, danger, and hierarchy faults. | **Confirmed partial closure.** The P0 softlock/label issues were fixed, but the higher-level pacing/economy/decision contracts were not demonstrated closed. |
| 3 Nov, M18 closure first draft | “In the first town … yes”; every visible choice did what it said; first town loop played (`closure.md:9-34`). | Builder browser play, tests, economy and viability measures. | Same report later records owner verdict “ordinary play does not yet feel like a game” (`closure.md:183-187`). | **Confirmed internal contradiction.** The first sentence is at best a reachability/usability claim, not owner acceptance or desire to continue. |
| 3–4 Nov, M18 final handoff | Phase 1 built/played but owner negative; Phase 3 played headlessly and judged poor; Phase 6 independent hour missing (`handoff.md:125-133`). Register reaches 568 rows; 138 wishlist rows carried. | Candid final status; source-preserving wishlist. | Handoff settlement drops two IDs and makes all remaining rows terminal-looking. | **Confirmed strong diagnosis, weak transition control.** |
| 4 Nov, M19 brief | Consolidate first; independently assess; make the loop, product, identity, content, authorship, coherence, integrity, Encyclopedia; validate through complete experience (`mission-19/brief.md:35-320`). | Explicit ordering and implemented/reachable/usable/enjoyable distinction. | M19 baseline and progress are still builder-authored; screenshots are outside the repository; independent post-fix play absent (`baseline.md`; `progress.md`, Evidence and “Not yet done”). | **Confirmed good method on paper; acceptance not yet satisfied.** |
| 4 Nov, M19 first play/fixes | Reference loop becomes reachable; M19 reports engine-owned aims, profession-specific town actions, plausible trade stock, corrected fight marks, road/map fixes, and Encyclopedia first form (`M19-01–35`). | Builder browser/headless plays, focused specs, commits. | The same progress report says travel is still thin, town still a list, broader country uneven, generators still emit Kyr from TS, and enjoyability untested. | **Confirmed implementation/reachability progress; usability probable; enjoyment uncertain.** |
| 4 Nov, backlog settlement | Commit `9dac5809`: “all 136 rows classed … and given a disposition”; document says nothing remains an open wish. | 136-row table. | M18 wishlist contains 138; `M17-73` and `M17-99` are absent. 103/136 are Deferred. | **Confirmed reconciliation failure and status-semantics failure.** |

### Obligation reconciliation by M18 gate

| Gate | Explicit obligation | M18 reported disposition | M19 evidence / present audit disposition |
|---|---|---|---|
| A — interface | Owner-accepted, bounded interface across sizes; distinct activity compositions; integrated title-to-play; real tablet (`A1–A10`, `A✓`). | “Built and played,” but owner verdict, real tablet, advancement composition outstanding (`closure.md:68-78`). | Owner verdict negative; M19 fixes further map, key, lead, and danger defects. **Incomplete / inadequately accepted (Confirmed).** |
| B — one country | Adventures composed into one country; City of Seven Towers; Imbar atlas; placement semantics/report; one protagonist through three adventures (`B1–B7`, `B✓`). | Every adventure placed; B2, B3, report, three-adventure demonstration missing (`closure.md:80-93`; brief status table). | Two modules in one town proven by spec; library tour still deferred (`NAV-10`); Grand Tour canon outcomes deferred. **Partial (Confirmed).** City/atlas are legitimate uncompleted obligations, not defects. |
| C — ordinary loop | Measured density/depth, deep dungeon, economy, novice covenant, combat, rich conversation, noncombat life, renewal, full expedition (`C1–C10`, `C✓`). | First town loop played; 10× baseline, noncombat play, morale, wilderness, long play missing (`closure.md:95-106`). | M19 repairs the first town but explicitly says travel thin, town list-like, broader country uneven, enjoyment untested. **Partial; closure too broad (Confirmed).** |
| D — authoring/tools | Independent Kyr review; self-contained module workflow; no fiction emitted by TS; tool/CLI parity; stats/info/bench; cross-interface save; independent-author demonstration (`D1–D9`, `D✓`). | Some tools/forms and one template; stats/info/bench, save parity, 22 generators, ARV/COR work missing (`closure.md:108-122`). | M19 proves three bounded data edits end to end, while acknowledging most generators and several content families remain outside public authorship (`authoring.md`; `progress.md:50-68`). **Partial (Confirmed).** |
| E — careers/culture/cosmology | Careers, companions, planes/tour, supermodules, calendars, art/culture, physical semantics, literary breadth, Encyclopedia (`E1–E11`). | “Not begun as scoped,” except loop-serving canon/seasons/handbooks (`closure.md:124-129`). | Encyclopedia first form only; Grand Tour/career/companion obligations mostly deferred. **Incomplete but not falsely claimed complete (Confirmed).** Some supermodules were explicitly ordered only after A–C. |
| F — complete experience | First minutes/hour/evening; calling viability; conversation/noncombat/civilization/cross-module play; owner and independent evaluation. | Register/report done; independent hour and owner acceptance outstanding (`closure.md:130-132`). | M19 still has only builder post-fix play. **Incomplete (Confirmed).** This is the principal verification break. |

## 3. Backlog integrity and slipped/questionable closures

### Backlog accounting

The “approximately 150” carried items can be accounted for exactly at the transition:

| Record | Count | Audit result |
|---|---:|---|
| M18 wishlist declaration and unique table IDs | 138 | Internally consistent: 138 unique IDs. |
| M19 inherited settlement | 136 | Internally consistent with its own 103 Deferred + 20 Partial + 10 Fixed + 3 Not reproduced. |
| Silently omitted | 2 | `M17-73`, `M17-99`. |

The two omitted rows are:

- `M17-73` — inn bed timing, inappropriate `Set Spear`, weak summoned deer, no ranger specialty. It was a concrete cold-
  play observation plus catalog/balance work, not an aspirational feature (`mission-18/wishlist.md`, Gate E).
- `M17-99` — twelve-word site names and duplicate inn topics for one site. It was a concrete play observation with an
  explicit one-topic/follow-up acceptance (`mission-18/wishlist.md`, Gate C).

**Finding: Confirmed.** These may have been omitted accidentally rather than deliberately dropped; the available
evidence contains no merge/supersession note. Their current behaviour is **uncertain**.

### Classification quality

The M19 A/U/C/R/D classification is useful, but it conflates **scope class** with **disposition**. Fifty-nine rows are
class D (“larger ambition deliberately deferred”), including some genuine uncommissioned ambitions (three-sided
combat, temperature, giant gentry) and some concrete author defects recast as large language ambitions (the IFR/QTC/
BOF groups). Conversely, several class A defects are Deferred:

| ID | Original finding | Why the closure is questionable | Audit disposition |
|---|---|---|---|
| `ARV-A5` | Ability text and execution disagree (cures by display name, stance endings hit attacker, free stuns, healing after death). | Concrete action-integrity/correctness family; “no symptom on the reference journey” limits priority, not defect status. | **Open risk, legitimately deferrable only with owner/re-entry test (Confirmed).** |
| `GTR-X03` | Thing given in talk is invisible to same-moment rules. | Concrete event-order defect; grouped into future rule phases. Workaround does not remove the defect. | **Open defect (Confirmed historical; current reproduction unavailable).** |
| `LWR-02` | A newly hostile person attacks without warning. | Player-facing warning/grace defect; Low Water’s local words reduce one instance, not shared semantics. | **Open shared defect / local mitigation (Confirmed from disposition).** |
| `QTC-10` | Revisit telling and page state disagree. | Concrete presentation defect merged into the larger transaction redesign. | **Open defect (Confirmed historical).** |
| `BOF-15` | Refused service disappears without saying why. | Concrete feedback defect merged into IFR-01 “why-not.” | **Open defect (Confirmed historical).** |

Appropriate deferrals include genuinely uncommissioned or dependency-gated ambitions such as `ARV-M5` (three-sided
combat), `QIS-01` (shared temperature), `BTW-11` (giant gentry canon), `OWN-34/36–38` (further Grand Tour/cosmology),
and most `NVR-20/21` interior-3D work. They should remain traceable but must not be called failed M18 obligations where
the commission explicitly gated them or later superseded their design.

### Duplicates and merges

Grouping was often substantively reasonable but traceability needs an explicit parent/child relation rather than a
terminal status:

- `ARV-H5` + `COR-12` + `IFR-06` + `NAR-12` describe one perception/knowledge/source boundary at different layers.
- `PT-15` + `SYS-08` describe repeated prose and repeated interaction structures.
- `REV-03` + `IND-03` + `SYS-07` describe sparse causal wilderness travel.
- `PT-11` + `SYS-05` + part of `IND-04` describe the novice danger covenant.
- `REV-05` + `SYS-01` + part of `IND-04/06` describe decision framing and contextual affordances.
- `REV-11/13/24` + `SYS-04` describe economy/progression balance and meaningful reward destinations.
- `ARV-H4` + `AUT-25` + `ARV-M3/M4/M6` + `SYS-06` describe the public authoring/generation boundary.
- `IFR-04`, `FWR-08`, `BOF-24`, and `IND-06` describe situations/conversation with initiative and aftermath.

The M19 settlement often says “as X” or uses one rationale for many rows. That preserves IDs in the 136-row table but
weakens independent disposition: a parent’s eventual fix cannot automatically close every child without each child’s
acceptance being rerun.

### Highest-consequence slipped or questionable closures

1. **F1 / independent complete experience — Confirmed incomplete.** No new player’s unaided hour, no owner acceptance,
   and no post-M19-fix independent play. This invalidates experiential closure of A/C even where implementation works.
2. **A✓ / player-facing product — Confirmed incomplete.** Real tablet and owner assessment missing; owner verdict
   negative; later M19 map/navigation/action defects show insufficient breadth.
3. **C✓ / ordinary expedition — Probable narrow success, confirmed inadequate verification.** A builder completed the
   reference job, but later play found the aim, control, shop, fight, and road defects that define the same loop.
4. **B✓ / composed country — Confirmed incomplete.** One protagonist through three adventures and library tour absent;
   `NAV-10` deferred. Placement is not equivalent to operational integration.
5. **D✓ / independent authorability — Confirmed incomplete.** Three bounded data workflows are useful evidence, but no
   independent author completed the commissioned full scaffold/install/inspect/save/GUI/terminal demonstration.
6. **Novice viability (`PT-11`, `SYS-05`, C6) — Confirmed partial.** Careful avoidance yields low death rates, while a
   lone mage/thief/bard standing in the first ruin loses 85–96%; M19 adds first-town alternatives but explicitly leaves
   out-of-town standing fights unresolved. The covenant was narrowed from “each calling has an answer” to “decline what
   the page calls grave” and “recruit a companion.”
7. **Economy (`REV-11/13`, `SYS-04`, C5) — Confirmed partial.** The aggregate 8.75→1.93 ratio is evidence of tuning, not
   a demonstration that expedition rewards, progression, and future choices cohere. Per-delve tiers and balance remain
   deferred.
8. **Combat resolution (`REV-16`, C7) — Confirmed partial.** “Press on to the end” addresses clicking after a decision;
   default morale/surrender and authored fall/routing semantics remain unresolved.
9. **Wilderness/travel (`OWN-27/80`, `REV-03/17`, `IND-03`, `SYS-07`) — Confirmed partial.** Meetings and arrival-time
   preview exist; meaningful route/camp/supply/weather decisions and measured journey density do not.
10. **Backlog settlement itself — Confirmed defective.** Two dropped IDs; no Open state; “all settled” language converts
    deferred correctness/UX risk into apparent closure.

## 4. Root-cause clusters and repeated failure analysis

### Cluster A — Legal state is mistaken for a playable decision

**Related findings:** `OWN-18/19/77`, `M17-29/71`, `REV-05`, `SYS-01`, `IND-04/06`, `FWR-08`, `M19-14/23/24/32`.

The systemic review directly observes that the page starts from the union of legal commands and groups by entity/verb,
not perception, urgency, or intention (`systemic-enjoyment-2026-10-30/review.md:187-198`). This explains the recurring
45-command arrival, critical acts hidden under secondary sheets, people/topics burying scene acts, and wrong-way leads.
M18’s glance and M19’s aim ordering reduce visible overload, but `REV-05/SYS-01` remain partial/deferred. **Cause:
Confirmed.** The architecture-to-symptom relationship is directly documented; a sweeping rewrite is not warranted,
but a bounded runtime-owned decision projection is.

### Cluster B — Semantic identity is inferred from prose, IDs, or UI state

**Related findings:** `ARV-L2/M4`, `REV-08`, `M19-01/04/05/18/20/35`, `OWN-51`, `WPC-X09`.

The followed aim lived in browser words, an aim’s subject was inferred from its condition, and its place was regex-
matched from prose; site kinds and geographic roles were also inferred from names/id shapes. These shortcuts produced
stale aims, wrong-way guidance, and brittle naming. M19’s engine-owned aim id/place fixes are strong because they remove
inference at the source; remaining id-shape and English-list reads are recorded under `ARV-L2/M4`. **Cause: Confirmed.**

### Cluster C — Three content pipelines compose spatially, not experientially

**Related findings:** `B1/B4/B7/B✓`, `NAV-10`, `REV-01`, `IND-01`, `SYS-06`, `ARV-H4`, `OWN-75`, author ending/export/
namespace rows (`WPC-X04/X06`, `QTC-A04`, `BOF-30`).

The systemic review identifies scenarios with stakes but shallow interiors, historical works with interiors but no
nearby reason to care, and installed kits with authored depth but missing generated-world lead/aim/aftermath. M18’s
expedition contract and province placement join some links, but library-tour and cross-module consequence evidence are
absent. **Cause: Confirmed at design/process level; present severity probable.** Placement tests prove coexistence, not
that content forms one coherent career.

### Cluster D — Tests prove components and happy paths, not adversarial journeys

**Related findings:** `COR-18`, `IND-07`, `REV-21`, `NAV-10`, `F1.*`, M18 CI notes, M19-22.

Teleporting tests and focused specs allowed reachability/order bugs to survive. The first adversarial-order M19 spec
immediately found double payment (`REV-21`, `97cb51f9`). M18 reports quick-suite success while slow journeys caught
text/label regressions and CI was red (`closure.md:43-50`); M19’s trade fix broke long descents before repair
(`M19-22`). **Cause: Confirmed.** Test count is not the problem; missing journey matrices and acceptance ownership are.

### Cluster E — Reference-journey optimization hides breadth failures

**Related findings:** `ARV-A5`, `NAV-10`, `PT-11`, `PRE-05`, `NAR-01`, `M19-25`, M19 progress limitation.

Several M19 deferrals are justified by “no symptom on the reference journey,” and `M19-25` sweeps generated a1 rooms
but explicitly not authored adventures. The reference loop is a valuable gate, yet it cannot validate callings,
adventures, tablets, long careers, or author workflows. **Cause: Confirmed as a verification weakness.** The product may
still improve through this focus; the failure is using reference success as breadth closure.

### Cluster F — Local workarounds are counted as authorability

**Related findings:** `ARV-H4/M6`, `AUT-25`, `IFR-01–10`, `QTC-14/19/A02/A04/A20/A24`, `BOF-08–34`, `D✓`.

Author reports show repeated hand-built schedules, retry limits, event ordering, test stubs, long names, and shared-
catalog edits. M19 repeatedly says authors “worked around” the limitation. A workaround can validate expressiveness,
but it does not validate a coherent public authoring workflow. **Cause: Confirmed.** M19’s three documented data edits
are good bounded evidence; they do not discharge D✓.

### Cluster G — Scope volume and premature status compression weaken ownership

**Related evidence:** 488 rows by the first M18 closure, later 568; 138 wishlisted; closure changed materially during
3 November; 103/136 immediately deferred in M19.

The issue is not the raw number of findings but trying to close interface, world composition, ordinary play, language,
tools, careers, cosmology, content integration, and verification in one mission. Status compression (“Fixed,” “Partial,”
“Wishlist,” then “Deferred”) became a substitute for a smaller set of owned experiential gates. **Cause: Probable,
high confidence.** The documents show scope and status churn; they do not prove individual productivity was poor.

## 5. What the verification actually proved

| Evidence | It proves | It does not prove |
|---|---|---|
| Unit/focused specs | A named rule or regression holds in the fixture. | Reachability from Begin; comprehensibility; cross-module stability; fun. |
| `reach`, lint, census, identifier sweeps | Content/rules are statically or mechanically present and certain anomalies are absent in sampled worlds. | That a player discovers or wants the content; that authored adventures outside the sample are sound. |
| Headless scripted journey | The scripted labels/actions can complete under that seed/character/order. | Visual hierarchy, touch/tablet behaviour, novice comprehension, alternate order robustness. |
| Builder browser play | Reachability and some usability through the visible UI; excellent defect discovery. | Independent usability or enjoyment; breadth beyond the chosen path. |
| Economy/viability simulation | Distributional balance under the modelled policy and encounters. | Whether warnings/preparation are understood; whether the loop feels rewarding; unmodelled content. |
| Owner/cold independent play | Player-facing hierarchy, comprehension, feel, motivation, and contradiction in continuous play. | Generality by itself; old reports do not prove a defect survived later fixes. |
| Commit count/test totals | Activity and some regression coverage. | Mission success. They are not used as primary success evidence here. |

The acceptance criteria were narrowest where the product gap was largest: “played” often meant builder scripted or
headless; “fixed” often meant one fixture; “not reproduced” often meant one route/seed; “deferred” had no mandatory
owner or re-entry trigger. Conversely, the best evidence combined a player journey, a shared fix, an adversarial spec,
and an independent replay. Few commitments received all four.

## 6. Recommendations for M19 and M20

These are changes to working method and acceptance, not a new product wishlist.

1. **Make the experiential gate authoritative.** A gate can be `Implemented`, `Reachable`, `Usable`, or `Accepted`;
   only the last closes a player-facing mission obligation. `Accepted` requires the named owner/independent role and a
   retained journey record. Builder play can advance through Usable but never self-accept. Apply this immediately to
   A✓, C✓, D✓, and F rather than to every small issue.

2. **Restore a non-terminal Open Risk state and accountable deferral.** Every Deferred item must retain: original
   class, obligation/defect/recommendation/ambition type, owner, rationale, dependency, and a concrete re-entry trigger.
   Never use “nothing left open” when unresolved A/U defects exist. Restore `M17-73` and `M17-99`, and reconcile the
   138↔136 discrepancy before M19 closure.

3. **Use a small acceptance-journey matrix.** Keep at most five release journeys: first unaided hour; one alternate
   calling and adversarial quest order; one expedition with travel/preparation/retreat/return; one authored adventure
   reached from ordinary play and continued into another; one independent-author workflow. Pin seed/build/character,
   but rotate one dimension each run. A focused fix does not close the parent cluster until its journey passes.

4. **Require four-part closure evidence for high-consequence findings.** For P0/P1 or class A: (a) original symptom
   reproduced or evidence explains why not; (b) causal repair, not only content patch; (c) adversarial regression test;
   (d) continuous player/author-path replay. If any part is absent, status is Partial. `M19-01/35` are good models;
   `ARV-A5` and `BOF-15` should remain open risk.

5. **Assign one owner per root-cause cluster, not per symptom.** The seven clusters above are enough. Child IDs retain
   individual acceptance and may not auto-close when the parent changes. This prevents `REV-03/IND-03/SYS-07` or the
   IFR/QTC/BOF families from being repeatedly rediscovered or bulk-deferred without a single accountable theory.

6. **Freeze breadth when the acceptance evidence is red.** For M19, no new mission-scale feature should count toward
   success until the post-fix independent first hour and reference expedition pass. For M20, commission only the next
   two or three clusters whose failed journeys establish causality. This is a sequencing rule, not a ban on later
   careers, cosmology, or content.

7. **Keep evidence in the repository.** Retain independent logs/screenshots or a compact evidence index with build,
   seed, viewport/input, character, route, outcome, and reviewer. M19’s screenshots and scripts are described as
   outside the repository (`baseline.md`, “The driver”; `progress.md`, “Evidence”), which makes later audit weaker.

## Bottom line for M20

Enter M20 only with a reconciled register and a recorded independent M19 acceptance run. The trustworthy product
statement available now is narrow: **the builder can complete a repaired first-town loop, several shared defects have
strong causal fixes, and the documentary system preserves much of the project’s history; enjoyable and coherent play
across the country, authored content, callings, devices, and author workflows is not yet independently established.**
That is a sound basis for consolidation, but not yet for declaring the intention-to-experience pipeline reliable.

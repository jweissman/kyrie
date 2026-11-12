# Westernesse: consolidated open register

Compiled 11 November 2026, read-only, from the repository at `/var/tmp/kyrie/wt-m20` (main plus local commits through
`33cf0777`) and the owner's checkout for the risk review. A draft for the M20 handoff. It is not a disposition. It
claims nothing beyond what the sources say.

**Sources read**
- `doc/architecture/mission-20/`:
  - log.md: amendments 1–8, the open queue, rows E1–E133;
  - handoff.md (draft), text-inference.md, user-notes.md, opening-brief.md;
  - opportunities.md, design-opportunities.md, amendment-6.md, opening-design.md;
  - cold/round-1..6: every report's "Top five problems", and round 6's §4–§17 in full.
- `doc/architecture/mission-19/`: closure.md, register.md (all 297 rows), inherited.md (145 rows; it reconciles
  M18's wishlist, which itself carried M17 and M16).
- `doc/architecture/mission-17/ahead.md`; M18 register (OWN-07 only).
- `doc/architecture/findings/`:
  - index.md: confirms M16 → M17 → M18 → M18 wishlist → M19 inherited was carried id by id;
  - gaps.md / gaps.tsv: 74 UNT rows never registered;
  - briefs.md: 109 BRF requirements.
- The 9 November reviews (stabilization, quest-intent, throughput). Their recommendations were carried as
  M19-239..283, and are cited through those rows.
- 2026-11-11-adventure-to-career.md, headless-rpg-investigation.md, capability-audit.md.
- `/home/jweissman/work/kyrie/doc/architecture/mission-20/architecture-risk-mediation-2026-11-11.md` (R1–R10).
- Memory notes: all m20-*, owner-adventure-to-career, mission-20, and the m19-owner-*, m18-owner-* and mission-*
  descriptions. The open, next and remaining lines were found by grep.

**Not read line by line:**
- the M16, M17 and M18 registers row by row: the findings index shows their open rows were carried into M19's
  inherited ledger;
- M18 closure.md: its "Carried" items are BRF-56..65;
- the M13–M15 reports.

**How it was deduped.**
- One row per problem, citing every source id. Ids are:
  - E = M20 log;
  - R = risk review;
  - R*n*-X = cold round *n*, player X;
  - M19-/PD- = M19 register;
  - other prefixes (ARV, REV, OWN, PT, …) = M19 inherited;
  - UNT = findings gaps;
  - BRF = briefs;
  - H§ = handoff;
  - mem: = a memory note.
- A later record of a fix closes a row. Where the fix was partial, only the remainder is carried. Closed examples:
  - M19-233 by E2/E3;
  - M19-170 by E43/E79;
  - BRF-58 by E122.
- Status is as recorded, with its date. Where the newest source is older than 10 November it reads "unverified since
  <date>". Rows of the 9 November reviews and of the M19 closing audit (M19-239..283) are dated 10 November, the
  closure.
- Home is one of:
  - **M20 close**: only small first-hour defects, plus M20's own named gates;
  - **M21**;
  - **later**.

---

## 1. First hour / opening

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| FH-01 | No person has accepted the first hour: PD-14's five cold players have never been run | PD-14, BRF-01, BRF-14, BRF-40, opening-brief §5, opening-design.md, H status, M19 closure §1, mem:m20-owner-before-closure §6 | Open (11 Nov) | P0 | M20 close (gate) |
| FH-02 | Round 7 cold play on the deployed build not run; handoff §4 empty | H §4, log amendment 8, mem:m20-state-nov12, mem:m20-owner-before-closure §6 | **Done** (11 Nov night): two cold players, K and L, on fa374a83; reports in cold/round-7/, handoff §4, log E134–E143. Agents' ratings, not acceptance (FH-01 stays open) | P0 | M20 close |
| FH-03 | Opening thin on replay: origin errands lose momentum. Owner directs a dense in-medias-res opening and wants the rats job dropped as the required first mission | H §3, adventure-to-career §1, user-notes, design-opp 1–2, M17-21 (feverwort errand ends in three actions) | Direction recorded, not built (11 Nov) | P1 | M21 |
| FH-04 | With no aim followed, the page never points to the town's notice of jobs; the closure fix was reverted | M19-234, opening-brief §1, M19 closure §1 | **Checked 11 Nov**: with no errand (kahitude, the wanderer), the green leads "Read the notice on the well-post" among its few acts; from the town's other rooms nothing points to it in particular (its unvisited ways are led). Kept open at P2 for the case of an errand finished elsewhere in town | P2 | M21 |
| FH-05 | Aims pile up (9–10 on day 1), a 27-rumour list, finished things linger as leads | E12, R1-A top3, R1-B top4, R2-A top2, R2-B top4, R3-C top3, amendment 2(2) | Partly fixed (11 Nov) | P1 | M20 close (see in round 7) |
| FH-06 | Go… from the first place lists five places and not the town; Go… itself unchanged | E13 | Partly fixed (11 Nov) | P1 | M20 close |
| FH-07 | The landing's column still runs past the fold with the new aims | E5 | Partly fixed (11 Nov) | P1 | M20 close |
| FH-08 | The town's threads not tied (the inn names Seolforfyrd without the hobs) | E4 | Partly fixed (11 Nov) | P1 | M20 close |
| FH-09 | Warrior led to wrench off the corn-store hasp whose key Tuck holds; who unlocks the corn-store is hard to find | E6, mem:m19-owner-play-feedback-nov6 | Open (11 Nov) | P2 | M20 close |
| FH-10 | Creation: the weapon screen's labels are still open | E30 | Partly fixed (11 Nov) | P2 | M20 close |
| FH-11 | Bless picked at creation was not among the prepared spells; Mage Armor could not be cast before a fight | R6-I §17, R3-C top2 | **In part** (11 Nov night): not a fault in preparing: a first-level cleric has one slot, and the first spell chosen fills it (Spellcasting.fill, probed). The spell sheet now says so, and that any other can be prepared in its place with an hour's study under Wait; not seen rendered. Mage Armor cast before a fight (world-side casting into the fight) is M21 | P2 | M20 close |
| FH-12 | Creation's skills, background and spell choices to be made clear and useful early (amendment 7(2)); a trade's gear and skills never come up (prospector's shovel, dungeon-delver's digging) | amendment 7(2), R6-I §17, R6-J §17 | No completion recorded (11 Nov) | P2 | M21 |
| FH-13 | A caster cannot find how to get spells back; the inn's bed still sits under Trade › Services | E93 (in part), R5-G top2, R5-G top4, R5-H top5 | In part (11 Nov) | P2 | M20 close |
| FH-14 | The pack omits lit lights and oil; waiting does not heal and nothing says so; herbs unexplained; rest and food opaque | E18, R1-A top5, REV-14 | Open (11 Nov); REV-14 Partial, unverified since 8 Nov | P2 | M20 close |
| FH-15 | Talk is topics, not an exchange: the first hour's three or four people should hold an exchange with progression; a substantial NPC verified | M19-227, opening-brief §1, BRF-61, mem:m19-owner-interaction-flow | Partial, the rest deferred to M20; no M20 record (10 Nov) | P1 | M21 |
| FH-16 | Topics reorder after every question; key threads hidden under "Something else…", which often holds only "ask again" | R6-I §6, R6-I top5, R6-I §4 (Indira), R4-E top1, E148 | **In part** (11 Nov night, E148): shown led first, then in written order; a fold of only asked things is "Ask again…"; not seen rendered | P2 | M20 close |
| FH-17 | Nobody but family can be asked about the main story; greetings copied word for word between people | E46 | Partly fixed (11 Nov) | P1 | M21 |
| FH-18 | Generated talk does not know a calling (no fence for a thief, the same priest for every calling) | M19-141, BRF-76, SYS-06 | Deferred, unverified since 8 Nov | P2 | M21 |
| FH-19 | Ancestry and background barely register; no per-member ancestry or background fact; perception by background | E35, R2-B top3, R6-I §17, M19-181, M19-17 (remainder) | Partly fixed (11 Nov); M19-181 Open (10 Nov) | P2 | M21 |
| FH-20 | Nothing can be given: the Gaffer's "pretty", the necromancer's book to Indira, grave rings back | E27 (Give open), R2-A top5, R6-I §15 | Open (11 Nov) | P2 | M21 |
| FH-21 | A talker's gifts (Charm Person, Charisma 21) never matter in talk; no bargaining with hirelings | R4-E top1 | Not in log (10 Nov) | P2 | M21 |
| FH-22 | Inn bed and ranger specialty remainder (inn bed taken in the morning slept to evening; Set Spear; specialty) | M17-73 | Partial, unverified since 4 Nov | P3 | M21 |
| FH-23 | Automation skips the prologue; cold rounds must use `&opening` | E21 | Noted (harness) | P3 | later |

## 2. Combat & challenge

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| CB-01 | First-hour fights trivial: challenge rated 1–2 in every round, most players lost no hit point, high-armour characters never hit, bosses dead in a round | E19, E29, E52, E92, E110 (open part), R1-B top2, R2-A top1, R3-C top2, R3-D top1, R4-F top1, R5-G top3, R5-H top3, R6-I top1, R6-J top2, user-notes (hollow stalker), design-opp 11–12, H §3, amendment 2(4), 5(4), 6(E), BRF-32, BRF-74 | Open (11 Nov) | P1 | M21 |
| CB-02 | The fight's reckoning is unreliable: hobs reckoned "hard" never hit (level-one trial variance); the forecast's words still open | E14 (forecast words open), E110 (in part), R6-J top2, R6-J §5 | In part (11 Nov) | P1 | M20 close |
| CB-03 | A lone first-level mage meets 11 of the 14 first-hour bands as grave or deadly; lone casters and thieves lose standing fights out of town | E74 (mage open), design-opp 10, M19-87, PT-11, SYS-05 | Open (11 Nov); PT-11/SYS-05 Partial, unverified since 8 Nov | P1 | M21 |
| CB-04 | Placed road troubles kill any lone novice who stands and fights, a warrior included (deserters 0.00 / 93%) | UNT-124 | Open risk, unverified since 6 Nov | P1 | M21 |
| CB-05 | A failed check is free to retry; there is no `Resolve … once` or `tries N`; a final check is not said to be final; a Topic cannot carry a check; a check's difficulty cannot read a measure | M19-124, M19-125, BOF-09, BOF-10, UNT-112, R6-I top1 | Deferred, unverified since 8 Nov; seen again in round 6 (11 Nov) | P1 | M21 |
| CB-06 | The Gaffer alone on his ledge dies in a round or without a choice | E52 (remainder), R4-F top1 | Open (11 Nov) | P2 | M20 close |
| CB-07 | Sleep/stun traps drop the company into the warned barrow-dead's room: lying still is certain death, no agency | E102, log queue 2, mem:m20-state-nov11 A | **Fixed** (E147, test/sleep-warned) | P1 | — |
| CB-08 | Danger thin in ordinary exploration: the silver walker meets one fight in 13 hours; dangers met are mostly grave or deadly; frequency to be told apart from balance; bounded first-hour danger; no walker write-up | E100, E105, log queue 4, amendment 8, mem:m20-state-nov11 #8 | Open (11 Nov) | P1 | M20 close (write-up) / M21 |
| CB-09 | A bare Take in a warned room can start the fight, and the label does not say the watchers will not wait | M19-252 | Open (10 Nov) | P3 | M20 close |
| CB-10 | Antidote on a poisoned hireling "to no effect" | E36 (antidote open), E137 | **Fixed** (11 Nov night, E137): the antidote takes away the fight's poison as well as the world's poisoned (test/antidote); not replayed on a hireling | P2 | M20 close |
| CB-11 | A persuaded foe's portrait moves to the company's side (allies or not?) | R6-I §4 (74) | Not in log (11 Nov) | P3 | M20 close |
| CB-12 | Fight bar seen only in the CI tour; the target-chips row did nothing on a phone; "telling blow … for 1"; a fight legible at a glance | M19-226 Partial, R6-J §5–6, BRF-05, BRF-28 | Partial (10 Nov); round 6 (11 Nov) | P2 | M20 close |
| CB-13 | Odds hidden until after committing; techniques (Second Wind) say nothing | UNT-104 | Open risk, unverified since 6 Nov | P2 | M21 |
| CB-14 | A venomous bite has two chances to poison (the damage-triggered save plus the applied poison): a balance question | E114 | Left open (11 Nov) | P3 | M21 |
| CB-15 | Clues the game sets up (mirror, noonlight jar, torch against the undead) have no use offered in a fight | R5-H top5 | Not in log (10 Nov) | P2 | M21 |
| CB-16 | Locks open with no visible roll or tension | R6-J top2 | Not in log (11 Nov) | P3 | M21 |
| CB-17 | Long fights with nothing to settle them; no morale or surrender | M19-281, REV-16 | Open (10 Nov); REV-16 Partial, unverified since 8 Nov | P3 | M21 |
| CB-18 | A won fight kills and never routs, so Pleads never fires | QTC-A10, UNT-242 | Open risk, unverified since 6 Nov | P2 | M21 |
| CB-19 | Climax without weight: XP comes fast, traps are named before found and all answered by the pole, the bier exists only in words, the crown can be taken while the king lives | M19-117, M19-115 (remainder), UNT-109 | Partial (10 Nov); UNT-109 unverified since 6 Nov | P2 | M21 |
| CB-20 | Balance instruments: an arena, ability "pawn" tournaments, party gauntlets, combat from a few constants (perhaps in Deem); the bands diagnostic made a spec | user-notes, design-opp 5, design-opp 10, SYS-04 | Idea recorded (10 Nov) | P2 | M21 |
| CB-21 | Challenge table measured against a warrior with the dice as they fell; against creation's, 144 of 183 kinds read weaker | design-opp 11 | Left by M20 (10 Nov) | P3 | M21 |
| CB-22 | Economy: one delve's coin makes every field cost trivial; no field, expedition or domain tiers; HP growth flattened; treasure with several destinations | REV-11, REV-13, REV-24, SYS-04, UNT-119 (CMB-10) | Partial / open risk, unverified since 8 Nov | P2 | M21 |
| CB-23 | OSR mechanics beyond breath and saves (regeneration, monster spells); spell resistance; hit dice as expressions; 24 statuses not applicable | M19-81, M19-150, capability-audit (timing/statuses), mem:m19-owner-osr-mechanics | Deferred, unverified since 8 Nov | P2 | later |
| CB-24 | Party scale: a hazard meant for a company kills a party of one; two Persons in a room are two fights; Level barely moves a flat-challenge species | M19-245, M19-250 | Open (10 Nov) | P3 | M21 |
| CB-25 | Incapacitated/dead states, carrying the fallen; a six-second round shared with the world clock | BRF-95, BRF-96 | Disappeared / unverified since 6 Nov | P3 | later |
| CB-26 | Combat has exactly two teams | ARV-M5 | Deferred, unverified since 8 Nov | P3 | later |

## 3. Navigation & map

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| NM-01 | No road junctions: a road out goes into a town and back out (16–23 ways a seed, at most 2 hexes); tracks are straight lines | E126 (left), E132 (left), H §2.7, mem:m20-owner-before-closure §1 | Left for M21 (11 Nov) | P1 | M21 |
| NM-02 | Map panel hierarchy: eyebrow, short title from real data, quiet context, particulars, short action; "Explore nearby" only where the hex holds something; panel heading against button; panel covers half the phone | log open queue 1, mem:m20-owner-map-panel-hex-kits, R6-J §4 (164), R6-J §6, M19-280 (header vs card) | Open (11 Nov) | P1 | M20 close |
| NM-03 | Map labels at the view's edge: drawn just inside the safe zone and still selectable (E130, 4b5173ec, checked at five sizes); left: "way into…" labels pile up on a phone; "way into…" labels pile up on a phone | E130, commit 4b5173ec, mem:m20-owner-before-closure §2, R6-J §6, R6-J top5 | Open part (11 Nov) | P2 | M20 close |
| NM-04 | A site in the company's own hex: the town-entry and facet case is not handled | E129 ("not looked at"), H §2.4 | Open (11 Nov) | P2 | M21 |
| NM-05 | Hex crossing as a structured action property (scale, novelty, skills, consequences) in a diagnostic view; the journey glyph exists, the rest does not | log open queue 1, opportunities M21 #5, mem:m20-owner-map-panel-hex-kits | Journey glyph only (11 Nov) | P3 | M21 |
| NM-06 | Travel as passage: a meeting chance at each hex, what is passed seen, round trips dead time, harmless bats break journeys; no route, camp or supplies decisions | E94, R5-H top2, user-notes, design-opp 7, REV-03, IND-03, SYS-07 | Open (11 Nov); REV-03/IND-03/SYS-07 Partial, unverified since 8 Nov | P2 | M21 |
| NM-07 | The map does not say where the drawn atlas ends (nothing west of Thornhaven); geography beyond the first atlas; what a march-stone means on one map | E75, design-opp 8, OWN-80, BRF-55 | Explained, not shown (10 Nov); OWN-80 unverified since 8 Nov | P3 | M21 |
| NM-08 | Map: zoom barely changes the view; "You know no way there yet"; the marker under its card; an empty image in the route card; Go there → Market reads as a square | M19-280, M19-116 (remainder) | Open, not re-checked (10 Nov) | P2 | M20 close |
| NM-09 | Next-door shops said to be twenty minutes away; inside the corn-store every place in town "about 1½ hours" until the padlock was wrenched | M19-282, R6-I §4 (118–122), E149 | **In part** (11 Nov night, E149): every step had been counted as ten minutes; walks and map legs now say the minutes the step spends (test/walk-minutes); the corn-store's 1½ hours not re-checked | P2 | M20 close |
| NM-10 | Authored countries exempt from the hex rule; to decide country by country which authored walks are journeys | M19 closure §1, opening-brief §3, stabilization review §10 | Open; no M20 record, unverified since 10 Nov | P2 | M21 |
| NM-11 | Plans: below-ground and town plans partial; inside a site, ways named as edges not places; PD-03's crown-aim page | PD-09, PD-04, PD-03, BRF-69 | Partial, unverified since 8 Nov | P2 | M21 |
| NM-12 | Play as a world moved through, not a command page | M19-46, stabilization review §10 | Partial, unverified since 8 Nov | P1 | M21 |
| NM-13 | Five new terrains never looked at; frost, desert and steppe terrain kinds | M19-104, OWN-44 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| NM-14 | The sea: the harbour inland in most worlds, no vessel or sea passage, the Dorothea's calls not islands, voyage as survival | M19-101, M19-102, M19-103, M19-134 | Deferred, unverified since 8 Nov | P2 | later |
| NM-15 | Interior maps: no vertical convention, no room kinds | NVR-20, NVR-21 | Deferred, unverified since 8 Nov | P3 | later |
| NM-16 | Transport services (carter, ferry, paid passage) | UNT-116 | Open risk, unverified since 6 Nov | P3 | later |

## 4. Atlas & perception

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| AP-01 | R9's gate not built: a false-promise corpus from the cold rounds, and tests that styled opportunities map only to legal visible actions or explained states | E133, R9, H §2.10 | To build; R9 homed in M20 (11 Nov) | P1 | — | **Built: test/gold-walk (E146).**
| AP-02 | Atlas states (full, faint, dim, silver) as projected engine data, not CSS; exhaustion as one projected state so repeatable useful acts never go dim | H §2.5, H §2.9, mem:m20-owner-atlas-synthesis | Open (11 Nov) | P1 | M21 |
| AP-03 | Facets from Kyr: no way to mark an act, thing or person uncanny, knowledge or payoff; violet never drawn; a sign has no aspect of its own; rare facets | H §2.2, opportunities gaps 1–2, design-opp 13 | Open (11 Nov) | P1 | M21 |
| AP-04 | Distance-sensitive perception: reach only for companionship, and the reach table is code; per-facet reach, provenance, confidence, specificity by distance; perception by calling, not only capability | H §2.3, opportunities gaps 3–4 and M21 1–3, mem:m20-owner-companions-perception §3, mem:m20-owner-atlas-synthesis | Open (11 Nov) | P2 | M21 |
| AP-05 | Story-node propagation: a followed undertaking perceived along known places and people; a destination's facets on approaches beyond the town case | H §2.4, mem:m20-owner-atlas-synthesis | Open (11 Nov) | P2 | M21 |
| AP-06 | Gregarious (and the Bard's reach) not in the game; the test grants it as a capability | E108, opportunities | Not built (11 Nov) | P3 | M21 |
| AP-07 | Key actions one menu deep (slip past the hobs, the Gaffer's ledge, chest contents, a found box, nest, rat-runs, hanging the bell, the crowbar); places only in Go… and not in the scene | E112 (in part), R6-J top1, R6-J §15, R6-I §15, R2-B top2, R5-H top5, R1-B top3 | In part: the foreground came after round 6, to be seen in round 7 (11 Nov) | P1 | M20 close |
| AP-08 | An opened chest looks empty from the scene; Look… repeats text or lists actions already refused; "Look closely" says nothing in place | E112, R6-I §5, R6-J §4, M19-108 (remainder), mem:m19-owner-playthrough-notes-nov7 | In part (11 Nov); M19-108 Partial | P2 | M20 close |
| AP-09 | The Eye as a deliberate, sustained search with a risk of interruption; perception in three tiers | E120 (assessed, mechanics unchanged), adventure-to-career §9, mem:m20-owner-action-projection §4 | Proposed (11 Nov) | P2 | M21 |
| AP-10 | "Offer the heel of a loaf" lost its horse's name somewhere in presentation; the cause not found | E119 | Cause not found; a general "whom" rule added (11 Nov) | P3 | M20 close |
| AP-11 | Colour surprises: persuasion red at the ossuary; "You would come there after dark" blue at midnight; a blue action read as knowledge; "Ring the bell" offered in every room to no effect | R6-I §16, R6-J §5, R6-J §14, R6-J §16 | The bell: rung only within a hob's earshot (10 Nov), now pinned by test/bell-walk (not offered once all have run; 11 Nov night). The colours: the strict grammar landed since (11 Nov), not re-checked | P3 | M20 close (verify) |
| AP-12 | Verify the existing character-specific perception in real play (owner's "M20 now" item 5) | mem:m20-owner-atlas-synthesis | No record (11 Nov) | P2 | M20 close |
| AP-13 | A way into a room where a deadly band was seen carries no danger (no last-seen record) | opportunities gap 6 | Later (11 Nov) | P2 | M21 |
| AP-14 | Compound opportunities: one subject, several approaches; no authored opportunity naming its approaches | opportunities gap 5, amendment-6 addendum | Later (11 Nov) | P3 | M21 |
| AP-15 | Presentation reads omniscient truth: a foe's exact HP shown in the dark; perception decided in presentation code | ARV-H5, COR-12 | Open risk, unverified since 6 Nov | P2 | M21 |
| AP-16 | What each member of the company knows; claims two sources tell differently | UNT-113, IFR-06 | Open risk / deferred, unverified since 6 Nov | P3 | later |
| AP-17 | Ordinary exploration empty: 70 of 80 stretches round Thornhaven hold nothing; meetings sparse away from the start; the first-steps thread's content; half an hour without a quest finds nothing; POI density never measured | E105 (open part), BRF-07, BRF-43, R1-A top5 | Improved (rovers), open (11 Nov) | P1 | M21 |

## 5. Narration & prose

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| NP-01 | Prose against the moment: daylight underground or at midnight, lit lanterns in sealed rooms, a wolf in a sealed room, a dead Gaffer cackling, a door "locked" after passing through it, a trapdoor "weighted with a sack" | E15, E114 (rest open), R1-A top1, R1-B top5, R2-B top5, R6-I §5, R6-J top4, H §3 | Open (11 Nov) | P1 | M20 close (instances) / M21 (systemic) |
| NP-02 | Narration not bound to what the company can perceive (parade seen from indoors); unanchored rule words heard anywhere | M19-229, M19-126, UNT-216, opening-brief §2 | Deferred; attempt reverted; no M20 record (10 Nov) | P1 | M21 |
| NP-03 | Notes and Story as two projections over different records; own deeds filed as "told you"; note times mismatched | M19-228, R6-I §6, opening-brief §2, mem:m19-owner-stabilization-nov9 | Deferred to M20; no M20 record (10 Nov) | P1 | M21 |
| NP-04 | Generic voices in the wrong mouths: a tied, crying captive greets with shopkeeper banter and uses Baldric's farewell; a rescued boy says "Now then!" | R6-J §6, R6-J top4, R5-G top5, UNT-110, CTH-09 | Not in log (11 Nov); UNT/CTH unverified since 6 Nov | P2 | M20 close |
| NP-05 | Prose repeated: the cart twice, a creature named five times, the wagoner's resolution three times, lighting a lantern in three near-identical lines, "the dead … lie dead" | E16 (partly fixed), R6-I §7, R6-J §5 | Partly fixed (11 Nov) | P2 | M20 close |
| NP-06 | Machine-made topic labels; "Another aim" under ways means nothing; "Something else…" holds only "ask again" | E115, R6-I §5, R6-I top5 | Open (11 Nov) | P3 | M20 close |
| NP-07 | Engine words left in the fight's telling ("(roll 10)", "Tatterlip"); keys held offering no unlock | M19-121 (remainder), E62, R4-F top3, opening-brief §2 | **In part** (11 Nov night): "(roll N)" only in the dice detail (E127); "Tatterlip" is an authored hob's name. Keys held offering no unlock not re-checked | P2 | M20 close |
| NP-08 | Exceptional events met on arriving told in the ordinary register; exceptional moments do not take the page | NAR-14, BRF-29 | Open risk, unverified since 6 Nov | P2 | M21 |
| NP-09 | Prose arrives already interpreted (a suggestive object followed by a Discovery stating its meaning) | M19-279 | Open (10 Nov) | P3 | M21 |
| NP-10 | Sameness: a third of narrated sentences repeat across countries; never measured; no rotation by causal role; dead "Ask again" copies | PT-15, SYS-08, M19-209, ARV-A19 | Open risk / deferred, unverified since 8 Nov | P2 | M21 |
| NP-11 | Generated text tonally varied (ordinary life, humour, hospitality); vivid sensory prose, not bland drollery | BRF-85, M19-165, mem:m19-owner-playthrough-notes-nov7 | Unverified since 7 Nov | P3 | later |
| NP-12 | Names: old-tongue names transparently Latin; Common names from a true common tongue; languages authorable in the project | M19-20, OWN-41, OWN-51, BRF-80, BRF-84, M19-208, mem:m18-owner-portraits-names-2 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| NP-13 | Engine names and masks leak into text: "The raiding party: Fall on You"; masked names replaced by string; `seen as` and Known-as leaks | UNT-108, UNT-121, UNT-203, UNT-214 | Open risk, unverified since 6 Nov | P2 | M21 |
| NP-14 | A companion "binds the hurt" when nobody is hurt | UNT-107 | Open risk, unverified since 6 Nov | P3 | M21 |
| NP-15 | A wait in a room repeats the room's description every hour | M19-263 | Open, not verified (10 Nov) | P3 | M21 |
| NP-16 | Text slips (a lintel's spelling, a sentence twice, "their breath" of a man, a card clipped, a file name as a caption) | M19-283 (rest) | Partial, the rest not verified (10 Nov) | P3 | M20 close |
| NP-17 | Raw museum captions and credits on portraits (Lem) | R6-I top3, E31, UNT-111, E152 | **Fixed** (11 Nov night, E152): credits name the painter and do not shout the title (test/paintings); not seen rendered | P2 | M20 close |
| NP-18 | Ordering slips: a milestone told on the next step; a greeting after a scripted reaction; a tame bear greets while asleep | UNT-219, UNT-220, UNT-221 | Open risk, unverified since 6 Nov | P3 | later |

## 6. UI & safe zones

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| UI-01 | Controls move under the pointer (Attack under Press on, the Go list, the bottom-left control); the Look panel toggles and closes after each act; clicks land elsewhere | E17, R1-A top4, R2-A top5, R3-C top5, R3-D top4, R5-G top1, R5-H top4 | Open (11 Nov) | P2 | M20 close |
| UI-02 | On a phone: inert portraits; the title over the icons; the trade grid under Continue; eleven portraits in a row; the shop's portrait order shifts under a tap | E116 (in part), R6-J top5, R6-J §4 (171) | In part; the touched state not seen rendered (11 Nov) | P2 | M20 close |
| UI-03 | Text clicks on visible words hit hidden page text; Go… rows by text do nothing or take the next row; some rows preview, others walk at once | R6-I top5, R6-J §4, E116 | Not in log / in part (11 Nov) | P2 | M20 close |
| UI-04 | Small items: Escape does not close talk; "Nowhere to sleep here" in an inn; a one-way back garden; the circus gone from the map | E62, R4-E top4 | **In part** (11 Nov night): in an inn after dark the wait panel names who has a bed, under Trade (test/sitting-out-the-night); Escape in talk takes the leave (ReaderApp.back), round 4's case not reproduced, not seen rendered; the back garden and the circus open | P3 | M20 close |
| UI-05 | Buttons: icon and text overlap, jagged wraps; a screen of plain buttons and link-like controls reads as a wiki | user-notes | No row; scene-first since (11 Nov) | P2 | M20 close (verify) |
| UI-06 | A place's telling scrolls inside its column (the opening's causeway at 1180×820; always on a phone) | E128 (left) | By design (11 Nov) | P3 | M21 |
| UI-07 | Results below the fold of the fixed column; number keys dead on the scene | M19-116 | Partial (10 Nov) | P2 | M20 close |
| UI-08 | The resting scene: an independent look at whether it reads as a place | M19-85 | Partial, unverified since 8 Nov | P2 | M20 close (round 7) |
| UI-09 | The interface explains itself (generic instructions under controls) | M19-57 | Partial, unverified since 8 Nov | P3 | M21 |
| UI-10 | One design language across scene, travel, fight, talk, notes and pack; a specimen page of components with several fillings | M19-231, M19-217, mem:m19-owner-opening-and-foundations | Deferred (10 Nov) | P2 | M21 |
| UI-11 | Access: no screen-reader pass; no map path without the canvas; title and creation ignore the keyboard; no clock shown except while moving; no "wait until"; free play by keys without images | UNT-117, UNT-218, BRF-36 | Open risk, unverified since 6 Nov | P2 | M21 |
| UI-12 | A refused purchase still does not say why; commerce and inventory (stock fits the shop, no undifferentiated lists) | M19-113 (remainder), BRF-73 | Open (10 Nov) | P2 | M20 close |
| UI-13 | A treasure's appraisal ("Show … to …") is not among the sales | E113 (remainder) | Open (11 Nov) | P3 | M21 |
| UI-14 | Buying ignores what the company already carries | UNT-105 | Open risk, unverified since 6 Nov | P3 | M21 |
| UI-15 | Pack: named and plain items of one kind are two rows; nothing weighs; lantern and oil in different packs are dead weight (they went to Xyn unasked) | M19-146, UNT-227, M19-253, R6-I §6 | Deferred / open (8–10 Nov); seen 11 Nov | P3 | M21 |
| UI-16 | A living interface: real time passing, motion and reaction | user-notes, design-opp 6 | Idea (10 Nov) | P3 | later |
| UI-17 | A Company page in the Book, and the same in the terminal | adventure-to-career §11 | Direction (11 Nov) | P2 | M21 |
| UI-18 | The `?scene=full` experiment was never made default by row; scene-first landed later (79c26bdf) | E77, log open queue | Experiment row not closed (11 Nov) | P3 | M20 close (close the row) |

## 7. Undertakings & story payoff

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| US-01 | The "Gone under" origin's sister is silent at Seolforfyrd, with no one to ask: the hook goes quiet when followed | E111 (open part), R6-I top4, R6-I §14, H §3 | **Fixed** (11 Nov night): the inn's keeper at home can be asked of her and says where to look; the pin found is told and seen through (test/sister-asked); not replayed cold | P1 | M20 close |
| US-02 | Treasure payoff flat: two identical "empty" jewelled boxes; no hoard; a three-locked toll-chest holds one box | E118, R6-J top3, R6-J §14, H §3, OWN-75 | Partly (11 Nov night: the map's box told, E142; the jewelled box no longer "empty"; no hoard yet) | P2 | M21 |
| US-03 | The dead man's map ends in an empty box, with no word of who emptied it | E20, R1-B top4, E142 | **Fixed** for this origin (11 Nov night, E142): the box is told (the drover's mark, a name crossed out, stones to sell) and seen through, 100 experience (test/map-origin-find) | P2 | M20 close |
| US-04 | Handed-out aims are all kill or loot; peaceful errands (Gosse's offer, the circus larder) not kept in Notes; promises with terms, decline and defer | E58, R4-E top2, BRF-99 | Open (11 Nov) | P2 | M21 |
| US-05 | No successor threads after a resolution ("Nothing more is asked of you"); a lone company following the page earns no level in 200 steps | PT-01, M19-59, BRF-67 | Open risk / partial, unverified since 8 Nov | P2 | M21 |
| US-06 | Gosse and Hepzibah lead nowhere after their first line | R6-I §4, R6-I §15 | Not in log (11 Nov) | P3 | M21 |
| US-07 | PD-08: heard, lead, undertaking, route knowledge and immediate action are not separate records; an aim's places not typed for "on the map"; who keeps a building | PD-08, BRF-72, UNT-123, text-inference.md (Aims.named), mem:m19-owner-architecture-review | Open (10 Nov) | P1 | M21 |
| US-08 | No knowledge-boundary test: an aim's target can appear in the journal or local choices before it is learned | M19-272, opening-brief §3, M19 closure §1 | Partial (10 Nov) | P2 | M21 |
| US-09 | A dungeon to find and the full rendered route; journeys A–D, and journeys 2, 5 and 6 through the page; the builder's descent never played by a person | M19-155, M19-173, M19-158, BRF-92, stabilization review §10 | Partial, unverified since 8 Nov | P1 | M21 |
| US-10 | Depth and reward: missions deeper than one fight; the loop distended; an expedition that opens another; two linked expeditions; old-school kit made useful | OWN-55, OWN-75, OWN-78, OWN-79, OWN-81, BRF-66, BRF-103, BRF-104 | Partial, carried to M20, unverified since 8 Nov | P1 | M21 |
| US-11 | After a fight, the aftermath: what was recovered | PD-13 | Partial, unverified since 8 Nov | P3 | M21 |
| US-12 | Offstage agency: independent undertakings leave traces; a rival expedition visible; situations with initiative; strategic antagonists; institutions acting | NAR-17, REV-23, IND-06, BRF-20, BRF-62, BRF-100 | Open risk / disappeared, unverified since 8 Nov | P2 | later |
| US-13 | Semantic enrichment: history transitions, structural constructs, notes as evidence, dramatic roles, tonal variety, endings as events | M19-160..M19-166 | Deferred, unverified since 8 Nov | P2 | later |
| US-14 | From adventure to career: backgrounds unfold in play, early companions, formations (Synod), careers, kits; one substantial companion; advancement options | adventure-to-career §2–8, amendment 7(2), mem:m20-owner-map-panel-hex-kits (kits), opportunities M21 #4, NAR-18, BRF-31, BRF-38 | Direction (11 Nov) | P2 | M21 |

## 8. World memory & consequence

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| WM-01 | The world forgets: the Gaffer "comes off his fleeces" after death; the sergeant's speech word for word; the players never react or leave without a line | E34 (Gaffer line open), E57 (sergeant open), R2-B top1, R4-E top3, R6-I top2, H §3 | Partly fixed (11 Nov) | P1 | M20 close |
| WM-02 | Dishonesty has no consequence: graves robbed under the dead who keep the bounds, for free | E45 (graves still free), R3-D top1, H §3 | Partly fixed (11 Nov) | P2 | M21 |
| WM-03 | "Look at the cart / take the horse's head" still offered after robbing the wagoner | R6-J §15 | **Fixed** (11 Nov night): the horse's head is offered only while the meeting is unanswered (test/owed: a thief who lifts a sack is offered no hand with the cart); the cart's look is kept, a thing at the road | P3 | M20 close |
| WM-04 | Scenario word that never goes stale (the den's directions after it is cleared) | UNT-103 | Open risk, unverified since 6 Nov; E57's stale-word fix may cover it | P3 | M21 (verify) |
| WM-05 | Return told through people: what others did reaches the company by witnesses and news; news heard late if away | BRF-33, UNT-240 | Superficial / open risk, unverified since 6 Nov | P2 | M21 |
| WM-06 | One metropolis many adventures add to: Dun Rìerdan only an identity; the King's Players builds its own; several adventures interleaved in one region; institutions as kits; modules coexisting in one Imbar | M19-77, M19-107, M19-123, BRF-42, BRF-54, BRF-79, BRF-107, capability-audit #10, mem:m19-owner-experience-pass | Deferred / unverified since 8 Nov | P2 | later |
| WM-07 | Weather: not readable by a module; a module's rain against the world's FAIR; yesterday's weather read at 04:00; dark nine to six in every season | M19-256, UNT-215, UNT-241 | Open (10 Nov); UNT unverified since 6 Nov | P3 | later |
| WM-08 | History the player can investigate, misunderstand and alter | BRF-106 | Superficial, unverified since 6 Nov | P3 | later |

## 9. Content & paintings

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| CP-01 | Paintings that contradict their text (cathedral for a toll-hall, flooded "dry" cave, temple for a slab altar, oast house for a kiln, window in a windowless vault; charnel passage, ossuary, shrine) | E95, E62, R5-G top5, R6-I top3, R6-J top4 | Open (11 Nov) | P2 | M20 close (placements) |
| CP-02 | Paintings the first hour lacks (toll-house hall and counting-house, a warehouse, a muck pit, cave interiors); rooms of one kind share one painting; scenery kinds not yet placed | E37, E31 (remainder), M19-232 (remainder), mem:m20-owner-environment-pass | Needs the owner's art (11 Nov) | P3 | later |
| CP-03 | Missing plates: bone flute, bronze mirror, cloak, betony; new kinds show an empty square | E95, E72 (betony), M19-145 | Open / deferred (11 Nov) | P3 | later |
| CP-04 | Likenesses: Xyn's two faces; a dwarf cleric drawn as a red-haired human woman; a dwarf family painted human; a drowned girl with a revenant's face; Tuck by an acorn (by design); portrait suitability | R6-I top3, R6-I §17, M19-114, M19-172, E42, PRE-05 | Deferred / open (11 Nov) | P2 | later |
| CP-05 | Orsino traps drawn without regard to the makers (an electrified floor in a Barrow-Kin grave) | E98 | Open; waits for a world-generation pass (11 Nov) | P3 | M21 |
| CP-06 | Orsino room and shop tables not drawn; dungeon and room generation from Orsino; Orsino's companions, deities and dungeons; generated planes and cities | M19-207 (remainder), M19-210, capability-audit | Deferred, unverified since 8 Nov | P3 | later |
| CP-07 | Items: per-item depth; most magic items, charges, treasure by tier; content inventory with operational coverage | M19-92, capability-audit #8, BRF-78 | Deferred / open, unverified since 8 Nov | P3 | later |
| CP-08 | Generated people thin; settlements texture before drama; two settlements should differ; operational professions | NAR-01, IND-01, SYS-06, BRF-06 | Open risk, unverified since 8 Nov | P2 | M21 |
| CP-09 | Natural history: geology beyond formations; herb-lore or woodcraft telling plants apart ("What grows here" known/unknown); plants and animals with ecology | M19-68, M19-144, E73, design-opp 9, BRF-82 | Deferred (8 Nov) | P3 | later |
| CP-10 | Unplayed content: the anthology's endings; Low Water never played Begin to ending; the circus played only by its author; the library tour (every adventure entered); the principal adventure within a day; a second adventure told of | M19-133, BRF-24, BRF-25, BRF-35, WPC-X08, NAV-10 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| CP-11 | Grand Tour and planes: the Rose, canonical locations, a premise for any protagonist, two adventures on one plane, the Door of Doors, daily rounds, an accusation the player builds | OWN-34, OWN-36, OWN-37, OWN-38, GTR-26, GTR-27, GTR-X20, GTR-X21 | Deferred, unverified since 8 Nov | P3 | later |
| CP-12 | A stately-home murder mystery as a systems test | adventure-to-career §10 | Direction (11 Nov) | P3 | M21 |
| CP-13 | Five notices at the inn on the first evening, each read on its own | M19-169 | Deferred, unverified since 8 Nov | P3 | M21 |
| CP-14 | The wagoner's ask answerable from the talk, not only from the cart under Look… (every road meeting) | M19-171 | Deferred, unverified since 8 Nov | P3 | M21 |
| CP-15 | Prose promises that cannot be met: things named in a place cannot be taken (a candle-end, a rope); a den's mouth with no inside (29 of 29 dens one room); interiors with no gate guards; letters read at midnight without a light | UNT-101, UNT-102, UNT-106, UNT-125 | Open risk, unverified since 6 Nov | P2 | M21 |
| CP-16 | Long aspirations: the Star-Readers' sky, a world that changes on its own, physical interaction from properties, a material world, rare Manuals, reinterpretation, a bounded battle, grand strategy, an ensemble, silent speech, alignment, temperature, giant gentry | UNT-115, UNT-126, UNT-212, UNT-222, UNT-239, BRF-47, BRF-48, BRF-49, BRF-52, BRF-105, BRF-108, QIS-01, BTW-11 | Wishlist / deferred, unverified since 6–8 Nov | P3 | later |
| CP-17 | Encyclopedia: modules cannot add entries; geography, histories and institutions thin; kept apart from the journal, with spoiler protection | M19-148, BRF-88, BRF-89, BRF-90 | Deferred / disappeared, unverified since 8 Nov | P3 | later |

## 10. Startup & performance

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| SP-01 | A fresh country starts in 10.1 s headless and 13–20 s in a browser; 5.5 s is parsing ~1.2 MB of generated Kyr, then compiling, checking and structuredClone. Candidates: parse templates once, a compact intermediate form, a generation horizon | E107, E121, H §2.8, M19-49, BRF-11, BRF-65, mem:m20-owner-startup-place-icons §2, mem:m20-owner-headless-investigation §1, mem:m20-owner-before-closure §3 | Improved, open (11 Nov) | P1 | M21 |
| SP-02 | Eager instantiation of distant content (130,826 facts, 30 modules, 23.8 MB checkpoint, ~500 MB RSS): deterministic lazy materialization, proven against eager | E121, headless §1.4, headless rec 2, headless §7 (M21) | Open (11 Nov) | P1 | M21 |
| SP-03 | Reuse compiled module and operator definitions across sessions; cache one player frame per response | headless rec 1, headless rec 3, E121 | Open (11 Nov) | P2 | M21 |
| SP-04 | One three-country run stalled past five minutes, once; not explained | E107 | Not explained (11 Nov) | P2 | M21 |
| SP-05 | No measurement on a real iPad or under Safari/WebKit; play never verified on a real tablet | UNT-118, BRF-16, E107 (owner's iPad report) | Open risk, unverified since 6 Nov | P1 | M21 |
| SP-06 | Planner scaling under denser agency: per-actor budgets, adaptive horizons, benchmarks on high-agency worlds | R7, E133, H §2.10 | Open, homed M21 (11 Nov) | P2 | M21 |
| SP-07 | The glance's 8 ms budget (glance-kite) against wider per-facet perception | H §2.3, mem:m20-state-nov11-late | Constraint (11 Nov) | P3 | M21 |
| SP-08 | Choices grounded afresh in every new world (22 ms in the frontier): never carried after M16 | COR-15, UNT-119 | Dropped, unverified since 6 Nov | P3 | later |

## 11. Architecture & risk

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| AR-01 | R1: campaign orchestration in one class; explicit command phases; lifecycle assertions around command and rollback; golden lifecycle traces | R1, E133, H §2.10 | Open; the review's immediate list was put in M21 (11 Nov) | P2 | M21 |
| AR-02 | R2: process-global catalog kinds and a serial load queue; per-campaign catalog state; two campaigns sharing a module break each other | R2, ARV-H7, COR-04, UNT-237, E90 | Open risk (11 Nov) | P2 | M21 |
| AR-03 | R3: cache invalidation by convention across memo layers; cache and load telemetry; cache-on/cache-off differential tests | R3, E133, H §2.10 | Open (11 Nov) | P2 | M21 |
| AR-04 | R4: shared operator and schema structures mutable by convention; deep-freeze in development | R4, H §2.10 | Open (11 Nov) | P3 | M21 |
| AR-05 | Remaining text inference in the page: talk roles, reading acts, "too dear", seen-through and level moments, panorama, harm on arrival, the fight's turning points, an aim's places, "Against X", note labels; closed word lists in general code | text-inference.md, H §2.1, E123 (left), ARV-M4, BRF-98, mem:m19-owner-architecture-review (P0 typed contracts) | Open (11 Nov) | P1 | M21 |
| AR-06 | One exported PlayerHost/PlayerFrame facade; nested PlayerSnapshot vs Screen/Leaf/Glance; PublicChoice lacks availability, exhaustion, restriction reasons and provenance | E122 (open part), headless §1.1–1.2, headless §7, mem:m20-owner-headless-investigation §4 | Open (11 Nov) | P2 | M21 |
| AR-07 | Opportunity semantics live under src/ui and src/presentation; move them to compiled authored metadata plus runtime facts; a situation projection from the legal set | headless §1.3, headless §6, SYS-01 | Open (11 Nov) | P2 | M21 |
| AR-08 | ModuleShadow renames by rewriting source text (the parser must mark authored calls first); Kyr manipulated by parsed syntax, never text | M19-69, BRF-86, mem:m19-owner-architecture-review | Open risk (10 Nov) | P2 | M21 |
| AR-09 | Plots and prose in TypeScript: settlement, road, deep-site, market and fellows writers; the undertown's structure in engine code; deep-argument.ts; Deem should own the top-level generator | ARV-H4, M19-44, M19-216, BRF-19, user-notes, design-opp 4, headless §6, mem:m19-owner-coherence | Partial / deferred, unverified since 8 Nov | P2 | M21 |
| AR-10 | Party membership has no public lifecycle; two companion systems; preset-party defaults (a trio in WorldAssembler); "Go alone" only in a drawn country; the company cannot divide; a recruit's `at` retracted | ARV-M7, M19-75, M19-105 (remainder), QTC-19, UNT-208, UNT-230, BRF-77, mem:m19-owner-preset-party | Open risk / partial (10 Nov) | P2 | M21 |
| AR-11 | Identity carried in id strings (march-stones, provinces, stretches) | ARV-L2 | Partial, unverified since 8 Nov | P3 | M21 |
| AR-12 | Hidden registries and central edit points (origins, region generators, title list) | ARV-M6 | Open risk, unverified since 8 Nov | P3 | M21 |
| AR-13 | Five composition mechanisms; unfilled placeholders pass silently; .kyrt values unescaped | ARV-M3 | Open risk, unverified since 8 Nov | P3 | M21 |
| AR-14 | Compiler binding-check holes (partial); ability text not equal to execution across the catalog | ARV-A9, ARV-A5, BRF-51 | Partial, unverified since 8 Nov | P3 | M21 |
| AR-15 | Waits are atomic: they do not stop at a warning, arrival or chapter, so a fight is lost inside one wait | M19-239 | Open (10 Nov) | P2 | M21 |
| AR-16 | The setting is coupled into the engine (Imbar's planes, calendar, world shape, encyclopedia) | M19-271, opening-brief backlog | Open (10 Nov) | P3 | later |
| AR-17 | Adding a province re-seeds every generated world | M19-97 | Deferred, unverified since 8 Nov | P2 | later |
| AR-18 | Lowering discards declared intent (a trace sees generated rules, not event transitions) | UNT-128 | Open risk, unverified since 6 Nov | P3 | later |
| AR-19 | One creature pipeline: aliases, corpus verification, variation apart from species, wards and turrets out of species | M19-60, mem:m19-owner-creature-corpus, mem:m19-owner-operational-bestiary, mem:m19-owner-architecture-review | Partial, unverified since 8 Nov | P2 | M21 |

## 12. Authoring (Kyr/Deem)

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| AU-01 | A bounded, current authoring trail: entry points, examples, the path to play, ownership, superseded guides marked, scene and opportunity conventions as built | amendment 7(5), amendment 8, mem:m20-state-nov11 #9 ("page 10 done") | In progress (11 Nov) | P2 | M20 close |
| AU-02 | The Kyr/Deem shells review, as M21 input | amendment 7(5) | M21 input (11 Nov) | P3 | M21 |
| AU-03 | R8: authoring cost drift; cost lint for unbound parameters, weak conjunctions and broad queries; complexity notes for new constructs | R8, H §2.10 | Open, homed M21 (11 Nov) | P2 | M21 |
| AU-04 | Kyr time and state forms: State … when / Retract; a die rolled once; Reset; named clocks and table draws; cycles; computed measures; schedules; tick order and the Slay lag; Set … at the action's end; a change's duration; windows missed by waits; rules a pass late; once-only rules, money, timers | M19-98, M19-128, M19-197, M19-240, M19-248, M19-249, ARV-M2, AUT-09, FWR-05, LOR-09, LOR-13, QTC-14, QTC-A02, QTC-A20, BOF-08, UNT-235, UNT-236 | Deferred / open (8–10 Nov) | P2 | M21 |
| AU-05 | Kyr talk forms: Says again (120 `_again` topics in Quittance); a Topic through a party member; questions with parameters; several-exchange topics; speaking through a window; Known as without its teaching; Seen when hides a person but not their greeting | M19-106, M19-180, M19-258, BOF-24, CTH-05, QTC-A24, UNT-213 | Deferred / open (8–10 Nov) | P2 | M21 |
| AU-06 | Kyr rule and ending forms: endings fire before the step's Observes; chapter order and text by what is carried; rules at time 0 (Wren's greeting); a rule cutting a timed action short; "for all" over members; roles lint | M19-241, M19-262, UNT-129, UNT-204, UNT-209, GTR-21 | Open (10 Nov); UNT unverified since 6 Nov | P2 | M21 |
| AU-07 | People, pursuit and inhabitants: pursuit re-planned each watch; hidden ways; a lasting rout; per-person patience; bargains against warned patience; temperament (Menace, Temperament over Peaceable); Refuge as a wall; positions and history; patrols and escorts; guard ways never written; routes of hunted and hunters; Notices when; merchant resale; immunities; a non-combatant with a species | M19-129, M19-132, M19-194, M19-195, M19-199, M19-200, M19-242, M19-243, M19-244, M19-246, M19-251, M19-261, M19-265, UNT-202, UNT-226, UNT-238 | Deferred / open (8–10 Nov) | P2 | M21 |
| AU-08 | Things and kinds: a lend lint; flame and chart kinds; `_gathered` naming; scenery initial state; abilities in the catalog not all loaded; a module kind cannot be worn; items cannot be tried; nothing kept out of sight; denominations and wages; readable by skill; a carried item others can take; things made in play; counted offers; people fixed at load; per-entity measure tables; container search; charm semantics | M19-93, M19-204, M19-247, M19-255, UNT-114, UNT-127, UNT-210, UNT-224, UNT-225, UNT-229, UNT-231, UNT-232, UNT-233, UNT-234, BOF-33, BOF-34 | Deferred / open, unverified since 6–10 Nov | P2 | M21 |
| AU-09 | Structure, namespaces and diagnostics: state names share the module namespace; a module's kinds and techniques share the catalog's; no Exports; clause order; negative grid coordinates; doors shutting at both ends; crowd size and level containment; conflicting placements unlinted; misleading loader and explorer messages; lint gaps; ending coverage; runtime errors name the rule, not the line | AUT-07, WPC-14, WPC-X04, UNT-243, QTC-A04, UNT-206, UNT-207, M19-196, LOR-16, BOF-11, BOF-16, M19-259, M19-260, TTN-02, UNT-211, UNT-228 | Open risk / open (6–10 Nov) | P2 | M21 |
| AU-10 | Deem: module-local tables, weighted and conditional choice, generated families; draw order re-rolls worlds (undocumented); the Deem dossier → composition kit → Kyr role-binding pipeline | AUT-25, BRF-18, M19-202, headless §6–7 | Open risk (8–10 Nov) | P2 | M21 |
| AU-11 | Missing authoring tools: `kyrie new table` and `new generator`, `kyrie stats` and `info`, a placement report, a backgrounds lister, a simulate readout, author scaffolding with no engine edits | UNT-120, UNT-122, UNT-205, UNT-223, BRF-56, BRF-57, BRF-60 | Disappeared / open risk, unverified since 6 Nov | P3 | M21 |
| AU-12 | The IF review's holistic Kyr remedies (why/trace, typed transformations, affording observations, occasions, rule phases, one knowledge model, dynamic identity, one transaction per command, proven patterns, scale) | IFR-01..IFR-10 | Deferred, unverified since 8 Nov | P3 | later |
| AU-13 | Wapshott's Circus needs: a moving place, a shared town, rooms named for their town, a contest of words, places beyond its towns | WPC-01, WPC-06, WPC-18, WPC-X02, WPC-X09 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| AU-14 | Authorable effects and spell construction (Kyr can teach a spell, not define one) | BRF-81 | Deferred, unverified since 6 Nov | P3 | later |
| AU-15 | About 200 legacy objectives without `toward` still rely on inference from their words | M19 closure §1, M19-225, opening-brief backlog | Open (10 Nov) | P2 | M21 |
| AU-16 | Calling and ancestry data: a dwarf thief refused only after load; halflings not playable; the Wrong Boat's coin tuned to its shipped party | M19-266, M19-267 | Partial / open (author's decision) (10 Nov) | P3 | later |
| AU-17 | Not reproduced, kept for re-check: a catalog kind in an Observe; two `says` in one turn; herald aliasing; encyclopedia links; empty conversational leads | M19-189, M19-190, M19-201, M19-215, M19-235 | Not reproduced (8–10 Nov) | P3 | later |

## 13. Persistence & replay

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| PR-01 | R5: the save schema is `version: 1` with no migration path; a compatibility policy and a fixture bank of historical saves | R5, E133, H §2.10 | Open, homed M21 (11 Nov) | P2 | M21 |
| PR-02 | R6: transcripts tied to the choices of the day; a historical-transcript replay lane, durable command aliases; whole-world digests break kept transcripts | R6, H §2.10, UNT-217 | Open (11 Nov) | P2 | M21 |
| PR-03 | Save size: the downloadable whole game is 22 MB and the raw checkpoint 23.8 MB; one save format and autosave path; a compact save for the terminal | M19-236, E25, ARV-A24, headless rec 4 | Deferred: no obstacle to play measured (10–11 Nov) | P3 | M21 |
| PR-04 | Determinism asserted, not verified: locale-dependent combat AI, one combat stream, unchecked resume | ARV-H6 | Open risk, unverified since 8 Nov | P2 | M21 |
| PR-05 | Client parity covers no fight | E122 (open part), H §2.9 | Open (11 Nov) | P2 | M21 |
| PR-06 | Saving during a fight | BRF-97 | Unverified since 6 Nov | P3 | later |
| PR-07 | "Story after a reload shows only what happened since" | E26 | Not reproduced (10 Nov) | P3 | later |

## 14. Testing & CI

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| TC-01 | CI shards unbalanced (shard 4 at 45 minutes against 24); timings refreshed by hand; no scheduled corpus gate | log open queue 6, opening-brief §4, M19-276, mem:m20-state-nov11 #9 | Open (11 Nov) | P2 | M20 close |
| TC-02 | Full CI about 40 minutes; every push to every branch runs it | M19-268, M19 closure §1 | Open (10 Nov) | P2 | M21 |
| TC-03 | Test architecture: content-addressed fixtures, changed-test selection by recorded dependencies, checkpoints for long specs, simulation checks moved out of the browser, a fixture command, phase timings, a trend suite, `kyrie bench` by phase | M19-273, M19-274, M19-275, M19-277, M19-278, BRF-59, opening-brief backlog, throughput review §9, mem:specs-fast-page-objects | Open (10 Nov) | P2 | M21 |
| TC-04 | The safe-zone walk at five sizes in CI; atlas states tested as projected data | H §2.9 | Open (11 Nov) | P2 | M21 |
| TC-05 | The census proves structure, not play: no seven-stage report, no per-world invariants; no per-adventure integration manifests | M19-269, M19-270, opening-brief backlog | Open (10 Nov) | P2 | M21 |
| TC-06 | Consolidation: overlapping tests, obsolete UI paths and heuristics, the verification loop measured | amendment 7(4) | No record of it done (11 Nov) | P2 | M20 close |
| TC-07 | Walkers as a recurring diagnostic (places, sites, interactions, encounters, stalls, repeats, false promises; a few characters and seeds); a cheap public-action gauntlet | amendment 7(3), amendment 8, E100 | Walker runs exist, no write-up or gauntlet recorded (11 Nov) | P2 | M20 close |
| TC-08 | Spec harness affordances: group positions, forced dice, `Journey.reached`, party size in a test, fixture module paths, the `>` router's reasons, the spec clock, stub campaigns | M19-131, M19-179, M19-184, M19-203, M19-206, M19-257, BOF-30 | Deferred / open (8–10 Nov) | P3 | M21 |
| TC-09 | Adversarial-order quest tests across adventures; acceptance tests for urgency, journey density and restraint | REV-21, IND-07 | Partial, unverified since 8 Nov | P3 | M21 |
| TC-10 | Tests teleport rather than journey | COR-18 | Open risk, unverified since 8 Nov | P3 | M21 |
| TC-11 | Long-horizon verification with trace minimisation; boredom and pull measured | BRF-63, BRF-64 | Disappeared / superficial, unverified since 6 Nov | P3 | later |
| TC-12 | CI on 7f392f0b (and 13441a49) failed only the handbook browser spec, which passes locally | **fixed**: its cases had bun's five-second default; a loaded runner timed the first out and the browser closed under the rest; each now has a minute | P3 | — |

## 15. Docs

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| DC-01 | The handoff is a draft: §4 is empty, and the register is to be reconciled against the implementation, with each row resolved or deferred with a reason | H, amendment 7(4), amendment 7(7), amendment 8 | Draft (11 Nov) | P1 | M20 close |
| DC-02 | The 74 UNT gap rows were never entered into any mission register, as gaps.md asked; no M19 or M20 document cites them | findings/gaps.md, findings/index.md | Not carried (checked 11 Nov) | P2 | M20 close |
| DC-03 | R10: a drift review at each closure; a current-invariants appendix; doc freshness checks | R10, H §2.10 | Open, homed M21 (11 Nov) | P3 | M21 |
| DC-04 | Undocumented facts: the country marker is unique across provinces; a topic can charge the purse; Guards; Deem draw order; plant `_gathered` naming | M19-264, M19-202, M19-255 | Open (10 Nov) | P3 | M21 |
| DC-05 | Fixed rows never re-proved after redesigns (PT-09, PRE-03, PT-42, NAV-12, M17's UI rows) | UNT-130 | Open risk, unverified since 6 Nov | P3 | M21 |
| DC-06 | The builder edited twelve authors' adventures with no notice in their own documents; the Parliament of Books' friction never registered | UNT-131, UNT-201 | Open risk, unverified since 6 Nov | P3 | M21 |
| DC-07 | The Living Design Atlas reconciled with the Aesthetic Doctrine, superseded design documents marked; the M15–M17 briefs missing from the repository | BRF-50, findings/briefs.md | Disappeared, unverified since 6 Nov | P3 | later |
| DC-08 | inherited.md cannot be regenerated from its sources (the closure table is not written by the generator); an uncommitted owner change was said to cure it | findings/index.md §1 | Unverified since 6 Nov | P3 | M20 close (check) |

---

## Owner directives possibly unmet

From the memory notes and the log's amendments. "Possibly" means no source records them done; this is not proof
they were not done.

1. **Human acceptance.** PD-14's five cold players, asked since M19, have not been run, and round 7 on the deployed
   build, required before closure (11 Nov evening), has not been run either. Owner: "M20 not closed because the
   defect list is shorter" (FH-01, FH-02).
2. **Review the two branches carefully, integrate what verifies, document the deferred conflicts** (m20-owner-before-closure
   §5). These are `adventure/fs-integrate` and `claude/great-hamilton-xr4iyo`. All that exists is a scratch commit,
   `7386d608` on `review/fs-integrate` ("not for main"). Neither branch is an ancestor of HEAD, and no document
   records the outcome.
3. **The map's panel hierarchy**, including "Explore nearby only where real" (m20-owner-map-panel-hex-kits). It is
   first in the log's open queue, and no row closes it (NM-02).
4. **Map labels at the edge must stay selectable**, never faded into inaccessibility (m20-owner-before-closure §2).
   E130 keeps them inside the safe zone and selectable; their crowding on a phone is still open (NM-03).
5. **Amendment 8:**
   - the silver walker's danger scarcity written up (frequency against balance);
   - bounded first-hour danger;
   - walkers kept as a recurring, recorded diagnostic over several characters and seeds.

   No write-up is found (CB-08, TC-07).
6. **Amendment 7:**
   - (3) a cheap public-action gauntlet;
   - (4) consolidation: overlapping tests, obsolete UI paths, the verification loop measured, stale documents;
   - (5) the authoring trail is only "page 10 done";
   - (2) creation's skills, background and spells made clear and useful.

   None is recorded as done (TC-06, TC-07, AU-01, FH-12).
7. **CI shards rebalanced** (shard 4 at 45 minutes) is in the open queue and also in the opening brief, and has not
   been done (TC-01).
8. **Atlas synthesis, "M20 now" item 5:** verify the existing character-specific perception in real play. There is
   no record (AP-12).
9. **Acceptance defects B6:** replay through both the headless projection and the rendered screen, narrow viewports
   included, checking that text, objective focus, map signals and next choices agree. The pieces exist
   (client-parity, safe-zone-browser), but no combined replay is recorded.
10. **User notes of 10 November:**
    - "remove Map from the top rail". E70 kept the rail's Map deliberately (cold players leaned on it), and E104 moved
      the rail to the foot. This is a builder decision against the literal ask, not yet confirmed by the owner.
    - "Travelling absolutely has to reveal the landscape you're passing through", and "a chance of encounter at every
      hex". E70 covers pace and rations only; the per-hex encounter is a deferred design opportunity (NM-06).
11. **Directives from M19 deferred into M20 with no M20 record:**
    - Notes and Story split (M19-228) and POV-bound narration (M19-229): m19-owner-stabilization-nov9;
    - talk as 3–4 salient topics with progression (M19-227): m19-owner-interaction-flow;
    - one metropolis composed by several adventures (M19-77/107): m19-owner-experience-pass;
    - OSR mechanics beyond breath (M19-81): m19-owner-osr-mechanics;
    - a two-company preset-party proof (M19-75): m19-owner-preset-party;
    - typed ModuleShadow (M19-69) and PD-08: m19-owner-architecture-review;
    - unified design foundations (M19-231): m19-owner-opening-and-foundations;
    - journeys A–D rendered (M19-173);
    - Common names from a true common tongue (OWN-41): m18-owner-portraits-names-2.
12. **Opening-brief blockers with no M20 record:**
    - jobs found without an aim (M19-234);
    - authored-country hex rule decided country by country;
    - the knowledge-boundary test (M19-272).

    The other first-hour blockers it named (M19-233 plunder, M19-170 light) are closed by E2/E3 and E43/E79.
13. **The findings reconciliation's instruction** that each UNT gap row "wants a row in the register of the mission
    that takes it up" was never carried out (DC-02).

## 16. From the adventure branch (`adventure/first-steps`, 11 November) and round 7

Carried from that branch's `doc/architecture/activation/kyr-deem-requests.md` (R1–R95, triaged) and `handoff.md`, read
on 11 November. The branch itself is not merged: the owner is not ready to integrate it.

**A scratch merge was verified in part.** `adventure/fs-integrate` was merged onto main at 33cf0777 as 7386d608 on
`review/fs-integrate`.
- Conflicts: one, the wren trace's transcript.
- Passed: typecheck, the Kyr lint and the quick suite.
- Its own specs that passed: arcology 41, authorable-generation 2, Bound Howe 40, neighbours 9, outskirts-deep 7,
  roadstation 10.
- Not run: the Silent Lord's specs, standing-modules-found, ties, troubles, and main's key specs on the merged tree.
  It must be merged again onto current main when the owner wants it.

| id | item | sources | status | severity | home |
|---|---|---|---|---|---|
| AB-01 | A killing blow told by the 1 its mark had left, not its weight | R81 | **fixed** 5d55fbad (test/fight-told-once) | P1 | — |
| AB-02 | Wounds never told; the written "hurt" lines never said | R82 | **fixed** 5d55fbad (Barks.wounded) | P2 | — |
| AB-03 | A creature's damage does not grow with its level (a level-12 mummy's 1d4) | R83 | open | P2 | M21 |
| AB-04 | The CLI and journeys fight a whole fight in one step; a fallen company is left with nothing offered and no ending | R80 | open | P2 | M21 |
| AB-05 | A dark room does not say that a light is cheap or where it is sold | the branch's handoff §5 | open | P2 | M21 |
| AB-06 | People and bands that move on a clock (Route/Pursuit on a person) | R41, R54, R89, R32 | open | P2 | M21 (authoring) |
| AB-07 | A scenario reading and moving the first town's own people | R37, R38, R85 | open | P2 | M21 (authoring) |
| AB-08 | Band against band; bands that lose members | R92, R93, R94 | open | P2 | M21 |
| AB-09 | A calling-specific read of a scene; a check against a crowd | R90, R95, R87 | open | P2 | M21, with the atlas's build-dependent perception |
| AB-10 | Topics that change on repeat (98% of the first town's are `once`) | R60, R46, R57 | open | P2 | M21 |
| AB-11 | A scenario's reach beyond its seat (members in other towns and countries) | R72, R73, R74, R31 | open | P3 | M21 |
| AB-12 | A Deem template that invokes Kyr (a drawn fact selecting an authored section) | R75, R29, R55 | open | P2 | M21 (authoring) |
| AB-13 | Specs that choose which standing scenarios a world holds | R88 | open | P2 | M21 (testing) |
| AB-14 | Declarations that fail late: shared relation names, a new site kind needing three edits, a module without milestones | R42, R39, R59 | open | P2 | M21 (authoring) |
| R7-01 | Torches die in the middle of an act, and nothing says so | round 7, L 84, 96 | **fixed** (E145) | P2 | — |
| R7-02 | Fights trivial with a warrior in the company; a bard "barely played" (lore, Charm Person, gliding never came up); a speaking castellan with no way to answer | round 7, L | **in part** (11 Nov night): the castellan can be answered (E150); fights and a bard's other gifts open | P1 | M21 (with CB-01) |
| R7-03 | Go… lists every place in town as "20 minutes"; the conversation log grows without end | round 7, L | **fixed** (11 Nov night): true minutes (E149), the log folded (E151); the list still flat | P3 | M21 |
| R7-04 | A town known only by report has no route line before setting out (the owner's rule of 29 October: heard of is a marker only); both players missed one | round 7, K, L | by design; worth the owner's look | P3 | owner |

## 17. Integrating the adventure branch (12 November, early)

**Verdict (12 November, early): verified, not merged.** See `mission-20/integration-first-steps.md`. The review merge with its repairs is `review/first-steps`; CI on 1fc62c34 still fails 18 or more specs, several on decisions the owner has to make (whether the standing modules stand in the first town; whether the forged seal's receipt or the notice of jobs leads there).

The branch's own integration notes (`activation/integration-notes.md`, at 98ad43eb) and what the scratch merge on
`review/first-steps` found. Its rows are open until the merge is on main.

| Id | What | Source | Status | Pri | When |
|---|---|---|---|---|---|
| AI-01 | The thorn long descent fails at choice 62: the first town's shop stock was redrawn when the standing scenarios came in | integration notes §1 | open: re-record `test/fixtures/descent/thorn.choices` once the draws settle (CI's long descents) | P2 | M20 |
| AI-02 | `silent-lord-turns`' "forged remission" fails when rain puts a ford in spate (`Journey.way` ignores `hazardous`) | integration notes §1 | open | P3 | M20 |
| AI-03 | The new specs have no time in test/timings.json (several take 5 to 15 minutes) | integration notes §1 | open: `scripts/timings-from-ci.ts` after the first CI run with them | P2 | M20 |
| AI-04 | The first green is busier: 3 to 4 more people and about 170 to 190 more words on arrival (four seeds measured), the Walk's unchanged well, post, shrine and gate told as "as it was" (now silent), and a newcomer who reads everything takes 46 commands to an adventure in mere (24 before) | the scratch merge | in part: the Walk's baseline lines silenced; portraits stay capped at ten; the newcomer's bounds widened with the reason | P1 | M20 (judge in cold play) |
| AI-05 | The Bound Howe's lead is held to day 3 so the honest start still goes under the town | integration notes §1 | the branch's decision, kept; the owner's to move | P3 | — |
| AI-06 | R96 (rotating the altered-law provinces per world) and R97 (retiring `oldcoin` and `quarrel`, which the wanderer origin's arrivals name) | integration notes §5 | open, M20's first hour is touched by R97 | P3 | M21 |
| AI-07 | Cold play on the branch: one of three blind players entered a new module; none played one to an ending or fought its dangerous opponents | final report §3 | open: the round after the merge should try one | P1 | M20 close |


## 18. The creative and technical direction review (11 November, night)

An independent read-only review the owner passed on (`2026-11-11-direction-review.md`, kept whole). Its items are not
new rows where the register or the forward-design record already holds them: each is linked to where it lives, with
what Mission 20 did toward it. Its recommended path (one dense opening, one exemplary undertaking, trust contracts
first) is consistent with the adventure-to-career direction and the forward-design record's sequence.

| Review | What | Lives in | Mission 20 | When |
|---|---|---|---|---|
| C1 | One repeatable unit of play (evidence → plan → resistance → consequence → new possibility), proven by three contrasting characters | FH-01; forward design | — | M21 |
| C2 | The atlas over-classifies: known, suspected, uninterpreted | forward design A; atlas synthesis | — | M21 |
| C3 | Character perception must not become class-gated content | R7-02; forward design A | the castellan answered two ways (E150) | M21 |
| C4 | Approaches from ordinary acts, not isolated commands; a situation checklist | AP-07; forward design (situations) | — | M21 |
| C5 | Origins create obligation before curiosity | adventure-to-career §1 | — | M21 |
| C6 | Background revelation bounded, triggered, permanent | adventure-to-career §3 | — | Later |
| C7 | Companions as equipment; the protagonist made irrelevant by a warrior | R7-02, CB-02 | — | M21 |
| C8 | Combat dramatically thin: objectives, pressure, interruptible intentions | CB-02, CB-06, CB-08, R7-02 | — | M21 |
| C9 | Forecasts as bounded reasoning with causes, calibrated | CB-02 (E14, E110), E139 | the lone company's forecast (E139) | M21 |
| C10 | Consequence proportional to prominence | US-02, E111, E118 | the map's box, the sister, the castellan, the wagoner (E142, US-01, E150, WM-03) | M21 |
| C11 | Rewards that enlarge play: means, access, standing, understanding, attachment | US-02 | — | M21 |
| C12 | Busy rather than alive: relevant agency only | forward design notes (institutional plans) | the adventure branch's clocks (§17) | Later |
| C13 | Causal dossiers before generated mysteries | forward design notes | — | Later |
| C14 | Tonal centres per situation | NP-01, NP-04 | — | M21 |
| P1 | A promoted choice is a promise: a false-promise corpus | AP-01 (R9) | test/gold-walk, test/gold-follow, test/gold-thread (E153, E154) | M20 started; M21 to complete |
| P2 | Three-level navigation; never an empty scene with a way out | AP-07, E136 | ways opened led (E136); places in the hex not left across country (E155) | M21 |
| P3 | Stable control positions | UI-01, E136 | the rail's fixed slots (E136) | M21 (layout test) |
| P4 | Paintings that contradict the text | CP-01; handoff §3 | the fort's room (E140); the list for the owner | M21 |
| P5 | Colour vocabulary exceeds comprehension | atlas synthesis | — | M21 |
| P6 | Too many aims dilute commitment | E153 | gold only for the aim followed (E153) | M21 (leads, curiosities apart) |
| P7 | Search as an interface tax; decision context before irreversible choices | AP-08 | the riddle door's words never gold (E154) | M21 |
| T1 | `Affordances` as a parallel semantic engine: a strangler path by provenance | text-inference.md; forward design | what an act advances typed by its effects and resolution (`AimAdvances`, E154) | M21 |
| T2 | `Why`, aspect and presentation separated | forward design A | — | M21 |
| T3 | Author semantic claims, not colours | forward design A | — | M21 |
| T4 | One sign-based perception contract | forward design A, notes | — | M21 |
| T5 | Durable opportunity identity | forward design D/E | — | M21 |
| T6 | A meaningful-outcome contract | forward design (prototype 1's effect gap) | — | M21 |
| T7 | Command lifecycle phases and assertions | risk review R1 | — | M21 |
| T8 | Projection cache on/off differential | risk review | — | M21 |
| T9 | Process-global catalogs | risk review R2; forward design C | — | M21 |
| T10 | Save compatibility policy and migration | risk review R5 | — | M21 (before schema growth) |
| T11 | Replay identity apart from wording | risk review (replay lane) | — | M21 |
| T12 | Planner budgets | risk review R7 | — | M21 |
| T13 | Authoring legibility lint | risk review R8; AB-14 | — | M21 |
| T14 | Typed art query with provenance | CP-01 | — | M21 |
| T15 | A contract corpus as the constitutional suite | M19 verification loop; forward design | the thread and gold specs are its first entries | M21 |

## 19. The owner's player report (12 November)

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| PR-01 | Gold loses its thread: on the ways and the looking at once, on aims not chosen, out of a place and back | **fixed in the rules** (E153, E154): gold only after Follow this, on the one next step; what an act makes so is typed by its effects and resolution; surveyed over eight origins in two worlds (10 of 13 see the aim through or pause at a danger). Open: the order past the riddle door, a1's debt sent back to the keep (the keep counted idle), the wanderer with no errand to follow | P0 | M20 / M21 |
| PR-02 | Choosing a place in the company's own hex walked it out of the town | **fixed** (E155): never across the country to a place in its own hex; not seen rendered | P0 | M20 |
| PR-03 | The route preview no longer shows before setting out | **not reproduced headlessly**: every destination offered from the debt's opening has a course (/var/tmp/kyrie/m20/tools/preview.ts); a rendered check is round 8's | P1 | M20 (verify) |
| PR-04 | A blue pip with no blue reply; a green Look with no clear collectible | **fixed** (E156): replies that teach are typed and marked; the Look list marks the thing it is lit for; not seen rendered | P1 | M20 |
| PR-05 | Follow this too heavy | **fixed** (E153): a quiet word, gold only on hover | P2 | M20 |
| PR-06 | Names of the opening from mixed tongues | **finding, not changed**: towns are Common (dwarvish in a dwarf country: right); countries are Old English (Merscfaenn, Faennmeós, Muntecg) over Common towns; the makers' works are pseudo-Latin compounds (Dolorechies, Umidusspira, Tenebraetumulo, Nocscustod) and reach the first fifteen minutes as places to set out for (/var/tmp/kyrie/m20/tools/names.ts, five seeds). Proposed rule: a work is known first by the townsfolk's Common name, its makers' name learned (the alias mechanism already does this for a place's look), and a human country's name is Common. Renames places dozens of specs walk to: not tonight | P2 | M21 |
| PR-07 | Creation's order unchanged; the pack has no physical model | deferred, as the owner asked; an equipment model kept as a requirement (body positions, containers, transfer) | P2 | M21 |
| PR-08 | Following an aim, the scene leads with its one gold way, and the way up or back is only under Go…, a step at a time (round 8, M; N: "a different single exit each time"). **Again in round 9, both players:** Q's crypt offered no "Up", only Go…'s "↑ Churchyard"; P in the bailey and the outlaws' fort saw only "fight" or "further in", and felt penned in after a flight that succeeded | **open; one try reverted**: a lowest-tier reason for a way up or out, filling a spare place, made the gold walk circle (a company with no gold before it was led out, and the gold led it back three times). Three cold players in two rounds now: a recurring finding. The owner's settled contract keeps navigation off the resting scene (ways under Go…), so this is the owner's to decide: whether the way back is always on the scene beside a way in, or Go… made more evident. The scene's quiet design and its navigation want deciding together (the review's P2) | **P1, recurring** | M21 (decision) |
| PR-09 | Aims that end without "seen through": the vault's aim, the rats job paid (round 8, M) | **open**: "seen through" lists only what gave experience under that name; ended aims are not kept, and keeping them changes the save | P2 | M21 |

## 20. Round 9's cold play (12 November, night)

Two agents on 505b002a, reports in `mission-20/cold/round-9/`. Fixed in the log: E173 (the gold at a keep's door, P0),
E171, E174, E175, E177, E178, E179. Open:

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| R9-01 | The crypt aim dead-ends at the man with the black candle: one persuasion try, then "beyond you"; what the company learned (the dead held only while the candle burns; the warding line left out) cannot be acted on, and an unprepared Charm Person is not offered (Q 69, 135) | open: content; a lore-made opening (put out the candle, show him the mistake) wants writing in the undertown's crypt | P1 | M21 |
| R9-02 | Peren's lodger, "out after dark with grave-dirt on his boots", is never found; a night watching the churchyard says "Nothing comes" (Q 61, 131) | open: a promise the world does not keep | P1 | M21 |
| R9-03 | Blue pips on people the company has not met promise something; talking gives a quip, and the pips walk on to the next unmet face (Q 29, 39, 41) | open: perception design (the atlas's blue as "not yet spoken to") | P2 | M21 |
| R9-04 | The travelling circus's ring of wagons is drawn with houses on the map, beside the company, and read as a town; "Enter Lowmouth" set the company down in Wapshott's ground, a field outside it (P 91–96) | open: the circus as a settlement-like mark | P1 | M21 |
| R9-05 | Several rounds pass on one press while the company cannot act (knocked prone again and again): 14 to 2 hit points unseen (P 167–171) | open: the turns lost want telling one by one, or a pause where the player's turn is lost | P2 | M21 |
| R9-06 | A fight's status against its log: "shrugs off the armor shred" while Armor Shred shows; "Vigorous for 5 turns" gone after one; a bite for 0 leaves Bleeding (P 78, 166, 168) | open | P2 | M21 |
| R9-07 | Text against state: the crypt's stone door "is locked" after the company came through it with the key; "Since you were last here: the portcullis is wedged up" of the company's own doing; the wolves' "a few minutes, no more" for hours (P 54; Q 66, 74) | open: with NP-01 | P2 | M21 |
| R9-08 | "Something is going on here" over a milestone and asters, the event behind a small link (P 142) | open | P2 | M21 |
| R9-09 | Gold on hiring (Q 54b) and on the way back out (Q 87, 104); two gold at once in the Go list and on the two glyph tries (P 29, 62) | open: with PR-01's rules | P2 | M21 |
| R9-10 | The widow's aim (Sir Hamo) never had gold or a route (P 113–154); Sir Hamo has no talk at all, only Attack, Call out, Leave | open | P2 | M21 |
| R9-11 | "Take your leave" after hiring reopened the hireling (the portraits re-ordered); number keys silent while the Look panel is open; a spell's name not clickable in the spell modal, and which spell is prepared not shown (Q 10–11, 56, 65) | open | P3 | M21 |
| R9-12 | Paintings against the text: an intact sunny castle for a ruined bailey, a sunny churchyard at night, iron pipes in a medieval drain, the keep's star banner at the outlaws' fort (P, Q) | open: with the painting list | P2 | M21 |
| R9-13 | Sleeping "long, under a roof" at 11 a.m. ends the same evening; the wait panel offers to sleep until 3 p.m. at night (P 149; Q 128) | open | P3 | M21 |
| R9-14 | The toolbar has no hover hints (Q 30) | **not a defect**: every rail button has a title; the agent's harness does not hover | — | — |


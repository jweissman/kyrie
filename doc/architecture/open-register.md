# Westernesse: consolidated open register

Compiled 11 November 2026, read-only, from the repository at `/var/tmp/kyrie/wt-m20` (main plus local commits through
`33cf0777`) and the owner's checkout for the risk review. A draft for the M20 handoff. It is not a disposition. It
claims nothing beyond what the sources say.

**Sources read**
- `doc/history/missions/20/`:
  - log.md: amendments 1–8, the open queue, rows E1–E133;
  - handoff.md (draft), text-inference.md, user-notes.md, opening-brief.md;
  - opportunities.md, design-opportunities.md, amendment-6.md, opening-design.md;
  - cold/round-1..6: every report's "Top five problems", and round 6's §4–§17 in full.
- `doc/history/missions/19/`: closure.md, register.md (all 297 rows), inherited.md (145 rows; it reconciles
  M18's wishlist, which itself carried M17 and M16).
- `doc/history/missions/17/ahead.md`; M18 register (OWN-07 only).
- `doc/history/findings/`:
  - index.md: confirms M16 → M17 → M18 → M18 wishlist → M19 inherited was carried id by id;
  - gaps.md / gaps.tsv: 74 UNT rows never registered;
  - briefs.md: 109 BRF requirements.
- The 9 November reviews (stabilization, quest-intent, throughput). Their recommendations were carried as
  M19-239..283, and are cited through those rows.
- 2026-11-11-adventure-to-career.md, headless-rpg-investigation.md, capability-audit.md.
- `/home/jweissman/work/kyrie/doc/history/missions/20/architecture-risk-mediation-2026-11-11.md` (R1–R10).
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
| FH-01 | No person has accepted the first hour: PD-14's five cold players have never been run | PD-14, BRF-01, BRF-14, BRF-40, opening-brief §5, opening-design.md, H status, M19 closure §1, mem:m20-owner-before-closure §6 | Open (11 Nov) | P0 | M21, owner |
| FH-02 | Round 7 cold play on the deployed build not run; handoff §4 empty | H §4, log amendment 8, mem:m20-state-nov12, mem:m20-owner-before-closure §6 | fixed: two cold players, reports in `history/missions/20/cold/round-7/`; served locally, never the deployed build (R10-06); a process fix · was: **Done, but served locally, not on the deployed build** (11 Nov night; E134): two cold players, K and L, on fa374a83; the deployed build itself was never played by an agent (see R10-06); reports in cold/round-7/, handoff §4, log E134–E143. Agents' ratings, not acceptance (FH-01 stays open) | P0 | M20 close |
| FH-03 | Opening thin on replay: origin errands lose momentum. Owner directs a dense in-medias-res opening and wants the rats job dropped as the required first mission | H §3, adventure-to-career §1, user-notes, design-opp 1–2, M17-21 (feverwort errand ends in three actions) | Direction recorded, not built (11 Nov) | P1 | M21, playability |
| FH-04 | With no aim followed, the page never points to the town's notice of jobs; the closure fix was reverted | M19-234, opening-brief §1, M19 closure §1 | **Checked 11 Nov**: with no errand (kahitude, the wanderer), the green leads "Read the notice on the well-post" among its few acts; from the town's other rooms nothing points to it in particular (its unvisited ways are led). Kept open at P2 for the case of an errand finished elsewhere in town | P2 | M21, playability |
| FH-05 | Aims pile up (9–10 on day 1), a 27-rumour list, finished things linger as leads | E12, R1-A top3, R1-B top4, R2-A top2, R2-B top4, R3-C top3, amendment 2(2) | Partly fixed (11 Nov) | P1 | M21, playability |
| FH-06 | Go… from the first place lists five places and not the town; Go… itself unchanged | E13 | Partly fixed (11 Nov) | P1 | M21, playability |
| FH-07 | The landing's column still runs past the fold with the new aims | E5 | Partly fixed (11 Nov) | P1 | M21, playability |
| FH-08 | The town's threads not tied (the inn names Seolforfyrd without the hobs) | E4 | Partly fixed (11 Nov) | P1 | M21, playability |
| FH-09 | Warrior led to wrench off the corn-store hasp whose key Tuck holds; who unlocks the corn-store is hard to find | E6, mem:m19-owner-play-feedback-nov6 | Open (11 Nov) | P2 | M21, playability |
| FH-10 | Creation: the weapon screen's labels are still open | E30 | Partly fixed (11 Nov) | P2 | M21, aesthetic |
| FH-11 | Bless picked at creation was not among the prepared spells; Mage Armor could not be cast before a fight | R6-I §17, R3-C top2 | **In part** (11 Nov night): not a fault in preparing: a first-level cleric has one slot, and the first spell chosen fills it (Spellcasting.fill, probed). The spell sheet now says so, and that any other can be prepared in its place with an hour's study under Wait; not seen rendered. Mage Armor cast before a fight (world-side casting into the fight) is M21 | P2 | M21, rules |
| FH-12 | Creation's skills, background and spell choices to be made clear and useful early (amendment 7(2)); a trade's gear and skills never come up (prospector's shovel, dungeon-delver's digging) | amendment 7(2), R6-I §17, R6-J §17 | No completion recorded (11 Nov) | P2 | M21, aesthetic |
| FH-13 | A caster cannot find how to get spells back; the inn's bed still sits under Trade › Services | E93 (in part), R5-G top2, R5-G top4, R5-H top5 | In part (11 Nov) | P2 | M21, playability |
| FH-14 | The pack omits lit lights and oil; waiting does not heal and nothing says so; herbs unexplained; rest and food opaque | E18, R1-A top5, REV-14 | Open (11 Nov); REV-14 Partial, unverified since 8 Nov | P2 | M21, aesthetic |
| FH-15 | Talk is topics, not an exchange: the first hour's three or four people should hold an exchange with progression; a substantial NPC verified | M19-227, opening-brief §1, BRF-61, mem:m19-owner-interaction-flow | duplicate of R11-02 | P1 | see R11-02 |
| FH-16 | Topics reorder after every question; key threads hidden under "Something else…", which often holds only "ask again" | R6-I §6, R6-I top5, R6-I §4 (Indira), R4-E top1, E148 | **In part** (11 Nov night, E148): shown led first, then in written order; a fold of only asked things is "Ask again…"; not seen rendered | P2 | M21, playability |
| FH-17 | Nobody but family can be asked about the main story; greetings copied word for word between people | E46 | duplicate of R11-02 | P1 | see R11-02 |
| FH-18 | Generated talk does not know a calling (no fence for a thief, the same priest for every calling) | M19-141, BRF-76, SYS-06 | Deferred, unverified since 8 Nov | P2 | M21 |
| FH-19 | Ancestry and background barely register; no per-member ancestry or background fact; perception by background | E35, R2-B top3, R6-I §17, M19-181, M19-17 (remainder) | Partly fixed (11 Nov); M19-181 Open (10 Nov) | P2 | M21, playability |
| FH-20 | Nothing can be given: the Gaffer's "pretty", the necromancer's book to Indira, grave rings back | E27 (Give open), R2-A top5, R6-I §15 | Open (11 Nov) | P2 | M21, playability |
| FH-21 | A talker's gifts (Charm Person, Charisma 21) never matter in talk; no bargaining with hirelings | R4-E top1 | duplicate of RI-03 | P2 | see RI-03 |
| FH-22 | Inn bed and ranger specialty remainder (inn bed taken in the morning slept to evening; Set Spear; specialty) | M17-73 | Partial, unverified since 4 Nov | P3 | M21, rules |
| FH-23 | Automation skips the prologue; cold rounds must use `&opening` | E21 | Noted (harness) | P3 | later, lead |

## 2. Combat & challenge

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| CB-01 | First-hour fights trivial: challenge rated 1–2 in every round, most players lost no hit point, high-armour characters never hit, bosses dead in a round | E19, E29, E52, E92, E110 (open part), R1-B top2, R2-A top1, R3-C top2, R3-D top1, R4-F top1, R5-G top3, R5-H top3, R6-I top1, R6-J top2, user-notes (hollow stalker), design-opp 11–12, H §3, amendment 2(4), 5(4), 6(E), BRF-32, BRF-74 | Open (11 Nov) **M21, in part:** a1's 39 hostile groups fought against three small companies (`rules/placements.md`): denned singles in pairs, the vault's keeper the SRD barrow ghoul with its paralysis; 18/13/8 → 11/20/8 trivial/fair/lethal (`placements-a1`, `region-stock-numbers`); those first rows were fought at the tools' numbers, and at real play's (a company of one) the undertown is gentler still; not closed: a balance question. · From R7-02: fights trivial with a warrior in the company; a bard barely played (lore, Charm Person, gliding never came up); the castellan answered (E150). From PL-07: the den's two zombies never land a blow, its leader falls to one hit (placements, rules batches 3–4); the at-will heal is R10-12's. From CB-08: danger thin in ordinary exploration (the silver walker meets one fight in 13 hours; dangers met mostly grave or deadly); frequency to be told apart from balance; bounded first-hour danger; no walker write-up | P1 | M21, rules |
| CB-02 | The fight's reckoning is unreliable: hobs reckoned "hard" never hit (level-one trial variance); the forecast's words still open | E14 (forecast words open), E110 (in part), R6-J top2, R6-J §5 | In part (11 Nov) | P1 | M21, rules |
| CB-03 | A lone first-level mage meets 11 of the 14 first-hour bands as grave or deadly; lone casters and thieves lose standing fights out of town | E74 (mage open), design-opp 10, M19-87, PT-11, SYS-05 | Open (11 Nov); PT-11/SYS-05 Partial, unverified since 8 Nov **M21:** the lone caster or thief is a calling question, decided: no change to the calling (avoid and recruit); every lethal group told at the door, ambush bands too (`deep-sounds-ambush`). | P1 | M21, rules |
| CB-04 | Placed road troubles kill any lone novice who stands and fights, a warrior included (deserters 0.00 / 93%) | UNT-124 | Open risk, unverified since 6 Nov | P1 | M21, rules |
| CB-05 | A failed check is free to retry; there is no `Resolve … once` or `tries N`; a final check is not said to be final; a Topic cannot carry a check; a check's difficulty cannot read a measure | M19-124, M19-125, BOF-09, BOF-10, UNT-112, R6-I top1 | Deferred, unverified since 8 Nov; seen again in round 6 (11 Nov) | P1 | M21 |
| CB-06 | The Gaffer alone on his ledge dies in a round or without a choice | E52 (remainder), R4-F top1 | Open (11 Nov) | P2 | M22 (a balance question, after the challenge table's re-measure decided for M22), rules |
| CB-07 | Sleep/stun traps drop the company into the warned barrow-dead's room: lying still is certain death, no agency | E102, log queue 2, mem:m20-state-nov11 A | **Fixed** (E147, test/sleep-warned) | P1 | — |
| CB-08 | Danger thin in ordinary exploration: the silver walker meets one fight in 13 hours; dangers met are mostly grave or deadly; frequency to be told apart from balance; bounded first-hour danger; no walker write-up | E100, E105, log queue 4, amendment 8, mem:m20-state-nov11 #8 | duplicate of CB-01 | P1 | see CB-01 |
| CB-09 | A bare Take in a warned room can start the fight, and the label does not say the watchers will not wait | M19-252 | Open (10 Nov) | P3 | M21, rules |
| CB-10 | Antidote on a poisoned hireling "to no effect" | E36 (antidote open), E137 | **Fixed** (11 Nov night, E137): the antidote takes away the fight's poison as well as the world's poisoned (test/antidote); not replayed on a hireling | P2 | M20 close |
| CB-11 | A persuaded foe's portrait moves to the company's side (allies or not?) | R6-I §4 (74) | Not in log (11 Nov) | P3 | M22 (P3 and cosmetic), aesthetic |
| CB-12 | Fight bar seen only in the CI tour; the target-chips row did nothing on a phone; "telling blow … for 1"; a fight legible at a glance | M19-226 Partial, R6-J §5–6, BRF-05, BRF-28 | Partial (10 Nov); round 6 (11 Nov) | P2 | M21, aesthetic |
| CB-13 | Odds hidden until after committing; techniques (Second Wind) say nothing | UNT-104 | Open risk, unverified since 6 Nov | P2 | M21, aesthetic |
| CB-14 | A venomous bite has two chances to poison (the damage-triggered save plus the applied poison): a balance question | E114 | Left open (11 Nov) · **fixed** (M21, 13 Nov, the lead's ruling): one chance; where an act lays a condition on by itself, its harm's kind does not also trigger it, held by `test/one-venom` (mutation-checked); fought where placed, placements.md batch 6 | P3 | M21, rules |
| CB-15 | Clues the game sets up (mirror, noonlight jar, torch against the undead) have no use offered in a fight | R5-H top5 | Not in log (10 Nov) | P2 | M21, rules |
| CB-16 | Locks open with no visible roll or tension | R6-J top2 | Not in log (11 Nov) | P3 | M21, rules |
| CB-17 | Long fights with nothing to settle them; no morale or surrender | M19-281, REV-16 | Open (10 Nov); REV-16 Partial, unverified since 8 Nov | P3 | M21, rules |
| CB-18 | A won fight kills and never routs, so Pleads never fires | QTC-A10, UNT-242 | Open risk, unverified since 6 Nov | P2 | M21, rules |
| CB-19 | Climax without weight: XP comes fast, traps are named before found and all answered by the pole, the bier exists only in words, the crown can be taken while the king lives | M19-117, M19-115 (remainder), UNT-109 | Partial (10 Nov); UNT-109 unverified since 6 Nov | P2 | M21, rules |
| CB-20 | Balance instruments: an arena, ability "pawn" tournaments, party gauntlets, combat from a few constants (perhaps in Deem); the bands diagnostic made a spec | user-notes, design-opp 5, design-opp 10, SYS-04 | Idea recorded (10 Nov) | P2 | M21, rules |
| CB-21 | Challenge table measured against a warrior with the dice as they fell; against creation's, 144 of 183 kinds read weaker | design-opp 11 | Left by M20 (10 Nov) · **deferred to M22:** measured again with whatever AB-03's answer changes (srd-invariants.md, "Decided for M22") | P3 | M21 |
| CB-22 | Economy: one delve's coin makes every field cost trivial; no field, expedition or domain tiers; HP growth flattened; treasure with several destinations | REV-11, REV-13, REV-24, SYS-04, UNT-119 (CMB-10) | Partial / open risk, unverified since 8 Nov | P2 | M21, rules |
| CB-23 | OSR mechanics beyond breath and saves (regeneration, monster spells); spell resistance; hit dice as expressions; 24 statuses not applicable | M19-81, M19-150, capability-audit (timing/statuses), mem:m19-owner-osr-mechanics | Deferred, unverified since 8 Nov · **M21 (rules, 13 Nov): in part, held:** hit dice as expressions, their listed average and no growth (`test/srd-hit-dice`); regeneration stopped by a damage kind, and typed immunity, flat resistance and reduction unless an attack's tag (`test/srd-defenses`); attack riders (`test/attack-riders`); a variation as a stat block (`test/srd-variations`). Open: spell resistance and spell interaction, the 24 statuses | P2 | later |
| CB-24 | Party scale: a hazard meant for a company kills a party of one; two Persons in a room are two fights; Level barely moves a flat-challenge species | M19-245, M19-250 | Open (10 Nov) · **deferred to M22:** Level barely moving a flat-challenge species is the same question as AB-03 (srd-invariants.md, "Decided for M22"); the hazard and two-Persons parts stand open | P3 | M21, rules |
| CB-25 | Incapacitated/dead states, carrying the fallen; a six-second round shared with the world clock | BRF-95, BRF-96 | Disappeared / unverified since 6 Nov | P3 | later, rules |
| CB-26 | Combat has exactly two teams | ARV-M5 | Deferred, unverified since 8 Nov | P3 | later |

## 3. Navigation & map

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| NM-01 | No road junctions: a road out goes into a town and back out (16–23 ways a seed, at most 2 hexes); tracks are straight lines | E126 (left), E132 (left), H §2.7, mem:m20-owner-before-closure §1 | Left for M21 (11 Nov) | P1 | M21 |
| NM-02 | Map panel hierarchy: eyebrow, short title from real data, quiet context, particulars, short action; "Explore nearby" only where the hex holds something; panel heading against button; panel covers half the phone | log open queue 1, mem:m20-owner-map-panel-hex-kits, R6-J §4 (164), R6-J §6, M19-280 (header vs card) | **Done** (30d497f8): eyebrow, short title from real data, context, particulars, short Set out, Explore nearby only where the hex holds known places (test/map-browser); the panel's share of a phone screen not re-measured since | P1 | M20 close |
| NM-03 | Map labels at the view's edge: drawn just inside the safe zone and still selectable (E130, 4b5173ec, checked at five sizes); left: "way into…" labels pile up on a phone; "way into…" labels pile up on a phone | E130, commit 4b5173ec, mem:m20-owner-before-closure §2, R6-J §6, R6-J top5 | Open part (11 Nov) | P2 | M21, aesthetic |
| NM-04 | A site in the company's own hex: the town-entry and facet case is not handled | E129 ("not looked at"), H §2.4 | Open (11 Nov) | P2 | M21, playability |
| NM-05 | Hex crossing as a structured action property (scale, novelty, skills, consequences) in a diagnostic view; the journey glyph exists, the rest does not | log open queue 1, opportunities M21 #5, mem:m20-owner-map-panel-hex-kits | partly: the journey glyph only (11 Nov) | P3 | M21, playability |
| NM-06 | Travel as passage: a meeting chance at each hex, what is passed seen, round trips dead time, harmless bats break journeys; no route, camp or supplies decisions | E94, R5-H top2, user-notes, design-opp 7, REV-03, IND-03, SYS-07 | Open (11 Nov); REV-03/IND-03/SYS-07 Partial, unverified since 8 Nov | P2 | M21, playability |
| NM-07 | The map does not say where the drawn atlas ends (nothing west of Thornhaven); geography beyond the first atlas; what a march-stone means on one map | E75, design-opp 8, OWN-80, BRF-55 | Explained, not shown (10 Nov); OWN-80 unverified since 8 Nov | P3 | M21, aesthetic |
| NM-08 | Map: zoom barely changes the view; "You know no way there yet"; the marker under its card; an empty image in the route card; Go there → Market reads as a square | M19-280, M19-116 (remainder) | Open, not re-checked (10 Nov) | P2 | M21, aesthetic |
| NM-09 | Next-door shops said to be twenty minutes away; inside the corn-store every place in town "about 1½ hours" until the padlock was wrenched | M19-282, R6-I §4 (118–122), E149 | **In part** (11 Nov night, E149): every step had been counted as ten minutes; walks and map legs now say the minutes the step spends (test/walk-minutes); the corn-store's 1½ hours not re-checked | P2 | M21, playability |
| NM-10 | Authored countries exempt from the hex rule; to decide country by country which authored walks are journeys | M19 closure §1, opening-brief §3, stabilization review §10 | Open; no M20 record, unverified since 10 Nov | P2 | M21, playability |
| NM-11 | Plans: below-ground and town plans partial; inside a site, ways named as edges not places; PD-03's crown-aim page | PD-09, PD-04, PD-03, BRF-69 | Partial, unverified since 8 Nov | P2 | M21, playability |
| NM-12 | Play as a world moved through, not a command page | M19-46, stabilization review §10 | superseded by CN-01..08 (one stable scene: lenses, compass, the interior walk) | P1 | M21 |
| NM-13 | Five new terrains never looked at; frost, desert and steppe terrain kinds | M19-104, OWN-44 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| NM-14 | The sea: the harbour inland in most worlds, no vessel or sea passage, the Dorothea's calls not islands, voyage as survival | M19-101, M19-102, M19-103, M19-134 | Deferred, unverified since 8 Nov | P2 | later |
| NM-15 | Interior maps: no vertical convention, no room kinds | NVR-20, NVR-21 | Deferred, unverified since 8 Nov | P3 | later |
| NM-16 | Transport services (carter, ferry, paid passage) | UNT-116 | Open risk, unverified since 6 Nov | P3 | later, playability |

## 4. Atlas & perception

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| AP-01 | R9's gate not built: a false-promise corpus from the cold rounds, and tests that styled opportunities map only to legal visible actions or explained states | E133, R9, H §2.10 | partly built: the gold walked by `test/gold-walk` (E146); a signal resolves to an act on the page, held by `small/signals` and `signal-inside` (M21); the false-promise corpus from the cold rounds not built · From R10-03: the atlas's restraint has no test: silver (#D7DBE4) close to the neutral greys, told apart only by the builder's renders; a rendered check of the tones' contrast wanted | P1 | M21, playability |
| AP-02 | Atlas states (full, faint, dim, silver) as projected engine data, not CSS; exhaustion as one projected state so repeatable useful acts never go dim | H §2.5, H §2.9, mem:m20-owner-atlas-synthesis | Open (11 Nov) | P1 | M21, lead |
| AP-03 | Facets from Kyr: no way to mark an act, thing or person uncanny, knowledge or payoff; violet never drawn; a sign has no aspect of its own; rare facets | H §2.2, opportunities gaps 1–2, design-opp 13 | Open (11 Nov) | P1 | M21, lead |
| AP-04 | Distance-sensitive perception: reach only for companionship, and the reach table is code; per-facet reach, provenance, confidence, specificity by distance; perception by calling, not only capability | H §2.3, opportunities gaps 3–4 and M21 1–3, mem:m20-owner-companions-perception §3, mem:m20-owner-atlas-synthesis | Open (11 Nov) | P2 | M21, lead |
| AP-05 | Story-node propagation: a followed undertaking perceived along known places and people; a destination's facets on approaches beyond the town case | H §2.4, mem:m20-owner-atlas-synthesis | Open (11 Nov) | P2 | M21, lead |
| AP-06 | Gregarious (and the Bard's reach) not in the game; the test grants it as a capability | E108, opportunities | Not built (11 Nov) | P3 | M21, rules |
| AP-07 | Key actions one menu deep (slip past the hobs, the Gaffer's ledge, chest contents, a found box, nest, rat-runs, hanging the bell, the crowbar); places only in Go… and not in the scene | E112 (in part), R6-J top1, R6-J §15, R6-I §15, R2-B top2, R5-H top5, R1-B top3 | In part: the foreground came after round 6, to be seen in round 7 (11 Nov) | P1 | M21, playability |
| AP-08 | An opened chest looks empty from the scene; Look… repeats text or lists actions already refused; "Look closely" says nothing in place | E112, R6-I §5, R6-J §4, M19-108 (remainder), mem:m19-owner-playthrough-notes-nov7 · M21 (13 Nov): a box opened tells what is in it ("In the chest on the ledge: a stolen chalice."), and its take names what is taken ("Take a stolen chalice from a chest on the ledge"), held by `test/small/opened-box` (PL-22) | In part (11 Nov); M19-108 Partial; the opened chest's half fixed (M21, PL-22) | P2 | M21, playability |
| AP-09 | The Eye as a deliberate, sustained search with a risk of interruption; perception in three tiers | E120 (assessed, mechanics unchanged), adventure-to-career §9, mem:m20-owner-action-projection §4 | duplicate of RI-02 | P2 | see RI-02 |
| AP-10 | "Offer the heel of a loaf" lost its horse's name somewhere in presentation; the cause not found | E119 | Cause not found; a general "whom" rule added (11 Nov) | P3 | M22 (cause not found; a general "whom" rule added), playability |
| AP-11 | Colour surprises: persuasion red at the ossuary; "You would come there after dark" blue at midnight; a blue action read as knowledge; "Ring the bell" offered in every room to no effect | R6-I §16, R6-J §5, R6-J §14, R6-J §16 | partly: the bell rung only within a hob's earshot, held by `bell-walk`; the colours not re-checked since the strict grammar (11 Nov) | P3 | M21, aesthetic |
| AP-12 | Verify the existing character-specific perception in real play (owner's "M20 now" item 5) | mem:m20-owner-atlas-synthesis | No record (11 Nov) | P2 | M21, playability |
| AP-13 | A way into a room where a deadly band was seen carries no danger (no last-seen record) | opportunities gap 6 | Later (11 Nov) | P2 | M21 |
| AP-14 | Compound opportunities: one subject, several approaches; no authored opportunity naming its approaches | opportunities gap 5, amendment-6 addendum | Later (11 Nov) | P3 | M21 |
| AP-15 | Presentation reads omniscient truth: a foe's exact HP shown in the dark; perception decided in presentation code | ARV-H5, COR-12 | Open risk, unverified since 6 Nov | P2 | M21, lead |
| AP-16 | What each member of the company knows; claims two sources tell differently | UNT-113, IFR-06 | Open risk / deferred, unverified since 6 Nov | P3 | later, lead |
| AP-17 | Ordinary exploration empty: 70 of 80 stretches round Thornhaven hold nothing; meetings sparse away from the start; the first-steps thread's content; half an hour without a quest finds nothing; POI density never measured | E105 (open part), BRF-07, BRF-43, R1-A top5 | duplicate of RI-01 | P1 | see RI-01 |

## 5. Narration & prose

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| NP-01 | Prose against the moment: daylight underground or at midnight, lit lanterns in sealed rooms, a wolf in a sealed room, a dead Gaffer cackling, a door "locked" after passing through it, a trapdoor "weighted with a sack" | E15, E114 (rest open), R1-A top1, R1-B top5, R2-B top5, R6-I §5, R6-J top4, H §3 · M21 (13 Nov): no weather under the ground (Skies.over, test/small/sky); `kyrie lint` gives as advice prose telling the sky under the ground (check `sky`, test/small/sky-lint): nine today, in corrow, lowwater, tallow, ombra and hhg, several meant (light through a gap, stars in a glass floor), for their authors to look at | Open (11 Nov) **M21, in part:** no weather or sky underground (`small/sky`), a module's sky said by lint (`small/sky-lint`), the light that gives out mid-act told (`small/torch-out`); a wolf's line and lit lanterns in sealed rooms not rechecked. · From R9-07: the crypt's stone door "is locked" after the company came through it with the key; "Since you were last here: the portcullis is wedged up" of the company's own doing; the wolves' "a few minutes, no more" for hours. From R10-11: a new aim describing a flag in pitch dark; "You know now: the wire runs…" of a wire never mentioned (the undercroft's letters fixed, E200; what is seen is not learned in the dark, `small/dark-sight`). From R11-07: "By morning the factor's chair is bare" told at once, in the morning, of the wrong inn; Gosse doffing his hat outside, told inside. From T24-16: Odo "has said nothing since the ditch" just after a story; "the dead are laid" with more dead in the next room; a key held and the door still to shoulder; "find where they get in" dropped without a word ("Odo binds the hurt" fixed, PL-09, `small/care`) | P1 | M21, playability |
| NP-02 | Narration not bound to what the company can perceive (parade seen from indoors); unanchored rule words heard anywhere | M19-229, M19-126, UNT-216, opening-brief §2 | Deferred; attempt reverted; no M20 record (10 Nov) | P1 | M21 |
| NP-03 | Notes and Story as two projections over different records; own deeds filed as "told you"; note times mismatched | M19-228, R6-I §6, opening-brief §2, mem:m19-owner-stabilization-nov9 | Deferred to M20; no M20 record (10 Nov) | P1 | M21 |
| NP-04 | Generic voices in the wrong mouths: a tied, crying captive greets with shopkeeper banter and uses Baldric's farewell; a rescued boy says "Now then!" | R6-J §6, R6-J top4, R5-G top5, UNT-110, CTH-09 | Not in log (11 Nov); UNT/CTH unverified since 6 Nov | P2 | M21, playability |
| NP-05 | Prose repeated: the cart twice, a creature named five times, the wagoner's resolution three times, lighting a lantern in three near-identical lines, "the dead … lie dead" | E16 (partly fixed), R6-I §7, R6-J §5 | Partly fixed (11 Nov) | P2 | M21, playability |
| NP-06 | Machine-made topic labels; "Another aim" under ways means nothing; "Something else…" holds only "ask again" | E115, R6-I §5, R6-I top5 | Open (11 Nov) | P3 | M21, playability |
| NP-07 | Engine words left in the fight's telling ("(roll 10)", "Tatterlip"); keys held offering no unlock | M19-121 (remainder), E62, R4-F top3, opening-brief §2 | **In part** (11 Nov night): "(roll N)" only in the dice detail (E127); "Tatterlip" is an authored hob's name. Keys held offering no unlock not re-checked · M21 (13 Nov): a foe's hit points had still been told as it fell (every creature drawn as of the company in the feedback and the chronicle): fixed (CombatProjection.told), held by `small/fight-words` | P2 | M21, playability |
| NP-08 | Exceptional events met on arriving told in the ordinary register; exceptional moments do not take the page | NAR-14, BRF-29 | Open risk, unverified since 6 Nov | P2 | M21, aesthetic |
| NP-09 | Prose arrives already interpreted (a suggestive object followed by a Discovery stating its meaning) | M19-279 | Open (10 Nov) | P3 | M21, playability |
| NP-10 | Sameness: a third of narrated sentences repeat across countries; never measured; no rotation by causal role; dead "Ask again" copies | PT-15, SYS-08, M19-209, ARV-A19 | Open risk / deferred, unverified since 8 Nov | P2 | M21, playability |
| NP-11 | Generated text tonally varied (ordinary life, humour, hospitality); vivid sensory prose, not bland drollery | BRF-85, M19-165, mem:m19-owner-playthrough-notes-nov7 | Unverified since 7 Nov | P3 | later, playability |
| NP-12 | Names: old-tongue names transparently Latin; Common names from a true common tongue; languages authorable in the project | M19-20, OWN-41, OWN-51, BRF-80, BRF-84, M19-208, mem:m18-owner-portraits-names-2 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| NP-13 | Engine names and masks leak into text: "The raiding party: Fall on You"; masked names replaced by string; `seen as` and Known-as leaks | UNT-108, UNT-121, UNT-203, UNT-214 | Open risk, unverified since 6 Nov | P2 | M21, lead |
| NP-14 | A companion "binds the hurt" when nobody is hurt | UNT-107 | Open risk, unverified since 6 Nov | P3 | M21, playability |
| NP-15 | A wait in a room repeats the room's description every hour | M19-263 | Open, not verified (10 Nov) | P3 | M21, playability |
| NP-16 | Text slips (a lintel's spelling, a sentence twice, "their breath" of a man, a card clipped, a file name as a caption) | M19-283 (rest) | Partial, the rest not verified (10 Nov) | P3 | M22 (P3 text slips, to sweep with NP-10), playability |
| NP-17 | Raw museum captions and credits on portraits (Lem) | R6-I top3, E31, UNT-111, E152 | **Fixed** (11 Nov night, E152): credits name the painter and do not shout the title (test/paintings); not seen rendered | P2 | M20 close |
| NP-18 | Ordering slips: a milestone told on the next step; a greeting after a scripted reaction; a tame bear greets while asleep | UNT-219, UNT-220, UNT-221 | Open risk, unverified since 6 Nov | P3 | later, playability |

## 6. UI & safe zones

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| UI-01 | Controls move under the pointer (Attack under Press on, the Go list, the bottom-left control); the Look panel toggles and closes after each act; clicks land elsewhere | E17, R1-A top4, R2-A top5, R3-C top5, R3-D top4, R5-G top1, R5-H top4 | Open (11 Nov) | P2 | M21, aesthetic |
| UI-02 | On a phone: inert portraits; the title over the icons; the trade grid under Continue; eleven portraits in a row; the shop's portrait order shifts under a tap | E116 (in part), R6-J top5, R6-J §4 (171) | In part; the touched state not seen rendered (11 Nov) | P2 | M21, aesthetic |
| UI-03 | Text clicks on visible words hit hidden page text; Go… rows by text do nothing or take the next row; some rows preview, others walk at once | R6-I top5, R6-J §4, E116 | Not in log / in part (11 Nov) | P2 | M21, aesthetic |
| UI-04 | Small items: Escape does not close talk; "Nowhere to sleep here" in an inn; a one-way back garden; the circus gone from the map | E62, R4-E top4 | **In part** (11 Nov night): in an inn after dark the wait panel names who has a bed, under Trade (test/sitting-out-the-night); Escape in talk takes the leave (ReaderApp.back), round 4's case not reproduced, not seen rendered; the back garden and the circus open | P3 | M21, aesthetic |
| UI-05 | Buttons: icon and text overlap, jagged wraps; a screen of plain buttons and link-like controls reads as a wiki | user-notes | open: no row before; scene-first since (11 Nov); to verify on the current page | P2 | M21, aesthetic |
| UI-06 | A place's telling scrolls inside its column (the opening's causeway at 1180×820; always on a phone) | E128 (left) | partly (unheld): by design at 11 Nov; the narrator's budget (e248e719) now tells a place in three sentences at a glance, held by `scene-sentence-budget`; the scroll on a phone not re-measured | P3 | M21, aesthetic |
| UI-07 | Results below the fold of the fixed column; number keys dead on the scene | M19-116 | Partial (10 Nov) | P2 | M21, aesthetic |
| UI-08 | The resting scene: an independent look at whether it reads as a place | M19-85 | Partial, unverified since 8 Nov | P2 | M21, aesthetic |
| UI-09 | The interface explains itself (generic instructions under controls) | M19-57 | Partial, unverified since 8 Nov | P3 | M21, aesthetic |
| UI-10 | One design language across scene, travel, fight, talk, notes and pack; a specimen page of components with several fillings | M19-231, M19-217, mem:m19-owner-opening-and-foundations | Deferred (10 Nov) | P2 | M21 |
| UI-11 | Access: no screen-reader pass; no map path without the canvas; title and creation ignore the keyboard; no clock shown except while moving; no "wait until"; free play by keys without images | UNT-117, UNT-218, BRF-36 | Open risk, unverified since 6 Nov | P2 | M21, aesthetic |
| UI-12 | A refused purchase still does not say why; commerce and inventory (stock fits the shop, no undifferentiated lists) | M19-113 (remainder), BRF-73 | Open (10 Nov) | P2 | M21, playability |
| UI-13 | A treasure's appraisal ("Show … to …") is not among the sales | E113 (remainder) | Open (11 Nov) | P3 | M21, playability |
| UI-14 | Buying ignores what the company already carries | UNT-105 | Open risk, unverified since 6 Nov | P3 | M21, playability |
| UI-15 | Pack: named and plain items of one kind are two rows; nothing weighs; lantern and oil in different packs are dead weight (they went to Xyn unasked) | M19-146, UNT-227, M19-253, R6-I §6 | Deferred / open (8–10 Nov); seen 11 Nov | P3 | M21 |
| UI-16 | A living interface: real time passing, motion and reaction | user-notes, design-opp 6 | Idea (10 Nov) | P3 | later, aesthetic |
| UI-17 | A Company page in the Book, and the same in the terminal | adventure-to-career §11 | deferred to M22: a Company page waits on formations (the M21 brief's limits: no new systems); direction recorded 11 Nov | P2 | M21 |
| UI-18 | The `?scene=full` experiment was never made default by row; scene-first landed later (79c26bdf) | E77, log open queue | superseded by CN-01 (scene-first, 79c26bdf, then the lenses in the scene); closing the experiment's row is a process fix | P3 | M20 close (close the row) |

## 7. Undertakings & story payoff

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| US-01 | The "Gone under" origin's sister is silent at Seolforfyrd, with no one to ask: the hook goes quiet when followed | E111 (open part), R6-I top4, R6-I §14, H §3 | **Fixed** (11 Nov night): the inn's keeper at home can be asked of her and says where to look; the pin found is told and seen through (test/sister-asked); not replayed cold | P1 | M20 close |
| US-02 | Treasure payoff flat: two identical "empty" jewelled boxes; no hoard; a three-locked toll-chest holds one box | E118, R6-J top3, R6-J §14, H §3, OWN-75 | Partly (11 Nov night: the map's box told, E142; the jewelled box no longer "empty"; no hoard yet) | P2 | M21, playability |
| US-03 | The dead man's map ends in an empty box, with no word of who emptied it | E20, R1-B top4, E142 | **Fixed** for this origin (11 Nov night, E142): the box is told (the drover's mark, a name crossed out, stones to sell) and seen through, 100 experience (test/map-origin-find) | P2 | M20 close |
| US-04 | Handed-out aims are all kill or loot; peaceful errands (Gosse's offer, the circus larder) not kept in Notes; promises with terms, decline and defer | E58, R4-E top2, BRF-99 | Open (11 Nov) | P2 | M21, playability |
| US-05 | No successor threads after a resolution ("Nothing more is asked of you"); a lone company following the page earns no level in 200 steps | PT-01, M19-59, BRF-67 | duplicate of T24-18 | P2 | see T24-18 |
| US-06 | Gosse and Hepzibah lead nowhere after their first line | R6-I §4, R6-I §15 | Not in log (11 Nov) | P3 | M21, playability |
| US-07 | PD-08: heard, lead, undertaking, route knowledge and immediate action are not separate records; an aim's places not typed for "on the map"; who keeps a building | PD-08, BRF-72, UNT-123, text-inference.md (Aims.named), mem:m19-owner-architecture-review | Open (10 Nov) | P1 | M21, lead |
| US-08 | No knowledge-boundary test: an aim's target can appear in the journal or local choices before it is learned | M19-272, opening-brief §3, M19 closure §1 | Partial (10 Nov) | P2 | M21, playability |
| US-09 | A dungeon to find and the full rendered route; journeys A–D, and journeys 2, 5 and 6 through the page; the builder's descent never played by a person | M19-155, M19-173, M19-158, BRF-92, stabilization review §10 | Partial, unverified since 8 Nov | P1 | M21, playability |
| US-10 | Depth and reward: missions deeper than one fight; the loop distended; an expedition that opens another; two linked expeditions; old-school kit made useful | OWN-55, OWN-75, OWN-78, OWN-79, OWN-81, BRF-66, BRF-103, BRF-104 | Partial, carried to M20, unverified since 8 Nov | P1 | M21, playability |
| US-11 | After a fight, the aftermath: what was recovered | PD-13 | Partial, unverified since 8 Nov | P3 | M21, playability |
| US-12 | Offstage agency: independent undertakings leave traces; a rival expedition visible; situations with initiative; strategic antagonists; institutions acting | NAR-17, REV-23, IND-06, BRF-20, BRF-62, BRF-100 | Open risk / disappeared, unverified since 8 Nov | P2 | later, lead |
| US-13 | Semantic enrichment: history transitions, structural constructs, notes as evidence, dramatic roles, tonal variety, endings as events | M19-160..M19-166 | Deferred, unverified since 8 Nov | P2 | later |
| US-14 | From adventure to career: backgrounds unfold in play, early companions, formations (Synod), careers, kits; one substantial companion; advancement options | adventure-to-career §2–8, amendment 7(2), mem:m20-owner-map-panel-hex-kits (kits), opportunities M21 #4, NAR-18, BRF-31, BRF-38 | deferred to M22: careers and formations are new systems (the M21 brief's limits); direction recorded 11 Nov | P2 | M21 |

## 8. World memory & consequence

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| WM-01 | The world forgets: the Gaffer "comes off his fleeces" after death; the sergeant's speech word for word; the players never react or leave without a line | E34 (Gaffer line open), E57 (sergeant open), R2-B top1, R4-E top3, R6-I top2, H §3 · M21 (13 Nov): the Gaffer's half fixed in the engine: what is done near someone dead is not told, unless it is told of their death (CampaignTick.heard; test/small/near-dead); the sergeant's speech word for word and the rest stay open | Partly fixed (11 Nov) | P1 | M21, playability |
| WM-02 | Dishonesty has no consequence: graves robbed under the dead who keep the bounds, for free | E45 (graves still free), R3-D top1, H §3 | Partly fixed (11 Nov) | P2 | M21, playability |
| WM-03 | "Look at the cart / take the horse's head" still offered after robbing the wagoner | R6-J §15 | **Fixed** (11 Nov night): the horse's head is offered only while the meeting is unanswered (test/owed: a thief who lifts a sack is offered no hand with the cart); the cart's look is kept, a thing at the road | P3 | M20 close |
| WM-04 | Scenario word that never goes stale (the den's directions after it is cleared) | UNT-103 | Open risk, unverified since 6 Nov; E57's stale-word fix may cover it | P3 | M21 (verify), playability |
| WM-05 | Return told through people: what others did reaches the company by witnesses and news; news heard late if away | BRF-33, UNT-240 | Superficial / open risk, unverified since 6 Nov | P2 | M21, playability |
| WM-06 | One metropolis many adventures add to: Dun Rìerdan only an identity; the King's Players builds its own; several adventures interleaved in one region; institutions as kits; modules coexisting in one Imbar | M19-77, M19-107, M19-123, BRF-42, BRF-54, BRF-79, BRF-107, capability-audit #10, mem:m19-owner-experience-pass | Deferred / unverified since 8 Nov | P2 | later |
| WM-07 | Weather: not readable by a module; a module's rain against the world's FAIR; yesterday's weather read at 04:00; dark nine to six in every season | M19-256, UNT-215, UNT-241 | Open (10 Nov); UNT unverified since 6 Nov | P3 | later, lead |
| WM-08 | History the player can investigate, misunderstand and alter | BRF-106 | Superficial, unverified since 6 Nov | P3 | later, lead |

## 9. Content & paintings

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| CP-01 | Paintings that contradict their text (cathedral for a toll-hall, flooded "dry" cave, temple for a slab altar, oast house for a kiln, window in a windowless vault; charnel passage, ossuary, shrine) | E95, E62, R5-G top5, R6-I top3, R6-J top4 | duplicate of OA-13 | P2 | see OA-13 |
| CP-02 | Paintings the first hour lacks (toll-house hall and counting-house, a warehouse, a muck pit, cave interiors); rooms of one kind share one painting; scenery kinds not yet placed | E37, E31 (remainder), M19-232 (remainder), mem:m20-owner-environment-pass | open: needs the owner's art (11 Nov) | P3 | later, aesthetic |
| CP-03 | Missing plates: bone flute, bronze mirror, cloak, betony; new kinds show an empty square | E95, E72 (betony), M19-145 | Open / deferred (11 Nov) | P3 | later, aesthetic |
| CP-04 | Likenesses: Xyn's two faces; a dwarf cleric drawn as a red-haired human woman; a dwarf family painted human; a drowned girl with a revenant's face; Tuck by an acorn (by design); portrait suitability | R6-I top3, R6-I §17, M19-114, M19-172, E42, PRE-05 | Deferred / open (11 Nov) | P2 | later |
| CP-05 | Orsino traps drawn without regard to the makers (an electrified floor in a Barrow-Kin grave) | E98 | Open; waits for a world-generation pass (11 Nov) | P3 | M21, rules |
| CP-06 | Orsino room and shop tables not drawn; dungeon and room generation from Orsino; Orsino's companions, deities and dungeons; generated planes and cities | M19-207 (remainder), M19-210, capability-audit | Deferred, unverified since 8 Nov | P3 | later |
| CP-07 | Items: per-item depth; most magic items, charges, treasure by tier; content inventory with operational coverage | M19-92, capability-audit #8, BRF-78 | Deferred / open, unverified since 8 Nov | P3 | later |
| CP-08 | Generated people thin; settlements texture before drama; two settlements should differ; operational professions | NAR-01, IND-01, SYS-06, BRF-06 | Open risk, unverified since 8 Nov | P2 | M21, playability |
| CP-09 | Natural history: geology beyond formations; herb-lore or woodcraft telling plants apart ("What grows here" known/unknown); plants and animals with ecology | M19-68, M19-144, E73, design-opp 9, BRF-82 | Deferred (8 Nov) | P3 | later |
| CP-10 | Unplayed content: the anthology's endings; Low Water never played Begin to ending; the circus played only by its author; the library tour (every adventure entered); the principal adventure within a day; a second adventure told of | M19-133, BRF-24, BRF-25, BRF-35, WPC-X08, NAV-10 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| CP-11 | Grand Tour and planes: the Rose, canonical locations, a premise for any protagonist, two adventures on one plane, the Door of Doors, daily rounds, an accusation the player builds | OWN-34, OWN-36, OWN-37, OWN-38, GTR-26, GTR-27, GTR-X20, GTR-X21 | Deferred, unverified since 8 Nov | P3 | later |
| CP-12 | A stately-home murder mystery as a systems test | adventure-to-career §10 | deferred to M22: a new adventure as a systems test (the M21 brief's limits); direction recorded 11 Nov | P3 | M21 |
| CP-13 | Five notices at the inn on the first evening, each read on its own | M19-169 | Deferred, unverified since 8 Nov | P3 | M21 |
| CP-14 | The wagoner's ask answerable from the talk, not only from the cart under Look… (every road meeting) | M19-171 | Deferred, unverified since 8 Nov | P3 | M21 |
| CP-15 | Prose promises that cannot be met: things named in a place cannot be taken (a candle-end, a rope); a den's mouth with no inside (29 of 29 dens one room); interiors with no gate guards; letters read at midnight without a light | UNT-101, UNT-102, UNT-106, UNT-125 | Open risk, unverified since 6 Nov | P2 | M21, playability |
| CP-16 | Long aspirations: the Star-Readers' sky, a world that changes on its own, physical interaction from properties, a material world, rare Manuals, reinterpretation, a bounded battle, grand strategy, an ensemble, silent speech, alignment, temperature, giant gentry | UNT-115, UNT-126, UNT-212, UNT-222, UNT-239, BRF-47, BRF-48, BRF-49, BRF-52, BRF-105, BRF-108, QIS-01, BTW-11 | Wishlist / deferred, unverified since 6–8 Nov | P3 | later |
| CP-17 | Encyclopedia: modules cannot add entries; geography, histories and institutions thin; kept apart from the journal, with spoiler protection | M19-148, BRF-88, BRF-89, BRF-90 | Deferred / disappeared, unverified since 8 Nov | P3 | later |

## 10. Startup & performance

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| SP-01 | A fresh country starts in 10.1 s headless and 13–20 s in a browser; 5.5 s is parsing ~1.2 MB of generated Kyr, then compiling, checking and structuredClone. Candidates: parse templates once, a compact intermediate form, a generation horizon | E107, E121, H §2.8, M19-49, BRF-11, BRF-65, mem:m20-owner-startup-place-icons §2, mem:m20-owner-headless-investigation §1, mem:m20-owner-before-closure §3 | Improved, open (11 Nov) **M21, improved:** a1's start 6.1 → 4.7 s warm headless (Experiment B: callings and peoples canonical, `proficient` for the company only; `mission-21/world/construction.md`); the browser and a real tablet not re-measured. | P1 | M21, lead |
| SP-02 | Eager instantiation of distant content (130,826 facts, 30 modules, 23.8 MB checkpoint, ~500 MB RSS): deterministic lazy materialization, proven against eager | E121, headless §1.4, headless rec 2, headless §7 (M21) | Open (11 Nov) **M21, improved:** a first country 230k → 33k facts, a kept start 28.5 → 14.2 MB, ten installs 31.6 → 14.2 s (Experiment B); distant content still instantiated eagerly (steps 4–5 not built). | P1 | M21, lead |
| SP-03 | Reuse compiled module and operator definitions across sessions; cache one player frame per response | headless rec 1, headless rec 3, E121 | Open (11 Nov) | P2 | M21, lead |
| SP-04 | One three-country run stalled past five minutes, once; not explained | E107 | open: not explained (11 Nov) | P2 | M21, lead |
| SP-05 | No measurement on a real iPad or under Safari/WebKit; play never verified on a real tablet | UNT-118, BRF-16, E107 (owner's iPad report) | Open risk, unverified since 6 Nov | P1 | M21, owner |
| SP-06 | Planner scaling under denser agency: per-actor budgets, adaptive horizons, benchmarks on high-agency worlds | R7, E133, H §2.10 | Open, homed M21 (11 Nov) | P2 | M21, lead |
| SP-07 | The glance's 8 ms budget (glance-kite) against wider per-facet perception | H §2.3, mem:m20-state-nov11-late | decided: a constraint (the glance's 8 ms budget, glance-kite), to keep under per-facet perception | P3 | M21 |
| SP-08 | Choices grounded afresh in every new world (22 ms in the frontier): never carried after M16 | COR-15, UNT-119 | Dropped, unverified since 6 Nov | P3 | later, lead |

## 11. Architecture & risk

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| AR-01 | R1: campaign orchestration in one class; explicit command phases; lifecycle assertions around command and rollback; golden lifecycle traces | R1, E133, H §2.10 | Open; the review's immediate list was put in M21 (11 Nov) | P2 | M21, lead |
| AR-02 | R2: process-global catalog kinds and a serial load queue; per-campaign catalog state; two campaigns sharing a module break each other | R2, ARV-H7, COR-04, UNT-237, E90 | Open risk (11 Nov) | P2 | M21, lead |
| AR-03 | R3: cache invalidation by convention across memo layers; cache and load telemetry; cache-on/cache-off differential tests | R3, E133, H §2.10 | Open (11 Nov) | P2 | M21, lead |
| AR-04 | R4: shared operator and schema structures mutable by convention; deep-freeze in development | R4, H §2.10 | Open (11 Nov) | P3 | M21, lead |
| AR-05 | Remaining text inference in the page: talk roles, reading acts, "too dear", seen-through and level moments, panorama, harm on arrival, the fight's turning points, an aim's places, "Against X", note labels; closed word lists in general code | text-inference.md, H §2.1, E123 (left), ARV-M4, BRF-98, mem:m19-owner-architecture-review (P0 typed contracts) | Open (11 Nov) **M21, in part:** talk roles typed by the engine (PL-15, `small/talk-weight`); the roll of who is here said apart by the narrator (`Leaf.roll`), so the page no longer knows it by its words and an author's line ending "is here." is told again (`small/roll-apart`, mutation-checked). A census on 13 Nov: 32 regex tests on labels or text left in web/reader, src/ui and src/presentation, some only punctuation. The quiet game's guidance reads a member's calling by id (`MemberRow.calling`), not the word in their line (`small/guidance-calling`, mutation-checked). Left: the exchange's notes are prefixed strings ("Noted:", "Aim:", "Borne out:") the page parses back to kinds; typing them touches the terminal and the page alike. What a talk teaches is set apart by the exchange's own `learned` (the narrator's), not by its note's first words (`small/talk-learned`, mutation-checked); the notes stay prefixed strings for the terminal. The sheet tells what is done from it by the act's name (the exchange's `act`), not by its words ("Have …", "Raise …": `small/exchange-act`, mutation-checked). | P1 | M21, lead |
| AR-06 | One exported PlayerHost/PlayerFrame facade; nested PlayerSnapshot vs Screen/Leaf/Glance; PublicChoice lacks availability, exhaustion, restriction reasons and provenance | E122 (open part), headless §1.1–1.2, headless §7, mem:m20-owner-headless-investigation §4 | Open (11 Nov) | P2 | M21, lead |
| AR-07 | Opportunity semantics live under src/ui and src/presentation; move them to compiled authored metadata plus runtime facts; a situation projection from the legal set | headless §1.3, headless §6, SYS-01 | Open (11 Nov) | P2 | M21, lead |
| AR-08 | ModuleShadow renames by rewriting source text (the parser must mark authored calls first); Kyr manipulated by parsed syntax, never text | M19-69, BRF-86, mem:m19-owner-architecture-review | Open risk (10 Nov) | P2 | M21, lead |
| AR-09 | Plots and prose in TypeScript: settlement, road, deep-site, market and fellows writers; the undertown's structure in engine code; deep-argument.ts; Deem should own the top-level generator | ARV-H4, M19-44, M19-216, BRF-19, user-notes, design-opp 4, headless §6, mem:m19-owner-coherence | Partial / deferred, unverified since 8 Nov | P2 | M21, lead |
| AR-10 | Party membership has no public lifecycle; two companion systems; preset-party defaults (a trio in WorldAssembler); "Go alone" only in a drawn country; the company cannot divide; a recruit's `at` retracted | ARV-M7, M19-75, M19-105 (remainder), QTC-19, UNT-208, UNT-230, BRF-77, mem:m19-owner-preset-party | Open risk / partial (10 Nov) | P2 | M21, lead |
| AR-11 | Identity carried in id strings (march-stones, provinces, stretches) | ARV-L2 | Partial, unverified since 8 Nov | P3 | M21, lead |
| AR-12 | Hidden registries and central edit points (origins, region generators, title list) | ARV-M6 | Open risk, unverified since 8 Nov | P3 | M21, lead |
| AR-13 | Five composition mechanisms; unfilled placeholders pass silently; .kyrt values unescaped | ARV-M3 | Open risk, unverified since 8 Nov | P3 | M21, lead |
| AR-14 | Compiler binding-check holes (partial); ability text not equal to execution across the catalog | ARV-A9, ARV-A5, BRF-51 | Partial, unverified since 8 Nov | P3 | M21, lead |
| AR-15 | Waits are atomic: they do not stop at a warning, arrival or chapter, so a fight is lost inside one wait | M19-239 | Open (10 Nov) | P2 | M21, lead |
| AR-16 | The setting is coupled into the engine (Imbar's planes, calendar, world shape, encyclopedia) | M19-271, opening-brief backlog | Open (10 Nov) | P3 | later, lead |
| AR-17 | Adding a province re-seeds every generated world | M19-97 | Deferred, unverified since 8 Nov | P2 | later |
| AR-18 | Lowering discards declared intent (a trace sees generated rules, not event transitions) | UNT-128 | Open risk, unverified since 6 Nov | P3 | later, lead |
| AR-19 | One creature pipeline: aliases, corpus verification, variation apart from species, wards and turrets out of species | M19-60, mem:m19-owner-creature-corpus, mem:m19-owner-operational-bestiary, mem:m19-owner-architecture-review | Partial, unverified since 8 Nov | P2 | M21, rules |

## 12. Authoring (Kyr/Deem)

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| AU-01 | A bounded, current authoring trail: entry points, examples, the path to play, ownership, superseded guides marked, scene and opportunity conventions as built | amendment 7(5), amendment 8, mem:m20-state-nov11 #9 ("page 10 done") | partly: the trail is `doc/authoring/README.md`; not re-checked against M21's changes | P2 | M21, lead |
| AU-02 | The Kyr/Deem shells review, as M21 input | amendment 7(5) | open: M21 input, not taken up | P3 | M21, lead |
| AU-03 | R8: authoring cost drift; cost lint for unbound parameters, weak conjunctions and broad queries; complexity notes for new constructs | R8, H §2.10 | Open, homed M21 (11 Nov) | P2 | M21, lead |
| AU-04 | Kyr time and state forms: State … when / Retract; a die rolled once; Reset; named clocks and table draws; cycles; computed measures; schedules; tick order and the Slay lag; Set … at the action's end; a change's duration; windows missed by waits; rules a pass late; once-only rules, money, timers | M19-98, M19-128, M19-197, M19-240, M19-248, M19-249, ARV-M2, AUT-09, FWR-05, LOR-09, LOR-13, QTC-14, QTC-A02, QTC-A20, BOF-08, UNT-235, UNT-236 | Deferred / open (8–10 Nov) | P2 | M21 |
| AU-05 | Kyr talk forms: Says again (120 `_again` topics in Quittance); a Topic through a party member; questions with parameters; several-exchange topics; speaking through a window; Known as without its teaching; Seen when hides a person but not their greeting | M19-106, M19-180, M19-258, BOF-24, CTH-05, QTC-A24, UNT-213 | duplicate of R11-02 | P2 | see R11-02 |
| AU-06 | Kyr rule and ending forms: endings fire before the step's Observes; chapter order and text by what is carried; rules at time 0 (Wren's greeting); a rule cutting a timed action short; "for all" over members; roles lint | M19-241, M19-262, UNT-129, UNT-204, UNT-209, GTR-21 | Open (10 Nov); UNT unverified since 6 Nov | P2 | M21, lead |
| AU-07 | People, pursuit and inhabitants: pursuit re-planned each watch; hidden ways; a lasting rout; per-person patience; bargains against warned patience; temperament (Menace, Temperament over Peaceable); Refuge as a wall; positions and history; patrols and escorts; guard ways never written; routes of hunted and hunters; Notices when; merchant resale; immunities; a non-combatant with a species | M19-129, M19-132, M19-194, M19-195, M19-199, M19-200, M19-242, M19-243, M19-244, M19-246, M19-251, M19-261, M19-265, UNT-202, UNT-226, UNT-238 | Deferred / open (8–10 Nov) | P2 | M21 |
| AU-08 | Things and kinds: a lend lint; flame and chart kinds; `_gathered` naming; scenery initial state; abilities in the catalog not all loaded; a module kind cannot be worn; items cannot be tried; nothing kept out of sight; denominations and wages; readable by skill; a carried item others can take; things made in play; counted offers; people fixed at load; per-entity measure tables; container search; charm semantics | M19-93, M19-204, M19-247, M19-255, UNT-114, UNT-127, UNT-210, UNT-224, UNT-225, UNT-229, UNT-231, UNT-232, UNT-233, UNT-234, BOF-33, BOF-34 | Deferred / open, unverified since 6–10 Nov | P2 | M21 |
| AU-09 | Structure, namespaces and diagnostics: state names share the module namespace; a module's kinds and techniques share the catalog's; no Exports; clause order; negative grid coordinates; doors shutting at both ends; crowd size and level containment; conflicting placements unlinted; misleading loader and explorer messages; lint gaps; ending coverage; runtime errors name the rule, not the line | AUT-07, WPC-14, WPC-X04, UNT-243, QTC-A04, UNT-206, UNT-207, M19-196, LOR-16, BOF-11, BOF-16, M19-259, M19-260, TTN-02, UNT-211, UNT-228 | Open risk / open (6–10 Nov) | P2 | M21, lead |
| AU-10 | Deem: module-local tables, weighted and conditional choice, generated families; draw order re-rolls worlds (undocumented); the Deem dossier → composition kit → Kyr role-binding pipeline | AUT-25, BRF-18, M19-202, headless §6–7 | Open risk (8–10 Nov) | P2 | M21, lead |
| AU-11 | Missing authoring tools: `kyrie new table` and `new generator`, `kyrie stats` and `info`, a placement report, a backgrounds lister, a simulate readout, author scaffolding with no engine edits | UNT-120, UNT-122, UNT-205, UNT-223, BRF-56, BRF-57, BRF-60 | Disappeared / open risk, unverified since 6 Nov | P3 | M21, lead |
| AU-12 | The IF review's holistic Kyr remedies (why/trace, typed transformations, affording observations, occasions, rule phases, one knowledge model, dynamic identity, one transaction per command, proven patterns, scale) | IFR-01..IFR-10 | Deferred, unverified since 8 Nov | P3 | later |
| AU-13 | Wapshott's Circus needs: a moving place, a shared town, rooms named for their town, a contest of words, places beyond its towns | WPC-01, WPC-06, WPC-18, WPC-X02, WPC-X09 | Deferred / open risk, unverified since 8 Nov | P3 | later |
| AU-14 | Authorable effects and spell construction (Kyr can teach a spell, not define one) | BRF-81 | Deferred, unverified since 6 Nov | P3 | later |
| AU-15 | About 200 legacy objectives without `toward` still rely on inference from their words | M19 closure §1, M19-225, opening-brief backlog | Open (10 Nov) | P2 | M21, lead |
| AU-16 | Calling and ancestry data: a dwarf thief refused only after load; halflings not playable; the Wrong Boat's coin tuned to its shipped party | M19-266, M19-267 | Partial / open (author's decision) (10 Nov) | P3 | later, lead |
| AU-17 | Not reproduced, kept for re-check: a catalog kind in an Observe; two `says` in one turn; herald aliasing; encyclopedia links; empty conversational leads | M19-189, M19-190, M19-201, M19-215, M19-235 | open (not reproduced; kept for re-check) · was: Not reproduced (8–10 Nov) | P3 | later, lead |

## 13. Persistence & replay

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| PR-01 | R5: the save schema is `version: 1` with no migration path; a compatibility policy and a fixture bank of historical saves | R5, E133, H §2.10 | Open, homed M21 (11 Nov) | P2 | M21, lead |
| PR-02 | R6: transcripts tied to the choices of the day; a historical-transcript replay lane, durable command aliases; whole-world digests break kept transcripts | R6, H §2.10, UNT-217 | Open (11 Nov) | P2 | M21, lead |
| PR-03 | Save size: the downloadable whole game is 22 MB and the raw checkpoint 23.8 MB; one save format and autosave path; a compact save for the terminal | M19-236, E25, ARV-A24, headless rec 4 | Deferred: no obstacle to play measured (10–11 Nov) | P3 | M21 |
| PR-04 | Determinism asserted, not verified: locale-dependent combat AI, one combat stream, unchecked resume | ARV-H6 | Open risk, unverified since 8 Nov | P2 | M21, lead |
| PR-05 | Client parity covers no fight | E122 (open part), H §2.9 | Open (11 Nov) | P2 | M21, lead |
| PR-06 | Saving during a fight | BRF-97 | Unverified since 6 Nov | P3 | later, lead |
| PR-07 | "Story after a reload shows only what happened since" | E26 | open (not reproduced, 10 Nov) | P3 | later, lead |

## 14. Testing & CI

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| TC-01 | CI shards unbalanced (shard 4 at 45 minutes against 24); timings refreshed by hand; no scheduled corpus gate | log open queue 6, opening-brief §4, M19-276, mem:m20-state-nov11 #9 | fixed for the balance (f33df419; now sixteen shards balanced by a full run's JUnit, `scripts/timings-from-junit.ts`); the long journeys run nightly (`mission-21/validation-plan.md`); a process fix | P2 | M20 close |
| TC-02 | Full CI about 40 minutes; every push to every branch runs it | M19-268, M19 closure §1 | Open (10 Nov) | P2 | M21, lead |
| TC-03 | Test architecture: content-addressed fixtures, changed-test selection by recorded dependencies, checkpoints for long specs, simulation checks moved out of the browser, a fixture command, phase timings, a trend suite, `kyrie bench` by phase | M19-273, M19-274, M19-275, M19-277, M19-278, BRF-59, opening-brief backlog, throughput review §9, mem:specs-fast-page-objects | Open (10 Nov) | P2 | M21, lead |
| TC-04 | The safe-zone walk at five sizes in CI; atlas states tested as projected data | H §2.9 | Open (11 Nov) | P2 | M21, aesthetic |
| TC-05 | The census proves structure, not play: no seven-stage report, no per-world invariants; no per-adventure integration manifests | M19-269, M19-270, opening-brief backlog | Open (10 Nov) | P2 | M21, lead |
| TC-06 | Consolidation: overlapping tests, obsolete UI paths and heuristics, the verification loop measured | amendment 7(4) | No record of it done (11 Nov) | P2 | M21, lead |
| TC-07 | Walkers as a recurring diagnostic (places, sites, interactions, encounters, stalls, repeats, false promises; a few characters and seeds); a cheap public-action gauntlet | amendment 7(3), amendment 8, E100 | partly: terminal walks per build (`scripts/terminal-walks.ts`, `mission-21/terminal/report.md`); no gauntlet, no recurring write-up | P2 | M21, playability |
| TC-08 | Spec harness affordances: group positions, forced dice, `Journey.reached`, party size in a test, fixture module paths, the `>` router's reasons, the spec clock, stub campaigns | M19-131, M19-179, M19-184, M19-203, M19-206, M19-257, BOF-30 | Deferred / open (8–10 Nov) | P3 | M21 |
| TC-09 | Adversarial-order quest tests across adventures; acceptance tests for urgency, journey density and restraint | REV-21, IND-07 | Partial, unverified since 8 Nov | P3 | M21, playability |
| TC-10 | Tests teleport rather than journey | COR-18 | Open risk, unverified since 8 Nov | P3 | M21, playability |
| TC-11 | Long-horizon verification with trace minimisation; boredom and pull measured | BRF-63, BRF-64 | Disappeared / superficial, unverified since 6 Nov | P3 | later, lead |
| TC-12 | CI on 7f392f0b (and 13441a49) failed only the handbook browser spec, which passes locally | CI | **fixed**: its cases had bun's five-second default; a loaded runner timed the first out and the browser closed under the rest; each now has a minute (a process fix: no behaviour of the game to hold) | P3 | — |

## 15. Docs

| id | item (one line) | sources | status (as recorded, with date) | severity | home |
|---|---|---|---|---|---|
| DC-01 | The handoff is a draft: §4 is empty, and the register is to be reconciled against the implementation, with each row resolved or deferred with a reason | H, amendment 7(4), amendment 7(7), amendment 8 | fixed: the handoff is whole and the register reconciled; a process fix · was: **Done** (12 Nov): the handoff is whole (Parts 1–6, rounds 7–11, the closing CI notes); the register is reconciled through §23, and `briefs-audit.md` checks every brief against it | P1 | M20 close |
| DC-02 | The 74 UNT gap rows were never entered into any mission register, as gaps.md asked; no M19 or M20 document cites them | findings/gaps.md, findings/index.md | fixed: all 74 UNT ids are cited by register rows (grep, 74 of 74, the obligations audit); a process fix | P2 | M20 close |
| DC-03 | R10: a drift review at each closure; a current-invariants appendix; doc freshness checks | R10, H §2.10 | Open, homed M21 (11 Nov) | P3 | M21, lead |
| DC-04 | Undocumented facts: the country marker is unique across provinces; a topic can charge the purse; Guards; Deem draw order; plant `_gathered` naming | M19-264, M19-202, M19-255 | Open (10 Nov) | P3 | M21, lead |
| DC-05 | Fixed rows never re-proved after redesigns (PT-09, PRE-03, PT-42, NAV-12, M17's UI rows) | UNT-130 | Open risk, unverified since 6 Nov | P3 | M21, lead |
| DC-06 | The builder edited twelve authors' adventures with no notice in their own documents; the Parliament of Books' friction never registered | UNT-131, UNT-201 | Open risk, unverified since 6 Nov | P3 | M21, lead |
| DC-07 | The Living Design Atlas reconciled with the Aesthetic Doctrine, superseded design documents marked; the M15–M17 briefs missing from the repository | BRF-50, findings/briefs.md | Disappeared, unverified since 6 Nov | P3 | later, lead |
| DC-08 | inherited.md cannot be regenerated from its sources (the closure table is not written by the generator); an uncommitted owner change was said to cure it | findings/index.md §1 | Unverified since 6 Nov | P3 | M22 (history tooling, no effect on play), lead |

---

## Owner directives possibly unmet

> **Superseded (12 November, early):** this list dates from 11 November. Take the current account, brief by brief, from `mission-20/briefs-audit.md`; its omissions are §21 here (R10-01..06). The list is kept below unchanged for the record.

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
| AB-02 | Wounds never told; the written "hurt" lines never said | R82 | **fixed** 5d55fbad (Barks.wounded) · M21 (13 Nov): fixed for three of seven manners only (grim, cheerful, jovial): a proud, acerbic, compassionate or stoic fighter had no line; a line each added; held by `small/barks-hurt` | P2 | — |
| AB-03 | A creature's damage does not grow with its level (a level-12 mummy's 1d4) | R83 | **deferred to M22:** a level-scaled damage rule for Orsino's grown kinds, or SRD stat blocks for the high-level kinds placed, the mummy first (srd-invariants.md, "Decided for M22") | P2 | M21 |
| AB-04 | The CLI and journeys fight a whole fight in one step; a fallen company is left with nothing offered and no ending | R80 | open | P2 | M21, playability |
| AB-05 | A dark room does not say that a light is cheap or where it is sold | the branch's handoff §5 | partly (unheld): built in the page (13414478, E213: the dark note says a light is a coin, and where); no spec | P2 | M21, lead |
| AB-06 | People and bands that move on a clock (Route/Pursuit on a person) | R41, R54, R89, R32 | open | P2 | M21 (authoring), lead |
| AB-07 | A scenario reading and moving the first town's own people | R37, R38, R85 | open | P2 | M21 (authoring), lead |
| AB-08 | Band against band; bands that lose members | R92, R93, R94 | open | P2 | M21, rules |
| AB-09 | A calling-specific read of a scene; a check against a crowd | R90, R95, R87 | duplicate of RI-03 | P2 | see RI-03 |
| AB-10 | Topics that change on repeat (98% of the first town's are `once`) | R60, R46, R57 | duplicate of R11-02 | P2 | see R11-02 |
| AB-11 | A scenario's reach beyond its seat (members in other towns and countries) | R72, R73, R74, R31 | open | P3 | M21, lead |
| AB-12 | A Deem template that invokes Kyr (a drawn fact selecting an authored section) | R75, R29, R55 | open | P2 | M21 (authoring), lead |
| AB-13 | Specs that choose which standing scenarios a world holds | R88 | fixed (E210): `Drawn.standing` names the standing scenarios a world holds; held by `deep-rivals` and `voice`, which name theirs | P2 | M21 (testing) |
| AB-14 | Declarations that fail late: shared relation names, a new site kind needing three edits, a module without milestones | R42, R39, R59 | open | P2 | M21 (authoring), lead |
| R7-01 | Torches die in the middle of an act, and nothing says so | round 7, L 84, 96 | **fixed** (E145) · held by `small/torch-out` (M21: told as it gutters mid-wait in the dark; kept where not wanted) | P2 | — |
| R7-02 | Fights trivial with a warrior in the company; a bard "barely played" (lore, Charm Person, gliding never came up); a speaking castellan with no way to answer | round 7, L | duplicate of CB-01 | P1 | see CB-01 |
| R7-03 | Go… lists every place in town as "20 minutes"; the conversation log grows without end | round 7, L | **fixed** (11 Nov night): true minutes (E149), the log folded (E151); the list still flat; held by `test/walk-minutes` and `test/talk-lines` (M20's own specs, named 13 Nov) | P3 | M21 |
| R7-04 | A town known only by report has no route line before setting out (the owner's rule of 29 October: heard of is a marker only); both players missed one | round 7, K, L | open (the owner's decision): by design under the rule of 29 October (heard of is a marker only); both players missed one | P3 | M21, owner |

## 17. Integrating the adventure branch (12 November, early)

**Update (12 November, evening): integrated** on `integrate/first-steps` (main + the branch + M20's work after the cutoff), its failures fixed in two rounds (`mission-20/integration-first-steps.md`); it lands on main when its CI is green. **Earlier verdict (12 November, early): verified, not merged.** See `mission-20/integration-first-steps.md`. The review merge with its repairs is `review/first-steps`; CI on 1fc62c34 still fails 18 or more specs, several on decisions the owner has to make (whether the standing modules stand in the first town; whether the forged seal's receipt or the notice of jobs leads there).

The branch's own integration notes (`activation/integration-notes.md`, at 98ad43eb) and what the scratch merge on
`review/first-steps` found. Its rows are open until the merge is on main.

| Id | What | Source | Status | Pri | When |
|---|---|---|---|---|---|
| AI-01 | The thorn long descent fails at choice 62: the first town's shop stock was redrawn when the standing scenarios came in | integration notes §1 | fixed: CI's long descents green on the integration branch (dead69a5) and since; held by `descent` | P2 | — |
| AI-02 | `silent-lord-turns`' "forged remission" fails when rain puts a ford in spate (`Journey.way` ignores `hazardous`) | integration notes §1 | open: **skipped at the landing** (its last walk, to the bailiff's town across the country, runs onto the road into the next stretch, which only the map takes, and the map's journey did not reach it either; replanning at each step did not help) | P2 | M21, playability |
| AI-03 | The new specs have no time in test/timings.json (several take 5 to 15 minutes) | integration notes §1 | superseded: times are kept from a full run's JUnit (`scripts/timings-from-junit.ts`), every file timed; a process fix | P1 | M20 close |
| AI-04 | The first green is busier: 3 to 4 more people and about 170 to 190 more words on arrival (four seeds measured), the Walk's unchanged well, post, shrine and gate told as "as it was" (now silent), and a newcomer who reads everything takes 46 commands to an adventure in mere (24 before) | the scratch merge | superseded by T24-05: the narrator's budget (e248e719) tells a place in three sentences at a glance (`scene-sentence-budget`); the Walk's baseline lines silenced, portraits capped at ten | P1 | M20 (judge in cold play) |
| AI-05 | The Bound Howe's lead is held to day 3 so the honest start still goes under the town | integration notes §1 | decided: the branch's decision, kept; the owner's to move | P3 | — |
| AI-06 | R96 (rotating the altered-law provinces per world) and R97 (retiring `oldcoin` and `quarrel`, which the wanderer origin's arrivals name) | integration notes §5 | open, M20's first hour is touched by R97 | P3 | M21, lead |
| AI-07 | Cold play on the branch: one of three blind players entered a new module; none played one to an ending or fought its dangerous opponents | final report §3 | partly: round 13 played main bc5ab64c, the integrated build (`mission-21/playability.md`, round 13), and The Lull and What Tessary Owes for 4–10 commands; no module played to an ending, nor its dangerous opponents fought | P1 | M21, playability |


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

Ids OPR-01 to OPR-07 (PR-01 to PR-07 in M20's documents, where §13's persistence rows used them too).

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| OPR-01 | Gold loses its thread: on the ways and the looking at once, on aims not chosen, out of a place and back | **fixed in the rules** (E153, E154): gold only after Follow this, on the one next step; what an act makes so is typed by its effects and resolution; surveyed over eight origins in two worlds (10 of 13 see the aim through or pause at a danger). Open: the order past the riddle door, a1's debt sent back to the keep (the keep counted idle), the wanderer with no errand to follow · held by `small/gold`, `small/gold-thread` (M21: each fails with its fault put back) · **fixed in the rules** (E153, E154): gold only after Follow this, on the one next step; what an act makes so is typed by its effects and resolution; surveyed over eight origins in two worlds (10 of 13 see the aim through or pause at a danger). Open: the order past the riddle door, a1's debt sent back to the keep (the keep counted idle), the wanderer with no errand to follow **M21 (playability list):** five more ways the gold lost its thread fixed and held: an act's place taken for the aim's (the cairn at Seolforfyrd, PL-05, `test/small/gold-at-the-place`), a search where nothing is hidden (PL-08, same spec), the fight the aim waits on (PL-11, `test/small/gold-fight`), every door of the aim's town place (PL-12, `test/small/gold-doors`), and back to a place been to where nothing can yet be done, with the lead at hand (PL-13, `test/small/gold-lead`); then (13 November, cold plays) the aim's step crowded out at a door (PL-19, `test/small/gold-step-room`) and every reward taken for a debt's (PL-21, `test/small/debt-purse`) | P0 | M20 / M21 |
| OPR-02 | Choosing a place in the company's own hex walked it out of the town | **fixed** (E155): never across the country to a place in its own hex; not seen rendered · held by `small/own-hex` (M21: fails without E155's guard) **M21:** the decision moved into the engine (`LandCrossing`; the page, the terminal and `serve` draw the same), held by `test/small/own-hex` and `test/small/own-hex-engine` (PL-18) | P0 | M20 |
| OPR-03 | The route preview no longer shows before setting out | open (not reproduced headlessly): every destination offered from the debt's opening has a course (/var/tmp/kyrie/m20/tools/preview.ts); a rendered check is round 8's; never checked in the page | P1 | M21, aesthetic |
| OPR-04 | A blue pip with no blue reply; a green Look with no clear collectible | **fixed** (E156): replies that teach are typed and marked; the Look list marks the thing it is lit for; not seen rendered · held by `small/signals` (M21: fails with blue for any word to be had) · **fixed** (E156): replies that teach are typed and marked; the Look list marks the thing it is lit for; not seen rendered **M21:** blue on a deed the company does for someone (the wagoner's hand) fixed and held (PL-03, `test/small/blue-teaches`) | P1 | M20 |
| OPR-05 | Follow this too heavy | partly (unheld): fixed in the page (E153: a quiet word, gold only on hover); no spec | P2 | M21, aesthetic |
| OPR-06 | Names of the opening from mixed tongues | **finding, not changed**: towns are Common (dwarvish in a dwarf country: right); countries are Old English (Merscfaenn, Faennmeós, Muntecg) over Common towns; the makers' works are pseudo-Latin compounds (Dolorechies, Umidusspira, Tenebraetumulo, Nocscustod) and reach the first fifteen minutes as places to set out for (/var/tmp/kyrie/m20/tools/names.ts, five seeds). Proposed rule: a work is known first by the townsfolk's Common name, its makers' name learned (the alias mechanism already does this for a place's look), and a human country's name is Common. Renames places dozens of specs walk to: not tonight **Decided with T24-20** (the lead, 14 Nov): adopt the proposed rule; built with T24-20. | P2 | M21, lead |
| OPR-07 | Creation's order unchanged; the pack has no physical model | deferred, as the owner asked; an equipment model kept as a requirement (body positions, containers, transfer) | P2 | M21 |
| PR-08 | Following an aim, the scene leads with its one gold way, and the way up or back is only under Go…, a step at a time (round 8, M; N: "a different single exit each time"). **Again in round 9, both players:** Q's crypt offered no "Up", only Go…'s "↑ Churchyard"; P in the bailey and the outlaws' fort saw only "fight" or "further in", and felt penned in after a flight that succeeded | **addressed** (E206, after the cutoff, at the owner's word to work the recurring list): in a site or underground the way the company came is kept in sight beside Go…, quietly, in its own words; whether it should also be led with stays the owner's · From R10-09: the spring and the tripwire only under Go… and Look…; walking out of a mine was Go… in every room (S 96–97, 115–119); since 7269438e the way back is on the compass's one rule wherever the company is enclosed (`small/compass`) | **P1, recurring** | M21 (decision), playability; the owner's decision |
| PR-09 | Aims that end without "seen through": the vault's aim, the rats job paid (round 8, M) | **open**: "seen through" lists only what gave experience under that name; ended aims are not kept, and keeping them changes the save | P2 | M21, lead |

## 20. Round 9's cold play (12 November, night)

Two agents on 505b002a, reports in `mission-20/cold/round-9/`. Fixed in the log: E173 (the gold at a keep's door, P0),
E171, E174, E175, E177, E178, E179. Open:

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| R9-01 | The crypt aim dead-ends at the man with the black candle: one persuasion try, then "beyond you"; what the company learned (the dead held only while the candle burns; the warding line left out) cannot be acted on, and an unprepared Charm Person is not offered (Q 69, 135) | open (not reproduced): the content has four ways past him (the town's word, the rite of rest, creeping round to pinch the candle, and "Tell him what his book left out of the ring" once the ring is read). In kahitude, on Q's build and on main, solo and with a companion, the ossuary offers them and the glance leads with the last (/var/tmp/kyrie/m20/tools/ossuary2.ts). In Q's run the page offered only "let you by"; Q's world (a random seed) was not kept, so why is unknown | P1 | M21 (reproduce), playability |
| R9-02 | Peren's lodger, "out after dark with grave-dirt on his boots", is never found; a night watching the churchyard says "Nothing comes" (Q 61, 131) | **fixed** (E211): he is seen going down the crypt stair by night, and known in the ossuary; held by `test/lodger-found` (a1, 13 Nov, mutation-checked) | P1 | M21 |
| R9-03 | Blue pips on people the company has not met promise something; talking gives a quip, and the pips walk on to the next unmet face (Q 29, 39, 41) | **addressed (E183, E185)**: blue on someone is given only for a question whose answer teaches the company something, and the talk draws that question blue, above the fold, as their likeness was drawn when turned to; a likeness with no blue has no blue reply. Whether what the question teaches is worth asking is the content's (agent-verified by render and census, not by a person) | P2 | M21, playability |
| R9-04 | The travelling circus's ring of wagons is drawn with houses on the map, beside the company, and read as a town; "Enter Lowmouth" set the company down in Wapshott's ground, a field outside it (P 91–96) | open: the circus as a settlement-like mark | P1 | M21, playability |
| R9-05 | Several rounds pass on one press while the company cannot act (knocked prone again and again): 14 to 2 hit points unseen (P 167–171) | open: the turns lost want telling one by one, or a pause where the player's turn is lost | P2 | M21, playability |
| R9-06 | A fight's status against its log: "shrugs off the armor shred" while Armor Shred shows; "Vigorous for 5 turns" gone after one; a bite for 0 leaves Bleeding (P 78, 166, 168) | **in part** (M21, 13 Nov): a held save against a condition its fighter already has is no longer told as shrugging it off: **fixed**, held by `test/fight-status-told` (fails with the fault put back). A bite for 0 leaving Bleeding: **fixed** (the lead's ruling): only a wound triggers a damage kind's condition, as Orsino has it, held by the same spec; cov7's barrow-king is now beyond a fresh warrior or mage alone (play-structure's worthiest band, its reason in the spec), and told and escapable (`small/barrow-king-told`). "Vigorous for 5 turns" gone after one: not reproduced | P2 | M21, rules |
| R9-07 | Text against state: the crypt's stone door "is locked" after the company came through it with the key; "Since you were last here: the portcullis is wedged up" of the company's own doing; the wolves' "a few minutes, no more" for hours (P 54; Q 66, 74) | duplicate of NP-01 | P2 | see NP-01 |
| R9-08 | "Something is going on here" over a milestone and asters, the event behind a small link (P 142) | open | P2 | M21, aesthetic |
| R9-09 | Gold on hiring (Q 54b) and on the way back out (Q 87, 104); two gold at once in the Go list and on the two glyph tries (P 29, 62) | partly: gold on hiring fixed (E180); a reply's gold is now only the aim's next step as it stands (E185); the rest open, with OPR-01's rules **M21:** the way back out is no longer gold where the aim's work is here (PL-11, `test/small/gold-fight`) or nothing can be done there (PL-13, `test/small/gold-lead`) | P2 | M21, playability |
| R9-10 | The widow's aim (Sir Hamo) never had gold or a route (P 113–154); Sir Hamo has no talk at all, only Attack, Call out, Leave | open | P2 | M21, playability |
| R9-11 | "Take your leave" after hiring reopened the hireling (the portraits re-ordered); number keys silent while the Look panel is open; a spell's name not clickable in the spell modal, and which spell is prepared not shown (Q 10–11, 56, 65) | open | P3 | M21, aesthetic |
| R9-12 | Paintings against the text: an intact sunny castle for a ruined bailey, a sunny churchyard at night, iron pipes in a medieval drain, the keep's star banner at the outlaws' fort (P, Q) | duplicate of OA-13 | P2 | see OA-13 |
| R9-13 | Sleeping "long, under a roof" at 11 a.m. ends the same evening; the wait panel offers to sleep until 3 p.m. at night (P 149; Q 128) | **partly by design**: a sleep begun in the small hours lasts eight hours (FictionalTime.untilMorning), so "until 3:00 p.m." was true of a camp made near seven while still dark; whether a sleep then that late reads right is open (/var/tmp/kyrie/m20/tools/camp-night.ts) | P3 | M21, playability |
| R9-14 | The toolbar has no hover hints (Q 30) | decided: not a defect (every rail button has a title; the agent's harness does not hover) | — | — |

## 21. The briefs audit's omissions (12 November, early)

From `mission-20/briefs-audit.md` (an agent's audit of every M20 brief against the log, the register and the tree).
These were neither done nor recorded anywhere. The ids PR-01 to PR-07 had been used in both §13 and §19: §19's are
OPR-01 to OPR-07 since 13 November (M21's reconciliation); M20's own documents still call them PR-01 to PR-07.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| R10-01 | Combat as a mode of the scene (amendment 6 E, amendment 7 (1)): the fight is still its own page; no tactical foreground (attack, the abilities and spells that apply, a manoeuvre, a retreat), no passage from exploration to threat, parley, fight and aftermath within the scene | open | P1 | M21, aesthetic |
| R10-02 | Silver leads on the map (amendment 6 F, the atlas synthesis): the map does not offer exploration's silver leads | open | P2 | M21, aesthetic |
| R10-03 | The atlas's restraint has no test: silver, neutral and dim are told apart only by the builder's renders (E187, E188); silver (#D7DBE4) is close to the neutral greys; no screenshot set or spec | duplicate of AP-01 | P2 | see AP-01 |
| R10-04 | Evidence lived in scratch (/var/tmp/kyrie/m20): the gold survey, the signal census, the browser render of the signals, the safe-zone probe, the parley and camp probes | **mended**: copied into `mission-20/evidence-tools/` (they read the worktree path at their head; change `W` to run them; a process fix: no behaviour of the game to hold) | P3 | — |
| R10-05 | Acceptance defect B6 (11 November): one combined replay through the headless projection and the rendered screen, at narrow sizes | open: no home before this row | P2 | M21, aesthetic |
| R10-06 | The deployed build (Pages) was never played by an agent: every cold round was served locally (FH-02 corrected) | open | P2 | M21, playability |


## 22. Round 10's cold play (12 November, early)

Two agents played daa96430, with contrasting temperaments: R, a sociable cleric in a1, and S, a fighter in a random
world. Their reports are in `mission-20/cold/round-10/`. These were fixed in the log:
- E190: the P0 both players met, the gold lost at the door of the keep their aim names;
- E191: the dice line against the headline;
- E193: Lem before Lem.

Open:

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| R10-07 | Flee labelled "sure, now" failed at round 5 of a fight the company chose (S 105). The battle's odds (`Battle.flight`) and the roll agree in the engine and its spec (the-moment), so the label was read in some other state | held (M21, 13 Nov), still not reproduced: the odds drawn and the odds rolled now read one table (Flight, where Battle had written the odds out a second time), and test/small/flight holds, over sixty fights, that every try said to be sure gets away and every try is drawn at the rules' odds for it | P1 | M21 |
| R10-08 | Paintings against the text, again: a sunny portico for a broken keep in a stormy evening, a cosy candle-lit gatehouse, a flag flying on a ruin, egg sacs after burning, Hepzibah young and with a lute for "a small grey woman in spectacles", a hillside "four storeys down" (R, S) | duplicate of OA-13 | P1 | see OA-13 |
| R10-09 | The way back, and some features (the spring, the tripwire), only under Go… and Look…; walking out of a mine was Go… in every room (S 96–97, 115–119) | duplicate of PR-08 | P1 | see PR-08 |
| R10-10 | The origin's thing is not an object: the dead man's map is not in the pack; light is not shown (S found the candle running out only in Wait) | **half fixed** (E221): the map is in the pack, held by `test/map-origin-find` (mutation-checked 13 Nov); light shown only in Wait remains | P2 | M21, playability |
| R10-11 | Text of what could not be seen: a new aim describing a flag in pitch dark (S 62); "You know now: the wire runs…" of a wire never mentioned (S 86); a clue to an undercroft never seen (R 107) | duplicate of NP-01 | P2 | see NP-01 |
| R10-12 | The fights are too easy, and an at-will heal (Love's Kindle, 1d3+10, under Wait → Tend) makes hit points meaningless; warned dangers (wolves "will not wait") do nothing when walked past (R, S) | partly: the at-will cantrip fixed (d63297c2, `src/rules/tended.ts`: a healing cantrip mends each member once between rests), held by `small/tended`; open: a six-hour rest or an hour at a healer gives back every spell · was: open: balance · M21 (rules, 13 Nov): diagnosed, `doc/architecture/mission-21/rules/recovery.md`: waiting restores nothing; a healing cantrip heals in the field every two minutes for nothing (30 heals, 48–74 hit points in an hour), and a six-hour rest or an hour at a healer gives back every spell; two small rules proposed, the lead's to rule · From R11-05: Wait → Tend → cast again and again; a level-1 cleric alone loses to a dog; a free bite before the fight opens; "What it cost" under-counts it | P2 | M21, rules |
| R10-13 | Stale offers: the adit's padlock offered from inside the adit; "Still to do: deal with the spiders' mother" after she was dead; the crypt door's force-and-pick beside "you have the key" (R 80, 100, 129; S 33–37) | **partly fixed**: a lock the company holds the key to is no longer offered to be forced in Look… (E199); the adit's padlock from inside not reproduced on main (13 Nov: nothing of it offered inside, to a thief or a warrior), held by `way-back`; the mother's "still to do" open | P2 | M21, playability |
| R10-14 | Portraits reorder when someone joins, and a tap lands on the wrong person (R 61, 134); "Take your leave" by its number empties the talk (R 31) | **partly fixed**: the likenesses keep their places (E198); the leave by its number, open with R11-01 | P3 | M21, aesthetic |
| R10-15 | Most townsfolk have one line; the main aim (a lost sister) cannot be asked about except of one person, at item 13 of his topics, and his clue ("just inside, where the light gives out") is not in the Notes (R) | duplicate of R11-02 | P2 | see R11-02 |
| R10-16 | "The followed aim switched by itself" (S 128) | fixed: not a defect (S's own note 127 says S pressed Follow this); the followed aim is set only by `Undertakings.follow`, and `gold-follow` holds that nothing is followed until chosen | — | — |
| R10-17 | a1, the debt: once the nearest old place (Ísencepan) is spent, the aim goes on to "the next old place", Marsh Howe (region__w10). It is on the company's map, but `Itineraries.destinations` gives no plan to it, so no act sets out for it and the gold is lost at Mik's (gold survey, a1/debt, step 10; also LOST before tonight) | **fixed** (E208): a way told is a journey over the open country as told · held by `told-way` | P1 | M21 |
| R10-18 | a1, the order's errand: at the head of the steps the gold stops before the speaking door (gold survey a1/order, step 5; LOST before tonight too) | **partly fixed** (E209): the door is the aim's step; past it the gold stops before the riddle by design, and pointing at its clue is M21 · held by `gold-thread` (the barred door) | P2 | M21, playability |

## 23. Round 11's cold play (12 November, early)

Two agents played 0b04fa40 (with E190–E193): T, a dutiful cleric in a1 who followed the brothers' errand and saw it
through; and U, a wandering bard in a random world who gathered company and followed the players' trouble. Their
reports are in `mission-20/cold/round-11/`. These were fixed in the log:
- E194: gold past the pillar that teaches;
- E195: the map inside Neblalac;
- E196;
- E197: gold on the way back from the spiders, recurring;
- E198: likenesses reordering, recurring;
- E199: forcing a keyed lock, recurring;
- E200: the undercroft's letters, recurring.

Open:

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| R11-01 | Talk topics renumber after each answer: a number pressed for what had been there did something else, once informing on Heian by accident (U 66; R 64; T) | **fixed** (E205): a reply keeps its number through the conversation, and a digit presses the reply beside it; held by `test/talk-numbers` (mutation-checked 13 Nov) | P1 | M21 |
| R11-02 | Conversation cannot be steered: villagers have one stock topic; "ask me which, go on" with nothing to ask; no asking about one's own aim (the map, a missing man) of anyone but its giver (U, R) | open: content and design · From FH-15: talk is topics, not an exchange: the first hour's three or four people to hold an exchange with progression, one substantial NPC verified (M19-227). From FH-17: nobody but family can be asked about the main story; greetings copied word for word between people. From R10-15: most townsfolk have one line; the lost sister asked of one person only, at item 13 of his topics, and his clue not in the Notes. From AB-10: topics that change on repeat (98 % of the first town's are `once`). From AU-05, Kyr's talk forms: Says again (120 `_again` topics in Quittance); a Topic through a party member; questions with parameters; several-exchange topics; speaking through a window; Known as without its teaching; Seen when hides a person but not their greeting. Typed in M21: talk weighed by the engine (`small/talk-weight`), what a talk teaches (`small/talk-learned`) | P1 | M21, playability |
| R11-03 | A calling barely matters: a bard has no performing or persuading choices where they fit; "Sing for your supper" is under Trade and rolls persuasion, not Performance (U) | duplicate of RI-03 | P2 | see RI-03 |
| R11-04 | An aim waiting only on coin (the players' reckoning) draws no gold and says nothing of how to come by it (U 104) | open: with `AimAdvances.short` | P2 | M21, playability |
| R11-05 | Healing between fights is Wait → Tend → cast, again and again; a level-1 cleric alone loses to a dog; a free bite before the fight opens; "What it cost" under-counts it (T 54, 113, 114) | duplicate of R10-12 | P2 | see R10-12 |
| R11-06 | Prose templated across places: Lunwigil and Neblalac described word for word alike; a fountain and a statue with the same history; "then the road, then the road, then the road" (T 30, 123) | open | P2 | M21, playability |
| R11-07 | Text and timing: "By morning the factor's chair is bare" told at once, in the morning, of the wrong inn; Gosse doffing his hat outside, told inside (U 66, 176) | duplicate of NP-01 | P2 | see NP-01 |
| R11-08 | Dannel Hobb's "what he saw in the old quarry" offered only after the quarry was done, then gone; Rolen's "talk to the boy first" could not be followed (U 140–142) | open | P2 | M21, playability |
| R11-09 | Paintings and portraits against the text: the big top as a kitchen; two inns one hall; a lizardfolk companion painted as a human woman (T 113; U 78, 160) | duplicate of OA-13 | P1 | see OA-13 |
| R11-10 | No bed at Mossminster's guest-hall, though Wait says to get one of an innkeeper or a priest (T 87–93) | open | P3 | M21, playability |
| R11-11 | The domain screen's Continue overlaps the "Later:" spell line (T 08; R 08) | partly (unheld): fixed in the page (E202: many cards on a wide, short screen are square), rendered once at 1280 by 800; no spec | P2 | M21, playability |


## 24. After the cutoff (12 November, afternoon and evening)

The owner's messages after the cutoff: finish the integration, houseclean, recurring problems; then one resting scene
(no split universe), empty talk, the safe zone as the outer tenth; then land M20 and diagnose M21's test loop; then a
contact sheet of the screens. Fixes are E210–E221 in `mission-20/log.md`; the screens are `mission-20/studies/screens/`;
the test loop is `mission-20/test-loop.md`.

| Id | What | Source | Status | Pri | When |
|---|---|---|---|---|---|
| T24-01 | Two of ten suite shards run to the job limit (45, then 60 minutes) on the integration branch, in every run since the standing scenarios came in; their files' times are never kept, so the shards never rebalance. A spec that hangs synchronously (no test timeout fires) is not ruled out | CI 43272764782, 43280749973 | **found and mended**: `all-in-one-world` ran into its own 25-minute timeout; each province's install costs more the more are installed (1.4 s to 14.6 s, quadratic in all); now teleported to each gate and run with the long descents (test-loop.md §3a). Why installs grow is M21's | P1 | — |
| T24-02 | The test loop is ≈ 86 s before touched specs; its quick suite spends 321 CPU-s on 38 CPU-s of work | test-loop.md | fixed: `check:fast` with `test/small` (tiny Kyr worlds); the push lane it named is gone, the whole suite running on every push since 2ce8c468 (`mission-21/validation-plan.md`); a process fix | P1 | M21 |
| T24-03 | Go and Look are still pages in the panel beside their lens tiles; Look's list scrolls. The owner, after play: lenses "should leave the scene intact but more highly favor actions of those kinds to be promoted to the top four … otherwise exactly the same"; a place's badge should go there as a portrait opens talk; the lens highlight more subtle | the owner, 12 November; screens S1 | duplicate of CN-01 | P1 | see CN-01 |
| T24-04 | Three menu styles (led acts, conversation questions, fight tiles) | the owner, 12 November; screens S4 | fixed (e248e719): one choice row for every activity, held by `action-system` | P2 | M21 |
| T24-05 | The telling overflows the resting panel (badly on a phone: 666 px in 269) | screens S2 | open: narration volume (E219, E220 began it) **M21:** the narrator's typed budget (aesthetic integration e248e719): a place told in three sentences at a glance (2.4 a glance measured, none ≥ 5), the rest under More of the place, clues never held; not re-measured on a phone. | P1 | M21, aesthetic |
| T24-06 | The fight on a phone: foes' names cut, the third foe below the fold | screens S3 | open | P2 | M21, aesthetic |
| T24-07 | The fight's actions scrolled at every size; a beast's portrait did not fill its panel; the acting fighter wore a double ring | the owner, 12 November | fixed (screens §"Fixed"); the fight's composition since held by `test/fight-geometry-browser` (CN-06) | — | — |
| T24-08 | The standing modules' people written human in a dwarf or elf country; the reader a mage among dwarves; the curate a cleric among elves | CI on the integration branch | **fixed**: ancestry left to the templates; a generated people gives way to an authored calling (`Cast.person`), held by `test/overlays` ("gives way to an authored calling", mutation-checked 13 Nov) | — | — |
| T24-09 | Talk persists between places (a dead foe's likeness shown in the next room) | screens S7 | open: design | P3 | M21, aesthetic |
| T24-10 | The CI never keeps the parse store; every job parses every text | test-loop.md §3 | fixed: the parse store kept between CI runs (`.github/workflows/ci.yml`, actions/cache of node_modules/.cache/kyrie-parse); a process fix | P2 | M21 |
| T24-11 | `Campaign.install` of a province costs more the more are installed (quadratic over a world's provinces) | test-loop.md §3a | partly (unheld): explained (`mission-21/world/construction.md` §2, measured by `world/tools/t24-11.ts`) and reduced (ten installs 31.6 → 14.2 s, Experiment B); no spec bounds it | P2 | M21, lead |
| T24-12 | The terminal's numpad shortcuts (7/9/1/3) shadowed the numbers 1 and 3 of its four choices: "1" did the third | headless terminal, 12 November | **fixed**: numbers alone; held by `small/terminal-piped` (13 Nov, mutation-checked) | — | — |
| T24-14 | Cold review A (headless, integrated build, a1 kin warrior, 94 commands): the terminal's foreground left out the question an aim waits on (only under `all`, eight times); its fight renumbered the moves each turn (the key for Cleave became Flee) and showed internal ids | review-a/report.md | **fixed**: a talk's leading question is offered as itself (`Promoted.inside`); the fight's moves in one order and by name; no ids; held by `small/terminal-piped` (the question) and `small/terminal-fight` (order, names; 13 Nov, both mutation-checked; the strike first had been by its name, and "Melee Attack" came fifth: fixed) | — | — |
| T24-15 | Review A: time said against time spent: the 8-minute road took about 90 minutes; "Bury him · 1 min" took two hours; 1-minute moves cost 10 | review-a T15 (s-t14.json) | **fixed for the terminal** (where both were seen): it printed an act's ticks as minutes ("Bury him", `Time 120 minutes`, was one tick); it now prints `ActionTime.minutes`, as the page does. The road was a way into the next stretch of country, which the page offers only on the map with its journey's time; the terminal lists it among the ways at the walk's · held by `small/stated-time` (M21: the page, the terminal and the clock count by one measure) | P2 | — |
| T24-16 | Review A: contradictions: Odo "has said nothing since the ditch" just after a story; the aim says "the dead are laid" with more dead in the next room; a key held and the door still to shoulder; "Odo binds the hurt" with none hurt; "find where they get in" dropped without a word | review-a T20–21, T72, T76, T40 · review-a T20–21, T72, T76, T40 **M21, in part:** "Odo binds the hurt" with none hurt is no longer told (a lit torch had counted as needing care; PL-09, `test/small/care`); the rest open | duplicate of NP-01 | P2 | see NP-01 |
| T24-17 | Review A: grammar of groups ("a cave spiders… is here", "a dead things raised"); the lantern filled twice; a nest searched says nothing; the antidote handed over is not offered when a companion is poisoned | review-a T48, T91 (s-t89.json) | fixed (13 Nov): the grammar: a band was as many as it had members, fallen or not (ScreenModel, `members.length > 1`); now it is as many as still stand, and down to its last "the last of the cave spiders is here", held by `small/last-of-band` (mutation-checked). The antidote: not membership (a joined companion is `memberOf` the company), but a kind the module only gives later (`Give antidote to actor.`) had no traits (ItemTraits read the starting kinds only), so it was never `consumable`: fixed, held by `small/given-remedy` (mutation-checked). And one spider is no longer called "the spiders in the old workings" (it "lies dead"). The nest searched (T48): a search the torch gave out on had told nothing; on main it says "Your light gives out…" and is not made, now held by `small/torch-out` (mutation-checked); one that finds nothing says so (`objects`). The lantern filled twice: a kind given later was named by the catalog ("Lantern") where a kit's things are "a lantern", so the act's words and its telling differed and both were said; given things are now named as a kit's, held by `small/given-named` (mutation-checked). | P2 | M21 |
| T24-18 | Review A: every notice job is a small dungeon of 2–4 rooms; after each the game moves to the next notice and never makes a larger adventure (the mound, the green-lit tower, the 30 rumours) the aim | review-a summary · M21 (13 Nov): as an aim is seen through, one successor is offered, never followed: the deed's consequence (the yoke to be hung at Millholm), else the strongest lead not followed (PL-06, ranks 1 and 2), held by `test/small/aim-successor` and `test/gold-thread` | in part: ranks 1–2 built; open: ranks 3–4 and the larger adventure (a region-history lead preferred after two or three notice jobs) · From PL-06: the proposal (`mission-21/playability.md`, PL-06) and `src/presentation/succession.ts`; the region-history bias left. From US-05: "Nothing more is asked of you" after a resolution; a lone company following the page earns no level in 200 steps | P1 | M21, playability |
| T24-19 | Cold review B (headless, pine, elf thief): a stated option ("Creep round … pinch out the black candle") could not be taken by its label; empty talk ("waits to be told why he should"; "one of him says" of a lone man); a hare said put in the hands not in the pack; the aim switched without a word and back; raw markdown (`*habit*`); `q` prints a stack trace; doubled way labels ("Take the road to the Lull to the way into the Lull") | cold/round-12/player-b.md | fixed, all but a replay (the page's italics: stress set in italics, e248e719) · was: mostly fixed (M21, 13 Nov): piped commands each played and `q`/end of input leave cleanly (`small/terminal-piped`); doubled way labels (`small/way-labels`); a band's line said of one (`small/one-or-many`); `*stress*` as runs, plain in the terminal (stress; the page's italics with the aesthetic work); the hare said to go into the pack as food, the boy off the road (`road-meeting`); no weather underground (`small/sky`); stated time = time taken (`small/stated-time`); empty talk and the aim switching unannounced: the terminal's PL-01. a label typed as printed, notes and all, is taken (`small/terminal-piped`). **Open:** the page's italics; re-verify by a cold headless replay | P1 | M21 |
| T24-20 | Names in the first half hour are old-tongue and foreign (Merscfaenn, Neblalac, Ísencepan, Gefeohtgaet, Lunwigil), though the starting region "once had a lot more Common names" (the owner, 12 November). Settlements in the heartland are Common (`CommonNames`); the country and land are Common only in the heartland, else the folk's tongue; what was built before the folk keeps the old tongue (`PlaceNames`). The first expeditions all go to old places | the owner | fixed (03776153, the lead, 14 Nov; the owner: "the starting names are to be _in Common_, built using the Common dictionary the `languages` module ships with"): in the starting country an old place is called first by its name in Common, made from what its old name means as the towns' names are, by the languages library's Common dictionary and the Common lexicon's joins (Moonwatch, Ironkeep, Rivergate, Hiddengate; Sorrow Watch where the words will not join), and its old name is learned where it is cut on the place; one that would be called like another site or a town keeps its old name. An English gloss ("the moon watch", 0bfd0ea5) was never merged. Held by test/old-names (ten countries) and old-names-a1; the sixteen specs that walk there follow. Still open: a human country's own name in Common | P1 | M21 |
| T24-13 | The road in described the ditched cart twice, nearly word for word (the meeting and the cart's own state) | headless terminal | **fixed**: the cart's state says only the sacks; held by `test/terminal-road-in` (13 Nov, on look, mutation-checked) | — | — |

## 25. Mission 21's playability list (13 November)

The independent playability investigator's P0/P1 list (`mission-21/playability.md`, its evidence and corroborations). Its
fixes were merged to main in batches 1–8; each row names the fast spec that holds it.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| PL-01 | The headless terminal hid the page's promises: no signals, no Follow, an empty conversation, the gold journey dropped | fixed; held by `small/terminal-piped` | P1 | M21 |
| PL-02 | A journey's fights were fought for the player (headless `travel:` legs used the automatic controller) | fixed; held by `small/journey-fight` | P1 | M21 |
| PL-03 | Blue ("to learn") on an act that teaches nothing: the wagoner's "Offer him a hand" | fixed; held by `small/blue-teaches` | P1 | M21 |
| PL-04 | A journey of five and a half hours arrives with nothing of the way told, and the arrival tells a fight's end before its start | partly fixed: a fight's end after its start; the long journey still untold; held by `small/fight-told` | P2 | M21, playability |
| PL-05 | Gold on whatever has its own act at the place the aim names, though it does nothing for the aim (the cairn at Seolforfyrd took the debt's gold; at Tenebraetumulo the … | fixed; held by `small/gold-at-the-place` | P0 | M21 |
| PL-06 | After an aim is seen through, nothing pulls: no aim held, the prize in hand and no way home led (T24-18) | duplicate of T24-18 | P1 | see T24-18 |
| PL-07 | Fights at the first places are trivial: the den's two zombies never land a blow; its leader falls to one hit | duplicate of CB-01 | P1 | see CB-01 |
| PL-08 | Gold on "Search" wherever the aim names the place, though nothing is hidden there (Seolforfyrd: "nothing is hidden here") | fixed; held by `small/gold-thread` | P0 | M21 |
| PL-09 | A companion "binds the hurt" of a company with nothing wrong but a lit torch: needing care held of any condition | fixed; held by `small/care` | P2 | M21 |
| PL-10 | In the pitch-dark cellar the way through the gnawed hole is offered, and gold, before any light | fixed; held by `small/gold-fight` | P2 | M21 |
| PL-11 | In the rat-runs, the rats the followed aim is to clear in front of the company, the gold is on the way back out to the empty cellar | fixed; held by `small/gold-fight` | P0 | M21 |
| PL-12 | At the place an aim is about, the gold goes through every door not yet taken: on Gothgiba's bailey (wren, wanderer) the fevered child's aim walked the store, the … | fixed for a town's doors (its typed form is the lead's to decide); held by `small/gold-doors` | P0 | M21 |
| PL-13 | Gold leads back to the aim's place, already visited, where nothing can yet be done, while the lead at hand (blue: where willow grows) is not gold | fixed; held by `small/gold-lead` | P1 | M21 |
| PL-14 | In an authored adventure, Follow this leads nowhere: The Lull's first aim names the inn and the stone in words only, and Sixways had no gold with the inn's door … | partly fixed: The Lull's first aim; about 56 authored aims still to author a target (the lint lists them); held by `small/aim-target-lint` | P1 | M21, playability |
| PL-15 | The talk ranked and gilded replies by their words: "Tell …"/"Pay …"/"would come along" led, and a reply whose words echoed the aim's was drawn gold beside the … | fixed; held by `small/talk-weight` | P1 | M21 |
| PL-16 | An authored adventure's hook not led: Tessary's eel-wife's notice on the Landgate board was only under `all`; reading a witness had stopped counting as learning (a … | fixed; held by `small/read-notice` | P1 | M21 |
| PL-17 | What Tessary Owes gives the company Davy's coat on its first step ("You take Davy Teazle's red coat" at the Landgate), though Nan is to hand it over later | partly (unheld): the stray Initially Give removed (data); no spec | P2 | M21, playability |
| PL-18 | The own-hex guard (E155: never across the country to a place in the company's own hex) lived only in the browser's map; the terminal and `serve` could not see the … | fixed; held by `small/own-hex`, `small/own-hex-engine` | P1 | M21 |
| PL-19 | At the dead man's map's keep the search the map marks is not led, and the gold goes to parleying with the hobs: dangers and the way back fill the three places | fixed; held by `small/gold-step-room` | P0 | M21 |
| PL-20 | A danger led "Talk to" onto nothing to say: the hobs' Gaffer, whose terms wait on a parley, offered only Attack and leave | fixed; held by `small/talk-when-asked` | P1 | M21 |
| PL-21 | The debt's gold at the inn was "Ask Osmund Pyle to come with you": every rule that pays a coin had made its condition the debt's | fixed; held by `small/debt-purse` | P0 | M21 |
| PL-22 | A chest picked open says only "stands open": the stolen chalice in it is only under `all` | fixed: the telling, and the take names what is taken ("Take a stolen chalice from a chest on the ledge"); held by `small/opened-box` | P2 | M21 |
| PL-23 | Inside the site a coin aim names, the gold walks every room not yet entered, into a spy-crack with nothing in it | fixed; held by `small/gold-site` | P1 | M21 |
| PL-24 | Kahitude's brothers' errand names Lapisrecs, whose writing tells the successors' history, not the history the errand waits on: the errand cannot be done there | fixed (playability batch 9): the works teach their makers' story at the way in (`DeepSites.marks`); five of ten seeds had an errand that could not be done; held by `test/errand-teaches` | P1 | M21 |
| PL-25 | a1 debt: at Marsh Howe's cleared den the foreground was only the way out, its search for the coin dragged in under `all`; one steel coin sent the company 71 minutes home and called Ísencepan "spent" | fixed: a coin aim is advanced by an act that puts coin in the purse (not a service), and the dead are offered what the aim waits on; held by `small/debt-purse`; the trifle and the "spent" wording in data | P0 | M21 |
| PL-26 | The terminal's foreground dropped the glance's quiet row of ways (by exit id): back at Ísencepan only the cairn, the gate only under `all` | fixed; held by `small/terminal-ways` | P1 | M21 |
| PL-27 | The debt's chain stops at the second old place: Marsh Howe searched, the aim still names it, Palusporta not led | fixed: the debt's aims go on over the three places told of (the last once the next is been to and left); held by `small/debt-chain` | P1 | M21 |
| PL-28 | kite wanderer: the fever followed in Newmeet's crowded market, nothing gold, the mother not on the page; asked, still nothing, herbs on sale a door away | fixed: sellers of a kind the keeper wants lead, buying it advances; held by `small/fever-shop`; the mother still off the crowded page (P2) | P0 | M21 |
| PL-29 | A companion (Edda) still told asleep on the step she left | partly (unheld): fixed in data, no spec; left (P2): her warrior's gear at nine, the opaque "Speak with Edda" | P2 | M21, playability |
| PL-30 | In the page the first page said no goal and offered no Follow (the goal was said only of an aim followed; nothing is followed until chosen in the Notes) | fixed; held by `small/first-goal-unfollowed` | P1 | M21 |
| PL-31 | Gold on the unlikely confrontation in thorn's ossuary while the sure act the mage's lore opened is only red | open: proposal (`Act.odds`; prefer the likelier advance) | P2 | M21, playability |
| PL-32 | In the page at Merscstede the aim's person (Lindal) has a blue pip and is not in the foreground; only the rail's people icon is gold (the engine's glance has her gold) | contract fixed: `Glance.likenesses` (the aim's next step gold alone), held by `small/likenesses`; the page to draw from it (`WorldStage.seen` blended gold and blue into a pip that read blue) | P1 | M21 |

## 26. The owner's continuity report (14 November)

A human play attempt broke down quickly. The owner's words are in `mission-21/owner-continuity.md`; the plan for them
is `mission-21/continuity-plan.md`. These are existing M21 obligations (one game-native interaction system), not new
features. None is closed as a component migration until the whole ordinary action path is audited and shown in play.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| CN-01 | Look/Things, People and Places/Explore open as pages: a lens should rerank up to four promoted actions within the one resting scene, take no world time, and keep the rest a predictable expansion beneath | partly: the page half on main (lenses in the resting column, 2b18f6ca, merged 5345ccb0); the engine's Lens contract held by `small/lenses`; open until CN-08 shows the whole path in play · From T24-03: a place's tile goes there as a portrait opens talk, and the lens mark quiet (both done 12 Nov) | P0 | M21, aesthetic |
| CN-02 | Inside a building the world map opens, with a confusing Back and no way to other local places; overland travel offered that bypasses the site's graph | open (page); engine: `enclosed`, nothing overland offered from inside (`Itineraries.shown`), the way out the aim's (`AimRoute.outward`), held by `small/compass` | P0 | M21, aesthetic |
| CN-03 | In an enclosed site the Map control should be a local compass: the next known place worth going, or the way out, along known traversable ways (barriers, unknown passages, time, interruptions respected); outside when the known opportunities are spent; neutral arrows, chevrons, route lines | open (page); the engine's Compass contract landed (`out`, `next`, `exhausted`; routes walked by travel:), held by `small/compass` | P1 | M21, aesthetic |
| CN-04 | World actions drawn in unrelated treatments: raw text links and old buttons on the resting scene and the Wait page; a census of every surface (scene, lenses, talk, look, search, wait, local ways, Pack, things, fight) onto the one action system and its availability/targeting contract | partly: one action system held by `action-system` (every act carries data-act, no fictional act a bare link); the census (`aesthetic/census.md`) still lists link-like rows (the way back); the fight's pace acts in the contract, held by `small/fight-pace` | P0 | M21, aesthetic |
| CN-05 | Wait is its own page: a compact time lens (wait a little, watch, listen, rest, wait for something) whose opening takes no time | partly: the time lens in the page on main (2b18f6ca, merged 5345ccb0); the waiting acts as the lens's set, held by `small/lenses`; open until shown in play with CN-08 | P1 | M21, aesthetic |
| CN-06 | Combat: legacy controls beside the new; the highlighted menu becomes a horizontal row; a target's card grows taller and bars cross the painting; details injected into buttons; layout jumps between target and action states | fixed for desktop and tablet: one fight composition on main (86a57fa3), held by `test/fight-geometry-browser` at 1280×800 and 820×1180; the phone is T24-06 | P0 | M21 |
| CN-07 | Personhood drawn with a pink pip close to coral: people need no opportunity colour; atlas colours only for grounded opportunities (knowledge, recruitment…); gold only for the followed undertaking; no new colours for routing or categories | fixed: no aspect for being the life of the place, held by `small/person-aspects`; people marked neutrally in the page (86a57fa3) | P1 | M21 |
| CN-08 | One end-to-end interior scenario shown in the page on desktop and iPad: lens switching, promoted actions, looking at a thing, talking, the way out, back to the town, a fight with target changes, and context restored after | partly: the walk headless, held by `test/interior-walk` (on main); the browser walk at both sizes (93cb4963, `interior-walk-browser`) on m21-look only, not merged | P0 | M21, aesthetic and playability |
| CN-09 | A page with one choice and no stakes drawn as a webapp button ("Go on" after the road meeting): the engine says what a page is: no act at all (the browser moves on by itself after a reading time, the terminal continues), or one act that matters, drawn by the action menu in its atlas tones (held where it is a challenge); and less narration on such pages (the owner, 14 November) · 14 Nov: a design preference, not a blocker (P0 kept for what stops play or lies) | open | P1 | M21, aesthetic |
| CN-10 | Creation asked for the specific trade within its kind: ask the kind of life only, the trade the one that suits the calling, backfilled later in play; one creation flow in the engine for every client (the owner, 14 November) | duplicate of TB-09 | P1 | see TB-09 |
| CN-11 | The Encyclopedia as one surface of parchment and ink: its type, rules and margins on a parchment ground, its illustrations harmonized with that surface (ink and wash, not photographs pasted on it), readable on a tablet (the owner, 14 November) | open | P2 | M21, aesthetic |

## 27. The owner's terminal ideas (14 November)

The owner's words are in `mission-21/owner-terminal.md`: the terminal as the cheapest place to catch an oververbose,
misleading, repetitive or semantically inconsistent presentation. Taken by the lead.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| TM-01 | A deterministic walker over seeds, backgrounds and play styles that measures the real automatically shown scene prose per run (average, median, worst), failing a run that averages over three sentences; scene narration kept apart from looking, outcomes, talk and reference screens | duplicate of TB-04 | P1 | see TB-04 |
| TM-02 | Every command reprints the place, the day, the hour and the familiar surroundings: arrival briefly, an act by what happened and changed, a look whole; the clock, weather, aim and status only when they change or are asked for; checks for redundant narration and repeated static context | partly: the terminal's half fixed (an act told by what came of it, not the place again, held by `small/terminal-walk`); the page's (2660e8d3, the hour, weather and day only where they are news) on m21-look, not merged | P1 | M21, lead |
| TM-03 | ANSI colour semantically the browser's: one opportunity projection, the canonical palette (true colour, reduced and plain fallbacks); no label heuristics; no colour for being a person, for navigation or UI categories; no gold without a followed undertaking | fixed: true colour from the page's tokens, held by `small/terminal-colour`; one table of signs, held by `small/signs-shared` (TM-07) | P1 | M21 |
| TM-04 | The walker exercises every surface the fixture supports: lenses, expanded acts, looking, searching, talk, companions, following, local travel and routing, waiting, the pack, fights; the promoted few and the full set without a catalogue every turn | open | P2 | M21, lead |
| TM-05 | Cheap and meaningful: budget, parity and projection checks on tiny Kyr worlds in the fast lane; a few whole terminal playthroughs on real composition in the push or full tier; readable transcripts kept as review artifacts | open | P2 | M21, lead |
| TM-06 | `bin/kyrie adventure` runs the whole character creation (people, calling, sex, name, origin) instead of a random character | duplicate of TB-09 | P2 | see TB-09 |
| TM-07 | The terminal and the page draw from one shared game definition, especially in what they render: every glyph representable as unicode or emoji, a terminal fallback for every text-adjacent treatment, colour from the design atlas (the owner, 14 November) | fixed (37b0a6d9): one table of signs (`src/presentation/signs.ts`) for a way's direction, a way shut, each mark's words, the hold, what is perceived that way and a way with nothing new; each emblem and kind of place as one character (`emblems.json`'s `text`); the terminal draws marks, ⧗, a faint pip with "to gain, that way", and dim for nothing new; creation cards carry their emblems; colour stays Emphasis's (held to the page's tokens by test/small/terminal-colour). Held by test/small/signs-shared, which also fails if any client keeps its own copy. The rail's faint mark had said "someone who might join you" of every aspect. Not yet shared: the board's line glyphs (only their characters), the page's fight cards | P1 | M21 |

## 28. The owner's planar grand tour (14 November, night)

The owner: a mage with Plane Shift goes to each inner and outer plane, and the specs assert each plane's laws read and act differently, as low-order as the architecture allows, with lazy generation and determinism in mind (travel to the Plane of Fire and take fire damage each turn; every elemental interaction present and resistible, blockable or wardable). Given to the rules line after the descent repair (completion plan §4).

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| GT-01 | Every plane differs in play: an inner plane's law has an ambient effect by its element, per round in a fight and per watch out of one, through the ordinary damage pipeline (Fire burns; Water drowns without water-breathing; the Negative drains, stopped by death ward; the Positive heals, with an overload; Earth to be judged); the outer planes keep their spell DC and gain whatever SRD trait is cheap to make real. Today a law is read only in combat and is ±1 spell DC; Earth, Water, Positive and Negative have none | open | P1 | M21, rules |
| GT-02 | Plane Shift as an executable effect to a named plane's canonical threshold (today `unsupported`: effect:planeshift) | open | P1 | M21, rules |
| GT-03 | The tour as specs: a catalog census (every plane has a law, every inner law an element, every element resistible by something in the catalog); a tiny world with the canon installed, one case per plane, asserting the law, the harm landing and a matching ward stopping it, on seeded dice; one integration case through a generated world and the House of Doors | open | P1 | M21, rules |
| GT-04 | Thorn's long descent dies to the drowned at the great wheel since batch 6 (3aac89a5, bisected): the record is to be played on from step 77, and wren, d4 and a1 checked, with the old places' Common names (faf6c6d9) | fixed (818159e2): thorn rests and lights its torch at the colonnade, hears the drowned and leaves the wheel to them; the four descents green on a dispatched run (43500210898) | P1 | M21 |
| GT-05 | A lethal band was heard only by a company carrying a light: in the dark, every observation was hidden but those marked as a sound or a touch, and DeepSounds wrote a band's sound with no aspect, so the drowned at thorn's great wheel fell, unheard, on a company in the dark colonnade (found in GT-04). Danger should warn, and attention be repaid: what is heard is heard in the dark, what is seen is not | fixed (rules-slice): a band's sound is written as sound; a sign (an ambush's) stays sight; test/deep-sounds-ambush | P1 | M21 |

## 29. The owner on the terminal as an instrument (14 November, night)

The owner's words are in `mission-21/owner-terminal-2.md`: the terminal as the fastest place to find where
Westernesse is verbose, repetitive, mechanically inaccessible, misleadingly coloured or unable to present its most
interesting possibilities. Folded into the fast-test, playability and aesthetic lines; the lead takes the engine
contract, the runner, the walks and the matrix; the page side goes to the aesthetic line.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| TB-01 | One projection, 1:1 semantic parity: the terminal and the page agree, from the same state, on what is available, which four are promoted, what each means (atlas facets, gold follow-state, multifacet), and what is known; no client heuristics for colour, importance or knowledge; held by a parity spec | open | P1 | M21, lead |
| TB-02 | Four promoted, everywhere: on every ordinary surface (creation, dialogue, the scene, the lenses, waiting, destinations), exactly four primary choices when there are four or more legitimate ones, the rest reachable by one intentional affordance, none invented; one attention hierarchy, each surface its own composition | open | P1 | M21, lead |
| TB-03 | A taxonomy of 10–12 action types for ordinary scenes, at most one promoted of each; combat and creation with their own diversity rules; an interaction-pattern language, not another score | partly: eleven action types, at most one of a kind among the four (`src/presentation/offer.ts`, bd011a34), held by `small/offer-four`; open: combat's and creation's own diversity rules, the interaction-pattern language | P1 | M21, lead |
| TB-04 | Blind terminal walks with the prose budget: fail a walk averaging over three sentences of automatic scene narration; severe outliers reported apart; repeated descriptions, dates, unchanged status and restated facts found; a qualitative literary review of the transcripts that says where each fault lies (authored Kyr, templates, observation projection, rendering) | partly: the walker and its budget built (TM-01's: `scripts/terminal-walks.ts`, held by `small/terminal-walk`; four kept walks average 2.67–3.00 sentences an arrival, `mission-21/terminal/report.md`, only 2–6 arrivals each); the blind runner's first find on m21-play (0dcd2c51); open: severe outliers reported apart, repeated descriptions and dates found, the literary review · From TM-01: scene narration kept apart from looking, outcomes, talk and reference screens | P1 | M21, playability |
| TB-05 | A stdio runner for agents: a human ANSI view and a structured protocol over the same player-safe information with stable action ids; seeds, builds, transcripts, clear failures; no separate simulation; tiny fixtures cheap, Westernesse in an integration tier | open | P1 | M21, playability |
| TB-06 | The corpus matrix across callings, backgrounds, fates, seeds and policies: available, promoted, selected and realized opportunities by atlas colour; action types and how often what matters is promoted; progress, discoveries, combat, companionship, retreat, loops, dead ends, completion; repetition; narration; what each build can perceive and do | open | P1 | M21, playability |
| TB-07 | A small type-constrained System 1 model, for category probabilities in promotion and separately as a light player policy; compared with deterministic walkers and reasoning agents for cost, reproducibility, diversity and the failures each finds; it never invents legality, facts, outcomes or atlas meaning | open | P2 | M21, lead |
| TB-08 | Information design through the terminal: arrival, an act's outcome and deliberate inspection as distinct moments; the minimum shown on arriving; what changes after an act; what belongs behind a lens; four legible choices with twenty discoverable; at least one literary or interaction improvement made because a walk showed it | open | P1 | M21, lead |
| TB-09 | Workflows are the engine's: the sequence of questions, legal selections, what a choice settles, and the progression between activities have one implementation, which both clients consume; the terminal a conformance test of the whole journey from no character (the owner, 14 November) | partly (26fe687f): creation is in the engine protocol (creation, set-out; EngineCreation over CreationFlow), the terminal makes a life only through it and plays the session it began; test/creation-conformance holds terminal and page-asked journeys equal. Open: the page's creation still keeps its own steps and rules (ReaderOpening), see workflow-parity.md · From TM-06: `bin/kyrie adventure` makes the whole life (people, calling, sex, name, origin): done, 26fe687f, held by `creation-conformance`. From CN-10: creation asks the kind of life only, the trade the one that suits the calling, backfilled later in play (`web/engine/creation-flow.ts`, held by `small/creation-flow`); the page's other steps still its own (ReaderOpening, `mission-21/workflow-parity.md`); the page drawn from the flow (59c5e944) on m21-look, not merged | P1 | M21, lead (the engine); aesthetic (the page's creation) |
| TB-10 | The terminal plays by the engine's frames as the page does (perform, travel, fight, follow), not by its own travel, fight and follow; talk and the fight hand offered by the engine | open | P1 | M21, lead |

## 30. The owner on the title and onboarding (14 November, night)

The owner's words are in `mission-21/owner-title-onboarding.md`: the title is where the owner bounced off before
beginning to play. The aesthetic line takes the page; the lead takes any engine step a presentation realizes.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| TO-01 | The title in the game's own interaction language: its choices as the modern highlighted menu (or a designed variant), Play with one strong, elegant gold focus (ceremonial gold at the entry only, the stricter gold of a followed aim kept inside), focus stable and immediate, no moving double-box decoration, no shifting geometry; teaching the grammar creation and play will use · 14 Nov: a design preference, not a blocker | open | P1 | M21, aesthetic |
| TO-02 | A quiet, legible foreground over a deeper, subtly moving background that answers the focused choice over a few hundred milliseconds (perspective, light, colour), the focus itself immediate; one exceptional transition, not many flourishes; art direction, not technology | open | P1 | M21, aesthetic |
| TO-03 | The studio stab, the title and creation as one designed passage: a few composed seconds of deliberate timing, typography and image flowing into the title and the title into creation; skippable; reduced motion respected | open | P1 | M21, aesthetic |
| TO-04 | One richer responsive interaction prototyped (the celestial observatory for a birth sign is the owner's example): the engine authoritative over the signs, what one means and the next question, the sky a visual realization of that decision, the terminal making the same choice in text | open | P2 | M21, aesthetic |
| TO-05 | A vocabulary of exceptional responsive interactions with particular things (a lock's mechanism, an armillary sphere, an instrument, an architectural mechanism): read-only projections of engine state and the player's focus, committed through the engine; rare moments in a painterly game, not 3D for every object | open | P2 | M22, aesthetic |
| TO-06 | Evaluated as one experience at desktop and tablet, by keyboard, touch and reduced motion, with the transitions watched in motion and not only screenshotted; beautiful at rest and in motion | open | P1 | M21, aesthetic |

## 31. The owner on a place worth returning to, and earned instruments (14 November, night)

The owner's words are in `mission-21/owner-returning-instruments.md`: knowing more about the world gives the player more
interesting ways to inhabit it. One bounded experiment across the lines: the playability line the place and its walks,
the lead the engine's instrument projection, the aesthetic line the page's treatment.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| RI-01 | One existing place worth returning to: repeatable, time-consuming investigation with context-dependent discovery and encounter tables; later visits reflecting what is established, time passed, circumstance and what the character knows or can do; durable discoveries, no resettable treasure, farming or generic repeatable quests; reachable and revisitable by reliable navigation | open · From AP-17: 70 of 80 stretches round Thornhaven hold nothing; meetings sparse away from the start; half an hour without a quest finds nothing; POI density never measured (rovers improved it) | P1 | M21, playability |
| RI-02 | Look, Examine, Search and sustained Explore as distinct acts in the existing vocabulary; something worth doing in an ordinary scene without a dungeon or a golden undertaking; the four promoted kept, further exploration through lenses and expanded acts | open · From AP-09: the Eye as a deliberate, sustained search with a risk of interruption; perception in three tiers (adventure-to-career §9) | P1 | M21, playability |
| RI-03 | Two different characters (calling, background, knowledge) discovering somewhat different possibilities at the same place, by skill-sensitive observation | open · From R11-03: a bard has no performing or persuading choices where they fit; "Sing for your supper" is under Trade and rolls persuasion, not Performance. From AB-09: a calling-specific read of a scene; a check against a crowd. From FH-21: a talker's gifts (Charm Person, Charisma 21) never matter in talk; no bargaining with hirelings | P1 | M21, playability |
| RI-04 | A few contrasting earned instruments (of: the sign and the moon's phase, the company's condition, expedition resources, the local compass, a field catalogue, progress at a non-quest activity), their values and what the character may know of them projected by the engine; contextual, optional and pinnable with a tiny default budget; honest precision; no new atlas meaning for markers, arrows or widget kinds; both clients agreeing | partly: two earned instruments projected by the engine for every client (4eb4130c), held by `small/instruments`; the rest open | P2 | M21, playability; lead for the projection |
| RI-05 | Proved cheaply and seen: a small Kyr fixture and terminal walks for repeat exploration, persistent discovery, conditional encounters, skill-sensitive observation and concise narration; a browser review of the treatment | open | P1 | M21, playability |

## 32. The obligations audit (14 November)

From `mission-21/obligations-audit.md`, an independent reconciliation against the code: obligations that had no
row. OA-05 to OA-11 are the external review's mitigations (`history/missions/20/review-mitigations-2026-11-12.md`),
which the M20 handoff told M21 to read alongside and which no row carried.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| OA-01 | `test/repertory-2.test.ts`: "leaves the larder early for a company that picks the bar loose, once" is `it.skip`, with no reason given, since the file was added in the anthology's merge (7 November) | open | P3 | M21, lead |
| OA-02 | `test/repertory-2.test.ts`: "ends in a farce of laundry lists when the morning's dice send the letter to Orlay in the wrong basket" is `it.skip`, with no reason given, since the file was added | open | P3 | M21, lead |
| OA-03 | `test/circus-journeys.test.ts`: "takes the egg home" is `it.skip`, with no reason given, since 04f57a53 (7 November) | open | P3 | M21, lead |
| OA-04 | `test/circus-journeys.test.ts`: "takes the Society its pair" is `it.skip`, with no reason given, since 04f57a53 | open | P3 | M21, lead |
| OA-05 | Review T1, a departure reckoning: before setting out, route and terrain, duration and arrival light, rations and certain costs, known danger, what the company knows, route alternatives; preview, journey and arrival agree | partly: the map's card says the time and the arrival ("About 6½ hours, arrive 2:20 p.m.", round 13 in the page); rations, light, knowledge and alternatives not shown | P2 | M22 (a new contract beyond M21's lines), playability |
| OA-06 | Review T2, interrupt only for a decision or a material event: a journey of several hexes gives a concise account of what was crossed and reveals its landscape; injected events stop it only with an act, a typed consequence or a change of route | open: a five-and-a-half-hour journey is still told by nothing (PL-04) | P2 | M22 (with NM-06, travel as passage), playability |
| OA-07 | Review D1, the combat diagnostic: for each first-hour band against starting companies, win, retreat and incapacitation rates, incapacitation before a first act, resources, harm to a rear member, recovery, forecast against outcome | partly: the placement report fights a1's 39 hostile groups against three small companies (`mission-21/rules/placements.md`, `placements-a1`); retreat, incapacitation before a first act, rear-member harm and forecast calibration not measured | P2 | M21, rules |
| OA-08 | Review D2, every fight reconciled from events: the forecast, the log, the turning points and "what it cost" projections of the same typed events; property tests reconcile HP, conditions, resources, deaths, experience and spoils | open: not started ("What it cost" under-counts, R11-05) | P2 | M21, rules |
| OA-09 | Review C1, an interaction contract for foreground people: why they are foregrounded, what addressing them can change, what they remember, when they have something new; every promoted likeness opens on an act matching its reason | partly: a danger led only where there is something to say (PL-20, `small/talk-when-asked`); a likeness's pip from the engine (`Glance.likenesses`, `small/likenesses`); the met person recognizing an outcome not built | P2 | M21, playability |
| OA-10 | Review U2, evidence with identity and provenance: an undertaking records what is known, who or what taught it, and which question it bears on, so the Book renders a lead's source without parsing prose | open: not started (with NP-03) | P2 | M22 (Notes as evidence, with NP-03), lead |
| OA-11 | Review P1, provenance carried through presentation: a promoted or marked act names its source, target and expected resolution, in a development view ("why is this gold?") | partly: what an act advances is typed (`AimAdvances`, `AimLeads`), and likenesses' aspects come from the engine; no diagnostic view, and no census over reference worlds | P2 | M21, lead |
| OA-12 | The compact, tense expedition (the M21 brief's Phase 2, "restore the dramatic core"; the retrospective's acceptance scenario; the review's one exemplary expedition): one light, one ration, one companion, a warned danger, a retreat and a return the town remembers; two builds play it differently; recovery costs something | open: not started; no document | P1 | M21, playability |
| OA-13 | Paintings against state: a painting chosen by a place's kind and the hour, not its condition, contradicts the text, and players "stopped trusting what I saw" (handoff Part 2 §1; review V1: compatible, else a plate, else none). Cites R9-12, R10-08, R11-09 and CP-01 | partly (9ed967f5: a painting is not chosen for a place it contradicts: data/paintings/fit.json read against seen.json by Fits, none painted where none fits; held by test/small/paintings-fit. Open: wrong subjects for a kind (the big top as a kitchen, a lizardfolk as a woman) and a census over the first country) | P1 | M21, aesthetic |

## 33. The first blind playtest (14 November, night)

The first genuinely blind playtest of the deployed build, `history/playtests/blind-2026-11-13/`; the decisions and
lines are in `mission-21/after-the-blind-playtest.md`.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| BP-01 | A foregone fight ("easily won") is six rounds of clerical clicking: offered as one consequential act that resolves it whole and is told in a sentence or two; round by round only for real uncertainty or on asking | partly | P0 | M21, lead (engine), aesthetic (page) |
| BP-02 | A fight's telling contradicts itself ("for 9", then "takes 1") and garnishes ("looks away solemnly" after a rat): each outcome said once; garnish cut or tied to the character and the moment | partly | P1 | M21, lead |
| BP-03 | Raw arithmetic beside the prose ("1 on the die, needing 11"): odds as words on the choice, the outcome as prose, the dice only on a deliberate look | partly | P1 | M21, lead (engine), aesthetic (page) |
| BP-04 | Warnings the world does not keep (a band that "will not wait" lets the company walk past) | open | P1 | M21, rules |
| BP-05 | The starting premise is not pursuable (Greyhold on the map, unroutable; "Enter Shaynof" returns to the road outside) · enter at the gate and the premise routed and gold on all eight a1 origins (test/premise-pursuable), on ci/play-6/7, awaiting CI | partly | P0 | M21, playability |
| BP-06 | A distinctive act is acknowledged, not dramatized (the thief's lock "hangs open on its hasp"): a sentence of texture and a due consequence, from authorable templates | open | P1 | M21, playability |
| BP-07 | The first undertown is stocked, not inhabited (rats, beetles, a centipede, a spider, most trivial or passed): fewer, more credible dangers | open | P1 | M21, rules |
| BP-08 | Classificatory labels on the visible page ("to learn", "to gain", "worth a look", "for you", "by the rules", "In play, by the rules"): off the page, kept for screen readers and the colourless terminal | open | P1 | M21, aesthetic |
| BP-09 | Press-and-hold to choose a creation card read as the game ignoring the player: a tap chooses; hold only for sustained acts, with a visible cue (the lead's decision, reversing the owner's earlier long-press direction on this evidence) · on main 9f30672a (look-5b): a tap chooses; the hold only for sustained acts, with a ring | fixed | P0 | M21, aesthetic |

## 34. The cold playtest of the deployed game (14 November, night)

Two cold runs of about 25 minutes each, on desktop and tablet: `history/playtests/cold-2026-11-14/`. The player's
summary: it "writes like a novelist and remembers like a slot machine." Already in the register: the hold to choose
(BP-09), aims buried and leading nowhere (PL-14), and a warned danger walked past (BP-04).

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| CO-01 | The chosen reason completed off-stage: a hired scholar's one answer set the Marblehollow inscription "read and set down", and the priestess paid it as seen through, with the place never visited. The reason completes only by the player's own act at the place it names; elsewhere it gathers clues · the errand completes only by copying within the work (test/origins), on ci/play-6/7, awaiting CI | partly | P0 | M21, playability (the laboratory) |
| CO-02 | The sister's trail ("look there, just inside" Darkgate) ends with nothing there: a reason's lead pays off where it points · the pin is where the innkeeper says, on ci/play-6/7, awaiting CI | partly | P0 | M21, playability |
| CO-03 | Towns read as one kit in a second country: the same innkeeper portrait and first line, the corn-store, the Merrowdale notice, a woodland paragraph word for word. Each was a New Game on its own world seed, so this is the kits' variety, not the seed collision (AX-02), which is between countries of one world | open | P1 | M21, playability (kit variety) |
| CO-04 | The world contradicts itself: a summer temple painted under "snowy"; one inscription spelled two ways (MARMORISCAVUS / MARMORISCAW); a flute pale wood, then a split reed, then playing; "I did not know he was still living" of a namesake standing in the room; an ice elemental with a fire portrait | open | P1 | M21, lead (painting season, inscriptions, names), rules (portrait) |
| CO-05 | A monster told dead ("5 was all it had left") returns with 1 HP and fights on: a death the log tells holds, or the log does not tell it | open | P1 | M21, rules |
| CO-06 | The death screen says the country goes on, then "Begin again in this country" rewinds it to day 1 with the padlock rehung: tell the truth about persistence, or make it true | open | P1 | M21, playability |
| CO-07 | Things that look answerable are not: the road pedlar ("someone is here") cannot be spoken to; the Gaffer names a price and no give is offered | open | P1 | M21, playability |
| CO-08 | The reason's own topic is the last of an innkeeper's nineteen ("Ask about your sister"): the player's reason first in every talk list · Root cause (14 Nov): the page already leads with weighty topics (TalkWeight); the origin's topic only says where to look and tells no fact that leads anywhere, so the engine cannot know it bears on the reason. The same finding as R10-15/R11-02. Fixed through the existing lead mechanism, with a spec over every origin | open | P1 | M21, playability (origins) |
| CO-09 | Travel: "No way known" offers only the town's places; on leaving a town the map's primary button is "Enter" that town; on a tablet the place card covers the target. Offer the adjacent country when no way is known | open | P1 | M21, aesthetic (map), lead (the act offered) |
| CO-10 | Mechanics in the prose: "gains inspired for 3h", "2 true damage", "under migraine", "You collect a garnet for Hild", raw `*habit*` asterisks in the Story. The engine's side is partly done: a condition's beginning and ending are told from data/voice/conditions.json where the condition has no words of its own (51 of the 184 without them, those a first hour meets), and "true" damage is no longer named (test/small/conditions-told). Still to do: the other 133, the collect line, and the page's asterisks | partly | P1 | M21, aesthetic (telling), lead (engine words) |
| CO-13 | The paintings' seen words are too thin for the fit rules to read: 37 of 245 scene paintings say anything of light, season or weather (scene-temple said nothing of its sun, flowering urns and cypresses, and so stood for the shrine of Danu under snow). Each scene painting looked at and given its light, season and weather | open | P1 | M21, an agent with eyes on the images |
| CO-11 | Generated names that break the register: "Hollywood", "Peahgiba", "Lent" | open | P2 | M21, lead (names) |
| CO-12 | A torch or candle burnt out in one search | open | P2 | M21, rules |

## 35. The independent architecture review (14 November, night)

`history/reviews/architecture-review-2026-11.md`, with its probes in `scripts/review-2026-11/`. Its quadratic
exclusive asserts are repaired (loading-boundaries.md §6).

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| AX-01 | `Geography.distances` is all pairs by a linear scan, about 1.2 s of every a1 start: a binary heap. `reach` runs on `MinHeap` with the old order of rooms kept exactly (identical on 400 random graphs with ties), about 0.29 s a start; what remains is all-pairs itself, and hours asked lazily is AX-07's design | fixed | P1 | M21, lead |
| AX-02 | Every generated country's module is seeded alike (`["a1","module","region",""]`), so the same person rolls the same body in every country: seed by installation id, with a transcript version bump. A drawn country's request carries its cell as its random identity (`WorldAssembler.beyond`), and the first country keeps its seed; the review's probe now finds 2 alike of 17, both fixed-stat ghouls (`test/countries-seeded-apart`, mutation-checked) | fixed | P1 | M21, lead |
| AX-03 | The shared rules are recomposed and revalidated by each of 39 installs, 15–20 ms each: compile once per edition, compose by reference | open | P1 | M21, lead |
| AX-04 | A new world, which is what a player gets, starts in about 10 s warm, 4.2 s of it re-parsing the 1.7 MB of Kyr the generators just wrote: generate to the AST, or keep the parse | open | P1 | M22, lead |
| AX-05 | The screen costs more than the turn at full scale (63 % of 0.5 s), and `EngineHost.travel` builds a full screen per leg of a journey | open | P1 | M21, lead |
| AX-06 | A save is 19 MB, 11 MB of it the compiled module | open | P2 | M22, lead |
| AX-07 | Exploring changes what is drawn (a cell drawn first, or after its neighbour, differs): global commitments from addresses, not from what has been realized (order-independent-generation.md) | open | P1 | M22, lead |
| AX-08 | The kernel is not bounded: the compiler imports the catalog, the parser imports Deem, grounding imports the creature pipeline; `engine-owned.ts` names 30 setting relations; an undeclared relation read returns nothing silently | open | P2 | M22, lead |
| AX-09 | The docs disagree with the code (parse-store's browser claim; "6.5 s warm" holds only for a replayed seed; `Costs` misattributes kit composition, and its session stage equals campaign) | open | P2 | M21, lead |

## 36. Empty words (the owner and the prose-density audit, 14 November)

Scope (the owner's brief), not defects found.

The audit is `history/reviews/prose-density-audit-2026-11-13.md`. The owner adds that empty words are an obstacle:
they make the game feel slower and more pointless. The long, detailed compound sentence is the engine's worst tic, and
a three-sentence budget does not catch it. Less text also helps performance at the limit.
- The measure is `src/presentation/clause-load.ts`. A heavy sentence passes 22 words or 3 joints.
- The terminal walks report the clause load of everything said unasked.
- `bun scripts/clause-census.ts [--first-hour]` is the editors' worklist.
- `test/small/clause-load` is the ratchet. It holds the first hour's heavy sentences at 1,256 of 7,275 (17.3 %). The
  whole authored corpus stands at 20.1 %.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| DN-01 | One turn, one beat in a fight, and three beats at its resolution: the decisive turn, the cost, the consequential discovery. The ledger only on asking (the audit's §1; BP-02/03's engine sides are landed) | partly | P1 | M21, lead (engine), aesthetic (page) |
| DN-02 | A transition composer above the scene budget: harm or interruption first, then the actionable change or clue, then who caused it, then one orienting sentence. The rest is held under its subject (the audit's §2) | open | P2 | M21, lead |
| DN-03 | The first hour's prose made lighter, starting with the laboratory's undertown (62 of 263 heavy), then the road prologues and origins, the roadstation and the town's neighbours. The ratchet is lowered as each lands | open | P1 | M21, playability (the laboratory) |
| DN-04 | Remote clock prose is told only if witnessed: chapter curtains and attended spectacles stay, while a remote event is told by its consequence (the audit's §4) | open | P2 | M21, playability |
| DN-05 | Greetings in a sentence or two, with their prices, history and rumours moved into named questions (the audit's §5) | open | P2 | M22 |

## 37. The first minute as a microscope (the owner, 14 November)

Scope (the owner's brief), not defects found.

`mission-21/owner-first-minute.md`.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| IG-01 | The opening (stab, title, creation, first scene, first acts) as one interaction instrument: focus, selection, preview, commitment, response, continuation. Read as controller inputs; one design language across title, creation and scene; hold-to-commit as the sustained-act ring. Deliverables: an unedited recording from the deployed page, a candid critique, and the smallest intervention prototyped | open | P2 | M21, aesthetic |

## 38. The first fifteen minutes, deepened (the owner, 14 November)

Scope (the owner's brief), not defects found. Folded into the laboratory: FF-02/04/06 first, the rest after Gate 1.

`mission-21/first-fifteen.md`: seven properties the laboratory proves, each by a walk and a spec.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| FF-01 | Time and absence matter: something in the undertown moves on without the company, and a returning player finds it changed and told | deferred | P2 | after Gate 1, playability |
| FF-02 | Knowledge enables better decisions: a fact learned above opens a better way below, and the walk that knows it fares measurably better | open | P1 | M21, playability |
| FF-03 | Retreat can be satisfying: going back up keeps what was learned, and a second descent is better prepared | deferred | P2 | after Gate 1, playability, rules (BP-04) |
| FF-04 | Two materially different solutions genuinely work (force and craft), both paid, and the world remembers which | open | P1 | M21, playability |
| FF-05 | NPC actions stay legible: every act in the first quarter-hour is announced by something seen first | deferred | P2 | after Gate 1, playability |
| FF-06 | Consequences create the next undertaking, in the world's own words | open | P1 | M21, playability |
| FF-07 | A dead character becomes part of the continuing country: the cairn, the pack where they fell, the merchant who remembers, the unfinished job as a lead | deferred | P2 | after Gate 1, playability |

## 39. A terminal a person can comfortably play (the owner, 14 November, late)

`mission-21/owner-terminal-play.md`. These are defects found in play, not new scope. They fold into TB and the interaction grammar.

| Id | What | Status | Pri | When |
|---|---|---|---|---|
| TP-01 | The terminal is miserable to operate as a person: whole observations and every action dumped. A human mode (automatic on a TTY; `--interactive`, `--headless`) with a navigable picker (arrows, j/k, Enter, back, unfold more), an economical view, and restrained colour. Headless stays plain. One EngineHost workflow for both | open | P1 | M21, terminal |
| TP-02 | The indicator grammar breaks with many actions, or several indicators on one: one dominant colour per action by a shared precedence table from the engine's aspects (gold strictly first, then red, then the atlas order), at most two icons, meaning without colour | open | P1 | M21, terminal (table and terminal), aesthetic (page) |
| TP-03 | Companionship as an icon rather than a colour: assessed with both clients side by side, then decided | open | P2 | M21, terminal, aesthetic |
| TP-04 | Instruments do not say what they report: the engine gives each a label and a gloss, and clients display and inspect them · Engine side done: each instrument carries a label and a gloss from data/voice/instruments.json, the sky's gloss adding what the rising sign means (sky.json); the terminal shows the label. Inspecting the gloss is the picker's work (TP-01) | partly | P1 | M21, terminal (engine side) |
| TP-05 | A tiny fixture of the awkward cases (many actions, overlapping opportunities, long labels at a narrow width, several instruments, actions changing after a commit, creation) for cheap regressions and review, and a real interactive session assessed as a player | open | P1 | M21, terminal |


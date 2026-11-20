# Sprint 3 — A second cold player can rely on what Westernesse shows and says

Dates: 19–26 November 2026 (planning-report.md §8). Opened 19 November on the plan audit
(audit-plan-2026-11-19.md): Sprint 2 is closed, its board kept below. Goal (§8, unchanged): opportunity marks, prose,
paintings, danger and consequences neither contradict nor over-promise the state beneath them. Beside it, on the
owner's word of 19 November: a focused drill into the live P0s, and the maturity track in its revised order
(maturity-track.md, "Revised order").

| ID | Kind | Why in this sprint | Acceptance | Owner | State |
|---|---|---|---|---|---|
| S3-0 | Investigation | Sprint 2's goal not yet shown by one clean run | One recorded clean run (`bin/kyrie review record`) of the eight beats for the warrior (drove) and the mage (weir), kept as traces, each beat named at its step | lead | closed (20 Nov, s3-run): one clean run each on wave-2, recorded live by `bin/kyrie review record`, no line refused, kept as traces (mission-22/s3-0/warrior and s3-0/mage, 53 steps each), every beat named at its step in mission-22/s3-0-run-2026-11-20.md: the warrior's danger now met (the conger in the gate-well, T40–T43, Carlin's shot), the gate shut (T47) and the reeve's tally north (T53); the mage's eight from the lease (T0) to the tally (T53). Thirteen defects met on the way registered as GR-01 to GR-13 (four P1). The replaying spec over these lines is S3-R1's |
| S3-1 | Investigation (E1) | OB-05, OB-17, FH-01 | Cold play 8, a robot on the deployed build (closes OB-05); a person if the owner recruits (§8 step 1); the post-play questions on marks and colours as §8 lists them | lead (an agent plays) | open |
| S3-2 | Investigation (E3) | AP-01, PB-24 | The false-promise corpus: cold plays 2–8, each case recording state, signal, act, result, contract (§8 step 2); `scripts/promise-fidelity.ts` on iscoed | lead | open (20 Nov, s3-run): `scripts/promise-fidelity.ts` on iscoed at wave-2, 30 turns each: the warrior exploration 26/26, knowledge 16/16, companionship 8/8, payoff 3/3; the mage companionship 12/12, knowledge 10/10, exploration 18/18, danger 1/1. The one break reported (Nan's shop talk, a ration) was the measure's, mended (runner-fidelity reads a ration as a payoff). Open: the cold-play corpus itself (cases from cold plays 2–8, each with state, signal, act, result and contract), not built |
| S3-3 | Defect (E3) | PB-24, AP-07, CL-33, HP-01 | Each corpus cause repaired in the projection, not in CSS (§8 step 3); HP-01's notice the first | lead | partly (20 Nov, s3-3): HP-01's corpus cause repaired in data: the green's two signs on the drove road (the reeve's notice, the one chimney) are leads with who to ask (askedOf), not aims; each story's aim on asking its giver; the well-post notice spent once its jobs are paid (FH-05); leads a record apart from aims (Screen.leads, US-07). The drove after the green holds its own two aims, the weir's mage the sea-gate alone (test/stories-apart, test/notice-spent). compat --quick world-moving (cold-4's led set-outs and one aim line, explained in the commit). Open: PB-24, AP-07, CL-33 (the S3-2 causal classes) |
| S3-4 | Defect (E3) | NP-01, NP-02, OA-13, CO-17 | The golden route's cases only: narration bound to perception, a painting removed where it contradicts (§8 steps 4–5) | lead | done (20 Nov, s3-45): the golden route painted and told as the company finds it: no dusk or moon by day, no daylight or windows underground, nothing clear in the rain, the drove's news heard only in Porthalen (test/golden-told, test/small/paintings-fit, test/scenery-kinds, test/named-held); NP-01, NP-02, OA-13 and CO-17 closed, their remainders split (NP-19, NP-20, OA-14, CO-19) |
| S3-5 | Story (E3) | WM-01, FH-08, CL-09, CL-46, CP-04 | The return verified: the dead do not speak, completed facts do not reset, a deed is attributed at its time; through save and resume (§8 step 6) | lead | done (20 Nov, s3-45): the return verified through save and resume (test/weir-resumed, test/crown-sold, test/features/world/threads-tied); WM-01, FH-08, CL-09 and CL-46 closed, their remainders split (WM-09, FH-24, CL-63, CL-64); CP-04 stays open (kit people's names carry no sex) |
| S3-P | Defect (P0 drill) | OR-91, OR-127 | Per-act cost to the owner's targets (pure simulation under 2 ms, the session's median under 20 ms, p95 and worst measured, incremental equal to full; P′ on the maturity track), and its browser half. OR-114, OR-94 and OPR-01 fixed (sprint audit, 19 November) | lead | open |

Revisits of Sprints 1 and 2 (the sprint audit, 19 November: six stories weak, sprint-audit-2026-11-19.md §1; the
owner, 20 November: "didn't the sprint audit suggest we needed to revisit stories from s1/s2 as well?"):

| ID | Revisits | What is weak | Acceptance | State |
|---|---|---|---|---|
| S3-R1 | S1-1, S1-4 | Cold plays 4 and 5 played locally, not on the deployed build; their pins replay the kept lines with the 19 Nov arrivals set aside (BeforeRooms), so the first town as shipped is pinned by nothing that replays a play | S3-0's clean run on the world as shipped, no arrivals set aside, for the warrior and the mage; a deployed-build cold play only once the first hour's P0 and P1 are burned down (the owner, 20 November) | open |
| S3-R2 | S1-3 | Reduced motion never checked; the phone frames kept only in /var/tmp | A CI browser recording of the opening at a laptop and a phone size, reduced motion on and off, its sheets checked in (TO-03) | open |
| S3-R3 | S2-4 | The warrior's pin moves the company past the barrow's halls (Barrow.enter), and the jar passes the king without the forewarning too, so the outcome the forewarning changes is not measured; the mage's pin is a generic human mage | A played spec where the forewarning changes what happens in the barrow, halls walked; the mage case as the route's elf mage with the hire at Gatesend | done (20 Nov, s3-r34): test/barrow-walked walks two companies of the drove life (Wenna, Carlin hired) from the mound's forecourt through the passage-grave and the halls by act id, ghouls and spiders fought; the warned is led from the long gallery into the embalmers' room past its banshees to the jar, and the king goes back from it and gives up the crown with no fight; the unwarned is led nowhere near it, walks on, and goes down when it lifts the crown. The mage's case: test/weir-hire, Ilse hiring Gesk at Gatesend, the corn-store's rats reckoned grave alone and fair with him |
| S3-R4 | S2-6 | "A first-level abjurer alone wins 90.5 % of 200" held by no spec; hireling-viable's mage loses alone, a different mage | The route's elf abjurer's odds alone and with the hire pinned as measured; the hire at Gatesend offered and affordable on the weir route | done (20 Nov, s3-r34): the route's mage is a diviner, not an abjurer; against the corn-store's two rats, 200 fixed seeds, she wins 55 % alone and 100 % with Gesk (test/weir-mage-odds, pinned 47 to 63 % and at least 95 %); Gesk told of in the guest-hall from the start, 6 coin of her 7, taken on (test/weir-hire). The 90.5 % census figure does not reproduce today (CB-03) |
| S3-R5 | S2-7 | ST-03 open (Nest at the gate); ST-04's contradictory status | ST-04's stale clause withdrawn (done by the audit's edits); ST-03 closed or carried with its reason | partly |
| S3-R6 | S2-3 | HP-01's remainder: the drove green still gives two stories' aims at once | One principal aim and two kept prospects after the first scenes (S3-3, on its branch, 20 November) | open |

S3-H, the sprint audit's hygiene (19 Nov, s3-1): `scripts/promise-fidelity.ts` runs on iscoed (the drove by default; `--as`, `--origin`); test/small/runner-labels' factor buys, so CL-05's sale half asserts a real sale and fails if the label rule breaks. ST-04's stale line was withdrawn by the audit's own edits (7cdc72190); S2-1's row no longer names CL-52 open.

Capacity reserve: CL rows from cold play 8; SI-08 (a look before a one-way drop) and AP-13 (danger remembered), the
lone-novice deaths. Not in Sprint 3: WD-16, careers. Carried from Sprint 2: HP-01 (S2-3's remainder, in S3-3), Nest at
the gate (ST-03), WD-16 (to MT-07 or M23), CL-31 (re-blocked on AT-02, the atlas hold lifted on 18 November).

---

# Sprint 2 — Make one first hour worth completing (closed 19 November)

Closed 19 November (audit-plan-2026-11-19.md §2): every row that can be met under the stop rule is met or reduced to
a one-file remainder; the goal is not yet shown by one clean run (S3-0), and two of the last three cold plays died
suddenly (S3's reserve). S2-1's text still names CL-52 open: it is fixed.


Dates: 19–26 November 2026 (planning-report.md §7). Sprint 1 is closed: its board is kept below.
Goal: the golden route gives the player a clear desire, an intelligible first step, meaningful preparation, a
consequential expedition and a reason to return or continue, for the representative and the alternate character.
Measured first by a sixth robot cold play on the revision after Sprint 1's landings (the same route and protocol,
against 6.5), then by the beat map below.

| ID | Kind | Why in this sprint | Acceptance | Owner | State |
|---|---|---|---|---|---|
| S2-1 | Investigation (E2) | Sprint 1's fixes must be measured, not assumed | Cold play 6 (the drove life, the representative character) at the revision after the 18 November landings; report in cold/, defects registered | lead (an agent plays) | done (18 Nov): cold play 6 at c7fa2382, **5/10** (cold-6-report.md): its first 37 turns "a 7", then killed in one move by a fight it never saw (CL-51, fixed; CL-52, the warning, open then and fixed since); defects CL-51..CL-56 |
| S2-2 | Investigation (E2) | The plan's first step: know the route before changing it | A beat map of the golden route for both characters (offers, acts, telling, aims, resources, harm, persistent facts against the eight beats) | lead | done (18 Nov): beat-map.md (scripts/beat-map.ts): the mage's route meets seven beats, the warrior's five; both lack the return (8), the warrior's preparation changes nothing (3); order: S2-5, S2-4, S2-3 by CL-45 |
| S2-3 | Defect (E2) | FH-05, HP-01, HP-02: aims before desire | A new aim only once its desire is met or work sought; the beat map's aim count before and after | lead | partly (19 Nov, burn-7): the beat map replays both kept plays again (the first town's new arrivals set aside, test/support/before-rooms): the warrior to T90 holds 2–4, the mage to the end 4 at T1, then 5, 6, 7 at T11, T16, T60, each later aim of a question put (Aldous Fenn's chain, the steward's road) or a thing found (the sawn pin); the notice's three (HP-01) the one cause left. Burn-6: measured again on the beat map (scripts/beat-map.ts, cold plays 4 and 5's lines at ea874f27; the replays leave the recorded plays at T21 and T28, the undertown having moved): the warrior holds 2–4 aims to T31 (18 Nov: 2–4), each new one with what it comes of told in the same turn (Owain's count; the one chimney and the reeve's notice at the landing, CL-45; the rhyne's four); the drove's aims say only what was told (CL-45 fixed); the mage holds 4–6 to T27 (18 Nov the same, then 7 from T60). The one cause left: the notice on Gatesend's well-post makes three held aims at T1 (1 to 4) of jobs nobody has offered (HP-01), written in the undertown's template (data/generation/town/undertown.kyrt, the lead's). Before (18 Nov): narrowed by the cold-play rows (CL-45) |
| S2-4 | Story (E2) | One preparation that changes the odds (beat 3) | One ordinary act (asking, buying, recruiting, learning) measurably changes the expedition, for both characters | lead | met (19 Nov, burn-6): for the warrior, asking the innkeeper before setting out makes the bane an aim, "Find the jar of day the embalmers kept, before you go down to the king", held until the jar is carried; carried, the king goes back into the deep grave and the crown is had with no fight, where a company not forewarned has no such aim and the king rises (test/barrow-forewarned: the descent's two ends, the halls between not played); every deep purpose's bane is so (data/generation/deep). For the mage, the hireling (S2-6: 90.5 % to 100 % of 200 rat fights). Before (18 Nov): the saying told, and nothing after it changed |
| S2-5 | Story (E2) | Beats 7–8, partly met | A decision changes a person, place or opportunity; the return is a changed reception; pinned through save and resume | lead | met (19 Nov, burn-6): a decision changes a person and a place: what was found against Mardle said before the reeve on the green, with Mardle and the customs-man there, a ruling with a cost (ST-02: the ink turns him out and his family with him; the drowned four leave him his book and the reeve watching it; test/drove-reeve); the return a changed reception (the landing says which); pinned through a save: cold play 4's lines to Bran out and the drove sold, kept, taken up in a fresh session, the same digest, Bran out, the drove sold, his share paid, and the road west and the landing's word still offered and said (test/drove-resumed). Before (18 Nov): the drove life's return and its rebuild (ST-02), the weir life's sea-gate claim (ST-03), the handoff (ST-04) |
| S2-6 | Defect (E2) | CB-01, CB-03: the alternate character's viability | The mage's route viable by preparation, avoidance or help, a warning naming help that can be had | lead | met on this route (18 Nov): a first-level abjurer alone wins 90.5 % of 200 fights against three rats, 100 % with a hireling; a deadly fight says its odds and the help to be had (CL-52) |
| S2-7 | Story (E2) | The owner's structural critique (18 Nov): the route's scenarios are situations, not stories | Story sheets (ST-01) for the four Iscoed scenarios; the held drove (ST-02) and the sea-gate (ST-03) rebuilt from theirs: a moving actor, an opposing claim, a collision, a choice with a cost, an aftermath; the handoff between them (ST-04) | lead | partly (19 Nov, burn-6): all four story sheets written (ST-01 fixed): the cold pans' claim is the sea-gate's cut, the Tower reclassified as an institution; ST-02 met with the collision before the reeve, ST-03 and ST-04 built; the cold pans rebuilt from its sheet in part: a second claim on the boat (Ffion Wyn's cold pans beside the salter's, her rakers laid off on the third day), a choice with a cost (the whole load to the salter, or a third to her: two chimneys, ten coin and not fifteen, no work after) and its aftermath on the landing (test/pans-shared); the Tower's tally no longer claims a chain the company did not make (test/iscoed-roads). 19 Nov (burn-7): the pans tied to the sea-gate's cut (Ifan's word keeps the boat off it; shut, it is poled down with no check; poled by day, Ifan says so) and to the tally (the reeve writes in which pans burned: test/pans-cut). The gate's crisis chosen in the four (ST-03: the boat under the gate, test/sea-gate-claim). Open: the Tower's own reckoning of the tally past the march (WD-16, recorded and not built under the stop rule) |
| S2-8 | Investigation (E2) | Sprint 2's fixes measured by a third character | Cold play 7 (a dwarf cleric, blind, at 820d44e4): report in cold/cold-7-report.md | lead | met (19 Nov): 6 of 10, from cold play 6's 5; the drove opening solved by evidence and well told; lost to a camp ambushed on the road and a fight pressed to its end (CL-58, open; CL-59 and CL-60 fixed; CL-61) |

Stop rule (the plan's): no generalized career, faction, crafting or quest system to mend a missing beat. Running
beside it: one SRD slice at a time (SR-01); the maturity track steadily, one step at a time (the owner, 18 November:
"steady progress against maturity goals especially"), its compatibility harness (MT-06) first, before any change that
moves generated worlds.

---

# Sprint 1 — Observe a cold player; repair the first passage (closed 18 November)

Dates: 18–25 November 2026 (planning-report.md §6). Sprint 0 is closed: its board is kept below.
Goal: a cold player reaches the first meaningful action without accidental interruption, unexplained control changes
or a transition that breaks confidence; and their top causes of confusion are fixed.
As held by the owner (18 November, night): no new commissions; robot cold plays first (agents only: the game is not
ready for people), fix their top causes, deployed recordings, a second cold player; close the sprint and the register
as fast as possible.

| ID | Kind | Why in this sprint | Acceptance | Owner | State |
|---|---|---|---|---|---|
| S1-1 | Investigation (E1) | Cold play 3 (6/10) named the causes; the fixes must be measured, not assumed | A fourth robot cold play of the golden route on the deployed revision, by the protocol below, its report in mission-22/cold/ and its defects registered | lead (an agent plays) | done (18 Nov): cold play 4 at f087ede1, **6.5/10** (cold play 3: 6; cold/cold-4-report.md): three stories finished, each by a clue found; its one change, every scene says in its own prose what is there and what is happening; 30 defects as CL-42..CL-50 |
| S1-2 | Defects (E1) | Cold play 3's top causes: the four not leading with the pursuit, unwarned and untold harm, money and prices unsaid | CL-12, CL-13, CL-14, CL-17, CL-18, CL-22, CL-24, CL-25, CL-29 fixed and pinned; CL-04 and CL-05 closed on their pins | lead | done (18 Nov): all fixed and pinned; CL-25 fixed |
| S1-3 | Obligation (E2) | TO-03/TO-06/OR-23/OR-77: the passage from studio to first scene is judged in motion | One deployed recording (frames) of studio → title → creation → setting out → first scene at a laptop's size and a phone's: no flash, no flicker, no unexplained black; findings registered | lead | done (18 Nov): recordings/s1-3-opening.md: no flash, no flicker, the painting up behind "Telling where you are"; the one defect left is setting out's length (10.8 s laptop, 7.8 s phone: OR-08, OR-23) |
| S1-4 | Investigation (E1) | One player is an anecdote | A second robot cold player on the alternate character (elf mage, a life of learning: the scholar's, which begins at Gatesend) on the same revision | lead (an agent plays) | done (18 Nov): cold play 5 at f087ede1, **6.5/10** (cold/cold-5-report.md): the gate shut by search, light and a hired hand with no fight; loses on a world that does not answer what was done; 43 defects as CL-32..CL-41. Triage of both plays (at most three causes): the scene says what is there and what happens (CL-42, with CL-44's king), the world answers what was done (CL-32), gold that loops and the wall (CL-34, CL-33); and the chest that refuses its clue (CL-43, P0) at once |
| S1-5 | Defect (E1) | DN-06, only for the first passage | The opening's lines the cold players quote as generic or obstructive rewritten (the wagoner done: OR-75) | lead | carried into Sprint 2 where the route needs it: the wagoner (OR-75), the scholar's arrival (CL-41), the search and the store (CL-39, CL-50), the fight's words (CL-48) done 18 Nov |

Capacity reserve: defects that block the cold players only.
Running beside the sprint, on the owner's word of 18 November: the SRD spell slices (SR-01) and the variety
experiment (OR-84), one agent each; neither touches the golden route.


**Closed 18 November.** Two robot cold plays at 6.5/10 (cold play 3 had 6); the passage recorded without flash or
flicker; every input answered at once and a long press's commit held (OR-91); the cold plays' triage (CL-32..CL-50)
worked beside the owner's P0s (the trust contracts, the riddle as an engine focus, the false gold). Not met, and not
this sprint's to meet: setting out's length (10.8 s laptop, 7.8 s phone; warm start 6.2 → 4.7 s by compiling once) and
FH-01 (no person has played: the owner's to recruit, Sprint 3). Live rows rose from 417 to 465 in the sprint, the cold
plays and the trust contracts registering faster than the burn-down: noted, not the measure (planning-report.md §13).

---

# Sprint 0 — Restore planning control (closed 17 November)

Dates: 17–19 November 2026 (two days)
Goal: one trustworthy live-item view, and the exact first-hour test route and player protocol chosen, before further
implementation (planning-report.md §5).
Deployed demonstration: `bun scripts/register-state.ts` and `bun scripts/register-tickets.ts` agree; STATUS points here;
the golden route below plays on the deployed page.

| ID | Kind | Why in this sprint | Acceptance | Owner | State |
|---|---|---|---|---|---|
| S0-1 | Chore (E5) | Two readers disagreed (718 vs 754 rows; one state word anywhere vs the leading disposition) | One parser (RegisterTickets.rows), one state model; hygiene reported and pinned (test/small/register-count) | lead | done: 755 rows, 417 live by both; 0 unknown leads, 0 closed-yet-open, 0 ids twice |
| S0-2 | Obligation (E5) | Landed work still read live | Live PA/OR/Phase A rows checked against commits since the M22 report; completed scope closed, remainders split | lead | done: PA-02, PA-03, OR-32 closed with evidence; PA-13 split from PA-03; OR-28 amended; 21 statuses given their lead |
| S0-3 | Defect (E5) | STATUS named Mission 21 | STATUS says M22 is extended for acceptance and links this plan | lead | done |
| S0-4 | Decision (E1/E2) | Repeatable comparison needs one route | Seed, origin, characters, expected beats recorded below | lead (owner may overrule) | done, below |
| S0-5 | Chore (E1) | Cold participants are scarce evidence | Prompt, consent and recording, observation sheet below | lead; recruiting is the owner's | done, below |

Capacity reserve: defects that block the demonstration only.
Not in scope: visual redesign, careers, SRD breadth, new interaction framework, bulk burn-down (planning-report.md §5).

## The golden first-hour route (S0-4)

**World `iscoed`, the drove road** (`?world=iscoed`; the strategic atlas's reference country, mission-22/world/slice.md).
A life begins on the landing at Porthalen as the customs-men take Bran, his tally-stick in your hand. The three
invitations stand in the world whichever life begins.

- **Representative character:** a human warrior, the default name, the past "roads" (so the drove life begins: WD-11).
- **Alternate character:** an elf mage, past "learning" (the weir life): exposes the fragile caster (OR-64's warning,
  CB-01) and a second start.
- **Expected beats, not a script** (planning-report.md §7):
  1. *desire*: Bran taken, the tally-stick in hand;
  2. *first step*: the customs-house, someone to ask;
  3. *preparation*: a shift at the salt-pans (a wage), a hand recruited, a light bought;
  4. *departure*: out of Porthalen to the rhyne or the sea-gate, legibly;
  5. *danger*: the gate's dark well, the flood's clock;
  6. *discovery*: the drowned four in the rhyne, the forty written over thirty-six, the sawn pin;
  7. *choice and consequence*: Bran freed or sent north, the gate shut or the fen flooded;
  8. *return*: a changed reception at the landing; Bran's pointing west to Brynach.
- The world slice's steps 3–5 (the gate's lower works, the fen-boat and salt-licence, the roads out) are in progress and
  serve beats 5–8. Until they land, beats 7–8 are partly met.

## The player protocol (S0-5)

Three cold participants: one for diagnosis (Sprint 1), two for confirmation (Sprints 3 and 5). Recruiting them is the
owner's. Blind agents (OB-17) play the same protocol through the runner as a cheaper first pass, never instead of a person.
A blind agent's play is set up and run by `scripts/cold-play.sh --n <n> --world <w> --as <race/calling/name[/past]>
[--rev <rev>] [--agent none|claude|codex]`: a worktree at the revision, the runner fed from the play's lines.txt, the
player's two tools and this prompt (scripts/cold-play/prompt.md); `--agent claude` holds the player to those tools,
so it is blind by what it can do. `--stop <dir>` ends the runner.

**The prompt, read once and not explained:** "This is a game in development. Please play it as you would any game you
had just found, for as long as you want to, up to an hour. Think aloud if you can. I won't help unless you ask, and
if you ask, I'll note it."

**Consent and recording:** the participant agrees to a screen and voice recording kept with the mission's evidence and
quoted in its reports; they may stop at any time. The build's revision and the device are recorded.

**Observation sheet** (times from the first page):

| Measure | Time / note |
|---|---|
| Usable title (they know how to begin) | |
| First confident, unprompted choice | |
| First confusion (what, where) | |
| Each request for help (what was asked) | |
| First self-chosen goal, in their words | |
| First consequence they notice | |
| Did preparation change a later outcome? | |
| Wants to continue at 20 minutes? At the end? Why? | |
| Which marks and colours they could explain afterwards | |
| Failure kind, where play broke: control, comprehension, aesthetic, content | |

Do not teach controls unless asked; note the request. Afterwards, before showing anything: what did you want, what did
you believe you could do, which choice felt consequential, what did the world remember, where did you stop trusting or
caring, would you continue, and why?

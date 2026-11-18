# Sprint 1 — Observe a cold player; repair the first passage

Dates: 18–25 November 2026 (planning-report.md §6). Sprint 0 is closed: its board is kept below.
Goal: a cold player reaches the first meaningful action without accidental interruption, unexplained control changes
or a transition that breaks confidence; and their top causes of confusion are fixed.
As held by the owner (18 November, night): no new commissions; robot cold plays first (agents only: the game is not
ready for people), fix their top causes, deployed recordings, a second cold player; close the sprint and the register
as fast as possible.

| ID | Kind | Why in this sprint | Acceptance | Owner | State |
|---|---|---|---|---|---|
| S1-1 | Investigation (E1) | Cold play 3 (6/10) named the causes; the fixes must be measured, not assumed | A fourth robot cold play of the golden route on the deployed revision, by the protocol below, its report in mission-22/cold/ and its defects registered | lead (an agent plays) | done (18 Nov): cold play 4 at f087ede1, **6.5/10** (cold play 3: 6; cold/cold-4-report.md): three stories finished, each by a clue found; its one change, every scene says in its own prose what is there and what is happening; 30 defects as CL-42..CL-50 |
| S1-2 | Defects (E1) | Cold play 3's top causes: the four not leading with the pursuit, unwarned and untold harm, money and prices unsaid | CL-12, CL-13, CL-14, CL-17, CL-18, CL-22, CL-24, CL-25, CL-29 fixed and pinned; CL-04 and CL-05 closed on their pins | lead | in progress: all fixed and pinned (18 Nov) but CL-25's "Tell the reeve how Mardle counts" among the rest |
| S1-3 | Obligation (E2) | TO-03/TO-06/OR-23/OR-77: the passage from studio to first scene is judged in motion | One deployed recording (frames) of studio → title → creation → setting out → first scene at a laptop's size and a phone's: no flash, no flicker, no unexplained black; findings registered | lead | open |
| S1-4 | Investigation (E1) | One player is an anecdote | A second robot cold player on the alternate character (elf mage, a life of learning: the scholar's, which begins at Gatesend) on the same revision | lead (an agent plays) | done (18 Nov): cold play 5 at f087ede1, **6.5/10** (cold/cold-5-report.md): the gate shut by search, light and a hired hand with no fight; loses on a world that does not answer what was done; 43 defects as CL-32..CL-41. Triage of both plays (at most three causes): the scene says what is there and what happens (CL-42, with CL-44's king), the world answers what was done (CL-32), gold that loops and the wall (CL-34, CL-33); and the chest that refuses its clue (CL-43, P0) at once |
| S1-5 | Defect (E1) | DN-06, only for the first passage | The opening's lines the cold players quote as generic or obstructive rewritten (the wagoner done: OR-75) | lead | partly |

Capacity reserve: defects that block the cold players only.
Running beside the sprint, on the owner's word of 18 November: the SRD spell slices (SR-01) and the variety
experiment (OR-84), one agent each; neither touches the golden route.

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

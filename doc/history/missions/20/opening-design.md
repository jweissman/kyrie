# Mission 20: the first fifteen minutes — design checkpoint

For the owner's decision before any large change to the opening. Bounded repairs proceed meanwhile (see the log).
Evidence: the builder's own play of the opening at `7302392c` (headless and rendered), and two cold-agent plays
(reports in `doc/history/missions/20/cold/round-1/`).

## Status (10 November, night)

**Decided:** design A, and the place first after the opening (the owner's amendment 1; see [log.md](log.md)).

| | State |
|---|---|
| Implemented | the place first (`306e9a0e`); composition of the landing (`3c81f363`); Tuck's exchange that opens the choices and knows a thief (`8857b3aa`); the town's threads tied (the bell's line names the hold; the gate-hobs at the cave by name); the hold playable by its leads (`bf62b137`…`87f1c799`); the debt's loop home to sell (`78c9b45c`); Notes in sight (`be74676b`, `021c232e`); a thief's own way past the gate (`cc5f84e3`) |
| Technically verified | `test:honest` journey 4 (debt, page leads only: out through the hold, home to sell to Tuck); `debt-first-errand` (7 cases); intent contracts; CI per push |
| Independently agent-played | round 2 (`78c9b45c`): a debt warrior and an elf thief each paid the debt by a different route, and kept the game over a reload ([cold/round-2](cold/round-2/)); round 3 (`09664cf0`): an elf mage who put off her errand and a reckless dwarf ([cold/round-3](cold/round-3/)); round 4 (`397022c2`): a peaceable bard on *The Sealed Letter* who saw three troubles through without a fight, and a dwarf tactician on *Over the Hills* who cleared the town's underways and the hobs' hold ([cold/round-4](cold/round-4/)). Across rounds 3–4: clarity 3, beauty 4–5, interest 4, **challenge 1–2**, wish to continue 3 |
| Human-accepted | **not yet**: no person has played a candidate (PD-14's five remain pending) |

## What a newcomer meets now (before M20)

1. **Creation** (good): eight origin cards, ancestry, calling, a way, a past trade, a name. Handsome, quick; "Set out
   now" skips it.
2. **The prologue** (good where it exists): the way in painted over the whole screen, one paragraph at a time, a
   meeting on the road with real answers (the wagoner in the ditch: heave, bargain, walk on; a thief may lift a sack).
   Only origins that begin on the road have a meeting; the debt begins under Tuck's roof and has none.
3. **Then the map** (incoherent): the prologue has just put you "straight to Tuck's door", and the first screen is the
   whole world map with "You stand at its gate. Enter Thornhaven" under a header that says *Tuck's wood-yard*,
   surrounded by two dozen labels for far countries ("way into the vale of the Arle").
4. **The town** (rich but undifferentiated): the landing at Thornhaven tells, in one paragraph, of the quay, the
   gulls, a bear asleep by a players' wagon, a shepherd's boy's rumour of something out of Silkholme sink, the bell
   gone from its frame ("Hobs"), a hull being tarred, the people at work, the inn's dog. Every one of these is a real
   thread, and all arrive at once with the same weight. The notice on the well-post holds three jobs (rats 10 coin,
   the catacombs 15, spiders 12) and is read only if found.
5. **People** mostly offer topics. The players' troupe (Gosse, Hepzibah, Pudding, the bear) is the one group that
   feels like people with a problem; the innkeeper has thirty-five topics behind the three shown.
6. **The first expedition** for the debt is Seolforfyrd, the old toll-house where the hobs who stole the bell hold
   out. Its material is the best in the first hour (a parley, "Don't touch nothing", a captive shepherd's boy who knows
   hobs cannot abide bells, a Gaffer in a bishop's mitre who will take tribute, a back way, the princes' strongroom),
   and almost none of it is set up by the town: the inn names the toll-house without the hobs, the town names the hobs
   without the toll-house (fixed in `bf62b137`), and nothing says the strongroom could pay a debt.

The common fault is not missing content. It is **composition**: everything is present at once, at one weight, and
the threads that belong together are not tied.

### What the two cold plays showed (round 1, at `7302392c`)

Reports: [cold/round-1/player-a.md](cold/round-1/player-a.md), [cold/round-1/player-b.md](cold/round-1/player-b.md).
Both ran with the prologue skipped (automation); both chose their own course.

- **Both found something and pursued it.** A (debt, warrior) went under the town on a hint from Tuck, sold star-iron
  and paid the debt; B (map, birdfolk ranger) did the spiders and paid the players' reckoning, and called three
  threads converging on Seolforfyrd "the best moment of the hour". Neither felt pushed; both felt there was too much.
- **Conversation is the best of it**; the townsfolk outside the troupe have one quip each. The important acts (pay the
  debt, hire Xyn, pay the reckoning) are hidden under "Something else…".
- **The first world screen confused both** (fog of meaningless labels; "you stand at its gate").
- **Go… from the first place showed five places**, not the town; both learned the town existed only by wandering.
- **Aims pile up** (9–10 by the first evening), finished ones linger as leads, and the followed aim did not follow what
  either was doing (A carried the 90 coin while the page still pointed at Seolforfyrd).
- **Fights were trivial, and their forecasts and summaries untrustworthy** ("Easily won" while poisoned to 9/16;
  "unhurt" after losing 10 HP). One fight in six had tension.
- **Pictures and words contradict the place** (hillside and daylight four storeys down; stags in a glade for a stone
  toll-house; a sunny card at midnight), and the prose repeats itself (the cart twice; names five times in a box).
- **B was locked out of the hobs' hold after a successful parley** (fixed, `84f6a444`).
- Both would play on "for the writing, not for the game".

## Three designs for the first fifteen minutes

All three keep creation, the painted prologue, the map as the way to travel between places, the resting scene
(painting, short text, portraits, one Go…), the guidance's gold, and the existing adventures. None writes a new
adventure.

### A. Arrival in a town with trouble (recommended)

The origin brings you to the town; the town is composed to have **one trouble in the foreground** and others behind
it, and the first choice is how to meet your own need through one of them.

- **Sees and understands:** the prologue's beats; then *the place itself*, not the map: the scene the origin ends in
  (Tuck's yard for the debt; the road in for the kin). The map appears when the player first leaves the town or opens
  it.
- **Curiosity:** the town's arrival scene has one live incident and a short line of what everyone is talking about
  (the bell gone, and hobs at the old toll-house; a bear asleep by a stranded players' wagon). Not eight hooks in one
  paragraph: one in front, two mentioned, the rest found by Look and by talk.
- **First meaningful choice:** for the debt, Tuck's "Ask at the inn" leads to the innkeeper, whose answer is an
  *exchange* that offers the real alternatives the town holds: the notice's small paid jobs (rats, spiders), the
  hobs at Seolforfyrd (the princes' strongroom no-one has opened; the parish would thank whoever brings their bell
  home), or the players' troubles. Each says what it pays and what is known of its danger. Choosing is the player's;
  gold marks what the aim needs (coin), not one destination.
- **Interactions introduced:** by need, not tutorial: talking (Tuck, then the inn), the notice (read on the green),
  buying a torch (the chandlery, when the inn says the hold is dark), the map (to set out), a fight (rats or hobs).
- **Into an expedition:** the map journey to Seolforfyrd, or a walk to the corn-store; both exist.
- **Variation:** origins already put you in different towns with different first people (the kin's wagoner and
  mother at Brockminster; the debt at Thornhaven). Callings change the hold (a thief's stealth, a bard's parley, a
  cleric's standing with the parish). Order varies: the notice and the inn both lead to the same three jobs.
- **Pages to redesign:** the first post-prologue screen (place, not map); the place scene's text hierarchy
  (foreground / talked-of / Look); talk as exchange for the four first-hour people (Tuck, the innkeeper, the shepherd's
  boy, the Gaffer); Notes (leads vs. aims vs. known); the expedition's result and return.
- **Risk:** composition by data (which incident is foreground) must stay generic — chosen by rules from what the town
  holds, not hand-placed for Thornhaven.

### B. A playable road for every origin

Every origin begins on the road, with a meeting (the existing prologue templates: the wagoner, a poacher, a pedlar)
extended to plant the first hook — e.g. the wagoner was robbed at the ford by hobs; a pedlar lost his pack to them —
so the player arrives at the gate with a reason already formed.

- Strong first five minutes; the hook is personal and chosen before the town.
- Costs: every origin's opening rewritten around the road; the debt's (Tuck first) and the order's (under a roof)
  would change character; the town itself still arrives as an undifferentiated paragraph unless A's work is also done.
- Risk: the hook becomes the one quest everyone is pushed into; the town's other threads stay buried.

### C. An evening at the inn

Every origin ends its prologue in the town's taproom at dusk; the town's people come to the table (the innkeeper, a
soldier for hire, the drover, the factor, the stranded players' leader), and the first choice is made in conversation:
which job, with whom.

- Strongest for conversation and drama; hirelings and the first job chosen together.
- Weakest for exploration and the town's geography; risks a scripted scene (people arriving on cue) that the engine
  does not do generically; overrides the origins' own first people (Tuck, the mother).

## Recommendation: A, keeping B's road where an origin already has one

A addresses the faults the plays actually showed (incoherent first screen; the town hidden behind the first place;
everything at once; threads not tied; the decisive acts buried; aims that pile up instead of following the player)
with changes that are generic: the first screen after the prologue, the scene's text hierarchy,
a few conversations, and ties made in data. It leaves the road meetings as they are (good) and needs no new
adventure.

### Illustrative journey (debt, human warrior)

1. Creation; the prologue's beats over the painted lane; "Go on".
2. **Tuck's yard** (the scene, not the map): Tuck doesn't get up. "Fifty coin, by market day." Reply: promise, beg for
   time (five days, five coin more), or ask where a person finds fifty coin. "Ask at the inn."
3. **The landing**: gulls, the quay; *in front*: the empty bell-frame and people saying "Hobs, out of Seolforfyrd";
   *mentioned*: a bear asleep by a stranded players' wagon; the notice on the well-post. The inn's door in gold.
4. **The innkeeper**: "What's out there for someone with nothing to lose?" Aiden: the notice's small jobs; the old
   toll-house the hobs hold — the princes' strongroom nobody has opened, and the parish's bell; Lapisrecs is said to
   be no place for one alone. Xyn the soldier would come for a few coins. *Choice.*
5. The chandlery for a torch (the hold is dark), or not.
6. **The map**: Seolforfyrd marked; "Set out".
7. **Seolforfyrd**: bells hanging with their clappers torn out; two hobs dicing at the brambles. Parley, sneak, or
   fight. Inside: the boy in the pit; the bell in the plunder; the Gaffer's terms; the strongroom in the toll-house.
8. **Outcome**: by bell (they run), by tribute (a month's peace), by force, or by stealth: the boy home, the bell home,
   the strongroom's silver.
9. **Return**: the bell back in its frame ("Doors open all round the well"); the boy's mother; Tuck paid ("I didn't
   think you would").
10. **Next**: Tuck tells of the work he knows of (the debt's `{after}`); the castellan's crown in Lapisrecs; Gosse's
    missing Lem; the drover's count of cattle.

## What needs the owner's word

1. **Choose A, B or C** (or a mix). The builder recommends A.
2. **The first screen after the prologue:** the place (A) rather than the world map. This revises M19's "start on the
   one full-screen map" for the moment after the prologue only; the map stays the way to travel.

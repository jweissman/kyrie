# Mission 21: playability investigation (P0/P1 list)

The independent playability investigator's evidence-backed list (brief: "Independent playability investigator" and
Phase 1). Kept current on branch `m21-play`. Started 12 November 2026, evening, on main `d3607041`.

**Method.** Cold headless play through `bin/kyrie adventure` / `bin/kyrie resume`, one process fed one line at a time
(the driver and probes are in `/var/tmp/kyrie/play21/`: `p.sh` drives a game, `tools/glance.ts` prints what the
page's glance leads with and why for a kept save). Judged from what the screen tells a player; the code read only
after a fault is seen, to name its cause. Human reports (the owner's own play) are weighed above agent ratings: an
automated positive rating never closes a reproducible human gamebreaker, and a human report that cannot be reproduced
stays listed as **not reproduced**, with what was tried.

**The instrument first.** The terminal is the same runtime as the page (`PlayerView`, `ScreenModel`, `Narrator`,
`PlaySession`), but as inherited it could not show what the page promises: no gold, no pips, no way to follow an aim,
nothing to say inside a conversation, the gold way into the next stretch of country dropped, and journeys that fought
the player's fights for them. Until that was mended (PL-01, PL-02) a headless player could not reproduce the owner's
guidance failures at all, and round 12's "foreground leaves out the step" findings were partly the terminal's own.

Severity: **P0** stops ordinary play or destroys trust in guidance within fifteen minutes; **P1** makes the first hour
not worthwhile or recurs across reports; P2 is listed only where it corroborates a P0/P1's root cause.

## The list

| Id | Sev | Statement | Status |
|---|---|---|---|
| PL-01 | P1 | The headless terminal hid the page's promises: no signals, no Follow, an empty conversation, the gold journey dropped | fixed in this branch (see below) |
| PL-02 | P1 | A journey's fights were fought for the player (headless `travel:` legs used the automatic controller) | fixed in this branch |
| PL-03 | P1 | Blue ("to learn") on an act that teaches nothing: the wagoner's "Offer him a hand" | fixed in this branch |
| PL-05 | **P0** | Gold on whatever has its own act at the place the aim names, though it does nothing for the aim (the cairn at Seolforfyrd took the debt's gold; at Tenebraetumulo the oxen's) | fixed in this branch |
| PL-08 | **P0** | Gold on "Search" wherever the aim names the place, though nothing is hidden there (Seolforfyrd: "nothing is hidden here") | fixed in this branch |
| PL-09 | P2 | A companion "binds the hurt" of a company with nothing wrong but a lit torch: needing care held of any condition | fixed in this branch |
| PL-10 | P2 | In the pitch-dark cellar the way through the gnawed hole is offered, and gold, before any light | fixed in this branch (the page); the rule open |
| PL-11 | **P0** | In the rat-runs, the rats the followed aim is to clear in front of the company, the gold is on the way back out to the empty cellar | fixed in this branch |
| PL-06 | P1 | After an aim is seen through, nothing pulls: no aim held, the prize in hand and no way home led (T24-18) | open (design) |
| PL-07 | P1 | Fights at the first places are trivial: the den's two zombies never land a blow; its leader falls to one hit | open (balance) |
| PL-04 | P2 | A journey of five and a half hours arrives with nothing of the way told, and the arrival tells a fight's end before its start | open |

### PL-01: the headless terminal could not show what the page promises

- **Repro:** `bin/kyrie adventure --world a1 --origin kin --as human/warrior/Wynn`; `3` (Talk to the wagoner): no
  greeting, and the foreground drops to two ways, the four things to say to him only under `all`. At Millholm with the
  father's aim followed, the glance leads with "To the road between Mistshaw and Millholm" as the aim's next step
  (`tools/glance.ts`: `named`, `CONTINUES`) but the terminal's foreground showed Talk to Odo, the notice and the grey
  dog: the act's command is `travel:region__s4_s2_way`, which the terminal's list of choices did not hold.
- **Observed / expected:** a player could not follow an aim, see gold or a pip, or say anything in a talk; expected the
  page's own projection in words.
- **Corroborates:** round 12, A's problems 1 and 4 ("talking says nothing", "the step the aim asks for only in
  `all`", eight times) and B's T3 ("talk opens and is empty"), `mission-20/cold/round-12/`.
- **Cause (verified):** `src/cli/terminal.ts` printed `glance.acts` and `glance.ways` resolved through
  `PlayerView.observe(...).choices`; it knew neither `Attending.talk` (the page's conversation) nor the glance's
  `travel:` commands, and had no `Undertakings.follow`.
- **Status:** fixed in this branch: `aims`, `follow <n>`, `unfollow`; each foreground choice says its signal in words
  (`[gold: your aim]`, `[blue: to learn]`, `[rose: a companion]`, …) from `Promoted.continues`, `aspects` and
  `inside`, as `web/reader/emphasis.ts` draws them; a talk lists what can be said (`Attending.talk`) until leave is
  taken or the company moves; a journey's legs are printed.

### PL-02: a journey's fights fought for the player (headless)

- **Repro:** a1 kin, the father's aim seen through, follow "Whatever took the drover's oxen…", `Set out for a grassed
  mound north-west of Mossminster · 321 min`: at Tenebraetumulo "The leader comes at you without a sound. Wynn hits
  the leader … The fight is won." No choice was put.
- **Cause (verified):** `PlaySession.leg('travel:…', controller)` handed `Travel.go` a `perform` that dropped the
  controller, so every leg's fight ran on `PlaySession.auto`. The page's `EngineHost.travel` uses its own `perform`
  and is not affected.
- **Status:** fixed in this branch (the controller passed to each leg; `PlaySession.journeyed` keeps the legs for a
  client to tell). Regression: `test/small/journey-fight.test.ts` (fails with the automatic controller).

### PL-03: blue on an act that teaches nothing

- **Repro:** a1 kin, the opening: "Offer him a hand, for a share of the load · 30 min [blue: to learn]"; "Talk to the
  wagoner" is drawn blue for it. Taken: a sack, a coin and the wagoner's opinion; nothing learned.
- **Corroborates:** the owner's report of 12 November (PR-04: "a blue pip with no blue reply"); R9-03. The comment in
  `src/ui/affordances.ts` (`learned`) cites exactly this case as fixed.
- **Cause (verified):** `ChoiceGrouping.withheld` marks `teaches` for any action whose success asserts `knows(…)`;
  the prologue's `carter_bargain` asserts `knows(actor, cart_bargained)`, a record of the company's own deed for the
  Notes, not something learned of the world.
- **Status:** fixed in this branch: an act teaches when it comes to know a fact it does not itself make so
  (`ChoiceGrouping.teaches`: a fact also asserted by the same act, as `wayIn(cart_bargained)`, is the company's record
  of its deed). Thirteen of the prologue's meeting acts (every origin's road) had been blue for this. Regression:
  `test/small/blue-teaches.test.ts` (a tiny world, `test/support/tiny.ts`; fails on the old rule).

### PL-04: a long journey told by nothing; a fight's end told before its start

- **Repro:** a1 kin, after the father's aim, `follow 1` (the oxen) and set out for "a grassed mound north-west of
  Mossminster · 321 min" (the gold): arrival at 5:27 p.m. at "Tenebraetumulo" (the Bound Howe) with no line of the
  five-hour way; the scene says "The leader lies dead." above "The leader comes at you without a sound. Wynn hits the
  leader …"; the foe is "the leader", of "the zombies".
- **Corroborates:** the owner's notes of 10 November ("Travelling absolutely has to reveal the landscape you're
  passing through"; "a chance of encounter at every hex"); R9-07 / R11-07 (text and timing).
- **Cause (hypothesis):** the terminal prints only the last leg's telling (now each leg's way, PL-01); the arrival's
  standing description is composed from the state after the fight, the fight's log appended after it (narration by
  accumulation). The per-hex encounter is a design ambition (NM-06), not this defect.
- **Status:** open.

### PL-05: gold for standing at the aim's place

- **Repro:** kahitude, `--origin debt`, `follow 1`, "Tell Tuck you will have it", the landing, the taproom, "Ask Aiden
  what is out in the country round", hire Xyn, "Set out for Seolforfyrd · 181 min" (gold): at the toll-house the
  foreground is "Call to the hobs for a parley [red]", "Attack the hobs on the gate [red]", and **"Build the cairn up
  again, stone on stone [gold: your aim]"**. The same at a1's Tenebraetumulo for the oxen's aim (save
  `/var/tmp/kyrie/play21/a1-mound.json`): the cairn gold, mended, then no gold at all. The cairn is a town's trouble
  (`data/generation/town/ties.kyrt`, "custom 2": a drover's boy blamed for kicking it over) placed at the town's
  nearest old place; mending it does nothing for a debt or for the oxen.
- **Corroborates:** the owner's player report of 12 November (PR-01: "gold … on aims not chosen", "nothing advances");
  the owner's 10 November notes ("can't trust that indicators will lead me to interesting places");
  review-mitigations U1 ("no deeper way becomes gold merely because it … lies inside the destination").
- **Cause (verified, `tools/glance.ts` on `kh-seol.json`):** `Affordances.there` gave any non-person thing with an
  author's act not yet done the why `about` (the aim's) whenever the aim named the place the company stood in; that is
  presentation inferring what an act will do from where it is. It had been added for the father's ruts, which
  `AimAdvances` missed because it read a rule's effects but not what a rule `teaches` (`Rule ruts_followed …
  teaches found_cart`).
- **Status:** fixed in this branch: `AimAdvances.waits` counts what a rule teaches as what it makes so (the ruts now
  advance the aim by type), and `there` is gone. Regression: `test/small/gold-at-the-place.test.ts` (each half of the
  change fails one of its two cases without the other).

### PL-08: gold on a search that finds nothing

- **Repro:** kahitude debt as PL-05, at Seolforfyrd with PL-05 fixed (save `kh-seol.json`): "Search Seolforfyrd · 20
  min [gold: your aim]"; taken: "You have been over the whole of it, and nothing is hidden here." Twenty minutes and
  the gold's word spent on nothing; the gold then moved to the toll-house door.
- **Corroborates:** round 12, B (T33, T49: searches "nothing is hidden", nothing found); the owner's 7 November notes
  ("gold on the place you already are, random gold places"); the false-promise corpus of review-mitigations P3.
- **Cause (verified):** `Affordances.yours` gave a search the why `named` ("where your aim is") whenever the aim named
  the place and no unvisited way led on: the same inference from location as PL-05. What is typed (`AimAdvances`:
  something the aim waits on hidden here, a fact the aim waits on found by searching here) already makes a search the
  aim's next step where it is one (the father's road: `Discovery found_cart … Found by searching road`).
  And the typed answer was being thrown away: `Promotion.allowed` let a search be led only for `sign` or `named`, so
  a search's `advance` (the dead man's box under Seolforfyrd's door-stone, `AimAdvances.sought`) counted only because
  the heuristic happened to fire too. With the heuristic gone the map origin's gold walked every room of the
  toll-house and was lost (`test/gold-thread.test.ts`, kahitude/map), which is how this was found.
- **Status:** fixed in this branch (the heuristic removed). The lead reached the same `Promotion.allowed` rule
  independently on main (42d32a15, `test/small/gold-thread.test.ts`); this branch keeps main's and adds the removal. Regressions:
  `test/small/gold-at-the-place.test.ts`: the debt's case, indoors so that a search is offered, and the hidden
  thing's case (each fails on the code before its half of the change).

### PL-09: care for a lit torch

- **Repro:** a1 kin, the father's aim seen through, the notice read, "Ask Bask about the rats", `follow 2` (the rats),
  the corn-store, the trapdoor, "Light a torch": "Odo binds the hurt fast and badly … 'Hold still'". Wynn 15/15, Odo
  14/14; `character` shows "Conditions: Torchlit · 1h left".
- **Corroborates:** round 12, A, T40 ("'Odo binds the hurt' when no one is hurt"); T24-16.
- **Cause (verified):** `CreatureFacts.member` asserted `needsCare` for a member below full health *or with any
  condition*; Torchlit is a condition that grants light. The drover's `son_binds` event reads `needsCare`; so do the
  Tend and care offers.
- **Status:** fixed in this branch: needing care is hurt, or under a condition that does not help
  (`ConditionSense.helps`, the catalog's own reading of a condition). Regression: `test/small/care.test.ts`.
  **Saves:** the change at first refused every save in which someone held a helping condition ("Inconsistent saved
  creature facts", found by resuming the rat-runs save): a save's creature facts are checked against a fresh
  projection. Now a save that differs only in a relation whose projection was corrected (`CreatureFacts.revised`:
  `needsCare`) is brought up to date on resume; any other difference is refused as before (the same spec).

### PL-10: a way in the dark

- **Repro:** as PL-09, before the torch: "It is pitch dark. Without a light you can see nothing here" and the
  foreground offers "Take a hole gnawed through the cellar wall to the rat-runs · 10 min [gold: your aim]" beside
  Light a torch. The company cannot see the hole.
- **Corroborates:** round 12, A, T39; R10-11 (text of what could not be seen); the owner's rule "respect character
  knowledge".
- **Cause (verified):** `go` does not require light (`data/rules/passages.kyr`), so the way is legal; and
  `Promotion.allowed` never read `Situation.dark`, so the way was led as the aim's like any other.
- **Status:** fixed in this branch for the page: in the dark a way the company has not taken is led only as the way
  back, never for anything else; "Light a torch" leads, and the hole is gold once there is light. Regression:
  `test/small/gold-fight.test.ts`, the dark case (fails without it). **Open, a rules decision:** whether a way not
  yet seen may be taken in the dark at all (feeling along a wall is an OSR choice with its own risk), which is the
  rules' and the owner's, not a presentation fix.

### PL-11: gold back out of the place where the aim's work is

- **Repro:** a1 kin as PL-09, the torch lit, "Take a hole gnawed through the cellar wall to the rat-runs" (gold):
  "The rats under the corn-store … are here … In 9 minutes they will be on you." The foreground is "Attack the rats
  under the corn-store [red: danger]" and **"Take a hole gnawed through the cellar wall to the corn-store cellar
  [gold: your aim]"**: back to the cellar the company has just searched by torchlight and found empty. Save
  `/var/tmp/kyrie/play21/a1-runs.json`.
- **Corroborates:** the owner's play of 6 November (the corn-store: "the ways pointed the company back out rather
  than deeper in"); the owner's 11 November crawlway report (followed aim lost around the rats); round 12, A, T46;
  PR-01 ("out of a place and back").
- **Cause (verified, `tools/glance.ts` on `a1-runs.json`):** the acts were "Attack" (`danger`) and "To the corn-store
  cellar" (`retreat`, aspects `undertaking`, CONTINUES). The aim is `given(rats_job) and not done(rats_job) toward
  cellar`; `Rule rats_cleared when not able(rats)` makes it done, so what it waits on is the rats' `able`, and
  `AimAdvances` already read that, but nothing an act brings about could match it: a fight's end is its resolution
  (`Resolve combat(opponent)`), not an effect, so `AimAdvances.of` was empty. The only `undertaking` aspect left was
  the way to the place the aim's words name (`toward cellar`), the way the company had come.
- **Status:** fixed in this branch: `AimAdvances.brings` counts a fight as leaving its foe unable and dead; an attack
  the aim waits on has the why `advance` beside `danger` (`Affordances.threat`); and `Promotion.continued` ranks an
  act that advances the aim first though it is led for its danger (`Promoted.advances`). The fight is now the one
  gold act, drawn red for its danger as well, and the way back is plain. Regression: `test/small/gold-fight.test.ts`
  (fails on main with "To the corn-store cellar" gold, the exact a1 state).

### PL-06: after the aim, nothing pulls

- **Repro:** a1 kin, the oxen's aim seen through at Tenebraetumulo ("a den in the wild, seen through"), the yoke
  taken: `aims` says "No aim is held"; the foreground is two ways out into the country; Odo had said "I want the yoke
  back. It was Grandfather's", and nothing leads home with it. Day 1, 5:40 p.m., 837 XP.
- **Corroborates:** T24-18 (round 12, A: "after each job it moves on to the next notice"); aesthetic-and-play §5.
- **Status:** open: a design matter (the aim's succession), recorded here because it decides whether the first hour
  is worthwhile.

### PL-07: the first fights are trivial

- **Repro:** the same den: the leader (6 HP) falls to Wynn's first blow; two blighted zombies (6 HP each) are fought
  out by `auto` in five rounds without touching Wynn (15/15) or Odo (14/14). +147 and +300 experience.
- **Corroborates:** the owner's 10 November note (the hollow stalker "absurdly easy"); R10-12, R11-05; round 12, A
  ("Challenge 1").
- **Status:** open: balance (an instrument first, as the owner proposed), not a defect to patch per creature.

**Not taken here (the lead's):** T24-19's round-12 player B items (pine): `q` with piped stdin, the hare not in the
pack, "is here" above "is gone into the bracken", doubled way labels, raw markdown, the empty foreground after
Anselm's speech; and the lone person spoken of in a band's words (fixed on main).

## The human reports, and where each stands

The owner's own play first; then the agents' rounds where they corroborate it.

| Report (source) | Reproduced? | Item |
|---|---|---|
| Gold on aims not chosen, out of a place and back, nothing advancing (owner, 12 Nov, PR-01; golden-thread note) | **yes**, two worlds: gold for being at the aim's place (the cairn), and on a search that finds nothing | PL-05, PL-08 |
| Choosing a place in the company's own hex walked it out of the town (owner, 12 Nov, PR-02) | not yet tried in the page; the engine has no guard (the fix is the browser's `MapView`) | see root cause 1 |
| A blue pip with no blue reply; a green Look with no clear collectible (owner, 12 Nov, PR-04) | **yes**, the blue half: the opening's wagoner | PL-03 |
| Green circle and dot on someone with no green option and nothing to say (owner, 10 Nov notes) | not yet reproduced (no green on a person met so far) | — |
| Two quests for one place, Albustagn (owner, 10 Nov notes) | not tried (`Undertakings.folded` claims it) | — |
| Rat crawlway: followed aim lost, narration three ways, nested aims block (owner, 11 Nov) | not tried yet | — |
| "Listen at it" on a padlock; targets unnamed (owner, 11 Nov, action projection) | **yes**: "Listen at the corn-store padlock" in a1's `all` | P2, open |
| Travelling must reveal the landscape; encounter chance per hex (owner, 10 Nov) | **yes**: five hours through Mistshaw green told by nothing | PL-04 |
| A battle in the caves absurdly easy (owner, 10 Nov) | **yes**: the den's zombies never touch the company | PL-07 |
| Corn-store key-holder hard to find; ways lead out not in (owner, 6 Nov) | not tried yet | — |
| Looking empty; gold on the place you are; one click to go (owner, 7 Nov) | the gold half: PL-08 | PL-08 |
| A person with only "Take your leave" advertised as conversable (owner, 9 Nov) | not met so far in the terminal | — |

## Common root causes

1. **The promise/projection boundary: presentation infers what an act will do** (the retrospective's first
   candidate). Verified three times so far: PL-05 and PL-08 (gold for an act's *location*: `Affordances.there`, and a search
   "where your aim is", where the typed `AimAdvances` had a gap or already had the answer) and PL-03 (blue for any `knows(…)` assertion, where the fact was the company's own deed).
   PL-11 (gold on the way to a place the aim's words name, while the aim's real wait, a fight, stood here) was the
   same fault: the typed wait was read, but a fight's end was not counted as anything an act brings about. In each the engine had the typed answer, or nearly; a nearby heuristic answered instead. The fix that held was to
   make the typed reading complete (a rule's `teaches`; a fact the act itself makes so) and delete the heuristic. Still
   standing on the same boundary: `TalkFocus.weighty` ranks replies by their words (`/^(Tell|Pay) /`, "would come
   along"); `Passages`/`Affordances` notes ("further in", "back out"); E155's own-hex navigation guard lives in the
   browser (`web/reader/map-view.tsx`), so the engine would still walk a `travel:` to a place in the company's own hex
   out across the country if any client asked (the lead's finding).
2. **Two clients over one runtime, not one contract.** PL-01 and PL-02: the terminal and the page each re-derive the
   foreground, the conversation and the journey from `PlaySession`, and the terminal's copy had drifted (no talk, no
   travel: ids, the automatic fighter). Round 12's top findings were half the terminal's own. The headless instrument
   is only as faithful as its least-shared code path.
3. **Projections that read a broad relation for a narrow meaning** (PL-09): `needsCare` held of any condition, so a
   torch was a wound; and a save's facts are checked against the projection, so correcting one breaks old saves unless
   the correction is declared (`CreatureFacts.revised`). Any later projection fix needs the same care.
4. **Narration by accumulation** (PL-04): the arrival is the state after everything, with the log appended; a fight
   told dead before it starts, a five-hour journey told by nothing.
5. **Nothing composes a larger undertaking** (PL-06) and **danger has no economy** (PL-07): design, not defects, but
   they decide whether the first hour is worth playing.

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
| PL-10 | P2 | In the pitch-dark cellar the way through the gnawed hole is offered, and gold, before any light | fixed (73cac481); the rule kept, decided by the lead |
| PL-11 | **P0** | In the rat-runs, the rats the followed aim is to clear in front of the company, the gold is on the way back out to the empty cellar | fixed in this branch |
| PL-12 | **P0** | At the place an aim is about, the gold goes through every door not yet taken: on Gothgiba's bailey (wren, wanderer) the fevered child's aim walked the store, the chandlery and back, none with herbs | fixed in this branch |
| PL-13 | P1 | Gold leads back to the aim's place, already visited, where nothing can yet be done, while the lead at hand (blue: where willow grows) is not gold | fixed in this branch (the lead's ruling, U1) |
| PL-14 | P1 | In an authored adventure, Follow this leads nowhere: The Lull's first aim names the inn and the stone in words only, and Sixways had no gold with the inn's door beside the company | the Lull's fixed (765a3b29); the lint: 57 aims flagged, 3 more fixed (Lull, Long Man, Tessary); the rest open (authoring) |
| PL-15 | P1 | The talk ranked and gilded replies by their words: "Tell …"/"Pay …"/"would come along" led, and a reply whose words echoed the aim's was drawn gold beside the glance's own next step | fixed in this branch |
| PL-16 | P1 | An authored adventure's hook not led: Tessary's eel-wife's notice on the Landgate board was only under `all`; reading a witness had stopped counting as learning (a regression of PL-03's rule), and a thing's teaching acts were never reckoned | fixed in this branch |
| PL-17 | P2 | What Tessary Owes gives the company Davy's coat on its first step ("You take Davy Teazle's red coat" at the Landgate), though Nan is to hand it over later | fixed in this branch (data) |
| PL-18 | P1 | The own-hex guard (E155: never across the country to a place in the company's own hex) lived only in the browser's map; the terminal and `serve` could not see the map's moves at all | fixed in this branch |
| PL-19 | **P0** | At the dead man's map's keep the search the map marks is not led, and the gold goes to parleying with the hobs: dangers and the way back fill the three places | fixed in this branch |
| PL-20 | P1 | A danger led "Talk to" onto nothing to say: the hobs' Gaffer, whose terms wait on a parley, offered only Attack and leave | fixed in this branch |
| PL-21 | **P0** | The debt's gold at the inn was "Ask Osmund Pyle to come with you": every rule that pays a coin had made its condition the debt's | fixed in this branch |
| PL-22 | P2 | A chest picked open says only "stands open": the stolen chalice in it is only under `all` | fixed in this branch (the telling, and the take's label) |
| PL-23 | P1 | Inside the site a coin aim names, the gold walks every room not yet entered, into a spy-crack with nothing in it | fixed in this branch (the lead's ruling) |
| PL-24 | P1 | Kahitude's brothers' errand names Lapisrecs, whose writing tells the successors' history, not the history the errand waits on: the errand cannot be done there | fixed in this branch (generation) |
| PL-25 | **P0** | a1 debt: Marsh Howe's den cleared, the foreground is only the way out; the search for the coin dragged in is under `all` (and one steel coin sent the company 71 minutes home, and called Ísencepan "spent" unexplored) | fixed in this branch |
| PL-26 | P1 | The terminal's foreground dropped the glance's quiet row of ways (by exit id, which no command is): back at Ísencepan, only the cairn; the gate in only under `all` | fixed in this branch |
| PL-27 | P1 | The debt's chain stops at the second old place: Marsh Howe searched (27 of 50), the aim still names it, nothing is gold, and Palusporta, told of with the others, is not led | open (proposal) |
| PL-28 | **P0** | kite wanderer: the fevered child's aim followed in Newmeet's crowded market-place, nothing gold and the mother not on the page; asked, still nothing, with herbs on sale a door away | fixed in this branch |
| PL-29 | P2 | Edda, gone with the company, is still told asleep on the sick child's step | fixed in this branch (data) |
| PL-30 | P1 | In the page, the first page says no goal and offers no Follow: "Your first goal" was said only of an aim followed, and nothing is followed until chosen in the Notes | fixed in this branch |
| PL-31 | P2 | thorn, the ossuary: gold on the *unlikely* "Tell him the town knows…", while the sure act the mage's own lore opened ("what his book left out of the ring", which ends it) is only red | open (proposal) |
| PL-32 | P1 | In the page at Merscstede, the aim's next step (Lindal, the letter) is gold only on the rail's people icon: Lindal's own pip is blue and the foreground is Cora and the lockup; the engine's glance has Lindal gold | open (page) |
| PL-06 | P1 | After an aim is seen through, nothing pulls: no aim held, the prize in hand and no way home led (T24-18) | ranks 1 and 2 built in this branch (the lead's ruling); ranks 3–4 later |
| PL-07 | P1 | Fights at the first places are trivial: the den's two zombies never land a blow; its leader falls to one hit | open (balance) |
| PL-04 | P2 | A journey of five and a half hours arrives with nothing of the way told, and the arrival tells a fight's end before its start | the order fixed in this branch; the untold journey open (design, NM-06) |

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
- **Corroborates:** the owner's report of 12 November (OPR-04: "a blue pip with no blue reply"); R9-03. The comment in
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
- **Cause of the order (verified):** `Narrator.presence` told every dead foe here as "lies dead" in the place's
  telling, which the terminal prints above the exchange; the foe just killed was told dead, then told falling. The
  rats' end in the corn-store's runs was the same ("The rats under the corn-store lie dead." above "Wynn hits the
  first rat").
- **Status:** the order fixed in this branch: whoever fell in the fight just told (its `death` events, by the actors
  whose members they are) is not told again as lying dead; on the next page they lie where they fell. Regression:
  `test/small/fight-told.test.ts` (fails on main). The untold five-hour journey is the design half (NM-06), open.

### PL-05: gold for standing at the aim's place

- **Repro:** kahitude, `--origin debt`, `follow 1`, "Tell Tuck you will have it", the landing, the taproom, "Ask Aiden
  what is out in the country round", hire Xyn, "Set out for Seolforfyrd · 181 min" (gold): at the toll-house the
  foreground is "Call to the hobs for a parley [red]", "Attack the hobs on the gate [red]", and **"Build the cairn up
  again, stone on stone [gold: your aim]"**. The same at a1's Tenebraetumulo for the oxen's aim (save
  `/var/tmp/kyrie/play21/a1-mound.json`): the cairn gold, mended, then no gold at all. The cairn is a town's trouble
  (`data/generation/town/ties.kyrt`, "custom 2": a drover's boy blamed for kicking it over) placed at the town's
  nearest old place; mending it does nothing for a debt or for the oxen.
- **Corroborates:** the owner's player report of 12 November (OPR-01: "gold … on aims not chosen", "nothing advances");
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
  `test/small/gold-fight.test.ts`, the dark case (fails without it). **Decided by the lead (13 November):** `go` stays
  legal in the dark (feeling one's way is a fair old-school choice); the page not leading with unseen ways is the
  fix.

### PL-11: gold back out of the place where the aim's work is

- **Repro:** a1 kin as PL-09, the torch lit, "Take a hole gnawed through the cellar wall to the rat-runs" (gold):
  "The rats under the corn-store … are here … In 9 minutes they will be on you." The foreground is "Attack the rats
  under the corn-store [red: danger]" and **"Take a hole gnawed through the cellar wall to the corn-store cellar
  [gold: your aim]"**: back to the cellar the company has just searched by torchlight and found empty. Save
  `/var/tmp/kyrie/play21/a1-runs.json`.
- **Corroborates:** the owner's play of 6 November (the corn-store: "the ways pointed the company back out rather
  than deeper in"); the owner's 11 November crawlway report (followed aim lost around the rats); round 12, A, T46;
  OPR-01 ("out of a place and back").
- **Cause (verified, `tools/glance.ts` on `a1-runs.json`):** the acts were "Attack" (`danger`) and "To the corn-store
  cellar" (`retreat`, aspects `undertaking`, CONTINUES). The aim is `given(rats_job) and not done(rats_job) toward
  cellar`; `Rule rats_cleared when not able(rats)` makes it done, so what it waits on is the rats' `able`, and
  `AimAdvances` already read that, but nothing an act brings about could match it: a fight's end is its resolution
  (`Resolve combat(opponent)`), not an effect, so `AimAdvances.of` was empty. The only `undertaking` aspect left was
  the way to the place the aim's words name (`toward cellar`), the way the company had come.
- **Status:** fixed in this branch: `AimAdvances.brings` counts a fight as leaving its foe unable and dead; an attack
  the aim waits on has the why `advance` beside `danger` (`Affordances.threat`); and `Promotion.continued` ranks an
  act that advances the aim first though it is led for its danger (`Promoted.advances`). The fight is now the one
  gold act, drawn red for its danger as well, and the way back is plain: neutral, not silver, since a way back
  stripped of the aim's aspect had fallen back to "worth a look" (checked on the a1 save: `Attack [danger,
  undertaking] CONTINUES`, `To the corn-store cellar | retreat []`). Regression: `test/small/gold-fight.test.ts`
  (fails on main with "To the corn-store cellar" gold, the exact a1 state).

### PL-12: the gold through every door of the aim's place

- **Repro:** `bin/kyrie adventure --world wren --origin wanderer --as human/warrior/Hild`, `follow 1` (the fevered
  child: "it needs herbs, or willow bark from where willows grow by water"), the gold "Take the road to the bailey of
  Gothgiba": gold on "Take Baern Gorunn's door to Baern Gorunn's general store"; in the store (no herbs among its
  wares) the gold is the door back to the bailey; on the bailey it is then "Take Eberk Holderhek's door to Eberk
  Holderhek's chandlery". Saves `wr-bailey.json`, `wr-store.json`.
- **Corroborates:** the owner's 7 November notes ("gold on the place you already are, random gold places"); OPR-01
  ("out of a place and back to it, nothing advances"); the golden-thread rules ("never guide round a loop").
- **Cause (verified, `tools/glance.ts`, `tools/why.ts`):** two location heuristics, both reading only that the aim
  names the place the company stands in. `Affordances` made every local way not yet taken from a named place
  `toward`; and `AimRoute.onward` made every unvisited way down *or in* `toward` where the aim's route place is here,
  though for an aim whose target was read from its words the route place is the aim's own place (`routeTo ===
  actionAt`), so every building's door qualified. What the aim waits on (the mother keeping herbs, `keeps(mother,
  ?i)`) is nothing any door brings about.
- **Status:** fixed in this branch, for the doors of a town's houses: in a settlement (not a site), from a place the
  aim is about itself, a way into the next building is no longer the aim's (`AimRoute.onward`, `Affordances`); a way
  down or underground still is (the gnawed hole down from the corn-store cellar to the rats), and so is the way on
  from a place an aim is gone to by (`toward … by …`: the churchyard's stair to the crypt), and a site's front door (an
  aim at a hold is gone into by it). The first cut, applied to every way everywhere, broke four of
  `gold-walk`/`gold-thread`'s walks into Seolforfyrd and the keeps, and the corn-store cellar's hole, which is why it
  is this narrow. It is still a location rule; a typed "what lies beyond this way bears on the aim" would replace it:
  `AimLeads.there` already answers it for one place (grounding the company's acts there), but asked of every door
  off a town's green it would ground once per door per glance; worth measuring before it is made the rule.
  **Deferred by the lead (13 November):** the location rule stands; the typed form is a cost question for later. On the bailey there is now no
  gold: nothing there brings herbs, and the aim line says what it needs. Regression: `test/small/gold-doors.test.ts`
  (the bailey case fails on main and on either half alone; the churchyard case holds on both).

### PL-13: back to the aim's place with nothing new

- **Repro:** wren wanderer as PL-12, "Talk to Hulda Torunn" (the child's mother: "Willow bark would do it. There were
  willows out on the road, by the water"), "Take the way to the waterside at Gothgiba": the foreground is "Take the
  way to the bailey of Gothgiba [gold: your aim]" beside "Ask Harbek where willow grows [blue: to learn]". Going back
  to the bailey with no herbs does nothing for the aim. Save `wr-water.json`.
- **Corroborates:** the owner's report of 12 November (OPR-01: "travel out of a place then back to it; on return
  nothing advances"); review-mitigations U1 (destination, lead and route: "gold should belong to the lead").
- **Cause (verified):** the way to the bailey is `named` (`Affordances`: a way to a place the aim names, visited or
  not, unless idle); the aim's own place is a *destination*, and nothing typed says whether anything there can now be
  done (what the aim waits on is the mother keeping herbs the company does not carry). The lead (asking where willow
  grows) teaches a fact the aim does not wait on, so it is blue and never gold.
- **Decided by the lead (13 November):** adopt U1: a destination already visited is gold only while something there
  can advance the aim with what the company now has; otherwise the gold goes to the next real lead, typed from what
  the aim reads.
- **Status:** fixed in this branch (`src/presentation/aim-leads.ts`):
  - `AimLeads.there`: the company's acts at a place, grounded on the world with the company moved there, read by
    `AimAdvances`; a named place been to with none is *spent*, drawn idle and never the aim's way.
  - `AimLeads.of`: a lead is an act that teaches a fact that `leadsTo` a place the aim names, or a place where what
    the aim waits on someone keeping grows (the mother `Wants willow_bark`; the willows' crop of that kind). Typed
    from the aim's waits (`keeps(mother, ?i)` through `dosed_by`), with no reading of words; the fever's data needed
    nothing new.
  - `Affordances`: someone with an act that advances the aim is led for it (`advance`, the act as `for`), named by
    the aim or not; it had been so only for things.
  Someone the aim does not name is led for it only where no one it names is here: the mother before her daughter
  (`gold-thread`'s fever walk had otherwise gone to the sister, who keeps the cups, and then waited with nothing
  gold). On the wren saves: at the waterside "Talk to Harbek" is gold, for "Ask Harbek where willow grows"; on the
  bailey and in the store nothing is gold. Regression: `test/small/gold-lead.test.ts` (fails on main).
  **Cost:** a place been to is grounded once per world for the aim's kinds of act only (`AimLeads.could`), memoised
  by world; `glance-kite`'s best-of-nine budget (8 ms) holds, but a first glance beside a spent place pays one
  grounding more (12–28 ms measured before the memo and the narrowing).

### PL-14: authored aims with nowhere to lead

- **Repro:** `bin/kyrie adventure data/campaigns/the-lull.campaign.json`, `follow 1` ("Ask at the Waiting Woman what it
  is like inside, then sit by the stone until the road changes"), "Take Sixways street": no gold anywhere, though
  "Take the Waiting Woman's door" is among the ways. `tools/glance.ts` on `ad-street.json`: the aim's `named` is
  only `party`, read from its condition (`not cameIn(party) and not lullday()`); its words name the inn and the stone
  in plain text, which `Stakes` does not read.
- **Corroborates:** the owner's "followed + known next step → gold recognisable; unknown → say so honestly" (11 and
  12 November); the brief's "credible next-step guidance".
- **Census (grep, not a played census):** 134 of the 139 `Objective`s under `data/adventures/` have no `toward` and
  no `{place}` in their words; some may still resolve a target from their condition, as the generated worlds' do.
- **Status:** The Lull's first aim fixed (765a3b29: `toward sx_taproom, fold_stone`; gold is now "Into the Waiting
  Woman" from the street). **The lint (this branch):** `CampaignLint.targets` (run by `kyrie lint` for every
  recommended campaign) now advises where an objective with no `toward` is about only a fact, or someone or
  something that is nowhere, and names (in its words or its condition) no one and nowhere that is: Follow this can
  lead only to a place, or to whoever or whatever stands in one. Over the recommended campaigns
  (`play-tools/lint-targets.ts`, one campaign at a time): **57 target findings**, 45 of them this new kind (an aim
  about a fact the company knows: Quittance 16, What Tessary Owes 5, The Third Night 3, Tallow 3, A Winter in Carth
  3, …), 7 that name no one and nowhere, 5 that name places none of which holds the others. All advice: they fail
  nothing. Regression: `test/small/aim-target-lint.test.ts` (fails on main). **And What Tessary Owes' hook**, found
  playing it cold (PL-16): Nan's aim named only Davy, who is nowhere the company knows; now `toward nan by withies`,
  and from the notice the gold goes to the Withies, into Nan's house and to Nan, then stops (what Wick saw is not yet
  a typed lead). Two plain ones given their places in data: The Lull's Working Day (`toward
  mill_bridge`, the bridge it mends) and The Long Man's bounty (`toward mower`). The rest want their authors: an aim
  about a fact ("who paid for Carth's vigil") has a person or a place in mind that only the adventure knows, and a
  wrong `toward` would be a false promise worse than none.

### PL-15: the talk read its replies' words

- **Found by reading, after root cause 1 named it** (the lead's next item): `web/reader/talk-focus.ts` led with any
  reply whose label began `Tell ` or `Pay `, or ended "would come along?" or "what is out in the country round";
  `AimAsks` matched a reply's label against the followed aim's words, and that match was used three ways: to lead the
  reply in the talk, to make it the aim's in `Affordances` (`serving`), and, in `TalkStage`, to draw it in the aim's
  **gold** beside whatever the glance's one next step was. A label that happened to echo the aim's sentence was gold.
- **Corroborates:** the owner's golden-thread rules ("gold = next actionable step … one primary recommendation";
  "no presentation role derived from its label", review-mitigations P1); R9-09 ("two gold at once").
- **Status:** fixed in this branch. The engine says what is weighty (`src/presentation/talk-weight.ts`, as
  `Screen.weighty`): a reply that brings about what an aim the company holds waits on (`AimAdvances` over each held
  aim), asks the speaker along (`willing`), or tells a fact that leads somewhere not yet known (`leadsTo`); a recruit
  by its kind. `TalkFocus` reads that, `AimAsks` is deleted, `Affordances` serves the aim by `advances` alone, and the
  talk's gold is only the glance's next step (`Emphasis.within`). The id convention for "the lands beyond"
  (`_beyond_told_`) stays: it reads an engine id, not words. Regressions: `test/small/talk-weight.test.ts` (a "Tell"
  joke is not weighty; the job's report, the asking along and the cache's whereabouts are), and `test/talk-focus` now
  states the rule by `weighty`, with a "Pay" label that settles nothing left in its place.

### PL-16: the hook on the board, not led

- **Repro:** `bin/kyrie adventure data/campaigns/what-tessary-owes.campaign.json` (cold, ~6 commands): the pitch says
  the eel-wife's notice is pinned at the Landgate; at the Landgate the foreground is two streets; "Read a notice on the
  Landgate board · 5 min" only under `all`. No aim is held until it is read, so nothing else points at it.
- **Cause (verified, `tools/glance.ts` and `tools/subj.ts` on `wt-gate.json`):** two faults. (1) My PL-03 rule
  (`ChoiceGrouping.teaches`) counts a fact as the act's own doing when another assertion names it, keeping only
  `knows`, `toldBy` and `heard` as learning's record; `examine` (reading a witness) also asserts
  `learnedFrom(actor, witness, statement)`, so since 62c5921b no document read was blue anywhere. (2)
  `Affordances.opened` reckoned only someone's questions as things to learn (`fresh` is speakers' acts), never a
  thing's own teaching act.
- **Status:** fixed in this branch: `learnedFrom` and `readIn` are learning's record; a thing with an act that
  teaches is led for it (`asked`, blue). The notice now leads at the Landgate. Regression:
  `test/small/read-notice.test.ts` (fails on main).

### PL-17: a coat given before it is given

- **Repro:** as PL-16, the first step: "You take Davy Teazle's red coat." at the Landgate, before Nan is met.
- **Cause (verified):** `data/adventures/what-tessary-owes/people.kyr` kept `Initially Give davy_coat to party` (from
  a5bb8e0d, replacing a `lends`) beside the later `take_coat` action, which has Nan hand it over once told.
- **Status:** fixed in this branch (the stray `Initially Give` removed; the bundle written again; the three Tessary
  specs pass).

### PL-18: the map's decision, in the engine

- **What (the lead's finding, root cause 1):** E155's guard was `MapView.way`'s `local` test in
  `web/reader/map-view.tsx`; the engine would have walked a `travel:` across the fen to the circus ground behind Hythe
  had any other client asked, and neither the terminal nor `serve` offered the map's across-country moves.
- **Status:** fixed in this branch: `src/ui/land-crossing.ts` decides, from the land the screen already carries (known
  cells, walkable cover, each cell's stretch), what the map may set out for across the country, never a place in the
  company's own hex, as `land.across`; `MapView` draws that decision; the terminal lists it ("Go across country to
  …", and under `map`), and `serve`'s view carries it as `across`. Regressions: `test/small/own-hex` (the page's
  side, unchanged) and `test/small/own-hex-engine` (the engine's offer is the map's, and `serve`'s view the same).

### PL-19: the aim's step crowded out at the door

- **Repro:** `bin/kyrie adventure --world pine --origin map --as elf/thief/Sefa`, `follow 1`, "Set out for
  Gefeohtgaet" (gold; stopped by the deserters' toll, paid four coin), set out again: at the keep the foreground is
  "Call to the hobs for a parley [gold: your aim, red: danger]", "Slip past the hobs … [red, blue]", the heath. "Search
  Gefeohtgaet" (what the map's cross asks) is only under `all`. Save `pn-gate.json`.
- **Cause (verified, `tools/glance.ts`):** `AimAdvances` has `search(region__w5)` as the aim's step, but
  `Promotion.pick` fills three places by rank (the two danger acts and the way back, all tier 0) and the search,
  tier 1, is cut; `continued` then gilds the parley, which is the aim's only by `about` (a danger's gentle act at a
  place the aim names).
- **Status:** fixed in this branch: the aim's own next step by type (`advance`) always has a place, a fourth if the
  three are taken; it is then the one gold act. At Gefeohtgaet: "Search here [gold]" beside the two dangers and the
  way back. Regression: `test/small/gold-step-room.test.ts` (three dangers at a door, the box under its stone; fails
  on main).

### PL-20: talk to someone with nothing to say now

- **Repro:** pine as PL-19, the box taken, `follow 1` (the stolen bell), "Slip past the hobs on the gate", the
  smoky cavern, "Take a notched log to the high ledge": "Talk to the Gaffer [red: danger]" leads; taken, "‘Say it,
  then.’" and the talk holds only "Attack the Gaffer" and "Take your leave".
- **Corroborates:** the owner, 9 November ("a person with only 'Take your leave' must not be advertised as
  conversable"); R11-02, T24-19 (empty talk, recurring).
- **Cause (verified):** `ScreenModel.marks` set `asked` (someone with something to be asked) from any action written
  with them as speaker, `campaign.module.actions`, so a danger whose topics all wait on something
  (`gaffer_terms … when tolerates(gaffer, party)`) kept its talk opener (`Attending.opener`).
- **Status:** fixed in this branch: `asked` from what can be asked of them now (`campaign.offered()`). On the ledge
  the chest now leads, and the Gaffer is the danger he is. Regression: `test/small/talk-when-asked.test.ts`.
- **Found with it (the PL-18 follow-up):** in the hold the terminal listed "Go across country to the taproom of the
  Lucky Mask" and eight more beside the journeys to them; `LandCrossing.offers` now offers only where no journey is
  planned, as the map sets out on a planned one first.

### PL-21: every reward the debt's

- **Repro:** `bin/kyrie adventure --world kahitude --origin debt --as human/mage/Isolde` (a talker who will not
  fight: Charisma 17, 4 HP), `follow 1`, the gold to Aiden, "Ask Aiden what is out in the country round": the gold is
  then "Ask Osmund Pyle to come with you" (the old man with a bad hip) and "Talk to Osmund Pyle", not the journey to
  Seolforfyrd Aiden has just told of. Save `kt-inn.json`.
- **Cause (verified, `tools/leads.ts`):** `AimAdvances.waits` adds the condition of any rule whose effects meet what
  the aim reads; the debt reads the purse, so every rule that pays a coin (the generic `brought_home`, a coin for
  seeing someone home) made its condition (`following(?person, ?company)`) the debt's, 133 calls in all; asking Osmund
  along asserts `following`. Since batch 4 a person with such an act is led for it (PL-13), so it became gold.
- **Status:** fixed in this branch: a rule is read for what the aim waits on except the purse and where anyone is,
  which every reward and every way changes (the purse is waited on by selling, as before). Regression:
  `test/small/debt-purse.test.ts` (fails before). Seen in the mage's play: the gold goes to Seolforfyrd again.

### PL-22: an opened chest says nothing of what is in it

- **Repro:** pine as PL-20, "Pick the chest's lock": "The chest on the ledge stands open." Only `all` has "Take a
  stolen chalice out of a chest on the ledge". Corroborates AP-08 ("An opened chest looks empty from the scene").
- **Status:** fixed in this branch for the telling: a thing lying in something open is told with it ("In the chest on
  the ledge: a stolen chalice."), from the row's typed containment (`TargetRow.within`, PlayerView's `inside`), and
  shut, nothing of it is told. Regression: `test/small/opened-box.test.ts`. The take's label names what is taken (the
  lead's ruling, 13 November): "Take a stolen chalice from a chest on the ledge", where it had been "Take from a chest
  on the ledge" (`ChoiceGrouping`'s `take_out` path, `Take {find} from {box}`); held by the same spec
  (mutation-checked). The authored journeys that stepped by the old label step by the new one (the Long Man's three,
  Merrow to Ammerlin, the Muster's, the Ring's three, the House that Grows, the arcology house, Thrume, What Tessary
  Owes, and the journey fixtures of the Muster, Tallow, Tessary, Half the Hive and Sennet). No kept trace's digest
  changed with it. "Take from Maud" (what one senseless carries, `take_from`) is a different act and stays. A
  stolen thing is still not led as spoils, by design (it is someone's).

### PL-23: the gold walks a site room by room

- **Repro:** kahitude debt, the mage (PL-21), "Set out for Seolforfyrd", "Call to the hobs for a parley" (it works:
  "Gaffer says come in and wipe your feet"): the gold then goes cave mouth → smoky cavern → a dry side-cave (a heap of
  the hobs' plunder, nobody's spoils) → back → the captives' pit, the spy-crack ("A cleft in the rock that looks
  straight down on the road below", nothing else) → back. Save `kt-crack.json`.
- **Corroborates:** review-mitigations U1 ("no deeper way becomes gold merely because it is deeper or lies inside the
  destination"; "an honest 'No further lead is known' preserves mystery"); round 9–11 ("gold to an empty niche").
- **Cause (verified by reading):** inside a site the aim names, every way further in not yet taken is `toward`
  (`Affordances`, `inSite`; `AimRoute.onward`): a location rule. A debt waits on coin; what lies in an unentered room
  is not the company's to know, so nothing typed can say a room bears on it, and `AimLeads.there` must not be asked
  there (it would read what the company has not seen).
- **Decided by the lead (13 November):** gold goes further into a site only when what the aim waits on is known to
  lie within it; otherwise the unseen rooms are exploration.
- **Status:** fixed in this branch: `AimLeads.within` (the site here or at the door): the aim names someone, something
  or a place inside it, or what it waits on is hidden there (`AimAdvances.sought`), or is to be learned there (an
  observation, a rule heard there, or a writing that reveals it: `AimAdvances.taughtAt`), or a lead the company holds
  points inside (`leadsTo`). Only then is a way further in `toward` (`Affordances`) or the aim's route on
  (`AimRoute.onward`). On the mage's saves: no gold inside the hold; at its door the parley stays the aim's. Regression:
  `test/small/gold-site.test.ts` (the debt's hold: no gold through its rooms, which are exploration; an aim naming the
  writing in its last room led on to it; a jewelled box seen there is the debt's step). `test/gold-thread`: the
  Neblalac cases pass; two of its walks are brought to the ruling (kahitude's order errand had been let end at
  Lapisrecs's door until PL-24's fix; a1's debt now ends at Ísencepan's door rather than walking its rooms).

### PL-24: an errand sent where it cannot be done

- **Found by:** PL-23's walk of kahitude's order origin (`tools/herbs.ts kahitude order`): the errand ("the brothers
  want the old writing at Lapisrecs read") waits on `knows(party, region__history_bone)` or `…_bone_fate`, taught at
  w1, w2, w3, the manor's library and the stones' hall; Lapisrecs (w9) teaches `region__history_successors`
  (`region__w9_barrow_passage_after1_doc_says`).
- **Cause:** the work's teaching, not the errand's choice. The order binder picks a work of the first makers' art
  (`makers[0].art`), and `region-works.ts` holds that every work keeps its makers' story (`makersfact`). The works
  built by `DeepSites` (barrow, waterworks, deep, singing) taught only the after-kingdom's history through their
  writings and never `makersfact`, so any errand sent to one could not be done there. Across ten seeds, five
  countries' errands were broken this way (kahitude w9, b2 w8, mere w9, c3 w8, d4 w8).
- **Fix:** each deep purpose carries its makers' marks in data (`data/generation/deep/*.json`, `marks`: the marks on
  the kerb-stones, and so on), and `DeepSites.marks` sets them at the way in, read with lore, teaching `makersfact`.
  The kahitude order walk in `test/gold-thread` no longer allows `lost` as an end.
- **Regression:** `test/small/errand-teaches.test.ts`, over ten seeds: every order errand's named place teaches the
  history or fate the errand waits on (mutation-checked: without the marks it fails for the five countries above).

### PL-25: a cleared den's coin hidden from a debt (round 13, a1 debt, Brann the warrior)

- **Repro:** a1 debt, human warrior, going straight at the aim. Mik → Eamon ("Ísencepan, Marsh Howe, Palusporta") →
  Ísencepan's gate-passage: "Collect a steel coin" (gold) → the gold goes 71 minutes home ("What you have found would
  fetch coin") to sell it to Mik for **one coin** → "Ísencepan is spent" (only its gate-passage seen, the portcullis not
  raised) → Marsh Howe, 146 minutes: a badger on the way, "the leader", two zombies, "Marsh Howe is quiet now". The
  foreground: **"Take the way across country to open fields north-east of Mistshaw", and nothing else.** Under `all`:
  "Search Marsh Howe for what was dragged in" (five coin) and "Collect a lantern with the glass gone". Day 1, 1:46
  p.m., 27 coin of 50. Saves `play21/ga-spent.json`, `play21/ga-howe.json`.
- **Cause:** two, both typed. (1) `AimAdvances` counted only selling toward a coin aim, never an act whose own
  changes put coin in the purse (`Increase quantity(actor, gold) by hoard(beasts)`). (2) `Affordances.subject` gave a
  dead or downed subject no candidates at all, and the den's search is grouped under the dead zombies.
- **Fix:** an aim short of coin is advanced by an act that itself puts coin in the company's purse and takes none out
  (not a service had of someone, a bed or a song for supper, nor a reckoning paid: the first cut had made "Take a bed
  and supper from Eamon" the debt's gold); and the dead or down are offered only what the aim followed waits on done
  about them (`Affordances.remains`). At the cleared howe the gold is now "Search Marsh Howe for what was dragged in".
  Regression: `test/small/debt-purse.test.ts` (a cleared den's search is the debt's gold; mutation-checked both ways:
  without `pays`, and without `remains`).
- **With it (P1, data):** the debt's `laden` no longer holds for a trifle (`worth >= 5`: a steel coin is 3), so one
  coin does not send the company home; and the further aim says "{near} has not paid it", where it said "is spent" of
  a keep whose gatehouse was all that was seen (`src/world/origins.ts`). No spec: the debt's walk in `test/gold-thread`
  still ends at the next old place.

### PL-26: the terminal's foreground without the ways (round 13, a1 debt)

- **Repro:** a1 debt, back at Ísencepan from Marsh Howe: the foreground is "1. Build the cairn up again" and nothing
  else; "Take the gate to the gate-passage" is only under `all`. The glance had it, in its ways (`exit:region__w6_gate`).
  Save `play21/ga-isen2.json`.
- **Cause:** `Terminal.foreground` matched the glance's ways, which are by exit id, against choices by command id, so
  no way in the quiet row was ever in the terminal's foreground once it was not an act (the first visit's gate was an
  act; gone through, it is a way). The page resolves them through `MenuModel.lead`.
- **Fix:** `Terminal.led`: the ways by the command their exit is done by. Regression: `test/small/terminal-ways.test.ts`
  (a keep's door gone through and come back to: the gate is in the foreground; mutation-checked).

### PL-27: the debt's chain stops at the second old place (round 13, a1 debt)

- **Repro:** as PL-25, the howe searched: 27 coin of 50, Day 1, 1:46 p.m. The aim still says "Eamon told of Marsh Howe
  as well: what is in such places could pay it", of the place just emptied; nothing is gold; Palusporta, the third the
  innkeeper named, is not led. Ísencepan's keep, unexplored past its portcullis, is not the aim's (PL-23's ruling).
- **Cause:** `Origins.debt` writes two levels only (`owing_out` toward the nearest, `owing_further` toward the next
  once the nearest is been to); there is no third, and nothing marks the second spent.
- **Proposal:** write the chain over every old place the innkeeper tells of, nearest first, each aim holding until its
  place is been to *and* what it offered is done (its own coin act taken, or nothing there left to do), the words of
  each saying the one before "has not paid it". A fast spec over the debt origin in two worlds: past each place, the
  next is the aim's. Not done here: it is a generation change across every debt world.

### PL-28: the fever followed, and nothing gold (round 13, kite wanderer, Sefa the thief)

- **Repro:** kite, wanderer, elf thief; follow the aim on the road, help the wagoner, into Newmeet's market-place. Its
  scene has fourteen subjects (the circus, the clerk, the reeve, Hesper, the factor…); the foreground is "Talk to
  Hild", "Read the notice", "Ask the factor about the old cisterns", "Talk to the factor": **no gold, and Ebba, the
  child's mother, is not on the page.** "Ask Ebba about the child" (her willows) and Falkor's herb-shop, a door off the
  square selling healing herbs, are only under `all`. Save `play21/kt-market.json`.
- **Cause:** what the aim waits on someone keeping (`keeps(mother, ?i)`; she `Wants herbs`) had its leads only where
  it *grows* (`AimLeads.supplies`), never where it is sold, and buying was never an aim's step (`AimAdvances`: "nor ever
  by spending", meant for the debt). And the first aim (`herbs`) names only the green, not the mother, so in a crowded
  square she lost the three places.
- **Fix (typed):** `AimLeads.sellers`: whoever sells a kind the keeper wants, and the shop it lies in for sale, are the
  aim's (those in the company's own town first; Windscar's had been led too), while none of the company carries any;
  and buying such a thing (`buy_item` of a wanted kind) advances the aim then. Played: on the first sight of the
  market-place, "To Falkor's herb-shop" gold → "Buy healing herbs for Sefa · 1 coin" gold → back, "Give healing herbs
  to Ebba" gold → "Sit with the child…" gold; Edda offers to keep the cups; the fever breaks at 4:51 p.m., 300 XP, and
  PL-06's successor is offered ("Next: A salvage crew, the Spade-Company, … · Set out for a grassed mound").
  Regression: `test/small/fever-shop.test.ts` (to the shop, the buy, then not again; mutation-checked both ways).
- **Tried and withdrawn:** the aim `toward mother` (data) put Ebba first, but an aim toward someone makes the town
  they are in its place (`Stakes.addresses`), and Go…'s ways in kite (`test/go-sheet-aims`) lost both aims' marks.
  **Left (P2):** Ebba is still not on the page in the crowded square until the herbs are carried; her "Ask about the
  child" (the willows) is only under Talk.

### PL-29: a companion told where she was left (round 13, kite)

- **Repro:** after PL-28, Edda asked to join ("Then I'm coming"); the market-place then tells "On the step of the sick
  child's house the sister sits with a cup in her lap, asleep, very proud of herself."
- **Fix (data):** the observation holds only while she does not travel with the company. No spec (data).
- **Also seen, not fixed (P2):** Edda is "about nine" and joins as a warrior with a longsword, a battleaxe and
  chainmail (the generated sister's gear); "Speak with Edda" names nothing (it is her offer to keep the cups); after
  she keeps them, the aim still says "someone must keep the cups" while only waiting is left.

### PL-30: the page's first page says no goal (round 13, thorn courier, in the page at 820 × 1180)

- **Repro:** thorn, The sealed letter, human mage (Sibyl), Set out. The first page tells the causeway and the scroll-case
  in the prose, then "Talk to the wagoner", "Look at the cart", "To the landing": no "Your first goal", no Follow, no
  gold anywhere (screenshot `play21/shots/q01-start.jpg`). Follow this is only in the Book's Notes (`q02-book.jpg`);
  once followed there, the first page does say "Your first goal" (`q03-followed.jpg`).
- **Cause:** `Glance.of` said the goal only of an aim `followed && own`; since 12 November nothing is followed until
  the player chooses it, so a real player never saw it. Every spec of it (`nav-gold`, `first-goal`) follows the errand
  first (`Glanced.following`), as a player who had found the Notes would.
- **Fix:** the goal is the company's own errand held, followed or not, and the page offers Follow this beside it
  (`Told.Follow`). Regression: `test/small/first-goal-unfollowed.test.ts`.

### PL-31: gold on the unlikely way when a sure one is open (round 13, thorn)

- **Repro:** thorn courier, the catacombs job; in the crypt Light is cast and the chalk ring read by the mage's lore
  ("the warding line … is not there"); in the ossuary the raiser stands. Gold: "Tell the man with the black candle the
  town knows what he has done, and that it ends now · unlikely"; red only: "Tell the man with the black candle what his
  book left out of the ring", which, chosen, ends it (save `play21/th-ossuary.json`). Both advance the aim
  (`AimAdvances`); the danger's one gentle act is the first of its own (`Affordances.threat`), and odds are not typed on
  a choice (only in its words, `ChoiceWording`).
- **Proposal:** carry a check's odds on the act (`Act.odds`, from `Checks`, where `ChoiceWording` words it) and, among
  acts that advance the aim followed, prefer the likelier; a danger's gentle act is first the one that advances with no
  check. Small, but it touches the screen model's act shape, so it is left for the lead.

### PL-32: the aim's person not marked on the picture (round 13, the page at 820 × 1180)

- **Repro:** the page, thorn courier, letter followed, map → toll → Enter Merscstede: the old stones. Likenesses: Lindal
  with a **blue** pip, Cora, Eldon (green)…; the foreground "Talk to Cora", "Push and pull at the lockup door", "Listen
  at the lord's lockup"; the rail's people icon has the only gold (`shots/q10-town.jpg`, `q11-people.jpg`). Opened,
  Lindal's talk does mark "Give the sealed letter" (`q12-lindal.jpg`). Headless, the same state's glance has "Talk to
  Lindal" gold, subject `region__s2_merchant`, for `origin__deliver` (`tools/walkacts.ts thorn courier 3`).
- **Status:** open: the engine is right and the page's likeness pip (`WorldStage.seen`) is not; not reproduced
  headless, so not fixed blind. Suspect the frame the page draws after the map's Enter (a held journey's act, or the
  menu's leads) rather than the glance.

### PL-06: after the aim, nothing pulls

- **Repro:** a1 kin, the oxen's aim seen through at Tenebraetumulo ("a den in the wild, seen through"), the yoke
  taken: `aims` says "No aim is held"; the foreground is two ways out into the country; Odo had said "I want the yoke
  back. It was Grandfather's", and nothing leads home with it. Day 1, 5:40 p.m., 837 XP.
- **Corroborates:** T24-18 (round 12, A: "after each job it moves on to the next notice"); aesthetic-and-play §5.
- **Status:** ranks 1 and 2 of the proposal below are built (the lead approved it on 13 November, ranks 1 and 2
  only). As the aim followed is seen through with nothing to follow on into (`ActionFeedback.closed`), the glance
  carries one successor (`Glance.next`, `Succession`), said once under what came of it and offered, never followed:
  - **rank 1, the deed's consequence:** an act written for a thing (its Requires names the item), the thing carried or
    lying here, and whoever the act asks for standing where it would be done (`at(wife, site)`), grounded there with
    the company moved and the thing as if taken. a1 kin, the den cleared: "Hang the yoke over the hearth, where it
    always hung · Millholm", offered as "Collect the drover's ox-yoke for Odo"; the yoke taken, offered again, once,
    as "To Millholm".
  - **rank 2, the strongest lead not followed:** an aim held and not followed, in the notes' order (kahitude map and
    lost: the bell's aim, "Follow this"); else the nearest place a known fact leads to, not yet been to.
  - Drawn on the page under the told (`NextPull`), in the terminal as `Next: …` with the choice to type or `follow
    <n>`. Its words are the act's, the aim's or the fact's: no new prose.
  - A cause found on the way: `PlayerView.observe` kept its snapshot across Follow this (the world unchanged), so the
    act after a Follow was told as though nothing had been followed; the aim followed is now part of its key.
  - Regressions: `test/small/aim-successor.test.ts` (the yoke, both moments; an aim held offered; a lead's place
    offered; nothing while the aim is held; mutation-checked); `test/gold-thread` (kahitude map and lost: the bell's
    aim offered as each is seen through).
  - **Left (later, as ruled):** rank 3 (a person's trouble glimpsed), rank 4 (the notice), and the region-history bias
    after two or three aims in one town. kahitude herbs: the fever nursed, nothing is held or known to lead anywhere,
    so nothing is offered; that is rank 3–4's case.

#### Proposal: what pulls after an aim is seen through

*What the evidence says.* Every start ends its first aim in ten to forty commands, and then: a1 kin, "No aim is
held" with the yoke in hand; a1 and pine, the next notice job or nothing; round 12 (T24-18), "after each job it
moves on to the next notice and never makes a larger adventure the aim". What the game already holds after a first
aim: (1) a **consequence** of what was done (the yoke Odo wanted back; the box from under the stone; the bell found in
the hold; the rats' nest "or they will be back"); (2) **leads heard on the way** (the oxen's mound, the green-lit
tower, thirty rumours at an inn), each a fact that `leadsTo` somewhere; (3) **people met** whose own trouble was
glimpsed (Hesper's bell, Osmund's walk, the drover's boy); (4) the **town's standing jobs** (the notice).

*What should pull, in order* (ranks 1 and 2 built; see Status). At the moment an aim is seen through, the page says once, in the scene (not in the
Book), what the deed changes and what it opens, and offers to follow **one** successor, chosen by type, never
followed for the player:
1. **The deed's own consequence**, where the aim's content gives one: an aim whose ending leaves the company carrying
   something someone wants (the yoke; the box; the bell), or owed by someone (the pay), succeeds into "bring it / be
   paid" toward that person. Typed from what is carried (`carries`) and who `wants` it, or what the aim's ending
   makes owed (`Owed`). This is the cheapest and the most honest: it is already in the world, it only is not said.
2. **The strongest lead heard and not yet followed**, by `leadsTo` and nearness: the mound Odo named, a green light in
   a lone tower. Offered as a provisional aim ("Odo said whatever took the oxen dens at the mound"), never gold until
   followed.
3. **A person's own trouble glimpsed** (a topic seen and not taken up), offered only where none of the above is.
4. **The notice**, last: the standing jobs are the floor, not the next chapter.

*The larger adventure (T24-18).* After two or three such aims in one town, the succession should prefer a lead that
is a site of the region's history (`region-works`: the makers' works, the great work) over another notice, so that
the first hour bends toward one larger place. That needs no new system: the history facts and their `leadsTo` exist;
it is a ranking among successors.

*What not to do.* No new quest system, no automatic following, no chain of generated fetch-quests. The succession is a
**choice offered once**, with its reason in the world's words, at the moment the player is most open to one.

*How to know it works.* A walk (like `gold-thread`'s) from each origin past its first aim: within five commands of
the first aim ending, the page offers a successor whose source is one of the four above, typed; and in two cold plays
the player follows one of them unprompted.

### PL-07: the first fights are trivial

- **Repro:** the same den: the leader (6 HP) falls to Wynn's first blow; two blighted zombies (6 HP each) are fought
  out by `auto` in five rounds without touching Wynn (15/15) or Odo (14/14). +147 and +300 experience.
- **Corroborates:** the owner's 10 November note (the hollow stalker "absurdly easy"); R10-12, R11-05; round 12, A
  ("Challenge 1").
- **Status:** open: balance (an instrument first, as the owner proposed), not a defect to patch per creature.

**Not taken here (the lead's):** T24-19's round-12 player B items (pine): `q` with piped stdin, the hare not in the
pack, "is here" above "is gone into the bracken", doubled way labels, raw markdown, the empty foreground after
Anselm's speech; and the lone person spoken of in a band's words (fixed on main).

## Cold plays: verdicts

- **a1 kin (Wynn, warrior), ~35 commands:** the opening is the best of the game (the ruts, the body, "I knew. The dog
  knew."); followed, the gold held through the father, the oxen's den and the rats job to Bask's pay. It broke on the
  cairn's gold (PL-05), the lit torch "binding the hurt" (PL-09), the gold back out of the rat-runs (PL-11), the fights
  (PL-07: nothing touched Wynn). Coherent for fifteen minutes now; after the oxen, nothing pulls (PL-06).
- **kahitude debt (Ralf, warrior), ~10:** the debt's chain to Seolforfyrd is clear; broke on the cairn and the empty
  search (PL-05, PL-08).
- **wren wanderer (Hild), ~12:** the fever is a good small story, but the gold walked shop doors (PL-12) and then back
  to the bailey with nothing to give (PL-13); fixed, the waterman's willow lead is gold. Without the fixes, not
  coherent.
- **The Lull and What Tessary Owes (authored), ~4 and ~10:** both opened with nothing a player could follow (PL-14,
  PL-16); the prose is the richest in the game. Fixed for their first aims; the lint lists the rest.
- **pine map (Sefa, elf thief), ~18 commands (13 November):** the strongest fifteen minutes so far. The deserters'
  toll on the road (a real choice, paid), the map's cross found under the door-stone in six commands once the search
  was led (PL-19, the one gamebreaker: before the fix the gold was on parleying with the hobs and the search was
  under `all`), then the stolen bell followed into the hold: slipping past the hobs as a thief, the ledge, the chest
  picked. Broke on the empty talk with the Gaffer (PL-20) and the chest that says nothing of the chalice (PL-22).
  Recurrences of the lead's T24-19 items: the sheet says "Drifter" for an elf thief; way labels such as "Take the
  road, half an hour out of Rainhaven to open fields south of Rainhaven". Worth going on: yes, the hold has shape.

- **kahitude debt as a mage who will not fight (Isolde, Int 17, Cha 17, 4 HP), ~15 commands (13 November):**
  coherent for its first ten minutes once PL-21 was fixed: the debt's chain (Tuck, Aiden, Seolforfyrd) is clear, and a
  talker gets in without a blow (the parley works, and the hobs invite her in). Then the gold walks the hold room by
  room into an empty spy-crack (PL-23), and nothing pays the debt that a talker can reach: the plunder is the hobs',
  the sheet says "Trader" for a mage (the T24-19 "Drifter" kind recurs). Worth going on: as far as the hold; the
  debt's pull fades inside it.

### Round 13 (13 November, cold, on main bc5ab64c): acceptance outcome 2

- **a1 debt, Brann (human warrior, straight at the aim), ~30 commands, Day 1 8:00 a.m. → 3:06 p.m.: no, not before
  this round's fixes.** Mik → Eamon → Ísencepan is clear and quick. Then it broke three ways: one steel coin sent the
  company 71 minutes home to sell it for a coin and called the keep "spent" from its gatehouse (PL-25, data); at
  Marsh Howe, the den cleared, the foreground was only the way out and the coin was under `all` (**PL-25, P0**); back at
  Ísencepan the terminal dropped the gate in (PL-26). With the fixes it holds to 27 coin of 50, and then the debt's
  chain stops (PL-27, P1, proposal). The fights were trivial (a badger, "the leader", two zombies: PL-07 still).
- **kite wanderer, Sefa (elf thief, avoids fights, recruits), ~28 commands, Day 1 8:00 a.m. → 4:51 p.m.: no before,
  yes after.** The road's wagoner, then Newmeet's market-place with fourteen people in it and **nothing gold, the
  mother not on the page** (**PL-28, P0**). Fixed, the fever is the round's best thread: herb-shop, herbs bought,
  given, Edda offering to keep the cups, the fever broken, 300 XP, Edda joining ("Someone has to keep you out of
  trouble"), and PL-06's successor offered. Rough edges: Edda told left on the step (PL-29), a nine-year-old in
  chainmail with a battleaxe, "Speak with Edda" naming nothing, the market's look listing thirteen people in one
  sentence. No fight was needed.
- **thorn courier, Isolde (human mage, explores), ~25 commands, Day 1 8:00 a.m. → 2:55 p.m.: yes.** The notice, the
  catacombs job taken by following it in the Notes, Light cast in the crypt, the chalk ring read by her lore, and the
  raiser talked out of it with what his book left out; Gizon's charm and potions; the letter carried, the toll paid,
  Lindal's fifteen coin and Witrumarc offered as the next thing. Broke nowhere; frictions (P2): the gold went to the
  *unlikely* confrontation while the sure act her lore had opened was only red (PL-31, proposal); the raiser's book,
  told lying on the bones, only under `all`; the three-hour journey told by nothing (PL-04); the same landing, goat and
  notice jobs as a1's Lowmouth.
- **The page, thorn courier, ten minutes at 820 × 1180 and 390 × 844:** creation is clean and quick (eight reasons,
  people, calling, school, past, a name, Set out). Then the first page said **no goal and no Follow** (**PL-30, P1**);
  Follow this was in the Book. Followed, the map took the journey well (the card: "About 6½ hours, arrive 2:20 p.m.,
  Travel to Merscstede"), stopped at the toll (the card's "The bar stays down" with no context, "Something here is
  dangerous" and fight odds for a toll-reeve; his likeness a woman's for "a man in a good grey coat"), and at
  Merscstede the aim's next step, giving Lindal the letter, was gold only on the rail's people icon: Lindal's own pip
  was blue, and the foreground was Cora and the lockup (PL-32, P1). Inside the talk, "Give the sealed letter" was
  marked, and "Seen through · The sealed letter" landed well. At phone width the place's head runs under the row of
  likenesses (the clock line hidden), and the second row of likenesses touches the panel. No horizontal scroll.

**Verdict for outcome 2 (an unfamiliar player sustains fifteen minutes of coherent play):** on main as it stood, two
of three starts did not (a1 debt: PL-25; kite: PL-28), and the page did not say the goal (PL-30). With this round's
fixes all three starts held for fifteen minutes headless; in the page the remaining serious friction is PL-32 (the
aim's person not marked on the picture). Not yet evidence of acceptance: the fixes need a second cold player.

## The human reports, and where each stands

The owner's own play first; then the agents' rounds where they corroborate it.

| Report (source) | Reproduced? | Item |
|---|---|---|
| Gold on aims not chosen, out of a place and back, nothing advancing (owner, 12 Nov, OPR-01; golden-thread note) | **yes**, two worlds: gold for being at the aim's place (the cairn), and on a search that finds nothing | PL-05, PL-08 |
| Choosing a place in the company's own hex walked it out of the town (owner, 12 Nov, OPR-02) | not yet tried in the page; the engine has no guard (the fix is the browser's `MapView`) | see root cause 1 |
| A blue pip with no blue reply; a green Look with no clear collectible (owner, 12 Nov, OPR-04) | **yes**, the blue half: the opening's wagoner | PL-03 |
| Green circle and dot on someone with no green option and nothing to say (owner, 10 Nov notes) | not yet reproduced (no green on a person met so far) | — |
| Two quests for one place, Albustagn (owner, 10 Nov notes) | not tried (`Undertakings.folded` claims it) | — |
| Rat crawlway: followed aim lost, narration three ways, nested aims block (owner, 11 Nov) | **followed aim: not reproduced** on main 73cac481, headless: following the rats job from Bask, cellar → runs → nest → back to Bask, the followed aim went on into the nest aim and then "Tell Bask …" each time, gold one act throughout, paid (about fifteen commands, save `a1-ratsdead.json`). Not tried in the page. **The telling:** reproduced in part ("lie dead" before the fight's blows) | PL-04, PL-11 |
| "Listen at it" on a padlock; targets unnamed (owner, 11 Nov, action projection) | **yes**: "Listen at the corn-store padlock" in a1's `all` | P2, open |
| Travelling must reveal the landscape; encounter chance per hex (owner, 10 Nov) | **yes**: five hours through Mistshaw green told by nothing | PL-04 |
| A battle in the caves absurdly easy (owner, 10 Nov) | **yes**: the den's zombies never touch the company | PL-07 |
| Corn-store key-holder hard to find; ways lead out not in (owner, 6 Nov) | not tried yet | — |
| Looking empty; gold on the place you are; one click to go (owner, 7 Nov) | the gold half: PL-08 | PL-08 |
| A person with only "Take your leave" advertised as conversable (owner, 9 Nov) | not met so far in the terminal | — |

## Common root causes

1. **The promise/projection boundary: presentation infers what an act will do** (the retrospective's first
   candidate). Verified four times so far: PL-05, PL-08 and PL-12 (gold for an act's *location*: `Affordances.there`, a search
   "where your aim is", every door off the aim's place, where the typed `AimAdvances` had a gap or already had the
   answer) and PL-03 (blue for any `knows(…)` assertion, where the fact was the company's own deed).
   PL-11 (gold on the way to a place the aim's words name, while the aim's real wait, a fight, stood here) was the
   same fault: the typed wait was read, but a fight's end was not counted as anything an act brings about. In each the engine had the typed answer, or nearly; a nearby heuristic answered instead. The fix that held was to
   make the typed reading complete (a rule's `teaches`; a fact the act itself makes so) and delete the heuristic. PL-15 took
   the talk's wording rules out (`TalkFocus.weighty`, `AimAsks`); PL-18 moved E155's guard into the engine. Looked
   at and left: the ways' notes ("further in", "back out") are words for reasons that are themselves typed
   (`Glance.inward`, `onward`: a site's rooms, visited or not, underground), not read from words. Still standing: E155's own-hex navigation guard lives in the
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

# The Book of Faces: notes on the cisterns, the Heronry and the ranger (A8)

*Files: `data/adventures/book-of-faces/cisterns.kyr` (prefix `ci_`), `heronry.kyr` (`hr_`), `ranger.kyr` (`rg_`). Tests:
`test/ombra-cisterns.test.ts`, `test/ombra-heronry.test.ts`, `test/ombra-ranger.test.ts`. The persons are `pip`, `ci_nell`,
`ci_tobit`, `withy` (the Heronry's warden: not Reed, see friction 12), `halloran`, `garrity`, `heron`, `hr_young`, `hr_hawk`,
`ci_eel`, `ci_rats`.*

## What was built

### Pip (Round 7, `r_pip`): cisterns.kyr

A lamp-boy of nine, with a candle-stub he will not put down, in a leather Owl cut down from a man's. He thinks that seeing
the Registrar bare is what killed her and that her face is looking for him; he was left in the dark with her by the clerk,
who told him he had seen nothing. **Beats:** find the boys; get him to talk; learn what he saw, by degrees; settle where he
goes.

- *Finding them* (five ways that differ in what they cost): track the den (woodcraft, a check; failed, the boys go to ground for
  twelve hours), leave a ration and sit an hour (no check, a ration), sit out their fear in the dark at night (nothing at all),
  hold out three coin (they take it, tell what three coin buys, and go to the loft: the bribed Pip tells `pip_saw` only), or
  tell Sergeant Vail (the Watch fetches him: all three facts at once, the Round never done, a "witness" in a white domino with
  a ribbon who says he is nobody). The ranger has a sixth (ranger.kyr): read the Chapel porch, the cistern grating and the rats'
  lane (three checks) and then walk in downwind and still, which cannot go wrong.
- *The talk:* five checks (woodcraft to find him, insight to read his fear, performance to make him laugh, mending to roll
  him a whole candle from his stub, persuasion to tell him that a Bare is no one and so what is told to a Bare is not Said),
  and a route that needs none of them: a ration, the question, a candle the company already carries, an hour's silence. **What
  moves him is being asked** (`ci_pip_ask_want`): he has had the Watch, the steward and the Chaplain *tell* him he is safe, and
  the topic that tells him "it cannot have been seeing her" is written to do nothing. Nell, his bossy sister of eleven, says so
  if asked how to get him to talk. He tells it in three degrees: what he saw (`pip_saw`, and that she knew his name and was
  sorry), who else came (`serene_saw`, and that the clerk told him he had seen nothing), and the Warden (`lacke_unfaced`),
  which he will say only to a wall or after an hour's silence, because he knows the name and will not say it.
- *Forgiving the clerk:* the company may tell Pell that the boy is alive (Pell, in his own topic, gives the reason he said it:
  a child who says he has seen nothing is a child), and carry it down; Pip forgives (`ci_pip_forgave(party)`; post.kyr reads it).
- *Where he goes:* he is asked (`ci_pip_where`), and the company may pay six coin to the Owls' steward so that the three boys are
  not counted (`ci_pip_stays`), or take him to the pigeon-loft at the Post, where Old Garrity, who is deaf in one ear, does not
  take boys until this one says "There" before the bird has landed (`ci_pip_garrity`, topic with `garrity` in heronry.kyr).
  Left alone, the Flood puts the boys on the loft roof on the sixth morning.
- *Registers:* by day a bare company hears one cold thing; a masked company that is not an Owl hears another; an Owl is spoken to
  as a trimmer; at night a bare knock is received.

### The Ninefold Drain (cisterns.kyr)

Five reaches added between the mouth and the pump (`ci_weir`, `ci_slick`, `ci_eelrun`, `ci_chimney`, `ci_aenean`), then the spine's
pump-chamber, cellar and hatch. Passable days 1 to 5; from the third morning the Siphon fills (a hazard, unless the pump is running);
shut for good on the sixth morning (the Flood sweeps the company out, with a hazard, unless the hatch is open, in which case it
comes up the hatch after them, and the Urn Hall is wet). Obstacles, each with different ways:

| Reach | The problem | Ways |
|---|---|---|
| Weir | four lamp-rats | a light drives them back; fight (`ci_rats`) |
| Oil gallery | fumes: a lit light goes off like a bell | dark (the knotted line: Pip's route, or wayfinding; else a slip, 1d4); seal the leak at the third pillar (mending, digging or brawn), after which it clears in six hours; burn it off from the weir (at the Drip's cost, flagged `ci_oil_burnt`) |
| Eel-run | the eel, who keeps the Siphon | toll (fish-heads from the boys' bucket, or a ration), slip past (stealth), fight, or go over by the ledge and chimney (climbing or the Brewers' rope) |
| Siphon / chimney | water to the roof from the Deepening | crawl (days 1-2), swim (hurts), climb, or start the pump |
| Aenean door | a pressure-plate and counterweight | prod it with the pole, trapwork (after looking closely), or the lamp-boys' left-hand slab |
| Pump | silted, dry, unstarted | clear (digging or brawn, or mending), prime with lamp oil (drawn at the tap), start (brawn, or lockwork, or mending) |
| Shaft | rusted ladder | rope or climbing |
| Hatch | bolted from above | lockwork, brawn or a crowbar; let it down on its seat afterwards or the Flood comes up it |

**The pump's valve** (`ci_valve`) throws what the pump draws to the lagoon (through the Heronry's reeds, as the Aeneans had it) or to the
Weighhouse Yard on the Row. Left as set, after six hours the reeds are drawn: the herons go (`ci_reeds_drawn`). Turned to the cut, the
Yard dries (`ci_yard_dry`), which is the better site Halloran can be shown. It is the one place the thread about the pump turns
into the thread about the reeds, and a company that has not read the plaque (lore, or by looking closely at the valve) does not know.

It teaches `lie_urn` from below: the bronze plate under the Urn rings hollow, and the Aeneans' catch-bowl has not a mark in its dust.

### The Heronry Writ (Round 8, `r_heronry`): heronry.kyr

Mistress Withy is the warden; the Heronry is the one place where a bare face is answered by day (a deliberate inversion; a
masked company is the one that is told "you've brought the city in with you"). Halloran, the Exchange's surveyor, is a Weights clerk
and goes by day in the Heron's cowl (so a Heron is a colleague; the bare are told he is not at liberty to have heard). The Writ is
tried at the Ninth Bell on the eighth day by a Weight sunk or not. Approaches, all of which end the Round:

1. **Nurse the heron.** Mistress Withy frees her if the company holds the lantern and stands still (no skill), or a company with
   woodcraft or mending cuts the line itself; a ration feeds her; she stands in the pool six hours later. Holds the Writ.
2. **The wording.** The stone says *a* heron (lore, from the stone); the Exchange's copy and the warden's memory say *the*. Put to
   Halloran (lore, hard; as a Heron, easy, and raises `goodwill(face_heron)`), after which a young heron holds the pool. Holds it,
   unless the pump has drawn the reeds and the herons have gone.
3. **The pump** (cisterns.kyr). Dry the Weighhouse Yard, tell him: no check. Halloran's relief is the point of the scene.
4. **Consent.** After the Flood (the six hundred of the Drip camped at the Heronry's edge) Withy asks the Bare to choose; told to
   let it go she does, and the Weight is sunk with her leave; with the Drip's terms (persuasion, hard: a third to the six hundred,
   a third to the yard, the east reeds a pond and a bell) the Writ is traded, not lost (`hr_garden_deal`). Not obviously wrong.

Left alone, the Weight is sunk and the Round is not done; tried and failed, it is sunk and the Round is done ("whichever way").
Consequences: Observes at the edge, fates, and `hr_reeds_kept`, `hr_reeds_sunk`, `hr_garden_deal` for others to read.

### The pigeon strike (heronry.kyr)

Garrity's birds will not fly: a peregrine has taken the loft's chimney, and he, who is deaf in one ear and cannot hear her high cry
in the other, has not noticed. Read the signs (woodcraft, from the roof) or wait for the dawn stoop; then: drive her off (climbing;
she goes to the reeds), fly the birds at her hours (a topic, no check), or net her (trapwork; twelve coin from the Exchange's
falconer, and she is a perch in a hood). All three set `hr_birds_fly`.

### The ranger (ranger.kyr)

Urban tracking as a craft: three readings of what the rain does not wash (soot at a child's height, crumbs on a grating, the rats'
lane), each a check that fails safely; then a method with no check. Mistress Withy asks a ranger what a ranger is for (keep the wild
out of the city, or mend it so the city can live beside it) and what is answered is the arc's creed; what the company does about the
Writ is what the closing account reads (`rg_wild`, `rg_tended`, `rg_lone`). The old heron drops a feather: taken (a charm that grants
stealth, and the old bird will not come to the Hall) or left (given, from the warden's tin, later: a charm that grants woodcraft). The
vigil (an hour at the pool until the Ninth Bell: `endow` wisdom by one), Withy teaches `hide` (the ranger's third-level technique) to a
lower-level ranger, Garrity gives Tally, a homing pigeon, which cools the Watch's count by one. The finale has two ways, separate acts, at
the Urn Hall on the ninth night: the old heron loosed in the light-well (a sign the crowd takes for the Registrar), or Pip brought up to
say that the Warden said her name (testimony; he is not to say the name). Either sets `handPlayed(party, hand_heron)` and
`handWay(hand_heron)` to 1 or 2.

## Ids others may read

`ci_pip_forgave(party)` (post.kyr); `ci_pip_settled`, `ci_pip_stays`, `ci_pip_garrity`, `ci_pip_taken`, `ci_asked`, `ci_candle`,
`ci_trust(pip)`; `ci_oil_burnt(party)` (the Drip's lamp-oil is gone: the Lamp-Trimmers' strike, drip.kyr, might read it);
`ci_hall_wet(party)` (the Flood came up the hatch; drawing.kyr can wet the Urn Hall); `state(ci_hatch, ci_open)` (a way to the Urn Hall
from below stands open: the Registry may care); `ci_yard_dry`, `ci_reeds_drawn`; `hr_reeds_kept`, `hr_reeds_sunk`, `hr_garden_deal`,
`hr_writ_held`; `hr_birds_fly(party)` (the Post's messages: post.kyr may read it); `rg_heron_flown`, `rg_pip_spoke`; discoveries
`ci_boys_found`, `ci_pip_named`, `ci_pip_fear`, `ci_pip_wish`, `ci_pip_clerk`, `ci_pip_hers`, `hr_hawk_known`, `hr_survey_known`, `hr_writ_wording`.
I wrote one scene line at `urn_hall` (two Observes about the hatch, `ci_hatch_wet` and `ci_hatch_hole`) because the hatch's state is the
Urn Hall's own news; the integrator may keep or move them. Nothing else of mine is written at a room of another author's.

## Combat, honestly

Harness: `zz/sim.ts` (scratch, untracked): one company of one, human, of the calling and level, at seeds `sim0`-`simN`; the fight is the
single command `Attack`, which the engine runs to its end ("The fight is won" / "The fight is lost"). The figures are fights won
over the seeds, with the survivors' mean hit points left in brackets. Both fights are optional: neither is the only way past.

**The cistern eel** (`ci_eel`: level 1, like a great pike, territorial; warns for ten minutes), met in her room by a company that has
come through the dark of the gallery (so, with the slip in the oil, one die of 1d4 against a dexterity save of 11, as the way
is walked), eight seeds, a candle lit in the run:

| calling | level 1 | level 2 | level 3 |
|---|---|---|---|
| warrior | 6/8 (70%) | 7/8 (79%) | 8/8 (77%) |
| monk | 4/8 (68%) | 7/8 (76%) | 8/8 (56%) |
| cleric | 4/8 (57%) | 7/8 (70%) | 7/8 (79%) |
| ranger | 3/8 (43%) | 5/8 (59%) | 7/8 (50%) |
| thief | 1/8 (44%) | 2/8 (44%) | 3/8 (41%) |
| mage | 2/8 (42%) | 1/8 (33%) | 4/8 (62%) |
| bard | 0/8 | 2/8 (8%) | 2/8 (52%) |

So: a warrior is about three to one at the first level and sure by the third; a cleric or a monk an even chance at the first and four
in five by the second; a ranger, thief, mage or bard should not fight her at any level this book plays at (the thief at the third
is three in eight; the bard at the first has not won a fight). They are meant not to: she takes a ration or the lamp-boys' fish-heads
(thrown, in one turn), a stealthy company slips her, a climbing one goes over, and Pip's own way is the toll. The first draft of her was
level 2 and a warrior of the first level won four in eight; at level 1 she is a fair fight for the strong and a real danger to the weak,
which was the intention.

**The lamp-rats** (`ci_rats`: four, level 1, like an Orsino rat, defensive, in their lair at the weir; a flame, a lit torch or
candle, drives them off, back to the oil-cistern), six seeds, no light carried:

| calling | level 1 | level 2 | level 3 |
|---|---|---|---|
| warrior | 5/6 (92%) | 5/6 (95%) | 6/6 (90%) |
| monk | 5/6 (72%) | 6/6 (72%) | 6/6 (92%) |
| cleric | 4/6 (97%) | 5/6 (93%) | 6/6 (96%) |
| ranger | 4/6 (79%) | 5/6 (69%) | 5/6 (76%) |
| thief | 4/6 (69%) | 4/6 (77%) | 4/6 (82%) |
| mage | 1/6 (100%) | 1/6 (100%) | 2/6 (95%) |
| bard | 1/6 (100%) | 1/6 (100%) | 2/6 (83%) |

(The first draft made them like cave hounds and four of them: no company of one won, and a warrior of the third level won two in
eight. They were the sort of hazard that no one would meet twice and so were made rats.) A company of one without a flame that stays to be
bitten is meant to learn from it; the weaker callings are the ones with the candle, and the candle is what they should have lit.

## Friction in Kyr, Deem and the engine

Numbered, by severity; each says what it was, what was done instead, and what would remove the need.

**1. Attributes in a test's party are ignored, so no check can be made sure.** `CreatureGenerationContext` takes `wisdom: 25` and the
creature comes out with whatever the class rolls (`wisdom: 10`), without a word. A test that wants a branch of a check has to try
seeds (or branch on the outcome). *Did:* a `read` helper and seed loops in the tests (the tests' "a check is a die"). *Remedy:* honour
the numbers (3 to 25) in `play`/`Journey` parties, or refuse them out loud; or a `Journey` that can name a check's roll.

**2. A catalog item kind cannot be asked for unless something of its kind is declared.** `holding(actor, candle)` is refused ("no
itemkind of that name; the itemkinds are ... Coil of rope"): the catalog's kinds become entities only when an `Item … is candle` (or a
`needs`/`wants` fact) names them, so every module that wants to ask for the company's own candle declares a candle at `offstage`.
*Did:* `Item ci_candle_stock … is candle at offstage`. *Remedy:* referencing a catalog id in a requirement should register it.

**3. State and Change ids share one namespace with the shared rules and every other author's.** `State seized` collided with
`dominion.kyr`; in a ten-author module `open`, `safe`, `clear`, `cut` are one word away from a second author's. *Did:* every state and
change of mine is `ci_`-prefixed, which is noise in code that the player never reads. *Remedy:* scope a state or a change to its Thing
(`state(ci_pump, running)` is unambiguous already).

**4. A Thing's state is told from both ends of a way (the Grand Tour's 8, still true).** "The eel lies in the run with her head under the
lip of the Siphon" was told at the far end of the Siphon too. *Did:* words that are true from either end. *Remedy:* `State … from
<place>`; or a state told only at the end the thing stands by.

**5. `Observe … near <thing>` does nothing for a Thing on a passage.** The slab before the Aenean door stands on a way: "Looked at
closely, it is just as it seems," and nothing taught. `beside <passage> of <thing>` is the form (a fixture shows it; the guide does
not). *Remedy:* lint when `near` names a thing that is on a passage.

**6. A hazardous way is no longer a `go`: it is "risk the slab — Wren goes first".** Correct, and the label is odd as a way ("To the
Aenean pump-chamber — risk the slab before the Aenean door — Wren goes first"). *Remedy:* none needed; maybe a plainer label for the
risk when the hazard has a name.

**7. Combat is one command and says one line.** `Attack` runs the whole fight; the page tells the last blow ("The fight is won"), the
company's hit points afterwards are not told, and there is no way to see the odds before. To test combat honestly an author has to
write a harness (mine: `zz/sim.ts`, untracked; it starts a company of a class and level at each seed, walks to the room, attacks, and
reads the creatures from `campaign.state`). *Remedy:* `bin/kyrie odds <campaign> <person> --as race/calling --level n --seeds 8`, or the
page saying "an even chance" on Attack as it does on a check.

**8. A person's topic needs the person where the company is, so a person cannot be fetched.** Mistress Withy tends the Heronry's edge;
the heron is on the reed path. A topic with her on the path was impossible. *Did:* an action, "Fetch Mistress Withy in off the mud",
which acts for her. *Remedy:* an errand (`Pursuit`) that brings a person to a place for a time at the company's asking, or a topic
that moves the person (`Retract at(withy, …). Assert at(withy, …)` in `On discuss` is a way but leaves her there).

**9. A rule anchored `at` a place fires, as the lint says, wherever the company is: so a rule that tells a thing and also records it
needs two.** The Ninth Bell on the eighth day is a world fact (the Weight is sunk or not, whether the company is there or not) and a
scene (the company at the pool sees it). I anchored the rules at the pool and the lint advises me, eight times (with the Flood in the Urn Hall), that they alter the
company's relations wherever it is. They are meant to. *Did:* left the advisory standing. *Remedy:* a form that says "told here, done
everywhere", or split the effect from the telling in one declaration (the Grand Tour's 22).

**10. `says` on a latched `once` rule is lost if the company is elsewhere; a rule that teaches by being heard has to be unlatched.** The
falcon's dawn stoop teaches `hr_hawk_known` only if somebody is on the roof to see it, and a `once` rule fires wherever the company
is, and uses itself up. *Did:* `not knows(party, hr_hawk_known)` as the latch. *Remedy:* as the guide already says; the lint could
advise a `once` rule that teaches.

**11. Putting a light out spends it.** A torch put out in the oil gallery is gone; the player is not told it would be. This is the
cost of crossing in the dark, and I made it part of the puzzle, but it was found in play. *Remedy:* the "Put out" label could say
"and lose it" for what cannot be relit.

**12. Persons' surnames must be unique across all the adventures (`names [legacy]`): the brief's Mistress Reed is Tamsin Reed of Low
Water.** The name check is repository-wide and an error, and a brief could not know it. *Did:* Mistress Withy, `withy`. The error
for Hobb and Nance in the scratch run is the stubs': the integrator's `hobb` and drip's `steward` will collide with the Liberty of the
Ice's Tansy Hobb and the Parliament's Goody Nance, which are not mine to rename.

**13. Role advice for people who are moved by rules is per person, not per rule.** Fine; it made three `Role … when` pairs. A
`Role when` on a state would be shorter.

**14. `--steps` runs before the command-line steps**, and a `=day 6 08:00` on the command line cannot precede steps in the file. Minor.

**15. The tests cannot run against the real campaign until the persons they reference exist.** `pell`, `vail`, `lacke`, `hobb`, `steward`,
`rill` and `dunnage` are other authors'; the campaign does not load without them. The tests default to the book's campaign and take
`OMBRA_CAMPAIGN` for a scratch campaign with stand-ins; they pass on mine and are to be run again on the merge.

## What is thin or unfinished

- **Nell and Tobit** are small: three topics for Nell, one for Tobit, a cold line each; neither has a thread of her own. Nell is the
  person who ought to have a say when Pip is taken to the loft, and she has only a sentence of it.
- **The Pell topics** (tell him the boy lives; carry his words) live in this file and wait on post.kyr's Pell to be somewhere a company
  can speak to him; mine are gated only on the register. If post.kyr gives him a stronger reason to be silent, the two will have to
  be reconciled.
- **The Weighhouse Yard** is dried by the pump and nobody on the Row minds: the Hall of Weights has no reaction, and nobody who
  drowned is mentioned. It wants a line from counting.kyr, whose Thole would care.
- **The hatch**, opened, is a way into the Urn Hall from below with no watch posted on it. If the integrator's registry puts the Watch
  on the Urn Hall (it should), a company that comes up through the floor needs a sentence about it; I gave the Hall a line about the
  hatch and the Flood and nothing about being seen.
- **`hr_hold_fast`** (tell Withy to hold the Writ at the Flood's cost) has no mechanical effect: it is an act and a fate line. The
  company's refusing the six hundred has no consequence in the Drip's own file; `hr_six_hundred` is a discovery that drip.kyr could
  read.
- **The consent-with-terms deal** (`hr_press_deal`) is written and linted and has no journey test: it asks to be at the pool by day
  masked, with Withy's consent, on the eighth day before the Ninth Bell, and a persuasion at a hard difficulty.
- **The falcon** is a peaceable bird with a person's standing; I did not try to fight her, and do not know what the page does with a company that does.
- **Combat numbers** are for one company of one. A company of four is a different fight, and I did not play one.

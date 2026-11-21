# The Warm Wall: friction

*Branch `adventure/the-warm-wall`. Module `warmwall`, campaign `data/campaigns/warmwall.campaign.json`. Story first draft: [story.md](story.md).*

## Creative intent

A small adventure about two people who made the same mistake from opposite sides of a wall. A bath-hall at Seethe, at the
foot of the Brynach fells on the drove road, was cut in two thirty-one winters ago. Maud Veale keeps the Hot Side and
Nesta Thaxter the Cold. The spring that feeds both is going cold because each, hearing the other's pipe run louder, has
opened her wheel a notch every winter. Neither can ease hers alone, because whatever one gives up the other draws.

The wall went up the week a man died on the step: Ammet Sallis, the Rì's headsman, turned away by Maud in front of eleven
drovers. What Nesta never learned is that Maud went out at dawn, carried him in herself, washed him, and buried him on
the drying green under a stone she could not name; and that she has let his nephew in by the stoke door every winter
since. The second evening, the nephew comes down the drove road and does not knock.

It was meant to be: not a ledger (nobody is owed anything), not a mystery (the cause is findable in an hour), and not a
verdict (the player does not decide who was right). It is a place with a temperature, three days of it, and a man on a
step. The pleasure is meant to be physical: hot water, steam, the cold plunge, a hatch, brick that is warm on both
faces. The comedy is Brother Cuthwin's loophole and Pen's prices. The grief is the stone.

Connections: Brynach (dwarf drovers whose lord will not pay the Rì's toll; Madoc Hafren hanged at Dun Rìerdan for turning
back the toll-men); the Rì's headsmen and the assizes of Dun Rìerdan, Caerwen and Llanfor; Hafod; the drove road.
Gethin's brother was hanged by Osric; this is the knot that makes the headsman's return dangerous, not merely sad.

## What works

- **The step.** A man arrives on the second evening and does not knock. If nobody brings him in he dies, in the night,
  of cold, and the two keepers carry him in between them. The page tells his decline by the hour (shivering, then not
  shivering, then not answering), the warrior of the company says why that is worse, and Pen tells you plainly to decide
  before the drove sees him. It is the one place the adventure refuses to wait.
- **Three ways in, each with a price.** Maud's way (the stoke door, and no one told); Nesta's way (the Cold Side takes
  him and has no heat); the front way (the drove walks out). They are different stories, not different routes to one.
- **The hatch.** Four buckets of hot water are passed through the hatch, and with each the two women, who cannot see each
  other, say a little more than they meant to. It is built from four rules keyed on a counter and it is the best scene
  in the adventure. (`Has he been coming?` / `I have not said that.`)
- **The dark.** Before dawn the drove takes the steam in the dark. Osric can be brought in without a lamp and say to
  Gethin what Madoc said, without his face. Nobody is told whose voice it is. The scene asks the player for nothing but
  the decision to do it, and it is the same decision as the door: be present, and say nothing of yourself.
- **The word.** Easing the two wheels together is a small ceremony (`Give the word through the hatch`): each keeper
  stands at her wheel, neither waits for three. The wheels can also be eased quietly by whichever means won each keeper.
- **Four ways to move each keeper**, which differ in what they leave: honest (the stone, then the bed: leaves a door in
  the wall), by the song (leaves the wall), by the hatch (leaves a window), by a lie (leaves the heat, and a secret only
  Pen has). The lie has to be told to both; one told alone is put back at dawn.
- **Endings with a long account of fates, composed.** The five endings are each preceded by fates (the spring, Osric,
  the drove, Cuthwin, Ottoline, Pen) chosen by what was done, so two plays of the same ending read differently.
- **A bard in the company can supply the third part** of Ottoline's duet; the cleric reads the stone; the thief the
  latches; the ranger the pipes; the warrior the man on the step.

## Verification

- `bin/kyrie lint data/campaigns/warmwall.campaign.json`: 0 errors, 0 warnings, nothing to look at.
- `bin/kyrie verify warmwall`: lint, **16 journey tests** and 2 kept traces all hold.
- Journey tests cover: arrival; evidence told to both keepers; the step death (ending *The Step Again*); the hatch in four
  buckets; the honest road to *A Door in the Wall* (stone, bed, maul, word, breach, ending, fates); the stoke route;
  the front route (drove gone); the dark steam scene; the lie told to both (*Even Heat*, with the die forced); a lie that
  fails and cannot be told twice; the song through the wall; the song plus the word to *The Warm Wall*; a bard's third
  part; Cuthwin's plunge and the words over the stone; and *Cold Water* (Osric saved, nothing else done).
- `bin/kyrie reach`: 12/12 rooms, 8/8 people. The curious-player walk ends with the man dying on the step (day 2 at ten
  at night): honest but telling. It does not reach the other endings; the journeys do. This is why the journey tests
  carry the weight here, not the autoplayer.
- `bin/kyrie voice repeats`: the repeats are mostly deliberate echoes (the bell, the stone, `the drove road with his
  pears` closing each of Osric's fates). The five Osric fates share a closing cadence that I should vary.
- Browser: `bin/kyrie preview` built clean and served; headless Chrome loaded the campaign, set out, put away the map
  and read the first page with no page errors. (Screenshot reviewed: the title and map render; the hex country drawn for
  an unplaced module is generic forest. See below.)
- **Not mine:** `test/traces.test.ts` fails on `wren-tower-climbed` on `main` as well (I stashed my work and ran it).

Passing tests are not the same as satisfying play. I have played the honest road, the hatch and the stoke routes in the
terminal by the labels and read them: the hatch, the dark and the step read well. I have **not** played it in the
browser beyond the first page, and I have not had a cold player try it.

## Incomplete or thin

- **Not registered as a province.** I did not touch `data/adventures/countries.json` (a shared registry; adding a
  province re-seeds every drawn world). `placed.json` is written and lints through the campaign, but is **not exercised in a
  generated world**. Suggested entry: side `south`, beside `mountain`, marker `warm_wall` (an entity only this country has;
  add it before registering), name "Seethe", rumour about a bath-hall with a wall through it and two keepers who do not
  speak; a notice the drovers of Brynach bring down. The module needs a `marker` entity and a region terrain before
  that: the page's map draws a generic forest because the region declares no terrain.
- **Day 3 is mostly the player's.** Between the dawn steam and nine at night nothing is scheduled. If the company has
  solved everything by noon, the ending comes when the wall comes down, but a company that has solved nothing meets only
  the clock. I would add the drove's last supper at six as a real scene.
- **The drovers are one man and a chorus.** Gethin is a person; the other ten are a group with three lines. Tegwyn
  asleep is the nearest to an individual.
- **No second-hand route to Gethin.** The player cannot simply tell Gethin what Madoc said. They must bring Osric into the
  dark. That is a choice I like, but it excludes a player who wanted to deliver the message without Osric (and the
  tension of whether to say who told it).
- **Maud's confession is a topic, not a scene.** What she says is right; how it arrives (the player asks) is thin. She
  never tells Nesta herself.
- **Cuthwin and Ottoline have small arcs.** Each does something (the stone, the third part) and each has a fate, but
  neither disagrees with the player.
- **Danger.** The only physical danger is the cold on the step. There is no fight and no hostile creature. That is the
  intent, but the guidance asks that a fight be possible and costly where there is no danger; the real danger here is the
  step, and its exits are three. I did not add an artificial fight.
- **The lie can be told early, before the evidence is believed**; its failure is one try per keeper. Good for a
  desperate player; slightly easy for a cynical one (a forced natural twenty).
- **The two keepers do not react to the company's hours.** They do not go to bed.
- **No reward for the plunge beyond Cuthwin.** The player is never offered the baths themselves as pleasure. A hot soak
  that heals and a plunge that wakes would be natural and I did not write them.

## Authoring difficulties

1. **Canonical names collide silently until lint.** `yields`, `trusts` and `arrivedAt` are canonical and refused my
   Relations; a rule and an ending cannot share a name (`step_again`). The error names the rule, but it would help to
   have `bin/kyrie names` cover relations and queries.
2. **A rule that tells something is heard "wherever the company is"** unless it is anchored with `at`; lint advises, but I
   found it only after reading the page, because the heard-anywhere form had worked silently in testing.
3. **There is no way to author a counted scene.** The hatch is a counter and four rules each with a latch relation. A
   `Beat` construct (n-of-m, said when the nth happens) would have saved about thirty lines and a class of mistakes.
4. **Endings cannot interpolate.** The fates are a chain of rules, each latched on the one before, and an ending is
   reached after the chain. It works, but a chain of fifteen rules with ordering dependencies is fragile: a missing
   variant stops the book from closing, and nothing says so. (I found this when a fate branch had no case.) A `Fates`
   block of independent conditional lines said in order before the ending would be better.
5. **Moving people and company.** `Assert at(maud, hot_wheel)` moves her; so does `Assert at(actor, steam)` for the
   company. Both worked. `Retract at(gethin, ?p)` removes him. Nothing in the guide says the first two are fine; I tried.
6. **Journey steps are anchored regexes** and `^To the A|^To the B` binds oddly. I wrote one pattern per step.
7. **A passage that should not be seen** (the stoke door) must be `hidden until` a discovery, which then needs a
   topic that teaches it. Obvious in hindsight.
8. **Heat as a number is not a place.** I used a measure and observations by band. A `Scenery` with states (hot / warm /
   tepid / cold) and rules on it might have been cleaner; I wanted the measure's arithmetic.
9. **Deem.** The only Deem in this adventure is one install-time roll for when Osric arrives (`(1d3) + 15`), so a company
   cannot learn his margin. That is variation, but not rich. I wanted module-local weighted tables for the bathers' talk
   and for what each keeper says on a bad morning, and could not get them without engine work.

## Proposed improvements

- Kyr: a counted `Scene`/`Beat` construct; `Fates` blocks before an ending; a `Together` action (two named people consent,
  both are changed at once); `Routine` for hourly schedules (Nesta swims at six, Gethin steams at five) instead of paired rules.
- Kyr: let a topic carry a `Seen`/`Heard` anchor (so a topic's effect can be told elsewhere); let `Ending` take `over`
  more than one name.
- Tooling: `bin/kyrie names` over relations, queries and rule names; a lint that finds a fate chain with no case.
- Journey: `j.reached('ending')` (I used `holds('reached', 'warmwall__x')`).
- Deem: module-local tables, drawn per play, for guest talk (the bath is a place where people talk).

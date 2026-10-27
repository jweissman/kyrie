# The Banns at Hessel — what Kyrie can do, and the plan

*Stage 3. Written after reading, for this purpose: the grammar (`src/lang/Kyr.ohm`); the shared rules
(`data/rules/core.kyr`, `people.kyr`, `dominion.kyr`, `belongings.kyr`); checks (`src/rules/checks.ts`) and who brings
a skill (`src/campaign/party-capabilities.ts`); milestones and module experience (`src/campaign/progression.ts`);
placement (`src/world/countries.ts`, `src/world/frontier.ts`, `test/adventure-library.test.ts`); the authoring guide;
and the two most recent finished works, *The Third Night* (`data/adventures/wrayford`) and *Gosse's Company*
(`data/adventures/gosses-company`), with their tests and friction reports. Each element of the revised design
([03-revised-design.md](03-revised-design.md)) is marked **direct** (Kyr says it today), **work-round** (sayable with
machinery the module builds), or **extension** (a general change). Nothing here needed an extension before building;
§9 lists the ones that play might show.*

## 1. The module and its entrances

- **One module, `hessel`**, in `data/adventures/hessel/`, in files by strand. Ids are namespaced `hessel__…`.
- **Played alone**: `data/campaigns/hessel.campaign.json`, whose bundle (`module.json`) includes `company.kyr`: a
  company of one, coming over the down on the Orm road at nine in the morning. **Direct.**
- **In a world**: `placed.json`, the same files with `placed.kyr` (`Entity party: group "Your company".`). **Direct.**
- **Placement**: a `countries.json` entry, appended last, on the **north** side, beside forest, mountain, marsh and
  frost. North of every first country is always the Long Man (it is held beside every terrain), so Hessel is never on
  the first ring: it always lies **one country further out**, beyond the north march of a generated country of one of
  those terrains, which `Countries.plan` chooses by the seed. The first country's folk tell it by its `far` line ("where
  ..."); in the country it is entered from, the innkeepers tell its `rumour`; the road over the north march comes into
  `down_road`. Appended last, it moves no earlier country (each is placed in list order). **Direct**, to be proved by
  a journey from a first country (§8).
- **No season.** The world's calendar starts in any month (Gosse friction, "the world's calendar has no season the
  text can trust"). Hessel's Season is its own: the text never names a month, a frost or a harvest. Carth House keeps
  winter whatever the month outside, which is the point of it. **Direct**, by care.

## 2. The clock

| Element | Mechanism | Status |
|---|---|---|
| Days counted from arrival | `dayN(hessel_town)`, increased at the first six o'clock after the first hour, as Wrayford does | direct (work-round, the Wrayford pattern) |
| The daily round (Pump Room at 8, baths, walks, dinner, Rooms at 7) | Rules on `hour(clock)` moving people (`Assert at`), gated on not having joined the company and not being bedbound or away | direct |
| The knock at two | A rule at Carth House's steps at hour 2, each night, latched once a night | direct |
| The College at noon on day 2; the third reading at 11 on day 3; the wedding at 10 and the Ball at 7 on day 4; the coaches at noon on day 5 | Queries `secondDay()`, `thirdDay()`… with hour comparisons | direct |

## 3. The city

| Element | Mechanism | Status |
|---|---|---|
| A vertical city: the Downs, Upper Hessel, the Baths, the Old Town | One region `hessel` holding wilderness (the downs, the Orm road) and a settlement (Hessel) with buildings (the Rooms, Carth House, the Cherretts' lodgings, Saint Ebba's, the Pump Room, the Two Poles, the Hospital…); rooms on grids per area | direct |
| The Parade, steep: walking up it takes longer than coming down | Two passages are not allowed between the same rooms (lint: duplicate passages); one passage, 10 minutes. Steepness is told, not timed | work-round (cosmetic) |
| Sedan chairs: a fare to be carried up or down the hill | An action at the chairmen's stand and at the Circus: pay and be set down at the other end (`Retract at` / `Assert at` the company). Withdrawn while the chairmen are on strike | direct |
| Places told briefly on return | `visitedBefore` relations (Wrayford's) | work-round |
| Places only open at some hours (the Rooms 7–11; the Pump Room 8–12; Saint Ebba's for service) | Passages `opening when` with a shut description | direct |

## 4. People and conversation

| Element | Mechanism | Status |
|---|---|---|
| People with their own greetings and manners | `Person … { Role, Greets, Greets again, Manner, Pronouns }` | direct |
| Talk that changes with what has happened | `Topic … when … once { Says … On discuss { … } }` | direct |
| Questions put to the player (Ottery on the road; Mrs Cherrett's "What would you do, in my place?") | A topic or event that asserts `asked…`, then answer topics gated on it (Wrayford's reeve) | work-round |
| Positions the protagonist takes, remembered and turned | Relations `saidTruth(party)`, `saidComfort(party)`, `saidLied(party)`; later topics gated on them, with different words | direct |
| Minds moved by people, not exhibits | Each mind's move is a named fact asserted by an act (stood beside, asked, laughed with, given the baby); topics gated on it. **No measure of affection is ever shown**; where a count is used (the chairmen's goodwill, Mopsa's regard), it is a hidden measure read only by conditions | direct |
| Mrs Scrope's gossip | Topics "Tell Mrs Scrope that…" assert `toldScrope(x)`; a rule at dinner (hour 15) makes each told thing public, with its consequences; the next morning's Pump Room talk tells it back | direct |
| A protagonist's courtship of Mopsa | Shared acts as facts (`walkedWith`, `laughedWith`, `sawHouse`, `dancedWith`; and `triedRescue`, `liedTo`, which spoil it), read by her words and by the proposal's requirement | direct |
| Companions: Ottery or Mopsa going on with the company | `willing(x, party)` then the standard `recruit`; their hour-rules gated on `not travelsWith(x, party)` | direct |

## 5. The strands

| Strand | Mechanism | Status |
|---|---|---|
| S1 The runaway chair | An event on first coming to the top of the Parade; three actions (catch: `brawn` check; dive for the brake: a `stealth`-free plain act at a cost; let it go); the outcome as facts read all week | direct |
| S2 Into the Rooms | `barred(cherretts)`; four ways each asserting `admitted`; the Rooms' porch passage refuses the household (a Twiss observation) while barred | direct |
| S4 The chairman and the heiress | Facts for each discovery (Observe … teaches); a note as an item of a local kind (`Kind note … is treasure worth 0`), carried and given (`Wants`); the Sham Castle meeting as a timed action at noon | direct |
| S5 Rupert's secret and the third reading | Discoveries by following (an observation at Hetty's at noon while Rupert is there), by looking (a try on the hat), by drinking with him; the reading as a scene at 11 on day 3 with live actions only during it (speak; bring Hetty in; nod to Ismay; stay silent) | direct; the occasion written by hand, as Gosse and Wrayford wrote theirs |
| S6 A Winter in Carth | Carth House as a building with a front door (barred thing), an area door (Mrs Brannagh), a coal-hole (`needing lockwork or brawn`), a window (`needing climbing`, or opened by Celia); the heat and the stopped clocks as observations; the knock as a rule; Sir Gervase as a person who turns hostile on an intruder at night; the decision as grave actions | direct |
| S6 The poem | A made thing: Rob's poem has lines chosen from what the company has itself seen of Celia (each sighting a discovery); a poem of things seen moves her, a poem of Rob's own does not | direct |
| S7 The Road to Orm | Rooms on the road; Ottery travelling with the company (`following`, as an escort, so he walks with them but is not a member); his questions as events at each station; answers as topics; the gate decision as three actions; the sheep-path a passage `needing woodcraft or wayfinding`; footpads as a proud band that names a price | direct |
| S8 The chairmen's fare | `strike(chairmen)` on day 3 unless settled; settling by Twiss (Rooms), by carrying for them (a `brawn` act, Old Town), or by breaking it (carrying for the gentry) | direct |
| S9 The Hessel drops | Mrs Cherrett's state (`dosed`, `doubled`); local kinds (`hessel_drops`, `pump_water`); the swap as an action at her dressing-table by night (`stealth` check, or with Mopsa); persuasion by persons as topics gated on standing; Hartopp's ruin as facts | direct |
| S10 Mopsa's lease | Coin (40) or a character (a fact from Twiss, Lady Wenlock or Lanyon); the agent at Quay Lane | direct |
| S11 The Closing Ball | Hours 19–23 on day 4 as five dances; actions to dance with someone, offered only in the right dance; events at each dance's end read the week (Celia comes in; Hartopp's third dance and Twiss's bar; Kit at the porch); the last dance after eleven by Twiss's leave | direct; the occasion by hand |

## 6. Endings and the account

The book closes at noon on day 5. **Fate rules** fire first, each telling one strand's morning-after (the Wrayford
pattern, `fate_…` rules latched by `spread`); then **one ending** holds, chosen by whether Mrs Cherrett is alive and
whether the company was ever of her household. Every ending and every fate requires `cameToHessel(party)` (Gosse's
friction: endings must not fire for a company that was never there). A company that leaves Hessel before day 5 is
told nothing until it comes back; the chapter closes all the same when the Season ends, and the world goes on.

## 7. What is deliberately not built

- **A general promise construct**, **belief apart from knowledge**, **a public-occasion construct**: each large and
  general; the design does without them. The occasions are written by hand (third reading, Ball), at about the size
  Wrayford's were.
- **Gossip as a general system.** Mrs Scrope is one person whose topics have consequences. A general "news travels
  at its own pace" (the repertoire's G8) would serve better, and is noted in the friction report if play shows its
  absence.
- **A shared catalogue entry.** Every kind and item is the module's own.

## 8. Tests planned

- `test/hessel.test.ts`: lint; each strand's alternatives; both principal approaches end to end (the Rooms; the Old
  Town); doing nothing; the Road to Orm with each gate decision; builds (a bard, a thief, a warrior, a ranger, a
  commoner with no charisma or learning); persistence (kept and resumed; replayed twice from a seed); the generated
  world (a first country's folk tell of it from afar; the country beyond tells it in full; the road leads in; the
  chapter closes and the world goes on).
- `test/hessel-wander.test.ts`: seeded random offered-action play with invariants (nobody in two places; nothing
  offered that does nothing; no ending before the Season ends; the company never stranded).
- `scripts/hessel-transcripts.ts`: journeys written out as the page tells them, into
  `doc/adventures/banns-at-hessel/playtest/`.

## 9. Extensions to consider, only if play shows the need

1. A topic that teaches silently (Gosse friction: taught facts print themselves before the speech).
2. Hearing at a distance (the knock heard from the Crescent, not only at the door).
3. A rule anchored at a place that does not fire unless the company is there (Gosse friction; worked round with
   `at(party, …)` in conditions).

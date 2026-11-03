# The Cold-Lamp Demonstration (`q_coldlamp.kyr`, prefix `cl_`)

*Glass Quarter. Engineering, theatre, sabotage. Test: `bun test test/quittance-coldlamp.test.ts`.*

## Premise

Perpetua Wynne's cold-lamps are to be shown to the Offices in the Lamp-house's demonstration hall on the fourth day
(`day(clock) == 4`) at three. A hundred lamps hang from the ceiling. The Phoenix wants them to succeed (fewer fires,
lower payouts); the Gas Company wants them to fail and has a way of making sure. Wynne, tired and writing her speech,
has not done the nightly venting for a week.

## The mechanism (designed, not asserted)

Each lamp holds a spark that is let out every night into a catch-jar for an hour and taken back; skipped, the lamp
dims, goes yellow and whines, and sickens. `cl_rack` ("the hundred cold-lamps") is a Thing with states `sickening`,
`bright`, `empty`. Venting takes six hours and a crate of catch-jars (Wynne gives the company the crate when they
offer to vent for her; she will not watch). A vented rack is bright for twenty hours (`cl_ventedAt`), then sickens again,
so a company that vents on the first night finds the lamps dim again on the fourth afternoon. Venting is where the
company sees the sparks notice (`d_cold_lamp_bound`): at about the thirtieth jar a hundred small lights stop turning
together.

The crate of full jars then has to go somewhere, and the choice is the quest:

| Where the jars go | What it is | Needs | Result |
|---|---|---|---|
| Back on Wynne's shelf | honest help | nothing | the lamps shine; Wynne does not know what her lamps are until told |
| Into the Gas Company's boiler (`retort_house`) | the cheeky one: sabotage by joining the Company's own fire | lockwork while the shifts hand over (the retort-house stands empty at five and six hours), or 5 coin to the stoker on duty, or the steward's word | the lamps shine, the Company's gasometer rides up its guides and the relief burns twenty feet for a quarter of an hour; `regard(gasco)` down, `cl_slighted_gasco(party)`; the Inspectorate's notice is withdrawn in the confusion |
| Into the warm bricks of the old furnace-mouths at the Furnace Wharf | freeing them | knowing what they are (`d_cold_lamp_bound`) | the lamps are glass and the rack is `empty`; Wynne, if she was told, stands up and tells the Offices (`cl_confessed`); if not, the lamps are dark and she is ruined |

## The Gas Company's move

At noon on the fourth day the Gas Company's Inspectorate nails a notice to the demonstration hall: CLOSED PENDING
EXAMINATION OF VAPOURS. It is removed by any of: Lord Gaunt-Halloran bought in (`arc(gaunt) == 2`), the boiler incident,
or the stokers' steward turning the Company's own notice-carriers (`cl_stewardSide`). A company that vents but does
none of these loses the afternoon with bright lamps and a locked door.

## The levers on the chairman (never the poor)

- `arc(gaunt)` 0 -> 1: flattery. Admire the gasometer (performance) or notice that the chandelier hisses in tune
  (insight). One try each; a failure leaves the other.
- 1 -> 2: profit (the Company meters the lamps; persuasion) or a role (the first-lamp key struck at the Policy Booths for
  5 coin, which needs no check). Asked about the stokers' docked half-days, he says it is a matter for Mr Gudgeon.

## The stokers' steward

Amos Threlfall's grievance is practical: every time the pilots go out on a man's shift the man is docked a half-day
for pilot-neglect, and the pilots go out all at once everywhere. He is on the Stokers' Steps by day and, on the fourth
afternoon, up at the Gasworks arguing the new rota with the Chairman. He takes the company's side when it can tell him
it has *seen* the pilots breathe in step (`d_pilots_step`, from the Lamplighter's Round): so the two quests meet in the
Quarter. The shift change (the hour before six and six) is on the clock for everyone: Mallow, Hesketh, Gudgeon.

## Wynne's realisation, and "another way"

When the company tells her what the sparks did, `cl_stage(wynne)` goes to 1: she will not keep them if she can be shown
another way. Another way is in the Glaziers' Passage: the flame in the shed (the same flame the Lamplighter's Round
takes a taper from), a free spark that stays of its own will. Walk her there (she follows) and `cl_stage` is 2. She
goes back running and draws a lamp with a door.

## Outcomes at three on the fourth day

| Condition | Outcome | Writes |
|---|---|---|
| lamps vented, stage 2, notice stopped | the Offices adopt the lamps with the amendment that the next will have doors (`cl_adoptedOpen`) | `regard(phoenix)` +2, `regard(gasco)` down 1, `cl_ordinanceTight` |
| lamps vented, stage 0 or 2 (not 1), notice stopped | the Offices adopt the lamps as they are (`cl_adopted`) | same |
| stage 1 and not freed | Wynne refuses to demonstrate; the Gas Company shows a gas chandelier (`cl_refused`) | `regard(gasco)` +1, `regard(phoenix)` down 1 (only if the company was involved) |
| freed, stage >= 1 | Wynne tells the Offices herself (`cl_confessed`); the Ordinance is referred to a committee | `regard(phoenix)` down 1 |
| freed, never told | dark lamps; Wynne ruined (`cl_ruined`, `cl_slighted_wynne`) | `regard(gasco)` +1 |
| exposed to Ottoline Prewitt | the Offices do not attend; the Lamp-house's books are sealed | `regard(gasco)` +1, `regard(phoenix)` down 1, `cl_slighted_wynne`, `cl_slighted_phoenix` |
| sick lamps, or notice up | the Gas Company wins (`cl_gaswon`), Wynne is ruined | `regard(gasco)` +1, `regard(phoenix)` down 1 (if involved) |

Regard moves only for a company that took a hand (`cl_involved()`); a company that was never there has no standing to
gain or lose.

## Rewards

- `salamander_lantern` (declared `cl_lantern`): when Wynne has been shown another way (`cl_stage == 2`), at any time,
  including after a refusal (the "and what then" of a refusal is that she builds the lamp with the door anyway).
- A coal on day 6 or later (`quantity(actor, coal)`, expires after a day): to a company that freed the sparks and told
  her; the spark that stayed in the back jar.

## Build matrix

- Plain company with coin: the bribe at the boiler, the Booths' key for the chairman, the crate and the vent (no skill).
- Thief / lockwork: the padlock at the shift change.
- Persuasion / bard: the chairman's profit and flattery; Wynne (just telling).
- Insight: the chandelier.
- Lore / mage: none required; `cl_w_sparks` gives the history.
- Rites / mending: nothing; the cold-lamps are not their quest. (Admitted.)

## What changed from the brief and why

- "Rig a rival lamp-show" is not implemented: the third thing, Wynne telling the Offices herself (`cl_confessed`), took its
  place, and the Lamplighters' Hall procession I had in mind would have made this quest depend on `q_lamplighter.kyr`'s
  outcome. The Offices-adopt, Gas-wins, Wynne-refuses and third-thing endings are all there.
- The sparks are *let out* and taken back, not consumed, so that the boiler is a way of venting (and of insulting the
  Company) rather than a way of destroying the lamps. Freeing is the one irreversible thing.
- The chairman's "profit" lever is a licence for the lamps; "a role in the ceremony" is a first-lamp key.

## Weakest part

Gas-Company sabotage is a single event (a notice at noon) that three different things lift, and the boiler and the
steward are mechanically thin variations of "open the door". Wynne's realisation is a told-to-her scene; the company
cannot let her watch. The lamps being "slaves" is delivered as an action's result and a topic, not as something the
company walks into. The Offices are one rule each, with no persons attached.

# Tallow Deep — what was built, what was played, what the engine did not carry

*Adventure I of [the anthology](README.md). Module `data/adventures/tallow/` (province "Tallow Edge", west of the first country), spec `test/tallow.test.ts`, steps `test/fixtures/tallow/journey.json`. 7 November 2026.*

## What it is

A limestone ridge that swallows a river, with three ages of works in it (the makers' plumb-line Bore; the Aenean conduit and the Calx Way; the Brasiers' Company's mine) and a smugglers' band squatting in the top. About fifty rooms on five levels, four ways in (the Tallymen's adit, the Rising, the Swallow, the buried Calx Way) and a shortcut that persists. Ecology: bats, centipedes, rats, spiders, an owlbear, a slump, ghouls, hollow-stalkers and clockwork custodians, each with a territory, a telegraph and a way that is not a fight.

**How the creatures relate:** the spiders eat the bats and the rats, so poisoning both rat colonies sends the spiders down to the Settling Cistern (`spiders_range`); the slump eats guano from the bat chimney, so a sack of it is a bargain; the ghouls eat the Company's dead, so laying them to rest (a rites check) ends them; the stalkers hunt breath, so muffling with blankets is a timed passage; the custodians keep a measure, so the beat on the Tally-Wall (or the chart's border) is a password.

**Four routes, one hill:** adit (a toll, a lie, a stealth slip or a fight); Rising (not in spate; the guano; the Settling Cistern; burn the webs; the sluice); Swallow (rope, an owlbear to be baited); Calx Way (found out by a letter; oiled; dug). The sluice shuts the river for four hours and dries the causeway to the Cap; the water comes back whether the company is ready or not.

## What was played

Spec: two expeditions in one session, no fights, lint clean, a save and reload mid-way. Independent playtest (an agent who had not read the sources, ~70 invocations): two expeditions, one ended in an unfair death (below, fixed), one in a complete traverse by the Swallow and out by the Calx Way. Findings kept in the lists.

## Playtest findings acted on
- **Fixed:** bell-teeth sat in the Gear-Hall, where a bare "Take" outran the custodians' patience and wiped the party. Moved to the Breach.
- **Open (content):** the owlbear's and slump's "blocking" state text still reads after they are placated; the Cap shows the slump's wall; Orpe does not buy the orrery.

## 1. Content that works in play
Lore from three people; the Tallymen's toll (pay, lie, slip, fight); poisoned rats that die in the night; the specimen drawers and the brick door; the cage, the rope, the sump; the Foreman's desk and letter; the rim's plants and the garden's by `grows/crop`; selling to the assayer; the Rising, the spate (die at first light), the Settling Cistern; webs burned; the sluice and its four hours; the slump fed; the Tally-Wall; the Cap, Breach, custodians, the muffled Quiet Gallery, the Dial; the rites; the Calx Gate (oil, wheel), the Way, the dug portal; Joss and Hester's "the road is open" topics; milestones.

## 2. Authored content present but not reachable (or not shown to be)
- `Objective ask_swallet` and `reach_bore` are authored; the journal shows them but no spec asserts they appear.
- The stope from the bat chimney to the old stores (`stope_known`, taught by Nib for twopence or by Dunstan) is reachable but unplayed in the spec.
- The unmuffled stalkers and an unplaced owlbear fight are reachable and unspecced (fights are chosen, not tested).
- `joss_report`/`hester_report` (the road's consequence for the Tallymen) are specced only by the playtester.
- Nothing teaches `ironglass_known` except Orpe; no item uses it (the black ore is described, never held).

## 3. Actions or consequences the engine cannot yet represent
- **Fights with a warned creature while bargaining:** any action with `Time` above 0 outruns a warning's patience; every bargain is `Time 0`.
- **A creature fleeing or hunting by its own errands** (the stalkers following breath; ghouls raiding rats): Kyr has pursuits for people (`Uses go`) but the creature relations are only authored state, and the ecology is rules.
- **Region weather in a province:** the Wend's spate is its own die at first light; the region's sky is not readable (circus friction 29 stands).
- **Carry limits, a mule, cold:** unused here; recorded for II.
- **Hunger beyond the meal rule; light that fails by itself except torches (an hour); a lantern lit by a flask in a pack elsewhere** — see 4.
- **Death:** the playtest's dead party was left with a blank choice list and no ending text.

## 4. Existing assets whose migration or integration is incomplete
- **Lanterns:** a bought lantern and flask of oil are never offered for lighting unless the same member holds both (`CampaignChoices`, the "Fill a lantern" action of `test/lantern.test.ts`); the playtester found them dead weight; the specs use torches. A torch burns an hour, and a lit torch burns above ground too.
- **Prices and coin** are not shown anywhere on the page (playtester).
- **Plant `uses`** (courage, protection, sleep, divination) are read by nothing; alhuren glows in the scene text and does nothing. Kingsfoil is the one plant whose `use` runs.
- **Treasure sale:** only the assayer's `Buys` list and any dealer's half-worth of `treasure` buy finds; the orrery (value 500) has no buyer in Swallet.
- **Portraits:** all creatures here were already painted; no new species were added.
- **Handbook/encyclopedia** entries for the creatures exist; none of the Tallow-specific local documents are indexed.

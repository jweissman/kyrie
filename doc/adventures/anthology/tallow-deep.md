# Tallow Deep — what was built, what was played, what the engine did not carry

*Adventure I of [the anthology](README.md). Module `data/adventures/tallow/` (province "Tallow Edge", west of the first country), spec `test/tallow.test.ts`, steps `test/fixtures/tallow/journey.json`, fight weights `scripts/tallow-fights.ts`. 7 November 2026; revised after the fourth (hostile) review the same day.*

## What it is

A limestone ridge that swallows a river, with three ages of works in it (the makers' plumb-line Bore; the Aenean conduit and the Calx Way; the Brasiers' Company's mine, sixty years gone) and a smugglers' band squatting in the top. About fifty rooms on five levels, four ways in (the Tallymen's adit, the Rising, the Swallow, the buried Calx Way) and a shortcut that persists. Ecology: bats, centipedes, rats, spiders, an owlbear, a slump, ghouls, hollow-stalkers and two clockwork custodians, each with a territory, a telegraph and a way that is not a fight.

**How the creatures relate:** the spiders eat the bats and the rats, so poisoning both rat colonies sends the spiders down to the Settling Cistern (`spiders_range`); the slump eats guano from the bat chimney, so a sack of it is a bargain; the ghouls eat the Company's dead, so laying them to rest (the burial words, or the fourteen names read from the Foreman's ledger) ends them; the stalkers hunt breath, so muffling with blankets is a timed passage (two hours, one blanket each time); the custodians keep a measure, so the beat on the Tally-Wall (or the chart's border) is a password.

**Four routes, one hill:** adit (six coin a day, a lie, a game of cards, or a fight); Rising (not in spate; the guano; the Settling Cistern; burn the webs; the sluice); Swallow (rope, an owlbear to be baited); Calx Way (found out by a letter or Barrick's word; oiled; dug). The sluice shuts the river for four hours and dries the causeway to the Cap; the water comes back whether the company is ready or not, and a company that has stood on the Cap can swim the causeway back at a price.

**What stops a company, and what does not:** nothing in the hill can be slipped past. The engine's own "slip past" (data/rules/passages.kyr:96-107) is free, unlimited and unrolled for any `Guards` Person with a blocking State; ten of ten seeds walked it past every guard in the first review. Tallow's guards are therefore not `Guards` at all: each guarded way is `opening when` the guard is dead, gone or placated (a way that is shut is *barred*, which the slip rule refuses), and the Tallymen's is a bar on the way in only (`Thing … on adit_drift from adit`), so that nobody inside is ever kept from leaving.

## What was played

`test/tallow.test.ts` plays ten specs from the true start of each, by labels, with no `put`, `give`, `assert` or forced die:
1. lint clean;
2. the first expedition: lore, shop, the adit (nothing slips past, paying opens the way, Attack is still offered), the stores, the counting-house, the Blind Shaft, the Foreman's office, the ledger read and read aloud to Barrick, home by the way it came, sold from, slept on, saved and reloaded;
3. the second expedition (the first in the same session, then in again by the Rising, with a mason promised something): the webs, the sluice, the slump fed, the Tally-Wall, the Cap's ring (a ration and an hour), the Gear-Hall past the custodians, the Quiet Gallery muffled, the Dial; the four grey things taken, one set back (spent, counted, the rest still owed); the dead laid by the ledger (and the told rite offered in place of the untold one); the Calx Way oiled, raised and dug; the tick at the pipe late; the mason home; the road told to the landlady and the Tallymen sold out (their adit, the Tally-Room and its people gone);
4. the toll lapsing while the company is inside, the way out never barred, and the toll paid again from the bend;
5. the cage (it goes down once, or does not hold, and the chain is spent) and Treve's one history, told by Nib, by Cador and in the spiders' vault text;
6. hunger (rations gone by watch 576; the company is hurt every half-day after);
7. the owlbear (the way to the Swallow shut and not slipped past; baited, open, and its text changed) and the spate (seed `a`: the ford shut, the gallery struck, the way out shut until it goes down);
8. the webs and the unfed slump (nothing slips past either), the river's return into the Hall (the telegraph twice, then the wave; the causeway shut again), the Cap's ring (three turns, the fourth refused), the Cap's own telegraph, the river returns on a company on the Cap, and the way out of the Bore by swimming the causeway;
9. the informer's letter at the weir with a hired Sib, and "Take it to the Board": gone at once (not offered, not heard close by, not at any place).

Fights are not in the specs (they are chosen, and their weights are measured, below). An independent playtest of this revision has not been done.

## The weight of the fights

A fresh company (Elen, Bran, Dori: 36 hit points together, level 1), full health, plain Attack, twelve seeds (`bun scripts/tallow-fights.ts 12 <rooms>`). The review found the guards at the middle of the scale beaten without a scratch (hollow-stalkers 8/8, ghouls 6/6, 0-5 and 0-3 lost) beside a top that wiped the party (custodians 6/6, owlbear 4/6). They were rescaled to a single order, vermin below menace below "do not fight":

| Fight | Before | Now | Won | HP lost over twelve | Wiped |
|---|---|---|---|---|---|
| centipedes (bat chimney) | L1 ×2 | L1 ×2 | 12/12 | 0-5 | 0 |
| rats of the stores | L1 ×4 | L2 ×5 | 12/12 | 0-6 | 0 |
| rats of the Settling Cistern | L1 ×3 | L2 ×5 | 12/12 | 0-7 | 0 |
| the Tallymen at the bend | L2 ×3 | L2 ×3 | 12/12 | 0-14 | 0 |
| the spiders | L2 ×2 | L3 ×2 | 10/12 | 0-8, or all | 2 |
| the slump | L3 ×1 | L3 ×1 | 10/12 | 0-14, or all | 2 |
| the ghouls | L2 ×3 | L3 ×4 | 7/12 | 3-39 | 5 |
| the owlbear | L2 ×1 | L2 ×1 | 7/12 | 0, or all | 5 |
| the hollow-stalkers | L4 + L3, two Persons | L8 ×3, one band | 4/12 | 3-39 | 8 |
| the custodians | L3 ×2 | L3 ×2 | 0/12 | 30-39 | 12 |

The custodians are the top of the scale, deliberately: a clockwork soldier is eight levels of lone warrior at its first (data/catalog/challenge.json), and nothing in Tallow can bring a first-level company within reach of two. Two Persons in one room fight one after the other, each with its own warning, so the two stalkers had been met singly; they are one band now. The measure of a hollow-stalker is flat (one at its first level and its fifth), so the level hardly moved it and the band did.

## Playtest findings acted on
- **Fixed (first review):** bell-teeth sat in the Gear-Hall, where a bare "Take" outran the custodians' patience and wiped the party. Moved to the Breach.
- **Fixed (this one):** the owlbear's and slump's "blocking" text no longer reads after they are placated (it was the Person's State; there is none now, and a placated one is described as placated); Orpe buys the orrery, at 250.

## 1. Content that works in play
Lore from three people; the Tallymen's toll (pay, lie, cards, fight; paid again after a day; the way out never barred); poisoned rats that die in the night; the specimen drawers and the brick door; the cage that goes down once, the rope and the sump; the Foreman's desk and letter; the rim's plants and the garden's by `grows/crop`; selling to the assayer; the Rising, the spate (a wave on the company in the gallery), the Settling Cistern; webs burned; the sluice and its four hours, told before they end in every place the water reaches; the slump fed; the Tally-Wall; the Cap and its ring; the way out of the Bore; the Breach, custodians, the muffled Quiet Gallery, the Dial and its shelf; the rites; the Calx Gate (oil, wheel), the Way, the dug portal; Cador's and Lowen's "the road is open" topics; milestones; hunger.

## 2. Authored content present but not reachable (or not shown to be)
- `Objective ask_swallet` and `reach_bore` are authored; the journal shows them but no spec asserts they appear.
- The stope from the bat chimney to the old stores (`stope_known`, taught by Nib for twopence or by Barrick) is reachable but unplayed in the specs.
- The unmuffled stalkers and an unplaced owlbear fight are reachable and unspecced (fights are chosen, not tested); `scripts/tallow-fights.ts` measures them.
- `joss_report`/`hester_report` (the road's consequence for the Tallymen): `hester_report` is specced (the Tallymen sold out); `joss_report` (the sixty coin) is not.
- The cat's collar for Nib, the cook's book for Lowen (two rations on the road), and Usk's cut sample are authored and unspecced; Usk's refusal to cut and his going home are specced.

## 3. Actions or consequences the engine cannot yet represent
- **Fights with a warned creature while bargaining:** any action with `Time` above 0 outruns a warning's patience; every bargain is `Time 0`.
- **A creature fleeing or hunting by its own errands** (the stalkers following breath; ghouls raiding rats): Kyr has pursuits for people (`Uses go`) but the creature relations are only authored state, and the ecology is rules.
- **Region weather in a province:** the Wend's spate is its own die at first light; the region's sky is not readable (circus friction 29 stands).
- **Carry limits, a mule, cold:** unused here; recorded for II.
- **Hunger beyond the meal rule:** the shared rules set `hungry` and nothing else reads it; Tallow's own rule hurts the company every half-day while it is hungry. See friction.md, 25.
- **A free stealth slip with a price:** the engine's `slip_past` has none; Tallow has no stealth way past a guard at all. See friction.md, 19.
- **Death:** a company that falls in a fight gets "The fight is lost" and an empty choice list; the run is over (no ending page is authored for it).

## 4. Existing assets whose migration or integration is incomplete
- **Lanterns:** a bought lantern and flask of oil are never offered for lighting unless the same member holds both (`CampaignChoices`, the "Fill a lantern" action of `test/lantern.test.ts`); the specs use torches. A torch burns about an hour, and a lit torch burns above ground too.
- **Prices and coin** are not shown anywhere on the page (playtester).
- **Plant `uses`** (courage, protection, sleep, divination) are read by nothing; alhuren glows in the scene text and does nothing. Kingsfoil is the one plant whose `use` runs.
- **Treasure sale:** only the assayer's `Buys` list and any dealer's half-worth of `treasure` buy finds; Orpe buys the orrery (250), chart (150), compass (90), crystal (30), bell-teeth (30).
- **Portraits:** all creatures here were already painted; no new species were added.
- **Handbook/encyclopedia** entries for the creatures exist; none of the Tallow-specific local documents are indexed.

## Second pass: the adversarial review, and what it changed
A reviewer who had not written it read the module and found, among others: a softlock (the sluice reopened silently after four hours with the party on the Cap); a stale latch (`shutWas`) that hit parties with a flood long past; a ledger whose order, count and chronology contradicted themselves; a dominated bribe; a theme (*keeping*) stated in a comment and enacted nowhere at the climax; a toll paid once for ever; a village that was information dispensers.
- **Softlock:** the Cap, Breach and Gear-Hall now say, from the twelfth watch, that the river is coming back (`cap_damp`, `bore_damp`); the Cap's ring can be turned to hold it four hours more (`wind_cap_ring`).
- **`shutWas`** clears when the sluice opens away from the Hall.
- **Chronology:** the Breakthrough is the winter of 'fifty-two (sixty years gone); the ledger holds fifteen names, one struck through (Barrick, who lived); Carr stacked the dead himself and Barrick held the lamp.
- **Theme enacted at the climax:** the shelf of grey metal is a trust (see the fourth pass for how it is kept now).
- **Living sources of the beat:** Barrick counted it ("six breaths") before the Company broke into the Cap, so `period_known` has three sources, not one clue.
- **The betrayal has a cost:** after Cador's father, Lowen will not sell him out (`hester_report_kind`); she has a brother in the ledger, Usk a dwarf's memory of the stone, Orpe a debt to the letter she burned and a price (thirty a tooth) for the grey metal.
- **Declined:** closing the Long Stair to the Calx Way party. A shortcut that skips levels was asked for; the cost is the ghouls, the oil, the shovel and not having the Tally-Wall's hall, and the beat is had from Barrick.

## Third pass: companions, asides, and the second review
Added `quests.kyr`: **Sib Wray** (a Tallywoman; three answers to a question about locks set her price and her nature; a drowned Customs man's letter reveals she is the Board's informer, and the player chooses burn / give to Cador / let her carry it to Porthwen); **Usk** (a dwarf mason who asks whether the player will leave the Cap alone, then is tested at the Gear-Hall, and goes home to cut the fourteen names on a stone); three asides (Nib's cat and the collar, with *was it quick?* answered truth or lie; the cook Elspeth Noakes, her stone, her bothy and her margin-notes; Orpe's naming of the ore by a lore check); and Lowen's *why do you go up?* with three answers that each open a different door (Cador, Barrick, Orpe).

## Fourth pass: the hostile review of 7 November, and what is and is not done
Eighteen findings; each by number.
1. **Free slip past every guard.** Done within Tallow: guards are `opening when` clauses on their ways (barred, so the slip rule refuses them), the Tallymen's a one-way bar. Tallow has no stealth way past anything. The engine change (a rolled, timed slip that can set the guard on the company) is proposed in friction.md, 19, and not made.
2. **Scale.** Done; the table above. Ghouls, stalkers and the middle of the scale have menace; the custodians remain unbeatable by design.
3. **Sealed in the Bore.** The Cap's ring now costs an hour and a ration and seizes after three turns; the river is told in the Hall, the Cap, the Breach, the Gear-Hall, the Quiet Gallery and the Dial, and in the sluice-house's own wheel ("you judge you have four hours"); and a company that has stood on the Cap can swim the causeway back when the river runs (`risk the causeway`, 2d6 against strength 12, whoever goes first). The first crossing still needs the sluice.
4. **`restore_shelf`.** Four actions, one for each grey thing, each spends its item and is counted; what is off the shelf (carried, sold or dropped) is owed: each missing piece is a further chance in ten of the Wend rising at first light, and the tick at the pipe and the trough tell it. Selling to Orpe is no longer free. The four consequences are the same effect (the river) with the text of the pipe; they are not four different costs.
5. **The journal's lie.** `vault_laid` now says what Barrick says; its reader is the rite: told how the Foreman laid them, the company says the words with an easier die.
6. **Sib after she has gone.** `Seen when not sibGone(party)` on Sib hides her at once from the choices, the talk and the dark; a rule removes her `at` on the next tick. `sold_out` sends her out of the Tally-Room (unless she travels with the company). The "stove" lines are gone.
7. **Treve.** One history: the boy's cat Biscuit went up the Aenean service walk on a Tuesday three weeks ago, and Treve went after her with a lamp; the spiders had both. Nib, Cador, the spiders' vault and the collar agree; the Gear-Hall's tin lamp and cut rope, and the stalkers' boot, are now the Company's, sixty years old.
8. **The cage.** It is a way to the sump (`risk the Blind Shaft's cage`), 2d6 against dexterity 13, once; the chain is spent either way. The label says where it goes and that it is a risk.
9. **The Hall's telegraph.** Done (two sounds, two hours and three after the gate was shut; the wave is 2d6 against strength 13, not 4d6).
10. **Hunger.** Done: a company that has missed a meal is hurt every half-day (1d4 against constitution 12).
11. **A lapsed toll.** Done: `pay_toll_again`; the way out of the bend is never barred.
12. **Write-only flags.** Cut: `custodians_known`, `stalkers_known`, `owlbaited`, `spate_known`, `ironglass_known`, `oskRegard`, `hesterCook`. Made to matter: `ledger_read` (the topics and the read-aloud need it), `sib_informer_known` (Sib's question needs it), `cookKnown` (two rations from Lowen), `shelfRestored` (the shelf), `vault_laid` (the rite).
13. **Stale blocking text.** Done by removal.
14. **Anachronism.** A train is a mill-race, a ticket a writ of passage, the Company's shot a crack in the wall.
15. **Tics.** The listed ones recut (the sizes, the lookings, the stillnesses, the two "as a man", the aphorism); Usk's and Orpe's lines were given different shapes (Usk shorter and about the work in hand). Not every "looks at" in the module is gone, and a grep will find more.
16. **First names.** Lowen (was Hester), Barrick (Dunstan), Cador (Joss), Treve (Hobb), Enys (Meg), Abner (Amos), Porthwen (Carrow). Biscuit, Nib, Sib, Usk, Orpe, Elspeth and Carr were free corpus-wide. The surname test is green. The entity ids (`hester`, `dunstan`, `joss`) keep their old spelling.
17. **Docs.** README's Tallow section, this page, and friction.md corrected.
18. **Specs.** Played, from the true start, for the toll lapse, the cage and Treve, hunger, the spate, the Hall's wave, the Cap's ring and the way out, `restore`, `sold_out`, Sib's letter and the ledger. Nothing is `put`, `given` or `assert`ed, and `roll('pass')` is gone (the old second spec forced every check to pass; the ledger now lays the dead without a die).

**Not done:** an independent playtest of this revision; fights are measured, not specced; `joss_report`, the cat's collar and Usk's sample remain unspecced; the shelf's four consequences are one effect; Tallow has no stealth way at all (the stealthy have lost an option, not been given a priced one); the engine's own generic "ask to let you by" and "warn off" (one try each, checked) remain at every guard that warns.

# Quittance: ledger for the broad pass

Register: juridical, with a fire in it. Revised against `doc/imbar/14-bible.md`. Data only; no `src/`, no shared files.
Files written: `data/adventures/quittance/voices.kyr`, `depth.kyr` (added to `module.json` and `placed.json`; both also
name `slack_opened` in `canon`, which is how a module is allowed to read a world event), `test/quittance-voices.test.ts`.

## The Account

| | |
|---|---|
| **Count** | The Founders' Policy: five clauses, a hearth for every hearth let out (clause 4), a Receipt "so long as the account is square". The city believes it is counting premiums. |
| **Keeper** | The Fire under the Exchange, who counts in *company*. The Offices carry the Policy and have never read it. |
| **First page** | Clause 3 and the Return ("let it be home, as it was lent"), and the notice that the Smokeless Ordinance's clause 44 (ancient hearths, by application) is the city's own forgotten door to the same thing. |
| **Price of reading** | Whoever reads it aloud owes it: terms with the Fire bind the whole city (a Night every year), or a Hearthkeeper who does not come up again. |

## Acts and scenes (already in the book; named here so the map is explicit)

1. **Assessment** (days 1-3): Declaration Arch (Mr Prest), Bell & Slip (Sprack), Phoenix House (Ottoline, Prewitt), Candlewick Court (Nell Wickersham). *New:* the Court's laid oil, the brigade yard's coiled hose.
2. **Adjustment** (days 4-6): the small adventures (Tolliver's, the Lamprey, Penny Mutual, Pip, the Queue, the Annuitants, the Lamp-house, the Teagues, the Guild); Gasket Yard (Dolly Orrimer). *New:* the quarrel at the Yard; the Hen's Mutual.
3. **Settlement** (days 7-8): Hearn House, the Strongroom, the Glass City, the Hearth Below. *New:* the cleric at the hearth; the Fire's replies.
4. **Reckoning** (day 9): Cinder Ward, the Hall of the Five, the Cinderwall at midnight. *New:* the draw of the black chimney; the warm cushion in the Hall; the Tithe line; the licked saucers.

## Before to after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | Four `Chapter`s, a face and a place for each scene | Unchanged; scene map above names the new beats |
| 2 Characterization shown in play | Dossiers and greetings | **Skelter** (wants paid and left alone; fears being read aloud; "I only collect"): ask why his one against-the-Ordinance candle burns and, after a fire that took nineteen, he pushes the book through the hatch unforced. **Ottoline** (wants to be useful; fears being the Phoenix's entire response; "the Tables are right"): pencilled-over gilt bird, she takes it off. **The Fire** (wants company; fears being forgotten; "I do not complain, I count"): admits the complaint, then answers salt, strokes, tally, a far door. |
| 3 Companion arc | No calling-keyed voice | Six voices (ranger x2: Candlewick, Cinder Ward; warrior x2: brigade yard, Hall of the Five; cleric x2: the Queue, Hearn's hearth). **Unique solutions:** ranger digs up the shut cock of Gasket's "dry" well (the Ordinance defines a hazard by want of water); cleric says the Office for a house where a fire has gone out over the Fire's hearth (+3 accord, no names, no ledger); warrior counts the Tithe men out of their cans (a check, once). **Consequential choice:** the quarrel at Gasket Yard. Warrior's way (go to the Night Market, take the oil) leaves the Yard standing and costs the company the Wards' regard; cleric's way (wake the Yard, carry its own beds) lets it burn *empty* and wins regard. Regard feeds `evacuate_ward` on Reckoning night. One answer closes the other. |
| 4 Danger with two exits | Gasket burners: fight or warn. Tithe men: four noncombat exits. The Fire: parley, sit, Return, apology, names, terms, bribe/threaten as traps, and a Burning if slighted | Gasket now has **warn**, **cistern (ranger)**, **warrior's oil** and **fight**. The Fire needed nothing: it has, noncombat, at least six ways to the same safe door (see `descent.kyr`); the Office is a seventh. |
| 5 Depth | Rich already (rhyme, pageant, statue, board of marks) | Brokers' Stair (94 steps, one whitewashed a year; the broker's "nobody has asked why" is cut); the Phoenix plate-painter (31st of his family, "you can tell a Pargeter bird by the left wing"); the saucers of salt now have a child's explanation on the Row; burnt-orange peel as a legal vegetable on the Cinderwall; the Measures' assay stamp on the Honest Bell ("heavier than its bronze by about one clerk"); the end window at the Arch, bricked, with the card kept dry. |
| 6 Links | None named | **Out:** `watch_tally` shown to the Fire (it distinguishes *kept* from *owed*, the Prefect's word against the Offices'); `befell(slack_opened)` read twice (the Honest Bell rings once with nobody in the hall; the Fire felt the draught); the Collegium of Measures *weighs* (assay stamp); Hesk notch-script on the cellar lintel; a distant rhyme with Low Water in one phrase of the Fire ("an Auditor, once, who counted the tide ... he thinks it is a mercy"), the audit's ruling not to tie the Fires kept. **In:** a card at the Arch: persons arriving with a keeper's tally, a Prefect's writ or an unhired lamp declare at the end window; the Bell "will hear them twice". A visitor with a Watch's tally is what the Fire has waited for. |
| 7 Contrast | Wry already | The Ambrose claim at the Wayward Hen: a pigeon on a beer-mat policy, a "common cat" in the Phoenix's collar, a bar that sings the verdict. Pays 2 coin and a twist of guest-salt (`Give`). |
| 8 Foreshadow/payoff | The Receipt fades | **Everyone:** the saucers of salt on every Row sill (day 1) are the Fire's *guest-portion*; with terms made, the saucers are licked clean on the morning after; laid salt from the Hen is a gift to the Fire. **For those who look:** eleven strokes and a blank on the cellar lintel (Hesk); the Fire says the twelfth place was left for whoever kept it; a Hearthkeeper who stays makes "one stroke more than there was". This is Quittance's one instance of the motif: the tally-stick action's "eleven notches and a space" label, the keeper-stroke Observe and the sound of the Receipt's fading are cut in the second pass. The coal is its one kept light. |
| 9 Playability | n/a | `test/quittance-voices.test.ts` (9 tests). Second pass, honestly: **played** are Mr Skelter's thirty coin (`d_gasket_next` now comes from *Offer Mr Skelter thirty coin*, not from `Ds.put knows`), the Tithe men (the clock's own rules put the burners in the Ward: `=day 9 22:50`), Candlewick's burning (`=day 5 16:00`, not an asserted `burned`), and the Hearthkeeper term (*Let old Auberon Hearn stay* is played; `ds_accord` = 5 and `following(auberon)` are **asserted** at the Fire, as are all the company's placements in the test, which are `Ds.at` puts, not walks). Still **asserted**: the Watch's tally (`j.give`, an item from another province) and `befell(slack_opened)`. The salt is `Give` from the Hen. |

## Links, in and out (summary)

Out: `watch_tally`, `befell(slack_opened)`, Measures' stamp, Hesk script, the Prefect's *kept/owed* word, Low Water's Auditor
(one phrase, deliberately not a tie). In: the card at the Arch.

## Tests

`test/quittance-voices.test.ts` (new, 9): voices fire once and not without the calling; ranger's well with and without a
ranger (and the Yard does not burn); the quarrel in both directions (regard moves, one closes the other, Yard stands or
burns empty); cleric's Office (+3, once, absent without a cleric); warrior's line (offered to a warrior, once, not to
others); saucers and strokes (answered only if looked at; keeper's stroke); the Hen's pigeon through the salt laid at the
Fire; Skelter's candle; the tally and the far door. The Skelter bribe, the Tithe clock, the burning of Candlewick and the Hearthkeeper term are played (see row 9). Quittance's existing tests and `all-in-one-world` run; see the report.

## Honest shortfalls

- The Fire's own scene needed no new second exit; I counted rather than added. Candlewick Court still has only warn/fight
  (the warrior's oil way could be mirrored there).
- `qv_t_slack` ("a door has been opened") is unreachable in a Quittance-only world and lint says so; it is tested by
  asserting `befell(slack_opened)` and fires only in the all-in-one world.
- The consequence of the quarrel flows only through `regard(wardsfolk)`; I did not write a new ending line for it.
- Only one inward hook is in-game text; there is no mechanism to reward arriving *with* a Prefect's writ.
- No new ending prose for the saucers beyond the licked-clean Observe.

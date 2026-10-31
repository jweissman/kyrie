# 10 — Playtest evidence

Four kinds of claim are kept apart here: **implemented** (written in Kyr and offered in play), **tested** (a kept
journey plays it by the labels a player sees and asserts the state), **encountered** (seen in an ordinary run, as a
player would meet it, read on the page), and **evaluated** (judged as an experience). Passing tests prove only that the
paths exist.

## The suites

| File | What | Result |
|---|---|---|
| `test/hollins.test.ts` | Lint (no errors, no warnings) and twenty journeys: nine endings or their preconditions, five builds, every minor story but the sill | all pass |
| `test/hollins-placed.test.ts` | Placement across nine seeds (moves no other country); a wanderer in the world of seed `kite` walks east, north, east, hears of Hollins from the innkeeper in `x2ym1`, crosses the north march, comes down the moor road, reads the notice, goes in by the Slot | pass |
| `test/hollins-browser.test.ts` (`KYRIE_BROWSER=1`) | The built site in Chromium: the title page's campaign, moor road, Bootscrape, the Slot, the Letterdrift, the Skirting, the Hearth, the chart table with the Lady at it, and no "Talk to the Lady" before she knows | pass; screenshots in `playtest/` |

Run with `bun test test/hollins.test.ts test/hollins-placed.test.ts` (about four minutes).

## Ordinary entry from the shared world (tested)

In the world of seed `kite` the first country is drawn from the seed; Hollins lies two countries east and one north of
it, north of a mountain country. A human warrior with the wanderer origin, knowing nothing of the adventure, walks to
the east edge, crosses, walks north, crosses, walks east; in `x2ym1` the innkeeper, asked about the north road, tells of
"a village called Bootscrape, built on a doorstep", the giantess come home, and "two crowns a day"; a notice is nailed
up in that country's towns. Crossing the north march installs the country as a chapter (not a book) and the wanderer
comes down the moor road: "for a moment you take it for a hill". `test/hollins-placed.test.ts`.

## The journeys (tested), each as a player would take it

| Journey | Build | Shape |
|---|---|---|
| `alone` (inline) | warrior | Takes a bed at the Mat on day one and waits a week. Hears the fire, the scream before light, the Lady's death on the sixth night. **The Tea at Ten Past Four.** |
| `freehold` | warrior | Hired; asks Pyecroft about the fire; Saltash; warns Bet; the Readers' diary; Sorrel; paces the Wainscot; ink; the chart at night; the trap sprung at eight on day two (Pyecroft has seen it set); the Lady finds the chart at nine, writes WHO ARE YOU? at eleven; answered that night; at nine on day three she knows; the Moot; the vault by Annet's raft; the deed to Saltash; the mother's letter; the will; the sulphur forbidden; Sorrel stays; the tenth night on the counterpane. **The Freehold.** |
| `smoking` | warrior | Saves the colliers and Wat (so the Jarl never plots), does nothing about the sulphur, sleeps at the Nail on the eighth night and is choked by it. **The Smoking.** |
| `ladder` | warrior | As above, but asks Jory whether Bootscrape would take them in, and tells the Moot. **Down the Ladder.** |
| `ratcatcher` | warrior | Tells Pyecroft where they nest. The Smoking comes the night she has sulphur. **The Ratcatcher.** |
| `cold` | warrior | Buys all of Arkle's sulphur on day one; Pyecroft sends to Wendle; takes the Wendle candles from the hatbox on day eight. **The House Goes Cold.** |
| `sold` | warrior | Arkle's sulphur; the vault by Annet's raft; sells the deed to Overy at the Mat. **Sold for Stone.** |
| `concert` | bard | Never hired. The Keys' page out of the Post; Bet urged; Bet's colliers on the bass; the First Air on the second night; the Lady at the piano; steps out at her chart on day four. |
| `honor` | thief | The letter on her chart; the diary; the bell (fails on day two, batted off the bed; succeeds on day three); Dame Honor at tea; the Small House lit. |
| `mage` | mage | Paces the Wainscot, writes chart and answer alone in a borrowed hand; fails the first night, succeeds the second. |
| `rats` | warrior | The back pantry ratted: an ambush, a real fight, real tails; Hasp's pay; the dumbwaiter. |
| (inline) | warrior | On the Hall floor at nine at night: the cat's two lamps, "a moment, no more"; into the Skirting; alive. |
| `regiment` | warrior | Fennick's countersign; tells the Captain whose traps; the Regiment marches on the hatbox; Fennick, unwound, stops. |
| `pyeturn` | warrior | Reads the ledger; puts it to her; asks what she wants; a promise; no Smoking. |
| `verity` | warrior | The diary's last page read to Sister Verity in the works. |
| `stone` | warrior | The letter, the reply, the Waiting Stone; the flint on a dried flower. |
| `ranger` | ranger | Coal-hole; Annet; Faith; the pin for a lever; catmint thrown in front of the cat. |
| `poison` | warrior | Wat dies; Mab tells of the Jarl's sack and the sixth day; Pyecroft is told, and burns the sugar. |
| `kit` | warrior | Nan's letters; Bet told of the bedroom fires (a failed easy roll: eleven die); Nan up the Stair; Kit at the Moot; the sovereign stolen and sold; the Lady counts her purse. |

Transcripts of six, as the page told them: `playtest/*-transcript.txt`.

## Encountered: a cold run, and what it changed

A dwarf cleric with charisma −2, unhired, played step by step with the offered choices printed after each
(`playtest/cold-cleric-transcript.txt`, kept as a fixture). What the page did to a player:

- The notice on the inn door was the first thing the browser glance showed only after it was moved into the first
  sentence (it had been the fourth). Fixed.
- Faith Penny asks "name, place of origin, purpose of visit", and nothing let the player answer. Added: giving her your
  name enters you in the register, and the register is what the Tapwarden draws water by.
- Nan Collier had nothing to say before the fire; a player meeting her first found a girl hiding a letter and no way to
  ask about it. Added: "Ask Nan Collier what she is writing", which opens the romance on the first day.
- Urging Bet on nothing but nerves is "unlikely" for a charmless cleric; a player who had asked Jory why Bootscrape is
  not glad now has a second, easy argument: the Lady has had a fire every night in her own room.
- Several replies narrated both branches ("If you warned them she says…, and if you did not…"). Each is now two
  topics, one for each history.
- Walking into the burning Hearth hurts, and says so.

## Encountered in the browser

Screenshots (`playtest/browser-*.png`, 1440×900): the moor road; Bootscrape with the notice; the Letterdrift; the
Skirting; the Hearth with its new aim; the chart table with the Lady's portrait, her glass, YOU KNOW NOW and YOUR AIM.
The glance's single-sentence rule and the "Talk to X" opener are the two things the browser did that the CLI did not
(friction F3, F4); both are worked round.

## Not done, and said plainly

- No human player other than the author has played it. The cold run is the author playing by the page, which is not
  the same as not knowing.
- No journey yet plays a company of three; every journey is a single protagonist (with Sorrel or Fennick when they
  join).
- No journey plays the Smoking prevented by pinching out the candles on the night, the eel fought, the Pantry stormed,
  the argument with Faith over postage, the sill worked for pay, or the return to Hollins in a world after an ending.
  They are implemented and were exercised in development runs only, or not at all (the return visit).
- The browser journey stops at the chart table on the first morning.
- The ending pages in the browser were not looked at.

## Evaluated

What the author can honestly say of the experience is in `11-second-pass.md`.

# The Dorothea archipelago

*`data/adventures/the-dorothea/` (module only; no new province, no `src/` change). Tests: `test/the-dorothea.test.ts`,
`test/skerrow-night.test.ts`, `test/dorothea-sea.test.ts` (unchanged and green), and new `test/dorothea-routes.test.ts`,
`-ness`, `-antlers`, `-house`, `-entries`, `-oil`, `-voices`. Frictions: `the-dorothea-archipelago-friction.md`.*

## Ledger (bible 14.1)

- **Count:** the lights of the Reach, and the wrecks under them.
- **Keeper:** the House of Marchbank, a counting-house in Orsett (mark: a key and a ring; the Principal's seal).
- **First page (missing):** that a lease on a light is not a lease on a *lamp*: the House leases the kept lights, does
  not trim them, and under each dark light holds the wreck-rights (W.R.) by default of a light.
- **Price of reading:** three ledgers read means the company is now a party to what the House is, and the House answers
  (bailiffs on the Dorothea, a closed door at Port Ness, a bond owed).

## Map

Tolleth (mainland quay, Garrick's, the Anchor, the harbourmaster) is the only place with a way on foot to the rest of the
country. Everything else is reached by the Dorothea, which now makes **one call per voyage** and comes home.

| Call | Fare | Distance | Terrain | Kept light | The House's hand |
|---|---|---|---|---|---|
| Skerrow | 6 | 140 watches (a night and a morning, the Combs) | temperate green island, Aenean tower | the Pharos (lit; pending for the House) | the Agent Quillon (green book), a third of every landing |
| Port Ness | 4 | 68 watches (a long afternoon) | salt flat: pans, boiling-houses, lighters | the Ness Light (dim; House's oil bond, Kit Skail) | the Factor Stannard (red), the Clerk Pym (blue), scrip |
| the Holm (on foot from Port Ness) | -- | tide: the Wrack Road is dry 30 watches in 72 | black islet, lamp-stump, fish-and-flame device | the Holm stump (dark; rent *for no light* to Marit Oake) | the rent, and the wreck-rights on the Holm bar |
| the Antlers | 8 (+ a pilot) | 104 watches (a night, a race between stacks) | sea-stacks, guano, seabirds, rope-ladder | the cresset (dark; lease clause 7) | the Agent Deane (green), the Prentice Wick Bligh (grey) |
| Ashkeld | 12 | 396 watches (three days south-west) | volcanic: black beach, hot springs, ash, vents, a smoking cone | the cone itself (unleasable) | none: the House has not called in two seasons |

The sea table (squall, lantern raft, fever, calm, fleet) now applies on every open-sea leg, out and home, two draws a
leg (`seaWindow`).

## Route choice and second voyage

At the quay Bascom is asked where else she calls (`bound(hull)` 1-4). The course action sets `bound`, how long the sea
table runs (`seaEnd`), how long she lies at the island (`stayFor`) and the stations home (`homeOpenAt`, `homeSoundAt`,
`homeQuayAt`); the fare is paid by the call. A day after she is home, with the company ashore, she is re-laden, the
pump dry, the count at nothing, `booked` cleared, and the sailing fixed for the next noon (`hull_turns_round`). A company
left abroad meets her coming back to where it is (the Antlers, Ashkeld); at Port Ness a salt lighter takes it home for four.

## The House: ranks and what a player can learn

Prentice (grey boards; keeps an island's day-book), Clerk (blue cuff; copies it to the ledger), Agent (green; keeps a
post), Factor (red; keeps a coast), Principal (black; the seal). Taught by Bascom ("by the colour of their books"),
Pym, Wick Bligh and Quillon. Five ledger leaves, each read where it lies and by a different small hazard:

| Leaf | Where | How |
|---|---|---|
| Tolleth | Dacey Hoe's second column (W.R.) | ask her about it (only if the company went looking) |
| Dorothea | Bascom's cabin shelf | stealth check, or Bascom shows it after the company has helped her |
| Port Ness | Pym's blue day-book | three coin, or a plain word (persuasion) |
| Antlers | Wick Bligh's grey day-book | ask her; she has been waiting years to be asked |
| Skerrow | Quillon's green ledger | insight over his shoulder, or put two leaves to him |

Three of any five and the company can **reckon** them (`knows house_plan`, and a copy of the leaves it carries). Answers:

- **Expose:** lay the copy before Dacey Hoe. She chalks it on the board; the House holds the Dorothea two days on a
  bailiff's order (`holdUntil`). The Antlers' clause 7 is public and void.
- **Pay off:** Skail's bond at Pym's desk (18); the Antlers' arrears (15); Marit's rent forward (6); the House's own
  protection bond (30) against the raid.
- **Sabotage:** lift the bond from the strongbox (thief, lockwork; failure shuts the counting-house on the company);
  pull the board off the cresset-post (the company is `marked`; Port Ness's door shuts).
- **Outbid with the Pharos oil:** Marren Kestle, told what the other lights are, gives three kegs; one lights the Ness
  Light, one the Holm stump.
- **Press the Factor:** a Factor with three of her own ledgers recited at her tears the Ness bond herself.
- **Leave it, or take the silver:** Marchbank offers forty crowns for the copy; taken, the harbourmaster can no longer be shown it.

Each of the four lights has at least two non-combat ways; freed lights count in `freed(party)`.

## Entry points

| Entry | Where it starts | Hands the company to | Consequence there |
|---|---|---|---|
| A clerk with a crate | Latch, the Anchor | Ashkeld (three days; fare advanced twelve) | the crate by coin, argument, or the mule-bell fetched at the breath-in; delivered, Ashkeld's door is chalked SETTLED |
| A mariner's wife | Dilys Ketteridge, the quay | the Antlers | Joss mends the ladder and defies the Agent; her answer pays eight coin home |
| A black lugger | Latch / the pilots | Port Ness | bond (30 owed, a guard-boat), warn the reeve, parley (persuasion), fight (deadly to novices), or three lighters burn |
| A bottle | Dacey Hoe's desk | the Holm | Marit consents to the lamp at once |
| A runaway prentice | Pip Vosper, Garrick's | the Antlers | taken home, Hob gives the headman's leave for the cresset; or sold back for five |

## Companion arc

Calling-keyed voices (thief at the strongbox: two levers; ranger at the nests: the lee side; ranger at the strand: the
tide; warrior at the ladder; ranger at the rim). Ways only a calling has: **lockwork** takes the Ness bond; **woodcraft**
counts the nests and gets the Agent to sign; **mage** Quint reads the Holm device. Choices with a cost: pull the board or
buy the leave; sell Pip back or take him home; take the silver or the board.

## Foreshadowing and links

The key-and-ring on the board, the sacks, the cask-heads; the board's LOST THIS YEAR column naming the Mary Ann, the
Rosa Lind, the Tern, each at a place a player later stands; the loose pin on the sill; the raft lantern and its board
(FOR THE ONES COMING HOME) answered by the Holm device. Outward: the Founders' Exchange by wording (Quillon's buyer, the
Pharos bronze) and shared catalog kinds (`rope`, `lantern`, `lamp_oil`). Inward: Skerrow's `routed(ring)` unchanged.

## Honest shortfalls

- No jungle island; no volcano terrain kind exists (all `wilderness`). See the friction file.
- The fight with the lugger is deadly to novices and is not tested to a win.
- The Rune/Jago/Combs subplots and the fog fire only on the first voyage or the first Skerrow call; later voyages have the table.
- The Principal's scene is short; Orsett is a name on a board, not a place.
- Stranded at Ashkeld waits for the Dorothea's next turn; the strand rule for it is not written.
- The raft lantern's use at the Holm is tested with a fixture standing for the random draw.

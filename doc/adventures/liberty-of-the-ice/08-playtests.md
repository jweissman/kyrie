# The evidence: journeys, wanders, the world beyond the march, and keeping

Everything here is played by the labels a player sees (`Journey`, `src/session/journey.ts`), from the steps in
`test/fixtures/pellam`, through `test/support/pellam.ts`, whose `go:room` walks the shortest way by ways the company
can see and use, one exit at a time, each by the command the page offers. Transcripts of thirteen journeys, written by
`bun scripts/liberty-of-the-ice-transcripts.ts`, are in [playtest/](playtest/).

## The tests

| File | What it plays | Tests |
|---|---|---|
| `test/liberty-of-the-ice.test.ts` | lint (alone, and as a chapter); nothing done; the two principal approaches (Front Door, Ring); the Score, the Unswearing, the Pillory, the Flock That Was, Hired, Five Coin a Head | 10 |
| `test/liberty-of-the-ice-small.test.ts` | the bear by honey and by tune (and not offered the tune to a labourer); Gant to the Clink by night; the alderman's first wedding; Mr. Icicle married to the printer; the Frost Company exposed and turned to cream; the Liars' Bench twice; the watermen's sledges and the bondhouse emptied by the front door; Callow slipping his hand; Ursel's arc to the handfast landed; the careless word to Abel and the raid; the Gazette column; the lie to Kemble; the bear at the wedding; Harker's beck test and his portrait. *The second pass*: the second night on foot past the wolves with a fleece-brand (after Kemble's gin and the watermen told); the wolves fed the ox's offal; the Statute of Servants laid; Ursel's night confidences; a Ring hand fetched; paid men (Kemble's key, the searchers, Fowke); Ursel's question to Harker at the Landing | 22 |
| `test/liberty-of-the-ice-builds.test.ts` | a priest's register; a ranger's tracks and bear; a farmhand with no charm and the Silver Tongue; a scholar's counterpart at the Landing | 4 |
| `test/liberty-of-the-ice-placed.test.ts` | Pellam's place in the world plan; an ordinary journey from a generated cold country over the west march into Pellam; kept and opened again on the second morning; the same steps twice | 4 |
| `test/liberty-of-the-ice-wander.test.ts` | random offered-action walks, four walkers (bard; thief; labourer; ranger in a world that goes on) × seeds, with invariants checked after every step | 8 by default; 12 with `WANDER_STEPS=500 WANDER_SEEDS=r3,r4,r5` |

All pass (48, with the two `adventure-names` checks 50). Played wider: 12 walks of 500 steps each, no failure (23,235
invariant checks at the first pass; run again after the second).

## Exploration and invalid states

The wander's invariants, after every one of thousands of offered commands: the company stands in a place; the page
never shows an id, an unfilled `{slot}`, `undefined` or `NaN`; the purse is never below nothing; the hired are never
both fled and landed; a dead preacher is nowhere; Ursel is never both travelling with you and gone; after the thaw
nobody stands on the ice; at most one ending; and at the end, the ice gone out and one ending told.

What exploratory play found, before the tests were written (each fixed; see [10-changes.md](10-changes.md)):

- An anchored event lifted Ursel's purse from a company still on the North Road.
- The ice was a wilderness, so the company was offered "Make camp for the night" in the middle of Freezeland Street.
- The stocks and the watermen's planks offered "Look closely", "Push and pull", "Listen at it", which found nothing.
- Roles read "Magister Edrin Callow, a Magister Edrin Callow, charged with unswearing".
- The coin handshake was never offered: Harker had no coin to pay the half with.
- The tour of the stock locked the Squire in the bondhouse at ten at night (two rules in the wrong order).
- Belief set to nothing at the moment of the lie was let go on the same pass.
- The second night's rules were written for the third.
- In a placed world, Pellam's first day began on the evening of arrival, and its afternoon fired at once.
- A company that had left by the North Road heard every piece of the city's news as it happened.
- Ursel's question at the Ice Chapel was asked while the company was out at the hulk.
- The router sent a thief down a climb only a climber could take.
- Two kinds and one place name were another adventure's (`adventure-names.test.ts`).

What the second pass found by playing its own additions:

- The Ring journey, which stays on the sledge road after sending the hired south on the first night, was found there
  by the wolves at ten on the second night and could not wait (friction 22): the journey now walks back to Hay Stairs.
- A brand lit at the bondhouse brazier burned out (an hour and a half) before the hired, hushed under the wharf and
  walked down the Reach, reached the wolves; brands now burn two hours.
- "Ask Tansy Hobb about home" needed her first topic; now it needs only that she is in the bondhouse.
- The router walked through the barred river door to reach Hay Wharf from the ice (friction 27).
- The verger's name was Wrayford's (friction 28).
- The thaw's area observation was printed before the third day's heading on the pass that turned the day (friction
  26); it now waits on the heading.
- With the drowned met by the wolves, the morning's news still saw the Cobbs walking up the North Road together; it
  no longer does.

## The two principal approaches, and how they differ

| | The Front Door (`long.json`, a bard) | The Ring (`ring.json`, a labourer) |
|---|---|---|
| Hours | 135 steps, three days | 96 steps, the first day and night |
| Who acts | Harker believes (conviction 5); supper; the tour; the trade | Harker hires; Kemble walks you in; the bar goes down outside |
| What is found | the bond book, read by lantern on Harker's tour | the bond book, the beam in the loft (D. COBB… I DID) |
| The turn | Callow's third answer, made from what the bond book said | Tansy Hobb told, and twenty people on their feet |
| The lever | the trick: the indentures given back at the Landing | the flight: out under the wharf and down the sledge road |
| Cost | a landed debt of two hundred ewes | your own hand, melted with the ice |
| Ending | The Long Con | Not Landed |
| Experience | 2,000 to each of the two (the bard and Ursel) | 1,200 |

## Negotiations

- **Broom** over a penny a stair (persuasion; the one-penny ruling) — every journey.
- **Harker**: the pose, Hawsfold told, the tally, the ruled tally, Ursel's terms, supper, the terms, the hired asked
  for, the handshake (`long`, `score`, `pillory`, `flock`).
- **Abel**: diverted (`long`, `score`), brought to believe, sold to (`flock`), told of the hulk (`leak`).
- **Thessaly**: Icicle kept and the key given (`unswearing`, `thessaly`); at supper (the Squire seen through).
- **Tredgold**: told what Harker does, and sledges for nothing (`sledges`).
- **Callow**: three answers (`long`/`unswearing`: the third; `callow-slips`: his own).
- **The Landing**: the knowing doctrine argued with Callow (`long`, `unswearing`); the books laid (`unswearing`); the
  hired given back (`long`); restitution refused and the pillory (`pillory`); the counterpart shown (`counterpart`);
  the handfast landed (`ursel`).

## Alternate outcomes

Every ending but *Away* and *The Score, and Ursel's* is reached by a test; *The Score, and Ursel's* was reached by the
first draft of the flock journey (a bard who had given Ursel no reason to trust), which is why that journey was
rewritten without her, and why Ursel was given a third way to be won (being seen through). *Away* (not in Pellam on the
morning after, with no score) is not played by any test.

## The world beyond the march

`liberty-of-the-ice-placed.test.ts`, seed `rime`, a generated frost country: the plan puts Pellam on its west march
(the Ghessil Uplands, independent, are not this seed's choice; on `b2` they are, and Pellam lies further out, still
in the world); the company walks to whoever keeps travellers and asks about "the Frost Fair at Pellam" ("a lie's no
crime on it, and a handshake's the Court's"), and it is in the journal as heard; walks to the west march-stone; the
frontier draws Pellam as a chapter; the road comes down the North Road; Swan Lane's watermen ask a penny a stair; the
shepherd of Hawsfold comes in at the first noon of Pellam's own days; three days on, the chapter closes on *Landed*,
the world is still running, and the company walks back out over the march.

## Persistence

Kept on the second morning of the Long Con (at the step before the counting-house) and opened again from the saved
checkpoint, the world goes on to the same ending, at the same watch, with the same purse and the same freed hired; and
the same steps from the same seed give the same history, page for page.

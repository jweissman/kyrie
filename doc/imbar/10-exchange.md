# 10. The Founders' Exchange as an opponent

*`data/goings-on/factors/`, `data/scenarios/factors.scenario.json`; heralds named in `countries.json` by Merrowdale,
Ammerlin and Tolleth. Tests: `test/factors-handoff.test.ts` (3), `test/exchange-responds.test.ts` (5).*

The first pass showed a custody chain. This one asks for an opponent: **more than one response to the same
interference, from what it knows and has, with a durable consequence somewhere else.**

## What it is

A trade ring, not a cabal: a *factor* (a person), her *carter*, and *hands* (a group), all cast by Deem into the
largest settlement. What Deem rolls: ancestry (by the terrain), name, the length of the carter's run (3–5 days), the
house's **stock** (2d6) and **muscle** (2+1d3). Five worlds, five houses:

| seed | factor | stock | muscle | run |
|---|---|---:|---:|---:|
| thorn | Taklinn | 7 | 3 | 3 d |
| a1 | Naillil | 3 | 4 | 3 d |
| kite | Arannis | 7 | 4 | 3 d |
| ash | Valen | 11 | 5 | 4 d |
| wren | Jeremiah | 7 | 4 | 4 d |

## What it knows

Only what is said at its table (the factor), what the carter sees on the road, and what the hands see at the gate.
It cannot know what is done in Merrowdale, on Skerrow, or in a book. The company's interference becomes known to it
in exactly two ways: it asks the factor where the bronze comes from (`suspects`), or it buys a lot back (`suspects`).

## What it does

| The company | The Exchange answers | By what |
|---|---|---|
| asks the factor where the bronze comes from | the lot is **got out of the way at once** (the carter leaves the same hour, not at his run's end) | `suspects` + a held lot |
| the same, and the house has **muscle ≥ 4** | **a hand is posted at the yard gate**; the gate is shut to the company | `muscle(hands) >= 4` |
| buys a lot back | the price rises **fourteen → twenty-two** for the company that asks | `suspects` |
| is watched, and asks the factor why | she **offers twelve coin** to stop asking; taken, the suspicion is lifted | `offeredCoin` |
| names the factor to the innkeeper, **a poor house** (stock < 9) | she **closes up and goes in the night**, taking the lot; the hands are `routed` | `stock` |
| names the factor to the innkeeper, **a rich house** (stock ≥ 9) | she **buys the inn**: the company is *refused service* in the largest town; the ring continues | `stock` |

One of these is a surprise I did not plan and kept: because asking the factor makes her move the lot, a company that
asks *first* and exposes *second* finds, in Low Water, a tray with the lot on it and an Exchange that no longer exists.
The ring does what a sensible one would: it saves the goods and runs. Stopping the lot takes buying it back *before*
asking, or naming her *without* asking (the sack is in plain view, tagged NORTH).

## What it leaves, and where it is read

- `routed(hands)` is read by **Low Water's Halm** (a bare cloth; "the lots have stopped… Somebody did something. I don't
  know whether to thank them") and by **Skerrow's Silas Quillon** (his buyer is gone and the lamp is not sold). Neither
  module names the other, or the Exchange: both read a canonical relation on an entity the herald bound.
- `refusesService(keeper, party)` is read by the engine itself: the inn will not serve.
- A reload made after the retaliation resumes into it, same facts, same people
  (`test/exchange-responds.test.ts`, *buys the inn…*: `canonical()` equal; `refusesService` and the custody still
  true).

## What it is not

Not a planner. Its responses are rules with conditions; none of them chooses among means by search. The engine's
`Pursuit … seeks` planner (Caught Below's guest) could, but the goals available to it are the relations existing
actions can reach, and the Exchange has no such action in a country that is not installed. Not omniscient (see
above), and not unlimited (a poor house has one carter and flees; a rich one can buy an inn, once). It has no
reinforcements. The hands do not fight.

## Smallest general capability still missing

A person's **response** to a company's act is, in Kyr, a rule that names the act's trace (a `suspects`). That works,
and it generalises, but each trace must be written. A small construct, `Notices when …`, would let an author
declare *what a person can perceive* once, and have the engine give rules a `perceived(person, act)` to read. I did
not build it.

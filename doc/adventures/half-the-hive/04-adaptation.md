# Half the Hive — Stage 3: Kyrie inspected, and the adaptation

*What the engine could say of the design directly, what it said with effort, and what it could not. The friction that
remains is in [friction.md](friction.md).*

## What was read

The authoring guide end to end; the shared rules (`core`, `people`, `services`, `belongings`, `inhabitants`,
`probing`, `discovery`); the person parser (for `Remarks`, conditional words); the frontier and `Countries.plan`
(how an authored country is placed in a generated world); `web/scenarios.ts` (the title page); the Mission 18
one-universe design and status (the canonical planes and Imbar, designed but **not on main**); the repertoire survey;
and three works in full or nearly (A Winter in Carth, The Long Man's placed bundle, the circus's training).

## Where the Wold is

An **authored country beyond a march**, in Imbar, entered by its own drove road, offered in `countries.json`
beside mountain countries on the south side. It declares **no plane**: six works on main each declare a private
`imbar` plane, which Mission 18 means to remove; a seventh would make that worse, and a generated country lies in no
plane either, so a region in no plane is the honest thing until the canon lands (friction F1).

The Wold also has its own campaign (the title page offers it), for a protagonist who arrives by the same road.

## The design, mapped onto Kyr

| Design | How it is said |
|---|---|
| Belonging is a scent | A measure (`scentUntil`) and a latch (`anointed`); a query `scented()`; rules in every Comb room: tasted, then stung (a `Hazard`), then driven out to the Apron. A carried smoker (`holding(party, bee_smoker)`) and being *named* (a relation that never lapses) end it |
| Nell's oil | A `Kind` sold by Nell; using it is half a day's scent, and Elspet can smell it |
| The dead are kept | Things and observations in the Capped Gallery; the Gallery is `unlit` at night, by rule |
| The dance | A measure `tally(place)` per site, changed by hand wherever a dancer changes (no aggregate count in Kyr: F6). The company's dance is an action with a performance check; Ivo's, Hannet's are actions spoken to them |
| The Leaving | `calledTo` by quorum (five), the flask, or noon of the fourth day; `left(site)` between eleven and three; each person's going `decided` at that moment from what they have come to; goers moved to the camp |
| The Calling | An `Occasion` of six matters, with rules that say each household's part from the state of the week |
| The founding night | Rules anchored at each camp, a paragraph per site and per condition; naming is a rule |
| The Daughters | Three things with states; caging and piercing are actions; emergence and stinging are rules on the clock of the Leaving |
| Crossed lovers | Four relations (each one's secret; each one's knowing the other's); the Leaving decides who goes from them |
| A Drone's week | A `willing` companion; his dance is an action; his remarks are local rules (F2); the Turning-out is a rule; a turned-out Ivo can be recruited into the world |
| Every site costs someone | Who goes depends on the site and the road (`kestrelTurned`); the brocks raid an untended Dell at night; the account tells each |
| Danger | Brocks (`like owlbear`, two, level 2), robber bees (`like nightmare`, five, level 2, guarding a way), the Deathshead (`like nightmare`, level 2, roused by light), the Sisters (a hazard) |
| Alternatives | Fire (`Fears flame`), smoke (an action that grants tolerance), the truce (an action needing the old comb and the reading), the sting rubbed on the moth (a stealth check), the shepherds' drove (a passage hidden until known) |
| Making | The Lantern Stair (white wax given; a night of brawn, or of performance, or Ivo's voice); the mead (three ways to get bee-bread into a barrel); a wax likeness of Tobit |
| Livelihood | Cutting wild comb (a climbing check, a slab a day, sold to Martin at a fair price or Penhallow at a fifth); Searcher's pay in wax; inn work and singing (shared) |
| Training | Kestrel teaches `hide`, Hild `smoke_screen` (Orsino abilities via `teaches`); a night beside the Mother `endow`s wisdom |
| Persistence | `named(party)` for life; the world's `word` goes stale when the Mother goes, so the country below says it has heard; after-topics and observations at each camp and in the Brow |
| Endings | Nine, one per site and condition, after an account of fourteen strands |

## What the engine could not say, and what was done

- **A companion's `Remarks` never fire** once he has joined (the shared rule asks that he be `able`; a member is not).
  Ivo's remarks are local rules (F2).
- **`Give` takes an item, not a kind.** Every cake of wax, slab of comb and cage handed over is a declared item at
  `limbo`; a slab cut each day is a rule per slab (F3).
- **No count of relations**, so the tallies are kept by hand (F6).
- **A placed country's clock is below nothing until its first morning**, so a measure compared with it reads true by
  accident; the scent needed a latch (F7).
- **The world's country plan is not stable under addition.** The first placement offered moved every other country
  and broke eleven tests on main; the Wold is now offered only where it can never take a first-ring march and is
  placed last (F8).
- **Farewells cannot be authored**: they come from voice tables by manner, so a widow's farewell was "has gone back to
  work" until her manner was changed (F9).

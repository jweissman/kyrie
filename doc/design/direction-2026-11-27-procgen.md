# Generation that reads true: beauty, fun and depth from procgen, on solid foundations

**A direction, 27 November** (the owner: "we have reached a phase of needing to *try things*, but … foundations solid
first, paying down architectural debt"). It names what generation should do next, and for each idea the foundation
it rides on. The experiments come *out of* the platform work rather than around it, and each is small, behind a pin,
and measured.

## The principle

**Generate what reads true and what changes play. Keep generated texture sparse, so that the authored peaks stand
out.** This is composition by contrast (direction-2026-11-26-composition.md) applied to procgen.

- **True:** every generated detail is evidence of a fact the world holds: a scorch mark because there was a fire.
  It is never decoration. That keeps the knowledge contract (questions only on grounds) and makes investigation
  possible.
- **Changes play:** a generated thing either opens an act, changes a price, route, odds or relationship, or answers a
  question the player has. Otherwise it costs attention and pays nothing.
- **Sparse:** generated prose is terse by default. The few curated images per expedition carry memory
  (doc/design/cold-play-8-to-8-5-2026-11-27.md, Wave 6).
- **Deterministic by identity:** every draw is keyed by the stable identity of what it draws for, never by sequence or
  install order (the standing ruling; OR-418, OR-1745).

## The foundations, and what each unlocks

| Foundation (state) | Unlocks |
|---|---|
| **Identity-keyed draws** (OR-418 landed; OR-1745 in progress) | Generation that is the same whatever order a world is met in; lazy placement; a world that goes on while unvisited |
| **Lazy placements** (in progress, behind `KYRIE_LAZY_PLACEMENTS`) | A world as large as the setting deserves, paying only for what is near: start 5.3 → 3.2 s |
| **The region IR** (AX-04, designed; 2 of 37 writers) | Generated worlds without the text round-trip: 1.0–2.3 s of a fresh world's start; generators that build values, not strings |
| **Deem's compiler and structured expressions** (merged) | Richer templates at no cost: paths, literals, `??`, and declared reads for incremental generation later |
| **`If` in act consequences** (OR-1333 slice 1, next) | Generated situations with branches written as one act, not ladders of rules |
| **The installed domain's overlays** (installed-domain.md, conditions first) | Items with properties that do something; curses, enchantment, temporary forms; a dungeon's hazards as overlays |
| **Semantic records and During** (MT-30, landed) | Generated situations that keep their identity, phases and causes for inspection, tests and the book |
| **Knowledge provenance** (entry-1127's grounds, landed) | Rumours and clues that say how they are known; investigation that is uncovered, not handed |

The order below follows these dependencies. Nothing here needs a foundation that does not exist or is not in
flight.

## Six programmes

### 1. Truthful foreboding (rides on: what exists; first)

A lair's signs are generated from who actually lives there: tracks, spoor, bones, the smell, a previous party's
gear, the sound before the door. They are placed on the ways toward it, so a careful player is warned in proportion
to the danger. The shrine-keeper's or a trader's warning is derived from the same facts, and grounded.

- **Rule:** a band that can kill the company has at least two signs on the way to it, generated from its kind
  (`Kind … leaves "…"`, a few lines per creature family in the bestiary's templates).
- **Proof:** a pin that every lethal band on the reference dungeon's levels is preceded by signs of its own kind. A
  quantity measure: the share of lethal encounters met without a sign, ratcheted toward zero. This is the owner's
  ruling: "an unwarned fight can very occasionally be lethal, but the environment … should give lots of warnings".
- **Why first:** it serves trust and fun at once, it is small, and it needs nothing new.

### 2. Places with a past (rides on: History.ts, the region IR, knowledge provenance)

Each site and settlement gets a short generated history: who built it (History.ts's makers already), who lived there,
what happened (a fire, a flood, a siege, a feud), and who lives there now. What the company sees derives from it:

- **Traces:** two or three concrete details per place, each the consequence of a historical fact. A scorched lintel
  from the fire; steps worn on one side from the flood's later trade.
- **Readable things:** an inscription, a ledger, a grave marker, each a fact taught when read.
- **Grounded questions:** a trace is grounds for asking someone about it, and the answer may be true, partial or a
  lie, by who is asked.

The history is generated as values in the IR, not as text. It is the first new generator to be written the AX-04
way, and it proves that path.

- **Proof:** a pin that every trace a place shows names the historical fact it comes from (provenance), and that
  asking about it is offered only after seeing it.
- **Measures:** traces per place within a band (sparse: two or three), and repeated traces across a town (near zero).

### 3. Finds with a history (rides on: places with a past, the installed domain's overlays)

A notable find is generated with a maker (from the place's past), a material, a past owner, a use, and someone in
town who cares: a collector, a widow, the past owner's heir, a thief. "Generic scattered coins" become rare. The
valuable narrative space goes to finds that mean something.

- **The find's use** is an overlay (installed-domain.md): a ring that wards, a lamp that never gutters, a curse. It is
  real in play, not only in words.
- **The person who cares** turns a find into a choice: sell it to the dealer, return it to the heir, keep it. Each
  is a consequence the town remembers.
- **Proof:** a pin that every find above a worth threshold has a maker, a use and a person; that the person
  recognizes it; and that the choice changes something later.
- **Measure:** the share of expedition value in finds that carry a history, against loose coin.

### 4. A dungeon that is an ecosystem (rides on: the deep's renewal, lazy placement, identity-keyed draws)

Inhabitants have needs (food, water, light, territory) and relations: predator, prey, rival, ally. What moves into an
emptied room depends on what died there and what it draws: scavengers after a slaughter, a predator after the
scavengers. Factions inside the dungeon can be played against each other.

- **Between expeditions,** the dungeon changes by its own rules: a collapse, water rising, a rival party, newcomers
  (the deep builder's three bands are the beginning).
- **Proof:** a pin that what renews a room is drawn from what its last inhabitants left and what the level's ecology
  admits; a fragment world played through two absences, its changes each traceable to a rule.
- **Measure:** distinct inhabitants met across five expeditions, and the share of later rooms changed by ecology
  rather than refilled by template.

### 5. Situations from a grammar (rides on: `If` in consequences, semantic records, During, the decomposition of adventures)

A situation is drawn from a grammar, not written as an errand: a trouble (theft, debt, feud, haunting, sickness,
disappearance) with a cause, stakes, two to four people in cast roles, a clue chain, and several endings.

- **Its source** is the decomposition of the integrated adventures: each is decomposed into situations with cast
  roles and arc variants (the owner's abstraction tower, 25 November).
- **Branches** are written with `If` in consequences, so a situation is one readable act with branches, not a ladder.
- **Its identity, phases and causes** are retained as a semantic record (MT-30), so the book and inspection can read
  it.
- **Proof:** two different situations drawn from one grammar in two towns, each completable two ways; the corpus's
  first decomposed adventure plays as it did before.
- **Measure:** situations by kind per town, and the share of first-town jobs uncovered by investigation rather than
  handed out (OR-370).

### 6. A world that goes on (rides on: lazy placement, identity-keyed draws, the one clock)

While the company is away, the town and the wild change by rule:

- a price moves with what the company sold;
- someone leaves, marries, falls ill or falls out;
- a festival comes round by the calendar;
- the river rises in its season.

Unvisited placements keep a clock, not a simulation (lazy-provinces.md), and are realised to the moment they are met.

- **Proof:** an absence of N days changes the town by named rules, deterministic by seed. A save and resume in the
  middle gives the same changes.
- **Measure:** changes noticed per return, and the share of returns where the town answers something the company did.

## Fun that needs no new generator

These ride on what exists, and the cold-play evidence asks for them first:

- **Compress the secured descent** (the 8–8.5 note's Wave 2; routine at 71–76% of moves): the largest measured fun
  lever, and partly a performance one (fewer turns).
- **One conversation that changes the dungeon** (Wave 5): one person who asks, tests and decides, and whose answer
  changes a price, a route or a warning.
- **Pleasant activities** (the Fun Fridays): a game of dice at Finnan's, a riddle contest, a bargain at the market.
  Each is drawn from a small template and played through the ordinary interface.
- **Autoplay to watch** (the owner's idea: long-press on the diamond): the engine's next best act every few seconds.
  It is a demo, a cold-play aid and a pacing instrument.

## Order of work, foundations first

1. **Now (foundations in flight):** OR-1745, then lazy placements; `If` in act consequences; the region IR's first
   writers.
2. **First experiments, small and pinned:** truthful foreboding (1); compressing the secured descent.
3. **On the IR:** places with a past (2), the first generator built as values.
4. **On the installed domain's overlays:** finds with a history (3).
5. **On renewal and the one clock:** the ecosystem (4) and the world that goes on (6).
6. **On `If`, records and decomposition:** the situation grammar (5).

Each is tried in a fragment or the reference country first, behind its pin and measure, before it spreads.

## Measures of variety, not volume

Extend the world gate (scripts/quantity) with:

- distinct images across five expeditions;
- the share of repeated filler;
- distinct preparations that mattered;
- lethal encounters met without a sign;
- traces per place, and repeated traces;
- the share of value in finds with a history;
- distinct inhabitants across five expeditions;
- situations by kind per town.

Each is a band or a ratchet. The cold-play rounds judge whether it is better. The measures keep it from regressing.

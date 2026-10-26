# The evidence: what was played, and what it showed

*Everything below is played by the labels a player sees (`test/support/calamy.ts`: steps are the page's own labels,
or `go:room`, walked one exit at a time by the passages as they stand) and asserted on the world afterwards. The
transcripts are written from those journeys, as the page told them.*

## The journeys (all passing)

| File | What it plays |
|---|---|
| `parliament-of-books.test.ts` | the opening (the Lamb, the Almanack, a copy that goes along); the sluice, the wedding, the heron; Pask's suit won and the Ordinance failed; **the Archivist's reading** (two pieces, Hennet's letter, the key by the cheese, ink at dead low water, entered; the Commonplace `elsewhere`; home by the Founders' door); **Crake's back stacks** (trusted; Crake comes; the Errata pass him by; the Canto sponsors); **the Lending Accord** in full (the Parliament moved by what the city taught it; the Index's claim answered with the Lamp's flame; the Almanack spared at the fire); **doing nothing** (the Year of Ash) |
| `…-arcs.test.ts` | **Rhule's three ends** (Advocate, Binder after a lie, Burner); the bestiary read home (turned out at dusk, back in with a lantern on purpose) and re-Sewn by Mott; the Awls fought, and Kit Sewing the Pleas; the Lexicon's chains struck |
| `…-builds.test.ts` | nine protagonists alone: scholar, priest, merchant, court, margins, healer, thief (and the Errata's correction), soldier, hunter |
| `…-outcomes.test.ts` | **the Recall** by vote (and the Canon keeping almanacks off the fire); **the Separation**; **the Pleading Accord** (a cleric-warden binds the Lexicon); **the Open Door** (a bard-messenger); the Effusions given to the fire by their own leave, renewing the Colophon |
| `…-ash.test.ts` | **the Ash**: the burned copies' fate heard from the Almanack; the Lamp's taper carried through the pickets and the ranks; last year's almanack; Rhule's father's book; the Index heard out and its bargain offered. Rhule told of her father and her candle: she lends her register, the burned are read their names, and the Index foxes. A level-8 soldier fights down to the hearth and burns the Index; the almanacks burn, and with no Index the Year of Voices comes |
| `…-rewards.test.ts` | Corday's Grammar read at level 4 (+2 strength) and refused at level 1; Orme's chapters taken home from the Imprimatur by Rhule's leave, the Physick restored, her leaf given; the Primer's lesson (+1 wisdom) |
| `…-placed.test.ts` | an **ordinary player from outside the region**: a generated frost country (seed `cold`), Calamy rumoured there, held beyond its east march; travelled to the edge, the frontier expanded, the march crossed to the causeway, into the Hithe, into the Lamb, and the Almanack there to be talked to. No ending is installed in a world that goes on |
| `…-autoplay.test.ts` | three runs of 300 steps by the autoplay laboratory's players (mixed bard, exploring thief, fighting warrior): every step checked for sound creatures, legal offered commands, a whole company, and save/load round-trips; each run replayed from its commands to the same game |
| `endow-and-roll-call.test.ts` | the engine probes for `Resolve endow`, `levelOf`, and per-binding speech |

## The transcripts

`doc/playtests/parliament-of-books-2026-10-26/` (rewritten by `bun scripts/parliament-of-books-transcripts.ts`):

| Transcript | Steps | Ends | Sealed |
|---|---|---|---|
| [lending.md](../../playtests/parliament-of-books-2026-10-26/lending.md) (by the reading) | ~450 | The Lending Accord | sleep by leave, fire by leave, reading by asking, licensed door |
| [recall.md](../../playtests/parliament-of-books-2026-10-26/recall.md) (by the stacks) | ~300 | The Recall | the Speaker's motion |
| [pleading.md](../../playtests/parliament-of-books-2026-10-26/pleading.md) (a cleric-warden) | ~340 | The Pleading Accord | by leave, by judgment, Rounds, Founders' door |
| [open-door.md](../../playtests/parliament-of-books-2026-10-26/open-door.md) (a bard-messenger) | ~380 | The Open Door | by leave, by leave, Rounds, open door |
| [advocate.md](../../playtests/parliament-of-books-2026-10-26/advocate.md) | ~280 | The Recall (no Parliament, but no burning) | the Speaker's motion |
| [binder.md](../../playtests/parliament-of-books-2026-10-26/binder.md) | ~270 | The Year of Voices | the Speaker's motion, but the Colophon broken by the fire |
| [idle.md](../../playtests/parliament-of-books-2026-10-26/idle.md) | ~230 | The Year of Voices | the Speaker's motion |
| [bond.md](../../playtests/parliament-of-books-2026-10-26/bond.md) | ~55 | (a day's errand) | |

## The two ways in, compared in play

By the reading (lending.md), the company spends the better part of three days in the city: the rhyme on the bridge,
the clerk's coin for the Ninth Plea, Hennet's letter read aloud, Quarles, the cheese, the reed-heart at dead low
water, the codex, four hours reading the Catalogue aloud from the Founders' entry to its own. It arrives *entered*,
with a shelfmark, and the Catalogue on its side. By the stacks (recall.md), it is in the Remainder Market on the
first day, with Crake beside it and no standing until the Second Canto speaks for it; it has seen far less of the
city, and knows far less to say in the chamber. The thief's way (builds) is faster still and ends with the Errata
correcting the company into the Catalogue the hard way. The route changes **when** you get there, **who** is with
you, **what standing** you have, and **what you can say** when you do.

## Persistence

The autoplay runs check that a save round-trips to the same game every forty steps and that every run replays from
its commands to the same canonical state; the browser persistence test loads the bundled module exactly as the CLI
does (the bundle is regenerated with `bun run web:build`). World state persists across days: the bestiary burned on
day 5 is ash at the Ashpit; the Ordinance's result stands; the Pleas, once awake, are awake; Rhule's end shows in her
room and the Imprimatur's office the morning after (`after()` observations).

## What the playing found and changed (stage 5–6)

A poll that told two members' votes (engine fix); a Parliament that could be finished on day 2 (now Kindling eve
only); Coddy stranded at the millrace; a manticore that killed a lone bard on a check; beasts released every pass of
the hour; the Awls attacking by day; a company trapped in the bond; Sallis's bond with no dusk; a Catalogue greeting
that said "Entered" to the unentered; a bound Lexicon that took its seat again; a clause rewritten by the Imprimatur's
"seen as"; a funeral that cut a search across the city and closed a route; the back stacks described from the wrong
end; weather in the Commonplace. Each is fixed and, where a journey could catch it, caught by one.

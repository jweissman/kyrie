# The Grand Tour: changes

*What changed between the treatment and the build, and what play and reading changed after. The key for names in
documents 00–02, which predate the build.*

## Names

| In 00–02 | In the build |
|---|---|
| Ambrose Murrey (companion) | Fabian Murrey |
| Rector Quance | Magistra Isadora Quance |
| The Ball (fifth night) | The Night of Lanterns (fourth night, Ascension Day) |
| Pollard, the footman | Jem Tuttle |
| Mother Gannet | Mother Kittiwake |
| Nance, the glass-blower | Prue Quickly |
| the curator | Dr. Evander Cole |
| Rafe (the brother) | Aubrey Halyard |
| the merfolk child | Ha'penny |
| `lodging` (the Rector's) | `rector_study` (the shared rules had the id) |
| nine days | seven days, closing on the eighth morning |

## From the design to the build

- **Seven settlements became eleven ends.** The Letter (a thief's way to the Keepsake) and First Through (the
  accomplice, separated from the Second Whelming) were added; Found Out and the Tour Unfinished were made explicit.
- **"The Rose made from three petals and the North Wind's leave"** (the editorial's Gift Renewed) was not built. In the
  Keepsake and the Letter the Air petal stays in the keel and the Door stays shut. The Tour is unwon; the city is mended
  instead. It reads better than it planned.
- **The Rector given all four petals** climbs the tower at once (`rector_climbs`): the obedient Tourist's ending, the
  Rector's Door, had no way to happen except through the keel night before.
- **A renewed gift is no longer a key**: the petal will not come out of the rock for anyone, and the Rector, going
  down on the seventh night, balks (`rector_balked`, with its news line). Without it the Keepsake could never be
  reached, because the Rector took the keel and the Second Whelming outranked it.

## Changed by play (Stage 5)

- **Bassett** was reachable only at Prue's glass-house in a three-hour window; given a beat on Lamp Street. His arrest
  rule required `rectorFree()`, which the exposure he acts on makes false: it could never fire. Now it waits an hour,
  for her to be in the town or abed.
- **The Fire's heat** struck every ten minutes and killed a wandering bard (autoplay). Now it scorches once, and half an
  hour later the court carries you out to Mr. Tench.
- **Breath in a world**: the merfolk's kisses ended as they were given when Sennet was placed in a generated world
  (`friction.md` 1); timed on the module's own clock now.
- **Milestones** (`growth.kyr`): the company had no experience for anything it did in Sennet. Twenty-seven now.
- **First Through** declared before the Second Whelming.
- **The Rector takes the keel aloud** when the company stands there and does nothing.
- **The escritoire** is picked only with the drawing room empty (an action replaces the Thing's `Change`).
- **The North Wind** no longer offers his terms after his gift is renewed, and gives the feather either way.
- **Cloudgate fallen**: the Landing Stage, Promenade, Balustrade, Wind Court and drawing room have fallen descriptions;
  the ride down is told aboard, the wave from the Quay; the Lanterns do not happen on a hill in the bay; the harbour's
  candles fetch up against it.
- **Night in Cloudgate**: the Landing Stage and Promenade at night; the baskets' Results no longer say "into the sun".
- **The funeral after an arrest**: the mourners' rule pulled the jailed Rector to the Balustrade to speak; now the House
  sends Brother Amis.
- **The companion's death**: `fabian_falls` read `joinedAs`, which the engine retracts when a slain member leaves.
- **The Lanterns' times**: "Half past ten" for a loosing at half past nine.
- **Promise lines**: Perrin's kept-line waits for the closing day and his being alive.
- **Ha'penny's news of the drowning** is told on the third step, not at the winch-house.

## Changed by reading the transcripts (Stage 6)

- The **opening page** at the top of the coast road was empty; it now has the first sight of the three storeys, and the
  Landward Gate no longer repeats it.
- **Ha'penny, Mercy, the Dowager** join and leave in their own words.
- **Chert's** second greeting no longer says "You're back!" the first time he is spoken to.
- **Mr. Tench's** desk and **the Air Door's** bar read truly from both sides.
- **The ferry** that does not yet run is described in words true on the Quay and on the hill.
- **The Rose's count**: "Petals set in the rose of the Door of Doors: three of the four."
- **The Aubrey news line** does not contradict the Halyards' fallen line.

## Engine and tooling (general, not Sennet's)

- `RegionBorders` / `RegionGates`: a province's notice and after-word go through the same telling as a march's
  (`Told`, `notice`, `back`), so any province can be proclaimed in the towns.
- `bin/kyrie play <campaign> --as race/calling/Name[/background]` now applies to campaigns, not only worlds.
- `bin/kyrie play … --probe @relation [args]` lists what holds.
- `scripts/the-grand-tour-transcripts.ts` writes the evidence.

## What was cut or left

- The Treaty of the Four Doors and most of the Aenean lore (E11) stayed out; the plaque says what the engine does and
  nothing about who built it.
- The student lovers (E12) stayed cut.
- No Deem tables; no new engine relation for a recruit's death (`lost`), which friction 3 asks for.

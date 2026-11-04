# Content inventory: defined, played, met, and shown

Mission 19, Priority Four and journey 6 ([brief.md](brief.md) §VI, §XII). A record in a registry is not content in
the game; this table says, family by family, how far each has come. Measured 4 November 2026 on the commit that
adds this file.

**Columns.** *Defined*: entries in the catalogs (hand-written and Orsino's generated). *Played*: entries the game
executes (the handbooks' statuses faithful, adapted, represented or Kyr's own; `site/handbook/coverage.json`).
*Met*: where a player can come to it in play, with the evidence. *Shown*: entries in the Encyclopedia of Imbar,
which holds only what is played.

| Family | Defined | Played | Met in play | Shown |
|---|---|---|---|---|
| Peoples (ancestries) | 25 Orsino, 15 playable | 15 | chosen at creation (the builder's play saw human, elf and dwarf offered); generated towns hold a majority people and others (`RegionPeoples`) | 15 |
| Callings | 7 | 7 | chosen at creation; each leads to its own approaches in the first town (see journey 2) | in *Callings and lives* |
| Backgrounds | 215 Orsino + hand overlays | 215 | chosen at creation by family ("What did you do before this?"); 5 play-validated | in *Callings and lives* |
| Skills | 22 | 22 | lockwork, brawn, rites, lore open different ways in every first town (d7ceb585); stealth slips past watchers (shared rules); others in authored adventures | in *Callings and lives* |
| Spells and prayers | arcane 131, divine 154 | 105 and 139 | a caster's first spell chosen at creation; prepared from the tradition as levels come; 13 taught by market-town scriveners | 364 in *Magic and prayer* (with techniques) |
| Techniques | 63 | 63 | the callings' own; 14 taught at drill-yards | in *Magic and prayer* |
| Conditions | 204 | 180 | in fights and the field | 180 |
| Species and creatures | 124 | 124 | 96 named by a generator, table, template or adventure (measured by a search for each id as a word: an id named in `data/generation`, `data/adventures`, `data/situations`, `data/goings-on`, `data/rules`, `data/imbar`, `src/world`); the rest only by family through the creature tables, or not at all | 175 in *Creatures* |
| Items | 396 | 363 shown, see the handbooks for the rest | 296 named by a generator, table, template or adventure (same measure); each trade sells what it makes, every village and town has a chandler (1eb58ad4) | 363 in *Arms, gear and treasure* |
| Authored adventures | 21 | 21 | every one a province of the first country, its rumour told in every town (countries.json); each played by its own journeys; **never played together by one protagonist** (NAV-10) | 21 in *Lands of rumour*, by what is said of them |
| Orsino's generation tables (rooms, traps, wonders, riddles, shops) | ≈500 | 0 | not used | — |
| Orsino's companions, deities' drafts, dungeons | 27, 85, 5 | 0 | not held | — |
| Languages | the `languages` package | yes | place names in each people's tongue; Common names in the human heartland; townsfolk's pronoun from the name (8a5dd206) | not yet |
| Planes and Imbar's canon | `data/imbar` | yes | the House of Doors, the planes of the adventures that go to them | not yet |

## How this was measured, and its limits

- *Played* is the handbooks' own account, generated from the catalogs and Orsino's registry (`bin/kyrie handbook`).
- *Met* for species and items is a search for each id as a word in what play is drawn from. It over-counts a little
  (an id named in a table no world draws from) and under-counts what is drawn by family (a creature table that
  picks "a beast of the marsh"). It is an indicator, not proof; proof is a play that meets it.
- *Shown* is the Encyclopedia's chapter counts on its title page.

## What would raise the coverage most

1. Creatures by habitat into the wild's meetings and dens (a data table, not TypeScript), so that the 28 species no
   world names are met where they live.
2. Orsino's generation tables (rooms, traps, riddles) behind the deep sites, which are TypeScript today.
3. One protagonist through three adventures in one country (NAV-10), which is the test of the adventures as one
   Imbar rather than twenty-one books.
4. Languages, planes, histories and institutions as Encyclopedia chapters, from the same data the game reads.

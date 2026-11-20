# Creation's entries, surveyed (OR-99, 18 November)

The owner, from play: "Most of the instruments next to the menu in character creation seem impoverished to me." The
entry is what `CreationFlow.steps()` sets on a card (`CreationCard.entry`) and `ComposedCreation.Entry` draws beside
the question. The doctrine: the engine owns the entry, read from the catalog; it says what the choice *is* in play;
the encyclopedia keeps the fuller words. Surveyed for a human warrior, an elf mage (evocation) and a dwarf cleric
(Life), at 798567eb, before this pass.

| Step | What its entry showed | Judged |
| --- | --- | --- |
| you (people) | handbook facts: Build, Ages, Folk of, Tongue, Names, Callings, Born with (names only), May not take; rules as bare lines ("+1 against charms, +1 against fear.") with no name over them | **thin where it matters**: no stat line (the qualities a people adds, the first thing an SRD race entry says); gifts by birth named in one fact and their rules listed apart, unlabelled; the table of names repeated from the name step |
| sign | Month, Gifts (names); each gift's rule | adequate |
| gift | **none** | **empty**: the row's aside said the rule, nothing stood beside it |
| calling | Hit die, Qualities, Gold, Weapons, Armour, Carries, Skills, Specializations, Later; rules: the practice sentence, then "Begins knowing X." once per ability (ten for a warrior) | **thinnest of the full ones**: what a calling does in a fight is its first abilities, and they were a column of "Begins knowing Defend." with nothing said of any; "light_warhammer" raw; the specializations listed that the next step asks anyway |
| specialty (art, domain) | Opens; the spells set out knowing, grouped At will / First level, each by emblem, name and line; the calling's own and later spells after | good (OR-92) |
| spell-1..3 (one spell each) | Level, Of; what it does and its condition | adequate per spell; but no instrument for the hand chosen (OR-98: replaced by the one 'learn' step, landing alongside) |
| before (kind of life) | Brings, Knows, Trades; the skills' rules | adequate (OR-88) |
| trade | **none** | **empty**: only its sentence; what a trade adds to the qualities, its coin and what it carries were nowhere |
| presenting | none | needs none: the three choices are their own words |
| name | none | needs none |

## What changed (CreationEntries, src/creation/creation-entries.ts)

An entry may now lead with `play`: what the choice is in play, in one line, drawn under its name as *In play*.

- **People**: in play, the qualities as a stat line (`Str −1 · Dex +2 · Con −1 · Int +1 · Wis +2 · Cha +1`; a human's
  "+1 to every quality"); facts Build, Ages, Folk of, Tongue, Callings, May not take (Names left to the name step);
  a *Born with* group, each gift by name and what it does (its rule where short, else the catalog's words).
- **Calling**: in play, hit die, armour where it is any or none, and the quality it casts by (`d4 hit die · no armour ·
  casts by Intelligence`); facts Qualities, Armour (where neither), Weapons, Skills, Carries, Gold; a *Begins knowing*
  group, each ability by name and the first clause of its catalog words, a spell with its emblem; after: "And Defend,
  as every calling. Later, by level: Dig In (3), Rapid Strike (7), …".
- **Gift**: in play, its rule; fact Of (the sign and its month).
- **Trade**: in play, what it adds to the qualities and its coin (`Str +3 · Dex +2 · … · 50 gold`); facts Brings,
  Carries, For (a calling's own).

Each is written once and kept (steps() is asked at every press). Pinned in test/small/creation-entries.test.ts.

# The Quiet in the Sky

*An independent adventure region for Kyrie, on the branch `adventure/quiet-in-the-sky`. Written 31 October 2026.
Spoilers throughout.*

For nine hundred years the hamlet of Larum, under a high pass, has heard the warrior dead fighting in the snow above
it. On still days it comes down faint, like a smithy the size of the sky, and stops at dusk, when the chapel rings a
bell for a reason nobody remembers. Forty days ago the noise stopped, and Larum cannot sleep for the quiet.

Over the pass, in Ysgard, the dead of Imbar's wars are sorted at the Coming-in by the hour they died: before noon to
Morrowhall, after noon to Evenhall. They have fought every day on the Field and risen healed every dusk. Whatever is
done to them is undone at the Hour, and whatever they make stays made. Forty-one days ago Halvard Eld, champion of
Evenhall, did not get up. Since then nobody has fought, out of fear that death has come back. In the quiet, around his
body, the dead have built a town out of their shields, Halt:

- a berserker is trying to bake, and his bread will not rise;
- a skald who knows only battle-songs is asked for a song for the peace;
- a pikewoman and a knight who have killed each other three thousand times cannot stand in the same lane;
- the despised dead who died running carry for both halls and have noticed that nobody else can.

In four mornings Halvard's sworn brother will lead Evenhall down to the ford to fight itself, to prove that nothing has
come back and to make his friend get up.

The protagonist comes up the pass alive. Theirs is the only breath on the Field that steams in the cold, and the
truth, when they find it, will not save anybody: a living hand kills truly in Ysgard, and nothing else does.

## Playing it

- **In a generated world**: Larum lies beyond the west march of a frost, mountain or forest country. The innkeeper of
  the town the road leaves from says the carters report that Larum "can't sleep for the quiet". It is placed in every
  world the library tests, and moves no other country (`data/adventures/countries.json`). Its story clock starts the
  first time the company stands in Ysgard. The region goes on after its chapter closes.
- **From the title page**: *The Quiet in the Sky* (`data/campaigns/the-quiet-in-the-sky.campaign.json`, added to
  `web/scenarios.ts`).
- **From the terminal**: `bin/kyrie play data/campaigns/the-quiet-in-the-sky.campaign.json --choices "^To Larum street"`.

```sh
bin/kyrie lint data/campaigns/the-quiet-in-the-sky.campaign.json       # 0 errors, 0 warnings
bun test test/quiet-in-the-sky.test.ts                                  # lint, opening, cold, 7 journeys to 5 endings
bun test test/quiet-in-the-sky-placed.test.ts                           # in a generated world, and back again
bun test test/quiet-in-the-sky-wander.test.ts                           # random legal play, three builds
KYRIE_BROWSER=1 bun test test/quiet-in-the-sky-browser.test.ts          # Chromium; LARUM_SHOTS=1 keeps screenshots
```

## The module

`data/adventures/quiet-in-the-sky/`, module `larum`: twenty-five files, about 1,760 lines of Kyr. One region in no
plane (Larum and the Pass, 9 rooms) and one region within the plane Ysgard (the Field, 28 rooms, under Orsino's law of
Ysgard). Seventeen named people, an ox, a bear, a pack of wolves and six groups. Five outcomes with variants.
Twenty-five milestones.

| File | What it holds |
|---|---|
| `kinds.kyr` | Everything carried, sold, bought and given |
| `clock.kyr` | The story clock, the Hour, the cold, the breath |
| `country.kyr` | Both countries' places and ways |
| `larum.kyr`, `pass.kyr`, `whitlocks.kyr` | Larum, the Hark, Nance, the chapel and bell, the White, Jory, telling Jory |
| `coming-in.kyr` | Cleeve the Teller, the newcomers, Ned who came in at noon |
| `halt.kyr`, `ring.kyr`, `oven.kyr`, `song.kyr` | Halt, the ring and Torold, the Oven and Grimbold, the Truce and Wystan |
| `halls.kyr`, `lovers.kyr` | Morrowhall and Hild, Evenhall and Gorm, Mab and Ansel, the spar |
| `scrapes.kyr`, `old-ice.kyr`, `field.kyr` | The Runners, Cuddy and Edith; the Sitters and their bear; the Field, the Clear, picking, the Teeth |
| `law.kyr`, `funeral.kyr`, `testing.kyr` | The living hand, the truth told, a grave, the Testing and the Hour |
| `days.kyr`, `endings.kyr`, `after.kyr`, `growth.kyr` | Halt from day to day, the Morning After, afterwards, experience |

## The documents

1. [01-concepts.md](01-concepts.md): five competing concepts, and why this one.
2. [02-treatment.md](02-treatment.md): the full treatment, written before accommodating the engine.
3. [03-critique.md](03-critique.md): the editor's attack on it.
4. [04-revised-design.md](04-revised-design.md): the design after the attack, adapted to Kyr.
5. [05-map.md](05-map.md): geography and a map.
6. [06-synopsis.md](06-synopsis.md): the plot, acts, characters, themes and endings.
7. [07-small-adventures.md](07-small-adventures.md): the smaller stories and their status.
8. [08-builds.md](08-builds.md): who can do what; the character-build matrix.
9. [09-rewards-and-consequences.md](09-rewards-and-consequences.md): progression, institutions, persistence.
10. [10-playthroughs.md](10-playthroughs.md): the evidence, and what play turned up.
11. [11-critique.md](11-critique.md): the second, harder reading; revisions; what remains weak.
12. [friction.md](friction.md): what Kyr and Kyrie could not say, and what would fix it.

Transcripts and screenshots are in [playtest/](playtest/).

## Names

During the build, the library's name check made me rename five people and one kind that collided with other
adventures. The documents use the final names: Ambler (was Ottery), Hild Varley (Askew), Cleeve (Pellow), Ansel
Haverlock (Fenwick), Cuddy Wardle (Pask), Ithel the Smith (Ivo), Aulus (Aurel).

## Open questions for the owner

- **Ysgard is declared in this module** until Mission 18's canon lands (friction 2). Is the Field a region the owner is
  content to see in the canonical Ysgard, beside others' regions? Its customs (the sorting by hour, the Hour, the law of
  the living hand) are written as local to this Field, not as the whole plane's.
- **Who goes to Ysgard.** The work says "warriors of Imbar who die under arms, some of them; nobody knows why some". It
  is a claim about the afterlife of every soldier in every other adventure. I have kept it partial and mysterious on
  purpose, but it is canon-shaped and the owner should rule on it.
- **The Aenean world.** Aulus is "a legionary of a world that is under the sea now". That is consistent with the
  collection's drowned Aenean layer. It is a deliberate light touch, and not a claim about the Aeneans' wars.

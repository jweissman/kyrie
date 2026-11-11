# 10. Scenes, opportunities and what a character perceives

**You will be able to** write a place so that the page shows it as a painted scene, so that what is worth doing
there reaches the player's small foreground, and so that what a character can notice depends on who they are.
Everything here is implemented on `main` (11 November, Mission 20, amendment 6). Where a convention is wished for but
not built, the page says so and points to [opportunities.md](../../architecture/mission-20/opportunities.md).

## How the page reads a place

The page draws no list of commands. It draws the place's **painting**, edge to edge, and over it a panel holding:

- what is told;
- the place's foreground: **two to four opportunities** worth doing now;
- a few quiet touches: Go…, Look…, Wait…, Search.

Everyone and everything else stays reachable: people by their portraits, things under Look…, ways under Go…, the
company's own acts in the Book.

## The scene: which painting

A place is painted by **what kind of place it is**, read from the words of its name and id (`data/paintings/scenery.json`,
read by `src/ui/scene-kinds.ts` and `src/ui/scenery.ts`).

- "the taproom of the Stormy Horn" is a taproom; "the crypt" is a crypt. So name places as what they are.
- A room with only a plain name (a hall, a passage) takes the kind of its site or level, through that kind's `parts`.
- An author's own choice wins: put the place's id under `places` in `scenery.json`.
- Under a roof a place is painted from within (`Place … indoors` or `underground`), never as the country outside.
- A dark room shows its painting barely visible until a light is lit.
- A kind with no painting shows a dim ground, not a wrong picture.

## The foreground: where opportunities come from

The page leads with what it can **justify from the player's own view**. It never invents an action. It ranks
candidates by the reasons they carry (`src/ui/affordances.ts`, `src/ui/promotion.ts`), and you give a candidate its
reason by writing the matching thing:

| You write | The player meets | Its aspect |
|---|---|---|
| `Objective … toward <place or person>` that the player follows | a lead to it: the way there, the person to ask | undertaking (gold) |
| an `Objective` held but not followed | the way to it, as "another aim" | exploration (silver) |
| a way not yet taken in a settlement, or further into a site | "To the nest", "Into the gallery" | exploration (silver) |
| `Change` or `Action` on a thing or a place (its own act) | "Lift the lid off the well" | exploration (silver) |
| a `Thing` with a valuable lying where it can be taken | taking it, after a delve | payoff (green) |
| a `Topic` whose effect gives coin, goods or a thing of worth (`src/ui/owed.ts`) | the person marked, the reply marked "for you" | payoff (green) |
| `Observe … as sign` | something noticed, a closer look | knowledge (blue) |
| a feature not yet looked at closely | "Look at the seal-stone" | knowledge (blue) |
| a band that is a danger, or warns the company off (`temperament`, `Warns`) | the fight, as the company reckons it; the way back | danger (red) |

Aspects are **meaning, not colour**. `src/presentation/aspects.ts` derives them from the reasons above, and the page
draws them with one table (`web/reader/emphasis.ts`), always with a word beside the colour. Gold is kept for the aim
the player follows and nothing else.

The urgent comes first and has no aspect: a danger present, a question put to the company, the dark when the company
can make a light. A need (hunger, hurt, nightfall) is never filler: the foreground has fewer than four entries
rather than a made-up one.

## What a character perceives

The world's facts are one; what a company perceives of them is its own. You have three tools today:

- **`Observe … noticed by <capability>`** shows a line only to a company that has the capability, by calling,
  ancestry, trade or a carried thing. For example, a keep's wolf-sign is noticed by woodcraft:
  ```kyr
  Observe {w}_wolfsign at {w} as sign noticed by woodcraft when able({w}_wolves) "Wolf-sign all round the gate: …".
  ```
  An elf's eye catches smoke inside the broken keep's walls where a human ranger does not
  (`test/perceived-differently.test.ts`).
- **`hidden until <fact>`** and **`Discovery … Found by searching <place>`** keep a thing or a way unknown until it
  is learned or found. Where a hidden way in starts, say that the place would bear searching: a scenario's way in does
  this (`ScenarioWord.sign`), and a closed site that says nothing of how to open it is a dead end.
- **`Observe … teaches <fact>`** is how the company learns what a rule changed. A rule never asserts `knows` silently.
  What the company is told is what it knows.

Not built yet:

- a sign that names its own aspect (danger, knowledge, wonder, gain);
- the wonder aspect itself (violet);
- perception by calling beyond capabilities;
- noticing at a distance;
- an authored opportunity that names several approaches.

These are listed for a later mission in [opportunities.md](../../architecture/mission-20/opportunities.md).

## Keep the promises the page makes

A lead is a promise. Before you finish a place, check:

- **Every mark answers to something.** A marked person has something to say that pays or that the aim asks of
  them. A way led "toward your aim" goes toward it.
- **A closed way says what opens it.** It names what it needs ("climbing, or a coil of rope", "In the dark, the
  great seal-stone is in the way"), or the place says it bears searching.
- **A danger seen is a danger said.** Give a band a temperament, so that it warns and the fight is reckoned before it
  is begun.
- **Nothing is offered that cannot be done.** If the engine refuses a command, the page must not lead with it.

Test what the page leads with, not only what the engine allows (`test/support/glanced.ts`):

```ts
const g = Glanced.of(session);
expect(g.glance.acts.map(a => a.label)).toContain('Lift the lid off the well');
expect(g.glance.acts.find(a => a.label === 'Lift the lid off the well')!.aspects).toContain('exploration');
```

The autoplay laboratory's walkers follow the page, preferring what is worth exploring or the aim followed. Run them
over your country to find loops and dead ends:

```text
bun scripts/autoplay.ts --seeds kahitude --origins debt --classes warrior --policies silver,gold --steps 120 --no-frontier
```

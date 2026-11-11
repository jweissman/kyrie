# Opportunities: meaning, perception, presentation

How amendment 6 and its addendum ([amendment-6.md](amendment-6.md)) are met with the machinery the game already has.
The point is that different characters can see different possibilities in the same world.

## What already exists

**Meaning.** Each place offers its *candidates*: the legal choices the player can see, each with the reasons (`Why`)
it might be worth doing (src/ui/affordances.ts). The reasons are:

- a danger, a warning, a way back;
- what the followed aim names;
- a way further into a site;
- a need: food, mending, a bed, light;
- one of the place's own acts;
- a sign not seen before;
- something to be asked or looked at;
- a buyer for what was won;
- a way not yet taken.

`Promotion.pick` chooses at most three, at most one per subject. A danger may take two, plus the way back.

**Perception.** Every reason is worked out from the player's view, never from the world itself:

- **What the company knows:** `knows`, what it has been told, the aims it holds.
- **What it can see:** light, `noticed`, `seen`, observations of the place.
- **What it can do:** `capable`, the calling's techniques, carried tools.
- **What it reckons:** fights are judged by the company's own reckoning (`DangerSense`), not by the foe's statistics.

Kyr already lets an author say *who* perceives a thing: `Observe … as sign noticed by <capability>`. Thirteen authored
or generated signs use it:

- wolf-sign at a keep's gate and frog-spawn at a cistern door, seen by woodcraft;
- smoke inside a keep and a face at a watchtower slit, seen by perception;
- the Water-Wardens' word on a lintel and the manor's re-used stones, seen by lore;
- a prompter's lapse and a man on a beam in Gosse's play, seen by insight.

A sign perceived becomes a `sign` reason. A ranger and a mage at the same keep therefore already see different
openings without its facts changing.

**Presentation.** The page used gold for any lead, green for what pays, and ember for danger. The meaning of each
colour was implicit in the CSS.

## The model (Phase B)

- **Meaning: aspects.** An opportunity carries the aspects its reasons and marks give it. Each is derived only from
  the player's view.
  - **undertaking:** what the *followed* aim names, or a way toward it.
  - **exploration:** a way not yet taken, a way further in, one of the place's own acts not yet done.
  - **payoff:** a buyer for spoils, a reward owed (`Owed`), something to take.
  - **knowledge:** a sign perceived, something not yet looked at, someone with something to tell.
  - **danger:** a perceived danger, a warning, a fight's own reckoning.
  - **wonder:** reserved; no reason marks it yet (see the gaps below).

  Needs (dark, hunger, hurt, night) and the way back are urgent but have no aspect; they stay neutral.
- **Perception: whose eyes.** Aspects come from the same reading the reasons do. Nothing is styled from the world
  itself, so an unperceived danger or an unnoticed sign gives nothing.
- **Presentation: the atlas.** A small map in the reader turns aspects into gold, silver, green, blue, red and violet.
  Each also gets a non-colour cue (a word or a glyph). The first aspect gives the main emphasis; the others are quiet
  secondary cues. Gold is kept for undertaking alone.

## Gaps to close in a later mission (not now)

1. **A sign carries no aspect of its own.** Wolf-sign is a danger, the Wardens' word is knowledge, a face at a slit
   is both. Today the aspect can only be guessed from the capability or from what the sign's condition names.
   Proposed: `Observe … as sign of danger|knowledge|wonder|gain`.
2. **No wonder.** Nothing marks the uncanny. Region marvels, wards and old powers would carry it if a sign or a thing
   could say so.
3. **Perception by calling, not only by capability.** A cleric's sense of vows, a thief's eye for weak locks and
   hidden wealth: `noticed by` names a capability. Callings that grant no capability for these perceive nothing more.
   Proposed: capabilities that callings grant for this (divination, appraisal) before any new syntax.
4. **Range.** Noticing is only *at* the place (`at`, `near`). Seeing creatures' sign from farther off (a ranger's
   reach) has no contract. Proposed: a map-side "heard of / seen from afar" record for signs, as heard-of places already
   have.
5. **Compound opportunities.** One subject with several approaches (talk, threaten, sneak past, fight) is several
   choices grouped by subject. There is no authored *opportunity* that names its approaches. Proposed: keep grouping by
   subject, and give an authored situation a way to name its approaches if play shows the need.

# M22 Phase 5: a design prospectus

The brief's Phase 5 asks that the larger design program be preserved and ordered: research directions and candidate
experiential pins, not half-built systems. This is that order. Each direction answers the brief's five questions (what
the world knows, what the character perceives, what they can do, what persists, the smallest convincing demonstration)
from what the repository holds on 17 November 2026, and says where it would attach. Nothing here is built by this
document; where a direction has a pin, the pin is a floor to be set at an honest baseline first (mission-21/
experiential-pins.md), never a score to be met with filler.

The ordering principle is the M22 brief's own: the player should feel the controls have almost disappeared, leaving an
inhabited world, a handful of meaningful possibilities and the pleasure of choosing. A direction ranks higher the more
directly it gives the four rows of the menu something worth choosing between, from state the world already holds.

## Priority 1 (next mission): careers from what was done

### Record of Deeds, derived from resolved events

- **The world knows** every resolved act as an event with its actor, object and outcome (the engine's journal; the
  Screen already carries `deeds: {id, title, text}[]`, shown in the Notes' Deeds section).
- **The character perceives** deeds today only as a list in the Book. What is missing is recognition: nothing in the
  world answers a deed (a smith who heard you cleared the cellar, a title used in greeting).
- **They can do** nothing with a deed yet.
- **What persists:** the deed list in the save.
- **Smallest convincing demonstration:** one deed ("cleared the corn-store cellar") read by one person's greeting and
  one price, in a1, pinned headlessly: after the deed, the greeting differs and the price is lower; before, neither.
  Attach at the narration's greeting choice and the trade price rule, reading deeds as facts, never button presses.
- **Pin (differentiation family):** two walks that did different things meet different words from the same person.

### Practice that becomes a career (feats, perks, backgrounds)

- **The world knows** the acts each character took and their outcomes; it does not yet count practice per skill.
- **Smallest convincing demonstration:** one practice counter (locks opened by a thief) that grants one perk at a
  threshold (a quicker pick), told in the Book as "learned by doing", with the count derived from events on load (so a
  save cannot drift from the history). Pinned by a headless walk that opens N locks and finds the perk, and one that
  opens N−1 and does not.
- **Then:** the brief's paragon fantasies as one playable example each over time, in this order because each reuses
  the last: mage mastering evocation (spell use counted), ranger with a mount (a companion that travels), commander
  giving orders (companions' orders already exist: the Commander in mage-play), landholder improving a place (needs a
  place the company owns: not yet modelled), alchemist discovering recipes (recipes exist in the catalogue; discovery
  does not), befriender keeping an animal, knight with an enchanted greatsword (needs item growth).

## Priority 2: instruments of attention that read real state

### The almanac and the sky

- **The world knows** the sign (creation's birth sign; data/imbar/sky.json now draws all twelve as an atlas would) and
  the calendar (the campaign tick keeps the hour, the day and the season). The Parliament of Books' Almanack is a
  person-module that follows a company carrying a copy; it is prose, not an instrument.
- **The character perceives** their own sign at creation and nowhere after.
- **Smallest convincing demonstration:** the night sky in the Book, drawn by the same Observatory from the current
  date and hour (which sign stands overhead), and one authored ability or door that answers it (a celestial door that
  opens only under the Swan; a rite stronger under the caster's own sign). Pinned: the same act on two nights, one
  under its sign and one not, differs, and the Book's sky says why before the act is tried (ruling 1: probability
  legible before consequential choices).

### Books, maps and records as views of one world

- The owner's standing note (books and practices as instruments): bestiary progress, law books, a cleric's practice.
  The Book today is four tabs (Character, Notes, Pack, Story); the map is the one instrument that is truly a view of
  authoritative state.
- **Smallest convincing demonstration:** the bestiary as an instrument: each creature's entry grows by what the
  company has seen and fought (events), and an entry read before a fight changes the fight's offered acts (a weakness
  known is an act offered). Pinned headlessly.

## Priority 3: space and presence

### The middle scale inside a hex

- The owner's standing note (middle scale in a hex): a local landscape inside a hex, a gallery instrument, one
  geography at many resolutions. Today a hex is a card on the map (WorldStage.Hex) and a place is a painting with a
  telling; there is nothing between the board and the room.
- **Smallest convincing demonstration:** one hex of a1 drawn as a topological sketch (its paths and three points of
  interest, from the land model's cells and the places that stand in them: LandModel.stands), walked by the same menu
  of four, with approach told as distance closing ("the smoke is nearer"). No 3D. Pinned: every point drawn is
  reachable by an act, and every act's destination is drawn.
- **Ground-level walking** stays a research direction until the topological sketch exists and is liked.

## Priority 4: dramatic topology, fate, divination (research)

- **The world knows** actors, obligations (debts, aims, undertakings), adversaries and pressures as facts and
  relations; no derived graph of them exists.
- **Smallest convincing demonstration (before any tarot):** a derived "who wants what of whom" graph for one town,
  computed from facts, printed by the CLI, and checked by hand against the town's prose. Only if that reads true does a
  reading (a fortune-teller's three cards) become worth building, and then only as a partial view of that graph that
  conditions real possibilities (an obligation revealed is an act offered), never a script.

## Priority 5: the larger world and its genres (pressure tests)

Cities, institutions, deep mines, extraordinary geography, seas and voyages, strange cultures, planes, artifacts,
ordinary professions, other genres: each is a pressure test of the engine and Kyr, not a feature list. M22 advanced
three of them in executable form: early dungeons with a reasoning puzzle and a treasury behind a cued secret (sites
commission, mission-22/sites/), the planes' laws and Plane Shift with an honest unsupported list (srd-proving-cases.md),
and an authored item kind with a use effect (OB-07). The next pressure tests, in order of what they would teach the
engine: a sea voyage (travel over water that is not a road; the routes work of OR-35 treats water only as an
obstruction), an institution with offices (a guild whose ranks are facts the menu answers), an ordinary profession
held for a season (time, wages, practice: joins Priority 1).

## Carried from M22's own work (engineering, not research)

- **A place drawn by PageFrame** (OR-38): the title, a life's steps, the opening, a conversation and a fight are; a
  place is not, because its narrative and menu are one component (GlanceStage). Parting them is the next structural
  step, after which the census can require every menu to be a PageFrame slot.
- **The rest of US-07**: the aim's lead record is built and read by AimRoute; AimLeads, Stakes and the walk measures
  are to read it next.
- **The 57 unverified register rows**: mostly experience rows that need a play or a measure, not a grep.

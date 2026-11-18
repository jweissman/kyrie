# Trust contracts: investigation and state

The owner's commission (18 November, late) is kept verbatim in trust-contracts-brief.md; its follow-up the same night
asks that a false Atlas indicator be **unconstructible**, not merely tested against. This file says what was found,
what is built, and what each contract's pin is.

## 1. What was found

### Gold that vanishes at its destination (priority 1)

Measured by `bun scripts/gold-continuity.ts` (a player who follows an aim and takes only its gold, through the
runner, every turn): nine walks over a1 (order, debt, wanderer), b2 (courier), c3 (wanderer), iscoed (human warrior,
elf mage), kite (order) and thorn, 60 turns each, 106 gold acts taken. Three distinct lapses, each the same cause:

| Walk | Gold taken | Came to | The lead there | What the four held |
|---|---|---|---|---|
| a1, debt | Set out for Ironkeep | Ironkeep's mouth | here → Ironkeep | "Into the gate-passage", as exploration only |
| b2, courier | To the counting-room | the counting-room | barred → the iron door | nothing that acts on the door |
| iscoed (both) | Search here | the gate-well | here → the gate-well | nothing: searched, the pawl not found |

**The common cause.** Gold and the lead are reckoned apart. Gold is a promoted act's undertaking aspect, from its
reasons (advance, named, toward, about…: the route planner's reading of what the aim names, Glance.reading); the
lead (AimLeading: the resolved objective-target machinery, Stakes.target) says what the step is. They agree on the
road and part where the step is not a thing the planner names: the inside of a site the aim names as a whole, a bar
with nothing to do to it, a place whose search found nothing. There the lead still names a step and nothing carries
gold, and nothing says why.

### False or stale pips (priority 2)

Every rail pip, row pip, likeness pip and map mark is drawn by `Pip.View({ fill })` or ChoiceRow's `mark` string: a
colour chosen by the page. 38 places in web/reader pick a tone (`Pip.tone(aspects)`, `var(--tone-…)` strings); the
aspects they read are the glance's, but nothing makes them, and the page could draw any colour. OR-73 (17 November)
derived the rail's pips from the drawer's rows; that held by care, not by construction. The map's way back ("Put away
the map") drew no pip at all, whatever the place held; the Book's unread pip was blue or violet, an Atlas tone for what
is no opportunity.

## 2. The architecture: an indicator needs a witness

`src/presentation/attest.ts`:

- **Witness**: issued only by `Attest.index(glance)`, from what the glance projected for this world, place,
  knowledge and aim followed: an act it leads with or a lens holds (direct), an act inside an opener (direct), a
  likeness (direct), a way or journey the followed aim goes by (directional, gold), something perceived off along a
  way (directional, its distance kept). Its type is branded: nothing else makes one.
- **Attested**: an indicator, made only by `Attest.of(witnesses)` or `Attest.join(indicators)`: its tone by
  Indicator's one precedence, its words, faint where all it stands on is perceived afar, and its witnesses kept.
  No witness, no indicator.
- **Renderer**: `Pip.View` and `ChoiceRow` take an `Attested`, never a colour. A row that is no opportunity says
  which plain kind it is (neutral, chosen, a fight's blow, the title's): a fixed set, none of them an Atlas tone.
- **Cache**: the index is kept for each glance object, and a glance is drawn again whenever the world (a new World
  object), what the company knows, or the aim followed changes; so a witness is never older than the state it reads.
- **Diagnosis**: `Attest.why(glance, id)` says why an id has no indicator.

## 3. The contracts and their pins

To be filled as each lands: indicator soundness, freshness, lens inheritance, return inheritance, gold continuity,
travel continuity, knowledge integrity, restoration; each with a counterexample that fails it.

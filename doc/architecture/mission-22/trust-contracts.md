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
- **Renderer**: `Pip.View` and `ChoiceRow` take an `Attested`, never a colour; every rail mark, row, likeness, map
  mark and menu row, the things at hand and the talk's replies, draw from one (the 38 places that chose a tone did). A row that is no opportunity says
  which plain kind it is (neutral, chosen, a fight's blow, the title's): a fixed set, none of them an Atlas tone.
- **Cache**: the index is kept for each glance object, and a glance is drawn again whenever the world (a new World
  object), what the company knows, or the aim followed changes; so a witness is never older than the state it reads.
- **Diagnosis**: `Attest.why(glance, id)` says why an id has no indicator.

## 3. The contracts and their pins

| Contract | State | Pin | Its counterexample (fails the pin) |
|---|---|---|---|
| **Indicator soundness**: no pip without a witness | built, by construction | test/small/indicator-witness (structural: no Atlas tone written outside the indicator's own drawing, the legend, and what an indicator already says; the brand cast nowhere but `attest.ts`; Pip and ChoiceRow take an `Attested`); test/small/witnessed (behaviour) | `<Pip.View fill="var(--tone-gold)">`, `mark="var(--tone-gold)"` (the "your aim" row had been gold for any act the place led with), a likeness pip composed from acts (PL-32), a reply drawn from a snapshot |
| **Indicator freshness**: pips follow the state | built | test/small/witnessed ("goes the moment its opportunity does"); the index is kept per glance object, which is drawn again on every change of world, knowledge or aim | the talk page's replies drawn from `s.turned`, the glance as it was when the talk was turned to (removed) |
| **Lens inheritance**: a control's pip is its rows' | built | test/marks-borne (the drove road, every act: Go and Look against their drawers); SceneRail.go/look are `Attest.of` over the witnesses of the very rows the drawers draw (Wayfinder.bears, AtHand.bears) | a rail tone from the promoted lens instead of the rows shown (OR-73) |
| **Return inheritance**: the way back carries the place | built | test/small/witnessed ("carried back from a view"): `Attest.local`, the map's way back and "Put away the map" both read it | "Put away the map" blank beside a place with something to do; its red chosen by the page's own reading of danger |
| **Gold continuity** | built | test/small/aim-continuity; `scripts/gold-continuity.ts` over nine walks (0 lapses) | a1's debt gold gone out at Ironkeep's gate; b2's at the strongroom door; iscoed's in the gate-well |
| **Travel continuity** | to do (priority 4) | | |
| **Knowledge integrity** | partly: a witness is issued only from the glance, which reads what the company knows and perceives | (to write: a lens or the map revealing a place or act the company does not know) | |
| **Restoration** | to do | | |

### The Book and Gather Your Thoughts (D): a recommendation

- The Book is a record, not an opportunity. Its unread mark is now a count in ivory (test/small/book-unread), never an
  Atlas tone. Recommendation: move it off the action rail to a reference place of its own (beside the map's mark, or
  the page's corner), so the rail holds only lenses on what can be done now.
- **Gather your thoughts** fits as a lens over the company's own acts that take no place: preparing spells, studying,
  recalling what it knows of a thing, and deductions. A deduction must be an authored or systemic inference over facts
  the company knows (Kyr already has `teaches` and rules that assert knowledge when facts hold); the lens would show
  only those whose premises are known and whose conclusion is not, each witnessed like any act. Nothing is created by
  pressing it. Recommendation: no implementation until the rail is settled; the Time lens (`glance.lenses.time`) is
  where the company's own acts already gather, and it is the natural seed.

# The Third Night — what Kyrie can do, and the plan

*Stage 3. Written after reading the engine for this purpose: the grammar (`src/lang/Kyr.ohm`), the shared rules
(`data/rules`), the authoring guide, the placement code (`src/world/frontier.ts`, `src/world/countries.ts`), checks
(`src/rules/checks.ts`), burden (`src/rules/burden.ts`), and the two most recent modules (What Tessary Owes, Low Water)
with their tests. Each design element is mapped to a mechanism and marked **direct** (Kyr says it today), **work-round**
(sayable, with machinery the author builds), or **extension** (needs a general change).*

## 1. The module and its two entrances

- **One module, `wrayford`**, in about fifteen files by subject. Every id is namespaced `wrayford__…`.
- **The homecoming** is the standalone campaign `data/campaigns/the-third-night.campaign.json`, whose bundle includes
  `company.kyr`: a company of one, Wat Pardoe's elder child, coming down the drove road at eight in the morning, with
  `kin(party, maudie)`, `kin(party, kit)` and `homecomer(party)`. **Direct.**
- **The traveller** is `placed.json`: the same files with `placed.kyr` in place of `company.kyr`, which declares only
  `Entity party: group "Your company".` The company is the world's own. `homecomer` is never asserted, so every line
  written for kin is gated on it, and the stranger's version is written beside it. **Direct.**
- **Placement**: `data/adventures/countries.json` gains Wrayford: east of a first country of forest, mountain, frost or
  desert, not among the independent adventures (so it is always held where it fits and no other world's choice is
  reshuffled). The innkeeper's rumour: three hang on Wrayford bridge. Entry export: the drove road at Northgate.
  **Direct.** It shares the east with Thrume (independent, earlier in the list): a mountain world whose seed chose
  Thrume holds Thrume there instead. That is the list's rule, and fine.
- **The clock** runs from arrival in both entrances (a placed country's watches are shifted by its installation, per
  the guide). The module counts its own dawns, so "day 3" means the third day since the company came, whatever the
  calendar says. **Work-round**, the one Tessary used (W6).

## 2. The city

| Element | Mechanism | Status |
|---|---|---|
| Six districts and the bridge | `Place … is settlement` (Wrayford) holding sites and buildings; rooms on grids per area; Overbridge a second settlement-area across the bridge | direct |
| Bridge Street on the arches, with the drawbridge | Rooms within a site `the_bridge`; the drawbridge a `Thing` on its passage with states (down, raised at night for the barges) | direct |
| The city's hours | `Rule`s on `hour(clock)` moving people (`Retract at`/`Assert at`) and `Observe … when hour(clock) …` | direct |
| The crowd at the gatehouse, growing and changing temper | A measure `crowd(wray)` and a measure `temper(wray)`; observations by band | direct |
| Dorcas and Corbin's dusk quarrel | An `Event`-like rule each dusk, anchored where it can be heard (both banks) | direct |
| News that reaches the company only in the city | Rules carry `and inWrayford()` (Tessary W1) | work-round |
| A place told briefly on return | `visitedBefore` relations (Tessary W2) | work-round |

## 3. The dead, and getting them down

| Element | Mechanism | Status |
|---|---|---|
| Three dead on the rail | Three items of local kinds (`Kind wat_dead "…" weighing 24`), `in` a `Thing` `the rail` that `Holds` and is `closed` while they hang | direct |
| The decree | A notice `Source` on the gatehouse door; a `Grave` action to cut them down ("whoever touches them shall hang beside them") | direct |
| Gault's watch, who see or do not | Persons at the gatehouse; `asleep(watch)` by rule at the dead hour of the night; `perceives(watch, party)` decides an arrest | direct (sleep and perception are in the shared rules now) |
| Climbing to the rail from the starling ledge | A passage `needing climbing or rope` | direct |
| The stair, by the gate-ward's key | `Item … owned by` and a `needing` key | direct |
| Lowering into Dorcas's boat under the rail | An action at the rail requiring the boat below (a fact set by Dorcas's agreement and the hour) | direct |
| Carrying a body | The body is an item; its weight makes the carrier laden (half pace); two bodies make anyone laden | direct, coarse: two people cannot share one weight (ledger) |
| The ford by night | A `ford` passage `opening when` low water and a `Thing` hazard that strikes without woodcraft or Ham's beasts | direct |
| The butcher's cart | An action that puts a body *in* the cart (a `Thing` that `Holds`), and a rule that moves the cart across at the hour it goes, with whatever is in it | direct |
| Graves | A `Thing` `the graves in Wade's Acre` with states (none, dug); Corbin's dig is a rule after his agreement; the company's own is a `Change needing digging` or a long action needing a spade | direct |
| Burial | An action per body, at the Acre, with the body carried and graves dug; a cleric's words (`rites`) as an extra that the Abbess hears of | direct |

## 4. People and conversation

| Element | Mechanism | Status |
|---|---|---|
| People with their own greetings and words | `Person` with `Greets`, `Manner`, `Pronouns`, `Objects` | direct |
| Topics that change with what has happened | `Topic … when …`, `once`, `On discuss { … }` | direct |
| **A question put to the player** (the reeve's *What would you have me do?*) | A topic that asserts `asked(…)`, and two or three answer topics gated on it | work-round (Low Water friction 5) |
| Minds moved by people, not exhibits | Measures of regard (`trust(jennet)`) moved by acts (ice brought, the vigil sat, Kit brought), read by `Says` variants; no meter shown | direct |
| Confession as the confessor's choice | Kit confesses only when `trust(kit) >= 2` *and* the asker is the one he trusts; the evidence alone does not unlock it | direct |
| Kit as kin who joins | `kin(party, kit)` and `willing(kit, party)`, then the standard `recruit`; a stranger can ask him along only after trust | direct |
| Bramble following | `acceptsEscort(bramble, party)`, `following` by the standard `lead`; once fed and coaxed | direct |
| Who someone is now (Jennet's role after the funeral) | Roles fixed; changes go in observations and greetings (Tessary W20) | work-round |
| A mourning house where generated greetings ring wrong | Every person in the Pardoe and Hobday houses gets their own `Greets` | work-round; candidate extension: a register the voice tables read |

## 5. The satire's games

| Element | Mechanism | Status |
|---|---|---|
| The toll schedule | The board as a `Source`; Pinch's rulings as topics, one per category, each asserting its ruling; a fact for each category the player has grounds for (a pilgrim's token, the Abbess's claim) | direct |
| The Remonstrance's phrasing | At the meeting (noon, day 2, a window of hours), clauses as actions; each alderman's objection a rule; the clause that "costs nothing" passes | direct |
| The portrait | A `Thing` with states (unfinished, true, flattering, banner, burned); changes need the painter's agreement or a member with paint; Gidley's visit a timed rule | direct |
| The broadside | A `Thing` (the forme) whose states are what is set in it; the player chooses the text; Quoin prints at a price; posters appear across the city (observations by state) | direct |
| The ring and the pawnshop | Items, a pawn-ticket, a price | direct |

## 6. The powers and the endings

| Element | Mechanism | Status |
|---|---|---|
| The reeve's stance | A measure `moved(hulme)` moved by Jennet, Hal, shame, Kit; release by rule when it reaches its mark before the captain comes | direct |
| Kit's night | Rules at midnight on night 2 moving Kit and the young carters to the counting-house unless stopped; Gault there | direct |
| The captain | A person who arrives at dusk on day 3; her verdict a rule at dawn on day 4 reading what the city shows | direct |
| Maudie's third night | A rule at 2 a.m. after the third dusk: she goes if the dead are still on the rail | direct |
| Endings that close the book alone and a chapter in a world | `Ending … when …` (chapters handled by the engine since Tessary) | direct |
| Experience for what is resolved | `Milestone … worth … when …` | direct |
| The city after | Observations gated on the ending's facts (Tessary's `aftermath.kyr`) | direct |

## 7. What I will not build, and why

- **A general promise construct, a belief-as-distinct-from-knowledge system, conditional passages beyond `opening when`.**
  Each is a large general change; the design does not need them, and building them for one adventure is the narrow
  special case the commission warns against.
- **A shared catalogue entry.** Every kind and species is the module's own (`Kind`, `Species … like …`).

## 8. Extensions to consider, only if play shows the need

1. **A register for voice lines** (mourning, festival): a relation a place or person is in, read by the voice
   context, so that the voice tables do not greet a widow with "A traveller! Sit, sit". General; small.
2. **A question with answers** (G1 in the survey): answer topics shown under the question that raised them. General;
   presentation-heavy.

## 9. Tests and evidence, planned

- `test/the-third-night.test.ts`: lint; the default (nothing done); each ending; each small adventure's alternatives;
  the two principal approaches; builds (a warrior, a thief, a cleric, a commoner with no charisma); persistence (kept and
  resumed, replayed twice); the traveller entering from a generated world by its fiction.
- `test/the-third-night-wander.test.ts`: seeded random offered-action play with invariants.
- `scripts/third-night-transcripts.ts`: journeys written out as the page tells them, into
  `doc/adventures/the-third-night/playtest/`.

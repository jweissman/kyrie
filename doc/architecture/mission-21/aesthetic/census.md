# Census: every surface where a player acts in the world (CN-04, 14 November)

Read from the reader's component tree on `m21-look` after merging main 30b3208d. The owner, 14 November: "Conduct a
concrete census of every place the player can issue a world action … Replace these with the shared highlighted action
system or intentionally designed variants built from the same semantic and visual primitives … fictional actions
should not look like links in a web document."

## The one action system

- **The act atom is `Act.View`** (`web/reader/stage/act.tsx`), and every engine choice drawn anywhere goes through it.
  It now does two things wherever it is used:
  - it draws the act as a **row** (`ChoiceRow`'s look: one indicator, the words in sentence case, a quiet line, the
    key; `menu.css`);
  - it carries the system's **mark**, `data-act` (the act's id), beside `data-choice` and its key.
- **One variant, the glyph.** A likeness, a rail mark, a thing in the pack, a ware on a counter: these keep their own
  picture and carry the same mark.
- **`ChoiceRow.Button`** is the same row for an act that is not an engine choice of the menu (a fight's move, a road
  answer, what pulls next). It takes `act` for the mark.
- **`Act.List`** is a column of rows, never a flow of words.
- **Links** stay only for application navigation: the encyclopedia entry of a thing or an item, the title's and the
  options' ways out of the game.
- **Held by `test/action-system.test.ts`** (fast, about 0.5 s):
  - the atom as rendered carries the mark and the row (or glyph);
  - a TypeScript walk of every reader page finds no element that does a world act without `data-act`, and no act
    drawn as an `<a>`.
- **Mutation-checked**, three ways: the atom without the mark, Go's button without it, and a link given a choice. Each
  makes the spec fail.

Columns:
- **Contract:** where the act's meaning comes from. "Engine" means the choice and its id, availability, targets and
  aspects come from the menu the engine builds (`MenuModel`, the glance, `PlayerView`). "View" means the page decides
  something the engine should.
- **Now:** this branch.

## The census

| Surface | Component | Before | Now | Contract | Fix still owed |
|---|---|---|---|---|---|
| Resting scene: the promoted four | `GlanceStage.Acts` → `ChoiceRow.Act` | row (step 1) | row + `data-act`; with a lens on, the lens's own four (`Glance.lenses[lens].promoted`), the place's own touches kept | engine (the glance's `Promoted`, `Lens`) | — |
| Resting scene: a notice not read, what is yours | `GlanceStage.Resting` → `ChoiceRow.Act` | row (step 1) | row + mark | engine | — |
| Resting scene: the way back ("Back: …"), the one way on ("To the old corn-store…") | `Act.View quiet` | **link-like capitals text** | row | engine (`glance.back`, the one way) | the way out to come from `Compass.out` inside an enclosure: CN-02/03 |
| Resting scene: Search | `Act.View` glyph (rail and opener) | icon | glyph + mark | engine | — |
| Resting scene: "X, on the map" (the aim's place) | button `aim-map` | quiet word | quiet word (navigation: opens the map) | view | outside only once `enclosed` lands: CN-02 |
| The rail: Talk, Go, Look, Wait; Map, Book | `SceneRail` marks | icons | icons (attention and navigation, not acts) | view | lenses in the scene: CN-01/05; Map yields the compass inside: CN-02/03 |
| Who is here (likenesses) | `WorldStage.Portrait` | button `.act.portrait` | glyph + mark | engine (talk/look choice) | the pink pip: CN-07 |
| Lens tiles over the painting (Go's ways, Look's things) | `Lenses.Strip` | chip buttons; a way's tile goes at a touch | removed from the scene: the lens is the column's own (CN-01) | — | — |
| Go… (explorer, wayfinder) | `Wayfinder` rows `wf-row`, `wf-go` | **a page over the scene** | the places lens in the scene (`GlanceStage.Lens`): its four, its rest unfolded beneath (walks about the town among them); the explorer only in the split scene | engine (`Lens`) | the compass inside an enclosure: CN-03 |
| Look… (things at hand) | `AtHand` (`ah-row` selects, `ah-pane` acts via `Act.View`) | **a page over the scene** | the things lens in the scene: its four, its rest unfolded under each thing's name; what is on a way (a tripwire, a door's words) from `AtHand.onWays` until the contract holds it | engine (`Lens`); stopgap `AtHand.onWays` | things on a way into the lens contract (asked) |
| A thing's own page | `ThingStage` (`Act.View`, `Act.List`) | old `.act` buttons | rows | engine | — |
| Wait… | `Pastime` (`pt-length` `Act.View`, `Act.List`) | **old buttons in a page** | the time lens in the scene: each waiting act a row, unfolded when none is promoted; what the company does of itself under "Yourself" until the contract holds it | engine (`Lens` time); stopgap `Pastime.also` | the company's own acts into the time lens's rest (ruled; asked) |
| Talk: questions, leave, Trade | `TalkStage.Reply`, `ChoiceRow` | rows (step 1) | rows + mark | engine (`Talk`, `TalkFocus`) | — |
| Talk: wares on a counter | `Act.View` ware | tile | glyph + mark | engine (`Wares`) | — |
| Talk: Follow this (an aim told) | button `follow-aim` | quiet word | quiet word (following is not an act in the world: it takes no time) | engine (aim id) | — |
| The road's meeting (the opening) | `PrologueStage` answers | **old `.act` buttons with a `kbd`** | rows (`ChoiceRow.Button`, its number) + mark | engine (`Prologue.meeting`) | — |
| What pulls next, after an aim is seen through | `NextPull` | **link-like button in the prose** | row + mark | engine (`Succession`) | — |
| A name in the telling | `Act.Inline` | link-like word in the prose | removed (it had no callers) | — | — |
| A sight told on arriving (Set out / On the map) | `Panorama.View` | `.act set-out` button | marked (see below) | engine (the journey) | — |
| Pack: a thing's acts | `PackGrid.Chosen` (`Act.List`) | old buttons | rows | engine | — |
| Pack: the tiles | `PackGrid.Tile` | tiles (select; with acts, `Act.View`) | glyph + mark where it acts | engine | — |
| Character / Company page | `CharacterPage` (`Act.View`, `Act.List`) | old buttons | rows | engine | — |
| A place in the split scene (`?scene=split`, `here-pane`, `more-pane`) | `PlaceStage` | old buttons | rows | engine | legacy composition, kept behind its flag |
| The fight: Attack, kinds, a kind's moves | `FightMoves` (`ChoiceRow.Button`) | rows that flowed into a horizontal row; a kind's moves appended under the hand | the hand's menu, a column of rows; a kind opens into the details region beside it (CN-06) | engine (sections) | — |
| The fight: a target on the field | `FightStage.Card` `pick` | gold ring, a chance line added to the card (it grew) | a reticle (an outline, no room taken), the chance pinned over the card's corner; marked | engine (the move's targets) | — |
| The fight: Let … fight this turn, Press on | `ChoiceRow.Act` from the `pace` section (quiet rows at the menu's foot) | **old option buttons beside the rows** | rows of the one menu, quieter, with their act's mark | engine (`ChoiceList.pace`: `fight:auto`, and `fight:through` when as good as won) | — |
| The fight: the fight so far | quiet word in the fight's head | an option bar across the foot | a quiet word (a view of the fight, not an act) | view | — |
| The map: Set out, Enter, Travel, the way in, Go on to | `RouteCard`, `WorldStage.Hex` | option/enter buttons | marked | engine (`MapView.way`) | enclosed: no map inside (CN-02) |
| A town's plan | `TownPlanView` (SVG) | clickable shapes | marked | engine | — |
| Creation | `creation/*` cards | a deck | unchanged (choosing who you are, not an act in the world) | engine (creation rules) | — |

## What the census found that the contract lacks

These go to the playability line rather than being inferred in the page.

1. **The fight's "Let … fight this turn" and "Press on to the end"** had been `app.auto` and `app.through`, with no
   act id. Answered by the contract (`ChoiceList.pace`); drawn as the hand's quiet rows since.
2. **The lens's ordering of ways and things** (`Lenses.Strip`, `Attention`, `Wayfinder` groups) is the page's own
   sorting, by tone and by what is idle. `Lens` replaces it (CN-01).
3. **The way back and the one way on** are the glance's (`back`, the one way). Inside an enclosure they should become
   `Compass.out` and `Compass.next` (CN-02/03).

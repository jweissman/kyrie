# The Grand Tour: authoring friction

*Where Kyr, Deem, the engine and the page resisted this adventure, by severity, with what was done and what would
remove the need. Two engine-side changes were made, both general (the province's notice and after-word through the
march's telling; `play --as` and `--probe @relation` for campaigns: `02-adaptation.md`, `11-changes.md`); everything
else below was worked round in the module. Numbers are referred to from the other documents.*

## Severe: silent, and wrong in play

**1. A placed module's timers and the shared timers keep different clocks.** `ClockShift` rewrites every read of
`watch(clock)` in a placed module to the module's own watch, counted from the first morning after it is reached.
`core.kyr`'s `grant_ends` is shared and reads the world's. So `Set grantedUntil(party, breath) to watch(clock) + 6`,
which is exactly what `core.kyr`'s own comment tells an author to write, writes a small number into a shared measure
that the shared rule compares with a large one: the grant ends in the pass it is given. In a campaign the clocks agree
and nothing shows; in a generated world the Whelm could not be entered by any kiss of the merfolk's. Found only by
playing the Undertow in the `kite` world. *Worked round:* the module times breath in its own measure (`breathUntil`)
and ends the grant itself, leaving `grantedUntil` at 0 (held). *Remedy:* a write of the watch into a measure the
module does not own should be in the world's time (and a read of such a measure against the watch likewise); or
`ClockShift` should shift `grantedUntil` writes; or lint should warn when a placed module sets a canonical measure
from `watch(clock)`.

**2. An event whose effects move the thing it is near is never told.** `LocalObservations.perceives` is asked after
the rule's effects are applied (`CampaignTick.fire`). An `Event … near quance` whose `then` moves her to the Nexus is
not heard by the company standing beside her; and an event near her in the pass in which her schedule moves her (the
Rector given the fourth petal as the clock strikes seven and the Lanterns take her to the Promenade) is lost too.
*Worked round:* the climb is an event that only marks her, and a rule moves her a watch later. *Remedy:* decide what
is perceived from the world before the effects, as a witness would.

**3. A companion's death cannot be seen by a rule in the obvious way.** `dead(fabian)` holds the moment he joins (his
own body has gone into the company). When a member is slain he leaves the company: `joinedAs` is retracted and
`memberOf(member, fabian)` asserted, so `joinedAs(?m, fabian) and slain(?m)` never holds. *Worked round:* `fabian_falls`
reads `joinedAs or memberOf`. Not exercised in play: no journey got Fabian killed. *Remedy:* a `lost(recruit)`
relation the engine writes when a recruit dies with the company.

**4. Same-pass ordering is declaration order, and endings are first-match.** The Rector's routine to the Promenade is
in `collegium.kyr`, before the petal events; First Through was declared after the Second Whelming and so an accomplice
whose hill crushed the Whelm got the Whelm's ending. *Worked round:* reordered endings; events moved by a watch.
*Remedy:* a lint note when two endings can hold together, naming which wins.

**5. A promise's kept-line fires wherever the company is.** "Somewhere under the bay a young man who is officially
dead goes on being so, as he asked" was told the minute the Door opened, and in one journey minutes before the hill
came down on him. *Worked round:* kept only on the closing day and while he lives. *Remedy:* promise lines held for
the closing news, or anchored.

## Serious: forced a workaround that costs clarity

**6. No conditional text.** `ObservationText` is "deliberately not a narration language". Cloudgate by day and by
night, aloft and fallen, needed a pair of observations for every place (`aloft()`, `dark()`), and an action's
`Result` cannot vary at all: the basket's ride up said "into the sun… the middle of a fine afternoon" at ten at night.
*Worked round:* time-neutral Results, the light moved into gated observations. *Remedy:* a `Result … when …` second
form, as Roles have.

**7. A Thing's `Change` has no condition.** `Change pick … needing lockwork` is offered with the footman standing over
the escritoire. *Worked round:* an `Action pick_escritoire` requiring the drawing room empty. *Remedy:* `Change …
when <predicate>`.

**8. A guard's or a thing's state is told from both ends of the way.** "The Doorwarden keeps the Fire Door… from his
desk" on the far side of the Fire; the Halyards' bar "lies across the arch" when you are past it on nothing. *Worked
round:* words true from either side. *Remedy:* a state line `from <place>`, or the near end only.

**9. An item cannot grant a module's capability.** `granting` takes skills; `breath` and `heatproof` are the module's.
*Worked round:* rules on `holding` (`helm_breath`, `cloak_proof`). Consequence: a capability is the company's, so one
helm breathes for the company and its companions.

**10. Followers are not carried by an action that moves the company.** The basket, the cage and the laundry put the
company somewhere; Mercy in her butt and Imogen on your arm stayed behind. *Worked round:* `followers_keep_up` in
`clock.kyr`. Topics marked `travelling` need `travelsWith`, not `following`.

**11. `within` holds of things in places, not of places.** `within(nexus, sennet_town)` is false; a destination check
for the Doorward's door had to drop it.

**12. The engine speaks for people who join or leave unless told not to.** Ha'penny in a fish-basket said "'Why not.
It's not as if anything is keeping me here'"; so did the Dowager after the most important speech of her life. Nothing
warns an author that `Joins`/`Leaves` are wanted. *Remedy:* a lint advice for a person who can be `following` with no
`Joins`.

**13. The world forgets where a protagonist has stood.** `been_there` records places stood in after Sennet is
installed and the gate itself, but not the starting green nor the rooms a road journey passes. The Doorward's door,
which opens "on anywhere you have stood", therefore learns the world only from Sennet on. *Remedy:* seed `been` with
the start and the legs walked.

**14. Ids share one namespace.** An ending, an item and a relation cannot share a name (`made_petal`, `accomplice`);
every ending is `end_…`; `lodging` and `shut` were taken by the shared rules.

## Minor

15. A rule cannot `Assert knows`; it must `teach` (fine, once known).
16. Capabilities used in `needing` must be declared before the passage (`Entity breath` moved to `clock.kyr`).
17. Observation shortening on revisit cut a sixth-edition line mid-sentence; the Handbook's lines are first-visit only.
18. A departure line chosen for leaving a settlement ("the dew still on the grass") is told for climbing an anchor
    chain into the sky.
19. A companion can be the one who pays: "Chert pays Mr. Pargeter, and takes an empty wind-jar."
20. The journey driver's `=day D` is the world's day; a placed module's day 1 is a later one, so a fixture written for
    the campaign needs its days shifted in a world (the placed test does it).
21. The lint's two dozen advisories ("a Role true wherever they are") are right in letter and mostly noise for a city
    whose people keep schedules.

## Deem

No Deem tables were written for Sennet: its people are Kyr persons with ancestry, calling and level, and its things
are Kyr kinds. Two readings of the catalog cost time: only human, elf and dwarf are playable ancestries (the burglar's
journey is an elf's because a halfling cannot be played), and background ids are the Orsino list (`laborer`, `burglar`,
`acolyte`), not words an author would guess (`pilgrim` is not one).

## The page

- The choices list, with `--choices`, is dominated by the pack: every item's *Give to › each companion* and *Set down*
  is a line, so a company with two companions and twelve things shows over seventy lines before the first door.
- Long labels are the work's style ("Tell No Admittance that Cloudgate is coming down on the Whelm, and the merfolk must
  go home through the Water Door"); they read well, and they will wrap on a phone.
- "Here are A, B; C, D; and E, F" lists of everyone present, with their roles, recur on every return to the
  Promenade; a city with schedules makes them long.

## What Kyr made easy

Schedules (a rule per hour per person) are cheap and legible; `Occasion` with `Matter` gave the funeral and the Night
of Lanterns their running order for nothing; `Discovery` with `hidden until` made the keel ladder and the air-bell
secrets that are real ways; `Promise` gave Fabian's and Perrin's promises their own lines; `Grave` asks before the
keel and the engine, which is exactly the hesitation those moments want.

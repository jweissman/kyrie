# Authorability mismatch ledger: The House That Grows

22 October 2026, at `70a81b9`. Each entry comes from writing [the adventure](../../../data/adventures/house-that-grows)
against the sourcebook in [fidelity.md](fidelity.md). The cases are reproducible from:

- the journeys in [`test/house-that-grows.test.ts`](../../../test/house-that-grows.test.ts) (17, all passing);
- the minimal fixtures in [`test/fixtures/probes`](../../../test/fixtures/probes), pinned by
  [`test/authorability-probes.test.ts`](../../../test/authorability-probes.test.ts) (12, all passing).

Entries tagged `K1`–`K11` have a probe test that asserts today's behaviour. When the behaviour changes, rewrite that
test.

Severity is in four steps: **blocking** (the fiction cannot work as written), **severe** (it works only through
machinery that hides it), **moderate**, and **minor**. Within a severity, entries are ordered by how many future
adventures will hit them.

Each entry is tagged with what kind of gap it is:

- *missing*: the capability does not exist;
- *hidden*: it exists but is hard to find;
- *defect*: it exists and behaves wrongly;
- *frontend*: the world is right and the reader presents it badly.

## Contents

| # | Finding | Severity | Kind |
|---|---|---|---|
| 1 | An adventure's own objects and creatures must go into the shared catalogs | blocking | missing |
| 2 | Nobody can be incapacitated outside a fight | blocking | defect, missing |
| 3 | Nothing weighs anything | blocking (here) | missing |
| 4 | Perception is not a fact rules can read | severe | missing |
| 5 | A passage cannot say how it is crossed, or where it leads, under conditions | severe | missing |
| 6 | Companions: hireling or shadow, nothing between | severe | defect, missing |
| 7 | Ownership ignores whether the owner can see, and who the taker is | severe | defect |
| 8 | One die for the whole world, and no arithmetic at run time | severe | missing |
| 9 | Ten minutes is the smallest act | severe | missing |
| 10 | Order is meaning, and it is invisible | severe | hidden |
| 11 | The reader merges, misplaces and unnames what the module made distinct | severe | frontend |
| 12 | Errors that come at run time, or with no place | moderate | defect |
| 13 | A species' temper overrides `Peaceable` | moderate | defect |
| 14 | People and things are fixed at load: roles, topics, populations | moderate | missing |
| 15 | A phenomenon that travels with an object needs an observation per object | moderate | missing |
| 16 | A law cannot be shared between modules | moderate | missing |
| 17 | A person cannot be hidden, or seen only by some | moderate | missing |
| 18 | Smaller gaps in what can be said directly | moderate | missing, hidden |
| 19 | Nobody ever needs to sleep | moderate | missing |
| 20 | Workflow: stale siblings, stale docs, a TypeScript registry | moderate | defect |
| 21 | Minor friction | minor | various |

---

## 1. An adventure's own objects and creatures must go into the shared catalogs `K1`

**Severity:** blocking. **Kind:** missing.

- **Fictional intention.** The house leaves behind dreg, a hard warm piece of dream. The Keel has burnt-out Ithren
  selm-glass lamps. Watch-keepers stop their ears with wax. Cobble Ring has an old hall dog and nettle-oxen.
- **Natural expression.** Declare them in the module: `Kind dreg "dreg" is treasure worth 2 { … }`, `Species dog { … }`.
- **Attempt.** `Item ox "a little ox of dreg, on a cord" is dreg_ox at barley.` (`test/fixtures/probes/local-kind`).
- **Observed.** `Item ox names a kind missing from the item catalog: dreg_ox`. No grammar production declares an
  item kind or a species ([Kyr.ohm](../../../src/lang/Kyr.ohm) lines 3, 10, 63). `Hazard` is the only module-local
  catalog-like declaration.
- **Workaround.** I added `dreg`, `ithren_lamp` and `wax_plugs` to the shared
  [data/catalog/items.json](../../../data/catalog/items.json), as *The Long Man* did before me. Its `bell_teeth`,
  `keeper_mask`, `sluice_rod`, `tin_lantern`, `great_pike` and `slump` sit in the shared item and species catalogs
  and in `data/generation/tables/ecology.json`. At `70a81b9`, 27 of the item catalog's 42 kinds are Kyr's own
  additions, and most of them belong to one adventure or situation: `noonlight`, `gilt_crown`, `hollow_regalia`,
  `lamplighter_seal`, `bell_teeth`… Anything I could not add I borrowed:
  - the glass mice are `rat`s;
  - the dog had to become a `Thing`, because the catalog has no dog (see 13);
  - the Footman became a `Thing`, because a creature cannot be revived by a rule.
- **Expressive loss.** Every adventure's unique objects are visible to every other world, and their descriptions come
  from the kind, not the module. Dace's slate is a `map` described as "a hand-drawn map of the local roads". The lit
  lamp is still called "a burnt-out Ithren lamp", because an instance's name cannot follow its state. Two independent
  authors will collide in one global file.
- **Likely cause.** Type model and catalog architecture: kinds are global data read through `src/canon`.
- **Remedy.** Module-local kind declarations that lower to a catalog overlay scoped to the installation:

  ```kyr
  Kind dreg "dreg" is treasure worth 2 {
    Description "A small hard piece of dream, warm to the hand, shaped like something the dreamer loved.".
  }
  Species hall_dog "dog" is beast like wolf { Temperament tame. Level 1. }
  ```

  Alternatively, accept a module manifest `"catalog": "catalog.json"`. Either removes an author's need to edit shared
  files.

## 2. Nobody can be incapacitated outside a fight `K2`

**Severity:** blocking. **Kind:** defect and missing.

- **Fictional intention.** The Choir's lullaby puts listeners to sleep: "a sleeping party is an unwatched party". The
  Footman's touch folds a person alive into a drawer until someone stares at it for an hour.
- **Natural expression.** `Hazard lullaby "…" means "Apply asleep to ally for 1 hour unless wisdom save against (12)."`
- **Attempt.** `test/fixtures/probes/sleep-hours` and `test/fixtures/probes/sleep-turns`.
- **Observed.**
  - `for 1 hour` passes lint, then **stops the session** when it strikes:
    `A world-time or until-removed condition needs persistent lifetime` (`src/effects.ts:134`).
  - `for 3 turns` applies `asleep` (a combat event says so). After one watch the body has no conditions and the
    member is `awake`.
  - There is no other lever that stops a company acting. `hobbled` stops it moving; `halts` interrupts it once.
- **Workaround.** Both effects became places. Being put away moves the company into a room called "inside a drawer"
  ([annex.kyr:236](../../../data/adventures/house-that-grows/annex.kyr)). The lullaby moves it into "the hallway in the
  dream" for six watches ([keel.kyr:152](../../../data/adventures/house-that-grows/keel.kyr)). A follower is dragged
  into the pocket place by the move unless a rule first retracts `following`, which needed a second rule (see 10).
- **Expressive loss.** Sleep and paralysis are not bodily states: no save, no condition on the company sheet, nothing a
  cleric could cure. The drawer cannot hold an NPC watcher who is still "there", so Old Pammu is moved to a room
  called `nowhere`.
- **Likely cause.** Runtime: conditions with world-time lifetimes are not implemented, and the compiler does not reject
  them.
- **Remedy.** Immediate: lint rejects `for N hours` in a `Hazard` until it works. Proper fix: conditions that last in
  world time, kept on the body by the creature store and projected as `awake`. Then `asleep`, `paralysed` and
  `folded` are ordinary catalog conditions.

## 3. Nothing weighs anything `K11`

**Severity:** blocking for this setting; it would be moderate for most. **Kind:** missing.

- **Fictional intention.** Selm lifts twice its own mass: a 5 kg nugget netted to a pack cancels 10 kg. The Upline
  weighs in every passenger against its counterweight. The city's height is lift minus weight. The court drops 40
  tonnes a week to stay up.
- **Natural expression.** `Measure mass(item)` on kinds, a derived load, and rules over it.
- **Attempt.** `test/fixtures/probes/selm`. A rule makes unnetted selm rise out of reach, and that works. Nothing
  anywhere declares a weight, a load or encumbrance (`grep -rn weight src/campaign src/lang data/rules` is empty).
- **Workaround.** None for the pack, the weigh-in or the sum. The slice leaves selm out. That loses one of the
  sourcebook's three founding laws.
- **Likely cause.** Type model.
- **Remedy.** A `mass` value on item kinds (the catalog already has `value`) and a projection `load(member)`,
  readable by rules. Selm is then `mass -2` with an authored rule; ordinary encumbrance falls out.

## 4. Perception is not a fact rules can read

**Severity:** severe. **Kind:** missing.

- **Fictional intention.** The law of attention: a watched room is fixed; an unwatched one grows; a door opens only
  when nobody looks at it. This is the setting's central physics.
- **Natural expression.** A rule over who perceives what: `not perceived(room)`, `perceives(watcher, door)`.
- **Observed.** The runtime knows who perceives where, for narration: `LocalObservations.perceives`, and observations
  `noticed by` a capability. Rules cannot read it. I built attention from parts:
  - 9 queries and 35 relations, among them `watcher`, `averted`, `drowsing`, `overlooks`, `post`, `staying`, `sitting`
    and `abed` ([attention.kyr:9–37](../../../data/adventures/house-that-grows/attention.kyr));
  - a three-degree comparison, `nearLess`;
  - 9 separate "look away" windows kept by `avertedUntil` measures.

  Two mistakes in those parts each produced a world that compiled and played wrongly. One let the protagonist keep
  watchers awake while asleep; the other let anyone avert the on-duty watchers for free.
- **Workaround.** All of it works (17 journeys).
- **Expressive loss.** The law is 140 lines of bookkeeping in one file. Every other mechanism must remember to consult
  it. A new room is fixed or grows only if the author adds `houseRoom`, `keelSide` and two die bands for it.
- **Likely cause.** Semantics. Perception is a presentation concern today, not a world fact.
- **Remedy.** Project `perceives(group, entity)` and `attends(group, place)` from presence, wakefulness, light and an
  authored `Watches x.` part of a Person. Make `looks_away(group)` a standard activity. That one projection serves
  this law, ambushes, stealth, sentries, the owner who did not see (7) and dream-Neme (17).

## 5. A passage cannot say how it is crossed, or where it leads, under conditions

**Severity:** severe. **Kind:** missing.

- **Fictional intention.** Every door of the house opens only behind your back, and onto the less-watched copy of the
  room beyond.
- **Natural expression.**

  ```kyr
  Passage coats_door "the door into the hall of coats" is door between bedroom and coats_low,
    or coats_high when nearLess(coats_high, coats_low), opening unwatched.
  ```

- **Attempt.** A passage has fixed ends and `needing` takes only skills and item kinds (Kyr.ohm line 20). I had to
  write all of the following:
  - three bespoke movement actions (`back_through`, `back_through_near`, `back_through_far`,
    [attention.kyr:41–63](../../../data/adventures/house-that-grows/attention.kyr));
  - a blocking `Thing` on each of 11 doors, so that the standard `go` is never offered;
  - 11 `dreamDoor` assertions.
- **Observed.** Each bespoke action must repeat `go`'s preconditions. I forgot `visibleTo`, and Kezu's still-hidden
  wall door was offered from the Long Hall. Dynamic geography does work: a rule that retracts `connects` removes the
  exit (`K6`).
- **Workaround.** As above. It plays correctly.
- **Expressive loss.**
  - The doors show on the map as permanently shut ways.
  - Each offers three "Look and try" probes, so 15 menu rows in the bedroom come from doors.
  - The way through is an action filed under "Yourself" in the reader (11).
- **Likely cause.** Grammar and semantics of `Passage`.
- **Remedy.** Two small extensions:
  - `Passage … opening when P` (a predicate on the traveller, the passage and the moment) and `… or X when P`
    (conditional ends), lowered into `go`;
  - `needing` accepting a predicate.

## 6. Companions: hireling or shadow, nothing between `K7`

**Severity:** severe. **Kind:** defect and missing.

- **Fictional intention.** Tobu, 17, Kezu's nephew, comes because he wants to understand what his aunt did. He is the
  one left behind to watch when the company comes down, and he leaves if Kezu is harmed. Quill, 11, is taken home to
  his mother.
- **Natural expression.** Tobu joins as kin. He keeps his voice, can be asked to stay, and has his own reasons to
  leave.
- **Observed.**
  - The standard `recruit` says "Tobu shakes on it, and is one of you"
    ([people.kyr:24](../../../data/rules/people.kyr)). His topic "Ask Tobu about his aunt" disappears, and he becomes
    a 4 hp member in clothing.
  - A member can never be left anywhere: no resolver takes someone out of the company.
  - `kin(tobu, kezu)` is read by no rule.
  - `lead` (escort) keeps a person a person: topics, following through any move. But it takes two steps (my topic,
    then "Ask them to come with you", where the pronoun stands in for his name).
  - `part_ways` is offered before he has come, because it never requires `following` (people.kyr:32).
  - A follower is moved by *every* change to the company's location, including into a dream or a drawer.
- **Workaround.** Tobu and Quill are escorts. "Stay here and watch" is my own `staying` relation. Tobu leaving when his
  aunt is harmed is a rule on my own `harmed` relation.
- **Expressive loss.** Escorts do not fight beside you or lend their skills to the company. Members cannot stay behind
  or keep their topics. The choice is a hireling with no voice, or a voice that cannot fight.
- **Likely cause.** Semantics: two companion models, neither complete.
- **Remedy.** One companion model:
  - a companion keeps their entity, topics and role while in the company;
  - `part_ways` may leave them at a place;
  - `recruit` consults `kin` and `expects`, and takes the person's own words (`Joins "…".`);
  - `part_ways` requires `following`.

## 7. Ownership ignores whether the owner can see, and who the taker is `K8`

**Severity:** severe. **Kind:** defect.

- **Fictional intention.** Kezu's cracked cup is hers. Her student takes it while she sleeps; when Kezu wakes and
  sees it, she asks for it back.
- **Natural expression.** `Item kezu_cup … owned by kezu.` with `Objects "…"`.
- **Observed.** Kezu, asleep, "sees {cup} in your hands". The objection fires because she is `able`
  ([belongings.kyr:23](../../../data/rules/belongings.kyr)), and she is then permanently `hostile` to her student.
  The fixture is `test/fixtures/probes/owner-asleep`.
- **Workaround.** I dropped `owned by` and wrote my own rule that fires only when she is awake and together with the
  student, and asserts nothing hostile
  ([cobble-ring.kyr:115](../../../data/adventures/house-that-grows/cobble-ring.kyr)).
- **Expressive loss.** The shared machinery of servants who report and lending that excuses is lost for this object.
- **Likely cause.** Semantics of `belongings`.
- **Remedy.** The objection requires the owner to perceive the item (4). A person's `Objects` may carry effects
  (`Objects "…" then { … }`) in place of the fixed `hostile`.

## 8. One die for the whole world, and no arithmetic at run time `K5`

**Severity:** severe. **Kind:** missing.

- **Fictional intention.** Each unwatched room changes on its own 1 in 6 each turn, by a d12 Growth table.
- **Natural expression.** `when not watchedRoom(?p) and roll(?p, 1d6) == 1`, then `roll(?p, 1d12)`.
- **Observed.** `dice(clock)` is one number a watch for every rule (`src/campaign/campaign-tick.ts:57`). Two unwatched
  rooms grew 1, 2, 4 in lockstep. `(dice(clock) + phase(?p)) % 100` is rejected as `Invalid Deem expression`, with no
  location: a parenthesised expression is a value fixed at load, not arithmetic over measures.
- **Workaround.** Each room gets its own band of the one die: 18 `Initially Set bandLo/bandHi` lines. No two rooms of
  one body can grow in the same turn, and the two bodies share bands. The Growth table became a fixed, authored
  sequence per room, keyed on thresholds of `grown(room)`.
- **Expressive loss.** The house grows in a scripted order with random timing. It cannot generate.
- **Likely cause.** Runtime and expressions.
- **Remedy.** `dice(entity)`, keyed by identity and watch. This is the scheme `RandomStreams.key` already uses for
  everything else. Allow measure arithmetic (`grown(?p) + 1`) in comparisons and `Set`.

## 9. Ten minutes is the smallest act

**Severity:** severe for social play. **Kind:** missing.

- **Fictional intention.** "Tobu, look at me." One glance, and the door opens behind you.
- **Observed.** Every action and every topic takes at least one watch: the compiler rejects `Time` below 1. Asking the
  watchers to turn round, asking Tobu to look at you and backing through the door take 30 minutes. A two-watch
  look-away expired before the door could be reached, and the house grew in the meantime.
- **Workaround.** Look-away windows of three watches, and optional steps in tests ("only if he is not already looking
  away").
- **Expressive loss.** Coordination becomes timing puzzles about the bookkeeping, not the fiction.
- **Likely cause.** Time model.
- **Remedy.** `Time 0` for speech and small acts. They are resolved within the watch and run no rules until the next
  timed act.

## 10. Order is meaning, and it is invisible

**Severity:** severe. **Kind:** hidden.

These came up while making the Footman close on one lapse and take on the next:

- **Rules see what earlier rules did in the same watch.** `footman_closes` written above `footman_takes` meant one
  lapse closed and took at once. I reordered them, with a comment
  ([annex.kyr:242–249](../../../data/adventures/house-that-grows/annex.kyr)).
- **Rule order across files follows the manifest's `source` list.** A look-away set at the end of an action was undone
  by `eyes_back` in `attention.kyr` before the Footman's rule in `annex.kyr` could see it.
- **Effects cannot be conditional.** "If Tobu is with you, he is left watching" is a rule of its own placed before the
  taking. My first version asserted `staying(tobu)` unconditionally, so Tobu, sitting in Kezu's kitchen, unfolded the
  protagonist into the kitchen.
- **Rules cannot see a long action while it runs.** A company sleeping through `camp` still looks at its room, so the
  Footman could never reach a sleeper. Sleep became two steps: `lie_down`, a relation the house can see, then waiting
  for light.
- **Rules may not write `knows`** (module-compiler.ts:79). Mechanisms teach only through `Observe … teaches`. That
  happens to be the right discipline, but it is documented nowhere.

**Remedy.** Document the evaluation model in the guide: one pass, authored order, files in manifest order, cascade
within the pass. Then add three things:

- `When … then { } else { }` effects, or guarded effects;
- an `activity(actor, action)` projection for long actions in progress;
- a lint warning when two rules read and write the same relation within one pass.

## 11. The reader merges, misplaces and unnames what the module made distinct

**Severity:** severe. **Kind:** frontend.

Screenshots of the bedroom and of the Keel's hall of coats were taken in Chrome from `kyrie preview`.

- **Identical labels collapse into one choice.** Two operators labelled "Close your eyes and back through a door in
  the Long Hall" became one, so the choir room or the bunk room could not be reached. Authored actions are inserted by
  label path (`src/ui/choice-grouping.ts:183–191`). Workaround: perceptual names ("a door that glints").
- **Exits name rooms nobody has seen.** "To the lamp store — look at a door…". The cure exists, `Place … seen as "a
  room beyond the glinting door" until lamps_found`, but the guide never mentions it, and each use costs an alias, a
  discovery and a teaching observation.
- **Things with only tries are anonymous.** The bedroom shows three rows of "Look and try" with nothing to say what they
  are. "Look and try › Hold a flame to it" appears four times, and only the command id tells the seams from the chest.
  The Footman, the most dangerous thing in his room, appears as "Look and try".
- **Authored actions are filed under "Yourself"**, after Wait and Search, unattached to the door they open. A passage
  is never a subject (`fallback` looks for people and things only), so the world's central verb is drawn as an
  afterthought.
- **A shut-off way is still listed under Go.** A door that has grown shut is still a Go row and a dashed edge on the
  route chart, while the prose says "Where the far door was there is only glass."
- **Articles break on numbered groups and possessive roles.** "a watchers on stools", "Tobu, a Kezu's sister's boy".
- **The single-protagonist pitch offers ready companies of three**: "The fellowship, Delvers…".
- **Lighting a torch is "Use on Isa Wennu".**

The reader also does some things well:

- Speech is shown as speech.
- A taught fact collapses to "Noted: …", which removes the duplication the raw perceptions have.
- Aliases are rewritten into every label.

**Remedy.**

- Merge choices by command, not label, and disambiguate equal labels by subject.
- Let an action name its subject: use a passage parameter, or `About way.`.
- Name the thing in its tries.
- Default unvisited destinations to an alias such as "the room beyond {passage}".
- Drop ways whose blocker says they no longer exist (a state flag `gone`).

## 12. Errors that come at run time, or with no place `K2` `K4`

**Severity:** moderate. **Kind:** defect.

| Case | What the author sees |
|---|---|
| A query called with an unbound argument (`held(p) means looks(?w, p)`) | Lint passes. Play stops on the first turn that reaches it: `Query … needs bound arguments` (`K4`). I hit this twice. The rule turns out to be left-to-right binding: `keepsWatch(?w)` is fine after `watcher(?w)`. |
| `Apply … for 1 hour` in a hazard | Lint passes; play stops (`K2`) |
| Arithmetic in a condition | `Invalid Deem expression`, with no file or line |
| Two observations with the same id in different files | `Duplicate observation hall_scene`, with no file or line |
| `Species dog` (no such species) | `Invalid creature generation context for o__bolt_person`, with no field named |
| An installed module with no company, first in a campaign | `undefined is not an object (evaluating 'player.members')` |
| `as passing` (I guessed it from the commit message) | Lists the valid aspects, which is good, but the guide documents none |
| A stale `../deem` checkout | `this.preview.partialEvaluate is not a function`, deep in presentation code; all 14 *Long Man* tests fail |

Parse errors, by contrast, are excellent: file, line, column and context.

**Remedy.**

- Check binding and arity of every query call at compile time.
- Reject unimplemented hazard spans.
- Carry the source location on every declaration-level error.
- Name the bad field in a creature context.
- Check sibling package versions at start-up.

## 13. A species' temper overrides `Peaceable` `K9`

**Severity:** moderate. **Kind:** defect.

- **Intention.** An old hall dog, asleep across the door, that can be scratched behind the ears.
- **Observed.** There is no `dog` species. Borrowing `cave_hound` with `Peaceable` greets the company with "Bolt
  stands its ground and watches you. It will not have you here for long", twice, and labels him "Feral cave hound".
  `temper_warns` never checks `peaceable` ([inhabitants.kyr:76](../../../data/rules/inhabitants.kyr)); the onslaught
  never comes, so the warning is a lie. There is no petting verb, and no `tame` temperament.
- **Workaround.** Bolt is a `Thing` with a `Change scratch` (cobble-ring.kyr:150). It plays, but he can never follow,
  bark at the Footman or be hurt.
- **Remedy.** `Peaceable` suppresses temperament, or lint reports the pair. Add a `tame` temperament. Domestic animals
  belong in the species catalog (or in a local `Species`, see 1).

## 14. People and things are fixed at load: roles, topics, populations

**Severity:** moderate. **Kind:** missing.

- **Roles never change.** In his mother's kitchen Quill is still "keeping watch over Netters' bundles among the
  lamps".
- **Topics are not tied to places.** His Keel topics ("Ask Quill what he is doing down here") follow him to Lowmere,
  unless every topic is guarded by place.
- **Populations are single declared items.** "Thousands of lamps" are three `Item` declarations, shown as three
  identical "Take from the lamp shelves". Dreg from sleep is one pre-declared item parked in a room called `nowhere`,
  so a second unwatched night cannot leave a second dreg.
- **Nothing new can exist.** Growth result 7 ("a new room buds") can only reveal a pre-declared room.

**Remedy.**

- `Role "…" when P` (or roles owned by states, as descriptions are).
- Topics scoped to the place they were written for.
- Item stock lying in a place (`Lies 1000 ithren_lamp in lamp_shelves.`), instanced when taken.
- A small entity-spawning effect for items of a declared kind (`Create dreg at ?p`).

## 15. A phenomenon that travels with an object needs an observation per object

**Severity:** moderate. **Kind:** missing.

"A lit lamp, set down, watches its room" is perceived wherever the lamp is. An observation's anchor is one entity, so
the same sentence is written three times, once per lamp (attention.kyr:104).

**Remedy.** Anchor by a variable the condition binds: `Observe lamp_watching near ?l when lit(?l) …`.

## 16. A law cannot be shared between modules `K10`

**Severity:** moderate. **Kind:** missing.

The law of attention is the setting's physics. A second Strewnfield adventure (the Socket dive, the Upline) needs the
same `held`, `watcher` and `dreamDoor`.

Relations are compiled per module. A site installed beside a `law` module that declares `Relation held(place)` fails
with `Unknown function or arity: held(room1)` in either order. Manifest `globals` share entities, not relations.
The only shared laws are those in `data/rules`, so a setting's physics must be added to every world's rules.

**Remedy.** Let a module manifest name rule modules from its own directory (`"rules": ["world", "./attention.kyr"]`),
or let `exports` export relations.

## 17. A person cannot be hidden, or seen only by some

**Severity:** moderate. **Kind:** missing.

Dream-Neme "is visible only to people who are not looking for her". `Person` has no `hidden until` (Kyr.ohm line 49).
Things have it, but it is permanent once the fact is known. A person present is always in the people list. I left
dream-Neme out of the slice.

**Remedy.** `Person … seen when P`, with the perception projection of 4 available to P.

## 18. Smaller gaps in what can be said directly

**Severity:** moderate. **Kind:** missing, or hidden.

- **A catalog kind can be named in a predicate only once something in the module instantiates it.**
  `holding(party, wax_plugs)` failed with `Invalid argument wax_plugs` until Wenu sold wax plugs.
- **A local skill cannot be granted.** `capable` is a projection of class, overlays and gear, so the stare is my own
  `stareTrained(party)` relation and appears nowhere on the character sheet. A one-person campaign also cannot fix
  its protagonist: creation lets the player replace the stare-student with "The fellowship".
- **`commoner` is not a playable class.**
- **The guide does not mention** `seen as … until`, `as <aspect>`, `noticed by`, `outdoors`/`indoors`/`underground`,
  `Query`, or that relations are namespaced (`hhg__size`) while `state` is not.

## 19. Nobody ever needs to sleep

**Severity:** moderate here. **Kind:** missing.

The Watch is an institution because everyone must sleep and sleep is dangerous: watch-tax, paid widows, the common
hall, "never sleep alone". In Kyr only food is a need (`needs.kyr`). A player can stay awake in the Keel for three
days with no consequence, and the sleeping-hall is optional. The pressure the whole culture answers is absent.

**Remedy.** A fatigue need on the pattern of `hunger`.

## 20. Workflow: stale siblings, stale docs, a TypeScript registry

**Severity:** moderate. **Kind:** defect.

- **Setup.** `bun install` needs `../languages`, which was absent, and `../deem` at its current main. The local
  `../deem` was 9 commits behind with uncommitted work; I left it alone and put a fresh clone into `node_modules`.
- **Stale documentation.** [README.md](../../../README.md) recommends the Serewater March, and
  [data/README.md](../../../data/README.md) lists it as the current composition. It is retired; the only campaign is
  *The Long Man*.
- **Publishing needs TypeScript.** For an authored campaign to appear on the published title page, an author must edit
  `web/scenarios.ts`. `kyrie preview` reaches it by `?campaign=` without that.
- **One unrelated failure.** `bun run typecheck` fails on an untouched `doc/playtests/rededge-2026-10-20/control-server.ts`
  that imports an absolute `/home/jweissman/…` path.

## 21. Minor friction

- Clause order is fixed: `hidden until` must precede `owned by`.
- Grid cells cannot be negative, which matters for a city above the ground.
- A ladder must change level, so a watch-loft needs a `level` of its own.
- State names share the global namespace: `State listening` collides with the probing verb. The message is clear.
- `together` takes groups only, not things.
- One rule's `says` was printed twice when the company was moved out of the anchor room.
- An action whose label leaves a parameter unmentioned gets it appended: "(Isa Wennu)".

---

## What worked, and is worth keeping

- **Containment, passages and things whose states own their descriptions** made the town, the Annex and the Keel
  coherent geography. Nothing disagreed with itself: the bed's eight folds, the far door bleeding shut, the cup
  shelf's thirteenth cup.
- **Dynamic geography is possible.** A rule that retracts `connects` takes a way out of the world, and the map follows
  (`K6`).
- **Off-screen time is coherent.** While the protagonist slept in Kezu's kitchen:
  - the low hour nodded the watchers;
  - the Footman came down and put Old Pammu away;
  - Kezu dreamt twice and became a door;
  - the council sold the house at noon on the third day.

  Each was found afterwards by observation that teaches (`pammu_taken`, `kezu_door_known`), never announced.
- **Inference from evidence.** `cups_match` can be learned two independent ways: having seen Kezu's cup, or carrying
  it onto the shelf. `house_one` comes from having seen the long window and then standing in the hall it showed.
- **Escorted people stay people.** They keep their topics and follow through bespoke moves, and the shared `home` and
  `brought_home` rules made Quill's homecoming a single authored event.
- **`lends`, `Buys`, `Sells` and `Offers`** covered Dace's slate, Wenu's beds and wax, and the lamp trade without
  bespoke trade actions.
- **The author loop is fast.** Lint takes about 1.3 s and the preview rebuilds in 621 ms. Parse errors are exact.

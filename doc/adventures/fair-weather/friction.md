# Fair Weather — authoring friction

30 October 2026, on branch `adventure/wrecking-reach`, against `main` at `23fc5f7`. Every place Kyr or Kyrie went
against the grain while writing [Fair Weather](../../../data/adventures/skeel), with how it was met and what would
help. Severity and kind follow the house ledger (Low Water's [friction.md](../low-water/friction.md)):
**blocking**, **severe** (works only through machinery that hides it), **moderate**, **minor**; *missing*, *hidden*,
*defect*, *frontend*, *tooling*, *world* (shared-world composition).

No engine code was changed on this branch. The only shared file touched is `data/adventures/countries.json` (one
entry appended; see 1).

| # | Friction | Severity | Kind |
|---|---|---|---|
| 1 | Adding a country to `countries.json` silently moves other countries in every test seed | severe | world |
| 2 | A passage's `opening when` is read while the company is between places, so a crossing in progress closes behind and in front of it | severe | defect |
| 3 | A permanently dangerous way can never be risked: `risk` succeeds and the journey then turns back | moderate | defect |
| 4 | The voice tables make a dog speak when it follows a second time | moderate | defect |
| 5 | No tides: a cyclical, daily-shifting clock has to be built from `hour`, a lag measure and hand arithmetic | moderate | missing |
| 6 | A standalone campaign's ending closes the book, so a dénouement after the climax must be designed around | moderate | hidden |
| 7 | An `Occasion`'s matter that times out is told after the next matter opens | minor | frontend |
| 8 | In a crowded room every person's every topic is offered at once (the Court) | moderate | frontend |
| 9 | Rules may not `Assert knows`; an event that should teach must use `teaches` | minor | hidden |
| 10 | `Manner` accepts only seven values, and the error is not at the line | minor | tooling |
| 11 | `food` is not an item category; `rations` is a good, not a kind, so `holding(actor, rations)` is silently never true | moderate | hidden |
| 12 | Canonical action names (`sing_supper`) and shared entities (`light`, `camp`, `shut`) collide with module ids | minor | hidden |
| 13 | A Kind's name collides across adventures only in a test, not in lint (`ring_kind`) | minor | tooling |
| 14 | A `Speaker` on any action makes a creature "talk" (Talk to Admiral) | minor | hidden |
| 15 | A step pattern matches another person's topic in the same room | minor | tooling |
| 16 | A Topic cannot carry a check; persuasion is an Action with `Speaker`, which reads differently in the list | minor | frontend |
| 17 | No non-lethal fight: three village lads with their fists kill, or are killed | moderate | missing |
| 18 | The canonical outer planes and the House of Doors do not exist in this repository | — | world (an open question, not a defect) |

## 1. One more country moves the others (severe, world)

`Countries.plan` places every authored country in every world, in list order, and the independent adventures are
chosen among by a hash over their number. Appending Fair Weather with `"among": "independent"` changed which
independent adventure each seed chose, and six placement tests in `frontier.test.ts`, `countries-tool.test.ts` and
`adventure-library.test.ts` failed. Re-sided east of a fen, it failed `frontier.test.ts`'s assertion that nothing
else fits north of a mountain after the Long Man (when re-sided north beside mountain). Beside `desert` alone it was
never placed at all: **the generator draws no deserts** (175 cells over five seeds: marsh, mountain, forest, frost),
though five countries list `desert` in their `beside`.

*Met by* placing the Reach `north`, beside `marsh`, `forest` and `frost`, not `among` anything, and last in the list.
Every first country of those terrains already leads north into Merrowdale, so the Reach never takes a first-ring
march; it is placed further out, after every other country, so no other country moves. `bin/kyrie countries` gives
identical output for the test seeds before and after except for the Reach's own line. It does mean the Reach is
never one march away; an ordinary protagonist walks two to five countries to find it, hearing of it on the way
(`far`).

*Would help*: an author-facing check (`kyrie countries --diff`) that says which countries a change moves; a statement
of whether `desert` is meant to be drawable; and some way to declare "beyond the march of a country that lies on the
coast" that is not a guess at terrain.

## 2. A crossing in progress is shut by the tide (severe, defect)

The sand ways open `when sandsOpen()`, which I first wrote as `lowWater() or onSands(party)`, so that a company
already out on the Strand when the sea came could get off it. While the company is crossing, it is at no place
(`enRoute(party, way)`); the opening is re-read every pass; the way closes; the journey's `open` check fails, and the
page says "The way is no longer open. You turn back" — *back onto the flooding sand*, which is the opposite of
what any reader expects. *Met by* adding `or enRoute(party, ?w)` to the condition. *Would help*: a way being crossed
should stay open for whoever is on it, or the journey should check passability as the company *left* it
(src/campaign/journey.ts `open` asserts `at(actor, origin)` but the derived opening fact is stale).

## 3. A way that is always dangerous cannot be risked (moderate, defect)

`Hurts with edge_wind when gusting then gusting` (the cliff edge to the Pulpit, permanently windy) offers "Risk the
wind; Tamar goes first", rolls the save, then the journey finds the way `hazardous` and turns back. Every authored
hazard in the corpus moves to a harmless state after one crossing (`then still`). *Met by* a `lulled` state and a
rule that restores `gusting` when nobody is crossing. *Would help*: `risk` should mark the way risked for that
crossing.

## 4. A dog that follows twice speaks (moderate, defect)

`Joins "…"` is said the first time Admiral follows. The second time (out from under Mother Jago's stairs) the voice
tables choose `join.stranger.1`: "Admiral thinks about it, then nods. 'For a while, then.'" The `thank` kind is
filtered for species (`VoiceContext.species`); `join` is not. Loveday, Nye and Piran have `Joins` lines for the same
reason. Not fixed (it is the shared voice tables').

## 5. Tides (moderate, missing)

The Reach's whole design is a clock that is cyclical, shifts daily, and opens and shuts places in complementary
pairs (the Strand dry when the harbour is). Kyr has `hour`, `watch`, `day`, `dark()`, and measures; no modulo. The
tide is `tide(reach) = hour + 24 - lag`, with `lag` stepped at dawn and reset at four, so every window is a pair of
comparisons on a number that is never below nothing (`tide.kyr`). It works and is readable, but it is the kind of
arithmetic an author should not have to get right by hand (the slack-water windows took three attempts). *Would
help*: a declared cycle (`Cycle tide every 12 hours 25 minutes from 9:00 …`) with named phases, usable in `opening
when`.

## 6. Endings close a standalone book at the climax (moderate, hidden)

The first build told the ending as the Court rose; in the standalone campaign that closed the book before the third
ebb gave back the drowned, so finding Matthew Ferrar for his sister was unreachable except in a generated world
(where an ending closes only a chapter). *Met by* telling the endings when the packet sails on the fourth evening,
with the Court's decisions recorded as facts. The guide says an ending closes the book; it does not say that this
makes a dénouement impossible in one mode and possible in the other.

## 7–8. The Court on the page (minor and moderate, frontend)

A matter that times out is decided by a rule that fires after the occasion has opened the next matter, so "No living
thing came ashore of her" was told after "The second matter". *Met by* giving each matter a watch (`openedAt`) and
deciding it inside its own time. Separately, the loft holds ten people, and every one of their topics is offered at
once alongside the Court's own actions, so the three things that matter in the room (bring the dog forward, ask the
boy, put the Rutter on the table) sit in a list of thirty. A way to mark a scene's actions as *the* actions while an
occasion is sitting would help a great deal.

## 9–16. Smaller things

- **9.** `Rule … { Assert knows(…) }` is refused at load ("a rule teaches what it says"). Right, once known; my first
  confession event was written that way.
- **10.** `Manner gruff` was accepted at parse and failed at load with no line; the seven manners are discoverable only
  by grepping the corpus.
- **11.** `rations` is a good, so `holding(actor, rations)` is never true and `Spend rations` is wrong; `like rations`
  fails as "no kind of item". A lint for `holding(_, <good>)` would have saved a debugging round.
- **12.** An action called `sing_supper` is "a redefinition of a canonical action"; an ending called `light`, a place
  called `camp`, a state called `shut` are duplicates of shared entities. The error for the last three appears once,
  naming only the first.
- **13.** `ring_kind` was declared by The Third Night; the clash is a test (`adventure-names.test.ts`), not lint.
- **14.** `Speaker admiral` on "Run the black dog down" made the dog someone who talks (`talkers` in
  module-assembly), offering "Talk to Admiral".
- **15.** The journey step "about the night of the wreck" took Jinny's topic, not Kerensa's, because both were on the
  quay; the test passed and asserted the wrong thing until I probed.
- **16.** Topics cannot roll; persuasion is an Action with a `Speaker`. Fine, but it shows as "· an even chance" among
  topics that do not, which reads well, and in a different place in the list, which does not.

## 17. Nobody can be beaten without being killed (moderate, missing)

The Cawse lads are three young men with a net who want the Reeve's shilling. A fight with them (offered, as it must
be, by the shared rules) ends with them "fallen" or the protagonist dead. A town fight that should end in bruises and
a grudge ends in a killing. *Met by* making them commoners with their fists (so the fight is winnable and not
trivial) and by making Skeel answer a killing (Mother Jago and Jinny refuse the company). *Would help*: a band that
yields when beaten (`Pleads` is there; a `Yields` temperament that stops at the first fall) for scenes where the
stakes are not lives.

## 18. The canonical planes (open question)

The commission mentions the House of Doors, its upper galleries and the Grand Tour. None of these exist in this
repository (`grep` finds only `data/catalog/conditions.json`'s plane laws, from Orsino). I did not write a plane:
doing so would have been exactly the private copy the commission forbids. Recorded here so that the principal
builder can say where canonical planes are to live, and how an adventure extends one.

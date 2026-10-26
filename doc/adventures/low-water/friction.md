# Authoring friction: Low Water

26 October 2026, on branch `adventure/low-water`. These are the places where writing [Low Water](../../../data/adventures/low-water)
in Kyr went against the grain, across all three passes. That covers the first build, the second pass (the Auditor,
the mirror city, the Glass Citadel) and the final revision (the doubles and the Assayers as fights, double entry, the
foreshadowing in `echoes.kyr`).

Entries 1–17 first appeared in [05 §3](05-implementation-report.md) and are kept here so this is the single list.
Each entry can be reproduced from the named file and from the journeys in
[`test/low-water.test.ts`](../../../test/low-water.test.ts).

The severity and kind follow [The House That Grows' ledger](../house-that-grows/ledger.md).

**Severity:**

* **blocking**: the fiction cannot work as written.
* **severe**: it works only through machinery that hides it.
* **moderate**.
* **minor**.

**Kind:**

* *missing*: the capability does not exist.
* *hidden*: it exists but is hard to find.
* *defect*: it exists and behaves wrongly.
* *frontend*: the world is right but the page presents it badly.
* *tooling*: the friction is in tests or lint, not the game.

## Contents

| # | Friction | Severity | Kind |
|---|---|---|---|
| 1 | A way's `opening when` is checked before the module's own rules in a pass | severe | defect |
| 2 | Someone who turns hostile falls on the company in the same instant; there is no general "warns, then comes" | severe | missing |
| 3 | `carries(group, x)` reads only members' packs; `Assert keeps(group, x)` is silently not carried | severe | hidden |
| 4 | A teaching `Observe … when not knows(f)` shows the journal text instead of the scene | severe | defect |
| 5 | A topic cannot take an answer; a question put *to* the player needs one topic per answer | moderate | missing |
| 6 | No way to spend one carried item of a kind except a container and a rule on `inside(?w)` | moderate | hidden |
| 7 | Measures have no floor or ceiling | moderate | missing |
| 8 | `carries(a, x) or carries(a, y)` in a requirement is never offered | moderate | defect |
| 9 | State names share the module namespace | moderate | defect |
| 10 | A place's observations are told in full on every arrival | moderate | frontend |
| 11 | A thing's own view does not show the place lines its change altered | moderate | frontend |
| 12 | A rule fires every pass its condition holds; counters must be measured against the clock | moderate | hidden |
| 13 | An ending closes the book, so a placed country cannot have one | moderate | missing |
| 14 | `Buys` needs the buyer to have coin, and fails silently without it | minor | hidden |
| 15 | `Sells` by a person who is not a trader does not appear | minor | hidden |
| 16 | A level must sit in a site or building, and the site's name labels every way in | minor | frontend |
| 17 | A one-way way and its return between the same two rooms are reported as duplicates | minor | defect |
| 18 | The page labels a crossing by its destination, not the way's own name | minor | frontend |
| 19 | No numbers in words; no modulo or `every day at` | minor | missing |
| 20 | Lint calls *the engine* in prose implementation talk | minor | tooling |
| 21 | Ending precedence is declaration order across files | minor | hidden |
| 22 | The journey driver: no wait-until, a throw when an ending lands mid-wait, `told` without the Result, curly quotes | minor | tooling |
| 23 | Rules in different files are weighed in manifest order, so a fall-back rule can pre-empt a later file's verdict | moderate | hidden |
| 24 | A step label can match another person's topic in the same room | minor | tooling |
| 25 | A rule's `says` during an action reaches the page but not the journey's `told` | minor | tooling |
| 26 | Dependencies would not install from their tarball (403) | — | environment |
| 27 | Nothing compares an encounter's strength with the party's; the only humanlike foe is a class, not a species | moderate | missing |

## 1. A way's `opening when` is checked before the module's own rules

**Where.** `citadel.kyr`: `gate_in`, `seat_door`.

**What happened.** The Assayers' admission is a rule (`admit_bell`, `admit_mark`) that asserts `admitted(party)` and
says so: *the Assayers step back out of the gate*. The gate's condition was `opening when admitted(party)`.
`WorldConstructs.opening` turns that condition into two rules (`…__opens` / `…__shuts`) pushed at passage
construction, *ahead* of the module's rules. In the pass where the party arrives, `admitted` becomes true after the
opening rule has already looked. The page then tells you the gate is open and offers no exit. The same happened with
`seat_door`, which opened on a teaching rule's discovery.

**What I did.** Opened each way on the underlying fact rather than on the relation a rule asserts: `carries(party,
ear_bell) or knows(party, ledger_of_water)`, and `tried(circles, looking)`, which the action asserts before any rule
runs.

**Remedy.** Evaluate opening rules after module rules, or run them once more at the end of a pass. Failing that, lint
an `opening when` whose relation is asserted only by a rule.

## 2. Someone who turns hostile falls on the company at once

**Where.** `interval.kyr` (the doubles), `citadel.kyr` (the Assayers).

**What happened.** A person who is not `Peaceable` and does not `tolerates(…, party)` assails in the same pass the
company is in the room. For an OSR encounter that is the wrong default: the design is *dangerous, with ways around
it*. Here the ways are the Seventh, the bell, Isaura's measuring, and a weight in the Assayers' pan. They are only
ways if the player has one action in which to take them. The Equals got this by hand in the first pass, and the
doubles and the Assayers needed it again.

**What I did.** The same hand-built grace each time: a measure set to `watch(clock) + n` when the party is first
seen, a rule that retracts `tolerates` when the clock reaches it, and a rule that restores it when the party leaves.
Three encounters, three copies.

**Remedy.** A `Warns` with a grace (`Warns after 1 "…"`) that keeps tolerance for that many watches after the person
first perceives the company, and lifts it on its own. The person already has `Warns` text; it needs the time.

## 3. `carries(group, x)` reads only members' packs

**Where.** `citadel.kyr`: `ring_for_heart`, `climb_after_heart`, `sing_for_heart`.

**What happened.** `Assert keeps(actor, ninth_heart)` with the company as `actor` is accepted. But `carries` is
`memberOf(?m, a) and ownedItem(i, ?m)`, so the company then does not carry the heart, and every action that requires
it is withheld. Nothing reports this.

**What I did.** The heart is set down where it falls (`Assert at(ninth_heart, site)`) and the player takes it. This
reads better anyway.

**Remedy.** Lint `keeps` asserted on a group, or file the item with the group's first able member.

## 4. A teaching observation shows the journal text instead of the scene

**Where.** First pass, everywhere a scene teaches: `Rule … says … teaches …`. Unchanged, and still the most-used
workaround in the module.

**Remedy.** Show a teaching observation's words in the moment it teaches, or lint the pattern.

## 5. A topic cannot take an answer

**Where.** `citadel.kyr`: `auditor_ward` asks *What is the Ward worth?*; `auditor_answer` is the one answer
offered. `interval.kyr`: Isaura's decision is split across `isaura_ledger` and `isaura_will_write`.

**What happened.** The critique ([09 §2](09-critique.md)) asked for an antagonist who *asks*. In Kyr every answer is a
separate `Topic` with a `when`, and the question and its answers do not belong together on the page, in the source or
in lint. Only one answer was worth the cost.

**Remedy.** `On discuss` choices, or an `answering` topic kind that appears under the question that raised it.

## 6. Spending one carried item of a kind

**Where.** `citadel.kyr`: the Assayers' pan (`assay_stone`, `assay_cup`).

**What happened.** Paying with *a* weight-stone, whichever one the company has (there are nine in the module, one of them a pair of bronze hands),
needs an action that binds an item by kind and drops it from whoever carries it. `Resolve drop(item, carrier)` exists,
but takes one named item and a `carrier: member` parameter. Kinds can't be bound in requirements without the variable
trouble of entry 8.

**What I did.** The Equals' pattern: a `Thing … { Holds. }`, so the page offers *Put in › A weight-stone*, and a rule
on `inside(?w, pan) and itemKind(?w, weight_stone)`. It works, but it is undocumented and the reader would not guess
it.

**Remedy.** Document the container idiom in the handbook, or allow `Resolve drop(any weight_stone, carrier)`.

## 7. Measures have no floor or ceiling

**Where.** `citadel.kyr`: `approach_floor`.

**What happened.** `Decrease approach(bowl) by 2` can take the clock below zero. The Reflected's count is
`approach * 3`, which then reads *−3 of them*.

**What I did.** A rule that sets it back to 0.

**Remedy.** `Measure approach(place) from 0`, or clamp `Decrease` at zero for measures that declare it.

## 8–21. Kept from the first pass, with what each became

* **8.** Split into two actions. Still in the module (the Library's two bell actions).
* **9.** Prefixed or tag-like state names (`wound_up`), and the presentation change in [05 §2.2](05-implementation-report.md).
* **10.** `familiar(place)` and an `_again` observation for every transit room: 24 pairs.
* **11.** Measures written into state text (`{level(dyers)}`).
* **12.** The Equals' grace, the mirror city's `mirrorWatches` and the doubles' `doublesTurn` are all measured
  against `watch(clock)` with a `last…` measure, never incremented per pass.
* **13.** Endings live in `endings.kyr`, which only the standalone campaign installs. In a placed world the Bowl goes on.
* **14–15.** Halm was given 120 gold; a `buy_glossary` action stands in for `Sells`.
* **16.** Steps between terraces, not levels.
* **17.** The way back from the still water arrives at the Ward landing rather than the Mere's edge. This is a fair
  change for the story, but the lint forced it.
* **18.** `after_reflected` is named *out onto the Mere after the Reflected*, but the page offers *Through to the
  still water*. The journeys must use the destination. An author reading only the source would guess wrong.
* **19.** One observation per value; latches with resets for nightly events.
* **20.** The Reckoner, and the machine.
* **21.** Seventeen endings, ordered by hand in `endings.kyr` so the more specific come first. Nothing checks that a
  later ending is not shadowed by an earlier one.

**Remedy for 21.** Lint an ending whose condition implies an earlier ending's.

## 22. The journey driver

Every item below cost at least one failing run.

* **No wait-until.** The test support grew `untilComplete`, `untilReflected` and `untilNight`, loops of `=+n`.
  Suggested: a step `=until <predicate>`.
* **A throw when an ending lands mid-wait.** An ending that lands during `=N` makes the next wait throw *Nothing to wait
  by*, not report the ending. The Open Bowl journey has to compute `heartDue` and wait exactly to it.
* **`told` omits the action's Result.** The narration field leaves it out. The Result is only in `page`, so assertions
  on an action's own words must read `page`.
* **Curly quotes.** The page sets them (’), so an expectation typed with a straight apostrophe fails.
* **`?` is not an optional wait.** On a `=+n` step, `?=+6` is taken as a label pattern and silently skipped.

## 23. Rule order is manifest order

**Where.** `council.kyr` and `hearing.kyr`.

**What happened.** `council_rejects` (in `hearing.kyr`) fires on any remedy that no verdict rule has taken. Act IV's
verdict rules live in a new file, and with `council.kyr` listed after `hearing.kyr` the rejection was weighed first, in
the same pass. Nothing in a file says that its rules depend on running before another file's.

**What I did.** Listed `council.kyr` before `hearing.kyr` in both manifests.

**Remedy.** A rule priority (`Rule … otherwise`, weighed after every other rule with the same trigger), or lint a rule
whose condition is the negation of `decided`-style relations that other files assert.

## 24. A step label can match another person's topic

**Where.** `test/support/low-water.ts`: `Bowl.finding`.

**What happened.** The Finding's step `what the Reckoner counts` was meant for the census exhibit. In the Moot Hall,
where the Registrar is present, it matched a new topic, *Tell the Registrar that what the Reckoner counts is an
account*. The topic was taken, the exhibit was silently skipped, and the failure showed up three assertions later.

**What I did.** Relabelled the topic.

**Remedy.** A journey step that matches more than one choice could fail loudly, and say which choices it matched.

## 25. Rule text during an action is in `page`, not `told`

**Where.** Quill's pricing speech, `quill_prices`.

**What happened.** The speech was on the page, after the action's Result, but not in the journey's `told`, so the
assertion on `Bowl.said` failed. Other rule texts, fired during waits, are in `told`.

**What I did.** `Bowl.pages` for assertions on what a step showed.

**Remedy.** Document which channel carries which text, or make `told` everything the page told.

## 26. Environment

`bun install` was refused (403) fetching two git dependencies as tarballs. I cloned them at the pinned commits into
the scratchpad, pointed `package.json` at them for the install, and restored `package.json` and `bun.lock`. Nothing of
this is committed.

## 27. Nothing compares an encounter with the party

**Where.** `interval.kyr`: the doubles.

**What happened.** I built the doubles as `like water_elemental` at `Level 1`, four of them. `Level` scales hit points
but leaves the base attributes and armour alone: STR 16, DEX 19, scale. Against a level-1 company of three and Isaura,
one failed song (two watches in the fight) ended in *Your company is defeated*. Lint passed. Only a journey that
failed the check on purpose found it.

**What I did.** The doubles are now `Ancestry human. Calling warrior. Level 1.`, named with `Called` by what they
copy (*the double that is late*). The song takes one watch. Over three seeds the fight is now lost twice and won once:
dangerous, as intended, with four ways around it. The Assayers stay a deliberately unwinnable fight at level 1, with
three ways to settle them.

**Remedy.** Lint an encounter whose expected damage per round, against the campaign's starting party, would down the
party within N rounds. Or report each hostile group's strength against the party at lint time, as information.


# 9. When the contracts are not enough

*The authoring trail, page 9 of 9. [Start](../README.md) · previous: [Testing reachability, consequences, save and reload](08-testing.md)*

Sooner or later Kyr will not say what you need. Before working around it, find out whether it is a known limit, and
where a change would belong.

## First, look it up

- The [authoring guide](../guide.md) §10 "What else a module can say" covers most of what authors asked for in
  October and November (errands of their own, promises, chapters, occasions, who hears what a rule says, beliefs and
  lies, what cannot be undone, a law of a module's own, the order things happen in…): each with the friction item that
  asked for it.
- The [findings index](../../architecture/findings/index.md), §3 "authorability blocker", lists what authors could
  not do and is not yet answered; [gaps.md](../../architecture/findings/gaps.md) the ones never registered before
  (UNT-2xx are the authors'). Known open language-scale wishes are the IF review's IFR-01 to IFR-10 (a why-not
  trace, making things in play, phases of a command, talk as an activity, a knowledge model…), deferred.

## Where a change belongs

The rule from [How Kyr works](../../architecture/overview.md) "Where a change belongs": prefer the higher row.

| You want | Put it in |
|---|---|
| A place, obstacle, person, quarrel | your module, in Kyr |
| A creature, plant, item, material, ability | a canonical record in `data/catalog` (page 6) |
| Something many adventures need | a rule module in `data/rules` (shared names are never scoped; your own relation that shares a shared name is renamed `own_<name>` by `src/campaign/module-shadow.ts`, which rewrites text: M19-69) |
| An adventure a generated region may hold | a scenario over ordinary modules (`data/scenarios`) |
| A new kind of resolution | a resolver in `src/campaign`, called from Kyr by `Resolve` |
| How it looks | `src/ui` and `web` |

An engine change one module needs is usually a missing general construct: the spider brood needed `Numbers` and
`Creature`, not a spider resolver; night needed `dark()`, not a timer (overview.md). The invariants that must hold
whatever you change: one world state, bodies owned by the creature store, rules never writing what the engine keeps,
one mechanical meaning for an ability, randomness keyed by identity, and selecting never committing.

## Record what you could not do

If you work around a limit, write it down where the next mission will find it: a friction file beside your
adventure's documents (`doc/adventures/<id>/friction.md`, numbered items), and ask for it to be carried into the
register of the mission that takes it up, under its own id. The reconciliation of 6 November found 43 authors' items
that never reached any register, among them all 34 of the Parliament of Books' (UNT-201): a friction file that no
register cites is lost. A workaround proves the language can be bent, not that it is adequate (the process audit's
cluster F).

Changes to the engine are the builder's or the owner's to make; an adventure's author changes their own module and
the shared data they are asked to.

*[Back to the start](../README.md).*

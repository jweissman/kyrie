# The author's checklist: before an adventure is handed in

This is one path, in the order to take it. `bin/kyrie new` prints it after scaffolding and keeps it in the adventure's
`NOTES.md`, and `bin/kyrie verify` runs it whole. Each step answers one question. None of them answers another's.

| # | Command | Answers |
|---|---|---|
| 1 | `bin/kyrie names <Surname> <Place> …` | Is each name free? One world holds every adventure, so a surname or a place's name is one adventure's own. Ask before you write it. |
| 2 | `bin/kyrie lint data/campaigns/<id>.campaign.json` | Does it load, and lint clean? An error fails it. A warning fails a campaign the game offers. |
| 3 | `bin/kyrie play data/campaigns/<id>.campaign.json --choices` | Does it play as you meant, by your own hand? |
| 4 | `bin/kyrie inspect --why fact <campaign> "<fact>"` | Why is something so, or not so? Use it when a step does not do what you expected. |
| 5 | `bin/kyrie reach data/campaigns/<id>.campaign.json --detail` | What does a curious player never reach: rooms, people, topics, acts, observations, endings, milestones? |
| 6 | `bin/kyrie voice repeats data/adventures/<id>` | Which of your own phrases come again and again? |
| 7 | `bun test test/<id>.test.ts` (and `test/<id>-*.test.ts`) | Do its principal journeys play as written? |
| 8 | `bin/kyrie verify <id> [--played "who, when, how far"]` | All of it at once, before you hand it in. |

`verify` runs these checks in order: compiled, lint, names, repeats, tests, traces and reach. It ends with the
evidence, each kind for itself:

- **compiled**: it loads and lints clean, or what is to fix, and any name another adventure gives too.
- **tests**: how many passed and how many failed, or none written.
- **explored**: what a curious player's play reached of what was written, and what the kept traces came to. This is
  automated exploration. It is not a test, and it is not play.
- **human play**: `no human play recorded`, unless you say who played it, when and how far (`--played`).

It then lists what no play here answered: the topics, acts, observations, milestones and endings never offered, seen
or reached. Each one is either a way in still to write, or something to cut. A clean compile is not a passing test. A
passing test is not exploration. Exploration is not anyone having enjoyed it.

Some things to know about these checks:

- **New ids.** `bin/kyrie new` refuses an id that is taken: an adventure of that name, a `Module <id>` in any
  adventure's files, or a `test/fixtures/<id>` that is not empty. `lint` and `verify` report two adventures of one
  module id. The scaffold leaves `web/bundles.generated.json` (the browser's copy of `data/`) alone: a build or
  `bin/kyrie preview` rewrites it.
- **The test company.** The campaign's company is a test company of one, *Tester*. No line of the adventure names
  them, as no line names a player's company.
- **Names.** A surname or a place's name another adventure gives fails `verify`. A first name another adventure gives
  is said as advisory (`bin/kyrie names` says so too). First names may be shared, but a distinctive one reads as kin.
- **Reach is greedy.** It takes the first way that ends the story. Its line says which ending it came to, and that
  the others want journeys of their own.
- **A rule that only tells, once.** `Rule <id> when … once says "…" { }` needs no change in its braces, and lint asks
  for none. `once` comes before `says`.
- **Deadlines.** Talk takes no time, so a deadline's slack is not felt in a conversation. Find a sensible one by
  playing the paths against it (AU-30).
- **Names of the canon's.** A relation, measure or query of a name the shared rules or the engine use already, and a
  rule and an ending of one name, fail `verify`'s names (`bin/kyrie names <word>` says which; AU-35).
- **Heard everywhere.** `verify` counts the telling rules with no anchor, each by name: heard wherever the company is.
  Anchor any that is not news for everywhere (`at`, `near`, `within`; AU-36).
- **Sign or ambience.** A sign is told whenever it holds. Ambience is the place's passing life: told the first time
  each line of it is seen, and within the place's three sentences, the rest held for a look. A line to be read every
  time it holds (a stage of what is afoot) is a sign (GR-26; the guide's place lines).

**What none of these prove**: that a player finds it, understands it, or wants to go on. Only someone playing it can
say that (page 8 of the trail, [08-testing.md](trail/08-testing.md)).

**People and scenes in files of their own** is an option, not a check. `bin/kyrie new character <id> --in <adventure>`
(`--incidental`, `--recurring`, `--major`, `--companion` or `--antagonist`) and `bin/kyrie new scene <id> --in
<adventure>` each write a part of the module and a test of it.

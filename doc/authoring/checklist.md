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

**What none of these prove**: that a player finds it, understands it, or wants to go on. Only someone playing it can
say that (page 8 of the trail, [08-testing.md](trail/08-testing.md)).

**People and scenes in files of their own** is an option, not a check. `bin/kyrie new character <id> --in <adventure>`
(`--incidental`, `--recurring`, `--major`, `--companion` or `--antagonist`) and `bin/kyrie new scene <id> --in
<adventure>` each write a part of the module and a test of it.

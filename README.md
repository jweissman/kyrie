# Westernesse

*A History of Emprise.* A literary fantasy RPG set in the world of Imbar, a Seventh Star game. It runs in the
browser, with a book's look and a persistent world underneath. Someone sets out, alone or with companions found on
the way, explores, decides, survives, comes back, recovers, grows, and goes out again. The world does not wait: people
pursue their own ends, deadlines pass, and what the company did stays done. Danger is not scaled to the company;
going round, talking, or turning back are often the better choice.

**Kyrie** is the engine, **Kyr** the language the world is written in, **Deem** the library that generates what no one
wrote by hand. Influences: BBS door games (LORD), old-school dungeon RPGs (descending armour class, prepared spells,
experience for what you resolve), JRPG party combat without a battle grid, and Orsino's content and generators.

**Where it stands now:** [doc/STATUS.md](doc/STATUS.md).

## Where to start

| You want | Read |
|---|---|
| what it is meant to be | [the creative vision](doc/design/VISION.md) |
| to write something for it | [the authoring trail](doc/authoring/README.md) |
| how it is built | [the map of the code](doc/architecture/README.md), then [the project contract](doc/CONTRACT.md) |
| what is promised, open or broken | [the register](doc/architecture/open-register.md) |
| everything else | [the documentation index](doc/README.md) |

## Play

```sh
bun install            # Deem and the languages package, pinned by commit (doc/architecture/verification.md)
bun run web:build      # writes site/; nothing else is needed
open site/mono.html    # or serve site/ anywhere; the whole game runs in the page
```

The title page names the country you are in and offers to go on, or to begin again. Beginning, you choose why you
have come, who you are and what you did before, and a country is drawn for you from a seed. It has its land, rivers
and roads, its towns and the people who live in them, its faiths, the works of those who built there before, its wild
country, its troubles and its wonders. Its towns are named in Common, and its old places keep older names to be
learned. Nothing in it waits for you. What you do there stays done; if you die, the country remembers you, and you
can begin again in it.

Arrow keys move among the choices, Enter or Space takes one, Escape or Backspace goes back, and `?` shows the keys.
The terminal plays the same worlds:

```sh
bin/kyrie adventure --world a1               # make someone and play, in colour (a1 is the reference seed); --profile times it
bin/kyrie world a1                           # describe a generated country
bin/kyrie play --world a1 --as human/thief/Wat "To the landing at Lowmouth"   # play into it by the page's labels
bin/kyrie replay <transcript.json>           # replay a browser transcript; prints the canonical state
bin/kyrie help                               # every command
```

## How it is built

Four layers with fixed responsibilities:
- **Deem** generates: regions, towns, people, the meanings of names.
- **Kyr**, a small declarative language, says what things mean: places, passages, people, states, actions and their
  consequences.
- **Kyrie** is the authoritative runtime: one world state, a planner for every person, Orsino-derived combat, and
  identity-keyed randomness, so the same seed and choices always give the same history.
- **The presentation** has no rules of its own. Every choice on screen is a legal command of the runtime, and the
  page and the terminal draw from one projection of it.

Start with [the map of the code](doc/architecture/README.md); [the index](doc/README.md) lists the rest by subject.

## Write for it

Start with [the authoring trail](doc/authoring/README.md). The [authoring guide](doc/authoring/guide.md) is the full
manual of the language; [data/README.md](data/README.md) says where each kind of content lives.

```sh
bin/kyrie new <id> "Title"     # an adventure that lints, plays and tests as written
bin/kyrie lint                 # every recommended campaign must load clean
bin/kyrie verify <adventure>   # its lint, specs and kept traces
bun run web:build              # after any .kyr or data change: the browser bundles the authored files
```

## Develop

```sh
bun run check:fast       # the routine check: incremental types, cached lint, the quick lane (seconds)
bun run test:changed     # then the specs a change touches, by its code and by the data it names
bun test test/small/     # the rules on tiny Kyr worlds (test/support/tiny.ts), a tenth of a second a spec
```

CI runs the whole suite on every push and pull request, and the page is published from `main` only once that run
has passed. The long descents and the browser specs run nightly, or on a branch on demand. Which check answers which
question, what each costs, and how to make a slow spec cheap are in
[doc/architecture/verification.md](doc/architecture/verification.md). `bin/kyrie` is the one executable; development
tools (benchmarks, recorders, census and report scripts) live in `scripts/`.

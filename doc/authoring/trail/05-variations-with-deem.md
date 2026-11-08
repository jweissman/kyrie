# 5. Variations with Deem

*The authoring trail, page 5 of 9. [Start](../README.md) · previous: [An adventure in the shared world](04-adventure-in-the-world.md)
· next: [Canonical plants, animals, monsters, items](06-canon.md)*

A generated country is drawn from a seed. Two kinds of data shape what is drawn, and an author can change either
without touching the engine:

| Kind | Where | What it is |
|---|---|---|
| **Deem tables** | `data/generation/tables/*.json` (trade, names, peoples, places, faith, weather, ecology, creatures), `data/generation/scenes/*.json` | weighted, conditional choices: which merchant a trade supports and what each kind of merchant stocks (`trade.json`), names by people and sex (`names.json`, `scenes/folk.json`) |
| **Kyr templates** (`.kyrt`) | `data/generation/town/` (the first town's undertown, errands, teachers), `works/` (barrows, keeps, cisterns, galleries, the riddle-door…), `wild/` (roads, meetings, going astray), `deep/rooms.kyrt` | ordinary Kyr with holes: `{t}` the town's id, `{town}` its name, `{{t}_merchant}` whoever keeps its shop; filled for every generated place by `KyrTemplates` (`src/world/kyr-template.ts`); one option of each group is drawn per place |

## Look at what a seed draws

```sh
bin/kyrie world a1
```

```text
Merscfaenn: marsh, human, faith of Nodens (nature)
  s1 Lowmouth (town; salt); inn: the Lucky Phoenix
  s2 Millholm (village; eels); inn: the Ancient Boar
  …
  w9 Umidusspira (tower) [generated for a scenario]
Eligibility:
  no    brood-hollow (wants terrain mountain/forest)
  fits  den
  …
```

and play into it as a chosen person (`--as ancestry/calling/name`), ending on a label no choice has so that it lists
every choice offered:

```sh
bin/kyrie play --world a1 --as human/thief/Wat "To the landing at Lowmouth" "zzqqxx"
```

On `fbf38d58` this told the landing, then `! No /zzqqxx/ at watch 1 among …` with, among the choices,
`To the old corn-store — pick the corn-store padlock`: the thief's own way in, written in
`data/generation/town/undertown.kyrt` as `Change pick "Pick the corn-store padlock" from locked to open needing
lockwork.` A warrior is offered the hasp wrenched instead.

## Change something and meet it

Mission 19's [authoring workflows](../../architecture/mission-19/authoring.md) are three changes made this way end to
end, with their commits: a calling's own way into the first town's jobs (the template, d7ceb585), what each trade
sells (the table, 1eb58ad4), and whether a townsperson is a woman or a man (a new Deem table, 8a5dd206). The loop
each followed:

1. Change the table or template. An option added to a template group is a new trouble or room; "nothing in the engine
   needs to change" (`undertown.kyrt`'s own header).
2. `bin/kyrie world <seed>` parses and compiles every template with the world: a mistake fails here.
3. `bin/kyrie play --world <seed> --as … "<label>" "zzqqxx"` to see it offered.
4. The spec that holds it (`test/undertown-callings.test.ts`, `test/generated-economy.test.ts`), and
   `bun scripts/redigest-trace.ts wren-tower-climbed` to see whether a kept trace's play moved.
5. `bun run web:build` so the browser bundles the changed data.

## A meeting of your own, found and met (journey 5, 7 November)

Mission 19's journey 5 added one option to `data/generation/wild/meetings.kyrt`, `--- wood honey 3` (a honey-hunter
at a bees' oak; marked there as demonstration content), and met it in the browser. What it took:

1. **Write the option** after the others of its land: `--- <land> <name> <weight>`, its lines ordinary Kyr with the
   template's holes (`{m}` the meeting's id, `{tract}` the stretch, `{folk}`, `{he}`, and with a `>> lead` line
   `{site}`, `{seen}`, `{toward}`). Copy a neighbour's shape: the woundwort's for a stand to gather from, the burner's for
   a person with a lead and thanks.
2. **Find where it was drawn.** `bin/kyrie world <seed>` ends with a `Meetings:` list, each stretch by its id, the
   name the map gives it, how many stretches it lies from its nearest town, and the option drawn there:
   `t169 the woods of Asholt (2 from Fearnmaere): wood honey`. A new option takes some stretches from the others
   (each stretch draws by weight among its land's options), so the list is also how to see what your weight did.
3. **Walk there.** Many stretches share one name ("the woods of Asholt"), so go by the town and the count: out of the
   town to its own stretch, then a stretch at a time on the map toward it. A meeting stops the company the first time
   it crosses or enters the stretch ("Someone is here").
4. **Open the same country in the browser**: `site/index.html?world=<seed>` begins a new game in the seed you
   inspected (New game on the title draws a seed of its own). The journey first pinned the page's random seed in the
   console before finding the address, which no page of the trail had named.

What the journey met that an author should know: the thanks given by kind (`Give 2 betony to actor`) and the stand's
own items (`Item … "a twist of betony" is betony`) are two rows in the pack ("A twist of betony", "Two
betonies"), because a named item is its own thing; and the kind's name is made plural by a rule ("betonies").

## What is not yet data

Most of what a country holds is still written by TypeScript that emits Kyr text: 27 of the 61 files in `src/world`
build Kyr declarations in strings, beside 21 `.kyrt` templates (count of 6 November). Generated townsfolk, their talk,
scenario word and the plots of works are among them. An author cannot change those without changing the engine
(ARV-H4, Open; ARV-M6, central edit points; AUT-25, Deem's module-local tables and generated families; M17's
`kyrie new table` and `kyrie new generator` were never built, UNT-120). Deem's own creature grammar was retired on 5
November (see [doc/generation](../../generation/capabilities.md), marked superseded): creatures come from canonical
records (page 6).

*Next: [Canonical plants, animals, monsters, items](06-canon.md).*

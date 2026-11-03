# Quittance — brief for the authors of the small adventures

You are writing part of **Quittance**, a metropolitan adventure region for Kyrie, in Kyr. Read this whole file, then
`01-design.md` and `02-review.md` in this directory, then the files in `data/adventures/quittance/`
(`city.kyr`, `scenes.kyr`, `kernel.kyr`, `arch.kyr`, `slate.kyr`, `people.kyr`). The city, its people and its contract
already exist. You write **your own quest file(s) only**, plus tests and a short quest card.

## What the work is

A small adventure here is not "accept a request, do one thing, get a reward". It is a **dilemma in a place**, with a
person who wants something, a thing that matters, something misunderstood, **more than one real way through**, a
complication that changes how you read what you were told, a **consequential resolution**, and **something that follows
into later play**. 02-review.md has a table giving each quest's dilemma and complication. Honour it; improve it if you
see a better one, but never flatten it. Different character builds must find different, *non-redundant* doors.

Comedy is earned: a set-up, a turn, a payoff, ideally returning later. Satire must be something the player **plays
against** (a rule that can be bent, a form that can be filled, a mark that can be moved), not a speech. People change
their minds for reasons other than evidence (02-review R4: levers). Prose is concrete, specific and dry; no stock
fantasy, no "ancient", no "mysterious", no exclamation marks, no explaining the joke.

## Tone sample (the register to match)

> Mr Prest reads Rule Five aloud, back to you, in a tone of gentle regret. 'Sufficient to the Bell,' he says, 'and to
> the Collector. I am afraid that I am not satisfied.'

## Files you own and files you must not touch

You own exactly the `q_*.kyr` / `descent.kyr` files your assignment names, `test/quittance-<yourquest>.test.ts`,
`test/fixtures/quittance/<yourquest>.json` (optional), and `doc/adventures/quittance/quests/<yourquest>.md`.
**Do not edit** `city.kyr`, `scenes.kyr`, `kernel.kyr`, `arch.kyr`, `slate.kyr`, `people.kyr`, `module.json`,
`placed.json`, the campaign, or another author's file. If you need a place, passage, person or kernel name that is not
there, **put it in your own file** (a new Place may go in any settlement of `city.kyr`; choose a free cell: see the
coordinates in `city.kyr`, and prefix your ids) and say so in your report. If you believe the kernel needs a change,
do not make it: describe it in your report.

Every id you declare is prefixed with your quest's short prefix (`ms_`, `bk_`, `fg_`, `bg_`, `ll_`, `cl_`, `an_`, `qu_`, `pm_`,
`pt_`, `wk_`, `sd_`, `ds_`). Persons and Places you add must have **names unique across all of `data/adventures`**: the
names lint compares the **last word** of a person's name (surname) with every other adventure's people. Use rare,
period-flavoured surnames, run `bin/kyrie lint data/campaigns/quittance.campaign.json`, and rename on a collision.

## The contract (kernel.kyr, people.kyr, arch.kyr, slate.kyr)

Read them; the essentials:

- **Offices as groups**: `phoenix lamprey sovereign providence residuary gasco wardsfolk brigades city`.
  `regard(office)` is how well the company stands (start 0). A good turn is +1 or +2, a betrayal −1 or −2. Do not
  write a value outside −3..+4 by your own file.
- **Arcs**: `arc(person)` is the stage of a principal figure (table in kernel.kyr). You may move **only** the arcs your
  assignment names, one stage at a time, and only when the story's lever has been applied. (`arc` is a measure of the world: read it
  in a condition to change how a person speaks.)
- **Knowledge**: the `d_*` Discoveries in kernel.kyr. Assert `knows(actor, d_x)` only from an Action/Topic (`On
  discuss { Assert knows(actor, d_x). }`) or have an `Observe … teaches d_x`; a Rule cannot assert knowledge. Teach
  the ones your assignment lists, **only when play has earned it**. You may declare as many Discoveries of your own as you
  like.
- **Witnesses**: `Assert witness(person).` when someone will testify at the Hearing (a mind won, not a document found).
- **Wards and coals**: the wards are the settlements `brick reach glass hill mort wards`. `Assert keeper(ward).` when
  someone in the ward will keep a hearth lit for the Night. A person may *give* a Lent coal: `Increase quantity(actor,
  coal) by 1. Set coalExpires(actor) to watch(clock) + 144.` only on day 6 or later (`day(clock) >= 6`), and only if
  your story earned it. A place may be a source: `Assert coalSource(place).` (the kernel action
  "Take a Lent coal from the hearth here" then works there on day 6+).
- **Kinds that pass between adventures** (kernel.kyr): `forged_writ tench_ledger roll_extract cellar_key skelter_book
  salamander_lantern phoenix_writ adjuster_licence policy_of_passage`. The adventure that gives one declares its
  `Item … at nowhere` and `Give`s it. Ask for one with `holding(actor, kind)`.
- **How the company came in**: `entered_honest entered_false entered_plain entered_water entered_hearse entered_gap`,
  `onTheRoll`, `aliased`, `ringed`, `inCity`. Let the way a company came in colour your first scene (e.g. a company
  that came by the Cinder Gap is trusted in the Wards; one `onTheRoll` is known to the Phoenix).
- **Time**: `day(clock)` is 0 on the first morning; `hour(clock)`; `watch(clock)` counts ten-minute watches from 08:00
  day 0 (144 a day). Appointed Nights burn in the small hours of day 3 and day 6; Reckoning is the night of day 8; coals
  may be laid from day 6. Quests must not assume the company is anywhere in particular at a given time; they must set
  a **clock of their own** where the story has one (a fire that burns, a Monday on which a pension stops), and decide
  what the world does if the company is absent (02-review R1).
- **The Slate**: each quest chalks its own claim at `slip_room` with an `Observe` that `teaches` a Discovery of yours
  (`<prefix>_claim`), and gives an `Objective` conditioned on it. A quest must *also* have an in-world way to be found
  (a person who says it, a thing seen), so the Slate is never the only door.
- **Licence**: the adjuster's licence (`holding(actor, adjuster_licence)`) lets a company *certify*. Use it as one lever
  among others, **never** the only way to complete your quest.

## Engine facts that cost earlier authors time

Read `doc/authoring/guide.md` (sections 3–10) before writing Kyr. These bit this project:

- Reserved names: `recorded stage ward able dead knows established day hour watch capable levelOf` and the engine's
  relations may not be (re)declared or written; an action parameter may not shadow an entity name (`ward`, `site` is fine).
- Person **names**: unique by surname across the repository (above). `Manner` must be one of `proud grim cheerful acerbic
  compassionate stoic jovial`. `Trait` must be a real catalog trait. `Role "…"` is written as it would follow a comma
  ("the captain of …"). `Calling` is a class: `warrior mage thief cleric bard ranger monk`.
- Never `Retract at(actor, …)` for a company; to move the company `Assert at(actor, place)` only.
- An `Action` that is not said to someone must name its place in `Requires`: `at(actor, some_room)`; without it, it is
  offered everywhere. An action said to someone has `Speaker person.` and `at(person, site)`.
- A check's die is fixed by the seed and the moment: do not design "try again until it works". Design a *failure that
  leads somewhere*. Skills a check rests on are listed in `src/rules/checks.ts` (persuasion deception intimidation
  insight lore stealth lockwork trapwork climbing brawn mending rites wayfinding digging tumbling performance
  woodcraft). Checks use the best of the company: so a plain party can *recruit* a better one or *pay*.
- Rewards: a Kind may be `like lantern granting light`, `like old_glossary granting lore` etc (see kernel). Items to be
  given are declared `Item id "…" is kind at nowhere.` then `Give id to actor.`
- An unreached person or thing is better than a stubbed one: do not leave any Person with a greeting and nothing to
  say, any Thing that cannot be examined, any Topic that does nothing.
- `kyrie lint` must report **no errors and no warnings that you caused** (advice about relations read by someone else
  is expected until the spine lands). Prose that says "the engine", "flag", "state", "persists" is flagged: write the world.
- Every action/topic label is a sentence a player reads; make it a *choice* ("Tell Cray you know where his mother is
  buried"), not a mechanic ("Use persuasion").
- For long quests, keep scenes in different rooms, make **rooms and things matter** (a thing to examine with a result; a
  passage that opens), and put at least one **timed or watched event** in (a rule keyed on `watch(clock)`/`day(clock)`).

## What to deliver

1. Your quest file(s), lint-clean.
2. For each quest, a test file `test/quittance-<quest>.test.ts` using `test/support/quittance.ts` (`City`, `Q`), playing
   **every distinct resolution** and asserting the world state, the relations/measures from the contract it writes, and
   (important) the quest's **alternative outcomes and failures**. At least: the honest approach, a non-charismatic
   approach (brawn/stealth/lockwork/coin as fits), one that fails or is abandoned, and the persistence of the
   consequence after the quest (e.g. a person greets differently; a place has changed). Use `Journey` steps (see
   `doc/authoring/guide.md` §9 and `test/support/low-water.ts`), `bin/kyrie play … --choices` to find labels, and
   `JOURNEY_TRACE=1` to see the telling. Tests must pass with `bun test test/quittance-<quest>.test.ts`.
3. `doc/adventures/quittance/quests/<quest>.md`: premise, people, place map, approaches and what each needs, complication,
   outcomes, what it writes into the contract, build matrix (which build gets which door), what changed from the
   brief and why, and an honest critique of the weakest part.
4. `doc/adventures/quittance/friction/<prefix>.md`: **authoring friction** you met (what Kyr/Deem/engine/UI would not do,
   awkward idioms, bad lint advice, things you wanted and worked around) with file/line or command evidence. This is a
   deliverable; be specific and unpolite about the tooling.
5. A final message to the commissioner (the lead author) with: files; what contract names you wrote/read; places or
   persons you added; anything you want changed in the kernel; test command; weaknesses.

## Workflow

```
bun install                         # in a fresh worktree
bin/kyrie lint data/campaigns/quittance.campaign.json
bin/kyrie play data/campaigns/quittance.campaign.json --choices "<step>" "<step>" …      # labels by regex
bin/kyrie inspect data/campaigns/quittance.campaign.json "<choice>" …                    # why isn't it offered
bun test test/quittance-<quest>.test.ts
```

Commit your work on your own branch (the worktree gives you one) with a clear message; do not push; do not merge.
Your branch will be merged by the lead; so **touch only your own files**. If you must reference another quest's
person, use the declaration in `people.kyr` and only Topics/Observations of yours.

## Budget and depth

A good quest is roughly 150–300 lines of Kyr plus its test. Depth over breadth: two excellent approaches and an
excellent complication are worth more than six thin ones. Every approach you offer must have been played in a test.

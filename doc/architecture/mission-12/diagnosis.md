# Mission 12, phase A: where the boundaries are wrong

This note explains why Kyrie still plays badly after Mission 11. It traces each reported failure to the boundary
that produces it, then names the structural change that makes the fix easy.

## What was examined

| Repository | Revision | State |
|---|---|---|
| kyrie `main` | `0f525bb` | The user's edits to `deem.run.json` and `eslint.config.mts` are uncommitted; `assets/` (804 JPEGs, 57 MB) is untracked. All three are preserved as they are. |
| kyrie `origin/house-that-grows-authoring` | `199db32`, based on `70a81b9` | Read only. Not merged and not checked out. |
| ../deem | `967deac` | Clean. |
| ../languages | `30d36c6` | Clean. |
| ../orsino | `4cb27ce` | Clean. Its snapshot is in `data/sources/orsino/registry.json`: 2651 entries in 79 families. |

Evidence used:

- the Mission 11 report and journeys;
- the branch's ledger of 21 authorability findings and its probes;
- the coverage report;
- the published build, measured in Chromium (`latency.ts` and `engine-cost.ts` in the session scratchpad);
- the sources named below.

## The boundaries, and what each gets wrong

### 1. Generation writes prose, not communities

`RegionWriter.settlement` (`src/world/region-writer.ts`) emits Kyr source text for every settlement:

- one green;
- an inn with a taproom;
- a shrine;
- a shop;
- four people: innkeeper, priest, merchant and traveller.

Size changes only a purse and the raising service. Every town priest sells the old glossary. Each person's life is
a `Role` string and a fixed location. There are no households, no work, no daily round, and no relations between
inhabitants. Because the output is source text, nothing downstream can ask what a person does or where they live:
the settlement exists only as sentences and service schemas.

**Repair:** a settlement model (`src/world/community/`) that generates the community as data:

- households;
- workplaces from terrain and trade;
- institutions;
- inhabitants with work, kin, belongings, habits and a concern;
- a day's round.

The writer then renders that model to Kyr. Prose comes from the model, never the other way round.

### 2. The simulation has no semantic events

What happens is reported in three ways: the `says` strings that rules carry, the observation texts that become
true, and the combat log. `ActionFeedbackView` then rebuilds "what happened" by diffing perceptions before and after.

There is no event saying *Hallon joined you*, *the dog wagged*, or *the riders attacked because you cast at them*.
So the narrator cannot choose, vary or attribute anything. It can only filter strings, and every line is final prose
written inside a rule. This is why consequences are unintelligible (the toll death) and why barks and reactions
cannot be conditioned on temperament or relationship.

**Repair:** a `Happening` stream with kind, actors, cause, place and data:

- emitted by the campaign for movement, joining and leaving, speech, harm, falls, fleeing, deaths, discoveries,
  trade, gifts, theft, refusals, threats and turns of the day;
- available to Kyr rules as `Says … as <kind>` with roles;
- voiced by the narrator from editable tables.

### 3. Kyr cannot say what authors need

The branch's ledger is concrete. These findings are the ones that matter for play:

| # | Finding | Repair |
|---|---|---|
| 1 | Kinds and species cannot be declared locally. | `Kind` and `Species` statements, compiled into the module's catalog. |
| 2 | No conditions outside combat; `for 1 hour` crashes at run time. | World-time conditions, `asleep`, and `awake` projected from them. |
| 4, 17 | Perception cannot be read by rules. | `perceives` and `attends` projections. |
| 6 | Companions are hirelings or shadows. | One `travelsWith` personhood: joining by relationship, `part_ways`, topics kept. |
| 8, 9 | Dice and time are too coarse. | `dice(entity)` and `Time 0` actions. |
| 10, 12 | Rule order and errors are invisible. | Source positions on compile errors, and documented rule order. |
| 11 | Identical labels are merged. | Merge by command, not by label (see 6). |
| 13 | No tame animals; a dog cannot be petted. | A `tame` temperament, a dog species, and a petting affordance. |
| 16 | No shared laws between modules. | Rules shared from the module's own directory. |

### 4. Orsino content is catalogued but not used generatively

The registry knows 2651 Orsino entries, and 1143 of them are executable. But whole families are only catalogued,
with no generative use. In particular:

- **Barks:** combat barks, NPC barks and personality barks are 18 entries.
- **Settlement-scale content:**
  - npcType: 89 professions and offices;
  - shop: 27;
  - settlementAffix: 11;
  - roomNarrative: 35;
  - trap: 100;
  - wonder: 80.
- **The cosmos:** 15 deities and 10 planes.

The ledger records support levels but not the destination: which generator or system uses an entry, how, and which
test proves it.

**Repair:** extend the ledger with destination, representation, generative use, test and blocker, and close the
families through systems, not catalog rows.

### 5. Narrative text has no home of its own

Prose lives in four places:

- strings inside `.kyr` rules;
- JSON scene tables (`data/generation/scenes`);
- `.kyrt` work templates;
- TypeScript string literals (`Narrator.who`, `RegionWriter`, `ActionFeedbackView`).

None of them records categories, provenance or a selection policy. No tool shows an editor the contexts a line can
appear in. The Narrator's selection is limited to aspect ordering and suppressing repeats.

**Repair:** voice tables in `data/voice/*.json`. Each entry has a kind, conditions, weight and provenance, and is
chosen by an editorial selector that weighs novelty, repetition, moment, temperament and relationship.

A `bin/voice.ts` tool previews any table in generated contexts, deterministically. Kyr `Says` lines remain the
override for authored moments.

### 6. The UI exposes the engine's categories

Commands become choices through:

1. `ChoiceGrouping` (label paths);
2. `ScreenModel`;
3. `Intentions` (Speak, Look, Go, Set out, Yourself);
4. `ChoiceList`;
5. `MenuModel`.

`ChoiceGrouping.insert` finds a node by its label and silently drops a second command with the same label
(`if (node.command) { return; }`), so two doors called "the door" become one. Grouping is by verb category, not by
the subject acted on, so the page reads as an index of the engine's schemas.

The title offers *The Long Man* or *A generated region*: the content pipeline, not the world.

**Repair:** a subject model. Every affordance is attached to the entity it is about and identified by its command.
The page is redrawn around subjects (people, creatures, things, ways), with the situation and what just happened
above them.

### 7. Backgrounds, relationships and knowledge are labels

Two hundred and fifteen backgrounds are "executable" as skill grants, but nothing in the world responds to a
background:

- no recognition;
- no contacts beyond one carrier;
- no professional knowledge.

Kin is an origin's fact about one fellow. The brother recruited through the generic `lead` schema says *"shakes on
it, and is one of you"*, because joining has only one register.

**Repair:** background families that grant knowledge facts and recognition by matching professions. `lead` speaks
in a register chosen by relationship (kin, friend, hireling, stranger).

### 8. Scenario installation separates authored from generated

The Long Man is a campaign of its own. Generated regions install situations and kits, but an authored module cannot
declare what land it needs, so it cannot be placed in a generated world.

**Repair:** the module manifest declares requirements, such as a river valley under a ridge. Frontier expansion can
place a module whose requirements the land meets, and the title begins one world.

## Performance, measured

Measurements were taken in Chromium 1280×800 with nothing else running, on world `thorn`.

| Step | Input to visible |
|---|---:|
| Cold load to protagonist page | 1198 ms |
| Begin (world creation) | 2914 ms |
| Near move (green ↔ shop), four times | 240, 193, 144, 142 ms |

The engine side of one move, measured in Bun:

| Part | Time |
|---|---:|
| Command | 77 ms |
| Feedback diff | 35 ms |
| Screen | 27 ms |
| Narrator | 2 ms |

Three costs sit outside the command:

- **The save.** After every command the worker serialises the whole checkpoint, compiled module included
  (1.8 MB of JSON), and compresses it.
- **The frame.** Each frame carries the full transcript and 120 log entries.
- **The waits.** Travel is held for up to 700 ms by `ReaderApp.journey`, and CSS animations run on every page
  (`page-in`, `arrive`, `slide-in`).

**Repair:**

- remove every artificial wait and animation;
- keep the compiled module out of each save (keep it once per module revision);
- send a lean frame;
- report engine, narration and render times with every frame, so that the latency report separates them.

## The two incidents

- **Willow:** `data/goings-on/fever` places the bark behind `Found by searching road` on whichever road the binder
  chose, whether or not it runs by water. The mother's words point to "the road, by the water". Nothing on any road
  says *by the water*, and searching is an undifferentiated "Search here". **Repair:** plants and materials belong to
  the land (a willow grows on cells by watercourses). Gathering is an affordance where the plant grows, and is named
  once the company knows what it is looking for. The hook is validated at assembly by requiring a reachable place
  where willow grows.
- **Toll:** the lord's riders on the green demand twenty coin, and a spell cast at them starts a fight with three
  level-2 warriors. The page gave no warning that casting would be taken as an attack, nor of what three armed riders
  meant for one person. Death was reported as *No one is left standing*. **Repair:**
  - the danger reckoning is shown on hostile affordances;
  - a fight's opening says why it began;
  - surrender and flight are offered;
  - death is told causally (who, with what, after what);
  - the world continues with a successor.

# Consolidation: milestone reports

19 October 2026. This report covers the program that brought Kyr back to one coherent architecture: one vocabulary,
one authority per property, one way to author a place, and one playable scenario that exercises all of it. Each
milestone is reported under the same six headings. The supporting documents are:

- [audit.md](audit.md): what existed.
- [ontology.md](ontology.md): the canonical vocabulary.
- [play-model.md](play-model.md): space, time and the expedition loop.
- [migration.md](migration.md): repository classification and the plan.
- [doc/authoring/guide.md](../authoring/guide.md): how to author a world.

The tests and the linter check what is claimed here. The test counts are not the evidence. The evidence is what the
tests exercise:

- A new author's region, taken from the guide's text, lints clean and plays.
- One situation behaves causally in two sites.
- Two recorded Serewater histories still replay.
- Real browser journeys run on desktop and phone.

---

## Milestone A: audit and architecture

**What became canonical.** A vocabulary of twelve primitives (Entity, Place, Passage, Thing, Item, Person, Company,
Fact, Event, Offer, Quantity, Time) with catalogs for the mechanical pieces. Each mutable property got exactly one
authority ([ontology.md](ontology.md#authority)). Value precedence became authored > generated > default, with
provenance per field. The responsibilities of Kyr, DEEM, Orsino, situations, campaigns and clients were written down
as what each owns and what each must not do.

**Duplicates identified.**

- Five traversal models.
- Three "physical object with state" kinds plus per-campaign flags.
- Two containment models.
- Four copies of the player company in DEEM tables.
- Seventeen template sets that each re-implemented actors, casting and labels.
- Forty-two relations defined in more than one file, nine of them with different meanings
  ([audit.md](audit.md#duplication-report)).

**Authoring simplified.** No change yet. This milestone produced the target.

**Gameplay made more coherent.** No change yet. It diagnosed the incoherences: Serewater's authored-human Nera
played as a dwarf; the quay counted as "restful"; every move took ten minutes regardless of distance; Orsino's 215
backgrounds were unused.

**What was preserved.** The fact/rule runtime, atomic commands, replay and transcripts, the creature store, the
effect executor, discovery, and the agency planner. The audit found these sound.

**What is unresolved.** Nothing new. The audit's open questions were taken into the next milestones.

---

## Milestone B: canonical vertical slice

**What became canonical.**

- **Language constructs:**
  - `Passage … is kind … taking …`, with 21 passage kinds and real durations.
  - `Item id "name" is kind at place`: one instance, one name.
  - `Company`: the player's actor is declared in the world, not in a DEEM table.
  - On a Person: `Ancestry`, `Calling`, `Profession`, `Background`, `Offers` and `Sells`.
- **Runtime:**
  - Measure-valued changes (`Decrease quantity(actor, gold) by fee(service)`).
  - Computed durations (`Time travelTime(way)`).
  - Rules quantified over existential variables, so a rule can apply to every company.
  - NPC actions that last more than one tick.
- **Shared entity types:** ability, skill, item kind, good, clock, passage kind and service kind are shared across
  installations instead of being namespaced into copies.
- **Cast:** `Cast.person` enforces the precedence rule and records conflicts in `CampaignDefinition.conflicts`.

**Duplicates removed.**

- The player company table copy in `data/sites/shared` was removed. Sites now declare a `Company`, and campaigns
  give a default `party`.
- The party actor tables in the site templates were removed.
- The bespoke `lever` item kind was replaced by Orsino's `crowbar`.
- Item events used to give a second name: "Bran gains 1 Crowbar" for an item called "a pry bar". Now one instance
  name is used everywhere.
- Site-level redeclarations of `gold` and `woodcraft` were removed, now that core declares them once.

**Authoring simplified.** Before and after, the same town:

| | Serewater (`serewater.kyr`, whole campaign) | Reedwake (`sites/reedwake/site.kyr`, town + floodplain + foundry) |
|---|---:|---:|
| Lines | 333 (+121 template, +183 table) | 98 (+16 template) |
| `Initially` facts written by hand | 183 | 3 |
| `route(…)` pairs | 55 | 0 (15 two-way passages) |
| `district(…)` facts | 27 | 0 (containment) |
| Shop stock lines per item (entity, kind, at, soldBy, forSale, price) | 3 lines | 1 `Sells` line per kind |
| Inn | `restful(inn)`, `restful(quay)`, and scene text explaining the rest rule | `Profession innkeeper` |

Serewater's Nera needed nine hand-written facts for three bottles. Reedwake's Nera needs
`Sells healingdraught for 3 coin from 1.` The shop, the price, the stock count, the seller's purse and the item's
name in the pack all follow from that line. [ontology.md](ontology.md#example-one-town-before-and-after) shows the
excerpt.

**Gameplay made more coherent.**

- Authored identity holds. Generated values only fill gaps, and conflicts are reported, not silently applied.
- Distance takes time: a doorway takes ten minutes, the causeway path an hour.
- The two-scale map comes from the same passages that govern movement, so the map cannot disagree with the world.

**What was preserved.**

- Every legacy campaign still loads and plays.
- Serewater's two browser histories replay command for command. Their saved checkpoints were regenerated only
  because item events now use instance names (six labels per history; [migration.md](migration.md#golden-histories-during-migration)).
- Where the new precedence would have changed a recorded history, the never-effective authored field was removed
  so the source is honest: Serewater's Nera and Pell, the roost hound, and Greenhollow's guest and host.

**What is unresolved.**

- Legacy rulesets still carry their own copies of `at`, `quantity` and `watch`.
- The `module` and `adventure` experiments redefine canonical vocabulary. Lint reports this as 7 repository errors.

---

## Milestone C: gameplay loop

**What became canonical.**

- **Overlays.** Nine professions and backgrounds adapted from Orsino's `backgroundModifier` table
  ([data/orsino/overlays.json](../../data/orsino/overlays.json)), each with its Orsino source and an adaptation note.
  An overlay contributes:
  - attribute modifiers;
  - coin (Orsino gold divided by a stated scale of 10);
  - catalog gear;
  - skills;
  - offers;
  - a routine.
- **Gear.** Seven new item kinds come from Orsino's gear list, with provenance: rope, crowbar, thieves' tools,
  shovel, map, bandages and herbs.
- **Needs** ([needs.kyr](../../data/rulesets/world/needs.kyr)): a daily meal.
- **Services** ([services.kyr](../../data/rulesets/world/services.kyr)): lodging, healing, buying goods and camping.

The time scales, the expedition loop and their rules are in [play-model.md](play-model.md).

**Duplicates removed.**

- Rest no longer exists in three forms (`restful` places, rations as an inn fee, `camp_recovery` that heals 9999).
  It is now one service and one outdoor action.
- Skills no longer come from one campaign's background keys. They come from overlays, class and equipment, checked
  in that order, each with its source.

**Authoring simplified.**

- `Profession innkeeper` gives a person a lodging offer and a routine.
- `Background miner` gives a character a shovel and the digging skill.
- Authors write neither the service entity, its fee, nor the skill check.
- The guide's example region shows a new author's inn, chandlery, eel-catcher, ruin and installed situation in
  66 lines of Kyr plus two short JSON files ([guide.md](../authoring/guide.md)).

**Gameplay made more coherent.** Composition tests show that who the company is changes what it can do in the same
world (`test/overlays.test.ts`):

- A locksmith opens the stores padlock.
- A hunter calms the hound.
- A medic sets the broken leg.
- An explorer sees the region's roads on the map before walking them.
- A plain company of fighters cannot do any of these. It pays the hound a ration and goes round.

Food and rest form a loop (`test/expedition.test.ts`):

- The company eats each evening; without food it cannot camp.
- Lodging costs 3 coin, which goes to the innkeeper. It takes eight hours, includes supper, and restores everyone.
- Rations bought at the shop leave the seller's stock.

**What was preserved.**

- The three legacy backgrounds (`forager`, `surveyor`, `pilgrim`) still work for Serewater's recorded parties.
- Combat, abilities and statuses are untouched.

**What is unresolved.**

- Combat pacing: one command still resolves a whole fight.
- Overlays do not advance with play.
- No NPC daily schedules.
- The ferry has a service kind (`passage_fare`) but no action.
- Hunger closes options but does no harm over time.

---

## Milestone D: game-native presentation

**What became canonical.** One screen model ([screen-model.ts](../../src/ui/screen-model.ts)) and one chart model
([chart-model.ts](../../src/ui/chart-model.ts)) feed Mono. The client invents no state and decides no legality.

**Duplicates removed.**

- Chart building moved out of the passage model into `ChartModel`, which draws both scales from canonical passages
  and containment.
- Identical items for sale are shown once with a count, instead of one row per bottle.

**Authoring simplified.** Authors write no presentation. The map comes from `Place … at x, y` and passages. Prices
come from offers. Labels come from instance names.

**Gameplay made more coherent.** Mono now shows the game as a game:

- A bounded viewport with no page scroll, tested at 1440×900 and 390×844.
- A site chart with "beyond" stubs, plus a region strip with travel times.
- An expedition line: coin, rations, when the company next eats, and daylight.
- Offers with their prices; every choice with its duration.
- A company sheet listing each companion's background, what it grants, and its Orsino source.
- An activity strip that reports changes ("coin: 18 → 15") without phantom lines for statuses nobody had.

On phones, the site chart is cropped around the company so it stays readable, and the region strip is hidden.
Screenshots are in [doc/playtests/caught-below](../playtests/caught-below/).

**What was preserved.** The Serewater Mono journeys (`test/mono-browser.test.ts`, `bin/record-mono.ts`) still pass on
three viewports with no page errors.

**What is unresolved.**

- Phones have no separate region view.
- Ability descriptions on the company sheet still show raw formulas ("statMod(#strength) + 1d6").
- Combat presentation is unchanged.

---

## Milestone E: consolidation

**What became canonical.** `kyrie lint` ([bin/kyr-lint.ts](../../bin/kyr-lint.ts),
[bin/campaign-lint.ts](../../bin/campaign-lint.ts)) defines "recommended". A recommended world must have no
findings; legacy worlds are measured. It checks:

- identity conflicts;
- containment;
- passage ends;
- duplicate passages;
- passage kinds that contradict their ends;
- legacy traversal;
- reachability;
- applicability;
- item identity;
- explanatory prose;
- vocabulary redefinition.

`kyrie lint --inventory` prints the concept inventory.

**Duplicates removed.** See Milestone B. The repository classification in [migration.md](migration.md) marks each
remaining duplicate as legacy, with a path out.

**Authoring simplified.** A bundle that generates nothing no longer needs a DEEM template; `generation` is
optional. The authoring guide is executable: `test/authoring-guide.test.ts` extracts the guide's code blocks, installs
them beside the real rules and Caught Below, lints the result (no findings) and plays it:

- Buying at the chandlery.
- Lodging at the inn.
- An hour on the shore path.
- Camping allowed on the strand but not in the village.
- Picking the grille with the locksmith's skill.
- Finding the guest pinned in the ossuary.

**Gameplay made more coherent.** The integration scenario, Caught Below at Reedwake and at Skellfold, is the one
recommended scenario. The causal tests (`test/caught-below.test.ts`) check:

- the freed person walks home by a route that depends on the site;
- the closing water shuts a way at a time set by the map;
- whether the company walked the guest home is recorded, and the relative meets the guest wherever their paths cross.

The browser journeys play both installations end to end.

**What was preserved.** All 15 legacy campaign manifests load. Their golden histories replay, and lint reports
their findings without failing.

**What is unresolved.** The full list, in priority order:

1. **Migrate one small legacy world** (Sanctuary or the Discovery orchard) to prove the migration path is mechanical.
2. **Combat pacing:** level 1 parties still beat level 5 guardians in one command.
3. **Witness reactions:** guards who respond to violence, people who notice absence.
4. **Containers:** `inside` is declared and never used.
5. **Readable sources with their own text:** the player reads the fact a source yields, never the document.
6. **The ferry as a service with a fare and a crossing.**
7. **Lint coverage:** contradictory observations, and sources without text, are not checked. Unbound roles are caught
   at installation, not by lint.
8. **Retiring legacy rulesets and clients** once nothing installs them.

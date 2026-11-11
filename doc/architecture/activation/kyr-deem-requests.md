# Kyr / Deem authorability: what was migrated, what is requested

*11 November 2026. Two isolated migrations out of TypeScript into data, both semantics-preserving and tested; a survey of what else is TypeScript that an author would rather write; and narrowly specified requests, each with a reproducible example. Nothing here changes the Kyr language or a shared architecture.*

## A. Migrated (done, tested: `test/authorable-generation.test.ts`)

### A1. How many works of a kind a country holds: `@count N` in the plan

*Before:* a table in `src/world/history/histories.ts` — `counts = { cistern: 2, weir: 1, galleries: 2, watchtower: 3, barrow: 3, singing_hall: 2, keep: 2, abbey: 1, tollhouse: 1 }` — so a person adding a work plan had to change TypeScript to say "three of these, not one".
*Now:* a header line in the plan's own `.kyrt` (`@count 3` in `barrow.kyrt`), read by `WorkPlans.parse`; one where the plan says nothing. The table is gone; the values are the same, so every generated country is unchanged (`bin/kyrie world ember` before and after differ only by the new posting-house). One bug this surfaced: `weir` was named in the table and in `arts.json` but has no plan file at all; nothing misbehaved because the draw ignores plans it cannot find.

### A2. Whether a section of a Kyr template is written: `if` / `unless` in the template

*Before:* `region-outskirts.ts` had a filter, `x.group !== 'road' || station.station`, i.e. TypeScript that knew which group of a Kyr template only applies where a posting-house exists.
*Now:* `--- road station 1 if station` in `outskirts-deep.kyrt` (the same syntax work plans already used: `--- sign star 1 if greatart`), read by `KyrTemplates.parse`/`choose`. A group left with no eligible option writes nothing. Existing templates are unaffected (the new `choose` parameter defaults to empty; the draw order is unchanged for groups that kept all their options).

## B. TypeScript that an author would rather write (survey; not migrated)

| Where | What it does in TypeScript | Natural home | Cost / risk |
|---|---|---|---|
| `region-renewal.ts` `RegionRenewal.work` | writes, as strings, the Kyr for "a work stands empty; some nights later beasts move in; the innkeeper tells; the company is thanked once" | a `.kyrt` section `renewal` with `{beast}`, `{nights}`, `{thanks}` holes | the beast is drawn by ecology; needs a `{!…}` hole for a computed species and the room's `lair`; medium |
| `region-stock.ts` | decides which bare rooms are dens and which hold a cache; writes the Kyr | a plan header `@stock den cache` and a template for each | the "bare room" test reads structure from parsed Kyr; keep in TS, move only the prose |
| `region-riddles.ts` | attaches a riddle door to any work's `{w}_in` with probability 0.4 | a plan header `@riddle 0.4`/`@riddle no` | tiny; see request R3 |
| `region-fellows.ts`, `region-recruits.ts` | the first town's travellers and their prose | `data/generation/scenes/travellers.json` already holds callings; the prose that composes the sentence is TypeScript | the table exists; the grammar does not |
| `Foundings` | picks a settlement's founding by nearest work and river | already `foundings.json` for text; the *rule* is TypeScript | leave |
| `RegionOutskirts.station` (this branch) | finds the posting-house's id, name and where it lies, for a template | a generic `{!find:plan=roadstation}` template function | small; see R2 |
| `scenery.json` (data) | maps a room to a painting by the words in its name or id | authors cannot say "this room is this painting" in a plan | see R4 |

The honest summary: the *prose* of generated places is mostly already data (`.kyrt`, `.json`); what is TypeScript is the **selection** (which place gets which section) and the **composition** (what holes a template receives). The cheapest large gain is *holes*: a handful of generic template functions (`find` a site by plan, `pick` a name by folk and sex) would let authors write the three or four composition rules that now live in six files.

## C. Requests, each with a reproducible example

### R1. Cross-section conditions in plans (and templates)

*Problem.* A plan chooses one option per group independently, so an author cannot keep the groups consistent with each other. The posting-house's `master` (three stationmasters) and `last` (four endings) are chosen separately, and the pairs are sometimes in tension (the *clerk's* day-book with the *stayed* ending reads fine; the *widow's* with *recalled* implies a seal that two sections both mention).
*Request.* `--- last stayed 2 if master:pedant` (an option of a group is eligible only if another group chose this option), or a `weights` row keyed on the pair.
*Reproduce.* `bun scripts/dump-region.ts kahitude e1 | grep -n "last_scene\|daybook"`; change the seed to `a1`/`thorn` and compare the pairs.

### R2. A template function to find a site by plan

*Problem.* A template for one place cannot name another place without TypeScript to compute its id (`RegionOutskirts.station`). Every cross-place connection is a bespoke TS lookup.
*Request.* A built-in hole `{!site:roadstation}` returning the id of the (first) site of that plan, and `{!site:roadstation:name}`, with the section's `if site.roadstation` using it.
*Reproduce.* `outskirts-deep.kyrt` needs `station`, `stationname`, `stationwhere`; there is no way to write it without `region-outskirts.ts`.

### R3. Plans must be able to opt out of the riddle door

*Problem.* `RegionRiddles` writes a riddle door onto any plan's `{w}_in` passage with 0.4 probability, so an Aenean posting-house had a "speaking door" (a Mathematical Age thing) on its carriage-arch until the entry passage was renamed `{w}_front` to dodge it.
*Request.* `@riddle no` as a plan header (default: as today).
*Reproduce.* Rename `{w}_front` to `{w}_in` in `roadstation.kyrt`, `bun scripts/play-at.ts kahitude mage e1 zzqq`: the offered ways include "look at the speaking door › Press the word “Feather”".

### R4. An author's painting for a room, in the plan

*Problem.* Which painting a generated room shows is a function of the words in its name or id (`scenery.json`'s `kinds`). The posting-house's approach (`w10` or `e1`, a room in the wild) shows `arcadia` (a pastoral road) instead of the ruined arch because its words name no kind; its yard shows `fane`.
*Request.* A `seen as "…"`-style clause on a Place (`Place {w} "…" is room … painted "scene-ruins".`), or a `@painting` header per plan section, so the painter's intent is in the Kyr.
*Reproduce.* `bun scripts/rooms-painted.ts kahitude e1 e1_yard`: `arcadia` for the approach, a generic arch or fane for the yard (the Empire's posting-house is `e1`).

### R5. A scenario that binds to a *work* and fills it

*Problem.* A scenario may claim only a site that is not a work (`world-assembler.ts`: `!w.work`), so "a stranger who pays in old coin, to be taken to the old place" (the `oldcoin` scenario) gets a one-room ruin with nothing in it; it cannot take the new posting-house, which has twelve rooms and the answer to the coin.
*Request.* `"places": { "ruin": { "work": ["roadstation"] } }` in a scenario manifest, with the plan's `outside` kept and its inside either kept or filled by the scenario's module (the existing "taken" mechanism already exists for kits).
*Reproduce.* `data/scenarios/oldcoin.scenario.json` places `ruin` on `site: ["ruin","tower","barrow"]`, which excludes every work.

### R6. Hold-by-kind reads: a documented predicate for "the company has this"

*Problem.* The state `holding(party, kind)` exists but is a rule over `ownedItem(item, member)`; a spec author asking `owns(party, item)` (the obvious name) gets `Unknown predicate`. Three tries to learn `ownedItem(item, member)`.
*Request.* One line in `doc/authoring/guide.md` ("is the company holding this? `ownedItem(item, anyone)`"); optionally a `carries(party, item)` alias.

### R7. A posted limit (load-bearing bridge)

*Problem.* The arcology conception needs "a deck that tilts under what you carry". Nothing in the rules compares the company's burden to a number; a `Thing` can only `need` a capability or item kind.
*Request.* A change `needing weight(party) <= N`, over the existing burden measure (`burden.test.ts` shows burden is already computed).
*Reproduce.* None yet; this is a request for the arcology, not a bug.

### R8. A name from the town's folk in a template

*Problem.* The Hall's cook, boy, keeper and reeve have fixed names (Orla Pennick, Tam, Wystan Hale, Aldous Fenn) because a template has no hole for "a name from the town's people". Fixed names are good for authored recurring characters (a deliberate choice here) and wrong for anyone a template draws more than once.
*Request.* `{!name:folk:woman}`, drawing from `names.json` by the town's folk and sex, so the cook can be an Orla in one country and an Aelfgyth in another while remaining the cook.

### R9. Duplicate words in a way's label

*Problem.* A passage and the room it enters with the same name give "Into the carriage-arch by the carriage-arch" in the choice list.
*Request.* The label generator drops the "by X" when X is the destination's own name.
*Reproduce.* `Passage {w}_front "the carriage-arch" is arch between {w} and {w}_gate` (as first written; renamed in this branch).

### R10. The state-name error is noisy

*Problem.* One bad argument (`Manner eager`) produced a block of unrelated "'closed' is already declared by the shared rules" lines (`closed`, `turned`, `shut`, `seized`, `barred`) that are *not* errors, so a newcomer chases the wrong ones.
*Request.* Print only the errors, not the ones the shared-names check lists as context.

### R11. A painting that depends on the state of the place

*Problem.* A room has one painting (or one of a list by hash) whatever has happened in it: a lit undercroft and an unlit one are two paintings, but only one is shown (`scene-undercroft-dark`; the lit `scene-undercroft` is unmapped); a spiders' brood is painted whole after it has been burned (the 10 November commission list, item 2).
*Request.* `scenery.json` kinds accept `when`: a fact or state name, with the painting list for each (`"room": {"dark": ["scene-undercroft-dark"], "lit": ["scene-undercroft"]}`), read from the same relations the page already reads for darkness.
*Reproduce.* `bun scripts/rooms-painted.ts kahitude s1_manor_cellar`, then light a torch in it and run it again: the painting is the same.

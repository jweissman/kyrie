# Mission 12: why the architecture is as it is now

The [diagnosis](diagnosis.md) found eight boundaries in the wrong place. This says where each now is, and why there
rather than elsewhere. Each decision keeps one rule from earlier missions: the world (Kyr) says what is true, and
everything the player reads is chosen from what is true. No language model is in the runtime.

## 1. A happening is a fact about the world; how it is told is data

**Before.** What a join, a farewell or a pat sounded like was a `Result` string in a Kyr action: one sentence for
every brother, hireling and stranger.

**Now.** The world reports changes. `src/narrative/happening.ts` reads them as happenings (join, part, follow, greet,
pet, turn, thank, object, refuse). `src/narrative/voice-context.ts` says what is known of the moment (bond, manner,
species, role, hour, shelter, first time or again). The voice tables (`data/voice/*.json`) hold lines for those
circumstances, and the most specific fitting line is told. Orsino's combat barks are rows of the same tables, so
there is one mechanism for everything said of anyone.

**Why here.** A line about a brother belongs neither to the recruit action, which every companion uses, nor to the
brother's module, which would then need a line for every happening. A table keyed by circumstance is written once
and said of many, can be reviewed in every person (`bun bin/voice.ts review`), and can be tested for coverage.

## 2. A settlement is planned as people, then written as Kyr

**Before.** Settlements were an inn, a shrine and a shop, with prose about the people who lived there.

**Now.** `src/world/community/community.ts` plans each settlement's residents, households, workplaces, animals, water
and one small trouble, from the country's trade and folk. `community-writer.ts` writes them as Kyr people, places,
topics and rules. A resident's day (at work, at the inn or at home of an evening, indoors at night) is a world rule
on `hour(clock)`. What a trade knows of the country (where the willow grows) is a topic.

**Why here.** A plan in TypeScript can be tested for its shape (every resident works where the work is); the Kyr it
writes makes the plan true in play, with the same rules as any authored person.

## 3. Kyr says more, so modules write less

Local kinds and species, world-time conditions, perception (`perceives`, `asleep`, `alert`), a die for each thing,
acts that take no time, ways that open only while something holds, and arithmetic at run time were added to the
language, not to the engine's TypeScript. Each one replaces bookkeeping an author was writing by hand (three bespoke
movement actions per door, a measure per step of a fare). Each is lowered into the facts and rules Kyr already ran,
so the runtime keeps one execution model. The response to each authorability finding is in
[doc/authoring/findings-response.md](../../authoring/findings-response.md).

## 4. The reader shows subjects, not the engine's categories

The reader lists who and what is here, each with the things that can be done with them, then the ways, then
yourself. A choice is identified by its command, never by its label, so two doors with one name are two choices. No
choice waits for an animation. These are presentation decisions over `src/ui/scene.ts` and
`src/ui/choice-grouping.ts`; the engine was not changed to make them.

## 5. Orsino is used where it can run, and accounted for where it cannot

Orsino's wonders and traps are translated into Kyr's effect language by `src/registry/orsino-world.ts`
(`data/generation/scenes/orsino-world.json`). How each is met in a country is not in Orsino: which wonders stand in
the wild and which indoors, what laying a hand on one is like, how a trap is understood and made safe. That is
written by hand (`wonders.json`, `snares.json`). The generator draws only what Kyr can run, with no trap above a harm
cap. Every Orsino entry's status is computed from what Kyr has and draws (`bun bin/orsino-registry.ts inventory`),
never written by hand, so the inventory cannot claim what the game does not do.

## 6. Paintings are read from the images

`bin/paintings.ts` reads every image in `assets/images`: its own embedded metadata, its dimensions and a hash. It
writes the registry and a small copy for the page. A painting is shown beside a person only if its concept is a
person (`Likeness.people`). Attribution comes only from what the image says of itself.

## 7. Authored and generated are one world

The title page offers to go on or to begin again, in a country; it does not offer "The Long Man" against "a
generated world". An authored country says where it may stand (`data/adventures/countries.json`: beyond which side
of which kinds of country). The frontier places it there, once, the first time a company reaches such a march. Its
clock counts from when it is reached (`ClockShift`). The Long Man still plays alone as a campaign, from the same
files with its own company.

## 8. The country is the same whoever comes into it

The region is written in several files, with who comes into it in a file of its own. The country can then be parsed
while the protagonist is chosen. Two things follow from that one boundary: begin is faster, and the country no longer
depends on the protagonist in any way (`test/world-assembly.test.ts` checks it).

# Authoring workflows that work, end to end

Mission 19's journey 5 ([brief.md](brief.md) §XII): change a definition or template, generate a result, inspect it,
validate it, and meet it in play, without touching the engine. Each workflow below was done during the mission, on
the commit named; the commands are the ones run.

## 1. A town template: a calling's own way into the first town's jobs

*What it is.* `data/generation/town/undertown.kyrt` is Kyr with holes (`{t}` the town's id, `{town}` its name,
`{{t}_merchant}` whoever keeps its shop), filled for every generated village and town by `KyrTemplates`. Its three
jobs (rats, the dead, spiders) are ordinary Kyr: places, passages, things with states and changes, people, topics,
rules, objectives.

*The change* (d7ceb585). Each job's locked way became a lock on the way, in the authoring guide's own idiom
(`Thing … on <passage> { State locked blocking …; Change pick … needing lockwork }`); the job-giver's topic asserts
`keyholder(actor, <lock>)`; a `Change wrench … needing brawn` on the corn-store's; a rite of rest at the ossuary
(`Action … Requires … capable(actor, rites) … Resolve check(actor, rites, dc_fair)`), and an `Observe … when
capable(party, lore)` that teaches a fact an `Action` then requires. Then (32b84f9d) `Change pinch … when not
at(raiser, ossuary) or not able(raiser) "…"`, so the candle is not pinched out under its raiser's hand.

*Generate and inspect.* `bin/kyrie world a1` lists the country's towns; `bin/kyrie play --world a1 --as
human/thief/Wat "To the landing at Lowmouth" "zzqqxx"` ends by listing everything offered at the landing, among it
`To the old corn-store — pick the corn-store padlock`; the same as a warrior lists `Wrench the padlock's hasp…` and
no pick. `bin/kyrie play --world a1 --as human/cleric/Wat … "To the ossuary" "Say the rite of rest"` prints the
check and the result.

*Validate.* The template is parsed and compiled with every world (a mistake fails `bin/kyrie world`); `bin/kyrie
lint` for authored modules; `test/undertown-callings.test.ts` holds the four callings' ways; `bun
scripts/redigest-trace.ts wren-tower-climbed` re-records the kept trace and says whether play itself changed ("it
comes where it came").

*In play.* Every generated village and town has them: the browser, `?world=a1`, a thief at Lowmouth.

## 2. A table: what each trade sells

*What it is.* `data/generation/tables/trade.json`, a Deem table: which merchant a settlement's trade supports
(`tradeMerchant`), and each kind of merchant's role, shop, scene, stock (item, price, how many) and what they buy
(`merchantType`).

*The change* (1eb58ad4). A salter had sold rope, torches, a lantern and oil, as every merchant did from when a
town's merchant was its only shop; since every village and town now has a chandler, each trade stocks what it
makes or plausibly keeps: a salter provisions, pitch torches and rope, a furrier bedrolls and rope, a woodwright
poles, torches and a handaxe, a smith iron, and the torches, lanterns and oil of a forge (56617685, after the long
descents, which buy there, failed on CI).

*Generate, inspect, validate, play.* `bin/kyrie play --world a1 --as human/warrior/Aud "To the landing at Lowmouth"
"To Mik's salt-house" "zzqqxx"` lists `Buy › A ration`, `Buy › A coil of rope`, `Buy › A torch` and no lantern; `test/generated-economy.test.ts` holds that
whoever sells a lantern sells oil; the bundle index is rewritten by `bun run web:build`; in the browser Bask at
Millholm sells rations, rope and torches, and the lantern is the chandler's; `KYRIE_LONG=1 bun test
test/descent.test.ts` plays the four long descents that buy from these shops.

## 3. A naming rule: whether a townsperson is a woman or a man

*What it is.* `data/generation/tables/names.json` holds the townsfolk's given names by people (`townsfolkName`),
unsexed; `data/generation/scenes/folk.json` holds given names by people and by sex.

*The change* (8a5dd206). A new Deem table `townsfolkSex` (name endings for women's and men's names) beside them,
read by `RegionPeoples.sex`, so a townsperson's pronoun follows their name where the name says it (a woman had been
called Rurik: OWN-51). An author extends it by adding endings, or names to `folk.json`'s lists.

*Validate.* `test/region-peoples.test.ts` checks eight countries' townsfolk; no one is renamed (the pronoun stream
draws as before), and the kept trace comes where it came.

## What does not yet work as an author would want

- **Languages.** Place and people names come from the `languages` package, pinned by git commit; changing a
  grammar, a root or a morphology means changing that repository and re-pinning it. Nothing in this repository
  previews a language's output (`bin/kyrie names` checks surnames for clashes; it does not generate).
- **Creatures, plants and animals.** A species is a JSON entry (`data/catalog/species.json`), seen at once in the
  Encyclopedia and the handbooks (`bin/kyrie species`, `bin/kyrie forecast`), but where it lives and is met is
  decided by tables and TypeScript in `src/world/` (dens, the wild's meetings template is the exception), so a new
  creature is not met in play without a code change.
- **Spells and effects.** Spells come from Orsino's registry (`data/catalog/orsino/`, generated) or hand JSON;
  Kyr cannot define one, only teach one (`Resolve teach`).
- **Most generators are still TypeScript writing Kyr as text** (the handoff's §8): the undertown, the works and the
  wild's meetings are templates; the settlements, roads, deep sites, market and fellows are not.

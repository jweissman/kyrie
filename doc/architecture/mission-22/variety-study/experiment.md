# Three causes under the corn-store: the experiment (M22, 18 November 2026)

The small experiment of the variety study (`report.md` §8), approved by the owner on 18 November: "yes I do think it makes sense to start adding variations to the early game as much as we can, but there's definitely a more general point about variability and enabling deeper Kyr/Deem interactions." Register: OR-84 (this experiment), OR-85 (the general point).

## What was built

Two new options of the existing `store` group in `data/generation/town/undertown.kyrt`, beside `store rats`. Each is a cause of the same visible trouble (losses from the merchant's locked corn-store), not another creature.

| Cause | Weight | What is wrong | Crux family | Shown before the crux | Crux acts | Clock step (said where the company is) | Consequence facts, and who reads them |
|---|---|---|---|---|---|---|---|
| `rats` (as before) | 12 | a nest under the store | confronting | droppings, gnawing, the run to the drain | two fights; or ratsbane, Sleep, a firebomb | none | `grateful`; the merchant's favour |
| `apprentice` | 1 | the merchant's apprentice lets a buyer's men up the drain by night, and the merchant blames rats | investigating, then influencing | the merchant's "never a hole gnawed in one of them"; the lad's "I'd not go down there"; no droppings and a swept path (anyone); a greased bolt (lockwork); sacks on the landing at dawn (the innkeeper) | wait in the cellar after dark (needs one of the clues); then march the lad up to the merchant, or talk him round (persuasion) | about thirty hours after the job, unwatched, the lad runs with the seed-corn: "Word goes round {town}: the apprentice of {merchant} is gone in the night…" | `apprentice_exposed` (merchant pays 10, `grateful`, a favour later; innkeeper: "turned the lad out in a nightshirt"); `apprentice_kept` (merchant pays 6 "for a thing I'm not to know"; the lad tells how to pass the drain's centipede; innkeeper: "the rats just stopped, they say"); `apprentice_fled` (4 coin for having known; innkeeper: gone in the boat) |
| `runaway` | 1 | a girl run from the mill lives in the crawl behind the cellar wall, on the merchant's grain | protecting and tending (an exchange of bread, or words) | sacks slit "as a knife slits"; a crust on the trapdoor's edge; no droppings; a child's bare prints (anyone); the priest's girl gone from the mill; the girl with a stone in her fist, "down the hole at the back if you come a step nearer" | hold out bread (a ration) or tell her you are not the mill's (persuasion); then send her to the priest, or take her up to the merchant | the merchant says it when giving the job ("Two days, mind"); unanswered, the poison is laid and she is gone: "Word comes round {town}: {merchant} has laid poison under the grain…" | `runaway_sheltered` (merchant pays 10, `grateful`, "the priest's girl sweeps it out for a loaf"; priest: "She has asked twice whether you will come back"; the girl tells the ring of letters on the drain's keystone, the vault's puzzle); `runaway_handed` (merchant pays 10; priest: "Back at the mill. You did what you were paid for."); `runaway_lost` (merchant pays nothing; priest: a girl on the road at first light) |

Each new cause has its own notice line, its own scenes for the store, cellar, crawl and drain shelf, and its own names for the crawl and the shelf (the rats keep "the rat-runs" and "the nest"; the cellar and crawl scenes that spoke of droppings and gnawing moved from `base` into `store rats`). Neither has a fight. Each finishes the job by asserting `{t}_u_done({t}_u_onward)`, so the undercroft, the vault and the barrow beyond are reached as before. Each pays a lantern and oil where the rats did, and gives a milestone of 120 experience in place of the rats' 180 from fights.

**Why not "driven up".** The report itself judged it weak: still a fight, only deeper. §9's rule that a cause must move the crux family put it out; the runaway puts the crux in protecting and tending, a family no first-town job had.

**The golden route.** Iscoed keeps the rats by a fix, not by luck: the atlas country `iscoed` says `"fix": { "undertown": { "store": "rats" } }` in `data/imbar/atlas.json`, so iscoed, iscoed3 and iscoed4 are held. The first-hour cold-play transcripts (`test/iscoed-cold-two`, `test/iscoed-cold-three`) pass unchanged.

**TypeScript (small, and needed).** The `.kyrt` draw had no way to be fixed, and `if`/`unless` conditions were never given the town's values by the undertown writer. Three small changes, no grammar, no kit:
- `KyrTemplates.choose` takes `fix` (group to option) and writes the fixed option in place of the drawn one. The draw is still made, so the groups after it draw as they did. (`src/world/kyr-template.ts`)
- `StrategicAtlas.fix(region, template)` reads a country's `fix`. (`src/world/strategic-atlas.ts`)
- `RegionUndertown.lines` and `noticed` pass it. `lines` also takes a `fix` argument for a test that writes one town's undertown directly. (`src/world/region-undertown.ts`)

**Fixing the draw for tests.** A test that writes a town's undertown directly passes `fix`. A test that walks a whole generated world picks a seed that draws the cause: m1 and s8 draw `apprentice`; mere, cov7 and kin draw `runaway`. Each pin asserts what it finds there (the notice's words), so a change of weights fails loudly at the pin. Fixing the draw for a whole drawn world (in `Drawn`, kept in saves) was not done. It would be the next step if the weights rise (see below).

**Weights, and why 12 : 1 : 1.** The options are drawn in the order they are written, and the new two come first. At 12 : 1 : 1, every world the suite walks the corn-store in still draws the rats, and their generated Kyr is the same line for line (sorted lines hashed for a1, kite, thorn, b2, ember, kahitude, wren and iscoed, before and after). The new causes then come to about one first town in nine (measured below). This is a choice made to keep the experiment from moving some twenty-five specs that walk the corn-store's rats in kite, thorn and kahitude. A higher rate (say 4 : 1 : 1, one town in three) would need those specs to fix the rats. That is a decision for the lead.

## Pins

- `test/features/choice/store-apprentice.pin.test.ts` (m1, a thief): the notice and the merchant's words; the swept path seen in the cellar, with no ratsbane, Sleep or firebomb offered; the night's watch; from one save, the lad talked round (paid 6, then he tells of the drain's centipede) and, in a second, marched up (paid 10, gone from the shop); no attack made in either; from a third save, kept from just after the job is given, the lad runs within two days, told at the salt-house.
- `test/features/choice/store-runaway.pin.test.ts` (mere, a warrior): the notice and the merchant's two days; the bare prints; the girl's warning; bread held out; from one save, sent to the priest (paid 10, she tells the letters, the priest says she asks after you) and, in a second, taken up to the merchant (the priest: "Back at the mill"; paid 10); no attack in either; from a third, left alone, the poison is laid, said where the company stands, and she is gone from the crawl.

Each pin is one world load (17 to 31 s), the other branches forked from its saves.

## The measures (§8)

1. **Distinct signatures.** Met.
   - Three (cause, crux family, consequence) signatures: (rats, confronting, gratitude); (apprentice, investigating then influencing, exposed / kept / fled); (runaway, protecting and tending, sheltered / handed / lost).
   - Two crux families besides confronting.
   - Across 200 seeds' first towns the draw came to: rats 177, apprentice 16, runaway 7 (seeds v0 to v199, each world's first settlement s1; the weights predict 7 % for each new cause). The new causes come to about one first town in nine.
   - Among the census's five fixtures (a1, kite, thorn, b2, ember) all draw the rats, by the weights chosen above. m1 and s8 draw the apprentice; mere, cov7 and kin the runaway.
2. **Capability difference.** Partly met.
   - In each new cause two crux acts resolve it, with different consequences. The apprentice: marched up (no check) or talked round (persuasion). The runaway: bread (a ration) or words (persuasion). Both pins walk both branches.
   - A calling tilts the act, without being shut out. Persuasion favours a bard or a thief; a warrior with no persuasion still has the march or the bread. The thief's lockwork shows the greased bolt; anyone sees the swept path or asks the innkeeper.
   - Not measured: whole journeys of two callings each, recorded with `bin/kyrie read record`. The pins walk one calling per cause.
3. **Readable cause (blind readers).** Not run. It needs cold readers given transcripts; nothing headless stands in for it. The pins' branches are the transcripts to give them.
4. **Development seen.** Met in both delaying walks (2 of 2). The flight and the poison are each said in the response of the act that crossed the hour, where the company stood (the salt-house), before the consequence is read. The runaway's clock is also said when the job is given.
5. **Coherence.** Met, by reading and in both pins.
   - No payment before the cause is resolved: each pay topic requires its consequence fact (`exposed`, `kept`, `fled`, `sheltered`, `handed`, `lost`).
   - Every clue is guarded by `not {t}_u_done(job)`: the apprentice's lie, the swept path, the greased bolt, the by-day sign, the innkeeper's dawn sacks, the prints, the priest's missing girl. Her warning holds only while she is in the crawl and untrusting.
   - The cellar is lit while the lad holds the lantern there (it had said "pitch dark" with the light in his hand), and dark again when he goes.
   - The runaway's greeting is set (`Manner stoic`). A drawn "proud" manner had her say "I don't know you" at the shrine to the company that sent her.
   - Not met: the hasp torn out of the corn-store door is noticed by the merchant (base), but the docking and mending that follow are the rats' only. A torn door goes unanswered under the new causes.
6. **Cost.** 93 lines of Kyr for the apprentice, 95 for the runaway (the rats are 95), not counting comments. With the two pins, the fix and the measures, about a working day for the pair. Most of the time went on the prose gates (below) and on finding what the runner offers where.
7. **No regression.** Met.
   - The census's regions (a1, kite, thorn, b2, ember) are unchanged by construction: their generated Kyr is the same lines as before. So are kahitude, wren and iscoed.
   - The towns that now draw a new cause, census before and after (4 policies × 60 acts): identical to the last figure in m1, mere, s8 and kin (repeat 18 / 10 / 11 / 10 %, dead 15 / 17 / 13 / 25 %). Not worse, but it shows nothing: the census's unguided walkers never take the corn-store job in 60 acts, so they never meet the new causes. The census cannot see this kind of variety (as the report's §2.5 says), and measure 3 is what can.
   - The first hour's prose ratchets are held: clause load 1026 (held 1026) and empty words 264 / 79 / 9 (held). Fourteen new sentences were rewritten to meet them, and seven that named nothing ("whatever is at the grain").
   - The specs that walk the corn-store, the undertown and the changed seeds pass: the undertown specs (8 files, 21 tests), and 20 more files on m1, mere, s8, kin and cov7, iscoed's cold plays two and three, newcomer, the laboratory and the template (108 pass, 2 skipped, 0 fail). The laboratory fixture was regenerated: the same lines, reordered.

**Judgment.** By §8's rule, adopt. Measures 1, 2 (in part), 4, 5 and 7 hold, and nothing in the new causes is resolved by the rats' acts. Measure 3 is still owed, and it is the one §8 says decides whether to drop. Next, in order: blind readers on the pins' transcripts; then the weights, with the corn-store specs fixed to the rats; then causes for `yard` and `pit`.

## What the lead should know

- The weights hold most worlds on the rats, by design. Raising them is the owner's call. It means fixing the rats in roughly twenty-five specs on kite, thorn and kahitude, or carrying a fix in `Drawn`.
- The new people are peaceable, but nothing stops a company attacking the girl or the lad. A fight with a child in the crawl would be ugly. No first-town person is protected that way today.
- The hasp's docking under the new causes (measure 5) is a small follow-up.

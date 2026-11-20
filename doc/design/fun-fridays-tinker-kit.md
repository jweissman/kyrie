# Fun Fridays: the tinker kit, a design assessment (20 November)

The owner's brief: a practitioner of a profession at characteristic work, and an opportunity for the player to take
part. Tinkering first, written so that the same approach later serves a carpenter, a cook, a shepherd or a physician.
It should vary the practitioner, the work, the difficulty, the social occasion, the outcome and the language. The
profession should exist apart from the pin, and an opportunity should arise and pass.

What was built: `data/kits/tinker/`, one kit of the existing composition system (src/world/compose). It is placed
three times in Iscoed by the atlas's new `kits` (data/imbar/atlas.json; StrategicAtlas.kits, appended to the
framework's kits in WorldAssembler). It is proved through the runner by test/features/pleasure/tinker-kit.pin.

## The pattern, as the kit states it

- **Activity pattern and roles.**
  - The kit's slots bind a settlement with no occasion of the craft yet, and its square, from the assembly ledger.
    `settlement(?town)` requires `not practisedIn(?town, tinkering)`; the square is `square(?town, ?market)`.
  - It provides `practisedIn(?town, tinkering)`, a new assembly relation (data/assembly/vocabulary.kyr: `Kind craft`,
    the craft `tinkering`). So a second placement of the kit takes another town.
  - Who is at the work is a proposal Deem makes from the kit's table (`tinker_practitioner`): travelling, apprentice or
    master.
  - Each proposal installs its own module: the practitioner, the work as a Thing with states, the interventions, the
    consequences.
- **Constraints.** Each act requires the practitioner present and the work in its state. Some interventions need a
  competence: `needing lockwork` on a Change, or a check of insight, persuasion or mending. Improvising needs something
  the company carries (`holding(actor, torch)`).
- **Consequences.** States change, and rules said where the company is mark the change. The world remembers by
  Observes of what was done. A fact taught opens the trade (`trade_open`). Nothing pays coin or experience, and nothing
  is an aim.
- **Passing.** Every occasion ends on the clock. The travelling tinker packs up at six and goes on by his road, and what
  he leaves is left unmended. The apprentice's bench and the master's stall are shut at five. No permanent icon stays
  over any tinker.

## The three instances, and how they differ

| | Porthalen | Wrackham | Gatesend |
|---|---|---|---|
| Practitioner | travelling, **generated**: name, tools and road drawn (travelling/tables.json; in this world "Brother Wil") | Tomos Bevan, an apprentice of fifteen, authored; his mistress Eira Ffowc away across the town | Nest Cadwgan, a master of the city guild, authored, the guild's stamp on her tools |
| Work | a child's clockwork bird, its spring out | a hurdy-gurdy whose wheel he glued crooked | the harbour lantern, its burner collar cracked |
| Difficulty | another pair of hands; the spring tried oneself (a check of lockwork); coiling it unaided only for one with lockwork | an unfamiliar fault to diagnose (insight), a nervous boy to steady (persuasion), or the master fetched | a missing part: found in her salvage (insight, hard), improvised from a torch the company carries (mending), or cut from brass (lockwork) |
| Social occasion | friendly; a child waiting | an embarrassed apprentice | a master asking to see competence; a boy waiting |
| Outcome | the child's bird sings; "Many hands"; a fumble is a shared laugh; unmended if he goes first | he mends it himself and waves after; or his mistress does, and he will not look up | the lantern lit; a torch spoiled and the lantern late; or a season's place at her bench offered (a fact the company knows) |
| Language | profession-ordinary lines with the generated name ("Springs, mostly … the little things wait for me") | his own ("My mam traded Mistress Ffowc a pig for the first year") | her own ("They stamp your tools when you can make the tools") |

## Judged

1. **Does each instance feel charming and particular?** Mostly, yes.
   - The bird and the girl, the boy going red to the ears, and the master's "You've hands" are particular, and each is
     met through the ordinary rows.
   - The weakest is the generated tinker. His lines are the profession's, his name a draw. He reads as a pleasant type,
     not a person. That is the brief's intended contrast, but the contrast shows.
2. **Does the pattern produce meaningful variation?** Partly.
   - Across the three kinds it does. The participants, the interventions, the competences that matter and the
     consequences all differ.
   - Within a kind there is little. The work is fixed per kind (the travelling tinker always has the bird). Two
     travelling tinkers in two worlds differ in name, tools and road, not in what happens.
   - A second dimension of the work needs a proposal for the work and modules written per work. The composer can
     already do this (`when` over two dimensions), but every pair of kind and work is authored. That is the
     combinatorial cost.
3. **Does it help establish professions as real activities across the world?** A start, not yet a model.
   - The craft is a fact of the assembly (`practisedIn`). Its competences are the existing skills: lockwork, mending,
     insight, persuasion. A master who offers a place at her bench is a credible first step from helping to
     practising.
   - But the profession itself is not an entity with competences, tools, practices and a guild. The kit names them in
     prose.
   - Wrackham already has a generated Elfred "soldering a hole in a kettle" on its square. He is a tinker in all but
     name, and the kit cannot see him (below).

## What is already expressible

- Slots bound to the ledger, Deem proposals choosing modules, and imports to the bound places all work: the composition
  system did all the placing, so there is no parallel pin generator.
- Deem labels give a generated practitioner a name and particulars, read in Roles and prose as `{tinker}`, `{tools}` and
  `{road}`.
- A piece of work is a Thing with states and Changes. Changes are gated by who is present (`when at(tinker, market)`,
  with the reason when not) or by a competence (`needing lockwork`), as the pump and the cutting's roof are.
- Checks colour or decide an intervention. Otherwise gives a failure its own telling.
- Rules said where the company is give thanks. Observes by state make the world remember.
- Facts taught make an opening. Clock rules make the occasion pass.

## What is awkward to author

- **The work per kind.** Each pair of practitioner kind and work is a module of its own. A shared module whose Thing
  and texts come from Deem (the work drawn, its parts named) would need Kyr prose built from labels: possible for names,
  clumsy for whole descriptions.
- **Opportunity windows.** "At the square from morning to five" is written as rules that retract presence. A
  practitioner's day (at work, at home, gone on) is the same few rules in every module.
- **Names that collide with the shared rules.** `shut`, `searched`, `learned` are taken and warned of. Every author
  meets this.
- **Placing in one country.** The atlas's `kits` is new (this commit). Before it a kit was placed only by a framework,
  in every frontier world, or not at all.

## Reusable capabilities genuinely missing

1. **People in the ledger.** The assembler knows places, roads and powers, not people. The variety study found the same
   (mission-22/variety-study/report.md §4).
   - So the kit cannot bind an existing practitioner: Wrackham's Elfred, or Hesper Lowe, whose mended pump is the same
     pattern authored by hand (data/generation/town/neighbours.kyrt, test/hesper-pump).
   - It makes its own person instead. Folding Hesper in as a realization of the kit wants exactly this: her town
     template to commit `practises(hesper, tinkering)` and the kit to bind `?practitioner` to whoever practises there.
   - So she is left as she is, and named here as the kit's fourth realization once people are in the ledger.
2. **A profession as an entity.** Its competences, tools, products, practices, transmission and institutions (a
   guild), as directions §7–§8 ask. Competence, profession and office are kept apart: lockwork is a competence,
   tinkering a profession, the guild master an office.
3. **A practitioner's day**, as a reusable routine: at work in hours, gone on, shut. It would make an opportunity's
   arising and passing a declared property, not hand-written rules.
4. **The page drawing a pleasant occasion forward in its hour.** The glance's attention is for aims and dangers. These
   are rows among a busy green's, found by looking.

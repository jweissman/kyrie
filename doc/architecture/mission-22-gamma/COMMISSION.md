# M22-gamma: the civilizational atlas (a commission, 24 November 2026)

The owner's direction of 24 November ([doc/design/direction-2026-11-24-civilization.md](../../design/direction-2026-11-24-civilization.md),
kept whole) organised into gamma's work. It is not beta's work. Beta implements only its six narrow proving cases (§7),
in the sprints they belong to, and its active queue is not enlarged by them.

**Success:** any newly generated Westernesse world is recognizably part of the same civilization, but remains
meaningfully different to explore. Canonical anchors constrain the world; they do not make every seed the same map.

**The order:** the contract and its validator before the content. Each package lands first as a census that reports
what is missing or contradictory (never silently omitting it), then a small proving set of content, then growth.

## 1. What exists to build on

- **The world's shape** (data/imbar/shape.json, src/world/world-shape.ts): great regions placed by rule over the grid of
  countries, never by a coordinate (the Eastern Ocean and Southern Sea as archipelago, the Great Desert, the Southern
  Continent). A country in a great region is drawn with its terrain.
- **Canonical seats** (src/world/seats.ts, WorldShape.seat): a canon identity built in a generated world, in the
  country its seat names, as that country's chief town; things point to it wherever this world built it. One seat so
  far: Dun Rìerdan (`dun_ri`, north of the first country), with its waystone and the royal game-warden's career.
- **The land:** generated countries of cells (Land, Heights, Drainage, LandCover, Geology), with cover kinds (sea, lake,
  fen, meadow, wood, heath, fell, peak) and terrains given by region (temperate by default, desert, mountain, marsh,
  frost, archipelago). These are not the owner's eight terrains, and the mapping is the first piece of work (G0).
- **Settlements:** generated towns, villages and hamlets, and the canon's city by its seat. No scale is modelled apart
  from a name's word, and population, habitation and mobility are not facts.
- **Peoples:** ancestries include human, elf, dwarf, gnome, half-orc, lizardfolk, catfolk, fae, birdfolk, undine and
  sylph. Fishfolk and orcs as peoples are not there yet.
- **Materials:** data/catalog geology.json, materials.json, gems.json and animals.json, with Geology depositing in the
  ground.
- **Paintings:** the registry (provenance and copies), seen.json (what each shows, its light and weather in the
  scenes' words), scenery.json (a place's painting by its kind's words, or an author's choice). There is no terrain or
  subject axis, and no idea of one place's variants.
- **Wonders:** "Wonders and traps" in the feature map (OR-353). Discovery is a Kyr construct. A Wonder is not.
- **Undertakings:** aims, jobs, the gold thread, an undertaking's hand-off and aftermath (OR-179, closed). There is no
  nesting and no recognition of an aim met without being followed.

## 2. The packages

Each is a register row (deferred to gamma), and each is in the feature map as a capability with no pin yet.

| Row | Package | Contract (rung 1–2) | Proving set |
|---|---|---|---|
| OR-450 | **G0 + G1. Terrains and the settlement matrix.** The eight principal terrains as an ontology over the generator's terrains and covers; settlements with scale (hamlet, town, city, metropolis) apart from population, habitation (living, ruined, empty), mobility (fixed, migrating) and institutional complexity | A census over seeds: each world has a distinct settlement for each of six terrains × four scales (24), extending to 32; no two differ only by name (their institutions, materials, activities and painting differ). It reports each combination missing, and why | Three combinations drawn and different in play, one of them nonstandard (the mobile Encampment, the Necropolis or the Academy) |
| OR-451 | **G2. Canonical cities.** Named anchors (Aline, Marith, Dun Rìerdan, Garzab, Ydgn (Andayeen to Northerners), Miyan, St. Thera's Reach) as canon identities with geography, institutions, material culture and visual assets, seated by rule (seats.ts), never by coordinate | Same seed and compatible content give the same identities, placed where their geography allows; an anchor that cannot be placed is reported with its reason | Aline (coastal, near the start) seated beside Dun Rìerdan |
| OR-452 | **G3. Relational pins.** A required relationship between places (passage, commodity, institution, history, dungeon, landmark) declared and assembled. A pin is a route through the ordinary travel, economy and rules, with its costs, time, hazards and permissions; teleportation only by the supported rules, never for a city merely known | The census finds each pin executable: a route exists and is priced. Traversal: a headless journey takes it | Aline → Dun Rìerdan: passage booked in Aline, sailed or ridden, paid for and risked |
| OR-453 | **G4. The biome census.** The owner's terrain correspondences (adapted people, gem, demonym, animal, materials) as default data, each kind of fact with its own measure: demographic (a majority-adapted default with its justified exceptions), ecological (possible and discoverable), geological (grounded in deposits, production or trade), cultural (in names, heraldry, dress, ornament) | A census of distributions, absences and exceptions over seeds, each exception with its reason (a port, a capital, a diaspora, a conquest) | One terrain whole (coast, say): fishfolk, Sea-folk, the octopus, lapis, shell and pearl, met in its settlements, markets, words and paintings |
| OR-454 | **G5. The visual atlas.** Assets indexed terrain → subject (overview, shelter, hamlet/town, city/metropolis, wilderness/pastoral, wonder) → canonical place or archetype → season → weather → light, filled selectively; a canonical place's variants keep its geography and buildings | A coverage report per terrain and subject, its holes named; each place's variants proved one place (bound by its identity, not by its words) | The coast's six subjects; one canonical place in two lights |
| OR-455 | **G6. Wonders contributed.** Each substantial authored adventure, and the generated settings, contribute one or two wonders or other independent world elements, discoverable without taking up its story; never a quota of interchangeable glowing things | Each adventure's lint reports its wonders; each is reachable and discoverable without the adventure's undertaking | Two adventures given theirs |
| OR-456 | **G7. Assembly, census and traversal.** Deem assembles the anchors, pins and matrix; one census runs all of the above over many seeds; automated and cold players reach, enter and use the principal settlements and pinned content with no developer shortcut (a random walk cannot prove a city exists, so census and traversal are both needed) | `bun run civilization` (or a quantity measure): deterministic, by seed, reporting what is missing or contradictory | The census at the proving sets' coverage; one cold-play journey to Aline |
| OR-457 | **G8. First Aims across the continent.** The beta proof's nested aims (OR-443) extended to horizons that the pins make executable (find Dun Rìerdan, explore the southern continent, shape the wider world), available, followed and achieved apart | Every aim's achievement is a world fact, recognized however it came about, rewarded once | "Find Dun Rìerdan" achieved by two different routes |

## 3. Decisions

Settled by the owner (24 November):

- **The desert metropolis, the City of Immortals:** *Ydgn* is a transliteration of its Lizardfolk name; Northerners
  usually render it *Andayeen*. One identity, two names by who speaks: the lizardfolk's own, and the North's (the
  direction's "Andaeen" is the North's, spelled Andayeen).
- **The woodlands' gem is jade.** The owner had only wondered whether the woodlands should have one at all.
- **The rest of the terrain columns are the lead's creative call for now** (below), and terrains beyond the eight are
  wanted too: tundra, jungle and others.

The plains' and woodlands' columns, the lead's design, provisional until the owner changes them. Each name was checked
free with `bin/kyrie names`, and two were drawn with `bin/kyrie suggest names` (Vallow in the catfolk's manner, Aelen
in the elves'):

| Scale | Plains (catfolk; the Low; lion; diamond, rare; iron, bronze rare) | Woodlands (elf; the Wood; bear; jade; iron, petrified wood) |
|---|---|---|
| **Hamlet** | **The Stockade**: a herders' ring of thorn fences against the lions, its cattle penned at night | **The Coaling**: a charcoal-burners' clearing, its stacks smoking, its people half the year in the trees |
| **Town** | **Fairstead**: a drovers' market town where the plains' roads cross, its fair the season's great gathering | **Bowerhold**: a town in the canopy, houses on the great boughs, ladders and lifts its streets |
| **City** | **Vallow, the Granary City**: walled, its towers the granaries of the plains, its wealth the harvest, a city of tallies and silos | **Aelen, the City of Bridges**: living trees joined by rope and timber bridges over a river gorge |
| **Metropolis** | **Iskarra, the Lion Throne**: a royal capital in rings of walls on the open plain, its kings once nomads, its court still moving with the seasons between palaces | **Thornwold, the Stone Wood**: a metropolis carved in a petrified forest, its towers the stone trunks, its streets the spaces between them |

The design reasons:
- Each column keeps the owner's distinctions. The Stockade and the Coaling are hamlets of a livelihood.
- Bowerhold, like the sky's Academy, is a town of its form.
- Iskarra's court moves, the plains' answer to the desert's mobile Encampment.
- Thornwold is the woodlands' wonder-city, made of their characteristic material (petrified wood).

**Terrains beyond the eight** (the owner: "we'll also want terrain not mentioned there: tundra, jungle and so on"):
- The ontology is open, never closed at eight.
- The generator already has some of these: frost, marsh and archipelago as region terrains, and the tropics, frost and
  marsh as painting terrains (`bin/kyrie suggest paintings`).
- G0's census reports each terrain the generator draws that the ontology does not name, and each the ontology names
  that no country is drawn in.
- **Tundra, jungle, marsh and archipelago** are the first to define. Each needs its adapted people, demonym, animal, gem
  and materials. These are the lead's to propose when G0 begins, and the owner's to change.

**The orcs.** The direction says the owner's conception of orcs, peoples historically formed by extensive admixture
and transformation, deserves its own design treatment. It is never reduced to a mechanical racial essence. That bears
on G4's majority-adapted-population rule:
- The waste's adapted people are orcs.
- So the census must treat their population as a history (who mixed, and when, and what changed them), not as a
  single species to count to fifty percent.

That design is the lead's to write within G4, and it is put to the owner as a draft.

Still open, asked before the content it governs is written, never settled by a transcription:

- The mountain city's name. The sketch seems to read *Dunwudelft*, but that is not established.
- The other mountain, waste and sky settlements' fuller definitions, written with their packages.

## 4. Acceptance

The acceptance ladder, cheapest first:
- **Fast contracts:** declarations, identities, uniqueness, placement and dependency constraints checked without a
  game.
- **Headless worlds:** the census over many seeds.
- **Automated players:** the first dungeon approached differently, independent discoveries, the return to town, the
  First Aims pursued and ignored.
- **Blind cold play** on the rendered page: are the invitation, the Atlas, the opening and the geography intelligible?
- **The owner's creative acceptance**, last: are places distinctive, images coherent, adventures varied and wonders
  wondrous? The owner's attention is spent on choosing, editing, commissioning and judging, never on rediscovering
  engine faults.

## 5. What beta prepares (and nothing more)

Beta's six proving cases (the direction's §11), each in the sprint it belongs to:

| Case | Where it lives | Rows |
|---|---|---|
| 1. A rapid opening, dark to revelation: light, a person, a credible fight won together, loot, a wonder; one or two actions where no more are needed; no long presses | Sprint 2, the first minute | OR-184 (the stock opening), OR-160, OR-169, OR-441 (its wonder and its revelations) |
| 2. Town, dungeon, return: a nearby discoverable dungeon, a companion and gear by a secure entry, reasons to go back | Sprint 3, town and dungeon | OR-311 (closed), OR-321, OR-370 |
| 3. One persistent, semantically declared wonder (Wonder, Discovery and Opportunity apart), discoverable without a quest, surviving revisit and replay | Sprints 2–3, on the language stream | OR-440 |
| 4. One optional nested First Aims undertaking, recognizing independent progress (the dungeon found and explored, help gained, a distant destination learned of) | Sprint 5, situation continuity | OR-443 |
| 5. Variable opening situations, tested across seeds by cold play, not judged by one | Sprint 3 | OR-310 |
| 6. The minimum asset metadata and placement interfaces: a painting's terrain, subject, place-or-archetype, season, weather and light as data, read by the one projection, so that gamma fills the atlas without rewriting presentation or assembly | Rides with sprint 3; the World stream | OR-442 |

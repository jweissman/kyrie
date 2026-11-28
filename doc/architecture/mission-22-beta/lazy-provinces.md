# Lazy provinces, and the placements that should go with them

27 November 2026. The platform builder, under the lead's call. The measurements are in
[memory-2026-11-27.md](memory-2026-11-27.md). The register's row is SP-02 (eager instantiation of distant content:
deterministic lazy materialization, proven against eager); its precondition, OR-418, is closed on this branch.

## What the measurement changed

The brief assumed every integrated province is assembled into every new life. It is not. A province of the first
country (data/adventures/countries.json, `province: true`) has been installed only when a company first stands at its
way in since Mission 18's Gate B (`Frontier.province`), and a country beyond a march only when a company first stands at
its march-stone (`Frontier.expand`). An s0 start installs none of them. What a province costs a start is its gate,
road and rumour, written into the first country's region module (`Provinces.situate`), and a parse ahead
(`Frontier.prepare`) when a company stands a step from a march.

What a start does install whole is the first country's own stories: about twenty placements of the library
(data/scenarios), each with its modules, thirteen word modules spreading news of them, the standing circus, the origin,
the arrival and the kits. They lie all over the first country, four to seventeen hexes from where an s0 life begins, and
under unity of place the player cannot leave the first hex until a way out is earned. Held back from the manifest,
they take with them 2.0 s of a 5.3 s start, 62 MB of the 198 MB it keeps and 165 MB of its 620 MB peak (see the
note). A province, by contrast, costs nothing at a start and 0.9 to 2.0 s, 4 to 20 MB, when it is first reached. They are the unit this design makes lazy. A province is the same unit: an authored module, placed by the world,
installed when first touched. The design below serves both, and the slice proves it on a placement.

## When a placement or a province is installed

- **When first neared.** A placement is installed when the company first stands in a hex within one hex of any place
  it binds (its sites, its town's rooms, the road it is set on). A province is installed, as now, when the company
  first stands at its way in. "Neared" is read from the hex the company stands in after each command (the expand step
  in `PlaySession`, where `Frontier.expand` already runs), never from the page.
- **When its way is revealed by an earned instrument.** A map found, a library read, a lookout climbed (each earned by a
  find, under the owner's ruling of 27 November) may reveal a place. A revealed place's placement is installed when
  revealed, so that what the instrument shows (its name, its painting, its rows) is drawn from the installed module,
  not from a guess.
- **Its word goes with it.** A placement's word module (ScenarioWord: who tells of it, and the hook facts hearing it
  establishes) imports the placement's exports, so it cannot be bound while the placement is pending. Until the word
  declares its hooks itself (they are the world's knowledge of the story, and could be), a word is pending with its
  placement, and the rumour of an uninstalled story is carried by what is installed: the countries file's rumours for
  provinces, the region's own talk for placements. The measured saving above holds the words back too (13 modules,
  0.9 s).
- **Prepared ahead.** As `Frontier.prepare` parses the countries a step beyond a march while the player reads, the
  expand step prepares (parses, compiles, draws the cast of) the pending requests within two hexes, so that the
  install on arrival pays only its join: a province's first arrival waits 0.9 to 2.0 s today.
- **Never twice.** Installing is idempotent by installation id, as `Frontier.province` already is.

## What the world knows of an uninstalled one

Everything it needs to place it and to speak of it, and nothing that requires its Kyr:

- **Its placement:** the sites and towns it binds, its instance id and its imports (WorldAssembler.place and
  requests). The manifest's module list already carries the request whole.
- **Its rumour:** the countries file carries each province's rumour, topic, heard, far, skyline and notice; a
  placement's word module carries its hooks. Both are installed eagerly.
- **Its cast:** the names its generated people will be given, read ahead by `StoryCasts.cast` from its Deem generation
  alone (no Kyr parsed). OR-418's fix makes these depend only on the request, so the world can name an uninstalled
  story's people (a rumour's "the drover's wife") identically before and after it is installed.
- **Its pending installation:** the campaign definition keeps the requests not yet installed (`pending`, in world
  order), with the source they are read from. A save carries them as it carries installations.

## How offscreen life works for an uninstalled one

The reference game asks that the world still live where unvisited. Today nothing an uninstalled module declares
can act: its people have no actors, its clocks no pressure, its rules no wakes. Three cases:

1. **Clocked stories** (a going-on with a pressure, the fever worsening): the pressure's clock starts at the world's
   start, not at install (`ClockShift.apply` shifts a module's clock by the elapsed time it is installed at). A lazy
   install passes the world's start (elapsed 0) as its clock origin and then settles its rules once at the current
   time, as `Campaign.install` does for a module joined under way. What has run out by then has run out.
2. **Stories with actors who move** (the walk, the circus on its circuit): installed when neared, their actors are
   placed where their plans would have taken them by the time elapsed: a catch-up step, run once, by the planner
   on the module's own actors with nothing else installed in reach. The first slice leaves this out and installs
   only stories whose people keep their places (most of the library), by a manifest flag the slice reads.
3. **Stories that write into the country** (a rule that changes a region fact): kept eager until their writes are
   declared, as MT-25 declares reads: a module whose rules write outside its own namespace is not lazy.

## How saves and replays stay identical

- **The install is an event.** Installing a pending request records `{ kind: 'installed', id, at }` in the history, at
  the step it happened. A replay installs at the same step, from the same request. A save keeps the pending list and
  the installed list; restoring installs nothing new.
- **Every draw is keyed by identity.** A module's seed is `RandomStreams.key(seed, 'module', declared id,
  randomIdentity)`, independent of when it is installed. Its generated names depend on its request alone (OR-418,
  this branch: a story is drawn apart from its world's people and from the casts of the stories drawn before it in
  its country, read ahead by Deem alone, so a pending story's cast is known before it is installed). Its creatures'
  bodies are keyed by their ids. What still depends on what was installed before it: a country beyond a march leaves
  out the scenarios placed in the countries installed before it (OR-1745), which must be fixed before countries
  beyond are drawn ahead lazily in any order.
- **The order of facts.** A module joined later puts its facts and actors after those joined earlier. Wherever order
  is read (rule firing order over actors, the order a projection reads creatures), installing lazily changes it. The
  proof below is what catches a dependence on that order.

## The proof

A world played eagerly and lazily reaches the same state at every step at which a placement or province is first
touched:

- The same seed and the same commands are played twice: once with every pending request installed at the start, as
  today, and once lazily.
- At each step where the lazy world installs something, the two worlds are compared on what the player can know and
  what the touched module owns: the touched module's entities, facts and creatures (names, bodies, places); the
  company's own state; the rows offered; and the narration told.
- Facts of modules the lazy world has not installed are excluded from the comparison: the eager world holds them and
  the lazy one does not. The test asserts that they are exactly the pending modules' own.
- A difference at any such step fails, naming the module and the first fact that differs.

The cheapest rung that proves it: a fragment world with two stories at a distance (test/fixtures/drawn-apart, extended
by a second hex), played by a short scripted walk. The world-level walk on s0 runs in CI's canary, not on the push
lane.

## The first slice

Behind `KYRIE_LAZY_PLACEMENTS=1`, off by default:

- The world assembler marks each placement whose bound places all lie two hexes or more from the start (Terrain.hexes)
  and whose modules are declared `lazy` in their scenario (none writes outside its namespace, none has a moving actor).
- CampaignAssembly holds those requests back as pending, in world order, after drawing them apart (StoryCasts), so that
  their casts and everyone else's are what they would be eagerly.
- The expand step installs a pending request when the company first stands within one hex of its places, and records
  it.

Its savings are measured, not assumed. The upper bound, every s0 story and its word held back, is 2.0 s of the start,
62 MB kept and 165 MB of peak; the slice reaches it only for the stories its flag admits (no moving actor, no write
outside its namespace), and adds back the cost of preparing what lies within two hexes.

## Decisions

- **The unit is the placement, not the province.** Provinces are already lazy; the eager cost at a start is the
  first country's placed stories. One mechanism serves both: a pending request, installed when first touched.
- **Names before laziness.** A pending story's people must be named before it is installed (a rumour names them) and
  named the same when it is: OR-418's StoryCasts makes a request's draws depend on the request alone.
- **The world's order, not the install's.** Stories are drawn apart in the order the world drew them, read ahead by
  Deem alone; installing is free to happen in any order after.
- **The install is a recorded event**, replayed at the same step from the same request, so saves and replays agree.
- **Offscreen life by catch-up, bounded:** a clock runs from the world's start; moving actors and writes outside a
  module keep a story eager until the catch-up and the declared writes exist.
- **Proven against eager** at every step a pending request is first installed, on a fragment world on the push lane
  and on s0 in CI's canary.

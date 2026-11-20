# SS-01: a bounded strategic-simulation spike, assessed

19 November 2026, read in `/var/tmp/kyrie/wt-m21` at 7e92d1e5a. This is an assessment for the owner's directions §5
(`/var/tmp/kyrie/m22/directions-2026-11-19.md`). Nothing in the tree was changed. The probes are in
`/var/tmp/kyrie/m22/probes-ss01/`: `census.ts`, `geo.ts`, `roads.ts`, `towns.ts` and `hall.ts` (read-only censuses of
a drawn Iscoed), plus `marches/` and `marches.ts` (a 40-line Kyr fixture with two powers and one gatehouse, run through
`PlaySession`).

## Summary

The kernel already has one authoritative world with many actors in it. Every non-player actor in a campaign plans
over the same committed world (`CampaignTick.npcs`, `Agency.choose`). It plans only through its own grounded actions
(`Operators.applicable(world, actor, own)`) and acts inside the watch loop that the player's commands drive. The
history is deterministic from the seed and the player's commands, and it saves, resumes and replays.

The probe shows this end to end. Two bands set out for one vacant gatehouse and arrive in the same watch. The first
holds it for its lord. The second, finding it held, falls back to its next pursuit and treats for a truce. A rerun,
a resumed checkpoint and a transcript replay all came out identical.

So the spike needs **no second engine and almost no runtime work**. A faction kit written in Kyr can run on Iscoed's
real roads and settlements today. What is missing is small but real:

- **Fair arbitration.** Actors decide in declaration order, so one power always moves first.
- **Planning on what an actor knows.** The planner reads the true world. Its knowledge comes only from what an
  action's `Requires` happens to ask.
- **Commands from anyone but the player.** `Campaign.execute` accepts only the player's offered actions.
- **Checked or fighting acts for NPCs.** No NPC can plan an act with a `Resolve`.
- **An honest in-transit state.** A marching band stays visible at its origin until it arrives.
- **Abstract forces.** Every member of a group is a concrete creature.

All of these can be worked around in Kyr for a spike. Model actors and armies would need the runtime pieces.

## The six questions

**1. Do multiple actors observe one committed world through their own knowledge and authority? Partly.**

- **One world:** yes. `CommittedWorld` (`src/campaign/committed-world.ts`) is the only world, and every actor reads it.
- **Authority:** yes, as plain facts. `serves`, `holds`, `posts`, `keeps` and `tolls` come from
  `data/rules/dominion.kyr`, and `holdsOffice(group, identity)` from `data/rules/canon.kyr`. An action's `Requires`
  reads them. In the probe, `secure` requires `serves(actor, power)`.
- **Perception per actor:** the functions exist. `LocalObservations.perceives(world, actor, place)`,
  `LocalObservations.noticed(world, entity, actor)` and `LocalObservations.read(world, actor)` all take any actor.
- **Knowledge per actor:** it exists as facts. `knows(group, fact)` from `discovery.kyr` and `heardOf`/`passesTo`
  from `belief.kyr`; a drawn Iscoed has 73 `knows` facts. Belief also travels at runtime: `Rule passed_on`.
- **The gap:** `Agency.plan` runs `Planner.search(world, target, …)` on the true world. An actor therefore "knows"
  every fact its own actions read, unless the author gates each one through `knows`/`heardOf`. In the probe, the
  reavers in their camp plan for a gatehouse they cannot see because `vacant(gatehouse)` is true. There is no
  actor-scoped view of the world for planning. The player's views (`PlayerView`, `InformationView.observe`) are built
  on `campaign.playerActor` alone.

**2. Can they select valid actions through the existing command and rules machinery? Yes, for deterministic acts.**

- Each actor's actions are the shared schemas grounded for that actor (`Operators.applicable` in
  `src/campaign/operators.ts`, called from `Agency.allowed`). It chooses by goal priority, urgency and a bounded
  search: `Agency.assess`/`choose`, `maxNodes` 2000, the actor's `Plans N steps`. Fruitless searches are remembered
  without changing what any game does (`Agency.fruitless`, the `waiting` state).
- Kyr's `Pursuit … seeks …`, `Route` (`src/lang/routes.ts`, `Routes.lower`, lowered into pursuits) and `Uses go,
  secure` are the authored policy surface, and they already work in generated regions. A drawn Iscoed has 268
  actors, 12 of them with pursuits: routines, raiders, a captive.
- Limit: `Agency.allowed` filters out every action with a `Resolve`. An NPC never plans a check, a fight or a
  field resolution, so an envoy who might fail has to be decided by a rule on `dice(clock)`.
- Limit: much of the shared vocabulary is gated on `company(actor)` (for example `pay_toll` in
  `data/kits/toll-road/customs/keepers.kyr`). That keeps those acts away from powers, which is right, but it means a
  faction's verbs must be written for it.
- Limit: `Campaign.execute` and `Campaign.action` take only ids from `offered()`, which
  `CampaignGrounding.offered` grounds for the player alone. No outside client, model or human, can yet submit a
  command as another actor.

**3. Can time advance and actions resolve deterministically, competing intentions included? Yes, with a bias.**

- Time passes only inside a command: `WatchLoop.pass` → `watches` → `Campaign.advanceWatch` → `CampaignTick.npcs`,
  then `CampaignTick.rules`. Headless, the player's `wait(party)` turns the clock. In a full drawn Iscoed that cost
  about 58 ms a watch with 267 NPC actors (`census.ts`: 6 waits in 347 ms).
- An act that takes longer than a watch is kept pending (`current.pending`). When it falls due it is applied only if
  it still applies (`Planner.applicable`); otherwise its authored failure happens ("obstructed").
- Rule instances that compete are checked one after another: "two powers cannot both seize the one stronghold"
  (comment in `CampaignTick.fire`, and the `seized` rule in `dominion.kyr`).
- The probe: `world__men` and `world__band` both arrive at watch 6. At watch 7 the men, declared first, `secure` the
  gatehouse. The band then plans again on the changed world and `parley`s instead. A rerun gave an identical log.
- **The bias:** `CampaignTick.npcs` iterates `definition.actors` in declaration order every watch. The power written
  first wins every tie, forever. That is deterministic but unfair, and it should be made explicit (see the missing
  capabilities below).

**4. Can the history persist, resume and replay? Yes.**

- `Campaign.save` keeps the module, definition, state (with `pending`, `waiting` and `told`), creatures and the event
  log. Each event's `npc` array is that watch's `TickDecision`s, with the actor, goal, action, plan, changes and
  whether the company saw it (`seen`).
- `PlaySession.checkpoint`/`resume` restore it. In the probe, the resumed session's next watch and `canonical()`
  matched.
- `PlaySession.replay` replays the steps with their digests (17 of 17). `scripts/redigest-trace.ts` and
  `scripts/compat.ts` (additive, presentation-only, world-moving, replay-breaking, save-breaking) watch for drift.
- Caveat for later: a transcript records only the player's commands (`TranscriptStep`). The decisions of
  deterministic NPCs are worked out again on replay, which is right for them. A model-driven actor's choices would
  have to be recorded as inputs.

**5. Can a player then meet the real consequences? Yes.**

- The facts the powers write are the facts the player's world reads: `Observe … when holds(thane, gatehouse)` (test
  fixture `test/fixtures/proving/site.kyr`), the toll's `stops` rule, `tolerates`/`hostile` turning on everyone who
  `serves` a power (`dominion.kyr`'s `admitted`/`turned`), and the market price of a tolled road (the toll-road kit's
  description).
- The player witnesses an act only when it happens where the company perceives it (`CampaignTick.seen`). Otherwise it
  can arrive later as news, either through `heardOf`/`passesTo` or as `held` rules (`CampaignTick.fire`).
- Precedents already in play: the Lantern Company (`data/situations/bound-howe/rival.kyr`), the Collegium's rivals
  (`data/situations/arcology/rivals.kyr`) and `DeepRivals` (`src/world/deep/deep-rivals.ts`). Each leaves traces the
  company later finds. They are rule clocks rather than planning actors, so they show the consequences half, not the
  agency half.

**6. Can strategic activity stay abstract until local detail is needed, without fabricating state? Partly.**

What exists:

- **Stage clocks.** `world_ambitions` (`data/rules/ambitions.kyr`) gives `stage`/`pace` clocks. `DeepRivals`
  resolves a level while the company is not on it. The Gathering's `strife(walk)` sum
  (`data/situations/walk/gathering.kyr`) reckons a riot from counted events.
- **Generation is deterministic.** Every country is drawn from the seed and its cell (`Frontier`,
  `StrategicAtlas.at`), so nothing that is generated contradicts what came before.

What is missing:

- **Travel is invisible but not abstract.** A pending `go` leaves the band at its origin until it arrives: the probe's
  men are still "at the hall" for five watches, then appear at the gatehouse. `dominion.kyr`'s `depart`/`arrive` with
  `travelling(group, byway)` is the right primitive, but it is unused in generated regions (0 `bywayFrom` facts).
- **NPCs and the player move on different maps.** NPCs move on the place graph: a road is one room, such as
  `region__s5_s2_way`, with a `travelTime` (`passages.kyr`'s `go`). The player crosses hexes (`Crossing`, `Journey`).
  A band on the road is on no hex, so the player can meet it mid-road only through an authored meeting rule, as
  `RegionTraffic` does for its travellers.
- **Only the party opens new country.** `Frontier.drawing` looks for `at(party)` on a march-stone, so a power cannot
  act in, or march into, a country nobody has drawn.
- **Forces are concrete.** `Numbers 3` makes three creature records (`src/campaign/cast.ts`). Nothing lets a force of
  hundreds stay a number and become a representative band only when the company meets it.

## The smallest credible two-faction experiment

**Region.** Iscoed, the a1 world, drawn as it ships. Its five towns lie on one road graph, with travel times in
watches. Porthalen (s1) runs 17+13 to Reedbridge (s5). Reedbridge runs 8+28 to Wrackham (s2), the hub. From
Wrackham, 4+17 to Gatesend (s4) and 4+34 to Edderwick (s3). The Gatesend–Edderwick road is already held by the toll
kit: `holds(tollKeepers__chief, region__s4_s3_way)`. Porthalen Hall (`region__s1_manor`) has a steward and no lord.
`holdsOffice` is empty: the generated region holds no institutional powers yet.

**Actors.** These would be written as one kit, `data/kits/marches/`, bound by `kit.json` slots in the same way as
`data/kits/toll-road/kit.json` (`square(?town, ?market)`, `waypoint(?post) and onRoad(?post)`,
`chokepoint(?post)`, `hours(...)`):

- **The Hall.** A lord seated at Porthalen Hall, `holdsOffice(lord, porthalen_lordship)`, with a household band
  (`Numbers 4`), `serves(band, lord)`, `quantity(lord, gold)` and `quantity(lord, rations)`.
- **The Reeve's men.** The existing toll-reeve at Gatesend (`tollKeepers__chief`), extended with an ambition. The
  definition's `extensions` field already gives pursuits to an actor another installation declared
  (`CampaignDefinition.extensions`).
- **The neutral settlement.** Wrackham, the hub, through its reeve or innkeeper as a group whose
  `admits`/`tolerates` the powers compete for.
- **The prize.** The chokepoint waypoint on the Reedbridge–Wrackham road (`region__s5_s2_way`), `vacant` at the
  start.

**Four world actions,** all ordinary Kyr `Action`s with `Requires` and no `Resolve`:

1. **Travel:** the shared `go`, or `depart`/`arrive` on a byway so that a band is out of sight in transit.
2. **Secure a position:** `secure(actor, power, site)`, which requires `serves`, `at` and `vacant`, retracts `vacant`
   and asserts `holds`. The probe's action, as written.
3. **Send an envoy:** `treat(actor, power, town, site)`, which requires the envoy to be at the town's square and
   `trusts(town, power)` or a gift paid (`quantity(power, gold) >= n`). It asserts `courted(town, power)`. The
   town's `admits` is then decided by a rule.
4. **Move a company:** `muster(actor, power, site)`. It brings an already-declared band from its seat to a
   `holds`-ed site and requires `holdsOffice` or `serves`. It never creates the band.

**Policies** are pursuits by priority: take the prize while it is vacant; court Wrackham while it admits nobody; fall
back to treating with the holder. **Arbitration** stays inside existing rules with intent facts. An action asserts
`claims(power, site)` or `courted(town, power)`, and an authored `Rule` decides what is contested at the end of the
watch. The rule compares `strength(power)`, then `dice(clock)`, which is drawn from the seed. That keeps both powers'
moves in one watch symmetric and visible, and removes the declaration-order bias without any runtime change. The
company meets the outcome as a held gatehouse, a toll, a town that turns, or news by `heardOf`.

**The spec** would be `test/features/conflict/two-powers.pin.test.ts`; the name is free, and it follows the
feature-pin convention. It would start `DrawnWorld.start('iscoed', …)` with the kit installed, run `wait(party)` for
two in-game days, and assert:

- (a) both powers acted, from `event.npc`;
- (b) exactly one `holds` the prize, and the loser's next decision is a different goal;
- (c) the same seed gives the same log, and a different seed may give the other winner, so arbitration is not
  declaration order;
- (d) `checkpoint`→`resume` and `replay` reproduce the digests;
- (e) a company that walks to the prize after the contest sees the holder's `Observe` and meets its `stops` rule;
- (f) no power's band was at the prize before a `go`/`arrive` put it there, and no new group appeared.

**Size.** About 150–200 lines of Kyr and a 40-line `kit.json`, one spec of about 120 lines, and no engine change.
That is one to two working days, most of it binding the kit's slots to Iscoed and tuning the plan horizons.
Optionally, about 20 lines in `CampaignTick.npcs` would make the actor order a seeded rotation, as a cross-check of
the Kyr arbitration.

## Missing capabilities, ranked

| # | Capability | Today | What it needs |
|---|---|---|---|
| 1 | **Fair, explicit arbitration of simultaneous intentions.** `CampaignTick.npcs` uses declaration order. | **Kyr today:** intent facts plus contest rules. | Runtime, small: a seeded per-watch order, or a two-phase "intend, then resolve" pass. |
| 2 | **Planning on what an actor knows.** `Agency.plan` searches the true world. | **Kyr today, by discipline:** gate each act on `knows`/`heardOf`. | Runtime: a world view scoped to an actor (facts it was told, saw or holds) for `Planner.search`; a lint that flags an action reading hidden truth. |
| 3 | **Commands from a non-player actor.** `Campaign.execute`/`offered` serve the player only. | None. | Runtime: `offered(actor)` and `execute(actor, id)`, queued into the watch at the same arbitration point, and recorded in the transcript. This is the interface model actors would later use. |
| 4 | **Checked and fought acts for NPCs.** `Agency.allowed` drops anything with a `Resolve`; there is no NPC-against-NPC battle. | **Kyr today:** rules on `dice(clock)` and strength measures. | Runtime: resolving a check for an NPC, and an abstract skirmish between groups. |
| 5 | **In transit, and meeting on the road.** A pending `go` keeps the actor at its origin; hex crossing is the player's alone. | **Kyr today:** `depart`/`arrive`/`travelling`, and meeting rules like `RegionTraffic`'s. | Deem: generated byways. Runtime: placing a transit on a hex for the map. |
| 6 | **Abstract forces that become concrete when met.** `Numbers` makes creatures (`cast.ts`). | **Kyr today:** a measure (`strength`) beside a small concrete band. | Runtime: making a band from a strength in a deterministic way, and folding losses back into it. |
| 7 | **Institutional actors in generated regions.** Lords, reeves and councils as groups with `holdsOffice`. | **Deem/kit today:** authoring work, not language work. `office-lint` already sees the conflicts. | Kits and templates. |
| 8 | **Powers beyond drawn countries.** `Frontier.drawing` reads `at(party)`. | **Deem today:** atlas-level facts per country (`data/imbar/atlas.json`) as abstract holdings. | Runtime: drawing a country on a power's march, or an atlas-scale abstract layer. |

## How this should shape the standing ladder and the overstory

- **Standing is facts, not modes.** Each rung of Commoner, Adventurer, Aristocrat, King, Vizier and Dark Lord is a
  starting set of facts the shared rules already read: `holds`, `keeps`, `serves`, `posts`, `holdsOffice`,
  `trusts`/`admits`, gold, rations and retainers. It is not a different interpreter. Gaining or losing standing is a
  rule over events, such as `Retract holdsOffice` when a seat is seized or its holder is dead. A start is a kit
  installed with the protagonist in a slot.
- **The player's reach must be gated by the world, not by the engine.** The player actor carries `allActions`
  (`census.ts`: only `party`), so standing has to restrict through `Requires`, never through which menu the client
  shows. That matches "the page invents no controls".
- **A king orders; he does not command troops by fiat.** An order is an action that writes `ordered(band, aim)`. The
  band acts on it through its own `Pursuit … when ordered(band, aim)` in the next watch, along real roads, and can be
  obstructed. A vizier's delegated authority is `holdsOffice` on an office that is `partOf` the crown's. A vizier
  serving the other side is a `serves` fact. Raising troops brings an already-declared band out of `nowhere`
  (`Arrives`, as the Lantern Company does), gated by gold and levy facts. Kyr has no way to create a group, which is
  exactly the owner's rule.
- **Build the overstory from the kinds that already work:** ambition stage clocks for slow plans, pursuits for agents
  who move, intent-and-contest rules for clashes, and `heardOf` for rumour reaching the company. Its first situations
  should sit on Iscoed's real road graph, where the toll kit already holds a road, rather than on new geography.
- **Keep two scales.** The strategic scale is towns, roads and holdings on the place graph, with numbers for forces.
  The local scale is rooms and creatures. Items 5 and 6 above are the bridge between them, and they should be solved
  before any campaign-scale war is authored.

## The multi-session cold-play observatory

**What exists.** `scripts/cold-play.sh` starts each independent session in its own tree and folder,
`/var/tmp/kyrie/cold/N/`. Each folder holds `played.txt`, `lines.txt` (the replayable moves), `out.jsonl` (one JSON
turn per line from `bin/kyrie run`), `err.txt`, `log.md`, `report.md` and `runner.pgid`. `send.sh` and `show.py`
render one turn as text, and `src/cli/terminal*.ts` renders a scene for the terminal.

**What it would take.** A read-only script, `scripts/observatory.ts`, of about 150–250 lines. It would list the
session folders, tail each `out.jsonl`, render the selected session's latest turn with the `show.py` logic or
`TerminalScene`, switch with keys, and show each one's status (live if `runner.pgid` is alive, turns played, last
error). It needs no engine change and must never write to a session.

It is an evaluation tool for several worlds, one each. It is **not** a step toward several actors in one world. That
needs items 1–3 above inside a single `Campaign`, and a browser worker (`web/engine/engine-worker.ts`) only moves
that one world off the UI thread.

# The Long Muster's Road

*Adventure II of the anthology ([treatments](README.md)). Built 7 November 2026 in `data/adventures/muster/`; spec `test/muster.test.ts`. Spoilers throughout.*

## What it is

Sixty miles of legionary road over the Hesper Fells, from the village of **Kell Ford** to the valley of the **Last Cohort**, whose people are the descendants of the Long Muster's rearguard and believe the empire stands. Eleven hundred years have broken the road's bridges, galleries and fortresses; the adventure is the *crossing*, and it ends in a question put to the company: what do you say to people who have held a gate for a dead throne for a thousand and a hundred and four years? It is a province of the first country (entry: a mountain/frost/hills country, to the east), so it is heard of from an innkeeper, walked into, and kept in the one persistent world.

## The map

```
 KELL FORD ── Low Road gorge ── flooded bend ───────────┐   (thaw shuts the bend)
  green      ── Old Causeway (3 rooms; wolves by night) ─┤──  MANSIO SEPTIMUS (roofed)
 (inn, store ── goatherds' track + the steep ────────────┘     (track needs wayfinding: Marra's crook)
  Marra, reeve)
 SEPTIMUS ── High Road (open stretch: wyvern stoops at noon; eyrie off it) ───┐
          ── the Gallery (dark, foul air, rotten Third Arch) ──────────────────┤── MANSIO OCTAVIUS (half-roofed; the scribe's satchel)
          ── the Ledge (needs wayfinding; shut by snow) ───────────────────────┘
 OCTAVIUS ── north head of the Great Viaduct ──┬─ parapet of the fifth arch (piton + rope; wind)           ┐
                                               ├─ down the pier (rope) → river (not in thaw) → up the abutment (climb) ├─ south abutment
                                               ├─ the fallen arch (climb; rubble)                          │
                                               └─ the Cohort's rope-way (hidden until the valley is friendly) ┘
 south abutment ── MANSIO OF THE EAGLE (roofless; courier pouches; cloudberry bog; kingsfoil hollow)
 EAGLE ── foot of the Giant's Pass ── road-house (giant guards the road) ── head of the descent
                                  └─ goat path over his roof (climb; shale) ──┘
 head of the descent ── Long Descent ── GATE (sentries) ── forum ── Praetorium/Prefect · barracks · granary · apothecary · Archive · shrine · terraces
```

## How to cross it

Prepare at Kell Ford: Gil Pryor sells rope, pitons, firewood, a tent, iron (crowbar, spikes), blankets and rations; Maud Hennick and Marra Ashgrove say what each road costs; Ansel Whitlow gives the Viaduct's notes. Hire Marra (4 coin) and her crook gives the company *wayfinding*: the goatherds' track and the Ledge open. She will go no further than the Gallery's mouth and the foot of the Pass, and takes up again for nothing on the way back.

Each day is a choice. The wyvern is a fact of noon on the open High Road (a Hazard keyed to the hour, grounded by wind); the Gallery and the Ledge shelter from it, each at a price. The Third Arch is rotten unless the roadway is prodded first. The Viaduct has three honest crossings and a fourth for friends. Sleeping out above the snow-line costs a cold Hazard each night unless the company holds a tent or builds a fire. The giant takes iron, takes a story (a hard performance check), sleeps at night (the company may then slip by, but he wakes at dawn), or can be gone round by the goat path. At the gate, the sentries want the word (the scribe's glossary from Octavius) or a courier's pouch from the Eagle; with the pouch the Cohort receives the company as the first courier from the north in eleven centuries.

In the valley the company may tell the Prefect (the eagle is struck; the Centurion gives a scout and the Cohort's rope-way), tell the Archivist alone (the eagle stays; he gives a copy of the Itinerarium and the rope-way), or say nothing and trade with the apothecary. A courier's pouch earns the Prefect's dispatch, which the Kell reeve will send to a bishop's archive for forty coin; the shrine and the inn show the result.

## Content that works in play

(Specs: `test/muster.test.ts`, six tests, all passing at the commit below; the browser was **not** used.)

1. The whole route is walkable by the labels a player sees: hire, stock, track, Septimus, Ledge, Octavius, parapet, Eagle, Pass, giant, Descent, gate, forum, Praetorium, barracks, home by rope-way, Gallery and Causeway, the reeve (`journey.json`).
2. A thaw (sky state) shuts the Low Road bend (`road.kyr` `gorge_water`) and the river ford; the company turns back; clearing the sky reopens them.
3. Marra's crook: a local `Kind … granting wayfinding`, carried by a hired companion, opens `needing wayfinding` ways for the company (`folk.kyr`). Dunya, the Cohort's scout, carries one too.
4. A companion who refuses a place: rules `marra_stays_gallery` / `marra_stays_giant` retract `travelsWith`, park her, re-assert `willing`, and she can be asked again free.
5. Weather: `sky` is a scenery Thing re-rolled at first light; snow shuts the Ledge (`opening when`), wind grounds the wyvern, thaw floods.
6. Cold: a night out on an `exposed` room strikes `night_cold` once unless a tent is held or a fire built (`make_fire`, spends firewood).
7. Guards: the giant and the gate sentries are persons with a blocking state and `Guards`; each is passed by an action of `Time 0` (iron, spikes, a story, the glossary, a pouch) or the engine's own "slip past".
8. Plants by the growing pattern: comfrey, bruisewort (gorge), heather, gentian, alhuren (Ledge), cloudberry (bog), kingsfoil (hollow); Dame Orsa `Buys` them.
9. Persistent choices: `state(standard, struck|kept)`, `told_prefect`, `received`, `dispatchTaken`, `dispatchSent`, `ropeway_known`; the forum, the inn and the shrine show them; the first survives checkpoint and resume.
10. Orsino/catalog items used and sold: antique compass, ancient/faded maps, celestial chart (Whitlow buys), toll silver, steel coin, old glossary, wardstone, dun_rierdan waystone, piton, rope, tent, spyglass, lamp, blanket.
11. Provincial placement: `a1`-style walk in seed `b2` (a mountain first country): heard of, walked into, kept.

## Authored content present but not reachable

1. **The wyvern's eyrie** (`eyrie`, the wyvern Person with Warns/Comes): reachable only by `needing climbing` from the open stretch; no spec enters it, and nothing is there to take (the wyvern's remains of travellers are only described).
2. **The wolves** (`wolves`, `Seen when dark()`): the specs cross the causeway by day; the night encounter was not played.
3. **The Archivist branch** (`moll_tell`, Itinerarium copy, `standard` kept) and the **General's sealed bundle** (`generals_letters`): written, lint-clean, not walked by a spec. The `general_read` Discovery is never taught (the Observe at the archive describes it but does not `teach` it).
4. **The apothecary's sale**, `Sells`, the shrine, Gaius, the granary and terraces are rooms and talk only; no Topic of Gaius or Orsa beyond greetings.
5. **The Low Road past the bend, the causeway's `causeway_fire`** scenery (decorative), and the **goat path** over the giant's roof: described and wired, not walked by a spec.
6. Cohort scout Dunya joins (`willing`) and carries the crook; nothing in the valley changes her fare or lets the player send her home.

## Actions or consequences the engine cannot yet represent

1. **A mule or pack limit.** Nothing carries a weight limit the Gallery could refuse a mule for; the mule is not in the adventure (`pack_mule` exists in gear). Needs a carried-weight or a "led animal" fact the passage can test.
2. **Cold as a condition.** `night_cold` is a Hazard struck once a night (`road.kyr`); there is no persistent cold, hunger beyond the meal rule, or fatigue per day on foot. Needs a condition with a clock that a shelter or fire can interrupt.
3. **A guide who declines a way.** Done with two rules that retract `travelsWith` (`folk.kyr`); a general "will not enter" on a person would replace them.
4. **A region's weather.** The province's `sky` is its own scenery re-rolled by `dice(clock)`; the generated country's `weather_*` sky is not readable by a module (friction 29 of the circus, still true), nor the calendar's season in a rule here.
5. **Prices that follow what the company did.** Dame Orsa's `Buys` are fixed; telling the Prefect or the Archivist cannot make her pay more. A `Buys … when` condition is needed.
6. **A rope-way as a made thing.** Modelled as a passage hidden until a Discovery is known (`ropeway_known`): it is "there" for anyone who knows it, not built by anyone. A fact the Cohort's engineers could assert would be better.
7. **A time-limited tolerance.** The giant sleeps (`giant_sleeps` asserts `tolerates` at dusk and retracts it at dawn); a company on the road at 3 a.m. slips past him, one at noon pays.
8. **The wyvern as an animal that acts.** Its stoop is a rule keyed to the hour, not to the creature's own errand; it never leaves the eyrie, and cannot be seen to leave. Needs a creature errand with a hunting range.

## Existing assets whose migration or integration is incomplete

1. **Lanterns.** Oil and lantern are bought (Pryor sells torches only here) and a lantern is lit only if one member holds both; as in Tallow Deep the page never offers "light the lantern" otherwise (`src/ui/choice-list.ts` `lighting`). The specs use torches.
2. **Plant `uses`** (alhuren "divination", gentian "love", kingsfoil "medicine") are read by no rule; only sale and kingsfoil's catalog `use` function. No identification of a plant exists: stands are named outright.
3. **`pack_mule`, `tent`, `firewood`, `blanket`** are catalog gear; only the tent and firewood are read by a rule here (`night_cold_strikes`, `make_fire`); a bedroll does not count as shelter.
4. **`old_glossary`** is a catalog wonder "granting reading"; the sentries' challenge asks only that it be *held* (`holding`), not that it be equipped or read.
5. **Companions' kit.** A recruit placed by a module carries a local `Kind` granting a skill; `wayfinding` as a skill appears to be a catalog skill only some classes get, and the shared `needing` check read the crook correctly in play, but nothing lints that a `Carries` kind grants a catalog skill.
6. **Province placement.** Seed `a1` (marsh) does not place it (it stands beside mountain, frost or hills); the specs use `b2`. The kept transcripts' digests were not re-recorded (`test/frontier.test.ts` has two failures that pre-date this work).
7. **Presentation.** Not verified in the browser: the map's drawing of rooms of one wilderness, the weather lines, and the long labels ("Give the giant a crowbar for his toll").

## Honest gaps in verification

Played by the builder through `Journey`, not by an independent player. The wolves, the eyrie, the Archivist branch, the goat path, the river crossing in low water, and the cohort sale were not walked by a spec. No fight was played. Names are checked by `adventure-names.test.ts`; the Kyr lints with 0 errors and 1 advice (the bog's scenery cannot be looked at).

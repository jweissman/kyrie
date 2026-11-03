# The Book of Faces: status, builds, rewards, friction, critique

## 1. What was verified, and what was not

**Verified.** The merged module lints at 0 errors, 0 warnings (the remaining output is advice). The placed-world test passes: the province is placed clear of every other, its notice is read in a town, the way in appears on the map, walking it installs Ombra in the generated country, and the company arrives at Strangers' Square (`test/the-book-of-faces-placed.test.ts`, about 45 s). Each of the ten authors' test files passed on its author's stub campaign. On the first run against the real merged campaign, 303 of 341 passed; the 38 failures were triaged, and every one proved to be a test written against a stub (a person standing elsewhere on the real schedule, the Warrant not yet taken, a way barred by another author's Thing), plus one real integration bug of mine (the Registry stayed barred on the ninth night, so no Drawing-night act could be reached; fixed in `registry.kyr`). After those fixes the Drawing-night group re-ran 38 of 39, and the triage agents ran their assigned files green singly.

**Not verified.** The *whole* suite was not re-run green after the last fixes: it is heavy (about 35 minutes under load) and is meant for CI. No end-to-end journey was played through both principal approaches (the Warrant and the Hearing; the Face and the Doorward) by one protagonist from the Gate to the Drawing; the pieces are each tested (the Hearing's concurrences, the Doorward's Fit, the seven Drawing actions are in the integrator's files and are covered only through the authors' Drawing-night acts, not by a dedicated test). The ten endings have not each been reached in play. The persistence and offered-action explorations are the authors' (invariant checks and replay, a few hundred commands per calling), not a campaign-wide exploration of the merged module. Nothing was played in the browser. The authors' prose was written by ten hands and has not had a single editorial read.

So: **the region is built, lints, and is found and entered from a generated world; its parts are individually tested; its integration is lightly tested, and the finale is the least tested part.** Run the suite on CI and expect more cross-file failures of the kind that were found.

## 2. Two approaches to the Registry (as designed; each part tested separately)

| | **The Warrant** | **The Face** |
|---|---|---|
| Spirit | Bare, lawful, slow | Masked, quick, complicit |
| Needs | Vail's trust (candour), the Assessor (a true Pound put back, or lore), Pavane (your cast, or persuasion), then the Hearing on day 6 or later | An Office face (Pavane's Fit at 25 coin, Lacke's Key sold, Hobb's Serene mask) and the Doorward's judgement of the Fit |
| Skills | persuasion, insight, lore | deception, performance, stealth |
| Costs | Heat; the Warrant suspended at 3, withdrawn at 6; Naming or sparing the Warden | A crude Fit is noticed (+1 heat); lockwork rings a bell (+2); you take part in the Lie |
| Leaves | The Registry by right; the Warden tried | A shorter way to the Book, and the Doorward's book entered with you |
| Fails by | Heat; a day-6 start | The tell of an unfitted mask |

Two more ways in: the cistern hatch (the Ninefold Drain, days 1 to 5) and the Contessa's key (the private stair, the Dinner of Spoons); and the city's own right at the Ninth Bell on the ninth night, which is what makes a company that does none of it still able to reach the Drawing.

## 3. Builds: what each calling opens

| Calling | Its arc | The sharpest thing it can do elsewhere |
|---|---|---|
| Warrior | Gauntlet (9 landings; Hireling/Defender/Breaker) | Frighten Lacke at night; brawn through the Door, the hoop, the hatch; break the strike |
| Mage | The Fit (Form/Measure/Cost) | Lore: the Rain-Wives' cloth, Thole's slate, the Standard Room, the Codicil's footnote |
| Thief | The Cast-Room (5 stages) | Lockwork: the strongroom, the Registry, the Standard Room; stealth: the Pound swap, the sack from the Exchange |
| Cleric | The Confessional (the seal) | Rites: the Stranger's burial; mending: the body; the Choir |
| Bard | The Lampoon | Performance: the Hour... the Hall's benefit, Orme's cue, the Trial's verdict |
| Ranger | The Heronry (urban tracking) | Woodcraft: Pip, the heron, the peregrine, the green planks |
| Monk | The Nine Quiets | Climbing: the bell; insight: Amery's hands; stillness as a Drawing hand |
| Commoner | A Trade of One's Own | The richest coin and friends of any build: three guilds and their faces; no combat required anywhere |

Every substantial conversation has at least one route needing none of charisma's skills (an hour sat, a thing carried, a favour done): Rill (bail and mend), Sister Nobody (a hot supper sitting down), Peck (a silent vigil), Pell (the vigil on the Chapel step), Hobb (the other end of the hoop), Pip (a ration and an hour), Fenn (an hour sitting), Lacke (a gaining clock), Thole (a plain explanation), Orme (hold her lamp). A company with no charm and no learning can, in principle, finish by the city's own right on the ninth night; it will not have been told the secret unless it opened the sealed letter.

## 4. Rewards

*Experience:* 129 milestones, 25 to 150 each; the module's own 1000 on finishing in a world.
*Things:* the white domino (a face; grants insight) or the countersigned Warrant (grants persuasion) at the end, one or the other; an earned trade face, tool; the Second's blade; the Hearer's stole; the Moth's tongue; the Brothers' mantle; the Fitter's picks; the Wall-reading; a homing pigeon; the Mender's treatise (lore).
*Endowments (`endow`, never past 25):* a quality +1 from each completed arc (strength, intelligence, wisdom x3, charisma x2, dexterity x2, constitution); a face taken gives wisdom, declined gives charisma.
*Companions:* Sergeant Vail (`willing`) if trust is 3 and an answer to the Concord's offer given.
*Spells:* **none by the mechanism the brief asked for.** `Resolve reward`/`learn_reward` cannot teach any catalog spell (no ability has a `learn` effect); the mage's three leads teach three first- or second-level spells each through the shared `train_member` (20 xp, 3 coin; second-level spells are learned but never offered for preparation). This is the largest gap between ambition and engine.
*The highest-level reward* is the choice: a face of your own in a city that answers faces (a person, in Ombra, for good), or the road home with a passport. Both are mechanically small and narratively the book's argument.

## 5. Authoring friction (the engine's, not the authors')

The ten authors' own lists are in `notes-*.md`. The ones that recur, by severity.

**Severe**
1. **`Resolve reward` is unusable for spells and abilities** (mage, cleric, bard, ranger all hit it). The brief for a mage's researched spell and a bard's song cannot be delivered as a taught spell. *Remedy:* a `teaches(person, ability)` or `Resolve learn(member, ability)` that works on any catalog ability; and module-declared abilities.
2. **Combat has no mercy.** A foe at 0 HP is dead; `Pleads` fires only when a foe flees, which no foe does. The Gauntlet's "non-lethal bouts" had to be rolls, with real fights as a lethal fork. *Remedy:* yield at N HP for persons.
3. **`Known as` does not reach labels.** "Talk to Tomas Pell", "Lift X's mask", "Name X aloud" and `{who}` in any label print the real name while the page says "a Crow clerk". In a book about masks this leaks the premise on every person. Every author worked round it differently (renaming labels, dropping `Known as`). *Remedy:* labels and placeholders honour `Known as` until the fact is known; and a `Known as` string with a comma is split into name and role.
4. **Results cannot vary**, and a rule's `says` arrives one pass after the Result (the Grand Tour's friction 6, hit again by every author): state-dependent endings of an action are separate rules, told in a different order from the player's turn.
5. **`Greets` cannot vary by register** (day masked, night bare): a second one is "Duplicate entity"; every author wrote the two registers as topics and neutral greetings.

**Serious**
6. **The cross-adventure `names` lint refuses any shared surname.** Ten authors re-named a dozen people (Vane, Quill, Pask, Fenn, Hobb, Ludd, Strake, Ostler, Penhallow, Lamb...). A house-name declaration or a per-module opt-out would remove it; as it stands it makes every new adventure harder to name than the last.
7. **State ids share the shared rules' namespace in a placed world only** (`shut` clashed in the placed install and not in the campaign lint). Lint of the campaign does not catch it; the placed test does.
8. **Anchored rules act wherever the company is** and are told only at the anchor: every world-changing event is two rules (an unanchored change, an anchored telling with a latch), 29 lint advisories.
9. **A failed check leaves no trace and costs nothing**: every author re-invented a per-actor retry measure. A `dc` that can read a measure (trust) and a "one try per N hours" modifier would remove it.
10. **Passages cannot be gated by a face or a calling**; a blocking way cannot be walked by an act; `opening when` is symmetric and traps a company inside a room whose door shuts by day. A Doorward's judgement of the Fit is four actions where one condition would do.
11. **A test cannot force a die**; every author surveyed seeds, so tests are tied to the dice stream and to the order of rolls before the check.
12. **The full suite is heavy and the loader slow** (30 to 55 s per lint of this module): authoring iteration was by `play`, which is fast, and by lint at the end of a coherent piece.

**Minor** `Time 1 hour` is refused (`Time 6` is an hour); `site == room` does not parse; a string has no newline or double quote; `Resolve endow` needs a `member` so every reward is per-member; `--probe` documents only `knows` and `#measure`; "engine", "flags" trip the prose lint.

## 6. An honest critique

**What works.** The conceit is a game, not a setting: the player is a Bare in a city that answers faces, and every conversation therefore has two registers and a price in heat. The Concord's rules are never explained; they are done to the player (the sergeant who will not say her name, the Annex that rents a face, the Doorward who judges a Fit). The secret is deducible from five places that do not know they hold it, and the player may instead break a dead woman's seal and be told: a real choice about wanting to know. The endings are positions, not prizes: none is the right one, and each is paid for by what the company did to get there. Several conversations are good because the person is moved by something other than evidence: Hobb by seeing a stranger sit bare, Peck by his name said kindly, Pell by a child's forgiveness or a handwriting, Hart by being refused as an equal, the Contessa by being beaten at a game. The local stories (the umbrella feud that is a small Feud, the eel-race, the dress, the choir, the ladle) are procedural comedy with a human end and stay local. The Burning of the Nobodies is a physical search with a clock and six real ways to the Book.

**What does not.** *Ten authors, one tone.* The briefs were strong and the voices are recognisably one city, but the prose runs long in places (turns of 100 to 135 words against a 90-word cap), several speakers share a cadence of dry, patient, slightly rueful understatement, and the best lines are not always where the weight is. *The main case is rich in clues and light in confrontation:* the Hearing, where the Warden is Named or spared, is a handful of actions in the integrator's file, and is the book's climax. It deserves a scene with the weight of the Burning. *The finale is thin where the middle is thick:* seven Drawing positions are seven actions with a paragraph each, and the eight Hands are eight separate acts the player triggers in a list; the room is a number (order) and a few news lines, not a crowd that can be played. *Rewards are small in code and large in prose:* no spell, no new engine capability, endowments of +1. *The metropolis lives in its districts and not between them:* the Sleeves hold their people, but the people rarely meet across them (Rill and Cosimo, Pip and Pell, Lyle and Lacke are the exceptions, and they are the best things in the book). *Integration is under-tested*, as above. *Peck, Pip and Hobb* carry the book's heart, and each is placed (a cot, a den, a cooperage) where a player who does not look will not find them; the Rounds mostly point at them, but a company that reads the ledger late has little time. *The satire is sharpest where it is least explained* (the Fit, the Wall, the Naming) and softest in the Candid and the Old Names, who are drawn more kindly than the Concord deserves, or than a satire of transparency and nostalgia should allow.

**What a second pass would do.** One editor reading the whole for repetition, length and the false ease of the dry voice; a scene-length Hearing; a Drawing that can be *played* (the crowd as people with moods) rather than computed; a campaign-wide offered-action exploration and a dedicated test for each ending; the real mercy mechanic; and the rewards made structural: a Doorward's door, a Face system the next adventure can read.

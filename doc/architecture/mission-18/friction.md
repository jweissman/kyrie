# Mission 18: the adventures' friction

Where Kyr, Deem, the engine, the tools and the page resisted two adventures written against this mission's engine:
the Grand Tour (adventure/grand-tour, its own friction at doc/adventures/the-grand-tour/friction.md, with points found in
its critique, second pass and playtests) and Wapshott's Peregrine Circus (adventure/big-tent, Phase I; read for its
findings only, not merged, its author at work on Phase II). Each point was read against main at 827354c by one agent and
checked by a second, reading the code only. Nothing was played or probed for this record: "still holds" means the code
on main still does what the author met. The register (register.md, "The adventures' authors") carries one row for each;
this is each row's whole case, in the authors' order.

## GTR-01: A module installed partway into a game reads the clock as its own, counted from its first morning, while the shared rules read the world's clock

*The Grand Tour friction 1. Gate B, P1; still holds on main.*

**The finding.** A module installed partway into a game reads the clock as its own, counted from its first morning, while the shared rules read the world's clock. So a timer that the module keeps in a shared measure is wrong. A grant of underwater breath, written exactly as core.kyr's own comment says (`Set grantedUntil(party, breath) to watch(clock) + 6`), ended in the watch it was given, and the Grand Tour's Whelm could not be entered in a generated world.

**On main.** src/campaign/clock-shift.ts:20-38 (main 827354c) rewrites every read of watch(clock) in a late module's own prefixed declarations, their effects included, to watch(clock) minus the elapsed watches. local() walks every key (:46-65), so the value of a Set on any measure is shifted too. data/rules/core.kyr:52-55 tells authors to write `Set grantedUntil(party, flame) to watch(clock) + 12`. `grant_ends` (core.kyr:57-59) is a shared, unprefixed rule (module-namespace.ts:30-32 and :101-102 keep shared names and rules unprefixed). It is not shifted, and it compares grantedUntil with the world's watch, so the grant is retracted on the next pass. Neither src/cli/campaign-lint.ts nor src/cli/kyr-lint.ts reads clock writes. test/granted.test.ts starts the brand probe as a campaign at watch 0, where ClockShift.apply returns at once (:21-22), so the placed case is untested. A second instance on main, found by reading and not probed: A Winter in Carth's fasts write the shared measure `Set nextMeal(actor) to watch(clock) + 144` (data/adventures/winter-in-carth/widow.kyr:41, stand.kyr:25, gate.kyr:85). These are action effects, and the actions are prefixed and shifted (module-namespace.ts:56-60). The shared `meal` and `hunger` rules compare that measure with the world's watch (data/rules/needs.kyr:11,14; 'needs' is among the world rules, module-bundle.ts:55). Carth is installed late through the frontier in a generated world (countries.json lists winter-in-carth/placed.json; frontier.ts:61; campaign.ts:132-139 passes current.elapsed). So 'no meal until tomorrow' makes a meal due at once, and rations are eaten until nextMeal catches up. A case that is consistent today: Occasions write the shared measure matterSince (core.kyr:11) from the watch and read it only in the module's own lowered rules (src/lang/occasions.ts:77-79, 89-90), so the write and the read are shifted alike. The Grand Tour's workaround: clock.kyr:32-38 keeps its own breathUntil and holds grantedUntil at 0.

**What remains.** A late module writes the watch into a shared measure (grantedUntil, nextMeal, lastSlept and the like) in its own shifted time, while the shared rules read that measure in world time. Reads go wrong the same way: a module comparing a shared, world-time measure with its shifted watch. Nothing warns about either.

**Repair.** In ClockShift, shift only what is the module's own. A watch(clock) read inside the value of a Set, Increase or Decrease on a measure the module does not own (unprefixed) stays the world's. So does any comparison of the watch with such a measure, or with arithmetic over one. Apply both halves together: Occasions' matterSince, a shared measure written and read only by a module's own lowered rules, stays consistent only if its write and its comparison move together. Back this with a lint advice when a module that can be installed late sets a shared measure from watch(clock). This is the author's first remedy. Their second, shifting only grantedUntil writes, is too narrow given Carth's nextMeal.

**Verified by.** Extend test/granted.test.ts with the brand probe installed late (on day 3, as the frontier does): capable(party, flame) holds for 12 watches after the grant and is gone on the 13th. Add a Carth-placed-late spec: after a fast, hungry still holds, rations are unchanged, and nextMeal is the world's watch + 144. Add an Occasion in a late-installed probe: its matters still close on their own watches. Add a lint probe: a late module writing grantedUntil from the watch gets the advice.

**Related.** AUT-09, ADV-01, M18-04, OWN-13, ICE-07 (M17, fixed), GTR-20.

## GTR-02: Whether the company hears a rule's line anchored near someone

*The Grand Tour friction 2. Gate D, P1; still holds on main.*

**The finding.** Whether the company hears a rule's line anchored near someone (or at a place) is decided after the rule's own effects have been applied. So an event near Quance that carries her to the Nexus is not told to the company standing beside her. Nor is an event near her in the watch her routine moves her. The event is used up without ever being told.

**On main.** src/campaign/campaign-tick.ts:136-141 applies and commits the rule's effects (`next = Journey.along(prior, prior.apply(...))`). Only then is the telling judged, by `LocalObservations.perceives(next, player, rule.place, rule.anchor)` (:143-144), in the later world. For 'near', local-observations.ts:17-22 and :32-36 read at(entity, ?here) in that world. For 'at', :14 reads at(company, place) in it, so an `at` rule whose effects move the company out of the place is untold as well. NPCs act before the rules pass (:37-38), and rules are tried in declaration order (:119-122). So a routine, whether kept as an earlier rule or as a pursuit, has already moved her when a later event near her is tried. An NPC's act, by contrast, is seen if the company was there before or after it (`seen`, :109-115). An Event's once-latch is among its own effects (src/lang/world-constructs.ts:232-238), so an event nobody heard is latched and never told. No register row covers when the telling is judged. ICE-01 (M17, fixed) is about anchored effects happening unheard while the company is away, and CTH-06 and ICE-02 are about news told late; this case is the company present but not counted.

**What remains.** An Event or Rule anchored near a person is never told, and an Event is used up, when its own effects or an earlier act in the same watch move that person. The same holds for an `at` rule whose effects move the company away. Authors must split every such moment into a marking event and a move a watch later.

**Repair.** Judge a rule's telling as a witness would. It is perceived if the company perceived its anchor in the world before this rule's effects, or after them, or as the watch's tick began (before NPCs acted). The first two are the same either-world test CampaignTick.seen already applies to NPC acts. Leave the effects and an Event's latch as they are: un-latching would make the effects happen twice. An event the company truly did not perceive is ICE-02's news, told late.

**Verified by.** Probe: `Event climb near quance when … "…" { Assert at(quance, nexus). }` with the company beside her: the line is on the page. Second probe: a routine rule declared before an event near her moves her in the same watch, and the event is still told. Third: an `Event … at hall` whose effects move the company to the cellar is told. Negative: with the company elsewhere in both worlds, nothing is told.

**Related.** CTH-06, ICE-02, ICE-01 (M17, fixed), COR-12, GTR-04, GTR-22, GTR-23.

## GTR-03: A rule cannot see a companion die in the obvious way. `dead(fabian)` holds

*The Grand Tour friction 3. Gate D, P1; still holds on main; held by ARV-M7.*

**The finding.** A rule cannot see a companion die in the obvious way. `dead(fabian)` holds, and `able(fabian)` fails, from the moment he joins, because his body is now counted in the company and his own group is empty. The engine writes no fact for a recruit who dies with the company.

**On main.** src/campaign/membership.ts:21-22: a recruit who has joined is an actor with no members. src/campaign/creature-facts.ts:150-154 writes dead(actor) as 'no member above 0 hp' and able likewise, so dead(recruit) holds and able(recruit) fails throughout his time in the company. No relation records a recruit's death: EngineWrites.names (src/campaign/engine-writes.ts:13-15) has none. Laying a member to rest (release, membership.ts:107-115) retracts memberOf, fallen, awake and needsCare but leaves joinedAs. depart (:69-94) runs only when travelsWith is retracted, which nothing in the shared rules does on a death (people.kyr asserts it, :43; no shared retract). One correction to the friction's account, from reading main: a slain member does not leave the company and become the recruit's member again. He stays a member: partyIds change only in depart and release. memberOf(ref, party) is projected (creature-facts.ts:166) and joinedAs(ref, fabian) is kept. slain(ref) is projected (:174-176), and 'Lay {lost} to rest' requires memberOf(lost, actor) and slain(lost) (data/rules/care.kyr:66-69). So `joinedAs(?m, fabian) and slain(?m)` very likely holds; the author's either-or rule (murrey.kyr:89) covers both readings and was never exercised in play. ARV-M7's repair already names 'die' among the membership lifecycle's events. This friction adds the dead()/able() trap and the need to bind an internal ?m as concrete evidence.

**What remains.** The group facts dead() and able() say the wrong thing about a recruit who has joined. A companion's death can be read only by knowing the engine's internal member bindings (joinedAs, memberOf, slain).

**Repair.** Within ARV-M7's single membership facility, the engine writes a fact when a recruit's member dies while in the company, and keeps it after burial. Give it a name no module has. `lost` is already declared by four (data/goings-on/fever/situation.kyr:6, data/situations/brood-hollow/situation.kyr:13 as a measure, let-one-remember/clocks.kyr:85, parliament-of-books/parliament.kyr:5), and a shared name absorbs a module's declaration of the same name (module-namespace.ts:30-32). So use something like `fellWith(recruit, company)`. While a recruit is in the company, write dead(recruit) and able(recruit) from that recruit's own bodies (their joinedAs members), not from their emptied group. The guide documents the reading.

**Verified by.** Companion lifecycle spec: a hired recruit joins, and while their member stands, dead(recruit) is false and able(recruit) true. Their member is slain in a fight: fellWith(recruit, party) holds, still holds after 'Lay … to rest', and a module rule on it fires once. The fever and brood-hollow situations' own `lost` still behave as before. Extend to a family member and an adventure's companion (ARV-M7's spec).

**Related.** NAR-18, GTR-10, GTR-12, GTR-29.

## GTR-04: Endings are tried in the order written and the first that holds wins

*The Grand Tour friction 4. Gate D, P1; partly answered on main.*

**The finding.** Endings are tried in the order written and the first that holds wins. The lint warns only when a later ending can never be reached at all, not when two can merely hold at once. So an accomplice whose hill crushed the Whelm was given the Second Whelming's ending instead of First Through, because the Second Whelming was written first.

**On main.** src/lang/endings.ts:34-44: each Ending becomes a rule asserting reached(id) and `concluded`, and `concluded` shuts every later ending. Rules are tried in declaration order (src/campaign/campaign-tick.ts:119-122; documented in the guide's 'The order things happen in'). The lint, CampaignLint.endings (src/cli/campaign-lint.ts:140-150, commit 7fffc1f), warns only when a later ending asks every condition an earlier one asks (`[...e.asks].every(a => late.asks.has(a))`, :144). That closed M17's AUT-11 ('ending precedence by order') and is also cited in AUT-23's evidence. Two endings that can merely hold together, neither containing the other (First Through and the Second Whelming), pass silently, and the one declared first wins. The same-pass ordering half of this friction (the Rector's routine before the petal events) is GTR-02's lost telling. Not a duplicate of AUT-23: that row's remains and repair are a lint for decreases below nothing, at P3.

**What remains.** An ending that can hold together with an earlier one, where neither asks all the other asks, silently loses to it, and the author learns of it only in play. M17's AUT-11 was closed by a lint that sees only the fully shadowed case.

**Repair.** When an ending is reached, test the module's other endings' conditions in that same world. Record any that also hold, naming both and the winner by order, as a warning in journey and test runs; this is cheap, sound and free of noise. Statically, CampaignLint.endings may advise on pairs that share a condition and contain no contradiction (no fact asserted in one and negated in the other, no two values of an exclusive relation). Keep that advice quiet where the module has said the precedence. Add a Kyr precedence form (`Ending x … over y`) so the winner is stated, not implied by order (keep the lint quiet, given GTR-21's noise).

**Verified by.** Endings probe: endings `a and b` then `a and c`, played to a state where a, b and c all hold: the run reports both, the first as winner. `a` then `not a and c`: no report. The existing shadowed-ending case (test/endings-lint.test.ts) still warns. On the Grand Tour's module, the First Through / Second Whelming pair is reported by the journeys, or its precedence is stated with `over`.

**Related.** AUT-11 (M17, fixed), AUT-23, GTR-02, GTR-21, M18-05.

## GTR-05: A promise's kept line is told wherever the company happens to be when its condition first holds, and keeping is final

*The Grand Tour friction 5. Gate D, P1; still holds on main.*

**The finding.** A promise's kept line is told wherever the company happens to be when its condition first holds, and keeping is final. Perrin's 'goes on being so, as he asked' was told the minute the Door opened, and in one play minutes before the hill came down on him.

**On main.** src/lang/promises.ts:48-58 turns a Promise into two rules, `<id>_kept` and `<id>_broken`, each with a line and no place. CampaignTick.fire therefore tells them anywhere (src/campaign/campaign-tick.ts:143-144, `!rule.place ||`), on the first watch the condition holds. Keeping is final: the promise stands only while it is neither kept nor broken (promises.ts:50-52), so a death after it was kept cannot break it. The promisee is known to the lowering (`p.to`, used only for the aim's text, :58) but not used as an anchor. Kyr has no closing-news form for a promise kept by something lasting, such as a secret held; the grammar and src/lang have none. The Grand Tour's workaround is whelm.kyr:206-208: kept only on the closing day, and only while he lives. The construct is M17's AUT-24 (fixed); no M18 row covers its timing.

**What remains.** A promise kept by a lasting condition, such as a secret held or a man left alone, has no right moment to be kept. Its line arrives wherever the company is, and later events cannot undo the keeping. Authors must invent a closing-day condition.

**Repair.** Two Promise forms. First, `kept at the close when …`: judged when the story or chapter closes, at an ending or in the closing news, and broken if its broken condition held first. Second, kept or broken lines anchored to the person promised (`p.to`): told near them, or held as news until the company is with them, as ICE-02 asks for news.

**Verified by.** Promise probe: a kept condition holds while the company is away from the person promised; the line is not told there, and is told when the company is with them or among the closing lines. A 'kept at the close' promise whose promisee is killed before the close is broken, not kept.

**Related.** AUT-24 (M17, fixed), CTH-06, ICE-02, NAR-14, GTR-22.

## GTR-06: An action's `Result` is one fixed sentence whatever the hour or the state of the place

*The Grand Tour friction 6. Gate D, P2; still holds on main.*

**The finding.** An action's `Result` is one fixed sentence whatever the hour or the state of the place, so the basket's ride up through the cloud told of "the middle of a fine afternoon" when it was taken at ten at night. The author had to write time-neutral Results and move the light into pairs of observations gated by day and night.

**On main.** src/lang/Kyr.ohm:115 `Result = "Result" string "."` (no condition), compiled to one `report` string at src/lang/module-parser.ts:274-276. src/lang/observation-text.ts:11 says "Deliberately not a narration language: no conditionals or code": only measures and entity names interpolate. A precedent exists: a Role and a person's words take `when` (Kyr.ohm:91, :80; RoleWhen :93). The Grand Tour's basket runs until 22:00 (ascent.kyr:20-25 in the worktree), so the fixed daylight Result was reachable at night. No register row covers conditional action text; ARV-M2 lists other missing middle-sized constructs. Big Tent wants the same thing twice: WPC-05 (a closed way's text per condition) and WPC-26 ("the first time the company sees this, and after").

**What remains.** An action says one thing on success and one on failure whatever the hour, the place's state or what the company knows. Authors write time-neutral prose, or split the action in two.

**Repair.** Add a second form, `Result "…" when <predicate>.` (and `Otherwise … when`), allowed several times. The first whose condition holds after the effects is told, and the plain Result is the fallback. Compile it into a list of reports on the operator and round-trip it through module-writer. Lint advises when no unconditioned Result is left.

**Verified by.** Probe module: an action with `Result "…sun…" when not dark().` and a plain `Result "…lamps…".`, taken at 14:00 and at 22:00, shows each text in turn. A module-writer round-trip test. The Grand Tour's ride_up rewritten with it.

**Related.** ARV-M2, CTH-05, AUT-25.

## GTR-07: A thing's change (picking the escritoire's lock) can be held back only by the tools, knowledge or goods it needs and the side it is done from (and, by the shared rules, by the dark), never by a condition its author names

*The Grand Tour friction 7. Gate D, P2; still holds on main.*

**The finding.** A thing's change (picking the escritoire's lock) can be held back only by the tools, knowledge or goods it needs and the side it is done from (and, by the shared rules, by the dark), never by a condition its author names. So it was offered with the footman standing over the escritoire, and the author replaced it with a hand-written action.

**On main.** src/lang/Kyr.ohm:34: ChangePart takes only `needing`, `after learning`, `consuming` and `at`. src/lang/world-constructs.ts:185-197 compiles those into needs, changeKnows, changeAt and consumes/spends facts. The three shared change actions (data/rules/passages.kyr:107-131) also refuse a dead thing and a benighted company (:111), so the claim "never by the world's state" is too strong: the dark does hold a change back, but an author's condition cannot. The Grand Tour's workaround is `Action pick_escritoire … "while the drawing room is empty"`, requiring `not at(jem, drawing_room) and not at(imogen, drawing_room)` (cloudgate.kyr:68-70 in the worktree). A precedent to copy: a Passage's `opening when <predicate> "…"` (Kyr.ohm:22) compiles into upkeep rules that keep `unopened` (world-constructs.ts:62-80).

**What remains.** A Thing's change cannot be held back by who is watching, the hour or any other condition the author names, and nothing on the page says why it is not offered.

**Repair.** `Change … when <predicate> "why not"?`, compiled like a passage's `opening when`: upkeep rules keep a `withheld(change)` fact, the three shared change actions require `not withheld(how)`, the optional text is told beside the thing while the change is withheld, and `kyrie inspect` names the condition.

**Verified by.** Probe: an escritoire with `Change pick … needing lockwork when not at(footman, drawing_room).` With the footman present there is no Pick choice and inspect names the condition; with him gone the choice is offered. The Grand Tour's own pick_escritoire stays a hand-written action, because it also makes a lockwork check (cloudgate.kyr:72), which a Change cannot.

**Related.** ARV-M2, AUT-17, PT-33.

## GTR-08: A guard's state line, or the line of a thing set across a way, is told from both ends of the way

*The Grand Tour friction 8. Gate D, P2; still holds on main.*

**The finding.** A guard's state line, or the line of a thing set across a way, is told from both ends of the way. The Doorwarden's "keeps the Fire Door… from his desk" was read on the far side of the Fire, and the Halyards' bar "lies across the arch" once the company was through it, standing on air. The author rewrote both in words true from either side.

**On main.** src/campaign/local-observations.ts:10, :20: a claim beside a passage is perceived from either end. :29 and :38-41: a claim near a guard is perceived "across a way it guards, from the far end". A Thing `on` a way has its states anchored beside the way (src/lang/world-constructs.ts:219), a person's states near them (src/lang/person-parser.ts:217), and a way's shut text beside it (world-constructs.ts:78). A change can already be one-sided (`Change … at <place>`, data/rules/passages.kyr:27-29), but a state's text cannot. Tench's line as it stands, "…with his ledger open" (collegium.kyr:169), is the author's side-neutral rewording, not the line that read wrong. Big Tent WPC-05 is the same family (a closed way's text told as part of the room).

**What remains.** An author cannot say from which end of a way a state line is true, so it must be written in words true from either side.

**Repair.** A State (and an Observe beside a way) may say `from <place>`, so it is told only to a company at that end, or carry a second text for the far end (`… beyond "…"`). The far-end telling of a guard uses that text when one is given.

**Verified by.** Probe: a guard at A over a way A–B with `State on_duty blocking "…at his desk…" from A.`: the line is told at A and not at B (or B gets the far-end text). A bar on a way is told only from its near side. Spec in the observation-anchoring tests.

**Related.** CTH-05, CTH-12, ARV-H5.

## GTR-09: A kind of thing can grant only one of the shared skills, not a capability the module declares for itself

*The Grand Tour friction 9. Gate D, P2; still holds on main.*

**The finding.** A kind of thing can grant only one of the shared skills, not a capability the module declares for itself (breath under the sea, proof against the Fire). So the author grants it by a rule on merely carrying the thing, and because a capability belongs to the whole company, one brine helm lets everyone breathe.

**On main.** src/canon/local-catalog.ts:38-40 refuses `granting x` unless Canon.skills has x ("which is no skill"). That check is the only block. Once installed, an item's grant becomes its catalog `capability` (local-catalog.ts:64). PartyCapabilities.brings compares any id (src/campaign/party-capabilities.ts:21). The engine already writes `brings(member, capability)` per member for every capability entity, a module's included (data/rules/core.kyr:51; src/campaign/creature-facts.ts:111, :131-135). But a way's `needing` reads the company's `capable` (data/rules/passages.kyr:37-39), so even with the grant, one wearer would let the whole company through. So far the way round has been to put a module's capability into the shared catalog (`oath`, core.kyr:23 and data/catalog/skills.json). The Grand Tour's workarounds: helm_breath and cloak_proof on `holding` (lamp.kyr:133-134), and breath_lost (clock.kyr:38), over the company-wide `granted` (core.kyr:56). Big Tent WPC-12: a local kind `like old_glossary` silently inherits that kind's grant of lore (local-catalog.ts:41).

**What remains.** An item cannot bring a capability the module declares. What the module can grant instead (by rule) belongs to the company, and nothing lets a place or way need a capability of every member rather than of the company.

**Repair.** LocalKinds.item accepts `granting <capability>` naming a capability entity the module or the shared rules declare, checked against the module's entities rather than Canon.skills, installed with the kind and removed with it. The existing per-member `brings` and the company's `capable` then follow from the equipped item. Add a way to need a capability of each member (`needing breath of each`, or a shared query over `brings`) for capabilities like breath. Lint advises when a local kind inherits a grant from its `like`.

**Verified by.** Probe module: `Entity breath: capability`, a local helm kind `granting breath`, and a way needing breath of each member. With one member wearing the helm, capable(party, breath) holds, brings holds only for the wearer, and the way is refused until every member wears one. A load test that the kind and its grant are gone when another campaign is played.

**Related.** ICE-22, COR-04, ARV-M2.

## GTR-10: Someone made to follow the company is carried with it only if they were already following and standing where it stood before it moved

*The Grand Tour friction 10. Gate D, P2; partly answered on main; held by ARV-M7.*

**The finding.** Someone made to follow the company is carried with it only if they were already following and standing where it stood before it moved. So Mercy, made to follow while she was down at the air-bell, and Ha'penny, lifted into a basket by the same action that carries the company up the Fish Stairs, are both left behind unless the module keeps a rule of its own to bring them. And a topic marked `travelling` cannot be put to a follower.

**On main.** Main carries a follower who stands with the company on any move, as the fork did. Short moves go by Journey.along (src/campaign/campaign.ts:396; src/campaign/journey.ts:39-47), long ones by Journey.of (journey.ts:22-35; campaign.ts:290-293), and moves made by rules likewise (campaign-tick.ts:136; HSL-06 at 30168b6 and 42ef546, both before the fork at 87f57dd). Both paths read who follows from the world before the command (journey.ts:32, :42) and take only someone standing where the company stood (:33, :44). So two cases are missed. (1) Ha'penny: carry_hapenny asserts following(hapenny, party) and moves the company in the same effects (harbour.kyr:194-199). (2) Mercy: fetch_mercy asserts following while she is at the air-bell or the guildhall (whelm.kyr:128-129, :255-258), and nothing brings her. The module's followers_keep_up teleports both (clock.kyr:47). A `travelling` topic requires travelsWith (src/lang/module-parser.ts:290-295). test/follow.test.ts:11-14 pins the shared `go` action carrying a follower and :31-36 a rule, but no authored action's move, no multi-watch move, and neither of the two cases above. Judged by reading, not probed.

**What remains.** A following begun in the same effects as the move, or begun while the person is somewhere else, leaves that person behind silently. Travelling topics skip followers. The Grand Tour still needs the per-adventure keep-up rule that HSL-06 was meant to retire.

**Repair.** Inside ARV-M7's single membership facility: Journey.along and Journey.of take as followers whoever follows the company after the command's effects and stood where it stood before. Beginning to follow brings the person to where the company stands, or lint advises when an effect asserts following or travelsWith of someone the same effects do not place with the company. Travelling topics reach anyone who follows or travels with the company.

**Verified by.** Extend test/follow.test.ts with: an authored 1-minute action and a three-watch action that move the company both carry Rupert; an action that asserts following and moves the company in one set of effects carries the new follower; a topic asserting following of someone in another room brings them (or lint reports it); a travelling topic is offered to a follower. The Grand Tour's followers_keep_up removed, with its journeys unchanged.

**Related.** HSL-06, NAR-18.

## GTR-11: `within(x, area)` holds of a person or thing standing in a place of the area but never of a place itself

*The Grand Tour friction 11. Gate D, P2; still holds on main.*

**The finding.** `within(x, area)` holds of a person or thing standing in a place of the area but never of a place itself, so "the Nexus is within Sennet" is silently false, and a destination check had to drop it.

**On main.** src/lang/computed-relations.ts:14 walks the parents starting from `world.one('at', first)`, which a place does not have. LocalObservations.inArea does the same (src/campaign/local-observations.ts:25-28). `within` was added for HSL-13 (M17, 30168b6) with people and things in mind (data/rules/core.kyr:43-45 documents it so). The Grand Tour's Door of Doors (door.kyr:50-52) checks only `settled(dest) and not indoors(dest)`.

**What remains.** A place cannot be tested for lying inside an area, and the test fails silently.

**Repair.** within(x, area) walks the parent chain from x itself when x is a place, and from where x stands otherwise. The guide and core.kyr's comment say so; until then, lint refuses a place as the first argument.

**Verified by.** Unit probe: within(nexus, sennet_town) holds for a room nested two levels deep; within(party, area) is unchanged; within(area, area) is decided and documented.

**Related.** HSL-13, ICE-24.

## GTR-12: When someone joins or leaves the company and their author gave them no `Joins` or `Leaves` line

*The Grand Tour friction 12. Gate D, P2; still holds on main.*

**The finding.** When someone joins or leaves the company and their author gave them no `Joins` or `Leaves` line (or they join a second time), the engine puts a stock line in their mouth, even straight after the author's own scene. Ha'penny lifted into a fish-basket, and the Dowager after the most important speech of her life, both said "'Why not. It's not as if anything is keeping me here.'"

**On main.** src/narrative/telling.ts:68-97: a join or a part is told in the person's own words only the first time (:78); otherwise a line comes from data/voice/join.json, whose stranger lines include this one (join.json:26). A greeting with the person's own words never falls back to the tables (:92), but a join or a part does. The world's own words silence the tables only for thanks, turns and objections (telling.ts:27, :35), so an authored topic or action that already told the joining still gets a table line. No lint mentions Joins (src/cli, src/lang). On main, people whom shipped modules make follow or travel with no Joins include Callow (liberty-of-the-ice/callow.kyr:35, :89), Celia and Brocca (hessel) and Tobu (house-that-grows/cobble-ring.kyr:100). The Grand Tour now gives every follower Joins and Leaves (whelm.kyr:124, harbour.kyr:141, cloudgate.kyr:33). Grand Tour friction 29 (Perrin) is this same finding again.

**What remains.** The generic join and leave voice speaks for authored people: those without Joins or Leaves, and those with them on any later joining, even when their own scene already told it. Nothing tells the author which people need the lines.

**Repair.** (1) A person with their own Joins or Leaves is never given the tables' line, as Greets already is. (2) The tables say nothing for a join or part caused by an authored topic, action or rule that said its own words (Says, Result, says). (3) Lint advises of a person whom an effect makes following or travelsWith with no Joins, or with no Leaves where an effect ends it.

**Verified by.** Probe: a topic with Says whose On discuss asserts following(x, party) leaves no join.* voice id on the page, while an action with no Result still gets one. A person with Joins who joins twice gets no table line the second time. Lint over the library lists the people named above.

**Related.** CTH-09, CTH-08, ARV-M7.

## GTR-13: The world's record of where the company has stood

*The Grand Tour friction 13. Gate B, P2; still holds on main.*

**The finding.** The world's record of where the company has stood (`been`) is written by a shared rule only when a rule pass finds the company standing somewhere. So the place a game starts in is never recorded if the first command leaves it, and the Door of Doors ("anywhere you have stood"), like a generated wild's "strike out toward" a place been to, never offers it.

**On main.** data/rules/core.kyr:64-65: `Rule been_there when company(?c) and at(?c, ?p) and not been(?c, ?p)`. Rules run only in a command's pass, after its effects (src/campaign/watch-loop.ts:37, :53), not when the campaign is made (src/campaign/campaign.ts:80-82; src/session/play-session.ts:45-49). Nothing else seeds `been`. Generated zones read it too: `${z}_strike … been(actor, dest)` (src/world/region-zones.ts:258-261). The page keeps a second record: VisitedPlaces counts the start from the module's initial facts (src/presentation/visited-places.ts:14-16), so the page shows the start as been to while Kyr's `been` says it was not. Travel along known ways plays each leg as its own command (src/session/travel.ts:25-45), so rooms on a leg-by-leg journey should be recorded. An installation keeps the world's facts (src/campaign/module-installations.ts:157). The author's "nothing before Sennet was installed" is not confirmed by reading.

**What remains.** The starting place, and anywhere the company stands only between rule passes, is missing from `been`. Modules installed later, and the generated wilds' own crossings, inherit an incomplete record that disagrees with the page's.

**Repair.** The engine writes `been` itself whenever the company comes to stand somewhere: at the start, and on every move by an action, a rule or a journey's arrival (Journey.along and Journey.arrived). Keep it across installations, retire core.kyr's been_there, and make it the one record the page's VisitedPlaces reads.

**Verified by.** Probe: a campaign whose first command leaves the start, after which been(party, start) holds. In a drawn world, walk three places and install a placed module: its `been`-reading action offers all three and the start. A zone strike back toward a start that is a landmark is offered. VisitedPlaces and `been` agree over a long autoplay.

**Related.** M18-03, OWN-26, ADV-01.

## GTR-14: A module's names share one space with each other and with the shared rules'

*The Grand Tour friction 14. Gate D, P2; still holds on main; held by AUT-07.*

**The finding.** A module's names share one space with each other and with the shared rules'. An ending cannot share a name with an item (both are entities, and an ending is also a rule), and a module cannot use for its own the words the shared rules already use: `lodging`, a kind of service; `shut`, a query; `box`, a rule's parameter.

**On main.** An ending is an entity and a rule of the same id (src/lang/endings.ts:35, :40), and entity ids and rule ids must each be unique (src/lang/module-compiler.ts:31, :74). Hence the author's `end_…` prefixes, and `made_petal` taken by an item (lamp.kyr:83). Relations, measures and queries form a separate namespace (:33), so the author's ending/relation clash (`accomplice`, rector.kyr:87) is not confirmed by reading. A module's relation or query is a duplicate of a shared one of the same name. A declaration the shared rules make, or a name they use as a rule parameter, is refused with "choose another name" (src/lang/diagnostics.ts:44-48; clash list :53-68). The parameter refusal comes from "Parameter shadows entity" (module-compiler.ts:127). `lodging` is a shared servicekind entity (data/rules/services.kyr:3) and `shut` a shared query (data/rules/passages.kyr:61). The error is clear and lists every clash in one load (AUT-07's 6780b43), so the cost is renaming, not silence. This adds to AUT-07: endings, items and rules collide as well as states, and the shared rules reserve common words, parameter names included. Big Tent WPC-14 (local kinds not namespaced, given long names to be safe) and WPC-15 (a shared rule's parameter `box` blocks an entity) say the same.

**What remains.** AUT-07's open part (a state shares the namespace with places and things) is wider than recorded. Endings share it with items, things and rules, and the shared rules' declarations and even their parameter names reserve common words.

**Repair.** AUT-07's D2 scoping: each module's names in their own scope; states scoped to their thing; endings, chapters and promises in their own tables; a shared rule's parameters scoped to the rule so they never shadow or reserve an entity; the remaining shared vocabulary listed for authors.

**Verified by.** A probe module declaring an ending and an item both named `accomplice`, a state `shut`, an entity `box` and one named `lodging` loads and plays. Two placed modules, each with a local kind `list_kind`, load together (WPC-14).

**Related.** ICE-26, CTH-15, ICE-16, COR-04.

## GTR-15: A rule cannot write `Assert knows(…)`. Whatever a rule makes known it has to say and teach

*The Grand Tour friction 15. Gate D, P3; answered on main.*

**The finding.** A rule cannot write `Assert knows(…)`. Whatever a rule makes known it has to say and teach (`says "…" teaches fact`), which the author found fine once known.

**On main.** This is by design, not a defect. `knows` is engine-owned and refused for rules (src/lang/engine-owned.ts:13-17). The refusal names the way to do it: "a rule teaches what it says: says \"…\" teaches fact" (src/lang/module-compiler.ts:89-91). The guide's "Words that teach" section says why (doc/authoring/guide.md:967-979). test/patient-probes.test.ts P7 probes it (fixtures knows-rule and knows-assert) and matches the message. Mission 17 closed this as HSL-18 and CTH-19 (41e851a). 41e851a is older than the Grand Tour's fork point 87f57dd, so the author met this same refusal with its pointer. Kept here only for the record.

**What remains.** Nothing on main: the refusal and the guide already say what to write instead. The part still open is its sibling: a rule that teaches must also say something (GTR-24).

**Repair.** None needed; keep the refusal's pointer. If silent noticing is adopted for GTR-24, the refusal should name it too.

**Verified by.** test/patient-probes.test.ts P7: the knows-assert probe is refused with a message naming `says … teaches`, and knows-rule teaches by saying.

**Related.** HSL-18, CTH-19, AUT-19, GTR-24.

## GTR-16: The author found that a capability used in a way's `needing` had to be declared in a file loaded before the passage's file

*The Grand Tour friction 16. Gate D, P3; not settled by reading.*

**The finding.** The author found that a capability used in a way's `needing` had to be declared in a file loaded before the passage's file (`Entity breath` was moved into `clock.kyr`, the first file).

**On main.** Reading main, the order should not matter. `needing breath` is lowered per file to an initial `needs(way, breath)` with no lookup (src/lang/module-parser.ts:185-187, src/lang/world-constructs.ts:47, called from src/lang/module-declarations.ts:58). The files are then merged (src/campaign/module-bundle.ts:116-141). Only after that does the compiler type each argument, against every entity of the merged module (src/lang/module-compiler.ts:22-26, 214-226), and `needs` is typed (entity, entity) (data/rules/passages.kyr:25). Nothing in Cast.itemKinds, the namespacer or campaign-lint reads file order for an entity. `git diff 87f57dd main` shows these files almost unchanged (3 lines in world-constructs.ts). The lint cannot be what the move cured: it reads files in name order (src/cli/kyr-lint.ts:21-27), where city.kyr comes before clock.kyr, so the move only matches module.json's order. Order does matter for item kinds (module-bundle.ts:112-123; compare GTR-30). A neighbouring refusal that does not depend on order, W1 in 02-adaptation.md (`Kind … granting breath` refused "which is no skill", src/canon/local-catalog.ts:38-39), may be what the author actually met. Not probed: a browser job was running.

**What remains.** Not confirmed that declaration order matters for a capability at all; by reading it does not. If a probe reproduces it, something reads each file as knowing only what came before it.

**Repair.** Probe it first. If it does not reproduce, close it as not reproduced and say in the guide that entities may be declared in any file. If it does: read every file's entity declarations before lowering any of them (as kinds already are, module-bundle.ts:112-123), and make the error name the file that declares the missing name.

**Verified by.** A two-file probe module: the first file has `Passage … needing breath`, the second `Entity breath: capability`. It loads, lints clean, and the way opens once `granted(party, breath)` holds.

**Related.** GTR-30, COR-04, ARV-H7, OWN-36.

## GTR-17: Coming back to a place, or staying in it, the page recalls the place by its first sentence, which it takes to end at the first full stop

*The Grand Tour friction 17. Gate A, P2; still holds on main.*

**The finding.** Coming back to a place, or staying in it, the page recalls the place by its first sentence, which it takes to end at the first full stop (or ! or ?) followed by a space. A quotation or an abbreviation cuts that sentence short: "Murrey's Handbook, sixth edition: 'SENNET.", and in Pellam on main, "Alderman Gosling's study: a fire, a great many books of verse, a portrait of the late Mrs."

**On main.** The narrator recalls a returned-to place with `/^.*?[.!?](?=\s|$)/` (src/presentation/narrator.ts:100-108). The reader uses the same pattern on every turn the company stays (web/reader/stage/told.tsx:26, 44-45, 91-93). Naive splits that lose text: the identity of an aim (src/presentation/action-feedback.ts:41), the gist of what was learned (narrator.ts:355-357), and where the closing quotation mark falls in Spoken.speech (src/presentation/spoken.ts:9-11). src/presentation/second-person.ts:25 also splits this way but joins the pieces again, so nothing is lost there. Main's own library hits it: the first sentences of Gosling's study and Harker's parlour hold "Mrs." (data/adventures/liberty-of-the-ice/gosling.kyr:23, harker.kyr:22). So does Mr. Quarle's tub at the Fair (quarle.kyr:17), in the OWN-07 acceptance adventure. "Mr.", "Mrs.", "Dr.", "Messrs." and "St." come before a name 94 times across data/*.kyr, mostly in A Parliament of Books (58 with "No.") and The Liberty of the Ice (41). "No." is never a numero in the library: it ends sentences. The Grand Tour worked round it by telling its Handbook lines only on a first visit (`not visitedBefore`, handbook.kyr:7-24). None of this code has changed since the fork.

**What remains.** Every recall, gist, aim and quoted answer splits sentences at a full stop, knowing nothing of quotations or abbreviations. A place whose first sentence holds a "Mrs." or a quoted full stop is recalled as a fragment, and in the reader on every turn spent there.

**Repair.** One shared sentence splitter in the presentation layer, used by the narrator, the reader, aims, gist, spoken words and second person. It keeps a quotation whole. It does not end a sentence at a title before a capitalised name (Mr, Mrs, Messrs, Dr, St) or at an initial, but does end one at "No." unless a numeral follows. When the first sentence comes out only a few words long, the recall falls back to the whole line. This list only shapes presentation, so it is not one of ARV-M4's lists that decide meaning; note it in that inventory anyway.

**Verified by.** A unit spec of the splitter on the Gosling, Harker, Quarle and Handbook lines and on "'No.' says Callow.". Then a journey into Gosling's study, a talk there, out and back: the recall reads "…a portrait of the late Mrs. Gosling looking patient, …" whole.

**Related.** OWN-18, OWN-19, OWN-07, ARV-M4.

## GTR-18: A way of half an hour or more that is neither underground nor between places out of the world is told setting out as a walk across country, by the hour and the sky

*The Grand Tour friction 18. Gate D, P3; still holds on main; held by CTH-09.*

**The finding.** A way of half an hour or more that is neither underground nor between places out of the world is told setting out as a walk across country, by the hour and the sky. Climbing the anchor chain into the sky at dawn was told as leaving "with the sun low behind you and the dew still on the grass".

**On main.** The setting-out line is chosen by time of day, sky and early light (src/narrative/journeys.ts:20-60). Only two cases change it, both older than the fork: underground ways (tunnel, culvert, crawl, shaft, drift, or both ends underground: journeys.ts:81-86) and ways between places out of the world (journeys.ts:44-48). Mission 17's CTH-09 fix makes a frost country or winter cold (journeys.ts:70-75), but nothing reads a ladder, climb, incline or stair. journeys.ts is unchanged since 87f57dd, so nothing on main touches the author's case. The dew line is data/voice/journey.json:5. The chain is `Passage anchor_chain … is ladder … taking 2 hours` (grandtour city.kyr:131), which is 12 ticks (module-parser.ts:269-272), well past the 3-tick threshold. This adds a second case to CTH-09: the voice is chosen without a fact the module did state, the way's kind.

**What remains.** The setting-out voice ignores the way's kind. Ladders, climbs, inclines, stairs and ferries of half an hour or more set out "with the dew still on the grass".

**Repair.** Pick the setting-out set by the way's passageKind: a climbing set for ladder, climb, incline, stair and steps; a water set for ferry and ford; the country lines only for road, path, track, causeway, bridge and overland (shaft stays with the underground set). Also let a passage give its own setting-out line (`Passage … telling "…"`).

**Verified by.** A probe module with a two-hour ladder taken at 06:10 in fair weather tells no country setting-out line. A voice spec over every way kind.

**Related.** CTH-09.

## GTR-19: Buying something for a companion tells the companion paying, though the coin is the company's

*The Grand Tour friction 19. Gate A, P3; still holds on main.*

**The finding.** Buying something for a companion tells the companion paying, though the coin is the company's: "Chert pays Mr. Pargeter, and takes an empty wind-jar."

**On main.** The shared buy action checks the company's purse (`quantity(actor, gold) >= price(find)`). But its Result is "{recipient} pays {merchant}, and takes {find}.", where the recipient is simply whoever will carry the thing (data/rules/belongings.kyr:100-108). Mission 17's second-person turn (M17-06) rewrites a line only when the company is one person (src/presentation/narrator.ts:319-321, `this.alone`; second-person.ts:1-5). So in any company with a companion, the companion is told paying, and so is the protagonist when buying for themself.

**What remains.** The shared rule's telling makes the carrier the payer, so a hireling or guest is told paying out of the company's purse.

**Repair.** Have the purchase name the company ("you") as payer and the recipient as taker: "You pay {merchant}, and {recipient} takes {find}", collapsed to "You pay …, and take …" when the protagonist takes it. Read the other purse actions (sell, services) the same way.

**Verified by.** Spec: a company of a protagonist and one companion buys for the companion and the telling reads "You pay Mr. Pargeter, and Chert takes …"; bought for the protagonist it reads "You pay …, and take …".

**Related.** M17-06, ARV-M7, NAR-18.

## GTR-20: A journey step `=day D hh:mm` waits by the world's day

*The Grand Tour friction 20. Gate D, P3; still holds on main.*

**The finding.** A journey step `=day D hh:mm` waits by the world's day, but a module placed in a generated world counts its own days from the first morning after it is reached. So a journey written for the adventure's own campaign must have all its days shifted before it can be replayed in a world.

**On main.** The journey driver turns `=day D hh:mm` into a watch counted from eight on the world's first morning (src/session/journey.ts:110-111, 180-188). Each read of the watch in a placed module is shifted by the whole days before it was installed (src/campaign/clock-shift.ts:5-21, applied at install in src/campaign/module-installations.ts:134). The installation keeps `installedAt` (src/campaign/definition.ts:13), but the driver never reads it. The Grand Tour's placed test rewrites every `=day N` by that shift (grandtour test/the-grand-tour-placed.test.ts:65-68). It also rewrites the module's entity prefix in steps (`>sennet__` to `>psennet__`): the same friction for ids.

**What remains.** Steps that wait for a named time have one calendar, the world's. Nothing reads them in a placed module's own count of days, nor reads the module's ids under its installation's name.

**Repair.** Let a journey, and `kyrie play`, say whose days it counts: `=sennet day 3 21:00`, or a journey started with `{ days: 'sennet' }`. The driver then offsets named days by that installation's shift, computed from its recorded `installedAt` as ClockShift.apply does. A step's entity ids are read in the same installation's namespace.

**Verified by.** The Grand Tour's outcome journeys replay unchanged in the placed test (no `=day` or prefix rewrite) and reach the same endings.

**Related.** AUT-09, COR-18, GTR-01, OWN-37.

## GTR-21: For every person a rule or action moves, lint advises that a role which seems to put them somewhere is told wherever they are

*The Grand Tour friction 21. Gate D, P3; still holds on main.*

**The finding.** For every person a rule or action moves, lint advises that a role which seems to put them somewhere is told wherever they are. The test is a list of English words, so dress and things carried ("in a leather hat", "the Bylaws under his arm") trip it just as a real placing ("at a barrow of live eels") does. The author counted about two dozen such advisories in a city whose people keep schedules, mostly noise.

**On main.** The advice comes from src/cli/campaign-lint.ts:278-299. `placing` is a closed English pattern: at, in, on, by, beside, behind, under, over, inside or outside, followed by a, an, the, his, her, their or its. It is matched against the role's words. Any `Assert at(person, …)` in a rule or action, or a pursuit that moves them, turns it into advice, given once per person. Only people whose roles are written `when …` are spared. Reading the merged module, five moved people keep an unconditional role that matches, all of it dress or things carried: Bassett "in a leather hat" (lamp.kyr:37), Cole "in a dusty frock-coat" (collegium.kyr:127), Pargeter "in a waistcoat of many pockets" (lamp.kyr:107), Pumphrey "the Bylaws under his arm" (harbour.kyr:157), No Admittance "in a crown of shells" (whelm.kyr). The Speaker ("a word at a time", earth.kyr:17) and Tench ("at a desk between the doors", collegium.kyr:168) match too but are never moved, so they are not advised. Nineteen other roles are already written `when …`, Bethan's true placing ("at a barrow") among them. The advice itself came from Mission 17's CTH-13 (test/role-lint.test.ts).

**What remains.** The advice reads prepositions rather than places, so clothing and things carried trip it, and it is given separately for every person moved.

**Repair.** Advise only when the role's placing phrase names something of the person's starting place (a thing there, or a word of that place's own description), not a garment or a thing carried. Group a module's role advice into one line naming the people. Let an author mark a role as true anywhere (`Role "…" anywhere`). This also feeds ARV-M4's inventory of English word lists.

**Verified by.** Lint probe: a moved person "in a leather hat" gets no advice, and CTH-13's probes/roles clerk "at a high desk" still does. Lint on the Grand Tour gives no role advice for Bassett, Cole, Pargeter, Pumphrey or No Admittance.

**Related.** ARV-M4, AUT-23, CTH-13, GTR-26.

## GTR-D1: Only human, elf and dwarf can be played

*The Grand Tour friction, Deem. Gate D, P3; still holds on main.*

**The finding.** Only human, elf and dwarf can be played, and an author learns this from a refusal that names neither the ancestry refused nor those allowed. The Grand Tour's burglar journey had to be an elf's because a halfling cannot be played.

**On main.** In data/catalog/ancestries.json only human, elf and dwarf are playable; halfling, gnome, half_elf, half_orc and eight more are not. A company member of any other ancestry is refused with "Choose a name, playable ancestry and class for every companion" (src/campaign/company-choices.ts:27-30). `kyrie ancestries` prints each ancestry's name and classes but not whether it is playable (src/cli/kyrie.ts:110). The guide only points at the catalogs (doc/authoring/guide.md:163). The section's opening note, that no Deem tables were written for Sennet, records a choice, not a finding.

**What remains.** Neither the refusal nor the tools nor the guide say which ancestries a company may be of.

**Repair.** The refusal names the member and the ancestry and lists the playable ones. `kyrie ancestries` gets a playable column, and the guide's party section lists them. Whether more ancestries should become playable is M17-27's and OWN-37's question, not this row's.

**Verified by.** Spec: a journey party with a halfling is refused with a message like "Bran: a halfling cannot be played (human, elf, dwarf)".

**Related.** M17-27, OWN-14, OWN-37, AUT-25.

## GTR-D2: Background ids are Orsino's list of 215 (laborer, burglar, acolyte), not the words an author would guess

*The Grand Tour friction, Deem. Gate D, P2; still holds on main.*

**The finding.** Background ids are Orsino's list of 215 (laborer, burglar, acolyte), not the words an author would guess. A guess such as `pilgrim` fails as "Invalid creature generation context", with no mention of the background.

**On main.** Canon.backgrounds is compiled from data/catalog/orsino/backgrounds.json (src/canon/canon.ts:86-88), which holds 215 backgrounds and no pilgrim; the nearest are wayfarer, mendicant and missionary. The guide sends authors to the wrong file: it says "Backgrounds and professions are in data/catalog/backgrounds.json" (the hand tables) and names only five backgrounds (doc/authoring/guide.md:125-130). An unknown background makes the whole creature context invalid, and the error names only the creature: "Invalid creature generation context for <id>" (src/content.ts:113-114, 139). data/catalog/aliases.json has no backgrounds section, and there is no `kyrie backgrounds` listing (src/cli/kyrie.ts:108-121).

**What remains.** To find a background an author has to read a generated 215-entry file the guide does not name, and a wrong guess crashes the load with an opaque error.

**Repair.** Refuse an unknown background or profession by name, with the nearest ids ("pilgrim is no background: wayfarer, mendicant, missionary?"). Add a backgrounds family to aliases.json for common words, resolved and validated as the other families' aliases are (src/canon/canon-runtime.ts:16-19, canon-validation.ts:39-41). Add a `kyrie backgrounds` listing with each one's kind. Point the guide at it and at the Orsino file.

**Verified by.** Spec: `Background pilgrim.` on a Person fails at load naming the person, the field and three suggestions. With the alias added, it loads as wayfarer.

**Related.** AUT-25, M17-27, ARV-M8, OWN-37.

## GTR-P1: `kyrie play --choices` lists every thing in the pack with every one of its acts

*The Grand Tour friction, the page. Gate D, P2; still holds on main.*

**The finding.** `kyrie play --choices` lists every thing in the pack with every one of its acts (Give to each companion, Set down), and lists each act twice. A company of three carrying twelve things shows over seventy lines before the first door.

**On main.** Journey.choices() lists the pack's leaves as 'Pack › …' (from ChoiceList.pack, src/ui/choice-list.ts:246-264). It then lists every item's acts again as '<item>: …' (src/session/journey.ts:66-77). src/cli/play-tool.ts:85 prints both: 12 things × 3 acts × 2 listings = 72 lines. The reader folds these under each thing (choice-list.ts:263), so this is the tool's list, not the player's.

**What remains.** The tool prints its matching list as if it were a list to read: everything flattened, and the pack twice.

**Repair.** `--choices` prints what is offered here first, then the pack folded to one line per thing with its acts after it ("a torch: Give to Chert | Ha'penny · Set down"), each once. The item-named forms stay for matching steps only, and `--choices=all` gives the full list.

**Verified by.** Play-tool spec: a company of three with twelve things prints at most one pack line per thing, and no label twice.

**Related.** OWN-10, M17-25, OWN-19.

## GTR-P2: The adventure's long choice labels

*The Grand Tour friction, the page. Gate A, P3; not settled by reading.*

**The finding.** The adventure's long choice labels ("Tell No Admittance that Cloudgate is coming down on the Whelm, and the merfolk must go home through the Water Door") read well, but will wrap on a phone, and nobody has seen how they sit in the new stage.

**On main.** The author offers this as a prediction, not an observed fault. On main a topic is a conversation reply. Replies are full-width controls (web/reader/talk.css:49) that wrap (the base `.act` is flex-wrap with no nowrap, web/reader/reader.css:61-62), with the reply's number apart from its text, which gives a hanging indent. The list of replies scrolls inside the dialogue (talk.css:43-45). Only the open-country stride labels are cut with an ellipsis (stage.css:276-277). Mission 17's M17-103 (17af588) gave a long way its own row on a phone. test/frame-browser.test.ts:79-96 checks a conversation's layout at 820x1180 with many replies, but no spec sets a long label at 390px.

**What remains.** Unmeasured: how a reply of two or three lines sits among the others, and how many fit before the list scrolls, at phone and tablet widths.

**Repair.** Keep labels whole, since they are the author's style; the reply control already wraps with a hanging indent. Add a browser spec that sets the library's longest replies, and change the layout only if it shows a fault.

**Verified by.** Browser spec at 390x844 and 820x1180 with the Grand Tour's longest topic offered: no overflow or clipped text, the control at most three lines tall, its touch target at least 44px, and taking your leave still in view.

**Related.** M17-31, OWN-19, OWN-20, M17-103.

## GTR-P3: Every arrival names everyone present with their roles ("Here are A, B; C, D; and E, F"), and every return does it again

*The Grand Tour friction, the page. Gate A, P2; partly answered on main; held by OWN-19.*

**The finding.** Every arrival names everyone present with their roles ("Here are A, B; C, D; and E, F"), and every return does it again. In a city whose people keep schedules the roll at the Promenade is long, and it repeats.

**On main.** The narrator builds the roll on every arrival, return or not (src/presentation/narrator.ts:212-231). Only the place's own lines are told more briefly on a return (narrator.ts:97-108). The `familiar` filter drops only things that grow (narrator.ts:178-184). The command-line page includes the roll whenever the company moved (src/session/journey.ts:156) and prints it (src/cli/play-tool.ts:79). The reader drops the roll line (Told.roll, web/reader/stage/told.tsx:94-117). It shows each person as a card instead, one line each in a place with more than three people (web/reader/stage/place-stage.tsx:73-87), but the full set of cards still comes back on every return. This adds the case of a return in a city with schedules to OWN-19's "lists of people".

**What remains.** A return names and lists everyone again with their roles (on the command-line page as a roll, in the reader as cards), whether or not they were there last time.

**Repair.** On a return, name who has come or gone since the last visit and anyone with a stake in the company's business. Give the rest as a count ("and the evening crowd, seven more") that opens on request. The command-line page does the same.

**Verified by.** Journey spec: the Promenade visited twice at the same hour names its people once, and on the return only those who changed. A reader spec counts the person cards shown on a return.

**Related.** OWN-18, OWN-04, NAR-01, PT-09.

## GTR-22: A rule anchored `within` an area does not happen until the company is in that area, so a change in the world that needs no witness

*The Grand Tour friction 22. Gate B, P2; still holds on main; held by ICE-02.*

**The finding.** A rule anchored `within` an area does not happen until the company is in that area, so a change in the world that needs no witness (the Sexton going back up the drowned tower) waits for the company to come down. The author has to write each such moment as two rules, the change unanchored and its telling anchored, and word the telling by hand as a report after the fact.

**On main.** src/campaign/campaign-tick.ts:126-129 returns from `fire` before the rule's condition is read unless `LocalObservations.inArea(world, player, rule.place)`; its comment cites What Tessary Owes' W1 and the Road's F9 as relying on that waiting. doc/authoring/guide.md:895-896 documents it ('what it does, as well as what it says, happens when the company is anywhere in the area'), and src/cli/campaign-lint.ts:46-47 even advises anchoring `within` to make an `at` rule wait. An `at` rule fires everywhere and is heard only by a company that perceives the place (campaign-tick.ts:143-144). So Kyr has a form for 'told where it happens' and one for 'waits, and is done on arrival', but none for 'done now, told when the company next comes'. Nothing in src/campaign or src/narrative keeps news to tell late. That missing form is exactly what ICE-02 still lacks ('No late text for news the company comes back to'). The Grand Tour adds evidence to ICE-02: `within` ties the waiting to the telling, and each moment costs two rules plus a past tense written by hand.

**What remains.** No anchor lets a rule happen when its condition holds and be told, with how late it is, once the company is next in the area. Authors keep paired rules and write the past tense by hand.

**Repair.** A new anchor form, separate from `within` (for example `heard within <area>`), with ICE-02's B7/E7 repair. The rule fires when its condition holds, wherever the company is. If the company is not in the area, its words are kept as news of the area and told once on the company's next arrival, with how long ago ('While you were below, …'), and anything it teaches is learned then. `within` keeps its waiting, because Tessary's W1 and the Road's F9 depend on it. The same kept news can serve `at` rules (CTH-06).

**Verified by.** Probe module: a `heard within` rule changes a fact that is read outside the area. With the company away, the fact changes on the pass where the condition first holds, and a test outside the area reads it. On entering the area the line is told once, marked late. The existing `within` specs (Tessary W1) are unchanged.

**Related.** ICE-02, CTH-06, NAR-17, GTR-05.

## GTR-23: What the company learns by seeing or reading something is recorded only after the world's rules have run for that command

*The Grand Tour friction 23. Gate D, P1; still holds on main.*

**The finding.** What the company learns by seeing or reading something is recorded only after the world's rules have run for that command. So a rule that draws a conclusion from it (the Courant's printed lie set against Kittiwake's memory) fires one command late, after the company has already done something else.

**On main.** src/campaign/campaign.ts:300 runs `WatchLoop.pass`, which calls `CampaignTick.rules` (src/campaign/watch-loop.ts:37 for a command that takes no time, :53 for each watch). The outcome is checked at campaign.ts:313 (`updateOutcome`). Only after that does campaign.ts:324 call `Perceptions.settle`, which commits `knows` and `witnessed`/`readIn`/`toldBy` (src/campaign/perceptions.ts:13-34, 38-54). settle reads perceptions again up to three times but never runs the rules again. A rule or Ending that reads the newly learned `knows` therefore first sees it on the next command's pass. Endings keyed to knowledge are affected as well as inference rules. The author reports a test failing on exactly this: it read the paper, then checked the inference. No M17 or M18 row covers it.

**What remains.** Any inference, gate, ending or reaction keyed to something just learned lags a whole command. Its line arrives separated from what taught it, and in a test nothing happens until something else does.

**Repair.** After `Perceptions.settle` commits what was learned, run the world's rules once more, only those whose condition reads a relation settle writes (knows, witnessed, readIn, toldBy). The idle cache (campaign-tick.ts:171-178) already skips rules whose reads did not change. Settle what those rules say into the same command's perceptions, bounded to a few passes as settle already is, and then check the outcome (endings).

**Verified by.** Probe: an observation teaches a, and fact b is known at the start; `Rule infer when knows(party, a) and knows(party, b) says "…" teaches c`. After the single command that perceives the observation, c is known and the rule's line is in that command's perceptions. An `Ending … when knows(party, c)` is reached on that same command. The Grand Tour's Courant test passes without an extra wait.

**Related.** GTR-02, NAR-12, AUT-19, COR-12.

## GTR-24: A rule cannot learn something silently: one that teaches a fact must also say a line, or the module is refused when it loads

*The Grand Tour friction 24. Gate D, P3; still holds on main.*

**The finding.** A rule cannot learn something silently: one that teaches a fact must also say a line, or the module is refused when it loads.

**On main.** This is by design, not a defect. src/lang/module-compiler.ts:85-87 throws 'Rule … teaches …: it must say something, and teach a fact'. doc/authoring/guide.md:967-981 ('Words that teach') says a rule or event happens whether or not the company hears it, so it teaches only by being heard. Mission 17 settled the neighbouring point, that a rule cannot `Assert knows`, as kept by design with this reason (HSL-18, CTH-19). The author's workaround, an observation that teaches (`Observe … teaches fact`, Kyr.ohm:133,137), is the intended form, and a learned fact is told as a discovery anyway (perceptions.ts:30-31), so there is no truly silent learning to want. The only cost is that the refusal at :86 does not name what to write instead (the neighbouring refusal at :90-91 does).

**What remains.** Only that the refusal names no alternative.

**Repair.** Keep the rule. The refusal names the forms that do teach (`says "…" teaches fact` on the rule, or `Observe … teaches fact` where it is seen) and points to the guide's 'Words that teach'.

**Verified by.** Compiler probe: `Rule r when … teaches f { }` is refused with a message naming `says … teaches` and `Observe … teaches`.

**Related.** HSL-18, CTH-19, AUT-19, GTR-15.

## GTR-25: A creature that lies in wait (temperament `ambush`) strikes a company without keen eyes as it arrives, with no moment to see it and go back

*The Grand Tour friction 25. Gate C, P2; partly answered on main.*

**The finding.** A creature that lies in wait (temperament `ambush`) strikes a company without keen eyes as it arrives, with no moment to see it and go back. A strong one can end the game on the page of arrival: 'The Sexton comes at you! Brann takes 5 physical damage (0 HP left). Brann falls. The fight is lost.'

**On main.** The beat the author asks for exists, but not for an ambusher meeting every company. data/rules/inhabitants.kyr:130-134 (`temper_springs`): an ambusher falls at once on a company without the perception capability ('Keen eyes', core.kyr:21; party-capabilities.ts:13). Only a company with it gets `temper_spotted` (inhabitants.kyr:135-139): a warning, a halt and a watch's patience. src/campaign/engagement.ts:28-35 gives a sprung company its turn only after the first blows. Mission 17 left this on purpose: PT-10 and CMB-01 closed with 'a death before its first turn is left only to an ambush's first blows', and doc/authoring/guide.md:214-219 says an ambush gives no moment. The author's proposed remedy already exists in another temperament. Territorial, defensive, proud and seizing creatures warn first in their own `Warns` (inhabitants.kyr:119-125; person-parser.ts:98) and fall on the company only once the patience is spent and it is still there (inhabitants.kyr:101-105). guide.md:226-233 tells an author to write a danger with ways round it that way, and M18-09 did so for the Flood Line's eels (ambush changed to territorial). The Grand Tour's author chose `temperament ambush` on the Sexton's species line (worktree sexton.kyr:10) for a level-5 creature, and nothing warns an author that this gives a lone novice company no beat.

**What remains.** An authored ambusher can down a lone company without perception on arrival, before it acts, and nothing advises the author. The guide does not say that keen eyes spot an ambusher.

**Repair.** Keep the temperaments. The author's remedy (a `Warns`, told once on arrival, with the fight on the next watch unless the company stays) is already `Temperament territorial` (or defensive) with a `Warns`. In lint, alongside CMB-12's strength check: advise on any authored ambush-tempered person or species whose first round can down the company at the module's expected level, and name that form. In the guide's 'How a creature meets you': keen eyes spot an ambusher and hear its warning.

**Verified by.** Lint probe: a level-5 ambusher in a module whose company is level 1 is advised; the same creature made territorial with a `Warns` is not. Engine spec (existing behaviour kept): a territorial person with a `Warns` met by a lone level-1 company warns once, assails only after its patience, and the company can go back the way it came.

**Related.** M18-09, PT-10, CMB-01, CMB-12, PT-11.

## GTR-26: A person's daily round (Aubrey's rooms by day, the Promenade in the evening, abed at night) is written as one rule for each part of the day

*The Grand Tour friction 26. Gate D, P2; partly answered on main.*

**The finding.** A person's daily round (Aubrey's rooms by day, the Promenade in the evening, abed at night) is written as one rule for each part of the day. Every new state that should take them out of it (arrested, at the funeral, the Rector on her crate on Ascension Eve) has to be added to each of those rules as another `and not …`.

**On main.** src/lang/Kyr.ohm:3 lists every declaration, and none is a routine or schedule. A Pursuit (Kyr.ohm Pursuit; agency.ts:62-72) is not one either: it needs movement actions, and a satisfied higher pursuit does not hold back a lower one. The one general suspension is for a person following the company: `yielding` (src/campaign/campaign-tick.ts:152-165, Mission 17's HSL-05, 30168b6) drops a routine's move of a follower. That makes the worktree's `not following(aubrey, party)` (cloudgate.kyr:110-112) unneeded on main. The other exceptions can already be gathered into one Query (`Query aubreyFree() means not funeralHour() and not aubreyTaken(aubrey)`; the module already uses queries such as `funeralHour()` and `bellSilent()`), so a new state is one edit, not one per rule. The worktree shows the cost as written: all three of Aubrey's rules repeat `not aubreyTaken(aubrey) and not following(aubrey, party)`, the day rule adds `not funeralHour()`, and the funeral itself is a fourth rule (cloudgate.kyr:221).

**What remains.** Kyr has no declared routine. A round is hand-written hourly rules, each with its own hour window and `not at(…)` check, and the exceptions must be gathered by hand. Pellam's fair, Hessel's forty routines and the residents NAR-01 and OWN-04 ask for meet the same cost at scale.

**Repair.** A `Routine` part on a Person (decided in the D1 review, ARV-M2): hours mapped to places, with overrides for occasions. WorldConstructs lowers it into rules that each also ask `not held(person)`. One `held(person)` fact, asserted and retracted by the author's own rules (arrested, at the funeral), suspends the whole round. Following the company already suspends it through `yielding`. Retracting `held` sends the person where the hour says on the next pass. Until then, the guide shows the gathering Query.

**Verified by.** Probe: a person with a three-entry routine. With `held(p)` asserted at hour 10, they stay where they are through hours 19 and 24; once it is retracted, they are where the hour says on the next pass. A follower is not moved by it (test/follow.test.ts stays green). Aubrey's rules, rewritten as one Routine, pass the Grand Tour's schedule tests.

**Related.** NAR-01, OWN-04, ARV-M2, HSL-05.

## GTR-27: A number the player should feel, such as how fond Fabian has grown of the company, lives only in the world's state

*The Grand Tour friction 27. Gate D, P3; partly answered on main.*

**The finding.** A number the player should feel, such as how fond Fabian has grown of the company, lives only in the world's state. The page never shows it unless the author writes a rule that says a line when it crosses a value.

**On main.** A module's own measures (src/lang/Kyr.ohm:155) never reach the page. The presentation reads only the engine's own: price, fee, hire, offering, quantity, nextMeal, travelTime and watch (for example src/ui/screen-model.ts:108, 231-234, 318). General Kyr can already show a threshold. A person's `Role "…" when <predicate>` (src/lang/person-parser.ts:131-134, lowered to entity roles at :208-211) gives a line beside their name while it holds. `Rule … once` (b89eed5, Kyr.ohm RuleOnce) says a line the first time the condition holds and keeps its own latch. An `Observe … near` the person does as well. The worktree's fabian_we and fabian_signed (murrey.kyr:101-105) keep hand-written latches (fabianWe, fabianSigned) where `once` would serve. The author calls the threshold line the right literary answer and asks only that it be easier.

**What remains.** Each threshold is a rule written by hand, and the companion's standing shows only where the author also wrote a `Role … when`. There is no single line that gives both the crossing and the standing.

**Repair.** A `Shows "…" when <measure> >= N` line on a person, lowered to the two existing forms: a `Rule … once` that tells it on crossing, and a `Role … when` that keeps it beside their name while it holds. The page gives the standing in the author's words and never the number. Until then, the guide shows the Role-when plus once-rule pattern.

**Verified by.** Probe: a person with two `Shows` thresholds on one measure. Raising the measure past each one tells its line once, and the person is named with the latest. Lowering it back below the second shows the first again.

**Related.** NAR-18, ARV-M7, ARV-M2.

## GTR-28: Nothing keeps the dates in a module's prose consistent with the world's calendar

*The Grand Tour friction 28. Gate E, P2; partly answered on main; held by AUT-09.*

**The finding.** Nothing keeps the dates in a module's prose consistent with the world's calendar. A brass plate said MDCIX (1609) in a world whose year is 1290, and two documents disagreed on whether the North Wind's gift was two hundred or two hundred and thirty years ago.

**On main.** src/campaign/campaign-tick.ts:44-67 sets watch, hour, day, nightCount, the until-measures, season and dice for a module that declares them, but not the year, though `Calendar.date` computes it (src/campaign/calendar.ts:15-20). The Grand Tour's campaign starts in 1290 (worktree data/campaigns/the-grand-tour.campaign.json:4); placed in a generated world, it takes that world's year instead. Text can interpolate a module's own measures, in words if asked (src/lang/observation-text.ts:8-16). So a year declared once (`Measure giftYear(group)` with `Initially Set …`) can already be said alike everywhere: the author's own remedy, for constants, is available now. Interpolation takes only a measure reference, not arithmetic (observation-text.ts:24), so 'N years ago' needs the year now and a measure for the difference. The current year cannot be read at all, and no lint reads dates.

**What remains.** A module cannot read the world's year. 'N years ago' and dated inscriptions are free text that nothing checks against the one chronology.

**Repair.** With AUT-09 (E7, one chronology). `CampaignTick.clock` sets `year(clock)` when a module declares it, as it already does `day` and `season`. A module declares its named years once (a founding, the gift), and the engine keeps how many years ago each was as a measure, so text can interpolate it in words. The guide tells authors to write dates from these.

**Verified by.** Probe: the text '{year(clock)}' in a campaign starting in 1290 (month 6, day 9) renders 1290, and 1291 after 202 days. A named year of 1060 renders as '{…} years ago' with the value 230, and 231 a year later.

**Related.** AUT-09, ICE-15.

## GTR-29: When someone joins or leaves the company without words of their own, the engine gives them a stock line

*The Grand Tour friction 29. Gate D, P2; still holds on main; held by GTR-12.*

**The finding.** When someone joins or leaves the company without words of their own, the engine gives them a stock line. A stranger's is "'Why not. It's not as if anything is keeping me here.'", which Perrin said as he came up out of the drowned city at last on his oar. Nothing warns the author which people need their own `Joins` and `Leaves`.

**On main.** data/voice/join.json:25-26 holds the stranger lines, said whenever a person has no `Joins` (join.json:2). src/lang/person-parser.ts:98-100 maps `Joins` and `Leaves` to the joining and parting words. src/cli/campaign-lint.ts (311 lines) has only three advice-level checks, anchor (:46), write-only (:122) and role (:296), and none of them looks for a person who can be made `following` or `travelsWith` without those words. Mission 17's CTH-08 fixed only when `Leaves` is said. The author restates the Grand Tour's own friction 12 ('Friction 12 stands'); GTR-12 is a sibling point from this tour, not yet a register row.

**What remains.** Stock lines speak for adventure people at their most important moments, and lint says nothing about it.

**Repair.** Two changes. First, lint advice for every person whom an action, topic or rule makes `following` or `travelsWith`, or who is a Company recruit, and who has no `Joins` or `Leaves`. Second, make the stock line neutral for a bond the engine cannot name: an action ('{Actor} comes with you.'), not a speech that claims a history.

**Verified by.** Lint probe: a person a topic makes `following`, with no `Joins`, is advised; with `Joins`, not. Voice spec: no join.stranger line puts words in the person's mouth.

**Related.** GTR-12, ARV-M7, NAR-18, CTH-08.

## GTR-30: The author believed a `Sells` could name only a kind of item declared earlier in the load order

*The Grand Tour friction 30. Gate D, P3; answered on main.*

**The finding.** The author believed a `Sells` could name only a kind of item declared earlier in the load order, so the creel of eels that feeds the Sexton is declared in the harbour's file instead of beside the Sexton.

**On main.** src/campaign/module-bundle.ts:112-123 (`own`) reads each of a module's files again among every kind any of its files declares. Its comment cites the same case: 'a felter in one file selling a cloak declared in another'. `ModuleBundle.load` calls it (:275), and the warm read does the same (:209-213, :242-244). A module's own law files count among its own (`paths`, :249-257). test/patient-probes.test.ts:121-125 (P8, fixture law-sells) proves it: a kind declared in a later file is sold by a person in an earlier one. This landed in fb78983 (2026-10-26), an ancestor of the fork point 87f57dd, so the author's belief is out of date. Within one file, kinds already come first wherever they are written (src/lang/module-parser.ts:129-132). A Sells naming no kind becomes a trade good (world-constructs.ts:123-130), and the compiler refuses it unless that name is a declared good (`sells(group, good)`, data/rules/services.kyr:5; module-compiler.ts:216-228), so a failure would not be silent. `kyrie lint`'s vocabulary pass parses files alone (src/cli/kyr-lint.ts:61-65) but compiles nothing and reads only relation and measure names, so no false error comes from it either.

**What remains.** Nothing is wrong on main. The guide does not say that a module's kinds may be declared in any of its files, so the creel stays where the author's belief put it.

**Repair.** Add one sentence to the guide: a module's kinds may be declared in any of its files. Whether to move the creel's kind beside the Sexton is the author's choice.

**Verified by.** Probe: move `Kind eel_basket_kind` into sexton.kyr. The Grand Tour still loads, and Bethan's counter sells item instances of it (`soldBy`/`forSale` items, not `sells(bethan, eel_basket_kind)`).

**Related.** COR-04, ARV-H7.

## GTR-X01: Something found by searching is told again, in the words of finding it, every time the company comes back

*The Grand Tour, playtest/tour.md. Gate D, P2; still holds on main.*

**The finding.** Something found by searching is told again, in the words of finding it, every time the company comes back. After the keel ladder was found, walking into Halyard House's wine cellar reads only 'Behind the last rack, in the bare rock, your hand finds iron', as if the company were searching again.

**On main.** src/information/discovery.ts:54-64 turns each `Found by searching <place> "text"` into a standing observation at that place (`when searched(party, place)`, anchor `at`) and uses the found text as its words, so the wording of the act becomes the place's own line. tour.md:547 is the search; on the returns at tour.md:913 and :925 the cellar is told only as 'your hand finds iron'. Source: city.kyr:101-102. Also tour.md:533-537: the cellar's own lines already showed the rungs, because Aubrey had taught keel_ladder_known (cloudgate.kyr:126), yet the search still told the find as new. Search itself is a generic action offered in every room not yet searched (data/rules/discovery.kyr:71-76), so the offer is not the fault; the telling is.

**What remains.** A find written as an act is retold as the place's description on every return. A search also tells the find as new when the company already knows the fact.

**Repair.** Tell a `Found by searching` text once, as the result of the search. After that the place shows the Discovery's own text, or an optional standing line (`then "…"`). When the fact is already known, the search tells nothing new, or says the company sees what it was told of.

**Verified by.** Spec: search a room that holds a Found-by discovery, leave, then come back. The return page does not contain the found text and does contain the standing line. A search made when the fact is already known does not tell the found text as a discovery.

**Related.** OWN-18.

## GTR-X02: A person who has a line of their own near them (`Observe … near`) is never said to be present

*The Grand Tour, playtest/tour.md, first-through.md, found-out.md, bell.md. Gate A, P2; partly answered on main.*

**The finding.** A person who has a line of their own near them (`Observe … near`) is never said to be present. In her study the Rector is left out of who is here, and the page says only 'The Rector's keys chime when she moves'. That line is told again each hour her schedule brings her back, as news that never says she came in.

**On main.** src/ui/screen-model.ts:185 files any `near` observation of a person who is present under that person (`says`). src/presentation/narrator.ts:216 then prints those lines instead of naming the person (`if (t.says?.length) { lines.push(...t.says); continue; }`). history.kyr:37: keys_after is `near quance as sound`. At tour.md:805 the page reads 'The Rector's keys chime … Mr. Edwin Tolley … is here.', yet a topic with her is answered next, so she was there. In found-out.md the line does not hold, and the page reads 'Here are Magistra Isadora Quance … and Mr. Edwin Tolley'. In first-through.md:635-751 'The Rector's keys chime when she moves. You find that you are listening to them. An hour passes.' is told 10 times as she comes and goes. bell.md:111-183 does the same with Mr. Tolley's corner line. What main already has: a person's `Arrives "…"` words are told when they come where the company stands (src/campaign/arrivals.ts; Kyr.ohm:80). The Grand Tour uses Arrives only for the divers (rector.kyr:26) and gives the Rector none, so the missing arrival is partly the module's.

**What remains.** Any near line, a sound or a gesture included, takes the place of the person's presence line, so the person is hidden. Each return of a scheduled person retells the line as new, and nothing tells of the arrival unless the author wrote `Arrives`.

**Repair.** Keep the person in the presence line unless the near text names them as present. Tell a near line once per stay. Give lint advice for a person whose place changes by rule (a schedule) and who has a near line but no `Arrives`, or give a plain default arrival line.

**Verified by.** Spec: a person with a near sound line is listed among those present. Waiting while a scheduled person comes and goes tells each arrival (their Arrives words, or the default) and tells the near line once per stay.

**Related.** OWN-19, OWN-18, OWN-04, ARV-H5.

## GTR-X03: A rule about what the company carries sees a thing given in conversation only on the next command

*The Grand Tour, playtest/tour.md. Gate D, P2; still holds on main.*

**The finding.** A rule about what the company carries sees a thing given in conversation only on the next command. The experience for the Water petal arrived with 'Talk to Mercy', a step after No Admittance handed it over. The Earth petal's experience arrived on walking into the next room.

**On main.** src/campaign/watch-loop.ts:37-39 (a command that takes no watch) and :53-55 (each watch) run CampaignTick.rules before Consequences.hand. src/campaign/consequences.ts:37-61 puts the given thing into a member's hands and refreshes the projection, with no further pass of rules. `Give x to y` lowers to `handed` (src/lang/statement-parser.ts:36), and a Milestone is lowered to a rule (src/lang/milestones.ts). growth.kyr:16-18: m_water and m_earth are `when carries(party, …)`; whelm.kyr:107 and earth.kyr:68 give the petals with `Give … to actor`. tour.md:399: 'Talk to Mercy … each gain 75 experience: was given the Water petal for the asking'. tour.md:253: the Earth petal's milestone is told on '>sennet__minutes'.

**What remains.** Anything keyed to an item given or spent fires one command late, possibly in another room. A telling anchored to the first room can then go unheard.

**Repair.** Apply `handed` and `usesUp` before the rules pass, or run the rules once more after Consequences.hand and strike (and after Perceptions.settle, as friction 23 asks) within the same command.

**Verified by.** Probe module: a topic gives an item, and a Milestone plus a Rule with an `at room` line read `carries(party, item)`. Both fire and are told on the giving command.

**Related.** GTR-23, CTH-06.

## GTR-X04: A companion knocked out outside a fight is told he has died

*The Grand Tour, playtest/coming-down.md. Gate C, P1; still holds on main; held by CMB-02.*

**The finding.** A companion knocked out outside a fight is told 'Fabian Murrey falls. Fabian Murrey fails to resist (death).', which reads as a death. In fact he is only senseless until a rest decides whether he lives. Nothing more is said of him, and the module's rule on `slain` never fires, so the closing news still has him 'GONE THROUGH. BACK SOON.'

**On main.** src/presentation/narration.ts:5-7 rewrites every 'fails the X save' as 'fails to resist (X)', the death save included, in a fight or out of one. src/effects.ts:214-227: a member brought to 0 HP who fails the death save stays at 0 HP and is not slain. src/campaign/field-use.ts:62-79: only the system-shock roll at a rest marks a member slain, and src/campaign/creature-facts.ts:174-176 projects `slain` from that condition alone. `fallen` is projected too (:173), but neither relation is in doc/authoring. coming-down.md:553: the hazard of Cloudgate coming down (door.kyr), followed by 13 waits and no rest. coming-down.md:575: the closing news comes from aftermath.kyr:21 (`not fabianLost(party)`), so murrey.kyr:89 fabian_falls, which reads slain, never fired. Friction 3's 'no journey got Fabian killed' stands: he was downed, never slain. The gap is between `fallen` and `slain`.

**What remains.** A failed death save, in a fight or out of one, is told in the words of a resistance, as if it were the death. After that the telling never says the companion is down. Modules that read `slain` miss a fall unless a rest comes before the book closes.

**Repair.** With CMB-02: tell a failed death save as what it means, for example 'Fabian lies senseless; whether he lives is decided at the next rest'. Say a downed member is down until they come round or die. Document `fallen` beside `slain` for authors, or add friction 3's `lost` on ARV-M7's membership lifecycle.

**Verified by.** Spec: a hazard outside a fight brings a companion to 0 HP. The page says they are down and never says 'fails to resist (death)'. A module rule on `fallen(?m)` fires on that command.

**Related.** ARV-M7, GTR-03, CTH-04, NAR-18.

## GTR-X05: What a command sets off is told before the command itself in two places

*The Grand Tour, playtest/tour.md (and every transcript's 'Take a bed and supper'). Gate A, P3; still holds on main.*

**The finding.** What a command sets off is told before the command itself in two places. A new day's chapter line comes before 'You eat what is put in front of you, and sleep long'. Fabian writing 'we' in his notebook 'as you walk' comes before he has said he will come.

**On main.** src/presentation/narrator.ts:283-295 tells an opened chapter first, on purpose ('A chapter opened is told first of all'), and tells rule events (`events`, :294) before the voiced joining (`voiced`, :295). Each of the 11 'Take a bed and supper' steps in the transcripts begins with the chapter line (tour.md:457, :847). At tour.md:195 the line of the fabian_we rule (murrey.kyr:102-103, which the joining sets off through travelsWith) comes before his Joins words.

**What remains.** Lines within one telling are ordered by their kind, not by what caused what.

**Repair.** Tell the command's own result (a night's sleep, a joining) before what it set off. A chapter opened during sleep comes after the sleep line, with its heading kept. Joining and parting words come before rule events. Fights already work this way ('what a fight set off is told after').

**Verified by.** Narrator spec: an overnight bed reads the sleep line, then the chapter. A joining that fires a rule reads the joining words first.

**Related.** CMB-02, NAR-14.

## GTR-X06: Someone of a tame kind greets the company with their own first words as soon as it arrives

*The Grand Tour, 09-playtest.md; 11-changes.md; playtest/tour.md. Gate D, P3; still holds on main.*

**The finding.** Someone of a tame kind greets the company with their own first words as soon as it arrives, so the first 'Talk to' gets their 'again' greeting. Chert greeted the company unasked in the dark, and talking to him then said 'You're back!' until the author reworded it.

**On main.** data/rules/inhabitants.kyr:155-160 (temper_greets): a tame one greets whoever comes, once, in its own Greets words. src/narrative/telling.ts:54-61 counts the resulting `greeted` tie as already met (Mission 17's CTH-07 fix), so the first Talk uses Greets again. earth.kyr:53 declares `Species pebble … like earth_elemental tame`; earth.kyr:56-57 holds his greetings. tour.md:221 is the greeting on arrival; tour.md:227-229 is 'Still quick', the reworded 'again' line.

**What remains.** Whether Greets is said on arrival or on Talk depends on the kind's temperament, which authors pick for other reasons, such as not being hostile. Neither lint nor the guide says so.

**Repair.** Lint advice when a person of a tame kind has Greets: say it will be spoken on arrival, and that Greets again answers the first Talk. Or hold a person's own Greets for Talk unless they are marked to approach.

**Verified by.** Lint probe: a person of a tame species with Greets and Greets again draws the advice.

**Related.** CTH-09, CTH-07, M17-93.

## GTR-X07: A parting line and the list of who is present contradict each other on the same page

*The Grand Tour, playtest/tour.md, undertow.md. Gate E, P3; still holds on main.*

**The finding.** A parting line and the list of who is present contradict each other on the same page: 'Ha'penny flicks her tail once and is gone into the green … Here are Ha'penny, a merfolk child with a basket of cockles; and Mr. Josiah Pumphrey'.

**On main.** At tour.md:345, and in undertow.md:55 ('Take Ha'penny back down to the Fish Stairs'), her Leaves line (harbour.kyr:142) is told as she stops following at the place where she lives. The presence list (src/presentation/narrator.ts:212-230) names her on the same page, because she stays at the Fish Stairs. Mission 17's CTH-08 fix (`Leaves "…" when …`) decides whether the words are said; it cannot move the person.

**What remains.** A parting line cannot say where the person goes, and the page lists someone who has just said goodbye.

**Repair.** Add `Leaves "…" to <place>`, which moves the person there as they part. Or leave someone whose parting words were just told out of that page's presence line.

**Verified by.** Spec: a person who parts at their own place with a Leaves line is not listed as present on that page, or is moved to the named place.

**Related.** CTH-08, ARV-M7, GTR-12, GTR-29.

## GTR-X08: A way cannot need something in one direction only. The stairs down into the Whelm need breath, but then a company whose breath had run out could not climb back up

*The Grand Tour, 02-adaptation.md (W2). Gate D, P3; still holds on main.*

**The finding.** A way cannot need something in one direction only. The stairs down into the Whelm need breath, but then a company whose breath had run out could not climb back up, so every such way had to be written as two one-way passages, with a rule to lift a drowning company.

**On main.** src/lang/Kyr.ohm:16-22: `needing` belongs to the whole Passage, and only `one way` gives it a direction. 02-adaptation W2; city.kyr:134-135 writes the way down (`one way needing breath`) and the way up (`one way`) separately.

**What remains.** A need in one direction takes two passages and a rescue rule.

**Repair.** Add `needing <x> going to <place>` (or `from <place>`): the need is checked only when entering by that end, and the map draws a single way.

**Verified by.** Probe: a passage that needs breath only toward the Whelm can be climbed out without breath, and is refused going down without it.

**Related.** ARV-M2.

## GTR-X09: A province inside a country cannot have a notice nailed up in its towns the way a country beyond a march (a border) can

*The Grand Tour, 02-adaptation.md (X1); 11-changes.md. Gate B, P2; still holds on main; held by NAV-17.*

**The finding.** A province inside a country cannot have a notice nailed up in its towns the way a country beyond a march (a border) can. The Grand Tour's proclamation needed an engine change, and that change exists so far only in the merge worktree.

**On main.** On main, src/world/region-gates.ts:28-41 writes for a province only the topic of asking the innkeeper: no notice and no after-word. RegionBorders.notice is private (src/world/region-borders.ts:92). The general fix (RegionGates calling RegionBorders.notice and back) is staged, not committed, in .claude/worktrees/grandtour (`git diff main --stat -- src`: region-gates.ts, region-borders.ts). NAV-17's repair (B5: adventures announce themselves by a notice, a skyline, a traveller) is the row this belongs to; this is the case of a province.

**What remains.** On main a province is heard of only by asking an innkeeper. The notice and its after-word wait on the Grand Tour merge.

**Repair.** Land the worktree's change, in which a province's notice and after-word are told as a march's, with a spec of its own that does not depend on Sennet.

**Verified by.** test/provinces.test.ts: a province with a `notice` in countries.json is read where travellers are kept in every town of the first country, known as heard, with its after-word once the news is stale. the-grand-tour-placed.test.ts passes on main.

**Related.** ADV-01, OWN-13.

## GTR-X10: The play tool cannot play a campaign as a protagonist the author chooses

*The Grand Tour, 11-changes.md; README.md. Gate D, P3; still holds on main.*

**The finding.** The play tool cannot play a campaign as a protagonist the author chooses. `--as race/calling/Name` worked only for generated worlds, so the build matrix (a thief, an acolyte, a monk) could not be tried from the terminal.

**On main.** On main, src/cli/play-tool.ts:42-43 starts a campaign with its own company and ignores --as. The worktree adds `--as race/calling/Name[/background]` for campaigns (`git diff main -- src/cli/play-tool.ts`).

**What remains.** On main a campaign's builds can be tried only through test helpers.

**Repair.** Land the worktree's `--as` for campaigns, with a CLI spec.

**Verified by.** CLI spec: `bin/kyrie play data/campaigns/the-grand-tour.campaign.json --as elf/thief/Wren/burglar --probe "@memberOf"` shows Wren's company.

## GTR-X11: The play tool's probe can ask only whether one fact holds or what a measure reads, never what holds of a relation

*The Grand Tour, 11-changes.md. Gate D, P3; still holds on main.*

**The finding.** The play tool's probe can ask only whether one fact holds or what a measure reads, never what holds of a relation, so an author cannot list who travels with the company or which petals the Rector has.

**On main.** On main, src/cli/play-tool.ts:62-66 answers a fact with yes or no, or a `#measure` with its value. `kyrie inspect` (src/cli/inspect-tool.ts) explains only why an action is or is not offered. The worktree adds `--probe @relation [args]`, which lists every fact of the relation that holds.

**What remains.** Debugging a module's state needs a test, or one probe per guessed fact.

**Repair.** Land the worktree's `@relation` probe.

**Verified by.** CLI spec: `--probe "@travelsWith"` after a recruit joins lists the recruit.

## GTR-X12: Each adventure writes its own script to turn its journeys into transcripts: six on main, and the Grand Tour's makes seven

*The Grand Tour, playtest/tour.md; README.md. Gate D, P3; still holds on main.*

**The finding.** Each adventure writes its own script to turn its journeys into transcripts: six on main, and the Grand Tour's makes seven. All of them print each step by its bare label, so an act on a thing shows only as '**Take**' (the geode lost), and a walk shows as '>sennet__landward_gate'.

**On main.** scripts/{hessel,winter-in-carth,low-water,liberty-of-the-ice,parliament-of-books}-transcripts.ts write `**${t.label}**`, and scripts/tessary-pages.ts:19 writes `**${t.label}** — ${page}`. src/session/journey.ts:69 keeps an act on a thing as its bare label ('Take') apart from its full form ('a geode: Take'), and Journey.go labels each walked passage `>${to}`, the raw id (journey.ts:237). tour.md:259 shows '**Take**' followed by 'Chert takes a geode.'. `kyrie playtext` (src/cli/playtext.ts) serves generated worlds only.

**What remains.** The play evidence is written by copies of one script, and each copy loses the name of the thing an act is done to and the way a walk took.

**Repair.** One `bin/kyrie transcripts <campaign> <fixtures>`, or `playtext` extended to campaigns, that labels each step as the page offered it (the full label, and the way's own label for a walk). Retire the copies.

**Verified by.** Run it on two adventures' fixtures: the geode step reads 'a geode: Take', walks read the way's label, and repeated runs give identical output.

**Related.** COR-18.

## GTR-X13: The author could not run the whole test suite, which took several hours one file at a time

*The Grand Tour, 09-playtest.md. Gate F, P3; answered on main.*

**The finding.** The author could not run the whole test suite, which took several hours one file at a time, and had to guess which 31 files a province change could touch.

**On main.** package.json:32-36 runs the suite with `--parallel` (about twelve minutes on sixteen cores; scripts/test-quick.ts:2-5), offers `test:quick` (about a minute and a half), and offers `test:changed`, which runs the tests an uncommitted change reaches (README.md:77). The branch's own base already had all three (`git show 87f57dd:package.json`, lines 30-34), so this is not a fault of main. The author either did not know of them or worked in a session that could not use them. No authoring guide names them: only doc/authoring/narrative.md:80 names any test command.

**What remains.** Only that the adventure-authoring guide does not point authors to test:changed and test:quick.

**Repair.** Name `bun run test:changed` and `test:quick` in the adventure author's checklist in doc/authoring, beside `kyrie verify`.

**Verified by.** The guide section exists, and test:changed on a region-gates.ts edit selects the province and placed-adventure specs.

## GTR-X14: lint-outside failed on the base branch over a redefinition in Low Water's undercroft.kyr

*The Grand Tour, 09-playtest.md. Gate D, P3; answered on main.*

**The finding.** lint-outside failed on the base branch over a redefinition in Low Water's undercroft.kyr, so an adventure branch could not show a clean full run.

**On main.** 827354c ('CI green again: Low Water's own warning no longer shares a shared rule's name …') renamed undercroft.kyr's warnedOff(group) to equalsWarned (data/adventures/low-water/undercroft.kyr:56), and KyrLint.walk now reads files in name order, so every machine reads alike (src/cli/kyr-lint.ts). Main is at 827354c.

**What remains.** Nothing.

**Repair.** None needed.

**Verified by.** test/lint-outside.test.ts passes on main (CI).

## GTR-X15: Nothing warns that a place has nothing said of it, not even the campaign's starting place

*The Grand Tour, 09-playtest.md; 11-changes.md. Gate D, P3; still holds on main.*

**The finding.** Nothing warns that a place has nothing said of it, not even the campaign's starting place. The Grand Tour's first page, at the top of the coast road, was blank until the author noticed it in a transcript.

**On main.** src/cli/kyr-lint.ts and src/cli/campaign-lint.ts have no check for a place without an observation: campaign-lint.ts reads observations only to check names (:93, :303), and its geography check (:197-220) checks only whether rooms can be reached. A Place has no description slot of its own (ARV-M2 lists one as missing). 11-changes: 'The opening page at the top of the coast road was empty'.

**What remains.** An undescribed starting room shows an empty first page, and lint is silent.

**Repair.** Lint warning when the campaign's starting place has no observation that holds at the start. Advice for any room with none.

**Verified by.** Lint probe: a campaign that starts in an undescribed room draws the warning.

**Related.** AUT-23, OWN-17, ARV-M2.

## GTR-X16: No tool reports which of a module's rules, events, endings and milestones never happened in its journeys or autoplay

*The Grand Tour, 11-changes.md; 09-playtest.md. Gate D, P2; still holds on main.*

**The finding.** No tool reports which of a module's rules, events, endings and milestones never happened in its journeys or autoplay. Sergeant Bassett's arrest rule required the Rector to be free, which the exposure he acts on makes false, so it could never fire, and only reading the transcripts found it.

**On main.** src/cli/reach-tool.ts:10-21 counts the rooms, people, topics, acts and observations a curious player reached, but not rules, events, endings, milestones or promises. src/cli/verify-tool.ts runs lint, tests and traces. 11-changes: 'His arrest rule required rectorFree(), which the exposure he acts on makes false: it could never fire.'

**What remains.** A rule that can never fire is silent unless someone reads the play closely.

**Repair.** Extend `kyrie reach` and `kyrie verify` to list the rules, events, endings, milestones and promises that never fired across a module's kept journeys, autoplay and traces. Add lint advice for a rule whose condition requires a fact that its own trigger makes false.

**Verified by.** Probe module with a rule that cannot fire: `kyrie reach --detail` lists it. Run on the Grand Tour and review its list.

**Related.** OWN-01, AUT-23.

## GTR-X17: Nothing tells an author that a module gives the company no experience

*The Grand Tour, 11-changes.md. Gate D, P3; still holds on main.*

**The finding.** Nothing tells an author that a module gives the company no experience. Sennet has almost no fights, and nobody grew there until the author wrote twenty-seven milestones.

**On main.** 11-changes: 'Milestones (growth.kyr): the company had no experience for anything it did in Sennet.' src/cli/kyr-lint.ts, campaign-lint.ts and reach-tool.ts have no milestone or experience check. Progression.milestones (src/campaign/progression.ts:65) awards only milestones that are declared.

**What remains.** A module with few fights and no milestones goes unnoticed until someone looks at a character sheet.

**Repair.** Lint advice for a campaign module with no Milestone and little to fight: an estimate of the experience its journeys give, against the levels it expects (alongside CMB-12's reckoning of encounter strength).

**Verified by.** Lint probe: a module with no milestones and no foes draws the advice.

**Related.** PT-02, CMB-12.

## GTR-X18: The rival Tourists' crowning, their dig, the divers' raid and the Rector's moves all happen where the company is not

*The Grand Tour, 10-critique.md; 12-second-pass.md; playtest/alone.md. Gate C, P2; partly answered on main; held by NAR-17.*

**The finding.** The rival Tourists' crowning, their dig, the divers' raid and the Rector's moves all happen where the company is not, and nothing brings word of them. Left alone, the week is only chapter lines, and the author had to chalk a crier's board by hand so the race could be seen.

**On main.** courant.kyr builds the crier's board and the Courant by hand, one event at a time. alone.md: 171 steps with nothing told but chapter lines. A rule anchored `within` an area waits for the company to be there (src/campaign/campaign-tick.ts:126-129). People already pass on what they hear (heardOf, passesTo and overhears in data/rules/belief.kyr, Mission 17's ICE-05), but nothing records a world event as news and tells it late where the company is. 12-second-pass: 'Waiting is still empty … this one waits to be visited.'

**What remains.** Every module builds its own crier. The world's events reach the company only where it stands, or through boards written by hand.

**Repair.** NAR-17's traces and reports: a `News` form, or `heardOf` passed on by talk, that records an event where it happens and tells it late, in the module's own words, at the company's next settlement or inn.

**Verified by.** Probe: an event in one room is told as news, with its lateness, at the inn on the company's next visit. The Grand Tour's board rows are rewritten as news.

**Related.** ICE-02, CTH-06, PT-29, OWN-04.

## GTR-X19: The city is walked room by room. On the Tour route the company crosses the Quad, the gate, Lamp Street and the Glass Market a dozen times

*The Grand Tour, 10-critique.md. Gate A, P2; partly answered on main; held by M17-29.*

**The finding.** The city is walked room by room. On the Tour route the company crosses the Quad, the gate, Lamp Street and the Glass Market a dozen times, and each crossing is told with its paragraph.

**On main.** src/ui/itinerary.ts:164-176 (`around`) offers the other places of the settlement the company is in, each walked to directly (3465a38, test/around-town.test.ts), and city.kyr:11 makes sennet_town a settlement. But the transcripts were written by the fixture driver: Journey.go (src/session/journey.ts:226-238) walks passage by passage and tells each room (the test/support/sennet.ts header), so the critique's evidence is partly the driver's doing. Cloudgate is a settlement of its own and the Whelm a wilderness (city.kyr:12-13).

**What remains.** Not yet measured in an authored city in the reader: whether going about Sennet by `around` passes rooms without telling them, and whether returns are brief.

**Repair.** Let journey fixtures use the page's own `around` choices (a step that walks to a place the way the page does) and measure the result. Keep returns to one sentence (OWN-18).

**Verified by.** Replay the Tour fixture using around-town choices and count the room paragraphs told per destination; the target is one.

**Related.** OWN-18, OWN-09.

## GTR-X20: Kyr cannot hold an accusation that the player puts together

*The Grand Tour, 12-second-pass.md; 10-critique.md. Gate D, P3; partly answered on main.*

**The finding.** Kyr cannot hold an accusation that the player puts together. The mystery solves itself, and the one deduction the player does make, the printed lie, is announced by the module.

**On main.** Module actions can take parameters (src/lang/Kyr.ohm:164; 02-adaptation's `Action open_on(actor, site, dest: place)`). The page shows a module's own action by its authored label under its first present binding (src/ui/choice-grouping.ts:48), so 'Accuse {suspect}' can already be offered once per suspect present. What is missing: two-step paths ('Give to › {recipient}', choice-grouping.ts:137) exist only for the engine's own schemas, and no form states who did it and on what evidence and judges the claim right or wrong. fall.kyr writes its wrong answer as a topic to Bassett. A rule that teaches must also say something (friction 24), so the deduction is announced.

**What remains.** A mystery module has to write each accusation as its own topic, and cannot weigh what the player chose as evidence.

**Repair.** A documented pattern, or a small form, for a claim made of a suspect and one or more known facts, offered in two steps and judged by the module's own truth (right, wrong, unproven). Lint that every suspect has an outcome.

**Verified by.** Probe module: accusing the wrong suspect with real evidence, and the right one with too little, give different authored outcomes, all offered from the page.

**Related.** GTR-24, AUT-23.

## GTR-X21: The highest reward goes unused in the campaign. The Door of Doors 'will open for you on anywhere you have stood'

*The Grand Tour, 10-critique.md. Gate B, P3; partly answered on main.*

**The finding.** The highest reward goes unused in the campaign. The Door of Doors 'will open for you on anywhere you have stood', and the book closes at nine the next morning.

**On main.** src/lang/endings.ts:13-19: in a campaign an ending closes the book, but a module installed into a world closes only its own chapter (src/campaign/module-bundle.ts:20-22). Placed in a world (the-grand-tour-placed.test.ts) the Door stays usable, but it knows the world only from Sennet on (friction 13).

**What remains.** Standalone campaigns, the terminal and their tests end before any lasting reward can be used.

**Repair.** Treat placement in the shared world as the ordinary way to play (B1). Optionally, let an ending carry the company into the shared world rather than closing the book.

**Verified by.** Placed spec: after the Door is opened, play goes on, and the Door opens on a town of the first country the company has stood in.

**Related.** GTR-13, ADV-01, PT-01.

## GTR-X22: Authored text cannot agree with a count, or give the hour a rule fires

*The Grand Tour, 09-playtest.md; 11-changes.md. Gate D, P3; still holds on main.*

**The finding.** Authored text cannot agree with a count, or give the hour a rule fires. The Rose read '1 of the four hollows have', and the Lanterns were told at 'half past ten' for a release at half past nine.

**On main.** src/lang/observation-text.ts:88-100 reads a measure as a digit, or as a word with `{… in words}`, but has no singular/plural choice and no clock-time form. FictionalTime.prose (src/campaign/fictional-time.ts:80-84) turns only a literal 'watch N' in text into a clock time, not the hour the rule fires. door.kyr was rewritten as 'Petals set in the rose of the Door of Doors: {socketCount(nexus) in words} of the four.' 09-playtest and 11-changes record both slips.

**What remains.** Authors reword around a count, and type hours by hand, so prose drifts from the rules.

**Repair.** Text forms for agreement (`{n|hollow has|hollows have}`) and for a time (`{hour as time}`). Or lint that compares an hour named in a rule's text with the hours its condition allows.

**Verified by.** Probe: a count of one and of three render with agreement, and a rule's text shows its own hour.

**Related.** GTR-06, GTR-28, AUT-09.

## WPC-01: A place cannot move: a travelling circus has to be written as five rooms in each of three towns

*Wapshott's Circus (unmerged) friction 1. Gate B, P2; still holds on main.*

**The finding.** A place cannot move: a travelling circus has to be written as five rooms in each of three towns (fifteen rooms), with a hand-written rule that moves its people and its scenery into the current town's copies, because a room's town is fixed when it is declared.

**On main.** Main: Kyr.ohm:4,6 `Place … within ident` gives a room one parent, fixed at declaration. Every reader of containment takes it from the declaration: Spatial.ancestry (spatial.ts:173-178), LocalObservations.inArea (campaign/local-observations.ts:25-28), and the computed `within` (lang/computed-relations.ts:10-15; core.kyr:43-45 says it is never asserted). The only writable spatial fact is `connects` (data/rules/passages.kyr:12), so a rule can re-wire ways but cannot change a room's parent, grid cell or name. Branch workaround (no engine change for this): data/goings-on/circus/circus.kyr:41-117 (groundRoom, groundOf, fifteen rooms at :50-64, fifteen passages at :66-98), troupe_settles (:140), and travelling scenery Things pole, ringpost, cookfire and wagonring (:179-202). No register row covers a moving or portable place; the brief's B4 names "an institution in several towns".

**What remains.** An institution that travels (a circus, a fair, a caravan, a camp) has to be copied room by room into every town it visits, with its own rules to move people and scenery, and nothing knows the copies are one place.

**Repair.** A portable area, declared once (`Place circus "Wapshott's" is encampment portable.`) and pitched within a settlement by a rule (`Pitch circus within ?town`). Pitching is world state: the area's parent, map cell and the ways to its host. Every reader of containment (Spatial.ancestry, the computed `within`, inArea, the chart and land models) reads the pitched parent, and the area's people and Things go with it (B4: an institution in several towns).

**Verified by.** Probe module with one portable area and two towns, pitched in A and then in B. Afterwards the same room ids are within B (within(party, town_b) holds inside them), the area's Things and people have moved, no copy is left in A, and save/replay is identical. The circus, rewritten on it, drops its fifteen rooms and its branch test/circus.test.ts still passes.

**Related.** NAV-04, ADV-01, ARV-M2.

## WPC-02: An observation written `near` a place, or near a variable that stands for a place, is accepted and never shown

*Wapshott's Circus (unmerged) friction 2. Gate D, P2; still holds on main.*

**The finding.** An observation written `near` a place, or near a variable that stands for a place, is accepted and never shown: `near` means where a thing stands, and a place does not stand anywhere.

**On main.** The compiler accepts both forms. module-compiler.ts:195-198: a `near` anchor may be any declared entity, a place included. :188-193: `near ?v` only needs ?v bound by the condition, of any kind. At run time LocalObservations.near (local-observations.ts:32-49) asks at(entity, ?here), which never holds of a place. So perceives(…, 'near') is false: for a constant at :77-80, and for a variable in each() (:95-105), which tells nothing. The grammar lets only `near` take a variable (Kyr.ohm:44-47: `at ident`, `within ident`), so an author who wants "at whichever ground is current" has no other form. No lint looks at observation anchors: CampaignLint.anchors (cli/campaign-lint.ts:39-49) reads rules only. Branch workaround: travelling scenery Things, observed `near` them (circus.kyr:179-202).

**What remains.** Text written near a place is lost without a word, and a place chosen by the condition (the current ground) cannot be an anchor at all except through a stand-in Thing.

**Repair.** Let `at` and `within` take a variable the condition binds, as `near` does (`Observe o at ?g when here(?g) …`), so text can be anchored to a place found by the condition. Refuse `near` with a place at load, for a constant and for a variable bound in a place-typed argument (inferred from the relation's declared kinds), with the message "near anchors a thing or a person; use at or within for a place".

**Verified by.** Probe module: `Observe o near town_a when …` and `Observe o near ?p when here(?p)`, with here(place), each fail to load with an error that names the anchor. `Observe o at ?p when here(?p) …` is told while the company is in that place and not elsewhere. A spec covers all three.

**Related.** WPC-03, ARV-A9, AUT-23.

## WPC-03: A rule cannot be anchored `near` a variable

*Wapshott's Circus (unmerged) friction 3. Gate D, P3; still holds on main.*

**The finding.** A rule cannot be anchored `near` a variable (it fails to load with "Unknown near anchor"), though an observation can, so a rule about whoever its condition finds cannot be heard only near them.

**On main.** Rules, Events and Observations share one Anchor grammar (Kyr.ohm:41, 44-47, 129: `near term` allows a variable). The compiler checks a rule's anchor with anchor() (module-compiler.ts:77, 195-198), which wants a declared entity, so it throws `Unknown near anchor ?o`. An observation's variable goes through subject() instead (:96-98, 188-193). Run time also assumes a constant: campaign-tick.ts:143-144 passes rule.place to LocalObservations.perceives unsubstituted, and session/travel.ts:89 finds the rule by its bare id, which an instance told as `id@binding` (campaign-tick.ts:147) would not match. Branch: the heckling bout's outcome rules (data/goings-on/circus/art.kyr:182-190: bout_won, bout_lost, bout_drawn) are left unanchored.

**What remains.** Rules and observations share an anchor grammar but not its meaning. A rule about whoever its condition binds has to go unanchored, and is told wherever the company is.

**Repair.** Treat a rule `near ?v` as an observation near a variable is treated: each instance is heard near the entity its binding gives ?v, when the company perceives that entity. This means the compiler's subject() check for both, binding[rule.place] in campaign-tick's perceives call, and the instance id in travel's aside test.

**Verified by.** Probe: `Rule r near ?o when inBout(?o) says "…" { … }` loads, and its words are told while the company is with ?o and not while it is elsewhere. Once the circus is merged, its heckling bout is re-anchored with it.

**Related.** WPC-02, CTH-06, ICE-02, ARV-M2.

## WPC-04: There is nowhere to keep someone who is not yet in the story, or has left it

*Wapshott's Circus (unmerged) friction 4. Gate D, P2; still holds on main.*

**The finding.** There is nowhere to keep someone who is not yet in the story, or has left it: every person must stand in a real place, and those parked out of the way in a real room were met there in play (Madame Sallow standing in a hedge on a road before her entrance; an owlbear in an orchard at noon).

**On main.** Kyr.ohm:75 `Person ident string "at" ident` requires a place, and data/rules declares no relation for being offstage. Seven modules on main each declare their own limbo room: winter-in-carth/country.kyr:80, hessel/city.kyr:81, wrayford/bridge.kyr:105, thrume/saltgrave.kyr:77 (within the low road), liberty-of-the-ice/city.kyr:94, let-one-remember/scarp.kyr:210, and house-that-grows/lowmere.kyr:29-30 (an `offstage` site holding a `nowhere` room). General code does the same: every generated region declares `Place elsewhere "somewhere else" is room.` (world/region-renewal.ts:16) to hold the beasts that will later move into an emptied den (:32, :37). Tests assert on these rooms (test/liberty-of-the-ice-small.test.ts:156 expects `pellam__limbo`). No engine code treats them specially (no `limbo` in src/). Branch: data/goings-on/circus/circus.kyr:46-48 `Relation offstage(entity)` and Rule exit_stage, which retracts `at`.

**What remains.** Each author, and the region generator, invents a limbo room (a real room with a grid cell, now inside the one shared country) or a rule that retracts `at`. A person left in a real room to wait is met by whoever passes, and audits of who is reachable count limbo people as people of a place.

**Repair.** A shared way to be offstage. A `Person … nowhere` declaration puts no `at` until a rule asserts one, and a shared `offstage(entity)` in the people rules is honoured by the engine: such a person holds no `at`, cannot be met or spoken to, and is left out of every census, reach audit and map. Bringing someone on is the existing `Assert at(p, room)`. The seven limbo rooms and the generated regions' `elsewhere` room move to it.

**Verified by.** Probe: `Person p "…" nowhere { }` loads. p is in no place's list of people, and the reach audit and census skip p. A rule then asserts at(p, room), and p is seen there. A grep of data/ and src/world/region-renewal.ts finds no limbo, nowhere or elsewhere rooms left.

**Related.** ADV-01, NAV-10, OWN-01, ARV-M2.

## WPC-05: A shut way has one text for why it is shut, whatever shut it, so the big top's flap, merely laced during the show, said "The big top is not here

*Wapshott's Circus (unmerged) friction 5. Gate D, P3; still holds on main.*

**The finding.** A shut way has one text for why it is shut, whatever shut it, so the big top's flap, merely laced during the show, said "The big top is not here; the circus has gone on".

**On main.** Kyr.ohm:22 `"opening" "when" Predicate string?` allows one condition and one text. ModuleParser.Opening (module-parser.ts:179-182) keeps that text as `shut`. WorldConstructs.opening (world-constructs.ts:67-80) makes a single `__shut` observation beside the way while it is unopened. A second `opening` clause is merged silently: the Passage parser Object.assign-s each part over the last (module-parser.ts:174). The last condition wins, but an earlier clause's text survives if the last clause has none. The branch's flap is one conjunction of two reasons (circus.kyr:69-74: `here(tober_a) and (not showOn(…) or admitted(party))`). Branch workaround: the flaps have no text, and a separate observation, flap_laced (circus.kyr:184), says why the flap is laced. M17's CTH-12 (fixed) only made the reason told once.

**What remains.** A way shut for one of several reasons cannot say which. A passage with two `opening` clauses silently keeps the last condition, sometimes with the first clause's text.

**Repair.** Allow several `opening when P "text"` clauses on a passage. It opens when all of them hold and, while shut, says the text of the first that fails. Until then, refuse a second clause at load.

**Verified by.** Probe passage with two clauses. Shut by the first, the page says the first text; shut by the second, the second text. A spec checks that a second clause is never silently merged.

**Related.** ARV-M2, CTH-12.

## WPC-06: Naming a room for its town ("Wapshott's ground by {town_a}") is neither documented nor tested, and the circus's author took it to be impossible

*Wapshott's Circus (unmerged) friction 6. Gate D, P3; partly answered on main.*

**The finding.** Naming a room for its town ("Wapshott's ground by {town_a}") is neither documented nor tested, and the circus's author took it to be impossible, so one country holds three rooms called "Wapshott's ground", three called "the big top", and so on.

**On main.** Reading main (not probed) shows that names already take references, and have since the initial commit. Installation rewrites `{ref}` in any entity's name to the bound id (campaign/module-namespace.ts:134-137), and ObservationText.label and present (lang/observation-text.ts:51-58, 83-86) render it for any non-group entity, places included. The presented names reach the place page (presentation/player-view.ts:92, 225), the screen's map (ui/screen-model.ts:44, 88 hands the chart the presented entities), journeys (campaign/journey.ts:93), the itinerary's destinations (ui/itinerary.ts:76, 92) and action labels (campaign/action-schemas.ts:88, so the generated "Search …" of spatial.ts:51 is filled in). Fact names use the form widely (data/situations/den/situation.kyr:39). The compiler does not refuse a brace in a place name (module-compiler.ts:34-43). What remains: the itinerary's own chart is built from raw entities (ui/itinerary.ts:49), no module or test has a place name with a reference, and the guide documents references only in texts (doc/authoring/guide.md:1039-1044). The previous classification's frontier.ts:192 reads region names and does not apply. The three same-named grounds are NAV-04's case (two places with one name). M17-100 told same-named roads apart (world/region-roads.ts:41), but nothing does that for rooms.

**What remains.** A reference in a place name very likely works but is unproved, untested and undocumented, and the itinerary still builds its chart from raw names. Same-named rooms in different towns are not told apart where they are listed together.

**Repair.** Prove and document it: a spec that installs a module with a place named for an imported town, every name reader routed through the presented names (the itinerary's chart included), and a paragraph in the guide's "Your adventure in a generated world". Separately, places that share a name are told apart by their settlement, as roads are.

**Verified by.** Probe module installed over two towns with `Place g "the ground by {town}" is room within town.`: the place page, journeys, the itinerary, the map's label and the Search action each give the town's name, and no `{` reaches the page. A spec shows two same-named rooms in two towns told apart in the itinerary.

**Related.** NAV-04, ARV-M3, M17-100.

## WPC-07: `addressed(person, company)` takes the person first

*Wapshott's Circus (unmerged) friction 7. Gate D, P2; still holds on main.*

**The finding.** `addressed(person, company)` takes the person first; written the other way round, the circus's `metCircus` never held and its debt note was never served, and nothing warned, because both arguments are of the same kind (`group`).

**On main.** data/rules/people.kyr:70 declares `Relation addressed(group, group).`, and :76 writes it as `Assert addressed(person, actor)`. A relation's signature holds only kinds (lang/module.ts:33 `Signature { name; types; exclusive }`), so either order type-checks. Queries name their parameters (`Query inRing(g: place, r: place)`), but relations cannot. The lint compares relations by name and kinds only: kyr-lint.ts:40-60 (vocabulary), and campaign-lint.ts:117-139 (writeOnly reads names, not argument positions). The engine already names the roles for its own use: narrative/happening.ts:29-30 gives addressed the roles ['actor', 'company']. None of the 14 uses of addressed on main is reversed. Branch: data/goings-on/circus/troupe.kyr:106 now has the right order.

**What remains.** A condition that reads a relation in an order nothing ever writes is accepted and stays false for ever, without a word.

**Repair.** Name each relation parameter's role (`Relation addressed(person: group, company: group)`, as queries already do) and show the roles in the DMG and in errors. Add a lint that reads every write of a relation, in the shared rules and the module, and advises when a read puts a constant (the company, a named person) in a position no write ever fills with it, for example the company where only a Talk's person is written.

**Verified by.** Lint probe: a module whose rule's condition reads `addressed(party, wapshott)` gets advice naming the relation's roles; `addressed(wapshott, party)` passes clean; the repository lint gains no new warnings.

**Related.** ARV-A9, AUT-23.

## WPC-08: A fact that only one thing may hold at a time cannot be declared with a single argument

*Wapshott's Circus (unmerged) friction 8. Gate D, P3; still holds on main.*

**The finding.** A fact that only one thing may hold at a time cannot be declared with a single argument: `current(place) exclusive` is refused, so the circus had to invent an entity to hang `current(wapshotts, ground)` on.

**On main.** module-compiler.ts:56 throws 'Exclusive relation needs at least two arguments'. The assertion code already handles one argument correctly: world.ts:330-335 drops every fact that agrees with the new one on all but its last argument, which for a single argument is every other holder. No other engine code depends on two arguments: the other uses of `.exclusive` are module-writer.ts:35 and module-installations.ts:95. Branch: data/goings-on/circus/circus.kyr:27 (`Kind concern. Entity wapshotts`) and :43 (`current(concern, place) exclusive`).

**What remains.** A one-argument "which one now" fact needs an invented owner entity.

**Repair.** Lift the compiler's refusal: a one-argument exclusive relation holds of at most one entity at a time. Say so in the guide.

**Verified by.** Probe: `Relation current(place) exclusive.` loads; asserting current(b) after current(a) leaves only current(b); save/replay is identical.

**Related.** ARV-M2.

## WPC-09: Kyr has no division and no remainder

*Wapshott's Circus (unmerged) friction 9. Gate D, P3; still holds on main; held by AUT-05.*

**The finding.** Kyr has no division and no remainder: the takings of a wet night could not be halved, and the night's incident, which wanted a remainder of the count of nights, had to come from a stored die read in ranges.

**On main.** Kyr.ohm:205-212: `Value = Product ArithTail*`, `sumOp = + | -`, and `ProductTail = "*" Operand` is the only product operator. A parenthesised value that is not arithmetic is a Deem roll, settled to a number at load (Kyr.ohm:202-204; world.ts:358-361 'Unresolved Deem expression'), so it cannot read a measure. AUT-05 still lists "A ceiling; min, max and division" as remaining. The circus adds a second author's request and asks for remainder (mod) as well. Branch: a flat decrease instead of halving (show.kyr:50-51 `Decrease house(wapshotts) by 4 or to nothing`; the branch README:108 still says "halves the house"), and show.kyr:39 `Set incident(wapshotts) to dice(wapshotts)` read in ranges at :133-150.

**What remains.** As AUT-05 (a ceiling; min, max and division), plus remainder.

**Repair.** As AUT-05, in the D1 language review: integer division (`/`, rounded down) and `mod` at product precedence, plus min and max, keeping the existing floor at nothing.

**Verified by.** Expression probe: `Set house(w) to house(w) / 2` takes 7 to 3; `nights(w) mod 3` runs 0, 1, 2, 0 over four nights; `2 + 7 / 2` is 5.

**Related.** ARV-M2.

## WPC-10: An action that should last until a set hour needs the module's own measure, recomputed by a rule every watch

*Wapshott's Circus (unmerged) friction 10. Gate D, P3; still holds on main.*

**The finding.** An action that should last until a set hour needs the module's own measure, recomputed by a rule every watch (`untilShow(clock)`), because `Time` takes only a measure, and the engine's own countdowns run only to light, dark, morning and the turn of the day.

**On main.** Kyr.ohm:175-177 allows `Time integer minutes | Time integer | Time Call`. statement-parser.ts:24 (Duration) takes a single Call, not arithmetic, and campaign/action-time.ts:8 reads it once, as the action begins. The engine's countdowns are a fixed set: engine-owned.ts:8 (untilLight, untilMorning, untilDark, untilTurn) and data/rules/core.kyr:120, 133. Branch: data/goings-on/circus/note.kyr:124 and 130-131, `Measure untilShow(clock). Rule until_show when hour(clock) < 19 { Set untilShow(clock) to (19 - hour(clock)) * 6. }`. That rule fires every watch and counts whole hours, since hour(clock) runs 0 to 23 (core.kyr:121-123). A wait begun at 17:50 is therefore twelve 10-minute watches and ends at 19:50, not at 19:00. ARV-M2's remaining `after N hours` timer is a delay from now, not a wait until a clock hour.

**What remains.** "Until seven" is written by hand in each module, costs a rule every watch, and can end up to an hour late.

**Repair.** `Time until hour 19.` (and `until day N hour H`), computed by the engine from the clock as untilDark is, exact to the watch. Taken up in the D1 review beside ARV-M2's timers.

**Verified by.** Probe: an action with `Time until hour 19.` begun at 17:50 ends at 19:00, and begun at 18:40 ends at 19:00; at or after 19:00 it is not offered, or takes no time, whichever the spec states.

**Related.** ARV-M2, AUT-09.

## WPC-11: A person written `Known as` something else until they are known is called that in the list of who is here, but choices and results built from the shared actions' labels still use their real name

*Wapshott's Circus (unmerged) friction 11. Gate A, P2; partly answered on main.*

**The finding.** A person written `Known as` something else until they are known is called that in the list of who is here, but choices and results built from the shared actions' labels still use their real name: in `kyrie play` and Journey, "Talk to Mademoiselle Zéphyrine" stands beside "a woman in a silver wrap".

**On main.** `Known as` compiles to a whole role on the person (src/lang/person-parser.ts:140,211). Only ObservationText.presented reads roles (src/lang/observation-text.ts:74-90). ObservationText.label takes a group's fixed name before the comma and ignores roles (observation-text.ts:52-58). Action labels are grounded once from each entity's fixed name (src/campaign/action-schemas.ts:13-19, 81-89; built at src/campaign/operators.ts:28,76). PlayerView.list swaps in only place aliases (src/presentation/player-view.ts:122-123, 151-154). So the shared labels "Talk to {person}", "Take your leave of {person}" (data/rules/people.kyr:71,78), "Give {gift} to {recipient}" (data/rules/belongings.kyr:162) and "Tell {recipient}: …" (data/rules/discovery.kyr:45) carry the hidden name. So do results rendered through label, such as "{carrier} gives {gift} to {recipient}." (belongings.kyr:170). The partial fix is in general code: on the web place page the opener builds "Talk to …" from the subject's presented name (src/ui/attention.ts:28-31; subject names from the people rows, player-view.ts:276-287). The circus's own topics with her are worded "Ask Zéphyrine …" and gated on knowing her (branch troupe.kyr:207,212), so the leak there is the talk choice, as the author says. On main no shipped module uses `Known as` (grep of data finds none); only test/fixtures/probes/known-as does. This fills a gap left by M17's ICE-12 fix (8999666), whose test checks only screen().people names (test/known-as.test.ts:7-12). No engine change on the branch.

**What remains.** In Journey and `kyrie play`, inside a conversation on the page (give, tell), and in result texts, a person is named by the identity the author hid. Only the web place page's talk opener is right.

**Repair.** Name entities in choice labels and result texts as the company knows them: give ObservationText.label a group's presented (role- and alias-aware) name, and fill every grounded `{param}` from it when the choice is shown, as PlayerView.list already does for place aliases. Labels, scene subjects and the story then share one naming function.

**Verified by.** Extend test/known-as.test.ts. Before 'Ask her name', no Journey choice label and no told text contains 'Ursel Cobb', and 'Talk to a woman in a grey shawl' is offered. A probe Give to her before she is named tells 'a woman in a grey shawl'. After she is named, the leave choice says 'Ursel Cobb'.

**Related.** ICE-12, M17-93, CTH-05, ARV-H5, COR-12, NAR-12.

## WPC-12: A module's own paper (a list, a playbill) declared `like` the catalog's glossary of the old script takes the glossary's book slot and its lore along with it

*Wapshott's Circus (unmerged) friction 12. Gate D, P2; still holds on main.*

**The finding.** A module's own paper (a list, a playbill) declared `like` the catalog's glossary of the old script takes the glossary's book slot and its lore along with it, so it is offered "Equip" and, once equipped, teaches reading the old script. `is gear` avoids this, but there is no category for a document that is carried and read.

**On main.** src/canon/local-catalog.ts:41-45: a `like` kind takes everything from its base, including `grants`, unless it says `granting <skill>`. There is no way to say 'granting nothing'. data/catalog/items.json:537-548: old_glossary is equipment, slot 'book', grants lore. A slot makes a kind wearable (src/campaign/item-traits.ts:15), and the shared equip_item is offered on anything wearable (data/rules/belongings.kyr:109-115). The categories are weapon, armor, tool, gear, consumable, equipment and treasure, with no document (local-catalog.ts:25-26). The guide teaches `like old_glossary granting …` for a tablet (doc/authoring/guide.md:758-764) but does not warn that a plain `like` brings the slot and the skill. The branch works round it with `is gear` (branch menagerie.kyr:13,494; ledger.kyr:142). No engine change on the branch.

**What remains.** A document kind is either `is gear`, with nothing to mark it as something read, or `like` a book, which brings an equip slot and a skill by accident. Nothing warns.

**Repair.** Add a `document` category: carried and read, never equipped, granting nothing unless it says `granting`. Have kyrie lint advise when a `like` kind inherits a slot or a skill grant that its own declaration does not name.

**Verified by.** Probe: `Kind letter_kind "a letter" is document.` is never offered Equip and grants nothing. kyrie lint on `Kind list_kind "a list" like old_glossary.` advises that equipping it would grant lore.

**Related.** PT-35, ARV-M2.

## WPC-13: To hand the company a thing with `Give`, an author must also park that thing in some room, hidden until a fact

*Wapshott's Circus (unmerged) friction 13. Gate D, P2; still holds on main.*

**The finding.** To hand the company a thing with `Give`, an author must also park that thing in some room, hidden until a fact, and assert that fact by hand beside the `Give`. Nothing checks that the three agree.

**On main.** `Give x to g` compiles to handed(x, g) (src/lang/statement-parser.ts:33-37). Consequences.hand moves an item entity that already exists, from wherever it lay (src/campaign/consequences.ts:33-49; data/rules/belongings.kyr:11-15). An Item must be declared at or in a place (src/lang/Kyr.ohm:10-14). A hidden item is not noticed until its fact is known (src/campaign/local-observations.ts:52-57), and nothing can be done to an unnoticed thing (PlayerView.sees, src/presentation/player-view.ts:140-144). Main's own origin uses the same three-part idiom (data/origins/order/origin.kyr:16,22-23). The circus repeats it five times, each thing parked at road_ca (branch art.kyr:23,30; ledger.kyr:138,144; menagerie.kyr:11,15,491,496; show.kyr:254,259). This is what is left over from M17's `Give` (AUT-14, ICE-08, HSL-14, 30168b6). A misspelled fact is refused when the module is compiled; one left out is not noticed.

**What remains.** A given thing needs a made-up resting place, a hiding fact and a hand-written assertion. If the assertion is left out, the thing reaches the pack but stays unnoticed, so nothing can be done with it. If it is not hidden, it lies in plain view in the room it was parked in. Nothing warns of either.

**Repair.** Let `Give` make a new item of a kind (`Give wonders_list_kind to actor.`), or allow an item to be declared as held offstage. A `Give` should reveal its own item by teaching whatever conceals it. Lint should advise when an item hidden until a fact is given by a `Give` that does not assert that fact.

**Verified by.** Probe: a topic doing `Give letter_kind to actor.`, with no Item declaration, puts a letter in the pack, shown there and usable, and no room ever lists it. The order origin's rope still arrives as before (its origin test).

**Related.** AUT-14, ICE-08, HSL-14, ARV-M2, AUT-23.

## WPC-14: A module's own kinds of thing share one namespace with the catalog and with every other module, so an author must invent long names

*Wapshott's Circus (unmerged) friction 14. Gate D, P2; still holds on main.*

**The finding.** A module's own kinds of thing share one namespace with the catalog and with every other module, so an author must invent long names (`wonders_list_kind`) to avoid clashing with whatever else might be installed in the same world.

**On main.** itemkind is a 'canonical' entity type, never prefixed by its module (src/campaign/module-namespace.ts:18-21, 26-28). LocalKinds.install puts a module's kinds into the process-wide catalog under their bare ids when the module is parsed (src/lang/catalog-parser.ts:65; src/canon/local-catalog.ts:57-63). It refuses a kind declared differently by two modules (local-catalog.ts:131-139; merge at :112-121). The refusal is loud, but only when both modules are read into one process. Whether a library-wide run meets it then depends on what that process loaded first (ARV-H7), and kyrie lint's vocabulary pass drops a file that fails to parse (src/cli/kyr-lint.ts:61-65). The clash has already happened: the Grand Tour's `licence_kind` collided with Hessel's (data/adventures/hessel/banns.kyr:99). It was found by reading at the merge (doc/architecture/mission-18/grand-tour.md:77-78) and renamed `tour_licence_kind`, and OWN-36 asks for distinct names for unrelated licences.

**What remains.** Kind ids are global. A clash between two modules is found only when they first meet in one process or world, by reading or by a load failure, and Gate B's one country makes that meeting certain.

**Repair.** Scope a module's own kinds by the module (module__kind), as entities and relations are, unless the module exports them; catalog kinds stay bare. Failing that, have kyrie lint compare every module's local kinds across the whole library, independent of load order, and report each clash by file and line.

**Verified by.** Two probe modules each declare `Kind list_kind` differently, install into one world, and each keeps its own. A library-wide lint run over a probe pair reports the clash by file and line, in either load order.

**Related.** COR-04, ARV-H7, AUT-07, OWN-35, OWN-36.

## WPC-15: Names the shared rules use are closed to every module

*Wapshott's Circus (unmerged) friction 15. Gate D, P2; still holds on main; held by AUT-07.*

**The finding.** Names the shared rules use are closed to every module: an entity cannot be called `box`, a parameter of the shared take-out and put-in actions, and a state cannot be called `shut`, a shared query.

**On main.** The refusal: src/lang/module-compiler.ts:127 ('Parameter shadows entity'). The message naming the shared rule responsible: src/lang/diagnostics.ts:43-48. The names: data/rules/belongings.kyr:81,90 (`box: thing`) and data/rules/passages.kyr:61 (`Query shut`). The errors have been clear since 6780b43 (AUT-07's evidence), and the author agrees. The code involved is unchanged between the branch's fork (78e0a42) and main. What this adds to AUT-07, which speaks only of states: the engine already holds that a parameter named like an entity is no ambiguity, since inside the action the parameter is meant. It applies that only to a world joined from modules already checked (module-compiler.ts:17-21). A module checked against the shared rules is still refused, so the shared rules' common words are closed to every module.

**What remains.** Common words in the shared rules' parameters and queries cannot be used for a module's own things or states.

**Repair.** AUT-07's remedy: scope states to their thing or module. In addition, check a module against the shared rules as a joined world is checked, so that a shared action's parameter never closes an entity name.

**Verified by.** A probe module with an entity `box` and a state `shut` loads, lints and plays. AUT-07's place-and-state `wound` probe passes.

**Related.** AUT-07, WPC-14.

## WPC-16: Nothing guarantees that a scenario is placed

*Wapshott's Circus (unmerged) friction 16. Gate B, P1; still holds on main.*

**The finding.** Nothing guarantees that a scenario is placed: the library is drawn by weight, so an institution meant to be in every first country, like a touring circus, is there in some worlds and missing in others.

**On main.** On main, WorldAssembler.settle draws adventures and goings-on by weighted choice in a fixed number of rounds (src/world/world-assembler.ts:180-193). Two things are always placed. The heralds of neighbouring countries are not something an author declares (world-assembler.ts:174-179, 281-286). Provinces are whole authored countries installed into the first country (src/world/provinces.ts:8-12; src/world/countries.ts:30-41), not a scenario set in the country's own towns. The brief's B4 asks for declarative placement of 'an institution in several towns'. The branch's remedy, not on main: data/scenarios/standing.json, and settle placing `standing` entries after the drawn ones so nothing drawn moves. A standing entry that is not placeable is silently skipped (branch world-assembler.ts settle, `filter(this.placeable…)`).

**What remains.** An author cannot say that a scenario set in a country's settlements is always present. This is a dependency of B4 and ADV-01 for any adventure built as a going-on.

**Repair.** A declarative standing placement, as the branch has it: scenarios listed or marked as always placed, placed after the drawn ones so existing seeds keep their worlds, and named in the placement report (bin/kyrie countries) with where each landed, or why it could not be.

**Verified by.** Placement spec over 20 seeds: the standing scenario is placed in every first country, or the report says why not; every drawn placement is identical with and without the standing list.

**Related.** ADV-01, NAV-10, PT-29, M18-04.

## WPC-17: A scenario cannot ask for "the next town along the road" or "the road between two towns"

*Wapshott's Circus (unmerged) friction 17. Gate B, P1; still holds on main.*

**The finding.** A scenario cannot ask for "the next town along the road" or "the road between two towns". On main an unknown settlement need is not refused: it quietly becomes the first fitting town, so the circus's three grounds would all land in one town.

**On main.** Main's settlement needs are near:role, toward:side, any, or else the first that fits (src/world/scenario-towns.ts:21-42; documented at src/world/world-assembler.ts:39-41). Any other string falls through to `fit[0] ?? settlements[0]` (scenario-towns.ts:37), so the branch's 'largest', 'along:a' and 'along:b' would all bind the same first town, silently. A way need is read only as near:role (world-assembler.ts:365-371), so 'between:a,b' finds no road and leaves the role unbound. That fails loudly if a module imports the role ('Scenario reference … names no bound place', world-assembler.ts:418-419), so the world does not build, and silently otherwise. No manifest is checked for unknown needs. The branch's remedy, not on main: ScenarioTowns.largest/along/way and the needs `largest`, `along:role` and `between:a,b`, the way falling back to a road into the second town not already taken. Its own limit: with fewer than three settlements the circuit still shares a town. B4 asks for 'an institution in several towns'.

**What remains.** There is no placement vocabulary for a circuit of towns or for the road between two, which B4 needs. Misspelled or unknown needs are accepted and bound to the first town, or break world assembly.

**Repair.** Adopt the branch's needs (largest, along:role, between:a,b) in ScenarioTowns. Refuse an unknown settlement or way need when the manifest is read, naming the role, rather than falling back. Have the placement report say when a circuit had to share a town.

**Verified by.** Placement spec over the circus's tested seeds plus 20 more: towns a, b and c are distinct wherever three settlements exist, and roads ab, bc and ca each join their two towns. A manifest with an unknown need ('nxt:a') is refused, naming the role.

**Related.** ADV-01, NAV-04, COR-05, WPC-16, WPC-18.

## WPC-18: A going-on placed in 'any' settlement claims that town for itself alone

*Wapshott's Circus (unmerged) friction 18. Gate B, P2; still holds on main.*

**The finding.** A going-on placed in 'any' settlement claims that town for itself alone, so something that visits towns already busy, like a circus, cannot share one with what else is going on there.

**On main.** On main, 'any' adds its town to `claimed` (src/world/scenario-towns.ts:38-40), and so does 'toward:' (scenario-towns.ts:29). Only near:role and the first-town fallback claim nothing (scenario-towns.ts:31-37), and that is incidental, not a declared way to share. B1 asks for two adventures in one settlement without duplication or overwriting. The branch's remedy, not on main: its new needs `largest` and `along:` claim nothing ('What goes round the country … is shared with whatever else is there').

**What remains.** An author cannot say that a scenario shares its settlement. Whether it claims one depends on which need word it happens to use.

**Repair.** Make claiming explicit: a settlement need says whether it is exclusive or shared. The placement report lists every settlement's modules, as NAV-04's one naming authority per settlement needs anyway.

**Verified by.** World spec: the circus and a drawn town going-on bound to the same largest town are both placed and both reachable by ordinary play, and neither's actions are offered at the other's places (COR-05's two-modules-in-one-town spec).

**Related.** COR-05, NAV-04, WPC-17.

## WPC-19: The author reports that retrying a failed check gives the same roll each time

*Wapshott's Circus (unmerged) friction 19. Gate D, P3; not settled by reading.*

**The finding.** The author reports that retrying a failed check gives the same roll each time (a night spent failing to lure the owlbear failed every night after). Reading main's code, though, a repeated check draws a fresh die.

**On main.** The author read the check's own key (src/rules/checks.ts:62: seed, 'check', skill, maker, action id). But the seed passed in is the command's: field-resolver.ts:75-78 gets it from Campaign.randomSeed (src/campaign/campaign.ts:368-371). RandomStreams.command keys that seed by the action's Resolve call (check, actor, skill, difficulty) and by how many earlier commands in the log shared it (src/random-streams.ts:13-27). Past log entries are re-grounded by id (src/campaign/operators.ts:37-49), so they count. This code dates from 85205ef, before the branch's fork at 78e0a42, and is unchanged since. The branch's only edit to checks.ts adds tumbling and performance to the skill table and does not touch the die. So by reading, a second attempt at lure_owlbear (branch menagerie.kyr:347-354, woodcraft at dc_hard) gets occurrence 1 and a different d20. A run of failures at dc_hard (roughly two in three to three in four each) is plausible by chance. The author's note that day-gated lessons 'do vary' fits this. Not probed: a browser render was running.

**What remains.** Unconfirmed. If it reproduces, a check meant to be retried is a dead end for that seed. If not, the friction note should be corrected and the row closed as not reproduced.

**Repair.** If it reproduces, find which log entry fails to count toward the occurrence (an id Operators.get cannot re-ground). Otherwise nothing beyond saying in the guide that each retry draws again.

**Verified by.** Probe module with an unlatched check (`Resolve check(actor, woodcraft, dc_hard)`, no tried fact), one seed, attempted 12 times: the check events show at least three distinct die values. Replay the circus owlbear nights with the author's first seed.

**Related.** ARV-H6.

## WPC-20: A choice whose action rolls a check has its odds added to its label

*Wapshott's Circus (unmerged) friction 20. Gate F, P3; still holds on main.*

**The finding.** A choice whose action rolls a check has its odds added to its label ("… · an even chance"), so a test step that matches the action's own label exactly, from ^ to $, fails.

**On main.** ChoiceWording.word appends ' · <odds>' to any check (src/presentation/choice-wording.ts:33-34), as it appends a price, an offering and a trap's harm (:30-37). Journey.matches tests the step's pattern against that whole label, then against heading plus label, which carries the same suffix (src/session/journey.ts:82-89). test/spoken-roll.test.ts already expects a label ending in 'an even chance'. The suffix is meant for the player; the cost falls on test authors. The branch worked round it with prefix matches. This continues M17's ICE-19 work on matching steps to labels.

**What remains.** Test steps must leave off `$` or spell out the odds, which change with the party's skills.

**Repair.** Have Journey also match a step against the label without the trailing ' · …' notes ChoiceWording adds (odds, coin, harm), and say so in the guide's section on journey steps.

**Verified by.** Journey spec on test/fixtures/probes/spoken-roll: after 'Talk to Will', the step '^Ask Will to light the hearth himself, for the child$' is taken.

**Related.** COR-18, ICE-19.

## WPC-21: The author reports that a `Grave` choice, one that cannot be undone and is asked about first, needs confirming at the command line but is taken at once by Journey

*Wapshott's Circus (unmerged) friction 21. Gate F, P3; not settled by reading.*

**The finding.** The author reports that a `Grave` choice, one that cannot be undone and is asked about first, needs confirming at the command line but is taken at once by Journey, so a list of steps that works in one fails in the other.

**On main.** By reading, the difference is between the web page and Journey, not between the CLI and Journey. The web reader takes a grave choice only when it is chosen a second time (web/reader/reader-app.tsx:155; web/reader/stage/act.tsx:29-30, 'Choose it again to do it'). Journey performs it on the first match and only records `grave` (src/session/journey.ts:118-121, 147-158). `kyrie play` is a Journey and only prints '! asked first' (src/cli/play-tool.ts:73-79), unchanged since the fork. The interactive terminal has no grave handling (src/cli/terminal.ts). The 'command line' the author meant is probably a browser-driven scratch driver; this could not be confirmed. M17's HSL-07 (5f0ce85) made Journey record the question rather than act out the second choice. The circus's grave topics are on the branch at menagerie.kyr:250,270.

**What remains.** A grave choice takes one step in Journey but two on the page, so steps written for one driver do not replay in the other.

**Repair.** One step form for a grave choice that every driver honours: Journey accepts an optional confirming repeat of the step, or a marked step such as '!label' that a browser driver turns into two clicks.

**Verified by.** Spec: the circus hob's steps ('Tell Ninepence the Colonel accepts his terms') replay identically through Journey, `kyrie play` and the browser driver.

**Related.** HSL-07, COR-18.

## WPC-22: A long wait in a test is cut short when a territorial band arrives (raiders at midnight on the circus ground)

*Wapshott's Circus (unmerged) friction 22. Gate F, P3; answered on main.*

**The finding.** A long wait in a test is cut short when a territorial band arrives (raiders at midnight on the circus ground). The author says this is right in play, only surprising in a test of something else, and the tests now wait at the inn. This is a process note, not a defect.

**On main.** The behaviour is intended: the long waits are 'Interrupted when threatened' (data/rules/core.kyr:116-135). M17's ICE-21 (c210fa8) gave an arrival its own words, and found that the halt 'with nothing to wait by' does not reproduce: waiting is offered after a warning, and a `?` step passes over a wait that cannot be made. The author does not complain of the driver's message. The classification's claim that Journey's error hides what stopped the wait was not established: Journey.until throws 'Nothing to wait by at watch N' only when no Wait is offered at all (src/session/journey.ts:189-199), and nothing shows that the circus run reached that throw.

**What remains.** Nothing in the engine: the wait stops as it should.

**Repair.** None needed. Optionally, Journey.until could say who arrived when a wait it was making was cut short.

**Verified by.** No probe needed.

**Related.** ICE-21, COR-18.

## WPC-23: Editing source files while the full test suite runs spoils the run, because each test file loads the code when it starts

*Wapshott's Circus (unmerged) friction 23. Gate F, P3; answered on main.*

**The finding.** Editing source files while the full test suite runs spoils the run, because each test file loads the code when it starts. This is a process note, not a defect.

**On main.** The author marks it 'Process, not language'; the second pass ran the suite only after the last edit. The project's practice already says to touch nothing in the tree while gates run, working in scratch or a worktree and re-running if anything slipped in. There is no engine or tool defect to record.

**What remains.** Nothing in the code; it is practice.

**Repair.** None in the engine. If wanted, the test runner could record a hash of src/ at the start and the finish of a run and warn when they differ.

**Verified by.** No probe needed. Optionally, a suite run reports 'src changed during the run' when a file is edited mid-run.

## WPC-24: The lint's length limits on files and functions fell on world-assembler.ts and on one long test block

*Wapshott's Circus (unmerged) friction 24. Gate D, P3; answered on main.*

**The finding.** The lint's length limits on files and functions fell on world-assembler.ts and on one long test block. This is a process note: the limits are the owner's, and the branch complied.

**On main.** The branch complied in code. The way binding moved out of WorldAssembler (main src/world/world-assembler.ts:365-371) into ScenarioTowns.way (git diff main...origin/adventure/big-tent -- src/world), and the tests were split by subject. The limits are the owner's settings, not a defect.

**What remains.** Nothing; the limits stand as set.

**Repair.** None. Keep complying in code.

**Verified by.** None needed.

## WPC-25: An author's own repeated phrases build up across a long module ("for a long time" fifteen times, "purring like a millstone" twice), and no tool reports them

*Wapshott's Circus (unmerged) friction 25. Gate D, P3; still holds on main.*

**The finding.** An author's own repeated phrases build up across a long module ("for a long time" fifteen times, "purring like a millstone" twice), and no tool reports them: `kyrie voice` reads only the shared voice tables.

**On main.** The subcommands orsino, show, moments, coverage and review all read the data/voice tables (src/cli/voice.ts:1-6). Nothing in src/ or bin/ counts a module's repeated phrases: a grep for overlap, n-gram, shingle or repeated phrase finds only tests and unrelated comments. PT-15's measure of sentence overlap across countries, meant for generated text, is not built either. The author found the repeats with a hand grep.

**What remains.** There is no report of a module's most repeated phrases, so an author's tics are found only by hand.

**Repair.** `kyrie voice repeats <module>`: the module's most repeated 3- to 6-word phrases and similes across its Says, Greets, Observe, Result and Rule texts, with file:line. It could share code with PT-15's overlap measure across countries.

**Verified by.** Run on the circus branch: it lists 'for a long time' with its count. On a probe with one phrase written three times, it lists that phrase at three places.

**Related.** PT-15, CTH-09.

## WPC-26: Something that happens again and again, like a nightly show, is told in full every time unless the author hand-writes a fact for 'seen it once' and two versions of every text

*Wapshott's Circus (unmerged) friction 26. Gate D, P2; still holds on main.*

**The finding.** Something that happens again and again, like a nightly show, is told in full every time unless the author hand-writes a fact for 'seen it once' and two versions of every text. Kyr has a 'first time, and after' form only for a person's greeting.

**On main.** Kyr has `Rule … once` and Topic `once` (src/lang/Kyr.ohm:108,111,129-130), and `teaches` on Observe and Rule (:131-137). Its one first-and-after form is a person's `Greets again` (Kyr.ohm:81), which the circus uses for every performer. There is no observation, rule or event text with a first telling and a briefer later one. The engine does this for itself only where a shut way says why the first time it is seen shut (CTH-12, M17). OWN-18 asks the same of places ('a return briefer still unless something has changed'). The branch writes each act twice, gated by a hand-made `sawAct` fact.

**What remains.** Every recurring scene needs a hand-made 'seen' fact and two texts, or it repeats itself word for word.

**Repair.** Extend the `Greets again` idea to Observe, Rule says, Event and place State texts: a first telling and a later one (e.g. `… again "…"`), latched per company as `once` is. The place descriptions OWN-18 wants briefer on return would use the same form.

**Verified by.** Probe: an Observe written with a first and a later text tells the first on the first night and the second on every night after, and a save and resume keeps the latch.

**Related.** OWN-18, PT-15, ARV-M2.

## WPC-X01: A measure meant to stay between bounds

*Wapshott's Circus (unmerged), README.md. Gate D, P3; still holds on main; held by AUT-05.*

**The finding.** A measure meant to stay between bounds (the circus's canvas, 0 to 3, and its beasts' welfare, 0 to 4) cannot be given a ceiling in Kyr. The module either adds a rule that sets the value back after it has gone over, or guards every increase by hand.

**On main.** Main: src/lang/Kyr.ohm:185-188. `Increase Call "by" Value` has no bound, and only Decrease has `or to nothing`. The floor is kept in src/lang/counts.ts:32-33 and world.ts:273; nothing keeps a ceiling. Branch: menagerie.kyr:37 `Rule welfare_cap when welfare(wapshotts) > 4 { Set welfare(wapshotts) to 4. }` sits after the increases at :34 and :45. ledger.kyr:111 guards mending with `canvas(wapshotts) < 3` before `Increase canvas(wapshotts) by 1` (:113). README: "the canvas (0–3 …)", "welfare 0–4". The author describes the ranges and does not call them friction. AUT-05's 'what remains' already names the ceiling. This adds two bounded measures in one module, each kept a different way.

**What remains.** Kyr cannot declare a measure's bounds. A module keeps them with an after-the-fact rule or with a guard on each increase.

**Repair.** Let a measure declare its range, e.g. `Measure welfare(group) from 0 to 4.`, or allow `Increase … by n or to at most k`. The engine clamps it the way it already clamps the floor (counts.ts). Lint warns on a Set or Initially whose constant is outside the declared range.

**Verified by.** Probe: `Measure m(group) from 0 to 4.`, increased by 3 twice, reads 4 with no rule. Once the circus is merged, removing its welfare_cap leaves its menagerie specs passing.

**Related.** WPC-09.

## WPC-X02: A contest of words (a heckler's composure against the answerer's poise, over three jabs) has to be built by hand from relations, measures and rules

*Wapshott's Circus (unmerged), README.md. Gate D, P3; still holds on main.*

**The finding.** A contest of words (a heckler's composure against the answerer's poise, over three jabs) has to be built by hand from relations, measures and rules: eight rules and five answer actions for one heckler. There is no shared form for a bout or contest that a module could use instead.

**On main.** Branch: art.kyr:108-196 declares eight relations (heckler, inBout, boutWon, boutLost, answered, jabTold, boutAtFair, wonABout) and four measures (composure, poise, jab, boutDay). It has five shared rules (bout_next, bout_won, bout_lost, bout_drawn, bout_ends_with_show), three for its one heckler (jos_heckles, jos_jab2, jos_jab3) and five answer actions. Each action repeats `able(actor) and company(actor) and at(actor, site) and boutOpen(foe, actor) and at(foe, site)` and the same On success / On failure pair. Main has no contest construct in data/rules or src/lang (grep for composure, bout or contest finds nothing). Other modules count by hand too: Gosse's night keeps temper and crowd (data/adventures/gosses-company/night.kyr:8), and the Parliament of Books counts ayes and nays (parliament.kyr:6). The README describes the bout without calling it friction. Friction 3 (the bout's outcome rules lost their `near` anchor) is one consequence.

**What remains.** Each module that wants a scored exchange (heckling, a flyting, a crowd's temper, a vote) writes its own small state machine and repeats the same guards on every answer.

**Repair.** Settle in ARV-M2's D1 review whether this is grammar or a data/rules library form, e.g. `Bout heckling between ?o and ?a: their composure N, your poise M, rounds 3`. Answer actions then name only their check and their effect, and the form handles the round, the win, the loss and the draw, and where the bout is told.

**Verified by.** The circus's heckling and one other scored exchange (Gosse's night or the Parliament's count) are rewritten on the shared form with their specs unchanged. A probe bout in a two-room module is told only where it is fought.

**Related.** ARV-M2, OWN-06, WPC-03.

## WPC-X03: A new skill has to be written in four shared places, one of them engine code

*Wapshott's Circus (unmerged), README.md. Gate D, P2; still holds on main.*

**The finding.** A new skill has to be written in four shared places, one of them engine code: core.kyr's capability, skills.json, the callings in classes.json, and the quality it rests on in Checks.qualities. A checked skill missing from Checks.qualities is rolled on wisdom without any warning.

**On main.** Main: src/rules/checks.ts:16-19 keeps the skill-to-quality map in TypeScript, and :30 falls back with `this.qualities[skill] ?? 'wisdom'`. src/canon/schema.ts:140 `Skill { name; description; source }` has no quality. src/canon/local-catalog.ts:11-14 lets a module declare items and species, not skills. Compile time checks only that check's second argument is a capability (runtime-capabilities.ts:16, module-compiler.ts:138), so `Resolve check(actor, light, dc_fair)` compiles and rolls on wisdom. The lists already disagree on main. `perception` is a capability (core.kyr:21) with a quality but no skills.json entry. `reading_the_dead` is in skills.json and classes.json (:344, :495, :946) but has no core.kyr capability and no quality. The branch touches data/rules/core.kyr (+3), data/catalog/skills.json (+14), src/rules/checks.ts (2+/1-) and data/catalog/classes.json, and regenerates doc/handbook/{phb,dmg}.md and coverage.json.

**What remains.** A skill's quality lives in engine code with a silent wisdom default. Nothing checks the four lists against one another, and no module can add a skill of its own.

**Repair.** Record each skill's quality in skills.json (e.g. `"rests": "dexterity"`) and derive Checks.qualities from it. Canon validation fails a checked skill with no quality or no capability, and a capability in skills.json with none. The compiler refuses a check on a capability that is no checkable skill. Allow a module-local `Skill tumbling "Tumbling" rests on dexterity.`, joined and removed as local kinds are.

**Verified by.** Canon spec: every capability named in a `check` across the library has a quality and a skills.json entry, and checks.ts has no literal map. `Resolve check(actor, light, dc_fair)` is refused at compile time. A probe module declaring its own skill rolls on its stated quality.

**Related.** ARV-M6, ARV-H7, COR-04.

## WPC-X04: A module cannot declare its own techniques. The circus put Pratfall and Feint into the shared abilities.json

*Wapshott's Circus (unmerged), README.md. Gate D, P2; still holds on main.*

**The finding.** A module cannot declare its own techniques. The circus put Pratfall and Feint into the shared abilities.json, so every world and the generated handbook carry them whether or not the circus is installed.

**On main.** Main: src/canon/local-catalog.ts:11-14 (LocalCatalog holds items and species only). src/lang/Kyr.ohm:139,147 (LocalKind and LocalSpecies; no local ability or technique). Branch: data/catalog/abilities.json +22 adds pratfall and feint, each with source.notes naming "(Wapshott's Circus)". art.kyr:23 and :55 `Assert teaches(mumchance, pratfall)` / `teaches(mumchance, feint)`. The handbook was regenerated to list them (doc/handbook/phb.md, coverage.json). The README lists them among the shared content changed "each general": "techniques pratfall and feint (abilities.json)". The author chose shared, but had no other choice.

**What remains.** Techniques, like skills, belong only to the shared catalog. A module that teaches a new one has to edit shared data and the generated handbook.

**Repair.** Extend LocalCatalog with abilities, e.g. `Technique pratfall "Pratfall" { effect "Apply dodge to self for 2 turns." recharge 3 }`, parsed by Abilities.ohm and installed and removed with the campaign as local kinds are. Refuse one that shadows a catalog ability. Hold it in ARV-H7's campaign-owned catalog context.

**Verified by.** A probe module declares a technique, teaches it by train_member and uses it in a fight. With the probe not installed, Content.abilities and the handbook do not list it. ARV-H7's isolation spec is extended to abilities declared in either load order.

**Related.** ARV-H7, COR-04, ARV-M6, ARV-A5.

## WPC-X05: A rule that sends a module's people to their places pulls a recruit out of the company unless it adds `and not travelsWith(?p, party)`

*Wapshott's Circus (unmerged), README.md. Gate D, P2; partly answered on main.*

**The finding.** A rule that sends a module's people to their places pulls a recruit out of the company unless it adds `and not travelsWith(?p, party)`. Main stops a rule from moving someone who follows the company, but not someone who has joined it. The circus writes the guard into four rules, and the generated towns' writers each write it again.

**On main.** Main: src/campaign/campaign-tick.ts:152-165 (`yielding`, from HSL-05's fix 30168b6) drops a rule's `Assert at(p, …)` for p only where `following(p, player)` holds; the `followers` set never includes `travelsWith`. A recruit has no `at` of her own (data/rules/people.kyr:42-43 retracts it on joining), and Journey.along (src/campaign/journey.ts:39-47) moves only followers. So a placing rule's `Assert at(pip, ring)` would give a companion a place apart from the company. The generated writers build their own guard: community-writer.ts:85 (`able(x) and not travelsWith(x, party) and not following(x, party)`) and region-traffic.ts:64. Branch: circus.kyr:135 (wagons_on_road), :141 (troupe_settles), :145 (troupe_to_ring) and :163 (parade_starts) each carry `and not travelsWith(?p, party)`. troupe.kyr:198-200 makes Pip willing to join. README: Pip "leaves the ring while she travels, and goes home to it when sent". The unguarded effect was not run (resource limits); this is by reading.

**What remains.** The two companion systems are protected differently. A rule that knows nothing of the company can take a recruit (`travelsWith`) out of it, and forgetting the guard fails silently.

**Repair.** Extend CampaignTick.yielding so those who travel with the player count as followers too. A rule that neither reads nor writes travelsWith or following does not place them, which is HSL-05's remedy applied to both ties. Add a shared `free(p)` query to people.kyr and use it in the generated writers in place of their own. The whole repair belongs to ARV-M7's one membership facility.

**Verified by.** Probe: a recruitable person with `Rule home when not at(p, hall) { Assert at(p, hall). }`, recruited and walked two rooms away, stays with the company and is not seen at the hall. With the circus merged and its four guards removed, the Pip recruitment spec is unchanged.

**Related.** HSL-05, ARV-M7, NAR-18.

## WPC-X06: A story placed in the shared country

*Wapshott's Circus (unmerged), README.md. Gate B, P2; still holds on main.*

**The finding.** A story placed in the shared country (a going-on or a standing scenario) cannot use an Ending, because a placed module's ending closes the whole book. Only the countries beyond a march and the provinces close just their own chapter, so the circus reaches its reckoning with no ending at all.

**On main.** Main: src/lang/endings.ts:13-19 says an ending closes the book unless its module was installed as a chapter, and :47-50 (Endings.reached) skips only installations marked `chapter`. src/world/frontier.ts:62 and :87 set `chapter: true` for authored countries beyond a march and for provinces. src/world/world-assembler.ts:422-430 (requests for placed scenarios) sets no chapter, and those requests are installed as they are in the first country and in drawn countries beyond (frontier.ts:66-68). No module under data/goings-on, data/situations, data/kits or data/conflicts uses Ending (grep), and neither lint nor the assembler warns against one. README: "The circus uses no `Ending`: it lives in the shared country, and the book must not close on it."

**What remains.** A going-on's resolution has no epilogue. It leaves no recorded ending that lint, the Story or a successor link can use, and an author who writes one closes the player's whole book without warning.

**Repair.** Install every placed scenario's modules as chapters, as Frontier does for countries and provinces. A going-on's Ending then tells its epilogue and is recorded as reached while the world goes on. Let a scenario's `links` start a successor on a named ending (PT-01, PT-29).

**Verified by.** A probe going-on with two Endings, placed in a generated country: reaching one tells its epilogue, the page does not close, play continues, and Endings.reached returns nothing for the book. The same probe placed in a drawn country beyond a march behaves alike.

**Related.** PT-01, PT-29, NAR-14, ADV-01.

## WPC-X07: A story that runs over twelve game days cannot be played whole in a test

*Wapshott's Circus (unmerged), README.md. Gate F, P2; still holds on main; held by COR-18.*

**The finding.** A story that runs over twelve game days cannot be played whole in a test. The circus's three reckonings are reached by writing facts straight into the world through a private cast, and no test runs several circuits after the Fair.

**On main.** Branch: test/circus.test.ts:28-37 `stage(...)` ("Sets what is so directly, for an outcome no single journey reaches in a test's time") casts the campaign `as unknown as Staged` to reach world.apply and commit. It stages at :124, :165, :189, :211, :221, :258-264 (the paid and torn reckonings), :331-333 and :345. Its 27 tests carry 120-300 s timeouts. Main: the same private cast appears in 58 test files (e.g. test/consequences.test.ts:18, test/authoring.test.ts:66). Journey's step syntax (src/session/journey.ts:107-121) has no staging step. A long tier exists only test by test (test/descent.test.ts:20,41, KYRIE_LONG). README: "the three reckonings (with outcomes staged, since a whole run is longer than a test)"; "Not verified in play: … a run of several cycles after the Fair". COR-18 ('Tests teleport rather than journey'; remains: an audit of the teleporting specs) covers the staging. This adds the long-running going-on that no test plays through, and shows how widespread the private cast is.

**What remains.** Staging is private and spread across 58 test files, so COR-18's audit has to read each one. Nothing plays a long-running going-on through to its climax or through several cycles.

**Repair.** Add a public Journey step that sets named facts (e.g. `'=set circus.fairScore(wapshotts) 20'`) and records it in the transcript as staged, so COR-18's audit can list every staged spec mechanically. Add a KYRIE_LONG soak for each standing or clocked scenario that waits through N cycles within a stated time budget and checks its invariants (which town the circus is in on each day, the box never below nothing).

**Verified by.** COR-18's audit lists every staged spec, the circus's among them. A KYRIE_LONG journey from day 1 reaches a reckoning by play and waiting alone. A three-circuit soak passes within its budget.

**Related.** AUT-19, WPC-22.

## WPC-X08: The circus has been played only by its author, at the command line

*Wapshott's Circus (unmerged), README.md and critique.md. Gate F, P2; partly answered on main.*

**The finding.** The circus has been played only by its author, at the command line. Its README lists the browser page, the map's drawing of its grounds and Pip fighting as a companion as never checked. Main has a preview server and a curious autoplay, but `kyrie verify` runs neither, and it cannot verify a placed going-on at all.

**On main.** README: "Played by the developer at the command line (bin/kyrie play), not by an independent player. Not verified in play: the browser presentation of the circus, the map's drawing of the three grounds, … Pip as a companion in a fight". critique.md §9: "Nothing has been played by anyone but its author." Main, and already at the branch's fork (78e0a42): `kyrie preview <campaign.json>` (src/cli/preview.ts:1-4, guide :680) serves the reader for a campaign. `kyrie reach <campaign.json>` (src/cli/reach-tool.ts:1-4, OWN-01) plays a campaign as a curious newcomer and is in the CLI usage (kyrie.ts) but not in doc/authoring/guide.md. `kyrie verify <adventure>` (src/cli/verify-tool.ts:14-22) runs lint, tests and kept traces, not reach, and requires data/campaigns/<adventure>.campaign.json. The circus's campaign is test/fixtures/circus/circus.campaign.json, and a going-on has none of its own, so `kyrie verify circus` stops at its usage line.

**What remains.** No step in the guide or in `kyrie verify` runs the curious autoplay or looks at the page and the map before an adventure is called done. `verify` cannot hold a placed going-on at all.

**Repair.** Have `kyrie verify` accept a going-on or any module by its host campaign (a fixture or a generated seed it is placed in), and also run `kyrie reach` there, failing on mute people or written rooms it never reached unless they are listed as intended. Document reach in the guide, with a done-list: a preview look at each composition and at the map, and one fight with each recruitable companion.

**Verified by.** `kyrie verify circus` (once merged) runs lint, tests, traces and a reach summary over its fixture and a generated seed, and fails on a deliberately mute probe person. The guide has a done-list section that names reach.

**Related.** OWN-01, NAV-10, OWN-07, M18-04.

## WPC-X09: A module can name places beyond its towns only as fixed words in its prose

*Wapshott's Circus (unmerged), critique.md. Gate B, P3; still holds on main.*

**The finding.** A module can name places beyond its towns only as fixed words in its prose (the circus's Dunmere, Marlow, Wakeham and Oster), the same in every world. A placement can import its own towns, the party, the country and its history, but not the world's real neighbouring countries.

**On main.** Main: src/world/world-assembler.ts:403-421 (`ref` resolves a linked placement, a module export, `@party`, `@region`, `@history.<part>`, and a bound role and its parts; nothing for the lands beyond). The region already knows its neighbours and far countries by name (region-writer.ts:63-67, Region.beyond and Region.further; countries.ts:152-163). But what it writes for them is a discovery `edge_<side>_beyond` (region-borders.ts:48-52), not an entity named for the country, so no import could name it. Branch: the circus's Kyr names Dunmere 29 times, Marlow 7, Wakeham 6 and Oster 4. critique.md §6: "The world beyond the three towns was a handful of names (Dunmere, Marlow, Wakeham, Oster). The revision gives them texture without building them". The creditor (the Dunmere Discount House) and the raiders come from Dunmere in every world.

**What remains.** A going-on's 'elsewhere' cannot be a place in the shared world. Its fixed names may contradict the map, the far rumours and other modules' cities.

**Repair.** The region writer writes a name entity for each neighbouring and far country (from Region.beyond and Region.further), and scenario imports `@beyond.<side>` and `@further.<n>` resolve to them. A shared city's name is added the same way once Gate B builds it. A placement-report line lists each module's proper names in prose that are no entity of the world, so the author can bind them or keep them as legend.

**Verified by.** A probe scenario text naming `{elsewhere}`, imported as @beyond.north, reads the neighbouring country's own name in two seeds. The placement report over the library lists unbound proper names for each module.

**Related.** NAV-04, OWN-13, OWN-16, OWN-30, ADV-01, WPC-06.

## WPC-X10: The circus's money, larder and wages are told only through Ada's talk

*Wapshott's Circus (unmerged), critique.md. Gate D, P3; answered on main.*

**The finding.** The circus's money, larder and wages are told only through Ada's talk. Its author wanted a bill of the week's figures, which main can already show, because a module's texts and aims may print a measure's value. So this is the module's own work, not engine friction.

**On main.** critique.md §9: "The economy is real but mostly invisible except through Ada. A bill of the week's figures on the ticket wagon would make it legible." Main: src/lang/observation-text.ts:8-16 (authored text may print a measure, `{quantity(party, gold)}`, or say it `in words`). src/presentation/player-view.ts:255-256 renders objectives through ObservationText.render. src/lang/module-compiler.ts:118 and :201 check the references in objective and other texts. The circus already prints measures in talk (menagerie.kyr:55, Billie: "Feed for {feed(wapshotts)} days … Kept {welfare(wapshotts)} out of four"). Not a general finding; returned so the point is not lost.

**What remains.** Nothing in general code. A readable bill on the ticket wagon (an action or thing whose text prints the measures), or an aim with the figures, is the circus's to write.

**Repair.** No engine change. Add a guide example of a ledger read from a thing ('Read the bill on the ticket wagon'), with its measures in words.

**Verified by.** Circus spec, once merged: reading the bill shows the strongbox, larder and arrears as they stand.

**Related.** OWN-19.

## WPC-X11: Every first country gets the same circus, with the same people under the same names

*Wapshott's Circus (unmerged), critique.md. Gate D, P1; partly answered on main; held by AUT-25.*

**The finding.** Every first country gets the same circus, with the same people under the same names. That includes locals set down in generated towns of any folk, always human (a cobbler Jos Haverhill, a Mrs Pruett). A placed module's people can be drawn by Deem only through JSON templates outside Kyr, so a cast written in Kyr cannot be drawn at all.

**On main.** Branch: data/scenarios/standing.json places the circus in every first country. art.kyr:114 `Person jos "Jos Haverhill" at green_b`, in the imported @b.green of a generated town, and ledger.kyr:161 Mrs Pruett, both `Ancestry human`. critique.md §9: "Every first country gets the same circus, with the same names. A second company, or its people drawn by Deem, would make it a world rather than a set piece." Main: src/world/world-assembler.ts:431-436 gives placed modules the town's folk, its name and the names already taken. data/goings-on/drover/templates.json draws the drover's wife and son by the town's folk, apart from taken names, but only through module.json `generation` JSON. A Kyr `Person id "Name"` (Kyr.ohm:75) takes only a literal, never checked against the town's folk or residents (NAV-04's census remains). A standing module's text is identical in every world, which adds directly to PT-15's cross-country sentence overlap.

**What remains.** No Kyr form draws a module's person, or a variant of its text, by Deem. A standing set piece reads the same in every world, and its locals do not take the town's culture.

**Repair.** AUT-25's `Table` in Kyr, so a local's name and ancestry are drawn from the town's folk (e.g. `Person mrs_pruett called {draw townsfolkName}`) and texts can vary with the world. Prose names the person by `{pruett}`, which already renders the entity's current name. The placement report checks a standing module's people against the town's own for name clashes and folk.

**Verified by.** In two generated worlds of different folk, the circus's town locals (Mrs Pruett, Jos, the Clerk) are drawn by each town's folk and differ. PT-15's overlap measure counts the standing module and stays under its bound.

**Related.** PT-15, NAV-04, OWN-30, ARV-H4, WPC-16.

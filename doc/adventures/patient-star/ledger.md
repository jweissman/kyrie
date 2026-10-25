# The Patient Star: authorability mismatch ledger

Written for: the Kyr builders deciding what to repair next. Every entry was met while writing
[data/adventures/patient-star](../../../data/adventures/patient-star) (Kyr at `main` 1316192) and is reproduced
either by a probe (`test/patient-probes.test.ts`, fixtures under `test/fixtures/patient/`) or a journey
(`test/hold-one-season.test.ts` for the opening, `test/patient-star.test.ts` for all five tiers). Entries 1 to 23
were met writing the opening (*Hold One Season*); 24 to 38 writing the rest of the supermodule. Numbers are stable,
because the module's comments cite them; the table below is ordered by severity.

Severity: **blocking** (the fiction cannot be had), **severe** (it can be had only by a workaround that misleads the
player or corrupts state), **moderate** (it costs bespoke machinery or loses fidelity), **minor** (an annoyance).
Kind: **missing** capability, or **exists but hidden** (it works, and an author cannot find it).

## Summary

| # | Finding | Severity | Kind | Cause | Pinned by |
|---|---|---|---|---|---|
| 1 | A body's pace cannot be changed by a module; slowness is only "laden" | severe | missing | runtime | P1, J2 |
| 2 | A companion cannot leave of their own accord without corrupting the company | severe | missing | runtime | P10 |
| 3 | People cannot walk unless also told `Uses go`; four-step plans; both silent | severe | exists but hidden | semantics, tooling | P6, J3 |
| 4 | Events are spent unseen; in the dark nothing is perceived, speech included | severe | missing | semantics, narration | P9, J1 |
| 5 | A decrease past nothing stops play; no min, max or division | severe | missing | runtime, grammar | P5 |
| 26 | Rules about where the company is are silent while it travels | severe | missing | runtime | S3, S4 (air, dose by the way) |
| 27 | A long move is simulated watch by watch: a fourteen-day walk is 35 seconds for one click | severe | missing | runtime | S3 |
| 6 | A person and the member they become are two entities, and facts do not follow | moderate | missing | type model | J1 (Garret's dose), J12 (Saro) |
| 7 | Two different things' changes worded alike: only the first is offered | moderate | missing | presentation | P4 |
| 8 | A rule cannot assert what is known; inference must be an observation that teaches | moderate | exists but hidden | semantics | P7, J4 |
| 9 | Rules chain across a short action one pass at a time, in file order | moderate | missing | runtime | J1 (Dagny) |
| 10 | The company cannot divide: no companion acts alone, nobody is carried | moderate | missing | architecture | — |
| 11 | A module's own kind cannot say it is worn | moderate | missing | catalog | P2 |
| 12 | A shared law's kinds cannot be sold by the module that uses the law | moderate | missing | grammar | P8 |
| 13 | Items cannot be tried; a kind's description is always shown | moderate | missing | semantics, frontend | J13 |
| 14 | A change made in front of its keeper means nothing unless scripted | moderate | missing | semantics | J14 |
| 15 | Nothing carried can be kept out of sight | moderate | missing | semantics | J1 (knife) |
| 16 | One coin; hire is a one-time price, not a wage | moderate | missing | type model | — |
| 17 | Narration assumes the open air and noun-phrase roles | moderate | missing | narration | J1, browser |
| 24 | `Buys` cannot name a module's own kind (though `Sells` can) | moderate | missing | compiler | stairhead.kyr |
| 25 | An `Item` sees only kinds declared in its own file | moderate | missing | compiler | undersun.kyr, moments.kyr |
| 28 | A campaign has no ending; the module's `Goal` is a planning hint | moderate | exists but hidden | runtime, frontend | S3, S4 |
| 29 | A hazard strikes whichever member the engine picks | moderate | missing | semantics | S2, S4 (slow on Saro) |
| 30 | A description `near` a thing on a passage is never shown | moderate | exists but hidden | semantics | S6 (the bolt) |
| 31 | A scene true only in a window of time is missed by any wait across it | moderate | missing | narration | S5 (the dawn sighting) |
| 32 | An unanchored rule's words reach the company wherever it is | moderate | exists but hidden | narration | S3 (Halu, in the deep past) |
| 33 | Speech is observable only as `addressed`: "speech is laid" cannot hear a word said to a companion | moderate | missing | semantics | undersun.kyr `heard_aloud` |
| 34 | Two campaigns sharing a module's files break each other | moderate | missing | composition | the slice, J7 |
| 18 | A description cannot be anchored at a variable place | minor | missing | grammar | P3 |
| 19 | Every pair of states needs its own `Change` line | minor | missing | grammar | tamaun.kyr mirror |
| 20 | A change cannot say how long it takes | minor | missing | grammar | tamaun.kyr sluice |
| 21 | The calendar's months and era are fixed | minor | missing | runtime | campaign |
| 22 | A campaign cannot fix its protagonist; `commoner` is not playable | minor | missing | frontend, catalog | browser |
| 23 | Lint: local relations are warnings; engine-kept `capacity` is writable; silent hazards | minor | tooling | tooling | `bin/kyrie lint` |
| 35 | Names collide silently or late: states with places, reserved relation names refused with no location | minor | tooling | compiler | `recorded`, `kept_fall`, `way`, `marsh` |
| 36 | The passage kinds fight unusual architecture (a stair up a cliff, a shaft in open sky) | minor | missing | lint | weirs.kyr, corbel.kyr |
| 37 | Every speaker is a body; no one person can be immune to a kind of harm | minor | missing | type model | the Interlocutor, Saro scalded |
| 38 | No counting: a vote is tallied by a rule per seat | minor | missing | grammar | stairhead.kyr Concord |

## The entries

### 1. A body's pace cannot be changed by a module

- **Fictional intention.** The stilling's whole danger: a person with a point of dose goes at half speed, and with
  twelve at a tenth; companions seem to hurry; wolves wait for the slowed (The Land and Its Laws, dose table).
- **Natural expression.** `Rule … when dose(?m) >= 24 { Set pace(?m) to 50. }`, or a query the engine reads:
  `Query slowed(m: member) means dose(m) >= 24.`
- **Actual attempt.** [stilling.kyr](../../../data/adventures/patient-star/stilling.kyr): `Rule slowing … { Set capacity(?m) to 0. }`.
  [src/campaign/action-time.ts](../../../src/campaign/action-time.ts) doubles a walk only when the query `laden` holds.
- **Observed.** Pace doubles (a gate takes two minutes, the four-hour road eight; J2), and the page says *"What you
  carry drags at you: you will go at half your pace until you set something down."* (P1). There is no third pace,
  so "a tenth" became `hobbled` (cannot leave unless led). NPCs, held or not, walk at full pace. Conversation, waits
  and changes are not slowed at all.
- **Workaround.** Zero carrying capacity while dosed, renewed every watch because the engine re-projects capacity;
  Orsino's `slow` condition laid each hour for fights (`slow_laid`).
- **Expressive loss.** The defining sensation of the setting is told by a false sentence, about weight. The 1/10
  regime, the "decision takes an hour" regime, and slowed NPCs are not representable.
- **Likely cause.** Runtime: pace is a special case in TypeScript, not a quantity of the world.
- **Remedy.** A shared measure the engine reads: `Measure pace(group)` (percent, default 100), with the time of every
  timed action multiplied by `100 / pace` of its actor, and `laden` rewritten in `belongings.kyr` as a rule that sets
  it. The narration of laden moves into that rule's `says`.

### 2. A companion cannot leave of their own accord

- **Fictional intention.** Mirel "leaves a party that harms or wakes a held person" (Companions table); Saro's
  "work and the party's purposes part".
- **Natural expression.** `Rule … when state(brick, lifted) and travelsWith(mirel, party) { Retract travelsWith(mirel, party). }`
  and let her `Leaves "…"` words be said.
- **Actual attempt.** `test/fixtures/patient/leaves/site.kyr`.
- **Observed.** Her parting words are spoken and she is placed at the cord, but `memberOf(member_mirel_person, party)`
  still holds: she fights for the company and can be handed things ("Give to Mirel"). Back at the cord the page says
  **"Mirel lies dead."**: her person group is empty and counted as a corpse (P10).
- **Workaround.** None that is safe for a rule. An *action* may `Resolve inter(member)`, the resolver for burying a
  fallen companion, and it removes a living one cleanly: the supermodule uses it for Saro holding the Patient's Heart
  and for whoever gives their moment to bind Ithmar (masonry.kyr). It is the only way a companion leaves, it is for
  good, and nobody who has not read `campaign.ts` would find it.
- **Expressive loss.** Companions with principles cannot act on them; only the player can part with anyone.
- **Likely cause.** Runtime: enlistment moves the body into the company in `CampaignState.enlisted`; retracting the
  relation does not reverse it.
- **Remedy.** Treat a retracted `travelsWith(x, company)` exactly as the player's own send-home: the body returns to
  the person's group at the company's place, then any `at` the rule asserts applies.

### 3. People do not walk unless told `Uses go`

- **Fictional intention.** Dagny's crew go down after Garret on their own clock; Garret, freed, walks home.
- **Natural expression.** `Pursuit go_down for crew … seeks at(crew, ring).`
- **Actual attempt.** `test/fixtures/patient/stand/site.kyr`; in the adventure, six days passed with the crew in the
  yard.
- **Observed.** Nothing moves. A person's actions default to none; a pursuit reaching a place needs `Uses go.`, and
  a place more than four passages off needs `Plans 14 steps.` as well. Lint is silent on both (P6).
- **Workaround.** `Plans 14 steps. Uses go, change_thing.` on every person who travels. With it, the crew walked ten
  passages, through a guarded chain and the Neck, argued at the vault, pulled the cord, and Garret walked home by
  himself (J3).
- **Expressive loss.** None once known; the cost is discovery. The guide's people section mentions neither.
- **Likely cause.** Semantics (empty default action set) and tooling.
- **Remedy.** Give every person `go` by default (it is how anyone gets anywhere), make the horizon at least the length
  of the shortest path to a pursuit's `at` target, and have lint report a pursuit whose target no allowed action can
  reach.

### 4. Events are spent unseen, and the dark hides everything

- **Fictional intention.** Garret comes round in the next room; whoever first sees him hears what he says.
- **Natural expression.** `Event comes_round near garret when not asleep(garret) "…".`
- **Actual attempt.** `test/fixtures/patient/unseen-event`; the first version of `garret_comes_round` in tamaun.kyr.
- **Observed.** An event fires once when its condition holds, whether or not anyone perceives it; walking into the
  room afterwards tells nothing (P9). Separately, when the lantern burned out the page showed nothing of a man waking
  and speaking in the same small vault (J1), and the Neck's dry mark could not be seen (J9).
- **Workaround.** An observation `as event` that `teaches` a fact made for the purpose, with `not knows(party, that)`
  in its condition: the only "once, when seen" latch there is.
- **Expressive loss.** A fact per moment, invented to stop a sentence repeating. The dark makes companions mute.
- **Likely cause.** Semantics (events are world changes, not perceptions); narration (all observations are visual).
- **Remedy.** `Event … when seen` (fires at the first watch it is perceived), and an observation aspect `as sound` that
  is told in the dark.

### 5. A decrease past nothing stops play

- **Fictional intention.** Dose recovers two points an hour and stops at none.
- **Natural expression.** `Rule recovers when dose(?x) > 0 { Decrease dose(?x) by 8. }`
- **Actual attempt.** `test/fixtures/patient/below-zero`.
- **Observed.** At run time: `Invalid quantity for p__dose(party)`; the command fails, naming neither rule nor line
  (P5). This crashed the slice's first descent.
- **Workaround.** Two rules, one decreasing while `>= 8`, one setting to nothing below. There is no `min`, `max` or
  division, so "a quarter of what remains" cannot be said either; held recovery became a second fixed rate.
- **Expressive loss.** Bookkeeping; any decay curve.
- **Likely cause.** Runtime and grammar.
- **Remedy.** `Decrease … by 8` stops at nothing for counts (warn, do not throw); add `min(a, b)`, `max(a, b)` and
  integer `/`; name the rule in run-time errors.

### 6. A person and the member they become are two entities

- **Fictional intention.** Garret, half recovered, joins and is slow; Saro, in or out of the company, does not slow.
- **Natural expression.** Facts about `garret` and `saro`.
- **Actual attempt.** tamaun.kyr `garret_dose_joins`; quell.kyr `Initially Assert unslowed(saro). Initially Assert unslowed(member_saro_person).`
- **Observed.** Joining creates a member `member_<id>_person` with its own body; facts about the person do not reach
  it. Garret walked seven hours at full pace until his dose was copied by hand. The member id is a convention found by
  reading generated facts; it is used, undeclared, in the drover situation.
- **Workaround.** Copy measures across on joining; assert every fact twice; write each law rule twice (members and
  others: four soak rules where one was meant).
- **Expressive loss.** Every property of a person that a module invents needs a mirror rule.
- **Likely cause.** Type model: member and group are different kinds.
- **Remedy.** A shared relation `self(member, group)` and a query form `as(x)` that resolves either to the person, so
  that `dose(as(?x))` and `unslowed(as(?x))` mean one thing.

### 7. Two things' changes worded alike: only the first is offered

- **Fictional intention.** Two voice-plates in one hall, each played with the stylus.
- **Natural expression.** `Change play "Draw a stylus along the plate" …` on each thing.
- **Actual attempt.** `test/fixtures/patient/collide`.
- **Observed.** The second plate offers only "Look closely". `PlayerView.choices` drops any choice whose schema and
  wording repeat one already offered ([player-view.ts:125](../../../src/presentation/player-view.ts#L125)), across
  different targets. Lint says nothing (P4).
- **Workaround.** Different change names did not help; different wording would.
- **Likely cause.** Presentation.
- **Remedy.** Key the repeat by the bound target as well as the wording.

### 8. A rule cannot assert knowledge

- **Fictional intention.** Having heard the Ennick prayer and the granary clerk's line, the company knows they are
  the same.
- **Natural expression.** `Rule … when knows(party, prayer_heard) and knows(party, tally_words) { Assert knows(party, prayer_label). }`
- **Actual attempt.** `test/fixtures/patient/knows-rule`.
- **Observed.** Load fails: *"Rules cannot change canonical projections, clocks, records or discovery knowledge"*,
  with no rule name or line (P7).
- **Workaround.** `Observe prayer_recognised near party when … teaches prayer_label.` It works well (J4) and is told
  as the company putting it together.
- **Expressive loss.** Little once known; the restriction is not in the guide, and the error does not say where.
- **Remedy.** Document "inference is an observation that teaches"; name the rule and line in the error.

### 9. Rules chain across a short action one pass at a time

- **Fictional intention.** Bring Garret into the Mutual's hall; Dagny keeps her word.
- **Actual attempt.** First version: `brought_by` (quell.kyr) → `garret_brought` (tamaun.kyr) → event (quell.kyr).
- **Observed.** A one-minute walk gets a single pass of the rules in file order, so the event fired only after the
  next action. Waiting a moment made it fire.
- **Workaround.** Make the event read the underlying facts directly and assert the derived ones itself.
- **Remedy.** For an action that passes no watch, run rules to a fixed point (bounded), and offer a trace of which
  rule changed what (findings-response #10, still open).

### 10. The company cannot divide

- **Fictional intention.** Saro, whom the light does not slow, walks into the beam and brings Garret out while the
  others wait in the Ring; a carrier carries someone.
- **Observed.** There is no way to send one member anywhere. "Drag Garret out" is a bespoke action of the company
  (tamaun.kyr `drag_out`), and whoever is in the company stands in the beam. An NPC can be led (`following`) but not
  carried.
- **Expressive loss.** Saro's single most useful trait is inert. The Holdfolk's carries cannot be played. At the end
  of the campaign, "Saro holds on while you go" is played by removing her from the company (entry 2), which works only
  because she never comes back.
- **Remedy.** A send-companion action (`send(member, way)`) that detaches a member as a person for a time, and a
  `carry(member, person)` that moves a body with its bearer. Architectural.

### 11. A module's own kind cannot say it is worn

- **Intention.** Umber felt: cloak, hood and mitts, worn.
- **Attempt.** `Kind umber_felt "…" like cloak` (`test/fixtures/patient/worn`).
- **Observed.** Orsino's plain cloak has no slot, so the felt cannot be equipped. `like cloak_of_protection` can, and
  makes every felt cloak magic (AC −1, +1 to saves) (P2).
- **Remedy.** `Kind umber_felt "…" is gear worn on cloak weighing 6.`

### 12. A shared law's kinds cannot be sold by the module using it

- **Intention.** The stilling, as a law shared by every Patient Star module, includes felt; Quell sells it.
- **Observed.** `Sells umber_felt …` redeclares the kind and fails: *"'umber_felt' is already declared by the shared
  rules"* (P8). The law can, however, name a kind the module declares.
- **Workaround.** The kinds moved into the adventure; the law refers to them by name.
- **Remedy.** `Sells` should refer to an existing kind before declaring one.

### 13. Items cannot be tried; descriptions are always shown

- **Intention.** Counterfeit felt looks the same; it is told by its weight or by rubbing it with a wet thumb.
- **Observed.** Tries exist for things, not items. Both cloaks are named alike (faithfully), but the pack shows each
  kind's description at once; to give the test, the true felt's description has to say "leaves a rust mark" and the
  false one "is lighter than it looks". Weight is never shown.
- **Remedy.** Tries on carried items (`Tries weighing, rubbing.`), and a kind's description `until` a fact is known.

### 14. A change in front of its keeper means nothing unless scripted

- **Intention.** Hal Brewin will not have his chain unhooked under his nose.
- **Observed.** "Unhook the chain-gate" was offered and done while Hal sat watching; nothing followed.
- **Workaround.** `Rule chain_rehooked when state(chain_gate, unhooked) and perceives(hal, party) and not tolerates(hal, party) …`.
- **Remedy.** `Change … watched by hal`: refused, or objected to, while the keeper perceives it, as ownership already is.

### 15. Nothing carried can be kept out of sight

- **Intention.** "Keep that knife of yours out of Pike's sight."
- **Observed.** Carrying is all one: an Office man who perceives the company sees the knife. The fine fires on
  arrival at the well (J1).
- **Remedy.** Stowed and borne items, and `perceivesItem(watcher, item)` reading which.

### 16. One coin, and hire is a price

- **Intention.** Crowns, coppers (20 to the crown), felt-lengths (2 crowns); a carrier for 2 coppers a day.
- **Observed.** One good, `gold`. A horn lantern at 6 coppers is a crown; Mirel's hire (`hire(mirel)`) is paid once.
- **Remedy.** Denominations declared by a campaign, rendered by the page; `Wage 2 per day` as a standing debt.

### 17. Narration assumes the open air and noun-phrase roles

- **Observed.** Six hours of tunnel to the Neck read *"You leave the foot of the North Well with the sun low behind you
  and the dew still on the grass."*; the presence line reads *"Garret, a your uncle, is here."* and *"Dagny Ferrow,
  a Master of the Cutters' Mutual"*; a lead offer for a man declared `Pronouns he` reads "Ask them to come with you";
  the journal's note cuts the prayer at its first full stop inside the quotation; a role written as a clause ("selling
  felt cloaks off a barrow") becomes "a selling felt cloaks".
- **Cause.** Narration: travel prose ignores shelter; articles are added to roles and kinship words.
- **Remedy.** Travel prose by the passage's kind and the places' shelter; no article before a kinship word or a role
  that has its own; split notes at sentence ends outside quotations.

### 18. A description cannot be anchored at a variable place

- **Intention.** One line, "grey-gold light lies along {?p}", for whichever gallery the mirror lights.
- **Observed.** `Observe lit_here near ?p when bright(?p) "…"` loads, and is never shown in the lit gallery (P3);
  `near` appears to place the line by where the bound entity *is*, and a place is not anywhere. Each gallery needs its
  own line.
- **Remedy.** `Observe … at ?p when …`.

### 19. Every pair of states needs its own change

- **Observed.** A mirror with three aims needs six `Change` lines (tamaun.kyr).
- **Remedy.** `Change crank "Crank the mirror round to {to}" from any to any.`

### 20. A change cannot say how long it takes

- **Observed.** Every change takes three minutes: winding a man-sized sluice wheel is as quick as untying a cart.
- **Remedy.** `Change … taking 30 minutes.`

### 21. The calendar is fixed

- **Observed.** The months (Thaw, Sowing … Haysel, Harvest … Frost) and "the Years of the Sun and Moon" are
  TypeScript ([calendar.ts](../../../src/presentation/calendar.ts)). They are Imbar's own and nearly match the
  sourcebook, which says Haying and counts from the Unlidding (year 380).
- **Remedy.** Month names and era in the campaign manifest.

### 22. A campaign cannot fix its protagonist

- **Observed.** The title page offers *The fellowship, Delvers, Pilgrims…* for a story about one indebted cutter whose
  uncle is held. `commoner` is still refused ("Choose a name, playable ancestry and class"), so a cutter is a thief.
- **Remedy.** `"party": { "fixed": true }`; a playable commoner.

### 23. Lint

- Every relation an adventure declares is a repository warning ("campaign-local relation"); this slice adds 31.
- A rule may write `capacity`, which the engine maintains; the guide says rules may not write projections, and the
  compiler's list of forbidden names omits it.
- Silent on: a pursuit no allowed action can reach (3), an event that cannot be perceived where it fires (4), two
  choices worded alike (7), an observation anchored at a variable place (18).

### 24. `Buys` cannot name a module's own kind

- **Intention.** Prior Mance buys the Long Hour for six hundred crowns.
- **Attempt.** `Person mance … { Buys long_hour_plates for 600 coin. }`
- **Observed.** *"mance buys long_hour_plates, which is no kind of item"*: `Buys` consults only the shared catalog
  ([world-constructs.ts](../../../src/lang/world-constructs.ts)); `Sells` of a module's kind works.
- **Workaround.** A bespoke `sell_plates` action with `Resolve drop` (stairhead.kyr).
- **Remedy.** Resolve `Buys` against the module's own kinds, as `Sells` does.

### 25. An `Item` sees only kinds declared in its own file

- **Intention.** The Masons trade a trowel; Saro carries one; both are one kind.
- **Observed.** `Item spare_trowel … is trowel_kind` fails with *"names a kind missing from the item catalog"* when the
  kind is in another file of the same module, or in the module's shared law; `Carries trowel_kind`, `Wants`,
  `needing` and rules all see it from anywhere. Kinds had to be moved file to file to follow their items, and the
  spare trowel lives in the law file beside its kind.
- **Remedy.** Collect a module's kinds before its items, across all its files and laws.

### 26. Rules about where the company is are silent while it travels

- **Intention.** The filament is three kilometres of direct light; the Spine is a bridge across airless black; a
  visitor standing on the Tideline begins to set into the present.
- **Natural expression.** The lit-ground law (`at(?c, ?p) and lit(?p)`), the air law (`airOf(?p, air_none)`).
- **Observed.** While a company is between places it is at neither, so every place-keyed rule runs once on arrival,
  not for the length of the walk. Thirty-two hours up the filament dosed nothing; two hours across the Spine cost
  one watch of breath.
- **Workaround.** Each way carries its own cost (`wayDose`, `wayDoseFelted`, `wayAir`) and a latch so it is paid
  once per crossing; nine rules in all.
- **Expressive loss.** Whatever happens *on* a way (a leak across a doorway, wolves along a road, weather on a pass)
  must be restated as a property of the way.
- **Remedy.** While en route, let rules see the company on its way: `on(company, passage)`, or `at` the origin until
  half way and the destination after, and let a passage declare the place it runs through.

### 27. A long move is simulated watch by watch

- **Intention.** The Keeping's geography is chronology: three hundred and fifty years inland is a fortnight's walk,
  and Imbar's clocks run while you walk it.
- **Observed.** One click, *"To the night of the Unlidding"*, took 35 seconds of wall time (2,016 watches: every
  person's planner and every rule, each watch). The thirty-two-hour walk to the Collar's years took 9.6 seconds; the
  ten days to the new moons 16. The whole Keeping journey (S3) runs 137 seconds.
- **Expressive loss.** A browser page frozen for half a minute on one choice; an author is pushed to shrink the
  Keeping until it no longer feels like walking through time.
- **Remedy.** Advance time to the next moment anything can change (a rule's condition, a person's plan, a scheduled
  hour) instead of every watch; or settle a walk outside the world in one step when nothing en route can happen.

### 28. A campaign has no ending

- **Intention.** Five ways it can end (The Keeping and the Masonry, How it can end), and the Corbel's docking.
- **Observed.** The campaign's outcome stays `active` whatever holds ([campaign.ts](../../../src/campaign/campaign.ts)
  `updateOutcome`); the module's `Goal` feeds the planner and nothing else. Binding Ithmar with Tamsin as binder
  removed the protagonist and play went on as Saro.
- **Workaround.** Each ending is an observation that teaches a fact `ending_told`, so it is told once.
- **Remedy.** `Ending rebound when rebound(corbel_site) "…".`: told, recorded in the chronicle, and offered as a
  close (with "go on" for a persistent world).

### 29. A hazard strikes whichever member the engine picks

- **Intention.** The member who is slowed fights slow.
- **Observed.** `Assert strikes(stilled, party)` lays `slow` on a member of the engine's choosing: in S2 and S4 it
  fell on Saro, whom the light cannot slow, and alternated between her and Tamsin hour by hour.
- **Remedy.** `strikes(hazard, member)` for a named member.

### 30. A description `near` a thing on a passage is never shown

- **Intention.** Look closely at the holder's door bolt and see that it is a sluice pin.
- **Observed.** `Observe bolt_looked near bolt when tried(bolt, looking)` is never told: the bolt is on a passage, not
  at a place. *"You look closely at the bolt on the holder's door. Nothing comes of it."* `beside holders_door`
  works. Lint is silent.
- **Remedy.** Let `near` a thing on a passage mean beside the passage, or report the anchor that can never show.

### 31. A scene true only in a window of time is missed by any wait across it

- **Intention.** At dawn from the Collar, a long dark shape in the cloud for a few minutes.
- **Observed.** `Observe corbel_dawn at collar_top when hour(clock) == 5` was never seen: "Wait until first light"
  ends at 6:01, and observations are read only when a command ends.
- **Workaround.** Widen the window past the moment the wait ends.
- **Remedy.** Tell scenes that held during a wait (as events are), or let a wait stop at a watched condition.

### 32. An unanchored rule's words reach the company wherever it is

- **Observed.** *"Word goes round the Tovash camps: a dead woman of the old people climbed out of one of the wells"*
  was told to a company sixteen hundred years deep in the Keeping. `Rule … at place` exists and was not used; nothing
  warns that a rule with `says` and no anchor is heard everywhere.
- **Remedy.** Lint a `says` without an anchor; or default it to the places the rule's condition names.

### 33. Speech is observable only as `addressed`

- **Intention.** Speech is laid: every word said aloud in course-work is taken, and the Laid near it wake; the
  Interlocutor speaks with what you said on the way up.
- **Observed.** The only trace of speaking is `addressed(person, company)` from the shared `talk_to`. Asking Saro
  something on the way (a travelling topic) leaves no fact. The Riot Hall wakes when the company talks to someone
  there or speaks a door's syllable; the Interlocutor counts conversations, not words.
- **Remedy.** A fact for each spoken act (`spoke(company, place)`), set by topics, talk and spoken changes alike.

### 34. Two campaigns sharing a module's files break each other

- **Observed.** *Hold One Season* loaded three of the module's files. When the supermodule's Saro gained
  `Carries trowel_kind` (a kind in a file the slice did not load), the slice failed at run time with *"Unknown item
  definition trowel_kind"*; lint had passed it. A law that names one campaign's places cannot serve the other.
- **Workaround.** The slice became the opening of the full module.
- **Remedy.** Lint every campaign that includes a changed file; let a manifest say which files depend on which.

### 35. Names collide silently or late

- A state named `kept_fall` collided with a place of that name (*"Duplicate entity kept_fall"*): states, places and
  things share one namespace.
- A relation named `recorded` was accepted by the compiler and refused at assembly: *"Creature projections and campaign
  clock/pressure records are read-only"*, with no name or line.
- `way` (a parameter of the shared `go`) and `marsh` (a terrain) are taken; both errors say so clearly.
- An entity `way_door` was a "Duplicate entity" with no second declaration named.
- **Remedy.** Publish the reserved names; give every load error the declaration it is about.

### 36. The passage kinds fight unusual architecture

- **Observed.** Lint warns that a stair, ladder or shaft "does not change level", and a path "ends indoors". A stair
  cut up a cliff face, a ladder to a platform on poles, the filament and the Thick (shafts through open sky), a
  helical stair in a shaft, all had to become paths or passages, or the shaft split into levels by depth.
- **Remedy.** Let `outdoors` areas have heights, or let a passage say `up`/`down` without levels.

### 37. Every speaker is a body; no one is immune to anything

- The Interlocutor has no body, and must be a person (a human commoner, attackable); without `Greets` it opened
  with a tavern line, *"'Lost?' says the Interlocutor. 'People usually are, when they come over to me.'"*
- Saro's bones are stillglass and heat does not trouble her; the Steam Stair scalded her (S1). A person cannot be
  declared immune to a kind of harm without a species of her own.
- **Remedy.** `Person … Voice only.` for speakers without bodies; `Immune fire.` on a person.

### 38. No counting

- **Observed.** The Concord's vote is tallied by a rule that adds one per seat per motion and marks it counted;
  a majority is a comparison on the tally.
- **Remedy.** `count(?s: favours(?s, m) and at(?s, chapter))`.

## What worked as an author would hope

These are not findings, but they matter to the assessment.

- **Conditional ways.** `opening when flood(flood_water) < 60 "Ten paces in, the Outfall's roof meets black water…"`:
  the Outfall is shut until the flood falls in Harvest, and the page says why (J6).
- **A mechanism over several places.** The mirror's aim is a state; `aims(to_north, road_north)` puts conditions in
  facts; `Query bright(p) means state(mirror, ?s) and aims(?s, p)` lights one gallery and darkens two; gardens grow
  and brown by the watch; the Bunks crew grumble (J8). Seven lines of logic.
- **The world acting alone.** With `Uses go`, the crew go down on day four, argue, wait for poles, free Garret on
  day seven; Ness takes the jars; Garret walks home; Dagny does not forgive the debt (J3).
- **Guards, keys and bribes.** Hal guards the stair, holds the chain's key, can be bribed, sleeps after midnight.
- **Knowledge-gated testimony.** Ilis says what she never told Bren only to someone who has seen the jars (J5).
- **Local kinds and creatures.** Felt, false felt, stylus, honey, horn lantern, jars; umber wolves and Outfall eels.
- **Ordinary life.** Grit can be made much of; Garret joins as the protagonist's uncle, in his own words, unpaid.
- **Orsino conditions outside a fight** (`slow`, laid for an hour and lasting by the clock).
- **Declaration errors** give file and line; `bin/kyrie preview` relints and rebuilds in under a second.
- **A law of the world's own.** "Touch gives time" is one action and one rule in a law file (`moments.kyr`); every
  kept thing in the Undersun, the Corbel, the Keeping and the Masonry is a thing marked `kept` with a rule for what
  its moment does. The ash that drifts along the safe line, the fourth Dane saying his own name, Selane arguing a
  sentence at a touch, the shock-front throwing you ten metres, the Patient falling for as long as you hold on.
- **Knowledge as keys.** `after learning` on a change opened the Way's four gates with facts gathered in five
  places; `hidden until` mapped the Undersun from the transcripts found above it; `opening when carries(party,
  ithmar)` let the jewel's wearer step out of the Keeping anywhere.
- **A vote.** Seats, stances, red lines and evidence that moves them are ordinary facts and actions.

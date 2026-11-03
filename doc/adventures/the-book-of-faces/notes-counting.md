# Counting Row and the Fit: notes of author A3

*Files: `data/adventures/book-of-faces/counting.kyr` (prefix `ct_`), `mage.kyr` (prefix `mg_`); tests
`test/ombra-counting.test.ts`, `test/ombra-mage.test.ts`. Persons owned: `lacke`, `fenn`, `assessor`, `thole`, and
`ct_cob`, `ct_marl`, `ct_tally`, `ct_hawker`.*

## The threads

**The Short Pound (Round 5, `r_pound`).** The Drip's market weighs by a copy of the Pound that is an ounce light; the
grain-brokers weigh the millers' flour in against it and pay for fifteen ounces what they sell at sixteen; the Drip's
bakers, who bake by the same copy, have been glad of the ounce since flour doubled. The Assessor of the Pound
(Hanne Orrow, a baker's widow, honest and unnoticed) weighs the Drip's loaves in her hand on Thursdays and says nothing:
the Hall acts only on a Complaint from a *mask*, naming a market and never a man. Cob Hallard, the beam-keeper, believes
in his father's pound. *Finding out:* weigh the Drip's loaf on the Honest Beam (shows the loaf, not the cause); borrow
the market's pound on a lie, or lift it in the dark, and set it against the Standard (lore); or carry the Assessor's own
loaf to the market's beam, which finds a pound and an ounce in it (no skill: a thing carried to the right beam; she
asks for it in her night kitchen). *Ending it, five ways with different prices:* (1) a Complaint at the Hall, in a mask
(proof on the rail: no roll; on a loaf: persuasion, hard; warmed by her kitchen or a Cockle's trade: fair); the face
worn is thanked (`goodwill` +1) and Cob is "told he has been mistaken" (`ct_cob_shamed`); (2) tell Cob to his face
(persuasion): he walks the pound to the Hall with his domino in his hand (`ct_cob_owned`); (3) the quiet swap: the Hall's
Second Pound lifted from its case at night (lockwork, stealth) and hung on the hook (stealth): costs a day-three heat
unless the Assessor is told (`ct_assessor_told`), who then "has not noticed anything"; (4) squeeze Ambrose Tebbit the
broker by name (intimidation: pays 25 coin, resentful: heat on day 6) or bluff him (deception: pays nothing, nothing is
said, nothing is forgiven); the 25 coin can be laid on the Rain-Wives' board (`ct_give_fund`, masked: goodwill +2;
bare: `ct_rain_thanks`, and the loaf stays a penny); (5) let it ride (the Rain-Wives' chalk slate on day 4, the shrug on
day 7). *The second face of the act:* the true pound makes bread a farthing dearer (`ct_loaf_dear`, which the Drip may
read); the Drip likes the cheating, and exposing it is a hurt to the poor that only the broker's money can mend.
*Done* (`roundDone(party, r_pound)`) the moment the true pound is on the hook, however.

**The Lock-tax (Round 6, `r_lacke`).** Ser Corvin Lacke, the Key, has rounded every lock's quarter-penny up to a half
for nineteen years, calls it custom, and winds forty clocks every night because the city has no common hour. Naomi Fenn,
his clerk, copies the true sums into her mother's ginger-cake book and signs the false ones; if it comes out she is the
signing hand, and to say it she must say a *person*. *Fenn* (substantial; checks: insight at noon on her sleeve, insight
for the reckoning, intimidation; branches that do not rejoin): by day, when the Warden walks the Exchange floor at noon, a
clerk alone at her desk lets slip "not at noon"; she is moved by **a way to say it that is not a name** (the tallyman in
the Tally Coffee-house *shows* the form: "a sum has no face"; the company offers it by night in her room), or by an hour
of sitting with her, saying nothing (no skill: she gives the testimony, `lacke_taxed`, and Fenn's small strongroom
key, but not the book), or is frightened into it by the Warrant (she gives the book and leaves Ombra; a failure sends her
to her sister's for two days). *The ledger* in the strongroom (lore; the lock by pick or Fenn's key; by day the Warden is
at his desk and finding the company there is heat +2; at noon he is not) teaches `lacke_taxed` too; he burns it at noon
on day 6 if nobody has come (`ct_lacke_burned`). *Lacke* (substantial; two registers: by day the Key, exact and clean in
sentence, and a bare company gets the cold thing; at night, in a nightcap among his clocks, a bare knock is received and
a masked one is a burglar): insight (what the clocks are for: he counts to the morning after the Drawing, when nobody
will rise for him again), lore (the maker of the long-case clock: warms him), performance (the story of the Assessor
asked in which Sleeve: he laughs, and then does not), intimidation, persuasion; and a route with no charisma at all,
a travelling clock that gains eleven minutes a day, bought from a hawker on the Exchange floor for six coin:
*a thing that is wrong the same amount every day is honest*. `ct_lacke_end(lacke)` is **1** named (the generic
`name_aloud`, or the Hearing asserting `named(lacke)`), **2** laughed out (`bd_lacke_laughed(party)`, the bard's
Lampoon), **3** fled (intimidated), **4** resigned quietly (persuaded, or the clock), **5** sold the Key
(`holdsFace(party, face_key)`: worn it opens the strongroom and costs heat, and no one in Ombra thinks the mask is
his to give). Any of them is `roundDone(party, r_lacke)`. Left alone he is still the Key on the ninth night.

**The Fit (mage.kyr).** Research of Likeness in four stages; see the section below.

## The Fit: what a level-1 mage can actually learn (measured in play)

* `care.kyr`'s `learn_reward` (`Kind reward`, `offeredAt`, `giftEffect`, `rewardFor`) **cannot be used**: its lesson must
  be an *ability* whose effects are only `learn` or `gain`, and no ability in the catalog has one; a module's own
  `Hazard … "Teach x to ally."` is not an `ability` entity, so `giftEffect(gift, hazard)` is refused as an invalid argument.
* The `Hazard "Teach x to ally."` through `Assert strikes(hazard, party)` (the Parliament of Books' way) **works**, but the
  hazard lands on a member chosen by the seeded stream, so in a company of several it may teach the warrior. Not used.
* **What is used:** `Assert teaches(thole, lesson)` and the shared `train_member` action of `belongings.kyr`
  (`Resolve train`): a mentor who teaches, a student the engine says `canTrain` (an arcane caster, twenty experience, the
  spell unknown), an hour, and a fee (`lessonFee(thole)` = 3 coin). Only a mage can be taught; and Thole's three leads each
  teach three spells so that a mage of any school is offered at least one that is new.
* **What a level-1 mage can prepare:** a first-level spell learned this way appears in `prepare spells` at once. A
  second-level spell (`mirror_image`, `mind_blank`, `augury`) is learned (`You learn mirror_image`) and then is **never
  offered for preparation**, because slots follow ⌈level/2⌉ and the module's experience is 1000 (level 2 needs 1000, level 3
  3000): the lesson waits in the book for a company that is third-level. `true_sight` and `second_sight` (the brief's Form
  spell) are `unsupported` (their statuses cannot run) and are refused at load. So: **Form** teaches `magic_missile`,
  `acid_arrow` and `augury`; **Measure** `armor`, `blur`, `mirror_image`; **Cost** `hex`, `charm`, `mind_blank`.
* A book raises Intelligence by one (`Resolve endow`): Thole's marginal treatise, given to any company that changes his
  mind, which also grants `lore` to whoever carries it, mage or not.
* The Hand: `mg_taught` (a lesson was paid for, which is how the module knows a mage was taught: Thole's purse rose by
  the fee) readies `hand_likeness`; on the ninth night at `urn_hall` one of `mg_cast_form` / `_measure` / `_cost`
  asserts `handPlayed(party, hand_likeness)` and the relation drawing.kyr should read: `mg_urn_shown`, `mg_fit_false`,
  `mg_burden_shared` (with `mg_unremembered`: the caster's face is spent, and `masked(actor)` is retracted).

## Ids other files may read

`ct_lacke_end(lacke)` (measure, 0–5 above); `ct_lacke_burned`, `ct_lacke_gone`, `ct_lacke_warm`, `ct_lacke_cracked`
(relations on `lacke`); `ct_pound_true(party)`, `ct_pound_exposed`, `ct_pound_swapped`, `ct_loaf_dear(bread_market)`,
`ct_cob_owned`, `ct_cob_shamed`, `ct_marl_paid`, `ct_fund_given`, `ct_rain_thanks` (relations); `ct_fenn_yields`,
`ct_fenn_cowed`, `ct_fenn_gave` (on `fenn`); items `ct_true_book` (Fenn's true ledger; a Hearing may want it),
`ct_strong_key`, `ct_market_pound`, `ct_second_pound`; discoveries `ct_lacke_face`, `ct_widow_story`, `ct_fenn_face`,
`ct_cob_face`, `ct_marl_face`, `ct_reckoning`, `ct_pound_short`, `ct_ledger_false`, `mg_theory`, `mg_form`,
`mg_measure`, `mg_cost`, `mg_held_by_whom`; mage: `mg_taught`, `mg_led_form/_measure/_cost`, `mg_urn_shown`,
`mg_fit_false`, `mg_burden_shared`, `mg_unremembered`. Persons I added beyond the table: `ct_cob`, `ct_marl`
(named **Ambrose Tebbit**: *Marl* clashed with a person in another adventure), `ct_tally`, `ct_hawker`. Rooms: `ct_locks_parlour`,
`ct_assessor_kitchen`, `ct_fenn_room` (each open by night only, and a company already inside is not shut in).
I read, and the stubs must provide: `pavane`, `dov`, `mk_face_drowned`, `mk_dov_trusts(group)`, `bd_lacke_laughed(group)`,
`castTaken` is *not* read (the Wall's door is the maskers author's own), `moll`, `rain_hall_floor`, `bread_market`.

## Friction

1. **`learn_reward` is unusable** (above). *Did:* `teaches` + `train_member`. *Would remove the need:* let `giftEffect`
   name any catalog spell, or a module declare a `Lesson` that is an ability, or lint "a giftEffect with no learn effect".
2. **`strikes(hazard, group)` is aimed at a random member.** *Remedy:* `strikes(hazard, member)`, or a `Teach` that names its
   recipient.
3. **A caster cannot be asked for in a `Requires`**: there is no `calling(member, class)` and no `knowsSpell(member, spell)`. *Did:* `canTrain`
   as the detector of a mage, and a lesson fee that raises the mentor's purse as the signal that one was taught.
   *Remedy:* `learned(member, ability)` and `calling(member, class)` as projected relations.
4. **Unsupported abilities are invisible**: `true_sight` fails at load with "Invalid argument" and as a hazard with "Unknown taught
   ability". The catalog lists them as spells; a lint note "unsupported, cannot be taught" at the module would have saved an
   hour.
5. **`opening when` is symmetric.** A company that is in a room whose door shuts by day (the Assessor's kitchen, at 8:30) is
   shut in with no way out. *Did:* `opening when privateHours() or at(party, room)`. *Remedy:* a clause `from <place>` (the
   Grand Tour's friction 8 again).
6. **One `Greets` per person**, though the grammar accepts `Greets … when`: two give "Duplicate entity lacke_greeting". A person
   met bare by day, masked by day, and bare by night wants three first words. *Did:* a register-neutral Greets and
   register-specific topics (the cold thing: `Say something to the Key` when `ctBare`).
7. **`Known as` holds at night too** unless gated `publicHours() and …`; and "who is under the mask" is learned at the table
   (an `Observe … teaches` in the room), because a Person's face has no other way to be seen.
8. **The lint's `names` check makes a surname one adventure's own** (`Fenn` is also Odile Fenn of Low Water, `Hobb` Tansy
   Hobb of the Liberty of the Ice, `Marl` an Edith Marl of Quiet in the Sky). I renamed my broker (Tebbit). `fenn` is the
   brief's own name: **the integrator must choose** (rename Low Water's, or mine).
9. **The prose lint refuses the word "engine"** ("explains the implementation"): the Fitting-engine is the Fitting-frame.
10. **A failed check leaves no trace.** To make a failure cost something I set a relation that a rule clears at eight in the
    morning (`ct_lacke_stiff`, `ct_fenn_stiff`, `ct_fenn_wary`); a general "cannot try again till the morning" on a check would
    have been one line.
11. **Tests with latching failures** need a loop over nights (`copies`, `costFromLacke` in the tests): a journey step that
    retries "tomorrow" would help.
12. **`Thing on a passage`** tells its state in the rooms at both ends ("The strongroom's small door is locked…" in the
    office); fine here, but see the Grand Tour's 8.

## Thin, unfinished, and what does not work

* The Row's people other than the four principals are small: Cob, Tebbit, the tallyman and the hawker each have a topic or
  two and an action; the Assessor's conversation is shorter than Fenn's. There is no companion; no one *joins*.
* **Cross-file dependencies**: the Form source at the Wall of Faces is only *at* `cast_cellar` (whatever gate the maskers'
  file puts on the cellar door is theirs); the Cost source by Dov wants `mk_dov_trusts` or `holdsFace(mk_face_drowned)`; if
  those are not as stubbed, the Row's own Cost source (the Warden at night, once warmed) and the Collegium's own Form source
  (the plaster Masters, insight, hard) stand in and give the same journal lines. Measure, Thole and the lead are wholly mine.
* **drawing.kyr must read** `handPlayed(party, hand_likeness)`, `mg_urn_shown`, `mg_fit_false`, `mg_burden_shared`; **the
  Hearing must read** `ct_lacke_end(lacke)` or `named(lacke)`; **the Drip** may read `ct_loaf_dear(bread_market)`; nothing is
  yet read by anyone but my own fates.
* The mage's casts are consequences of relations only: Form, Measure and Cost do their work in drawing.kyr, not here. The
  Cost cast costs the caster's face (the company ends the book bare) but no other mechanic.
* The strongroom ledger and Fenn's book are not Items a Hearing can be handed: `knows(party, lacke_taxed)` is the proof the
  spine counts. `ct_true_book` is carried for any reader who wants it.
* Thole is answered by a bare company by day in his workroom (the Collegium hangs its masks on pegs by the door); every
  other person in the Row says one cold thing. This is an authored exception, and the only one: the hawker, a tradesman,
  sells to anyone.
* The two sources that need a second face (`mk_`) were not run against the real maskers file.

## Lint and tests

`bin/kyrie lint` on the scratch campaign with stubs for the foreign persons: 0 errors in my files; the only `names` errors are
the shared-surname ones above (`Fenn`, `Hobb`). Tests were run against the stubbed campaign
(`OMBRA_CAMPAIGN=data/campaigns/zz.campaign.json`); against the real campaign they cannot pass until the maskers, bard and
integrator files exist, since my files read their persons and relations.

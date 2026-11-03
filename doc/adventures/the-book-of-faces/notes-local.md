# The Book of Faces: notes on `local.kyr` (author A10, prefix `lc_`)

*Four small stories that belong to nobody's plot: the Heron and the Lamp (Round 2), Hester Lyle's Book of Hands, the
umbrella war, and Barnaby Sweet's wager. Comic by procedure, each with a clock, each with a way a company with no charm
and no learning can end it.*

## A name that had to change

`kyrie lint` refuses two adventures that share a surname (`src/cli/adventure-names.ts`), and the legacy adventures
already had an **Ostler** (Ham, wrayford), a **Penhallow** (Piran, skeel), a **Lamb** (Gideon, hollins) and a **Fenn**
(Odile, low-water). The brief's names therefore fail the repository lint. I kept every id and renamed the people:

| id | brief | in the book |
|---|---|---|
| `ostler` | Maud Ostler | Maud **Orrell**, "an Ostler by her shop" |
| `penhallow` | Silas Penhallow | Silas **Haskew**, "a Penhallow by his shop" |
| `lamb` | Hester Lamb | Hester **Lyle** |
| `lc_wyn`, `lc_tam`, `lc_ned`, `lc_kit` | Wyn Ostler, Tam Penhallow, hired cousins | Wyn Orrell, Tam Haskew, Ned Orrell, Kit Haskew |

The spine's shops are `Ostler's` and `Penhallow's` and stay so: on the Row a person is called by the shop that fed
them, and the register's surname is another matter (said once, in a comment and in the dead-pan of the Row). **`fenn`
(counting.kyr) still clashes with low-water's Registrar Fenn; the integrator must rename one.** The `names` check is
global, so it is the first finding on the merged module.

## Threads

### 1. The Heron and the Lamp (Round 2, `r_lovers`)

Cosimo Dray, third clerk of the Weights (the Heron), and Rill Ketch, who rows the Row ferry (the Gull), have written to
one another for eleven years through Hester Lyle's two baskets, never meeting, and every morning quarrel at the Drip
landing (and every evening at the Row quay) about whether an open umbrella is a passenger (the Ferrymen's Twelfth:
it is). He thinks the Lamp a woman of leisure who keeps herons; she thinks the Heron's sentences are Lyle's.

*Registers.* Bare by day: one cold line each (Cosimo is "entering a figure"; Rill takes the coin without looking
at the face, which is the kindest thing anyone does you). Masked: a Heron is a colleague (he grumbles about "the
Gull"), a Gull is a colleague (she grumbles about "the Heron"), anyone else is a customer. By night, bare, at his room
over Penhallow's (`lc_dray_room`) or wherever Rill is: the letters, the tin box, the lantern, and what each is afraid of.

*Approaches, and what each costs.*

| Approach | Needs | Leaves |
|---|---|---|
| Sit with Cosimo an hour and say nothing (`lc_cos_wait`) | nothing | courage +1, and a man who will say what the Lamp is |
| Read his hands (`lc_cos_read`, insight) | insight | the same, faster |
| Say the Swap might be a form he could bear (`lc_cos_form`) | his fear known, the Usage known | willing, courage +1 |
| Ask him hard (`lc_cos_ask_hard`, persuasion) | persuasion | the same, for one who did not sit |
| Help him answer her last question (`lc_cos_help`, performance) | performance | courage +1 |
| Forge her answer (`lc_cos_forge`, deception) | deception | courage +2, willing; but a forgery: the meeting is hollow until it is confessed (`lc_cos_confess`) |
| Tell Rill that she may send you away (`lc_rill_leave`) then sit in her stern an hour (`lc_rill_sit`) | nothing | thaw +2, and a woman who talks |
| Read how she holds the pencil (`lc_rill_read`, insight) | insight | thaw (open) |
| Tell her the sentences were hers (`lc_rill_author`, persuasion, hard) | her fear known | thaw +2: the mind that is moved by being read as a writer, not by proof |
| Remind her what a Pair is (`lc_rill_custom`, lore) | the Usage | thaw +1 |
| Hester Lyle: sit with her; ask about the baskets and the Swap | nothing | blessing +1, the Usage, the pair identified |
| **Tell either of them who the other is** (Unfacing) | the pair known | heat +1; they are *estranged*; Lyle forbids it |
| Leave them | | the letters go on, unmet (the Swap passes at 22:00, `lc_swap_default`) |

Every number sums into `lcThaw + lcCourage + lcBlessing`: 4 is "fine", 6 is "warm", and a forgery not confessed, or a
telling, sours any of it.

*The Swap* (day 5, from the Ninth Bell; `swapNight()`). The Concord's Usage says: each citizen puts on a plain tallow
spare and exchanges it with the first stranger who asks; the two are a **Pair**; they cross the Cuff in one boat, **nine
strokes, a sentence of their own for each**; a **Witness** (anyone, and best a Bare, who has no side) holds the lantern
and may at the ninth stroke hold it up or lower it; and the Pair may lift each other's masks. A ferrywoman's Pair is
whoever steps into her boat first and asks for her spare. Cosimo, who will do anything if it is the form, is early.
The company is the Witness: `lc_pair_them` at the landing, the passage to `lc_cuff` (the middle of the Cuff, a room for
one night), `lc_cuff_cast_off`, `lc_cuff_steady` (wayfinding), `lc_cuff_read` (insight; the boat's observations then say
what they would rather), `lc_cuff_middle`, and the choice: **`lc_lower_lantern`** (the dark: a Pair that is ready is
found by its laugh, one that is not goes home unrevealed; kind) or **`lc_raise_lantern`** (the light: a Pair that is warm
sees two faces it knows and laughs; one that is merely fine agrees to go on as before; one that is not quarrels). Both
are `Grave`. Outcomes: `loversTogether` (by laugh, or by light), `lcCivil` ("apart but writing"), `lcMetDark` (met,
unrevealed), `lcEstranged`. `roundDone(party, r_lovers)` on any meeting. The morning after, on the ferry: one umbrella,
two persons, one fare; or the quarrel with a new care in it; or an umbrella furled.

### 2. Hester Lyle and the Book of Hands (the Letter-Writer's Dilemma)

On the fourth morning a man of the Warden's (`lc_keyman`, in the key-grey) comes to the arcade with a writ: the
**Inspection of Hands** (Art. 33): the Book of Hands (her sailcloth ledger of four hundred clients, `lc_hands`) is
to be in the Warden's house by the Ninth Bell of the sixth day, to find whoever wrote to the Chapel about the Lock-tax.
*Default:* `lc_book_surrenders`: she gives it up, her board is turned to the wall, her letters stop (`lcLettersStopped`).
She is opened by an hour in her booth (no check), by reading her two hands (insight), or by the favour of any of the
ways below. Five ways, each leaving her a different woman:

| Way | Check | Cost | Leaves |
|---|---|---|---|
| Warn the clients, by night, door to door (`lc_warn_clients`) | wayfinding; one failure leaves half | heat +1 | the book goes thin as a prayer-book |
| A second book of dull names (`lc_forge_decoy` lore; `lc_pass_decoy` deception) | lore, deception | failure: heat +1 and the real book at the Ninth Bell that evening | the Warden's man has a book of landladies and hats |
| The index, not the book (`lc_ask_lamb_index` persuasion) | persuasion | four hundred doors are knocked at | no secret betrayed; names in the Warden's pocket |
| The Warrant keeps it, sealed and unread (`lc_vail_ledger`, `lc_seal_book`) | none | heat +1; a **Promise** (`lc_unread`) | the Hearing's custody; or the book is read (`lc_read_hands`, `Grave`): the promise is broken, Lyle's trust gone, and the company has the Lamp, the Heron and the clerk N. F. by name |
| She burns it (`lc_burn_book`, `Grave`) | none | four hundred clients' pending letters; the Warden's man is told why | she keeps them by heart: a worse place, and a safer |

### 3. The Umbrella War

Ostler's and Penhallow's, eleven paces apart, each with **THE FIRST** in a glass case; forty years; hired cousins
(a Usage lets a cousin quarrel where a person may not, a cousin being nobody's person) will settle it with ferrules at
five on the Deepening (day 3). Both Firsts were made by Margery Ostler, who married a Penhallow.
*Default:* at five the duel (`lc_duel_unseen`: two wounded cousins, no death; or `lc_duel_screen` if the company is on
the Row, in which case a cousin dies at six unless stopped or bound: **a cousin dies only in front of someone who could
have helped**). At two, the Row's own Trial of Umbrellas could be called before a judge who sits **bare**; nobody has
for forty years, since old Corder died. A Bare is the one person the Row has to answer.

| Way | Check | Result |
|---|---|---|
| Take the stool; order the Firsts down, each pitched by the other (Usage 6); give the verdict: both lost, each shelters the other (Usage 3) | persuasion, performance | **merged** (a door through the wall, `lcMerged`); they leak at one rib: the same hand. The minds are changed by being made to hold each other's relic in the rain, not by evidence |
| The same, with no charm: seize the Firsts; read the Usages aloud, all nine | none (and two hours) | merged |
| Rig the Trial for one shop (`lc_rig_for_*`) | stealth, hard | a **patent** for one (`lcPatentO`/`lcPatentP`); failed: a **riot** and the duel, uncapped |
| Ask each, one at a time, to be first to send the cousin home | persuasion, hard | the war is cold, nobody duels (`lcQuiet`) |
| The children: Wyn and Tam, two Cockles at the eel-pond who each took the other for some Cockle of the far end. A bare/masked company asks them to unmask together at the Ninth Bell (`lc_unmask_children`); then each parent is asked what the Row will be in thirty years (`lc_bless_*`, insight) | persuasion, insight | a **wedding** (`lcWedded`) |
| Step between the cousins; or bind the wounds | brawn; mending | `lcQuiet`; or the cousin lives and the Row is truce-bound (`lcTruce`) |
| Do nothing | | the duel and the stalemate; no shop sells to anyone who has been across the way |

Umbrellas are sold after (`lc_buy_ost`, `lc_buy_pen`, and `lc_buy_founders`, nine coin, only after a merger).

### 4. Barnaby Sweet's Wager

A tallyman in the Magpie who owes the Coffee-house twelve coin staked his face against Old Gudge's champion eel at the
Deepening race (day 3, 19:00). *Default:* he loses (`lc_race_gudge`): a bare man under the eaves of the shed.
*Before:* the Bare's Objection under the Pond's Ninth Usage (`lc_object_stake`, lore), a word to Sweet masked
(`lc_warn_sweet`), a jammed grating (`lc_jam_grating`, trapwork) or a swapped eel (`lc_swap_eels`, stealth); a failed
rig and Gudge will not deal with you. *After:* a rematch at the next ninth hour, twelve coin matched (`lc_ask_rematch`;
rigged it returns twenty-four); the face's price, the weight of the champion in coin (sixteen: `lc_redeem_by_weight`); an
**evening with Gudge** in the shed among thirty-one faces (`lc_gudge_night`, no check) after which he gives it back
(`lc_gudge_returns`), or an argument (`lc_gudge_returns_hard`, persuasion, hard); a new face with three signatures,
Gudge's, a Crow's (hers is for the hand, not the face) and Moll's, eight coin (`lc_sig_*`, `lc_buy_new_magpie`); the
Warrant, tallying bare in his stead (`lc_tally_for_sweet`, heat +1); or work done bare: nobody answers a Bare, and
nothing in the Concord says nobody answers a *sum*: a **slate** outside the Coffee-house (`lc_sweet_need`,
`lc_chalk_slate`). He is cheered; he gives a tip (`lc_survey_tip`: the Heronry's surveyors lodge at the Coffee-house on
the seventh night; **nothing in the module reads it yet**).

## What other files may read

Relations on `party` (all `group`): `lcOutcome lcCivil lcMetDark lcEstranged lcByLaugh lcTold lcForged lcConfessed
lcPaired lcSwapPassed`; `lcSurrendered lcBurned lcSealed lcRead lcWarned lcWarnedHalf lcDecoyPassed lcDecoyCaught lcIndexGiven
lcLedgerSafe lcLettersStopped lcDemand`; `lcMerged lcWedded lcPatentO lcPatentP lcQuiet lcTruce lcDuelled lcFuneral lcDuelling
lcBound`; `lcSweetBack lcSweetNew lcSweetSlate lcSweetTallied lcSweetLost lcSweetSaved lcGudgeBeaten lcGudgeKept`. Measures
`lcCourage lcThaw lcBlessing`. Queries `lcWarOver() lcResolved() lcSweetBareNow() lcRowQuiet() lcPrep() lcPrepHigh()`.
Discoveries `lc_pair_known lc_pair_rule lc_heron_writes lc_lamp_writes lc_ferry_quarrel lc_demand_known lc_custody_known
lc_ledger_nf lc_usages lc_war_known lc_same_hand lc_margery lc_sweet_wager lc_pond_usage lc_survey_tip`. Persons `lc_wyn lc_tam
lc_ned lc_kit lc_gudge lc_keyman`; rooms `lc_booth lc_dray_room lc_cuff`; items `lc_hands lc_umb_o lc_umb_p lc_umb_f
lc_umb_w lc_magpie_old lc_magpie_new`; milestones `lc_ms_*`; fates `lc_fate_*` (`newsHour()`).
The Book of Hands names a clerk, N. F. (`lc_ledger_nf`), whom the integrator and counting may take to be Naomi Fenn (it
teaches no `lacke_taxed`); a surrendered book (`lcSurrendered`) is the Warden's knowledge of her.
It asserts `goodwill(face_cockle)` (a Row settled, or a cousin bound, as a Cockle) and `goodwill(face_magpie)` (Sweet's face
returned by a company wearing the Magpie), `heat` (the Warrant used, an Unfacing told, a night's knocking, a rig seen), and
`roundDone(party, r_lovers)`.

## Where it touches the other files, and could be broken by them

* **Rill** is declared in drip.kyr; her private topics and actions here (`lc_rill_*`) fire wherever she is when the
  company is bare at night, so her night schedule need not be known. On the Swap night this file puts her at
  `drip_landing` once Cosimo has been escorted (`lc_swap_stage`), which will fight a rule of drip.kyr's that moves her
  at the same hours: each pass the later rule (this file's) wins, so it holds; but a drip.kyr rule that asserts her
  *elsewhere* on the fifth night after 20:00 should be gated on `not lcCosEscorted(party)`.
* **Moll**: `lc_moll_swap`, `lc_buy_new_magpie`, `lc_sig_*` need him at `annex_counter` at any hour.
* **Vail**: `lc_vail_ledger` needs her wherever the company finds her; the test goes to `gate_hall`.
* **The Warrant**: `lc_seal_book`, `lc_tally_for_sweet` need `warrantLive()`.
* Faces rent until the Ninth Bell, so on the Swap night the company is bare: which is the point, a Bare being the one
  proper Witness; but the integrator's `rentEnds` must not renew a face at 20:00.

## Friction

1. **Surnames.** See the top of this note. What would remove it: a way to declare a person's name as a *house* name (so
   the lint reads "Ostler's" as a place) or a per-module opt-out of the surname check for the legacy adventures.
2. **`Known as` hides a name only from the room's list.** Action and topic labels ("Talk to Maud Orrell", "Lift Maud
   Orrell's mask") and `{id}` placeholders in every text say the real name. A masked principal whose name is a secret
   is therefore named by the page as soon as there is anything to do with them. What I did: nothing; the labels carry
   the names. What would remove it: `{id}` and the generated labels honouring `Known as` until the fact is known.
   Also: a `Known as` string with a comma is split into name and role ("a thin man in the Heron's cowl, counting under
   his breath" read as "a counting under his breath"); I wrote none with commas.
3. **`Greets again` does not fill `{id}` placeholders** ("says {ombra__penhallow}"): found by the wander test. I wrote
   Greets without them. Removing it: fill them as `Says` does.
4. **A `Result` is one string** (friction 6 of the Grand Tour again). The Swap's four outcomes, and the umbrella and
   ledger endings that depend on what came before, are `Rule ... says` on the state the action set, one pass later; the
   action's own `Result` is the neutral beat.
5. **`says` with an anchor makes `kyrie lint` advise** ("heard at X, but what it does happens wherever the company is").
   A rule that both tells and changes is therefore two rules: an anchored, `once`, effect-less `says`, and the unanchored
   change. It reads as a doubled line; a `says ... heard at X` that did not trigger the advice when its changes are not
   the company's own would be better.
6. **No site test in an action's `Requires`**: `site == lc_booth` does not parse. For an action meant for one room I
   dropped the `site` parameter and wrote `at(actor, lc_booth)`. A `Speaker`'s `at(person, site)` still needs the
   parameter, which is why the two kinds are mixed in the file.
7. **`Time` takes watches or minutes, not hours**; `Time 6` is an hour, written with a comment where it matters.
8. **`--probe` syntax**: the guide documents `knows` and `#measure`; a relation is `--probe "ombra__lcX party"`, and
   `--probe "holds ombra__lcX party"` quietly answers "no" for everything. I lost an hour to it. A line in the guide.
9. **A `Grave` action is confirmed by the same step** in `Journey.play`; a test that steps it twice fails on the second
   with "no such choice". Not a bug, but unexpected.
10. **Moving the company**: I did not move it. The crossing is a passage that opens when the Pair is made
    (`opening when lcBoatOut()`), and rules put the two people into the room when the company arrives; and put the company
    back on the landing when the outcome is reached (`lc_cuff_ashore`). A way that closed behind the company in the middle
    of a pass would have been a trap; it is closed only by `not lcOutcome(party)`.
11. **Marks arrive a pass after the Round**: `marks(party)` is still 0 in the step that sets `roundDone`; the tests wait.
12. The surnames' collision with the legacy corpus will recur for every author who used the brief's names.

## What is thin or unfinished

* **Rill's schedule is not mine**, so the lovers' night scenes with her depend on her being found (the tests go where
  `o.at('rill')` says). If drip.kyr never leaves her anywhere at night the Round has to go through Cosimo, Lyle and the Swap
  alone, which it can.
* **`lc_survey_tip` has no reader.** The cisterns/heronry author could read it; it is a rumour for the Heronry's survey party.
* **Faces**: the Heron's and Crow's trades are used as colleague registers, but the lovers thread leaves no `goodwill` on
  `face_gull`, `face_heron` or `face_crow` (the Swap is at night, when the rented faces are gone). The Row leaves it on
  `face_cockle`, Sweet on `face_magpie`. A Gull's goodwill might be added by the integrator when `lcOutcome` and the company
  has worn the Gull.
* **The exploration** takes random offered choices 200 times from three builds and the Swap evening and asserts
  invariants on persons, the thread flags and the page; it does not prove that no *offered* action does nothing. The few
  actions that touch only a flag (`lc_pair_them`, `lc_cos_escort`) do something the page tells.
* **Wedding, merger and patent after the duel**: `lc_bless_*` may still be tried after a duel that wounded; a funeral
  closes it. A merger after a duel is impossible (the Trial window is over).
* The Dilemma's default is Lyle's surrender; I did not give the Warden's men a further consequence beyond the fates and the
  stopped letters (a surrendered book does not feed `lacke`'s file: N. F. is not exposed in play, only in the fate).
* Two voices (Cosimo, Rill) are given much of their charm in monologue; each is under ninety words a turn but a company
  that wants to *argue* with either of them has the checks and not much back-and-forth. The branching is in what is
  offered next, not in the reply.
* Quality: the quarrel's comedy rests on the Ferrymen's Twelfth (an open umbrella is a passenger). It is stated four times
  and I would cut one.

## Tests

`test/ombra-local.test.ts` (32 tests): the umbrella war (honest Trial, no-charm Trial, rig and riot, duel unseen, duel
seen and bound/stood/killed, wedding, mediation); Sweet (Objection, word, Gudge's night, signatures, slate, Warrant,
rematch); Lyle (surrender, warning, seal, promise kept and broken, burn, decoy passed and seen, index); the lovers (dark,
civil, light, told, left alone, forged and confessed); three random walks, a Swap-evening walk, and the closing account
read in two games. It is written against `data/campaigns/the-book-of-faces.campaign.json`; `OMBRA_CAMPAIGN` names another
(mine, with the other files' people stubbed, in `zz-module.json`, uncommitted). A step that may fail is written `?`, each
journey is on a seed found to pass it, and the build is the one good at the check.

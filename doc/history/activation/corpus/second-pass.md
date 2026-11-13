# Second pass: Let One Remember and the Patient Star

*Branch `adventure/p4-second-pass`, from `adventure/first-steps`, 11 November 2026. Both adventures were kept whole; no place and no person was removed. No TypeScript, no `data/rules`, no first-hour text. Everything below is Kyr, `countries.json` and test fixtures.*

The dramatic assessment (§5.1) said "second pass or archive". The second pass found that both modules were less shapeless than their role lists suggest. Each already had a spine and a clock; what they lacked was an ending that could be told apart from another, a cost for waiting, and someone who acts. That is what was added. Where the assessment was wrong I say so.

## 1. Let One Remember (the Corrow)

**What was already happening before the player arrives.** Hightown, a mountain, floats because it has forgotten its weight; what holds it is a chain of 143 links and a horn of three thousand tonnes dragging in the Hesk plateau (`clocks.kyr`, a balance in Kyr measures: `restingWeight`, `hightownLift`, `socketDistance`). Ruth Teake's runners file a link off the tail on a clock because Esk of Harrow, the Hartmark's envoy, pays them to help the winds; five gales drive the mountain toward the Socket; and the Grounders will tell three hundred people where it came from the day the lake is under them. The assessment's "Hornwake and Hightown thin" was a reading of role lists: both are the first act's stage, with Lene's hoists weighing ballast, Fen Hadley's bearing books, Aron's roster, the Speaker and her daughter.

**What was missing, and what I did.**

1. **Endings.** The finale was five `Observe`s and a flag. Now there are seven `Ending`s with distinct epilogues, each saying what became of Hornwake, Keld, Wendmouth and Hightown:
   - `e_lost` *The Mountain Goes Up* (`clocks.kyr`): the only Act I outcome the later acts cannot survive, since there is then no mountain to bring down. Reached by cutting the tail past the number.
   - `e_home` *The Mountain Home*, `e_one` *The Keeper of the Road*, `e_given` *The Heart Goes Home*, `e_none` *The Hush Undone*, `e_none_named` *Everyone Home* (over `e_none`, when the Strays of Keld were named), `e_followed` *Elsewhere, Together* (`act5_road.kyr`). They differ by who gets what: the Grounders' home on the shore, the Concord's one keeper, the Varakiiri's heart, the forgotten's everything at once, nobody's road. The original scenes are kept and told at the step, so the Act V specs that match their words still pass.
2. **An opposition that acts** (`hornwake.kyr`). Esk does not stop because Ruth does. If the runners put down their files and he is still paying, ten days later he sends hands of his own in hired coats to the same link (`esk_hires`, `hartmarkFiling`), and only telling Esk himself (the existing topic) ends it. This makes "who is going to tell the Hartmark man?", the question Ruth already asks, a clock and not a line. And Esk will pay the company to hasten the cut (`esk_winter`: fifty crowns, a link a week): a public way to bring about `e_lost`, taken for money by a company that has not asked what a tail weighs.
3. **Thin places touched by the thread** (`hightown.kyr`, `hornwake.kyr`): the rim's nets and the chapel's cup answer the cut tail (`rim_unease`, `chapel_unease`, `tail_hired`, `tail_hastened`); Speaker Vane and Linnet each gained two return topics that open only when the world has changed (the roster begins, the Speaker has been told, the lake is under them); a lost mountain empties Hornwake's wagons.
4. **Persistent consequences and news.** Eight `Observe`s in the module's own places after the road ends (`socket_south`, `wagons`, `keld_green`, `well_square`, `rim_walk`), and the `after` entry in `countries.json` for `corrow` now has six ways (`lost`, `home`, then `one`, `given`, `none`, `followed`) with `word_lost` and `word_home` added to `placed.kyr` and `placed.json`.

**What I did not do.** The four to five strongest threads: I strengthened the Hightown and tail thread, the Hartmark's opposition, and the endings of the Keld Strays and the Open Hand through `e_none_named`. I did not give the Seam, the Registry's Calvessan clerks or the Unfolded new clocks; they already have `open_hand_rite` at 5616, `star_breaks` at 5904 and `kin_advance`, which I read and did not extend. I did not play the Corrow's Acts II to IV again; the existing grand-journey spec does.

## 2. The Patient Star

**What was already happening.** A star over the Uplands is dropping a citadel down the light, two metres a day; four years to dock, six months more to the Vault, and then the Keeping unbinds and Imbar's past begins to go. A Concord of six seats, called to Stairhead, votes on three motions: *cover the Pit* (the Crown), *a sanctioned descent for Ithmar* (the mother-church), *bargain with the Interlocutor*. Saro holds the Heart. Those are the three claimants, and they were already exclusive in the endings (`covered`, `seated`, `rebound`, `exiled`). They were not exclusive in play, because nothing happened if they did not meet.

**What I did.**

1. **The descent costs something at each step** (`clock.kyr`, `strain`): at 2400, 1800, 1200 and 600 m the Mutual levies every cutter (the company's debt to Dagny grows by four), the Warden's storehouse loads umber it has no order for, the Mutual shuts the Granary Ring, and Ennick lets its holders go. Each is read in a place (`strain_hall`, `strain_store`, `strain_square`, `strain_holders`).
2. **What happens if the player does nothing?** The Crown acts. With the Concord called and nothing passed, once the Corbel is within 1800 m the Warden decrees the covering on his own seal and presses the Coverers at double time (`crown_decrees`, `decree_presses`): the Pit is covered by about day 1260, before the Corbel can dock at 1500. The held die in the glass (`e_covered`, *The Pit Covered*). A company that only stops the Crown, and does nothing about Ithmar, finds the Tip arrives instead (`e_unbound`): the held live and the past goes. The third path, Saro's, keeps both and costs her. None of the three is free.
3. **A confrontation with a reason, a way to avoid it, and approaches by calling.** When the Warden decrees, a train of forty Coverers and a dozen carts (`cover_train`, a territorial band that `Arrives` at the top of the Collar) comes up the road with the Warden's seal. They can be fought (the plain way, the Warden's), talked round (an even chance), paid forty crowns by anyone, or turned: the ranger by the herd-way (costs a day, blames no one), the thief by the linchpins (quick, but the Warden stops admitting the company), the cleric by sitting the Waiting in the road (needs the held fed seen; Ruan Haldane owes the company after), the scholar by the Crown's own charter (the Concord must vote; the foreman waits). Any turning spends the decree and sets the covering back to its first day, so the Crown loses the race to the Corbel unless it is helped.
4. **Endings.** The ten existing end-observes became ten `Ending`s with the same epilogues, ordered with `over` (`e_laid`, `e_set`, `e_fell`, `e_line`, `e_bargain`, `e_seated`, `e_rebound`, `e_exiled`, `e_covered`, `e_unbound`). S3 and S4 of `test/patient-star.test.ts` still end on the words they match.
5. **Afterwards and the news** (`clock.kyr`, `placed.kyr`, `countries.json`): nine `Observe`s in the Shift Market, the Mutual's hall and the Counter's platform; and the `after` for `ghessil` has five ways (`covered`, `rebound`, `exiled`, `seated`, `unbound`), each told by the keeper in a different register: the covered, with the cousin who cut felt; the rebound, the keeper as a worse thing than a hero; the exiled, the missing floor; the seated and the unbound, the forgetting.
6. **Two Milestones** (turned the train; had the Concord sanction a descent).

**What I did not do.** Combat was not exercised: the Attack option is offered, and I did not fight the train. Saro's refusal and the Interlocutor's bargain were not changed. The Concord's "bargain" motion is still a motion no one can pass.

## 3. Prose

Weak spots were few. I wrote the foreman (weary, bureaucratic, honest), the keepers' reactions (each a different dialect of unease), Dagny (terse; chalk), Esk (a pleasant mercantile courtesy that never says where the mountain will go), Speaker Vane (formal, tired) and Linnet (a child who is quoted a figure of speech and asks what it is). Where the prose was already good (Keld, the Nail) I left it.

## 4. Requests

R105 (an ending cannot be walked past in a game played alone), R106 (a long clock cannot be waited out in a spec), R107 (`after.by` takes one word), R108 (a calling's action needs `who: member`, and the error names the wrong file): `kyr-deem-requests.md`.

## 5. Verification (see also the report in the handback)

`bin/kyrie lint` on `let-one-remember.campaign.json`, `the-patient-star.campaign.json`, `hold-one-season.campaign.json`: 0 errors. New specs `test/let-one-remember-ends.test.ts` and `test/patient-star-ends.test.ts` (results in section 6).

## 6. Results

- `bin/kyrie lint`: `let-one-remember`, `the-patient-star`, `hold-one-season`: 0 errors, 0 warnings (the Patient Star's "no Milestone" advice is gone). The whole-repository lint run shows no new error.
- `test/let-one-remember-ends.test.ts`: 7 pass. From the campaign's own start by public labels: *The Mountain Goes Up* (to Esk, take the silver, wait), Esk's hired hands ten days after Ruth stops (the Registry's number bought at Wendmouth, Ruth told, Esk not), and doing nothing (Hightown falls on the Socket's shore, no ending). From the Act V fixture ("Begin Act V" places the company on the ledge with the needle, lens and stone): *The Mountain Home*, *The Heart Goes Home*, *The Hush Undone*, *Elsewhere, Together*.
- `test/patient-star-ends.test.ts`: 9 pass. By public labels from the real start: *Bound Tighter* and *Cast Out* (the phases of S3 and S4). From the "late" fixtures (the Corbel set to 1810 m, the Concord called, the held fed known, ninety crowns): the levy, stocking and shut Ring; the Warden's decree; the train at the top of the Collar; and the train turned by the thief, ranger, cleric, scholar and a payment. From the "late-covered" fixture (covering set at 1060 of 1080): *The Pit Covered*.
- Existing specs, unchanged and run on this branch: `let-one-remember`, `let-one-remember-witness`, `patient-star`, `hold-one-season`, `patient-star-shipped`, `patient-probes`, `patient-kept`, `placed-star`: 72 pass, 0 fail.
- Not reached: the warrior's fight with the train; `e_none_named`; `e_one` (the road kept by one, without the stone); `e_seated`, `e_unbound`, `e_bargain`, `e_line`, `e_laid`, `e_set`, `e_fell` (the existing S-journeys do not end in them); the `after` news told by a keeper in a generated world (the `ghessil` and `corrow` entries load and the existing placed specs pass; the new ways were not talked through); the aftermath observes in a world that goes on (R105).

# The Wet Post: notes (post.kyr, prefix `ps_`)

*Author A4. The Burning of the Nobodies, the Clerk Who Reads, the Delivery to a Mask. People: Tomas Pell (`pell`), Mistress
Dunnage (`dunnage`), Mabel Vickery (`strake`, see the first friction), Dickon (`ps_corbin`), and the bakehouse's four Cockles.
Rooms of my own: `dlo_office`, `dlo_roof`, `ps_stair`, `ps_bake_floor`.*

## The threads

### 1. The Burning of the Nobodies (the book's set-piece and its clock)

*The clock.* Forty sacks hang in the sorting-hall in eight lines of five. At ten on the ninth morning the clerks carry them to the
burning-room (`ps_sacks_at` moves from `dlo_sorting` to `dlo_furnace`); at noon Mistress Dunnage lights her taper and feeds the
fire a sack at a time for an hour and a half (`ps_burning_begun`, `ps_burnt` at the end); whatever is still in a sack is ash, the
Book with it (`ps_book_burned`). The Rule is on a slate in the furnace-room and the Postmaster reads it aloud, every clause, because
she cannot omit one: *burnt in a dry furnace; if the furnace be wet she waits and does not hurry; no piece kept back save such as be
redeemed before the stroke by any person that will pay its carriage and put a name to it.* Three of the book's ways in are in that
sentence. Pell posted the Book on the first night as "To Nobody, Nowhere" to the night-box; the boy, Dickon, filed it in the third sack
of the seventh line, "Wanting a name and wanting a door", because Nobody is not a name and Nowhere is not a door.

*Finding it (physical search; an hour a sack, half with Mabel).* `ps_dig` goes through the next sack of a line (eight lines, five
sacks, the Book is in the third of the seventh: three digs finds it). `ps_open_parcels` goes straight to the third sack of a line
(the second verse of the rhyme: one for a letter, two for a card, three for a parcel) and needs the Filing or to have been told the
line. Learning the Filing: work two shifts at the sorting tables as a Crow (`ps_work_shift`, four coin a shift, the rhyme goes into
your hands), or lore (dc fair) or insight (dc hard) on the rhyme the clerks chant, or the card in the Postmaster's drawer (a lock, picked
while she dines at the counter at noon, or at night), or Mabel's word, or Dickon. The wrong lines are not empty: each sack has its
own flavour (letters to the drowned of the Sluice year; letters the Hill refused; the forty-one love-letters of the unsigned),
and "Nobody's own" holds the Drip's thanks to the Anonymous Saint, which can be taken to Sister Nobody (`ps_thanks`).

*Getting in.* A bare company is told "staff only" at the hall door. A Crow walks through; a masked stranger pays Dickon two coin; Mabel
can vouch; whoever told on Mabel is given the run of the hall. By night the hall is Pell's: he sits there from eleven to two,
walks to the Chapel at two, stands on its steps for two hours, and opens the Office at four. So a thief has two hours.

*The ways to the Book.*
1. **Sort and redeem** (lawful): find the sack, then in the name of a face (any mask, a Bare cannot) pay the carriage to the Postmaster:
   twelve coin, six the stone and the Book weighs two, before noon on the ninth (`ps_redeem`). Costs coin, a rented face and hours, and
   leaves an entry in the Redemptions. Dunnage knows exactly what it is and decides that the Rule does not ask.
2. **Ask Pell** (the substantial conversation, below).
3. **Steal**: `ps_take_night` (Pell away, no check) or `ps_take_day` (stealth, with the clerks about; failure is heat and the door).
   Pell finds a sack lighter and a form crooked; his fate if he is not otherwise moved is to stay at the counter, robbed, "looking at the hall door
   as at a window left open".
4. **Delay the Burning**: on the ninth morning, from the Office roof, turn the furnace cowl into the rain (`ps_turn_cowl`, climbing: a wet
   furnace waits; Dunnage dries it with a brazier and burns at six in the evening); or ram the sweeps' wet sacking down the stack (`ps_choke_flue`,
   trapwork hard: it cannot burn before Mr. Penn the sweep comes on the tenth, so nothing burns in the book, and the boy who had the roof is
   dismissed an hour later unless the company owns up, which costs heat); or ask the Postmaster to put it off a day on account of the
   Drawing (persuasion, formidable: she refuses with enormous gentleness, the Rule does not mention the Drawing, unless a die goes right).
5. **Burn it on purpose** (`ps_burn_book`, grave) in the furnace on the ninth morning. `ps_burned_by_choice` is set as well as `ps_book_burned`.
6. **Snatch it at the fire** (the set-piece's last chance, noon to half past one): `ps_snatch_brawn` (brawn) or `ps_snatch_slip` (stealth, with Mabel
   spilling a table of letters as cover). Failure puts the sack in the fire with the Book in it. Both are grave.

*Pell.* The Clerk of the Book, under a Crow and the name Dacre. He will not give the Book up to evidence because he has no doubt what it proves;
he put it in the night-box because if he left it the Rule would burn it and the Rule is nobody's fault, and if he took it out of the sack he would be
the man who took it out. A bare day-company is told "the counter serves faces"; a masked night-company, "not with that on; I will not talk to a mask in my
own lamp". Checks: insight (dc fair) to see who he is in his hands and his Chapel knot; persuasion (hard) or deception (hard: "the Chaplain sent me";
he half believes it and chooses to) to make him admit and say where; intimidation (hard: "I will say your name from the bridge"): on success he
tells you and walks out of the Office and nobody on the Wet Post sees him again, on failure he has already been through it a thousand times in his head
and moves the Book to the first line, among the drowned (`ps_pell_moved_it`; the journal's "third sack of the seventh" is now stale and the hall says so
when you open it). No-charm routes: sit on the Chapel step beside him at two in the morning (an unmasked face and two hours), which
gets the whole story (`ps_vigil_kept`). The three things that make him put the Book down (`ps_pell_free`, `Give book_of_faces`, and he goes to the Chapel
steps for good): `ci_pip_forgave(party)` (the child who saw him), `cl_pell_penitent(party)` (asked as a penitent), `carries(party, rounds_ledger)` (he reads the
hand, not the words, on the last page). Evidence is tried (`ps_pell_evidence`) and fails by design: "Yes. Yes. And?". If the Book was taken from under him
first, the same three things release him from it without his giving it (`ps_pell_released`). Named, he is dismissed and goes to the Chapel.

### 2. The Clerk Who Reads

Mabel Vickery sorts by day, reads by the Office's lamp until ten, and from ten until two takes the dead letters that matter round the Post-lodgings
stair by hand, to people she could only find by reading. It is Unfacing, and a kindness. Dunnage has had four thanks come back through the counter slot and says she will
know by the seventh day (a clock: at noon on day 7 Mabel is dismissed, `ps_mabel_dismissed`). She keeps three letters: Piers Roke's to his sister Aveline
(nine years, a boat, a quarrel over oars), the late Master Corley's to Teodor Wick (the debt is written off; buy the boy boots), and Hal Corry's to Lucia Brandt
(if she marries Gerrit Hale on the eighth he will stand on the Post bridge at the Fifth Bell and say her name aloud).
Approaches: **carry them** (a bare face, unemployed, nothing to lose; Mabel gives all three; read them; deliver by a bare knock: the recipients
open bare; heat +1 for the third), **withhold the third** (then Hal does it on the eighth: the news says so: the threat letter *should* arrive), **tell Dunnage**
(Mabel is dismissed, and the teller is given the hall and the Filing), **stop her** (persuasion, hard; she hands over the satchel and stops, keeps her place,
the company carries), or **argue her case in the Office's own words**: lore (the redeem clause: a clerk who pays a penny and puts the addressee's name to a letter
is redeeming it: Mabel becomes the Office's agent, openly), persuasion with the cards that came back, persuasion plain; or **the Warrant** (`ps_cover_warrant`:
a letter opened under Warrant is read, not opened; costs heat). The three argued ways are done as a Crow and raise `goodwill(face_crow)`; a thread done
bare leaves a named gratitude (a card through the counter slot, a pair of boots on the stair) and no goodwill.
Left alone, Mabel delivers the first two herself on the third night and keeps the third.

### 3. Delivery to a Mask

A parcel has waited nearly a year on the Unclaimed shelf, addressed to whoever wore the Cockle at the fifth bell on Michaelmas Eve (the Office delivers to faces,
not to hours, and to ask who wore it is to Name). Pell gives it to a Crow, as a Crow ("I do not go round"); the note inside gives three clues (left hand; a blue thread in the broken
mask-string; "bread is a promise kept warm"); four Cockles work the bakehouse (Wick, black string, right hand, owes; Nessa, blue ribbon, fifteen; Bram, blue wool,
right hand; Odile Ollerton, one neat blue thread, left hand, who says it unprompted when asked what bread is). Approaches: **deduce** (the scenes give the string and the
hand), **ask the Cockles** (`ps_knead`: a morning at the trough as a Cockle earns `goodwill(face_cockle)`; then Bram tells, Cockle to Cockle), **hand it to anyone
and watch** (the wrong ones decline each in their own way; the right one stops folding), **Name her** (generic `name_aloud`; she is ruined and nobody is unkind),
or **Wick** (if his letter was delivered). Delivered by day across the table she takes it as the Cockle's and says nothing; by night, bare, on her garret
landing, she opens it under the lamp, tells you she married the chandler at the Annunciation and does not say who sent what, and the dress is short in the hem
for the flour. If nobody takes it, it burns on the ninth.

## Ids other files may read

Relations on the company: `ps_book_found`, `ps_book_burned`, `ps_burned_by_choice`, `ps_redeemed`, `ps_snatched`, `ps_pell_free`, `ps_pell_admits`, `ps_pell_robbed`,
`ps_pell_moved_it`, `ps_vigil_kept`, `ps_flue_wet`, `ps_flue_choked`, `ps_held`, `ps_wet_done`, `ps_mabel_kept`, `ps_mabel_trusts`, `ps_told_dunnage`,
`ps_roke_delivered`, `ps_wick_delivered`, `ps_brandt_delivered`, `ps_brandt_withheld`, `ps_parcel_delivered`, `ps_odile_night`, `ps_thanks_delivered`. On things:
`ps_burning_begun(post_office)`, `ps_burnt(post_office)`, `ps_sacks_at(place)`, `ps_pell_chapel(pell)`, `ps_pell_fled(pell)`, `ps_mabel_dismissed(strake)`, `ps_boy_dismissed(ps_corbin)`.
Queries: `ps_burning()`, `ps_burn_done()`, `ps_lawful_hour()`. Discoveries: `ps_pell_is_pell`, `ps_rack_told`, `ps_book_located`, `ps_filing`, `ps_mabel_reads`.
`pell_hid_book` is taught by: Pell's admission, the vigil, Naming him, the Chapel knot on the wrapper once he is known, and Pell's own giving. The Registry and the
Hearing should read `carries(party, book_of_faces)`, `ps_book_burned(party)`, `ps_pell_free(party)`. Pell is at `chapel_steps` from two to four on every night until
he is free, named or fled, and always after. People other files may find in my rooms: `dunnage`, `strake`, `ps_corbin`, `ps_wick`, `ps_odile`, `ps_wynne`, `ps_bram`.
I read, from others: `ci_pip_forgave`, `cl_pell_penitent`, `rounds_ledger`, `pip_saw`, `warrantLive()`, `heat`, `goodwill`, `named`, `unmaskTeaches`, `nobody` (a topic `with nobody`:
the Drip's thanks delivered). I do not assert any `roundDone`.

## Friction (Kyr, Deem, the engine)

1. **Names.** `names [legacy]` refuses a Person whose surname or lone name another adventure already has: Strake (Dame Hawise Strake, Winter in Carth), Corbin (Wrayford), Fenwick (Parliament of Books). The brief
   gave Mabel Strake and the id `strake`; I kept the id and renamed the person **Mabel Vickery**, the boy **Dickon**, Odile **Ollerton**. Anyone writing "Mabel Strake" in prose must write Vickery. Remedy: check names
   when the briefs are set, or make the names lint module-local for a new adventure.
2. **A masked person's name leaks into action labels.** The page says "a Crow clerk at the counter" and the choices say "Talk to Tomas Pell", "Lift Tomas Pell's mask", "Name Tomas Pell aloud"; likewise "Talk to Mabel Vickery",
   "Talk to Odile Ollerton". I could do nothing in a module. Remedy: `{who}` in a label should read the person's `Known as` until the condition ends.
3. **A greeting cannot vary by register.** `Greets` is one string, and Pell, Mabel, Wick and Odile are masked by day and bare at night in the same rooms or on a stair. I wrote greetings that do not say which, and gave
   each a pair of `Known as` lines on `publicHours()` / `privateHours()`. Remedy: `Greets "…" when …` as Roles have.
4. **An action refused at a door.** The way into the sorting-hall is in the spine and I may not edit it, so "staff only" is an eject rule after arrival (`ps_hall_challenged`) and the company is shown the hall's
   description for a moment first. A `Guards` person (the boy) would have done it by day, but not by night, when the guard is whoever is on the lamp. Remedy: a module's right to add an `opening when` to a way the spine declared.
5. **A rule that changes the world and tells it needs two rules** (guide friction 22, still true): Hal Corry's naming of Lucia Brandt on the Post bridge is an unanchored change and an anchored telling.
6. **Rules cannot `Assert knows`.** I used `says … teaches` with a line of prose each time, and a topic or an action for everything else. Pell's naming had to be given a line of news to teach `pell_hid_book`.
7. **The sack as a thing.** The physical search wants forty sacks, one of which holds an item, opened one at a time. Forty Things with `Holds` and a dig action per sack would be forty offers; I made eight racks with a measure
   of how many sacks have been gone through and a relation for which rack the Book is in (so Pell can move it), and `Give` the Book from `offstage` when its sack is opened. A `Search` of a container by hours would remove
   the need: "go through #n of the things in this place, an hour each".
8. **Dice in tests.** Every check in a journey is a coin that depends on the seed and the history. I found seeds by running the steps over `s0…s39` (a small script) and named the seed in the test; `?step` skips a check that need
   not go well. A way to say "this check succeeds / fails" in a journey (a die override for one step) would make the cases honest.
9. **`Time` is minutes or watches.** `Time 1 hour` is not Kyr; an hour is `Time 6`.
10. **Rental and the face in the Annex.** A face rented at eight is held till the Ninth Bell, so a company that wants the Crow on the second day rents it again; `?Rent the Crow` in a step is how the journeys do it.
11. **A topic that only teaches is offered again** ("Ask him again why he did not simply take it out of the sack"); good, and the right thing for the Pell speeches, but it means a `once` that asserts something is not re-asked, and a story told twice is told twice.
12. **A relation with an argument that is a person versus the company.** I used `ps_pell_chapel(pell)` for a person's state and `ps_pell_free(party)` for the company's deed; the lint's "write-only" advice is the only thing that tells you which you have forgotten to read.

## Tests

`test/ombra-post.test.ts` (46 cases; about 3.5 minutes on a busy machine, each under a minute). It defaults to the real campaign and is expected to pass once
the other authors' `ci_pip_forgave`, `cl_pell_penitent`, `rounds_ledger` and `nobody` exist. In the author's worktree those were absent, so it was run against a
scratch campaign whose module adds a stub file (`OMBRA_CAMPAIGN=data/campaigns/zz.campaign.json bun test test/ombra-post.test.ts`): the relations, the ledger,
Sister Nobody, and five `zz:` acts that grant them (Pip forgives, a penitent, the ledger, the Warrant, forty coin). The cases that need those acts are
`withStubs` (skipped without `OMBRA_CAMPAIGN`): Pell yielding to Pip, to the penitent and to the ledger; the Warrant cover; slipping the sack with Mabel;
burning it on purpose. Seeds are named in the cases that need a particular die (s0 fails and s1..s4 mostly succeed; the list is in the cases).
Covered: finding the Book (patience and redeeming, the boy, the shifts, the wrong line, the drawer), Pell's registers and every way he is moved or not, the fire
(left alone, a wet furnace, a choked one, a day's grace asked, snatching, burning), Mabel (carry, deliver, withhold, tell, stop, argue three ways, Warrant, the clock),
the Cockle's parcel (three ways to the right Cockle, the wrong ones, by day and by night, burnt if left), two hundred offered acts in two places checked against
invariants (nobody in two places, no Book both carried and burnt, nothing known that cannot be, an act of this file never offered that does nothing), and persistence
across a day and a rest.

## What is thin or unfinished

- Nobody is Named by default; Pell's Named state and Odile's are written (a line, a relocation) but not played through.
- The wet furnace relies on the Postmaster's brazier at five; a company that arrives in the burning-room after noon on the ninth finds a Burning in progress and may only snatch.
- Dunnage has a night register (bare, in her room, until eleven) but one conversation; the Postmaster is the one person here I would give a longer private scene, with the Rule.
- `ps_snatch_*`, `ps_choke_flue` and the Hold are tested by seed; the odds are real, and a company with no brawn, no trapwork and no charm has the lawful route, the vigil and the theft.
- The Filing is learned by shifts, lore, insight, the drawer, Mabel or Dickon; the lore and insight routes are one try a day.
- Mabel's argued ways need the Crow; a company that took the Cockle for the Delivery and the Gull for the ferry has to take the Crow off a peg again for her.
- `nobody` (drip.kyr) is read in one topic, to receive the Drip's thanks; if the Anonymous Saint's file has other plans for the bundle that topic should go.

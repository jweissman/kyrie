# The Book of Faces: notes on `maskers.kyr` and `thief.kyr` (A2)

*What was built, what other files may read, what Kyr could not say, and what is thin. The two files are one piece of
work: the Wall of Faces under Madame Pavane's house, and the people who go into it by day, by night and by roof.*

## What was built

### The Wall of Faces (`maskers.kyr`)

**Madame Pavane, the Fitter**, sixty-one, wants only to be seen as an artist. By day she is a grey half-mask and a pair
of hands: a bare face gets one cold sentence and a hint of the one place the Concord does not reach (the chair, where a
face is cast bare); a masked one gets the trade (what a Fit is; the Annex face "fits you well enough to be wrong"; the
Moth, with contempt). By night she is warm, in a quilted gown, and receives a bare knock and takes a masked one for a
burglar. She came down the delta road Bare thirty-nine years ago and was offered a face; the Wall takes a face at
sixteen, so hers is the one empty niche on forty thousand shelves. She has cut every Office's mask for thirty-one years
to a face from the Menders' shelf and thinks it the best thing the city does.

*The cellar's doors* (seven, each leaving something different):

| Way | Costs | Leaves |
|---|---|---|
| **Sit in the chair** (bare, by day; six coin) | six coin, forty minutes | `castTaken`; the shelf that is yours; a squeeze of your face in her ledger (see below) |
| **Commission a study** (masked, by day; ten coin) | ten coin | a look at the Menders' shelf, not the veil |
| **Stand in the rain** (night, 20:00-23:00; an hour, no check) | an hour | `mk_pavane_trust`; she shows you the Wall, though not the veil unless you ask |
| **Be seen**: say what the blank mask is for (insight), ask her to finish it for no one while you sit (performance; once a day) | two checks | `mk_pavane_moved`; the niche; her name; her bare past; her knowledge of the Lie; a cast of her own face (mending), whose price is her own picks, a free Fit, and the veil lifted unasked |
| **The Warrant** (`warrantLive()`; intimidation) | +1 heat either way; her warmth | she shows the Wall coldly; `mk_pavane_cold`; a note to the Watch |
| **The mask that fits nobody**, put in her hands | Dov's trust | `mk_pavane_trust`; Dov made journeyman |
| **Steal** (thief.kyr) | see below | see below |

The veil (the black wool on the last face of the Lamps shelf: Y. Marrick, T for the Sluice year, then R) is a separate
door: persuasion once (`dc_hard`), no check if you have cast her, or lifted by hand: alone it costs nothing, and with her
watching it costs her trust, a heat, and the cellar. The Menders' shelf teaches `lie_wall` on sight; the veil teaches
`marrick_was_treasurer`.

*Consequences of a cast.* A sitter whose cast is on the Wall: **the Watch asks for it** (day 3 on, once heat is 2, unless
Pavane has been moved: +1 heat); **Maule** (the rival, the Cockle and Heron) buys a squeeze from her ledger on day 3 and
offers a *rough Fit* of any Office mask in hand for twelve coin (`mk_crude_fit`: a Fitter would see its tell); Pavane's
own Fit is twenty-five coin, has no tell, is free once if you cast her. She will not Fit the White Face.

*Naming Pavane* (`unmaskTeaches(pavane, mk_pavane_name)`; the name is Sabine Orrell, from the far side of the delta
road): her house shuts to the company; the shutters go up; a man in a tallow-coloured coat is at her door by dusk.

### The mask that fits nobody (`maskers.kyr`)

**Dov Ashe**, sixteen, her apprentice, by day a broom and a catechism ("hands have nothing to say by day"), by night
on the roof in the rain with an oilcloth bundle. His journeyman's piece is judged on the ninth afternoon: a mask cut
from the last nameless cast on the Wall's shelf of the Drowned, a stranger pulled from the Cuff in the Sluice year. It
falls off every face in Ombra and sits on the Bare's: it fits only someone with nobody to claim them. Beats: find him
(roof, bare, night; insight *or* an hour on the ridge, no check) -> his story -> put it on (it fits: `mk_dov_trusts`) ->
tell him it is not a bad pour but an exact one (lore) -> push him to carry it to Pavane himself (persuasion `dc_hard`,
one try; he does it unasked next morning) -> or take it and decide.

Resolutions (each leaves something): **burn** (Dov, relieved; nothing of the man left; he is turned out on day 9); **keep**
(the maker, if he has been told it is exact; he takes it before the Guild himself and is made journeyman); **Pavane**
(by Dov's hand if she is moved: journeyman at once; by the company's or cold: "a bad Fit made on purpose", vouched for
on the ninth); **Peck** (he writes that the man is somebody's: `mk_peck_claimed`); **sink it** in the Cuff at the Row
quay (grave: no mage source after it); **wear it**. Worn, the people of the Sluice speak to it as to their dead (Peck,
Mother Tibb, Goody Pallet: each `once`, each +1 goodwill on the face; Pallet presses four coin of the burial club into
your hand). Each talk is also `mk_hold`; the second warns; the third will not come off (`mk_clinging`: the shared
`doff_face` still works and the face puts itself back by a rule; by night you are the only masked person in Ombra, and
a masked knock is a burglar) until the hands that made it cut it off: Dov, or Pavane.

*Default if left alone:* day 9, 14:00, the Guild sits; the boy is out unless something has been done (burned or
unattended: dismissed; kept, or in Pavane's hands: made journeyman). A dismissed boy sits on the Fitter's step with his
things in a pillowcase; Maule will take him if he was asked about the boy first (`mk_maule_offer`).

### The Cast-Room (`thief.kyr`): five stages, a crew, three ways in, a conscience, heat that bites

1. **Casing**: watch the house from a doorway (stealth; failure is +1 heat and the Fitter alerted: the lock gets a second
   pin); ask Dov idly (he answers as a friend: that is the cost); or buy it from Slee. Teaches `th_routine`,
   `th_bells`, `th_roof_way`, `th_dov_key`.
2. **The crew**, exclusive, and optional (a guest or a customer needs none): **alone**; **Dov** (persuasion `dc_hard`, or his
   key *as a favour* after you have freed him of his mask: no check, and the whole of the moral cost; a Promise,
   `th_dov_promise`, "to keep Dov Ashe out of it"); **the Many Hands** (Slee, obadiah: fourteen coin and a cut). Slee's
   talk has seven doors to the price and the cut: *read what he wants* (insight: it is the Warden of Locks' face, since
   the Warden taxes the Hands' locks), *haggle* (persuasion; one try; fails dearer), *a Magpie of the Hands sent you*
   (deception), *forgo the squeeze* (persuasion `dc_hard`, `dc_fair` once you have read him), *an errand* (a parcel to the
   Row quay; no check), *a secret for a secret* (the Warden's skimming, `lacke_taxed`: waives fee and cut). He is moved
   by a thing he can weigh, not by argument.
3. **The way in**: the **roof** (climbing, then lockwork on the skylight bolt; crewed, the Hands or Dov unbolt it at eleven;
   then you drop in), the **front** (stay behind among the blocks as a customer: stealth, six coin, and the face you
   wore is remembered: `faceHeat` +2), or the **guest** (received at her stove, bare: you keep her cup full, she
   sleeps in her chair at midnight, you lift the key from her neck: stealth. Any hour before one in the parlour as a
   burglar, or after six, and she is waiting with a poker). Then the **lock** (a key, or lockwork; harder if the house was
   alerted) and the **bells** (step along the wall, stealth; or cut the cord, trapwork; crewed or guest, they are dealt with).
4. **The take**: *what is hidden* (the Menders' row and the Registrar's cast: `th_proof`), *what is valuable* (the four
   Offices' casts: `th_keys`), *what is owed* (Peck's cast, turned to the wall among the Named; or your own cast, if you
   sat, which erases `castTaken`), and the Fitter's spare picks (an item granting lockwork). Dov's crew may pour plaster
   blanks (an hour).
5. **The fence**: each kind of casts to the Candid (who will publish), the Warden (who will pay thirty and forty,
   cool your heat by one, and hold a hold), the Cuff (broken; grave), or the shelf (put back, before dawn); Peck's cast to Peck
   (`th_peck_give`); all of it to the Fitter, whole, in person, if you would rather she knew (`th_hand_back`: no heat, a
   boy stays). At the Drawing (`hand_cast`; `drawingNight()`, at `urn_hall`): set down before the room, put in the fire, or
   stand by while the Candid or the Warden uses them.

*What bites.* A burglary seen is +2 heat (the tile, the bell, the Fitter at the stove); at nine the next morning the
Fitter finds the gaps and the Watch is told: +2 (+1 if you were already seen), unless the Hands' silence was weighed
(`th_slee_silence`: four coin a thing taken and six beyond) or blanks were poured (then it is three days later, and the
key is Dov's, and he is put out). Confess before nine and Dov stays and it costs a heat. Two heats and a seen is
three: the Warrant suspended. Slee's squeezes sit in his crate (thirty coin to buy back); on the night of the Swap the
Hands wear the Offices' faces, and the Key's and the Pound's names go down by two. The Warden's hold (if you sold to
him): when the company Names him, his clerk puts the cellar on a paper at the Watch-house: +3.

## What other files may read

The ids that are the contract:

- **Mask that fits nobody:** `mk_face_drowned` (a face, not rentable; `goodwill(mk_face_drowned)`); `mk_dov_trusts(party)`;
  `mk_mask_fits_bare` (the fact), `mk_dov_story`, `mk_drowned_mask` (the item; `carries(party, mk_drowned_mask)`),
  `mk_dov_holds(dov)` (Dov still has it), `mk_drowned_burned`/`_buried`/`_pavane`, `mk_peck_claimed`, `mk_dov_keeps` (the end
  of the mask); `mk_dov_journeyman`, `mk_dov_dismissed`, `mk_dov_free` (Dov); `mk_hold(party)`, `mk_clinging(party)`,
  `mk_freed(party)` (the face's hold); the mage arc may read `mk_dov_trusts`, `mk_dov_proud`, `mk_mask_fits_bare`.
- **Wall:** `castTaken(party)` (set by the chair, erased by taking your own cast back), `mk_commissioned`, `mk_pavane_trust`,
  `mk_pavane_moved`, `mk_cast_pavane`, `mk_warranted`, `mk_pavane_cold`; `mk_maule_has(party)` (a rival holds a squeeze),
  `mk_crude_fit(party, face)` (a rough Fit: **a Fitter's eye sees the tell; the Registry or the Hearing should**); `fitted`
  (the spine's) is asserted by Pavane's Fit and Maule's; `unmaskTeaches` for `pavane`, `dov`.
- **Thief:** `handReady`/`handPlayed(party, hand_cast)`, `arcBegun(party, hand_cast)` (the spine's); what became of the
  casts: `th_cast_vane`, `th_cast_lacke`, `th_cast_broken`, `th_cast_back`, `th_cast_room`, `th_cast_fire`, `th_vane_read`,
  `th_lacke_used`; per kind: `th_proof_vane`, `th_keys_vane`, `th_proof_lacke`, `th_keys_lacke`, `th_proof_broken`,
  `th_keys_broken`; `th_took_proof`, `th_took_keys`, `th_took_owed`, `th_took_own`, `th_took_any`; `th_peck_cast`
  (Peck has his own face back); `th_found` (the Fitter found the gaps); `th_hands_squeezed`; the crews `th_crew_dov`,
  `th_crew_slee`, `th_crew_alone`. **For `drawing.kyr`:** `hand_cast`'s effect is `th_cast_room` (the Wall's casts read
  to the room: Open Book), `th_vane_read` (the Candid reads: the same), `th_cast_fire` (burnt: the Lie may keep), and
  `th_lacke_used` (the Warden had the Offices' faces: the Quiet Hand in his, or the Old Names' on the Hill).
- **People:** `pavane`, `dov` (declared as the table says), `mk_maule` (the rival maskmaker), `th_slee`.

I added topics `with` persons I do not own, each gated on what the *company* did, as the brief allows: `moll` (who makes the
faces on the pegs); `peck` (the mask, the Drowned Face, his own cast); `tibb` and `rainmother` (the Drowned Face). I
referenced `lacke`, `vane` and `vail` in actions and a rule. Their files should be kept to at(person, site) being true
where the company stands: the actions are offered wherever they are (Vane at the Reading-room, Lacke at his office).

## Friction

*In the order of cost.*

1. **A way that blocks cannot also be walked by an act.** The parlour skylight is a doorway in `city.kyr`; the thief
   crosses it by an action (check, then a drop), not by walking, so that the company can be told apart from a visitor
   (the engine cannot hook "arrived by passage X"). I put a Thing with two `blocking` states on the passage and moved
   the company by `Assert at(actor, room)`. The passage still shows as "Ways on: Into Madame Pavane's house by the
   parlour skylight" in the exits list, and cannot be taken; the player learns the act from the Thing's state. *Remedy:*
   a `Change … when <predicate>` (friction 7 of the Grand Tour, still true), or an action that `Uses <passage>`; or a
   way's `blocking` state saying which acts pass it.
2. **`Known as` is split on commas by the page's "Here are A, B; C" list.** "A woman of sixty in a grey half-mask,
   plaster to the elbows" came out as two people. *Worked round:* no commas in any `Known as`. *Remedy:* the page should
   take the whole of a `Known as` as one name.
3. **Doff cannot be vetoed.** A face that will not come off (`mk_clinging`) cannot stop the shared `doff_face`; a rule puts
   the face back on in the same pass, so the company's page says "You take it off" and the state is unchanged. *Remedy:*
   a `Requires` the module can add to a shared action (a `Query` the shared rule asks: `faceLocked(party)`).
4. **A `Result` cannot vary** (Grand Tour 6): Slee's "tonight at eleven" had to be gated to the hours before eleven by the
   action's `Requires`; Pavane's veil "on a morning like this one" is said at any hour. *Remedy:* `Result … when …`.
5. **Persons' items cannot be given up by the company when they are in someone's hands.** `Spend mask from party` only
   works for what the company carries; the mask that Dov holds is a relation (`mk_dov_holds(dov)`) and the item stays
   offstage until he lends it. It reads correctly in play and would confuse a reader of the source. *Remedy:* items
   that `owned by` a person and are the person's to burn.
6. **The names lint (`names [legacy]`) refuses a surname that another adventure has used**: "Hask" (Parliament of Books) had
   to become Maule. It also reports **Vane** (Linnet Vane in Let One Remember): this will fire again on the integrator's
   `vane.kyr`; I met it only through my stub. The error is at the spine's level, not mine.
7. **Probes need the module's prefix** (`--probe "ombra__th_found party"`, `#ombra__heat party`), which the guide's
   sentence about the module's own names does not say. Cost a run.
8. **Slow shared lint** (30-120 s on a busy machine): the commands time out silently at two minutes and carry on in the
   background; one needs to read their output file. A `--quiet` that prints only errors would let a shared machine
   queue them.
9. **No way to read "the same action tried on a later day".** `mk_p_ask_cut` (once a day) needs a measure holding the
   day it was last tried (`mk_cut_try(party) < day(clock)`), which works, but it is a pattern the language could name:
   `once per day`.
10. **A rule cannot move the party's *followers* or the party's gold into a heist's accounts**: the Slee silence is
    `quantity >= th_loot * 4 + 6`, which works as arithmetic in a `Requires` (a pleasure); and `Decrease quantity … by
    th_loot(actor) * 4 + 6` works; the engine's lint only suggests `or to nothing` for measures.
11. **Light.** The cellar is not `unlit`: I let the Wall be seen by the Fitter's never-extinguished lamp. A thief with no
    light who has gone down a dark cellar would have been a better beat, but the page's treatment of dark rooms hides
    "who is here" without a light, and I could not make the Wall's shelves seen at the stair-foot by one lamp and not
    from the far end.

## What is thin or unfinished

- **Maule** (the rival) has the thinnest conversation: five topics, no checks; his cheap Fit is real, his own motive
  (a face made for a mask, not a mask for a face) is a line and a half. He would repay a night register, a person he
  is at home, and a reason to be at the Wet Stage.
- **No check on the Warrant way** can be tested in this worktree: `warrant.kyr` is the integrator's, so
  `mk_p_press` is never offered in my campaign. Written, linted, unplayed.
- **The Swap** (day 5): the Hands wear the Offices' faces only as two numbers (`faceHeat` +2) and a line; the night
  should show a masked Key buying drinks in a square, and nobody has written it.
- **The Drawing**: the five actions are mine, but `drawing.kyr` has to read `th_cast_*`; I wrote the news lines, not the
  effects on the city.
- **The Registrar's White Face** is on the rack as WHITE and goes with the other three in the take; no one reads
  `face_white` as being a face that can be made from it. The Fit refuses it.
- **Dov's mother** and the debt to the Rain-Wives' burial club are a word in a Naming line and a discovery; nobody
  carries them anywhere.
- **Slee is the only Many Hand**; Tick, Wick and the boy with one boot are names. They want a scene each.
- **The front way in** has only the one check; the customer's night in the fitting-room is a wait with no incident.
- **Persons of other files**: `peck`, `tibb`, `rainmother` have only the Drowned-Face topics from me; `vane` and `lacke`
  only buy. The lines I wrote for Peck and Tibb ("the tenth Bare, sleeping in the doorway"; "I signed six hundred and
  eleven") are claims about their files' people: gate.kyr should read them and keep or change them.

## Tests

`test/ombra-maskers.test.ts` (21 tests) and `test/ombra-thief.test.ts` (24): the happy paths, every resolution of the mask
and of the take, a failed check and its consequence, offered-action explorations of 200 choices with invariants, and
persistence across days. A check that a flow needs to go one way is tried on successive seeds. `OMBRA_CAMPAIGN` names
a campaign that has the other authors' persons; without them the tests that need Peck, Tibb, Goody Pallet, Vane or the
Warden stop early and pass.

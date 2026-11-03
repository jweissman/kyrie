# The Book of Faces: notes on `gate.kyr` and `monk.kyr` (A7)

*The Gate of Strangers and the Bare Brothers: what was built, what other files may read, what Kyr would not say, what
is thin. Written by the author of both files, after playing them.*

## What is built

### `gate.kyr` (prefix `gt_`)

**Scenes** for `road_end`, `customs_steps`, `gate_square`, `hospice_hall`, `hospice_dorm`, `annex_counter`: each a day
scene (Masked Hours, loud, wet, everyone turned away) and a night scene (lamps, knocks, the Bare alone). The first rule of the
book is done to the company, once, on the Customs Steps: a good morning, unheard (`gt_first_bare`).

**1. The Hospice and the Almanack** (Mother Tibb). The *Almanack of Usages* is an item (three rules, one joke, one
threat). A bed needs a *sheet*; a sheet needs Three Questions asked in sequence (reason, stay, next of kin). The first has
four routes: the plain truth (curiosity, "disfavoured"; or, for a company with the Warrant, *summons*, a column not
written in sixty-two years), a lie (deception, fair), or the Mother's discretion (persuasion, fair); a failed one is not
offered again for an hour. The third question's answer (a name, or "no one", which ties a knot at once) is read at the
end by Tibb's fates. Rest at the dormitory is the standard lodging service, free, refused by `refusesService` to a company
with no sheet, to a mask, and to a company that has wounded or betrayed Peck. A mask is not lodged (Tibb says so by day:
`gt_tibb_masked`). By night Tibb keeps a string of knots for the Bare who died (41), tells of the twelve she walked to the
Gate (one in, eleven out), and asks the question the Warrant asks: will you take a face?

**2. Absalom Peck, Round 3.** See below.

**3. The Borrowed Face** (local). The returned Gull domino and the Heron's unsent letter. Moll asks, at night, bare. Four
things to do with it: carry it *unread* to the hirer of the Gull (Rill), *read* it (`gt_letter_read`, teaches the Swap
rendezvous `gt_swap_tryst`) and give it to its writer (Cosimo), give it to the Watch (heat down one; Moll's trust lost), or
let it lie: Moll posts it to Nobody at the fourth noon; and a company that keeps it past the Swap hears the Swap come
without it. Delivered by hand to a person who can send it, Moll lends a face for nothing once (`gt_moll_lend`).

**4. The Hospice's Bare** (comic gallery, day and night): a cartographer who cannot draw a face, a pilgrim of the Gentle
Sun, a physiognomist who sells a lens that is a lesson, a drummer refused a trade-mask. Four of "eight or nine"; the rest
of the eleven are the hall's noise.

**5. Moll's faces.** What each trade-face will be asked for (and nothing else): the Gull to carry, the Owl to light, the
Cockle to feed and owe, the Heron to count, the Magpie to tally, the Moth to be seen, the Crow to write
(`gt_faces_taught`).

### Peck: Round 3 (`r_peck`)

Two registers. By day (bare) he is a drunk in a good chair, and the bottle is tea; a masked company is bowed to and not
spoken to (the Bare's courtesy to a face). By night (Tibb has taken the bottle) he is old, lucid and dry, and asks what you want.

*What he holds in three tiers:* `lie_peck` (day, for sitting by him), then `sluice_known` and `gt_peck_treasurer` (the
four checks), then `marrick_was_treasurer` and the whole telling (the five kindnesses).

*Four checks, each a different knowledge:* insight (watch the hands: the bottle is tea), lore (ask how the Sluice's pawl
worked: he tells it as a wright would), persuasion (hard, plainly), intimidation (works, costs: he is *wounded*, and Tibb
shuts the bed, until `gt_peck_apologise`). A failure shuts him for six hours (`gt_peck_retry`).

*Five kindnesses, each ending in `gt_peck_easy(peck)`, `roundDone(party, r_peck)`, and a different telling:*
the name said kindly at night, bare (no check; gives the White Lady, the Treasurer, the Sluice, the Serene's knot); a
night's vigil in silence (no check; no Lady); a walk to the Chapel and a lamp for the six hundred; a life-cast of his face
by Madame Pavane (six coin, or asked for its own sake, hard persuasion); a confession under the seal (needs `rites`).

*What moves him* is not proof: it is being spoken to as a person in the dark by someone who wants nothing, or being sat
with. He wanted Marrick to say it; she could not (a Registrar may not say a Named man's name): the Round is the one she
left undone.

*The betrayal:* `gt_vail_peck` gives the Watch his name for a count one lighter and Peck turns his chair to the wall.

*The clock:* if the Round is not done he dies in the small hours of the seventh night (`nightCount == 7`, three to six),
the cot stripped, a knot tied, a candle-stub lit on the sill. `gt_peck_home` takes him back to the Hospice on the seventh
evening if he is out on the company's arm.

*The complication:* the Registrar herself sat by his bed on the first night of every Novena for thirty-one years
(`gt_peck_lady`, Tibb knows it from the street door and her own key): the Round on her ledger is the one she could not do.

### `monk.kyr` (prefix `mo_`)

**The cloister, three rooms, day and night.** Brother Amery (the Quiet), Brother Wick (nineteen, with a bundle), Brother
Dunstan (the cook, excused the Silence, who says *soup*). The Brothers ring the bells, bury the Hospice's dead under a knot,
and for ninety years have stood in the Chapel's door at the Drawing and done nothing.

**Taking the cord** (`mo_vow`, gives `mo_cord`, sets `arcBegun(party, hand_door)`): three ways in, which leave him thinking
different things of the guest: by pleading (persuasion, hard), by looking at his hands and asking what he is afraid of
(insight, fair), or by freeing the fouled bell (climbing, splicing or brawn, with no charm at all).

**The Nine Quiets**, one a day for a guest who has the cord, each a window at a place (`mo_open`), each kept
(`moQuiet(party, q)`), broken (`moBroke`) or missed (`mo_missed`): 1 *Mouth* (a child struck at the Gate: gather his pies in
silence, or speak, which a face is heard to do and a bare mouth is only counted for: heat); 2 *Name* (the Inspector of
Rented Faces fines Moll from his own purse: Name him aloud, whisper the name, or stand there and be thanked); 3 *Hand* (a
mask in the Hospice: strike him, stand between, or ring Tibb's bell and let the Usages make him a burglar by daylight);
4 *Back* (a woman on the Customs Steps: sit three hours in the rain, or give four coin, which is the courteous way of
going, or walk on); 5 *Step* (Wick goes at the Swap: argue him out, carry his lantern, or let him go); 6 *Hoard* (the Flood:
give what you have, ladle beside the cook, open the Order's last store, or keep it for the ninth night); 7 *Tongue*
(Tibb asks to be told the eleven were all right: say you do not know and sit; lie; or say nothing); 8 *Face* (the Guilds
offer the Brother of the Door a white domino of honour: take it, refuse it, or bow and take nothing); 9 *Crown* (the Door).

*Measures:* `moKept(party)` (kept or answered), `moBroken`, `moPresence` (kept by staying, not by silence), `moMercy`
(broken for another's sake, to be told), `moAnswered`. Missing is neither: absence is not keeping.

*Amery's mind* (a claim, `mo_refusal`: stillness is refusal) is changed by two things that are not evidence. A failure told
him (`mo_confess`: a Quiet broken for another's sake, told, is *answered* and counts kept) and a night sat through (`mo_sit_reading`:
the Reading of the Weather, the register of the Bare buried in the garth, day and weather and no name). With the Reading and
either a told failure or three Quiets kept by staying, he lets go of the Rule, and the Brothers will stand with the company
(`mo_brothers_stand`). Three checks sit in his talk: persuasion (hard) and insight (fair) at the garth, and lore (fair) by
night, which quotes him the footnote of the Rule of the Door and brings out Alder, who was trampled last year because Amery
told him to stand.

*The Door:* `handReady(party, hand_door)` when five are kept and it is the Drawing night; `mo_door_stand` plays it
(`handPlayed`, `arcDone`) and `moDoor(party)` is then 0 to 3: **3** if the Brothers stand and seven are kept (the crowd
sits down), **2** if seven are kept or the Brothers stand (the crowd goes round), **1** otherwise, or if the company took the
white domino (held as a person holds, at a cost), and **0** if instead they speak (`mo_door_speak`, needs `urn_hollow`:
the speech is the crowd's, and for the integrator).

*Rewards:* the Brothers' mantle (`mo_mantle`, grants insight, Alder's, given at five kept), `endow wisdom by_one` (`mo_endow`),
four milestones (25, 75, 50, 100).

## What other files may read

Persons: `tibb`, `peck`, `amery`; `gt_ilbrand gt_dorcas gt_quill gt_maro`; `mo_wick mo_dunstan mo_inspector`.

Facts taught: `lie_peck`, `sluice_known`, `marrick_was_treasurer` (Peck); my own: `gt_peck_name gt_peck_wish gt_peck_sober
gt_peck_treasurer gt_peck_lady gt_serene_knot gt_usages gt_string_known gt_faces_taught gt_swap_tryst gt_unheard
mo_quiets_known mo_amery_afraid mo_alder mo_amery_door_known mo_amery_for mo_pask_known`.

Relations for the closing account and the integrator: `gt_peck_easy(peck)`, `gt_peck_gone(peck)`, `gt_peck_given(peck)`,
`gt_peck_wounded(peck)`, `gt_via_name/vigil/cast/chapel/confession(peck)`, `gt_peck_sealed(party)` (the cleric's seal:
the confession teaches what it heard, and says so), `gt_sheet(party)`, `gt_face_yes/no(party)`, `gt_kin_named/none(party)`,
`gt_letter_read/done/lost/rill/cosimo/watch(party)`, `gt_moll_trust(party)`, `gt_knot_shown(hobb)`;
`mo_vow(party)`, `moQuiet(party, mo_q1..mo_q9)`, `moBroke`, `mo_missed`, `moKept`, `moBroken`, `moPresence`, `moAnswered`,
`mo_brothers_stand(party)`, `mo_door_stood/spoke(party)`, `moDoor(party)` (0 to 3), `mo_honoured(party)`, `mo_wick_gone/stays(party)`,
`mo_stores_given/kept(party)`.

I wrote topics `with` people of other files, and so they must exist with those ids: `pavane` (two cast actions: six coin, or a
hard persuasion; both need Peck following and a masked company), `vail` (give the Watch Peck, or the letter), `hobb`
(`gt_hobb_knot`), `rill` and `cosimo` (the letter). I did not touch `moll` beyond topics and one action (`gt_moll_lend`).
For `hobb`, `gt_knot_shown(hobb)` is a fact serene.kyr may use: it does not say he took the Mask off, only that he has been told how.
For the hearing: `gt_peck_easy(peck)` is a Bare witness to the Sluice who will testify, if the integrator wants one.

Persons whose schedules are in these files and which the integrator's rooms may mention: `peck` is at the stove by day and in
the end cot by night (all day from the sixth), `tibb` at the table by day and in the dormitory doorway by night, `amery` in the
garth by day, the refectory from seven to eleven and his cell after.

## Friction (what Kyr would not say)

1. **A telling that is one beat after another is one lump.** Peck's telling is four rules (`gt_tell_lady`, `gt_tell_treasurer`,
   `gt_tell_sluice`, `gt_tell_knot`) and they cascade in the same pass as the action that begins them, so the page shows the
   Result and four paragraphs in one block. I could not stagger them across watches without risking that the company
   has left (an unanchored `says` is told wherever it is; one anchored `at` happens silently if the company is away): the
   telling teaches `marrick_was_treasurer`, which must not be lost. *Would remove it:* a rule that fires on the Nth watch
   after another, and waits for the company to be at a place to be told, or an action whose Result is several beats.
2. **Results cannot vary** (Grand Tour 6, as told): the Quiet of the Mouth reads differently to a face and to a bare mouth, and
   the Door reads in four ways. I did it as the brief said, with an action that asserts a relation and rules that say the
   outcome, each `once`. It works and reads well; the cost is that the rule's words come after the Result, never before it.
3. **A failed check costs nothing but its minutes.** Four attempts at Peck in a row are four tries. I made a failure shut him
   for six hours (`gt_peck_retry`, a measure per actor, `On failure { Set … }`, and each check `Requires watch(clock) >=
   …`): five lines of boilerplate for what should be a property of the check. *Would remove it:* `Resolve check(actor, skill,
   dc) once per N hours`, as the page already says "one try" for a check that cannot be repeated.
4. **A refusal cannot say why.** `refusesService(tibb, party)` withholds the standard lodging action but nothing tells the
   player why: the bed is simply not offered. I wrote a topic for each reason (`gt_tibb_masked`, `gt_tibb_cold`) and a
   rule per reason. *Would remove it:* a `because "…"` text on `refusesService`, shown on the choice greyed.
5. **`Known as` is not obeyed by the talk label or the choice's heading.** The page prose says "an old man by the stove" but
   the button says "Talk to Absalom Peck", and the heading of the choices says "Absalom Peck, the oldest of the Bare …: Take
   your leave". I wanted the old man's name to be learned (Tibb, himself, the Rounds). I dropped `Known as` for him, gave him
   a neutral Role, and made the thing to learn his office (the Serene). *Would remove it:* the talk label and the heading
   read `Known as`.
6. **There is no way to ask what a company is.** The monk's arc cannot say "if the company has a monk": the cord is taken by
   action, and any calling may take it, a thief as well as a monk. It is a fair choice (the Order does not ask what you were)
   but it means the arc can be taken by anyone, and a monk's advantage is only skill (climbing, mending, insight, tumbling).
7. **A window for a company's own events.** The Nine Quiets are nine "from this hour to that, at this place, for a company
   that holds X, once met or missed, shut": nine opening rules by hand and one generic pair. A variable-bound measure
   (`mo_day(?q)`, `mo_to(?q)`) in a rule's condition and `{?q}` in its `says` made the generic part possible and reads well;
   an `Occasion`-like construct per company would remove the nine.
8. **An action that ends a conversation.** After an action with a `Speaker`, "Take your leave" is gone: a journey that
   wrote it has to write `?Take your leave`. Not wrong, only a surprise.
9. **The lint's "explains the implementation" fired on "flags"** in the sense of flagstones (a street's paving). Replaced
   with "stones", "paving" and "floor". The word is common in a city of wet stone; the check might ask for a verb.
10. **The names check compares every adventure's surnames.** Quill (Low Water) and Pask (The Long Man) were already taken and
    the lint's legacy check errors on them; with ten authors in one module the same will happen between authors. *Would help:* a
    list of surnames already in use, in the AUTHORS brief.
11. **The rented face is returned at the Ninth Bell, wherever the company is** (spine rule): a test that rents a face and
    waits until evening finds itself bare. Right for the design, a trap for a journey.

## What is thin or unfinished

- **The Hospice's other Bare are four of eight or nine**, each with a day topic and a night topic and no thread. The cartographer
  and the pilgrim carry a small ache; the physiognomist and the drummer carry a joke. A fifth and sixth lodger, and one thread
  among them (a lodger who is put out on the fourth day, whom Quiet 4's woman could be), would have made the gallery a
  place and not a list.
- **Tibb has no thread of her own** beyond the Questions and the string: her motive (she has sent eleven out and one in) is
  said in a night topic and read in the fates; there is nothing the company can *do* for her except Quiet 7, which is the monk's.
- **The Peck telling is long**; each rule keeps under ninety words and the whole is about four hundred. I would cut it before
  I would split it.
- **Peck's route to the Hearing** is not built: `gt_peck_easy(peck)` is a Bare witness, but I did not write the Hearing.
- **The Quiets' consequences in the city are local**: a child, a clerk, a cartographer, a woman on a step. Only the Hoard (the
  Order's store, and the Door's supper) and the Face (the Door held as a person holds it) change the Drawing. Quiets 1 to 5 end
  in a line of the closing account and an effect on a person; none of them reaches Vane or the Urn, on purpose.
- **Pavane, Rill, Cosimo, Vail and Hobb speak in my voice**, in my topics with them. If their own files give them an idiom
  that is not mine, mine should be rewritten to theirs.
- **The Hospice does not know the Warrant** beyond one line (the *summons* column and an observation): the Gatehouse is the
  integrator's.
- **`mo_door_speak`** hands the Drawing a Brother who has spoken: I set `moDoor` to 0 and said no more, since what the speech was
  *of* is the integrator's; it needs `urn_hollow` to be offered.
- **The tests were played against a module with stubs** for the foreign persons (`zz-module.json`, uncommitted); they point at
  the real campaign by default and `OMBRA_CAMPAIGN` overrides. They cannot pass on the real campaign until the other files
  exist, and where the real persons stand differently (Vail, Pavane, Rill, Cosimo, Hobb) the walking steps will have to change.

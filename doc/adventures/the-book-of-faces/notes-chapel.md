# Chapel Island: notes from the author of `chapel.kyr` and `cleric.kyr` (A6)

*Prefixes: `ch_` (the Chapel), `cl_` (the cleric). Test files: `test/ombra-chapel.test.ts`, `test/ombra-cleric.test.ts`.*

## What is built

### chapel.kyr

**The Lamp-Room** (the scene of the death; main). Six things at `lamp_room`, each looked at closely (a try, which
gives a crude reading) and then read by a different skill: the stubs (insight: the order and temper of three visits),
the scratch in the wax (trapwork: a Warden's ward-glove), the thread on the mask-hook (lore: the Serene's gilt), the
shavings (woodcraft: a cooper), the mark under the table (mending: a child of nine), the cut cord (mending: a clerk's
tape, tied kindly, after she was past help). Looking at the stubs alone gives `ch_quick_reading`, a clean story that is
wrong in a useful way: the last visitor, who arranged her, killed her (the lead leads to the clerk with the Book).
Reading all six assembles `ch_evening` (Nobody killed her; three people were each, for an hour, the worst thing
that happened to her night; she was dead before the clerk came, and the cooper found a woman already dead).
Teaches `serene_saw` directly; `lacke_unfaced` by a rule on the glove plus `ch_threat` (what Father Ansel heard through
the door, got by an insight check at night, by his trust, or by having read the whole room); `pip_saw` by a rule on
the child plus either `rounds_known` or `ch_boy_known` (the Owl route: Father Ansel to an Owl; or the verger).
Routes without skill: Jonas Heddle's pan of oak shavings (help him trim for an hour, masked) and the Owl.
Consequence: the room proves the Warden's crime without the confessional's seal (see cleric). Later effect: Father
Ansel, the verger and the penitents answer differently once the evening is read.

**The Stranger's Burial** (local). A Bare tagged NINE lies on the Chapel steps. The boot holds a card: Edric Salt,
chandler of Wennick, asks that his name be cried once, aloud, in a square. Approaches: by rite (a Hearer: the stole
from Father Ansel at night, rites check, the Cuff; the Chaplain "at his prayers"); in the reeds at night (Father Ansel
looks away and says where a heron stands; woodcraft finds firm ground, digging digs; without the firm ground the
Flood gives him up on day 6); by Rill's ferry (in a Gull's face, only if you know the name; Gull goodwill +1; Rill:
"I'm doing it for the Gull"); Mother Tibb's cellar (no). Default: the porter tips him into the Cuff on the fourth
morning. Second face: crying the name (bare: free; masked: the Watch counts it, one heat), which leaves a taper on the
lowest step and a blank wooden oval in the nave. Later effects: Father Ansel's trust (he will say what he heard), fates.

**The Choir** (comic, local). The children cannot sing the Assessor of Weights, whose Office is addressed as the
Pound. Lore (the Pound is an ounce short: "a short beat") or two coin of almonds. Fate line at the Drawing.

**People:** `chaplain` Father Ansel (public: veil, a cold line to the bare, answers as the face is met; private: vestry,
unmasked, says her name, the seal, the lamp-room), `ch_verger` Jonas Heddle, `ch_corrow` Mistress Odell, `ch_choir`.

### cleric.kyr

**The Confessional.** Father Ansel gives up the grille to a Hearer (`hearer(party)`: a member who brings `rites`).
Three penitents, nights 3, 5, 7 (20:00 on), one after another, each telling more to someone trusted: `cl_cooper` (the
Serene, who ran from a dead woman and cannot take the mask off), `cl_warden` (Lacke, who performs two nights and then
says what he did), `cl_clerk` (Pell, who has the Book and posted it to Nobody). Per stage: a topic (the confession), a
skill check (insight, persuasion; insight, lore; lore, persuasion; then the penance: rites, rites or persuasion hard,
insight), and a no-skill silence that earns trust (`cl_wait_with`). Stage three is the decision: absolve (nothing
changes) or a penance (it costs them something and may change them); a thin confession for those whose trust is under two.
Seal: `cl_sealed(fact)`; the Warden's confession can be laid before Vail (`cl_tell_vail`) at the cost of the grille, of
Ansel's trust, of the clerk coming (and of the true blessing); or his crime can be proved from the lamp-room
(`cl_tell_vail_proof`); or the penance can make him report himself. Rewards: the Hearer's stole (insight), a title (`cl_hearing_kept`),
Ansel's lesson (`calm_emotions` by `learn_reward`), the Hearer heard (`endow` wisdom by one), milestones.
**The Blessing** at the Drawing (`hand_blessing`): bless the Draw (a lie blessed; `handWay` 1), refuse it (the
Drawing cannot lawfully be held; 2), or bless the people and not the Urn (rites; needs `urn_hollow` or the Serene's
sealed word; not if the seal was broken; 3).

## Ids other files may read

`hearer(party)`; `chaplain`; `lamp_table`; relations `cl_assigned`, `cl_seal_broken`, `cl_pell_penitent` (Pell has been
heard at least once: post.kyr), `cl_pell_released` (Pell has agreed to put the Book down; `cl_chit` is given),
`cl_hobb_unburdened` (the Serene will take his mask off; serene.kyr), `cl_hobb_eased`, `cl_lacke_spent` (the Warden has
laid the Key down: counting.kyr), `cl_lacke_reporting`, `cl_lacke_reported`, `cl_blessed_lie`, `cl_refused`, `cl_blessed_true`
(drawing.kyr/endings.kyr), `handWay(hand_blessing)` 1/2/3; `ch_buried`, `ch_name_cried`, `ch_choir_ready`, `ch_ansel_trusts`,
`ch_evening` (fact); the penitent entities `cl_cooper`, `cl_warden`, `cl_clerk`. `cl_pell_felt` is set when the company
holds the Book and knows Pell's sealed word without his release (a fate line). The blessing's third way also opens to
`knows(party, cl_hobb_urn)` (sealed), as an additional way to know the Urn is empty; nothing else teaches `urn_hollow`.


## Friction (Kyr, Deem, the engine)

1. **An action cannot be pinned to one place.** `Action x(actor, site: place)` binds `site` to any place; to say "only
   in the lamp-room" there is no `site == lamp_room` (entities do not compare), so every such action says
   `at(actor, lamp_room)` as well as `at(actor, site)`. *Instead:* the redundant `at`. *Remedy:* `site: lamp_room` as a
   typed parameter (a constant), or `Requires at(actor, lamp_room)` read as the binding.
2. **A person's name in an action's label ignores `Known as`.** `Say nothing, and wait with {who}` prints the person's
   declared name, not the alias the page uses until the company has learned who they are; for the three penitents that
   gave away the Warden before the Hearer had read him. *Instead:* the penitents are declared as "the first penitent",
   "the second", "the third", and their `Role` says who they are only once known. *Remedy:* interpolations should take
   the alias a `Known as` gives.
3. **An action's check is a constant.** The second hearing of a penitent should be harder for someone he does not trust;
   `Resolve check(actor, persuasion, dc_fair)` cannot read a measure. *Instead:* trust gates two topics (a thin confession
   and a full one), and gates the penances by `Requires`. *Remedy:* a `dc` that is an expression over the world, or `Resolve
   check(... , dc_fair + cl_trust(who))`.
4. **A `Result` cannot vary.** Several moments want to read differently by the penitent's trust, the time (a rite on the
   steps by night against by day), the company's mask. *Instead:* results are neutral and the variation goes in gated
   observations (the nave's wooden oval for a cried name; the saucer on the lowest step by night). Friction 6 of the Grand Tour.
5. **A rented face goes home at the Ninth Bell.** The Confessional is the one place where a masked person is answered
   bare by night; a masked Hearer at night (a penitent in the Hearer's chair) is only reachable by renting a face after
   dusk. The test does that. It is the spine's rule, and a good one; noted because it makes the masked-Hearer case
   hard to write by accident.
6. **Observations told by `tried` repeat on every view.** `Observe ... when tried(ch_tapers, looking)` is told every time
   the room is described, so the quick reading would be a long paragraph in every later view. *Instead:* the condition
   carries `not knows(party, ch_quick_reading)` and the observation `teaches` it, which makes it tell once. *Remedy:*
   an `Observe ... once`.
7. **No lesson in the catalog can be a reward.** `Resolve reward(lesson, recipient)` (care.kyr's `learn_reward`) calls
   `FieldUse.perform` with the lesson's own effects, and admits only abilities whose effects are all `learn` or `gain`;
   there is none in the shared catalog (`guard`, `calm_emotions` and the rest have effects and are refused: "Unsupported field
   effect"), and no kyr declaration of one. *Instead:* the reward is the Hearer's stole (an item that grants insight), `endow`
   wisdom and experience. *Remedy:* a way to declare a lesson in a module (`Lesson x teaches guard`), or `learn_reward` to teach
   a catalog ability by `learn` directly.
8. **The surname rule across adventures** (`kyrie lint`'s `names`) is strict: Brack and Corrow were taken (one a place).
   Found by lint; renamed (Heddle, Odell). A stub in `zz_stubs.kyr` also trips it (Hobb).
9. **A test cannot force a check.** A journey that needs a penance to take has to find a seed. I wrote the happy path
   with a seed found by trying fourteen (`a6-h2`); the others are written to hold either way. *Remedy:* `kyrie play
   --force "insight=success"` (or a Journey option) for tests.
10. **`Take your leave` is not offered after a topic from outside a talk** (the Owl topic opens and closes a talk in one
    step); a journey step for it fails. Harmless; found in a test.
11. **Hearing nights outlast the night's clock.** Three penances in one evening (an hour each) overran a window written
    to eleven; the Confessional's night runs to midnight, and Father Ansel's vestry with it.

## What is thin or unfinished

- **The Heronry grave** is only a place and a check: the reeds do nothing to the heron or the Heronry's writ, and the
  ranger's arc does not read `ch_buried`. A hook is there (`ch_burial_way(party) == 2`).
- **Rill's ferry** assumes only that she can be found with the company; she is the drip author's, and the test finds her by
  waiting where she is. In the real module the test is skipped if `rill` does not exist.
- **Father Ansel's seal about the Registrar's own confession** is a topic with no consequence beyond trust; what she told
  him (the Urn is empty) is carried by the Serene's sealed word instead.
- **The Warden's report** (`cl_lacke_reporting`) is promised, not tracked: nothing checks whether he goes to the Gate.
  The fate line says only what the Hearer's penance asked of him.
- **`cl_refused` and `cl_blessed_*`** are read by nothing but my fates: drawing.kyr and endings.kyr are to read `handWay(hand_blessing)`.
- The choir is a comic scene with one real choice and a fate; it has no second face.
- Penitents are by schedule, not by presence in the room: a company that sits at the grille from eight in the evening
  until midnight hears them in order; one that comes late hears what remains.

# The Wet Stage: notes on `bard.kyr` (A9)

*The bard's file: the Licence, the Lampoon, the Censor's Cue. Prefix `bd_`. Persons: `orme` and `ludd` (as the table
gave them), and `bd_quist`, `bd_finch`, `bd_crake` (named Tarrow and Venable, since Quist and Crake are taken in other
adventures, and the repository's `names` lint says so).*

## What the file builds

**The house.** Three rooms of the spine (pit, green room, flies) and two added inside the Stage: `bd_stage` (the boards)
and `bd_prompt` (the prompt-corner with its slit). Every room has a scene for the Masked Hours and for the night, and for
the house shut. Five people, each with a cold line for a bare face by day, an answer for a customer's mask, a colleague's
for the Moth (and the Crow, for Ludd), and a private register at night.

### 1. The Wet Stage's Licence

*Person:* Madame Orme (55, the manager; in a grey Moth half-mask and a pearl choker of which every fourth pearl is paste).
Twelve years ago the Stage was shut nine months after a farce drew an Assessor so exactly that a woman in the third row
said his name; two Moths died that winter in the Drip. She blames the walk of Venable's father, who played him. The line
that did it was hers.

*The clock:* on the fourth day at noon the Warden's clerk comes. The licence is kept if **(a)** the Reader has sealed
the season's play (`bd_sealed`), **(b)** the Codicil's footnote has been put to the Reader, who is by its last clause
"the judge of what is a play" (`bd_codicil`; lore twice: to read the print and to hold it against a lawyer), or **(c)**
twelve coin have been paid (`bd_fee_paid`). With none, it is withdrawn (`bd_revoked`): the Moths scatter, the house goes
dark, and the Lampoon has only the Drawing. A Reader who is the company's friend (`bd_ludd_regard >= 3`) walks to the
Warden on the fifth day and has it back (`bd_restored`); twenty-four coin buys it back too.

*Approaches that differ in what they cost:* the seal (no charm: a Crow's face, and a stranger who truly does not know;
or a promise kept in the dark), the footnote (learning, and Ludd's pride: he is outwitted and does not forgive it), the
fee (coin, no relationship, nothing learned). *Later effect:* the house open or dark (scene, who is where), the fates.

### 2. The Lampoon

The bard's arc. *Material:* nineteen tales (`bd_t_*`), each worth laughter, grief and anger (`bd_funny`, `bd_grief`,
`bd_anger`); fifteen come from what the company knows (`knows(party, lacke_taxed)`, `roundDone(party, r_ferry)` and so on:
the Warden's Lock-tax, his call on the dying Registrar, the Short Pound, Rill's boat, the year of the Sluice, the girl who
was drawn Treasurer, the Heron and the Lamp, the retainer dusting, the Contessa's stair, the Rain-Wives' tally, the empty
Urn) and the rest from the Stage (the Reader's chest of cut jokes, the Reader's Joke at his door, Tarrow's Walnut, the
Candid's tracts, the Dark Year, and Finch's elegy in three endings). The prompt-book has five leaves. A tale may be
**sharpened** (a line that cannot be proved: +2 laughter, and a lie on the account) or **softened** (the person it would
hurt left out: less anger, more grief), and a tale with a keeper (Peck, Rill) is used with leave or without.

*Decisions that cost:* the **target** (the Warden; the Candid, who is right; the Contessa; the Urn), the **form** (farce:
laughter; elegy: grief; ballad: anger and grief), the **cast** (the Moths, Orme, Tarrow, yourself), the **rehearsals**
(four checks: performance on the boards, lore on the old forms, persuasion with Venable, deception under the Reader's
pencil), and **when** (the Stage on days six to eight, if the house is open; or the Hall of the Urn at the Drawing,
which costs a point of heat). Target and form are committed (`Grave`).

*The house takes it by what it was:* twelve written receptions (target by form), each with its flags, a flop for each form
if the night is too thin (it does no harm, only a play), and a great night above the threshold (+4). The flags other files
may read are below. The player's own turn (the principal part) is a performance check whose effect is told after the house
is.

*Rewards:* the Moth's tongue (a `Kind` granting performance), a lesson from Orme (`endow` charisma), a lesson in falling from
Tarrow (`endow` dexterity), the Moths' likeness-kit from Venable for a great farce (a `Kind` granting deception; a spell
could not be taught, see the friction), a song the Drip sings (an Observe in the bread-market; one near Moll), and
milestones (eight, 25 to 75 each).

### 3. The Censor's Cue

*Person:* Master Ludd, the Warden's Reader, who prefers that to censor. He strikes every joke under three heads (the
third being a joke funnier than the reason he would have to give for striking it) and writes his reason in the margin, and the
reasons are jokes. He keeps every joke he cuts, in a chest, and writes small plays in the margins, which he plays to the
empty house at night, unmasked, both parts. The Joke at his door: *"I was cut at eleven this morning."*

*By day (masked):* a customer is a stranger he may put three jokes to (the third head: if two of three can say whom a
joke is about, it is struck). A company that knows the Lock-tax cannot be a stranger: it may tell the truth (he is relieved,
and strikes nothing yet), lie (deception: it passes, and he knows), or be exposed. A Crow is a colleague and shows the
margins. A Moth is a player with sides to learn. By night, from ten until one, he is on the boards: the company may watch
through the slit (no check), see it in his hands (insight) or find him.

*What moves him is being read, not being shown evidence.* Once told, he asks what the company means to do about him:
**keep silent** (a promise: he shows the chest, seals the season, and is a friend); **read the Joke's part opposite him**
(performance: he is written into the Lampoon, and sits in the Warden's box mouthing it); **threaten** (intimidation: he
seals whatever he is given and will not look up); or **tell the manager** (he is dismissed by morning, and the play is not
cut at all). *Whatever the company does it changes the Lampoon:* an unfreed Reader takes two off its craft; a friend adds
three; a reader four; a dismissed man three; the threatened two; passed sides (deception under another name) two.

## What other files may read

| Id | Meaning |
|---|---|
| `bd_lacke_laughed(party)` | The Lampoon, a farce aimed at the Warden, had a great night. counting.kyr: he resigns. |
| `bd_lacke_spent(party)` | An elegy aimed at him was played (fair or better): he goes quietly and gracefully, unaccounted for. |
| `bd_lacke_stung(party)` | A farce or ballad aimed at him was played and was not great: he laughed it off, or the room sang at his window. |
| `bd_lacke_mobbed(party)` | A great ballad at him: a crowd at his window in the small hours (heat +1 is charged here). |
| `bd_candid_weak(party)` / `bd_candid_strong(party)` | A farce of the Candid weakens her movement; an elegy or ballad for her strengthens it. |
| `bd_hill_stung(party)` / `bd_hill_moved(party)` | The Contessa and the Old Names: offended by a farce or ballad; moved by an elegy. |
| `bd_urn_laughed` `bd_urn_mourned` `bd_urn_angry` `bd_urn_told(party)` | The Urn: laughed at; mourned; sung at in anger; and told, in the middle, to be empty (only if the empty Urn was set down). |
| `bd_room_angry(party)` | A ballad made the room angry. |
| `bd_mood(party)` | 0 a flop, 1 laughter, 2 hush, 3 anger. `handWay(hand_lampoon)` carries the same code. |
| `bd_played` `bd_reacted` `bd_flopped` `bd_great_night(party)` | The Lampoon was played; the house took it; it flopped; it was a great night. |
| `handReady`, `arcBegun` | Asserted when the Lampoon is ready (three leaves, aimed, cast, rehearsed once). |
| `handPlayed(party, hand_lampoon)` | Asserted by the Hall action, or by the echo at the Drawing when the Stage's Lampoon went well. |
| `bd_lies(party)` | Number of tales sharpened with a line that cannot be proved. The Stage's closing account reads it. |
| `bd_revoked(wet_stage)` `bd_kept` `bd_restored` | The licence. |

`bd_ludd_gone`, `bd_written_in`, `bd_ludd_trusts`, `bd_ludd_leashed`, `bd_crake_knows` are the Censor's and Venable's
branches, for anyone who wants to read them (the closing account here does).

## Friction (Kyr, Deem, the engine)

1. **The name leaks through labels.** `Known as` hides a masked principal's name on the page, but the engine's own "Talk
   to Madame Orme" label and any `{orme}` in a topic's or action's label say it. I wrote labels in pronouns ("Ask her what
   is playing"). *Would remove:* labels that resolve through `Known as`.
2. **`Greets` cannot vary.** A person who is in the third row by day and on the boards by night, masked and not, has one
   `Greets`; a second one is "Duplicate entity ludd_greeting". I wrote one that holds for both. *Would remove:* `Greets`
   variants by condition, as `Role` has them.
3. **`Time 1 hour.` is refused in an action** ("Expected '.', 'minute' or 'minutes'"), though a passage takes hours. I wrote
   `Time 6.` (watches). *Would remove:* hours in `Time`.
4. **`Resolve reward(lesson, recipient)` cannot teach a bard anything.** It accepts only abilities whose effects are
   empty or `learn`/`gain`, and only the twenty in `data/catalog/abilities.json` are entities (Orsino's `minor_image` is
   not: "Invalid argument"); `echo` and `pratfall`, which compile, fail at play time with "Unsupported field effect". I
   gave an item (the likeness-kit, `granting deception`) and an `endow`. *Would remove:* a lint on the lesson's effects at
   compile time, and Orsino's spells as entities.
5. **A string cannot contain a straight double quote** and has no escape; satire quotes its target's pamphlets. I used
   curly quotes inside speech. *Would remove:* `\"`.
6. **Results cannot vary, and a Result comes before the rules.** The player's own turn on the boards (a check whose
   result is the nerve) arrived before the house had been described. I made the action's Result neutral, set a flag, and
   put the nerve in a rule placed after the house's. A rule that reads a flag set by a rule *below* it fires on the next
   watch, which reorders the page. *Would remove:* ordering by `then`, or a Result that can name a continuation.
7. **A table of measures per entity is nineteen lines of `Initially Set`.** `Increase m(actor) by w(tale)` works (a
   measure of another entity read inside an Increase), which made the tales a data table, but declaring the table has no
   syntax of its own. And "this tale is available" is nineteen silent rules (`bd_has_*`) because an entity cannot be
   offered `when` a condition.
8. **Who attends.** A Lampoon aimed at the Warden should be played to the Warden. I cannot move `lacke` (counting.kyr's),
   so the Reader sits in the Warden's box as his eyes, and the flag does the rest. *Would remove:* nothing; this is the
   right way, but a person one is told to be at a place on an occasion would say it in a line.
9. **A Speaker action is offered only inside the talk.** A step that leaves the talk first does not find it (the
   journeys' `^Take your leave`). The right behaviour, but the journeys' idiom must be learned: a test that "asks and
   takes leave" and then acts is mistaken.
10. **A Grave takes one step in a journey, not two** (the first asks, and the same step then does it). It reads, in a
    transcript, as "asked first" followed by the act.
11. **The repository's `names [legacy]` lint** reports `ludd` (Hollins has a Hob Ludd), `quist` and `crake`
    (Winter in Carth, A Parliament of Books) as clashes of surnames across adventures. I renamed mine (Tarrow, Venable). The brief
    names `ludd`; that clash remains: it is one id, three letters from a Hollins person, and the integrator will want to
    decide whether the check applies to a module that is not in the legacy set.
12. **`Observe ... near moll`** works from another file; and `Topic ... with moll`: no friction. Noted because the brief
    expected some.

## What is thin or unfinished

- **The Lampoon's effects on the city are flags.** I cannot see whether counting.kyr reads `bd_lacke_laughed`, or whether
  drawing.kyr reads `handWay(hand_lampoon)` and the `bd_*` relations above. If they do not, the fates here are the only
  place the Lampoon is read, and they are written to stand alone.
- **Peck's and Rill's leave** (two actions with a `Speaker`) were tested only against stubs; whether they are where I need
  them at the hours I need depends on their files. A tale used without leave leaves no trace but the grief in the fate
  lines of the people it came from, which gate.kyr and drip.kyr could write.
- **The Contessa** has two tales (the stair; Gaspar dusting) and no person of mine. The Candid has one (Finch's tracts).
  Neither has a scene of its own at the Stage: they are only targets.
- **The Dark Year complication** (Orme's line, Venable's father) has a real choice (tell Venable: `bd_tell_crake`) and two fates,
  but it does not touch the Lampoon's craft. A Venable who knows and an Orme who is on the boards with him could be a
  third scene; there is no room for it.
- **The prompt-book's "read back"** is an Observe (a funny book, a quiet one, an angry one); the player does not see
  numbers, and a company that wants to know whether a farce is possible with only grief on the page learns it by
  flopping. This is meant, and may be unkind.
- **Weights were tuned by playing** (a fair farce on four tales from the Stage's own people is 17, a great night 20) not by
  statistics; the thresholds (14/20 farce, 13/19 elegy, 18/24 ballad) are in `bd_fair()` and `bd_great()`.

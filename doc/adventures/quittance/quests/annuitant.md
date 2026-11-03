# The Annuitant (`q_annuitant.kyr`, prefix `an_`)

## Premise

The Sovereign Mutual has paid an annuity to "Mrs Jessamy Oakes, aged 131" for ninety-four years. Pennington Cray, who
is paid by the denial, will stop it on **Monday (day 2) at noon** (watch 312). Seven people in the Mortmain almshouse
live on it. "Mrs Oakes" is a succession of women of one family, each taking the name when the last has died; the present
one, Tamsin, is nineteen and plays a ruin behind shawls and an ear-trumpet. The second cup on the tea-tray is for the
one who had the name before her. The policy was drafted in the exact, generous style of the Founders: it pays "so long
as Jessamy Oakes shall be living **in her name**", and the family has honoured it to the letter.

The dilemma: protect seven people with a lie, or tell the truth to a man who will use it. The complication: the lie is a
form of truth, and the wording that proves it (taught as `d_wording_style`) is Honora Quill's.

## People and places

- **Pennington Cray** (people.kyr, `sov_floor`; on Monday morning, watches 294 to 311, in the almshouse day-room reading
  the stop). `arc(cray)`: 0 bonus-minded, 1 remembers his mother, 2 an ally. He cannot be moved by evidence; he already knows.
- **Mrs Jessamy Oakes / Tamsin** (`an_oakes`, `oakes_room`), **Mother Mawdsley** and **Mr Tarbuck** (`an_mawdsley`,
  `an_tarbuck`, `alms_room`; two of the seven), **Josiah Wragg** the sexton (`an_wragg`, `catacomb_head`).
- Added place: **the third terrace** (`an_terrace`, a path from Annuitants' Row), where a stone has no brass plate: Cray's
  mother, who was linen and not an annuitant. Its sun was scratched in with a nail by a child.
- Things: the Oakes policy (`an_policy`), the sexton's register (`an_register`), the Oakes vault key (`an_oakes_key`),
  the grating on the catacomb stair (`an_grate`, on `catacomb_stair`).

## The matter, as a number

`an_status(party)`: 0 pending, 1 held (Cray sits on the stop; it falls on day 5 if nothing else is done), 2 secured,
3 deferred (bought, shamed or forged; it comes undone at the start of day 6), 4 stopped, 5 restored (stopped, then
reinstated), 6 exposed (stopped for good). If the company is absent on Monday, rule `an_monday` strikes the stop at noon
anyway. The stop can be taken off afterwards (wording, or the tea) but not by bribery or forgery.

## Approaches

| Approach | What it needs | Result |
|---|---|---|
| Find the wording | policy from the Life Office press (adjuster's licence, or Cray's leave, or lockwork) or Tamsin's copy; `lore` fair to read it; failing that, Mr Tarbuck reads it | status 2 (or 5), regard(sovereign) +1; arc(cray) stays 0; teaches `an_wording`, `d_wording_style` |
| Ask about his mother | learn the grave (Tarbuck, or the third terrace seen); `insight` fair | arc 1, status 1, then a clock to day 5 |
| A witnessed kindness | rations given out in the day-room while Cray is there on Monday morning | arc 1 (status 1) |
| Win him fully | arc 1 not by bribe; Tamsin's trust; ask him to tea; she takes the shawls off before him | arc 2, status 2, `witness(cray)`, regard(sovereign) +2, the Life Office books (`an_quill_annuity`) |
| A better bonus | ten coin | status 3, arc 1 but bought (cannot reach 2), `an_slighted_sovereign`, regard(sovereign) down one |
| Shame him | Monday morning, day-room, `persuasion` hard | status 3, `an_shamed`, `an_slighted_cray`; Cray will not be spoken to again |
| Forge the certificate | at the Life Office, `deception` hard | status 3 (status 2 if Cray has been moved to arc 1 first); undone on day 6 with `an_slighted_sovereign` and regard(sovereign) down two. Failure: status 4, `an_slighted_cray` |
| Expose | knowing the truth; a grave action | status 6, regard(sovereign) +1; the almshouse keeps no hearth; the sexton is cross |

## The grate on the catacomb stair

`an_grate`, locked and blocking. Ways: the burial office over the worn sun (`rites` fair, the cleric's door); the
sexton's leave (a Promise to carry his register of the unclaimed to Tench; or, free, if the seven were saved); the Oakes
key (trust); lockwork or brawn (noisy: `an_grate_forced`, `an_wragg_cross`, `an_slighted_sovereign`, regard(sovereign)
down one). It is the quiet way down: it arrives at `catacomb_foot`, from which the bone passage leads to the Queue.

## What it writes into the contract

Writes: `arc(cray)` 0 to 2; `regard(sovereign)`; `keeper(mort)` (Mother Mawdsley, when status is 2 or 5);
`witness(cray)`; `sextonLeave`; `d_wording_style`; own discoveries `an_claim an_truth an_wording an_cray_mother
an_quill_annuity`. Reads: `hearthAt(alms_room, mort)`, `queueOpen`/`qu_register_given` (the Promise's condition).
Relations for the Hearing to read by name: `an_slighted_cray`, `an_slighted_sovereign`, `an_exposed`, `an_shamed`,
`an_bought`, `an_forged`, `an_wragg_cross`. Measure: `an_status`.

## Build matrix

Cleric: the grate by rite; Tarbuck/Mawdsley need nothing. Insight: Cray's mother; Tamsin's hands. Lore (mage): the
wording. Deception: the certificate. Persuasion (bard): shaming. Thief: the press, the padlock, the Oakes policy.
Brawn: the grating. A plain company: coin (the bonus), rations (the kindness), and the key, if it was kind to the girl.

## What changed from the brief

- The "lever" for arc 0 to 1 is split three ways (mother, kindness, bonus); the bonus is a cheap one-way door that
  cannot reach 2.
- Absent company: the stop falls and the file can be reopened; it is not lost.
- The sexton's register ties the stair to the Queue (a Promise kept by Tench's receiving it).

## Weakest part

Tamsin's trust is one conversation: the "sixth Mrs Oakes" scene wants a second visit and a visit from the other
women of the family. The shaming and the bonus are both short scenes in a long file; Cray's refusal to be asked
anything once shamed is correct but abrupt. The late-restoration rule (`an_win_late`) is generous.

# The Surveyor's Daughter (`q_surveyor.kyr`, prefix `sd_`)

**Lantern Hill and the Brickfields. Romance; a game of timing and places. Clock: the householders' drill at ten on day 3; the Guild's
list closes at noon on day 5.** Tests: `test/quittance-surveyor.test.ts`. Friction: `friction/sd.md`.

## Premise

Ianthe Corbett surveys risk for the Guild and climbs roofs. Tobias Pargeter, a fireman of the Phoenix, has been writing to her through a
loose brick in the Guild's garden wall for a year and a half, about his mother's sandwiches, and neither has said a word aloud. The
Corbetts are the Lamprey's friends (a fish over the door; Septimus Corbett has one leg and forty years of the Office's good opinion); the
Pargeters are the Phoenix's (nine of them in blue in a portrait). Ianthe has measured the Pargeters' house in Dyers' Alley twice: the
flue has cracked along the wall it shares with the die-works. The Rule says Decline. A Declined house is uninsured, and a fireman with an
uninsured house is struck off. She has not written it. **She is not deferring for his sake; she is deferring because she wants it to be
sound, and will not lie to herself.**

## People and places

Ianthe (study; the Guild by day 9-17; the lantern gallery at dusk 17-19). Tobias (his front room). Mr Tinniswood, clerk of the Guild:
"the model is closed to everyone", Phoenix men not admitted "on account of the pins". Septimus and Lettice Corbett (study).
Nathaniel and Hephzibah Pargeter (walk from the fire-house yard to Surety Hill for the drill and back to dinner: real Pursuits).
Places added: `sd_lantern` (the lantern gallery over the Belvedere) and `sd_roof` (the Corbetts' roof). Things: `sd_rungs` (the way up),
`sd_pin` and `sd_pump` (the drill), `sd_flue` (the Pargeters'), `sd_survey` (blank / declined / rider / forged).
Found from the Slate (SURVEYS OVERDUE), the Guild's board, the study plan-chest, and Mr Tinniswood.

## The assignations (each warms Ianthe by one: `sd_warmth`)

| # | Where and when | Contrivance that opens it | Skill/kit |
|---|---|---|---|
| 1 | the lantern gallery at dusk, 17-19 | Tobias told (the Topic); a way up | `climbing` (drainpipe), or the Guild's folding ladder (2 coin deposit), either lets Tobias up the rail |
| 2 | the Guild's model by day, 10-16 | Tobias told, and Mr Tinniswood cleared | the adjuster's licence (certify a witness); or five coin; or persuasion (a try that can fail and shut the talk door) |
| 3 | the householders' drill, day 3, 10-12 | the drill goes wrong, and Tobias goes up after her | stealth (draw the ladder's pin) or brawn (wrench the pump-handle); left alone it goes right, in public |

If Tobias has joined the company the same doors open for the company in place of his walk (his place is `travelsWith(tobias, party) and at(party, here)`).
That branch is **not played in a test**: his recruitment belongs to another author and `willing(tobias, party)` cannot be set from a Journey.

## How Ianthe decides (`arc(ianthe)` 0 to 1)

- **An example.** Mr Tinniswood will say that Surveyor Hargreave passed the Candlewick pump-house against the Rule in 1307 on a form
  of his own, "Passed, subject to repair within thirty days"; the Guild adopted it as the *Rider*. Shown to her **before she has
  reason to listen** (warmth 0) it moves nothing ("Hargreave is dead"). Shown after one assignation she reads it twice and says: mend
  the flue, then ask me. Mend it (`brawn`, the Pargeters' course rebuilt; or `trapwork`, a sleeve and clay) and she climbs up, signs
  the Rider with her whole name, and passes the house. *Together, honest.*
- **Tobias's honesty.** If Tobias has been told that she has not written it (a Topic marked grave: he cannot keep it) and the drill
  goes wrong, he sits beside her on the roof and says he would as soon be told it was safe as kind. She writes the Decline there,
  on her knee. *Declined, and together.* The Pargeters lose the bird over their door.
- **Time.** At noon on day 5 the list closes; if she has not been moved she writes DECLINED alone, with her whole attention, and
  takes it across the hall. *Apart.*
- **The company's other roads.** Forge her P and S in the study (`deception`, hard; a failure and Septimus catches the company, her
  warmth is reset to nothing and the road closes); in the morning she finds it, initials it, and says nothing for the rest of the book:
  *forged*, the house saved, she is corrupted and gives nothing. Or lend the lovers a lighter at the Water-Stair at dusk (8 coin) once
  she has agreed (warmth 2, a grave Topic): *together, exiled*; she leaves a page of the Roll in the left pocket.

## Outcomes and what they write

| End | `arc(ianthe)` | house | `tobiasWilling` | Ianthe's gifts | other |
|---|---|---|---|---|---|
| honest (`sd_end_honest`) | 1 | Rider, passed | yes | the Roll's page; her word if warmth 2 (`witness(ianthe)`); Mrs Corbett's hearth (`keeper(hill)`) | `regard(brigades)` +1 |
| declined (`sd_end_declined`) | 1 | Declined (`sd_pargeters_uncovered`) | yes | the Roll's page; her word if warmth 2; the hearth | |
| apart (`sd_end_apart`) | 1 | Declined, alone | no | none | |
| forged (`sd_end_forged`) | 0 | passed by a forgery | yes | none | `sd_slighted_guild`; `regard(city)` down by one (floor 0) |
| exiled (`sd_end_exiled`) | 1 | unchanged (survey blank) | no (gone) | one page of the Roll | `sd_gone` |

`d_decline_roll` comes from Ianthe's own Topic (the honest and declined ends) or from Mr Tinniswood for a licensed adjuster. The Roll's extract (`roll_extract`)
is given only by Ianthe.

## Build matrix

Bard/persuader: Mr Tinniswood (a try). Thief: the pin (stealth); the forgery (deception). Warrior: the pump (brawn); the flue (brawn). Monk/climber:
the drainpipe. Anyone with a licence: the clerk, the Roll. Anyone with five coin: the clerk. Mage/cleric: nothing special here; the Rider and the wait are for everyone.

## What changed from the brief and why

- The Pargeters (not "Vane") and the Corbetts are from `people.kyr`. The Lamprey/Phoenix feud is as the brief half-said: the Corbetts are
  the Lamprey's friends, the Pargeters the Phoenix's.
- *Pursuits.* The brief asks for Ianthe and Tobias to move on their own schedules. Neither declares `Uses go`, which only their declaration can; so their hours are rules, and the company never sees either walk. Requested of the lead: `Uses go. Plans 14 steps.` on both. The Pargeter parents (mine) do walk.
- *Time as a lever* is implemented as a deadline (the Guild's list), not as a slow change.
- *Keeper(hill)* is earned from Mrs Corbett only after an honest or declined end and two assignations.

## The weakest part

The assignations resolve in a rule: the company arranges them, then hears them, and the "puzzle" is more a gate list than a deduction (no
dialogue between the lovers that the player decides). The roof scene is told by a rule in a single speech, because neither may be moved
into a place the company can enter. And because the lovers cannot walk, the company never meets them on the road. The forged ending is the most
interesting and the least reachable: it needs a thief and a seed.

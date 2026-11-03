# Mr Teague's Wake (`q_wake.kyr`, prefix `wk_`)

**Lantern Hill. Comic, a funeral. Clock: the Providence pays at four on the afternoon of day 3 (watch 336), or the sum goes to
the Residuary Office.** Tests: `test/quittance-wake.test.ts`. Friction: `friction/wk.md`.

## Premise

Ambrose Teague, cellar-diver, died in his bed insured with the Providence for four hundred, "to my beloved Rosalind". His house
holds two: Rosalind Teague, his wife, who called her husband's name for forty years and was called the Admiral for it; and
Rosalind Harbottle, the lodger, who worked his lifeline for nine. Mr Fettiplace of the Providence has come to take the widows'
statements and will pay the one Mr Teague meant, if he can be shown which. His only witness who was in the room is a parrot.

## People and places

| Who | Where | What they want |
|---|---|---|
| Rosalind Teague, the wife | the Teagues' front room | the money; to be left her house and her dignity; she has both, and does not know she has the second |
| Rosalind Harbottle, the lodger | the front room, her trunk packed on the landing | nothing; she expects to be put out |
| Tabitha Ormerod, maid and Fusby's keeper | the front room | Fusby kept out of trouble and her wages; she knows his order |
| Fusby | the cage in the front room | walnuts; to be listened to |
| Mr Fettiplace (Providence) | the Providence counter, then the wake from day 2 11:00 to day 3 16:00 | to pay the right Rosalind, and to be seen to have done it by the book |
| Mr Skillicorn, undertaker | Surety Hill | the lid on at six on the second evening, boots in |
| the mourners | the front room | the ham |

Places added (all in `teague_b`): `wk_kitchen` (the cold tea-tray with two cups) and `wk_landing` (the lodger's trunk and boots).
Wired to: `teague_front`, `hill_street`. Found from the Slate (day 1–3, "Providence v. a parrot"), the bill on the Teagues' door, the
undertaker's Topic, the mourners, or Mr Fettiplace himself.

## Fusby: the small game

Fusby has a **repertoire**, said in the order he heard it, and a **mood**.

| Slot | He says | What it tells |
|---|---|---|
| 0 | "Admiral on deck. Admiral off deck." | the wife is the Admiral, not Rosalind |
| 1 | "Ros! Hold the line, Ros! The OTHER hand!" | the lodger is "Ros", and was on the line (heardL) |
| 2 | "Four hundred at the Providence, Ros, and not a farthing to the Fish." | the policy, the cheat on the Lamprey |
| 3 | "Rosalind. The tea." and a clink | the wife, or the lodger (heardW) |
| 4 | "It's lit down there, Ros. Somebody's feeding it." | the Hearth Below |
| 5 | "Ros. Rosalind. Fish, fish, fish-bone. Three turns left. Mind the stair." | the combination (the Lamprey's bell-hatch) |
| 6 | whatever was planted | the planted line; or his unaltered "Pieces of eight" |

**Mood** 0 sulky, 1 wary (speaks when coaxed), 2 easy (speaks of his own accord when the dice favour it), 3 showy (after a good
ballad, three phrases in a row, then he sulks). Fed (a walnut) mood +1, up to 2; the ham, a failed song, or a failed ballad lowers
it. **Covered** for six hours he sleeps on it and begins again at slot 0; **the keeper** will tell the order (3 coin) or whistle
him back to the beginning (4 coin).

The pointer only advances: **what Fusby says to an empty room is spent**. A company that lets him run is a company that has
had him say the Admiral, the line and the tea to nobody; asked later, he says the next. Only what is said while Mr Fettiplace
sits by the cage (asked, a quarter of an hour) is heard by the Providence. So the puzzle is to have him in voice, and at slot 1
but not slot 3, when the adjuster is in the chair.

## Approaches

| Approach | Needs | Does |
|---|---|---|
| Coax the parrot | a walnut, a song (performance, fair); an ear for the order (the keeper's 3 coin) | the honest road: slot 1 in Mr Fettiplace's hearing pays the lodger; slot 3 only, the wife; both, half each |
| Plant words | a company that has run Fusby to the end (slot 6); deception, hard | a sentence he will say after his last words; clean, it pays the widow of your choice by a lie; botched, it comes back in the company's own voice and the claim is struck |
| Bribe the keeper | 3 or 4 coin | the order; or reset the bird to slot 0, so a spent line can be had again |
| Read the Rosalinds | insight, fair (or ask the lodger about her hands and trunk, and look at the tea-tray in the kitchen); persuasion with the adjuster | "He meant the lodger": the evidence, put to Mr Fettiplace, pays her |
| Propose a settlement | both widows asked (two Topics); 12 coin to the Office | half each; both widows' friendship; the Providence's good opinion |
| Let it go | nothing | the Office keeps it, and pays the company a third (15 coin): the cynical road |
| Sit the wake | to be there in the dark, before the lid goes on (day 2, six) | the widows soften: the Admiral's story of the hatch; the lodger will tell what the last words mean; and, if paid, a hearth |

## The complication

The last words (slot 5) are not about Rosalind. They are the lock-words of the Lamprey's diving-bell hatch, which Mr Teague used
for nine years to reach what the Office swears is flooded. **Anyone** can work this out by lore (a mage), or be told by Miss
Harbottle if the company sat the wake or she is paid. Doing so teaches `d_way_teague` and asserts `teagueCombination(party)`
(see the kernel contract; the bell shaft's owner reads it). Letting the adjuster hear it is a risk: Mr Fettiplace writes
"fish, fish, fish-bone" down and underlines it, and the Lamprey is told: `wk_slighted_lamprey`, `regard(lamprey)` down one.

## Outcomes

| Paid | How | `regard(providence)` | Else |
|---|---|---|---|
| Lodger | heard slot 1 only; or the argued evidence; or a clean plant | +1 | `wk_friend_lodger`; (fraud: `wk_fraud`) |
| Wife | heard slot 3 only; or a clean plant | +1 for a plant, 0 for the honest road | `wk_friend_wife` |
| Both | heard both; or the settlement (company pays 12) | 0 honest; +1 settlement | both friendships |
| Neither | nothing heard by four on day 3; or the Office kept it; or the plant is exposed | 0; exposure `Decrease … by 2` and `wk_slighted_providence` | exposure: the Providence is not at home |

## What it writes into the contract

`d_way_teague`, `teagueCombination(party)`, `witness(wk_fusby)`, `keeper(hill)`, `regard(providence)`, `regard(lamprey)` (down
only). Own relations the lead asked for by name: `wk_slighted_providence`, `wk_slighted_lamprey`, `wk_fraud`, `wk_friend_wife`,
`wk_friend_lodger`, `wk_paid_wife`, `wk_paid_lodger`, `wk_paid_none`, `wk_testified`.

## Fusby the witness (the risky option)

Once the claim is settled, and either widow is a friend, the keeper will carry Fusby to the Hall of the Five (`wk_lend_fusby`;
it is marked grave). From day 7 `witness(wk_fusby)` brings him there; on the company's arrival he says everything he knows, in
order: the line, the fire that is fed below, the hatch (the Lamprey's chair is the first to move; `wk_slighted_lamprey`,
`regard(lamprey)` down). He cannot be bribed and cannot be asked a question. **If a lie was planted in him, it is told too**, in the
company's own voice: the Providence's chair turns round (`regard(providence)` down by two, `wk_slighted_providence`).

## Build matrix

| Build | Door |
|---|---|
| Bard / performer | coax and the ballad; persuade the adjuster |
| Thief / deceiver | the plant (the only road that pays whom you choose); reading the room is not theirs |
| Cleric / insight | reading the widows; sitting the wake (a rite of sorts); the lodger tells the hatch |
| Mage / lore | works out the combination without anyone's help |
| Warrior, no skill | walnuts, a half-hour of waiting, 3 coin to the keeper, the settlement (12 coin), sitting the night |
| Anyone with coin | the settlement; or letting it go for 15 |

## What changed from the brief and why

- *Fusby as a witness* is kept but has a price: his repertoire is public. Kept as the funniest consequence.
- *Settlement* costs 12 coin to the Office; the brief said "the company then fund half": I could not see a mechanism by which
  the company funds half of a sum it never holds, so the cost is the fee and the reward is two friendships.
- *Day 1–2 / pays on the third day*: the engine's `day(clock)` is 1 on the first morning; "the third day" is `day(clock) == 3`.
- Mr Fettiplace attends only when asked, for a quarter of an hour; otherwise the adjuster hears nothing and the money goes to the
  Residuary at four. That is the abandonment ending: nobody is at fault and everybody loses.

## The weakest part

The parrot's whims. Mood 2 lets Fusby speak when the dice say so, and a random line may be spent on an empty room, or on the
adjuster's ear, before the company is ready. It is the point (a parrot is not a lever), but it is also the single place where a
careful player can feel cheated, and where I had to choose seeds in the tests. A second weakness: the Providence's verdict is a ladder
of mutually exclusive rules whose precedence is the order they are written. And the four hundred never visibly changes
hands; the widows' good opinion is two relations and an Observe the engine tells once.

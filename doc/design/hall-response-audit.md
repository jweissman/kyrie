# The Hall and the corn-store: who answers what was done (21 November)

This is the third of the defect-centres review's Centre 2 audits, after the drove (doc/design/drove-response-audit.md)
and the sea-gate (doc/design/sea-gate-response-audit.md). It covers CL-32's remaining clauses, cold play 5's other
unanswered deeds (doc/architecture/mission-22/cold/cold-5-report.md, items 12, 30, 34, 36, 37, 41). Each was played again on
the weir mage's own lines through the runner, and the person each deed matters to was asked. The first town's Hall is
data/generation/town/outskirts.kyrt and outskirts-deep.kyrt. The corn-store is data/generation/town/undertown.kyrt.

## The eight silver and the pie (item 30)

| Deed | Knows directly | Can be told | Cares, and why | Can do | Dead end before this pass |
|---|---|---|---|---|---|
| The Hall's cellar cleared of rats | the company | the cook, in her kitchen | Orla Pennick: her stores, and nine years without a thank-you | pay, feed | **None now.** "Counts out eight coin … you may have the pie instead" gives eight coin and a ration. It is said in the purse's own word (CL-40), and pinned in test/iscoed-cold-five. When cold play 5 met it, no silver was gained and no pie appeared. |

## Ratsbane (item 12)

| Deed | Knows directly | Can be told | Cares, and why | Can do | Dead end before this pass |
|---|---|---|---|---|---|
| The corn-store job taken, a way without a fight offered | the merchant, who gives the key | none needed | the merchant: a third of the grain lost | sell the ratsbane, or say where it is had | **Promised where none could be had.** Every first town's merchant said "Or lay ratsbane where they come up … It wants a night", whatever they kept. Gatesend's herb-wife keeps it now; a merchant who keeps none still promised it. |

**Closed.** The merchant says where ratsbane is had, by what the town has (RegionUndertown.ratsbane):

- **Their own shelf.** "I've ratsbane on the shelf, if you'd sooner not be bitten. Lay it where they come up. It wants a
  night." This is a herb-wife or a chandler.
- **The chandlery's.** "Or there's ratsbane at the chandler's …" This is a town whose merchant is not its chandler.
- **Nothing.** Where neither keeps it, nothing is promised.

test/ratsbane-had plays the mage's way with her own coin:
1. The job is asked by her lines.
2. The morning's creel of eels is lifted at the weir and sold to Nest.
3. A twist of ratsbane is bought of Gek and laid in the cellar.
4. By morning the rats are dead, with no fight, and the job is done.

## The music box taken (items 34, 36)

| Deed | Knows directly | Can be told | Cares, and why | Can do | Dead end before this pass |
|---|---|---|---|---|---|
| A silver music box carried off | the steward, whose it is | the cook (the kitchen door) | the steward: fourteen spoons counted, and the box. The cook: her kitchen, which the steward does not come into. | the steward: put the company out. The cook: take it back to its shelf. | Already answered when this pass began: the steward puts the company out; the cook says why and takes the box back, and the doors open again (test/iscoed-cold-five). **The steward, robbed, said nothing once it was back.** |

**Closed.** The next time the company is in his hall after the box is back, once: "The steward looks up from his
ledger and turns a page. 'Fourteen spoons,' he says, 'and the box. We will say no more about it.'"
(test/hall-answers).

## Put out, and the kitchen still open (item 34)

| Deed | Knows directly | Can be told | Cares, and why | Can do | Dead end before this pass |
|---|---|---|---|---|---|
| Put out of the house "not to come back" | the steward | the cook, at her kitchen door | the cook: her kitchen, which the steward does not come into | say so, and take the box back | Already answered when this pass began: the kitchen door stays open, and Orla Pennick says why, unsmiling, the first time the company comes in after: "The steward says you are put out of the house. The steward does not come in my kitchen." She asks for the box. When cold play 5 met it, the cook was as friendly as before and said nothing. Pinned on the mage's lines in test/hall-answers and test/iscoed-cold-five. |

## Wimble's four notes, and the chime that answered nothing (items 37, 41)

| Deed | Knows directly | Can be told | Cares, and why | Can do | Dead end before this pass |
|---|---|---|---|---|---|
| Wimble asked what he heard on the hill | Wimble | none | Wimble: the cup he took; the cook: the boy | say there was a bell, and that he took the cup | **The company's notes had his tune from "There was a bell".** Asking him taught `boy_tune`: "Wimble's humming is the old stones' chime: three notes down, one up." He had said none of that (item 37). |
| The chime struck under the stones | the company | none | the dead, whose signal it is | ring, and be the boy's tune to one who heard him hum it | Answered already. The chime is "the tune the kitchen boy hums at the Hall" only to one who has been in the kitchen where he hums. "Lingers like an answered question" is gone, so nothing is said to answer that does not (item 41). The answer is in the cup: set back in its ring, "Somewhere above, in the Hall, a boy stops humming." |

**Closed.** Wimble's words teach nothing now. His tune is the chime once the chime is struck by one who heard him,
and only then is it in the company's notes (test/hall-answers: not known after "There was a bell", known after the
strike).

## Still open

- The kitchen boy and Wystan Hale say nothing of the box. The cook speaks for the kitchen and the steward for the house,
  which is enough for now.
- This is the same shape a third time: a deed, the person it matters to, a short line, once, where it is said. The
  case for one later abstraction stands, and nothing here needs it yet.

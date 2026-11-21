# The last sea-gate: who answers what was done (20 November)

The second proof of the defect-centres review's Centre 2, "the world does not answer"
(doc/architecture/reviews/defect-centres-and-process-2026-11-20.md, §2's sea-gate increment: three people answering
differently, and one new choice after the return). It takes CL-32's own clauses, cold play 5's
(doc/architecture/mission-22/cold/cold-5-report.md, the elf mage on the weir route), as the drove's audit took its
own (doc/design/drove-response-audit.md). The sea-gate is data/goings-on/iscoed-gate/situation.kyr; the weir's Nest is
data/origins/weir/origin.kyr. As there, nothing new in Kyr: Topics, Rules, Greets, and relations one module exports to
another (an origin's manifest now binds an imported relation without holding it to an entity's role).

Most of the circuit had been built after cold play 5 and before this pass: Nest, the reeve and Ifan Rhys can each be
told of the sawn pin; the hamlet answers the gate shut; the reeve pays her thirty crowns and gives the tally; Ifan's
boat comes up under the shut gate, and is let through or turned back, before the reeve if she was warned. This audit
played the cold play's own lines (its first 25, to the gate shut and the company back on the gate-yard) through the
runner and asked each person present what they could be told. The last column is what was still dead then.

| Deed or find | Knows directly | Can be told | Cares, and why | Can do | Dead end before this pass |
|---|---|---|---|---|---|
| **The sawn pin** | the company | Nest (gate-yard); the reeve (Porthalen); Ifan (his door) | Nest: the boat with no lantern. The reeve: the Rì's gate and the toll. Ifan: it is his. | Nest: name the boat. The reeve: ride out to the gate. Ifan: put the choice to you. | **Its aim outlived its answer.** "Find out who sawed through the pawl's pin" stood after the boat was let through or turned back; only the smugglers' store, behind the chain, closed it. |
| **The gate shut** | the company, the hamlet (it heard it stop) | Nest; the reeve (the claim) | Nest: Tegwen's weir. The hamlet: its weirs and houses. The reeve: the fen. | The hamlet: chalk the wave on the well-post. The reeve: pay, and give the tally north. | **Nest's greeting did not know.** Turned to after, she said "Still here. I suppose that's something." (cold play 5's 7), as before anything was done. |
| **The reeve's thirty crowns** | the reeve | (paid at the claim) | the reeve | pay, and the tally | None: the claim pays, by what came of the pans too (test/sea-gate-claim, iscoed-cold-five). |
| **Ifan's boat let through** | the company, Ifan (and the reeve, if she came out) | Nest; the reeve after, if she did not see | Ifan: his children. Nest: her neighbour. The reeve: the Rì's toll. | Ifan: nod as one eel-man to another. The reeve, who saw: write it down and ride off. | **Nest had nothing to say of it, and the reeve, not there, could not be told.** |
| **Ifan's boat turned back** | the company, Ifan (and the reeve, if she came out) | Nest; the reeve after, if she did not see | as above | Ifan: shut his door. The reeve, who saw: the toll or the boat. | **The same**: Nest silent, the reeve not to be told who. |
| **Who it is, kept or told** | the company | the reeve, at Porthalen | the reeve: the toll since the new moon. Ifan: his boat. Nest and the lane: who went to the town. | The reeve: write his name down. The lane: know. | **No choice there was.** What the reeve did not see stayed the company's, with nobody to tell it to. |

## Closed in this pass

1. **Nest greets the one who shut it.** Turned to after the gate is shut: "Nest is on her step with her arms folded,
   looking up at the gatehouse, where there is no sound. 'Well,' she says, and waits for you to say it." Once told
   ("Tell Nest the sea-gate shuts"): "'Tegwen's,' says Nest, which from her is a greeting."
2. **The cutter's aim ends where he is answered.** "Find out who sawed through the pawl's pin" is let go once Ifan's
   boat, come up under the gate, is let through or turned back, or Ifan has said whose the cut is. While the boat
   waits it stands, and leads to the choice.
3. **Three people answer the boat, each differently, each once** (the review's increment). The weir's Nest imports the
   gate's own relations (letThrough, turnedBack, named: KX-03's typed relation exports):
   - **Ifan**, as before: a nod "as one eel-man to another", or his door shut and a child watching from the step.
   - **Nest**, new, "Tell Nest about Ifan Rhys's boat": let through, "He was in at my door with a sack of flour, as if
     I'd asked for it … Tegwen let him through once"; turned back, "It is the Rì's gate. You did what the paper says.
     It will be a long winter on this lane all the same."
   - **The reeve**, who saw: as before ("So that is who"; "The Rì's toll on every sack since the new moon, or the
     boat").
4. **One new choice after the return.** At Porthalen, where the reeve did not see it: "Tell the reeve it is Ifan
   Rhys's boat that comes up the cut", or say nothing. Told after turning him back: she writes his name down, "You will
   not be thanked for this on the lane"; told after letting him through: "Do not bring me half of a thing again."
   Kept, nothing is said and Ifan goes on as he was. Told, the lane answers it the next time the company comes: Ifan's
   boat drawn up "with the reeve's chalk on its bow", Ifan on his step, not getting up; and Nest, "The whole lane knows
   who went to {town} … I'd not have done it from outside."

Played in test/sea-gate-answers.test.ts on the mage's own lines: turned back and named; let through and named.

## Found on the way, and fixed

- **Two Nests on one gate-yard.** The tinker kit's master, placed in Gatesend, was Nest Cadwgan, beside Nest the
  eel-wife, and the gate-yard's rows read "Ask Nest about Tegwen's weir" beside "Talk to Nest Cadwgan". The master
  is Eluned Cadwgan now (data/kits/tinker/master).
- **Porthalen's tinker refused in the mage's world.** The tinker kit's resident placement there was fixed to Hesper
  Lowe, who lives only in the town the company begins in; begun in Gatesend, the placement was refused, silently (an
  optional kit). It is not fixed now: one a town's author wrote is preferred (`written`), so Hesper is bound where she
  lives and Sabine the tinker where she does not (test/people-ledger).

## Still open

- **Gatesend's own reeve.** Aldous Fenn, reeve of the wood-wardens, stands on the gate-yard and has nothing to say of
  the gate, the pin or the boat; nor can he be turned to there (the runner's talk_to is not offered him). Two reeves
  in one country is AU-18's office question; which of them answers for the sea-gate wants that settled first.
- **Gesk**, hired to help wind it, says nothing of it after. A companion's remark on a deed done together is the
  same shape again.
- As at the drove, nothing here wants an engine abstraction yet; the repeated shape (a deed, the person it is about,
  a short line, once, where it is said) is now on two situations, and is the case for one later.

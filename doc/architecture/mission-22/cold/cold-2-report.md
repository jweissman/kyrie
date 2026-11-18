# Cold play 2 — iscoed's drove road (the golden route), human warrior, the runner

A blind agent with no code or register, playing `bin/kyrie run --world iscoed --as human/warrior/Wenna` (the build of
71e0479b), 128 lines from Day 1 morning to Day 2 afternoon, one death rewound. Its log is cold-2-log.md and its lines
cold-2-lines.txt. Score **6/10**: "for the writing and the dungeon, not for the interface or the fights".

## What it wanted, and what it believed it could do
- To clear Bran the drover: the opening aim became a small mystery (40 at the march-stone, 36 in the pens), and it
  proved Bran honest by the four drowned bullocks in the Black Rhyne. Then to tell the reeve of Mardle (it could not),
  then the dragon's knighthood (out of reach at 14 HP), so the town's jobs to grow; then a race for Holyking's crown
  when the company's diggers went up at first light.
- Primary as "what matters now", rest as everything else: that broke often (the aim's act in rest; rest 70–120 items,
  30+ "Ask Kynes about <far place>", three travel verbs for one destination). Aspects: danger, heard/lurks, payoff,
  warned and the undertaking's gold kept their promises; knowledge, exploration and companionship felt decorative
  ("To the landing" always companionship). "follow 1" in the scene line does not work as `{"follow":1}`.

## The choice that mattered
The barrow was the best of the hour: a rune trap set off from a distance with a pole, a counterweight levered with the
crowbar a dead adventurer's notebook advised, a three-boss chest, a flute's vision, a king sitting up on his bier. Then
flat: the crown lifted off the risen king with an ordinary "Collect" and only "+75 experience"; the five diggers never
seen; nothing to do with the crown but sell it, for an amount never shown.

## Remembered, and forgotten
Remembered: the customs grille open, Holgar's and Kynes's pay, burnt egg-sacs, the spent rune, the broken seal, the town
moving overnight, Kynes's free bed. Forgotten or contradicted: Kynes eyeing a crown already sold, the factor greeting
it as a stranger, Bran gone without thanks, Owain "your cousin" then not, Holgar hearing of a drain never entered.

## Defects (from the report, numbered as there)
1. The proof act is missing on return to the customs-house (offered only after leaving and re-entering).
2. Following the aim loops out of the room (led points out, then back in).
3. The aim's act sits in rest (Search the Black Rhyne; the rats question at the salt-house).
4. An item taken without being chosen ("Read the notice" printing "You take Bran's tally-stick").
5. "follow 1" hinted, `{"follow":1}` refused.
6. The reeve has no topics, after "tell the reeve nothing".
7. A "Talk to the factor" item whose act is a sale.
8. The world forgets the sale; no coin amounts, no purse.
9. The crown taken off a risen king without a word.
10. Led points deeper after the crown is taken; no way out among the four in the antechamber.
11. Puzzle ids leak the solution (`_p` the right next press).
12. A failed persuasion has no failure line, only a fight.
13. The last turn dumps 295 internal facts.
14. Fight text contradicts itself ("bite misses Wenna. Wenna steps in front of Carlin and takes it"; "Wenna winces,
    and still look round"); the turn number frozen through a fight.
15. The summoned companion changes name and kind between fights.
16. Light sources: a candle offered while a torch burns; the candle kept burning beside the lantern; the lantern
    not relit.
17. Prose errors: "Wood groans and iron shrieks" for stone; "swept, as if someone had swept it"; "twice … and once";
    a doubled "nothing is hidden here"; a comment printed before what it comments on.
18. The rival diggers announced and never met.
19. The date's format switches (header vs look).
20. Holgar knows of a drain never visited.
21. A hireling's abilities hidden until a fight.

Warrior combat: about 12 of 16 swings missed, five in a row against two 1-HP rats; the hireling did the killing.

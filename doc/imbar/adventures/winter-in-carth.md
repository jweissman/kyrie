# A Winter in Carth: the broad pass

*Revised against `14-bible.md`. Data only: `voices.kyr` and `seam.kyr` (new); `row.kyr`'s `wolves_come` gains one condition; `module.json` and `placed.json` list the new files and name `rector_taken` in `canon`. Tests: `test/winter-in-carth-callings.test.ts`.*

## The Account

| | |
|---|---|
| **Count** | The **Register of Gaunt**: forty books on forty lecterns, two hundred and eleven years of every fault in the city and who paid for it, now with its Ladder of Merit and its Stand where the poor are hired to fast. |
| **Keeper** | The Lady Penitentiary, who carries thirty-one keys and sits under thirty-one names (the Lords and Ladies cut round the Chapter House). |
| **What it is a count of, really** | The city thinks it is a count of pains, convertible to coin. Begun, it was a count of what was *kept*: the Bishop went away, and the Penitentiary took up his keys, to keep and not to have. The Commerce turned keeping into owing. |
| **First page** | The first line is legible to any clerk. Under it the original goes on for nine lines in a rubric the Minster stopped teaching, which every clerk copies at the head of every new book and no clerk has read (`first_leaf`). It names thirty-two keys and says thirty-one were received; it speaks of a Minster of two towers, one for the bell, the other for the light, *when it is asked for*; it grants the fallen wood to the poor of Gaunt for ever; at its foot, a fish and over it a flame. |
| **Price of reading** | The Lady must decide what her keys are for. The leaf can be used once: to the woodmen, who stand down, and the Lady is told nothing; or to the Lady, who is moved a step toward mercy, and the Wood stays shut. |

**The open seam, kept open.** Nothing says where the Bishop went, who is to ask for the keys, what the second tower was to carry, or whose the thirty-second loop is. New traces are all things seen and not understood: an empty lantern-hook on the north tower; a different tower drawn under the finished one on the lodge floor; five lines planed off the plinth *edited, not defaced*; a hand's-breadth worn smooth on the Close Gate lintel that everyone touches; a bare thirty-second loop at the end of the Penitentiary's ring.

## Acts and scenes

1. **The road** (Saturday morning). The Cross (Beadle Sutcliffe, Raistrick), the Proxy's Stone, the Drove Fork, three questions with Hern.
2. **Carth** (Saturday night). The dark house-place (Annis, Will, Old Mother Scaife, Dowsie), the byre *(the cleric sees a man being kept)*, the ash-reeve's hand, the morning.
3. **Gaunt** (Shrove Monday). Fell Gate (the Assessor), the Row (Bess, Heb's cellar *(the thief's smoked tallies)*, Tib), the Bishop's Wood *(the ranger's road no wolf was given; the wolves at dusk)*, the Stand, the Wood Exchange (Thackray), Joby and the tower.
4. **Fastens' Eve**. The Schools (Ploughwright and the Veyran *(new)*), the Fat Lamb *(the bard's missing verse; the Last Inch)*, the Shambles *(Hodge Peasegood; the Fat King stuck in Bow Gate)*, the Minster nave *(the mage's edited plinth)*, the Penitentiary *(the first leaf)*, the masons on the scaffold, the Lady at the copper, Gaol Lane.
5. **Ash Day**. The Chapter House, the verdict, the Gate of Ash *(the empty loop, for the cleric who read the leaf)*, the lantern that nobody takes down.

## What changed, before → after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | Acts clear | Mapped; every new beat given a place and a face |
| 2 Characterization | Hern, Hawise, Thackray, Annis, Raistrick in dossier and play | Hawise pressed with the leaf *counts her keys aloud in the Row's voice and hands them to the cleric*: "I have been had, by these, for eleven years"; Dent explains the Last Inch as a man proud of the lawfullest thing in his inn; Hodge (new) says his indulgence is "a feeling" and "the only honest article in the Commerce" |
| 3 Companion arc | `capable` only | Five calling-keyed voices across four acts (cleric/byre, ranger/deadfall, thief/Heb, mage/plinth, bard/Lamb); a **calling-unique** reading (the cleric alone reads the leaf); a **choice with consequence** (woodmen or Lady); the Row's rhyme as the bard's/anyone's way past the wolves |
| 4 Danger with a way round | Night-men (four exits), serjeants; wolves with none | Wolves at the deadfall from four until seven: fought (costly), gone round downwind (woodcraft), or sung at with the end of the Row's rhyme (performance, `second_verse`); they do not return that night, and are back at the next dusk |
| 5 Depth | Rich | The Last Inch; the lintel's blank mark; the worn lintel at the Close Gate; the lodge's under-drawing; the plinth edited; Hodge's indulgence; the Fat King in Bow Gate |
| 6 Links | None outward | The fish and flame (leaf, never explained); the Veyran with the notebook (Veyra *teaches*); `befell(rector_taken)` (the Watch of the House of Doors at Sennet, a letter on the Lady's desk); inward: a Veyran or a Sennet clerk would come to see the Register |
| 7 Tone | Satire and tragedy | The grave core is given one scene of plain comedy: Hodge's brazier and the Fat King stuck in the arch |
| 8 Foreshadowing | Present | **Always:** the empty lantern-hook on the north tower pays off on Ash Day's dusk (a lantern, not taken down) and in the account. **Only if looked for:** the lodge's under-drawing (the lantern sits where its room would stand) and the leaf (the empty loop at the Gate) |
| 9 Playability | Complete | New actions reachable and tested; new items obtainable by `Give` (chestnuts, an indulgence); no `j.give` |

## Links

In: a Veyran, or a clerk from Sennet, come to see the Register's first book. Out: Veyra, Sennet's House of Doors (`rector_taken`), the fish and flame. No flag set for another module.

## Tests

`test/winter-in-carth-callings.test.ts` (9): the five voices, the cleric reading the leaf and both uses, a non-cleric not offered it, the empty loop and the rector's letter by condition, the wolves gone round and sung at, the lantern, the lodge, Hodge/Dent/Ploughwright. Existing `winter-in-carth*.test.ts` re-run at the end.

## Honest shortfalls

- The campaign's preset party is a lone bard (Wren): the leaf, the cleric's unique reading, is out of reach in the standalone campaign without a cleric in the company. It is reachable in a world with a chosen party. The bard gets a voice and the wolves song, not a unique solution.
- The thirty-second key is never found. That is the point, but it also means the leaf's practical payoff is two uses (woodmen, Lady) and no third.
- `fate_grant` and `fate_leaf` are told in the account; the Row's strike logic reads `woodOpened(thackray)` only, so the grant does not change whether the Row strikes.
- Not re-walked through the world variant beyond the existing placed test.

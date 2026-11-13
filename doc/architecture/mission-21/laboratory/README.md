# The laboratory

M21's priority 3 (`../consolidated.md`): one small, complete, repeatedly playable experience on the production
engine, which the runner walks, the matrix measures and the reviews judge.

## What it is

The first town's undertown, alone. It is the corn-store, the rat-runs and the nest; the churchyard's crypt and
ossuary; the quarry pit, its adit and gallery; the drain, the undercroft and the vault. Blind players meet it first,
and loved it ("the undercroft").

- **The content** is rendered from its own template, `data/generation/town/undertown.kyrt`.
- **The host** is a few authored lines for Lowmouth: `test/fixtures/laboratory/host.kyr` (the landing, Mik who holds
  the corn-store key, the Lucky Phoenix, the chapel).
- **The render** is written to `test/fixtures/laboratory/lowmouth.kyr` by `scripts/laboratory.ts`. Edit the
  template or the host, then regenerate. `test/small/laboratory` fails while the file is stale.
- **Startup** takes about a second to the first page, with no country drawn. The same seed always gives the same
  play.
- **Why not the household:** it has an intention and a return, but no resistance.

## How to play it

```sh
bin/kyrie play test/fixtures/laboratory/lowmouth.kyr --as human/thief/Haze/burglar      # the terminal
bin/kyrie run  test/fixtures/laboratory/lowmouth.kyr --as human/thief/Haze --transcript t.jsonl   # JSON lines
bun scripts/laboratory.ts                                                               # regenerate the render
bun scripts/terminal-matrix.ts --lab --seeds lab1,lab2,lab3 --turns 40 --policies straight,curious,seeded
```

## Footage

The footage is unedited and lives in `footage/`. Each runner file has one JSON line a turn: what was asked, and
what was said.

- `thief-straight.terminal.txt`, the terminal face, a thief straight at the aim:
  1. The thief reads the notice and picks the corn-store padlock ("a bent pin and a thin blade…", then the lock open).
  2. She lights a candle in the cellar, clears the rats and the old buck rat, and is paid by Mik.
  3. She takes Mother Agnes's crypt key and pinches out the black candle behind the raiser.
- `thief-straight.runner.jsonl`, the same walk through the runner.
- `warrior-wandering.terminal.txt`, a warrior looking about. A possibility is noticed, pursued and changes the world:
  1. He wrenches the corn-store hasp ("…the noise of it goes further than you would like").
  2. Mik, next met, says "Somebody tore the hasp out of my corn-store door… I'll know them by the splinters."
  3. He forces the adit gate and finds the web with "a fox, a dog, something the size of a calf" wrapped in it.
- `mage-curious.runner.jsonl`, a mage after what teaches.

## The measures

`matrix.md` holds 63 walks: seven callings with a background each, three seeds, three policies, 40 turns.

- **Scene budget.** Every walk is within the three-sentence budget. The worst arrivals are 5 to 6 sentences (the
  ossuary's raiser, the gallery's web).
- **Attention.** Repaid attention far outnumbers empty attention: looks, questions and searches mostly told
  something new. The empty ones are a second "Talk to …" with nothing left to say.
- **Lethality.** The first matrix ran each fight whole inside the act that began it, so no walk could flee. Fights
  now go through the runner turn by turn (`src/cli/runner-fight.ts`), with the terminal's hand plus Flee, "Let …
  fight this turn" and "Press on to the end". A walk flees when whoever's turn it is falls below half.
  - Even so, a lone mage at level one can fall before its first turn: the rats act first.
  - Of 63 walks, 23 end in a death or the game's end. Every calling dies somewhere, the mage most often.
  - There are 29 retreats.
  - Passed to the rules line as BP-07 evidence, not tuned here.

## The literary review, by the doctrine's questions

This review is of the footage above and of the matrix's walks. Each fault names its root: authored Kyr, a template,
the observation or offer projection, or rendering.

- **Did the opening invite curiosity?** Partly.
  - The landing is one particular line, and the notice gives three jobs in three hands.
  - The first four choices are the notice, the padlock, Mik's door and Wait. Two of them are the same invitation
    (*projection*).
  - "No food." is the second thing said, on a landing where there is nothing yet to want food for (*projection*:
    the need line says supplies on arrival).
- **Did the player understand where they were and what they could do?** Yes in the town. Underground it was nearly
  always clear too.
  - Faults: "Put out Haze's light for good" is offered among the four in a lit cellar (*projection*: Offers fills
    the four with one act of each type).
  - "Collect a book of the dead for Haze" is a ledger's verb for a book lying on the bones (*template*: the taking
    label).
- **Were the promoted choices interesting and distinct?** Mostly.
  - The gold walked a straight, legible chain: notice, Mik, corn-store, cellar, rats, nest, Mik, chapel, crypt.
  - In the dark beside the beetles, "Attack" was led before "Fill a lantern and light it". A walker took it and
    died (*projection*: the offer's order does not put the light first, as the page's GlanceStage.pressing does).
- **Did attending to something reveal worthwhile detail?** Yes, and it is the laboratory's strength.
  - The chalk ring and black candle ends in the crypt.
  - The web's wrapped fox and calf.
  - "His book lies on the bones."
  - Faults: "The adit gate's padlock hangs open on its chain." is said again on lighting the torch, a fact restated
    (*observation projection*). A gate wrenched off its staple is said to "hang open on its chain", the pick's words
    (*authored Kyr*: the adit lock's force goes to the same state as its pick).
- **Did the world respond coherently to the player's decisions?** In the best of it, yes.
  - The torn hasp is remembered by its owner.
  - The candle pinched out from behind lays the dead.
  - Faults: the fights do not respond. Three rats of 1 HP fall to one act for a warrior, and kill a lone mage in the
    same one act, with no retreat offered between blows (*rules and offer*: the credible-encounters line).
  - "The rats ... will not have you here for long" is said of rats that never move (*authored Kyr*: the territorial
    words, BP-04).
  - "The man with the black candle come at you" is said of one man (*rendering*: the band words chose the many form
    for a group of one).
- **Did the presentation remain beautiful and unobtrusive?** In the runner, yes.
  - In the terminal, each round of a fight prints the creature table again (six identical tables for three rats).
    The fight asks "Action number or name, auto, or q" six times for a foregone result (*rendering*: the terminal
    fight, BP-01's one-act telling not yet in the terminal).
- **Did the experience create a reason to continue?**
  - Yes after each job: Mik's pay ends with "That drain goes under half the town", and Succession offers Mother
    Agnes.
  - Not after a death. It ends the walk with "The fight is lost" and no word of what a careful player could have
    done.

## What was fixed through it

- **The feat came after its result.** The skilled act was told after what it came to (the lock open, then how it was
  picked). Fixed in the narrator, held by `test/small/feat-told`.
- **Talk to Mik bought rope.** A talk led for its first reply bought rope ten times, and Eamon's bed was taken nine
  nights running. Fixed in `Affordances.command` and the runner's `for`, held by `test/small/opener-command` and
  `test/small/runner`.
- **A question asked stayed led.** A question asked and answered stayed the person's lead (the household's Wat).
  Fixed in `CompanyRecall.same`, held by `test/small/asked-answered`.

## The place worth returning to: the quarry pit (RI-01..03)

The pit lies a five-minute path from the landing. Before this work it was a scene line and a locked gate. It is now
authored in the template, so every generated town's pit has it too. No new mechanism was needed: everything below is
existing Kyr vocabulary.

| Act | What it is | In Kyr |
|---|---|---|
| **Look** | The place whole; and what a company's skills let it notice | `Observe … as sign noticed by woodcraft` / `lore` |
| **Examine** | A thing looked at closer: the ivy, the gate's padlock | the things' own changes; `look_closely` |
| **Search** | Twenty minutes over the spoil, once | `answers(pit, rummaging)`; `Discovery … Found by searching` |
| **Explore** | An hour on the faces, ledge by ledge, once | an `Action` with `Time 6`, asserting what it found |

What each visit and each company finds:

- **The ranger** reads fox-runs under the ivy (`woodcraft`). Coming back after dark, she meets the vixen: an
  observation that holds only at night and only for one who knows the runs.
- **The scholar** sees a wheel with no wing cut low on the north face (`lore`). Only then is "Pull the ivy back off
  the wheel" offered (`after learning`). Pulled, it shows the word ROAD under the mark. That is the Road's seal, the
  same "wheel; no wing" as the dues-receipt on the landing's well-post in a1. On every return the ivy is still torn
  back.
- **Anyone** may work the faces once, finding the quarrymen's ledge and two coins green with age, or search the
  spoil once, finding a carter's luck-stone. Neither is offered again. Nothing resets, and nothing is farmed.

Footage: `footage/pit-ranger.txt` and `footage/pit-mage.txt`, each with its runner JSON lines. Held by
`test/small/quarry-pit`: what each build finds, once-only, night, and persistence.

**Editorial note, by the doctrine.**

- **Opening.** The first visit is an invitation. The pit's own line has one particular detail (KEEP OUT in three
  hands), and the four lead with the hour on the faces.
- **Attention repaid.** Each act of attention found something different: knowledge (the runs, the mark), material
  (the coins, the stone), a creature, and a consequence (the ivy).
- **Return.** A return is not a reset. It is said as the place now is: the ivy torn back by day, the vixen by night.
- **Weak points.**
  - A sign noticed by a skill is told only on a deliberate look, not on arriving. A player who never looks never
    learns the runs were there.
  - The luck-stone is knowledge only. It is not yet a thing to carry, because the catalog has no such kind.
  - The pit's interest is still small beside the adit's spiders. It is a place to come back to, not yet a reason
    to.

## Next in it

- **The compact tense expedition (OA-12)**, in the same place: preparation, the pit, the adit's danger, retreat or
  confrontation, return to the landing.
- **The class matrix again**, now that the pit is there. It should show what the ranger, the scholar and the rest
  each find.

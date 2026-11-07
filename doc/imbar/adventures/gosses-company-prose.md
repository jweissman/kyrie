# Gosse's Company: prose quality pass

Lens: boredom and interest. Read in full: `bin/kyrie prose` of the campaign (703 lines), plus `voice repeats`
over `data/adventures/gosses-company/` and `road/`.

## What I found

This is the stronger of the two. Most scenes have a stake, a face and a detail nobody could have guessed (Tunstall
polishing the lamplighter's plate "as one rubs a child's cheek", Hepzibah's cast list "rubbed out so often the paper is
furry", the siege-tower knight "waving his legs"). The comic register holds; the grave turns (Tunstall's father, the
Master's "I was four") earn their place because the comedy has been specific. The weakness is not tone but
repetition of gestures and one doubled exposition:

- **Reaction by staring.** "looks at you for a long moment / time" and its relatives carried a beat in 41 lines
  (`looks at you`), "a long time" 18 times. They are the stage direction for "something is felt here" in every
  scene, whoever the character is.
- **The lamplighter told four times** in nearly the same words (Urania `urania_ezra`, `c4_ezra`, the Master
  `clem_knows`, Tunstall `tunstall_father`, plus `c6_open` and `gosse_fall`), and Hepzibah and Pudding both
  explaining that Swale's mother asked for the joke at her grave.
- **Dignity as a punchline** ("with great dignity" three times, all on animals or clowns).
- **Several places that were lists:** the Wending chapel, the road out, the nave.
- **Voices.** Most of the cast already had a habit (Gosse's "Hepzibah, write it down", Tunstall's ordinals,
  Gammage's nuts and capital-letter epithets, Pudding's onions, Bowle's "Stray.", Swale's "tremendous feeling").
  Canon Mallory had none: his "what is a play for" speech could have been Clay's.

## Before and after

1. Tunstall and the bribe (`office.kyr`)
   - Before: "Tunstall looks at the coins for a long time without touching them."
   - After: "Tunstall does not touch the coins; he squares them with the edge of the ruler, a pile, and then a tidier pile."
2. Canon Mallory on what a play is for (`bench.kyr`), given a habit (the "Ah.", the pipe, "mind", confessing
   a vice)
   - Before: "'To send them home better,' says the Canon, and knocks out his pipe. ... 'That is a great deal, in the theatre.'"
   - After: "'Ah.' The Canon knocks out his pipe on the leg of the harpsichord, which he plainly allows nobody else to do. 'Home better. That is all I ask of it. ... A week, mind. I would take a week.' ... 'Beyond that I find I am very easily pleased,' he adds, in the voice of a man confessing to a vice."
3. Urania at the supper (`supper.kyr`, `c4_ezra`): the third retelling of Ezra becomes two lines and a look
   - Before: "'Ridiculous,' she says. 'Loving. He made speeches about drains, and paved the Chepe badly, and sang in the bath. He laughed at the fool that night louder than anybody ... took the man's boy into it.'"
   - After: "'Ridiculous,' she says. 'Loving.' She looks at the door, where Abel Tunstall is standing very still with his sticks. 'People say the Office was his pride. It was his conscience. Hugh knows. Hugh buried him.'"
4. Hepzibah and the letter (`troupe.kyr`): she withholds, Pudding tells (previously both told the same thing)
   - Before: "'What Ambrose doesn't know is that she asked him to. She gave Jem a letter the week before ...'"
   - After: "'There is more, and it is Jem's to tell, not mine.' ... 'I have something of hers in here ... and I have kept it nine years because nobody asked.'"
5. Patience in the Gullet (`town.kyr`)
   - Before: "Patience is ignoring them with great dignity."
   - After: "Patience is ignoring them, with a honey-pot on one paw, like a woman at a funeral who has found the cake."
6. The Master on the Office (`office.kyr`): an aphorism swapped for a procedural line in her no-contraction voice
   - Before: "'... It is absurd. So is a city wall, until the night you need one.'"
   - After: "'... It is absurd; I have never said otherwise.' She caps the ink-bottle. 'Is there something you want struck?'"
7. The Wending chapel (`road/village.kyr`)
   - Before: "A whitewashed chapel with six benches and a window of plain glass, very clean."
   - After: "... very clean, and a collection-plate by the door with a hole in the middle mended with a button."
8. Carrow, the pen (`supper.kyr`): the third "as if it had bitten / might bite" removed
   - Before: "Carrow puts down his pen as if it had bitten him."
   - After: "Carrow puts down his pen, and picks it up, and puts it down."

## Patterns fixed (counts are passages touched)

- Staring/long-pause beats replaced by an action tied to the person: 10 (Canon, Carrow, Tunstall twice,
  Merriman, Urania, the Master twice, Hepzibah, Cundy).
- "with great dignity": 3 removed (Patience twice, Pudding once).
- "as if it might bite/bitten": 2 removed.
- Doubled exposition cut: 2 (Urania/Ezra, Hepzibah/letter).
- Flat places given one unguessable detail: 3 (chapel, road out, nave).
- Duplicate patter: Gosse's "honour of the profession ... not sell for a crown" now once (in `gosse_thanks`),
  not twice.
- Distinct habit given to Mallory; the Master's refusal of contractions kept and used once more.
- "long time" went 18 to 13, "looks at you" 41 to 33.

That is 25 passages, about 4 percent of the prose by volume, not the 20-25 percent the brief asked for: I read all of it
and the remainder was working. I would rather say so than manufacture rewrites.

## Still weak

- `urania_ezra`, `c6_open`, `tunstall_father`, `clem_knows`, `gosse_fall` still all tell the lamplighter. They are
  five different listeners, but a player who takes every topic hears it five times.
- The `*_again` topics repeat their text verbatim by design; the dossier lines with several variants
  (`kit_cracks`, `kit_cracks_widow`) repeat the same joke in near-identical words.
- Roughly a third of the speeches end on a dry closing line ("Next, he says, though there is nobody there" lands;
  "Nobody ever looks at who carries a critic's bag; it's the most invisible thing in Imbar" does not).
- "forty years ago", "the night of the riot": thematic, but 12 to 13 occurrences each.

## What a structural fix would need

- A **single telling with a witness list**: one fact ("lamplighter") the engine tracks as known by whom, so a listener
  who already knows gets a different line (the existing `*_known` variants do this for the Master only).
- A **reaction vocabulary table** the Says lines could draw from (nods, props, object business per person) so
  "looks at you" is not the default stage direction; today it is hand-written each time.
- Engine support for **topic memory** so `*_again` can be a different short line instead of a verbatim repeat.

# Priority III, steps 3 and 4: three compositions of one journey, and a direction

Steps 3 and 4 of [`doc/design/AESTHETICS.md`](../../../design/AESTHETICS.md) §10, after the [audit](audit.md) and the
[art-direction sheet](art-direction.md). Three compositions of the same six moments, the current reader at the same
moments as the control, and what this designer's review selects and rejects. The selection is provisional until an
independent player has played the prototypes (AESTHETICS §8: the builder's satisfaction is not evidence).

## How they were made

- **One journey, real frames.** `bun scripts/compositions.ts` plays the wren record (`test/fixtures/descent/wren.choices`)
  through the page's own engine (EngineHost, as `journey-profile` does). It keeps the frames of 25 beats over the six
  moments ([`web/compositions/moments.ts`](../../../../web/compositions/moments.ts)) and builds a static page beside
  them in `site/compositions` (`--serve` previews it).
- **The same offer.** Every composition is handed the same offer, built by the reader's own `SceneModel` and
  `Attending`. The compositions differ in how they lay out the offer, not in what it contains.
- **Playable within the record.** No engine runs in the prototype. Attending to someone, looking at something, opening
  a choice and going back work as in the reader. The record's choice goes on to the next beat. Any other choice is
  refused with a note that the prototype follows one recorded journey.
- **Keys.** The record's next choice is marked (`\` hides the marks). Arrows move, Enter chooses, 1–9 choose by number,
  Escape goes back, j/i/c/m open Notes, Pack, Company and Places, `[ ]` step through beats, `{ }` through moments, and
  `< >` switch compositions.
- **The control.** The current reader (`site/mono.html`) was played through the same record and photographed at the
  same beats (`current-*.jpg`).

| Moment | The record's beats |
|---|---|
| Arrival | the road down into Gothgiba (the child's mother calls out); the bailey |
| Conversation | Fargrim on the old workings ("take more light than you think"); Thoradin's offer; Thoradin joins |
| Travel | the bailey; three legs over Barzelrehes; Aurumtener; the adit, pitch dark |
| Investigation | the stone casket's riddle; "Darkness" pressed; the flask taken out |
| Danger | the goblins at the crossing, with the company's reckoning; three rounds; the outcome, Thoradin down |
| Return | back to Gothgiba at evening; Baern's vigil raises Thoradin; the taproom, where the talk is of the brothers |

## The three

**A. The literary page.** Typography alone. One centred column with a running head (country, setting, time). The
place's name is in small capitals, with its telling beneath. When the company has not moved, the place shrinks to its
first sentence, in grey. The last result follows in its own words, then whoever is attended to, as a passage within
the place. Choices are short Jost lines grouped by whom they concern. A danger is a red-ruled block with the company's
reckoning in words. A fight is two columns of names and condition in words, with the round told in prose. Notes, Pack,
Company and the places in words open inside the column.

**B. The inhabited scene.** The same telling beside a plate holding the subject of attention:
- the person spoken with, in the reader's own conversation (the painting with the name set on it, the dialogue
  newest last, the counter, numbered replies), on white;
- the object looked at, set large;
- the two sides of a fight, with bars and words;
- standing somewhere, the plan of the site.

**C. The traveller's folio.** The page as in A, beside a folio:
- the day's itinerary as it was made: each place, when, and what was done or learned there;
- what lies ahead as far as it is known, and from whom;
- the site or the country as a record of where you have been.

The ways out come first. Each is a route: where it goes, by what way, how long, and whether that place is **been**,
**heard of**, or **not yet been**. Below 1080 px the folio collapses: the last three stops head the page, and the rest
follows it.

## Moment by moment

| Moment | A | B | C | Current |
|---|---|---|---|---|
| Arrival | ![](compositions/a0-1440.jpg) | ![](compositions/b0-1440.jpg) | — | ![](compositions/current-d0-1440.jpg) |
| Conversation | ![](compositions/a3-1440.jpg) | ![](compositions/b3-1440.jpg) | ![](compositions/c3-1440.jpg) | ![](compositions/current-d3-1440.jpg) |
| Travel | ![](compositions/a8-1440.jpg) | ![](compositions/b8-1440.jpg) | ![](compositions/c8-1440.jpg) | ![](compositions/current-d9-1440.jpg) |
| Investigation | ![](compositions/a12-1440.jpg) | ![](compositions/b12-1440.jpg) | ![](compositions/c12-1440.jpg) | ![](compositions/current-d12-1440.jpg) |
| Danger (threat) | ![](compositions/a15-1440.jpg) | — | ![](compositions/c15-1440.jpg) | ![](compositions/current-d15-1440.jpg) |
| Danger (fight) | ![](compositions/a16-1440.jpg) | ![](compositions/b16-1440.jpg) | ![](compositions/c16-1440.jpg) | ![](compositions/current-d16-1440.jpg) |
| Return | ![](compositions/a24-1440.jpg) | ![](compositions/b23-1440.jpg) | ![](compositions/c24-1440.jpg) | ![](compositions/current-d24-1440.jpg) |

At phone width: [A, Fargrim](compositions/a3-390.jpg), [B, Fargrim](compositions/b3-390.jpg),
[C, Fargrim](compositions/c3-390.jpg), [current, Fargrim](compositions/current-d3-390.jpg);
[A, the fight](compositions/a16-390.jpg), [B](compositions/b16-390.jpg), [C](compositions/c16-390.jpg),
[current](compositions/current-d16-390.jpg); [C on the fells](compositions/c8-390.jpg). At 900 px:
[C on the fells](compositions/c8-900.jpg). Without images: [B, Fargrim](compositions/b3-noimage-1440.jpg).

### What each does well, and badly

**Arrival.**
- A gives the opening the page. "Over the hills", then three paragraphs, and the mother's call is the last of them.
- B and C add nothing here, which is right.
- The current bailey is the antipattern the doctrine names: eight portrait tiles of equal weight, and ways out set as
  arrows round a walled field. It is the page most in need of change.
- In every composition, the bailey's presence is one paragraph of nine sentences, and the choices beneath it are 24
  lines of equal weight: eight people, two animals, eight ways about the town, six ways out. No composition solves
  that yet; it needs grouping by who has something to say, which the engine does not say (see the findings below).

**Conversation.**
- B, which is the current talk stage carried onto white, is the strongest page in all four. The owner and the cold
  playtest both say so already, and B confirms it. The large painting gives the exchange a face. The name set on the
  painting makes the page an encounter rather than a menu. The dialogue keeps "Take more light than you think" in view
  through the next choice.
- A's conversation reads well and keeps the place recoverable, but Fargrim is a name in italics, not a presence.
- C's folio adds nothing to a conversation, and takes width from it.
- The test's "consequential follow-up" cannot be met by any of them: the topic is gone once asked (see the findings).

**Travel.**
- C is the only composition that says what travel needs said. "To Aurumtener, 1h, by the track to Aurumtener, heard
  of" stands beside "To the foot of Barzelrehes by Gothgiba, 2h, by a wall-side track, been". The itinerary keeps the
  morning's three legs and the times they took.
- A and B list the same ways without telling known from unknown.
- B's map plate on open fells is the premature map: five squares, illegible names and no country. In a town or a mine
  the plan reads; on the fells it does not.
- The legs themselves are told (the frost, the heather, "a cairn now and then"), and all three compositions keep that
  telling, in italic, above the place.

**Investigation.**
- B and A both serve the casket. B sets the object large as the plate's subject, the reader's own thing stage on
  white. A keeps the riddle in the column, with the place a line above it.
- Said once each, "Press the word … on the casket: Starlight · Thunder · Darkness · Cloud" reads as a riddle's choices
  rather than four menu lines. All three do this now; the current reader repeats "on the casket" four times.
- The engine offers the flask in the casket to Thoradin, not to the protagonist (see the findings).

**Danger.**
- A's threat block is the clearest statement of risk in the four. It is ruled in red, and gives "Goblin thief ×3;
  level 1; 6–9 HP each; unhurt", then the reckoning in words: "Wenna reckons you would likely beat them, but Thoradin
  could fall." Then Attack (a hard fight, a risk), Ask to let you by (an even chance), Warn off (unlikely).
- For the fight itself, B's tableau (the two sides, bars with numbers and words, "4 of 13 · bleeding" in red) carries
  the current fight stage's arrangement onto white. It drops the dark page the doctrine rejects.
- A's two typographic columns are legible but flat.

**Return.**
- C is strongest. The itinerary holds the whole evening and the next morning in order: the forge, the shrine,
  "Ask Baern to raise Thoradin from the dead", then the taproom. The return reads as a return.
- A and B show the taproom's changed talk ("The talk is all of the brothers…") as a result, which is right, but
  nothing on the page says the company has come back.
- B's vigil shows Baern's painting: *David with the Head of Goliath*, for a priest of the Goddess of Light. The
  portrait-led conversation is only as good as its painting, and here the painting is wrong.
- None of the four gives the vigil (a death undone after a night's watch) an exceptional form; all tell it in the
  register of buying a ration.

### Checks

- **Widths.** A reads at 390 px as it does at 1440, and is the most deliberate-looking at every width. B stacks the
  plate above the text, with the sitter at 46vh. C collapses its folio below 1080 px, keeping the last three stops above
  the page.
- **Keys alone.** Every composition plays the whole record, all 25 beats, with arrows and Enter only: A and B in 152
  presses, C in 119, because its ways come first.
- **Without images.** B's sitter becomes a dark panel with the name on it. The conversation still reads, but the plate
  is then empty weight. A text-only fallback is A's conversation.
- **Motion.** There is none to reduce.

## The direction (step 4, provisional)

A hybrid, decided moment by moment, with the literary page as the ground:

1. **Place, object, return and reference: A.** One column, white, Newsreader for what is told and Jost for what can be
   done. The place collapses to its first sentence while the company stays. The last result is kept in its words. Notes,
   Pack, Company and Places open in the column.
2. **Conversation: the current talk stage, kept, on white.** This is the page the owner asked not to lose, and the
   comparison confirms it. It goes unchanged except for the paper, and A's typographic conversation stands in when
   there is no fitting painting.
3. **The object looked at: B's plate,** the current thing stage on white, with words that differ in one part said once.
4. **The ways out: C's route lines.** Where a way goes, by what way, how long, and been, heard of or not yet been, in
   words.
5. **Memory: C's itinerary as the Story and the return's reference,** summoned rather than a permanent column. The day
   as it was made answers "what changed while I was away" better than the current Story.
6. **Danger: A's threat block, then B's tableau on white** for the fight. The current dark fight page goes.

Rejected, and why:
- **B's cast plate.** It chose whose painting stands for a place, and showed "Runa, the smelter" as a woman opening a
  window. The page has no grounds for that choice.
- **B's map plate in open country.** Too sparse to read.
- **C's permanent folio.** Beside every moment it repeats Notes and takes the conversation's width, and at mid and
  phone widths it pushed the scene below the fold until it was collapsed.
- **The current place page's portrait grid and walled field.**
- **The page going dark in a fight.**

## What remains ugly or unresolved

- The bailey's 24 equal choices and one-paragraph crowd.
- The place's small capitals look engraved rather than contemporary at 30 px; they may want to be roman, as in B.
- The "New in your notes" yellow rule is right in a conversation and too heavy for a single learned line in an
  itinerary.
- No exceptional moment has an exceptional form yet.
- The prototype bar is not part of any composition and should not be judged.

## Engine and content findings from the design work

None of these is a CSS issue. Each is filed in the ledger.

1. **Mine galleries report shelter "outdoors".** The adit, the crossing and the air shaft of the generated mine say
   `shelter: outdoors` (steps 16–24 of the record), so the reader cannot tell underground from open country by its own state.
   Correctness.
2. **Portraits are cast from descriptions that miss what matters.** The registry's `believer` reads "young man in blue
   doublet and plumed cap, hand on hip, martial". It is *David with the Head of Goliath*, cast as Baern, priest of Aine.
   The conversation the owner values most depends on a fitting painting; the registry needs editorial vetting of what
   each painting shows, and a refusal list. Content.
3. **The doer of an act is the engine's choice, unseen.** After "Darkness", the page offers to take the flask from the
   casket for Thoradin; the record took it for Wenna by command. Semantics: the page cannot say or choose who does it.
4. **Topics vanish once asked.** "Ask about the old workings" is gone after Fargrim answers, so "ask a consequential
   follow-up" cannot be composed (cold C6). Semantics.
5. **Exceptional moments are unmarked.** The vigil that raises Thoradin is an exchange like any other. The page cannot
   give exceptional form without the engine saying an exchange carries weight. Semantics.
6. **No return is told as one.** Back at the bailey at evening, nothing says the company has come back or what changed;
   the taproom's "since you were last here" reports the wind (cold C11). Semantics.
7. **Ways do not say what they lead toward.** C's "heard of" is matched from the words of a reported note. The engine
   has `leadsTo(fact, place)` for facts, but an exit does not say it leads toward a place known by report (E3).
   Semantics.
8. **Who has something to say is not distinguished from who is only there.** The bailey offers eight people and two
   animals equally; the page cannot group them without the engine saying who has a topic, a need or a trade.
   Semantics.
9. **Thoradin is a minstrel who fights as "dwarf warrior"** (cold C4). Correctness.

# Thrume: prose quality pass

Editor's pass over `data/adventures/thrume/*.kyr` (dumped with `bin/kyrie prose data/campaigns/thrume.campaign.json`, about 340 passages, all read). Ids, mechanics, conditions and tested strings are untouched. About 40 passages rewritten (roughly one in eight): the strongest material (the Paymasters' hall, the Court, the tomb doors, Wenna's game) was left alone.

## What was wrong

The scenery is already specific (boots hung from the props, the pay-window, the Street of Hands). The weakness was in people and in repetition: the companions' "voice" beats were all one speech (the same shape: action, quoted observation, `{?m} says`, wise closing line), several speeches were plot summaries read aloud, one speech was broken, and a few rooms were lists.

## Before and after

**1. Companion voices (thirteen rules, `voices.kyr`): one voice into five.** Each calling now has a habit. Ranger: short, physical, no moral. Warrior: blunt, practical, a grim joke in the middle. Cleric: bedside manners, the form for the thing, ends on what is not provided for. Thief: prices, rolls, "every house has one". Mage: hedged ("I would say... I should like to be wrong"). Bard: hears how things are said.
- Before (warrior, hammers): "'Cut to the width of a man's shoulders,' {?m} says, 'not an inch to spare either side. Whoever made this knew exactly how big the thing coming in would be, and that it would come alone.'"
- After: "'Door cut to a man's shoulders, not an inch to spare,' {?m} says. 'Hammers hung where one man can reach them, and only one man at a time.' A grunt. 'Whoever built this knew how big the visitor would be, and that it would come alone. I do not like being expected.'"

**2. A broken speech.** The Rememberer's song teaching had nested quotation marks and "Then: ... Then:" (`shoulder.kyr`).
- Before: "'The song is not for small ones. Then: 'But the small ones are going where we cannot.' She sings."
- After: "A pause. 'The song is not for small ones. But the small ones are going where we cannot.' She sings." and "She is quiet a long time" became "She is silent while the fire settles twice."

**3. The cleric's wound line ended on an empty quote** (`voice_pulse`: `... as if it hurt. ''`). Now ends: "'I have sat by a great many wounds. I did not expect to be standing in one.'"

**4. Exposition into a face.** The Rememberer's first speech ("Thrume is not a mountain. Thrume is the last of the old ones...") now begins with her taking her hand off the pillar for the first time ("Your Margravine thinks she is mining a mountain. There is no mountain."). Varne's bounty speech, a paragraph of subordinate clauses, became a soldier's: "Four months back they came off the fells. Smashed every mine-head. Took forty men. Burned the overseer in his house."

**5. A joke that did not land.** Quarrow on the crossed-out CLOSED ended "I have not been right so often in my life". Now: "The tenth time I did not write it. Put that down somewhere for me. I was right nine times and I gave up on the tenth." (test line "We did it nine times" kept).

**6. The "as a man says a day is short" tic** (named by the external review) in the Paid's wage speech: "'Short,' he says, with no quarrel in it, the way a carter says a load is short."

**7. Flat rooms given one thing the reader could not have guessed.** The Red Lantern's front room was "a dim room hung with red cloth, warm and sweet-smelling, very quiet. A little table, and a chair behind it." Now: "warm and sweet as a bakery. The rushes have been swept to the walls so that no boot will scrape. A little table, a bell with its clapper bound in wool". The chandlery: "Everything a mine needs, and too much of it, now the mine is shut" became candles sold singly in twists of paper, "for sleeping by".

**8. Image families.** "The kindest voice you have ever heard" was used for the watcher, the Abbess and (as "that kind voice") the watcher again: the watcher is now "warm as a bed", the Abbess "patient; it has never once been in a hurry". The wolf-pen lamps ended on "as a child keeps a thing it has been told is not its own"; now "at the height of a miner's hand".

## Pattern counts (before to after, Thrume sources)

- "a thousand years": 13 to 8 (the thematic ones stay: the seat, the doctrine gallery, the wage room).
- "a long time / a long while": 10 to 4.
- "kindest voice": 2 to 0. "as if / as though": 14 to 11.
- Tic closers ("the dry quoted last line") trimmed in voices, Brannoc, Ardath, Agathe, Skarn; about ten.
- The "again" topics (each Ask again) repeat their first text verbatim by design of the engine; not changed.

## Speaking habits (distinct, five or more)

Varne (clipped, imperative), Quarrow (clerk: dates, "in writing"), Agathe (corrects herself: "Nobody lit it. Somebody lit it."), Gil Sorrow (patter, a joke that costs you something), Mother Quietly (the word "so": "so tired", "so sad"), Mórrach (short sentences, long pauses), Skarn (loud, wants to be heard), the Rememberer ("small ones", instructions), Wenna (literal, counts wrong), the Lady of Lull (through a thrall, slow).

## Still weak

- Companion voices fire once each at a place, and a player with a different company hears none. They now sound different, but cannot differ by person, only by calling.
- Act IV (Hush, Tomb) is mostly Observe plus one-off Says; the set pieces are strong but the people in them (the Weigher, the Lady of Lull, the Abbess) each get one speech.
- "The old ones talk" and the Abbess's offer both explain the dream's stakes in a paragraph.
- Four "heard the number, said it back" speeches (Hauk, Brannoc, Quarrow, Agathe) end on a moral beat each.

## What a structural fix would need

Voices keyed to named companions rather than calling; a second line for a returning rule so the same place can say something new on a second visit; a way for an Ask-again topic to have different text from the first. None of these is prose work.

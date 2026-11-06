# The Liberty of the Ice: prose quality pass

Editor's pass against `doc/imbar/14-bible.md` and `16-critical-review.md` section 4. Read: the whole of the seen,
rules and talk dumps (`bin/kyrie prose`), the acts and endings, and `voice repeats`. Lens: boredom and interest, not
only tics.

## What I found

This is the strongest of the three. It has faces (Broom, Ursel, Harker, Kemble, Callow, Gant, Saffery, Tredgold),
stakes in every scene, and a clock. Its faults are small and repeated, not structural:

1. **A formula ending.** Eight of nine endings open "In the morning there is a river...". Eight in a row reads as a
   template, not a choice of endings.
2. **Flat or list-shaped places** on the Bankside side of the map (the Bankside gatehouse, Hay Stairs, Bankside
   street): a row of nouns, no detail the reader could not have guessed.
3. **Callow coughs.** "He coughs" ends or interrupts nearly every Callow speech (about 16), so the tic stopped being
   a character note and became punctuation. Callow also recaps what the scene has just shown (`callow_sums`).
4. **The calling voices** (mage, bard, warrior) all share one shape: gesture, quoted wisdom, "A pause.", dry
   kicker. The bard's line even reused Broom's own "stone in the plum", which Broom says two scenes earlier.
5. **A garbled sentence**: Sir Lionel "takes off the crimson waistcoat's coat, which is the only good thing he
   owns", and the next speech says it again.
6. **Echo of a stock simile** across adventures ("a noise like a market and a wedding at once" at both the North Road
   and the foot of Swan Stairs).
7. **Exposition by speech**: Dickon explains Gallowmoor and the plan in one paragraph, though `dickon_gallowmoor`
   exists to do the first half; Mother Gage's map of the Fair was a list.

## Before and after

1. Bankside gatehouse (`streets.kyr`, `bridge_south_scene`).
   - Before: "a gatehouse with nobody in it, a horse-trough frozen solid, and the road going off into Bankside between inns."
   - After: "The gatehouse has a sparrow in its stove-pipe and nobody else; the horse-trough is one block of ice with a bucket frozen upright in it, where somebody tried. Every inn along the road beyond has taken its sign in for the frost, so that the street is all hooks."
2. Mother Gage on the Fair (`fair.kyr`, `gage_ice`).
   - Before: "'Know?' She counts it off on her mittens. 'The Glove's at the top of the street ... Court's the big patched tent ...'" (a map read aloud)
   - After: "'Know?' She does not stop tying wicks. 'Don't shake. That's one. ... Past the ox it's the Reach, grey on black, and you keep to the sledge-marks or you go in.' She looks at your hands. 'Two. You'll want a light. Penny a candle, and the best in Pellam, there being no other.'" (a habit: she numbers her warnings and sells candles)
3. Bard's remark at the Lamb (`callings.kyr`, `voice_bench`).
   - Before: "'They are all after the stone in the plum ... One small true thing in the middle of the lie, and do not look at it.'"
   - After: "'Eleven lies since we sat down. Nine of them end on something small and true, a name or a price, set at the back where you would trip on it. Broom is not listening for the lie. Her eyes are shut for the flinch.'" (a count, not an image; Broom keeps the plum)
4. Mage at the Glove (`voice_glove`).
   - Before: "...A pause. 'Somebody decided, once, that the thing which keeps the law should be the hand you do not use.'"
   - After: "'Left glove. And the Reeve has shaken with her right all morning. The sign and the hand do not match. I should like to know which of them is older.'" (a question, not an aphorism)
5. Dickon, how he came back (`drowned.kyr`).
   - Before: "'... I can get some of them out of the line on the ice, and drown them, and when the river's open I can get them down it on a barge...'"
   - After: "'Three of us came out of Gallowmoor in September. Two got here. ... What I can do is take them out of the line on the ice, one and two at a time, and let the river have them: a hat on the stake, a penny under it, Saffery's cellar till the barges run.'" (it now explains the hats, which the reader has just seen)
6. Sir Lionel's coat (`gant.kyr`).
   - Before: "He takes off the crimson waistcoat's coat, which is the only good thing he owns" / "He takes off his coat, the only good thing he owns".
   - After: "He takes off his coat, the one good coat he has ... It is still warm, and smells of tobacco and the inside of a trunk." / "'A man who would pay thirty coin for me ought at least to look as if he could afford it.'"
7. Ending openers (`endings.kyr`).
   - Before: "In the morning there is a river, and ..." x 8.
   - After: each begins on its own fact: "Ossett's agent's sledges go out over the downs at first light", "By noon the North Road is running with meltwater", "Under Pellam Bridge the Lisk goes by in lumps", "The bargain for two hundred ewes that never were went out to sea with the ice". Only `landed` keeps the old opening, as the plain default.
8. Callow (`callow.kyr`, `disputation.kyr`, `debate.kyr`): five of the sixteen coughs replaced by a different piece of business ("He takes his arm back and looks at it", "He pulls his scarf up over his mouth"); `callow_sums` cut from a recap of three answers to three clauses and the one line that matters.

## Patterns fixed, with counts

- Passages rewritten: **33** (of about 560 spoken or seen lines; the weakest by my reading is about 6 percent, not 20-25:
  I would not invent weakness to meet the quota. See below.)
- Ending-opener formula: 8 to 1. "for a long time": 6 to 5. Callow coughs: 5 removed. Stray "nobody"/"to nobody" lines:
  none changed (3, and each earns its place).
- Cross-adventure echoes removed: "a noise like a market and a wedding at once" (the second use), the stone-in-the-plum
  reuse.
- Tests updated for changed lines: `liberty-of-the-ice-callings.test.ts` (three assertions: glove, bard, tracks).

## Distinct speaking habits (already present, kept and, in four cases, sharpened)

Tredgold: dates and tallies from the Book of Frosts. Mother Gage: numbered warnings, candles. Nab Pollard: prices
(now opens with the beer). Abel Haws: a Dales "Aye" and short plain sentences (sharpened). Kemble: sums and ledger
language. Harker: Christian euphemism ("a Christian arrangement"). Broom: trumpet, eyes shut, "Next." Gant: "It was
three." Ursel: quick street talk, "Right."

## What is still weak

- The `_again` topic variants repeat their text verbatim (there are about 70). They are mechanics, not prose, but a
  player who asks twice is told the same paragraph. A structural fix: a short `Says` for the repeat ("He has told you.")
  or a rule that hides the topic once heard.
- Ursel's "Right. Right." is used three times in the dump (twice left); Harker's "Christian" is close to a tic.
- Callow's long public speeches (`callow_public_*`) are three times the length of anything else in the book and carry
  the same argument as the private versions.
- About twenty `news_*` and `*_heard` lines all open "Of the X:" or "Word goes ...". It is a deliberate gazette
  voice; I left it, but a second voice (a waterman's, a sweep's) would break it up.
- The calling voices exist for mage, bard, warrior, ranger, cleric and thief but not for the lone-bard preset at
  every beat (review item 1; a mechanics matter).

# The scenes, first pass: what changed and what each scene still needs

This is the first pass of the scene-by-scene work in the completion plan (§3), not component by component. Each scene
was captured by `test/scenes-browser.test.ts` at 1280×800 and 820×1180, in a1 from the start of a game, before and after
this pass. The screenshots are in this folder, one subfolder per scene. Each scene is judged against the owner's
direction: cinematic, painterly, restrained, designed for play, with the atlas only where the engine says so, no
web-app idioms, and stable geometry. The spec checks that every scene holds still and keeps to the screen, at both sizes.

## Resting, quiet (the causeway into Millholm)

**What was wrong:**
- The cart in the ditch was told twice: by its first sentence among who and what is about, then whole beneath as what
  is going on.
- "The cart…" stood in the column as a bare word, link-like.

**What changed:**
- What is going on is told once, whole, in its own block.
- The thing at hand is the Look mark's pip on the rail, not a word in the column.

**What it still needs:**
- The column still carries three paragraphs before the acts at 1280×800, and the painting's right half sits under
  text.
- The telling could open on its lead paragraph alone, with the rest one quiet touch away, as a lens already does.
  That is a narration budget question (SceneBudget) more than a layout one.

## Resting, crowded (the camp at Millholm, fifteen here)

**What was wrong:**
- Fifteen likenesses, each with a name cut short ("Aldous F…", "Thessal…"), made the picture's foot a list.

**What changed:**
- In a crowd, only those with something for the company (a pip), the company itself and anyone dangerous are named.
- Anyone else's name comes up in place at a touch or by the keys.
- The faces stay, and nothing moves.

**What it still needs:**
- Emblem rings (people with no portrait) sit among painted faces and read as icons.
- A named likeness can still be cut ("The gre…").

## Waiting (the time lens)

**What was wrong:**
- At 820×1180 the waits sat under five paragraphs, "More of the place", the cart again and the first goal.

**What changed:**
- With a lens on, the place is told by its first paragraph alone. What is going on and the first goal come back
  when the lens is put away.
- The waits are the column's rows, held to be done (the hold).

**What it still needs:**
- The painting's upper half is now clear, as it should be.
- The panel's frame (its border and ground) is still a web panel's. A softer ground, without the hard rectangle,
  would let the painting carry the scene.

## Dialogue (Bask, the salter)

The large-painting talk page is kept as the owner rates it.

**What is right:**
- At 820×1180 it reads cleanly: the name large, a few words of what was said, the questions as the one row.

**What it still needs:**
- At 1280×800, after a long answer and a new aim, the start of the answer is scrolled out of view to keep the aim
  whole. That is the rule as it stands (round 5), but it cuts what was said.
- "Trade" is a short boxed row between the questions and leave. It could stand as a row of the menu like the others.

## The Pack

**What was wrong:**
- A boxed "Back to the camp at Millholm" button sat above a web page's tab row.
- Each thing was a boxed tile, its drawing's own peach ground a bright square on the dark.
- Half the page stood empty until a plate was touched.

**What changed:**
- The way back is a quiet word with the shared sign (←) and the place's name, set apart from the book's tabs by a
  hairline.
- Each thing is a plate printed on the book's paper, multiplied in a warm ink and framed in a hairline, as the
  Encyclopedia's plates are. It has no box round it, and the chosen one is edged and its name underlined.
- Something is always beside the grid: the chosen thing, or else the first thing worn.

**What it still needs:**
- At 1280×800 the grid keeps to two columns per stow, and the middle of the page is empty. The stows could flow side
  by side.

## Combat (the rats under the corn-store)

**What was wrong:**
- How the fight stands was said twice: in small italics in the head and again in the beat.
- The order of who acts was a row of filled chips, like a web page's tabs.

**What changed:**
- How the fight stands is said once, in the beat at the start, and in the head afterwards.
- The order is a quiet line of names, a chevron between, with the next in the page's ink.
- CN-06's geometry holds (test/fight-geometry-browser).

**What it still needs:**
- At 820×1180 a tall empty band lies between the beat and the hand. That is the stable geometry's reserve, and it
  could hold the painting more deliberately.
- The creatures' plates (their own parchment) are bright beside the dark cards.

## The Encyclopedia (CN-11)

**What changed:**
- See aesthetic/encyclopedia/ and test/encyclopedia-browser.test.ts.
- It is parchment and ink throughout, with plates printed into the page, and readable at both iPad sizes. It is
  light by design.
- The overlay in play frames it in the same paper.

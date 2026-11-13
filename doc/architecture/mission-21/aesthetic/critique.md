# Westernesse's interface: a critique in difficult states (Mission 21, 12 November 2026)

By the independent aesthetic investigator, who did not build the current interface. The evidence is one real game in
a1 ("Coming home", a lone warrior, Hamo), walked by the browser driver through eighteen states at four sizes:

- **1280×800**: a laptop.
- **1180×820** and **820×1180**: an iPad held level and upright.
- **390×844**: a phone.

The walk covers creation; the road in; the camp at Millholm at rest and crowded (fifteen likenesses); the Go and Look
lenses; the pack and the notes; a conversation with Bask, before and after an answer; the green with the rats job
followed; the corn-store cellar, dark and then lit; the rat fight, its opened abilities and its end; after the fight;
and the map, with a hex chosen.

Every shot was measured in the page by the harness (`tools/zz-look.test.ts.txt`):

- the telling's words and sentences;
- the touchable things in view;
- choice labels that wrap;
- elements drawn in gold;
- distinct type sizes;
- what scrolls;
- what leaves the safe zone.

The numbers below are from those measures (`shots/measures-baseline.json`). The pictures are in `shots/`.

The game's strengths are real, and the retrospective names them: the paintings, the writing at its best, honest odds,
and the large-portrait conversation. This critique is about what stands between those strengths and the player.
Findings are ranked by how much they cost a player in ordinary play.

## Ranked findings

### 1. The scene tells too much, all at one weight, and then scrolls its own beginning away

| State | Words | Sentences | Telling column (content / visible px) |
|---|---|---|---|
| Opening (the causeway) | 283 | 14 | 416 / 343 at 1280; 666 / 230 on a phone |
| Millholm's camp, on arrival | 357 | 18 | 639 / 383 at 1280; 710 / 398 on an iPad; **983 / 292 on a phone** |
| The camp after a talk (`11-town-followed`) | 269 | 16 | 435 / 369, **scrolled so its first lines are out of view** |

The page caps the telling at three **paragraphs** (`Told.situationAtRest`), not three sentences. The camp's first
paragraph alone is four sentences: the Mistmere, the herd driven off the verge, the swineherd's opinions. What came of
arriving (the brother on the rail) is added on top. A notice's text appears inside the prose in capitals ("THE TALLY OF
IRON AND GOLD IS TO BE MADE UP BY MIDWINTER") and again as the act "Read the notice on the well-post".

After a conversation, the column scrolls to bring what was just said into view (`Scrolled`), and the place's first line
is cut off under the frame: "…painted saffron and rose" begins mid-sentence. On a phone, the telling is 3.4 times its
panel, and the player sees one paragraph and three acts.

*Shots:* `baseline-1280-town.jpg`, `baseline-1280-town-followed.jpg`, `baseline-phone-strip.jpg`.

### 2. Four grammars for "a thing you can do", and capitals used as buttons

The opening screen alone shows three kinds of control:

- two led acts (a rounded line, sentence case);
- an uppercase tracked opener, "TO THE CAMP AT MILLHOLM…";
- a quiet row, "The cart…".

The other pages add their own:

- **The conversation:** numbered boxes, plus a boxed capital "TRADE".
- **The fight:** three tiles, plus "LET HAMO FIGHT THIS TURN" and "THE FIGHT SO FAR" as boxed capitals.
- **Go:** glyph rows with minutes.
- **The lenses:** round chips.

Underneath:

- **38 distinct font sizes** in the stylesheets (8 to 46 px, mostly in half-pixel steps), in 450 declarations, beside a ten-token scale;
- **20 letter-spacing values**;
- **77 uppercase declarations**;
- **5 to 14 distinct type sizes on one screen** (the map's page has 14).

This is the owner's "very plain buttons… a bunch of hyperlinks that really makes the game feel like a wiki". The eye
cannot learn what is pressable, because pressable things look like four different things, and some labels look like
pressable things.

*Shots:* `baseline-1280-opening.jpg`, `baseline-1280-fight.jpg`, `baseline-1180-talk-answered.jpg`.

### 3. The crowd: placeholders, cut names, and faces over the words

The camp has **fifteen** likenesses. **Seven are emblem discs**: a bowl or a pair of crossed sticks standing for a
person with no painted portrait. The names are cut to fit: "Aldous F…", "The old …", "Thessal…", "Granfer…".

Two rows of identical outlined discs are the most "interface" thing on the screen, and they compete with the painting
for the eye. On an upright iPad and on a phone, the faces are drawn **over the panel's telling**; at 390 px the text
shows through and around the discs (`baseline-phone-strip.jpg`, second frame). With Talk on there are 25 touchable
things in view, against 10 at rest.

The owner ruled on 7 November that no one should be folded away behind a "+3". That ruling was about people with
something for the company (the wagoner who owed two coin). The discs on the green are mostly people with nothing yet,
and no face.

### 4. Go and Look are still pages, and their tiles repeat their lists

- **Go:** a list of **20 ways** (33 touchable things on the screen). It scrolls, 719 px in 490 at 1280.
- **Look:** **1 217 px in 490** at 1280, and 1 653 in 459 on a phone.

Meanwhile the lens tiles across the painting's foot say the same thing a second time (contact sheet S1). The owner's
first M21 direction (12 November) is exactly this: "they're just lenses, they should leave the scene intact".

*Shots:* `baseline-1280-go-lens.jpg`, `baseline-1280-look-lens.jpg`.

### 5. The fight is a dashboard, and on a phone a cramped one

At the start of a round the centre column, which holds what is happening, is **empty**. The fighters' cards stand at
the far left and right, with the painting between them. The moves are three tiles plus two boxed capital buttons, and
the turn order is a row of chips repeating the cards.

On a phone:

- The foes' names are cut ("The first …", "The seco…").
- The third foe is below the fold of the sides, which scroll 481 px in 390.
- The moves are tiles two to a row.

Opening Abilities drops its panel under the hand, and **five controls land outside the safe zone** at 1280×800 (Sweeping
Strike, Second Wind, Taunt and Steel Yourself, 21–80 px past the foot), four at 1180×820. The existing safe-zone walk
never opens the panel, so this had not been measured.

*Shots:* `baseline-1280-fight.jpg`, `baseline-phone-strip.jpg` (fourth frame).

### 6. The conversation is the best page, and it breaks on narrow screens and without a portrait

- **After an answer on a phone,** the choices get **32 px of 250**: one question is visible and the rest are below a
  fold the player cannot see.
- **Unpainted speakers** (Bask, a salter, and most townsfolk) get an outlined oval emblem 340 px tall on the desktop.
  It is a placeholder where the page's whole design is a face.
- **The questions are numbered 1, 2, 5, 6** after an answer. Each question keeps its key (R11-01), but the gap reads
  as missing questions.

The large-portrait page stays the reference for every other page (`keep-portrait-conversation`). Its failures are at
the edges: no portrait, and no height.

### 7. The rail: seven unlabelled icons, and pips nobody decodes

Talk, Go, Look, Wait, Search, Map and Book are glyphs in a pill at the foot right, with no words. At the opening it
carries **three silver pips** at once. No cold player in round 10 decoded them, and the owner "still doesn't really
trust the pips".

As an object, the rail is a web app's toolbar. It is the second thing on the screen after the telling that is not the
world.

### 8. Gold leaks, and a token named blue is gold

**One gold element is on every page before anything is followed**: the frame's gold corners (`frame.css .frame::after`,
measured on all 72 baseline shots).

In the stylesheets, **19 rules** paint gold outside the aim:

- the kicker capitals;
- the corners;
- the afternoon's dot in the time line;
- the prologue's breathing diamond;
- the book's sheet title;
- the fight's targeting ring and "choose whom";
- the map's interrupted badge;
- the title's motes and lamps;
- and four that reach gold through **`--blue: var(--gold)`**: the character page's mana bar, the company member
  marked as here, input focus, and the campaign card marked "recommended".

Gold is the owner's one strict colour, and the grammar is only as trustworthy as its leaks are few.

### 9. The book floats

The Pack is four item tiles in a 1 120 px dark sheet. The Story is nearly empty. Notes is a dark document with
capitals for tabs, and the painting shows at both sides. It is the least composed set of pages (S5), and it reads as a
settings screen, not as a book.

### 10. Smaller, recurring

- The place's line uses the place-kind glyph's accent bar, which is good. The when-line ("MORNING, HUMID, 25 HAYSEL")
  is a third label style in capitals.
- The map's page uses 14 type sizes.
- A choice's second line is sometimes a person's name ("Osbert" under "Talk to your brother"), and sometimes why
  ("your aim"). The two read alike.

## What to remove

The brief asks what to take away as much as what to add. In order of effect:

1. **The separate title block and the separate rail.** Fold the place's name, its line and the tools into the one
   panel (veil), or replace Talk/Go/Look with words over the menu (attend). The screen then holds the painting, one
   object, and the faces.
2. **The Go and Look pages** (the explorer's lists), and the lens tiles that repeat them. A lens changes what the one
   menu shows.
3. **Capitals on anything pressable**: TRADE, LET … FIGHT THIS TURN, THE FIGHT SO FAR, TO THE CAMP AT MILLHOLM…, BACK
   TO THE CAMP…. Capitals are for section labels only.
4. **The telling past three sentences at a glance**, and the notice's text in capitals inside the prose (the act
   reads it).
5. **Emblem discs** for people who have no face and nothing to say. They belong in the place's life and in the People
   lens.
6. **The shade over the painting's right half.** With one panel, the painting can be seen whole.
7. **Decorative gold**: the frame's corners, the kicker capitals, the afternoon dot, the prologue diamond, and the
   targeting ring (targeting is a choice, not the aim).
8. **The colour aliases** (`--blue`, `--red`, `--yellow`, `--river` in `foundations.css`). They make a colour's name lie.
9. **The fight's turn-order chips**, which repeat the cards' acting ring, and its empty centre column at the start of a
   round.
10. **The 340 px placeholder oval** on an unpainted speaker's page. A typographic conversation is better than a
    stand-in.

## What to add

These are few, and each is a system piece, not a page: one choice row, one panel, a narration budget, lenses that
promote rather than open, paper for the book, and the constraints that keep them (see `design-system.md` and
`proposal.md`).

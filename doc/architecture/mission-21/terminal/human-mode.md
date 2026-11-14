# The terminal's human mode, played (TP-01..05)

The owner asked for a terminal a person can comfortably play, which is also the cheapest faithful way to test the game
(`owner-terminal-play.md`, register §39). This note says what was built and what it is like to play. I played it in a
real pty (tmux, 100 × 50 and 60 × 40), from creation in a1 through the father's cart, and in the tiny awkward world.

## What was built

**Two modes, one workflow.**
- `bin/kyrie adventure|resume|campaign` chooses the human mode on an interactive terminal (`TerminalMode`).
- `--interactive` and `--headless` override it.
- Both go through `Terminal.play`. The human picker answers a choice by its id, or a command as it would be typed.
- Creation goes through the EngineHost's `world`, `creation` and `set-out` requests in both modes (`TerminalCreation`).
- Play then runs on the session the host began, as before. The headless contract is unchanged: numbered lines, the
  aspects in brackets, `(more: …)`.

**The picker** (`terminal-picker.ts`, `terminal-picker-view.ts`, `terminal-human.ts`; no framework).
- Arrows or j/k move, and Enter or Space chooses.
- → unfolds the rest of the legal acts, and ← or Escape folds them again.
- `?` shows an act's whole, or an instrument's gloss.
- `/` shows every key. They are said until the first act in the world, then folded away.
- PgUp and PgDn move a page at a time, and `[` `]` move a group at a time.
- `q` asks once before leaving the game.
- Digits choose the row of that number, as typed headless.
- Lens keys: `t` talk, `g` go, `l` look, `w` wait. `o` looks about, `m` opens the map (a picker of journeys), `c` the
  company, `a` the aims (a picker: Enter follows), `s` saves.
- The rest unfolded lists what is done here first, then the journeys under the map's own headings: onward, about the
  town, places you know the way to, where the roads go, across the country. They are grouped, never ranked: the order
  within each group is the engine's, until Offers ranks journeys (the lead's).
- It is drawn in place under what was told, then cleared, leaving one line, `› what was chosen`. The scrollback reads as
  a story, not a menu log.
- The focus is kept by id while nothing is done (a lens, the aims, the map), and goes back to the first row once an act
  is done.

**The indicator grammar** (TP-02; `src/presentation/indicator.ts`, `Emphasis.precedence`, `Signs.aspects`).
- One colour per act, from one precedence table:

  | Order | Aspect | Colour |
  |---|---|---|
  | 1 | the followed aim | gold (only where gilded) |
  | 2 | danger | red |
  | 3 | to gain | green |
  | 4 | to learn | blue |
  | 5 | uncanny | violet |
  | 6 | worth a look | silver |

  The aesthetic line moved silver to the end of the rest: it is the most general promise, and it had hidden a
  particular green or blue.
- A companion is no colour, only its icon ⚭ (TP-03, decided below).
- At most two icons for what an act is besides: a companion first, then the other aspects, then the crossing ⇢, then
  the hold ⧗. Anything past two is said on `?`.
- Without colour (NO_COLOR, a pipe), the colour's own sign stands where the pip would be (✦ ⚠ ¤ ℹ ✧ ◇). Every sign has
  a plain fallback (`KYRIE_ASCII`). Meaning never rests on colour.
- A grave act asks once by one shared rule (`src/presentation/grave.ts`). The page's `Act.asks` reads the same
  function.
- The prism gradient is retired. A label coloured through two tones survives only behind `KYRIE_PRISM=1`.

**Instruments** (TP-04, the client side).
- The ones that bear on the moment are rows at the foot of the picker: `Sky: A thin crescent moon.`,
  `Provisions: No food.`.
- Focused, Enter or `?` says the gloss from `data/voice/instruments.json`.
- Headless still says them among the lines when they change.

**The fixture** (TP-05).
- `test/support/awkward.ts` is a green at Hythe. It holds 19 legal acts behind the four, one act that is several things
  once the aim is followed, a question of 120 characters, the sky and the provisions, and acts that change once one is
  done.
- `test/support/keyed.ts` plays the human mode by keys on the real picker, in the process, at any width.
- `test/small/terminal-awkward` holds fourteen cases. They include creation's calling step, a talk, a fight's moves
  and target through the same picker, the journeys grouped, and TP-03's a1 camp case. It runs in about 1.5 s.

## A transcript: a1, coming home (100 columns, the picker's last state shown)

```
› ⌂ Coming home
› ☉ Human
› ✶ the Wolf
› ⚔ Warrior
› ⚔ Arms
› A man

Choose your name (Enter for Hamo)
>

the causeway into Millholm · 25 Haysel, morning · humid
Someone is cutting reed in the ditch beside the causeway, …
A cart stands canted at the side of the road, one wheel down in the ditch to the hub, …
An aim: Your father went out by the road between Mistshaw and Millholm with the cart · a to follow

› Take the causeway to the camp at Millholm

the camp at Millholm
Millholm is half houses and half wagons with their wheels taken off, painted saffron and rose and a deep blue. …
Your brother is sitting on a rail with your father's old spear across his knees, watching the road. …

› Your father went out by the road between Mistshaw and Millholm with the cart, and did not come home.
Following: Your father went out by the road between Mistshaw and Millholm with the cart, and did not come home.

› To the road between Mistshaw and Millholm
  … Take the road to the road between Mistshaw and Millholm (the road between Mistshaw and Millholm)

the road between Mistshaw and Millholm
A drove road, broad and rutted, between Mistshaw and Millholm, with thorn hedges and the odd byre. …

› Follow the ruts over the edge
Below the road, where the bank drops away, a cart lies on its side in the ditch with a man under it, …
It is your father. You know the coat first, and the hands, before you will let yourself know the face.
Following: Your mother, at the inn, does not know what you found.

› Set out for Millholm
› Tell Osbert what you found
Osbert hears it out, and is quiet for a long time. 'Then whatever had the oxen is still out there,' he says. …

› ▌ Ask Osbert to join the company
    5 min
  ▌ Take Corrin's door to Corrin's alehouse ◇
  ▌ Read the notice on the well-post
  ▌ Ask Bask what the old workings are worth
    117 more

↑↓ ⏎ choose · → more · ? about · / keys
```

The whole run took 21 keys:
- Enter seven times to make a life;
- `a`, Enter to follow the aim;
- ↓, Enter to take the road, which was gold;
- Enter three times for the ruts, the way home and telling Osbert;
- the rest were moves about the camp.

## A transcript: the awkward world at 40 columns, the aim followed, `?` on its question

```
› ✦ Ask Osric whether the old ford
    below the alders is still
    passable now that the spring
    floods have taken the causeway ℹ
    your aim, to learn
  ⚭ Ask Wenna whether she would come a…
  ◇ Take the inn door to the Eel and A…
    Wait a while ⧗
    15 more

    Provisions: No food.

↑↓ ⏎ choose · → more · ? about · / keys
```

This is drawn without colour, so each pip is its colour's sign. The focused question wraps, and the others are cut.
The question is gold and teaches, so it carries ✦ and ℹ. The companion's asking has nothing else, so ⚭ stands in its
pip.

## TP-03: a companion as a colour, or as an icon (decided: an icon)

The same four on the green, in true colour. The `[tone]` marks below stand for the pip's colour.

```
companion as colour (before)                      companion as icon (now)
› [silver] Take the inn door to the Eel…          › [silver] Take the inn door to the Eel…
  [rose] Ask Wenna whether she would come…          Ask Wenna whether she would come along ⚭
  [blue] Ask Osric whether the old ford…            [blue] Ask Osric whether the old ford…
    Wait a while ⧗                                     Wait a while ⧗
```

In a1's camp the same choice comes up. Before the aim is followed, "Ask Osbert what he means to do" is
silver with ⚭. Once it is followed, it is companionship alone, and in the colour treatment it turns rose with no icon.
The act's meaning has not changed, yet its colour has.

The page draws the same camp in today's colour (the aesthetic line's captures, on look-7:
`mission-21/aesthetic/scenes/resting-crowded/1280x800-scene.png` and `820x1180-scene.png`).
- "Talk to your brother" carries a rose bar and the ⚭ icon beside it: the same thing said twice.
- Osbert's likeness carries a rose pip as well.

**Recommended, and decided by the lead: a companion as an icon, never a colour.**
- The page already draws ⚭ beside every such act (GlanceStage.Icons), so rose and ⚭ say the same thing twice.
- Last in the precedence, rose only shows where a companion is the act's only promise. So it flickers on and off as
  other aspects come and go, as with Osbert above.
- It frees the seventh colour. The atlas reads as six promises about the place, and a person who could join is marked
  by a sign, as a crossing is.
- Meaning survives without colour either way: ⚭ is the sign in both treatments.

The aesthetic line agrees, and calls the camp case the deciding one. The page already took that line for a person
nearby in CN-07, who gets no rose pip, only a likeness.

**Decided** (the lead, with the owner's lean): a companion is its icon only, in the shared table and both clients.
- Rose is out of `Emphasis.precedence`, and `Indicator.of` always gives ⚭ as the first icon.
- A companion perceived along a way is said in words, never as a faint rose pip.
- There is no flag: `KYRIE_COMPANION` is gone.
- Its spec is the a1 camp case in `test/small/terminal-awkward`: the same act, before and after following, keeps one
  icon and never turns rose.
- The page adopts the same through the aesthetic line.

## Is it pleasant, legible and operable? (candidly)

I played a1 from creation to the father's body, back to the camp and into its lists; the awkward world at 32 and 40
columns; and the cellar rats. What follows is what it was like, not what the specs prove.

**What works.**
- **Operable from end to end without typing.** Seven Enters make a life, and the world is ready in about five seconds.
  From there, arrows and Enter carried me to the cart in the ditch and back to Osbert in fourteen keys.
- **The scrollback reads as a story.** Each picker is cleared on a choice, leaving `› Follow the ruts over the edge`,
  so the page above is prose and choices, not menus.
- **The coming-home opening lands.** "It is your father. You know the coat first…" one keypress after the ruts, then
  Osbert's "I want to see it": the terminal gets out of the way of the best writing in the game.
- **The four are a good default.** One pip and at most two icons is quiet. The gold step is obvious once an aim is
  followed.
- **Back is predictable.** It folds the rest, leaves a lens or the aims, or goes back from a target to the moves.
- **Narrow terminals hold.** At 32 columns every line fits: the focused label wraps and the others are cut.

**What is still miserable.**
- **The scene above the picker is too long, and it scrolls away.** The causeway opening is two paragraphs, seven
  sentences, before the first choice. On a 24-row terminal the picker (up to 20 lines when unfolded) pushes the scene
  off the top. You read the choices without the place they belong to. The prose is the engine's; the terminal has
  no way yet to keep a place's one line pinned above the picker.
- **The rest at a town is a junk drawer.** The camp's 117 are now grouped: what is done here, then journeys under the
  map's headings. But "what is done here" is still sixty-odd rows. Many of them are "Set down a candle", "Light a
  torch", "Gather a handful of aster for Hamo" and every "Ask X about his work" in the camp. Paging helps you move
  through it, and nothing helps you find anything in it. The lenses are the real way in, and their keys (t g l w) are
  folded behind `/` after the first act.
- **Thirty-six journeys, unranked.** "Where to?" lists "Set out for the way into Tolleth and the Skerrow passage" as
  readily as Mistshaw, an hour away. Grouping by the map's kinds makes it scannable, but the order inside "Where the
  roads go" means nothing to a player (the lead's, to rank).
- **Fights are two keypresses a blow, and the hand is opaque.**
  - Melee Attack, then a target, every turn. With one rat left the target picker still asks.
  - "Call Animal Companion", "Ensnare" and "Defend" sit beside the blow with only a scope line under them ("choose
    target", "self").
  - `f` (fight on as you would) exists but is said only on `/`.
  - The exchanges are now told between turns, but the hurts line repeats every turn whether anything changed or not.
- **The aim is said twice when followed.** The picker's echo, then "Following: …" with the same sentence, and once
  ("An aim: … did not come home.") a third time, because the words lengthen once the aim is held.
- **Talk is a list of questions with no faces and no stakes.** "With the wagoner" helps. But most replies carry no
  indicator, and "Take your leave of the wagoner" takes a quarter of the four in every talk.
- **Holding has no key.** ⧗ marks a search or a wait, and one Enter does it, so the grammar's held ring has no meaning
  here.
- **The edges where the picker gives way to typing** are the name, and a save path (`s` asks for a path; there is no
  default).
- **"Provisions: No food." sits at the foot of every picker** at the start of a1. It is true and it bears on the
  moment, but after the third time it is nagging, not informing.
- **Journey echoes repeat their own name:** "… Take the road to the road between Mistshaw and Millholm (the road
  between Mistshaw and Millholm)". This is the same in headless.

**Mended since (term-4), in the lead's order.**
- **The place stays in sight.** The picker is drawn in what is left under what was told since the last choice: at
  most twenty rows, never fewer than eight. A longer list is a window, paged. On a 24-row terminal the camp keeps its
  heading and its three lines above the unfolded rest.
- **One key a blow at the only foe.** With one target the move is made at it, as the page's fight does (FightMoves);
  the target is asked only where there is a choice. Each move says what it does under it (its description), and a
  menu's few keys (the fight's `f`) are said in its footer.
- **The aim once per change.** It is said where the glance says it (Glance.aim), when the aim followed changes, and on
  a look. Picking an aim leaves no line of its own; "Following: …" says it.
- **The rest folded by kind of act.** What is done here falls under Offers' act types (Speak, Do, Ways, Light,
  Wait…), then the journeys under the map's headings, each group folded to one row with its count. Enter or → opens
  one; ← shuts it. The camp's 117 read as ten rows. They are grouped, never ranked, until Offers ranks them (TP-06).
- **Talk says what a question does,** from its act's fields: that it teaches, that it bears on an aim, what its note
  says (a price, a wait).
- **Saving keeps the game in the engine's one slot** (CheckpointStore's autosave, in `~/.kyrie/slots.json`), and
  `bin/kyrie resume` with no path takes it up. A path is asked for only with `--save-as`.
- **No hold key, by design:** the hold is gone everywhere now (IG-07).

**Verdict.** It is now the pleasantest way I know to play Westernesse quickly. The first ten minutes in a1 are good,
and the picker never got in my way. It is not yet comfortable for an hour. Long arrivals push the place off screen,
and the town's rest is a list nobody would read. A fight is clerical. The first two are mostly the engine's (scene
length, an Offers ranking of the rest); the third is the terminal's to fix next: one Enter for a blow at the only
foe, and the hand's choices said by what they do.

## After term-4: a second play (80 × 24 and 140 × 45)

I played about twenty minutes on main with term-4 merged. On an 80 × 24 pty I made an elf thief who owes Mik fifty
coin. I followed the aim, asked Eamon, hired Cyril, went across the fen to Ironkeep and into its gate-passage. On a
140 × 45 pty I played a dwarf cleric on the landing at Lowmouth, buying from Lambert.

**Pleasant: yes, for the first quarter of an hour.**
- The debt opening is three lines and a gold row, and the chain holds without a stumble: Mik, the inn, Eamon's three
  old places, Cyril, then "Set out for Ironkeep", gold and first, 71 minutes.
- Cyril's line at the keep's foot ("More if you come back out of it") arrives on its own, one key after the journey.

**Legible: yes.**
- The place stays on screen at 24 rows, and the folded rest ("▸ Do · 19", "▸ Across the country · 34") reads at a
  glance.
- Companions are an icon, with no rose: "Ask Cyril whether she would come along ⚭".
- The coin to collect was gold with ¤: the aim and what it pays, in one row.

**Operable: yes, with two snags.**
- Up from the first row had gone round into the folded rest, and the next Enter unfolded it. Up and down now stop at
  the ends.
- Escape followed within half a second by another key is read as one key sequence (the terminal's escape timeout).
  ← goes back at once, and the footer says ←.

**Still miserable, and none of it the client's.** These went to the lead.
- **The followed aim is said again in every new room.** "Following: You owe Mik, salter at Lowmouth 50 coin by
  market day. Eamon, innkeeper at Lowmouth, told of Ironkeep, …" (three lines) came at the landing, the taproom,
  Ironkeep and the gate-passage. The terminal says it where Glance.aim is set, and the glance sets it on every first
  arrival.
- **The golden thread ends at a portcullis.** In Ironkeep's gate-passage, after the coin, nothing is gold. Pushing,
  pulling, listening and searching all say nothing is there. The only way is back out.
- **The four fill with spell swaps at a spent place.** "Have Cyril prepare Cure Light Wounds in place of Charm
  Person…" took two of the four at the keep's door.
- **The map from the taproom did not offer Ironkeep.** Eamon had told how to reach it; from Mik's salt-house it was
  the gold first row.
- **Hiring says its price only in the reply.** "Ask Cyril to join the company" carries no cost; her "6 coin, and my
  keep" was said before it.
- **`--as` with `--origin herbs` holds no aim.** `a` said "No aim is held."

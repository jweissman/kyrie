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
- `q` asks once before leaving the game.
- Digits choose the row of that number, as typed headless.
- Lens keys: `t` talk, `g` go, `l` look, `w` wait. `o` looks about, `m` opens the map (a picker of journeys), `c` the
  company, `a` the aims (a picker: Enter follows), `s` saves.
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
  | 7 | a companion | rose |

  The aesthetic line moved silver to the end of the rest: it is the most general promise, and it had hidden a
  particular green or blue.
- At most two icons for what an act is besides: the other aspects, then the crossing ⇢, then the hold ⧗. Anything past
  two is said on `?`.
- Without colour (NO_COLOR, a pipe), the colour's own sign stands where the pip would be (✦ ⚠ ¤ ℹ ✧ ◇ ⚭). Every sign
  has a plain fallback (`KYRIE_ASCII`). Meaning never rests on colour.
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
- `test/small/terminal-awkward` holds eleven cases, including creation's calling step and a fight's moves and target
  through the same picker. It runs in about 1.5 s.

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

## TP-03: a companion as a colour, or as an icon

The same four on the green, in true colour. The `[tone]` marks below stand for the pip's colour.

```
companion as colour (default)                     companion as icon (KYRIE_COMPANION=icon)
› [silver] Take the inn door to the Eel…          › [silver] Take the inn door to the Eel…
  [rose] Ask Wenna whether she would come…          Ask Wenna whether she would come along ⚭
  [blue] Ask Osric whether the old ford…            [blue] Ask Osric whether the old ford…
    Wait a while ⧗                                     Wait a while ⧗
```

In a1's camp the same choice comes up. Before the aim is followed, "Ask Osbert what he means to do" is
silver with ⚭. Once it is followed, it is companionship alone, and in the colour treatment it turns rose with no icon.
The act's meaning has not changed, yet its colour has.

**Recommendation: a companion as an icon, never a colour.**
- The page already draws ⚭ beside every such act (GlanceStage.Icons), so rose and ⚭ say the same thing twice.
- Last in the precedence, rose only shows where a companion is the act's only promise. So it flickers on and off as
  other aspects come and go, as with Osbert above.
- It frees the seventh colour. The atlas reads as six promises about the place, and a person who could join is marked
  by a sign, as a crossing is.
- Meaning survives without colour either way: ⚭ is the sign in both treatments.

The aesthetic line agrees, and calls the camp case the deciding one. The page already took that line for a person
nearby in CN-07, who gets no rose pip, only a likeness. It will take the page's screenshots of the same green, in both
treatments, at 1280 × 800 and 820 × 1180. The decision is the lead's and the owner's. Until then the terminal's
default is unchanged (colour), and the icon treatment is one flag.

## Is it pleasant, legible and operable?

**Operable: yes.**
- I never had to type an id or remember a command.
- Arrows and Enter carried me from creation to the father's body and back to Millholm.
- Back always did the expected thing: it folded the rest, left the lens, or left the aims.
- Focus never jumped while I looked about. It returned to the first row after an act, which is where the new four
  begin.
- Narrow terminals hold: every picker line fits at 32 columns, wrapped where focused and cut elsewhere.

**Legible: mostly.**
- One pip and at most two icons is quiet. The gold step reads at once, and the aim's question showed ✦ and ℹ together
  without noise.
- The picker's history collapses to `› chosen`, so the scrollback reads like a story.
- In a talk, the picker is headed by whom it is with, and its rest is the talk's own replies.
- In a fight, each exchange since the company's last turn is told before it chooses again. Before, only the hurts had
  shown between turns.
- The weak point is the scene above the picker, not the picker. Arrivals often run four to six sentences. The causeway
  opening is two long paragraphs before the first choice.

**Pleasant: yes, more than I expected.**
- Making a life is seven Enters, each with the card's line under it, and the world is ready in five seconds.
- The coming-home opening is moving in this form. The ruts over the edge, then "You know the coat first", then
  Osbert's "I want to see it" arrive one keypress apart, with nothing between them.

## What is still awkward

- **The rest is enormous at a town** ("117 more"). Unfolded, it is a long window, mostly "Set out for …" journeys.
  - The lenses help, and the map is now a picker of journeys.
  - But the journeys come unranked: the engine ranks no journey against another.
  - *Engine-shaped:* a journey order (aim first, near before far) would help both clients.
- **Holding has no key.** ⧗ marks a sustained act, and one Enter does it. The grammar's held ring has no terminal
  equivalent yet.
- **A grave act asks once by the page's own rule,** which lives in `web/reader/stage/act.tsx` (`Act.asks`). The terminal
  reads the same fields (`Choice.grave`, `Mark.ask`). *Engine-shaped:* the rule belongs in `src/presentation`, so that
  neither client keeps its own.
- **The aim is said again on following** ("An aim: … did not come home."), because its words lengthen once it is held
  (TerminalScene's freshness test).
- **A journey's echo repeats its own name:** "… Take the road to the road between Mistshaw and Millholm (the road
  between Mistshaw and Millholm)". This is the same in headless.
- **The name step is a line typed after a prompt,** the one place where the picker gives way. Enter takes the drawn
  name.

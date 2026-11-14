# The experiment: two versions of the action control

Part 3 of the interaction research. Two competing versions of the principal action control run inside the game, each
behind an address flag and never the default:
- **a, the tap:** every act commits at a tap.
- **b, the hold:** acts the engine marks sustained are held to commit, and the answer is paced.

Both were used over many repetitions, by a harness acting as a player with a mouse and keys, and recorded unedited.
Two of the faults the harness found in the game as it is are now fixed for everyone (IG-17, IG-18; `887bec7f`).

## How to try them

Open the game with one of these addresses:

| Address | What you get |
|---|---|
| `mono.html?ix=a` | version a, the tap |
| `mono.html?ix=b` | version b, the hold |
| `&sound=0` | silences the commit tone |
| `&hold=800` | sets b's hold time, from 200 to 2000 ms |

Any built site works (`bun run web:build`, then `site/mono.html`, or the deployed page once landed). On the road
into Brightbridge (`?world=kite&ix=b`):
- **talk:** talk to the wagoner and take your leave;
- **wait:** open Wait and hold "A while".

## The two versions

**Common to both** (on top of the guards now in the game for everyone: a press taken once, on its own screen, and
nothing lit under a still hand):
- **The act taken.** While the engine answers, the chosen row stays pressed in its own tone, and the other rows go
  quiet (opacity .42) and cannot be pressed. The quieting waits 80 ms, so a quick answer doesn't flicker.
  `data-taken` (`Act.View`), `instrument.css`.
- **One commit tone** (IG-06). It's synthesized in the page (`instrument/tone.ts`): a soft, low wooden knock about
  0.17 s long, a falling sine near G3 with a quiet partial, through a low pass. It sounds on every commitment: the
  title's ways in, creation's cards and Continue, and every engine act (`ReaderApp.choose`). A held act's knock is
  lower and longer.

**a, the tap.** Every act commits at one tap, as the game does now. The answer arrives as fast as the engine gives
it, and the next rows are live at once.

**b, the hold.** As a, plus two things.
- **Sustained acts are held.** An act the engine marks sustained (`Choice.hold === 'sustained'`: a wait, a search, a
  rest, a camp, a long look) is done by holding it (`instrument/hold.ts`):
  - **at the hand:** the pointer's reticle, which a CSS cursor cannot animate, is drawn by the page for as long as
    the hold lasts, in the system cursor's place (`instrument/reticle.ts`). Its ring fills over 520 ms, and its
    centre fills when it is full;
  - **on the row,** for touch and keys: a small open ring at the row's right says, at rest, that this act is held.
    Held, it fills with the reticle, and the row is pressed at once;
  - **done when full,** not on release;
  - **let go early:** both rings drain from where they got to, nothing is done, and "Hold" shows beside the ring for
    1.6 s. A tap is answered in the same way, never ignored (IG-07's "I click and nothing happens");
  - **keys:** Enter or Space on the focused row, Enter on the keys' highlight, or the row's digit, held. The repeats
    are ignored, and letting go of the key lets go of the hold;
  - **reduced motion:** the rings fill in four steps.
- **The answer is paced.** The act taken is shown for at least 160 ms (`Press.settle`). Then what came of it fades
  in over 180 ms, and the next rows fade in 140 ms after it, over 220 ms (`data-fresh`).

**Nothing in either version decides anything of the game's.** The command sent is the engine's choice, exactly as a
tap sends it. The hold is how the press is measured, not a rule.

## The repetition test

**The harness** is `tools/zz-ix-repeat.test.ts.txt`. Copy it to `test/zz-ix-repeat-browser.test.ts` to run it; it
needs `IX`, `IX_SITE`, `IX_REPS` and `KYRIE_BROWSER=1`.

**Setup:** the kite world at 1280×800, keyboard and mouse.

**One repetition is three acts:**
1. Talk to the wagoner (by the hand, or by the row's digit, in alternate repetitions).
2. Take your leave (the same).
3. Open Wait and do "A while" (a click, or a 640 ms hold in b).

**40 repetitions per version, 120 acts each.** Then the accidents a player makes:
- a double click;
- Enter held down for 400 ms;
- a press begun in a conversation and let go after the leave (by its key) has ended it;
- two clicks 90 ms apart.

In b, the hold's own accidents follow: a tap on a held act, a hold let go at 250 ms, and a hold by Enter.

**What it measures, from the page:**
- the engine's commands (counted at the worker's `postMessage`);
- the first frame the press is shown taken (pressed, busy or holding) after the hand or key went down (`ack`);
- the press to the answer drawn (`total`);
- whether the row under the resting pointer was lit on the next screen;
- whether any row's box changed between the press and its first answer.

### Results (14 November, local build of the ix branch over 8f3becc7)

| | the game as it was | a, the tap | b, the hold |
|---|---|---|---|
| acts | 120 | 120 | 120 |
| duplicate or missed commands | 0 / 0 | 0 / 0 | 0 / 0 |
| press shown taken: median / p95 | 11 / 15 ms | 10 / 18 ms | 4 / 11 ms |
| press to answer, talk and leave: median | 161–168 ms | 160–177 ms | 171–176 ms |
| press to answer, "A while": median | 161 ms (tap) | 161 ms (tap) | 686 ms (520 ms hold + answer) |
| next screen lit the row under a still hand | **120 / 120** | 0 / 120 | 0 / 120 |
| a row moved between the press and its answer: "A while" | 0 / 40 | 0 / 40 | 0 / 40 |
| double click | 1 command | 1 | 1 |
| **Enter held 400 ms** | **3 commands** (a reply never read) | 1 | 1 |
| press begun in a conversation, let go after it ended | not reached (the held Enter had left the game in another state) | 0 extra | 0 extra |
| two clicks 90 ms apart | not reached | 1 | 1 |
| b: a tap on a held act | | | 0 commands, "Hold" shown |
| b: a hold let go at 250 ms | | | 0 commands |
| b: a hold by Enter (repeats included) | | | 1 command |
| page errors | 0 | 0 | 0 |

Notes on the table:
- **"Rows moved" for talk and leave is not a defect.** It's 40 of 40 in every version, because talk changes the
  composition at once (the conversation's page is drawn before the engine answers, by design). For "A while", which
  keeps the composition, nothing moved in any version.
- **The engine's round trip is about 160–180 ms in every version.** b's minimum showing of 160 ms is therefore
  rarely felt as a wait. b's real cost per act is the arrival: the next rows are whole about 360 ms after the
  answer.
- **The guards are now everyone's.** The held Enter and the still-hand light are fixed in the default game
  (`887bec7f`, held by `test/press-guard-browser`). That spec fails at two commands without the guard.

## Recordings (unedited, not in the repository)

The recordings are under `/var/tmp/kyrie/ix/`. There is a caveat about the pointer: a recording has no system
cursor, so the harnesses draw a dim ring that follows the pointer. The filled reticle seen during b's holds is the
page's own.

| What | Where |
|---|---|
| The opening as it was (title → creation → setting out → first scene → first acts), 62 s | `opening-base/80fd95251c057bc1bad8048eb4b7438e.webm` and stills |
| The opening with a (title → … → first scene, then a dozen uses of the control), 110 s | `opening-a/891223ad51a1a595a561d547ca1805b7.webm` |
| The opening with b (the same; the waits held), 112 s | `opening-b/e678fde998582c1924c817635b07ae72.webm` |
| 40 repetitions as it was, then the accidents | `repeat-base/ee83545b0ad7a2cc4f7a4628b0b269fe.webm` |
| 40 repetitions with a | `repeat-a/398644a158a250ca3c86c156daceeafb.webm` |
| 40 repetitions with b (holds included), then the accidents | `repeat-b/a0c8f485b4212efd57286ce06bb2feea.webm` and stills (`still-held-half.png`, `still-hint.png`) |

Small stills are kept beside this file:

| Still | What it shows |
|---|---|
| `hold-half.jpg` | b, a hold halfway: the reticle at the hand, the row's ring, the other held rows' open rings |
| `hold-hint.jpg` | b, a tap on a held act answered "Hold", the ring drained |
| `base-first-scene.jpg` | the first scene as it was |
| `base-still-hand-lit.jpg` | as it was: "Talk to Cesar" chosen, the conversation's third reply lit under the hand that never moved to it (IG-18) |

## Findings

**1. The defects were in the guards, not the look.**
- A held key committing an unread reply (IG-17) and a resting hand lighting rows (IG-18) were the two measurable
  faults in the shipped control.
- Both were mechanical, small, and invisible in screenshots. Only repetition found them.

**2. The press itself is already fast enough.**
- The press shows within a frame in every version (median 4–11 ms).
- The engine answers in about 170 ms.
- Nothing about "operating a web application" comes from latency.

**3. The hold works when its feedback is at the hand and a tap is answered.**
- Over 40 held waits and the accident cases, b's hold never did nothing silently and never did twice.
- The drawn reticle solves the "CSS cursors cannot animate" problem without replacing the cursor at any other time.
- **What can't be judged by a harness:** whether 520 ms feels like spending or like friction.
- **[H]** The hold reads as weight the first few times and as a toll by the twentieth wait, because waiting spends
  nothing today. Over the 40 repetitions it adds 21 s of holding. That's the case for holding only what spends
  Energy (`recommendation.md`). The owner's hand on `?ix=b` is the test of this.

**4. b's paced arrival is the costliest choice.**
- About 0.36 s on every act, all session.
- **[H]** It suits talk (the reply arrives, then the next questions) better than repeated waits, where nothing new
  is asked of the player.
- **[J]** It belongs to the dramatic register (revelation, reckoning, loss), not to every act. a's immediate
  arrival is right for the ordinary.

**5. The tone is the cheapest large change. [H]**
- No recording carries sound (Playwright's video has none), and this research couldn't listen. The tone's shape was
  designed, not auditioned, so it needs the owner's ear before anything else.
- The study's exemplars agree that a commit earcon is what most separates a game's menu from a page's (study §6).
- It needs an option to turn it off, and a second sound for "asked" (a grave act chosen once) before it lands for
  everyone.

**6. Not tested by a person.**
- The reticle, the hold and the tone were driven by a harness and judged from its video and stills.
- Touch was exercised only by the existing tap spec, not by b's hold.
- The owner's own hand is the test that's missing (TO-06).

## Where the code is

| Code | What it holds |
|---|---|
| `web/reader/press-guard.ts` | the default guards (IG-17, IG-18) |
| `web/reader/instrument/press.ts` | the versions' flags, the tone outside play, b's arrival and minimum showing |
| `web/reader/instrument/hold.ts` | b's hold |
| `web/reader/instrument/reticle.ts` | b's drawn reticle |
| `web/reader/instrument/tone.ts` | the commit tone |
| `web/reader/instrument.css` | the versions' look |

**Hooks:**
- `Act.View`: `data-taken`, and the hold's props;
- `ReaderApp.choose`: the tone and `taken`;
- `ReaderApp.perform`: `Press.settle`;
- `ReaderKeys`: a held key on the highlight or a digit.

**Not built:**
- an option to turn holds into taps (accessibility);
- a sound option in the options page;
- the dramatic register's deliberate continuation, which needs the engine's mark first (`grammar.md`);
- the inspect verb (IG-03).

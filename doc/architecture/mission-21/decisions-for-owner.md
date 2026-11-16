# Seven decisions only the owner can make

Each: the question, the options with what each costs, what I recommend, and what happens if there is no answer (so nothing
waits). "Reversible" says how hard it is to change our mind later. Written 17 November.

---

## 1. Where the fight's dice show (BP-03)

**Today.** After a blow the fight page tells it in prose ("Tavish cuts the rat across the back") and, one line beneath, in
small grey type, how it fell ("d20 14 + attack 3 vs AC 12, rolled 6 damage"). You ruled on 6 November that no guidance
should live in a hover alone, so it is on the page. The register (BP-03) later asked for the opposite: odds as words, the
outcome as prose, "the dice only on a deliberate look".

| Option | Gains | Costs |
|---|---|---|
| A. Keep the line (today) | Honest at a glance; players who like the system see the rules working; no extra act | It is the "1 on the die, needing 11" noise that makes the telling read as a spreadsheet; it competes with the prose for the eye |
| B. Hide it; show on a press of the line, or a "How did that fall?" row | The telling is clean; the numbers are there for anyone who asks | One more thing to discover; a tooltip alone would break your 6 November rule, so it must be a real control |
| C. Show it only for the player's own party's blows, hide the foes' | Keeps the numbers that matter to decisions (can I hit it?) | Inconsistent; half the rolls are hidden |

**Recommend B**, as a quiet row under the last exchange ("How it fell") that unfolds the line in place. The odds before a
choice are already words on the card (CB-13 is closed), so nothing a decision needs is hidden. **No answer:** A stays.
**Reversible:** yes, one component (`.how` in fight-stage.tsx).

## 2. The scene lens's "All N" unfold (PB-25)

**Today.** Go…, Look…, Who and Time open a lens: four rows, and an "All N" button that unfolds the rest in place below.
Conversations no longer fold: they show three topics, or two and a "Something else… 1 of 3" row that turns the page.

| Option | Gains | Costs |
|---|---|---|
| A. Keep the unfold | You see everything at once when you ask; fourteen browser specs and the driver already rely on it | It is the one remaining fold, against "no folds, four items" |
| B. Page it like conversations | One rule everywhere; never more than four | You can't scan the whole list at once; a lens with 25 ways is six pages; the specs and the driver need rewriting (a day) |
| C. Raise the lens's budget to six, no pager | Most lenses fit | Breaks "four"; the count is arbitrary |

**Recommend A**, and say so in the rule: the four is the *resting scene's* budget, a lens is a deliberate "show me
everything of this kind", and its unfold is the player asking. The census already holds the closed state at four.
**No answer:** A stays. **Reversible:** costly (the specs), so decide once.

## 3. Hold to commit (the long-press)

**Today.** Pressing any button with a mouse fills the cursor's own ring clockwise over half a second; a tap still commits
at once, so the ring is a hint that does nothing. The engine marks some acts "sustained" (wait, search, rest, camp);
`?ix=b` makes those commit only when the ring is full.

| Option | Gains | Costs |
|---|---|---|
| A. Hint only (today) | No act is ever slower; nothing surprises | The ring promises something it does not do; you said you wanted to see the animation, and you do, but it means nothing |
| B. Sustained acts commit on a full ring, everything else taps | The ring means something: time passing (rest, wait) feels deliberate; guards against a mis-tap spending a night | Waiting is slower (half a second each); keyboard and touch need their own form (hold the key; hold the finger); specs that click "Wait" must hold |
| C. Optional (a setting), off by default | Safe | Two behaviours to keep true; most never find it |

**Recommend B for rest and camp only** (the acts that spend hours and can't be undone), tap for wait and search, ring on
all as the visual. **No answer:** A. **Reversible:** yes (one predicate, `Hold.holds`).

## 4. Where a player gives "stay here" and "come on" (the Commander)

**Today.** The engine has the simplest order: tell someone who has joined to stay where they are (they wait there, theirs
again), and call them on (they rejoin, no second fee). Nothing on the page offers it.

| Option | Gains | Costs |
|---|---|---|
| A. On the retainer's own page (their portrait/character sheet) | Discoverable where you look at them; no menu pressure | Two taps to a one-word order |
| B. As rows in the scene menu when someone has joined | One tap | They compete for the four with everything else; a party of three is six rows |
| C. In conversation with them ("Ask them to wait here") | Fits the fiction; a talk topic already costs nothing | Hidden unless you talk to them; hard to reverse in a hurry |

**Recommend A** (their sheet carries Stay / Come on), plus C as a spoken line once for flavour. **No answer:** nothing
draws it, so retainers always travel (today's behaviour). **Reversible:** yes.

## 5. The first scene's outlined panel on a phone

**Today.** On a desktop the telling sits on the painting as text. On a 390-px phone it sits in a dark, one-pixel-bordered
box. Your direction for the menu is "no dressing or borders by default".

| Option | Gains | Costs |
|---|---|---|
| A. Keep the box | Text stays legible over a busy painting at small size | A border and a panel: the thing you asked us to take away |
| B. Keep the dim backdrop, drop the border | The same legibility; quieter | A hard-edged dark rectangle with no edge reads as a smudge unless the corners are soft |
| C. A gradient scrim from the bottom, no rectangle | Most painterly; matches the desktop | Needs a per-painting check that the text stays readable |

**Recommend C**, falling back to B where a painting is too busy. **No answer:** A. This is part of the action-button
cycle (aim 1), so it can ride with it.

## 6. How hard the first hour should be

**Today.** A lone first-level mage wins about one fight in three against three rats; a warrior is safe. The forecast says
so honestly ("more than the company can take"). The creation flow lets you pick mage.

| Option | Gains | Costs |
|---|---|---|
| A. Keep: classes are not equal at level 1, the forecast tells you | Real OSR danger; stories of the mage who ran | A new player who picks the romantic class dies in the cellar and blames the game (our blind runs show this) |
| B. Soften the opening only (fewer or weaker first-hour bands for a lone caster; a starting familiar or hireling for one) | Fair opening; the world stays dangerous later | Authoring effort; the "honest forecast" test has to move with it |
| C. Say it in creation ("the mage is fragile alone") | Honest; no balance work | A warning in the way of the choice |

**Recommend B** (a hireling offered in the first town, which the Commander pin already supports) with C as a single line.
**No answer:** A. **Reversible:** yes.

## 7. Prose

The register has about 27 prose rows (garnish in fights, repeated greetings, the clause tic). They have no mechanical test:
the clause-load census measures one of them. **Ask:** name the three you would fix first from your own play; I will
write the pins and the fixes against those, and leave the rest.

---

## If you only answer three

Answer **1, 3 and 5**: they are the three that decide what the action-button cycle (your first aim) builds. 2, 4 and 6
have safe defaults and 7 needs your play, not a ruling.

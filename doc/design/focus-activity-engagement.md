# Focus, activity, engagement (21 November)

The owner's playthrough of the Fun Friday pins: the ideas are promising, but the implementations fictionalize
activities without modelling participation in them. The fiddle is a chain (take down, tune, try, try again) with no
stakes, no expressive choice and no legible result; while playing it, a hand of cards was still offered; the card game
needed no invitation and was no defined game. This note separates three things, asks what the engine already has for
each, audits the pins against it, and names the one activity to prove first. No new framework is proposed until the
existing machinery is shown unable.

## The three terms

- **Focus**: the person or thing receiving the player's attention. It shapes the authoritative action projection
  (what the frame offers, and in what order). Starting an act on something establishes focus; no extra click.
- **Activity**: something that unfolds over time and can be interrupted (a walk to the point, a vigil by the fox earth,
  an evening at the inn). It has a during and an after, and the world can cut into it.
- **Engagement**: an activity with particular participants, available moves, stakes, and resolution or withdrawal
  conditions. A riddle, a hand of cards, a social confrontation, a contested performance, a fight. They need not share
  mechanics; they share the shape: while engaged, the presentation belongs to the engagement, unrelated acts recede,
  and there is always a way to finish or to withdraw.

## What the engine already has

| Need | Existing machinery | Can it express it? |
|---|---|---|
| The frame narrowed to one thing's responses | `Engaged` (src/presentation/engaged.ts, OR-163): with a threat warning, `Engaged.screen` takes every act out of the Screen but the answers to the threat, an act on the place, flight in the hex, and standing one's ground; read into ScreenModel, so every client offers the same few | **Yes in shape, no in scope.** Its subject is hard-wired to a threat (`Screen.warned`, Patience). The narrowing, the "answers to it", the one withdrawal (flight) and the one wait (stand) are exactly an engagement's. Generalizing its subject from *the threat* to *the engagement* is a change of key, not a new framework. |
| Focus | `Attention` (src/ui/attention.ts): the place, one person spoken with, or one thing looked at; decides which of the engine's acts belong to the present attention | **Partly, and in the wrong layer.** It lives in src/ui, a client; the engine's frame does not know what the player is attending to. That is the same divergence MT-18 / OR-159 closed for rows: focus has to be the engine's, so that the terminal, the runner and the page narrow alike. |
| A thing's own moves, state by state | Kyr `Thing … State … Change` (the fiddle, the cards): states with words, changes between them, a check on a change (`Resolve`: the cards' insight and deception) | **Yes for moves; no for participation.** A state chain says what the thing is; it does not say who is taking part, whose turn it is, what is at stake, or how it ends besides its last state. |
| A focused activity that replaces the foreground | The riddle on a way (test/riddle-on-way browser spec, CL-34): its words replace the foreground, each once, nothing committed, the surroundings given back | **The nearest thing to a proven engagement outside a fight**: it takes the presentation, offers only its own moves, and has a withdrawal. It is drawn by special handling in the offer (src/presentation/offer.ts), not by a general model. |
| Interruption | Rules and Observes on the clock; `Patience` warnings; journeys stopped by what they meet | **Yes**: the world can already cut into anything; what is missing is an activity's own record that it was cut into. |
| Stakes and outcomes | Purse, items, standing (`knows`, relations), facts asserted on resolution (`fiddle_left`, `cards_caught`) | **Yes as consequences**; nothing says them *before* the choice (a riddle's cost, a hand's buttons). |

The conclusion: the machinery can express this. What is missing is one generalization and one move:

1. **Engaged generalized**: an engagement is the state the frame narrows to, with a subject (a threat, a hand of cards,
   a riddle, a performance), its participants, its moves (the subject's own acts), its stakes (said before a move),
   and its ending conditions (resolved, withdrawn). The threat becomes one kind. Patience's warning stays its trigger.
2. **Focus into the engine**: the frame carries what the player is attending to, set by the act that began it, and
   Doable narrows by it, as it does by Engaged. Attention in src/ui then reads the frame instead of deciding.

## The fiction-versus-mechanics audit

For each pin: what the activity claims the player is doing; what state and decisions actually represent it; what
meaningful outcome follows. **Verdict** is whether participation is modelled.

| Pin | Claims the player is | State and decisions that represent it | Outcome | Verdict |
|---|---|---|---|---|
| the-fiddle | playing a musical instrument, badly then well, for a room | a thing's states hung → down → tuned → halting → played, one act each; no choice but go on; nothing narrows while playing (cards still offered) | a fact (`fiddle_left`), a boy whistling the tune later | **Fiction only.** No expressive choice (what to play, for whom), no stakes, no audience response, no focus. |
| the-window-table | playing beggar-my-neighbour with Morwen | the cards' states patience → dealt → beaten / taken; the second hand one check (insight, fair, retried) or one cheat (deception, hard; caught bars the table) | buttons, a remembered welcome or a closed table | **Partial.** A real choice between two ways to play and a lasting consequence, but no hand, no turns, no invitation (any act starts it), no resign; the game is a check, not a game. |
| evening-at-the-inn | spending an evening: listening, singing, standing a round | rows in order: sit, listen (half an hour passes), join the chorus, stand a round | Hywel thanks the singer; Gwenllian knows them next evening | **Activity, unengaged.** Time passes and is remembered; no decisions with weight; correct as an activity, not meant as an engagement. |
| the-fox-earth | sitting still at dusk to watch wild animals | a time window (dusk, first light); a stealth check, retried; success or a blackbird | the cubs seen; a feather on the path after | **Activity with a real condition.** Time and skill gate it; but nothing narrows during the vigil, and no choice beyond retrying. |
| the-point-and-the-seal | walking the sea-wall and sitting still on the point | ways out and back; the hour chooses the shore's words; a sit that a seal answers, nearer the second time | the seal knows you | **Activity.** Honest as a walk and a quiet place; the repeat visit is the only progression. |
| a-letter-home | having a letter written and getting an answer | a penny paid; a day on the clock; the answer by the life's origin | news from one's own people | **Errand with a delay.** Fictional framing correct; no decision in what is written. |
| pleasures-in-town | taking part in a town's pastime (riddles, skittles, kite, washing song…) | per pleasure: an invitation row, two steps, nothing paid, no aim; the green remembers | the green shows what was done | **Fiction only, by template.** The invitation is real; the two steps are not participation. Breadth without depth: sixteen kinds, one shape. |
| tinker-kit | watching a craftsperson and taking part | a practitioner at their work; an opportunity to help (a part found, a toy mended) | the thing made or mended | **Partial.** The best of the set as an occasion, but taking part is one act. |

Pattern: the pins model *that* something happened and *that it is remembered* (good), never *how it went* as a result
of what the player chose, and never narrow the frame while it is happening. The one with a real decision (cards) has
no game under it.

## The one to prove first: a hand at the window table

The cards are the right proof, because they exercise every part of an engagement and because the Arcana direction
(below) is built on exactly this:

- **Invitation and participants**: Morwen deals the company in only when asked to sit; who is at the table is
  recorded; a companion may sit too.
- **Focus**: sitting sets the focus on the table; the frame offers the hand's moves and the two withdrawals (play out,
  get up), and nothing of the room but what cuts in (someone speaking to the company, a threat). The fiddle is not
  offered while a hand is dealt.
- **A real, small game**: a hand of a few cards each, turns, a rule simple enough to say in a line (not
  beggar-my-neighbour, which has no decisions; a trick-taking or matching game with two or three choices a turn), and
  Morwen's cheat as a thing that can be noticed (insight) or answered in kind (deception), inside the game rather than
  instead of it.
- **Stakes said before**: buttons or pennies, and her regard; cheating is said to be risky before it is tried.
- **Resolution and withdrawal**: a hand ends won, lost, or resigned; getting up mid-hand forfeits the stake and is
  remembered differently from losing.
- **Consequence**: what she says of you after, her table open or closed, and one thing learned (where she learned to
  cheat, a name, a rumour) only from a hand played honestly to the end.

Proved by a feature pin played through the runner by the rows (it.failing first), and by the frame: while dealt, no row
but the hand's, the withdrawals, and what cuts in.

## Directions preserved (not commissioned)

- **A final perks stage of creation**: surprising, substantial capabilities chosen last, with Set out now kept as the
  immediate path (OR-153).
- **The Arcana as a collectible deck and a playable card game**: individual magical cards as real objects with rules
  and world effects (not fictional references), combinations between them, possibly persistent capabilities; built on
  the engagement model above once a hand at the window table is proved. Related: OR-154 (the tarot's major arcana,
  perk-gated), OR-155 (the collectible card game of mini-perks).

Both are to be developed in proportion to the first hour's priorities; the interaction model is the foundation.

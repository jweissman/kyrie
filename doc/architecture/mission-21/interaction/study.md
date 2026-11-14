# The first touch and the fundamental action: a comparative study

Part 1 of the interaction research (`../interaction-research.md`, the owner, 15 November). This is about behaviour,
not screenshots: what each exemplar does from the moment a hand moves to the moment play continues, and which of its
techniques could transfer to Westernesse.

Every claim is marked as one of three kinds, kept apart:
- **[P] established practice:** documented in published guidelines or standards, or done the same way across many
  shipped games;
- **[J] aesthetic judgment:** mine, argued, open to the owner's disagreement;
- **[H] hypothesis:** worth testing, and tested where the experiment (`experiment.md`) says so.

The exemplars come from memory of play and of published talks and guidelines. No exemplar was re-played for this
study, and the timings given are approximate.

## Westernesse as it stands (the local build of 8f3becc7, 14 November)

Before the comparison, the thing being compared. It was recorded unedited at 1280×800 with keyboard and mouse
(`/var/tmp/kyrie/ix/opening-base/`, a 62 s webm with stills), and measured over 20 repetitions of the principal action
(`experiment.md`, "the game as it is").

**What already works like a game:**
- The title's rows answer focus within a frame.
- The scene's four are one column of rows with keys.
- An engine answer comes back in about 200 ms from the press (median 193–211 ms, the press to the next screen drawn).
- The press is shown pressed in the first frame (median 10 ms).

**Where it still feels like a website:**
- **Setting out is the longest still moment.** It takes 12–17 s, with "Setting out…" under the title's sky.
- **The hand at rest lights what it never pointed at.** In 60 of 60 acts, the next screen lit the row that happened
  to be under the resting pointer. That's a web hover, not a game focus. After "Talk to Cesar", the third reply was
  lit at once.
- **A key held down does more than one thing.** Enter held on "Talk to the wagoner" for 400 ms sent three commands:
  the talk, then the first reply ("Offer him a hand, for a share of the load"), then another. The browser's own key
  repeat fires a native click on whatever button has focus next. A player resting a thumb on Enter commits a reply
  they never read. This is the one real defect the study found, now fixed for everyone (IG-17).
- **Opening the Wait lens scrolls the column.** The scene's own words move out of sight above the opened rows, which
  is a page scroll the grammar forbids.
- **Each screen arrives by a fade, and nothing carries over.** The talk page is a different composition (the
  portrait, then the replies), entered by a cut.
- **There is no sound.**

## The exemplars

Seven, chosen because each solves one of the brief's questions in a way that shows in behaviour. Each section gives
the behaviour, then what might transfer.

### 1. Destiny 2: hold-to-commit with a cost (controller-first menus)

**Behaviour:**
- Destructive or costly menu acts (dismantling an item, abandoning a quest, some purchases) are done by holding the
  button, not pressing it.
- A ring or bar fills on the button glyph next to the item over about ¾–1 s, and the act is done when it is full,
  not on release.
- Let go early, and the fill drains back visibly over a fraction of a second; nothing is done.
- Ordinary acts (equip, inspect, move between tabs) are plain presses, so holds are rare.
- Every press and the completed hold has its own short sound.

**What transfers:**
- **[P]** Hold-to-commit belongs to destructive or costly acts. A hold on every act is widely reported as fatigue,
  and accessibility guidance asks for an alternative: the Game Accessibility Guidelines say "avoid / provide
  alternatives to holding buttons", and the Xbox Accessibility Guidelines ask for a hold-to-toggle option.
- **[P]** Commit when the fill is full, not on release; an early release drains.
- **[J]** The fill must be where the eye is. Destiny's fill sits on the glyph under the cursor. Westernesse's first
  hold (BP-09, IG-07) filled a 14 px ring at the row's far right while the eye was on the hand. That's half of why
  "nothing happened".
- **[H]** At about 0.5 s, a hold reserved for acts that spend a daily budget stays a pleasure over a session's dozens
  of uses. Tested in the experiment.

### 2. Slay the Spire and Into the Breach: the preview before commitment (interaction-heavy tactics)

**Behaviour:**
- **Slay the Spire:** hovering a card lifts it and shows its exact numbers against the hovered target. The energy
  cost is printed on the card. A card is played by dragging it to a target, or by a click and then a target.
  "End turn" is in a fixed, distant place.
- **Into the Breach:** hovering an action draws every consequence on the board (pushes, damage, deaths) before
  commitment. After commitment, the result happens exactly as previewed, and the game allows one turn reset a
  battle.

**What transfers:**
- **[P]** Preview at focus, not at commit: the player considers by moving focus, and the commit is then cheap and
  unconfirmed.
- **[P]** The cost is on the thing. Energy is printed on the card, not explained elsewhere.
- **[J]** Westernesse's engine already projects what an act risks (`Choice.risk`, `Marks`, `Grave.asks`). The
  grammar should say these belong to focus (shown as the hand arrives), so that commitment needs no second question
  except for the irreversible.
- **[H]** A future Energy cost shown on the row at focus (a pip count beside the key) makes the hold legible: one
  sees what is being spent while it fills.

### 3. Citizen Sleeper: a daily budget spent by deliberate placement (restrained RPG)

**Behaviour:**
- Each cycle (day) gives a handful of dice. An action is taken by dragging a die onto it.
- The action shows its odds for that die before release, and the outcome is narrated in a short text panel.
- The dice spent are gone until the next cycle. The budget is always visible, and its spending is a physical
  gesture.

**What transfers:**
- **[J]** This is the nearest model for an Energy cost in Westernesse. The commitment is felt because something
  visible is spent, not because a confirmation is asked.
- **[H]** A hold that fills, with the budget visibly drawn down at completion, gives the same feeling with no drag.
  A drag would be wrong on a controller or a phone column.
- **[J]** The text panel answers in prose, short, with the consequence first. That's what DOCTRINE §4 asks.

### 4. Disco Elysium: dialogue as the fundamental action, checks as exceptional moments (interaction-heavy RPG)

**Behaviour:**
- Every choice is a numbered line of dialogue: a click or a digit, at once. The chosen line is echoed into the
  transcript as the player's own words, and the reply follows in the same column (the conversation scrolls; the
  page never changes).
- White checks can be retried later. Red checks are one chance only, and they're marked as such before the choice.
- A check's roll is shown with a short sound, and its result is told in prose, with the dice behind a hover.
- "Continue" is itself a dialogue option, numbered, when a speaker has more to say.

**What transfers:**
- **[P]** The chosen words become the first words of the answer. Westernesse already does this ("◆ Talk to Cesar …"
  echoed as `Told.Working`).
- **[J]** Continuation as a choice in the same column, not a webapp button, is exactly what CN-09 asks for "Go on".
- **[J]** The red check is the dramatic vocabulary's *reckoning* in small: marked before the act, given its own
  sound and a beat after. It's what the design review's §7 means by exceptional moments in an exceptional form.
- **[P]** The dice behind a hover is IG-03's "inspect" verb in another game.

### 5. inkle (80 Days, Heaven's Vault, Sorcery!): the choice becomes the prose (restrained interactive fiction)

**Behaviour:**
- Choices appear after the text has finished arriving, never before.
- A chosen option folds into the narrative in place: its words become the first line of what follows, and the other
  options fall away.
- There is no confirmation, and nothing changes page: the story is one continuous column.
- In 80 Days the next set of choices arrives with a small delay after the text, so the player reads before they
  choose.

**What transfers:**
- **[P]** Delayed promotion: the next choices arrive after the telling. It's a long-standing IF technique, and it's
  the design review's "succession delayed".
- **[J]** The delay must be short and fixed. A per-moment delay that depends on what's told would read as lag.
- **[H]** A beat of about 150 ms (the taken row held) plus a 220 ms fade-in for the next rows, 140 ms after the
  answer, reads as deliberate rather than slow, and stays tolerable over a hundred repetitions. Tested as version b.

### 6. Hades: a commitment with ceremony, kept rare (excellent selection feedback)

**Behaviour:**
- The boon choice: a god appears and speaks, and three boons are offered as large rows.
- Focus moves between them with a soft tick and a highlight, and the full effect text is on the row.
- A commit is one press, answered by a sound, a flash on the chosen row, the others dismissed, and the god's last
  line. Then play resumes: there's no "Continue".
- Ordinary menu presses (the codex, the mirror) have a lighter sound family.

**What transfers:**
- **[P]** A UI sound family: focus, commit and cancel each have a distinct, short, low-volume earcon, and the commit
  is the weightiest. Persona 5 and nearly every console menu do the same.
- **[J]** The press answer is instant (a sound and a light within a frame). The world's answer (the god's line) comes
  a beat after. This is the brief's "input responds instantly while the scene reacts more deliberately", and Hades
  is its clearest instance.
- **[J]** The chosen row is kept and the others dismissed. That's the taken state the experiment adds: the act
  stays lit while everything else goes quiet.

### 7. Journey, Outer Wilds, Hollow Knight: the title as the world (the first touch)

**Behaviour:**
- **Journey:** the title is the desert itself. Pressing start moves the camera down to the traveller without a
  cut, so there is no load screen before the first step.
- **Outer Wilds:** the title is the campfire and the night sky. A new game wakes the player at that campfire.
- **Hollow Knight:** the title idles with drifting particles, and its menu is a short column. The choice of a save
  is a deliberate press with a sound, then a fade to black, then the world.

**What transfers:**
- **[P]** The title's own world continues into play (Journey, Outer Wilds) or ends in a single deliberate cut.
  Neither shows a loading screen that looks like a different application.
- **[J]** Westernesse's studio mark into the title is already this. The break is after creation: 12–17 s of
  "Setting out…".
- **[H]** That wait is the largest single obstacle to the opening feeling like one work. Covering it (IG-05) helps
  less than giving the time to the player: begin generating at "New game", so that creation's choices are read
  while the world is drawn, or draw the country's first place before its whole. This is an engine question, not a
  page one (see `recommendation.md`).
- **[P]** Drifting particles over a still title are the genre's quiet idle. The owner's embers (IG-14) are this.

## Techniques at a glance

The two subjects are *first* (the first touch) and *act* (the fundamental action).

| Technique | Kind | Exemplar | In Westernesse now | Bears on |
|---|---|---|---|---|
| Focus answers within a frame | P | all | yes | act |
| Hover suppressed until the hand moves after a screen change | P | console UIs, tvOS focus engine, most game menus with mouse | was **no** (60/60 lit); now yes (IG-18) | act |
| A key held down commits once | P | every game menu | was **no** (3 commands); now yes (IG-17) | act |
| A press belongs to the screen it began on | P | WCAG 2.5.2 (pointer cancellation); game UIs drop input during transitions | yes by accident (the row is replaced); not by rule | act |
| Commit on release, cancel by sliding off | P | WCAG 2.5.2, every native button | yes | act |
| Hold-to-commit for costly acts only, fill at the hand, done when full | P | Destiny 2 | removed (IG-07) | act |
| Preview at focus, commit unconfirmed | P | Into the Breach, Slay the Spire | partly (risk and grave words) | act |
| Ask again only for the irreversible | P | everywhere | yes (`Grave`) | act |
| Delayed busy indication (no flicker under ~100 ms) | P | platform guidance | n/a (no busy indication) | act |
| A short commit earcon | P | Hades, Persona 5, Destiny | no (IG-06) | act, first |
| Press answered at once, world answers a beat later | J | Hades, Disco Elysium | partly (the echo) | act |
| The chosen words become the answer's first line | P | inkle, Disco Elysium | yes | act |
| Next choices after the telling | P | inkle, 80 Days | no | act |
| Continue as a choice in the same column | J | Disco Elysium | no (CN-09) | act |
| Title continuous with the world | J | Journey, Outer Wilds | studio → title yes; creation → play no | first |
| No loading screen as a separate application | P | most console games | no (12–17 s) | first |
| A visible budget drawn down by a commitment | J | Citizen Sleeper | no Energy yet | act |

## The brief's questions, briefly

**What makes choosing pleasurable rather than administrative?** **[J]** Three things, in order:
1. Every press is answered at once, at the hand and in sound.
2. What's chosen stays visible while the world answers.
3. What the world says comes before the next list.

The administrative feel comes from the opposite: the next list appearing before the answer, a hovered row the player
never chose, and every act weighing the same.

**What are the best patterns for focus, hover, preview, confirmation, cancellation and transitions?** **[P]**
- Focus is immediate and single.
- Hover is a form of focus only once the hand has moved.
- The preview belongs to focus.
- Confirmation is only for the irreversible.
- Cancellation is sliding off or letting go early, always answered visibly.
- Transitions are cuts or short fades in place.

**How can input respond instantly while the scene reacts more deliberately?** **[J]** Split the answer in two:
- **the instrument's,** within a frame (the row pressed and taken, the tone);
- **the world's,** a fixed beat later (the told answer, then the next rows).

The engine's 200 ms is already in the right range. The page should not spend it all as dead time, and should not
show the next list first.

**How should a meaningful long-press commitment work?** **[P/J]**
- Only acts that spend a daily budget are held. Today that's the engine's `Choice.hold === 'sustained'`, as the
  candidate set.
- The hold fills at the hand, completes on full, and drains when let go early.
- A tap on a held act says "Hold" there and then.
- It's about half a second long, and there is a setting that turns holds into taps.

Which acts commit at once? Everything else: speech, movement, looking, a fight's moves.

**How can repetitive animation and confirmation friction be avoided over hundreds of interactions?** **[P]**
- No animation on the press path longer than a frame.
- Fixed, short durations, never scaled to content.
- Nothing that slides.
- Sound at low volume and short.
- No confirmation except for the irreversible.

**[H]** Version b's arrival beat is the one place that spends time on every act. The repetition test measures it, and
the recommendation weighs it.

**How can the opening feel like one continuous work?** **[J]** By losing the wait, not by decorating it (see 7).
Then by one instrument across title, creation and scene: the same row, the same press, the same tone.

**What can creation do to establish agency and identity from the first choice?** **[J]** Answer the first choice in
the world's terms:
- the card's sentence, already there;
- a tone;
- the background drawing nearer.

Creation is not where the hold belongs: the blind playtest is clear (BP-09). The more promising lever is diegetic
backgrounds, the "why have you come" question answered as a remembered moment, which is the owner's roadmap item
already.

**What common semantics serve every screen?** See `grammar.md`: one focus, one press, one inspect, one back, one
continue, with the dramatic register deciding the pace.

**What must browser, terminal and controller share?** **[J]**
- **Shared, in the engine's projection:** the acts, their order, which are held, which ask again, the register of
  what's told, and when continuation must be deliberate.
- **Each client's own:** how a press is measured (a hold in milliseconds, a key, a typed line) and how it's drawn.

# Engine-owned focus: one question for every client (OR-1364)

A design for review, not yet built (the Game builder, 27 November). The source is the architectural review's
fifth intervention (doc/architecture/reviews/arch-insights.md). The rulings it answers to:

- the engine owns the question (TB-09);
- one projection;
- the page invents no controls;
- the owner's question engine: the engine owns the step machine, and the page plays its rows.

## 1. What is wrong today

A conversation, a thing looked at, the map's selection, paging, and what has been asked and heard are each held by
every client. They are not held by the engine.

The page holds them in `ReaderApp`'s state (web/reader/reader-app.tsx, `AppState`). The terminal's runner holds its
own (src/cli/runner.ts):

- `with`, whom it is talking with;
- `talk:<id>` and `<id>#talk`, its turning to someone;
- `map:<place>` and `view:map[:<place>]`, its map;
- `RunnerTalks.theirs`, guessing whether a reply keeps the talk open.

`MenuModel.build` (src/frame/menu-model.ts) takes `attention`, `asked`, `heard` and `trading` from its caller, so the
same frame draws different menus depending on what each client remembered.

Every continuity failure in this family (OR-149, OR-177, OR-178, OR-179) has had to be mended twice, once in each
client, or has lived in one and not the other.

Reloading mid-conversation loses the conversation: the save holds the world, not the step.

### The page's state, field by field

| Field | What it is | Where it goes |
|---|---|---|
| `attention` (place, person, thing) | the focus | engine: `Focus` |
| `talk` (lines said in this talk) | the conversation's record | engine: `Conversation.lines` |
| `asked` | questions put in this talk | engine: `Conversation.asked` |
| `heard` | what could be said before the last thing said (what is new stands out) | engine: `Conversation.heard` |
| `trading` | the talk's wares open | engine: `talk.trading` |
| `turned` | what the place led with about whom the company turned to | engine: `Conversation.turned` |
| `acted` | the thing the last command was done to, from its own page | engine: derived from the focus at the command |
| `outdoors` | the world map is up | engine: `map` focus |
| `charted` | the map's selection, and where it was chosen | engine: `map.selection`, `map.from` |
| `mapPage` | the map menu's page of places | engine: `map.page` |
| `exploring`, `kept` | what is opened over a place at rest (ways, things at hand, a wait, everyone here) | engine: `place.part` |
| `focused` | the lens path: a thing that did not fit its four, then a run of its acts | engine: `examine.within` |
| `talking` | the talk lens (likenesses shown) | engine: `place.lens` |
| `rail` | where the folded lenses were taken up | engine: `place.lens` (folds again at another place) |
| `view` (here, pack, company), `member` | a sheet over the scene | engine: `sheet` focus |
| `confirming` | an irreversible choice chosen once, its cost said | engine: `confirm` on the question |
| `fight` (FightMark) | what of the fight has been drawn | page: animation (the fight is the engine's already) |
| `creation`, `waiting` | making a life | engine already (EngineCreation); `waiting` stays the page's |
| `cursor`, `keyed`, `hovered` | where the keys and pointer are | page |
| `open` | folds the player opened in a fight's hand | page (unfolding menus only in a fight) |
| `pending` | the command in flight, drawn taken | page |
| `walking` | the mark walking a journey | page: animation |
| `prologue`, `beat`, `told`, `opened`, `goalSaid`, `leaving`, `approach` | the opening's pages | engine-owned pages already (OR-382); the beat shown is the page's |
| `entry`, `story`, `news`, `reading` | the Book, the Story, what is unread | page: reading engine-given documents |
| `phase`, `catalog`, `saved`, `options`, `stage`, `error`, `help`, `step`, `unkept` | shell | page |

After the migration the page keeps the viewport (cursor, keys, hover, scroll), animation (`walking`, `fight`,
`pending`, the opening's beat) and the shell. Everything that decides what is asked moves to the engine.

## 2. The session-owned Focus

```ts
// What the company is attending to: the step the question is asked from (src/session/focus.ts).
type Focus =
  | { kind: 'place'; part?: 'ways' | 'at-hand' | 'wait' | 'present'; lens?: { id: string; at: string } }
  | { kind: 'talk'; with: string; page: number; trading: boolean }
  | { kind: 'examine'; thing: string; within: string[] }          // within: LensFocus's path, outermost first
  | { kind: 'map'; selection?: string; from: string; page: number } // from: where the company stood when chosen
  | { kind: 'sheet'; view: 'pack' | 'company'; member?: string }
  | { kind: 'fight' }                                               // derived: a battle is under way
  | { kind: 'creation' }                                            // derived: EngineCreation's steps
  | { kind: 'ending' };                                             // derived: no one is left standing

// The conversation under way, while focus is talk (and kept a turn after, for the leave-taking's words).
interface Conversation {
  with: string; since: number;          // opened at this elapsed minute
  lines: TalkLine[];                    // durable: the text the player saw (narration is durable)
  asked: string[]; heard: string[];     // questions put; replies on offer before the last thing said
  turned: string[];                     // the acts the place led with about them when they were turned to
}
```

`PlaySession` holds `focus` and `conversation` beside its steps.

- **It is not a world fact.** No rule reads it, and the Digest does not change with it.
- **It is the session's revision** (OR-740's remainder: "the session's own revisions … not yet its parts").
- **`fight`, `creation` and `ending` are derived, never set.** The engine reads them from the battle, the creation
  state and `running`, so they cannot disagree with what they derive from.

### Transitions are session commands

A focus command is a command of the session, like `follow:` (PlaySession.follow) today:

- it changes no world fact;
- it takes no watch;
- it is kept as a step of the transcript, so a replay reaches the same focus;
- it is answered with a frame.

The grammar is one prefix:

| Command | What it does |
|---|---|
| `focus:place` | back to the place (take leave of nothing, close any part or lens) |
| `focus:part:<ways\|at-hand\|wait\|present>` | open a part of the place at rest |
| `focus:lens:<id>` | turn a lens on |
| `focus:talk:<person>` | turn to someone; no time (today's `<id>#talk` holder and the runner's `talk:<id>`) |
| `focus:page:<n>` | page the focused list (the talk's replies, the map's places) |
| `focus:trade:on\|off` | the talk's wares |
| `focus:examine:<thing>[/<act-run>]` | look at a thing, and into a run of its acts |
| `focus:map[:<place>]` | open the map, selecting a place (today's `view:map[:<place>]`, `map:<place>`) |
| `focus:sheet:<pack\|company>[:<member>]` | open a sheet |

**Acts of the world that begin or end a focus set it as their consequence.** The engine decides this from the act's
kind (`Choice.does`), never from its words:

- `talk_to` sets talk;
- `look_closely` on a thing sets examine;
- `take_leave` sets place;
- leaving the place (moved) sets place, or the map where the company came into open country;
- a fight begins fight;
- a reply in a talk keeps talk. This is decided by the engine (the reply is one of the focused person's rows), not
  guessed by the runner.

**"Put away the map" is an act** (AGENTS.md). It is `focus:place` from the map, drawn as the menu's last row. It takes
no watch, as today.

Each focus command is answered within the decision budget (a decision under 15 ms). It reads no new world, so §5's
cache makes it a projection over kept rows.

**Focus checks its subject.** A focus whose subject is gone falls back to `place`, in the engine, once:

- a talk with someone who has left;
- a thing examined that is gone;
- a lens on a place left.

Today each client does this fallback separately (the page's `acted`, the runner's `with` reset on `take_leave`).

## 3. Asked and heard, kept

`Conversation` moves into the session, and into the save.

**The checkpoint.** `SessionCheckpoint` becomes version 2:
`{ version: 2; transcript; save; focus: Focus; conversation?: Conversation }`. A version 1 checkpoint resumes at
`place` (there is no save-compatibility promise, but nothing is lost by this).

**On resume.**
- The focus is checked against the world (§2).
- A conversation whose person is still present reopens on its own lines, with `asked` and `heard` as they were.
- Reloading mid-conversation therefore shows the same talk, the same dimmed questions, and the same new replies
  standing out.

**On replay.** The steps reproduce focus and conversation (focus commands are steps), so the saved values are a
shortcut for resume, held equal to the replay by the replay spec.

**When a conversation ends.**
- Leaving the place, taking leave, or the long silence ends it (today the page's `Conversation.night`: 36 ten-minute
  turns, past six hours).
- `lines` are durable narration. Ended, they stay in the Story's entries as they were told, never re-rendered.
- `asked` is per conversation, as today. What the company asked across conversations is a world fact where Kyr writes
  one (the `_again` replies), and that stays the world's.

## 4. One Question on the frame

Every frame carries the question asked from its focus:

```ts
interface Question {
  focus: Focus;
  // The one menu for this focus, built by the engine (MenuTree): the place's scene, a talk's replies and leave, a
  // thing's acts and back, the map's places and Put away the map, a sheet's rows, the fight's hand.
  menu: MenuNode;
  // How the fixed frame lays it out, and what it draws beside the rows: hints only, never controls.
  hints: { layout: 'scene' | 'talk' | 'examine' | 'map' | 'sheet' | 'fight' | 'creation' | 'ending';
    subject?: { id: string; name: string; portrait?: string }; page?: { at: number; of: number };
    conversation?: { lines: TalkLine[]; asked: string[]; heard: string[] } };
  // A choice that cannot be undone, chosen once: its cost said; chosen again, done (today the page's confirming).
  confirm?: { command: string; cost: string };
}
```

- **`Frame.menu` becomes `Frame.question.menu`.** `MenuModel.build(frame, view, open)` loses `attention`, `asked`,
  `heard` and `trading`. Its attended branch (`MenuModel.attending`, `Attending.talk`/`examined`) moves into the
  engine's `MenuTree.question(frame, focus, conversation)`, where it is computed once for every client.
- **Every focus transition is a row of the menu, with its command.**
  - "Talk to Wat" is `focus:talk:<wat>`.
  - "More places…" is `focus:page:2`.
  - "Back" is `focus:place`.
  - The page invents none of them, and the runner offers the same rows by the same ids.
- **Marks derive from these rows** (one derivation per lens). The talk's dimmed questions (`asked`) and new replies
  (`heard`) are marks the engine sets on rows, never the page's styling choice.
- **The page draws `question.menu` with `question.hints`** and keeps only the cursor on it. The terminal prints the
  same rows, and the runner offers them.

## 5. Relation to the incremental frame (Copilot's PR #12)

PR #12 keeps the frame's rows by what they read (`KeptReading`/`WorldReads`, scoped through Campaign, failing closed
on the readout). It adds a fast path to `PlayerRevision.of` for unchanged revisions between commands. Focus fits it
in three layers:

| Layer | What it is | Keyed by |
|---|---|---|
| 1 | Rows: what can be done | the world and its reads (PR #12), never by focus |
| 2 | Screen and leaf | the player revision, as now |
| 3 | The question: the focused menu, built over the kept rows | `(rows' revision, focus, conversation)`, a cheap `SessionRevision` beside `PlayerRevision` |

What this gives:

- **A focus command rebuilds only the question.** Turning to someone, paging, or opening the map builds no rows and
  no screen. These are the commands a player makes most often between acts, and today each rebuilds the page's menu
  from client state.
- **`PlayerRevision` does not take focus as a part**, so PR #12's fast path is untouched. The question's own key is
  separate, and a spec holds it to a fresh build, as the screen oracle holds the screen.
- **The one coordination point** is PR #12's keyed rows: `MenuTree.question` must read rows only through the kept
  rows, never by rebuilding them. I'll raise this on PR #12 before step 2 below.

## 6. Migration, each step proved across the three clients

**Step 0 (OR-1450): the parity harness first.** test/client-parity today holds EngineHost against PlaySession (the
terminal's session). It is extended to three clients:

- the page's engine (EngineHost);
- the terminal (PlaySession through `Terminal.play`'s path);
- the runner (Runner over the same checkpoint).

Each is driven by the same public commands. At every step they must agree on:

- the focus;
- the question's rows (ids, labels, marks, the row the keys rest on);
- the active choices;
- the Digest.

Scenarios are added one per later step. A multi-turn conversation with paging, `asked` and `heard`, and trading
comes first.

**Steps 1 to 5.** For each one:

- the engine computes it;
- the clients' fields for it are deleted;
- the parity scenario for it is added;
- the continuity census and the client-parity spec stay green;
- the page's change lands with a contact sheet at 1280 and 390.

| Step | Row | What moves | Deleted from clients |
|---|---|---|---|
| 1 | OR-1451 | Talk, with asked, heard, trading, turned and paging. The largest divergence, and the ground for OR-149 and OR-165 (one scrolling talk, then engine-owned dialectic). | `attention` (person), `talk`, `asked`, `heard`, `trading`, `turned`; the runner's `with`, `talk:`, `RunnerTalks.theirs` |
| 2 | OR-1452 | Examine, with the lens path | `attention` (thing), `focused`, `acted` |
| 3 | OR-1453 | The map: selection, its page, and Put away the map as `focus:place` | `outdoors`, `charted`, `mapPage`; the runner's `map:` and `view:map` |
| 4 | OR-1454 | The place at rest: its parts and lenses, and sheets as a focus | `exploring`, `kept`, `talking`, `rail`, `view`, `member` |
| 5 | OR-1455 | Confirm on the question; `Frame.menu` retired for `question.menu`; `MenuModel.build`'s focus parameters removed; fight, creation and ending named as derived focus kinds | `confirming`; the last of `MenuModel`'s `at` |

**Order and checkpoint.** The order puts the largest divergence first and the cheapest last. Every step can land
alone. The checkpoint's version 2 lands with step 1 and carries each later focus kind as it is added.

## 7. Calls made, and open questions

**Calls I made:**

- **Focus is the session's, not the world's.** Making it a world fact would put it in the Digest, the rules' reads
  and every save comparison, and no rule should turn on whether the page is open.
- **Focus commands are transcript steps,** as `follow:` is, so a replay reaches the same focus. They are not world
  acts, so they take no watch.
- **The saved focus is a shortcut,** held equal to the replay.
- **The Book, the Story and the encyclopedia stay the page's reading** of engine-given documents: they are not a
  step, and ask nothing. If compactification's earned surfaces need the Book to be a focus (an instrument opened in
  the scene), it is a sixth kind, added the same way.

**Open questions:**

- Whether opening a talk by its holder (no time) and `talk_to` (a greeting, a world act) stay two rows. Today the
  engine already decides which a person offers; this design keeps that and only moves where the focus lives.
- The terminal's command names. The runner keeps accepting its old `talk:`, `map:` and `view:map` as aliases for a
  while, so the cold plays' kept lines still run.
- Whether the derived kinds (`fight`, `creation`) should share the `Question` shape now or at step 5. The fight
  already has `ChoiceList.combat`; I would leave it until step 5.

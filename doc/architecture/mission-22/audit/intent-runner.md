# A headless intent runner: design proposal (audit, 17 November 2026)

The owner, 17 November: "a platform-agnostic headless runner that accepts a command language as broad as 'follow or
acquire quest goal' which then can translate into whatever helpers are needed to an action or unfold a lens with a
matching action (or look into the book for unfollowed aims)."

This is a proposal, not an implementation. Everything below is either what the code already does (named) or a gap
(called a gap).

## 1. What exists

| Driver | Speaks | Resolves by | Used by |
|---|---|---|---|
| `bin/kyrie run`: `Runner` (src/cli/runner.ts + runner-*) | JSON lines in: `{act}`, `{lens}`, `{look}`, `{more}`, `{follow}`; out: `Said` (scene, the four, the rest, `led`, aim, aims, need, next, changed, kept, broken) | the real choice id only; `not offered` otherwise | blind agents (TB-05), terminal-matrix, experience-matrix, exploration-sample, promise-fidelity (`RunnerWalk`) |
| `bin/kyrie serve`: `Serve` (src/cli/serve.ts) | JSON `{op: start, act, view, card, checkpoint, resume}` | the id | test/serve, own-hex-engine |
| `bin/kyrie play`: `PlayTool` and `Journey` (src/session/journey.ts) | steps as strings: a label pattern (`Examine › Push`), `@command`, `>place` (BFS walk), `map:Name` (set out), `=12:00`, `=until <fact>`, `~pattern` (until through), `?step` (optional), `FIGHT` | label regex over `ChoiceList` leaves, `Journey.way` routing | ~200 specs via test/support drivers, transcripts, play-* scripts |
| autoplay (src/autoplay) | none: a policy picks a `Move` (`command` or `travel`) from `Situation` (all legal choices, destinations, dangers, `led`) | `AutoPlayer.kind` regexes, `AutoplayRun.led` | matrix-walk, boredom-census, novice-*, tour |
| `MonoDriver` (test/support/mono-driver.ts) | browser keys and clicks: `do(subject, …labels)`, `inLens(part, act)`, `go`, `talk`, `fight` | DOM labels and `kyrieMono.inspect()` | browser specs |
| `Terminal` (src/cli/terminal.ts) | a person's numbers and typed names | `TerminalMenus`, `Terminal.same` | people |
| The page | presses | `MenuModel`, `LensFocus`, `TalkFocus` | people |

**What the engine already gives an intent resolver.** Each is in src/presentation unless named:
- **Glance** (glance-types.ts):
  - `acts`: Promoted, each with `why`, `aspects`, `continues`, `advances`, `aim`, `for`, `inside`;
  - `offer`: the four and the rest, each with a `type`;
  - `lenses`: things, people, places, time;
  - `lead`: the AimLead, the followed aim's next step;
  - `next`: the Successor;
  - `need`, `leads`: Threshold/Means, what bars a way and who has it;
  - `sensed`: what lies along each way, and who;
  - `compass`, `aimed`, `following`.
- **Undertakings**: `held`, `followed`, `follow`, `aimedAt`.
- **AimLeads**: `advances`, `sellers`, `wanted`. **Succession.next**.
- **Itineraries** (src/ui/itinerary.ts): `plan`, `destinations`, `roads`. **LandCrossing.offers**. `Travel.dark`.
- **PlaySession.leg(command)**: `follow:<aim>`, `travel:<place>` and every world command, with fights through a
  `CombatController`. **checkpoint/resume**.
- **DangerSense** (how a fight would go). **Outmatched.warning** (the giver's warning).
- **The intent families**: 10 families over 83 schemas, in scripts/intent-catalogue.ts, not at runtime.

## 2. The vocabulary

An intent is a verb and, at most, one object, said as a player would say it. The verbs are the catalogue's families
plus the book and the map. Each resolves to steps the engine already has.

| Intent | Family | Resolves to, in order |
|---|---|---|
| `pursue` (the aim) / `pursue <aim words>` | undertaking | 1. an aim followed: the act in the four with `continues`, else `advances`; 2. else the act a lens holds with `continues` (open that lens); 3. else `lead` names a place: `go` there; 4. no aim followed: `book` → follow the first held (or the one whose words match); 5. no aim held: `acquire` |
| `acquire` (a goal) | undertaking | an act whose `why` is `held` or `asked`, or `aspects` ∋ undertaking without `continues` (the notice, the giver's topic); within a talk, the `inside` act for undertaking; else the nearest place `sensed` with `undertaking` |
| `book` / `follow <aim>` / `unfollow` | reflection | `Undertakings.held` → `follow:<id>` (no time) |
| `go <place\|person\|thing\|"out"\|"back">` | movement | here: an exit to it; known: `travel:<id>` from `Itineraries.plan`; heard of: `LandCrossing` toward it, or "known only by report"; a person or a thing: where `at` says, as far as the company knows it; `back`: `Glance.back`; `out`: the compass |
| `talk <person\|"whoever would join"\|"whoever knows X">` | social | a people-lens act on a subject; "would join" = an act with `aspects` ∋ companionship or `why` `help`/`companion`; then the `inside` act for that aspect, else the talk opener |
| `ask <person> about <topic>` | social | the talk's topics (TalkFocus order once it is the engine's); the word match is over the topics the talk offers, never all topics |
| `answer <words>` | social / discovery | the focused unit (LensFocus) whose acts are a run of alike words: the act whose last word or quoted word matches |
| `look [at X]` / `search [X]` | perception / discovery | the things lens: `look_closely`/`examine` on the subject, `search` on the place; `{look: true}` for the whole place |
| `buy <thing>` / `sell <thing>` | organization | a talk with a seller (`AimLeads.sellers` for an aim's want; `CompanyLight.of(...).sellers` for a light; otherwise someone whose trade offers it), then the `buy_goods`/`buy_item` act binding a kind matching the words; not known here: `go` to someone known to sell it |
| `rest [until morning]` / `wait [until X]` | reflection | the time lens: `rest`/`take_lodging` (an inn), else `camp`; until morning means the act that ends at dawn; `wait until <fact>` repeats the wait the lens offers while the fact (as Journey's `=until`) does not hold, with a bound |
| `fight [X]` / `flee` / `avoid` | conflict | the fight act on X (DangerSense said with it); `flee` is the fight's retreat; `avoid` is the way with `why` `retreat`, or `slip_past` |
| `take <thing>` / `use <thing> [on Y]` / `light` | manipulation | the act binding that thing (things lens); `light` is the one the glance offers in the dark (`need` ∋ dark) |
| `recruit <person>` / `part with <person>` | relationships | the act `recruit` within the talk (`inside` for companionship) |
| `learn <skill\|spell>` | practice | `learn_*` on a teacher's talk; not here: `go` to a teacher the company knows of |
| `explore` | discovery | the way with `aspects` ∋ exploration not yet taken (`idle` excluded), else an unvisited way, else a road out |
| `continue` | (none) | `Glance.next` (the Successor), else the first of the four |

**Each intent's answer**, whatever its outcome:

```
{ intent: "pursue", resolved: "act" | "lens" | "book" | "travel" | "none",
  steps: [{ via: "lens:people", act: "ask(region__wat, father)", label: "Ask Wat about Father" }],
  then: <the runner's Said after the last step>,
  why?: "no-aim-held" | "aim-without-known-step" | "not-here-known-elsewhere" | "unknown-place" | "barred"
        | "beyond-the-company" | "nothing-matches" | "ambiguous", candidates?: [...] }
```

An unresolved intent is a finding in itself. Each `why` names a layer:
- `aim-without-known-step` is AimLead's;
- `barred` is Threshold's;
- `nothing-matches` is the vocabulary's, or the content's.

That is exactly the "name the layer" the owner asked of OP-05.

## 3. Where resolution lives

In the engine's projection, beside the glance: `src/presentation/intents.ts`, called as `Intents.resolve(campaign,
screen, glance, intent)`. It returns the steps, made only of choices the projection offers. It never takes an act
the page would not show.
- **It reads** `Doable.of(...)`: one function from a glance to rows with their commands, the consolidation of
  threads.md §1 (Runner.within/way/keyed, Terminal.led, AutoplayRun.led).
- **It routes** by the one `Ways.route` (threads.md §5).
- **It focuses** by LensFocus and orders talk by TalkFocus, once both have moved from web/reader into
  src/presentation (threads.md §4).

**Who calls it:**
- **The runner:** a new line kind `{ intent: "pursue" }` next to `{act}`. It answers with steps and the final
  `Said`.
- **The terminal:** a typed line that is no menu label (`> pursue`, `> buy a lantern`). This is the feature pin
  "Free-form input: an act typed in the player's own words, outside the four, is understood or refused"
  (test/features/choice/consequence.pin.test.ts:53).
- **The page:** nothing at first. Later, the same resolver can light the row an intent would take: a "what now?"
  hint, which strict gold allows only for the followed aim.
- **EngineHost:** an `{ kind: 'intent' }` request. The page's worker and the headless host would then answer
  identically.

**The rule that keeps it honest.** Resolution reads only the player-safe projection: Glance, Screen, the Notes'
aims, and Itineraries over known ways. That is how RunnerWalk already works ("from what the runner said alone"). An
intent that would need the world (an aim's hidden target, an unknown seller) answers `none`, with the layer named.

## 4. How it relates to the drivers it could unify

- **Runner.** The intent line is added. `{act}` stays as the primitive, so the intent runner *is* the runner, one
  level up. Serve's `checkpoint`, `resume` and `card` move in, and serve retires (threads.md §2).
- **Journey.** Its label grammar stays for authored specs, since labels are what an author pins. Its helpers that
  are really intents become intent calls:

  | Journey step | Intent |
  |---|---|
  | `>place` | `go <place>` |
  | `map:Name` | `go <Name>` by travel |
  | `=until` | `wait until` |
  | `~pattern` | `go through` |

  Journey's own BFS router is replaced by `Ways.route`.
- **Autoplay.** Tempers become intent policies:

  | Temper | Intent policy |
  |---|---|
  | `gold` | `pursue` |
  | `silver` | `explore` |
  | `care` | `rest` / `light` / `buy rations` |
  | `fight` | `fight` |
  | `investigate` | `look` / `search` / `ask` |
  | `wander` | `explore` with no aim |

  `Situation` comes from `Doable`, not from `PlayerView.choices`. So the lab sees what a player is offered (today
  every legal act: run.ts:104).
- **RunnerWalk.** `straight` = `pursue`, then `continue`; `curious` = `look` / `ask` / `explore`, not yet chosen.
- **MonoDriver.** Phase B's "reuse journey specifications in the browser". The resolver returns steps by choice id
  and lens, which the page's rows carry as `data-act` (action-system). MonoDriver can replay an intent's steps as
  keys: one journey language for headless and browser.
- **cold-player and honest-player** (test/support). They are intent players already. honest-player becomes
  `pursue` with logging; cold-player retires.

## 5. Migration, in small steps

Each step lands alone and is held by a small spec.

1. **`Doable.of`** in src/presentation. Runner, Terminal and AutoplayRun are switched to it one at a time. A spec
   holds that the three give one list from one state (extending test/action-identity to the autoplay lab).
   Also fixes WD-15's talk/topic gap. *S–M*
2. **`Ways.route`.** Journey.way and AimLead.way call it, and a spec compares both on the laboratory and a1. *S*
3. **`Intents.resolve` with four verbs**: `pursue`, `book`, `go`, `rest`. These cover "follow or acquire the quest
   goal". Tested on the laboratory (test/fixtures/laboratory/lowmouth.kyr): rats aim → pursue to the corn-store;
   no aim → book → follow; aim done → continue = Successor. *M*
4. **The runner's `{intent}` line and `bin/kyrie run --intents "pursue,pursue,rest"`** for scripted cold plays.
   Fold in serve's checkpoint, resume and card, and retire serve. *S*
5. **`talk`, `ask`, `answer`, `buy`, `look`, `search`, `explore`.** First move TalkFocus and LensFocus to
   src/presentation, so the page and the resolver read one focus. *M*
6. **Autoplay policies as intent choosers**, with the boredom census re-baselined on them (a new baseline, not a
   regression). *M*
7. **The terminal's free-form line, and an `{kind:'intent'}` EngineHost request.** The feature pin "Free-form
   input" goes from `it.todo` to met for the verbs above. *S–M*
8. **MonoDriver replays an intent's steps in the browser** (Phase B's fourth item). *M*

## 6. What it buys

**Cold-play agents.**
- Today a blind agent spends turns mapping words to ids (`not offered: …`).
- With intents, an agent can say what it wants, get either the steps taken or why not, and still drop to `{act}`.
- The `why` of each unresolved intent is the report, so a cold round yields layered findings, not "got lost".

**Feature pins (test/features).** A pin is one intent sentence on a tiny world.

| Pin | As intents |
|---|---|
| "a question put in conversation is a check" | `ask X about Y` then read the result |
| "exploring a region is an act of its own" | `explore` resolves to an exploring act, not to a way |
| "a level gained opens a way to talk … that was shut before" | `talk` fails with `barred` before and resolves after |

Pins stop depending on labels, which change with every prose pass.

**The boredom census.**
- It counts *intents resolved vs. intents refused* per hour, by family. That is the owner's "intents encountered vs
  realized" (owner-map-instrument-wander).
- It counts the unresolved `why`s by layer, instead of command kinds by regex.
- BO-04 ("an hour with no new thing the company can do") becomes measurable: an intent of a family that resolved
  `none` at minute 0 and resolves at minute 60.

## 7. Gaps the code does not cover yet

- **No runtime family on an act.** The catalogue is a script-side table (threads.md §6). `Offered.type` (ActType)
  is coarser. The resolver needs the schema → family map in src.
- **"Acquire a goal" has no typed source.** An act that *gives* an aim is not marked as such. `why: 'held'` marks an
  act for an aim already held, not followed; the notice's acts are found by aspects. Needed: a `gives?: aim` or an
  `undertaking` reason on acts whose effects assert a new Objective (AimLeads reads effects for `advances` already).
- **"Whoever would join"** rests on the `companion`/`help` reasons and `Sensed.who` (OR-64, OR-68). Within a talk,
  the recruit act is reached by `inside`. A person met but not here needs Undertakings-like memory of who would come.
  CompanyRecall has some of this; it is not exposed.
- **"Buy a light" works; "buy X" in general does not.** Light has its own engine reading:
  `CompanyLight.of(campaign, screen)` gives `sellers` and `shops` (src/presentation/company-light.ts), and that is
  how the glance leads a company in the dark. Any other want ("buy rope", "buy rations") needs a word-to-kind map
  over a seller's stock. Matching labels is what Journey does and what the resolver must not do. `AimLeads.sellers`
  covers only what an aim wants.
- **"Answer the riddle"** needs LensFocus in the engine, and the riddle's words as a unit with a typed kind (today a
  label-stem heuristic, `LensFocus.stem`).
- **Routing honestly toward a place known only by report** (OPR-01, m20-owner-golden-thread). `LandCrossing`
  approaches a hex; an interior target with no known way has no "toward" beyond AimLead's `toward`.
- **Fights.** The runner drives a fight turn by turn (RunnerFight). An intent `fight` would need a policy (the
  company's tactics, as `PlaySession.auto`), so headless fights stay as today.
- **Ambiguity.** Two aims match "pursue the debt". The resolver answers `ambiguous` with candidates. It does not
  guess, as Journey's strict mode would not.

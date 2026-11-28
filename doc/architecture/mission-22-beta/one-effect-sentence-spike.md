# One effect sentence (OR-1333): a de-risking spike

**27 November, the lead.** A research spike before any builder takes OR-1333, with OR-1328 (result references) and
OR-1331 (one clock). It is a map of the two grammars, what unifying them would buy and break, and a slice order. It is
not an implementation.

## The two grammars today

| | Ability sentences (`src/lang/Abilities.ohm`, 39 lines) | Act consequences (`src/lang/Kyr.ohm`, `Change`) |
|---|---|---|
| **Statements** | `Deal`, `Heal`, `Apply … for N turns`, `Remove`, `Drain`, `Revive`, `Kill`, `Flee`, `Grant`, `Summon`, `Travel`, `Cast`, `Try`, and the typed `VerbCall` (#16) | `Assert`, `Retract`, `Set`, `Increase`, `Decrease`, `Give`, `Spend`, `Restore`, `Slay`, `Bring`, and `Resolve` |
| **Conditionals** | `If <expression>, <statement>` | none (authors' most repeated ask, AU-57: "No `If` in an effect") |
| **Saves** | `unless <kind> save against N`; `; a <kind> save against N halves/negates it` | none |
| **Targets** | role words resolved at execution: `enemy`, `ally`, `random enemy`, `party`, `self`, `it`, `here` | typed terms: entity ids, parameters, `party`, `self`, `it`, `here` |
| **Amounts** | Deem expressions and dice | Kyr values and measures |
| **Duration** | `for N turns` or `hours` | none (rules and measures by hand) |
| **Executed by** | the fight (Battle), FieldUse outside a fight, `EffectDomain.lower` for Outcome | the world's transition (`World.apply`), with Outcome reading the same changes |
| **In the corpus** | 83 sentences in the catalog's items, 414 abilities in the census; 30 with a duration, 12 with a save, none with `If` | about 6,960 consequence blocks and 6,100 rules |

## What unifying buys

1. **Conditional consequences for acts:** `If` already exists on the ability side. One grammar gives authors their top ask
   without a new construct.
2. **The bridge between local and global effects (OR-1097):**
   - abilities that change the world: light a room, open or seal a way, reveal;
   - acts that hurt, heal or apply a condition.

   These are the reference dungeon's own verbs (OR-1097's slices 4–6).
3. **One duration:** `for N turns/hours` becomes the one clock's duration (OR-1331), which the installed domain's overlays
   need for their recurrence and endings (installed-domain.md, step 4).
4. **One lowering:** typed verbs (#16) lower to world changes or to domain operations by one path, and execution and
   Outcome read the same bound changes (the typed-vocabulary design's rule).

## What it must not break

- **The 6,960 consequence blocks and 6,100 rules parse and lower exactly as now.** The unification is additive on the
  act side, never a rewrite. Proof: every corpus file parses to the same module, as the 24 November During change was
  proved (test/semantic-tracing; the game hashes).
- **The ability census stays at 414 round-trips, none differing** (#16's proof). Fights, saves and odds are unchanged.
- **Execution contexts stay apart where they differ.** A creature's hit points live in the creature store, not in world
  facts. A unified `Deal` must lower to the fight domain's operation in a fight and to the projection's write outside
  one, not invent a third path. This is the main risk.

## The risks, ranked

1. **Targets.** Role words such as `random enemy` are resolved by the fight at execution, while typed terms are bound at
   grounding. One grammar needs one target notion: a *role* resolved in the execution context. Roles already exist for
   `self`, `party`, `it` and `here` in both.
   - **De-risk first:** bind the act side's `it` and `here` through the same resolver as the ability side, with parity.
2. **Determinism of draws.** Ability amounts roll dice in the fight's stream. World changes take no draws today. A
   conditional or a dice amount inside an act must draw by stable identity (the standing ruling), keyed by the act's
   id and the turn, never by sequence.
3. **Outcome's prediction.** Outcome predicts world changes before an act. A dice amount or an `If` on a fact the act
   itself writes needs Outcome to represent the contingency. The beta brief accepts "within correctly represented
   contingencies".
4. **Grammar ambiguity.** `Remove`/`Retract`, and `Grant`/`Give`, overlap in meaning, not in form. Keep both spellings
   and lower them to one change rather than retiring either: no corpus rewrite.

## Slice order, each with its proof

1. **`If` in act consequences** (`On success { If <predicate>, <change>. }`), lowered to the conditional change a rule
   ladder writes today. **Proof:** a fragment where the ladder of two rules and the one conditional reach the same
   states; the corpus parses identically; Outcome predicts both branches. This alone answers AU-57.
2. **World changes in ability sentences** (`Assert`, `Set`, `Bring` after an ability's verb), lowered through the
   typed-verb path. **Proof:** a light-the-room ability in a fragment; the census unchanged.
3. **One target resolver** for role words across both, with page, terminal and runner parity.
4. **Duration as the one clock** (OR-1331): `for N turns/hours` lowered to one duration the overlay machinery reads;
   fights' rounds as the clock's finest grain.
5. **Result references** (OR-1328): "heal half the damage dealt" as a bound result of the sentence's earlier clause.

Slice 1 is small, valuable and nearly free of risk, so it is the place to begin. Slices 2 and 3 carry the
architectural risk and want the target-resolver spike before either.

## Recommendation

Give slice 1 to a builder now. It is bounded, it answers the authors' top ask, and its proof is mechanical. Run the
target-resolver spike (risk 1) in the foreground before committing slices 2 and 3. Keep OR-1331 joined to the
installed domain's step 4, so that duration is designed once.

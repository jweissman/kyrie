# Wrayford: friction (broad pass)

| What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|
| Voices with `memberOf(?m, party) and hasCalling(?m, calling_x)` (as in the Long Man) | Fine in a one-module campaign. In `gosses-company`'s four-module campaign (a sister adventure of this pass) the members' callings are installed under the *last* module's prefix (`westmarch__calling_cleric`), so a rule in another module never fires. I did not find out whether a `placed.json` world does the same. | Rewrote the voices to `capable(party, rites)` etc., losing the member's name in the text. | Install callings once under `canon__calling_x`, or resolve `calling_x` by suffix as `CreatureFacts` already does for lookups. **Not blocked**: capabilities work. |
| Two `says` rules becoming true in the same turn (`wade_weight` and the payoff of the hook at the far bank) | Only the first printed; the second set its flag silently. | The payoff test failed until I made the payoff depend on the first (`spread(weight_fact)`) so it fires a pass later. | Print every `says` that fired, in rule order. |
| `Item ... owned by X` then `Give` | The recipient is shown "X sees ... 'That is mine.'" as if stolen. | Dropped `owned by`. | Make `Give` clear ownership, or document. |
| `says "…" teaches fact` | Needed to teach a Discovery from a rule; `Assert knows(…)` is refused. | One line. | None; worth putting in the Kyr guide. |
| Test fixtures `traveller` and `seasoned` carry their own `module.json` source lists | A new file must be added to each. | Two edits. | None. |

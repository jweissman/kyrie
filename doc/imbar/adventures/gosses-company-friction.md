# Gosse's Company: friction (broad pass)

| What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|
| `hasCalling(?m, calling_cleric)` in a rule of module `pentrice` | In the four-module standalone campaign the party's `hasCalling` facts name `westmarch__calling_cleric` (the last module's install), `pentrice__calling_cleric` is a distinct, unattached entity, and the rule never fires. It works in the one-module `city.campaign`. | A whole voices file rewritten to `capable(party, performance|rites|lockwork|intimidation|woodcraft|perception)` and the member's name given up. | Install callings once (`canon__calling_x`) and let modules resolve to it; or resolve by suffix in rules as `CreatureFacts.declared` already does. **Not blocked.** |
| `Item … owned by tunstall` plus `Give` | The recipient reads "Tunstall sees … ‘That is mine.’" after the gift. | Dropped `owned by`. | `Give` should clear ownership. |
| Reading a world event | `canon` must list the event itself (`remainder_harboured`), not only `imbar`: `Invalid argument … in befell(…)` otherwise. | A line in each manifest. | Document in the technical report. |
| `bin/kyrie lint` on a rule reading an unfired event | Warning *applicability: no possible target in this world* (two). | Two permanent warnings. | A lint exemption for canon events that another module may assert. |
| Staging a world event in a test | `ModuleWriter.call('befell', 'remainder_harboured')` through `world.apply` works; the canon id is unprefixed. | None. | A `Journey.assert` helper. |
| Tunstall's schedule (westgate, office, wheel) | A new 17:00 stop at the nave needed its own return rule for days before the Trial. | Two rules. | None. |
| Giving the shipped (lone bard) party the requiem | `capable(actor, rites)` is false for a bard, and the 'alone' office is gated the same way. A third action keyed to `performance` and `not rites` did it. | One action, one relation, one condition on the bribe. | None. |
| Playing the shipped campaign to the minster | The road module needs the hat from the kiln; `Pay Lem his four months` is the dice-free way (the persuasion check can fail on a seed). | A longer test path. | None. |

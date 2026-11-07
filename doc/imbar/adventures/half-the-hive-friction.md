# Half the Hive: frictions in the broad pass

1. **A rule cannot assert discovery knowledge.** `Assert knows(party, east_staged)` inside `Rule … says` is refused ("a rule teaches what it says"). *Cost:* one lint round. *Repair:* `says "…" teaches east_staged { … }`. Known (11.1); worth a lint hint at the point of use.
2. **A Rule and an Entity cannot share a name** ("Duplicate rule fate_drewes"). The ending rules use `Rule fate_nell_named` with `Entity fate_nell`; I had a rule `fate_drewes` and an entity of the same name. *Cost:* trivial. *Repair:* rename.
3. **Company size lives in `company.kyr`, not in the campaign's `party`.** A fixture with five members refused to start ("Choose 1 companions"). *Cost:* a fixture module directory per party size (`company5/`). *Smallest repair:* let a campaign's party length set `Company … of N` for a standalone module.
4. **A topic cannot name a party member; an action can** (through a `member` parameter, `{c}`). So the cleric's office and the capping are *actions* ("Have Dori say…"), and there is no way to let a companion *talk* in a Topic. Known (11.6). Not blocking.
5. **Calling is visible; race and background are not.** The thief sees the pan; "the dwarf" cannot see the stonework. Known (11.6). **Blocked** for any race-keyed beat.
6. **Wax (Kyr kinds) behaves.** `holding(actor, white_wax)` and `Spend white_wax from actor` work on the group, and the Eben exchange (`keeps(eben, white_slab)`) really does remove the choice: tried, passes.
7. **Hint, not a bug:** `Observe … as feature` must come after `at <place>` (`Observe name at place as feature when …`); I wrote it the other way round once. The error was clear.
8. **No way to ask 'has the company a cleric?' in an Action's `Requires`.** `not hasCalling(?m, …)` needs a bound member; I used a one-line `Rule` that asserts `companyHasCleric(party)` and read that. *Cost:* one rule and one relation. *Repair:* a negated member query in `Requires`.

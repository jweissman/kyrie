# The Ring: friction

*What I tried, what happened, what it cost, the smallest repair. Items marked **BLOCKED** could not be done in data
and were worked round as stated. Everything else was done in Kyr/Deem/JSON as it stands. No `src/` change.*

## BLOCKED

**R1. BLOCKED (in part): a person's errand to a place in a country that is not installed, or behind a `hidden until` door.**
*Tried, and measured* (a scratch `Pursuit ring_walk for ring_head … seeks at(ring_head, X) using go planning N steps`
in `ring.kyr`, reverted; the Principal is a herald-bound entity declared in another module). *Works:* one way ahead
(quay to harbourmaster, 1 day); and across **installed** places, a walk from the largest town's taproom to the
Tolleth way-in (`gate_tolleth`), six rooms and two marches, took about five days of the world's clock at `planning
40 steps`, and he stopped there (the company was standing at the gate; he warned it). So an agent that walks between
installed places *is* available to the Ring, and is a better adversary than mine. *Does not work:* (a) the same
Pursuit with the bonded store as the target, two ways from the quay, never moved in twelve days: the store's doors are
`hidden until` facts and the planner does not take a hidden way; (b) a target in a country not yet installed cannot be
named, and Tolleth is installed only when a company first stands at its way in, so until then there is nothing for
him to seek; (c) a fourteen-step plan is too short for the town-to-Tolleth walk (forty is enough). *Worked round:* I
kept the Principal's round on two modules' clocks, meeting at a shared place (`abroad`), and did not ship the Pursuit
(a walking, territorial level-4 head who warns whoever he meets on the road is a bigger change to every other
adventure in the country than this branch should make). *Cost:* he can never be met between places. *Smallest repair
for (a):* let a `Pursuit` use a `hidden until` way whose fact the pursuer's own side knows (`hidden until … for the
company`), or let the store's door be a plain door and hide the *Observe*. *For (b):* a byway to a named region that is
not yet installed (`11-technical-report.md` §11.4).

**R2. BLOCKED: a fight with the Principal or the lieutenant that is fair to a level-1 company.**
*Tried:* Principal level 4-5, R. level 3-4 as warriors/thieves. *Happened:* a drawn world's preset company is level 1
with a few hit points; any two warriors of level 2 end a fight in a round (the cellar-men as warriors, two of them, beat a company of three in four fights of five, and three or four of them in
three of three; as two level 1-3 commoners they lose all five). *Worked round:* the
cell are commoners; R. and the Principal are warriors/thieves who warn first and are meant to be got round; both have
no refuge so that `routed` is permanent. Their fights are not simulated in a test. *Cost:* "defeat by combat" of the
Principal is a risk the company chooses against the odds. *Smallest repair:* none in data; `bin/kyrie forecast`
for a generated world would say it; the data answer is a weaker Principal, which would not be the Principal.

**R3. BLOCKED: the Ring's own knowledge of the company.** A response needs a trace for each act it can know of
(`seenSearch`, `talkedLieutenant`). *Smallest repair:* `Notices when …` (`10-exchange.md`, `11-technical-report.md` §11.4).

**R4. BLOCKED: torture.** A name is written under persuasion, a bribe and fright (the leaf laid before a frightened
man). There is no action in the shared rules that is "hurt someone to make him tell", and an intimidation check on the
factor would be one more route to a key already given; I left it.

## Worked round (each cost a rename, a test or an hour)

**R5. A measure cannot be read across two modules.** The Dorothea cannot read the town's `stay`/`away`/`seenAbroad`.
The two modules therefore keep **separate clocks** for the same person and meet at a shared place. The first design
(one `leg` measure) was refused by the loader. *Repair:* let a herald export a measure as well as an entity.

**R6. A herald binds export name to the same import name.** The Dorothea already has `principal` (Josselin Marchbank) and
`lieutenant` would have been fine; the Ring's head had to be exported as `ring_head`, the lieutenant as `ring_coast`.
*Repair:* `herald.exports` as `{ "import": "export" }`.

**R7. Global names.** `searched` and `homeward` are canonical or taken (`redefinition`, `Duplicate function`): renamed
`cellLooked`, `ringHome`. `ledge_scene`, `gate_scene` and the like already existed in the Antlers: all new observations
in the Lamp Below carry `lb_`. `bin/kyrie lint` reports them before a test does.

**R8. `routed` is not permanent for anyone with a `Refuge`.** `data/rules/inhabitants.kyr` retracts it at first light
(`temper_rallies`). My first Principal and lieutenant had `Refuge abroad` and un-routed themselves the next dawn: the
sacrificed lieutenant walked back into the circuit and the fled Principal came back to his round. Found by a test
printing `routed` each day. Fix: no `Refuge` for either, and the Dorothea latches its own `ringFallen` from `routed or dead`
so that the gate does not depend on it.

**R9. A rule anchored at a place fires wherever the company is.** Four of the Lamp Below's first voices were
latched while the company was on the island's green, and never heard. Found because the thief's "two locks" was not in
the page. Fix: `at(party, place)` in every anchored rule's condition (the lint advises it; I ignored it once).

**R10. `Retract at(x, ?p)` needs `?p` bound by the rule's condition** ("writes ?p, which its condition does not bind").
Add `at(x, ?p)` to the `when`.

**R11. A rule cannot assert `knows`.** Every discovery is therefore learned by a Kind that `teaching`s it, a topic, or an
action that asserts it, and the herald-bound `Entity x: fact` stand-ins in the Dorothea are the same entities. This is
the working channel, and it works both ways: the Dorothea teaches `principal_traced` and the town reads it.

**R12. The standalone Dorothea has no ring.** `company.kyr` declares `ring_head` etc. as local stand-ins so that the module
compiles by itself; there the Lamp Below can be reached only when a test asserts `routed(ring_head)`. *Repair:* none
wanted; it is a feature of the optional-import pattern (the same as `ring` for the Exchange).

**R13. A hand-drawn world needs a company that is not waiting.** The Principal arrives at the bonded store on his
round and is territorial; a test that waited in the store for the clock lost the company. Every wait now happens at
the quay. That is the design (a company that stays at his door is warned, then fought).

**R14. `says` with `{?m}` in a rule that also names a calling needs `memberOf(?m, party)` before `hasCalling`**, and a
Requires clause on an Action cannot print `{?m}` from a `memberOf` unless the same variable is bound in `Requires`:
done as `Requires … and memberOf(?m, party) and hasCalling(?m, calling_mage)` and `{?m}` in the Result. It worked
(`cipher_the_wheels`, `read_the_office`).

**R15. A lone company needs its own campaign.** `count(memberOf(?m, party)) == 1` is the lone-company condition; to
test it, `company.kyr` now says `of 1 to 3` (it said `of 3`) and `test/fixtures/ring/lone.campaign.json` has one
member. The shipped campaign is unchanged.

**R16. `templates.json` / `tables.json` were re-indented** by the tool I used to add keys: the diff is larger than the
change. Nothing semantic moved.

**R17. Deem draws sequentially, so adding a rank re-rolled the Exchange.** My first casting put the cellar-men, the
lieutenant and the Principal into `factors_casting` and their measures into `initial`; every world's `run`, `stock`
and `muscle` changed (thorn's muscle 3 became 5) and `exchange-responds` failed on a seed it had chosen for its muscle.
*Fix:* draw the ring last: a top-level `"*ring": "=gen(factors_ring)"` after `initial`, whose own `">casting"` and
`">initial"` keys (the `>` forces a nested template to resolve what its parent already holds) are overlaid onto the
parent's (`*` merges objects and concatenates arrays). The five-seed table of `10-exchange.md` is again exact.
*Smallest repair:* none needed; a line in `doc/architecture/content-authoring.md` saying that template keys are drawn
in order, and that a new draw goes last, would have saved the hour.

## Things that did not need working round (recorded because the brief asked)

- Deem can cast a `level` and a group's `count`: `Cast.fields` includes `level`. The lieutenant's *temper*, *secret* and
  the Principal's *nerve* are `initial` measures, which Kyr conditions branch on (`temper(R) == 2`).
- A herald can bind a **place** (`abroad`) and **facts** as well as persons.
- `hidden until` takes an imported fact: evidence read in the town opens a door in another country.
- Canonical `routed`, `dead`, `at`, `tolerates` are enough to read an adversary's fall from another module.
- A save resumes into every one of these (`canonical()` equal) with no special handling.

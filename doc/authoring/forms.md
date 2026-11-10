# Forms the engine already has

Authors of the anthology wrote around several things Kyr and the spec harness could already do (register M19-127).
Before writing a flag and a rule by hand, look here. Each form is used somewhere in `data/` already; search for it to
see it in context.

## In a module

| To | Write | Notes |
|---|---|---|
| Teach a fact when a rule fires | `Rule x when … says "…" teaches fact { }` (`once` before `says` to fire once; `says "…" again "…" then "…"` for words in turn) | A rule may not otherwise change what the company knows. The braces are required, even empty. |
| Say a rule's words only where it happens | `Rule x heard at place when … says "…" { … }` | Its effects happen wherever the company is; its words are heard only there. `Rule x at place when …` anchors both. Without either, the words are told wherever the company is (M19-126). |
| Say something only near someone | `Observe x near party when … "…"` (or `near person`) | Told where the company is, when the condition holds. |
| End the game when the company falls | an ending `when not able(party)` | `able(party)` is the company still standing. |
| Count time | `watch(clock)` | A watch is ten minutes: 6 an hour, 144 a day. |
| A check's failure told | `Otherwise "…"` after `Result "…"` | `On failure { … }` for its effects. A failed check is offered again unless you latch it (M19-124). |
| Read a world event (a fall of a house, a war) | `befell(event)` in a condition, with the event's id listed in the module manifest's `"canon"` | Without the listing the compiler refuses it as an invalid argument (M19-175). |
| Ask a companion's calling | `memberOf(?m, party) and hasCalling(?m, calling_mage)` for one in the company (recruited ones are members); `travelsWith(?h, party) and memberOf(?m, ?h) and hasCalling(?m, calling_mage)` for an escort who only travels with it | Callings are on the member, not the person's own name (M19-183; `test/hired-calling.test.ts`). |
| Charge for something said | `On discuss { Decrease quantity(actor, gold) by 5. }` in a Topic | As the debt's "Pay" topic does (`data/origins/debt/origin.kyr`). |
| Say what an aim is about | `Objective x when … toward keeper "…"`; `toward crypt by yard` where it is gone to by somewhere else first | The page leads there and to nothing else its words name; `bin/kyrie lint` advises where an aim without one is ambiguous (M19-225). |
| A thing hidden until found | `Item x "…" is kind at place hidden until fact` with a `Discovery fact "…" { Found by searching place "…". }` | The fact may also be taught by a rule or a topic. |

## In a journey (a spec played by the page's labels)

See the head of `src/session/journey.ts`. The steps people missed:

- `?step` takes a step if it can be taken and goes on if not.
- `=until C` waits until a condition holds, as the module writes it (`=until complete(reckoner)`).
- `>place` walks to a place by the shortest way.
- `@command` performs a command by its id.
- `Endings.reached(world)?.title` (src/lang/endings.ts) says which ending was come to.
- `j.fight(step, how)` takes a step whose fight is fought as the spec says: `PlaySession.scripted([...])`, or a
  controller of its own (M19-186).
- `j.seen()` is what the company sees where it stands now, every Observe of the place (M19-187).
- `j.at(who)` and `j.holds`/`j.measure` take a name with or without its module's prefix (M19-185).

## Words already taken

The shared rules (`data/rules/*.kyr`) declare about a hundred and fifty relations, and an adventure's own of the
same name is shadowed. Words the anthology found one at a time by loading: `service`, `watch`, `shut`, `closed`,
`fallen`, `turned`, `captured`, `arrivedAt`, `homeOf`. To see them all:

```sh
grep -hoE '^\s+(Relation|Measure|Entity) [a-zA-Z_]+' data/rules/*.kyr | awk '{print $2}' | sort -u
```

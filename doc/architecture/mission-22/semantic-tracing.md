# Semantic tracing: a declaration that survives its lowering (MT-30)

The language review of 20 November (doc/architecture/reviews/kyr-language-evolution-2026-11-20.md, §3.1, Phase A,
§7.2) asks that a high-level declaration (`Route`, `Promise`, `Occasion`, then the rest) survive compilation as an
object of its own, so that the tools explain it in the author's terms and not in the rules it lowered into. The
runtime is not changed: it still runs the lowered pursuits, rules and aims. This note fixes the record, where it
lives, and the first slice.

## The record (src/lang/semantic-record.ts)

Made by the lowering itself, beside what it lowers into, so the two cannot disagree:

- **identity**: `kind:id` as written (`occasion:hearing`); installed, `kind:installation/id`
  (`occasion:quittance/hearing`). Never a generated id. The compatibility snapshot pins these.
- **source**: the file, line and column of the declaration; for a generated one, the generator's provenance
  (ModuleSource's `{ generator, construct }`: see below).
- **participants**: who and where, by role (a route's walker; a promise's keeper and the one it is made to; an
  occasion's place).
- **phases**: the process's states, in order, each with the authored words for it and the condition, over the
  lowered facts, that says it holds (a promise: not yet made, standing, kept, broken; an occasion: waiting, each
  matter open, over; a route: each leg's window). Exactly one should hold, and the record says which does.
- **requires / effects**: the authored conditions and changes (a promise's kept and broken, a matter's until).
- **lowered**: the rules, pursuits, aims, entities and relations it became. Supporting detail only.
- **reads / writes**: the relations its conditions ask and its changes write, which is what can affect it.

## Where it lives, and why not in the save

The lowering writes `module.semantic`. The bundle sets each record's file as it joins a module's files, and the
namespacer renames its ids, conditions and lowered names with the module's own, as it renames everything else.
The campaign module keeps the records. **A save does not**: they are the compiler's output, immutable and
re-derived from source, never current truth (the review's risk "semantic metadata becomes a second mutable truth").
So the canonical hash, the saves and the page's view do not move. A game restored from a save has no records until
it is loaded from source again, which every tool already does.

## The five questions (`bin/kyrie inspect --why process <campaign> <name> [step ...]`)

Played as `--why fact` plays, with CampaignTick's witness:

1. **What is happening here**: the declaration, its words, its participants, its source line.
2. **What phase is it in**: the phase whose condition holds now.
3. **Why did it advance**: each step of play where its phase changed, from what to what, and by which of its own
   rules (named as supporting detail) or by the clock.
4. **What can affect it**: the acts and rules of the campaign that write what it reads, and the choices it
   presents (the acts that make a promise or ask that a matter be open).
5. **What came of it**: the phases it went through, and the facts its authored effects wrote.

## Generation: where ModuleSource meets it

ModuleSource (generated-ir.md) already carries a declaration made as a value with its provenance. The two records
are one idea from two ends: the generated one should lower through the same code and get the same record, its
`source` the provenance instead of a line. The meeting point is the lowering: a typed declaration (a Topic today, a
Route tomorrow) is lowered by the construct's own lowering, which writes the record whichever way it came in.
Until then the records name generated declarations by provenance only where the IR carries them.

## The slice, and what waits

Quittance has all three: the Route `wk_to` (Fettiplace's walk to the wake), the Promise to the annuitant, the
Occasion `hearing`. Each answers the five questions in a spec (test/semantic-tracing). Every Kyr file parses to
the same lowered module (its records aside), and the games hash as before. A snapshot of every semantic id in the
shipped corpus (test/fixtures/semantic-ids.json: 24 declarations in 14 modules) is the corpus pin, and the
compatibility harness's world snapshots carry each world's ids and phases (CompatCompare: one gone is
replay-breaking, its phases changed world-moving, one more additive). Waiting: the Doable rows carrying the
semantic id they serve (that moves the page's view, so it comes with a view change, not here), the other forms
(Event, Passage, Ending, Chapter, Milestone), and the lints reading the records (AU-37's fate chain is written as
rules, not as a form, so it reads the rules: when a fate chain is a form, "a process that can end in no phase").

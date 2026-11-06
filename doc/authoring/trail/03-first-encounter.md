# 3. A first encounter

*The authoring trail, page 3 of 9. [Start](../README.md) · previous: [How it is built](02-architecture.md) · next:
[An adventure in the shared world](04-adventure-in-the-world.md)*

We make *The Lantern Well*: a town square with a covered well, a well-keeper who will say why it is covered, a lid
that can be lifted, and an ending. Every command below was run on `fbf38d58`; the output is quoted.

## Scaffold

```sh
bin/kyrie new lanternwell "The Lantern Well"
```

```text
  wrote data/adventures/lanternwell/site.kyr
  wrote data/adventures/lanternwell/company.kyr
  wrote data/adventures/lanternwell/placed.kyr
  wrote data/adventures/lanternwell/module.json
  wrote data/adventures/lanternwell/placed.json
  wrote data/campaigns/lanternwell.campaign.json
  wrote test/fixtures/lanternwell/journey.json
  wrote test/lanternwell.test.ts
```

`site.kyr` is the adventure: a region within `imbar`, a town, a road room and a square joined by a gate. `module.json`
plays it on its own (with `company.kyr`); `placed.json` installs it in the shared world without a company of its own
(page 4). The campaign file and the spec let you play and test it alone.

> **Known limit.** The scaffold's `company.kyr` and campaign give the standalone game a preset company of three
> (Elen, Bran and Dori: `src/cli/new-tool.ts:35-46`), and its pitch says "Choose three companions". That is the
> legacy standalone shape; in the shared world the player's own company plays it and the adventure supplies no one
> (owner's rule, 6 November; open as M19-75 in the owner's working tree). Write nothing that names a preset member.

## Write the encounter

Add to `site.kyr`, inside the module, before the closing brace:

```kyr
  Person maud "Maud" at square {
    Role "well-keeper". Peaceable.
  }
  Topic ask_well with maud "Ask Maud why the well is covered" when true {
    Says "{maud} taps the lid with her stick. 'Something answers when you call down it. Lift it if you must.'".
  }
  Thing lid "the well's lid" at square {
    State shut "A lid of grey boards, weighted with stones, covers the well.".
    State open "The lid lies aside; cold air rises from the well, and far down something answers your breath.".
    Change lift "Lift the lid off the well" from shut to open.
  }
  Ending answered "What Answers" when state(lid, open) "You lean over the dark, and the well says your name back to you.".
```

Two things the compiler taught us while writing it, which the guide's examples show but do not say: a `Topic` is
declared at module level, not inside the `Person`; and it must have a `when` (here `when true`). Both errors name the
line and what was expected:

```text
data/adventures/lanternwell/site.kyr: Invalid Kyr module: Line 13, col 63:
> 13 |   Topic ask_well with maud "Ask Maud why the well is covered" {
Expected "when" or "answering"
```

## Compile, lint, play

```sh
bin/kyrie compile data/adventures/lanternwell/site.kyr          # prints the lowered module as JSON, or the error
bin/kyrie lint data/campaigns/lanternwell.campaign.json
```

```text
data/campaigns/lanternwell.campaign.json [recommended]: 0 errors, 0 warnings, 1 to look at
  advice growth: no Milestone: the company grows only by fighting (0 not peaceable); give what it resolves its worth (`Milestone id "title" worth N when …`)
```

The advice is right: an adventure that rewards only fighting gives a peaceful solution nothing. Play it by the labels
a player sees (`--choices` lists everything offered at the end):

```sh
bin/kyrie play data/campaigns/lanternwell.campaign.json "To the square" "Ask Maud why the well is covered" "Lift the lid off the well"
```

```text
[To the square] A square of trodden earth, and a well. A lid of grey boards, weighted with stones, covers the well. Maud, a well-keeper, is here.
[Ask Maud why the well is covered] Maud taps the lid with her stick. ‘Something answers when you call down it. Lift it if you must.’
[Lift the lid off the well] You lean over the dark, and the well says your name back to you. The lid lies aside; cold air rises from the well, and far down something answers your breath.
-- watch 1, at lanternwell__square
```

(The ending's epilogue is told before the lid's new state; harmless here, but an author who wants the change seen first
should know.)

## Test it

```sh
bun test test/lanternwell.test.ts       # the scaffold's spec: lints clean, and walks the road into the square
bin/kyrie verify lanternwell             # lint, the adventure's tests and its kept traces, together
```

```text
 2 pass
 0 fail
lint: clean, 1 to look at
tests: 2 passed, 0 failed, in 1 file
traces: 0 of 0 come to what they came to
lanternwell: lint, tests and traces all hold
```

Grow the journey file (`test/fixtures/lanternwell/journey.json`) with the steps a player takes and the spec with what
must then hold. `bin/kyrie new scene|item|chapter|character <id> --in lanternwell` adds a part with its own spec, and
`bin/kyrie play scene <id> --in lanternwell` plays it from where it stands; `bin/kyrie new scene wellhead --in
lanternwell` wrote a scene and a spec that passed as written.

Where to read on: the [guide](../guide.md) §§1–6 (places, passages, people, things, knowledge, descriptions) and
§"How the story ends".

*Next: [An adventure in the shared world](04-adventure-in-the-world.md).*

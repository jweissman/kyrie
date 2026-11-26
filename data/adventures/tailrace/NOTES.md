# The Calf in the Tail-Race: notes

A rescue with no villain: see doc/adventures/tailrace/story.md and friction.md.

## Before you hand it in

```
The author's path (doc/authoring/checklist.md), in this order:
  bin/kyrie names <Surname> <Place> ...           is each name free, across every adventure?
  bin/kyrie lint data/campaigns/tailrace.campaign.json   does it load and lint clean?
  bin/kyrie play data/campaigns/tailrace.campaign.json --choices   does it play as you meant, by hand?
  bin/kyrie inspect --why fact data/campaigns/tailrace.campaign.json "<fact>"   why is something so, or not?
  bin/kyrie reach data/campaigns/tailrace.campaign.json --detail   what does a curious player never reach?
  bin/kyrie voice repeats data/adventures/tailrace   which of your phrases come again and again?
  bun test test/tailrace.test.ts   do its journeys play as written?
  bin/kyrie verify tailrace [--played "who, when, how far"]   all of it at once, before you hand it in
People or scenes in files of their own, if you like: bin/kyrie new character <id> --in tailrace [--major|--companion|…], bin/kyrie new scene <id> --in tailrace.
```

Human play is evidence of its own: say who played it, when and how far (`--played`), or verify says none.

The campaign's company is a test company of one, Tester: no line of the adventure names them, as no line names a player's company (a player comes with their own).

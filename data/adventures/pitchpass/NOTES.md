# The Pitch of the Glass: notes

What it is for, who comes to it, and what is open.

## Before you hand it in

```
The author's path (doc/authoring/checklist.md), in this order:
  bin/kyrie names <Surname> <Place> ...           is each name free, across every adventure?
  bin/kyrie lint data/campaigns/pitchpass.campaign.json   does it load and lint clean?
  bin/kyrie play data/campaigns/pitchpass.campaign.json --choices   does it play as you meant, by hand?
  bin/kyrie inspect --why fact data/campaigns/pitchpass.campaign.json "<fact>"   why is something so, or not?
  bin/kyrie reach data/campaigns/pitchpass.campaign.json --detail   what does a curious player never reach?
  bin/kyrie voice repeats data/adventures/pitchpass   which of your phrases come again and again?
  bun test test/pitchpass.test.ts   do its journeys play as written?
  bin/kyrie verify pitchpass [--played "who, when, how far"]   all of it at once, before you hand it in
People or scenes in files of their own, if you like: bin/kyrie new character <id> --in pitchpass [--major|--companion|…], bin/kyrie new scene <id> --in pitchpass.
```

Human play is evidence of its own: say who played it, when and how far (`--played`), or verify says none.

The campaign's company is a test company of one, Tester: no line of the adventure names them, as no line names a player's company (a player comes with their own).

# Fifty settlements, judged

The Deem workbench's first authoring task (BRIEF §7): fifty settlements sampled as a player meets them, the weak
rejected with a reason, one template revised, and the same seeds drawn again. This is creative evidence, not a defect
list. Only the doubled word below was a fault, and it is mended. The rest is for the authors to weigh.

## How it was made

Everything is in `bin/kyrie deem` (src/cli/deem-workbench.ts):

```
bin/kyrie deem browse
bin/kyrie deem sample settlement doc/architecture/mission-22-beta/workbench/settlements --n 50 --seed bench
bin/kyrie deem compare doc/architecture/mission-22-beta/workbench/settlements
bin/kyrie deem inspect doc/architecture/mission-22-beta/workbench/settlements 5 came
bin/kyrie deem reject  doc/architecture/mission-22-beta/workbench/settlements 5 "why"   (and select)
  (data/generation/tables/peoples.json revised)
bin/kyrie deem replay  doc/architecture/mission-22-beta/workbench/settlements
```

- **The sample.** Ten worlds' first countries (`bench-0` to `bench-9`), five towns each. They are drawn by Deem, laid
  out, named and peopled by WorldAssembler.region. Each home town also carries its troubles as undertown.kyrt draws
  them.
- **The files.** `study.json` holds the samples as they were drawn before the revision. `verdicts.json` holds twenty
  verdicts, each with its reason and the fields as they were judged.
- **Inspect** names where a field came from:
  - the template's expression;
  - each table and the group it was drawn in, with the entry drawn;
  - what the world did to the field afterwards;
  - for a trouble, the Kyr template's options with their weights and lines.

## Variety (compare)

- **Names.** 49 of 50 distinct. No two towns in one country are alike, which PlaceNames sees to.
- **People.** 46 to 49 of 50 distinct.
- **Sizes.** Ten towns, twenty villages and twenty hamlets.
- **Trades.** Eleven.
- **Calling of the traveller.** Ten.
- **What a folk "came" for.** 13 lines over 18 towns that have one.
- **The home towns' troubles.** Ten home towns:
  - store: rats 8, apprentice 1, runaway 1;
  - the churchyard's dead: 10 of 10;
  - the quarry's spiders: 10 of 10;
  - the hand on the green: three kinds.

## The worst fifth (rejected)

| # | Town | Why |
| --- | --- | --- |
| 5, 9, 35 | Redcarr, Linquëtîr, Loewostar | "trade eels and reed with the human folk folk": peopleCame wrote `{majority} folk`, where the folk word already says folk. **Revised.** |
| 7, 10 | Loxorlôx, Loewnal | Its undines are Aqua, Pearl, Lagoon, Ocean and Jewel. These are things, not people's names. Read as nicknames, they make a priest a joke. |
| 38 | Barzelmizela | Its birdfolk are Maddie and Plume: a nursery name and a thing. |
| 4 | Reedthwaite | The third Unicorn among its country's five inns (#1, #2, #4). The inn's noun is drawn with no regard to its neighbours. Mornloxor has two Boars, Karkatzeh two Phoenixes. |
| 30 | Birchford | The Shadowy Pixie, a fairground inn in a moorland slate hamlet. |
| 20 | Ironholt | The Crystal Ship, in an iron hamlet in the fells. |
| 45 | Fernfen | Fern and fen: one word said twice over. A Common name, not Deem's. |
| 13 | Lothosta | Says of its folk what #12 says, word for word, the next town over. peopleCame has two lines for each folk. |

## The best fifth (selected)

| # | Town | Why |
| --- | --- | --- |
| 15 | Deephaven | Its gnomes came for the salt and the quiet, and have filled the quiet with clocks: a joke and a trade in one line. |
| 39 | Harrehes | The clocks again, this time gnomes in a dwarven country. |
| 28 | Coldmouth | Its half-orcs were paid in land for a war nobody remembers: a history in a clause, and a reason a salter's town is theirs. |
| 48 | Eagleworth | Its half-orcs are the grandchildren of raiders who stayed to farm: the second history of the same people, as good as the first. |
| 12 | Alaftaure | Elm wood: elves who came down from older country when the trees were cut, and have not forgiven it. |
| 17 | Barazhatzik | Red hold: dwarves who stayed when the peat ran thin. |
| 29 | Khesefir | Silver town: dwarves burning charcoal where the seam ran thin. Trade, folk and history agree. |
| 3 | Wǽttún | A halfling village in a human country, its priest and traveller lizardfolk: a mixed town that says how it came to be. |
| 24 | Bordmaere | Birds mere: halflings who came up the river with the honey carts. The plainest sample that reads as somewhere. |

What the best have in common is the folk's one line of history (peopleCame). It is the only field that gives a town a
reason. The worst are mostly names and inns drawn from lists that know nothing of the country.

## The revision, and the replay

In data/generation/tables/peoples.json, two lines now say "the {majority}", not "the {majority} folk": the lizardfolk's
"trade eels and reed with…" and the gnomes' "came to mend things for…". The folk word is "human folk", "elven folk",
"dwarven folk", "halflings" and so on.

The replay drew the same fifty again:

- **Changed:** 3 samples, exactly the three rejected for it (#5, #9, #35). Each is now "rejected, revised", and its
  `came` and `told` read "with the human folk" and "with the elven folk".
- **Unchanged:** the other eight rejected, "still as it was", and every selected one, "as it was". The draws do not
  move, because the change is in the words, not in which line is drawn.

## For the authors (not done here)

- **Undine and birdfolk names** (data/generation/tables/names.json, townsfolkName). The undines' 21 names are words of
  the water: Aqua, Brine, Coral, Ebb, Kelp, Lagoon, Ocean, Pearl, Reef, Tide, Wave. The birdfolk's are Feather, Plume,
  Dart. What a people calls itself is an artistic call. Names in their own tongue, with the meaning kept, as the
  elves' and dwarves' towns have, would match the rest.
- **Inns that belong to their country.** The inn is one of forty adjectives and thirty-eight objects, all the same
  everywhere. Porthalen's Stone Horn works because it could be a drover's. An inn drawn by terrain and trade, and
  apart from its neighbours' as town names already are, would remove the Unicorns and the Pixie. This changes draws in
  every country, so it is a direction, not a fix.
- **More than two lines of history for each folk** (peopleCame). It is the best field and the most repeated: two towns
  of one folk in one country often say the same thing.
- **The home towns' troubles.** Every home town has the churchyard's dead and the quarry's spiders; only the store
  varies. The undertown is the best place for recomposable variation, and the brief's warning applies: not another
  ledger.
- **Pronouns drawn apart from names** (Violet, he; Hadrian, she; Bran, she). This is by design (RegionPeoples). Whether
  it reads as intended is the owner's question.

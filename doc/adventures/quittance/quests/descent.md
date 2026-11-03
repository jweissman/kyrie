# The Descent (`descent.kyr`, prefix `ds_`)

Premise: go down. The Sunk City is a route-and-endurance game that ends in a conversation that is a game. The Fire is
not a villain; it is an old courteous creditor, precise as a bailiff, that burned Cindermouth and is not sorry (R12).

## Map

```
exchange_court ==[cellar door]== cellar_foot -- (arcade, Queue: others') -- glass_street
glass_street (shade, water) -- slag_a (warm) -- slag_b (hot) -- flue_foot --[damper]== first_flue (Cinder Ward)
glass_street -- furnace_row (glass men) --[Last Stair]-- hearth_below
slag_a -- vault_door (notarial lock) --[door]-- vault (Policy, shade) --[Treaty stair]-- hearth_below
```

Two doors to the Fire: the clerk's (Furnace Row and the glass men's audit) and the notary's (the Strongroom's lock, and
the Treaty on the table). Arrive by the Flue only after the Fire has opened it.

## Approaches

| Where | Door | Needs |
|---|---|---|
| Cellar door | key (`cellar_key`, given by the lead) / `cellarLeave(party)` / picks (lockwork) / shoulder (brawn) | the shoulder costs: a bar's splinters, and the glass men are alerted (`ds_alarm`: the licence is no use, the fee is 12) |
| Heat | rises 1-2 per watch in the galleries (slag_b and the flue are the worst), falls in the street and the Strongroom, falls 4 per soaking with water (cistern in the Glass Street: three skins) | salamander lantern or the Fire's leave: none; copper ward-focus (found in the figures' glass) or the auditors' cuffs: half; at 9 it scalds each watch |
| Glass men | Policy of Passage, licence (not if alarmed), Phoenix writ, the Ledger, a forged Lamprey writ (deception, hard; a failure is a fight), 6 coin, slipping by (stealth), or fighting | a martial company can win (and take the cuffs); a clerk can hand them paper; a thief goes by |
| Strongroom lock | the closing words ("Quit, and welcome.") if the company knows the Founders' wording, has read the clerk's note, or read the seal (lore); a lore guess (hard); picks (lockwork) | three wrong sentences deafen the lock; picking scorches the Policy (the Receipt clause is lost) |
| The Fire | see below | no build is locked out |

## The Policy

Five clauses, read in any order (`ds_clause_1..5`), plus the closing words (`d_return_3`). No clause is longer than two
sentences. Together they teach `d_treaty_text` (1), `d_fire_is_real` (2, and on first sight of the Fire), `d_return` (3),
`d_tithe_debt` (4). The Receipt clause (5) says "where it is not square, the Guest shall take its own" and is the edge.

## The Fire

`ds_accord` 0..10 (what has been offered), `ds_slight` 0..3 (what has been insulted). The visible stance is the Thing
`ds_mood`: owed (start; heat at its hearth), lonely (accord 2+), tender (5+), wary (any slight; it warns: "Careful",
"I am counting"), wrathful (3 slights: the Burning, `fireWrathful`, the Fire assails the company).

| Offering | Accord | Note |
|---|---|---|
| Sit an hour (up to three count) | +1 each; also pays off a slight | costs an hour and heat; three hours is `fireFed` |
| The Return said | +3, fed | cleric with rites who has read clause 3 and the closing words, or `returnSaid(party)` (Auberon) |
| A Lent coal laid | +3 named for Pip's gran, +2 for Pip, +1 nameless | fed |
| Ledger read, an hour of a hundred names | +2 at 400, +3 at all 1104 | the Fire counts; fed at 400 |
| Apology | Prewitt +3, anyone with `ds_apologist` +2 (Ottoline, Garrity), Tobias +1, the company +1 (if licensed) | the person must be following the company |
| Bribe, threat | slight +1 each | Grave; three slights is wrath |

Leave (accord 3): no more heat. The Flue (accord 2): opens from below. Terms (after "what would you take instead" at
accord 3): a Night (5; the names of witnesses make it `ds_night_witnessed`), the average (7, and
`knows(d_decline_roll)`), a Hearthkeeper (5: Prewitt after his apology, Auberon, Tobias when `tobiasWilling`).
Coals (day 6+): two, once, if fed or in terms.

Slaying: attack the Fire. It is `like red_dragon`; a company of three level-10 warriors beat it in the test; ordinary
companies lose.

## Contract written

`fireHeard fireFed fireTerms fireTermKeeper fireTermNight fireTermAverage fireSlain fireWrathful`; also `returnSaid`
(declared), `ds_night_witnessed`, `ds_stays(person)`, `ds_coal_fed`, `ds_apologised(person)`, `ds_leave`. Read:
`cellarLeave witnessCount coalNamed* tobiasWilling returnSaid following travelsWith d_decline_roll`.

## Build matrix

Warrior: glass men fight (and cuffs), the Slaying. Thief: the pick on the cellar door and the lock, slipping the glass men.
Cleric: the Return, the Queue-side dead. Bard: sitting is attendance; the Fire does not take persuasion. Scholar: seal,
clauses, the guess. Plain party: coin for the glass men, the clerk's note for the lock, sitting, a coal, companions.

## Changed from the brief

- A company member cannot be made to stay: `memberOf` cannot be written. Keepers are Prewitt, Auberon or Tobias.
- Heat is charged on arrival for the watches that have passed, not mid-passage.
- The Fire is `like red_dragon` (the catalog has no elemental); the glass men `like golem`.
- The Ledger, forged writ, Phoenix writ and the key are not Given by this file (nobody can Give them in tests): read
  by relation only.

## Weakest part

The offers are arithmetic under the surface; the dialogue is mostly in the Fire's Result lines, not branching. The
Slaying is only plausible for a company far above what the book is likely to leave it at. The Ledger and the key routes
are untested here for want of a way to hand over items from a test.

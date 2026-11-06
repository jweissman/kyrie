# 12. Relationship map: actual cross-adventure consequences

*Only what is implemented and exercised in play. Each row names the mechanism (what physical or shared thing
crosses), the adventures it joins, and the test that plays it. "Shared" means a catalog item kind, a canonical
relation (`keeps`, `at`, `routed`, `refusesService`, `befell`), or a herald-bound entity. **No row is a flag one module
sets for another to read by name.***

```
                                  THE LONG MAN ──(bronze teeth, custody)──▶ the Founders' Exchange ──(carter on the road)──▶ LOW WATER
                                     │  ▲                                        │  (Deem-cast factor,                          (Halm: tray / bare cloth)
                                     │  └ rod, grey face, writ copy               │   carter, hands)
                                     ▼                                            │ routed(hands)
   FAIR WEATHER ─(tally rubbing)─▶ THE BLACK SQUARE ◀─(letter)── LOW WATER          └──────────────▶ THE DOROTHEA / SKERROW
        (Hosken)                  (Nexus, Sennet)      (Halm)                                    (Quillon loses his buyer;
                                     ▲        ▲                                                   the lamp is not sold)
   SKERROW ─(table rubbing)──────────┘        └─(glossary / Quint's lore)── LOW WATER, THE DOROTHEA
                                     │
                                     ▼
                                THE SLACK ── the Remainder ──(surety: terms)◀── WHAT TESSARY OWES (the Valuer's note)
                                     │
                                     ▼
                       world events: slack_opened, remainder_harboured / remainder_kept, mechanus_seen
```

| # | Consequence | What crosses | Joins | Played in |
|---|---|---|---|---|
| 1 | The steward's bronze, sold downriver, is bought by a person Deem made, and shipped south by her carter on a run Deem set, while the company is elsewhere; Halm has it on a cloth and says where it came from | `bell_teeth` item custody; `at(carter, south_road)` | The Long Man → the Exchange → Low Water | `factors-handoff` (3) |
| 2 | The Exchange named at the inn by a company: a poor house flees, taking the lot; a rich one buys the inn, and the company is refused service in the largest town; either way the house is read by others | `routed(group)`, `refusesService(group,group)`, custody | the Exchange → Low Water; → the Dorothea | `exchange-responds` (5) |
| 3 | Low Water's Halm, with no lots, has a bare cloth and says so | `routed(ring)` read by Low Water's own Observe | the Exchange → Low Water | `exchange-responds` |
| 4 | The Orsett factor's agent on Skerrow, with the Exchange gone, has no foundry for the Pharos plate, so the lamp is not sold | `routed(ring)` read by Skerrow's rule | the Exchange → the Dorothea | `exchange-responds` ("leaves the factor's agent…") |
| 5 | Mother Ysolt's fair copy of the writ of keeping is the *standing* the black square asks for | `prefects_writ` | the Long Man → Sennet | `the-slack` |
| 6 | The dyke-reeve's rod fits the square's edge: the *measure* | `sluice_rod` | the Long Man → Sennet | `the-slack` |
| 7 | The Mower's grey face is a keeper's standing at the square, and wakes the Quartermaster aboard the Remainder (so destroying the Mower has a cost far away) | `keeper_mask` | the Long Man → Sennet | `the-slack` |
| 8 | Hosken's wax rubbing of a keeper's bench, with a rubbing of the Prefect's table, is a bilingual: the *reading* | `tally_rubbing`, `pharos_rubbing` | Fair Weather + the Dorothea → Sennet | `the-slack` |
| 9 | The Prefect's table alone is the *measure* (the Aeneans wrote the unit down) | `pharos_rubbing` | the Dorothea → Sennet | `the-slack` |
| 10 | Halm's letter is a *standing*; the glossary a *reading* | `collegium_letter`, `old_glossary` | Low Water → Sennet | `the-slack` |
| 11 | The Ninth Valuer's note on the terms of a surety bounds the company's surety for the Watch; without it, a boy brings the Watch's bread to the company's account every morning at nine | `surety_terms` | What Tessary Owes → Sennet | `the-slack` (2) |
| 12 | A *surveyor who carries a glossary* follows the company ashore and into Sennet and is its lore | `Carries old_glossary` on a follower | the Dorothea → anywhere | `the-dorothea` (follows); lore reading by her **not tested** |
| 13 | Every province installs in one world: two species clashes (Sennet/Tessary; Half the Hive/The Lull) had made it impossible to visit both in one game | catalog-level names | the whole corpus | `all-in-one-world` |

## Deliberately not connected

The Quittance fire and Low Water's Auditor (same *shape*, different tone); the Hesk plateau and Pen Hesk and the
Long Man's Hesk (a name on three maps is a clue and not an error); the Keeping (*Patient Star*) and the Slack (two
time-places that need not be one); the Collegia (three bodies, one college each).

## What other modules can read, and nothing yet does

`befell(slack_opened)`, `befell(remainder_harboured)`, `befell(remainder_kept)`, `befell(mechanus_seen)` are asserted
in play. No module reads them yet. *A village that hears the House of Doors has taken in a ship of strangers* is the
obvious next consequence, and it belongs to whoever writes it.

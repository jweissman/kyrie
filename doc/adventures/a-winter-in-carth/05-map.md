# A Winter in Carth: the map

*Where Gaunt is in a generated world, how its country and its city are laid out, which ways are conditions, and where
people are at what hour. Source: `data/adventures/winter-in-carth/country.kyr`.*

## In the world

`data/adventures/countries.json` carries one appended entry, `gaunt`:

| Field | Value |
|---|---|
| bundle | `winter-in-carth/placed.json` (the module without its campaign company) |
| entry | `cross_road`, the road at the Penitent's Cross |
| side | north |
| beside | a **frost** or **forest** country |
| name on the map | the Levels of Gaunt |

So in a generated world the Levels lie beyond the north march of a frost or forest country, and a company that walks
north out of that country comes up the march to the Penitent's Cross. It is placed last so every existing country
keeps its place, and not beside mountains, which would have moved the frontier's existing placements
(`test/frontier.test.ts`). Before the company gets there the world speaks of it: whoever keeps travellers in the
neighbouring country has the rumour ("North over the march the fell road goes up over Carth Fell and down to Gaunt…
where they'll sell you somebody else's penance by the day. There's a heretic to be tried there on Ash Day… They say a
beadle went down the march road to fetch him, and has not come back up it"), and from the march the skyline shows "a
walled city on a white plain, with a great church in it that has one tower and the stump of another". The rumour ends
on the beadle on purpose: it is the hook the Cross pays off. `test/winter-in-carth-placed.test.ts` walks a
generated world (seed `g5`) east, east and north from its start, hears the rumour, crosses the march into the
Levels, takes Hern into custody, and waits the week out to *Put Out* with the world still running.

## The country

Four areas in a column, with the wood off to the east. Distances are walking time.

```
                         [cross_road]──door──[reeve_hut]          the Penitent's Cross (entry)
                              │ 1h
                         [proxy_stone]                            the Proxy's Stone
                              │ 1h
     [drovers_way]──20m──[drove_fork]                            the Drove Fork: the third question
                              │ 90m   (closed while it snows)
                          [fell_top]                              the top of Carth Fell: the snow begins
                              │ 10m
                         [carth_yard]                             Carth
                     door ╱        ╲ 2h (closed while it snows)
            [house_place]─[carth_byre]  [levels_road]─1h─[wood_edge]─20m─[deadfall]
                                         │      ╲                       the Bishop's Wood
                           the Fell Gate │       ╲ the Gate of Ash (open at dusk on Ash Day only)
                                     [fell_gate]  [gate_of_ash]
                                          GAUNT
```

The snow is a thing (`fell_snow`, scenery at the fell top) with three states: *waiting*, *falling*, *lying*. It comes
when the company first stands on the top of Carth Fell, and while it falls both fell roads are shut, so whoever comes
over the fell spends the night at Carth. It stops at seven in the morning after at least thirty-six watches. A company
that refused Hern and lingered, or came late, is snowed in all the same: the snow waits for whoever comes.

## The city

Gaunt is walled three times, "so that from out here it looks like a target": the Row outside the old wall, the Middle
Town inside it, and the Close inside a third wall round the Minster. The ways in are conditions, and the conditions
are the satire.

```
  CLOSE        [penitentiary]  [chapter_house]─[minster_nave]       [gaol_cell]
  (y 0–1)         door│            door│(Ash Day 11–15)  │west door     │door (10–16, not Ash Day)
               [schools]─door─[close_green]─────────[minster_porch]      │
                                   │      ╲───path──[tower_foot]─door─[masons_lodge]
                     the Close Gate│                    │ climb (nightfall)   │yard door (Joby's leave)
  MIDDLE       [wood_exchange]  [close_gate_street]─2m─[gaol_lane]          │
  TOWN               door│     steps│  └───────────────────────────────────┘
  (y 2–4)  [the_stand]─2m─[shambles]──door──[fat_lamb]
           [dinsdale_brewhouse]─door┘   └─3m─[tanners_row]─doors─[pickersgill_parlour] [sowerby_shop] [bakehouse]
                               Bow Gate│
  ROW      [gate_of_ash]─5m─[row_lane]─door─[barefoot_hall]
  (y 5–7)                   │   │  └─steps─[heb_cellar]
                   [row_ditch]  │3m
                             [fell_gate]  ← the Levels road
```

| Way | Condition | Why |
|---|---|---|
| the door of the house at Carth | shut while the company carries **flame** (a torch, a lamp, a candle) and the vigil is on | Annis in the doorway: "There's been no flame in this house since Candlemas." Conjured light, which has no flame, passes |
| the road up over Carth Fell / down off the fell | shut while the snow is falling | the night at Carth cannot be walked out of |
| the Fell Gate | shut to a company **put out** | struck from the Register, no door in Gaunt opens to you |
| the Close Gate | open to the **shriven** (a clean tally, by any means), to whoever passed the porter with a forgery, to Hern's custodian on delivery, and to everyone while the Consistory sits; and from inside, always | "Everyone here has been forgiven" |
| the masons' yard door | open to whoever Joby Thwaite has given leave | the lodge is the back way into the Close |
| the Close wall by the scaffold | a climb, at nightfall | the wall way, and where the unbuilding is seen |
| the Chapter House door | Ash Day eleven to three, or while the company is already inside | the Consistory |
| the gaol door | ten to four, not on Ash Day | "because the Consistory is merciful" |
| the Gate of Ash | dusk on Ash Day, sixteen to eighteen, and only if someone is put out | opened "for the first time in nineteen years" |

Gaol Lane runs outside the Close wall under the gaol's one barred window, so a company that cannot or will not get
into the Close can still talk to Hern through the bars, from below (Kyr has no talking through a window; Hern at the
window is a second person, `hern_window`, seen when he is in the cell and it is not Ash Day: friction 3).

## Who is where, and when

| Person | Where | When |
|---|---|---|
| Hern | the Cross; with the company; at Carth; the gaol; the Chapter House at eleven on Ash Day | follows his custodian; walks in himself by Shrove Monday noon if refused, by Fastens' Eve noon whatever happens |
| Beadle Sutcliffe | the Cross | always (he cannot walk) |
| Raistrick | the vigil-house; Carth at three each night; the Wood Exchange ten to eleven | reports each morning to the man who pays |
| the Scaifes, Fly | Carth | Old Mother Scaife goes out to the byre at eleven each night |
| Thackray | Carth's yard Shrove Monday nine to eleven on the grey cob; the Wood Exchange by day; the Chapter House on Ash Day | moved, he keeps a night at Carth |
| Joby Thwaite | the tower by day; the Fat Lamb at noon and evenings; the lodge at night | on Fastens' Eve, if told, on the scaffold with his masons all night |
| Canon Laverock | the Close by day; nowhere by night (his men are on the scaffold) | silenced if exposed to the Lady Penitentiary |
| Dame Hawise Strake | her desk in the Penitentiary | on Fastens' Eve, nine to eleven, masked at the Barefoot copper in the Row (the `masked` person) |
| Abel Lumb | his pen at the Stand | faints on the second day; at the Fat Lamb on Fastens' Eve if he knows |
| Joan Pickersgill | her parlour | the Fat Lamb on Fastens' Eve if she knows or misses him |
| Bess Ackroyd | the Barefoot Hall | — |
| Hal Metcalfe, Prudence Garth | Gaol Lane and the Row | Hal comes with his ladder at eleven on Fastens' Eve; Prudence informs at eight unless paid |
| the serjeants | Gaol Lane | from ten on Fastens' Eve, if informed |
| Doctors Ploughwright and Quist | the Divinity Schools | dispute at two on Fastens' Eve |
| the woodmen, the wolves | the Bishop's Wood | the wolves come out at dusk |

Thirty-eight rooms (twelve beyond the walls, twenty-six within) and thirty-three people.

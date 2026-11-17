# Appendix B: the matrix of intentions, aspects, capabilities and treatments (atlas study, 17 November 2026)

This appendix belongs to [report.md](report.md). The families are **speculative design**, a provisional taxonomy. Every
count and code reference is an **established fact** from `origin/main` at 207eab36.

Sources of the counts:
- The shared rules' action schemas are `data/rules/*.kyr`, about 100 of them.
- The authored acts are every `Action` in `data/adventures`, `situations`, `sites`, `goings-on` and `origins`, plus the
  rules: 2,658 actions. Besides them stand 4,346 `Topic`s and 471 `Change`s.
- Each authored action was given a family by a heuristic, `/var/tmp/kyrie/atlas-scratch/verbs.py`. It reads the label's
  verb, the `Speaker`, and the `Resolve check` skill; any persuasion, deception, intimidation or performance check
  counts as Influencing.
- The heuristic is coarse: 13% fall to "other". Read the counts as proportions, not as a ledger.

## B.1 The families: what exists, what makes it possible, what is missing

| Family | Shared verbs (schemas) | Authored actions (of 2,658) | Capabilities that open or improve it | Resolution: consent, evidence, check, contest, cost | Typical stakes and consequences | Missing, or thin |
|---|---|---|---|---|---|---|
| **1. Venturing** (going, crossing, entering, slipping past) | `go`, journeys (`travel:`), `slip_past`, `risk` (a hazard), `plane_shift` | 119 (4%) + every exit | climbing, tumbling, stealth, wayfinding; light; a map known | mostly certain; checks at hazards (climbing, tumbling); time and light | arrival, exposure, a fall, a night out | a route chosen for its manner (quiet, fast, safe): ways differ by place, not by method |
| **2. Investigating** (looking, searching, listening, reading signs, watching people) | `search`, `examine`, `look_closely`, `listen`, `prod`, `read_item`, `appraise` | 172 (6%), 75 of them `insight` | perception tiers (Perception), insight, trapwork, woodcraft; light | often certain; `insight` checks; "nothing here" honest (BO-03) | facts, signs, hidden things, a trap understood | searching was 13 of 1,200 census acts and found something twice (boredom census); a reading that teaches nothing typed cannot be blue (audit 12) |
| **3. Understanding** (deciphering, studying, learning a craft or spell, reasoning a case) | `learn_skill`, `learn_spell`, `train_member`, `learn_reward`, `experiment` | 51 (2%), all `lore` | lore, a scholar's or mage's calling, books, teachers | `lore` checks; fees; time | a capability gained, a case laid, a script read | no lesson reached in 20 census walks (boredom census, BO-04); deduction (combining facts) has no verb |
| **4. Conversing** (ordinary talk, asking, telling, news) | `talk_to`, `ask`, `tell` (needs `trusts`), `take_leave` | 391 (14%) and 4,346 Topics | the protagonist's kinship and acquaintance; languages | consent; `trusts`; `testimony` | facts, acquaintance, willingness, trust | talk_to taught anything once in 138 (boredom census); breadth without depth |
| **5. Influencing** (persuading, deceiving, intimidating, performing, pleading, bargaining, mediating, a crowd) | `talk_round` (persuasion, fair), `face_down` (intimidation, hard), `haggle`, `haggle_item` (persuasion, fair), `sing_supper` (performance), `pay_tribute` (coin) | **426 (16%), the largest family**: persuasion 223, performance 68, deception 62, intimidation 39; 236 spoken in talk | charisma; persuasion, deception, intimidation, performance (Checks.qualities); standing (aristocrat, Phase E); evidence (`knows`) | **all five modes**: consent (`willing`), evidence (an authored act gated on `knows`, no roll: `exchange_concurs`, `show_ledger`), a check against a DC (dc_easy…dc_formidable, or a measured `toBeat`: OB-11), resources (`pay_tribute`, `hire`), a contest (none in general: TS-02 open) | a door opened, a release, a price, a concurrence, patience lost (`warned`), a fight begun (`face_down` failure asserts `assails`) | a crowd as a contested opponent (TS-02); morale and sentiment as quantities; mediation between two parties; no promotion reason of its own: such acts surface only as an aim's gold, a threat's red, or not at all |
| **6. Companioning and leading** (recruiting, ordering, keeping, parting) | `recruit`, `hold_here`, `call_on`, `lead`, `part_ways`, `send_off`, `bury_companion` | 56 (2%) | hire coin; kinship; OR-64's help reason; future Gregarious reach (perception) | **consent** (`willing`) and coin (`hire`); never a roll | a companion's abilities become the company's | orders beyond stay and come; inspiration or morale; leadership as a check |
| **7. Confronting** (fighting, facing down, drawing out, destroying) | `attack`, `assail` (others), `draw_out`, `destroy_source`, `face_down` | 40 (1.5%) authored; fights are the shared `attack` | callings, arms, spells, formations, DangerSense reckoning | the fight; intimidation; forecast in words ("could be lost") | death, wounds, spoils, routes opened | fights that are not to the death (a duel, a brawl, a capture) |
| **8. Protecting and tending** (healing, sitting up with the sick, rescuing, guarding) | `take_healing`, `make_remedy`, `take_restoration`, `take_raising`, mend (`mend:`), `give_back` | 105 (4%), e.g. "Sit down in the ash with the Fire for an hour" | mending, rites, herbcraft, remedies, healing spells | mending checks; time; coin | a life kept, a fever broken, trust | guarding a person or a place over time; protecting a companion in a fight (formations exist, little authored) |
| **9. Handling and making** (mechanisms, crafts, building, mending things) | `change_thing` (+ paying, spending), `push`, `pry`, `put_in`, `make_plain`, `raise_quality`, `use_item`, `light_item` | 320 (12%) | brawn, lockwork, trapwork, mending; tools (Checks.toolBonus) | checks (brawn, lockwork); tools; materials | a way opened, a thing made or mended | crafting beyond recipes; a made thing that changes a place |
| **10. Acquiring and exchanging** (taking, gathering, buying, selling, paying, giving; **earning**) | `take_item`, `take_from`, `take_out`, `gather`, `buy_item`, `buy_goods`, `sell`, `sell_valuable`, `sell_ware`, `give`, `give_valuable`, `transfer_item`, `take_lodging`, `work_keep`, `sing_supper` | 241 exchanging (9%) + 191 acquiring (7%) | coin; a trade; strength to carry; performance (singing) | coin; weight; consent of the seller; haggling's check | goods, coin, debt paid, a bed | **livelihoods** (Phase E's commoner): `work_keep` and `sing_supper` are the only earning verbs; trades, wages and a day's work are absent as a family |
| **11. Devotion and the uncanny** (rites, offerings, spells out of a fight, wonders, planes) | `make_offering`, `field_spell`, `prepare_spell`, `plane_shift`; the `wonder_…` things | 186 (7%), 22 `rites` | rites, a cleric's or mage's calling, a deity, slots | rites checks; offerings' coin; slots | a dead man laid, a candle put out, a plane crossed | spells cast outside a fight are almost never offered (audit 41); authored marvels cannot declare themselves uncanny (audit 42) |
| **12. Enduring** (waiting, resting, camping, eating, keeping watch, weathering) | `wait`, `wait_hour`, `wait_for_dark`, `wait_for_light`, `wait_watch`, `rest`, `rest_unfed`, `camp`, eat, `lie_still` | 21 (1%) | provisions, light, a bed | time; food | a night passed, hurt mended, a watch kept | Enduring as a choice with stakes (pressing on weary, a cold night) exists only as needs (hungry, night, exposed) |

Of the 2,658, 339 (13%) fell to the heuristic's "other". Most are authored one-offs ("Call the Ward out of its houses,
street by street"; "Adjust the Ambrose claim, in full and in form"). They are often Influencing or Companioning in
substance, so the counts above for those families are lower bounds.

## B.2 Which atlas promise each family can carry (test findings and code)

● = met in the scenes or produced by the code for this family. ○ = possible by the code, not met. – = no producer.

| Family | gold (undertaking) | red (danger) | green (payoff) | blue (knowledge) | violet (wonder) | ◇ exploration (icon) | ⚭ companion (icon) | neutral |
|---|---|---|---|---|---|---|---|---|
| Venturing | ● toward the aim | ● a way with something heard or lurking (OR-12) | – | – | ○ a way to a wonder (afar) | ● | ● a way to someone (OR-57) | ● |
| Investigating | ● the ruts | – | – | ● | ○ | ● the place's own act | – | ● |
| Understanding | ○ | – | ● a lesson (`means`) | ● | – | – | – | ● |
| Conversing | ● the aim's person | ○ a warning | ● what pays (talk) | ● a question that teaches | – | – | ● | ● |
| **Influencing** | ● the plea (aim) | ● the parley with a band | – | ● sounding out a crowd (`insight`) | – | – | – | ● the haggle, a crowd's speech |
| Companioning | ○ kin | – | – | ○ | – | – | ● | ● |
| Confronting | ● the aim's fight (`advances`) | ● | – | – | – | – | – | – |
| Protecting | ● sitting up with the child | ● a rite that ends a danger (`ending`) | – | – | – | – | – | ● |
| Handling | ● | – | – | ● a barred way's first try (`unlooked`) | – | ● the place's own act | – | ● |
| Acquiring and exchanging | ● the debt's coin | – | ● spoils, a sale | – | – | – | – | ● buying (by rule) |
| Devotion | ○ | ● the rite of rest | – | – | ● a generated wonder only | – | – | ● preparing |
| Enduring | ● the light in the dark (Promotion.lit) | – | – | – | – | – | – | ● |

**Reading it (test finding).** Every hue except violet is carried by four or more families, and most families can
carry three or more hues. A hue and a family are not the same axis. Influencing is the extreme case: in one scene it
can be gold (the plea is the aim's), red (the parley is with a band), blue (listening to the square teaches) or
neutral (the haggle). The hue says what the act promises. It never says what kind of act it is.

## B.3 Qualities beside the hue (§7): what the engine already knows and how it is shown

| Quality | Engine field today | Current treatment (page · terminal) | Gap |
|---|---|---|---|
| present, here and perceived | default | the mark at rest value; grown under the keys (row.css) | — |
| afar, perceived along a way | `Promoted.afar`, `Glance.sensed` (`far`) | mark at .45 (`--cond-afar`); terminal pip dimmed | none for rows; distance is in words ("one place off") |
| heard of, never seen | the map's mark `state: heard` | the map only | **not on rows** (indicator appendix §5); a way to a place known only by word looks like one seen from afar |
| idle, nothing new for now | `Glance.idle` | dim, still choosable | — |
| spent, asked already | talk's `asked`, `_again` | words dim, under "Ask again…" | talk only |
| fresh | `TalkFocus.opened` | `fresh` class, no look chosen | hypothesis (appendix §4) |
| **uncertain outcome** (a roll) | the action's `resolve.name === 'check'` and Checks' odds (`ChoiceWording`, src/presentation/choice-wording.ts:40) | **words only**: "· likely", "· an even chance", "· beyond you", "· one try" | **no indicator.** A certain proof and an even-chance plea look alike (audit 30, 31) |
| difficulty | the DC or `toBeat`, and the odds band | the same words | as above |
| danger forecast | DangerSense, `Mark.danger` (slight…deadly) | the words "easily won" … "could be lost"; deadly attacks ranked after the retreat | no shape: a deadly red looks like an easy red |
| urgency | tier 0 (Promotion.tiers), `Promoted.advances` | order only (first in the four) | by design (no motion) |
| grave or irreversible | `Mark` grave or one-way, `ask` | asked twice (`grave.ts`); the words | — |
| depletion of the company | needs (`Glance.need`) | the needs line, neutral words (9e6c23b9) | — |
| repetition | `known` facet; `_again` never led | not led | the Follow row and fillers repeat (report §2.4) |
| executable now or not | `disabled` (with why); `afar` | disabled rows say why; afar faint | a faint afar mark and a dim idle mark are both at .45 opacity (`--cond-afar: .45; --cond-idle: .45`, row.css:49). The appendix says "faint ≠ dim", but the values are equal |

## B.4 The colour tokens, measured (established fact; my computation)

These are distances in OKLab between the page's tokens (web/reader/foundations.css and glance.css). The retired tones
come from fdf5df71's parent. I simulated colour-blind vision with Machado et al. 2009 at full severity, in linear RGB.
A ΔE under about 0.05 is hard to tell apart at pip size, and 0.10 is a comfortable floor.

| Pair | normal | protanopia | deuteranopia |
|---|---|---|---|
| red (#FF6B45) and the retired rose (247,124,137) | **0.075** | 0.090 | 0.073 |
| blue (#79AEF7) and violet (#B49CFF) | 0.086 | **0.030** | **0.012** |
| green and the retired rose | 0.268 | 0.168 | **0.069** |
| gold and red | 0.185 | 0.187 | 0.116 |
| green and blue | 0.162 | 0.149 | 0.138 |
| gold and green | 0.186 | 0.123 | 0.146 |

Two readings:
- A rose or coral sixth hue would be the closest pair to danger red in normal vision. For a deuteranope it would also
  sit close to green.
- The current palette already has one pair that colour-blind players cannot separate: **blue and violet**. Its signs
  (ℹ, ✧) and words carry it, as the doctrine requires ("colour is never the only cue"). But it is one more reason not
  to add a hue.

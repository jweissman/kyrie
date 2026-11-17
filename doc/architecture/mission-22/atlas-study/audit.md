# Appendix A: the per-action audit (atlas study, 17 November 2026)

This appendix belongs to [report.md](report.md) and records **test findings**: what the engine offered in the scenes I
played headless on `origin/main` at 207eab36. Each row is one meaningful act. "Four" means the act was among
`Glance.offer.primary` (the same four the page and the terminal lead with). Hue and icons are `Indicator.of`'s output
for the act's drawn aspects (`gilded` only on the followed aim's next step), as `web/reader/stage/pip.tsx` and the
terminal draw them.

How I gathered it (the scratch tools are outside the repository, in `/var/tmp/kyrie/atlas-scratch`):
- `probe.ts` plays a game by steps through the JSON runner (`src/cli/runner.ts`). At each turn it dumps the glance's four
  (why, aspects, tone, icons, marks, schema, resolve), each lens's `aspects`, and the rest.
- `census.ts` walks one unguided AutoPlayer (`src/autoplay`) and records the four at every step. The table in report §2.4
  comes from it.
- `social.ts` is the tiny social square of report §5, in a Tiny world (`test/support/tiny.ts`).

**Accurate?** is my judgement of whether the treatment truthfully represents what is possible, from what the act's Kyr
declares and what happened when it was done. **Y**: yes. **P**: partly. **N**: no, a false or missing promise.

## Exploration, travel, places

| # | Scene (world, how reached) | Act as labelled | Kind / declared semantics | Intention family | Consequence | Aspects | Hue · icons | Four? | Accurate? |
|---|---|---|---|---|---|---|---|---|---|
| 1 | a1 kin, the causeway (start) | Follow: Look along the road … for your father | `follow:` (HeldActs.follow); session command, no world act | (meta) committing to an aim | Makes the aim followed; gold appears elsewhere | none (why held) | neutral | yes | **P**: it is the most important first act, and it is drawn like a wait. In the census it held one of the four in 413 of 480 scenes, turn after turn, for as long as nothing was followed |
| 2 | a1 kin, causeway | To the camp at Millholm | `go`, why held → exploration | Venturing | Arrival at the green, brother, dog | exploration | neutral · ◇ | yes | Y |
| 3 | a1 kin, the road (after Follow) | Follow the ruts over the edge | `change_thing` (authored Change), why advance | Investigating | Finds the father: the aim's turning point | undertaking, exploration | **gold** · ◇ | yes | Y |
| 4 | a1 kin, the road | Search here | `search` → `rummage`, why advance | Investigating | The aim's alternative step (it advances the aim too) | exploration | neutral · ◇ | yes | **P**: it is the aim's, but only one act may be gold (Promotion.continued). It is drawn "worth a look", which undersells it |
| 5 | a1 kin, the road | To a grassed mound east of Mistshaw | `go`, why deeper | Venturing | A barrow | exploration | neutral · ◇ | yes | Y |
| 6 | a1 Ironkeep, gate-passage (fight walker, step 34) | Take the gate to Ironkeep | `go`, why onward, visited | Venturing | A place been | none | neutral | yes | Y (PB-24's fix holds) |
| 7 | Low Water, the Rim (start) | To the head of the Stair | `go`, why unvisited; note "someone who might go with you" | Venturing | Isaura, the commission | exploration (+ companion sensed) | neutral · ◇ | yes | Y |
| 8 | Book of Faces, road end (start) | Enter the Gate of Strangers | `go`, why entry | Venturing | Into Ombra | exploration | neutral · ◇ | yes | Y |
| 9 | iscoed pans, salt-house (Follow) | Set out for Reedbridge | journey, why named | Venturing | To the staithe; the aim's place | undertaking | **gold** | yes | Y |

## Investigation and knowledge

| # | Scene | Act as labelled | Kind / declared semantics | Family | Consequence | Aspects | Hue · icons | Four? | Accurate? |
|---|---|---|---|---|---|---|---|---|---|
| 10 | a1 Millholm green | Read the notice on the well-post | the place's own act, `teaches` | Investigating | The midwinter tally: a hook | knowledge | **blue** | yes | Y |
| 11 | a1 Millholm green | Make much of (the grey dog) | `pet`, why sign | Protecting / bonding with an animal | `tolerates`; the dog's sign | knowledge | **blue** | yes | **P**: the runner and terminal label is "Make much of", without its object (the page sets it beside the dog's likeness). Blue says "to learn" for petting a dog. The sign is real, but the promise is vague |
| 12 | a1 Lucky Phoenix | Read the notches on the tally-stick | authored `change_thing`, own, not `teaches` | Investigating | A reading | exploration | neutral · ◇ | yes | **N**: it is a reading, drawn "worth a look". Blue comes only from `teaches` (Promotion.aspects), so an authored reading whose success asserts no `knows` cannot be blue |
| 13 | a1 Lucky Phoenix | Read the Rector's proclamation of the Grand Tour | `examine`, why asked | Investigating | The Grand Tour's hook | knowledge | **blue** | yes | Y |
| 14 | Skeel, the quay | Talk to Kerensa Brask / Jinny Rowse; the tide-board | talk, examine; why life / asked | Investigating | Three things to learn | knowledge ×3 | **blue** ×3 | yes, 3 of 4 | Y: an investigation scene. The four are one colour but three different methods (two people, a board). This is a fair case for diversity of target, not of hue |
| 15 | a1 Ironkeep gate-passage | Heave the portcullis up and wedge it | the first try on a barred way, why `unlooked` | Handling (brawn) | Opens the way (or does not) | knowledge (+ exploration) | **blue** · ◇ | yes | **N**: a feat of strength drawn "to learn". `Affordances.way` gives the first try at any barred way `unlooked` (src/ui/affordances.ts:339, 346), and that is knowledge |
| 16 | iscoed pans, staithe | Talk to Ianto (it does: Pole Ianto's fuel boat down the cut · odds) | opener led for `pans__pole_boat`, `check(brawn, dc_fair)` | Working / Handling | Fuel to the salt-pans; may fail | undertaking, knowledge | **gold** · ℹ | yes | **P**: the gold is right. The ℹ ("to learn") belongs to another question inside the talk, yet the runner and terminal row does the brawn check. The row's icon describes a different act from the one it does |

## Danger and combat

| # | Scene | Act as labelled | Kind / declared semantics | Family | Consequence | Aspects | Hue · icons | Four? | Accurate? |
|---|---|---|---|---|---|---|---|---|---|
| 17 | a1 the salvagers' lookout (fight walker, step 17) | Attack the salvagers' watch | `attack`, why danger, mark fight | Confronting | A fight | danger | **red** | yes | Y |
| 18 | same | Tell the watch you have come about the shire-reeve's levy | Topic on a threat (`data/situations/bound-howe/situation.kyr:250`): needs the levy known; `tolerates` on discuss; **no roll** | Influencing (by evidence) | The watch stands down | danger | **red** | yes | **P**: the danger is real, but the act that ends it peacefully is drawn exactly as the attack beside it. Only the words tell talking from fighting |
| 19 | same | Take the steep path to Black Barrow | way, why retreat; marks warned, night | Enduring / Venturing | Away from the watch | none | neutral (marks in words) | yes | Y (red is reserved for the fight: 9e6c23b9) |
| 20 | a1 Ironkeep bailey | Attack the wolves | `attack`, mark fight | Confronting | A fight | danger | **red** | yes | Y |
| 21 | iscoed fen of Addermoss | Make camp at the fen | `camp`, why exposed; marks warned | Enduring | A night out, wolves near | none | neutral | yes | Y |
| 22 | kite / wren Hall cellar, dark | Light a candle | `light_item`, why dark (tier 0, before the danger) | Enduring / Handling | Sight | none (undertaking where the aim waits) | neutral | yes | Y: an urgent need, correctly neutral |
| 23 | any fight (runner) | each move in the hand: "Cure Light Wounds at Thale", "Attack the rat" | `RunnerFight.choices` gives every move but flee `['danger']` (src/cli/runner-fight.ts:70) | Confronting / Protecting | Varies | danger | red in the runner's offer | yes | **P**: a heal drawn as danger. The page's fight hand draws its kinds by section (`tone: 'ability'`, fight-moves.tsx), not by aspect. So the two clients disagree, and neither says what a move promises |

## Dialogue, influence, recruitment

| # | Scene | Act as labelled | Kind / declared semantics | Family | Consequence | Aspects | Hue · icons | Four? | Accurate? |
|---|---|---|---|---|---|---|---|---|---|
| 24 | a1 kin, Millholm (Follow) | Talk to your brother (does: Ask Tibb Holt what he means to do) | topic, why kin; success asserts `willing` | Conversing | The brother is willing | companionship | neutral · ⚭ | yes | Y |
| 25 | a1 kin, Millholm | Ask Tibb Holt to join the company | `recruit`: `willing` + `quantity(gold) ≥ hire`, `Resolve enlist`, **no roll** | Companioning (by consent) | He travels with you | companionship | neutral · ⚭ (note "would join you") | yes | Y: consent, correctly no hue |
| 26 | a1 Lucky Phoenix | Ask Cyril whether she would come along | topic → willing; recruit for a few coin | Companioning | Hire | companionship | neutral · ⚭ | yes | Y |
| 27 | Low Water, head of the Stair | Ask the woman in grey if she is waiting for you | topic; success `knows commission`, `willing` | Conversing → Companioning | Isaura, the commission | companionship, knowledge | **blue** · ⚭ | yes | Y |
| 28 | a1 debt, Mik's salt-house | Haggle with Mik over the price of rashers of bacon · likely · one try | `haggle_item`: `check(persuasion, dc_fair)`; ±1 coin | Influencing (by a roll, small stakes) | Price moves 1 either way | none | neutral (fill) | yes, as filler | **P**: a real contested act with trivial stakes, promoted only to make four (Offers.scene fill). The odds words are honest. Its place in the four is not earned, and it recurs at every merchant (also iscoed's Holgar) |
| 29 | tiny square, aim held (report §5) | Ask Odda to let the toll-boy out · an even chance | authored, `Speaker reeve`, `check(persuasion, dc_hard)` | Influencing (a consequential challenge) | Frees the boy, or refusal | — (inside the talk only) | neutral, **not in the four** | no | **N**: the scene's dramatic crux is unmarked and not led. The four held "Follow:", a recruit, the crowd and "Take the lockup door" |
| 30 | tiny square, aim followed | the same plea | the same | Influencing | the same | undertaking | **gold** | yes | **P**: the gold is right. "An even chance" is only in the words. A certain act (row 31) is drawn identically |
| 31 | tiny square, evidence known, aim followed | Show Odda her own ledger: the boy paid | authored, no Resolve: certain once the fact is known | Influencing (by evidence) | Frees the boy | undertaking | **gold** | yes | Y as gold. The difference from row 30 (proof against persuasion, certain against even) is invisible except in the words |
| 32 | tiny square | Stand on the well-step and speak for the boy to the crowd · likely | `Speaker crowd`, `check(performance, dc_fair)` | Influencing (a crowd) | The square takes up the boy's name | — | neutral; not in the four | no | **N**: a public, risky act, reachable only inside "Talk to the crowd" |
| 33 | tiny square | Listen to what the square is saying of the reeve · an even chance | `check(insight, dc_fair)`, success `knows mood` | Investigating (social information) | Sentiment learned | knowledge | blue (on the crowd's likeness) | yes when held; **dropped** when followed | **P**: right colour. Once the aim was followed, the crowd left the four (Promotion's two-talk cap, src/ui/promotion.ts:88) and "Wait a while" filled its place |
| 34 | Book of Faces, the Hearing (code-read, not reached in play) | Ask Sergeant Vail for the Watch's concurrence, on the Warrant's word alone / Ask the Assessor … as one who put the true Pound back | `watch_pleaded` `check(persuasion, dc_hard)` beside `exchange_concurs` (evidence, no roll): `data/adventures/book-of-faces/hearing.kyr:24-50` | Influencing | Concurrence | as the aim gives (gold or none) | gold / neutral alike | in talk | **P**: the authored distinction between consent, evidence and a hard argument is rich in Kyr and invisible on the indicator |

## Trade, gain, livelihoods

| # | Scene | Act as labelled | Kind / declared semantics | Family | Consequence | Aspects | Hue · icons | Four? | Accurate? |
|---|---|---|---|---|---|---|---|---|---|
| 35 | a1 Ironkeep gate-passage | Collect a steel coin for Wenna | `take_item` of a valuable, why spoils | Acquiring | Coin | payoff | **green** | yes | Y |
| 36 | wren Hall kitchen | Collect the old press key for Wenna | `take_item`, why spoils | Acquiring | A key (opens the press) | payoff | **green** | yes | **P**: a key is a means, not a gain. Green reads "to gain" for a thing whose worth is what it opens |
| 37 | iscoed pans, staithe | Collect two sacks of charcoal for Gwen | `take_item`: the aim's other method ("pole her down the cut, or carry two sacks") | Working / Acquiring | Fuel for the salter | none (fill) | neutral | yes, as filler | **N**: the aim's second, safer method (no roll) is drawn as an unrelated chore, while the risky method is gold. The four holds both methods and says nothing of their kinship |
| 38 | a1 / iscoed shops | Buy a torch, rope, rashers (in Trade) | `buy_item` | Exchanging | Goods for coin | none (excluded from green by design: Affordances.opened, the gold walker bought the shop out) | neutral | no | Y by the owner's rule (buying advances nothing) |
| 39 | any inn at night (code-read: `data/rules/services.kyr:42`, `Affordances.served`) | Take a bed / sing for your supper | `take_lodging`, `sing_supper` (`check(performance, dc_fair)`, +5 or +1 coin) | Working / Exchanging | A bed; coin | none (night need → neutral) | neutral | when needed | **P**: a bard's livelihood act (a roll, real pay) is never green or otherwise marked; it is found only in the talk |

## Magic and the uncanny

| # | Scene | Act as labelled | Kind / declared semantics | Family | Consequence | Aspects | Hue · icons | Four? | Accurate? |
|---|---|---|---|---|---|---|---|---|---|
| 40 | Low Water, the Rim (start) | Corin: prepare spells | `prepare_spell`, type study; filler | Devotion & the uncanny (preparation) | Slots | none | neutral (fill) | yes, as filler | **N**: upkeep promoted to make four (Offers.scene's `upkeep` excludes type `other`, not `study`) |
| 41 | kite cleric (kin), Brightbridge | (no casting outside a fight was offered) | `field_spell` exists in the rules; none was offered | Devotion | none | — | — | — | Missed: a cleric's Remove Fear or a mage's magic has no out-of-fight act in these scenes, so violet can never mean magic |
| 42 | any generated wonder (code, and the census) | the act on a `wonder_…` thing | `Affordances.wonder`: id matches `/(^|_)wonder_[a-z0-9]/` (src/ui/affordances.ts:381) | Devotion & the uncanny | varies | wonder | **violet** | rarely | **P**: no violet row met in 1,920 four-rows. The owner's opportunity-depth census found wonder in 2 of 84 runs. An authored marvel (an uncanny door, a living house) cannot be violet at all: only a generated id can |
| 43 | Low Water, Book of Faces, Skeel openings | Light a torch / Light a candle (by day) | `light_item`, fill | — | A torch burns down | none | neutral (fill) | yes, 1–2 of the four, several turns running | **N**: Offers.scene fills the four with "a type not yet shown" (src/presentation/offer.ts:61), and `light` is a type, so the richest authored adventures open with daylight torches |

## What the rows add up to (test findings)

- **False or missing promises (N):** rows 12, 15, 29, 32, 37, 40, 43. Most of them arise because the four's filler is
  chosen by act **type**, not by reason, or because an act's colour comes from where it stands (on a barred way, on a
  threat) rather than from what it does.
- **Ambiguous colours (P):** red for a parley and an attack alike (18); blue for petting, prying and reading (11, 15);
  green for a key and a coin alike (36); gold for a certain proof and an even-chance plea alike (30, 31); one icon
  describing another act (16).
- **Semantically important acts presented as neutral:** the Follow row (1); social challenges and crowd speech (28,
  29, 32, 34); livelihoods (37, 39).
- **Repetitive foregrounds:** the Follow row in 413 of 480 census scenes; daylight lights and waits as filler in 341
  of 480 scenes (report §2.4); the same haggle at every merchant.

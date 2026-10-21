# The validation campaign (2026-10-21)

These eleven sessions are played through the real session API, using only the choices a player has at each moment.
`bun bin/record-validation.ts doc/playtests/validation-2026-10-21` writes them from `plan.json`, and running it
again plays them again the same way: every fight and every roll comes from the seed.

This is the builder's playtest, not an external one. The plan was written by the person who built the content, who
knew the way. Screenshots from the browser are in `doc/playtests/high-country-2026-10-21`.

| Session | Experience | Company | What happens |
|---|---|---|---|
| [01](01-early-company.md) | An early company preparing | The fellowship, level 1 | Rumour at the Wheatsheaf, supplies from Ottar, the reeve's bounty and Mother Ash's warning. Saved part-way and resumed the same. |
| [02](02-expedition.md) | An expedition | The delvers, level 1 | Two Barrows searched, the slot found and entered by a light. Saved and resumed the same. |
| [03](03-journey-beyond.md) | A journey beyond the region; an urban adventure | The delvers | Fourteen hours down the salt road to Brack, a stranger's pass at the Landgate, and the Exchange shut until morning. Pim is bought, and the black ledger is read by Ivo's light. Dame Marrick is told: Hale is exposed and the company paid. Saved and resumed the same. |
| [04](04-the-gap-by-veterans.md) and [04b](04b-the-gap-at-first-level.md) | An experienced party solving a once-difficult problem | Old hands (12) against the fellowship (1) | Both break into the Lanthorn and are hunted by Ninefingers' crew. The Old hands put the crew down in 27 actions without loss; the fellowship needs 64, and two of its three fall. |
| [05](05-the-unlit.md) | A planar encounter; advanced monsters | Old hands | The drowned stair found by searching. The mouth in the Ash Mere is spotted, warns, and rises. Wraith riders, Lampfall's lamp-bearers, the Hollow Warden paid in light and asked about the doors, and the Watcher in the Arch, all under the Unlit's law. Saved and resumed the same. |
| [06](06-the-warden-refused.md) | Adversarial: refusing a proud creature's price | Old hands | The company stays in the ledger hall without paying. "Entered," says the Warden, and stands. |
| [07](07-the-regalia-taken.md) | Adversarial: theft in front of the owner | Old hands | Paid in light, the Warden lets the company be, until it picks up his order's regalia. |
| [08](08-benighted.md) | Adversarial: a plane without sunlight | The delvers, level 1 | A first-level company goes down the drowned stair with only a mage's light. The mouth in the Mere kills all three. |
| [09](09-lampfall-relit.md) | A strategic development | Old hands | The Last Light taken from the vault (the Warden comes for it and is destroyed) and set in Lampfall's cradle. The beacon burns, and the Unlit's law gives way to the beacon's around Lampfall. Saved and resumed the same. |
| [10](10-hollin-after-the-toll.md) | Return to civilization; a later return to a changed place | Old hands | The crew, Big Coll and Ninefingers fall and the Toll ends. Back at Hollin the grain wagons are going out on the valley road, and Wenna no longer has the Toll to talk about. |

## What the record shows

- **Every session completes**, and five saves taken part-way resumed to the same game.
- **Difficulty follows level.** The same crew costs a first-level company two of three companions and an
  experienced one nothing. A first-level company in the Unlit without sunlight dies at the first thing it meets.
- **Inhabitants answer by temperament.** Spotted, the mouth waits one action before it rises. The wraiths fall on
  the company at once. The lamp-bearers bar the gate and let a company go that leaves. The Warden names a price,
  keeps his word, and breaks it when the company does.
- **The world remembers.** Brack's ledger, Hale's exposure, Lampfall's beacon and the Toll's end each change what
  is said and offered afterwards.

## Generated worlds

`bun bin/world.ts <seed>` assembles a region from the seed, places scenarios in it and loads it as a campaign with
the same rules (inhabitants and place laws included). The seeds ash, brine and cinder each load in about 4.2 s with
twelve modules installed. The generated-world tests (`test/generated-*.test.ts`, `test/composition.test.ts`) pass.

## Fixed while recording

The recorder found two problems in the game, both fixed:
- a field spell was told as "Ivo tends Ivo with Light"; it is now "Ivo uses Light on Ivo";
- an item was named "a jar of noonlight, still burning", which made a broken label; it is now "a burning jar of
  noonlight".

The other early stops were mistakes in the plan's labels, now corrected.

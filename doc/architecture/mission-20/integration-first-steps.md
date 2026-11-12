# Integrating `adventure/first-steps`: where it stands (12 November, early)

**Verdict: verified, not merged.** The branch was merged onto main in review (`review/first-steps`), repaired where
the faults were clear, and run through CI twice. It does not pass, and the faults that remain need decisions, not
patches. Main was kept stable; the branch is ready to be taken up first in Mission 21.

## What was done

- **The merge.** `review/first-steps` is main (cf6235a2) with `adventure/first-steps` (98ad43eb) merged in. The three
  conflicts were resolved as the branch's integration notes said: scenery keeps main's fort room and the branch's
  tower ground, the bundles regenerated, the wren trace redigested.
- **Fixed on the review branch:**
  1. **The fellowship's treasurer** declares the pronouns his lines give him (main's pronouns-declared spec).
  2. **The Walk's curate** is human: drawn from the town's people, she had been an elf, and an elf cannot be a cleric,
     so every country she stood in failed to load (one-city, hessel).
  3. **A town's clock is heard on its green**, not wherever the company is. The ties, the bell-founder's apprentice,
     the bailiff's fall and the neighbours' answer had been told in three towns at once, and had cut a wait for dark
     in the first town.
  4. **The Walk's well, post, shrine and camp gate** are told only once the Walk has changed them. As they always
     were, four lines said nothing on the first green, and the post's stray cow stood under a notice nailed to the
     same post.
  5. **The newcomer spec's bounds in mere** follow the denser first region (see below).
- **Run locally on the merge:** typecheck, lint, the quick suite, the three kept traces, the standing-modules gates (27
  gates load together, 188 s), the honest start, and the first-hour specs (gold-walk, nest-aim, sister-asked,
  bell-walk, castellan-answered, word-leads, map-origin-find, fever-nursing).

## What the merge does to the first fifteen minutes

Measured with /var/tmp/kyrie/m20/tools/opening-load.ts on main and on the merge. These are the first town's green, at
arrival.

| | Main | Merge (after the Walk's silent lines) |
|---|---|---|
| kahitude: people / words | 11 / 495 | 15 / 663 |
| a1 | 11 / 373 | 15 / 560 |
| thorn | 10 / 384 | 13 / 571 |
| b2 | 8 / 338 | 11 / 515 |

- **More people and more to read.** The new people (a reeve, an apprentice, a drover's boy, a veteran) are the
  standing modules' hooks. Portraits stay capped at ten.
- **The forged seal's receipt** now leads on Brightbridge's green where the town's notice of jobs did (glance-kite):
  the branch changes what the opening puts first.
- **The newcomer gets slower.** In mere the page-only newcomer finds the lead at 22 commands and stands there at 46,
  against 17 and 24 on main: three more people to ask, and a receipt to read in each town.

## What still fails (CI on 1fc62c34)

Four shards were cancelled after the first failures, so the list is not complete. The failing specs, with the likely
cause where it was looked into:

| Spec | Likely cause |
|---|---|
| glance-kite (5 cases) | The receipt leads over the notice. A tie's departure is now heard on the green the company waits on, and cuts the wait for dark, so the night cases run by day. |
| map-set-out, a journey at nightfall | Clocks moved by the standing scenarios' events. |
| factors-handoff ("Unavailable command: wait") | Not looked into. |
| dorothea-oil, deep sites (the reading-glass; the crown) | Draws and stock shifted by the added scenarios (the integration notes' fragility); not looked into. |
| exploring the open country, land-knowing, natural-history | Not looked into. |
| a going-on's clock ("kept by every going-on, or declined") | The branch's new situations not yet registered with their clocks. |
| fight-held, the safe zone at 390×844 | Not looked into. |
| prose-fit (thorn, a1) | The standing modules say "inn", "green" or "shrine" in settlements that have none: content to mend where it is written. |
| the thorn long descent | Shop stock redrawn (the integration notes say so). |

Two failures in that run were main's own and are fixed on main: the map's second touch and the honest debtor.

## Decisions it needs (the owner's)

1. **Do the four standing modules belong in the first town, in every country?** They make it markedly busier and
   change what leads. An alternative is to stand them in the second town, or a hex out, and tell of them in the first.
2. **Which comes first on the first green, the notice of jobs or the forged seal's receipt?**
3. **R96 and R97** (rotating the altered-law provinces; retiring `oldcoin` and `quarrel`, which the wanderer origin's
   arrivals name).

Once these are decided, the specs above can be judged one by one: re-recorded where the new content is right, and
mended in the content where it is not. Nothing of the branch is lost: it stays on `adventure/first-steps`, and the
review merge with its repairs on `review/first-steps`.

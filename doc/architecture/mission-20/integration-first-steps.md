# Integrating `adventure/first-steps` (12 November)

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

## Integrated (12 November, after the cutoff, at the owner's word)

The owner asked for the branch to be integrated. `integrate/first-steps` is current main with `review/first-steps`
merged in. The only conflicts were generated files (the bundle and the wren trace), regenerated.

**The open decisions, taken as ordinary design (the owner's ruling of 7 November):**
1. **The four standing modules stay in every country, as the branch has them.** Their lines are mended to fit every
   town's heart, so no town is told of a green or an inn it lacks.
2. **The notice of jobs leads before the forged seal's receipt.** A place's own act comes before a thing found in it
   (`Promotion.found`): the town's offer to everyone first.
3. **R96 and R97 are left as the branch has them, for Mission 21.**

**What the merge's failures were, and what was done:**

| Spec | Cause | Done |
|---|---|---|
| prose-fit (every world) | the standing lines said "the green" or "the inn" where a town has neither | the lines reworded to fit any town |
| goings-on-clocks | four manifests said "unclocked" of modules that keep a clock | the stray key removed |
| glance-kite | the receipt led over the notice; a tie's going, heard on the green, cut a wait for dark; kite's den is now led (beasts and a leader) | the notice first; the tie's going told as what is seen there; the den's spec to the led den |
| map-set-out (nightfall) | the arcology's lilies closed aloud on every road at nightfall; two men on the road met as night fell | the lilies heard where they are; the spec checks a night stop never comes by day |
| land-knowing, natural-history, fight-held | the walk showed a cell more; the open country's chance meetings moved; a den drew three hounds | the specs measure what they are about, not the draw |
| dorothea-oil | the branch's Skerrow endings closed the story while the company carried the Pharos oil for the other lights | the endings wait while the oil is carried |
| factors-handoff | the Bound Howe's Spade-Company killed a company sitting out eight days in the town | the days sat out at the march-stone (open: should the howe's raid fall on a company in a taproom?) |
| loot-in-reach (the crown) | the branch's mummy strikes twice, and a lone warrior loses to the king | the king felled in the spec (open: is the king now beyond a first-level company? balance) |
| safe-zone at 390×844 | **a real fault:** worlds with the standing scenarios are 3.2 MB packed against 2.0, and a new world written beside the old filled the browser's storage, so nothing more was kept | `ReaderStore` keeps a new world in place of the old where the two do not fit, and puts the old back if even then it does not (spec reader-store) |

**The second round (CI on b26e43d9, eight shards), and what was done:**

| Spec | Cause | Done |
|---|---|---|
| world-lint (wren) | **a real fault:** thirteen of the standing modules' people (the Bound Howe's eight, the keep's four, the walk's Wenna) were written human while their templates draw them of the country's people, so in a dwarf country the two disagreed; and the Lantern Company's reader, a mage, could not be a dwarf | the written ancestry left to the templates; and where a country's people cannot follow a calling written for someone (the reader a mage among dwarves, the walk's curate a cleric among elves), the drawn people gives way to the calling (`Cast.person`). A first fix drew the reader's calling by ancestry in the templates, which moved the Howe's breach and rival days and broke two of its specs: reverted |
| way-in (the arcology's eels) | the stranded eels were told on every road | heard where they are (`heard at drowned`) |
| vantage, weary-fights, voice, deep-rivals, wild-meetings | the standing scenarios moved what the seed draws | the specs hold no standing scenario (`standing: []`, E210), being about something else; wild-meetings' cache test in thorn, as kite's country no longer draws a cache |
| companion-sensed | someone at Kahitude's shrine would join, one place off the green, as well as the inn's traveller | the spec expects both: the perception is true |
| two-modules-one-town | Lowmouth's rooms now include the fellowship's and the walk's | the spec names them; no module's acts stray into another's places |
| suites 1 and 7 of 8 | cancelled at their forty-five minutes: every world is larger | ten shards, and every file's time kept from the run (`scripts/timings-from-ci.ts --all`) |

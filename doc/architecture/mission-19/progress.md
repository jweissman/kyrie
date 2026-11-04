# Mission 19: progress, 4 November 2026

The first day's work, reported as the brief asks (§XIII): what a player sees differently, what an author can do
differently, and the evidence, with what is not yet done. Findings are the [register](register.md)'s M19 rows.

## What a player sees differently

**The page leads where the job in hand is.** The aim the player follows is now the game's own, kept in the save,
and "your aim" on a page means that aim and no other; people another aim concerns say "another aim" and come after
it. A job taken up alone is followed as it comes, unless the company's own errand is being followed; then "Follow
this" stands beside the new aim, as an RPG's journal offers to track a quest. In the reference town (Millholm, seed
a1) the rats job now goes from the notice to the cellar, the rat-runs, the run packed and Bask's payment with every
lead pointing the right way; before, the page had pointed back up the stair from the cellar as "your aim", and kept
"Look at the rats' run — your aim" after the run was packed. The catacombs and the quarry were corrected the same
way (M19-01, 04, 05, 07, 27).

**The keys work.** At Millholm's camp, where the first lead is the world map, every digit had done nothing
(M19-02).

**Who you are changes what you can do in every first town.** A thief picks the corn-store padlock without asking
anyone, and the page leads with it; a warrior wrenches its hasp out of the old door; under the churchyard a cleric
can say the rite of rest over the bone-heaps against the black candle, and a mage or bard reads in the chalk ring
that the raiser's book left out the warding line, and ends it with words; at the quarry a ranger reads in the web
what the Hobb boy saw. Each is in the town template, so every generated village and town has them; checked in a1's
Lowmouth and kite's Newmeet (M19-17, 21, 23).

**The road says what matters on it.** On the road where the father's cart went off, the page now leads with the
fresh ruts and says the aim followed; the empty "Ways on" column is the map, named for the road's ends; once the
cart is found and the aim turns home, the page no longer leads on to Mistshaw "where you set out for" (M19-11, 14,
18). The map's plan of a journey says when the company would come there, and whether after dark (M19-30).

**Fights are told and reckoned more honestly.** A band's members are "the second great rat", not "the second of
the rats under the corn-store"; the reckoning judges harm by how a fight goes one time in four, not on average (two
great rats had been "no match" and one bit a fresh warrior from fifteen to six); an easy fight is not drawn in the
colour of a deadly one (M19-08, 09, 26).

**Shops sell what their trade makes.** A salter no longer sells lanterns and oil: those are the chandler's, whom
every village and town has; a forge keeps iron lanterns, a salt-house pitch torches and rope (M19-10).

**Smaller things.** A day's camp says it is a sleep, not "for the night until 5:40 p.m."; the world map is not drawn
twice; "You know now" does not repeat a new aim; a candle is not pinched out under its raiser's hand; a woman is not
called Rurik; a lantern given is "a lantern" in the pack; "Now open: Talk to Bask" no longer follows leaving Bask.

**The Encyclopedia of Imbar** opens from the title: peoples, callings and lives, magic and prayer, arms and
treasure, creatures, conditions, and the lands of rumour (each adventure's country as its neighbours speak of it),
made from the same entries the game plays from, with search and cross-references, in the game's own look; then
the tongues (from the languages package's own records) and Imbar and its planes (the canon read by the Kyr parser);
the developers' coverage handbooks moved to Options (M19-15, 16).

## What an author can do differently

Three workflows done end to end are written up in [authoring.md](authoring.md): the town template (the callings'
ways above), the trade table, and a naming rule (a new `townsfolkSex` table). Each was changed as data, inspected
with `bin/kyrie world` and `bin/kyrie play --world … --as …`, held by a spec, and met in the browser. What does not
yet work for an author (languages outside the repository, where creatures live, spells, the TypeScript generators)
is said there too. The content inventory with what is met in play, not only defined, is [inventory.md](inventory.md).

## Evidence

- Browser play through the built reader (Playwright, `scripts/play-server.ts`): the default character from the title
  through the rats job to payment, then the catacombs job to the crypt; the father's road to the cart; a thief from
  creation to the picked padlock. Screenshots kept outside the repository.
- Headless plays by `bin/kyrie play` for each calling at Lowmouth, and in seed kite.
- New specs: `undertakings`, `undertown-callings`, `encyclopedia`, the name/pronoun check in `region-peoples`; specs
  updated where they pinned the old behaviour. The quick tier passes; CI ran green on the browser specs, the long
  descents and three shards at d8539236, with two shards still running when this was written; CI on d7ceb585 failed
  only from the trade change, since fixed.
- A sweep of the page's words in a1's 223 town and site rooms found no raw identifiers (M19-25).

## Not yet done, most consequential first

1. **Between the town and the site there is still little to decide.** Travel is the map's and arrives whole unless
   something staged stops it (the handoff's §12.1; REV-03).
2. **The town is still a list, if a better-ordered one** (OWN-77): the plan of the town sits under Every way.
3. **No one but the builder has played it since**, and the builder's play shows only that the first town's jobs now
   cohere end to end and differ by calling: whether that is enjoyable for an evening is untested, and the country
   beyond the town is as uneven as the handoff says.
4. **The Encyclopedia lacks history and institutions**, and modules do not add entries of their own.
5. **Most content generators are still TypeScript writing Kyr as text**; the old-tongue site names have no everyday
   name beside them where the folk lack one (M19-20).

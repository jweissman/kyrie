# Common names first (T24-20, OPR-06)

The lead's decision, on the owner's word that the starting region "once had a lot more Common names": in the starting
country an old place is called first by its Common meaning, its old name learned later; a human country's own name
is Common.

## Where names are made

- **Settlements**: `PlaceNames.render` with `CommonNames` (the human heartland's towns are Common already; a dwarf
  hold in a human country keeps its Khuzdul).
- **The makers' works**: `Histories.work` names each in the old tongue (Aenean; the old kingdom's in Westron), keeps
  its meaning (`old.gloss`: "mist lake"), and the folk's worn form (`Wearing`); the site takes the worn form.
- **Other old sites** (ruin, barrow, tower): `PlaceNames.site`, in Aenean, with the meaning as its gloss.
- **How a place is shown**: a site's Place is written `seen as "<its look>" until <site>_named` (`RegionSites.stand`):
  the alias mechanism shows how it looks ("a timbered adit") until the company knows of it (told by the innkeeper,
  found on the way, its letters read), then its name.

## State (paused, 13 November)

**Committed: the rule and its census, not switched on.** `OldPlaces.called` and the learning lines in `RegionSites`
are in; a site with no `old` (every site, until the switch) is written exactly as before. **Not committed: the
switch-over** (the one call in `WorldAssembler.assemble`) and the specs that walk by the new names, saved as
`/var/tmp/kyrie/steps/t24-20-rest.patch` (applies cleanly on the commit that carries this note). To resume:

1. `git apply /var/tmp/kyrie/steps/t24-20-rest.patch` (the call, `test/old-names-a1`, and sixteen specs stepped by the
   new names: aims, bell-lead, bell-walk, bounty-lead, debt-first-errand, deep-expedition, destinations-once,
   entity-card, land-knowing, long-expedition, marks-kept, order-rope, town-plan, town-return, travel, vantage; all
   passed with the switch on, three at a time).
2. The kept trace `wren-tower-climbed` (test/traces) replays otherwise with the switch on, at step 1: run
   `bun scripts/redigest-trace.ts wren-tower-climbed` and see whether it comes where it came (its told text names what
   is seen from the tower, which now says Common names); if it does, keep the new digests and told; if not, find why.
   The other two traces were not checked.
3. The rest of the specs that name old places (39 run; the 23 others passed with the switch on as they were), the
   push lane and test:quick, then commit as one change.
4. A human country's own name in Common (below) waits on the lead.

## The rule

`OldPlaces.called` (src/world/old-places.ts), to be called in `WorldAssembler.assemble` after the country is drawn and
its adventures placed: each old place of the starting country is named by its meaning in Common, "the mist lake", and keeps
its old name (`site.old`). Nothing drawn from the names changes (no draw is keyed by a site's name; the other
countries are drawn from the old names as before). Two old places whose meanings would be alike keep their old names
(none in ten countries).

**How the old name is learned: by reading it, on arriving.** It is cut on the place itself: over a work's way in, in
its makers' letters (`<site>_old_cut`, teaching `<site>_old`), or, for a barrow or tower whose own letters already
name it, those letters read as its makers' name once they have named it. From then on the place's feature line says
"Its makers called it Neblalac." It is not told by anyone: the innkeeper, the notices, the aims and the map say the
Common name. (Being told it, by a scholar or a book, is a later addition the same fact can take.)

The look stage is kept: before the company knows of a place it is still "a timbered adit"; known, it is "the mist
lake"; read, "the mist lake, which its makers called Neblalac".

## Held by

- `test/old-names`: a census of ten starting countries as written (a1, b2, kite, ash, wren, mere, thorn, cov2, cov7,
  d4): every old place is called by its Common meaning; no written line tells an old name but the ones that teach it at
  its place (so no aim, notice, topic or history line does); each old name can be learned there. 4 s; mutation-checked
  (the renaming taken out, and the learning taken out, each fail all ten).
- `test/old-names-a1` (in the patch, with the switch): a1 as play begins (an origin, one life): the same, and a named
  old place is said by its Common name on the page.

## Not done: a human country's own name

The country's name is the seed of 49 of its draws (`${region.name}:…`: its markets, chandlers, faiths, threads,
dens), so calling it something else re-draws the whole country. Doing it without that needs the drawn name kept as
the country's key and the Common one shown, at every place the name is said: the lead's to rule whether that is M21.

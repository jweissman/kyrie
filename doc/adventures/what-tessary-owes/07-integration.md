# What Tessary Owes — integration assessment

## How a player comes to it

**In a generated world.** `data/adventures/countries.json` lists Tessary as an independent country (`"among":
"independent"`) lying **east** of a first country whose terrain is **marsh**: the fen runs down to the delta and the
sea. The innkeeper of the town the east road leaves from tells it, asked about the road:

> 'Down the east road, where the marsh meets the sea, there's Tessary on the Ossel. Their legions came home from the
> war a week back, and they say some of the soldiers are getting up in the night and walking into the sea. Barefoot,
> in step, eyes open. An eel-wife there has put up a notice: she'll give her savings to anyone who can tell her where
> her boy went.'

The company knows it then as heard from the innkeeper, and the Ossel delta is on its map. The road across the march
comes in at **the Causeway, at the marsh's edge** (`causeway_end`, exported under that name), an hour's walk from the
Landgate, where Nan Teazle's notice is pinned. Nothing about the protagonist is assumed: the company that comes in is
the world's own (`placed.kyr` declares only `Entity party`), whoever they are and wherever they come from. Seed
`ossel` with a forced marsh first country holds it (`test/what-tessary-owes.test.ts`, the world-entry journey).

**On its own.** `data/campaigns/what-tessary-owes.campaign.json` is on the title page (`web/scenarios.ts`, seed
`ossel`): a single traveller (default: Ivo, a human thief with a locksmith's background) coming down the marsh road
with twelve coin, at eight in the morning on the 30th of Frost, 1144.

## Readiness and level

The adventure is written for **one protagonist of level 1 to 3**, alone or with companions found on the way (Durrance
and the Assessor will both come, for reasons of their own). It does not scale to the company and does not need to:

- **Fighting is optional almost everywhere, and costly where it is not.** The ebb-runners, the Factor's lightermen
  and the Factor herself take prisoners: a beaten company wakes on the salt-pans, lighter, not dead. The Forsworn in
  the bath-house kill, and the page says plainly that nobody goes in there. The Weights do not fight at all: they
  seize the forsworn and bar the black wall to them.
- **The tide is the principal danger**, and it is legible: Pitch says when low water is, Wick sells a table, every
  Lowtide street says which way the water is running, the turn is announced an hour before the flood, and the flood
  rolls a company out onto the Pans rather than drowning it.
- **Experience comes from what is found out and done** (nineteen milestones and the module's own thousand). A
  thorough fortnight takes a first-level traveller to the third level, near the fourth.

What a player should understand before going down to Lowtide (a torch, rope, the hours of the tide) is said by people
in the city, not by a level gate.

## Geography, clock and placement contracts

- **Containment**: plane `imbar` › region `ossel` (terrain marsh) › `saltmarsh` (wilderness), `tessary`
  (settlement), `lowtide` (site), `strongrooms` (site, three levels); and a second plane, `holding_plane` › `white_floor`
  › `holding`.
- **Entry export**: `causeway_end`, outdoors, at the country's edge.
- **Marker**: `tally` (the Ninth Assessor), the entity only this country has.
- **Clock**: the fortnight runs from arrival. The module counts its own nights at the two o'clock ebb, beginning with
  the first that is at least five hours after the company comes, so a company arriving at one in the morning is not
  dropped straight into the first calling. Rules that compare watches are shifted by the installation time as usual.
- **Chapters**: a country installed by the frontier carries `chapter: true` (engine change E2 in
  [friction.md](friction.md)). Reaching one of Tessary's seven endings in a generated world
  tells its epilogue and the characters' fates, and the world goes on: the company can walk back up the Causeway, and
  Tessary is still there, changed. Played alone, the same ending closes the book.

## Dependencies

- **Engine changes this branch makes, all general:** `Milestone` (grammar, lowering, progression); chapter endings
  (`InstalledModule.chapter`, `BundleRequest.chapter`, per-installation `concluded()` latch); a battle de-duplicating
  weariness, readiness and laws; two narration fixes (a thing taken; articles in merged experience lines). Shared rules
  gain `Kind milestone. Relation achieved(milestone). Measure merit(milestone).` in `data/rules/core.kyr`.
- **Regenerated**: `web/bundles.generated.json` (by `bun run web:build`), which carries the new rules and the
  adventure's files to the browser.
- **No new catalog entries.** Local kinds and species (`goose_kind`, `forsworn_kind`, `weight_kind`, the brass weights,
  the chapbook, the oilskin) are the module's own.

## Unresolved issues

1. **Adding an independent country reshuffles which one a fen world holds.** `Countries.held` chooses among the
   independents that fit a terrain by hash modulo their number. With Tessary added, fen worlds choose among three
   (the Strewnfield, the Corrow, Tessary) instead of two. Every test passes, but **a saved fen world whose
   south, west or east march has not yet been crossed may find a different country there than it would have before
   this merge.** A country already drawn stays drawn. The general remedy, which the Atlas already asks about ("what
   gets committed at module installation?"), is to commit the world's choice of independent country at assembly, in
   the save, rather than recompute it from the list each time.
2. **The Feast's date is absolute within the fortnight.** A company that arrives, leaves for weeks, and returns finds
   the Settlement long past and the default ending's world (the Factor's Tessary). That is the design, but in a
   continuing world a player may want to know it before leaving: Nan and Durrance both name the thirteenth and
   fifteenth days, and the bills at the Landgate do, but nothing stops a company walking out on day two.
3. **Experience to companions.** Milestones go to the whole company, as module experience does; the Assessor, if
   travelling with the company, grows too.
4. **The cosmological contributions** (the Balance as an instrument of the fastening of the planes; the Scruples; the
   Holding; the Kiritarun as tallies of a pledge held there; the Forsworn) are statements by the adventure's people, not
   narrator facts, and are listed for canon review in [03-revised-design.md](03-revised-design.md). Another adventure
   should not assume them.

## Compatibility with continuing campaigns

Tessary owns nothing outside its own country. It reads no other module's facts and exports only its entry, region and
party. Its people stay where they are after its ending; its milestones are namespaced; its endings close only its own
chapter. Two things another author could build on: the Scruples' Balance is a natural place for any module that wants
a *registered* promise (a court, an oath, a wager), and the Holding is reachable from it.

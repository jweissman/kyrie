# The difference census (21 November)

Checkpoint 12 of the golden thread (doc/design/golden-thread.md): a different player character or a different
generated world gives rise to genuinely different relationships, circumstances, opportunities and discoveries. This is
a measurement, made before anything is built for it.

**Method.** scripts/difference-census.ts walks each character by the gold, as scripts/first-quarter.ts does, for 100
acts: the first hour's worth. Each walk records five sets:

- **met:** the people where the company stood.
- **spoke:** whom it talked to or asked something of.
- **offered:** the aims it held, and the acts of the kits, pleasures, afoot and room it was offered.
- **found:** what it came to know.
- **answered:** the rules that said something as the world answered.

Each pair is then given the overlap of each set: what both met, over what either met.

A thing is keyed by what it is, not where it is:

- A generated town's own thing is its template's (`region__s1_hesper` is `hesper` in any country).
- A town's folk are their work (`folk:tinker`), never their slot.

So two countries are compared by what they hold. test/small/difference-census holds that keying and the measure.

**The walks** (sizes of each set):

| walk | met | spoke | offered | found | answered |
|---|---|---|---|---|---|
| iscoed warrior (drove) | 28 | 3 | 11 | 13 | 2 |
| iscoed mage (weir) | 21 | 0 | 13 | 8 | 9 |
| a1 warrior (kin) | 32 | 2 | 10 | 17 | 4 |
| a1 warrior (debt) | 27 | 2 | 8 | 7 | 0 |
| thorn warrior (debt) | 45 | 4 | 14 | 11 | 1 |
| ash warrior (debt) | 32 | 3 | 14 | 13 | 21 |

**Overlap** (0 is nothing shared, 1 is the same):

| pair | met | spoke | offered | found | answered |
|---|---|---|---|---|---|
| (a) two characters in Iscoed: drove warrior / weir mage | 0.14 | 0 | 0.14 | 0.05 | 0 |
| (a) two origins in a1: kin / debt | 0.20 | 0 | 0.20 | 0.04 | 0 |
| (b) the debt's warrior in two worlds: a1 / thorn | 0.38 | 0.50 | 0.29 | 0.38 | 0 |
| (b) the debt's warrior in two worlds: thorn / ash | 0.26 | 0.40 | 0.56 | 0.26 | 0.05 |

**Read.**

- **Two characters in one world differ most.** Different origins begin in different places, with different charges,
  and come to know nearly nothing in common in an hour (4 to 5 per cent).
- **One character in two worlds is a third the same.** It meets about a third of the same kinds of people and comes to
  know a third of the same things, and half of what it is offered is the same.
- **Very little answers the company.** The answered set is small and seldom shared. Where it is large (ash, 21), most
  of it is a placed story passing through the town (the circus), not the town answering the company.

## The three largest sources of sameness

These are counted from the things every pair shares.

1. **The first town's fixed cast.** Shared by all four pairs: the innkeeper, the traveller who would come along, the
   reeve of the wood-wardens, the inn's dog, and the undertown's two figures on the green: the tinker's daughter
   picking a lock (`u_hand`) and the Hobb boy (`u_hobb`). The merchant and the cat are shared by three. Every
   character's first town has the same roles, filled by the same templates, saying lines drawn from the same few.
   *Proposal:* draw the first town's own cast by the origin, as the afoot pool is drawn per town. The undertown's
   two green figures, the reeve's office and the traveller each get alternatives keyed to how the life began. A
   drover's town meets drovers' people; an heir's town meets the people the inheritance concerns.
2. **The origin's chain, the same in every world.** The debt's warrior holds the same three aims in a1, thorn and ash
   (`owing`, `owing_work`, `owing_out`, and further). Only the names in them change.
   *Proposal:* draw the chain from the country, as the letter home is drawn from the origin. The merchant's trade
   decides the work offered against the debt, and the lost thing decides where it went. The country's troubles give
   the second stage, so the same debt leads somewhere different.
3. **The small fixed pools.** Every walk is offered the room (`room_rent`). Three of the four pairs share the old dog
   in the sun, and two the skittles or the children's tag: the pleasures are three of a pool of eight. Every walk
   learns why its town is there (`why`), the country's word (`country_told`) and a place's name (`named`).
   *Proposal:* widen the pleasures to sixteen, and have a country draw its towns' threes apart from one another, not
   only from their road-neighbours. Give the room its terms by the house that keeps it: an alehouse's loft, a
   brothers' guest-cell, a fort's bunk. Each of the town's standing facts should carry one particular of the town
   (its founding's own), not the form alone.

## After the debt's chain was drawn from the country (proposal 2)

The debt's chain is now drawn by the country's key (src/world/debt-shapes.ts), one of three shapes. Each is a whole
chain an hour can finish, pinned in its world in test/features/world/debt-chains.pin:

- **salvage:** the inn's word of the old places round about, and what is in them sold (thorn).
- **carry:** the creditor's own trade sets the work. A load goes to the merchant of the nearest other town, and that
  merchant's purse for the creditor comes back (ash).
- **recover:** the lost thing sets where it went. What went into the river at the ford was fished out and sold
  downstream. It is claimed with a word or a finder's fee, and carried home (a1).

A world's chain can be fixed rather than drawn, as an author fixes a kit's dimension. The specs that walk the salvage
fix it (`--chain salvage`; `chain` on a drawn world, an autoplay run and a page's Begin).

The census, again (the same six walks, 100 acts each):

| pair | met | spoke | offered | found | answered |
|---|---|---|---|---|---|
| (a) Iscoed: drove warrior / weir mage | 0.14 | 0 | 0.14 | 0.05 | 0 |
| (a) a1: kin / debt | 0.11 | 0 | 0.06 | 0.26 | 0 |
| (b) the debt's warrior, a1 / thorn | 0.08 (was 0.38) | 0.50 | 0.10 (was 0.29) | 0.28 (was 0.38) | 0.08 |
| (b) the debt's warrior, thorn / ash | 0.09 (was 0.26) | 0.20 | 0.08 (was 0.56) | 0.10 (was 0.26) | 0.02 |

One character in two worlds now shares about a tenth of what it is offered, where it had shared a third to a half.
Whom it meets falls with it, because a chain that sends the company to the next town takes it out of the first town
sooner. What it finds falls less in a1 / thorn: the first town's standing facts are still the same (proposal 3).
Shared by all four pairs now: the inn's dog, the innkeeper, the traveller and the town's `why`. The first town's cast
(proposal 1) is the largest sameness left.

## Not measured yet

- Relationships deepened over several visits. The walks are an hour long.
- What a pick of calling changes within one origin. The iscoed pair changes both calling and origin.
- The drove origin outside Iscoed, which is the atlas's own and bound to its drove.

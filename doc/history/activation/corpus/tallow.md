# Tallow: Tallow Deep

*Branch adventure/p2-corpus-b. Read: hill, scenes, people, wake, keeping, parts of quests, creatures and works; finds skimmed.*

## Premise
A white limestone ridge swallows a river. Under it three peoples have each made something and walked away from it: the
Brasiers' Company's lead mine (sixty years gone, fourteen dead), the Aeneans' waterworks and sealed hall, and under
that a counted weight in grey metal that has been swinging for longer than there have been people. Smugglers use the
mine as a cellar; the village at its foot keeps its back to the hill.

## What works
- The theme ("things kept after the reason has gone") is carried by an actual structure: the dead in the vault, the
  secret in the desk, the road the Tallymen did not make, the weight kept swinging by the figures who wind it.
- Four ways in, each guarded by a different kind of thing (a toll, a wet crawl, a she-owlbear, a buried gate).
- The resolution of the names (Cador finding his father in the ledger) is the best single scene.
- The shelf-of-the-Dial mechanism: taking from the Dial makes the village's pipe tick late and the trough go brown.
  A consequence that leaves the dungeon.

## Shared forms and phrasing
- `voice repeats`: "of grey metal" x11, "the old road" x9, "shelf of grey metal" x6. The story of Treve and the cat is told
  in five places with the same date skeleton ("on a Tuesday, three weeks gone"); a spec asserts it so the repetition is
  deliberate, but the wording is nearly the same in each mouth.
- "does not look up" in four Greets; fixed in Orpe's. Cador's "I keep the accounts" and the Tallymen's "six coin" are
  the corpus's smuggler-toll pair; Usk is the dwarf storekeeper (also Kersey, Sallowfield's dwarf smith).

## Weak or flat
- Swallet itself did not change: the same pot wiped on every visit, whatever the company had done under the hill.
- Treve: dead in the vault, told by four people, but there was no answer to it. Nib got the cat's collar; the man whose
  lamp it was got nothing.
- The Tallymen are cheerful and peaceable until they are not; there was no price for having sold the hill out.

## Dead ends
- None blocking. The Rising and the Swallow both lead into the Conduit; the stope is hidden until Barrick is asked
  (checked: `stope_known` is set by a Topic).

## Connections
- Before: the rumour now names Lowen Pook. An "after" now exists: a page pinned on a beam; with a darker/laugh variant
  when the old road is opened.
- Out: `calx_opened` and `tallow_names`, read by Quittance's Declarations Hall (Mr Prest has a column for roads with
  no duty, and one for a debt of fourteen days paid sixty years late).
- In: `cloudgate_fell` (Orpe and the grey metal that rings), `slack_opened` (Cador's ledger).
- Possible: Orpe pays for "brass instruments"; the barge-men in Quittance want bell-teeth; the Aeneans' wheel-and-number
  keystone could be the Empire's roadstation signature the first region already carries.

## Encounter density and danger
Dense and well spaced: ten tempered bands (Temperament lines) and six physical-damage hazards; the owlbear, the spiders, the slump and the custodians can each be got past without a fight.
The Bore is the only place where a company can be hurt without a chance to refuse.

## Changed
- `lore.kyr` (new): joss_vault (the answer to Treve, which also ends the toll), five Swallet Observes that follow what
  the company did, a Lowen topic on the pipe's tick, two world-event reads, the two emissions.
- `people.kyr`: Orpe's Greets reopened.
- `placed.kyr`/`placed.json`: the "after" word and its road variant.

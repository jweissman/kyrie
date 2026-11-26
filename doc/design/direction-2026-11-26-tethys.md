# Tethys, and the proof of the platform (the owner, 26 November)

The owner's thoughts, as they came, kept whole. These are directions, not commissions.

## Tethys, the second game

> Tethys, which would be our sim a far future seeming civilization but actually just the height of the mathematical
> age, humans with unimaginable capabilities, utopian beyond our wildest dreams, star trek on steroids until something
> happens and it all stopped, but what could do that? And Tethys would lead you into this, or at least into the pathos
> surrounding it and some of the stories of the people. … a very episodic sim where you're the captain of a ship which
> you can develop or extend, you have a certain number of command points per day and those can be used to provide
> durable upgrades and feats to your crew, and it's pushing the engine on a lot of the 'group configuration' bonuses
> that were so central to Orsino and which I feel like we're not really adapting clearly. It doesn't have to be raygun
> gothic but it should have quite advanced technology and weaponry and feel like a different game despite being written
> in Kyr and played through the same universal player.

**What it is:**
- Imbar's Mathematical Age at its height (ATLAS.md §9): a civilisation of unimaginable capability, and the mystery of
  what stopped it.
- Episodic, played as the captain of a ship.
- Its pathos lies in the stories of the people who lived at that height.

**What it asks of the platform (why it is the proof):**
- **The ship is the company.** An entity with modules, extended and refitted. Its crew are members whose roles and
  configuration matter.
- **Command points per day:** a spendable daily resource, turned into durable upgrades and feats for the crew. The
  runtime needs a daily budget that no fantasy notion of spell slots or rest defines.
- **Group configuration bonuses:** formations, stations, a crew's complementary roles. Orsino's party bonuses were
  central to its play and have not been carried into Kyrie clearly. Tethys makes them first-class, and Westernesse can
  then take them back (a war-band's formation, a ship of the Saltings).
- **Its own rules domain:** advanced technology and weaponry, no callings, no SRD. The kernel must run a game that
  installs none of the fantasy domain.
- **The same universal player:** written in Kyr and played through the one page, the same engine-owned questions and
  frame, yet feeling like a different game. Themes and hints, not a forked client.

**Its first slice** grows from BX-01's boundary fixture (test/fixtures/boundary/tethys.kyr: Halcyon Station, the
shuttle run, the dead survey outpost), which already plays without Westernesse's catalog wherever the platform allows.
The next slice adds the ship as company, the day's command points and one crew configuration bonus, each in Kyr, each
a finding wherever the kernel reaches for fantasy.

## The proof of separation: inversion of control, earned

> Ideally we should prove this out with clear examples (Tethys, and a few others). It seems like a core proof of the
> ability to perform the separation would involve actually finally biting the bullet on inversion of control, at least
> once all the inter-module arrows are pointing in the right direction and everything is extracted into `packages` --
> identify what remains to become an upstream 'fantasy' module which can now evolve independently. … we can get all the
> benefits of module boundaries without this. but it would still be an emotionally satisfying proof of platform
> generality and independence from the product.

**The lead's reading.** The owner's counterproposal is right that boundaries alone give most of the engineering benefit.
Inversion of control is what makes the independence *provable*: the runtime declares small ports, and the fantasy
domain is one installable implementation of them, upstream and free to evolve. The proof that it is real is a second
consumer, not the extraction itself.
- Westernesse installs the fantasy domain.
- Tethys installs its own.
- The allotment society (BX-01's other case) installs almost nothing.
- Two of them run in one process with nothing changed by their order: the coexistence proof the platform plan already
  names.

## The language on the critical path

> Hopefully we can circle the maturity path around to languages, since it does seem like a lot of our missing pieces
> become unblocked … perhaps there are some puzzles there, ie we can't isolate _until_ we upgrade certain things, so we
> should really think carefully about critical path and dependencies.

**The dependency, as the lead reads it.** Isolation does wait on the language in three places:
1. **The compilation context (slices 2–3, Copilot's now):** no ambient installs. Without it, two settings cannot
   coexist in one process, and the coexistence proof cannot run.
2. **The symbol table (the review's slice 4):**
   - Canon's 458 reads cannot be classified honestly while the language decides by regex what a module reads and
     declares.
   - AP-03 (facets inferred) and the abilities' world reach (OR-1097) need the same reads and writes.
3. **The typed vocabulary (slice 6, OR-744):** this is where the kernel's own vocabulary and a domain's installed
   vocabulary are told apart. It is the line the fantasy package is cut along. Cut without it, the extraction would
   follow whatever the code happens to import today.

So the order is:
- compilation context 2–3;
- the symbol table;
- the typed vocabulary, which draws the kernel/domain line;
- the ports, and the fantasy domain extracted along that line;
- Tethys and Westernesse installed side by side, the proof.

The frame tree and the incremental frame (the player's side) run alongside and meet at TB-09, the player package's
contract. Slices 4 and 6 still need the owner's word, which this direction asks for when slices 2–3 land.

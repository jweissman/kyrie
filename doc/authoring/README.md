# Authoring Westernesse: start here

This is the one way in for someone who wants to write something new for Westernesse today. It is a short trail of
ten pages, each a few minutes long, in the order you will need them. Every command on them was run on `fbf38d58`
(6 November 2026) and its output is quoted; page 3's were run again, whole, on `5a8f652f` (11 November) and hold. Where something does not yet work soundly, the page says so and names the
open finding ([../architecture/findings/index.md](../history/findings/index.md) lists every one).

| | Page | You will be able to | Sound today? |
|---|---|---|---|
| 1 | [What Westernesse is](trail/01-westernesse.md) | say what the game is for and what a player should feel | yes (the vision is the owner's; the product is not yet accepted) |
| 2 | [How it is built](trail/02-architecture.md) | place a change in the right layer: Kyr, Deem, the runtime, the save, the canon, the page | yes |
| 3 | [A first encounter](trail/03-first-encounter.md) | scaffold an adventure, write a person, a thing and an ending in Kyr, compile, lint, play and test it | yes |
| 4 | [An adventure in the shared world](trail/04-adventure-in-the-world.md) | install it as a province of the generated world, played by the player's own company, and save and reload it | yes, with limits (preset-party scaffold M19-75; no CLI route to a province) |
| 5 | [Variations with Deem](trail/05-variations-with-deem.md) | change a table or a Kyr template and meet the change in every generated town | yes, for tables and town templates; most generators are still TypeScript (ARV-H4) |
| 6 | [Canonical plants, animals, monsters, items](trail/06-canon.md) | add a record to the catalog and have the world use it | partly: records load; a creature's habitats, abundance and measured danger are landing now |
| 7 | [Contributing to a settlement or a city](trail/07-settlements.md) | add a place or a person to a generated town without duplicating it | for generated towns, yes; for an authored city shared by adventures, **no** (M19-77) |
| 8 | [Testing reachability, consequences, save and reload](trail/08-testing.md) | prove what a player reaches, what an act changes, and that it survives a reload | yes |
| 9 | [When the contracts are not enough](trail/09-extending.md) | know where an engine change belongs, and how to record what you could not do | yes |
| 10 | [Scenes, opportunities and what a character perceives](trail/10-scenes-and-opportunities.md) | write a place the page paints, whose worthwhile acts reach the player's foreground, and whose signs only some characters notice | yes for what it describes; its "not built yet" list is open |

**Before writing a flag by hand,** see [forms the engine already has](forms.md).

**The reference behind the trail.** The [authoring guide](guide.md) is the full manual of the language: every
construct, with the adventure friction that shaped it; its examples are played by `test/authoring-guide.test.ts`.
[narrative.md](narrative.md) is how the page's words should read. [data/README.md](../../data/README.md) says where
each kind of content lives. Mission 19's [authoring workflows](../history/missions/19/authoring.md) are the three
data changes made end to end during that mission, with their commits.

**Historical, not instructions.** [if-fitness-and-affordances.md](if-fitness-and-affordances.md) is an independent
review of Kyr as an interactive-fiction language (30 October; its ten remedies are IFR-01 to IFR-10, deferred);
[findings-response.md](../history/reviews/findings-response.md) and [adventures-response.md](../history/reviews/adventures-response.md) are the builder's
answers to the October authors' findings.

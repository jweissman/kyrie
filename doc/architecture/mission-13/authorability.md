# Mission 13: authorability

The authoring model is documented in [`doc/authoring/guide.md`](../../authoring/guide.md) (§10, "What else a module
can say", covers what this mission added) and the state of each author's finding in
[`doc/authoring/findings-response.md`](../../authoring/findings-response.md). This is what changed for an author.

## Added to Kyr

| Construct | What it says | Finding |
|---|---|---|
| `Observe glow near ?lamp when lit(?lamp) "{?lamp} …"` | One observation near each entity the condition binds, wherever it is (ids `glow@lamp`) | 15, repaired |
| `Person … { Seen when knows(viewer, sight). }` | Someone not on the page, nor to be acted on, for a viewer for whom it does not hold | 17, repaired |
| `sleeps`, `lastSlept`, `weary` in `needs.kyr` | Weariness on the pattern of hunger: eighteen hours after sleeping a company is weary and fights under `weary` until a bed, a camp or a rest | 19, repaired |
| `Aspect x.` / `Undead x.` on a Person | Orsino's aspects and undead templates on any creature an author places | — |
| `law(place, plane_*)` | A place under a plane's law | — |
| `staged(place, story)` (shared discovery rules) | A place where a story is being told: nothing that could be taken for part of it happens there by chance | new |
| `homeOf(group, place)`, `inDebtTo(group, group)` (shared people rules) | Where the one who plays grew up (its people are neighbours), and whom they owe (a creditor speaks as one) | new |
| `@seen a round tower \| a square tower \| …` in a work plan | A work's look from outside per shape, so what is told of it before it is seen agrees with what is seen | new |

## Who someone is to you

What people say on meeting you, taking leave, joining and parting is chosen from the voice tables by **bond**, now
read from the world: family (`kin`), someone you have come to with a letter or an errand (`expects`), someone you
owe (`inDebtTo`), someone you did a good turn (`grateful`), someone paid to come, someone being seen home, a
traveller of the country, someone of the place you grew up in (`homeOf`), or a stranger. An author gets the right
greeting by stating the relation, not by writing the greeting. Who someone is outranks their manner, so a grim
mother still greets her child as a mother. Animals have no spoken bonds.

## What an author no longer has to arrange

- **A clue that reveals another**: an observation that teaches a fact is told in the moment it teaches, and anything
  that fact reveals (the brother kneeling, once the cart is found) is seen and learned in the same action.
- **A way told**: a site's way is told landmark by landmark by the generator; any `hidden until` passage whose fact
  the company knows is drawn on its map.
- **Actions on something set on a way out** (a speaking door's words) are offered at that way, with any reason one
  cannot be done.
- **A trader's counter**: whoever `Sells` shows their whole stock, price and number left, in conversation.

## A world that checks itself

`src/world/world-audit.ts` reads the world an author's modules make: places reachable, wants obtainable (for sale,
growing, lying about), stories told by someone reachable, endings that something can bring about: what the willow
fix did for one fever, for every story. Ten seeds hold to it, and a world with a fever and no herbs anywhere is
caught.

## Still open, in order of what it would give an author

1. **Making things in play** (finding 14): an author cannot create an entity during play (a child born, a cart built,
   a letter written). Roles do not change with state; topics are not scoped to places.
2. **Conditional ends** (finding 5): a passage that leads somewhere else under a condition (`or X when P`).
3. **A counted offer**: a thing that gives so many times (unblocks Orsino's room features).
4. **Order shown**: a tool that says which rule changed what in a watch.
5. **A pack's weight**: kinds weigh; nothing sums a pack or limits what is carried.

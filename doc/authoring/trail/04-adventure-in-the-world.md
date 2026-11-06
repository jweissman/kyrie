# 4. An adventure in the shared world

*The authoring trail, page 4 of 9. [Start](../README.md) · previous: [A first encounter](03-first-encounter.md) · next:
[Variations with Deem](05-variations-with-deem.md)*

Every authored adventure is a **province** of a generated world's first country: its way in stands near the side of
the country its entry names, a road leads to it from the nearest town, and the innkeepers of the country speak of it.
It is installed the first time the company stands at its gate, and from then on it is part of the one persistent
world (guide §"Your adventure in a generated world"; `src/world/frontier.ts:83-96`, `src/world/provinces.ts`).

## The rule: an adventure never supplies the party

The company that walks in is the player's own: the one person they made at Begin and whoever they have recruited. A
placed adventure brings no company of its own: its `placed.json` leaves `company.kyr` out and imports `party` as a
group role instead (`placed.kyr`: `Entity party: group "Your company".`). A placed bundle that kept its company is
refused (`src/campaign/module-installations.ts:153`). All 21 adventures' `placed.json` follow this.

So write lines and acts against **what a member is**, never who: a rule that binds a member who qualifies
(`when memberOf(?m, party) and hasCalling(?m, calling_cleric) and awake(?m)`, then `says "{?m} …"`), or an action with
a `member` parameter ("Have {reader} study…"). What is not yet possible (owner's working notes, 6 November): no fact
tells a companion from the one who plays, a bound member cannot be said as "you" or with pronouns, and a `Topic`,
`Speaker` or `Remarks` cannot take a member variable; a placed line that assumes three people ("It looks at the three
of you", `data/adventures/quittance/descent.kyr:445`) is wrong for a company of one. This is open as M19-75 (in the
owner's working tree) and ARV-M7 (Open risk).

## Offer it to the world

The scaffold already wrote `placed.json` (the module without `company.kyr`, with `placed.kyr`, `"imports": ["party"]`
and the `party` role) and exported its road room. Add the country to `data/adventures/countries.json`:

```json
{ "id": "lanternwell", "province": true, "bundle": "lanternwell/placed.json", "entry": "road",
  "marker": "lid", "side": "south", "beside": ["forest", "marsh"], "name": "the Lantern Well",
  "topic": "the covered well in the south", "terrain": "forest",
  "rumour": "'There is a town in the south with a well they keep covered,' says {keeper}.",
  "heard": "In the south of the country is a town whose well is kept covered." }
```

`entry` is the exported room the road comes into; `marker` an entity only this adventure has; `rumour` what an
innkeeper says (`{keeper}` is the innkeeper), `heard` what the company then knows. Then:

```sh
bin/kyrie countries a1        # where each authored country lies in world a1
```

```text
a1: the first country is marsh
  province Merrowdale                   north within the first country (marsh)
  …
  province the Lantern Well             south within the first country (marsh)
```

Adding a province can move the others: `bin/kyrie countries --diff` names each country a change moves, by seed.

## Prove it is reached, played by the world's company, and kept

There is no command-line route that walks a generated world to a province's gate; the specs use
`test/support/province-play.ts`, which asks the innkeeper who tells of it, walks the road and goes in. This spec,
written for this page (and not kept in the repository), passed on `fbf38d58`:

```ts
import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ProvincePlay } from './support/province-play';
import { PlaySession } from '../src/session/play-session';

describe('The Lantern Well in the world', () => {
  it('is heard of, walked into, played by the world\'s own company, and kept', async () => {
    const { s, c, told, k } = await ProvincePlay.enter('a1', 'lanternwell',
      { origin: 'wanderer', party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    expect(told).toContain('a well they keep covered');
    expect(c.installed).toContain('planternwell');
    const j = Journey.of(s);
    await j.play('To the square', 'Ask Maud why the well is covered', 'Lift the lid off the well');
    expect(c.world.one('at', 'party')).toBe(k('square'));
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())), { trusted: true });
    expect(again.campaign.world.one('state', k('lid'))).toBe(k('open'));
  }, 600000);
});
```

What it printed: the innkeeper said "'There is a town in the south with a well they keep covered,' says Eamon.
'Sedgebrook is where the road to the Lantern Well goes out from,' Eamon adds."; the encounter played as on page 3,
with ids now `planternwell__…`; after the save and reload the company stood in `planternwell__square` and the lid was
`planternwell__open`. It ran in 9 to 13 seconds.

**Pass `party` yourself.** Without it, `ProvincePlay.enter` and `WorldAssembler.assemble` give the company the
default trio (`src/world/world-assembler.ts:80-84`), a shape no player can have; 37 adventure specs still prove their
adventure only in the standalone preset shape (owner's working notes, 6 November).

## What a placed adventure can and cannot see

It names only what it declares or imports: the country's towns, inns and keepers are drawn after it was written, so
its people speak of the world beyond as its folk would, without names (guide, Behind the Wainscot's F14). Its clock
runs from the first morning after it is reached. Its ending closes its chapter, not the book; what its folk say after
is `after` in `countries.json`. Its exports are only `party`, `region` and its entry: nothing imports another
adventure's town, which is why two adventures cannot yet share one (page 7).

*Next: [Variations with Deem](05-variations-with-deem.md).*

#!/usr/bin/env bun
// Play a company of several (or one at a chosen level) from a place of a generated country by the page's own labels,
// printing what each step told. The company is set down only to skip the walk (see scripts/play-at.ts); for a walk from
// the starting town use `bin/kyrie play --world <seed> --origin debt --as human/warrior/Name <steps>`.
//   bun scripts/play-party.ts <seed> <calling[,calling…]> <level> <place id | -> "<step>" …
// Besides a label, a step may be: FIGHT <label>, COIN n, KNOW <fact>, ASSERT <relation> <args…>, Q <relation> <args…>
// (is it so?), HP, AT, LIST [regexp] (the choices offered), PAGE (what the place tells).
//   e.g.  bun scripts/play-party.ts a1 warrior,cleric,thief,mage 4 howe__forecourt "Speak the rites of the dead" HP
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from '../test/support/placed';

const [seed = 'kahitude', calling = 'warrior', level = '4', place = '-', ...steps] = process.argv.slice(2);
const party = calling.split(',').map((classId, i) => ({ name: `Mira${i}`, raceId: 'human', classId, level: Number(level) }));
const j = Journey.of(await DrawnWorld.start(seed, party.length > 1 ? { party } : { origin: 'debt', party },
  NodeBundleSource.shared));
if (place !== '-') { Placed.at(j, place); }
for (const s of steps) {
  try {
    const [word = '', ...rest] = s.split(' ');
    let told: string;
    if (word === 'FIGHT') { told = await j.fight(rest.join(' ')); }
    else if (word === 'COIN') { j.coin(Number(rest[0])); told = 'coin set'; }
    else if (word === 'KNOW') { Placed.knows(j, rest[0]!); told = 'known'; }
    else if (word === 'ASSERT') { j.assert(rest[0]!, ...rest.slice(1)); told = 'asserted'; }
    else if (word === 'Q') { told = String(Placed.holds(j, rest[0]!, ...rest.slice(1))); }
    else if (s === 'AT') { told = j.campaign.world.one('at', 'party') ?? '?'; }
    else if (s === 'HP') {
      told = j.campaign.fighters.map(f => `${f.name} L${f.level} ${f.hp}/${f.maxHp}${f.hp <= 0 ? ' down' : ''}`).join('; ');
    } else if (word === 'LIST') {
      const only = new RegExp(rest.join(' ') || '.', 'i');
      told = j.choices().map(c => c.full).filter(c => only.test(c) && !/Prepare spells/.test(c)).join(' | ');
    } else if (s === 'PAGE') { const sc = j.screen(); told = `[${sc.place.name}] ${sc.prose.join(' ')}`; }
    else { told = await j.play(s); }
    console.log(`>>> ${s}\n    ${told.replace(/\s+/g, ' ').slice(0, 700)}`);
  } catch (e) { console.log(`>>> ${s}\n!!  ${(e as Error).message.slice(0, 600)}`); }
}

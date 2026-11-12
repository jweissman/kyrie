#!/usr/bin/env bun
// Which painting each of some places of a generated country shows (the chain is data/paintings/scenery.json): to see
// what a new room looks like before commissioning one.
//   bun scripts/rooms-painted.ts <seed> <place-id> ...
//   e.g.  bun scripts/rooms-painted.ts kahitude e1_hall e1_cistern
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Scenery } from '../src/ui/scenery';
import { Glanced } from '../test/support/glanced';
import { Placed } from '../test/support/placed';

const [seed = 'kahitude', ...places] = process.argv.slice(2);
const j = Journey.of(await DrawnWorld.start(seed, { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: 'mage' }] },
  NodeBundleSource.shared));
for (const place of places) {
  try { Placed.at(j, `region__${place}`); console.log(place.padEnd(26), Scenery.seen(Glanced.of(j.session).screen) ?? 'none'); }
  catch (e) { console.log(place.padEnd(26), '!!', (e as Error).message.slice(0, 80)); }
}

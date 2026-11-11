#!/usr/bin/env bun
// Set a company down in a place of a generated country and play steps from there by the page's own labels (a step
// beginning > goes to a place by id, = waits; a step "FIGHT <label>" fights it out; "?" before a step passes it over if
// it is not offered). Ends by saying what was offered if a step was not: the way to learn a label.
//   bun scripts/play-at.ts <seed> <calling> <place-id> "<step>" ...
//   e.g.  bun scripts/play-at.ts kahitude mage e1_office "Read the stationmaster's day-book"
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from '../test/support/placed';

const [seed = 'kahitude', calling = 'warrior', place = 's1_green', ...steps] = process.argv.slice(2);
const j = Journey.of(await DrawnWorld.start(seed, { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: calling }] },
  NodeBundleSource.shared));
Placed.at(j, `region__${place}`);
for (const s of steps) {
  try {
    const told = s.startsWith('FIGHT ') ? await j.fight(s.slice(6)) : await j.play(s);
    console.log(`>>> ${s}\n    ${told.replace(/\s+/g, ' ').slice(-600)}`);
  } catch (e) { console.log(`>>> ${s}\n!!  ${(e as Error).message.slice(0, 900)}`); }
}

import { DrawnWorld } from '../../src/client/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { CompiledModules } from '../../src/campaign/compiled-modules';
import { PlayerView } from '../../src/presentation/player-view';
import { ParseCache } from '../../src/lang/parse-cache';
import { WorldAssembler } from '../../src/world/world-assembler';
import { PlaySession } from '../../src/session/play-session';
import { Creation } from '../../web/engine/creation';

// The shared rules and the compiled modules kept between campaigns, frozen whole once a world has made them, and the
// world begun again (every module from what is kept) and played, then another begun (test/frozen-modules): each
// write into what is kept a TypeError here. In a process of its own, as what is frozen stays frozen.
function freeze<T>(value: T, seen = new Set<unknown>()): T {
  if (value && typeof value === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const v of Object.values(value)) { freeze(v, seen); }
    Object.freeze(value);
  }
  return value;
}
const party = { origin: 'wanderer', party: [{ name: 'W', raceId: 'human', classId: 'warrior' }] };
const first = await DrawnWorld.start('frozen-a', party, NodeBundleSource.shared);
const kept = (CompiledModules as unknown as { kept: Map<string, unknown> }).kept;
const rules = (ModuleBundle as unknown as { rulesets: Map<string, unknown> }).rulesets;
for (const v of [...kept.values(), ...rules.values()]) { freeze(v); }
const again = await DrawnWorld.start('frozen-a', party, NodeBundleSource.shared);
for (let i = 0; i < 6; i++) {
  const c = PlayerView.choices(again.campaign).find(x => !/^travel:/.test(x.choice.id));
  if (!c) { break; }
  await again.leg(c.choice.id);
}
await DrawnWorld.start('frozen-b', party, NodeBundleSource.shared);
// And the golden route's country, begun twice (the second from what the first kept) and played.
await DrawnWorld.start('iscoed', party, NodeBundleSource.shared);
for (const v of [...kept.values(), ...rules.values()]) { freeze(v); }
const iscoed = await DrawnWorld.start('iscoed', party, NodeBundleSource.shared);
for (let i = 0; i < 8; i++) {
  const c = PlayerView.choices(iscoed.campaign).find(x => !/^travel:/.test(x.choice.id));
  if (!c) { break; }
  await iscoed.leg(c.choice.id);
}
// And the parses kept uncopied (KeptParses: OR-144's clones), frozen too: a country drawn (the composer reading its
// region's places from them), read ahead as the page reads it while the title shows, and begun from them.
const parses = (ParseCache as unknown as { parsed: Map<string, unknown> }).parsed;
const bundled = (ModuleBundle as unknown as { parses: Map<string, unknown> }).parses;
function all() {
  for (const v of [...kept.values(), ...rules.values(), ...parses.values(), ...bundled.values()]) { freeze(v); }
}
all();
const drawn = await WorldAssembler.assemble('frozen-c', NodeBundleSource.shared, DrawnWorld.options(party));
await Creation.warm(drawn.path, drawn.source);
all();
const third = await PlaySession.start(drawn.path, 'frozen-c', drawn.source);
for (let i = 0; i < 4; i++) {
  const c = PlayerView.choices(third.campaign).find(x => !/^travel:/.test(x.choice.id));
  if (!c) { break; }
  await third.leg(c.choice.id);
}
console.log(JSON.stringify({ kept: kept.size, rules: rules.size, parses: parses.size,
  same: first.canonical() !== '' && again.campaign.history.length }));

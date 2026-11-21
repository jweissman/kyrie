import { DrawnWorld } from '../../src/world/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { CompiledModules } from '../../src/campaign/compiled-modules';
import { PlayerView } from '../../src/presentation/player-view';

// The shared rules and the compiled modules kept between campaigns, frozen whole once a world has made them, and the
// world begun again (every module from what is kept) and played, then another begun (test/small/frozen-modules): each
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
console.log(JSON.stringify({ kept: kept.size, rules: rules.size, same: first.canonical() !== '' && again.campaign.history.length }));

// Probe (r2): the mechanism behind persist-world-diverge: names with no facts/measures left keep their place in the
// live World's maps (and so in the order everything is listed later), but are absent from a save; a restored World
// therefore lists a name that comes back at the END. Counts empty name slots in the live world at each step.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { World } from '../../../../../src/lang/world';
const drawn = { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never, origin: 'wanderer' };
function pick(s: PlaySession, i: number): string {
  const choices = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => !/^(rest|camp)/.test(id));
  const edge = choices.find(id => /__edge_/.test(id) && id.startsWith('go('));
  if (edge && i < 20) { return edge; }
  const go = choices.filter(id => id.startsWith('go('));
  return (i % 3 === 0 && go.length ? go[(i * 5) % go.length] : choices[(i * 7) % choices.length])!;
}
const empties = (w: World) => {
  const x = w as unknown as { byName: Map<string, Map<string, unknown>>; measuresByName: Map<string, Map<string, unknown>> };
  return { facts: [...x.byName].filter(([, m]) => !m.size).map(([n]) => n), measures: [...x.measuresByName].filter(([, m]) => !m.size).map(([n]) => n) };
};
const s = await DrawnWorld.start('thorn', drawn, NodeBundleSource.shared);
for (let i = 0; i < 14; i++) {
  const c = pick(s, i); await s.perform(c, PlaySession.auto);
  const e = empties(s.campaign.world), r = empties(new World(s.campaign.world.module, s.campaign.save(true).state.world));
  console.log(`step ${i} installed ${s.campaign.installed.length} live empty names: facts ${JSON.stringify(e.facts)} measures ${JSON.stringify(e.measures)} | rebuilt-from-save: ${r.facts.length + r.measures.length}`);
}

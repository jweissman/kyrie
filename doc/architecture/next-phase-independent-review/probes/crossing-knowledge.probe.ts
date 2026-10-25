// Probe (review artifact). Run: bun doc/architecture/next-phase-independent-review/probes/crossing-knowledge.probe.ts
// Seed a1, generated world, the frontier attached as the browser attaches it (PlaySession.extend). The company walks,
// by offered `go` choices only, to the east march-stone (the country beyond is drawn), then to that country's north
// march-stone. Reports whether the step onto the second stone can be taken. (Route found by a breadth-first search
// over `connects`; each step is still an offered choice, refused otherwise.)
import { WorldAssembler } from '../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../../src/session/play-session';
import { PlayerView } from '../../../../src/presentation/player-view';
import { Frontier } from '../../../../src/world/frontier';
import { ModuleWriter } from '../../../../src/lang/module-writer';

const seed = 'a1';
const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
const s = (await PlaySession.start(w.path, seed, w.source)).extend(new Frontier(seed, NodeBundleSource.shared));
async function travel(target: string) {
  const world = s.campaign.world, links = world.related('connects');
  const start = world.one('at', 'party')!, came = new Map<string, [string, string]>([[start, ['', '']]]);
  for (const q = [start]; q.length && !came.has(target);) {
    const h = q.shift()!;
    for (const l of links.filter(r => r.args[1] === h && !came.has(r.args[2]!))) { came.set(l.args[2]!, [h, l.args[0]!]); q.push(l.args[2]!); }
  }
  const steps: [string, string][] = [];
  for (let at = target; at !== start; at = came.get(at)![0]) { steps.unshift([came.get(at)![1], at]); }
  for (const [p, to] of steps) {
    const id = `go(${p},${to})`;
    const offered = PlayerView.choices(s.campaign).some(c => c.choice.id === id);
    try { await s.perform(id); } catch (e) {
      console.log(`step ${id} (offered: ${offered}) THREW: ${(e as Error).message}`);
      console.log('  party still at', s.campaign.world.one('at', 'party'), '| installed', s.campaign.installed.length,
        '| transcript steps', s.transcript.steps.length);
      return false;
    }
  }
  console.log(`reached ${target}; installed ${s.campaign.installed.length} modules; steps ${s.transcript.steps.length}`);
  return true;
}
await travel('region__edge_east');
await travel('x1y0__edge_north');
const wd = s.campaign.world;
console.log('knows without established:', wd.related('knows').filter(r => !wd.test(ModuleWriter.call('established', r.args[1]!))).map(r => r.args[1]));
// The same step again: does it ever succeed?
const again = await travel('x1y0__edge_north');
console.log('second attempt succeeded:', again);

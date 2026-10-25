import { WorldAssembler } from '../../../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../../../../src/session/play-session';
import { PlayerView } from '../../../../../../src/presentation/player-view';
import { Frontier } from '../../../../../../src/world/frontier';
import { Countries } from '../../../../../../src/world/countries';
process.chdir('/home/user/kyrie');
const seed = 'a1';
const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
const s = await PlaySession.start(w.path, seed, w.source);
const frontier = new Frontier(seed, NodeBundleSource.shared);
async function travel(target: string) {
  const world = s.campaign.world, links = world.related('connects');
  const start = world.one('at', 'party')!, came = new Map<string, [string, string]>([[start, ['', '']]]);
  for (const q = [start]; q.length && !came.has(target);) { const h = q.shift()!;
    for (const l of links.filter(r => r.args[1] === h && !came.has(r.args[2]!))) { came.set(l.args[2]!, [h, l.args[0]!]); q.push(l.args[2]!); } }
  if (!came.has(target)) throw new Error('no way to ' + target);
  const steps: [string, string][] = [];
  for (let at = target; at !== start; at = came.get(at)![0]) steps.unshift([came.get(at)![1], at]);
  const t0 = s.campaign.current.elapsed;
  for (const [p, to] of steps) { const r: any = await s.perform(`go(${p},${to})`); if (r?.result === 'failure') console.log('  failed', p, r.response); }
  console.log(`travel ${start} -> ${target}: ${steps.length} legs, elapsed ticks ${s.campaign.current.elapsed - t0}, now at ${s.campaign.world.one('at','party')}`);
}
const scene = (id: string) => s.campaign.module.entities.filter(e => e.id === `${id}_scene`).map(e => e.name).join('') ||
  JSON.stringify((s.campaign.module as any).observations?.find((o: any) => o.id === `${id}_scene`)?.text ?? null);
await travel('region__edge_east');
const seen: any = {};
console.log('perceptions at region edge_east:', seen.perceptions?.map((p: any) => p.text.slice(0, 260)));
const d = await frontier.expand(s.campaign);
console.log('expanded', d?.rid, d?.region?.name, d?.region?.terrain, 'beyond of x1y0:', JSON.stringify(d?.region?.beyond));
console.log('Countries.fits(forest,north):', Countries.fits(d!.region!.terrain, 'north', () => false)?.name);
await travel('x1y0__edge_north');
const seen2: any = {}; { const wd = s.campaign.world; const { ModuleWriter } = await import('../../../../../../src/lang/module-writer'); console.log('knows not established:', wd.related('knows').filter(r => !wd.test(ModuleWriter.call('established', r.args[1]!))).map(r => r.args.join(' ')).slice(0,10)); console.log('knows count', wd.related('knows').length); }
console.log('perceptions at x1y0 edge_north:', seen2.perceptions?.map((p: any) => p.text.slice(0, 300)));
let d2: any; try { d2 = await frontier.expand(s.campaign); } catch (e) { console.log('EXPAND THREW:', (e as Error).message); }
console.log('expanded north of x1y0:', JSON.stringify(d2), 'installed', s.campaign.installed.join(','));
const go = PlayerView.choices(s.campaign).filter(c => /^go\(/.test(c.choice.id));
for (const c of go) console.log('  choice', c.choice.id, '|', c.choice.name);
console.log('has long_man marker:', s.campaign.module.entities.some(e => e.id.endsWith('__long_man')));

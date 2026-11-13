// Probe (r2): in a generated world, where does a game resumed from a plain save file (PlaySession.checkpoint ->
// JSON -> PlaySession.resume) first diverge from the same game played on without saving? Lockstep comparison.
import { PlaySession, type SessionCheckpoint } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { Frontier } from '../../../../../src/world/frontier';

const K = Number(process.argv[2] ?? 10), N = Number(process.argv[3] ?? 25);
const drawn = { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never, origin: 'wanderer' };
function pick(s: PlaySession, i: number): string {
  const choices = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => !/^(rest|camp)/.test(id));
  const edge = choices.find(id => /__edge_/.test(id) && id.startsWith('go('));
  if (edge && i < 20) { return edge; }
  const go = choices.filter(id => id.startsWith('go('));
  return (i % 3 === 0 && go.length ? go[(i * 5) % go.length] : choices[(i * 7) % choices.length])!;
}
const live = await DrawnWorld.start('thorn', drawn, NodeBundleSource.shared);
for (let i = 0; i < K; i++) { await live.perform(pick(live, i), PlaySession.auto); }
const r = PlaySession.resume(JSON.parse(JSON.stringify(live.checkpoint())) as SessionCheckpoint, { trusted: false })
  .extend(new Frontier('thorn', NodeBundleSource.shared));
const facts = (s: PlaySession) => s.campaign.save(true).state.world.relations.map(c => `${c.name}(${c.args.join(',')})`);
console.log('installed at start', (await DrawnWorld.start('thorn', drawn, NodeBundleSource.shared)).campaign.installed.length); console.log(`after ${K} commands, at ${live.campaign.world.one('at', 'party')}; installed ${live.campaign.installed.length}`);
console.log('right after resume: canonical equal =', r.canonical() === live.canonical());
for (let i = K; i < N; i++) {
  const c = pick(live, i), c2 = pick(r, i);
  if (c !== c2) { console.log(`step ${i}: offered choices differ: live picks ${c}, resumed picks ${c2}`); }
  await live.perform(c, PlaySession.auto); await r.perform(c, PlaySession.auto);
  const a = facts(live), b = facts(r);
  const sa = new Set(a), sb = new Set(b);
  const onlyLive = a.filter(x => !sb.has(x)), onlyRes = b.filter(x => !sa.has(x));
  const orderOnly = !onlyLive.length && !onlyRes.length && a.join() !== b.join();
  const eqCanon = live.canonical() === r.canonical();
  console.log(`step ${i} ${c} at ${live.campaign.world.one('at', 'party')} installed ${live.campaign.installed.length}/${r.campaign.installed.length}: canonical ${eqCanon ? 'EQUAL' : 'DIFFERS'}${eqCanon ? '' : `; facts only-live ${JSON.stringify(onlyLive.slice(0, 4))} only-resumed ${JSON.stringify(onlyRes.slice(0, 4))}${orderOnly ? ' (same facts, different ORDER)' : ''}; elapsed ${live.campaign.state.elapsed}/${r.campaign.state.elapsed}`}`);
  if (!eqCanon) {
    const A = JSON.parse(live.canonical()), B = JSON.parse(r.canonical());
    const m = (x: typeof A) => (x.save.state.world.measures as { call: { name: string; args: string[] }; value: number }[]).map(e => `${e.call.name}(${e.call.args.join(',')})=${e.value}`);
    const ma = m(A), mb = m(B);
    console.log(`   measures: same multiset = ${ma.slice().sort().join() === mb.slice().sort().join()}, same order = ${ma.join() === mb.join()}; facts same order = ${a.join() === b.join()}`);
    for (const k of ['view', 'chronicle', 'transcript']) { console.log(`   ${k} equal = ${JSON.stringify(A[k]) === JSON.stringify(B[k])}`); }
    console.log(`   events equal = ${JSON.stringify(A.save.events) === JSON.stringify(B.save.events)}, creatures equal = ${JSON.stringify(A.save.creatures) === JSON.stringify(B.save.creatures)}`);
    if (!(globalThis as { shown?: boolean }).shown && JSON.stringify(A.save.events) !== JSON.stringify(B.save.events)) { (globalThis as { shown?: boolean }).shown = true; walk(A.save.events, B.save.events, 'events', { n: 6 }); }
    if (ma.slice().sort().join() !== mb.slice().sort().join()) { console.log('   only live:', ma.filter(x => !mb.includes(x)).slice(0, 5), 'only resumed:', mb.filter(x => !ma.includes(x)).slice(0, 5)); }
    const ea = live.campaign.history.at(-1)!, eb = r.campaign.history.at(-1)!;
    if (JSON.stringify(ea) !== JSON.stringify(eb)) { console.log('   last event response:', JSON.stringify(ea.response)?.slice(0, 150), '|', JSON.stringify(eb.response)?.slice(0, 150)); }
    
  }
}
function walk(a: unknown, b: unknown, at: string, budget: { n: number }) {
  if (budget.n <= 0 || JSON.stringify(a) === JSON.stringify(b)) { return; }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (!Array.isArray(a) && ka.join() !== kb.join() && ka.slice().sort().join() === kb.slice().sort().join()) {
      budget.n--; console.log(`   ${at}: same keys, different key ORDER`);
    }
    for (const k of new Set([...ka, ...kb])) { walk((a as never)[k], (b as never)[k], `${at}.${k}`, budget); }
    return;
  }
  budget.n--; console.log(`   ${at}: live ${JSON.stringify(a)?.slice(0, 150)} | resumed ${JSON.stringify(b)?.slice(0, 150)}`);
}

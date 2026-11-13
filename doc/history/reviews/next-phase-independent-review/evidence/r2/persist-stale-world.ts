// Probe (r2): the host marks a new world "kept" as soon as it posts it (engine-host.ts:239), with no acknowledgement
// from the page. If the page's write of that world fails (quota) and the next, smaller state-only write succeeds, the
// store's pointer names the OLD world beside a state diffed against the NEW one; ReaderStore.read and KeptGame.join
// never compare keys, and the same build resumes it trusted (unchecked). Runs the real ReaderStore against a quota'd
// fake localStorage, emulating EngineHost.keep's sequence exactly.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { Frontier } from '../../../../../src/world/frontier';
import { KeptGame } from '../../../../../web/engine/kept-game';

class Quota {
  private m = new Map<string, string>(); constructor(public limit: number) {}
  get used() { let n = 0; for (const [k, v] of this.m) { n += k.length + v.length; } return n; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { const was = this.m.get(k)?.length ?? 0; if (this.used - was + k.length + v.length > this.limit) { throw new Error('QuotaExceededError'); } this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); } key(i: number) { return [...this.m.keys()][i] ?? null; } get length() { return this.m.size; }
}
const store = new Quota(Infinity);
(globalThis as { localStorage?: unknown }).localStorage = store;
const { ReaderStore } = await import('../../../../../web/reader/reader-store');

const drawn = { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never, origin: 'wanderer' };
const s = await DrawnWorld.start('thorn', drawn, NodeBundleSource.shared);
function pick(i: number): string {
  const choices = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => !/^(rest|camp)/.test(id));
  const edge = choices.find(id => /__edge_/.test(id) && id.startsWith('go('));
  if (edge) { return edge; }
  const go = choices.filter(id => id.startsWith('go('));
  return (i % 3 === 0 && go.length ? go[(i * 5) % go.length] : choices[(i * 7) % choices.length])!;
}
await s.perform(pick(0), PlaySession.auto);
const summary = { title: 't', where: 'w', when: 'n', company: 'c' };
let hostWorld = KeptGame.keyed(s.checkpoint(true)) as ReturnType<typeof KeptGame.keyed> & { kept: boolean };
hostWorld.kept = false;
// EngineHost.keep, verbatim in effect (packing omitted: plain text, as when CompressionStream is absent).
function keep(): boolean {
  const cp = s.checkpoint(true), { module, definition } = cp.save;
  if (!(hostWorld.part.module === module && hostWorld.part.definition === definition)) { hostWorld = { ...KeptGame.keyed(cp), kept: false }; }
  const save = JSON.stringify(KeptGame.split(cp, hostWorld, [], s.campaign.world));
  const fresh = hostWorld.kept ? undefined : { key: hostWorld.key, text: hostWorld.text };
  const ok = !!ReaderStore.write(save, summary, fresh);
  console.log(`  keep: world ${hostWorld.key}${fresh ? ' (sent)' : ' (not sent: host thinks kept)'}; page write ${ok ? 'ok' : 'FAILED -> unkept toast'}; used ${store.used}`);
  hostWorld.kept = true; // engine-host.ts:239, unconditionally
  return ok;
}
console.log('installed', s.campaign.installed.length); keep();
const before = store.used;
await s.perform(pick(1), PlaySession.auto); // crosses: the country beyond is drawn, the world changes
console.log('after crossing, installed', s.campaign.installed.length, 'new world size', KeptGame.keyed(s.checkpoint(true)).text.length);
store.limit = before + 400_000; // room for a state, not for the grown world
keep();
await s.perform(pick(2), PlaySession.auto);
keep();
const back = ReaderStore.read()!;
const state = JSON.parse(back.text), part = JSON.parse(back.world!);
console.log('state names world', state.world, '| world returned has key', KeptGame.key(back.world!), '| match:', state.world === KeptGame.key(back.world!));
try {
  const r = PlaySession.resume(KeptGame.join(state, part).checkpoint, { owned: true, trusted: true }).extend(new Frontier('thorn', NodeBundleSource.shared));
  console.log('resumed TRUSTED without error; installed', r.campaign.installed.length, 'vs live', s.campaign.installed.length,
    '; party at', r.campaign.world.one('at', 'party'), 'vs live', s.campaign.world.one('at', 'party'),
    '; facts', r.campaign.save(true).state.world.relations.length, 'vs live', s.campaign.save(true).state.world.relations.length);
  try { const c = PlayerView.choices(r.campaign)[0]!.choice.id; await r.perform(c, PlaySession.auto); console.log('a further command performed:', c); }
  catch (e) { console.log('next command fails:', (e as Error).message.split('\n')[0]); }
} catch (e) { console.log('resume threw:', (e as Error).message.split('\n')[0]); }

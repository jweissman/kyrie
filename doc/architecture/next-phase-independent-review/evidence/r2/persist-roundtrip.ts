// Probe (r2): save at step k -> restore (both the save-file path and the browser KeptGame split/pack/join path) ->
// continue the same commands; compare canonical() with the uninterrupted game. Also checks the transcript replays.
// Usage: bun persist-roundtrip.ts [long-man|world] [N]
import { PlaySession, type SessionCheckpoint } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { DrawnWorld } from '../../../../../src/world/drawn-world';
import { Frontier } from '../../../../../src/world/frontier';
import { KeptGame } from '../../../../../web/engine/kept-game';
import { SaveCodec } from '../../../../../web/engine/save-codec';

const which = process.argv[2] ?? 'long-man', N = Number(process.argv[3] ?? 30);
const drawn = { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as never, origin: 'wanderer' };
async function fresh(): Promise<PlaySession> {
  if (which === 'world') { return DrawnWorld.start('thorn', drawn, NodeBundleSource.shared); }
  return PlaySession.start('data/campaigns/the-long-man.campaign.json', 'long', NodeBundleSource.shared);
}
// Walk toward a march-stone first (world), then pick offered choices deterministically.
function pick(s: PlaySession, i: number): string {
  const choices = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => !/^(rest|camp)/.test(id));
  const edge = choices.find(id => /__edge_/.test(id) && id.startsWith('go('));
  if (which === 'world' && edge && i < 20) { return edge; }
  const go = choices.filter(id => id.startsWith('go('));
  return (i % 3 === 0 && go.length ? go[(i * 5) % go.length] : choices[(i * 7) % choices.length])!;
}
const live = await fresh(), commands: string[] = [];
const saves = new Map<number, { file: string; kept: { state: string; world: string } }>();
for (let i = 0; i < N; i++) {
  if (!live.campaign.running) { break; }
  if (i % 5 === 0) {
    const cp = live.checkpoint(true), world = KeptGame.keyed(cp);
    const split = KeptGame.split(cp, world, [], live.campaign.world);
    saves.set(i, { file: JSON.stringify(live.checkpoint()),
      kept: { state: await SaveCodec.pack(JSON.stringify(split)), world: await SaveCodec.pack(world.text) } });
  }
  const c = pick(live, i);
  try { await live.perform(c, PlaySession.auto); commands.push(c); } catch (e) { console.log(`step ${i} ${c} threw: ${(e as Error).message}`); }
}
const end = live.canonical();
console.log(`${which}: ${commands.length} commands; installed ${live.campaign.installed.length}; canonical ${end.length} chars`);
for (const [k, s] of saves) {
  const done = commands.slice(k);
  const paths: [string, () => Promise<PlaySession>][] = [
    ['file/untrusted', async () => PlaySession.resume(JSON.parse(s.file) as SessionCheckpoint, { trusted: false })],
    ['kept/trusted', async () => {
      const parsed = JSON.parse(await SaveCodec.unpack(s.kept.state)), part = JSON.parse(await SaveCodec.unpack(s.kept.world));
      return PlaySession.resume(KeptGame.join(parsed, part).checkpoint, { owned: true, trusted: true });
    }]];
  for (const [name, make] of paths) {
    try {
      const r = await make();
      if (which === 'world') { r.extend(new Frontier('thorn', NodeBundleSource.shared)); }
      for (const c of done) { await r.perform(c, PlaySession.auto); }
      const same = r.canonical() === end, sem = sorted(JSON.parse(r.canonical())) === sorted(JSON.parse(end));
      console.log(`save@${k} ${name}: continued ${done.length} -> canonical string ${same ? 'EQUAL' : 'DIFFERS'}; key-order-insensitive ${sem ? 'EQUAL' : 'DIFFERS'}`);
      if (!sem) { diff(JSON.parse(r.canonical()), JSON.parse(end), ''); }
      else if (!same) { firstDiff(r.canonical(), end); }
    } catch (e) { console.log(`save@${k} ${name}: FAILED ${(e as Error).message.split('\n')[0]}`); }
  }
}
// Replay from scratch.
const t = live.transcript, re = which === 'world' ? await DrawnWorld.start(t.seed, t.drawn!, NodeBundleSource.shared) : await fresh();
try { await re.replay(t.steps); console.log('transcript replay canonical', re.canonical() === end ? 'EQUAL' : 'DIFFERS'); }
catch (e) { console.log('transcript replay FAILED', (e as Error).message); }
function diff(a: unknown, b: unknown, at: string, budget = { n: 6 }) {
  if (budget.n <= 0) { return; }
  if (JSON.stringify(a) === JSON.stringify(b)) { return; }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { diff((a as never)[k], (b as never)[k], `${at}.${k}`, budget); }
    return;
  }
  budget.n--; console.log(`   ${at}: ${JSON.stringify(a)?.slice(0, 120)} vs ${JSON.stringify(b)?.slice(0, 120)}`);
}
function sorted(v: unknown): string {
  return JSON.stringify(v, (_k, x) => x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.keys(x).sort().map(k => [k, (x as never)[k]])) : x);
}
function firstDiff(a: string, b: string) { let i = 0; while (a[i] === b[i]) { i++; } console.log(`   first byte diff @${i}: ...${a.slice(i - 60, i + 40)} | ...${b.slice(i - 60, i + 40)}`); }

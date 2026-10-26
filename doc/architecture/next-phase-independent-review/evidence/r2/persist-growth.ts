// Probe (r2): how what is kept after every command grows with play (long-man, deterministic offered choices).
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { KeptGame } from '../../../../../web/engine/kept-game';
import { SaveCodec } from '../../../../../web/engine/save-codec';
const s = await PlaySession.start('data/campaigns/the-long-man.campaign.json', 'long', NodeBundleSource.shared);
const N = Number(process.argv[2] ?? 200);
const world = KeptGame.keyed(s.checkpoint(true));
for (let i = 0; i <= N; i++) {
  if (i % 25 === 0) {
    const cp = s.checkpoint(true), t0 = performance.now();
    const state = JSON.stringify(KeptGame.split(cp, world, [], s.campaign.world)), packed = await SaveCodec.pack(state);
    const ms = Math.round(performance.now() - t0), ev = JSON.stringify(cp.save.events).length;
    console.log(`step ${i}: events ${cp.save.events.length} (${(ev / 1e3).toFixed(0)} kB json); kept state ${(state.length / 1e3).toFixed(0)} kB -> packed ${(packed.length / 1e3).toFixed(0)} kB; split+stringify+pack ${ms} ms; heap ${(process.memoryUsage().heapUsed / 1e6).toFixed(0)} MB`);
  }
  if (!s.campaign.running) { console.log('campaign ended at', i); break; }
  const choices = PlayerView.choices(s.campaign).map(c => c.choice.id);
  try { await s.perform(choices[(i * 7) % choices.length]!, PlaySession.auto); } catch { /* skip */ }
}

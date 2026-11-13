// Probe: is a checkpoint's save checked against its own transcript when resumed? Tamper the save (gold, elapsed),
// resume untrusted, and compare with the state the transcript replays to.
import { PlaySession } from '../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../src/presentation/player-view';

const path = 'test/fixtures/probes/ordinary/ordinary.campaign.json';
const s = await PlaySession.start(path, 'verify', NodeBundleSource.shared);
await s.perform(PlayerView.resolve(s.campaign, 'wait') ? 'wait' : PlayerView.choices(s.campaign)[0]!.choice.id);
const cp = structuredClone(s.checkpoint());
cp.save.state.elapsed += 500; cp.save.encounter += 7; cp.transcript.steps.push({ command: 'never-performed' });
const resumed = PlaySession.resume(cp, { trusted: false });
console.log('tampered checkpoint resumed without error; elapsed =', resumed.campaign.state.elapsed, 'strength', resumed.campaign.readout.creatures[0]!.base.strength);
const replayed = await PlaySession.start(path, 'verify', NodeBundleSource.shared);
await replayed.replay(cp.transcript.steps.slice(0, -1));
console.log('resumed transcript steps:', resumed.transcript.steps.map(x => x.command));
console.log('transcript replays to elapsed =', replayed.campaign.state.elapsed, 'strength', replayed.campaign.readout.creatures[0]!.base.strength,
  '; canonical equal:', replayed.canonical() === resumed.canonical());

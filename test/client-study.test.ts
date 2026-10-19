import { expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

it('runs the client study through ordinary campaign commands with a persistent reward and replay', async () => {
  const manifest = 'data/client-study/campaign.json', seed = 'censer';
  const s = await PlaySession.start(manifest, seed, NodeBundleSource.shared);
  for (const id of ['censer__vesper_work', 'travel(censer__road)', 'travel(censer__entry)',
    'censer__oren_burials', 'travel(censer__stair)', 'travel(censer__crypt)', 'attack(censer__guardian)',
    'examine(censer__rubbing)', 'learn_reward(censer__seal,censer__member_shield)',
    'travel(censer__stair)', 'travel(censer__entry)', 'travel(censer__road)', 'travel(censer__town)',
    'rest(censer__town)']) {
    expect(PlayerView.observe(s.campaign).choices.some(c => c.id === id)).toBe(true);
    await s.perform(id);
  }
  expect(s.campaign.state.creatures.find(c => c.id === 'censer__shield')!.state.learnedAbilities).toContain('cinder');
  expect(s.campaign.state.outcomes!['censer.seal_learned']).toBe(true);
  expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
  const replay = await PlaySession.start(manifest, seed, NodeBundleSource.shared);
  await replay.replay(s.transcript.steps);
  expect(replay.canonical()).toBe(s.canonical());
}, 30000);

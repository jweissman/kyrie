// Probe: an activity broken off by someone arriving names them (Interruption.present/arrival), though they are seen
// only by those who know a fact ("Seen when") and the company does not; the choice list correctly hides them.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { LocalObservations } from '../../../../../src/presentation/local-observations';

const kyr = `Module m "Unseen probe" {
  Place camp "the camp" is room.
  Place pool "the black pool" is room.
  Passage reeds "the reed path" between pool and camp.
  Company party "You" of 1 at camp.
  Person ysolde "Sister Ysolde" at pool { Role "the drowned nun". Ancestry human. Peaceable. Seen when knows(?viewer, ysolde_known). }
  Discovery ysolde_known "A drowned nun walks the reed path.".
  Pursuit come for ysolde "walking to the camp" priority 10 when true seeks at(ysolde, camp) using go.
  Goal false.
}`;
const source = new OverlayBundleSource(NodeBundleSource.shared, {
  'probe/unseen/campaign.json': JSON.stringify({ version: 1, name: 'Unseen probe', modules: [{ id: 'm', bundle: 'module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
  'probe/unseen/module.json': JSON.stringify({ version: 1, source: 'm.kyr', rules: ['world'], globals: ['party'], exports: { party: 'party' } }),
  'probe/unseen/m.kyr': kyr,
});
const s = await PlaySession.start(source.resolve('probe/unseen/campaign.json'), 'unseen', source);
const c = s.campaign;
const wait = PlayerView.choices(c).find(r => /Wait and watch/.test(r.choice.name))!;
const e = await s.perform(wait.choice.id);
console.log('ysolde at:', c.world.one('at', 'm__ysolde'), '| noticed by company:', LocalObservations.noticed(c.world, 'm__ysolde', 'party'));
console.log('event response (shown to player):', JSON.stringify(e.response), '| cut:', e.cut);
console.log('choices naming her:', JSON.stringify(PlayerView.choices(c).map(r => r.choice.name).filter(n => /Ysolde/.test(n))));
console.log('chronicle npc:', JSON.stringify(PlayerView.chronicle(c).filter(x => x.kind === 'npc').map(x => x.text)));

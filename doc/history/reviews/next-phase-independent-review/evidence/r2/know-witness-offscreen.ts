// Probe: the chronicle's "You witness: ..." (PlayerView.chronicle, also ActionFeedback.immediate) decides presence
// from the company's place AFTER the whole command, so an NPC act at the destination while the company was still on a
// two-hour road is "witnessed"; and any NPC act whose bindings name the company's place is witnessed from anywhere.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { ActionFeedbackView } from '../../../../../src/presentation/action-feedback';

const kyr = `Module m "Witness probe" {
  Place camp "the camp" is room.
  Place keep "the keep" is room.
  Place hermitage "the far hermitage" is room.
  Passage road "the long road" is road between keep and camp taking 2 hours.
  Company party "You" of 1 at keep.
  Person bede "Old Bede" at camp { Role "a miller". Ancestry human. Peaceable. }
  Person hermit "the hermit" at hermitage { Role "a hermit". Ancestry human. Peaceable. }
  Relation swept(place). Relation cursed(place).
  Action sweep(actor: group, site: place) "Sweep {site}" {
    Requires able(actor) and at(actor, site) and not swept(site).
    On success { Assert swept(site). }
    Seen "{actor} sweeps {site} clean.".
  }
  Action curse(actor: group, target: place, home: place) "Lay a curse on {target}" {
    Requires able(actor) and at(actor, home) and not cursed(target).
    On success { Assert cursed(target). }
  }
  Pursuit tidy for bede "keeping {camp} tidy" priority 10 when true seeks swept(camp) using sweep.
  Pursuit spite for hermit "cursing {camp}" priority 10 when true seeks cursed(camp) using curse.
  Goal false.
}`;
const source = new OverlayBundleSource(NodeBundleSource.shared, {
  'probe/witness/campaign.json': JSON.stringify({ version: 1, name: 'Witness probe', modules: [{ id: 'm', bundle: 'module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
  'probe/witness/module.json': JSON.stringify({ version: 1, source: 'm.kyr', rules: ['world'], globals: ['party'], exports: { party: 'party' } }),
  'probe/witness/m.kyr': kyr,
});
const s = await PlaySession.start(source.resolve('probe/witness/campaign.json'), 'witness', source);
const c = s.campaign;
const go = PlayerView.choices(c).find(r => r.action.schema === 'go')!;
const before = PlayerView.observe(c);
const e = await s.perform(go.choice.id);
console.log('performed:', go.choice.name, '| arrived at elapsed', e.elapsed, '| result', e.result);
console.log('npc decisions:', JSON.stringify((e.npc ?? []).map(d => ({ actor: d.actor, action: d.action, at: d.elapsed }))));
console.log('company left at elapsed', e.elapsed - 12, '(2 hours = 12 watches)');
console.log('chronicle npc entries:', JSON.stringify(PlayerView.chronicle(c).filter(x => x.kind === 'npc')));
console.log('feedback.immediate (shown on the page):', JSON.stringify(ActionFeedbackView.read(c, e, before).immediate));

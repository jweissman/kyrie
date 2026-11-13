// Probe: a place "seen as" something until a fact is known is named by its real name in narration paths that bypass
// ObservationText.label: Journeys (voiced journey lines), Openings (character-sheet development), Obituary,
// Journey.told (turned back). The choice list, by contrast, uses the alias.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { ObservationText } from '../../../../../src/lang/observation-text';
import { Openings } from '../../../../../src/presentation/openings';
import { Obituary } from '../../../../../src/narrative/obituary';
import { InformationView } from '../../../../../src/information/information-view';

const kyr = `Module m "Alias probe" {
  Place camp "the camp" is room.
  Place keep "Grimwater Keep" is room seen as "a ruined tower" until keep_named.
  Place eyrie "the Eyrie of Saint Hollis" is room seen as "a ledge high above" until eyrie_named.
  Passage road "the long road" is road between keep and camp taking 2 hours.
  Passage cliff "the cliff face" is climb between keep and eyrie needing climbing.
  Company party "You" of 1 at keep.
  Discovery keep_named "The tower is Grimwater Keep.".
  Discovery eyrie_named "The ledge is the Eyrie of Saint Hollis.".
  Goal false.
}`;
const source = new OverlayBundleSource(NodeBundleSource.shared, {
  'probe/alias/campaign.json': JSON.stringify({ version: 1, name: 'Alias probe', modules: [{ id: 'm', bundle: 'module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
  'probe/alias/module.json': JSON.stringify({ version: 1, source: 'm.kyr', rules: ['world'], globals: ['party'], exports: { party: 'party' } }),
  'probe/alias/m.kyr': kyr,
});
const s = await PlaySession.start(source.resolve('probe/alias/campaign.json'), 'alias', source);
const c = s.campaign;
const id = (x: string) => c.module.entities.find(e => e.id.endsWith(x))!.id;
console.log('label(keep) as the company knows it:', ObservationText.label(c.world, id('keep')));
console.log('label(eyrie):', ObservationText.label(c.world, id('eyrie')));
console.log('choices:', JSON.stringify(PlayerView.choices(c).map(r => r.choice.name)));
console.log('Openings (character sheet):', JSON.stringify([...Openings.of(c)]));
console.log('Obituary (if the company fell here):', JSON.stringify(Obituary.of(c).lines));
const info = InformationView.observe(c);
console.log('CLI InformationView: supported =', InformationView.supported(c), '| location =', JSON.stringify(info.location), '| choices =', JSON.stringify(info.choices.map(x => x.name).filter(n => /Keep|Hollis|tower|ledge/.test(n))));
const go = PlayerView.choices(c).find(r => r.action.schema === 'go')!;
const e = await s.perform(go.choice.id);
console.log('performed:', go.choice.name, '->', e.result);
console.log('voiced journey lines:', JSON.stringify((e.voiced ?? []).map(v => v.text)));
console.log('knows keep_named after?', c.world.test({ kind: 'call', name: 'knows', args: ['party', id('keep_named')] } as never));

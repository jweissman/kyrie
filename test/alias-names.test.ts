import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Openings } from '../src/presentation/openings';
import { Obituary } from '../src/narrative/obituary';
import { InformationView } from '../src/information/information-view';

// A place the company knows only by what it looks like is called that everywhere the player reads it, not by its
// real name (the architecture review's A13, from its probe know-alias-leaks: the journey's going, the character
// sheet, the obituary and the terminal said "Grimwater Keep" of what the choices called a ruined tower).
describe('a place known only by its look', () => {
  it('is called by its look in every telling', async () => {
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
      'probe/alias/module.json': JSON.stringify({ version: 1, source: 'm.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'probe/alias/m.kyr': kyr });
    const s = await PlaySession.start(source.resolve('probe/alias/campaign.json'), 'alias', source), c = s.campaign;
    const told = (texts: string[]) => texts.join(' ');
    expect(told([...Openings.of(c)].flatMap(([, ways]) => ways))).not.toMatch(/Hollis/);
    expect(told(Obituary.of(c).lines)).not.toMatch(/Grimwater/);
    const info = InformationView.observe(c);
    expect(told([info.location?.name ?? '', ...info.choices.map(x => x.name)])).not.toMatch(/Grimwater|Hollis/);
    const go = PlayerView.choices(c).find(r => r.action.schema === 'go')!;
    const e = await s.perform(go.choice.id);
    expect(told((e.voiced ?? []).map(v => v.text))).not.toMatch(/Grimwater/);
  }, 60000);
});

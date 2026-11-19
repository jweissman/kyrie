import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// Rooms under the town with something in them that sends the company back up to someone (the owner, 19 November: the
// dungeons "deathly dull", the quests not circling back): the cellar's strongbox, which the merchant says was the old
// corn-factor's; the crypt's brass token, which the innkeeper knows for the back-stair lodger's.
describe('what is found under the town', () => {
  it('is asked about of whoever above it is someone\'s', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign, t = 'region__s1';
    const put = (p: string) => c.commitWorld(c.world.apply([
      { kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', p) },
      { kind: 'assert', call: ModuleWriter.call('knows', 'party', `${t}_u_cellar_box`) },
      { kind: 'assert', call: ModuleWriter.call('knows', 'party', `${t}_u_crypt_token`) }]));
    const offered = () => PlayerView.choices(c).map(x => x.choice.name).join('\n');
    put(c.world.one('at', `${t}_merchant`)!);
    expect(offered()).toMatch(/about the strongbox under the cellar sacks/);
    put(c.world.one('at', `${t}_innkeeper`)!);
    expect(offered()).toMatch(/the brass token from the crypt/);
  }, 120000);
});

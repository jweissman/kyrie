import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';

// An authored scene given to whoever of the company is fit for it (the owner, 6 November: adventures never own the
// party; a line binds to the actual companion who qualifies, never to a slot of a ready-made party, and behaves when
// none does). The engine keeps companion(member) for everyone in the player's company but the one who plays; a module
// asks for one who brings what the scene wants, awake, and the line names them.
const adventure = `Module ins "The Inscription" {
  Place hall "the hall" is room. Company party "You" of 2 at hall.
  Relation inscriptionRead().
  Observe chisel at hall noticed by lore when true "Under the inscription, in smaller letters, the name of the mason who cut it.".
  Rule read_inscription when memberOf(?m, party) and companion(?m) and awake(?m) and brings(?m, lore) and not inscriptionRead() says "{?m} leans close to the stone over the door and reads the old letters aloud: THE DEAD KEEP WHAT IS GIVEN THEM." { Assert inscriptionRead(). }
}`;
const play = async (party: { name: string; classId: string }[]) => {
  const src = new OverlayBundleSource(NodeBundleSource.shared, {
    'ins/site.kyr': adventure,
    'ins/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party' } }),
    'ins.campaign.json': JSON.stringify({ version: 1, name: 'ins', modules: [{ id: 'p', bundle: 'ins/module.json' }],
      party: party.map(p => ({ ...p, raceId: 'human' })) }) });
  return PlaySession.start(src.resolve('ins.campaign.json'), 'ins', src);
};
const said = (s: PlaySession) => JSON.stringify(s.campaign.history);

describe('a line for whoever of the company is fit for it', () => {
  it('is given to the companion who can, by name', async () => {
    const s = await play([{ name: 'Ama', classId: 'warrior' }, { name: 'Bede', classId: 'mage' }]);
    await s.perform('wait');
    expect(said(s)).toContain('Bede leans close to the stone');
    expect(s.campaign.world.test(ModuleWriter.call('p__inscriptionRead'))).toBe(true);
  }, 60000);
  it('is not given to the one who plays, though they can, nor to anyone else in their stead', async () => {
    const s = await play([{ name: 'Ama', classId: 'mage' }, { name: 'Bede', classId: 'warrior' }]);
    await s.perform('wait');
    expect(said(s)).not.toContain('leans close to the stone');
  }, 60000);
  it('is not said while the one who can is down', async () => {
    const s = await play([{ name: 'Ama', classId: 'warrior' }, { name: 'Bede', classId: 'mage' }]);
    const bede = s.campaign.world.related('companion')[0]!.args[0]!;
    // Down: the projection keeps awake from the creature, so it is held down by its hit points.
    type Lease = { creatures: { state: { hp: number } }[]; commit(c: unknown): void; release(): void };
    const store = (s.campaign as unknown as { creatures: { acquire(ids: string[]): Lease } }).creatures;
    const lease = store.acquire([s.campaign.state.partyIds[1]!]);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    await s.perform('wait');
    expect([bede.length > 0, said(s).includes('leans close to the stone')]).toEqual([true, false]);
  }, 60000);
  // What only one who brings lore would notice is credited to the companion who does, and to no one when it is the
  // one who plays (Narrator.noticed had credited only the country's travellers, never an adventure's recruits).
  it('credits what is noticed to the companion who noticed it', async () => {
    const seen = async (party: { name: string; classId: string }[]) => {
      const s = await play(party);
      await s.perform('wait');
      return JSON.stringify(Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)));
    };
    expect(await seen([{ name: 'Ama', classId: 'warrior' }, { name: 'Bede', classId: 'mage' }]))
      .toContain('Bede sees it first.');
    expect(await seen([{ name: 'Ama', classId: 'mage' }, { name: 'Bede', classId: 'warrior' }]))
      .not.toContain('sees it first');
  }, 60000);
});

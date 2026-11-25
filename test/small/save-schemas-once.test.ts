import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../../src/session/play-session';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlayerView } from '../../src/presentation/player-view';
import { Digest } from '../../src/session/digest';

// A save writes the campaign's action schemas once (MT-27): they are its module's actions, the very records, and it
// had written them twice, a sixth of it (2.2 MB of iscoed's 12.9 MB checkpoint). Opened again, the game is the game
// it was: its canonical record and its digest, and the same commands played on in both come out alike.
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }, { name: 'Bran', raceId: 'human', classId: 'warrior' }];
const begun = () => PlaySession.start('test/fixtures/ford-road/campaign.json', 'schemas-once', NodeBundleSource.shared,
  party);
const first = (s: PlaySession) => PlayerView.choices(s.campaign)[0]!.choice.id;
describe('a save', () => {
  it('writes the schemas once, and opens as the game it was', async () => {
    const s = await begun();
    for (let i = 0; i < 3; i++) { await s.perform(first(s)); }
    const checkpoint = s.checkpoint(), text = JSON.stringify(checkpoint);
    expect(checkpoint.save.schemas).toBe('actions');
    expect(checkpoint.save.definition && 'schemas' in checkpoint.save.definition).toBe(false);
    expect(s.campaign.schemaList.length).toBeGreaterThan(0);
    const r = PlaySession.resume(JSON.parse(text) as typeof checkpoint, { owned: true, trusted: true });
    expect(r.campaign.schemaList.map(o => o.id)).toEqual(s.campaign.schemaList.map(o => o.id));
    expect(r.canonical()).toBe(s.canonical());
    for (let i = 0; i < 3; i++) {
      const command = first(s);
      expect(first(r)).toBe(command);
      await s.perform(command); await r.perform(command);
      expect(Digest.of(r.campaign)).toBe(Digest.of(s.campaign));
    }
  });
  it('written out at once, gives the one definition from save to save (the page keeps its world by it)', async () => {
    const s = await begun();
    const a = s.campaign.save(true, true).definition;
    await s.perform(first(s));
    expect(s.campaign.save(true, true).definition).toBe(a);
  });
});

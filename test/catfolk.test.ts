import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CompanyPortraits } from '../src/paintings/company-portraits';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// The catfolk, a people Orsino has (ancestry:catfolk: agile, lucky, quick of hand) and Kyr made playable when the
// studio painted them in every calling (assets/pcs/catfolk*.png, cut into data/paintings/pcs.json like every other
// people's): offered at creation with every calling, each painted as a man and as a woman, named from their own
// names (data/generation/scenes/folk.json), and a company of them sets out into a country like any other.
describe('the catfolk', () => {
  it('are a people the player can be, of every calling, each with a likeness of either presentation', () => {
    expect(Content.playableRaces).toContain('catfolk');
    for (const classId of Canon.ancestries.catfolk!.classes) {
      const creature = new Content('cat').createCreature('pc', { raceId: 'catfolk', classId });
      expect([classId, creature.raceId, creature.traits]).toEqual([classId, 'catfolk', expect.arrayContaining(['agile', 'lucky'])]);
      for (const presentation of ['man', 'woman'] as const) {
        expect([classId, presentation, CompanyPortraits.of({ classId, raceId: 'catfolk', presentation, key: 'k' })?.id])
          .toEqual([classId, presentation, expect.stringContaining('-catfolk-')]);
      }
    }
  });
  it('set out into a generated country as any company does', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Sable', raceId: 'catfolk', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const store = (s.campaign as unknown as { creatures: { snapshot: { raceId: string; name: string }[] } }).creatures;
    expect(store.snapshot.some(c => c.raceId === 'catfolk' && c.name === 'Sable')).toBe(true);
  }, 60000);
});

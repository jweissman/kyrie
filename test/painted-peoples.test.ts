import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CompanyPortraits } from '../src/paintings/company-portraits';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// The catfolk and the birdfolk, peoples Orsino has (ancestry:catfolk: agile, lucky, quick of hand; ancestry:birdfolk:
// agile, curious, keen of eye) and Kyr made playable when the studio painted them in every calling
// (assets/pcs/catfolk*.png, birdfolk*.png, cut into data/paintings/pcs.json like every other people's): offered at
// creation with every calling, each painted as a man and as a woman, named from their own names
// (data/generation/scenes/folk.json), and a company of them sets out into a country like any other.
describe.each([['catfolk', ['agile', 'lucky'], 'Sable'], ['birdfolk', ['agile', 'curious'], 'Kestrel']] as const)(
  'the %s', (people, traits, name) => {
    it('are a people the player can be, of every calling, each with a likeness of either presentation', () => {
      expect(Content.playableRaces).toContain(people);
      expect(Canon.ancestries[people]!.classes).toEqual(expect.arrayContaining(['warrior', 'mage', 'cleric', 'thief',
        'bard', 'ranger', 'monk']));
      for (const classId of Canon.ancestries[people]!.classes) {
        const creature = new Content('cat').createCreature('pc', { raceId: people, classId });
        expect([classId, creature.raceId, creature.traits])
          .toEqual([classId, people, expect.arrayContaining([...traits])]);
        for (const presentation of ['man', 'woman'] as const) {
          expect([classId, presentation, CompanyPortraits.of({ classId, raceId: people, presentation, key: 'k' })?.id])
            .toEqual([classId, presentation, expect.stringContaining(`-${people}-`)]);
        }
      }
    });
    it('set out into a generated country as any company does', async () => {
      const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
        { origin: 'wanderer', party: [{ name, raceId: people, classId: 'ranger' }] });
      const s = await PlaySession.start(w.path, 'a1', w.source);
      type Held = { creatures: { snapshot: { raceId: string; name: string }[] } };
      const store = (s.campaign as unknown as Held).creatures;
      expect(store.snapshot.some(c => c.raceId === people && c.name === name)).toBe(true);
    }, 60000);
  });

import { HandbookCreationReferences } from '../../src/client/creation-references';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import { CreationPerks } from '../../src/creation/creation-perks';
import type { Setting } from '../../src/creation/protocol';
import { Content } from '../../src/content';
import { Traits } from '../../src/ports/traits';
import { ItemCatalog } from '../../src/item-catalog';

// A perk, the last thing chosen of who one is (the owner, 26 November: "perk selection at startup is very important
// for character differentiation"; OR-153): one of each of the Atlas's five families, held as a trait, so that what it
// gives (a skill, a modifier) is the rules' own from the first turn.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'wanderer', title: 'Wandering', choice: 'You come with your trade', background: 'drifter' }], names,
  party: [Creation.protagonist('human', 'perk', names)] };

describe('a perk chosen at creation', () => {
  it('is asked of every life, one of each of the five families, after the trade and before the name', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    const ids = flow.steps().map(s => s.id), perk = flow.steps().find(s => s.id === 'perk')!;
    expect(perk.cards.map(c => c.id).sort()).toEqual(CreationPerks.offered.map(([id]) => id).sort());
    expect(Creation.catalog().perks.map(p => p.family).sort()).toEqual(['blue', 'gold', 'green', 'red', 'violet']);
    expect(ids.indexOf('perk')).toBe(ids.indexOf('name') - 1);
    for (const c of perk.cards) { expect(Traits.of(c.id)?.category).toBe('perk'); }
  });
  it('is given to a life begun at once, the same for the same life', () => {
    const a = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences()).member.perk;
    expect(CreationPerks.offered.map(([id]) => id)).toContain(a ?? '');
    expect(new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences()).member.perk).toBe(a);
  });
  it('is held as a trait, what it gives the rules\' own: the haggler persuades', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    flow.choose('perk', 'haggler');
    expect(flow.member.perk).toBe('haggler');
    const creature = new Content('perk').createCreature(ItemCatalog.canon, 'perk-haggler',
      { ...flow.member, raceId: 'human', classId: 'warrior' });
    expect(creature.traits).toContain('haggler');
    expect(Traits.of('haggler')?.skills).toContain('persuasion');
  });
});

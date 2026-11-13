import { describe, expect, it } from 'bun:test';
import animals from '../data/catalog/animals.json';
import monsters from '../data/catalog/monsters.json';
import variations from '../data/catalog/variations.json';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { Cast } from '../src/campaign/cast';
import { CreaturePortraits } from '../src/paintings/creature-portraits';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleParser } from '../src/lang/module-parser';

// One creature pipeline (the owner, 5 November; doc/history/missions/19/creatures.md): every creature is made from
// its kind's one record (data/catalog/animals.json, monsters.json, Orsino's generated kinds), a kind named for what
// varies it is its base with those variations, a kind added by its record alone is made in play by an author's
// Person and by what a country generates alike, and is shown, fights and is kept by that record.
const make = (raceId: string, more: Record<string, unknown> = {}) =>
  new Content('pipeline').createCreature('c', { raceId, ...more } as never, 'c');
describe('one creature pipeline', () => {
  it('makes every base creature from its own record, and only what it is asked to be', () => {
    // Not the fighting objects (a ward, a turret: monsters.json's combatEntity kinds), whose powers are their own.
    const creatures = Object.entries(monsters.species as Record<string, { source: { orsino?: string } }>)
      .filter(([, m]) => !m.source.orsino?.startsWith('combatEntity:')).map(([id]) => id);
    for (const id of [...Object.keys(animals.species), ...creatures, 'ooze', 'goat']) {
      const c = make(id), record = Canon.creature(id);
      expect([id, c.raceId]).toEqual([id, id]);
      for (const a of record.abilities ?? []) { expect([id, c.base.abilities.includes(a)]).toEqual([id, true]); }
    }
    // Wolves had come out of a list of five bodies with frost or marsh laid on them at random.
    for (const seed of ['a', 'b', 'c', 'd']) {
      const wolf = new Content(seed).createCreature('w', { raceId: 'wolf' }, 'w');
      expect(wolf.traits ?? []).not.toContain('frost_adapted');
    }
  });
  it('grows a rat with its level, and makes a great rat and a cave spider of their bases and variations', () => {
    expect(make('rat', { level: 4 }).base.maxHp).toBeGreaterThan(make('rat', { level: 1 }).base.maxHp);
    const great = variations.variations.great.attributes;
    expect(make('great_rat').base.strength).toBe(make('rat').base.strength + great.strength);
    const cave = make('cave_spider');
    // Its web and its venom are the spider's; the cave and its size are what vary it.
    expect(cave.base.abilities).toEqual(expect.arrayContaining(['venomous_bite', 'ensnare']));
    expect([cave.raceId, cave.variations]).toEqual(['spider/great/cave', ['great', 'cave']]);
  });
  it('makes a kind added by its record alone in an author’s Person and from what generation casts, alike', async () => {
    const [cast] = Cast.group(ModuleParser.parse(`Module e "E" { Place pool "the pool" is room.
      Person eels "the eels" at pool { Role "an eel". } }`).people![0]!, { raceId: 'eel', count: 1 });
    expect(cast!.context.raceId).toBe('eel');
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ee/site.kyr': `Module ee "Eels" { Place mere "the Mere" is settlement.
        Place pool "the eel-pool" is room within mere at 0, 0 outdoors. Company party "You" of 1 at pool.
        Person eels "the eels" at pool { Role "an eel". Species eel. Variant elder. Numbers 2. Level 2. } }`,
      'ee/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ee.campaign.json': JSON.stringify({ version: 1, name: 'ee', modules: [{ id: 'p', bundle: 'ee/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('ee.campaign.json'), 'ee', source);
    const shape = (c: { base: { maxHp: number; abilities: string[] }; traits?: string[] }) =>
      ({ hp: c.base.maxHp, traits: [...c.traits ?? []].sort(), abilities: c.base.abilities });
    const eels = () => s.campaign.readout.creatures.filter(c => c.raceId === 'eel').map(shape);
    expect(eels()).toHaveLength(2);
    for (const e of eels()) { expect(e.abilities).toEqual(expect.arrayContaining(Canon.creature('eel').abilities!)); }
    // Kept across a save and its reading again: the same creatures, as they were made.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(again.campaign.readout.creatures.filter(c => c.raceId === 'eel').map(shape)).toEqual(eels());
  }, 60000);
  it('shows a creature by its kind’s painting, a named variant by its base’s', () => {
    // Every animal by its painting from the menagerie (data/paintings/animals.json); a kind composed of one by its
    // base's (a frost wolf, a wolf); a monster by its own from the bestiary (data/paintings/monsters.json).
    expect(['wolf', 'frost_wolf', 'dog', 'vampire', 'bear', 'rat'].map(id => CreaturePortraits.painting(id)))
      .toEqual(['animals/wolf', 'animals/wolf', 'animals/dog', 'monsters/vampire', 'animals/bear', 'animals/rat']);
  });
});

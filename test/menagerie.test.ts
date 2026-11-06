import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import animalPaintings from '../data/paintings/animals.json';
import monsterPaintings from '../data/paintings/monsters.json';
import { CreaturePortraits } from '../src/paintings/creature-portraits';
import { Battle } from '../src/arena';
import { Canon } from '../src/canon/canon';
import { CombatModel } from '../src/ui/combat-model';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { Summoning } from '../src/summoning';
import { RegionEcology } from '../src/world/region-ecology';
import type { Fighter } from '../src/model';

// The animals as the page shows them and a ranger calls them (the owner, 6 November): every animal its painting, cut
// from the menagerie sheets (data/paintings/animals.json), on the scene and on a fight's cards, a foe's as a friend's;
// a ranger's call answered by the animals of the country the fight is in, an animal added by its record among them;
// and every dragon's lineage a breath weapon met with a save, never a bite with a colour.
const ranger = (environment?: string): Fighter => ({
  ...CombatProjection.fighter(new Content('menagerie').createCreature('ranger', { raceId: 'human', classId: 'ranger',
    level: 3 } as never), 'fighters'), ...environment ? { environment } : {} });
const call = Canon.abilities.summon_animal!.effects!.find(e => e.kind === 'summon')! as Parameters<typeof Summoning.pool>[0];

describe('the menagerie', () => {
  it('paints every animal by its own picture, cut and on disk', () => {
    const animals = Canon.catalogued.filter(id => Canon.creature(id).kind === 'animal');
    expect(animals.filter(id => !Canon.creature(id).portrait)).toEqual([]);
    for (const p of animalPaintings.portraits) {
      expect([p.kind, existsSync(`web/reader/${p.file}`), existsSync(`web/reader/${p.large}`)]).toEqual([p.kind, true, true]);
    }
  });
  // And every monster by its own, from the bestiary sheets (the owner, 6 November), the zombie added last among them,
  // and a kind composed of one (a red dragon, an iron golem) by its base's.
  it('paints every monster by its own picture, and a composed one by its base\'s', () => {
    const monsters = Canon.catalogued.filter(id => Canon.creature(id).kind === 'monster');
    expect(monsters.filter(id => Canon.creature(id).portrait !== `monsters/${id}`)).toEqual([]);
    for (const p of monsterPaintings.portraits) {
      expect([p.kind, existsSync(`web/reader/${p.file}`), existsSync(`web/reader/${p.large}`)]).toEqual([p.kind, true, true]);
    }
    expect(['dragon/red_lineage', 'golem/iron', 'fire_elemental'].map(id => CreaturePortraits.painting(id)))
      .toEqual(['monsters/dragon', 'monsters/golem', 'monsters/elemental']);
  });
  it('places the seven new animals where they live', () => {
    const seen = (habitat: string) => RegionEcology.seen(new Set([habitat])).map(([id]) => id);
    expect(seen('desert')).toEqual(expect.arrayContaining(['zebra']));
    expect(seen('sea')).toEqual(expect.arrayContaining(['dolphin', 'whale']));
    expect(seen('wood')).toEqual(expect.arrayContaining(['monkey']));
    expect(RegionEcology.recorded('desert').map(r => r._key)).toEqual(expect.arrayContaining(['rhino', 'elephant']));
    expect(RegionEcology.recorded('wood').map(r => r._key)).toContain('leopard');
  });
  it('answers a ranger\'s call with the animals of the country the fight is in', () => {
    const desert = Summoning.pool(call, ranger('desert'));
    expect(desert).toEqual(expect.arrayContaining(['rhino', 'zebra', 'elephant', 'leopard']));
    expect(desert.every(id => Canon.creature(id).habitats?.includes('desert'))).toBe(true);
    const forest = Summoning.pool(call, ranger('forest'));
    expect(forest).toEqual(expect.arrayContaining(['monkey', 'leopard', 'wolf']));
    expect(forest).not.toContain('zebra');
    // Out of any country (an arena), what its people call (Orsino's companions by ancestry), as before.
    expect(Summoning.pool(call, ranger())).toEqual(call.byAncestry?.human ?? call.from ?? []);
  });
  it('shows a summoned animal and a foe by their paintings on the fight\'s cards', () => {
    const r = ranger('forest');
    const battle = new Battle({ id: 'm', combatants: [r, new Content('m').creature('rat', 'rat', 'goblins')],
      abilities: Content.abilities }, 'menagerie');
    const command = battle.legalCommands().find(c => c.actor === 'ranger' && c.ability === 'summon_animal');
    if (battle.state.actor !== 'ranger' || !command) { battle.step(battle.chosen()); }
    const again = battle.legalCommands().find(c => c.actor === 'ranger' && c.ability === 'summon_animal');
    if (again) { battle.step(again); }
    const screen = CombatModel.build(battle);
    expect(screen.foes[0]!.face?.src).toBe('paintings/animals/rat.webp');
    const called = screen.allies.find(a => a.id !== 'ranger');
    if (called) { expect(called.face?.src).toMatch(/^paintings\/animals\/\w+\.webp$/); }
  });
  it('gives every dragon lineage a breath weapon met with a save vs breath, and its bite besides', () => {
    for (const lineage of ['red', 'white', 'black', 'blue', 'green', 'gold', 'silver', 'brass', 'bronze', 'copper']) {
      const dragon = new Content('dragon').createCreature('d', { raceId: `dragon/${lineage}_lineage`, level: 5 } as never);
      const breath = dragon.base.abilities.filter(a => a.startsWith('breathe_'));
      expect([lineage, breath.length]).toEqual([lineage, 1]);
      const effects = Canon.abilities[breath[0]!]!.effects ?? [];
      expect([lineage, effects[0]?.target, effects[0]?.save?.kind]).toEqual([lineage, 'enemies', 'breath']);
      // Its bite is its own natural weapon, not its breath.
      expect([lineage, CombatProjection.fighter(dragon, 'goblins').equipment.weapon.id]).toEqual([lineage, 'bite']);
    }
  });
});

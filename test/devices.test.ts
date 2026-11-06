import { describe, expect, it } from 'bun:test';
import registry from '../data/sources/orsino/registry.json';
import { Battle } from '../src/battle';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { OrsinoBestiary } from '../src/registry/orsino-bestiary';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import type { RegistryEntry } from '../src/registry/orsino-extract';

// Taking part in a fight does not make a thing a monster (the owner, 5 November, late): Orsino's turret, ward,
// barrier, bomb and phylactery are devices (data/catalog/devices.json), made by the one chassis that makes creatures
// and fighting with their own powers, set where they stand by an author (Device turret.) or by a site that keeps one,
// and never called up, denned or counted among the creatures.
const ids = ['turret', 'antimagic_ward', 'barrier', 'bomb', 'phylactery'];
const fight = (device: string, seed: string) => {
  const content = new Content(seed);
  const store = new CreatureStore([content.createCreature(device, { raceId: device }, device),
    content.createCreature('hero', { raceId: 'human', classId: 'warrior', level: 3 }, 'hero')]);
  return Battle.encounter(store, [{ creatureId: device, team: 'goblins' }, { creatureId: 'hero', team: 'fighters' }],
    { seed, maxTurns: 12 });
};
// The hero only waits, so what happens is the device's doing.
const waitOut = (battle: Battle, turns: number) => {
  for (let i = 0; i < turns && !battle.state.outcome; i++) {
    const legal = battle.legalCommands();
    battle.step(battle.state.actor === 'hero' ? legal.find(c => c.ability === 'wait')! : battle.chosen());
  }
};

describe('a device', () => {
  it('is a device, never a creature: its own record, inanimate, never summoned', () => {
    for (const id of ids) {
      expect([id, Canon.isDevice(id), Canon.isSpecies(id), Canon.creature(id).kind]).toEqual([id, true, false, 'device']);
      expect(Canon.creature(id).traits).toContain('inanimate');
    }
    const entries = registry.entries as unknown as RegistryEntry[];
    const called = Object.values(OrsinoBestiary.vocabulary(entries).byType).flat();
    expect(called.filter(id => ids.includes(id))).toEqual([]);
    const made = new Content('d').createCreature('t', { raceId: 'turret' }, 't');
    expect([made.base.maxHp, made.classId]).toEqual([8, undefined]);
  });
  it('fights with its own powers: a turret\'s volley, and a bomb that burns its enemies and is gone', () => {
    const turret = fight('turret', 'volley');
    waitOut(turret, 4);
    expect(turret.events.some(e => e.type === 'action' && e.command.actor === 'turret'
      && e.command.ability === 'arrow_volley')).toBe(true);
    const bomb = fight('bomb', 'fuse');
    waitOut(bomb, 12);
    expect(bomb.events.some(e => e.type === 'damage' && e.target === 'hero' && e.damageType === 'fire')).toBe(true);
    expect(bomb.state.combatants.find(f => f.id === 'bomb')!.hp).toBe(0);
  });
  it('is set by an author where it stands, and written back as a device', () => {
    const site = `Module m "A guarded hall" { Place hall "the hall" is room.
      Person engine "the engine" at hall { Role "an engine of the makers". Device turret. Level 2. } }`;
    const person = ModuleParser.parse(site).people![0]!;
    expect([person.raceId, person.device]).toEqual(['turret', true]);
    expect(ModuleWriter.write(ModuleParser.parse(site))).toContain('Device turret.');
  });
  it('is kept by the deep sites of a generated country, among their dwellers, by what each site was', async () => {
    const found: string[] = [];
    for (const seed of ['a1', 'b2', 'kite']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const s = await PlaySession.start(w.path, seed, w.source);
      found.push(...s.campaign.readout.creatures.filter(c => Canon.isDevice(c.raceId)).map(c => c.raceId));
    }
    expect(found.length).toBeGreaterThan(0);
    expect(found.every(id => ids.includes(id))).toBe(true);
  }, 240000);
});

import { describe, expect, it } from 'bun:test';
import { Campaign, type CampaignSave } from '../src/campaign/campaign';
import { Modules } from '../src/campaign/modules';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { Agency } from '../src/campaign/agency';
import { Content } from '../src/content';
import { ModuleAssembly, type AdventureManifest } from '../src/campaign/module-assembly';
import situation from '../data/modules/living-crossing.kyr' with { type: 'text' };
import rules from '../data/rulesets/adventure.kyr' with { type: 'text' };

class Adventure {
  static create() { return new Campaign('slice', undefined, Modules.adventure('slice')); }
  static quantity(c: Campaign, entity: string, good: string) {
    return c.world.number(ModuleWriter.call('quantity', entity, good));
  }
  static until(c: Campaign, watch: number) {
    while (c.state.elapsed < watch && c.running) { c.execute('wait(party)'); }
  }
  static conserved(c: Campaign) {
    const money = c.state.creatures.reduce((sum, creature) => sum + creature.state.gold, 0)
      + this.quantity(c, 'market', 'gold');
    expect(money).toBe(4);
    for (const actor of ['party', 'guard', 'carrier']) {
      const members = c.state.inhabitants[actor]!;
      expect(this.quantity(c, actor, 'gold')).toBe(c.state.creatures.filter(creature => members.includes(creature.id))
        .reduce((sum, creature) => sum + creature.state.gold, 0));
    }
    for (const good of ['grain', 'parcel']) {
      const stock = ['consignment', 'parcels', 'granary', 'market']
        .reduce((sum, entity) => sum + this.quantity(c, entity, good), 0);
      const carried = ['party', 'guard', 'carrier'].filter(actor =>
        c.world.test(ModuleWriter.call('carrying', actor, good))).length;
      expect(stock + carried).toBe(1);
    }
  }
  static history(path: 'cooperate' | 'violence' | 'leave' | 'compromise') {
    const c = this.create();
    if (path === 'leave') { c.execute('walk(party,village,refuge)'); }
    else {
      c.execute('travel(party,village,bank)');
      if (path === 'cooperate') {
        for (let i = 0; i < 3; i++) { c.execute('pay(party,guard,bank)'); }
      } else if (path === 'violence') { c.execute('attack(party,guard,bank)'); }
      else { c.execute('give_food(party,guard,bank)'); }
    }
    this.conserved(c);
    this.until(c, 11);
    this.conserved(c);
    return c;
  }
}

describe('persistent playable adventure', () => {
  it('generates one structured adventure and its canonical inhabitants deterministically', () => {
    const a = Adventure.create(), b = Adventure.create();
    expect(a.save()).toEqual(b.save());
    expect(a.state.creatures.map(c => [c.id, c.raceId, c.classId])).toEqual([
      ['hero-1', 'human', 'fighter'], ['guard', 'goblin', 'commoner'], ['carrier', 'human', 'commoner'],
    ]);
    expect(a.state.creatures[0]!.base.abilities).toContain('wounding_blow');
    expect(a.module.name).toContain(a.module.entities.find(e => e.id === 'village')!.name);
    const changed = new Campaign('another', undefined, Modules.adventure('another'));
    expect(changed.state.creatures).not.toEqual(a.state.creatures);
    expect(a.available().some(action => action.schema === 'cross')).toBe(false);
    const before = a.save();
    expect(() => a.execute('pay(party,guard,bank)')).toThrow('Unavailable');
    expect(() => a.execute('collect(party,parcels,parcel,road)')).toThrow('Unavailable');
    expect(a.save()).toEqual(before);
  });
  it.each(['cooperate', 'violence', 'leave', 'compromise'] as const)(
    'replays the %s history with conserved resources and persistent consequences', path => {
      const c = Adventure.history(path);
      expect(c.save()).toEqual(Adventure.history(path).save());
      expect(c.state.outcomes?.supplied).toBe(true);
      expect(c.state.outcomes?.carrier_paid).toBe(true);
      expect(c.state.outcomes?.settled).toBe(path === 'cooperate');
      expect(c.state.outcomes?.violence).toBe(path === 'violence');
      expect(c.state.outcomes?.guard_dead).toBe(path === 'violence');
      expect(c.state.outcomes?.deadline_missed).toBe(path === 'leave');
      expect(c.running).toBe(true);
      expect(c.available()).not.toHaveLength(0);
      expect(c.state.outcome).toBe(path === 'leave' ? 'failure' : 'success');
      expect(c.events.flatMap(e => e.npc ?? []).map(n => n.goal)).toContain('wages');
      expect(c.events.flatMap(e => e.npc ?? []).map(n => n.goal)).toContain('provision');
      const sourceGrain = Adventure.quantity(c, 'consignment', 'grain');
      c.execute('wait(party)');
      expect(Adventure.quantity(c, 'consignment', 'grain')).toBe(sourceGrain);
      expect(c.state.creatures).toHaveLength(3);
    }, 20000);
  it('checks the deadline offscreen, permits return and retains late recovery alongside historical failure', () => {
    let c = Adventure.create();
    const ids = c.state.creatures.map(creature => creature.id);
    c.execute('walk(party,village,refuge)');
    Adventure.until(c, 8);
    expect(c.state.outcomes).toMatchObject({ away: true, supplied: false, deadline_missed: true });
    expect(c.world.number(ModuleWriter.call('deficit', 'winter'))).toBe(1);
    const deficit = c.state.developments?.find(d => d.id === 'deadline_missed');
    expect(deficit?.elapsed).toBe(8);
    c = Campaign.restore(JSON.parse(JSON.stringify(c.save())));
    c.execute('walk(party,refuge,village)');
    Adventure.until(c, 11);
    expect(c.state.outcomes).toMatchObject({ away: false, supplied: true, deadline_missed: true, settled: false });
    expect(c.state.creatures.map(creature => creature.id)).toEqual(ids);
    expect(c.world.number(ModuleWriter.call('deficit', 'winter'))).toBe(1);
    expect(c.state.developments?.find(d => d.id === 'supplied')?.elapsed).toBe(11);
  });
  it('changes NPC priorities and replans when an unexpected player delivery removes the urgent goal', () => {
    const manifest = new Content('independent').generate('adventure', { urgentAt: 1 }) as unknown as AdventureManifest;
    const instance = ModuleAssembly.compose(situation, rules, manifest, 'independent');
    const c = new Campaign('independent', undefined, instance);
    const carrier = instance.campaign!.actors.find(a => a.id === 'carrier')!;
    const open = c.world.apply([
      { kind: 'assert', call: ModuleWriter.call('released', 'guard') },
      { kind: 'set', call: ModuleWriter.call('watch', 'clock'), value: ModuleWriter.number(1) },
    ]);
    const urgent = Agency.choose(open, carrier, c.module.actions)!;
    expect(urgent.goal).toBe('provision');
    expect(urgent.action.schema).toBe('collect');
    expect(urgent.action.bindings?.goods).toBe('grain');
    const delivered = open.apply([
      { kind: 'set', call: ModuleWriter.call('quantity', 'granary', 'grain'), value: ModuleWriter.number(1) },
      { kind: 'set', call: ModuleWriter.call('quantity', 'consignment', 'grain'), value: ModuleWriter.number(0) },
    ]);
    expect(Agency.choose(delivered, carrier, c.module.actions)?.goal).toBe('wages');
    expect(open.test(ModuleWriter.call('supplied'))).toBe(false);
  });
  it('retains language-inflicted wounds and conditions through retreat, travel, save and revisit', () => {
    let c = Adventure.create();
    c.execute('travel(party,village,bank)');
    const original = c.state.creatures.find(creature => creature.id === 'guard')!;
    const event = c.execute('attack(party,guard,bank)', battle => {
      expect(() => c.save()).toThrow('between campaign commands');
      while (battle.state.actor !== 'hero-1' && !battle.state.outcome) {
        battle.step(battle.legalCommands().find(command => command.ability === 'defend')!);
      }
      battle.step({ actor: 'hero-1', ability: 'wounding_blow', target: 'guard' });
      battle.close();
    });
    expect(event.result).toBe('failure');
    const injured = c.state.creatures.find(creature => creature.id === 'guard')!;
    expect(injured.state.hp).toBeGreaterThan(0);
    expect(injured.state.hp).toBeLessThan(original.state.hp);
    expect(injured.state.conditions).toContainEqual({ id: 'weakened', remaining: 2 });
    c.execute('travel(party,bank,village)');
    c.execute('walk(party,village,refuge)');
    const saved = JSON.parse(JSON.stringify(c.save())) as CampaignSave;
    c = Campaign.restore(saved);
    c.execute('walk(party,refuge,village)');
    c.execute('travel(party,village,bank)');
    expect(c.state.creatures.find(creature => creature.id === 'guard')).toEqual(injured);
    const next = c.encounterBattle('attack(party,guard,bank)');
    expect(next.state.combatants.find(f => f.id === 'guard')!.hp).toBe(injured.state.hp);
    expect(next.state.combatants.find(f => f.id === 'guard')!.statuses[0]!.id).toBe('weakened');
    expect(() => c.save()).toThrow('between campaign commands');
    next.close();
    const forged = structuredClone(saved);
    forged.creatures.find(creature => creature.id === 'hero-1')!.state.gold++;
    expect(() => Campaign.restore(forged)).toThrow('Inconsistent saved creature facts');
  });
  it('resumes the same command history without regenerating inhabitants or repeating initial resources', () => {
    const uninterrupted = Adventure.create();
    uninterrupted.execute('travel(party,village,bank)');
    uninterrupted.execute('give_food(party,guard,bank)');
    const resumed = Campaign.restore(JSON.parse(JSON.stringify(uninterrupted.save())));
    Adventure.until(uninterrupted, 11); Adventure.until(resumed, 11);
    expect(resumed.save()).toEqual(uninterrupted.save());
    expect(Adventure.quantity(resumed, 'party', 'rations')).toBe(0);
    expect(Adventure.quantity(resumed, 'guard', 'rations')).toBe(0);
    expect(resumed.world.test(ModuleWriter.call('sated', 'guard'))).toBe(true);
  });
});

describe('typed reusable action schemas', () => {
  it('roundtrips author source, grounds parameters and checks parameter types', () => {
    const source = `Module demo "Demo" {
      Kind group. Kind place. Relation at(group, place) exclusive.
      Entity party: group "Party". Entity village: place "Village". Entity bank: place "Bank".
      Initially Assert at(party, village). Goal at(party, bank).
      Action travel(actor: group, origin: place, destination: place) "Travel" {
        Requires at(actor, origin). On success { Assert at(actor, destination). }
      }
    }`;
    const parsed = ModuleParser.parse(source);
    expect(ModuleParser.parse(ModuleWriter.write(parsed))).toEqual(parsed);
    const instance = new ModuleCompiler().instantiate(parsed, 'bindings');
    const grounded = ActionSchemas.ground(instance.module);
    expect(grounded).toHaveLength(4);
    expect(grounded.find(a => a.id === 'travel(party,village,bank)')!.success[0]!.call.args)
      .toEqual(['party', 'bank']);
    expect(() => new ModuleCompiler().validate(ModuleParser.parse(source.replace('actor: group', 'actor: place'))))
      .toThrow('Invalid argument');
    expect(() => new ModuleCompiler().validate(ModuleParser.parse(source.replace('actor: group', 'party: group'))))
      .toThrow('shadows entity');
  });
  it('lets NPCs take multi-watch actions but rejects writes to campaign-owned records', () => {
    const manifest = new Content('validation').generate('adventure') as unknown as AdventureManifest;
    const slower = rules.replace('"Travel to {destination}" {', '"Travel to {destination}" { Time 2.');
    expect(() => ModuleAssembly.compose(situation, slower, manifest, 'validation')).not.toThrow();
    const altered = rules.replace('Requires able(actor). Time 1.',
      'Requires able(actor). Time 1. On success { Set watch(clock) to 10. }');
    expect(() => ModuleAssembly.compose(situation, altered, manifest, 'validation')).toThrow('read-only');
  });
});

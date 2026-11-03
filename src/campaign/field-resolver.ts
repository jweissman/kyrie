import type { Operator } from './planner';
import { Canon } from '../canon/canon';
import type { CampaignActor } from './definition';
import type { CreatureStore } from '../creature-store';
import type { Call, Module } from '../lang/module';
import type { World } from '../lang/world';
import type { CombatEvent } from '../model';
import { FieldUse } from './field-use';
import { Items } from './items';
import { Environment } from './environment';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Checks } from '../rules/checks';

interface FieldHost {
  module: Module; creatures: CreatureStore; actors: CampaignActor[]; world: World; seed: string;
  // A check made to come out so, for a test (see Checks.make).
  forced?: 'pass' | 'fail';
}
// What a resolved command does to the company itself, outside a fight: rest and recovery, rewards and study, a
// spell cast in the field, and what is bought, taken, blessed, used, risked, given or set down.
export class FieldResolver {
  static resolve(action: Operator, host: FieldHost): CombatEvent[] {
    const call = structuredClone(action.resolve!), { creatures, seed } = host;
    call.args = call.args.map(id => host.module.entities.find(e => e.id === id)?.creatureId ?? id);
    if (call.name === 'recover' || call.name === 'rough') {
      const actor = host.actors.find(a => a.id === call.args[0])!;
      // Whoever can still tend the others: up, and not dead.
      const caster = actor.members.find(id => creatures.get(id).state.hp > 0
        && !creatures.get(id).state.conditions.some(s => s.id === Canon.rules.combat.ids.slain))!;
      const { roughRest, shelteredRest } = Canon.rules.combat.ids;
      const rested = FieldUse.perform(creatures, actor.members, { ability: call.name === 'rough' ? roughRest
        : shelteredRest, caster, target: caster, seed, service: 'recover' });
      // Whoever has fallen comes round, or does not; a night under a roof is also when a companion takes in what
      // they have learned.
      const shocked = [...rested, ...FieldUse.shock(creatures, actor.members, seed)];
      return call.name === 'recover' ? [...shocked, ...FieldUse.train(creatures, actor.members, seed)] : shocked;
    }
    if (call.name === 'raise') { return FieldUse.raise(creatures, call.args[0]!); }
    if (call.name === 'reward') {
      return FieldUse.perform(creatures, [call.args[1]!], { ability: call.args[0]!, caster: call.args[1]!,
        target: call.args[1]!, seed, service: 'reward' });
    }
    if (['prepare', 'improve', 'endow', 'learn', 'feat', 'school'].includes(call.name)) {
      return FieldUse.study(creatures, call.name, call.args);
    }
    if (call.name === 'invoke') {
      return FieldUse.perform(creatures, [call.args[1]!, call.args[2]!],
        { ability: call.args[0]!, caster: call.args[1]!, target: call.args[2]!, seed });
    }
    if (call.name === 'purchase') { this.purchase(call, host); return this.take(call, host); }
    if (call.name === 'acquire') { return this.take(call, host); }
    if (call.name === 'rummage') {
      const actor = host.actors.find(a => a.id === call.args[0]);
      const environment = actor && Environment.of(host.world, actor.id);
      return actor ? Items.rummage(creatures, actor.members, { seed: `${seed}:rummage`, ...environment ? { at: { environment } } : {} }) : [];
    }
    return this.items(action, call, host);
  }
  private static items(action: Operator, call: Call, host: FieldHost): CombatEvent[] {
    const { creatures, seed } = host, label = ObservationText.label(host.world, call.args[0]!);
    if (call.name === 'bless') { return Items.bless(creatures,
      { source: call.args[0]!, faith: call.args[1]!, target: call.args[2]!, seed, name: label }); }
    if (call.name === 'equip') { return Items.equip(creatures, call.args[1]!, call.args[0]!); }
    if (call.name === 'consume') { return Items.consume(creatures,
      { owner: call.args[1]!, target: call.args[2]!, id: call.args[0]!, seed }); }
    if (call.name === 'expose') {
      const source = action.schema === 'risk' ? action.bindings?.trap ?? action.id : action.id;
      return Items.expose(creatures, { target: call.args[1]!, ability: call.args[0]!, entities: host.module.entities,
        source, seed });
    }
    if (call.name === 'train') { return Items.train(creatures, call.args[1]!, call.args[0]!); }
    if (call.name === 'transfer_item') {
      return Items.transfer(creatures, { id: call.args[0]!, label }, call.args[1]!, call.args[2]!);
    }
    if (call.name === 'drop') { return Items.drop(creatures, call.args[1]!, call.args[0]!); }
    if (call.name === 'douse') { return Items.douse(creatures, call.args[0]!); }
    if (call.name === 'realize') { return this.realize(call, host); }
    if (call.name === 'check') {
      const members = host.actors.find(a => a.id === call.args[0])?.members ?? [];
      return Checks.make(creatures.snapshot.filter(c => members.includes(c.id)),
        { skill: call.args[1]!, difficulty: call.args[2]!, seed, about: action.id, forced: host.forced });
    }
    throw new Error(`Unsupported resolver ${call.name}`);
  }
  // A treasure handed over: coin, and no more (experience is for finding it: see take). A sale had paid coin and
  // experience at once, so one delve made money meaningless (the cold review of 1 November).
  private static realize(call: Call, host: FieldHost): CombatEvent[] {
    const [item, carrier] = call.args as [string, string, string];
    return Items.drop(host.creatures, carrier, item);
  }
  // The buyer's members pay the price between them, and the seller is paid it.
  private static purchase(call: Call, host: FieldHost) {
    const buyer = host.actors.find(a => a.id === call.args[3])!;
    const price = host.world.number(ModuleWriter.call('price', call.args[0]!));
    const seller = host.actors.find(a => a.id === call.args[4])!;
    if (!seller || seller.id === buyer.id) { throw new Error('Purchase needs a distinct merchant'); }
    const lease = host.creatures.acquire([...buyer.members, seller.members[0]!]);
    try {
      let due = price;
      for (const c of lease.creatures.filter(c => buyer.members.includes(c.id))) {
        const paid = Math.min(due, c.state.gold); c.state.gold -= paid; due -= paid;
      }
      if (due || price < 0) { throw new Error('Insufficient currency or invalid item price'); }
      lease.creatures.find(c => c.id === seller.members[0])!.state.gold += price;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
  // Something taken up; a treasure, the first time, is a quarter of its worth in experience for each of the company
  // (finding is the deed; selling is only coin).
  private static take(call: Call, host: FieldHost): CombatEvent[] {
    const [id, definition, owner] = call.args as [string, string, string], world = host.world;
    const label = ObservationText.label(world, id);
    const events = Items.take(host.creatures, owner, { id, definition, label });
    const found = world.relates('valuable') && world.test(ModuleWriter.call('valuable', definition))
      && !(world.relates('recovered') && world.test(ModuleWriter.call('recovered', id)));
    if (!found) { return events; }
    const worth = world.number(ModuleWriter.call('worth', definition)), from = events.length;
    FieldUse.grant(host.creatures, host.actors.find(a => a.members.includes(owner))?.members ?? [owner],
      Math.floor(worth / 4), events);
    for (const e of events.slice(from)) { if (e.type === 'gain') { e.detail = `experience: found ${label}`; } }
    return events;
  }
}

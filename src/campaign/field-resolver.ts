import type { Operator } from './planner';
import type { CampaignActor } from './definition';
import type { CreatureStore } from '../creature-store';
import type { Call, Module } from '../lang/module';
import type { World } from '../lang/world';
import type { CombatEvent } from '../model';
import { FieldUse } from './field-use';
import { Items } from './items';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';

interface FieldHost { module: Module; creatures: CreatureStore; actors: CampaignActor[]; world: World; seed: string }
// What a resolved command does to the company itself, outside a fight: rest and recovery, rewards and study, a
// spell cast in the field, and what is bought, taken, blessed, used, risked, given or set down.
export class FieldResolver {
  static resolve(action: Operator, host: FieldHost): CombatEvent[] {
    const call = structuredClone(action.resolve!), { creatures, seed } = host;
    call.args = call.args.map(id => host.module.entities.find(e => e.id === id)?.creatureId ?? id);
    if (call.name === 'recover' || call.name === 'rough') {
      const actor = host.actors.find(a => a.id === call.args[0])!;
      const caster = actor.members.find(id => creatures.get(id).state.hp > 0)!;
      const rested = FieldUse.perform(creatures, actor.members, { ability: call.name === 'rough' ? 'rough_rest'
        : 'camp_recovery', caster, target: caster, seed, service: 'recover' });
      // A night under a roof is also when a companion takes in what they have learned.
      return call.name === 'recover' ? [...rested, ...FieldUse.train(creatures, actor.members, seed)] : rested;
    }
    if (call.name === 'reward') {
      return FieldUse.perform(creatures, [call.args[1]!], { ability: call.args[0]!, caster: call.args[1]!,
        target: call.args[1]!, seed, service: 'reward' });
    }
    if (['prepare', 'improve', 'learn'].includes(call.name)) { return FieldUse.study(creatures, call.name, call.args); }
    if (call.name === 'invoke') {
      return FieldUse.perform(creatures, [call.args[1]!, call.args[2]!],
        { ability: call.args[0]!, caster: call.args[1]!, target: call.args[2]!, seed });
    }
    if (call.name === 'purchase') { this.purchase(call, host); return this.take(call, host); }
    if (call.name === 'acquire') { return this.take(call, host); }
    return this.items(action, call, host);
  }
  private static items(action: Operator, call: Call, host: FieldHost): CombatEvent[] {
    const { creatures, seed } = host, label = ObservationText.label(host.world, call.args[0]!);
    if (call.name === 'bless') { return Items.bless(creatures,
      { source: call.args[0]!, deity: call.args[1]!, target: call.args[2]!, seed }); }
    if (call.name === 'equip') { return Items.equip(creatures, call.args[1]!, call.args[0]!, label); }
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
    if (call.name === 'drop') { return Items.drop(creatures, call.args[1]!, call.args[0]!, label); }
    throw new Error(`Unsupported resolver ${call.name}`);
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
  private static take(call: Call, host: FieldHost): CombatEvent[] {
    const [id, definition, owner] = call.args as [string, string, string];
    return Items.take(host.creatures, owner, { id, definition, label: ObservationText.label(host.world, id) });
  }
}

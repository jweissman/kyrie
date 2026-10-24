import type { Campaign } from '../campaign/campaign';
import type { Operator, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { PartyCapabilities } from '../campaign/party-capabilities';
import { ActionPresentation, type PublicChoice } from './action-presentation';
import { ItemNames } from '../item-names';
import { Canon } from '../canon/canon';

// A choice the company could make with a skill it lacks: the skill, and anything else that would do instead (a crowbar,
// for brawn), which it has not got either.
export interface Wanting {
  choice: PublicChoice; action: Operator; skill: string; name: string; or: string[];
  // A kind of thing rather than a skill: "a ten-foot pole", which nobody in the company is carrying.
  thing?: boolean;
}
interface Call { kind: 'call'; name: string; args: string[] }
// How the company's skills bear on what it can do here: which skill each choice relies on (and so who does it),
// and what the company could do if anyone in it had a skill it lacks, read from the same legal commands in a world
// that differs by that one skill. Nothing is assumed about any particular skill or place.
export class SkillReading {
  static readonly cache = new WeakMap<Campaign, { key: string; uses: Map<string, string[]>; wanting: Wanting[] }>();
  // The skills a schema names outright (capable(actor, lore)), and the schemas that ask for whatever a thing or a
  // way needs (equippedFor, meets): a change that needs lockwork, a way that needs climbing.
  private static calls(p: Predicate | undefined, out: Call[] = []): Call[] {
    if (!p) { return out; }
    const node = p as unknown as { kind: string; name?: string; args?: string[]; left?: Predicate; right?: Predicate;
      value?: Predicate };
    if (node.kind === 'call' && node.name) { out.push(node as Call); }
    if (node.kind === 'and' || node.kind === 'or') { this.calls(node.left, out); this.calls(node.right, out); }
    if (node.kind === 'not') { this.calls(node.value, out); }
    return out;
  }
  private static shape(campaign: Campaign) {
    const named = new Map<string, Set<string>>(), needing = new Set<string>();
    for (const a of campaign.module.actions) {
      const params = new Set((a.parameters ?? []).map(p => p.name));
      for (const c of this.calls(a.requires)) {
        if (c.name === 'capable' && c.args[1] && !params.has(c.args[1])) {
          (named.get(c.args[1]) ?? named.set(c.args[1], new Set()).get(c.args[1])!).add(a.id);
        }
        if (['equippedFor', 'meets'].includes(c.name) && a.id !== 'go') { needing.add(a.id); }
      }
    }
    return { named, needing };
  }
  private static has(campaign: Campaign, actor: string, skill: string): boolean {
    return campaign.world.test(ModuleWriter.call('capable', actor, skill));
  }
  // The things at the company's place, the ways out of it and what is on or guards them, and their changes.
  private static near(campaign: Campaign, actor: string): Set<string> {
    const rel = campaign.world.view.relations, here = campaign.world.one('at', actor);
    const ways = new Set(rel.filter(r => r.name === 'connects' && r.args[1] === here).map(r => r.args[0]!));
    const things = new Set([...rel.filter(r => r.name === 'at' && r.args[1] === here).map(r => r.args[0]!),
      ...rel.filter(r => (r.name === 'on' || r.name === 'guards') && ways.has(r.args[1]!)).map(r => r.args[0]!)]);
    const changes = rel.filter(r => r.name === 'changeOf' && things.has(r.args[1]!)).map(r => r.args[0]!);
    return new Set([...ways, ...things, ...changes]);
  }
  static read(campaign: Campaign): { uses: Map<string, string[]>; wanting: Wanting[] } {
    const world = campaign.world, actor = campaign.playerActor;
    const key = world.key(), hit = this.cache.get(campaign);
    if (hit?.key === key) { return hit; }
    const uses = new Map<string, string[]>(), wanting: Wanting[] = [];
    if (!actor) { return { uses, wanting }; }
    const { named, needing } = this.shape(campaign);
    const live = campaign.readout, creatures = live.creatures.filter(c => live.partyIds.includes(c.id));
    const needs = world.related('needs');
    // Who does a skilled choice: the providers of the skill it names, or of what its thing or way needs.
    for (const op of campaign.offered()) {
      const schema = op.schema ?? op.id, bound = Object.values(op.bindings ?? {});
      const skills = [...[...named].filter(([, ids]) => ids.has(schema)).map(([skill]) => skill),
        ...(needing.has(schema) || schema === 'go'
          ? needs.filter(r => bound.includes(r.args[0]!)).map(r => r.args[1]!) : [])]
        .filter(s => this.has(campaign, actor, s));
      const by = [...new Set(skills.flatMap(s => PartyCapabilities.providers(s, creatures).map(c => c.name)))];
      if (by.length) { uses.set(op.id, by); }
    }
    // What a skill nobody has would open here: the schemas that could ask for it, in a world where the company has it.
    // Only needs of what is near the company count: the things here, the ways out, and what stands on them.
    const legal = new Set(campaign.offered().map(a => a.id)), near = this.near(campaign, actor);
    const nearNeeds = needs.filter(r => near.has(r.args[0]!));
    const lacking = [...campaign.module.entities.filter(e => e.type === 'capability' && !this.has(campaign, actor, e.id))
      .map(skill => ({ skill, only: new Set([...named.get(skill.id) ?? [],
        ...nearNeeds.some(r => r.args[1] === skill.id) ? needing : []]) })), ...this.things(campaign, actor, nearNeeds)
      .map(skill => ({ skill, only: needing }))].filter(l => l.only.size);
    if (!lacking.length) { return this.keep(campaign, { key, uses, wanting }); }
    // Grounded once, as if the company had every skill it lacks; each choice that opens is kept for the one skill
    // that opens it alone.
    const all = world.apply(lacking.map(l => ({ kind: 'assert' as const,
      call: ModuleWriter.call('capable', actor, l.skill.id) })));
    const gained = campaign.operators.applicable(all, actor, new Set(lacking.flatMap(l => [...l.only])))
      .filter(op => !legal.has(op.id));
    for (const { skill, only } of lacking) {
      const one = world.apply([{ kind: 'assert', call: ModuleWriter.call('capable', actor, skill.id) }]);
      const opened = gained.filter(op => only.has(op.schema ?? op.id) && one.test(op.requires)
        && one.admits(op.success));
      for (const row of ActionPresentation.choices(opened, campaign.schemas)) {
        const or = this.instead(campaign, row.action, needs).filter(n => n !== skill.name);
        wanting.push({ ...row, skill: skill.id, name: skill.name, or, ...'thing' in skill ? { thing: true } : {} });
      }
    }
    return this.keep(campaign, { key, uses, wanting });
  }
  // The kinds of thing what is here needs that nobody in the company is carrying, as one of each (a ten-foot pole).
  private static things(campaign: Campaign, actor: string, near: readonly { args: readonly string[] }[]) {
    const skills = new Set(campaign.module.entities.filter(e => e.type === 'capability').map(e => e.id));
    return [...new Set(near.map(r => r.args[1]!))].filter(k => !skills.has(k)
      && !campaign.world.test(ModuleWriter.call('meets', actor, k)))
      .map(k => ({ id: k, name: this.called(campaign, k), thing: true }));
  }
  private static called(campaign: Campaign, k: string): string {
    return ItemNames.called(Canon.items[k]?.name ?? campaign.module.entities.find(e => e.id === k)?.name
      ?? k.replace(/_/g, ' '));
  }
  // What else a choice's thing or way would take, besides a skill: the kinds of thing that would do.
  private static instead(campaign: Campaign, action: Operator,
    needs: readonly { args: readonly string[] }[]): string[] {
    const bound = Object.values(action.bindings ?? {}), entities = campaign.module.entities;
    const skills = new Set(entities.filter(e => e.type === 'capability').map(e => e.id));
    return [...new Set(needs.filter(r => bound.includes(r.args[0]!) && !skills.has(r.args[1]!)).map(r => r.args[1]!))]
      .map(k => this.called(campaign, k));
  }
  private static keep(campaign: Campaign, read: { key: string; uses: Map<string, string[]>; wanting: Wanting[] }) {
    this.cache.set(campaign, read);
    return read;
  }
}

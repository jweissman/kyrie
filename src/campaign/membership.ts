import type { CreatureStore } from '../creature-store';
import { ModuleWriter } from '../lang/module-writer';
import type { Module } from '../lang/module';
import type { World } from '../lang/world';
import type { CampaignActor } from './definition';

export interface LiveCache { base: CampaignActor[]; key: string; actors: CampaignActor[] }
interface Current { partyIds: string[]; inhabitants: Record<string, string[]>; enlisted?: Record<string, string>;
  released?: string[]; purses?: Record<string, number> }

// Who is in each group as play goes on. A campaign's actors are fixed when it loads; someone who joins the company
// moves their creatures into it, and their own group is left empty. Until anyone joins, the actors are the
// definition's own, so nothing that caches on them is disturbed.
export class Membership {
  static live(base: CampaignActor[], current: Current,
    cache?: LiveCache): { actors: CampaignActor[]; cache?: LiveCache } {
    const enlisted = current.enlisted ?? {};
    if (!Object.keys(enlisted).length && !current.released?.length) { return { actors: base }; }
    const key = current.partyIds.join();
    if (cache?.base === base && cache.key === key) { return { actors: cache.actors, cache }; }
    const actors = base.map(a => a.player ? { ...a, members: [...current.partyIds] }
      : enlisted[a.id] ? { ...a, members: [] } : a);
    return { actors, cache: { base, key, actors } };
  }
  // What a command that changes the company resolves to: someone joins it (enlist), or one laid to rest leaves it
  // (inter).
  static resolves(resolve: { name: string }): boolean { return resolve.name === 'enlist' || resolve.name === 'inter'; }
  static resolve(at: Parameters<typeof Membership.enlist>[0], resolve: { name: string; args: string[] }): World {
    return resolve.name === 'enlist' ? this.enlist(at, resolve.args[0]!, resolve.args[1]!)
      : this.release(at, resolve.args[0]!);
  }
  // Someone joins the company: their creatures are the company's from now on, and no longer their group's members.
  // What they had of their own stays theirs, not the company's to spend (the company's coin is its members' purses
  // together: The Road the Star Came Down's silver went from 60 to 66 on hiring Teshen for 2): it is put by (purses)
  // while they are with the company, and is theirs again when they leave it (it was simply gone: the architecture
  // review's A22).
  static enlist(at: { current: Current; company?: string; module: Module; world: World; creatures?: CreatureStore },
    recruit: string, company: string): World {
    const { current } = at, members = current.inhabitants[recruit] ?? [];
    if (!members.length || company !== at.company) { throw new Error(`${recruit} cannot join ${company}`); }
    const lease = at.creatures?.acquire(members);
    try {
      for (const c of lease?.creatures.filter(x => x.state.gold > 0) ?? []) {
        current.purses = { ...current.purses, [c.id]: (current.purses?.[c.id] ?? 0) + c.state.gold };
        c.state.gold = 0;
      }
      lease?.commit(lease.creatures);
    } finally { lease?.release(); }
    current.partyIds.push(...members);
    current.inhabitants[company] = [...current.partyIds];
    current.inhabitants[recruit] = [];
    current.enlisted = { ...current.enlisted, [recruit]: company };
    // Their creatures are no longer their group's members; who they now are among the company's is kept.
    const references = members.flatMap(id => at.module.entities.filter(e => e.creatureId === id).map(e => e.id));
    return at.world.apply(references.flatMap(r => [
      { kind: 'retract' as const, call: ModuleWriter.call('memberOf', r, recruit) },
      { kind: 'assert' as const, call: ModuleWriter.call('joinedAs', r, recruit) }]));
  }
  // Someone who joined the company and no longer travels with it (an author's rule sends them home; the company lets
  // them stay behind) leaves it: their bodies are their own group's again, as before they joined, and they are where
  // they were sent, or where the company is (the audit's F4: they stayed in the company). One laid to rest (inter) has
  // left already.
  static depart(at: { current: Current; company: string | undefined; module: Module; world: World;
    creatures?: CreatureStore }): World | undefined {
    const { current, company, module } = at;
    let world = at.world;
    if (!company) { return undefined; }
    const gone = Object.keys(current.enlisted ?? {}).filter(r => current.enlisted![r] === company
      && !world.test(ModuleWriter.call('travelsWith', r, company)));
    if (!gone.length) { return undefined; }
    for (const recruit of gone) {
      const refs = world.related('joinedAs').filter(f => f.args[1] === recruit).map(f => f.args[0]!);
      const bodies = refs.map(r => module.entities.find(e => e.id === r)?.creatureId)
        .filter((id): id is string => !!id && current.partyIds.includes(id));
      if (!bodies.length) { continue; }
      current.partyIds = current.partyIds.filter(id => !bodies.includes(id));
      current.inhabitants[company] = [...current.partyIds];
      current.inhabitants[recruit] = bodies;
      current.enlisted = Object.fromEntries(Object.entries(current.enlisted!).filter(([r]) => r !== recruit));
      Membership.repay(current, bodies, at.creatures);
      const here = world.one('at', recruit) ? undefined : world.one('at', company);
      world = world.apply([...refs.flatMap(r => [{ kind: 'retract' as const, call: ModuleWriter.call('joinedAs', r, recruit) },
        { kind: 'retract' as const, call: ModuleWriter.call('memberOf', r, company) },
        { kind: 'assert' as const, call: ModuleWriter.call('memberOf', r, recruit) }]),
        ...here ? [{ kind: 'assert' as const, call: ModuleWriter.call('at', recruit, here) }] : []]);
    }
    return world;
  }
  // What each who leaves had put by when they joined is theirs again.
  private static repay(current: Current, bodies: string[], creatures?: CreatureStore) {
    const owed = bodies.filter(id => current.purses?.[id]);
    if (!owed.length || !creatures) { return; }
    const lease = creatures.acquire(owed);
    try {
      for (const c of lease.creatures) { c.state.gold += current.purses![c.id]!; delete current.purses![c.id]; }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    if (!Object.keys(current.purses!).length) { delete current.purses; }
  }
  // A companion laid to rest leaves the company for good: they are no longer one of its members.
  static release(at: { current: Current; company?: string; module: Module; world: World }, reference: string): World {
    const { current } = at, member = at.module.entities.find(e => e.id === reference)?.creatureId;
    if (!member || !at.company || !current.partyIds.includes(member)) { throw new Error(`${reference} is not in the company`); }
    current.partyIds = current.partyIds.filter(id => id !== member);
    current.inhabitants[at.company] = [...current.partyIds];
    current.released = [...current.released ?? [], member];
    return at.world.apply(['memberOf', 'fallen', 'awake', 'needsCare'].map(name => ({ kind: 'retract' as const,
      call: name === 'memberOf' ? ModuleWriter.call(name, reference, at.company!) : ModuleWriter.call(name, reference) })));
  }
}

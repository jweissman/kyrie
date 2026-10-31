import { LocalObservations } from './local-observations';
import { ObservationText } from '../lang/observation-text';
import { ModuleWriter } from '../lang/module-writer';
import type { Module } from '../lang/module';
import type { World } from '../lang/world';
import type { CampaignEvent } from './campaign-types';
import { CampaignTick, type Happening, type TickHost } from './campaign-tick';

// What the player's company perceives after a command: what happened near it, what its place is now like, and
// what it learned by this command (a fact already known is not discovered again).
export class Perceptions {
  // Seeing is knowing: each perceived observation that teaches a fact the company did not know is committed as known
  // and witnessed, and told as a discovery; what a reading teaches is known as read, the writing's account of it.
  static witness(module: Module, world: World, player: string | undefined, seen: CampaignEvent['perceptions']) {
    if (!player || !seen) { return { changes: [], told: [], noted: [] }; }
    // One near a variable is seen as an instance (glow@iron_lamp): it teaches what its declaration does (audit, F5).
    const ids = new Set(seen.filter(p => p.kind === 'observation').map(p => p.id.split('@')[0]!));
    const heard = new Set(seen.filter(p => p.kind === 'event').map(p => p.id.split('@')[0]!));
    const teaching = [...(module.observations ?? []).filter(o => o.teaches && ids.has(o.id)),
      ...(module.rules ?? []).filter(r => r.teaches && heard.has(r.id))]
      .filter(o => !world.test(ModuleWriter.call('knows', player, o.teaches!)));
    const facts = [...new Set(teaching.map(o => o.teaches!))];
    const read = new Set(module.relations.some(r => r.name === 'readIn')
      ? teaching.filter(o => 'aspect' in o && o.aspect === 'reading').map(o => o.teaches!) : []);
    // Talk overheard where someone keeps travellers (the brothers gone up the hill) is heard there, not seen.
    const overheard = new Map(module.relations.some(r => r.name === 'toldBy') ? teaching.filter(o => 'aspect' in o
      && o.aspect === 'hearsay' && 'place' in o).map(o => [o.teaches!, (o as { place: string }).place]) : []);
    return { changes: facts.flatMap(f => [{ kind: 'assert' as const, call: ModuleWriter.call('knows', player, f) },
      overheard.has(f) ? { kind: 'assert' as const, call: ModuleWriter.call('toldBy', player, overheard.get(f)!, f) }
        : { kind: 'assert' as const, call: ModuleWriter.call(read.has(f) ? 'readIn' : 'witnessed', player, f) }]),
    told: facts.map(f => ({ id: f, kind: 'discovery' as const,
      text: ObservationText.render(module.entities.find(e => e.id === f)!.name, world) })),
    // How the event's changes record it, so the journal can say when it was seen.
    noted: facts.map(f => `+ knows(${player}, ${f})`) };
  }
  // What the company perceives after a command, and learns by it, settled: what it learns may show it more (once
  // the cart is found, the brother kneeling by it), and the world's rules answer it (a conclusion drawn from what was
  // read, an ending on that: see CampaignTick.answer); all that is seen, learned and answered in the same moment, a few
  // times over at most. Each thing perceived is told once; what is learned, and what the rules then do, is committed
  // to the host, and noted among the command's changes; answered says whether the rules did anything.
  static settle(host: TickHost, seen: { before: World; after: World; happenings: Happening[] }):
    { perceptions: CampaignEvent['perceptions']; noted: string[]; answered: boolean } {
    const module = host.module, player = host.playerActor;
    let world = seen.after, perceived = this.after(module, { ...seen, player }), answered = false;
    const all = [...perceived ?? []], noted: string[] = [];
    for (let pass = 0; perceived && pass < 3; pass++) {
      const learned = this.witness(module, world, player, perceived);
      if (!learned.changes.length) { break; }
      const since = host.world;
      host.commitWorld(since.apply(learned.changes));
      noted.push(...learned.noted);
      all.push(...learned.told);
      const known = host.world, said = CampaignTick.answer(host, since);
      if (host.world !== known) { answered = true; host.refreshProjection(); noted.push(...host.world.changes(known)); }
      world = host.world;
      perceived = this.after(module, { ...seen, player, after: world, happenings: said });
      all.push(...(perceived ?? []).filter(p => !all.some(a => a.kind === p.kind && a.id === p.id)));
    }
    // What is learned is told as the company knows it at the end of the moment: word of the hobs' hold, with the
    // name the same word gave the place, not what it looks like to a stranger (see KitWord).
    const told = all.map(p => p.kind === 'discovery'
      ? { ...p, text: ObservationText.render(module.entities.find(e => e.id === p.id)!.name, world) } : p);
    return { perceptions: told.length || perceived ? told.filter((p, i) => told.findIndex(a => a.kind === p.kind
      && a.id === p.id) === i) : undefined, noted, answered };
  }
  static after(module: Module, seen: { before: World; after: World; player: string | undefined;
    happenings: Happening[] }): CampaignEvent['perceptions'] {
    const { before, after, player, happenings } = seen;
    if (!player || !(module.observations?.length || happenings.length)
      || !after.test(ModuleWriter.call('able', player))) { return undefined; }
    // In the dark without a light, what a place looks like goes unseen (and what it would teach, unlearned).
    const dark = module.queries.some(q => q.name === 'benighted') && after.test(ModuleWriter.call('benighted', player));
    return [...happenings,
      ...dark ? [] : LocalObservations.read(after, player).map(o => ({ ...o, kind: 'observation' as const })),
      ...after.related('knows', player).filter(r =>
         !before.test(ModuleWriter.call('knows', player, r.args[1]!))).map(r => ({
        id: r.args[1]!, text: ObservationText.render(module.entities.find(e => e.id === r.args[1])!.name, after),
        kind: 'discovery' as const }))];
  }
}

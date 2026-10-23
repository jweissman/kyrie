import { LocalObservations } from '../presentation/local-observations';
import { ObservationText } from '../lang/observation-text';
import { ModuleWriter } from '../lang/module-writer';
import type { Change, Module } from '../lang/module';
import type { World } from '../lang/world';
import type { CampaignEvent } from './campaign-types';

// What the player's company perceives after a command: what happened near it, what its place is now like, and
// what it learned by this command (a fact already known is not discovered again).
export class Perceptions {
  // Seeing is knowing: each perceived observation that teaches a fact the company did not know is committed as known
  // and witnessed, and told as a discovery.
  static witness(module: Module, world: World, player: string | undefined, seen: CampaignEvent['perceptions']) {
    if (!player || !seen) { return { changes: [], told: [], noted: [] }; }
    const ids = new Set(seen.filter(p => p.kind === 'observation').map(p => p.id));
    const facts = [...new Set((module.observations ?? []).filter(o => o.teaches && ids.has(o.id)
      && !world.test(ModuleWriter.call('knows', player, o.teaches))).map(o => o.teaches!))];
    return { changes: facts.flatMap(f => [{ kind: 'assert' as const, call: ModuleWriter.call('knows', player, f) },
      { kind: 'assert' as const, call: ModuleWriter.call('witnessed', player, f) }]),
    told: facts.map(f => ({ id: f, kind: 'discovery' as const,
      text: ObservationText.render(module.entities.find(e => e.id === f)!.name, world) })),
    // How the event's changes record it, so the journal can say when it was seen.
    noted: facts.map(f => `+ knows(${player}, ${f})`) };
  }
  // What the company perceives after a command, and learns by it, settled: what it learns may show it more (once
  // the cart is found, the brother kneeling by it), and that is seen and learned in the same moment, a few times over
  // at most. Each thing perceived is told once; everything learned is committed through commit.
  static settle(module: Module, seen: { before: World; after: World; player: string | undefined;
    happenings: { id: string; text: string; kind: 'event' }[] }, commit: (changes: Change[]) => World):
    { perceptions: CampaignEvent['perceptions']; noted: string[] } {
    let world = seen.after, perceived = this.after(module, seen);
    const all = [...perceived ?? []], noted: string[] = [];
    for (let pass = 0; perceived && pass < 3; pass++) {
      const learned = this.witness(module, world, seen.player, perceived);
      if (!learned.changes.length) { break; }
      world = commit(learned.changes);
      noted.push(...learned.noted);
      all.push(...learned.told);
      perceived = this.after(module, { ...seen, after: world, happenings: [] });
      all.push(...(perceived ?? []).filter(p => !all.some(a => a.kind === p.kind && a.id === p.id)));
    }
    return { perceptions: all.length || perceived ? all.filter((p, i) => all.findIndex(a => a.kind === p.kind
      && a.id === p.id) === i) : undefined, noted };
  }
  static after(module: Module, seen: { before: World; after: World; player: string | undefined;
    happenings: { id: string; text: string; kind: 'event' }[] }): CampaignEvent['perceptions'] {
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

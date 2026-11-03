import type { Journey } from '../session/journey';
import type { Module } from '../lang/module';

// What of an adventure's own never happened across some plays of it (its journeys, a curious player's, its kept
// traces): the rules and events that say something and were never told, the endings never reached, the milestones
// never achieved, the promises never made, kept or broken (the Grand Tour's 09 and 11, GTR-X16: a rule that could
// never fire, Bassett's arrest, was found by reading). A rule that says nothing is not seen to fire, and is counted,
// not judged.
export interface Never { rules: string[]; endings: string[]; milestones: string[]; promises: string[]; silent: number }
export class Happened {
  private readonly told = new Set<string>();
  private readonly facts = new Set<string>();
  private module?: Module;
  private installed: string[] = [];
  // A play, at its end: what it told, and what its world came to.
  add(j: Journey): this {
    for (const t of j.taken) {
      for (const p of t.event.perceptions ?? []) { if (p.kind === 'event') { this.told.add(p.id.split('@')[0]!); } }
    }
    const world = j.campaign.world;
    for (const name of Happened.relations.filter(n => world.relates(n))) {
      for (const r of world.related(name)) { this.facts.add(`${name}(${r.args[0]})`); }
    }
    this.module = world.module; this.installed = j.campaign.installed;
    return this;
  }
  private static readonly relations = ['reached', 'achieved', 'promiseMade', 'promiseKept', 'promiseBroken'];
  never(): Never {
    const [endings, milestones, promises] = ['ending', 'milestone', 'promise'].map(type => this.ofType(type));
    // What an ending, a milestone or a promise is made of is said of it, not as a rule of its own.
    const lowered = new Set([...endings!, ...milestones!.map(id => `${id}_achieved`)]);
    const rules = (this.module?.rules ?? []).filter(r => this.own(r.id) && !lowered.has(r.id)
      && !promises!.some(p => r.id.startsWith(`${p}_`)));
    return { rules: rules.filter(r => r.say && !this.told.has(r.id)).map(r => r.id),
      endings: this.not('reached', endings!), milestones: this.not('achieved', milestones!),
      promises: ['Made', 'Kept', 'Broken'].flatMap(how => this.not(`promise${how}`, promises!)
        .map(id => `${id} (never ${how.toLowerCase()})`)), silent: rules.filter(r => !r.say).length };
  }
  // A line for each kind, its ids without their module's prefix.
  lines(): string[] {
    const n = this.never();
    return [`never told: ${Happened.short(n.rules)}${n.silent ? ` (and ${n.silent} rules that say nothing, not judged)`
      : ''}`, `endings never reached: ${Happened.short(n.endings)}`,
    `milestones never achieved: ${Happened.short(n.milestones)}`, `promises: ${Happened.short(n.promises)}`];
  }
  private static short(ids: string[]): string { return ids.map(id => id.replace(/^\w+?__/, '')).join(' ') || '-'; }
  private ofType(type: string): string[] {
    return (this.module?.entities ?? []).filter(e => e.type === type && this.own(e.id)).map(e => e.id);
  }
  private not(relation: string, ids: string[]): string[] { return ids.filter(id => !this.facts.has(`${relation}(${id})`)); }
  private own(id: string): boolean { return this.installed.some(i => id.startsWith(`${i}__`)); }
}

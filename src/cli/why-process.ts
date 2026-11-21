import { CampaignTick } from '../campaign/campaign-tick';
import type { Journey } from '../session/journey';
import type { Call, Change, Module, Predicate } from '../lang/module';
import type { Phase, SemanticRecord } from '../lang/semantic-record';
import { ModuleWriter } from '../lang/module-writer';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { relative } from 'node:path';

// A step of play where a process's phase changed: the step as the player saw it, the watch, the phases from and to
// (by their authored ids), and what moved it (its own rules, named as supporting detail; an act; or the clock).
export interface Advance { step: string; watch: number; from: string; to: string; by: string }

// `kyrie inspect --why process`: a Route, a Promise or an Occasion explained in the author's terms, from the record
// its lowering kept (MT-30, doc/architecture/mission-22/semantic-tracing.md): what is happening, what phase it is in,
// why it advanced, what can affect it, what came of it. Names are the module's own, never the installation's
// (decided(h_tables), not quittance__decided(quittance__h_tables)); its lowered rules only support a step.
//   bin/kyrie inspect --why process <campaign.json> | --world <seed> <name> [step ...]
export class WhyProcess {
  // The records a name asks for: its semantic id, its id as written, or the installation's (quittance/hearing).
  static found(module: Module, name: string): SemanticRecord[] {
    return (module.semantic ?? []).filter(r => r.id === name || r.name === name || r.id.endsWith(`:${name}`));
  }
  // The phase that holds, if one does.
  static phase(j: Journey, r: SemanticRecord): Phase | undefined {
    return r.phases.find(p => j.campaign.world.test(p.holds));
  }
  // Plays the steps, keeping each where the process's phase changed, and by what.
  static async play(j: Journey, steps: string[], r: SemanticRecord): Promise<Advance[]> {
    const advances: Advance[] = [], fired: string[] = [], before = CampaignTick.witness;
    CampaignTick.witness = this.witnessed.bind(this, { before, own: new Set(r.lowered.rules), fired });
    try {
      for (const step of steps) {
        const from = this.phase(j, r), at = j.taken.length;
        fired.length = 0;
        await j.step(step);
        const to = this.phase(j, r), act = j.taken.slice(at).at(-1);
        if (from?.id === to?.id) { continue; }
        const rules = [...new Set(fired)].map(id => this.authored(r, id));
        const by = rules.length ? `its own rule${rules.length > 1 ? 's' : ''} ${rules.join(', ')}`
          : r.kind === 'route' ? `the clock (watch ${j.watch()})` : act ? `the act "${act.label}"` : 'the step';
        advances.push({ step: act?.label ?? step, watch: j.watch(), from: from?.id ?? 'no phase',
          to: to?.id ?? 'no phase', by });
      }
    } finally { CampaignTick.witness = before; }
    return advances;
  }
  // A rule seen to fire: one of its own is kept, and whoever watched before is told as before.
  private static witnessed(at: { before: typeof CampaignTick.witness; own: Set<string>; fired: string[] },
    rule: string, changes: string[]) {
    at.before?.(rule, changes);
    if (at.own.has(rule.split('@')[0]!)) { at.fired.push(rule.split('@')[0]!); }
  }
  static report(j: Journey, r: SemanticRecord, advances: Advance[]): string[] {
    const m = j.campaign.module, now = this.phase(j, r);
    return [`${r.kind} ${r.name} "${r.words}" (${r.id}), written at ${this.where(r)}`,
      ...this.happening(m, r), `  phases: ${r.phases.map(p => p.id).join(', ')}`,
      `  phase now: ${now ? `${now.id}: ${now.said}` : 'none of its phases holds'}`,
      ...advances.length ? ['  advanced:', ...advances.map(a => `    "${a.step}" (watch ${a.watch}): ${a.from} -> `
        + `${a.to}, by ${a.by}`)] : ['  advanced: not in the steps played'],
      ...this.affecting(m, r), ...this.cameOf(j, r, advances)];
  }
  // Its own name for what the installation renamed: the installation's prefix taken off.
  private static authored(r: SemanticRecord, text: string): string {
    const installation = /^\w+:([^/]+)\//.exec(r.id)?.[1];
    return installation ? text.replaceAll(`${installation}__`, '') : text;
  }
  private static where(r: SemanticRecord): string {
    if (r.provenance) { return `${r.provenance.generator}'s ${r.provenance.construct}`; }
    const file = r.span?.file ? relative(NodeBundleSource.root, r.span.file) : 'its module';
    return `${file}:${r.span?.line ?? '?'}`;
  }
  // Who and where, by their names, and when it is in play.
  private static happening(m: Module, r: SemanticRecord): string[] {
    const named = r.participants.map(p => `${p.role} ${m.entities.find(e => e.id === p.id)?.name ?? p.id}`);
    return [`  happening: ${named.join('; ') || 'no one named'}`,
      ...r.requires.map(p => `  asks: ${this.authored(r, ModuleWriter.predicate(p))}`)];
  }
  // The acts and rules of the campaign, not its own, that write a fact it reads; and the choices that serve it.
  private static affecting(m: Module, r: SemanticRecord): string[] {
    const own = new Set(r.lowered.rules), ids = new Set(m.entities.map(e => e.id)), out: string[] = [];
    const reads = [...r.requires, ...r.phases.map(p => p.holds)].flatMap(p => this.calls(p))
      .filter(c => c.name !== 'watch');
    const acts = m.actions.filter(a => this.writes(reads, [...a.success, ...a.failure], ids));
    const rules = (m.rules ?? []).filter(x => !own.has(x.id) && this.writes(reads, x.effects, ids));
    const serving = m.actions.filter(a => this.writes(r.serves, [...a.success, ...a.failure], ids)
      || this.calls(a.requires).some(c => r.serves.some(s => this.meets(s, c, ids))));
    if (serving.length) { out.push(`  choices serving it: ${serving.map(a => `"${a.name}"`).join(', ')}`); }
    const by = [...acts.map(a => `"${a.name}"`), ...rules.map(x => `rule ${this.authored(r, x.id)}`)];
    if (by.length) { out.push(`  affected by: ${by.slice(0, 12).join(', ')}${by.length > 12 ? ', …' : ''}`); }
    return out.length ? out : ['  affected by: nothing but the clock and its own rules'];
  }
  private static writes(reads: Call[], changes: Change[], ids: Set<string>): boolean {
    return changes.some(c => reads.some(x => this.meets(x, c.call, ids)));
  }
  // A fact read and one written are the same where each argument is, or either is not a thing of the world (an
  // act's actor, a rule's variable).
  private static meets(read: Call, written: Call, ids: Set<string>): boolean {
    return read.name === written.name && read.args.length === written.args.length
      && read.args.every((a, i) => a === written.args[i] || !ids.has(a) || !ids.has(written.args[i]!));
  }
  // The phases it went through; for a route, where its walker is now; of what it brings, what holds now.
  private static cameOf(j: Journey, r: SemanticRecord, advances: Advance[]): string[] {
    const through = advances.length ? [advances[0]!.from, ...advances.map(a => a.to)] : [];
    const written = r.effects.filter(c => c.kind === 'assert' && j.campaign.world.test(c.call))
      .map(c => this.authored(r, ModuleWriter.predicate(c.call)));
    const walker = r.kind === 'route' ? r.participants[0]?.id : undefined, at = walker && j.at(walker);
    const place = at ? j.campaign.module.entities.find(e => e.id === at)?.name ?? at : undefined;
    return [`  came of it: ${through.length ? through.join(' -> ') : 'nothing yet'}`,
      ...place ? [`  where it has brought them: ${place}`] : [],
      ...written.length ? [`  holds of what it brings: ${written.join(', ')}`] : []];
  }
  private static calls(p: Predicate): Call[] {
    if (p.kind === 'call') { return [p]; }
    if (p.kind === 'not') { return this.calls(p.value); }
    return p.kind === 'and' || p.kind === 'or' ? [...this.calls(p.left), ...this.calls(p.right)] : [];
  }
}

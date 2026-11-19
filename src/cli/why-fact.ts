import { CampaignTick } from '../campaign/campaign-tick';
import type { Journey, Taken } from '../session/journey';
import type { World } from '../lang/world';
import { WhySources, type SourceLine } from './why-sources';
import { WhyWriter } from './why-writer';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// A fact asked after: its relation, and each argument, or undefined where any will do (at(region__s1_merchant, ?)).
export interface Asked { name: string; args: (string | undefined)[] }
// A change a rule made, as the witness saw it.
interface Heard { rule: string; change: string }
// What a step of play did to the facts asked after: the step as written, the act it took, and each change with what
// made it (a rule, someone else's act, or the act itself).
interface Moved { step: string; label: string; act: string; changes: { change: string; by: string }[] }

// `kyrie inspect --why fact`: why a fact holds where a game stands, or why it does not (the platform maturity study's
// §7.1; the maturity track's step 4). Told from what the engine already keeps: what holds now; whether it held as
// play began, and the line of Kyr that says so (the person's declaration that sets them somewhere, an Initially); what
// the assembly ledger committed of the things it names; and each step of play that changed it, by the rule that fired
// (CampaignTick's witness), the act of someone else (the step's NPC decisions), or the act taken.
export class WhyFact {
  static parse(text: string): Asked | undefined {
    const m = /^\s*(\w+)\s*(?:\((.*)\))?\s*$/.exec(text) ?? undefined;
    if (!m) { return undefined; }
    const args = m[2] === undefined ? [] : m[2].split(',').map(a => a.trim());
    return { name: m[1]!, args: args.map(a => !a || a.startsWith('?') || a === '_' ? undefined : a) };
  }
  // A relation a module declared is asked by its own name (rung), as its namespace knows it (yard__rung), where only
  // one module has it.
  static resolved(world: World, asked: Asked): Asked {
    if (world.relates(asked.name)) { return asked; }
    const own = world.module.relations.filter(r => r.name.endsWith(`__${asked.name}`));
    return own.length === 1 ? { ...asked, name: own[0]!.name } : asked;
  }
  static shown(asked: Asked): string { return `${asked.name}(${asked.args.map(a => a ?? '?').join(', ')})`; }
  // The facts of a world that answer what is asked.
  static holding(world: World, asked: Asked): string[] {
    if (!world.relates(asked.name)) { return []; }
    return world.related(asked.name).filter(f => asked.args.every((a, i) => a === undefined || f.args[i] === a))
      .map(f => `${f.name}(${f.args.join(', ')})`);
  }
  // A change as CampaignEvent.changes says it ("+ at(a, b)", "- keyholder(party, l)") answers what is asked.
  static answers(change: string, asked: Asked): boolean {
    const m = /^[+-] (\w+)\((.*?)\)(?: = .*)?$/.exec(change);
    if (!m || m[1] !== asked.name) { return false; }
    const args = m[2]!.split(', ');
    return asked.args.every((a, i) => a === undefined || args[i] === a);
  }
  // Plays the steps, keeping what each did to the facts asked after; the world as play began is the journey's own.
  static async play(j: Journey, steps: string[], asked: Asked): Promise<{ outset: string[]; moved: Moved[] }> {
    const outset = this.holding(j.campaign.world, asked), moved: Moved[] = [], heard: Heard[] = [];
    const before = CampaignTick.witness;
    CampaignTick.witness = this.witnessed.bind(this, { before, heard, asked });
    try {
      for (const step of steps) {
        const from = j.taken.length;
        heard.length = 0;
        await j.step(step);
        const taken = j.taken.slice(from), changes = this.made(taken, heard, asked);
        if (changes.length) { moved.push({ step, label: taken.at(-1)?.label ?? step, act: taken.at(-1)?.command ?? '', changes }); }
      }
    } finally { CampaignTick.witness = before; }
    return { outset, moved };
  }
  // A rule seen to fire (CampaignTick's witness): what it changed of the facts asked after is kept, and whoever
  // watched before is told as before.
  private static witnessed(at: { before: typeof CampaignTick.witness; heard: Heard[]; asked: Asked }, rule: string,
    changes: string[]): void {
    at.before?.(rule, changes);
    at.heard.push(...changes.filter(c => this.answers(c, at.asked)).map(change => ({ rule, change })));
  }
  // What made each change a step's acts made: a rule that fired, someone else's act, else the act itself.
  private static made(taken: Taken[], heard: Heard[], asked: Asked) {
    const made: { change: string; by: string }[] = heard.map(h => ({ change: h.change, by: `rule ${h.rule}` }));
    for (const t of taken) {
      for (const d of t.event.npc ?? []) {
        for (const change of (d.changes ?? []).filter(c => this.answers(c, asked) && !made.some(m => m.change === c))) {
          made.push({ change, by: `${d.actor}'s ${d.action}` });
        }
      }
      for (const change of t.event.changes.filter(c => this.answers(c, asked) && !made.some(m => m.change === c))) {
        made.push({ change, by: `the act ${t.event.action}` });
      }
    }
    return made;
  }
  // The whole account: what holds, whether it held as play began and where that is written, what the assembly
  // committed of what it names, and what in play changed it.
  static async report(j: Journey, sources: WhySources | undefined, asked: Asked, played: Awaited<ReturnType<
    typeof WhyFact.play>>): Promise<string[]> {
    const now = this.holding(j.campaign.world, asked);
    const lines = [`why ${this.shown(asked)}:`, ...now.length ? now.map(f => `  holds: ${f}`) : ['  holds: nothing'
      + (j.campaign.world.relates(asked.name) ? ' of it' : `; nothing in the rules is called ${asked.name}`)]];
    lines.push(played.outset.length ? `  held as play began: ${played.outset.join(', ')}` : '  held as play began: none');
    if (sources) {
      lines.push(...await this.written(sources, asked, played.outset), ...await this.assembled(sources, asked, now));
    }
    if (!played.moved.length) { lines.push('  in play: no step changed it'); }
    for (const m of played.moved) {
      lines.push(`  in play: "${m.label}" (${m.act}):`);
      for (const c of m.changes) { lines.push(`    ${c.change}, by ${c.by}${await this.where(sources, c.by)}`); }
    }
    return lines;
  }
  // Where the facts that held as play began are written: an Initially that says one, or the declaration of what it
  // is about (a Person declared at the shop is at the shop).
  private static async written(sources: WhySources, asked: Asked, outset: string[]): Promise<string[]> {
    const lines: string[] = [];
    for (const fact of outset) {
      const args = /\((.*)\)/.exec(fact)![1]!.split(', ');
      const said = await sources.initially(asked.name, args);
      const owner = said.length ? undefined : await sources.declared(args[0]!);
      for (const l of owner ? [owner] : said) {
        lines.push(`  written: ${WhySources.said(l)}`);
        lines.push(...this.generated(l).map(w => `    generated by ${w}`));
      }
    }
    return lines;
  }
  // What the assembly ledger committed of each thing the facts name, by whom.
  private static async assembled(sources: WhySources, asked: Asked, now: string[]): Promise<string[]> {
    const ledger = (await sources.manifest()).composition?.ledger;
    if (!ledger) { return []; }
    const named = new Set([...asked.args.filter((a): a is string => !!a),
      ...now.flatMap(f => /\((.*)\)/.exec(f)![1]!.split(', '))]);
    return [...named].flatMap(id => ledger.about(id).slice(0, 6).map(c => `  assembled: ${c.fact}(${c.args.join(', ')})`
      + `${c.value === undefined ? '' : ` = ${c.value}`}, by ${c.by.by}${c.by.why ? ` (${c.by.why})` : ''}`));
  }
  // A line of a world's own generated Kyr, by the generator's template that wrote it.
  private static generated(l: SourceLine): string[] {
    return existsSync(join(NodeBundleSource.root, l.file)) ? [] : WhyWriter.of(l.text);
  }
  // Where what made a change is written: the rule's declaration, or the act's (its schema, or a topic it discusses).
  private static async where(sources: WhySources | undefined, by: string): Promise<string> {
    if (!sources) { return ''; }
    const rule = /^rule (\S+)/.exec(by)?.[1], act = /(?:^the act |'s )(\S+)$/.exec(by)?.[1];
    const ids = rule ? [rule] : act ? [/^([^(]+)/.exec(act)![1]!, ...(/\((.*)\)/.exec(act)?.[1] ?? '').split(',')] : [];
    for (const id of ids.filter(i => i.includes('__'))) {
      const l = await sources.declared(id, rule ? 'Rule|Event' : 'Action|Topic|Event');
      if (l) { return ` (${[WhySources.said(l, 80), ...this.generated(l)].join('; generated by ')})`; }
    }
    return '';
  }
}

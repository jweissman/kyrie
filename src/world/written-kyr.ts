import { ModuleParser } from '../lang/module-parser';
import type { Module } from '../lang/module';

// Kyr a generator has written (a work's sections, filled), read as Kyr: parsed, and asked of by what it declares,
// never searched as text. Its rooms, who is at or lairs in each and whether they are peaceable, the two ends of a
// passage. Regular expressions over the written lines ("Passage w1_in … between (\w+)") had stood in for this, and
// broke whenever a line was written otherwise (the owner, 2 November: structure read as structure). Each written
// work is parsed once, however many ask of it.
export class WrittenKyr {
  private static readonly read = new WeakMap<string[], WrittenKyr>();
  static of(written: string[]): WrittenKyr {
    let kept = this.read.get(written);
    if (!kept) { kept = new WrittenKyr(written); this.read.set(written, kept); }
    return kept;
  }
  readonly module: Module;
  private constructor(written: string[]) {
    this.module = ModuleParser.parse(['Module written "what a generator wrote" {', ...written, '  Goal false.', '}']
      .join('\n'));
  }
  private facts(name: string): string[][] {
    return this.module.initial.flatMap(c => c.kind === 'assert' && c.call.name === name ? [c.call.args] : []);
  }
  // The rooms, in the order they were written.
  rooms(): string[] {
    return this.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room').map(e => e.id);
  }
  // Everyone written, by id: people and groups.
  people(): string[] { return this.module.entities.filter(e => e.type === 'group').map(e => e.id); }
  peaceable(id: string): boolean { return this.facts('peaceable').some(([p]) => p === id); }
  // The places someone written is at or lairs in.
  lived(): Set<string> {
    const people = new Set(this.people());
    return new Set([...this.facts('at'), ...this.facts('lair')].filter(([p]) => people.has(p!)).map(([, at]) => at!));
  }
  // A passage's two ends, as it was written: from, to.
  ends(passage: string): [string, string] | undefined {
    const c = this.facts('connects').find(([p]) => p === passage);
    return c ? [c[1]!, c[2]!] : undefined;
  }
}

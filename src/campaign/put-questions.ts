import type { Call, Change, Module, Predicate } from '../lang/index';

type Action = Module['actions'][number];

// What someone asks of the company, and how it answers (the owner, 26 November: "enabling interlocutors to ask you
// things, pose puzzles, let you make use of skill checks"; OR-165, OR-850). Read from the forms a module already
// writes, at assembly, so that every client plays the same rows:
// - A question put once (`Topic q with p … when addressed(p, actor) … once`), that other topics answer (`answering
//   q`), and whose condition is that the company is speaking with the one who has it, is theirs to put, not the
//   company's to ask: as soon as it can be put while they are spoken with (on the greeting, or after the answer that
//   opened it) they put it, in their own words, and it is never offered as a row. Its words are the question, and
//   its label how it is noted.
// - Whoever has put a question the company has not yet answered asks it (`asks(p, c)`, data/rules/people.kyr), until
//   it answers. A word said to them that may not come off (an Action with `Speaker p` that reads `asks(p, actor)`: a
//   lie, a check of what the company knows) is an answer to it as well, offered with the others under "Your answer",
//   and answers it however it goes: a lie told is told.
export class PutQuestions {
  static readonly relation = 'asks';
  static lower(module: Module) {
    const answered = new Map<string, Action[]>();
    for (const a of module.actions.filter(x => x.topic && x.answers)) {
      answered.set(a.answers!, [...answered.get(a.answers!) ?? [], a]);
    }
    const questions = module.actions.filter(a => a.topic && a.speaker && answered.has(a.id));
    const put = questions.filter(q => this.put(q));
    // Spoken words that read the question asked: answers too, to the question their speaker has put.
    const spoken = module.actions.filter(a => !a.topic && a.speaker && !a.answers
      && this.reads(a.requires, this.relation, [a.speaker, 'actor']));
    const asking = questions.filter(q => put.includes(q) || spoken.some(s => s.speaker === q.speaker));
    if (!asking.length) { return; }
    if (!module.relations.some(r => r.name === this.relation)) {
      module.relations.push({ name: this.relation, types: ['group', 'group'], exclusive: false });
    }
    const askers = new Set(asking.map(q => q.speaker!));
    module.actions = module.actions.map(a => this.speaking(a, askers)).map(a => {
      const q = asking.find(x => x.id === a.id);
      // Put by them, never offered: the rule below puts it.
      if (q) {
        return put.some(x => x.id === q.id) ? { ...a, requires: { kind: 'boolean', value: false } }
          : { ...a, success: [...a.success, { kind: 'assert', call: this.asks(q.speaker!) }] };
      }
      const answer = a.topic && a.answers ? asking.find(x => x.id === a.answers) : undefined;
      if (answer) { return this.answering(a, answer.speaker!); }
      const own = spoken.some(x => x.id === a.id) ? this.own(a, asking) : undefined;
      return own ? this.spoken(a, own, answered.get(own.id)!) : a;
    });
    module.rules = [...module.rules ?? [], ...put.map(q => this.rule(q))];
  }
  // Whatever is said to one with a question for the company begins speaking with them, as greeting them does: a talk
  // led for a question ("Talk to Finnan — ask what is out in the country round") is that question, and greets no one,
  // so that the one asked had never put their own, and a question they answered with one of theirs ("Tell me what is
  // cut on them") had its answers held under a talk not yet turned to.
  private static speaking(a: Action, askers: ReadonlySet<string>): Action {
    if (!a.speaker || !askers.has(a.speaker)) { return a; }
    const greet: Change = { kind: 'assert', call: PutQuestions.call('addressed', a.speaker, 'actor') };
    return { ...a, success: [...a.success, greet], failure: [...a.failure, greet] };
  }
  // A question theirs to put: its condition is the company speaking with them.
  static put(q: Action): boolean {
    return !!q.speaker && this.reads(q.requires, 'addressed', [q.speaker, 'actor'])
      && q.success.some(c => c.kind === 'assert' && /(^|__)said_/.test(c.call.name));
  }
  // The question a word said to them answers: the one of theirs that made true something it reads, or their only one.
  private static own(a: Action, questions: Action[]): Action | undefined {
    const theirs = questions.filter(q => q.speaker === a.speaker);
    return theirs.find(q => q.success.some(c => c.kind === 'assert' && this.reads(a.requires, c.call.name, c.call.args)))
      ?? (theirs.length === 1 ? theirs[0] : undefined);
  }
  // A word that may not come off, answering it: offered while it is asked and not yet answered (though another of
  // theirs is asked), and answering it however it goes.
  private static spoken(a: Action, question: Action, answers: Action[]): Action {
    const latch = answers[0]!.success.find(c => c.kind === 'assert' && /(^|__)answered_/.test(c.call.name));
    const done: Change[] = [{ kind: 'retract', call: this.asks(a.speaker!) }, ...latch ? [structuredClone(latch)] : []];
    const requires: Predicate = latch ? { kind: 'and', left: a.requires, right: { kind: 'not', value: latch.call } }
      : a.requires;
    return { ...a, answers: question.id, requires, success: [...a.success, ...done], failure: [...a.failure, ...done] };
  }
  // An answer to it is offered while it is asked, and answers it.
  private static answering(a: Action, speaker: string): Action {
    return { ...a, requires: { kind: 'and', left: a.requires, right: this.asks(speaker) },
      success: [...a.success, { kind: 'retract', call: this.asks(speaker) }] };
  }
  // The question put, as the world's rule: when the company is speaking with them and it can be put. One at a time:
  // a second waits until the first is answered, and is put then.
  private static rule(q: Action): NonNullable<Module['rules']>[number] {
    const asks = PutQuestions.call(this.relation, q.speaker!, '?c');
    return { id: `${q.id}_put`, anchor: 'near', place: q.speaker!,
      when: { kind: 'and', left: this.bound(structuredClone(q.requires)), right: { kind: 'not', value: asks } },
      effects: [...this.bound(structuredClone(q.success)), { kind: 'assert', call: asks }],
      ...q.report ? { say: q.report } : {} };
  }
  private static call(name: string, ...args: string[]): Call { return { kind: 'call', name, args }; }
  private static asks(speaker: string): Call { return PutQuestions.call(this.relation, speaker, 'actor'); }
  // The act's own parameters as the rule's variables: the company and where it stands.
  private static readonly names: Record<string, string> = { actor: '?c', site: '?s' };
  private static bound<T>(x: T): T {
    if (Array.isArray(x)) { x.forEach(v => this.bound(v)); return x; }
    if (!x || typeof x !== 'object') { return x; }
    const o = x as Record<string, unknown>;
    if (o.kind === 'call' && Array.isArray(o.args)) { o.args = (o.args as string[]).map(a => this.names[a] ?? a); }
    Object.values(o).forEach(v => this.bound(v));
    return x;
  }
  // Whether a condition reads a fact of these arguments, not under a not.
  private static reads(p: Predicate, name: string, args: string[]): boolean {
    if (p.kind === 'call') {
      return (p.name === name || p.name.endsWith(`__${name}`)) && args.every((a, i) => p.args[i] === a);
    }
    return p.kind === 'and' && (this.reads(p.left, name, args) || this.reads(p.right, name, args));
  }
}

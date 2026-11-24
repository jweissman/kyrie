import type { Act } from './screen-types';

// An act's words and its one way of doing it, said as one: run on where the words lead into it ("Take for Bran",
// "Buy a ration"), else apart ("Lift it — Bran takes the weight"). A choice's name of parts ("Lift it; Bran takes the
// weight") is said so wherever it is said whole: the runner had kept the semicolon where the engine said the dash
// (scripts/offer-parity, the adit's fallen prop).
export class ChoiceWords {
  // What unfolds outside a fight (the owner's ruling of 20 November, PB-29): a store's list (its wares, a mentor's
  // lessons) and the Book's (spells prepared, a development spent, as creation's long pages are). Every other act is a
  // row of its own, in whole words, wherever it is offered.
  static readonly unfolds: ReadonlySet<string> = new Set(['buy', 'buy_goods', 'buy_item', 'train_member',
    'prepare_spell', 'raise_quality', 'learn_skill', 'learn_spell', 'take_feat']);
  static joined(label: string, rest: string): string {
    const article = /^(A|An|The|Some) /.test(rest);
    const runs = /\b(on|for|to|with|by|at|from|into)$/i.test(label) || !/^[A-Z]/.test(rest) || article;
    return `${label}${runs ? ' ' : ' — '}${article ? `${rest.charAt(0).toLowerCase()}${rest.slice(1)}` : rest}`;
  }
  // Only a fight, a store and creation unfold (PB-29): a group of acts anywhere else (a thing's tries on a way) is laid
  // out, each act a row of its own in whole words, by its own name standing alone or said with the group's ("Look at
  // the iron grate — Heave it"), its id the one it had under the group (see ChoiceList.flatten). A store's list and the
  // Book's are kept, and so is a riddle read out at the way it bars (focus: CL-34).
  static laid(a: Act, focus = false): boolean {
    return (a.children?.length ?? 0) > 1 && !this.leaves([a]).every(k => k.does && this.unfolds.has(k.does))
      && !(focus && a.children!.some(k => k.grave));
  }
  private static leaves(acts: Act[]): Act[] { return acts.flatMap(k => k.children ? this.leaves(k.children) : [k]); }
  static parts(a: Act): Act[] {
    return a.children!.map(k => ({ ...k, label: k.alone ?? this.joined(a.label, k.label) }));
  }
  static whole(name: string): string {
    return name.split('; ').reduce((said, part) => this.joined(said, part));
  }
}

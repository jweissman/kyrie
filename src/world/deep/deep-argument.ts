import argument from '../../../data/generation/deep/argument.json';
import type { DeepLayout } from './deep-layout';
import type { DeepPurpose } from './deep-purposes';
import { DeepRooms } from './deep-rooms';

// What the town's shrine holds about the deep site: that its makers' wall must stay shut. Its priest says so, and
// says they will not pray for whoever opens it; the company can argue it out. What the makers cut in the wall, if
// read, is evidence that carries the argument easily; without it the argument is hard; insight into the priest
// shows a grief that can be spoken to; a lie (that the keepers sent you) or a threat may move them, at a price.
// Won over, the priest tells what the shrine has always known of what is below, and what it cannot bear; a promise
// to wall the stair up again is a commitment, kept or broken. Defied, the shrine is shut to the company: no healing,
// no raising of the dead, for as long as the world lasts. Each way of arguing is tried once; rolls only where it
// could go either way. Every word of it, and the ways of arguing, are public content
// (data/generation/deep/argument.json); here they are bound to each deep site with a seal: the priest, the site's
// name, and what its purpose calls the seal, what it opens, what is cut round it, and what the shrine keeps of the bane
// (a jar of noonlight, the Wardens' oath-tablet, a dirge bell).
interface Move {
  id: string; label: string; needs?: string; check: string; won?: boolean; learn?: string; caught?: boolean;
  always?: boolean; yes: string; no: string;
}
type Words = Record<string, string>;
export class DeepArgument {
  static readonly q = JSON.stringify;
  static readonly said = argument as Omit<typeof argument, 'moves'> & { moves: Move[] };
  // A line of the argument with its names bound ({priest} as the priest is named, {opened} as the site's purpose says).
  static fill(words: Words, text: string): string {
    return text.replace(/\{(\w+)\}/g, (all, key: string) => words[key] ?? all);
  }
  static lines(layout: DeepLayout, values: Record<string, string>, purpose: DeepPurpose): string[] {
    const seal = layout.links.find(l => l.mechanism === 'seal'), words = purpose.mechanisms.seal;
    if (!seal || !words || !values.priest || !values.town) { return []; }
    const w = values.w!, p = values.priest, wall = `${seal.id}_wall`, q = this.q;
    const b = purpose.bane, carry = b ? b.like?.name ?? DeepRooms.called(b.item, purpose) : '', bane = b?.fact ?? '';
    const said: Words = { priest: `{${p}}`, name: values.name!, noun: words.noun, opened: words.opened, cut: words.words,
      carry, bane: `${layout.site}_bane`, grief: `${w}_grief`, bane_said: `${bane.charAt(0).toLowerCase()}${bane.slice(1)}` };
    said.told = this.fill(said, this.said.told);
    return [`  Relation ${w}_heard(group). Relation ${w}_won(group). Relation ${w}_promised(group).`,
      `  Relation ${w}_argued(group, entity).`,
      `  Entity ${w}_grief: fact ${q(this.fill(said, this.said.grief))}.`,
      ...this.stand(w, p, said), ...this.said.moves.map(m => this.move(w, p, m, said)), ...this.promise(w, p, said),
      ...this.after({ w, p, wall, holy: values.holy ?? `${values.town}_shrine`, said })];
  }
  // What the priest holds, and says once asked; and what they say once won over.
  private static stand(w: string, p: string, said: Words): string[] {
    const q = this.q, f = this.fill.bind(this, said);
    return [`  Topic ${w}_wall with ${p} ${q(f(this.said.ask))} when knows(actor, ${w}_named) and not ${w}_heard(${p}) {`,
      `    Says ${q(f(this.said.stand))}.`, `    On discuss { Assert ${w}_heard(${p}). }`, '  }',
      `  Topic ${w}_since with ${p} ${q(f(this.said.again))} when ${w}_won(${p}) once {`,
      `    Says ${q(`${f(this.said.careful)}${said.carry ? f(this.said.carry) : ''}`)}.`, '  }'];
  }
  // A way of arguing it, tried once: what it needs to be tried, how hard it is, what comes of it.
  private static move(w: string, p: string, m: Move, said: Words): string {
    const q = this.q, f = this.fill.bind(this, said), { id } = m;
    const latch = `${w}_argued(${p}, ${w}_move_${id})`, shut = `Assert refusesService(${p}, actor).`;
    const gain = [m.won ? `Assert ${w}_won(${p}). Assert knows(actor, ${w}_bane).` : '',
      m.learn ? `Assert knows(actor, ${f(m.learn)}).` : '', m.always ? shut : ''].filter(Boolean).join(' ');
    // Won over, the priest says what the shrine has always known of what is below.
    const yes = m.won && !m.always ? `${f(m.yes)} ${said.told}` : f(m.yes), label = f(m.label);
    return [`  Entity ${w}_move_${id}: fact ${q(label)}.`,
      `  Action ${w}_${id}(actor: group, site: place) ${q(label)} {`, `    Speaker ${p}.`, '    Time 5 minutes.',
      `    Requires able(actor) and at(actor, site) and at(${p}, site) and ${w}_heard(${p}) and not ${w}_won(${p})`
        + ` and not refusesService(${p}, actor) and not ${latch}${m.needs ? ` and ${f(m.needs)}` : ''}.`,
      `    Resolve check(actor, ${m.check}).`, `    On success { Assert ${latch}. ${gain} }`,
      `    On failure { Assert ${latch}.${m.caught ? ` ${shut}` : ''} }`,
      `    Result ${q(yes)}.`, `    Otherwise ${q(f(m.no))}.`, '  }'].join('\n');
  }
  // A commitment: to wall the stair up again on the way back. It is taken at the priest's word, no roll.
  private static promise(w: string, p: string, said: Words): string[] {
    const q = this.q, f = this.fill.bind(this, said);
    return [`  Action ${w}_promise(actor: group, site: place) ${q(f(this.said.promise.label))} {`,
      `    Speaker ${p}.`, '    Time 2 minutes.',
      `    Requires able(actor) and at(actor, site) and at(${p}, site) and ${w}_heard(${p}) and not ${w}_won(${p})`
        + ` and not refusesService(${p}, actor).`,
      `    On success { Assert ${w}_won(${p}). Assert ${w}_promised(${p}). Assert knows(actor, ${w}_bane). }`,
      `    Result ${q(f(this.said.promise.yes))}.`, '  }'];
  }
  // What follows: the stair opened against the priest's word, or a promise broken once the heart is brought up,
  // shuts the shrine to the company; it is seen there, and said.
  private static after(at: { w: string; p: string; wall: string; holy: string; said: Words }): string[] {
    const { w, p, wall, holy, said } = at, q = this.q, f = this.fill.bind(this, said);
    return [`  Rule ${w}_defied when ${w}_heard(${p}) and not ${w}_won(${p}) and state(${wall}, broken)`
      + ` and not refusesService(${p}, party) { Assert refusesService(${p}, party). }`,
      `  Rule ${w}_word_broken when ${w}_promised(${p}) and ${w}_raised() and state(${wall}, broken)`
        + ` and at(party, ${holy}) and not refusesService(${p}, party)`
        + ` says ${q(f(this.said.broken))}`
        + ` { Assert refusesService(${p}, party). }`,
      `  Observe ${w}_shut at ${holy} when refusesService(${p}, party) ${q(f(this.said.shut))}.`];
  }
}

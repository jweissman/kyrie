import arts from '../../data/generation/history/arts.json';
import religion from '../../data/catalog/religion.json';
import type { Section } from './model';
import { Counted } from '../presentation/counted';
import making from '../../data/rules/making.kyr' with { type: 'text' };
import { ModuleParser } from '../lang/module-parser';
import { Canon } from '../canon/canon';

interface Art { epithet: string; plans: string[]; craft: string; belief: string; fates: string[]; said?: string[] }
interface Successor { id: string; were: string; made: string }
interface Deity { name: string; domains: string[] }
interface Domain { name: string; alignment: string }

// What the Encyclopedia tells of Imbar's past and its gods (Mission 19's progress: it had lacked history and
// institutions): the old makers, each by its art, what they built, what they held and the ends told of them; the
// kingdoms that came after them; and the gods by their domains. Read from the data every generated country draws
// its history and its faith from (data/generation/history/arts.json, data/catalog/religion.json), so what a country
// shows of its past is what the Encyclopedia says of all of them.
export class EncyclopediaLore {
  static history(): Section[] {
    const made = Object.entries(arts.arts as unknown as Record<string, Art>).map(([id, a]) => ({
      id: `makers:${id}`, title: a.epithet.replace(/^the /, 'The '), status: 'kyr' as const,
      kind: `makers of ${this.list(a.plans.map(p => this.many(p)))}`, text: [a.craft, a.belief],
      facts: a.fates.map((f, i) => [i ? 'Or else' : 'Their end, as it is told', f] as [string, string]) }));
    const after = (arts.successors.kinds as unknown as Successor[]).map(k => ({
      id: `successors:${k.id}`, title: k.id.charAt(0).toUpperCase() + k.id.slice(1), status: 'kyr' as const,
      kind: `who made ${k.made}`, text: [`They were ${k.were}.`] }));
    return [{ id: 'makers', title: 'The old makers', entries: made },
      { id: 'successors', title: 'Those who came after', entries: after }];
  }
  static gods(): Section[] {
    const domains = religion.domains as unknown as Record<string, Domain>;
    const deities = Object.values(religion.deities as unknown as Record<string, Deity>);
    return [{ id: 'gods-all', title: 'The gods', entries: deities.map(d => ({
      id: `deity:${d.name.toLowerCase()}`, title: d.name, status: 'kyr' as const,
      kind: this.list(d.domains.map(x => domains[x]?.name ?? x)).toLowerCase(),
      facts: d.domains.map(x => [domains[x]?.name ?? x, domains[x]?.alignment ?? ''] as [string, string]) })) },
    { id: 'domains-all', title: 'The domains', entries: Object.entries(domains).map(([id, x]) => ({
      id: `domain:${id}`, title: x.name, status: 'kyr' as const, kind: x.alignment,
      text: [`Prayed to through ${this.list(deities.filter(d => d.domains.includes(id)).map(d => d.name))}.`] })) }];
  }
  // What can be made of what is carried, read from the making rules as Kyr parses them (data/rules/making.kyr): each
  // way of making, what it takes and makes, and whether it is a mender's remedy, which can spoil.
  static making(): Section[] {
    const module = ModuleParser.parse(making), facts = module.initial.filter(c => c.kind === 'assert').map(c => c.call);
    return [{ id: 'making', title: 'Making', intro: ['A company can make one thing of two it carries, wherever it has '
      + 'light to work by. A remedy is an hour of a mender\'s work, and can spoil: the first of the two is lost. Anything '
      + 'else is plain work, quickly done.'],
    entries: module.entities.filter(e => e.type === 'recipe').map(e => ({ id: `recipe:${e.id}`,
      title: e.name.charAt(0).toUpperCase() + e.name.slice(1), status: 'kyr' as const,
      kind: facts.some(f => f.name === 'remedy' && f.args[0] === e.id) ? 'a remedy' : 'plain work',
      facts: [['Takes', this.list([...this.of(facts, 'takes', e.id), ...this.of(facts, 'takesWith', e.id)]
        .map(k => this.called(k)))], ['Makes', this.list(this.of(facts, 'makes', e.id).map(k => this.called(k)))]] as
        [string, string][] })) }];
  }
  private static of(facts: { name: string; args: string[] }[], name: string, recipe: string): string[] {
    return facts.filter(f => f.name === name && f.args[0] === recipe).map(f => f.args[1]!);
  }
  private static called(kind: string): string { return Canon.items[kind]?.name.toLowerCase() ?? kind.replaceAll('_', ' '); }
  // A plan by its id, as many of it: "cistern" is cisterns, "galleries" and "singing_halls" are many already.
  private static many(plan: string): string {
    const said = plan.replaceAll('_', ' ');
    return /s$/.test(said) ? said : Counted.plural(said);
  }
  private static list(xs: string[]): string {
    return xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`;
  }
}

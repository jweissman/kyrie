import { Content } from '../content';
import { ItemUses } from './item-uses';
import type { Choice } from './choice-list';
import type { Act, Screen } from './screen-types';

// Whoever of the company is hurt, or has something on them a remedy lifts, can be tended where the company stands:
// under their name, each spell and each thing carried that would mend them, said by who would do it. Play 9's bard
// came out of a fight at half her strength, the herbs in the pack's book and the cleric's cure on her sheet, and
// nothing on the page offered either (M17-88). Each is the engine's own offer, known by its command; a ward or a
// light laid on someone is not tending.
export class Tending {
  static choices(screen: Screen): Choice[] {
    const means = new Map<string, Choice[]>();
    for (const leaf of this.leaves([...screen.party.flatMap(m => m.acts), ...screen.items.flatMap(i => i.acts)])) {
      const mend = this.mend(leaf, screen);
      if (mend && !means.get(mend.recipient)?.some(c => c.label === mend.choice.label)) {
        means.set(mend.recipient, [...means.get(mend.recipient) ?? [], mend.choice]);
      }
    }
    return screen.party.filter(m => m.ref && means.has(m.ref)).map(m => this.tend(m, means.get(m.ref!)!));
  }
  // Tend someone: with one way to, that way itself, said as it is done (a fold of one had opened out of sight, and
  // "Tend Aldith" was pressed twice, opening it and closing it, with nothing tended and nothing said: cold play 9,
  // GR-16); with several, the ways under their name. None that can be done now: shut, saying why.
  private static tend(m: Screen['party'][number], ways: Choice[]): Choice {
    const open = ways.filter(c => !c.disabled), shut = open.length ? {} : { disabled: ways[0]!.disabled! };
    const [one] = ways;
    if (ways.length === 1 && one) {
      const [who, what] = one.label.split(/: (.*)/s);
      return { ...one, id: `mend:${m.id}`, label: `Tend ${m.name}: ${what}${who && who !== m.name ? `, by ${who}` : ''}`,
        note: this.state(m) };
    }
    return { id: `mend:${m.id}`, label: `Tend ${m.name}`, tone: 'company' as const, note: this.state(m), children: ways,
      ...shut };
  }
  // How they are: their hit points against their whole, and what is on them.
  private static state(m: Screen['party'][number]): string {
    return [m.hp < m.maxHp ? `${m.hp} of ${m.maxHp}` : '', ...m.conditions.map(c => c.toLowerCase())]
      .filter(Boolean).join(' · ');
  }
  private static leaves(acts: Act[]): Act[] {
    return acts.flatMap(a => a.children?.length ? this.leaves(a.children) : a.command ? [a] : []);
  }
  // A spell cast on them (field_spell(caster, technique, recipient)), or a thing used on them (use_item(dose,
  // recipient)), that heals or lifts something.
  private static mend(act: Act, screen: Screen): { recipient: string; choice: Choice } | undefined {
    const [, kind, args = ''] = /^(field_spell|use_item)\((.*)\)$/.exec(act.command!) ?? [];
    const parts = args.split(','), recipient = parts.at(-1), spell = kind === 'field_spell';
    const item = spell ? undefined : screen.items.find(i => i.id === parts[0]);
    const spelt = spell ? Content.abilities.find(a => a.id === parts[1]) : undefined;
    const mends = spell ? ItemUses.mends(spelt) : !!item?.mends;
    if (!kind || !recipient || !mends) { return undefined; }
    const who = spell ? screen.party.find(m => m.ref === parts[0])?.name : item?.ownerName;
    const what = spell ? `cast ${spelt!.name}` : `use ${this.thing(item!.name)}`;
    return { recipient, choice: { id: `mend:${act.command!}`, label: `${who}: ${what}`, tone: spell ? 'spell' : 'item',
      command: act.command!, ...act.minutes ? { minutes: act.minutes } : {}, ...act.about ? { about: act.about } : {},
      ...act.disabled ? { disabled: act.disabled } : {} } };
  }
  // "the healing herbs", "a draught of healing", as the pack names it.
  private static thing(name: string): string {
    return /^[A-Z]\w*'s /.test(name) ? name : name.replace(/^(The|A|An|Some) /, m => m.toLowerCase());
  }
  // What is done with one of the company in the pack, said whom to as the scene says it (MT-18: the pack had said
  // "Carlin: Ask them to stay here" and "Carlin: Ask Carlin about home", where the engine said "Ask Carlin to stay
  // here" and "Ask Carlin about home").
  static whom(label: string, name: string): string {
    return label.includes(name) ? label : /\bthem\b/.test(label) ? label.replace(/\bthem\b/, name) : `${name}: ${label}`;
  }
}

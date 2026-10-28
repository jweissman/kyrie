import { Content } from '../content';
import { ItemCatalog } from '../item-catalog';
import type { ArenaAbility } from '../lang/parse';
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
    return screen.party.filter(m => m.ref && means.has(m.ref)).map(m => ({ id: `mend:${m.id}`,
      label: `Tend ${m.name}`, tone: 'company' as const, note: this.state(m), children: means.get(m.ref!)! }));
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
    const ability = spell ? Content.abilities.find(a => a.id === parts[1]) : item && ItemCatalog.use(item.kind);
    if (!kind || !recipient || !this.mends(ability)) { return undefined; }
    const who = spell ? screen.party.find(m => m.ref === parts[0])?.name : item?.ownerName;
    const what = spell ? `cast ${ability!.name}` : `use ${this.thing(item!.name)}`;
    return { recipient, choice: { id: `mend:${act.command!}`, label: `${who}: ${what}`, tone: spell ? 'spell' : 'item',
      command: act.command!, ...act.minutes ? { minutes: act.minutes } : {}, ...act.about ? { about: act.about } : {},
      ...act.disabled ? { disabled: act.disabled } : {} } };
  }
  private static mends(ability: ArenaAbility | undefined): boolean {
    return !!ability?.effects.some(e => e.kind === 'heal' || e.kind === 'remove');
  }
  // "the healing herbs", "a draught of healing", as the pack names it.
  private static thing(name: string): string {
    return /^[A-Z]\w*'s /.test(name) ? name : name.replace(/^(The|A|An|Some) /, m => m.toLowerCase());
  }
}

import { Canon } from '../canon/canon';
import { Overlays } from '../overlays';
import type { CreatureGenerationContext } from '../content';
import { Formations } from '../rules/formations';
import { PerkText } from './perk-text';

// A formation the company makes, or would make with one companion changed: its name, what each perk does, and the
// change it would take ("one more cleric").
export interface FormationPreview { id: string; name: string; perks: string[]; needs?: string }
export interface MemberPreview {
  calling: string; practice: string; skills: { id: string; name: string; from: string }[];
  gear: string[]; contact?: string; requires?: string;
}
// What a company would bring, before it sets out: each companion's calling in practice, the skills they bring and
// where from, and the skills nobody in the company has. Read from the same catalogs the game runs on.
export class CompanyPreview {
  static readonly heard: Record<string, string> = { tavern: 'taproom', temple: 'shrine', market: 'market', road: 'road' };
  static member(c: CreatureGenerationContext): MemberPreview {
    const klass = Canon.classes[Canon.resolve('classes', c.classId ?? '')];
    const background = c.backgroundId && Overlays.has(c.backgroundId) ? Overlays.get(c.backgroundId) : undefined;
    const skills = [...(klass?.skills ?? []).map(id => ({ id, from: klass!.name })),
      ...(background?.skills ?? []).map(id => ({ id, from: background!.name }))]
      .filter((s, i, all) => all.findIndex(o => o.id === s.id) === i)
      .map(s => ({ ...s, name: Canon.skills[s.id]?.name ?? s.id }));
    return { calling: klass?.name ?? '', practice: klass?.practice ?? klass?.description ?? '',
      skills, gear: (background?.gear ?? []).map(g => Canon.items[g]?.name ?? g),
      ...(background?.contact ? { contact: `an old friend who hears ${this.heard[background.contact.channel]} news` } : {}),
      ...(background?.requiredClass && background.requiredClass !== c.classId
        ? { requires: `${background.name} is for ${background.requiredClass}s` } : {}) };
  }
  // The skills that open ways through the March's troubles, and who in the company has each.
  static readonly telling = ['woodcraft', 'lockwork', 'trapwork', 'mending', 'brawn', 'stealth', 'lore', 'rites',
    'climbing', 'digging', 'wayfinding'];
  static company(party: CreatureGenerationContext[]): {
    covered: { name: string; who: string[] }[]; missing: string[];
  } {
    const members = party.map(c => ({ name: c.name ?? '', preview: this.member(c) }));
    const covered = this.telling.map(id => ({ id, name: Canon.skills[id]?.name ?? id,
      who: members.filter(m => m.preview.skills.some(s => s.id === id)).map(m => m.name) }));
    return { covered: covered.filter(c => c.who.length).map(({ name, who }) => ({ name, who })),
      missing: covered.filter(c => !c.who.length).map(c => c.name.toLowerCase()) };
  }
  // Orsino's party traits, as the company is chosen: the ones it makes, and the ones one companion away.
  static formations(party: CreatureGenerationContext[]): { formed: FormationPreview[]; near: FormationPreview[] } {
    return { formed: Formations.recognize(party).map(id => this.formation(id)),
      near: Formations.near(party).map(n => ({ ...this.formation(n.id),
        needs: `Make ${party[n.spare[0]!]?.name || 'one companion'} ${this.a(n.missing[0]!)}` })) };
  }
  private static formation(id: string): FormationPreview {
    const t = Canon.traits[id]!;
    return { id, name: t.name, perks: (t.perks ?? []).map(p => PerkText.of(p)) };
  }
  private static a(id: string): string {
    const name = (Canon.classes[id]?.name ?? Canon.ancestries[id]?.name ?? id).toLowerCase();
    return `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`;
  }
}

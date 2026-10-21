import { Canon } from '../canon/canon';
import { Overlays } from '../overlays';
import type { CreatureGenerationContext } from '../content';

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
}

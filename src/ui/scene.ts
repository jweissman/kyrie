import { ChoiceList, type Choice, type Section } from './choice-list';
import type { Screen, TargetRow } from './screen-types';

// One subject on the page: someone or something here, with what can be done with it said beside it.
export interface SceneSubject {
  id: string; kind: 'creature' | 'person' | 'animal' | 'companion' | 'thing'; name: string; note?: string;
  about?: string;
  // How a fight with it would go, as the company reckons it, when it is one that might be fought.
  danger?: string; choices: Choice[];
  // A painting of someone who could be them: small and large copies, where the face sits, and its credit.
  portrait?: TargetRow['portrait'];
  // What can be seen of them now ("Nest is driving geese along the green"), and whether they are dead or down.
  says?: string[]; state?: TargetRow['state'];
}
// What the page is drawn from in play: who and what is here (danger first), who is with you, the ways about the place
// and the ways out across the country, and what you can do yourself. Every choice is one the engine offered, attached
// to what it is done to, and known by its command, never by its words.
export interface Scene {
  subjects: SceneSubject[]; near: Choice[]; far: Choice[]; you: Choice[];
}

export class SceneModel {
  static build(screen: Screen): Scene {
    const sections = ChoiceList.explore(screen), astray = this.astray(sections);
    const ways = sections.find(s => s.tone === 'way')?.choices ?? [];
    const all = [...ways, ...astray];
    const companions = new Set(screen.people.filter(p => p.companion).map(p => p.id));
    const subjects = sections.filter(s => ['creature', 'person', 'thing'].includes(s.tone))
      .map(s => this.subject(s, companions, screen))
      .filter(s => s.choices.length || ['creature', 'person', 'animal', 'companion'].includes(s.kind));
    const rank: Record<SceneSubject['kind'], number> = { creature: 0, person: 1, animal: 2, thing: 3, companion: 4 };
    return { subjects: subjects.sort((a, b) => rank[a.kind] - rank[b.kind]),
      near: all.filter(c => !this.far(c)), far: all.filter(c => this.far(c)),
      you: sections.filter(s => s.tone === 'company').flatMap(s => s.choices.filter(c => !this.across(c))) };
  }
  private static subject(s: Section, companions: Set<string>, screen: Screen): SceneSubject {
    const row = [...screen.people, ...screen.things].find(t => t.id === s.id);
    const kind = companions.has(s.id) ? 'companion' : row?.kind === 'animal' ? 'animal'
      : s.tone as 'creature' | 'person' | 'thing';
    const [name, ...role] = s.title.split(', ');
    const note = [role.join(', '), s.note].filter(Boolean).join(' · ');
    return { id: s.id, kind, name: name!, ...note ? { note } : {}, ...s.about ? { about: s.about } : {},
      ...row?.reckoning ? { danger: ChoiceList.chances[row.reckoning.danger] } : {},
      ...row?.portrait ? { portrait: row.portrait } : {}, ...row?.says?.length ? { says: row.says } : {},
      ...row?.state ? { state: row.state } : {},
      choices: s.choices.map(c => this.bare(c, name!)).map(c => kind === 'animal' ? this.led(c) : c) };
  }
  // An animal is led and let go, not asked.
  private static led(c: Choice): Choice {
    const words: Record<string, string> = { 'Ask them to come with you': 'Lead along', 'Let them make their own way': 'Let go',
      'Tell them not to wait for you': 'Leave be' };
    return words[c.label] ? { ...c, label: words[c.label]! } : c;
  }
  // Said beside its subject, a choice need not name it again: "Ask Wat about Father" under Wat is "Ask about Father";
  // "Take a coil of rope" under the rope is "Take".
  static bare(c: Choice, name: string): Choice {
    const short = name.replace(/^(a|an|the|some) /i, '');
    const asked = c.label.replace(new RegExp(`^(\\w+) ${this.escape(name)}\\b(?!['’]s),? ?`), '$1 ');
    // "Make much of Fly" is "Make much of"; "Gather a wad of sphagnum moss" keeps what it gathers.
    const tail = new RegExp(`\\s(${this.escape(name)}|${this.escape(short)})$`, 'i');
    const cut = asked.replace(tail, '').trim();
    const dangling = /\b(of|a|an|the|some|with|to|for|from|on|in|at|over|under|into|about|past|wad|handful|bundle)$/i;
    const label = dangling.test(cut)
      && !/^Make much of$/.test(cut) ? asked : cut;
    return { ...c, label: label || c.label,
      ...c.children ? { children: c.children.map(k => this.bare(k, name)) } : {} };
  }
  private static escape(text: string): string { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  // Ways that take more than a few minutes, or set out across wild country, are the ways out; the rest are about here.
  private static far(c: Choice): boolean { return (c.minutes ?? 0) > 10 || this.across(c); }
  private static across(c: Choice): boolean { return /__z\d+_(strike|cast|follow)(\(|$)/.test(c.command ?? ''); }
  private static astray(sections: Section[]): Choice[] {
    return sections.filter(s => s.tone === 'company').flatMap(s => s.choices.filter(c => this.across(c)));
  }
  // Every choice on the page, in the order it is drawn, with the open ones' choices after them: what the keys move
  // through, and what automation chooses among.
  static order(scene: Scene, open: Set<string>): Choice[] {
    return [...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far, ...scene.you]
      .flatMap(c => this.unfold(c, open));
  }
  private static unfold(c: Choice, open: Set<string>): Choice[] {
    return [c, ...open.has(c.id) && c.children ? c.children.flatMap(k => this.unfold(k, open)) : []];
  }
}

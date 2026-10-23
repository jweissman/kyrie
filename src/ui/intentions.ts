import { ChoiceList, type Choice, type Section } from './choice-list';
import type { Screen } from './screen-types';

// What the player might do, grouped by the kind of attention it takes rather than by everything the rules allow:
// whatever stands against the company first, then speaking, looking, going, and seeing to the company itself. A
// person with several things to say to them is one choice that opens in place; so is a thing with several uses.
export class Intentions {
  static book(screen: Screen): Section[] {
    const sections = ChoiceList.explore(screen);
    return [
      ...this.of(sections, 'creature'),
      ...this.gather('speak', 'Speak', this.of(sections, 'person'), 'Speak with'),
      ...this.gather('look', 'Look', this.of(sections, 'thing'), 'Look at'),
      ...this.go(sections),
      ...this.of(sections, 'company').map(s => ({ ...s, title: 'Yourself',
        choices: s.choices.filter(c => !this.across(c)) })),
    ].filter(s => s.choices.length);
  }
  // The ways about the place the company is in, and the ways that set out across country (a road, a path into wild
  // country, a trail, striking out): two scales of going, kept apart. Where every way is long, they are all just Go.
  private static go(sections: Section[]): Section[] {
    const ways = this.of(sections, 'way')[0], astray = this.astray(sections);
    if (!ways && !astray.length) { return []; }
    const all = [...ways?.choices ?? [], ...astray];
    const near = all.filter(c => !this.far(c)), far = all.filter(c => this.far(c));
    const base = { glyph: '→', tone: 'way' as const, ...ways };
    return [...near.length ? [{ ...base, id: 'ways', title: 'Go', choices: near }] : [],
      ...far.length ? [{ ...base, id: near.length ? 'ways-out' : 'ways', title: near.length ? 'Set out' : 'Go', choices: far }] : []];
  }
  private static far(c: Choice): boolean { return (c.minutes ?? 0) > 10 || this.across(c); }
  // Striking out across wild country, and finding the way again, are ways to go, not things to do where you stand.
  private static across(c: Choice): boolean { return /__z\d+_(strike|cast|follow)\(/.test(c.command ?? ''); }
  private static astray(sections: Section[]): Choice[] {
    return sections.filter(s => s.tone === 'company').flatMap(s => s.choices.filter(c => this.across(c)));
  }
  private static of(sections: Section[], tone: Section['tone']): Section[] { return sections.filter(s => s.tone === tone); }
  // Each subject as one choice: what can be done with it, if there is only one thing; otherwise a choice that opens
  // the list of what can be done.
  private static gather(id: string, title: string, subjects: Section[], verb: string): Section[] {
    const choices = subjects.flatMap(s => {
      const open = s.choices.filter(c => !c.disabled);
      if (!open.length) { return []; }
      if (open.length === 1) { return [{ ...open[0]!, ...this.about(s, open[0]!) }]; }
      const name = id === 'speak' ? s.title.split(', ')[0]! : ChoiceList.inline(s.title.split(', ')[0]!);
      return [{ id: `${s.id}#${id}`, label: `${verb} ${name}`, tone: s.tone, children: s.choices,
        ...(s.note ? { note: s.note } : {}), ...(s.about ? { about: s.about } : {}) } satisfies Choice];
    });
    return choices.length ? [{ id, title, tone: subjects[0]!.tone, glyph: subjects[0]!.glyph, choices }] : [];
  }
  private static about(s: Section, c: Choice): Partial<Choice> {
    const about = [c.about, s.about].filter(Boolean).join(' ');
    return about ? { about } : {};
  }
}

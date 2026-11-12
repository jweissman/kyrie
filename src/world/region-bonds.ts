import text from '../../data/generation/town/bond.kyrt' with { type: 'text' };
import table from '../../data/generation/town/companions.json';
import { KyrTemplates } from './kyr-template';

interface Answer { label: string; says: string; trait: string; regard: number }
interface Question { when: string; ask: string; answers: Answer[] }
interface Paragon {
  place: string; label: string; says: string; giftname: string; giftdesc: string; effect: string; after: string;
}
interface Companion {
  id: string; name: string; capability: string; rankup: string; howtext: string; questions: Question[];
  appraise: Record<string, string>; paragon: Paragon;
}

// What a companion asks of the company, what its answers show, and what the companion gives for being understood
// (data/generation/town/bond.kyrt, filled from companions.json): the same situation for each, varied by what the
// author wrote. Nothing here is scored against the player's class or level: it is the engine's own relations and
// measures, said in the companion's voice.
export class RegionBonds {
  static readonly template = KyrTemplates.parse(text);
  static readonly companions = table.companions as Companion[];
  static lines(town: string): string[] {
    return this.companions.flatMap(raw => this.one(JSON.parse(JSON.stringify(raw).replaceAll('{t}', town)) as Companion));
  }
  private static one(c: Companion): string[] {
    const own = { c: c.id, name: c.name };
    const questions = c.questions.flatMap((q, i) => [
      ...this.fill('question', { ...own, n: String(i + 1), when: q.when, ask: q.ask }),
      ...q.answers.flatMap((a, j) => this.fill('answer', { ...own, n: String(i + 1), a: 'abc'[j]!, label: a.label,
        says: a.says, trait: a.trait, regard: String(a.regard) }))]);
    const appraisals = Object.entries(c.appraise).flatMap(([trait, says]) => this.fill('appraisal', { ...own, trait, says }));
    const p = c.paragon;
    return [...this.fill('base', { ...own, rankup: c.rankup, howtext: c.howtext }), ...questions, ...appraisals,
      ...this.fill('paragon', { ...own, place: p.place, label: p.label, says: p.says, giftname: p.giftname,
        giftdesc: p.giftdesc, capability: c.capability, effect: p.effect, after: p.after })];
  }
  private static fill(group: string, values: Record<string, string>): string[] {
    return KyrTemplates.fill(this.template.sections.find(s => s.group === group)!.lines, values);
  }
}

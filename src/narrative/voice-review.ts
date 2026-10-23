import { Voice, type Speaking, type VoiceLine } from './voice';

export interface Reviewed { id: string; kind: string; when: string; readings: string[]; faults: string[] }

// Every voice line as it reads in the moments it can be told in: spoken of as he, she, they and it, of one target and
// of several, on a road between two places; with what reads wrong said beside it (a blank left unfilled, a word
// doubled, "they is"). For editors (bun bin/voice.ts review), and for the test that keeps the tables clean.
export class VoiceReview {
  static readonly contexts: Speaking[] = [
    { actor: 'Tobu', pronoun: 'he', target: 'the boar', place: 'the green',
      values: { from: 'Merscheald', to: 'Meósdael', way: 'road' } },
    { actor: 'Edda', pronoun: 'she', target: 'the two goats', place: 'the ford',
      values: { from: 'Glōmstede', to: 'the mere', way: 'path' } },
    { actor: 'Wren', pronoun: 'they', target: 'Aelfric', place: 'the taproom',
      values: { from: 'the fen', to: 'Murksīe', way: 'road' } },
    { actor: 'the grey dog', pronoun: 'it', target: 'you', place: 'the yard',
      values: { from: 'the lane', to: 'the yard', way: 'path' } },
  ];
  static review(kind?: string): Reviewed[] {
    return Voice.tables.flatMap(t => t.lines.map(line => ({ line, kind: line.id.split('.')[0] ?? t.kinds[0]! })))
      .filter(x => !kind || x.kind === kind).map(({ line, kind: k }) => this.line(line, k));
  }
  private static line(line: VoiceLine, kind: string): Reviewed {
    const readings = [...new Set(this.contexts.map(c => Voice.render(line.text, c)))];
    const when = Object.entries(line.when ?? {}).map(([k, v]) => `${k}=${[v].flat().join('|')}`).join(' ') || 'always';
    return { id: line.id, kind, when, readings, faults: [...new Set(readings.flatMap(r => this.faults(r)))] };
  }
  // What reads wrong in a line as told.
  static faults(text: string): string[] {
    const out: string[] = [];
    if (/\{\w+\}/.test(text)) { out.push(`a blank left unfilled: ${/\{\w+\}/.exec(text)![0]}`); }
    if (/\[[^\]]*\|[^\]]*\]/.test(text)) { out.push('a choice of words left unmade'); }
    const doubled = /\b(\w+) \1\b/i.exec(text);
    if (doubled && !/^(that|had|is)$/i.test(doubled[1]!)) { out.push(`a word doubled: ${doubled[0]}`); }
    if (/\b(a|an) (a|an|the)\b/i.test(text)) { out.push('an article doubled'); }
    if (/\ba [aeiou]\w/i.test(text.replace(/\ba (one|u\w+|eu\w+)/gi, ''))) { out.push('"a" before a vowel'); }
    if (/\bthey (is|was|has|does)\b|\b(he|she|it) are\b/i.test(text)) { out.push('a verb that does not agree'); }
    if (/ [,.;:!?]|\s{2,}/.test(text)) { out.push('a space out of place'); }
    if ((text.match(/‘/g) ?? []).length !== (text.match(/’(?!\w)/g) ?? []).length) { out.push('quotation marks that do not pair'); }
    if (!/[.!?’”'":—)]$/.test(text.trim())) { out.push('no end to the sentence'); }
    return out;
  }
}

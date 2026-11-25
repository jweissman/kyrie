import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// A question a lead points at is askable by a company that followed it (OR-423's re-landing, 25 November). The town's
// particular questions wait on being told what the matter is (toldMatter), and two leads had pointed past that gate:
// the one smoking chimney over the pans sent the company to ask the trader why they are cold (askedOf(chimney,
// trader)), and the question waited on being told; the golden walk's day-one pin could not ask it. Over the authored
// sources (data/), each lead and the question that answers it: a lead's fact asked of someone (askedOf(fact, who)),
// answered by the topic of theirs that lets the fact go; an aim toward someone, answered by a topic of theirs that
// teaches what the aim waits to know. Where that topic waits on toldMatter, it opens on the lead's fact as well.
interface Topic { id: string; who: string; when: string; body: string; file: string }
interface Lead { facts: string[]; who: string; ends: (t: Topic) => boolean; why: string }
const files = (dir: string): string[] => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : /\.kyrt?$/.test(f) ? [p] : [];
});
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function read(file: string): { topics: Topic[]; leads: Lead[] } {
  const lines = readFileSync(file, 'utf8').split('\n'), topics: Topic[] = [], leads: Lead[] = [];
  lines.forEach((line, i) => {
    const t = /^\s*Topic (\S+) with (\S+) "(?:[^"\\]|\\.)*" when (.*?)(?: once(?: only)?)? \{\s*$/.exec(line);
    if (t) {
      const end = lines.findIndex((l, j) => j > i && /^\s{0,3}\S/.test(l));
      topics.push({ id: t[1]!, who: t[2]!, when: t[3]!, body: lines.slice(i + 1, end < 0 ? undefined : end).join('\n'),
        file });
    }
    for (const a of line.matchAll(/Initially Assert askedOf\(([^,]+), ([^)]+)\)/g)) {
      const fact = a[1]!;
      leads.push({ facts: [fact], who: a[2]!, why: `askedOf(${fact}, ${a[2]})`,
        ends: x => new RegExp(`Retract knows\\(actor, ${esc(fact)}\\)`).test(x.body) });
    }
    const o = /^\s*Objective (\S+) when (.*?) toward ([^ ,]+)/.exec(line);
    if (o) {
      const known = [...o[2]!.matchAll(/(?<!not )knows\(party, ([^)]+)\)/g)].map(m => m[1]!);
      const awaited = [...o[2]!.matchAll(/not knows\(party, ([^)]+)\)/g)].map(m => m[1]!);
      if (known.length && awaited.length) {
        leads.push({ facts: known, who: o[3]!, why: `Objective ${o[1]}`,
          ends: x => awaited.some(f => new RegExp(`Assert knows\\(actor, ${esc(f)}\\)`).test(x.body)) });
      }
    }
  });
  return { topics, leads };
}
describe('a question a lead points at', () => {
  it('opens on what the lead teaches, where it waits on being told what the matter is', () => {
    const shut: string[] = [];
    let answered = 0;
    for (const file of files('data')) {
      const { topics, leads } = read(file);
      for (const lead of leads) {
        for (const t of topics.filter(x => x.who === lead.who && lead.ends(x))) {
          answered++;
          if (!/toldMatter\(/.test(t.when)) { continue; }
          const opens = lead.facts.some(f => new RegExp(`knows\\((?:actor|party), ${esc(f)}\\)`).test(t.when));
          if (!opens) { shut.push(`${file}: ${t.id}, led by ${lead.why}, waits on toldMatter alone`); }
        }
      }
    }
    expect(answered).toBeGreaterThan(5);
    expect(shut).toEqual([]);
  });
});

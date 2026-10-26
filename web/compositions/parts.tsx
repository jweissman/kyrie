import type { ReactNode } from 'react';
import type { Choice } from '../../src/ui/choice-list';
import { Typography } from '../../src/presentation/typography';
import type { SceneSubject } from '../../src/ui/scene';
import type { Frame } from '../engine/protocol';
import type { Offer } from './offer';
import type { ProtoState, Recorded } from './proto';

// What every composition is handed: the record, the prototype's state, the beat's frame, what it offers, the
// choices in the order the composition draws them (the keys move through them in that order), and how to choose.
export interface Kit {
  r: Recorded; s: ProtoState; frame: Frame; offer: Offer; order: Choice[]; marked?: Choice;
  choose: (c: Choice) => void;
}
export type Said = { text: string; kind: string };

// The pieces the compositions share: a choice (one button, whatever it looks like), what it costs, and what was said.
export class Parts {
  static Act({ kit, choice: c, className, children }: { kit: Kit; choice: Choice; className?: string;
    children?: ReactNode }) {
    const i = kit.order.indexOf(c), focused = i >= 0 && i === kit.s.focus, marked = kit.s.marks && kit.marked === c;
    const opens = !!c.children && !/#(talk|look)$/.test(c.id);
    return (
      <button type="button" className={['act', className ?? '', c.risk ? 'risk' : '', c.grave ? 'grave' : ''].join(' ')}
        data-choice={c.id} data-index={i} aria-current={focused || undefined} data-marked={marked || undefined}
        aria-expanded={opens ? kit.s.open.includes(c.id) : undefined} onClick={() => kit.choose(c)}>
        {children ?? <Parts.Label choice={c} />}
        {marked && <span className="mark">the record</span>}
      </button>
    );
  }
  static Label({ choice: c }: { choice: Choice }) {
    const cost = Parts.cost(c);
    return <>
      <span className="what">{Typography.curl(c.label)}</span>
      {cost.length > 0 && <span className="cost">{cost.map(([k, t]) => <span key={t} className={k}>{t}</span>)}</span>}
    </>;
  }
  // What a choice says it costs before it is chosen: time, a chance, a danger, what cannot be undone, in words.
  static cost(c: Choice): [string, string][] {
    const out: [string, string][] = [];
    if (c.minutes && c.minutes >= 30 && !/\d+[hm]\b/.test(c.note ?? '')) { out.push(['time', this.duration(c.minutes)]); }
    if (c.note && !/^\d+ more$/.test(c.note)) { out.push(['note', c.note]); }
    if (c.risk) { out.push(['risk', 'a risk']); }
    if (c.grave) { out.push(['grave', 'cannot be undone']); }
    return out;
  }
  static duration(minutes: number): string {
    if (minutes < 60) { return `${minutes} minutes`; }
    const h = Math.floor(minutes / 60), m = minutes % 60;
    return `${h === 1 ? 'an hour' : `${h} hours`}${m ? ` ${m} minutes` : ''}`;
  }
  // Choices that differ only in one word (four words to press on a casket) are said once, with the words apart:
  // what they share before and after, and each one's own part, or nothing when they have too little in common.
  static shared(choices: Choice[]): { lead: string; tail: string; parts: string[] } | undefined {
    const labels = choices.map(c => c.label);
    if (labels.length < 3 || choices.some(c => c.children)) { return undefined; }
    const words = labels.map(l => l.split(' ')), n = Math.min(...words.map(w => w.length));
    let a = 0, b = 0;
    while (a < n - 1 && words.every(w => w[a] === words[0]![a])) { a++; }
    while (b < n - 1 - a && words.every(w => w[w.length - 1 - b] === words[0]![words[0]!.length - 1 - b])) { b++; }
    const lead = words[0]!.slice(0, a).join(' '), tail = b ? words[0]!.slice(-b).join(' ') : '';
    if (lead.length + tail.length < 8) { return undefined; }
    return { lead, tail, parts: words.map(w => w.slice(a, w.length - b).join(' ')) };
  }
  // What was said and done, each line as what it is: speech, a telling, an event of the rules, a change to the place.
  static Lines({ lines, className }: { lines: Said[]; className?: string }) {
    return <div className={`lines ${className ?? ''}`}>{lines.map((l, i) =>
      <p key={i} className={`line ${l.kind}`}>{Typography.curl(l.text)}</p>)}</div>;
  }
  // What has been learned, marked as new in the moment it is learned.
  static Learned({ notes }: { notes: string[] }) {
    const learned = notes.filter(n => /^Noted: /.test(n)), counted = notes.filter(n => !/^Noted: /.test(n));
    return <>
      {learned.length > 0 && <ul className="learned" aria-label="Newly in your notes">{learned.map(n =>
        <li key={n}><span className="tag">New in your notes</span> {Typography.curl(n.replace(/^Noted: /, ''))}</li>)}</ul>}
      {counted.length > 0 && <p className="counted">{counted.join(' · ')}</p>}
    </>;
  }
  static Notice({ kit }: { kit: Kit }) {
    return kit.s.notice ? <p className="notice" role="status">{kit.s.notice}</p> : null;
  }
  // What has passed between you and someone since you came here, as the reader's conversation keeps it: what you
  // said, what came of it, what you came to know; newest last. Read from the Story, so the words are the same.
  static conversation(frame: Frame, subject: SceneSubject): (Said & { kind: 'you' | 'speech' | 'telling' | 'learned' })[] {
    const here = frame.screen.place.id, entries = frame.entries, short = subject.name.split(', ')[0]!;
    const from = entries.findLastIndex(e => e.place === here && e.arrival) + 1;
    return entries.slice(from).filter(e => e.place === here && e.said?.includes(short)).flatMap(e => [
      { kind: 'you' as const, text: e.said!.split(' › ').at(-1)! },
      ...e.lines.map(text => ({ kind: /^['‘]/.test(text) ? 'speech' as const : 'telling' as const, text })),
      ...e.notes.filter(n => /journal/.test(n)).map(n => ({ kind: 'learned' as const,
        text: n.replace(/^◆ In the journal: /, '') }))]);
  }
  static Dialogue({ lines }: { lines: ReturnType<typeof Parts.conversation> }) {
    return <div className="dialogue" aria-live="polite">{lines.map((l, i) => l.kind === 'learned'
      ? <p key={i} className="line learned"><span className="tag">New in your notes</span> {Typography.curl(l.text)}</p>
      : <p key={i} className={`line ${l.kind}`}>{Typography.curl(l.text)}</p>)}</div>;
  }
  // What a person or a thing is doing or looks like now, as the scene says it.
  static says(kit: Kit): string[] {
    return kit.offer.subject?.says ?? [];
  }
  // What came of the last thing done, less what the subject attended to says of itself (a casket's look, told once).
  static unsaid(kit: Kit, lines: Said[]): Said[] {
    const says = new Set(this.says(kit).map(Typography.curl));
    return lines.filter(l => !says.has(Typography.curl(l.text)));
  }
  // The engine's words for the place, whole, and whether the company has just come into it.
  static place(frame: Frame): { name: string; prose: string[]; presence: string[]; arrived: boolean } {
    const leaf = frame.leaf;
    return { name: frame.screen.place.name, prose: leaf.situation ?? [], presence: leaf.presence ?? [],
      arrived: !!leaf.moved || !!leaf.heading };
  }
}

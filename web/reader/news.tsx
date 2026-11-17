import type { Frame } from '../engine/protocol';
import type { ReaderApp } from './reader-app';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';
import { Pip } from './stage/pip';

// What the company has come to know, and the aims it has taken up, kept for the Book rather than told over the place
// (the owner, 17 November: "true system level info (details about new aims) like the toasts … could go in a 'news'
// kind of menu in the backstage", with a pip on the Book when something is new or a decision waits). Each act's notes
// gather here as they come; the Book's mark carries a pip while any is unread (violet where a new aim waits to be
// taken up or let be, else blue for what is known now); the Book's notes open on them, and read, they are cleared.
export interface Item { text: string; label?: string; aim?: true }
export class News {
  // What a frame's telling adds: its new aims, then what it says is known now, each once.
  static of(frame: Frame, had: readonly Item[] = []): Item[] {
    const exchange = frame.leaf.exchange;
    if (!exchange) { return []; }
    const seen = new Set(had.map(i => i.text));
    const aims: Item[] = (exchange.aims ?? []).map(a => ({ text: a.text, label: a.now ? 'The aim now' : 'A new aim', aim: true }));
    const notes: Item[] = exchange.notes.filter(n => !Words.aimed.test(n) || !exchange.aims?.length)
      .map(n => ({ text: n.replace(Words.noted, ''), ...Words.label(n) ? { label: Words.label(n)! } : {},
        ...Words.aimed.test(n) ? { aim: true as const } : {} }));
    return [...aims, ...notes].filter(i => !seen.has(i.text) && (seen.add(i.text), true));
  }
  // The pip the Book's mark carries while anything is unread.
  static Pip({ app }: { app: ReaderApp }) {
    const news = app.state.news ?? [];
    if (!news.length) { return null; }
    const tone = news.some(i => i.aim) ? 'violet' : 'blue';
    return <Pip.View fill={`var(--tone-${tone})`} label={`${news.length} new in your book`} />;
  }
  // At the head of the Book's notes: what came since it was last read.
  static Read({ items }: { items: readonly Item[] }) {
    if (!items.length) { return null; }
    return <section className="notes-news" data-region="news"><h3>Since you last looked</h3>
      <ul>{items.map(i => <li key={i.text} className={i.aim ? 'news-aim' : undefined}>
        {i.label && <span className="label">{i.label}</span>} {Typography.curl(i.text)}</li>)}</ul></section>;
  }
}

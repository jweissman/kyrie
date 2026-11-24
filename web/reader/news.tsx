import type { Frame } from '../../src/creation/protocol';
import type { ReaderApp } from './reader-app';
import { Typography } from '../../src/presentation/typography';
import { Noted } from '../../src/presentation/noted';

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
    const aims: Item[] = (exchange.aims ?? []).map(a => ({ text: a.text, aim: true,
      label: a.begins ? `A story begins: ${a.begins}` : a.now ? 'The aim now' : 'A new aim' }));
    const notes: Item[] = (exchange.noted ?? []).filter(n => !Noted.aim(n) || !exchange.aims?.length)
      .map(n => ({ text: n.text, ...Noted.labels[n.kind] ? { label: Noted.labels[n.kind]! } : {},
        ...Noted.drawn(n) ? { aim: true as const } : {} }));
    return [...aims, ...notes].filter(i => !seen.has(i.text) && (seen.add(i.text), true));
  }
  // What the Book's mark carries while anything is unread: how many, in ivory, never a pip of the Atlas's tones. What
  // is written down is no opportunity to act (the owner's trust contracts, 18 November, D: the Book's blue or violet
  // pip had read as a promise like the lenses' beside it).
  static Pip({ app }: { app: ReaderApp }) {
    const news = app.state.news ?? [];
    if (!news.length) { return null; }
    return <span className="unread" role="img" aria-label={`${news.length} new in your book`}>{news.length}</span>;
  }
  // At the head of the Book's notes: what came since it was last read.
  static Read({ items }: { items: readonly Item[] }) {
    if (!items.length) { return null; }
    return <section className="notes-news" data-region="news"><h3>Since you last looked</h3>
      <ul>{items.map(i => <li key={i.text} className={i.aim ? 'news-aim' : undefined}>
        {i.label && <span className="label">{i.label}</span>} {Typography.curl(i.text)}</li>)}</ul></section>;
  }
}

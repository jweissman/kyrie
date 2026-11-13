import { useEffect, type CSSProperties } from 'react';
import type { ReaderApp } from '../reader-app';
import { ChoiceRow } from './choice-row';
import type { Meeting } from '../../../src/presentation/prologue';
import { Scenery } from '../../../src/ui/scenery';
import { Typography } from '../../../src/presentation/typography';
import { Likeness } from '../../../src/paintings/likeness';
import { WorldStage } from './world-stage';
import { Glyphs } from '../creation/glyphs';

// Which page of the opening is up: a beat (the last of them, where no one is met, closing it), the meeting on the
// road with its answers, or what came of the answer.
type Page = { kind: 'beat'; at: number; last: boolean } | { kind: 'meeting' } | { kind: 'after' };

// A new game's opening, before the first place (the owner's OWN-17): the way in painted over the whole screen, and on
// it nothing but the chapter, small and gold, and one paragraph at a time in the origin's own words: why you came,
// then the town coming into sight. A touch anywhere, or Enter, brings the next (said quietly, under the beat, to one
// who has waited on it a while, not knowing the page goes on). Then whoever is met on the road, their likeness in its
// ring, what is going on with them, and what can be done about it, each answer the same key that play's choices are
// (the owner, 7 November: a decision on the road that reveals your character early, and the phases of one design):
// what is chosen is done by the engine as any choice is, and what came of it told. Last, the first aim said plainly
// once ("Your first goal: …"), and one Go on, gold, the way on as it is everywhere. No book, no ways, nothing of
// yourself: the first page of a story, not of a website. The engine says what it tells (see Prologue); the page only
// draws it, and automation is spared it unless the address asks (?opening), as it is spared the studio's mark.
export class PrologueStage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, told = s.told!, page = PrologueStage.page(app);
    // The way in as its words tell it, and the country the life was chosen over where that is one of its kind, now
    // in focus (see Scenery.approach); one who begins under a roof walked in by it too.
    const country = Scenery.country(s.setting?.terrain, s.seed);
    const view = frame.screen.dark ? undefined : Scenery.approach(frame.screen, country);
    // A page with nothing to decide on it goes on at a touch anywhere, or by itself once read (CN-09); a meeting is
    // answered, never passed by.
    const credit = view && Likeness.credits[view], tap = page.kind !== 'meeting' && !s.pending;
    return (
      <article className={`prologue-page page-${page.kind}${page.kind === 'beat' && !page.last ? '' : ' last'}`} id="page"
        data-beat={page.kind === 'beat' ? page.at : page.kind} aria-label="The opening"
        onClick={tap ? () => PrologueStage.next(app) : undefined}>
        {view && <figure className="scenery" aria-hidden="true">
          <img src={`paintings/large/${view}.webp`} alt="" decoding="async"
            onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></figure>}
        <div className="prologue-body">
          <p className="kicker chapter kind-opening" data-id="chapter">{Typography.curl(told.title)}</p>
          {page.kind === 'beat' && <PrologueStage.Beat app={app} at={page.at} last={page.last} />}
          {page.kind === 'meeting' && <PrologueStage.Meeting app={app} meeting={told.meeting!} />}
          {page.kind === 'after' && <PrologueStage.After app={app} />}
        </div>
        {credit && <p className="credit" aria-hidden="true">{credit}</p>}
      </article>
    );
  }
  static page(app: ReaderApp): Page {
    const s = app.state, told = s.told!, n = told.beats.length, at = s.prologue ?? 0;
    if (at < n) { return { kind: 'beat', at, last: at === n - 1 && !told.meeting }; }
    return told.meeting && at === n ? { kind: 'meeting' } : { kind: 'after' };
  }
  private static Beat({ app, at, last }: { app: ReaderApp; at: number; last: boolean }) {
    return (<>
      <p key={at} className="beat" data-id="beat" aria-live="polite">{app.state.told!.beats[at]}</p>
      {last ? <PrologueStage.Onward app={app} read={app.state.told!.beats[at]!} />
        : <button key={`on${at}`} type="button" className="on" data-action="beat" aria-label="Next"><i /></button>}
      {!last && <p key={`hint${at}`} className="hint" aria-hidden="true">
        <span className="by-key">Enter to go on</span><span className="by-touch">Touch to go on</span></p>}
    </>);
  }
  // Whoever is met, in their ring, what is going on, and the answers: the keys' digits are theirs, as in play.
  private static Meeting({ app, meeting }: { app: ReaderApp; meeting: Meeting }) {
    const face = meeting.portrait;
    return (<>
      <figure className="met" data-id="met">
        <span className="portrait-ring">{face ? <img src={face.src} alt="" decoding="async"
          style={{ objectPosition: `50% ${face.focus}%` }} />
          : <Glyphs.View id={Glyphs.met({ kind: 'person', ...meeting.emblem ? { emblem: meeting.emblem } : {} })} />}
        </span>
        <figcaption className="kicker">{Typography.curl(meeting.name)}</figcaption>
      </figure>
      <p className="beat meeting" data-id="meeting" aria-live="polite">{meeting.text}</p>
      <ol className="answers acts column" aria-label="What you do">
        {meeting.choices.map((c, i) => <li key={c.command}>
          <ChoiceRow.Button className="act" data={{ choice: c.command, action: 'answer' }} act={c.command}
            onClick={() => PrologueStage.answer(app, c)} label={Typography.curl(c.label)} number={i + 1} />
        </li>)}
      </ol>
    </>);
  }
  // What came of the answer, told as the engine told it, under what was chosen; then the first aim and the way on.
  private static After({ app }: { app: ReaderApp }) {
    const s = app.state, exchange = s.pending ? undefined : s.frame?.leaf.exchange;
    return (<>
      {s.pending ? <p className="said waiting">{Typography.curl(s.pending.said)}</p>
        : exchange?.said && <p className="said">{Typography.curl(exchange.said)}</p>}
      {exchange?.lines.map((l, i) => <p key={i} className={`beat outcome ${l.kind}`}>{l.text}</p>)}
      {exchange?.notes.length ? <ul className="notes">{exchange.notes.map((n, i) => <li key={i}>{n}</li>)}</ul> : null}
      {!s.pending && <PrologueStage.Onward app={app} read={[exchange?.said ?? '', ...exchange?.lines.map(l => l.text) ?? []]
        .join(' ')} />}
    </>);
  }
  // The first aim, plainly, once; and then on into the place, by itself once it is read (the owner, 14 November,
  // CN-09: a page with one choice and no stakes, "Go on" after the road meeting, is no act at all), or at a touch or
  // Enter before then. A line under it fills over the reading time, so that it is seen to be going on.
  private static Onward({ app, read }: { app: ReaderApp; read: string }) {
    const aim = app.state.frame?.screen.objectives[0] ?? app.state.told?.aim;
    return (<div className="onward" data-id="onward">
      {aim && <p className="first-aim" data-id="aim"><span className="kicker">Your first goal</span>{Typography.curl(aim)}</p>}
      <PrologueStage.Reading text={`${read} ${aim ?? ''}`} then={() => PrologueStage.done(app)} />
      <p className="hint" aria-hidden="true"><span className="by-key">Enter to go on</span>
        <span className="by-touch">Touch to go on</span></p>
    </div>);
  }
  // How long a page with nothing to decide is given to be read before it goes on by itself: a little to look up, and
  // a reader's pace over its words (about 250 a minute), never less than a few seconds nor more than a few more.
  static reading(text: string): number {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.min(14000, Math.max(3500, 2000 + words * 240));
  }
  static Reading({ text, then }: { text: string; then: () => void }) {
    const ms = PrologueStage.reading(text);
    useEffect(() => { const t = window.setTimeout(then, ms); return () => window.clearTimeout(t); }, [text]);
    return <span className="reading" data-ms={ms} aria-hidden="true" style={{ '--read-ms': `${ms}ms` } as CSSProperties} />;
  }
  // An answer to the meeting, done as any choice is (and timed so); its page waits on what came of it.
  static answer(app: ReaderApp, choice: Meeting['choices'][number]) {
    const s = app.state;
    if (s.pending || PrologueStage.page(app).kind !== 'meeting') { return; }
    app.setState({ prologue: s.told!.beats.length + 1, beat: performance.now() });
    app.act(choice.command, choice.label);
  }
  // How long a beat is shown before anything goes on from it: as long as its way on takes to appear (see stage.css),
  // so that it is read (two Enters, or two taps, had gone past the second beat unread: the opening's critique); where
  // motion is unwanted, and the way on is there at once, only long enough that one press is not taken for two.
  static readonly hold = 1400;
  static readonly instant = 300;
  // The next page; after the last, the place. A meeting is answered, not passed by a touch (Esc still goes on).
  static next(app: ReaderApp) {
    const s = app.state, page = PrologueStage.page(app);
    if (performance.now() - (s.beat ?? 0) < PrologueStage.held() || page.kind === 'meeting' || s.pending) { return; }
    if (page.kind === 'beat' && !page.last) { app.setState({ prologue: page.at + 1, beat: performance.now() }); }
    else { PrologueStage.done(app); }
  }
  // Straight on into play, whatever page it is at (Esc): where the opening left the company (see WorldStage.begins).
  static done(app: ReaderApp) {
    const frame = app.state.frame;
    // What came of the answer on the road was told on the opening's last page: not again on the place under it.
    app.setState({ prologue: undefined, told: undefined, opened: app.state.told?.beats ?? [],
      ...frame ? { frame: { ...frame, leaf: { ...frame.leaf, exchange: undefined } } } : {},
      outdoors: !!frame && WorldStage.begins(frame) });
  }
  // The opening's keys: on, a digit for an answer, Esc straight on; nothing reaches the place's choices under it.
  static key(app: ReaderApp, key: string, held: boolean): boolean {
    const page = PrologueStage.page(app), n = Number(key);
    if (/^(Enter| |ArrowRight|ArrowDown)$/.test(key)) {
      if (!held) { PrologueStage.next(app); }
      return true;
    }
    if (key === 'Escape') { PrologueStage.done(app); return true; }
    const choice = page.kind === 'meeting' && n >= 1 ? app.state.told!.meeting!.choices[n - 1] : undefined;
    if (choice) { PrologueStage.answer(app, choice); }
    return /^([1-9]|ArrowUp|ArrowLeft)$/.test(key);
  }
  private static held(): number {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? PrologueStage.instant
      : PrologueStage.hold;
  }
}

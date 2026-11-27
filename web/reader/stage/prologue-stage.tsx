import { useEffect, useRef, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import { ChoiceRow } from './choice-row';
import { PageFrame } from '../page-frame';
import { PressGuard } from '../press-guard';
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
    // in focus (see Scenery.approach, and Shell.plate, which draws it); one who begins under a roof walked in by it too.
    const country = Scenery.country(s.setting?.terrain, s.seed);
    const view = frame.screen.dark ? undefined : Scenery.approach(frame.screen, country);
    // A page goes on only when the player says so, by its one held Continue (the owner, 16 November: some sign on the
    // screen that input is wanted; nothing goes on by itself, nor at a touch anywhere); a meeting is answered.
    const credit = view && Likeness.credits[view];
    return <PageFrame.View kind="opening" body="prologue-body"
      className={`prologue-page page-${page.kind}${page.kind === 'beat' && !page.last ? '' : ' last'}`}
      attrs={{ 'data-beat': page.kind === 'beat' ? String(page.at) : page.kind, 'aria-label': 'The opening' }}
      header={page.kind !== 'after' && <p className="kicker chapter kind-opening" data-id="chapter">{Typography.curl(told.title)}</p>}
      narrative={page.kind === 'beat' ? <><p key={page.at} className="beat" data-id="beat" aria-live="polite">
        {told.beats[page.at]}</p>{page.last && <PrologueStage.Onward app={app} />}</>
        : page.kind === 'meeting' ? <PrologueStage.Met meeting={told.meeting!} /> : <PrologueStage.After app={app} />}
      menu={PrologueStage.menu(app, page)}
      over={credit && <p className="credit" aria-hidden="true">{credit}</p>} />;
  }
  // The opening's painting is the shell's, behind the page (Shell.plate): it rose once, over the dark, as the last step
  // of setting out ran, and is not put up again here (the owner, 18 November, OR-77; M22's second review, OR-43: on a
  // phone the country behind creation had shown, then been replaced).
  // The page's one menu: a meeting's answers, else the engine's one way on (Told.on, OR-1682: "There's no interaction
  // on the introduction page, even an 'okay…'"), on every page read, the last one too. While what was answered on the
  // road is still being told it stands, waiting, and is pressed once it is told (it had not been drawn at all).
  private static menu(app: ReaderApp, page: Page): ReactNode {
    const told = app.state.told!, on = told.on;
    if (page.kind === 'meeting') { return <PrologueStage.Answers app={app} meeting={told.meeting!} />; }
    if (page.kind === 'beat' && !page.last) {
      return <PrologueStage.Continue key={`on${page.at}`} action="beat" label={on.label}
        then={() => PrologueStage.next(app)} />;
    }
    return <PrologueStage.Continue action={on.id} label={on.label} waiting={!!app.state.pending}
      then={() => PrologueStage.done(app)} />;
  }
  static page(app: ReaderApp): Page {
    const s = app.state, told = s.told!, n = told.beats.length, at = s.prologue ?? 0;
    if (at < n) { return { kind: 'beat', at, last: at === n - 1 && !told.meeting }; }
    return told.meeting && at === n ? { kind: 'meeting' } : { kind: 'after' };
  }
  // Whoever is met, in their ring, what is going on, and the answers: the keys' digits are theirs, as in play.
  private static Met({ meeting }: { meeting: Meeting }) {
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
    </>);
  }
  private static Answers({ app, meeting }: { app: ReaderApp; meeting: Meeting }) {
    return <ol className="answers acts column" aria-label="What you do">
      {meeting.choices.map((c, i) => <li key={c.command}>
        <ChoiceRow.Button data={{ choice: c.command, action: 'answer' }} act={c.command}
          onClick={() => PrologueStage.answer(app, c)} label={Typography.curl(c.label)} number={i + 1} />
      </li>)}
    </ol>;
  }
  // What came of the answer, told as the engine told it, under what was chosen; then the first aim and the way on.
  private static After({ app }: { app: ReaderApp }) {
    const s = app.state, exchange = s.pending ? undefined : s.frame?.leaf.exchange;
    // One account of what was done (the owner, 17 November, D): the act's own telling, not what was chosen said again
    // over it, nor the state it left told after it (the cart square on the road, after the telling of its coming out of
    // the ditch); its dice a small die to look at; what is known now the Book's news (News), not a line here.
    const lines = exchange?.lines ?? [], told = lines.some(l => l.kind === 'telling' || l.kind === 'speech');
    const said = lines.filter(l => l.kind !== 'roll' && !(told && l.kind === 'change')), rolls = lines.filter(l => l.kind === 'roll');
    return (<>
      {s.pending && <p className="said waiting">{Typography.curl(s.pending.said)}</p>}
      {said.map((l, i) => <p key={i} className={`beat outcome ${l.kind}`}>{l.text}</p>)}
      {rolls.length > 0 && <details className="how"><summary aria-label="How it fell">⚄</summary>
        {rolls.map((l, i) => <p key={i}>{l.text}</p>)}</details>}
      {!s.pending && <PrologueStage.Onward app={app} />}
    </>);
  }
  // The first aim, plainly, once, over the page's one Continue into the place.
  private static Onward({ app }: { app: ReaderApp }) {
    const aim = app.state.frame?.screen.objectives[0] ?? app.state.told?.aim;
    return aim ? <div className="onward" data-id="onward">
      <p className="first-aim" data-id="aim"><span className="kicker">Your first goal</span>{Typography.curl(aim)}</p>
    </div> : null;
  }
  // The one way on from a page of the opening, in the engine's words: a row taken at a press (OR-169: no long presses;
  // it had been held), the keys on it from the start, and nothing goes on by itself (the owner, 16 November). Waiting,
  // it stands and cannot yet be pressed.
  static Continue({ action, then, label, waiting }: { action: string; then: () => void; label: string;
    waiting?: boolean }) {
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
    return <ChoiceRow.Button ref={ref} className="go-on" data={{ action }}
      own={{ 'data-nav': true, ...waiting ? { disabled: true, 'aria-busy': true } : PressGuard.once(then) }}
      plain="neutral" label={label} />;
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
    const frame = app.state.frame, page = app.state.told ? PrologueStage.page(app) : undefined;
    // Whether the first goal was said: its last page reached with one on it (Esc had gone straight on past it, and
    // a1's opening had none, and the place under it said none either: BL-04).
    const said = (page?.kind === 'after' || (page?.kind === 'beat' && page.last))
      && !!(frame?.screen.objectives[0] ?? app.state.told?.aim);
    // What came of the answer on the road was told on the opening's last page: not again on the place under it.
    app.setState({ prologue: undefined, told: undefined, opened: app.state.told?.beats ?? [], goalSaid: said,
      ...frame ? { frame: { ...frame, leaf: { ...frame.leaf, exchange: undefined } } } : {},
      outdoors: !!frame && WorldStage.begins(frame) });
  }
  // The opening's keys: on, a digit for an answer, Esc straight on; nothing reaches the place's choices under it.
  static key(app: ReaderApp, key: string, held: boolean): boolean {
    const page = PrologueStage.page(app), n = Number(key);
    // Going on is the Continue's: Enter or Space on it is its own press (the button's), and a key elsewhere puts the
    // keys on it, and does nothing.
    if (/^(Enter| |ArrowRight|ArrowDown)$/.test(key)) {
      const on = document.querySelector<HTMLElement>('.prologue-page .go-on');
      if (on && document.activeElement === on && (key === 'Enter' || key === ' ')) { return false; }
      if (on && document.activeElement !== on && !held) { on.focus({ preventScroll: true }); }
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

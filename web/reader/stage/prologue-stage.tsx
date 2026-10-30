import type { ReaderApp } from '../reader-app';
import { Scenery } from '../../../src/ui/scenery';
import { Typography } from '../../../src/presentation/typography';
import { Likeness } from '../../../src/paintings/likeness';

// A new game's opening, before the first place (the owner's OWN-17): the way in painted over the whole screen, and on
// it nothing but the chapter, small and gold, and one paragraph at a time in the origin's own words: why you came,
// then the town coming into sight. A touch anywhere, or Enter, brings the next (said quietly, under the beat, to one
// who has waited on it a while, not knowing the page goes on); under the last, one Go on, into play. No book, no ways,
// nothing of yourself: the first page of a story, not of a website. The engine says what it tells (see Prologue); the
// page only draws it, and automation is spared it unless the address asks (?opening), as it is spared the studio's
// mark.
export class PrologueStage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, told = frame.leaf.prologue!, n = told.beats.length;
    const at = Math.min(s.prologue ?? 0, n - 1), last = at === n - 1;
    // The way in as its words tell it, and the country the life was chosen over where that is one of its kind, now
    // in focus (see Scenery.approach); one who begins under a roof walked in by it too.
    const country = Scenery.country(s.setting?.terrain, s.seed);
    const view = frame.screen.dark ? undefined : Scenery.approach(frame.screen, country);
    const credit = view && Likeness.credits[view];
    return (
      <article className={`prologue-page${last ? ' last' : ''}`} id="page" data-beat={at} aria-label="The opening"
        onClick={last ? undefined : () => PrologueStage.next(app)}>
        {view && <figure className="scenery" aria-hidden="true">
          <img src={`paintings/large/${view}.webp`} alt="" decoding="async"
            onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></figure>}
        <div className="prologue-body">
          <p className="chapter kind-opening" data-id="chapter">{Typography.curl(told.title)}</p>
          <p key={at} className="beat" data-id="beat" aria-live="polite">{told.beats[at]}</p>
          {last ? <button key="go-on" type="button" className="go-on" data-action="go-on"
            onClick={() => PrologueStage.next(app)}>Go on</button>
            : <button key={`on${at}`} type="button" className="on" data-action="beat" aria-label="Next"><i /></button>}
          {!last && <p key={`hint${at}`} className="hint" aria-hidden="true">
            <span className="by-key">Enter to go on</span><span className="by-touch">Touch to go on</span></p>}
        </div>
        {credit && <p className="credit" aria-hidden="true">{credit}</p>}
      </article>
    );
  }
  // How long a beat is shown before anything goes on from it: as long as its way on takes to appear (see stage.css),
  // so that it is read (two Enters, or two taps, had gone past the second beat unread: the opening's critique); where
  // motion is unwanted, and the way on is there at once, only long enough that one press is not taken for two.
  static readonly hold = 1400;
  static readonly instant = 300;
  // The next beat; after the last, the place (a beat's own button is pressed through to the page's touch).
  static next(app: ReaderApp) {
    const s = app.state, n = s.frame?.leaf.prologue?.beats.length ?? 0, at = s.prologue ?? 0;
    if (performance.now() - (s.beat ?? 0) < PrologueStage.held()) { return; }
    app.setState({ prologue: at + 1 < n ? at + 1 : undefined, beat: performance.now() });
  }
  // Straight on into play, whatever beat it is at (Esc).
  static done(app: ReaderApp) { app.setState({ prologue: undefined }); }
  private static held(): number {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? PrologueStage.instant
      : PrologueStage.hold;
  }
}

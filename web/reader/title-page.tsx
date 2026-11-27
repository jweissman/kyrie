import { useEffect, useState, type AnimationEvent, type ChangeEvent, type CSSProperties } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Identity } from '../../src/presentation/identity';
import { Ident } from './ident';
import { createPortal } from 'react-dom';
import { ChoiceRow } from './stage/choice-row';
import { PageFrame } from './page-frame';
import { BeginMenu } from './begin-menu';
import { PressGuard } from './press-guard';
import { OpeningPages, type PageRow } from '../../src/creation/opening-pages';

type Beat = 'ident' | 'dark' | 'reveal' | 'ready';
// A way in, by what it is: the sky behind the title answers the one the hand or the keys are on.
type Way = 'continue' | 'begin' | 'options' | 'quit';

// The title, the first page of the game's own language (the owner, 14 November, TO-01..03: "a quiet, extremely
// legible foreground over a deeper, more complex, subtly moving background"; the moving double box about the choices
// had been where he bounced off). Once a session the studio's mark draws its seven towers; the title comes up out of
// it with no black between. The title is the engine's page (OpeningPages.title, OR-382), drawn in the one frame as any
// page is: the embers its backdrop, and in the frame's menu column the game's name, small (OR-501), over its rows, the
// core four and nothing else (the owner, 26 November, OR-1072): New Game, Continue where a kept game can be taken up,
// Options and Quit, each a row of the game's own (see ChoiceRow), lit at once by its mark when the hand or the keys
// are on it; a kept game that could not be opened is said under them in a plain line. Any key or touch skips
// straight to the way in.
// One who asks for less motion is shown it at once. Nothing here says how a country is made; a save brought from
// elsewhere, the encyclopedia and the build are Options'; the campaigns for testing are the address's (?campaign=),
// no list of the title's. The names shown are the game's and the studio's (src/presentation/identity.ts).
export class TitlePage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, query = app.props.query;
    const named = Identity.named(query), [beat, skip] = TitlePage.useBeat(query.has('ident') || query.has('studio'));
    // The title is the engine's page (OpeningPages.title, OR-382): its rows, its heading and its backdrop.
    const page = OpeningPages.title(app.opening.kept()), first = page.chosen as Way, [active, activate] = useState<Way>(first);
    // The way the hand or the keys are on, marked at once by the reticule, the one sign of focus; the sky is still.
    const item = (way: Way) => ({ 'data-nav': true, onMouseEnter: () => activate(way), onFocus: () => activate(way),
      'data-considered': active === way || undefined, 'aria-current': active === way || undefined, 'data-way': way });
    // The keys are on Play as soon as it is offered, not one Tab away: Enter on it plays (M22: Enter on the lit row
    // had done nothing). And again on coming back from how a new game begins (Escape).
    useEffect(() => {
      if ((beat === 'reveal' || beat === 'ready') && s.phase === 'title') { TitlePage.focus(first); }
    }, [beat, first, s.phase]);
    // A new game asks first how it begins, where Play stood (see BeginMenu).
    // Quit's page is the dark alone (OpeningPages.closed): the embers gone out.
    const over = s.phase === 'begin' || s.phase === 'closed', asked = over ? BeginMenu.page(app) : page;
    return <PageFrame.View kind="title" className={`opening title-page beat-${beat}`}
      attrs={{ 'data-mode': over ? s.phase : 'title' }}
      body="title-main" hidden={beat === 'ident' || beat === 'dark'}
      background={<>{beat !== 'ident' && asked.hints.backdrop === 'embers' && <TitlePage.Motes />}
        {beat === 'ident' && !TitlePage.early() && <Ident.View studio={named.studio} />}</>}
      // No hero (OR-501, the owner, 24 November: "it doesn't need a huge 'Westernesse'"): the game's name, the page's
      // heading, small in the frame's own type at the head of the ways in, at the hard right, the studio's emblem
      // beside it and the page's line under it (OR-529); the embers keep the space. How a new game begins asks in its place (BeginMenu), the name not kept over it.
      menu={over ? <BeginMenu.View app={app} /> : <nav className="title-menu" aria-label={page.ask}>
        {page.hints.heading === 'name' && <h1 className="mark" aria-label={Identity.spoken(named.game)}>
          <Ident.Glyph studio={named.studio} /><span>{named.game}</span></h1>}
        {page.line && <p className="title-line">{page.line}</p>}
        <ul>{page.rows.map(row => <li key={row.id}>{TitlePage.row(app, row, item)}</li>)}</ul>
        {page.told && <p className="title-told" data-id="refused" role="status">{page.told}</p>}
      </nav>}
      over={<>{beat === 'ident' && <TitlePage.Skip skip={skip} />}
        <Toast.View app={app} /></>} />;
  }
  // A row of the title's page as the engine gives it: the ways in, Options and Quit; what each does said to a pointer
  // and a reader only, never a line of its own.
  static row(app: ReaderApp, row: PageRow, item: (way: Way) => Record<string, unknown>) {
    const way = row.id as Way, own = { ...item(way), ...row.said ? { 'aria-label': row.said } : {} };
    const go = way === 'options' ? TitlePage.options.bind(null, app) : way === 'quit' ? app.opening.quit
      : app.opening.way.bind(null, way);
    return <ChoiceRow.Button className="way-in" data={{ action: row.id }} label={row.label}
      plain={row.every ? 'every' : 'neutral'} own={{ ...PressGuard.once(go), ...own }} />;
  }
  static focus(way: Way) {
    if (!document.activeElement || document.activeElement === document.body) {
      document.querySelector<HTMLElement>(`[data-way="${way}"]`)?.focus({ preventScroll: true });
    }
  }
  // Sparks going up slowly through the dark over the country, as off a fire out of sight below the title: a few, each
  // its own way across and its own pace, the same every time (no chance in it), gone for one who asks for less motion.
  // Back as they were before look-7 (IG-14, the owner: the title was much better with them; quiet never meant still):
  // their own slow drift, answering nothing the hand does. Cooled toward the night's blue-white, the first step of their
  // becoming the sky (OR-530). One passage, never begun again: each mote is where the page's one clock has it, so that
  // the title, how a life begins, the country being drawn and the first page of the choosing, each drawing them anew,
  // carry the same sparks on where they were (TO-03). settle: creation's, the sparks going out as its painting comes
  // up, once, then gone.
  // Once gone they stay gone until the title draws them again (Back from the sky does not bring them up anew).
  static Motes({ settle }: { settle?: boolean }) {
    const [since] = useState(TitlePage.since), [, go] = useState(false);
    if (!settle) { TitlePage.settled = false; } else if (TitlePage.settled) { return null; }
    const out = (e: AnimationEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) { TitlePage.settled = true; go(true); }
    };
    return (
      <div className={`motes${settle ? ' settling' : ''}`} aria-hidden="true" onAnimationEnd={settle ? out : undefined}>
        {Array.from({ length: TitlePage.motes }, (_, i) => <i key={i} style={{ '--x': `${(i * 37 + 11) % 100}%`,
          '--d': `${-((i * 7919) % 23) - since}s`, '--t': `${16 + (i * 13) % 11}s`, '--s': `${2 + (i % 3)}px` } as CSSProperties} />)}
      </div>
    );
  }
  static readonly motes = 34;
  // The motes' one clock: seconds since they were first drawn in this page's life.
  static since(): number {
    const now = typeof performance === 'undefined' ? 0 : performance.now();
    TitlePage.lit ??= now;
    return Math.round(now - TitlePage.lit) / 1000;
  }
  private static lit: number | undefined;
  private static settled = false;
  // How long the title takes to come up.
  static readonly reveal = 3200;
  // Where the opening has got to: the ident once a session (and when the address asks, ?ident or ?studio=), then
  // black, then the title coming up; skipped by any key or touch, and never shown to one who asks for less motion or
  // to automation. Coming back to the title within the page (from Options) it is simply there. The key or touch that
  // skips does nothing else: the ways in are under a finger before they are seen (Begin's row is the menu's width,
  // just below the screen's middle, where a thumb falls), and a touch's click comes after its pointerdown whatever
  // that pointerdown's handler does, so the click is swallowed too (TitlePage.swallow).
  static useBeat(asked: boolean): [Beat, () => void] {
    const [beat, go] = useState<Beat>(() => TitlePage.first(asked));
    useEffect(() => {
      // The page's own mark is the title's to put away: as the mark ends, or at once where it is not being played.
      if (beat !== 'ident' || !TitlePage.early()) { document.getElementById('pre-ident')?.remove(); }
      if (beat === 'ready') { return; }
      // The mark drawn by the page before the script (SiteBuild.mark) has been playing since it was first painted:
      // what is left of it, by its own animation's clock, not the whole again (and never by the page's age: on a slow
      // or cold load it was painted a second or more after the page began, and the title had cut it short).
      const left = TitlePage.left();
      const next: Record<Beat, [Beat, number]> = { ident: ['dark', left], dark: ['reveal', 400],
        reveal: ['ready', TitlePage.reveal], ready: ['ready', 0] };
      const [to, after] = next[beat], timer = setTimeout(() => go(to), after);
      // A touch on a way in already coming up (the reveal) is that way, at once (the owner, 6 November: New Game in
      // one click); anything else only brings the ways in.
      const skip = (e: Event) => {
        // The studio's mark plays whole unless it is skipped on purpose: held at its Skip, or Escape (the owner, 17
        // November: a stray touch had cut it, or landed on New game).
        if (beat === 'ident' && !(e instanceof KeyboardEvent && e.key === 'Escape')) { return; }
        if (beat === 'reveal' && e.type === 'pointerdown' && (e.target as Element | null)?.closest?.('.way-in')) {
          go('ready'); return;
        }
        // And the keys' Enter or Space on the way they are on, as it comes up: that way's press, as a hand's would be.
        if (beat === 'reveal' && e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' ')
          && document.activeElement?.closest('.way-in')) { go('ready'); return; }
        e.stopImmediatePropagation(); e.preventDefault();
        if (e.type === 'pointerdown') { TitlePage.swallow(); }
        go('ready'); };
      window.addEventListener('keydown', skip, { capture: true });
      window.addEventListener('pointerdown', skip, { capture: true });
      return () => { clearTimeout(timer); window.removeEventListener('keydown', skip, { capture: true });
        window.removeEventListener('pointerdown', skip, { capture: true }); };
    }, [beat]);
    return [beat, () => { TitlePage.swallow(); go('ready'); }];
  }
  // Skip: a small reticle at the foot of the corner and the word, quiet, done at a press (OR-169: no long presses; it
  // had been held). A touch anywhere else leaves the studio's mark playing (see useBeat), so nothing meant for
  // anything else cuts it short.
  // On the page itself, beside the early mark (which is the page's, not the app's: SiteBuild.mark), so that it stands
  // above it.
  static Skip({ skip }: { skip: () => void }) {
    const button = <button type="button" className="skip-mark" data-action="skip" aria-label="Skip"
      {...PressGuard.once(skip)}><i className="skip-ring" aria-hidden="true" /><span>Skip</span></button>;
    return typeof document === 'undefined' ? button : createPortal(button, document.body);
  }
  // The click that follows a pointerdown which skipped the opening, wherever it lands, is the skip's, however long the
  // press was held: it is eaten if it comes before a moment after the press is let go (or the touch is cancelled), and
  // a new press ends the watch at once.
  private static swallow() {
    let timer = setTimeout(() => done(), 5000);
    const eat = (e: Event) => { e.stopImmediatePropagation(); e.preventDefault(); done(); };
    const soon = () => { clearTimeout(timer); timer = setTimeout(() => done(), TitlePage.swallowed); };
    const watch: [string, (e: Event) => void][] = [['click', eat], ['pointerup', soon], ['pointercancel', soon],
      ['pointerdown', () => done()]];
    const done = () => {
      clearTimeout(timer);
      for (const [type, on] of watch) { window.removeEventListener(type, on, true); }
    };
    for (const [type, on] of watch) { window.addEventListener(type, on, true); }
  }
  // How much of the studio's mark is still to play: by the early mark's own animations (the furthest along of them),
  // the whole where none has started yet, or where there is no early mark.
  static left(): number {
    const el = TitlePage.early(), played = el?.getAnimations?.({ subtree: true })
      .map(a => Number(a.currentTime ?? 0)).reduce((m, t) => Math.max(m, t), 0) ?? 0;
    return Math.max(0, Ident.length - played);
  }
  // The studio's mark drawn by the page itself before the script, where it is being played (see SiteBuild.mark).
  static early(): HTMLElement | null {
    const el = typeof document === 'undefined' ? null : document.getElementById('pre-ident');
    return el && !document.documentElement.classList.contains('no-pre-ident') ? el : null;
  }
  // How long after the press is let go its click may still come, in milliseconds.
  static readonly swallowed = 350;
  private static shown = false;
  private static first(asked: boolean): Beat {
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const again = TitlePage.shown;
    TitlePage.shown = true;
    if (still || (navigator.webdriver && !asked) || again) { return 'ready'; }
    let seen = false;
    try { seen = sessionStorage.getItem('kyrie.ident') === '1'; sessionStorage.setItem('kyrie.ident', '1'); } catch { /* no storage */ }
    return seen && !asked ? 'reveal' : 'ident';
  }
  private static options(app: ReaderApp) { app.setState({ phase: 'options' }); }
  static load(app: ReaderApp, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { void file.text().then(text => app.opening.resume(text)); }
  }
}

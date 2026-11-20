import { useEffect, useState, type ChangeEvent, type CSSProperties, type MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Identity } from '../../src/presentation/identity';
import { Ident } from './ident';
import { Build } from './build';
import { Hold } from './instrument/hold';
import { createPortal } from 'react-dom';
import { ChoiceRow } from './stage/choice-row';
import { PageFrame } from './page-frame';
import { BeginMenu } from './begin-menu';

type Beat = 'ident' | 'dark' | 'reveal' | 'ready';
// A way in, by what it is: the sky behind the title answers the one the hand or the keys are on.
type Way = 'continue' | 'begin' | 'encyclopedia' | 'options';

// The title, the first page of the game's own language (the owner, 14 November, TO-01..03: "a quiet, extremely
// legible foreground over a deeper, more complex, subtly moving background"; the moving double box about the choices
// had been where he bounced off). Once a session the studio's mark draws its seven towers on a horizon; its horizon
// becomes the title's own as the sky comes up behind it (no black between), and the game's name is lit from its middle
// letter outward. The ways in are the game's rows (see ChoiceRow), centred: the one the hand or the keys are on has
// the strong gold mark at its left at once, and nothing moves to get there; ceremonial gold, the entry's alone (inside
// the game gold is the aim followed). The sky answers it over most of a second, never the menu: New game turns it to
// the road's dawn far off, Continue to the hearth's warmth close by, the Encyclopedia to lamplight, Options to the
// quiet dark. Any key or touch skips straight to the ways in. One who asks for less motion is shown them at once, and
// the sky changes without moving. Nothing here says how a country is made; a save brought from elsewhere is opened
// from Options, and the ways in for testing appear only when the address asks (?dev). The names shown are the game's
// and the studio's (src/presentation/identity.ts).
export class TitlePage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, saved = s.saved, query = app.props.query, dev = query.has('dev');
    const named = Identity.named(query), [beat, skip] = TitlePage.useBeat(query.has('ident') || query.has('studio'));
    const first: Way = saved ? 'continue' : 'begin', [active, activate] = useState<Way>(first);
    // The way the hand or the keys are on, marked at once by the reticule, the one sign of focus; the sky is still.
    const item = (way: Way) => ({ 'data-nav': true, onMouseEnter: () => activate(way), onFocus: () => activate(way),
      'data-considered': active === way || undefined, 'aria-current': active === way || undefined, 'data-way': way });
    // The keys are on the first way in as soon as it is offered, not one Tab away: New game is lit as the current way,
    // so Enter held on it begins (M22: a held Enter on the lit row had done nothing).
    // And again on coming back from how a new game begins (Escape): the keys on the first way in again.
    useEffect(() => {
      if ((beat === 'reveal' || beat === 'ready') && s.phase === 'title') { TitlePage.focus(first); }
    }, [beat, first, s.phase]);
    // New game asks first how the game begins, where the ways in stood, under the same name (see BeginMenu).
    return <PageFrame.View kind="title" className={`opening title-page beat-${beat}`}
      attrs={{ 'data-mode': s.phase === 'begin' ? 'begin' : 'title' }}
      body="title-main" hidden={beat === 'ident' || beat === 'dark'}
      background={<>{beat !== 'ident' && <TitlePage.Motes />}
        {beat === 'ident' && !TitlePage.early() && <Ident.View studio={named.studio} />}</>}
      header={<><TitlePage.Mark name={named.game} />
        <p className="horizon" aria-hidden="true"><i /></p>
        <p className="lede">Vol I: A History of Emprise</p></>}
      menu={s.phase === 'begin' ? <BeginMenu.View app={app} /> : <nav className="title-menu" aria-label="Ways in">
        <ul>
          {/* The game it continues is said to a pointer and a reader only, never as a line of its own (the owner, 17
              November: the line beneath naming the game was strange). */}
          {saved && <li><ChoiceRow.Button className="way-in" data={{ action: 'continue' }} label="Continue"
            plain="neutral" own={{ ...Hold.bind(app.opening.carryOn), ...item('continue'),
              ...TitlePage.saved(saved) }} /></li>}
          <li><ChoiceRow.Button className="way-in" data={{ action: 'begin' }} label="New game"
            plain="every" own={{ ...Hold.bind(app.opening.anew), ...item('begin') }} /></li>
          {/* One thing said: its name (that it opens in a new tab is said to a screen reader, never written out beside
              it: the owner, 15 November; nor on hover: 18 November, OR-79). Its mark is the row's own at the left, in
              the blue of knowledge, the atlas's tone for what is learnt; no icon (the owner, 18 November, OR-86:
              "there shouldn't be icons for the encyclopedia; I just meant the left atlas-indicator should be blue"). */}
          <li><ChoiceRow.Link className="way-in" data={{ action: 'encyclopedia' }} href="encyclopedia/index.html"
            label={<span aria-hidden="true">The encyclopedia</span>} plain="knowing"
            own={{ target: '_blank', rel: 'noopener', 'aria-label': 'The encyclopedia, opens in a new tab',
              ...item('encyclopedia') }} /></li>
          <li><ChoiceRow.Button className="way-in" data={{ action: 'options' }} label="Options" plain="neutral"
            own={item('options')} onClick={TitlePage.options.bind(null, app)} /></li>
        </ul>
      </nav>}
      over={<>{dev && <TitlePage.Dev app={app} />}
        {beat === 'ident' && <TitlePage.Skip skip={skip} />}
        {beat !== 'ident' && <p className="build" data-id="build">{`build ${Build.commit}`}</p>}
        <Toast.View app={app} /></>} />;
  }
  // The saved game's place and time, as Continue's name to a reader: never hover text (the owner, 18 November, OR-79).
  static saved(saved: { where?: string; when?: string }): { 'aria-label'?: string } {
    const said = [saved.where, saved.when].filter(Boolean).join(' · ');
    return said ? { 'aria-label': `Continue: ${said}` } : {};
  }
  static focus(way: Way) {
    if (!document.activeElement || document.activeElement === document.body) {
      document.querySelector<HTMLElement>(`[data-way="${way}"]`)?.focus({ preventScroll: true });
    }
  }
  // The game's name, a letter at a time from the middle outward (the towers rose so), each out of a blur and a glow;
  // sized by its letters, so that whichever name is asked for (?name=) keeps to one line on a phone. A space between
  // words is set wider than the tracking between letters (a third of an em more), so that two words read as two.
  static Mark({ name }: { name: string }) {
    const letters = [...name], mid = (letters.length - 1) / 2;
    return (
      <h1 className="mark" aria-label={Identity.spoken(name)}
        style={{ '--letters': letters.length } as CSSProperties}>
        {letters.map((c, i) => <span key={i} className={c === ' ' ? 'gap' : undefined}
          style={{ animationDelay: `${TitlePage.lit + Math.round(Math.abs(i - mid) * TitlePage.spread)}ms` }}>
          {c === ' ' ? '\u00a0' : c}</span>)}
      </h1>
    );
  }
  // Sparks going up slowly through the dark over the country, as off a fire out of sight below the title: a few, each
  // its own way across and its own pace, the same every time (no chance in it), gone for one who asks for less motion.
  // Back as they were before look-7 (IG-14, the owner: the title was much better with them; quiet never meant still):
  // their own slow drift, answering nothing the hand does.
  static Motes() {
    return (
      <div className="motes" aria-hidden="true">
        {Array.from({ length: TitlePage.motes }, (_, i) => <i key={i} style={{ '--x': `${(i * 37 + 11) % 100}%`,
          '--d': `${-((i * 7919) % 23)}s`, '--t': `${16 + (i * 13) % 11}s`, '--s': `${2 + (i % 3)}px` } as CSSProperties} />)}
      </div>
    );
  }
  static readonly motes = 34;
  // When the name's middle letter begins to be lit, after the black; and how long the whole title takes to come up.
  static readonly lit = 120;
  // Between one letter's light and the next out from the middle: close enough that the name comes up as a word, never
  // one blurred letter alone in the dark (M22's second review, OR-44: "a loose R"; it had been 130 ms).
  static readonly spread = 70;
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
  // Skip, held: a small reticle at the foot of the corner and the word, quiet, done when its ring fills (see Hold), so
  // that no touch meant for anything else cuts the studio's mark short.
  // On the page itself, beside the early mark (which is the page's, not the app's: SiteBuild.mark), so that it stands
  // above it.
  static Skip({ skip }: { skip: () => void }) {
    const button = <button type="button" className="skip-mark" data-action="skip" aria-label="Hold to skip"
      {...Hold.bind(skip)}><i className="skip-ring" aria-hidden="true" /><span>Skip</span></button>;
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
  // For testing: every campaign the build carries, by name.
  static Dev({ app }: { app: ReaderApp }) {
    const campaigns = app.state.catalog?.campaigns ?? [];
    return (
      <section className="dev" aria-label="Testing">
        <p className="label">Testing</p>
        <ol>{campaigns.map(c => <li key={c.id}><ChoiceRow.Button data={{ action: 'campaign', id: c.id }} label={c.title}
          aside={c.seed} plain="neutral" own={{ 'data-nav': true }} onClick={TitlePage.pick.bind(null, app)} />
        </li>)}</ol>
      </section>
    );
  }
  private static options(app: ReaderApp) { app.setState({ phase: 'options' }); }
  private static pick(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { void app.opening.pick(e.currentTarget.dataset.id!); }
  static load(app: ReaderApp, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { void file.text().then(text => app.opening.resume(text)); }
  }
}

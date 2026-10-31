import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type MouseEvent,
  type RefObject } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Likeness } from '../../src/paintings/likeness';
import { Identity } from '../../src/presentation/identity';
import { Ident } from './ident';

type Beat = 'ident' | 'dark' | 'reveal' | 'ready';
// Where the gold mark stands within the menu: the chosen way's name, from its left edge and its middle, and how wide.
type Place = { x: number; y: number; w: number };

// The title. Once a session, the studio's mark draws itself and goes out; a moment of black; then the game's name is
// lit from its middle letter outward while the country's painting comes up slowly out of the dark behind it, a gold
// horizon is drawn under it and its diamond kindled (the mark's star again), and the few ways in arrive one after
// another, centred: carry on, begin, the encyclopedia, options. Any key or touch skips straight to them, and is only
// that: a tap where Begin is about to be begins nothing. One who asks for less motion is shown them at once, and so is
// one coming back to the title from Options. A gold diamond before the chosen way's name and a short line after it
// close about the way the pointer or the keys are on, and slide and widen to the next. Nothing here says how a
// country is made; a save file brought from elsewhere is opened from Options, and the ways in for testing (a named
// campaign) appear only when the address asks (?dev). The names shown are the game's and the studio's (src/presentation/identity.ts).
export class TitlePage {
  // The country behind the title: wide country with a way into it, a different one each day.
  static readonly views = ['indolence', 'idyll', 'bridge', 'wintre', 'fair', 'herd', 'city', 'harvest'];
  static view(day = Math.floor(Date.now() / 86400000)): string { return TitlePage.views[day % TitlePage.views.length]!; }
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, saved = s.saved, query = app.props.query, dev = query.has('dev'), view = TitlePage.view();
    const named = Identity.named(query), beat = TitlePage.useBeat(query.has('ident') || query.has('studio'));
    const [active, activate] = useState(0), credit = Likeness.credits[view];
    const menu = useRef<HTMLElement>(null), items = useRef<(HTMLElement | null)[]>([]);
    const at = TitlePage.useIndicator(menu, items, active, `${beat}:${saved ? 1 : 0}`);
    const item = (i: number) => ({ ref: (el: HTMLElement | null) => { items.current[i] = el; },
      onMouseEnter: () => activate(i), onFocus: () => activate(i), 'aria-current': active === i || undefined });
    let n = 0;
    return (
      <div className={`opening title-page beat-${beat}`} data-mode="title">
        {beat === 'ident' && <Ident.View studio={named.studio} />}
        <main className="title-main" aria-hidden={beat === 'ident' || beat === 'dark' || undefined}>
          <TitlePage.Mark name={named.game} />
          <p className="horizon" aria-hidden="true"><i /></p>
          <p className="lede">Vol I: A History of Emprise</p>
          <nav className="title-menu" aria-label="Ways in" ref={menu}>
            {at && <span className="indicator" aria-hidden="true"
              style={{ transform: `translate(${at.x}px, ${at.y}px)`, width: `${at.w}px` }} />}
            <ul>
              {saved && <li><button type="button" className="way-in" data-nav data-action="continue" onClick={app.opening.carryOn}
                {...item(n++)}><span className="n">Continue</span>
                <span className="why">{[saved.where, saved.when].filter(Boolean).join(' · ')}</span></button></li>}
              <li><button type="button" className="way-in" data-nav data-action="begin" onClick={app.opening.anew} {...item(n++)}>
                <span className="n">{saved ? 'Begin anew' : 'Begin'}</span></button></li>
              <li><a className="way-in" data-nav data-action="handbooks" href="handbook/index.html" {...item(n++)}>
                <span className="n">The encyclopedia</span></a></li>
              <li><button type="button" className="way-in" data-nav data-action="options" {...item(n++)}
                onClick={TitlePage.options.bind(null, app)}><span className="n">Options</span></button></li>
            </ul>
          </nav>
          {dev && <TitlePage.Dev app={app} />}
        </main>
        {beat !== 'ident' && credit && <p className="credit" aria-hidden="true">{credit}</p>}
        <Toast.View app={app} />
      </div>
    );
  }
  // Where the gold mark stands: about the chosen way's name, a little before it and a little after. Measured within
  // the menu from the name's own place, not from where it is drawn (each way rises into place as the title comes up),
  // and again once the letters' face has come and whenever the screen is turned or resized.
  static useIndicator(menu: RefObject<HTMLElement | null>, items: RefObject<(HTMLElement | null)[]>, active: number,
    again: string): Place | undefined {
    const [at, place] = useState<Place>();
    useLayoutEffect(() => {
      const measure = () => {
        const n = items.current?.[active]?.querySelector<HTMLElement>('.n');
        let x = 0, y = 0, e: HTMLElement | null = n ?? null;
        while (e && e !== menu.current) {
          x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent as HTMLElement | null;
        }
        const reach = TitlePage.reach;
        place(n && e ? { x: x - reach, y: y + n.offsetHeight / 2, w: n.offsetWidth + 2 * reach } : undefined);
      };
      measure();
      void document.fonts?.ready.then(measure);
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }, [menu, items, active, again]);
    return at;
  }
  // How far the gold mark reaches beyond the name on either side, in pixels: the diamond before it, the line after.
  static readonly reach = 22;
  // The game's name, a letter at a time from the middle outward (the towers rose so), each out of a blur and a glow;
  // sized by its letters, so that whichever name is asked for (?name=) keeps to one line on a phone. A space between
  // words is set wider than the tracking between letters (a third of an em more), so that two words read as two.
  static Mark({ name }: { name: string }) {
    const letters = [...name], mid = (letters.length - 1) / 2;
    return (
      <h1 className="mark" aria-label={Identity.spoken(name)}
        style={{ '--letters': letters.length } as CSSProperties}>
        {letters.map((c, i) => <span key={i} className={c === ' ' ? 'gap' : undefined}
          style={{ animationDelay: `${TitlePage.lit + Math.round(Math.abs(i - mid) * 130)}ms` }}>
          {c === ' ' ? '\u00a0' : c}</span>)}
      </h1>
    );
  }
  // When the name's middle letter begins to be lit, after the black; and how long the whole title takes to come up.
  static readonly lit = 120;
  static readonly reveal = 3200;
  // Where the opening has got to: the ident once a session (and when the address asks, ?ident or ?studio=), then
  // black, then the title coming up; skipped by any key or touch, and never shown to one who asks for less motion or
  // to automation. Coming back to the title within the page (from Options) it is simply there. The key or touch that
  // skips does nothing else: the ways in are under a finger before they are seen (Begin's row is the menu's width,
  // just below the screen's middle, where a thumb falls), and a touch's click comes after its pointerdown whatever
  // that pointerdown's handler does, so the click is swallowed too (TitlePage.swallow).
  static useBeat(asked: boolean): Beat {
    const [beat, go] = useState<Beat>(() => TitlePage.first(asked));
    useEffect(() => {
      if (beat === 'ready') { return; }
      const next: Record<Beat, [Beat, number]> = { ident: ['dark', Ident.length], dark: ['reveal', 500],
        reveal: ['ready', TitlePage.reveal], ready: ['ready', 0] };
      const [to, after] = next[beat], timer = setTimeout(() => go(to), after);
      const skip = (e: Event) => { e.stopImmediatePropagation(); e.preventDefault();
        if (e.type === 'pointerdown') { TitlePage.swallow(); }
        go('ready'); };
      window.addEventListener('keydown', skip, { capture: true });
      window.addEventListener('pointerdown', skip, { capture: true });
      return () => { clearTimeout(timer); window.removeEventListener('keydown', skip, { capture: true });
        window.removeEventListener('pointerdown', skip, { capture: true }); };
    }, [beat]);
    return beat;
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
        <ol>{campaigns.map(c => <li key={c.id}><button type="button" className="act" data-nav data-action="campaign"
          data-id={c.id} onClick={TitlePage.pick.bind(null, app)}>{c.title}</button> <span className="note">{c.seed}</span></li>)}</ol>
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

import { useEffect, useState, type ChangeEvent, type CSSProperties, type MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Identity } from '../../src/presentation/identity';
import { Ident } from './ident';
import { Build } from './build';

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
    const named = Identity.named(query), beat = TitlePage.useBeat(query.has('ident') || query.has('studio'));
    const first: Way = saved ? 'continue' : 'begin', [active, activate] = useState<Way>(first);
    // The way the hand or the keys are on, marked at once by the reticule, the one sign of focus; the sky is still.
    const item = (way: Way) => ({ onMouseEnter: () => activate(way), onFocus: () => activate(way),
      'aria-current': active === way || undefined, 'data-way': way });
    const mark = <i className="row-mark" aria-hidden="true" />;
    return (
      <div className={`opening title-page beat-${beat}`} data-mode="title">
        <TitlePage.Sky />
        {beat !== 'ident' && <TitlePage.Motes />}
        {beat === 'ident' && <Ident.View studio={named.studio} />}
        <main className="title-main" aria-hidden={beat === 'ident' || beat === 'dark' || undefined}>
          <TitlePage.Mark name={named.game} />
          <p className="horizon" aria-hidden="true"><i /></p>
          <p className="lede">Vol I: A History of Emprise</p>
          <nav className="title-menu" aria-label="Ways in">
            <ul>
              {saved && <li><button type="button" className="way-in" data-nav data-action="continue" onClick={app.opening.carryOn}
                {...item('continue')}>{mark}<span className="n">Continue</span>
                <span className="why">{[saved.where, saved.when].filter(Boolean).join(' · ')}</span></button></li>}
              <li><button type="button" className="way-in" data-nav data-action="begin" onClick={app.opening.anew}
                {...item('begin')}>{mark}<span className="n">New game</span></button></li>
              <li><a className="way-in" data-nav data-action="encyclopedia" href="encyclopedia/index.html" target="_blank"
                rel="noopener" {...item('encyclopedia')}>{mark}<span className="n">The encyclopedia</span>
                <span className="why">In a new tab ↗</span></a></li>
              <li><button type="button" className="way-in" data-nav data-action="options" {...item('options')}
                onClick={TitlePage.options.bind(null, app)}>{mark}<span className="n">Options</span></button></li>
            </ul>
          </nav>
          {dev && <TitlePage.Dev app={app} />}
        </main>
        {beat !== 'ident' && <p className="build" data-id="build">{`build ${Build.commit}`}</p>}
        <Toast.View app={app} />
      </div>
    );
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
          style={{ animationDelay: `${TitlePage.lit + Math.round(Math.abs(i - mid) * 130)}ms` }}>
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
  // The sky the title stands under, in layers: the deep of it, a light low on the horizon, and a far ridge with the
  // seven towers of the studio's mark small upon it (the horizon the mark drew becomes this one). It is completely
  // still, whatever the hand is on (IG-11): no light answering focus, no haze, no sparks.
  static Sky() {
    const towers = Ident.towers, w = 1200, base = 540, gap = 22, x0 = 640 - (towers.length - 1) * gap / 2;
    return (
      <div className="title-sky" aria-hidden="true">
        <i className="sky-deep" />
        {/* The first stars, fixed (the same each time), and few: depth, not ornament. */}
        <svg className="sky-stars" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" focusable="false">
          {TitlePage.stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        </svg>
        <i className="sky-light" />
        <svg className="sky-ridge" viewBox={`0 0 ${w} 600`} preserveAspectRatio="xMidYMax slice" focusable="false">
          <path d={`M0 ${base + 8} C 180 ${base - 22} 330 ${base - 6} 470 ${base - 14} S 760 ${base - 30} 900 ${base - 10}`
            + ` S 1110 ${base - 18} ${w} ${base - 4} L ${w} 600 L 0 600 Z`} />
          {towers.map((h, i) => <rect key={i} x={x0 + i * gap - 1.6} y={base - 14 - h * 34} width={3.2}
            height={h * 34 + 6} />)}
          {/* The mark's lamps, far off now: lit on the towers as the light finds them. */}
          {towers.map((h, i) => <circle key={`l${i}`} className={i === 3 ? 'lamp seventh' : 'lamp'} cx={x0 + i * gap}
            cy={base - 14 - h * 34 - 1} r={i === 3 ? 1.8 : 1.3} />)}
        </svg>
      </div>
    );
  }
  // Forty stars over the upper sky, placed by a fixed rule (no chance in it), the brighter fewer.
  static readonly stars: [number, number, number][] = Array.from({ length: 40 }, (_, i) =>
    [(i * 271 + 37) % 1000, (i * 113 + 19) % 330, i % 7 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : .7]);
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
      // A touch on a way in already coming up (the reveal) is that way, at once (the owner, 6 November: New Game in
      // one click); anything else only brings the ways in.
      const skip = (e: Event) => {
        if (beat === 'reveal' && e.type === 'pointerdown' && (e.target as Element | null)?.closest?.('.way-in')) {
          go('ready'); return;
        }
        e.stopImmediatePropagation(); e.preventDefault();
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

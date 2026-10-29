import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Likeness } from '../../src/paintings/likeness';
import { Ident } from './ident';

type Beat = 'ident' | 'dark' | 'reveal' | 'ready';

// The title. Once a session, the studio's mark draws itself and goes out; a moment of black; then the country's
// painting comes up out of the dark behind the name, a gold horizon is drawn under it, and the few ways in appear one
// after another, centred: carry on, begin, the encyclopedia, options. Any key or touch skips straight to them, and
// one who asks for less motion is shown them at once. A gold diamond and its line stand at the way the pointer or
// the keys are on, and slide to the next. Nothing here says how a country is made; a save file brought from elsewhere
// is opened from Options, and the ways in for testing (a named campaign) appear only when the address asks (?dev).
export class TitlePage {
  // The country behind the title: wide country with a way into it, a different one each day.
  static readonly views = ['indolence', 'idyll', 'bridge', 'wintre', 'fair', 'herd', 'city', 'harvest'];
  static view(day = Math.floor(Date.now() / 86400000)): string { return TitlePage.views[day % TitlePage.views.length]!; }
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, saved = s.saved, dev = app.props.query.has('dev'), view = TitlePage.view();
    const beat = TitlePage.useBeat(app.props.query.has('ident'));
    const [active, activate] = useState(0);
    const items = useRef<(HTMLElement | null)[]>([]), [at, place] = useState<number>();
    useLayoutEffect(() => {
      const el = items.current[active];
      place(el ? el.offsetTop + el.offsetHeight / 2 : undefined);
    }, [active, beat, saved]);
    const item = (i: number) => ({ ref: (el: HTMLElement | null) => { items.current[i] = el; },
      onMouseEnter: () => activate(i), onFocus: () => activate(i), 'aria-current': active === i || undefined });
    let n = 0;
    return (
      <div className={`opening title-page beat-${beat}`} data-mode="title">
        {beat === 'ident' && <Ident.View />}
        <main className="title-main" aria-hidden={beat === 'ident' || beat === 'dark' || undefined}>
          <h1 className="mark" aria-label="Kyrie">{[...'KYRIE'].map((c, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }}>
            {c}</span>)}</h1>
          <p className="horizon" aria-hidden="true"><i /></p>
          <p className="lede">A country that was there before you, people who live in it, and the road out of town.</p>
          <nav className="title-menu" aria-label="Ways in">
            {at !== undefined && <span className="indicator" aria-hidden="true" style={{ transform: `translateY(${at}px)` }} />}
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
        {beat !== 'ident' && <p className="credit" aria-hidden="true">{Likeness.credits[view] ?? 'Painter unrecorded'}</p>}
        <Toast.View app={app} />
      </div>
    );
  }
  // Where the opening has got to: the ident once a session (and when the address asks, ?ident), then black, then the
  // title coming up; skipped by any key or touch, and never shown to one who asks for less motion or to automation.
  static useBeat(asked: boolean): Beat {
    const [beat, go] = useState<Beat>(() => TitlePage.first(asked));
    useEffect(() => {
      if (beat === 'ready') { return; }
      const next: Record<Beat, [Beat, number]> = { ident: ['dark', 2600], dark: ['reveal', 500], reveal: ['ready', 2200],
        ready: ['ready', 0] };
      const [to, after] = next[beat], timer = setTimeout(() => go(to), after);
      const skip = (e: Event) => { if (beat === 'ident' || beat === 'dark') { e.stopImmediatePropagation(); e.preventDefault(); }
        go('ready'); };
      window.addEventListener('keydown', skip, { capture: true });
      window.addEventListener('pointerdown', skip, { capture: true });
      return () => { clearTimeout(timer); window.removeEventListener('keydown', skip, { capture: true });
        window.removeEventListener('pointerdown', skip, { capture: true }); };
    }, [beat]);
    return beat;
  }
  private static first(asked: boolean): Beat {
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || (navigator.webdriver && !asked)) { return 'ready'; }
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

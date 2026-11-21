import type { CSSProperties } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { TitlePage } from './title-page';
import { PageFrame } from './page-frame';
import { Typography } from '../../src/presentation/typography';

// While the engine draws the country or finds where you left off: what it is doing, said once. Setting out from the
// choice of a life, only that, over the country chosen in: the country's question ("Who comes to Acornweald?") had
// been asked again of one who had just answered it, over the engine's own steps (the opening's critique).
export class LoadingPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, heading = s.setting?.pitch.heading ?? app.savedGame?.title;
    // Drawing a country after the title, and setting out from the choice of a life, in the title's own dark with its
    // embers: one passage from the title into play, not a black page between, nor a blurred photograph while the world
    // is drawn (TO-03, IG-05; the owner, 15 November: just embers, no background).
    // Setting out on a life whose opening its origin tells (OR-23): while the world is made, that opening's first page,
    // the chapter and why the company came, over its painting; not a checklist, nor a dark frame. When the world is
    // ready the opening's own first page is this one, the same words on the same painting, and goes on from it.
    const opening = LoadingPage.opening(app);
    if (opening) {
      return <PageFrame.View kind="opening" body="prologue-body" className="prologue-page page-beat loading"
        attrs={{ 'data-mode': 'loading', 'data-beat': '0', 'aria-busy': 'true', 'aria-label': 'The opening' }}
        header={<p className="kicker chapter kind-opening" data-id="chapter">{Typography.curl(opening.title)}</p>}
        narrative={<p className="beat" data-id="beat" aria-live="polite">{Typography.curl(opening.beats[0]!)}</p>} />;
    }
    return (
      <div className={`opening loading sky-page${s.leaving ? ' leaving' : ''}`} data-mode="loading" aria-busy="true">
        <TitlePage.Motes />
        <main>
          {!s.leaving && heading && <h1>{heading}</h1>}
          <p className="stage" role="status" aria-live="polite">{s.leaving ? 'Setting out' : s.stage || 'Opening'}…</p>
          {s.leaving && <LoadingPage.Steps stage={s.stage} step={s.step} />}
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  // The opening shown while setting out: the life's origin's, as the country gives it (Setting.origins), where the
  // page tells openings apart (ReaderOpening.apart) and the painting is up (ReaderOpening.rising).
  static opening(app: ReaderApp): { title: string; beats: string[] } | undefined {
    const s = app.state;
    if (s.phase !== 'loading' || !s.leaving || !s.approach || !app.opening.apart()) { return undefined; }
    const opening = s.setting?.origins?.find(o => o.id === s.origin)?.opening;
    return opening?.beats.length ? opening : undefined;
  }
  // What the engine is doing while the company sets out, step by step as it reports each beginning (M19-49): no
  // share of the whole is guessed at.
  static readonly steps = ['Drawing the world', 'Placing its people', 'Telling where you are'];
  // The step under way breathes, so that the page is plainly alive while the engine works apart from it, and where
  // the engine says how far through it is (so many parts of the world of so many), a thin line fills: a twenty-second
  // wait on an iPad had looked like a page that had stopped (the owner, 11 November).
  static Steps({ stage, step }: { stage: string; step?: [number, number] }) {
    const at = LoadingPage.steps.indexOf(stage);
    if (at < 0) { return null; }
    return <ol className="steps" aria-hidden="true">{LoadingPage.steps.map((name, i) =>
      <li key={name} className={i < at ? 'done' : i === at ? 'now' : ''}>{name}
        {i === at && step && <span className="step-of" style={{ '--of': `${Math.round(100 * step[0] / step[1])}%` } as
          CSSProperties}><i /></span>}</li>)}</ol>;
  }
}

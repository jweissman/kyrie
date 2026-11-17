import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import { Typography } from '../../../src/presentation/typography';
import { PressGuard } from '../press-guard';
import { ComposedRow } from './composed-row';
import { Glyphs } from './glyphs';
import { ChoiceRow } from '../stage/choice-row';
import { PageFrame, type PageParts } from '../page-frame';

// What every step's page shares: the page's own classes and marks, its rail (back, another country, set out now) and
// what stands over it (the life so far, signed).
type Frame = Pick<PageParts, 'className' | 'attrs' | 'rail' | 'over'>;
import { ComposedOptions, type Offer } from './composed-options';
import { Observatory } from './observatory';
import { NameStep } from './name-step';
import { Signature } from './signature';

// Creation as one composition in the game's own grammar (the owner, 15 November): every step
// is the engine's (CreationFlow: its question, its options in its order, which is chosen), and every step is answered
// the same way: the hand or the keys consider an option (it is lit, its sentence said, the sky turned to it), and a
// press chooses it and goes on, as an act in the game does. Ancestry and calling keep their cards; the rest are rows.
// Back (Escape, or the corner) returns to a step with its choice still marked. Last, setting out is the one act held:
// its ring filled, or tapped once to be asked and again to go.
export class ComposedCreation {
  static readonly folded = 4;
  static View({ app }: { app: ReaderApp }) {
    // Begun at the engine's first step (the reason for coming is the world's to give, not asked: CreationFlow).
    const [went, go] = useState<string>(''), [roll, reroll] = useState(0), [more, turn] = useState(0);
    const at = went || ComposedCreation.ids(app)[0] || 'go';
    const s = app.state;
    useEffect(() => { PressGuard.changed(); turn(0); }, [at]);
    useEffect(() => ComposedCreation.escape(() => {
      const ids = ComposedCreation.ids(app), i = ids.indexOf(at), to = i < 0 ? ids.at(-1) : ids[i - 1];
      if (to) { go(to); return true; }
      return false;
    }), [at, app]);
    if (!s.setting || !s.catalog || !s.party[0]) { return null; }
    const steps = app.opening.steps(), ids = ComposedCreation.ids(app), i = ids.indexOf(at);
    const step = i >= 0 ? steps.find(x => x.id === ids[i]) : undefined, next = () => go(ids[i + 1] ?? 'go');
    const back = i >= 0 ? ids[i - 1] : ids.at(-1);
    const frame = { className: 'creation composed', attrs: { 'data-mode': 'create', 'data-page': step?.id ?? 'go' },
      // The rail is marks, never words (the owner, M21; M22's second review, OR-42: Back, Set out now and Another
      // country had read as loose links beside the menu), each named on asking.
      rail: <nav className="creation-edge" aria-label="The choice of a life">
        {back ? <ComposedCreation.Mark id="back" action="back" label="Back" go={() => go(back)} />
          : <ComposedCreation.Mark id="another" action="another" label="Another country" go={app.opening.anew} />}
        {step && <ComposedCreation.Mark id="go_on" action="start" label="Set out now" go={app.opening.begin} />}
      </nav>,
      over: <Signature.View app={app} likeness={!step || step.id === 'name'} passed={step ? ids.slice(0, i) : ids} /> };
    return step ? <ComposedCreation.Step key={step.id} app={app} step={step} roll={roll} reroll={() => reroll(roll + 1)}
      more={more} unfold={() => turn(m => m + 1)} onward={next} frame={frame} />
      : <ComposedCreation.Go key="go" app={app} frame={frame} />;
  }
  static Mark({ id, action, label, go }: { id: string; action: string; label: string; go: () => void }) {
    return <button type="button" className={`rail-mark edge-mark ${action}`} data-action={action} aria-label={label}
      title={label} onClick={go}><Glyphs.View id={id} className="rail-glyph" /></button>;
  }
  // The flow's steps as the composition asks them, in its order: every one, how you present among them.
  static ids(app: ReaderApp): string[] { return app.opening.steps().map(x => x.id); }
  // Escape goes back a step (and is the keys' alone while it does), unless a sheet is open over the page.
  private static escape(back: () => boolean) {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('[aria-modal="true"]')) { return; }
      if (back()) { e.preventDefault(); e.stopImmediatePropagation(); }
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }
  static Step({ app, step, roll, reroll, more, unfold, onward, frame }: { app: ReaderApp; step: CreationStep; roll: number;
    reroll: () => void; more: number; unfold: () => void; onward: () => void; frame: Frame }) {
    // What is lit first: the choice already made where it is among those offered, else the first (M22's review: a mage's
    // "before" step had lit nothing and described Brawn, the warrior's default, which a mage is not offered).
    const offer = ComposedOptions.of(app, step, roll);
    const first = (offer.options.some(o => o.id === step.chosen) ? step.chosen : offer.options[0]?.id) ?? '';
    const [lit, consider] = useState(first), [flare, flared] = useState<string>(), leaving = useRef(false);
    useEffect(() => { ComposedCreation.focus(); }, []);
    const choose = (id: string) => {
      if (leaving.current) { return; }
      leaving.current = true;
      if (step.id === 'name') { NameStep.take(app, id); } else { app.opening.choose(step.id, id); }
      // The sky lights the sign taken for a moment before the page goes on; nothing else waits.
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (step.id === 'sign' && !still) { flared(id); window.setTimeout(onward, ComposedCreation.flare); } else { onward(); }
    };
    const look = (id: string) => { if (ComposedRow.moved()) { consider(id); } };
    return <PageFrame.View kind="creation" {...frame} body="composed-step"
      column="composed-col"
      background={step.id === 'sign' && <Observatory.View signs={app.state.catalog!.signs} focus={lit}
        chosen={step.chosen} flare={flare} onFocus={look} onChoose={choose} />}
      header={<h1 className="ask">{Typography.curl(step.ask)}</h1>}
      narrative={<p className="consider" aria-live="polite">{Typography.curl(offer.say(lit))}</p>}
      menu={<ComposedCreation.Options offer={offer} more={more} unfold={unfold} chosen={step.chosen} lit={lit}
        consider={consider} choose={choose}
        after={step.id === 'name' && <ComposedCreation.Naming app={app} reroll={reroll} onward={onward} />} />} />;
  }
  static readonly flare = 340;
  static Options({ offer, more, unfold, chosen, lit, consider, choose, after }: { offer: Offer; more: number;
    unfold: () => void; chosen?: string; lit: string; consider: (id: string) => void; choose: (id: string) => void;
    after?: ReactNode }) {
    // Folded, More… is the fourth row (the owner, 17 November: never more than four in view).
    const all = offer.options, per = !offer.all && all.length > ComposedCreation.folded ? ComposedCreation.folded - 1
      : ComposedCreation.folded;
    // Never more than four at once, cards or rows (the owner, 15 and 16 November: four in the foreground, the rest a page
    // on, never unfolded): a row turns the page, and the pages go round.
    // Opened on the page that holds what is lit (the choice already made, carried from another life), so that what is
    // told above the rows is of a row in view (M22's third review, OR-25/50: a mage's page had told of Arms, on a page
    // not shown, with no row lit).
    const at = all.findIndex(o => o.id === chosen), from = at >= per ? Math.floor(at / per) : 0;
    const pages = Math.ceil(all.length / per), folds = !offer.all && all.length > per, page = (more + from) % Math.max(1, pages);
    const shown = !folds ? all : all.slice(page * per, page * per + per);
    const rest = !folds ? [] : [<ComposedRow.View key="more" option={{ id: 'more', name: 'More…',
      aside: `${page + 1} of ${pages}` }} onConsider={() => undefined} onChoose={unfold} />];
    return (
      <div className={`composed-rows${shown.length > 7 ? ' many' : ''}`} role="menu">
        {shown.map((o, k) => <ComposedRow.View key={o.id} option={o} n={k < 9 ? k + 1 : undefined} chosen={chosen === o.id}
          lit={lit === o.id} hold onConsider={consider} onChoose={id => choose(id)} />)}
        {rest}
        {after}
      </div>
    );
  }
  // The name's own rows after the names drawn: another roll of the table, and a name of your own written in place.
  static Naming({ app, reroll, onward }: { app: ReaderApp; reroll: () => void; onward: () => void }) {
    return <>
      <ComposedRow.View option={{ id: 'roll', name: 'Roll again', aside: 'other names of your people' }}
        onConsider={() => undefined} onChoose={reroll} />
      <label className="choice-row composed-row composed-write"><i className="prism-bar row-mark" aria-hidden="true"
        style={{ '--prism': ChoiceRow.neutral } as CSSProperties} />
        <input data-field="name" data-nav placeholder="Or write your own" maxLength={40} autoComplete="off" spellCheck={false}
          onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { e.preventDefault(); onward(); } }}
          onChange={e => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>
    </>;
  }
  // Setting out: the life chosen in a line, and the one act of the opening held to be done (a tap asks; again, goes).
  static Go({ app, frame }: { app: ReaderApp; frame: Frame }) {
    useEffect(() => { ComposedCreation.focus(); }, []);
    const name = app.state.party[0]?.name ?? '', country = app.state.setting?.title ?? 'the country';
    const go = () => app.opening.begin();
    return <PageFrame.View kind="creation" {...frame} body="composed-step composed-go" column="composed-col"
      header={<h1 className="ask">{Typography.curl(name)}</h1>}
      narrative={<><p className="life">{Typography.curl(NameStep.life(app).join(' '))}</p>
        <p className="consider" aria-live="polite">Hold to set out.</p></>}
      menu={<div className="composed-rows" role="menu">
        <ComposedRow.View option={{ id: 'set-out', name: `Set out into ${country}`, aside: 'hold' }}
          hold n={1} lit onConsider={() => undefined} onChoose={go} />
      </div>} />;
  }
  // The option already chosen, or the first, in focus as a step comes: the keys are on it at once.
  static focus() {
    const page = document.querySelector('.composed');
    const at = page?.querySelector<HTMLElement>('[data-option][aria-current="true"]')
      ?? page?.querySelector<HTMLElement>('[data-option]:not(:disabled)');
    at?.focus({ preventScroll: true });
  }
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import { Typography } from '../../../src/presentation/typography';
import { PressGuard } from '../press-guard';
import { Touch } from '../instrument/touch';
import { ComposedRow } from './composed-row';
import { ComposedOptions, type Offer } from './composed-options';
import { Observatory } from './observatory';
import { NameStep } from './name-step';
import { Signature } from './signature';

// Creation as one composition in the game's own grammar (the first touch, ?touch; the owner, 15 November): every step
// is the engine's (CreationFlow: its question, its options in its order, which is chosen), and every step is answered
// the same way: the hand or the keys consider an option (it is lit, its sentence said, the sky turned to it), and a
// press chooses it and goes on, as an act in the game does. Ancestry and calling keep their cards; the rest are rows.
// Back (Escape, or the corner) returns to a step with its choice still marked. Last, setting out is the one act held:
// its ring filled, or tapped once to be asked and again to go.
export class ComposedCreation {
  static readonly folded = 4;
  static readonly cards = 4;
  static View({ app }: { app: ReaderApp }) {
    const [at, go] = useState<string>('why'), [roll, reroll] = useState(0), [more, turn] = useState(0);
    const s = app.state;
    useEffect(() => { PressGuard.changed(); turn(0); }, [at]);
    // Its styling is the touch rows' (touch.css, by the presence of data-touch); the press pipeline is not, and is only ?touch.
    useEffect(() => ComposedCreation.styled(), []);
    useEffect(() => ComposedCreation.escape(() => {
      const ids = ComposedCreation.ids(app), i = ids.indexOf(at), to = i < 0 ? ids.at(-1) : ids[i - 1];
      if (to) { go(to); return true; }
      return false;
    }), [at, app]);
    if (!s.setting || !s.catalog || !s.party[0]) { return null; }
    const steps = app.opening.steps(), ids = ComposedCreation.ids(app), i = ids.indexOf(at);
    const step = i >= 0 ? steps.find(x => x.id === ids[i]) : undefined, next = () => go(ids[i + 1] ?? 'go');
    const back = i >= 0 ? ids[i - 1] : ids.at(-1);
    return (
      <div className="creation composed" data-mode="create" data-page={step?.id ?? 'go'}>
        {step ? <ComposedCreation.Step key={step.id} app={app} step={step} roll={roll} reroll={() => reroll(roll + 1)}
          more={more} unfold={() => turn(m => m + 1)} onward={next} />
          : <ComposedCreation.Go key="go" app={app} />}
        <nav className="creation-edge" aria-label="The choice of a life">
          {back ? <button type="button" className="quiet-word back" data-action="back"
            onClick={() => go(back)}>Back</button>
            : <button type="button" className="quiet-word another" data-action="another" onClick={app.opening.anew}>
              Another country</button>}
          {step && <button type="button" className="quiet-word set-out-now" data-action="start"
            onClick={app.opening.begin}>Set out now</button>}
        </nav>
        <Signature.View app={app} likeness={!step || step.id === 'name'} />
      </div>
    );
  }
  // While creation is on screen the root carries data-touch (touch.css styles its rows by the attribute's presence); it is
  // not 'down' or 'up', so Touch.on() stays false and no press pipeline is attached (that is ?touch, and not the default).
  static styled(): () => void {
    const root = document.documentElement, mine = root.dataset.touch === undefined;
    if (mine) { root.dataset.touch = 'creation'; }
    return () => { if (mine && root.dataset.touch === 'creation') { delete root.dataset.touch; } };
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
  static Step({ app, step, roll, reroll, more, unfold, onward }: { app: ReaderApp; step: CreationStep; roll: number;
    reroll: () => void; more: number; unfold: () => void; onward: () => void }) {
    const offer = ComposedOptions.of(app, step, roll), first = step.chosen ?? offer.options[0]?.id ?? '';
    const [lit, consider] = useState(first), [flare, flared] = useState<string>(), leaving = useRef(false);
    useEffect(() => { ComposedCreation.focus(); }, []);
    const choose = (id: string) => {
      if (leaving.current) { return; }
      // A finger has no hover: it considers what is not yet lit, where there is something to consider, and a second
      // touch on it chooses (as the keys' arrows consider and Enter chooses).
      if (Touch.touched() && id !== lit && offer.say(id)) { consider(id); Touch.unstrike(); return; }
      leaving.current = true;
      if (step.id === 'name') { NameStep.take(app, id); } else { app.opening.choose(step.id, id); }
      // The sky lights the sign taken for a moment before the page goes on; nothing else waits.
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (step.id === 'sign' && !still) { flared(id); window.setTimeout(onward, ComposedCreation.flare); } else { onward(); }
    };
    const look = (id: string) => { if (ComposedRow.moved()) { consider(id); } };
    return (
      <div className={`composed-step${offer.cards ? ' with-cards' : ''}`}>
        {step.id === 'sign' && <Observatory.View signs={app.state.catalog!.signs} focus={lit} chosen={step.chosen}
          flare={flare} onFocus={look} onChoose={choose} />}
        <h1 className="ask">{Typography.curl(step.ask)}</h1>
        <div className="composed-col">
          <ComposedCreation.Options offer={offer} more={more} unfold={unfold} chosen={step.chosen} lit={lit}
            consider={consider} choose={choose}
            after={step.id === 'name' && <ComposedCreation.Naming app={app} reroll={reroll} onward={onward} />} />
          <p className="consider" aria-live="polite">{Typography.curl(offer.say(lit))}</p>
        </div>
      </div>
    );
  }
  static readonly flare = 340;
  static Options({ offer, more, unfold, chosen, lit, consider, choose, after }: { offer: Offer; more: number;
    unfold: () => void; chosen?: string; lit: string; consider: (id: string) => void; choose: (id: string) => void;
    after?: ReactNode }) {
    const all = offer.options, per = offer.cards ? ComposedCreation.cards : ComposedCreation.folded;
    // Never more than four at once, cards or rows (the owner, 15 and 16 November: four in the foreground, the rest a page
    // on, never unfolded): a row turns the page, and the pages go round.
    const pages = Math.ceil(all.length / per), folds = !offer.all && all.length > per, page = more % Math.max(1, pages);
    const shown = !folds ? all : all.slice(page * per, page * per + per);
    const rest = !folds ? [] : [<ComposedRow.View key="more" option={{ id: 'more', name: 'More…',
      aside: `${page + 1} of ${pages}` }} onConsider={() => undefined} onChoose={unfold} />];
    if (offer.cards) {
      return <div className="composed-cards">{shown.map(o => <ComposedRow.Card key={o.id} option={o} chosen={chosen === o.id}
        lit={lit === o.id} onConsider={consider} onChoose={choose} />)}{rest}</div>;
    }
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
      <label className="composed-row composed-write"><i className="row-mark" aria-hidden="true" />
        <input data-field="name" data-nav placeholder="Or write your own" maxLength={40} autoComplete="off" spellCheck={false}
          onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { e.preventDefault(); onward(); } }}
          onChange={e => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>
    </>;
  }
  // Setting out: the life chosen in a line, and the one act of the opening held to be done (a tap asks; again, goes).
  static Go({ app }: { app: ReaderApp }) {
    useEffect(() => { ComposedCreation.focus(); }, []);
    const name = app.state.party[0]?.name ?? '', country = app.state.setting?.title ?? 'the country';
    const go = () => app.opening.begin();
    return (
      <div className="composed-step composed-go">
        <h1 className="ask">{Typography.curl(name)}</h1>
        <div className="composed-col">
          <p className="life">{Typography.curl(NameStep.life(app).join(' '))}</p>
          <div className="composed-rows" role="menu">
            <ComposedRow.View option={{ id: 'set-out', name: `Set out into ${country}`, aside: 'hold' }}
              hold n={1} lit onConsider={() => undefined} onChoose={go} />
          </div>
          <p className="consider" aria-live="polite">Hold to set out.</p>
        </div>
      </div>
    );
  }
  // The option already chosen, or the first, in focus as a step comes: the keys are on it at once.
  static focus() {
    const page = document.querySelector('.composed');
    const at = page?.querySelector<HTMLElement>('[data-option][aria-current="true"]')
      ?? page?.querySelector<HTMLElement>('[data-option]:not(:disabled)');
    at?.focus({ preventScroll: true });
  }
}

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
import { CreationSheet } from './creation-sheet';
import { KitSheet } from './kit-sheet';

// Creation as one composition in the game's own grammar (the first touch, ?touch; the owner, 15 November): every step
// is the engine's (CreationFlow: its question, its options in its order, which is chosen), and every step is answered
// the same way: the hand or the keys consider an option (it is lit, its sentence said, the sky turned to it), and a
// press chooses it and goes on, as an act in the game does. Ancestry and calling keep their cards; the rest are rows.
// Back (Escape, or the corner) returns to a step with its choice still marked. Last, setting out is the one act held:
// its ring filled, or tapped once to be asked and again to go.
export class ComposedCreation {
  static readonly folded = 4;
  static View({ app }: { app: ReaderApp }) {
    const [at, go] = useState<string>('why'), [roll, reroll] = useState(0), [more, unfold] = useState(false);
    const s = app.state;
    useEffect(() => { PressGuard.changed(); unfold(false); }, [at]);
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
          more={more} unfold={() => unfold(true)} onward={next} />
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
    reroll: () => void; more: boolean; unfold: () => void; onward: () => void }) {
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
        <div className="composed-col">
          <h1 className="ask">{Typography.curl(step.ask)}</h1>
          <ComposedCreation.Options offer={offer} more={more} unfold={unfold} chosen={step.chosen} lit={lit}
            consider={consider} choose={choose}
            after={step.id === 'name' && <ComposedCreation.Naming app={app} reroll={reroll} onward={onward} />} />
          <p className="consider" aria-live="polite">{Typography.curl(offer.say(lit))}</p>
        </div>
      </div>
    );
  }
  static readonly flare = 340;
  static Options({ offer, more, unfold, chosen, lit, consider, choose, after }: { offer: Offer; more: boolean;
    unfold: () => void; chosen?: string; lit: string; consider: (id: string) => void; choose: (id: string) => void;
    after?: ReactNode }) {
    const all = offer.options, folds = !offer.all && !offer.cards && all.length > ComposedCreation.folded + 1 && !more;
    const shown = folds ? all.slice(0, ComposedCreation.folded) : all;
    if (offer.cards) {
      return <div className="composed-cards">{shown.map(o => <ComposedRow.Card key={o.id} option={o} chosen={chosen === o.id}
        lit={lit === o.id} onConsider={consider} onChoose={choose} />)}</div>;
    }
    return (
      <div className={`composed-rows${shown.length > 7 ? ' many' : ''}`} role="menu">
        {shown.map((o, k) => <ComposedRow.View key={o.id} option={o} n={k < 9 ? k + 1 : undefined} chosen={chosen === o.id}
          lit={lit === o.id} onConsider={consider} onChoose={id => choose(id)} />)}
        {folds && <ComposedRow.View option={{ id: 'more', name: `${all.length - shown.length} more`, aside: '' }}
          onConsider={() => undefined} onChoose={unfold} />}
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
    const [asked, ask] = useState(false), [open, show] = useState(false);
    useEffect(() => { ComposedCreation.focus(); }, []);
    const name = app.state.party[0]?.name ?? '', country = app.state.setting?.title ?? 'the country';
    const go = (_: string, held: boolean) => { if (held || asked) { app.opening.begin(); } else { ask(true); } };
    return (
      <div className="composed-step composed-go">
        <div className="composed-col">
          <h1 className="ask">{Typography.curl(name)}</h1>
          <p className="life">{Typography.curl(NameStep.life(app).join(' '))}</p>
          <div className="composed-rows" role="menu">
            <ComposedRow.View option={{ id: 'set-out', name: `Set out into ${country}`, aside: 'hold' }}
              hold n={1} lit onConsider={() => undefined} onChoose={go} />
            <ComposedRow.View option={{ id: 'details', name: 'What you set out with', aside: 'details' }} n={2}
              onConsider={() => undefined} onChoose={() => show(true)} />
          </div>
          <p className="consider" aria-live="polite">{asked ? 'Hold to set out, or press it again.' : ''}</p>
        </div>
        {open && <CreationSheet.View title="What you set out with" onClose={() => show(false)}>
          <KitSheet.View app={app} /></CreationSheet.View>}
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

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../../src/creation/creation-flow';
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
import { Signature } from './signature';
import { TitlePage } from '../title-page';

// Creation as one composition in the game's own grammar (the owner, 15 November): every step
// is the engine's (CreationFlow: its question, its options in its order, which is chosen), and every step is answered
// the same way: the hand or the keys consider an option (it is lit, its sentence said, the sky turned to it), and a
// press chooses it and goes on, as an act in the game does. Ancestry and calling keep their cards; the rest are rows.
// Back (Escape, or the corner) returns to a step with its choice still marked. Last, setting out, at a press as every
// row of it is (OR-169: no long presses; it had been the one act held).
export class ComposedCreation {
  static readonly folded = 4;
  static View({ app }: { app: ReaderApp }) {
    // The step the engine asks now, and the one before it (CreationState: the flow keeps where the making stands).
    const s = app.state, [more, turn] = useState(0), at = s.creation?.at ?? 'go', back = s.creation?.back;
    useEffect(() => { PressGuard.changed(); turn(0); }, [at]);
    useEffect(() => ComposedCreation.escape(() => {
      if (!app.state.creation?.back) { return false; }
      app.opening.move('back');
      return true;
    }), [app]);
    if (!s.setting || !s.catalog || !s.party[0]) { return null; }
    const steps = app.opening.steps(), ids = ComposedCreation.ids(app), i = ids.indexOf(at);
    const step = steps.find(x => x.id === at), next = () => app.opening.move('onward');
    const frame = { className: 'creation composed', attrs: { 'data-mode': 'create', 'data-page': step?.id ?? 'go' },
      // The rail is marks (the owner, M21; M22's second review, OR-42: Back, Set out now and Another country had read
      // as loose links beside the menu), each named on asking; but setting out is said in its words, as the first
      // choice of a new game says it (the owner, 19 November: "the existing 'set out now' is just an explore icon with
      // no explanation", OR-120): the scene's Go glyph had stood for it.
      rail: <nav className="creation-edge" aria-label="The choice of a life">
        {back ? <ComposedCreation.Mark id="back" action="back" label="Back" go={() => app.opening.move('back')} />
          : <ComposedCreation.Mark id="another" action="another" label="Another country" go={app.opening.another} />}
        {step && <ComposedCreation.Mark id="" action="start" label="Set out now" words go={app.opening.begin} />}
      </nav>,
      over: <Signature.View app={app} likeness={!step || step.write !== undefined} passed={step ? ids.slice(0, i) : ids} /> };
    // One page from the first step to setting out, never keyed by its step: a step's change is the same page with its
    // words changed, its root the node it was (FM-01: the page had been made again at every choice, and faded up).
    return <ComposedCreation.Step app={app} step={step} more={more} unfold={() => turn(m => m + 1)} onward={next}
      frame={frame} />;
  }
  // words: the mark is its words, not a glyph.
  static Mark({ id, action, label, words, go }: { id: string; action: string; label: string; words?: boolean;
    go: () => void }) {
    return <button type="button" className={`rail-mark edge-mark ${action}${words ? ' worded' : ''}`}
      data-control="creation-mark" data-action={action} aria-label={label} onClick={go}>
      {words ? <span className="edge-word">{label}</span> : <Glyphs.View id={id} className="rail-glyph" />}</button>;
  }
  // The flow's steps as the composition asks them, in its order: every one, how you present among them.
  static ids(app: ReaderApp): string[] { return app.opening.steps().map(x => x.id); }
  // Escape goes back a step (and is the keys' alone while it does), unless a sheet is open over the page.
  private static escape(back: () => boolean) {
    const key = (e: KeyboardEvent) => {
      // A sign drawn up in the sky is let go first (see useZoom).
      if (e.key !== 'Escape' || document.querySelector('[aria-modal="true"], .observatory.zoomed')) { return; }
      if (back()) { e.preventDefault(); e.stopImmediatePropagation(); }
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }
  // A step, or with none left setting out (see Go). What is kept of a step (what is lit, a sign flared, a press gone
  // on) is let go when the step changes.
  static Step({ app, step, more, unfold, onward, frame }: { app: ReaderApp; step?: CreationStep; more: number;
    unfold: () => void; onward: () => void; frame: Frame }) {
    // What is lit first: the choice already made where it is among those offered, else the first (M22's review: a mage's
    // "before" step had lit nothing and described Brawn, the warrior's default, which a mage is not offered).
    const offer = step ? ComposedOptions.of(step) : ComposedCreation.none;
    const first = (offer.options.some(o => o.id === step?.chosen) ? step?.chosen : offer.options[0]?.id) ?? '';
    const [lit, consider] = useState(first), [flare, flared] = useState<string>(), leaving = useRef(false);
    const [shown, show] = useState(step?.id);
    useEffect(() => { ComposedCreation.focus(); }, [step?.id]);
    const choose = (id: string) => {
      if (!step) { return; }
      // At a step of many a press takes a card or lets it go, and the page stays (see CreationSpells).
      if (step.many && id !== step.cards.at(-1)?.id) { app.opening.choose(step.id, id); return; }
      if (leaving.current) { return; }
      leaving.current = true;
      // A card chosen goes on, as the engine has it (a name of the list is drawn, and borne as the list's).
      const send = () => { if (step.write !== undefined) { app.opening.drawn(id); } else { app.opening.choose(step.id, id); } };
      // The sky lights the sign taken for a moment before the page goes on; nothing else waits.
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (step.present === 'sky' && !still) { flared(id); window.setTimeout(send, ComposedCreation.flare); } else { send(); }
    };
    const look = (id: string) => { if (ComposedRow.moved()) { consider(id); } };
    const sky = step?.present === 'sky', [zoom, row, out] = ComposedCreation.useZoom(sky && !!step?.all, consider);
    if (shown !== step?.id) { show(step?.id); consider(first); flared(undefined); leaving.current = false; out(); }
    if (!step) { return ComposedCreation.go(app, frame); }
    // Over the sky the entry stands under the rows, the wheel having the room beside the question (OR-89).
    const entry = <ComposedCreation.Entry card={step.cards.find(c => c.id === lit)} />;
    return <PageFrame.View kind="creation" {...frame} body="composed-step"
      column="composed-col"
      background={!sky ? <TitlePage.Motes settle /> : <><Observatory.View signs={app.state.catalog!.signs} focus={lit}
        chosen={step.chosen} flare={flare} onFocus={look} onChoose={choose} whole={!!step.all} zoom={zoom} onOut={out} />
        {zoom && <ChoiceRow.Button className="sky-out" data={{ action: 'whole-sky' }} label="All twelve"
          plain="neutral" onClick={out} />}</>}
      header={<>{step.place && <p className="step-place" data-region="step-place">
        Step {step.place.at} of {step.place.of}</p>}
        <h1 className="ask">{Typography.curl(step.ask)}</h1>{!sky && entry}</>}
      narrative={<p className="consider" aria-live="polite">{Typography.curl(offer.say(lit))}</p>}
      menu={<ComposedCreation.Options committed={app.state.waiting} offer={offer} more={more} unfold={unfold} chosen={step.chosen} lit={lit}
        {...step.many ? { picked: step.picked ?? [], learn: step.cards.at(-1)?.id } : {}}
        consider={row} choose={choose} list={step.present === 'list' || (sky && !!step.all)}
        after={<><ComposedCreation.Own app={app} step={step} onward={onward} />{sky && entry}
          {step.how && <p className="composed-how" role="note">{Typography.curl(step.how)}</p>}</>} />} />;
  }
  static readonly flare = 340;
  // The sky drawn up to the sign whose row the hand or the keys are on, and let go back to the whole wheel when no row
  // has been under the hand, or reached by the keys, for a few seconds (the owner, 18 November, OR-78: "we can zoom back
  // out if we spend a few seconds not hovering over any option"). A touch considers a row as a hover does. Only the rows
  // draw it up: the hand over the sky itself lights a sign where it stands. And back out at once, on asking (the owner,
  // 18 November, OR-89: "it's not obvious how to zoom back out to the cycle"): All twelve, beside the sign drawn up; a
  // touch on the open sky; or Escape, which goes back a step only once the wheel is whole.
  static useZoom(sky: boolean, consider: (id: string) => void): [string | undefined, (id: string) => void, () => void] {
    const [zoom, zoomed] = useState<string>(), timer = useRef(0), keys = useRef(false), moved = useRef(false);
    const over = useRef(false), drawn = useRef<string | undefined>(undefined), rest = useRef(0);
    drawn.current = zoom;
    const out = () => { window.clearTimeout(timer.current); zoomed(undefined); };
    // Escape while a sign is drawn up lets the wheel go, and only that (see ComposedCreation.escape).
    const escape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !drawn.current) { return; }
      e.preventDefault(); e.stopImmediatePropagation(); out();
    };
    // Whether the keys moved last (a row they are on holds the sky), or the hand (only a row under it does); and whether
    // either has moved at all since the page came: the row lit as it comes is not a row gone to, and the wheel stays whole.
    useEffect(() => {
      const key = () => { keys.current = true; moved.current = true; };
      const hand = (e: PointerEvent) => { keys.current = false; moved.current = true;
        // A mouse over the rows holds the sky; a touch, which has no hover, never does.
        over.current = e.pointerType === 'mouse' && e.target instanceof Element && !!e.target.closest('.composed-rows'); };
      window.addEventListener('keydown', key, true);
      window.addEventListener('keydown', escape, true);
      window.addEventListener('pointermove', hand, true);
      window.addEventListener('pointerdown', hand, true);
      return () => { window.clearTimeout(timer.current); window.removeEventListener('keydown', key, true);
        window.removeEventListener('keydown', escape, true);
        window.removeEventListener('pointermove', hand, true); window.removeEventListener('pointerdown', hand, true); };
    }, []);
    // Come to the sky or gone from it, the wheel is whole and nothing has moved yet: the keys that brought the page
    // (Escape back from the calling, Enter on from how you present) are no row gone to, and a sign drawn up as the
    // page went on (its rest's timer still running) is not kept for coming back. Either had left the sign drawn up on
    // coming back, and the next Escape only let it go (OR-874: test/naming-browser's back, one run in three).
    useEffect(() => {
      moved.current = false; keys.current = false;
      window.clearTimeout(rest.current); window.clearTimeout(timer.current); zoomed(undefined);
    }, [sky]);
    const idle = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const rows = document.querySelector('.composed-rows');
        const held = over.current || (keys.current && !!rows?.contains(document.activeElement));
        if (held) { idle(); } else { zoomed(undefined); }
      }, ComposedCreation.idle);
    };
    // Drawn up only once the hand or the keys rest on a row a moment: passing over the rows had begun a zoom at each,
    // the sky lurching from one to the next (OR-96).
    const drawUp = (id: string) => {
      window.clearTimeout(rest.current);
      rest.current = window.setTimeout(() => { zoomed(id); idle(); }, ComposedCreation.rest);
    };
    return [zoom, (id: string) => { consider(id); if (sky && moved.current) { drawUp(id); } }, out];
  }
  static readonly rest = 140;
  static readonly idle = 3000;
  // picked: at a step of many, those taken: each a press that takes or lets go, its last card (learn) going on.
  static Options({ offer, more, unfold, chosen, lit, consider, choose, after, list, committed, picked, learn }: {
    committed?: string; offer: Offer; more: number; unfold: () => void; chosen?: string; lit: string;
    consider: (id: string) => void; choose: (id: string) => void; after?: ReactNode; list?: boolean; picked?: string[];
    learn?: string }) {
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
    const rows = shown.map((o, k) => <ComposedRow.View key={o.id} option={o} n={k < 9 ? k + 1 : undefined}
      chosen={chosen === o.id || !!picked?.includes(o.id)} lit={lit === o.id} taken={committed === o.id}
      onConsider={consider}
      onChoose={id => choose(id)} />);
    // A list is one of the four, its options set close together in it (creation's one dense menu: a people's names);
    // the row that learns a hand stands under it, the step's one way on.
    return (
      <div className={`composed-rows${shown.length > 7 && !list ? ' many' : ''}`} role="menu"
        {...committed ? { 'aria-busy': true, 'data-committed': committed } : {}} {...picked ? { 'data-many': true } : {}}>
        {list ? <div className="composed-list" data-list>{learn ? rows.slice(0, -1) : rows}</div> : rows}
        {list && learn && rows.at(-1)}
        {rest}
        {after}
      </div>
    );
  }
  // A step's own rows after its options, where the engine offers them: another hand of them, and one of your own
  // written in place.
  static Own({ app, step, onward }: { app: ReaderApp; step: CreationStep; onward: () => void }) {
    return <>
      {step.roll !== undefined && <ComposedRow.View option={{ id: 'roll', name: step.again ?? 'More…', aside: step.roll }}
        onConsider={() => undefined} onChoose={() => app.opening.roll()} />}
      {step.write !== undefined && <label className="choice-row composed-row composed-write">
        <i className="prism-bar row-mark neutral" aria-hidden="true" style={{ '--prism': 'var(--row-neutral)' } as CSSProperties} />
        <input data-field="name" data-nav placeholder={step.write} maxLength={40} autoComplete="off" spellCheck={false}
          onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { e.preventDefault(); onward(); } }}
          onChange={e => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>}
    </>;
  }
  // What the reference says of the option considered, beside the question (the owner, 17 November: "hovering over Elf
  // shows the details for elves in the left main render area"; PA-05): the engine's entry, its line in play, its facts
  // and its rules (its sentence is the one said over the four already), and what it brings, each by its emblem.
  static Entry({ card }: { card?: CreationStep['cards'][number] }) {
    if (!card?.entry) { return null; }
    return <aside className="creation-entry" data-region="entry" aria-live="polite">
      <h2>{Typography.curl(card.name)}</h2>
      <dl>{card.entry.play && <div className="entry-play"><dt>In play</dt><dd>{Typography.curl(card.entry.play)}</dd></div>}
        {card.entry.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{Typography.curl(v)}</dd></div>)}</dl>
      {card.entry.rules.length > 0 && <ul>{card.entry.rules.map(r => <li key={r}>{Typography.curl(r)}</li>)}</ul>}
      {card.entry.groups?.map(g => <section key={g.heading} className="entry-group" aria-label={g.heading}>
        <h3>{g.heading}</h3>
        <ul>{g.rows.map(x => <li key={x.id} data-entry-row={x.id}>{x.emblem && <Glyphs.View id={x.emblem}
          className="entry-glyph" />}<b>{Typography.curl(x.name)}</b> <span>{Typography.curl(x.line)}</span></li>)}</ul>
      </section>)}
      {card.entry.after && <p className="entry-after">{Typography.curl(card.entry.after)}</p>}
    </aside>;
  }
  // Setting out: the life chosen in a line, and the one row that sets out, at a press.
  static readonly none: Offer = { options: [], say: () => '' };
  // Setting out, the page's last (a part of Step's page, not a page of its own: see View).
  static go(app: ReaderApp, frame: Frame) {
    const name = app.state.party[0]?.name ?? '', country = app.state.setting?.title ?? 'the country';
    const go = () => app.opening.begin();
    return <PageFrame.View kind="creation" {...frame} body="composed-step composed-go" column="composed-col"
      header={<h1 className="ask">{Typography.curl(name)}</h1>}
      narrative={<p className="life">{Typography.curl((app.state.creation?.life ?? []).join(' '))}</p>}
      menu={<div className="composed-rows" role="menu">
        <ComposedRow.View option={{ id: 'set-out', name: `Set out into ${country}` }}
          n={1} lit onConsider={() => undefined} onChoose={go} />
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

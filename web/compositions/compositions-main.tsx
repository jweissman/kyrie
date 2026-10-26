import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import type { Choice } from '../../src/ui/choice-list';
import { Moments } from './moments';
import type { Offer } from './offer';
import type { Kit } from './parts';
import { Proto, type Composition, type ProtoState, type Recorded, type Reference } from './proto';
import { Literary } from './literary';
import { Inhabited } from './inhabited';
import { Folio } from './folio';

declare global { interface Window { KYRIE_RECORD: Recorded } }

// The three compositions of the same six moments, side by side in time: one page, a switch between them, and the
// record's beats. The prototype's own bar is set apart from the compositions, in the margin's grey.
interface Drawn { View: (p: { kit: Kit }) => React.JSX.Element; order: (o: Offer) => Choice[] }
const compositions: Record<Composition, { name: string; drawn: Drawn }> = {
  a: { name: 'A · The literary page', drawn: Literary },
  b: { name: 'B · The inhabited scene', drawn: Inhabited },
  c: { name: 'C · The traveller’s folio', drawn: Folio },
};

class Prototypes extends Component<object, ProtoState> {
  readonly r = window.KYRIE_RECORD;
  override state = Proto.parse(this.r, location.search);
  override componentDidMount() { addEventListener('keydown', this.key); }
  override componentDidUpdate() {
    history.replaceState(null, '', Proto.query(this.state));
    const focused = document.querySelector<HTMLElement>('main [aria-current="true"]');
    if (focused && document.activeElement !== focused) { focused.focus({ preventScroll: true });
      focused.scrollIntoView({ block: 'nearest' }); }
  }
  private kit(): Kit {
    const s = this.state, beat = Proto.beat(s), frame = Proto.frame(this.r, beat), offer = Proto.offer(this.r, s);
    const order = compositions[s.composition].drawn.order(offer);
    return { r: this.r, s, frame, offer, order, marked: Proto.toward(this.r, s, offer), choose: this.choose };
  }
  readonly choose = (c: Choice) => {
    const order = this.kit().order;
    this.setState(s => ({ ...Proto.choose(this.r, { ...s, focus: Math.max(0, order.indexOf(c)) }, c) }));
  };
  readonly key = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    const kit = this.kit(), s = this.state, refs: Record<string, Reference> = { j: 'notes', i: 'pack', c: 'company',
      m: 'map' };
    const n = kit.order.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.setState({ focus: (s.focus + (e.key === 'ArrowDown' ? 1 : n - 1)) % Math.max(1, n) });
    } else if ((e.key === 'Enter' || e.key === ' ') && !(document.activeElement instanceof HTMLButtonElement)) {
      const c = kit.order[s.focus];
      if (c) { e.preventDefault(); this.choose(c); }
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      this.setState(s.reference ? { reference: undefined } : Proto.attend(s, { kind: 'place' }));
    } else if (refs[e.key]) {
      this.setState({ reference: s.reference === refs[e.key] ? undefined : refs[e.key] });
    } else if (e.key === ']' || e.key === '[') {
      this.setState(Proto.go(this.r, s, s.at + (e.key === ']' ? 1 : -1)));
    } else if (e.key === '}' || e.key === '{') {
      this.setState(Proto.moveTo(this.r, s, Proto.moment(s) + (e.key === '}' ? 1 : -1)));
    } else if (/^[1-9]$/.test(e.key) && kit.order[Number(e.key) - 1]) {
      this.choose(kit.order[Number(e.key) - 1]!);
    } else if (e.key === '<' || e.key === '>') {
      const all = ['a', 'b', 'c'] as const, i = all.indexOf(s.composition);
      this.setState({ composition: all[(i + (e.key === '>' ? 1 : 2)) % 3]! });
    } else if (e.key === '\\') { this.setState({ marks: !s.marks }); }
  };
  override render() {
    const s = this.state, kit = this.kit(), View = compositions[s.composition].drawn.View;
    return <>
      <Prototypes.Bar app={this} />
      <main className={`composition ${s.composition}`}><View kit={kit} /></main>
    </>;
  }
  static Bar({ app }: { app: Prototypes }) {
    const s = app.state, moment = Proto.moment(s), m = Moments.all[moment]!;
    const beats = Proto.beats.filter(b => b.moment === moment), nth = Proto.beats.slice(0, s.at)
      .filter(b => b.moment === moment).length;
    const aside = Proto.beat(s).aside;
    return <header className="proto" aria-label="Prototype">
      <nav className="which" aria-label="Composition">{(Object.keys(compositions) as Composition[]).map(c =>
        <button type="button" key={c} aria-pressed={s.composition === c} onClick={() => app.setState({ composition: c })}>
          {compositions[c].name}</button>)}<span className="keys"><kbd>&lt;</kbd> <kbd>&gt;</kbd> composition ·
          <kbd>[</kbd> <kbd>]</kbd> beat · <kbd>{'{'}</kbd> <kbd>{'}'}</kbd> moment · <kbd>\</kbd> the record’s marks
        </span></nav>
      <nav className="moments" aria-label="Moment">{Moments.all.map((x, i) =>
        <button type="button" key={x.title} aria-pressed={i === moment}
          onClick={() => app.setState(Proto.moveTo(app.r, s, i))}>{i + 1}. {x.title}</button>)}</nav>
      <p className="beat"><button type="button" onClick={() => app.setState(Proto.go(app.r, s, s.at - 1))}
        aria-label="Previous beat">‹</button> Beat {nth + 1} of {beats.length} · step {Proto.beat(s).step} of the wren
        record <button type="button" onClick={() => app.setState(Proto.go(app.r, s, s.at + 1))}
        aria-label="Next beat">›</button> <span className="test">{m.test}</span></p>
      {aside && <p className="aside">After this beat: {aside}</p>}
    </header>;
  }
}

createRoot(document.getElementById('compositions')!).render(<Prototypes />);

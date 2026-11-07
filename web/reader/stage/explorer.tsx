import { Glyphs } from '../creation/glyphs';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import type { Draw } from './act';
import { AtHand } from './at-hand';
import { Pastime } from './pastime';
import { Wayfinder } from './wayfinder';
import { WorldStage } from './world-stage';

export type Part = 'go' | 'look' | 'wait' | 'who';

// What is opened over a place at rest, one at a time, for one purpose, and put away again (Esc, the cross): Go…, the
// wayfinder (where to go, and nothing else); Look…, the things at hand, each in its own pane; Wait…, letting time pass
// and what came of it; and everyone here the picture has no room for (the owner, 5 November, late: a place is the
// scene's, a way the wayfinder's, a thing its own; none a catalogue of everything the engine permits).
export class Explorer {
  static readonly titles: Record<Part, string> = { go: 'Go', look: 'Look', wait: 'Wait', who: 'Also here' };
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const frame = app.state.frame!, part = app.state.exploring;
    if (!frame.leaf.glance || !part) { return null; }
    return (
      <div className={`explorer part-${part}`} role="dialog" aria-modal="true"
        aria-label={`${Explorer.titles[part]}: ${frame.screen.place.name}`} data-region="explorer" data-part={part}>
        <header className="explorer-head">
          <p className="part">{Explorer.titles[part]}</p>
          <button type="button" className="explorer-shut" data-action="explore-shut" aria-label="Back to the place"
            onClick={() => app.explore()}>✕</button>
        </header>
        <div className="explorer-body">
          {part === 'go' && <Wayfinder.View app={app} draw={draw} />}
          {part === 'look' && <AtHand.View app={app} draw={draw} />}
          {part === 'wait' && <Pastime.View app={app} draw={draw} />}
          {part === 'who' && <Explorer.Who app={app} draw={draw} />}
        </div>
      </div>
    );
  }
  // Everyone here the picture has no room for, each by their likeness, each the way to them.
  static Who({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const rest = WorldStage.ordered(app).slice(WorldStage.room - 1);
    return <ul className="portraits who">{rest.map(x => <li key={x.id} data-subject={x.id}
      className={`${x.kind}${x.danger ? ' danger' : ''}`}><WorldStage.Portrait subject={x} draw={draw} /></li>)}</ul>;
  }
  // Which of these holds a choice, so that the keys coming to it, or automation, open it there.
  static holder(app: ReaderApp, id: string): Part | undefined {
    if (Wayfinder.ways(app).some(w => w.c.id === id || w.way.id === id)) { return 'go'; }
    if (AtHand.of(app).some(h => h.opens.includes(id) || h.choices.some(c => c.id === id))) { return 'look'; }
    const wait = Pastime.wait(app);
    if (wait?.id === id || wait?.children?.some(c => c.id === id)
      || [...Pastime.sleeps(app), ...Pastime.also(app)].some(c => c.id === id)) { return 'wait'; }
    return undefined;
  }
  // One opened: what it shows opened in the menu with it (the lengths of a wait, the acts of the thing led with).
  static open(app: ReaderApp, part?: Part) {
    const wait = part === 'wait' ? Pastime.wait(app)?.id : undefined;
    const held = part === 'look' ? AtHand.led(app, AtHand.of(app)) ?? AtHand.of(app)[0] : undefined;
    // Put away, what was told in it stays told (not said again on the place at rest); opened, it begins afresh.
    app.setState({ exploring: part, hovered: held?.id, kept: part ? false : app.state.kept, keyed: false,
      open: wait ? [wait] : held ? held.opens : app.state.open });
  }
  // The keys while one is open: up and down through its own choices only, Enter on the one they are on (or the way
  // chosen), Esc to put it away. Nothing under it is done unseen.
  static key(app: ReaderApp, key: string): boolean {
    const part = app.state.exploring, menu = app.menu;
    if (!part) { return false; }
    const ids = part === 'go' ? Wayfinder.ways(app).map(w => w.c.id)
      : [...document.querySelectorAll<HTMLElement>('.explorer [data-action="choice"]')].map(e => e.dataset.choice!);
    // In the order they are drawn.
    const at = ids.flatMap(id => { const i = menu.choices.findIndex(c => c.id === id); return i < 0 ? [] : [{ c: menu.choices[i]!, i }]; });
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      if (!at.length) { return true; }
      const now = at.findIndex(x => x.i === app.state.cursor), step = key === 'ArrowDown' ? 1 : -1;
      const next = at[now < 0 ? (step > 0 ? 0 : at.length - 1) : (now + step + at.length) % at.length]!;
      app.setState({ cursor: next.i, keyed: true, ...part === 'go' ? { hovered: next.c.id } : {} });
      return true;
    }
    if (key === 'Enter' || key === ' ') {
      const chosen = part === 'go' ? Wayfinder.chosen(app, Wayfinder.ways(app))?.c
        : app.state.keyed ? at.find(x => x.i === app.state.cursor)?.c : undefined;
      if (chosen) { app.choose(chosen); }
      return true;
    }
    if (key === 'Escape' || key === 'Backspace') { app.explore(); return true; }
    return /^[1-9]$/.test(key);
  }
  // The touch on the place at rest that opens one, said as it is and marked when what is led with is in it.
  // An opener in words, or by its glyph where the act is so common words would crowd the scene (Wait: the owner, 6
  // November), its words then its name to a reader and its title to a pointer.
  static Opener({ app, part, label, led, glyph }: { app: ReaderApp; part: Part; label: string; led?: boolean;
    glyph?: string }) {
    const words = Typography.curl(Words.upper(label));
    return <button type="button" className={`opener opens-${part}${led ? ' led' : ''}${glyph ? ' by-glyph' : ''}`}
      data-action="explore" data-part={part} aria-haspopup="dialog" onClick={() => Explorer.open(app, part)}
      {...glyph ? { 'aria-label': words, title: words } : {}}>
      {glyph ? <Glyphs.View id={glyph} className="opener-glyph" /> : words}</button>;
  }
}

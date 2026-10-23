import type { ReaderApp } from './reader-app';
import { WorldView } from './world-view';
import { HereView } from './here-view';
import { Sheet } from './sheet';
import { FightView } from './fight-view';
import { MapView } from './map-view';
import { Toast } from './toast';

// Play. The world on the left: where you are, what you see, what just happened. On the right, who and what is here
// with what can be done with each, the ways about the place and out across the country, and you. The map takes the
// world's place when it is asked for, with the ways still beside it; notes, the story, what you carry and the
// company take the right-hand side's place. Held upright or on a phone, the two follow one another.
export class PlayPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen, combat = frame.combat;
    const mode = combat ? 'combat' : { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map',
      story: 'story' }[s.view];
    const reading = ['journal', 'story', 'company', 'pack'].includes(s.view) && !combat;
    const world = !screen.running ? <WorldView.Ending app={app} frame={frame} />
      : combat ? <FightView.View combat={combat} opening={frame.opening} place={screen.place.name} mark={s.fight} />
        : s.view === 'map' ? <MapView.View app={app} screen={screen} />
          : <WorldView.View frame={frame} {...s.pending ? { pending: { ...s.pending, stage: s.stage } } : {}} />;
    return (
      <div className={`play view-${s.view}${combat ? ' fighting' : ''}`} data-mode={mode}
        aria-busy={s.pending ? true : undefined}>
        <main className="world" id="page">{world}</main>
        {screen.running && <aside className="here intentions" data-region="choices" aria-label="What you might do">
          {reading ? <Sheet.View app={app} /> : <HereView.View app={app} />}
        </aside>}
        {s.help && <PlayPage.Help />}
        <Toast.View app={app} />
      </div>
    );
  }
  static Help() {
    const keys: [string, string][] = [['↑ ↓', 'move between choices'], ['Enter', 'do it'], ['1–9', 'do one at once'],
      ['Esc', 'put away, or go back'], ['M', 'the map'], ['J', 'your notes'], ['I', 'what you carry'],
      ['C', 'the company'], ['H', 'the story so far'], ['T', 'in a fight, let a companion fight on their own']];
    return (
      <div className="help" role="dialog" aria-label="Keys">
        <dl>{keys.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl>
      </div>
    );
  }
}

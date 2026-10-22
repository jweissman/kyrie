import type { Entry } from '../engine/protocol';
import type { ReaderApp, Travel } from './reader-app';
import { ChoiceMenu } from './choice-menu';
import { DetailsPane } from './details-pane';
import { EntryView } from './entry-view';
import { FightView } from './fight-view';
import { PartyStrip } from './party-strip';
import { RegionMap } from './region-map';
import { SceneView } from './scene-view';
import { Toast } from './toast';
import { TopLine } from './top-line';
import { Words } from './words';

// Play: the page (the place and what has happened there, or a fight) with what can be done at its foot, the
// company kept quietly below it, and the land behind it. What is asked for (a sheet, the pack, the journal, the
// whole map) opens beside the page and never replaces it.
export class PlaySurface {
  static readonly titles = { here: 'What now?', company: 'The company', pack: 'What the company carries',
    journal: 'What now?', map: 'What now?' };
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen, combat = frame.combat;
    const mode = combat ? 'combat' : { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map' }[s.view];
    const page = combat ? <FightView.View combat={combat} opening={frame.opening} place={screen.place.name} />
      : s.history ? <PlaySurface.History entries={frame.entries} /> : <SceneView.View screen={screen} entries={frame.entries} />;
    return (
      <div className={`reader${s.pending?.travel ? ' travelling' : ''}`} data-mode={mode}
        aria-busy={s.pending ? true : undefined}>
        <main className="column" id="page">
          <TopLine.View app={app} title={frame.title} screen={screen} />
          {screen.running ? page : <PlaySurface.Fallen />}
          {s.pending && <PlaySurface.Doing said={s.pending.said} travel={s.pending.travel} fight={!!combat} />}
          {screen.running && <ChoiceMenu.View app={app} title={combat ? `${combat.actorName}’s turn`
            : PlaySurface.titles[s.view]} />}
          {!screen.running && <p className="again"><button type="button" className="primary" data-action="new"
            onClick={app.opening.title}>Begin again</button></p>}
        </main>
        <aside className={`aside view-${s.view}`}>
          <RegionMap.View screen={screen} travel={s.pending?.travel} large={s.view === 'map'} />
          {['company', 'pack', 'journal'].includes(s.view) && !combat && <DetailsPane.View app={app} />}
        </aside>
        <PartyStrip.View app={app} screen={screen} combat={combat} />
        {s.help && <PlaySurface.Help />}
        <Toast.View app={app} />
      </div>
    );
  }
  // While a command is carried out: what the company is doing, and on a journey, the way and how long it takes.
  static Doing({ said, travel, fight }: { said: string; travel?: Travel; fight: boolean }) {
    const span = travel ? `${travel.minutes >= 60 ? `${Math.round(travel.minutes / 6) / 10} h` : `${travel.minutes} min`}` : '';
    return (
      <article className={`entry pending${travel ? ' journey' : ''}`} aria-live="polite">
        <p className="said">{fight ? said : Words.echo(said)}</p>
        {travel && <p className="way">By {travel.way}, {span}.</p>}
        <p className="working" aria-hidden="true"><span /><span /><span /></p>
      </article>
    );
  }
  // Everything so far, place by place.
  static History({ entries }: { entries: Entry[] }) {
    let place = '';
    return (
      <section className="history" aria-label="The story so far">
        <header className="scene-head"><h1>The story so far</h1><p className="where">H to return</p></header>
        {entries.length ? entries.map((e, i) => {
          const chapter = e.place !== place ? <h2 className="chapter">{Words.upper(e.placeName)}</h2> : null;
          place = e.place;
          return <div key={e.id}>{chapter}<EntryView.Memo entry={e} latest={i === entries.length - 1} prose={[]} /></div>;
        }) : <p className="none">Nothing has happened yet.</p>}
      </section>
    );
  }
  static Fallen() {
    return (
      <section className="scene fallen">
        <header className="scene-head"><h1>The company has fallen</h1></header>
        <div className="prose now"><p>No one is left standing. The story so far is kept; a new company can set out
          from the beginning.</p></div>
      </section>
    );
  }
  static Help() {
    const keys: [string, string][] = [['↑ ↓', 'move between choices'], ['Enter', 'do the highlighted one'],
      ['1–9', 'do one at once'], ['Esc', 'go back'], ['C', 'the company'], ['I', 'what you carry'], ['J', 'the journal'],
      ['M', 'the map'], ['H', 'the story so far'], ['T', 'in a fight, let a companion fight on their own']];
    return (
      <div className="help" role="dialog" aria-label="Keys">
        <dl>{keys.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl>
        <p>Press ? again to close.</p>
      </div>
    );
  }
}

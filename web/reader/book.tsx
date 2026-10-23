import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import type { View } from './menu-model';
import type { Screen } from '../../src/ui/screen-types';
import { FictionalTime } from '../../src/presentation/fictional-time';
import { Verso } from './verso';
import { Recto } from './recto';
import { Sheet } from './sheet';
import { FightView } from './fight-view';
import { WayChart } from './way-chart';
import { Toast } from './toast';
import { Words } from './words';

// Play: an open book. The left-hand page is the world, the right-hand page what you might do. Held upright or on a
// phone, the pages follow one another. What is asked for (the journal, the company, the pack, the story so far) opens
// over the right-hand page and never takes the world away; the map is the world drawn rather than told, so it opens
// over the left-hand page, with the ways on still to be chosen beside it. A fight is told on the left and chosen on
// the right like anything else.
export class Book {
  static readonly ribbon: [View, string, string][] = [['journal', 'j', 'Journal'], ['map', 'm', 'Map'],
    ['company', 'c', 'Company'], ['pack', 'i', 'Pack'], ['story', 'h', 'Story']];
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen, combat = frame.combat;
    const mode = combat ? 'combat' : { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map',
      story: 'story' }[s.view];
    const reading = ['journal', 'story'].includes(s.view) && !combat, plate = s.view === 'map' && !combat;
    const beside = ['company', 'pack'].includes(s.view) && !combat;
    return (
      <div className={`book view-${s.view}${s.pending?.travel ? ' travelling' : ''}${combat ? ' fighting' : ''}`}
        data-mode={mode} aria-busy={s.pending ? true : undefined}>
        <Book.Runner app={app} title={frame.title} screen={screen} />
        <main className="verso" id="page">
          {!screen.running ? <Book.Fallen app={app} />
            : combat ? <FightView.View combat={combat} opening={frame.opening} place={screen.place.name} mark={s.fight} />
              : plate ? <Sheet.View app={app} />
                : <Verso.View screen={screen} leaf={frame.leaf}
                  {...s.pending ? { pending: { ...s.pending, ...s.stage ? { stage: s.stage } : {} } } : {}} />}
        </main>
        <aside className="recto">
          {reading ? <Sheet.View app={app} /> : <>
            {screen.running && <Recto.View app={app} title={combat ? `${combat.actorName}’s turn` : 'What you might do'} />}
            {beside && <Sheet.View app={app} />}
            {!combat && s.view === 'here' && Book.inside(screen) && <div className="way-chart" aria-hidden="true">
              <WayChart.View chart={screen.chart!} /></div>}
          </>}
          <Recto.Company app={app} screen={screen} {...combat ? { combat } : {}} />
        </aside>
        {s.help && <Book.Help />}
        <Toast.View app={app} />
      </div>
    );
  }
  // In wild country or a site, the ways known around you are drawn small beside the choices.
  private static inside(screen: Screen): boolean {
    return !!screen.chart && screen.chart.places.filter(p => !p.external).length > 1
      && screen.path.some(p => ['site', 'level', 'wilderness'].includes(p.kind));
  }
  // The running head: the country, the ribbon of what can be opened, and the time of day as people say it.
  static Runner({ app, title, screen }: { app: ReaderApp; title: string; screen: Screen }) {
    const fighting = !!app.state.frame?.combat;
    return (
      <header className="runner">
        <button type="button" className="country" onClick={app.opening.title} title="Back to the title">{title}</button>
        {!fighting && <nav className="ribbon" aria-label="Open beside the page">
          {Book.ribbon.map(([view, key, label]) => <button type="button" key={view} data-action="mode" data-key={key}
            data-view={view} aria-pressed={app.state.view === view} onClick={Book.open.bind(null, app)}>{label}</button>)}
        </nav>}
        <time data-id="clock" title={screen.date ? `${screen.clock}: ${screen.date.long}` : screen.clock}>
          {Book.when(screen)}</time>
      </header>
    );
  }
  // "Evening · rain"; the date and the hour for whoever looks closer.
  static when(screen: Screen): string {
    return [Words.upper(FictionalTime.part(screen.elapsed)), screen.weather].filter(Boolean).join(' · ');
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { app.show(e.currentTarget.dataset.view as View); }
  static Fallen({ app }: { app: ReaderApp }) {
    return (
      <article className="verso-body fallen">
        <h2 className="place">No one is left standing</h2>
        <div className="situation"><p>The story so far is kept in the journal and the chronicle. Whoever comes next will
          begin again from the beginning.</p></div>
        <p className="again"><button type="button" className="primary" data-action="new" onClick={app.opening.title}>
          Begin again</button></p>
      </article>
    );
  }
  static Help() {
    const keys: [string, string][] = [['↑ ↓', 'move between choices'], ['Enter', 'do the highlighted one'],
      ['1–9', 'do one at once'], ['Esc', 'go back'], ['J', 'the journal'], ['M', 'the map'], ['C', 'the company'],
      ['I', 'what you carry'], ['H', 'the story so far'], ['T', 'in a fight, let a companion fight on their own']];
    return (
      <div className="help" role="dialog" aria-label="Keys">
        <dl>{keys.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl>
        <p>Press ? again to close.</p>
      </div>
    );
  }
}

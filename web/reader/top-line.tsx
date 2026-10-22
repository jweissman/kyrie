import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import type { View } from './menu-model';
import type { Screen } from '../../src/ui/screen-types';
import { Words } from './words';
import { FictionalTime } from '../../src/presentation/fictional-time';

// The line above the page: the campaign, what can be opened beside the page (the company, what it carries, the
// journal, the whole map, the story so far), and the time of day as people say it (the hour for whoever looks
// closer).
export class TopLine {
  static readonly views: [View, string, string][] = [['company', 'c', 'Company'], ['pack', 'i', 'Pack'],
    ['journal', 'j', 'Journal'], ['map', 'm', 'Map']];
  static View({ app, title, screen }: { app: ReaderApp; title: string; screen: Screen }) {
    const s = app.state, fighting = !!s.frame?.combat;
    return (
      <header className="top-line">
        <button type="button" className="campaign" onClick={app.opening.title} title="Back to the title">{title}</button>
        {!fighting && <nav className="views" aria-label="Open beside the page">
          {TopLine.views.map(([view, key, label]) => <button type="button" key={view} data-action="mode" data-key={key}
            data-view={view} aria-pressed={s.view === view} onClick={TopLine.open.bind(null, app)}>{label}</button>)}
          <button type="button" data-action="history" aria-pressed={s.history}
            onClick={TopLine.story.bind(null, app)}>Story</button>
        </nav>}
        <time data-id="clock" title={TopLine.closer(screen)}>{TopLine.when(screen)}</time>
      </header>
    );
  }
  // "Morning · 20 Leaffall · rain" when the campaign keeps a calendar, else "Morning, the first day".
  static when(screen: Screen): string {
    if (!screen.date) { return Words.daytime(screen.elapsed); }
    return [Words.upper(FictionalTime.part(screen.elapsed)), screen.date.short, screen.weather].filter(Boolean).join(' · ');
  }
  // The hour and the date in full, for whoever looks closer.
  static closer(screen: Screen): string {
    return screen.date ? `${screen.clock}: ${screen.date.long}` : screen.clock;
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    app.show(e.currentTarget.dataset.view as View);
  }
  private static story(app: ReaderApp) { app.setState({ history: !app.state.history, view: 'here' }); }
}

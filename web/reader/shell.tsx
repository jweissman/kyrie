import type { CSSProperties, ReactNode } from 'react';
import type { ReaderApp } from './reader-app';
import { Scenery } from '../../src/ui/scenery';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { TitlePage } from './title-page';
import { Stage } from './stage/stage';
import { Flame } from './stage/flame';

// The lantern: a dark ground with the country's painting far behind it, dim and out of focus and tinted by the hour,
// and on it one bounded stage, lit, where the game is played. Every page is held inside the stage, with its margins
// kept (about a fifth of a desktop's width, less on a tablet, none on a phone); the title, the choice of a life in
// a drawn country (OWN-14: no window frame), the setting out from it and a new game's opening (OWN-17) break out of it.
export class Shell {
  static View({ app, children }: { app: ReaderApp; children: ReactNode }) {
    const s = app.state, plate = Shell.plate(app);
    const creating = (s.phase === 'company' || (s.phase === 'loading' && !!s.leaving)) && !!s.setting?.generated;
    const style = { '--plate': plate ? `url(paintings/large/${plate}.webp)` : 'none' } as CSSProperties;
    const apart = `${creating ? ' creating' : ''}${Stage.prologue(app) ? ' prologue' : ''}`;
    return (
      <div className={`shell phase-${s.phase} hour-${Shell.hour(app)}${apart}`} style={style}>
        <div className="ambient" aria-hidden="true" />
        <div className="frame"><Flame.View app={app} />{children}</div>
      </div>
    );
  }
  // What lies behind the stage: where the company is, as the place's own scenery would paint it; before a country is
  // entered, its land, while the life is chosen and as the company sets out from the choice (it had gone to black for
  // seconds between the choice and the opening: the opening's critique); on the title, the day's view.
  static plate(app: ReaderApp): string | undefined {
    const s = app.state;
    if (s.phase === 'play' && s.frame) { return Scenery.of(s.frame.screen); }
    if ((s.phase === 'company' || (s.phase === 'loading' && s.leaving)) && s.setting) {
      return Scenery.country(s.setting.terrain, s.seed);
    }
    if (s.phase === 'title' || s.phase === 'options') { return TitlePage.view(); }
    return undefined;
  }
  // The hour, for the ground's tint: morning, afternoon, evening or night; none before play.
  static hour(app: ReaderApp): string {
    const frame = app.state.phase === 'play' ? app.state.frame : undefined;
    return frame ? FictionalTime.part(frame.screen.elapsed) : 'none';
  }
}

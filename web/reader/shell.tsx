import type { CSSProperties, ReactNode } from 'react';
import type { ReaderApp } from './reader-app';
import { Scenery } from '../../src/ui/scenery';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { Stage } from './stage/stage';
import { Flame } from './stage/flame';
import { EncyclopediaOverlay } from './encyclopedia-overlay';
import { Guidance } from './guidance';

// The lantern: a dark ground with the country's painting far behind it, dim and out of focus and tinted by the hour,
// and on it one bounded stage, lit, where the game is played. Every page is held inside the stage, with its margins
// kept (about a fifth of a desktop's width, less on a tablet, none on a phone); the title, the choice of a life in
// a drawn country (OWN-14: no window frame), the setting out from it, a new game's opening (OWN-17) and the world map
// (the owner, 5 November: edge to edge, all else over it) break out of it.
export class Shell {
  static View({ app, children }: { app: ReaderApp; children: ReactNode }) {
    const s = app.state, plate = Shell.plate(app);
    const creating = (s.phase === 'company' || (s.phase === 'loading' && !!s.leaving)) && !!s.setting?.generated;
    const style = { '--plate': plate ? `url(paintings/large/${plate}.webp)` : 'none' } as CSSProperties;
    // The scene first (the owner's amendment 6, A): the painting over the whole screen and what is told and done in
    // restrained panels over it; ?scene=split keeps the bounded stage it replaced, to compare.
    const apart = `${creating ? ' creating' : ''}${Stage.prologue(app) ? ' prologue' : ''}`
      + `${Stage.overworld(app) ? ' overworld' : ''}${app.props.query.get('scene') === 'split' ? '' : ' scene-full'}`
      + `${Guidance.shown(app) ? '' : ' guide-quiet'}`;
    return (
      <div className={`shell phase-${s.phase} hour-${Shell.hour(app)}${apart}`} style={style}
        onClickCapture={e => EncyclopediaOverlay.caught(app, e)}>
        <div className="ambient" aria-hidden="true" />
        <div className="frame"><Flame.View app={app} />{children}</div>
        <EncyclopediaOverlay.View app={app} />
        {app.props.query.has('safe') && <div className="safe-zone" data-region="safe-zone" aria-hidden="true" />}
      </div>
    );
  }
  // What lies behind the stage: where the company is, as the place's own scenery would paint it; before a country is
  // entered, its land, while the life is chosen and as the company sets out from the choice (it had gone to black for
  // seconds between the choice and the opening: the opening's critique); on the title, none (see TitlePage.motes).
  static plate(app: ReaderApp): string | undefined {
    const s = app.state;
    // In the scene first, the place's own painting, so that talk, the dossier and a fight stand in the place, not
    // on the country behind it (amendment 6, A); in the dark, nothing.
    if (s.phase === 'play' && s.frame && app.props.query.get('scene') !== 'split') {
      return s.frame.screen.dark ? undefined : Scenery.seen(s.frame.screen);
    }
    if (s.phase === 'play' && s.frame) { return Scenery.of(s.frame.screen); }
    if ((s.phase === 'company' || (s.phase === 'loading' && s.leaving)) && s.setting) {
      return Scenery.country(s.setting.terrain, s.seed);
    }
    return undefined;
  }
  // The hour, for the ground's tint: morning, afternoon, evening or night; none before play.
  static hour(app: ReaderApp): string {
    const frame = app.state.phase === 'play' ? app.state.frame : undefined;
    return frame ? FictionalTime.part(frame.screen.elapsed) : 'none';
  }
}

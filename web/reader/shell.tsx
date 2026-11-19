import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { ReaderApp } from './reader-app';
import { Scenery } from '../../src/ui/scenery';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { Stage } from './stage/stage';
import { Flame } from './stage/flame';
import { EncyclopediaOverlay } from './encyclopedia-overlay';
import { Guidance } from './guidance';
import type { Frame } from '../engine/protocol';

// The lantern: a dark ground with the country's painting far behind it, dim and out of focus and tinted by the hour,
// and on it one bounded stage, lit, where the game is played. Every page is held inside the stage, with its margins
// kept (about a fifth of a desktop's width, less on a tablet, none on a phone); the title, the choice of a life in
// a drawn country (OWN-14: no window frame), the setting out from it, a new game's opening (OWN-17) and the world map
// (the owner, 5 November: edge to edge, all else over it) break out of it.
// A painting behind the stage is shown once it has loaded (PA-02: the country's painting had been a CSS background
// put up the moment it arrived, after its fade had already run on mount, so that creation came up over flat dark and
// the land snapped in a frame later). Until the wanted one is decoded the last one stands, or nothing; the ambient's
// own opacity transition then brings the first one up.
// The last stands across the shell's being drawn anew too (the owner, 19 November: certain scenes flickered to dark
// and then faded in slowly, where most came at once).
class Plates {
  static readonly loaded = new Set<string>();
  static shown?: string;
  static useReady(wanted: string | undefined): string | undefined {
    const [ready, setReady] = useState(() => wanted && Plates.loaded.has(wanted) ? wanted : Plates.shown);
    useEffect(() => {
      if (!wanted || Plates.loaded.has(wanted)) { Plates.shown = wanted; setReady(wanted); return; }
      let live = true;
      const img = new Image();
      img.src = Plates.url(wanted);
      const done = () => { Plates.loaded.add(wanted); Plates.shown = wanted; if (live) { setReady(wanted); } };
      img.decode().then(done, done);
      return () => { live = false; };
    }, [wanted]);
    return wanted ? ready : undefined;
  }
  static url(plate: string): string { return `paintings/large/${plate}.webp`; }
  // A painting had before it is wanted, so that it comes up the moment it is asked for.
  static async had(plate: string): Promise<void> {
    if (Plates.loaded.has(plate)) { return; }
    const img = new Image();
    img.src = Plates.url(plate);
    await img.decode().catch(() => undefined);
    Plates.loaded.add(plate);
  }
}

export class Shell {
  static View({ app, children }: { app: ReaderApp; children: ReactNode }) {
    const s = app.state, wanted = Shell.plate(app), plate = Plates.useReady(wanted);
    const approaching = Shell.approaching(app);
    const creating = (s.phase === 'company' || (s.phase === 'loading' && !!s.leaving && !approaching))
      && !!s.setting?.generated;
    const style = { '--plate': plate ? `url(${Plates.url(plate)})` : 'none' } as CSSProperties;
    // The scene first (the owner's amendment 6, A): the painting over the whole screen and what is told and done in
    // restrained panels over it; ?scene=split keeps the bounded stage it replaced, to compare.
    const apart = `${creating ? ' creating' : ''}${Stage.prologue(app) ? ' prologue' : ''}${approaching ? ' approaching' : ''}`
      + `${Stage.overworld(app) ? ' overworld' : ''}${app.props.query.get('scene') === 'split' ? '' : ' scene-full'}`
      + `${Guidance.shown(app) ? '' : ' guide-quiet'}`;
    return (
      <div className={`shell phase-${s.phase} hour-${Shell.hour(app)}${apart}`} style={style}
        onClickCapture={e => EncyclopediaOverlay.caught(app, e)}>
        <div className={`ambient${plate ? '' : ' unpainted'}`} aria-hidden="true" />
        <div className="frame"><Flame.View app={app} />{children}</div>
        <EncyclopediaOverlay.View app={app} />
        {app.props.query.has('safe') && <div className="safe-zone" data-region="safe-zone" aria-hidden="true" />}
      </div>
    );
  }
  // What lies behind the stage: where the company is, as the place's own scenery would paint it; before a country is
  // entered, its land, while the life is chosen; on the title, none (see TitlePage.motes). Setting out from the choice
  // the page is dark while the world is drawn and its people placed, and the way in comes up as the last of it ends
  // ("Telling where you are"), once, and stays up under the opening's words: the one painting, never shown, put away
  // and faded in again (the owner, 18 November, OR-77: "a flash and fade into the introduction"; it had been the
  // country behind the setting out, then the opening's own picture rising out of black over it). The way in is known
  // only once the first place is (see ReaderOpening.approach), and is often not the country chosen in.
  static plate(app: ReaderApp): string | undefined {
    const s = app.state;
    if (Stage.prologue(app) && s.frame) { return Shell.way(s.frame, s.setting?.terrain, s.seed); }
    // In the scene first, the place's own painting, so that talk, the dossier and a fight stand in the place, not
    // on the country behind it (amendment 6, A); in the dark, nothing.
    if (s.phase === 'play' && s.frame && app.props.query.get('scene') !== 'split') {
      return s.frame.screen.dark ? undefined : Scenery.seen(s.frame.screen);
    }
    if (s.phase === 'play' && s.frame) { return Scenery.of(s.frame.screen); }
    if (s.phase === 'company' && s.setting) { return Scenery.country(s.setting.terrain, s.seed); }
    return Shell.approaching(app) ? s.approach : undefined;
  }
  // The way in, as a new game's opening paints it: as its words tell it, and the country the life was chosen over
  // where that is one of its kind (see Scenery.approach); in the dark, none.
  static way(frame: Frame, terrain: string | undefined, seed: string): string | undefined {
    return frame.screen.dark ? undefined : Scenery.approach(frame.screen, Scenery.country(terrain, seed));
  }
  // Whether the way in is coming up or is up: the end of setting out, and the opening after it. The painting is then
  // drawn as the opening draws it (stage.css), so that nothing changes under it as the opening's words arrive.
  static approaching(app: ReaderApp): boolean {
    const s = app.state;
    return Stage.prologue(app) || (s.phase === 'loading' && !!s.leaving && !!s.approach);
  }
  // How much of the way in's rising (1.6 s: stage.css, .approaching .ambient) the page waits on before the opening's
  // words begin over it.
  static readonly waited = 1200;
  static had(plate: string): Promise<void> { return Plates.had(plate); }
  // The hour, for the ground's tint: morning, afternoon, evening or night; none before play.
  static hour(app: ReaderApp): string {
    const frame = app.state.phase === 'play' ? app.state.frame : undefined;
    return frame ? FictionalTime.part(frame.screen.elapsed) : 'none';
  }
}

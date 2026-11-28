import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { ReaderApp } from './reader-app';
import { Scenery } from '../../src/ui/scenery';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { Stage } from './stage/stage';
import { Flame } from './stage/flame';
import { EncyclopediaOverlay } from './encyclopedia-overlay';
import { Guidance } from './guidance';
import { OracleMark } from './oracle-mark';
import type { Frame } from '../../src/creation/protocol';

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
    // One had already is drawn in the same frame it is wanted, never a frame later over the last (OR-1123).
    return !wanted ? undefined : Plates.loaded.has(wanted) ? wanted : ready;
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
    // The first scene's own painting had while the opening is read, so that the scene comes up on it at once, never
    // on the way in's for a moment first (OR-1123).
    const next = Stage.prologue(app) && s.frame && !s.frame.screen.dark ? Scenery.seen(s.frame.screen) : undefined;
    useEffect(() => { if (next) { void Plates.had(next); } }, [next]);
    // The way in is no painting of the place's family: from it to the place's own is a cut, never the sky's slow
    // dissolve (OR-1123: the first scene had come up over the way in and dissolved to its own over four seconds).
    const was = Shell.useDissolve(plate, `${s.frame?.screen.place.id ?? ''}${Shell.approaching(app) ? ':way' : ''}`);
    const approaching = Shell.approaching(app);
    const creating = (s.phase === 'company' || (s.phase === 'loading' && !!s.leaving && !approaching))
      && !!s.setting?.generated;
    const style = { '--plate': plate ? `url(${Plates.url(plate)})` : 'none' } as CSSProperties;
    // The scene first (the owner's amendment 6, A): the painting over the whole screen and what is told and done in
    // restrained panels over it.
    const apart = `${creating ? ' creating' : ''}${Stage.prologue(app) ? ' prologue' : ''}${approaching ? ' approaching' : ''}`
      + `${Stage.overworld(app) ? ' overworld' : ''} scene-full`
      + `${Guidance.shown(app) ? '' : ' guide-quiet'}`;
    return (
      <div className={`shell phase-${s.phase} hour-${Shell.hour(app)}${apart}`} style={style}
        onClickCapture={e => EncyclopediaOverlay.caught(app, e)}>
        <div className={`ambient${plate ? '' : ' unpainted'}`} aria-hidden="true" />
        {was && <div key={was} className="ambient ambient-was" aria-hidden="true"
          style={{ '--plate': `url(${Plates.url(was)})` } as CSSProperties} />}
        <div className="frame"><Flame.View app={app} />{children}</div>
        <EncyclopediaOverlay.View app={app} />
        <OracleMark.View app={app} />
        {app.props.query.has('safe') && <div className="safe-zone" data-region="safe-zone" aria-hidden="true" />}
      </div>
    );
  }
  // The painting going, where the place's painting turns to another of its family as the sky turns over it (OR-446:
  // Scenery.dissolves, the engine's): drawn over the new one and dissolved away over a few seconds (shell's
  // .ambient-was), never a cut and never a colour; another place's painting is cut to, as it always was.
  static useDissolve(plate: string | undefined, place: string | undefined): string | undefined {
    const last = useRef<{ plate?: string; place?: string }>({}), [was, setWas] = useState<string>();
    useEffect(() => {
      const before = last.current;
      last.current = { plate, place };
      // One who asks for less motion is shown the new one at once.
      const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (still || before.place !== place || !Scenery.dissolves(before.plate, plate)) { return; }
      setWas(before.plate);
      const timer = setTimeout(() => setWas(undefined), Shell.dissolve);
      return () => clearTimeout(timer);
    }, [plate, place]);
    return was;
  }
  static readonly dissolve = 4000;
  // What lies behind the stage: where the company is, as the place's own scenery would paint it; while a life is
  // chosen, none (the curtain is the frame's: Backdrop); on the title, none (see Embers). Setting out from the choice
  // the page is dark while the world is drawn and its people placed, and the way in comes up as the last of it ends
  // ("Telling where you are"), once, and stays up under the opening's words: the one painting, never shown, put away
  // and faded in again (the owner, 18 November, OR-77: "a flash and fade into the introduction"; it had been the
  // country behind the setting out, then the opening's own picture rising out of black over it). The way in is known
  // only once the first place is (see ReaderOpening.approach), and is often not the country chosen in.
  static plate(app: ReaderApp): string | undefined {
    const s = app.state;
    // The painting risen behind setting out stays behind the opening, never put away for another (OR-77, OR-1123: the
    // way in had been worked out afresh for the opening's first page, and cut to over the one already up).
    if (Stage.prologue(app) && s.frame) { return s.approach ?? Shell.way(s.frame, s.setting?.terrain, s.seed); }
    // In the scene first, the place's own painting, so that talk, the dossier and a fight stand in the place, not
    // on the country behind it (amendment 6, A); in the dark, nothing.
    if (s.phase === 'play' && s.frame) { return s.frame.screen.dark ? undefined : Scenery.seen(s.frame.screen); }
    // Making a life, the country's painting only where the engine's hint asks it: the making's own is the curtain, and
    // no painting stands behind it (OR-1800). An authored campaign's company page, which has no hints, keeps its land.
    if (s.phase === 'company' && s.setting) {
      const asked = s.creation ? s.creation.hints.backdrop === 'country' : !s.setting.generated;
      return asked ? Scenery.country(s.setting.terrain, s.seed) : undefined;
    }
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

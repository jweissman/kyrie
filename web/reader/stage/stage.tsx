import { SceneRail } from './scene-rail';
import { PlaceMark } from './place-mark';
import type { Frame } from '../../../src/creation/protocol';
import type { Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { FictionalTime } from '../../../src/campaign/fictional-time';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../../../src/presentation/words';
import { PlanView } from '../plan-view';
import { WorldStage } from './world-stage';
import { TalkStage } from './talk-stage';
import { ThingStage } from './thing-stage';
import { FightStage } from './fight-stage';
import { BookStage } from './book-stage';
import { Held } from './held';
import { PrologueStage } from './prologue-stage';

export type Mode = 'prologue' | 'explore' | 'talk' | 'examine' | 'combat' | 'book' | 'fallen';

// Play, one composition at a time, chosen by what the player is attending to: a place (the page of it, with who and
// what is there and the ways out), a road (the line across the country), someone spoken with (their painting when
// one fits, and the conversation), one thing looked at (the thing set large), a fight (the two sides and what just
// passed between them), or a book (the character, notes, the pack, the map, the story). Every one is on the same
// white page; the dark, the night and the deep are told, not painted over it. Nothing stands across any of them but
// the book in the corner, which opens the books (the owner's interim report: a bar of utilities across every page,
// a conversation's too, had made play a web application). Before all of them in a new game is its opening, over the
// whole screen with nothing across it, not even the book (see PrologueStage).
export class Stage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, menu = app.menu, mode = Stage.mode(app);
    return (
      <div className={`stage mode-${mode}`} data-mode={Stage.inspected(app, mode)} aria-busy={s.pending ? true : undefined}>
        {/* In the scene first, the map and the book are on its rail (see SceneRail). Not in a conversation: it recedes
            (OR-149), and the rail had stood over its words, faded over the reply on a phone and over the wares
            (OR-503: nothing floats over text); M and C still open them. */}
        {mode === 'examine' && <SceneRail.Books app={app} alone />}
        <div className="intentions" data-region="choices">
          {mode === 'prologue' && <PrologueStage.View app={app} />}
          {mode === 'fallen' && <BookStage.Ending app={app} />}
          {mode === 'combat' && <FightStage.View app={app} />}
          {mode === 'book' && <BookStage.View app={app} />}
          {mode === 'talk' && menu.talk && <TalkStage.View app={app} talk={menu.talk} />}
          {mode === 'examine' && menu.examined && <ThingStage.View app={app} examined={menu.examined} />}
          {mode === 'explore' && <WorldStage.View app={app} />}
        </div>
      </div>
    );
  }
  static mode(app: ReaderApp): Mode {
    const s = app.state, frame = s.frame!, menu = app.menu, held = Held.page(frame);
    if (Stage.prologue(app)) { return 'prologue'; }
    if (held) { return held; }
    if (s.view !== 'here') { return 'book'; }
    if (app.attention.kind === 'person' && menu.talk) { return 'talk'; }
    if (app.attention.kind === 'thing' && menu.examined) { return 'examine'; }
    // A road is open country like any other (the owner, 4 November, night: no road page apart from the hex): on the
    // map when come to, and entered to deal with whatever stopped the journey there.
    return 'explore';
  }
  // Whether the world map is the whole stage: the company out on it, and nothing come over it.
  static overworld(app: ReaderApp): boolean {
    const s = app.state;
    return s.phase === 'play' && !!s.frame && !!s.outdoors && !!s.frame.screen.region?.land && Stage.mode(app) === 'explore';
  }
  // Whether a new game's opening is being told, before its first place: then the keys are the opening's.
  static prologue(app: ReaderApp): boolean {
    const s = app.state;
    return s.phase === 'play' && s.prologue !== undefined && !!s.frame && !!s.told;
  }
  // Whether the map is open over everything (not a fight, or the end, come over it): then the keys are the map's, and
  // what would be said over the page is said over the map.
  static mapped(app: ReaderApp): boolean {
    return app.state.view === 'map' && !!app.state.frame && Stage.mode(app) === 'book'
      && !PlanView.inside(app.state.frame.screen);
  }
  // What automation knows the stage as: a book is what it holds.
  private static inspected(app: ReaderApp, mode: Mode): string {
    if (mode === 'book') {
      return { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map', story: 'story' }[app.state.view];
    }
    return mode;
  }
  // "Hillfells · Gothgiba" and "Morning · snowy · 4 Wolfmoon": where, and when.
  // On a level of a site, the level first, then the site: "The long halls, the old dead under Brightbridge" (the
  // heading had never said which level the company was on: NVR-17).
  static where(frame: Frame): string[] {
    const path = frame.screen.path, level = path.findLast(p => p.kind === 'level');
    if (level) { return [level.name, path.findLast(p => p.kind === 'site' || p.kind === 'building')?.name ?? frame.title]; }
    const named = path.filter(p => ['settlement', 'site', 'wilderness'].includes(p.kind)).map(p => p.name);
    return [frame.title, ...named.filter(n => n !== frame.title)].slice(0, 3);
  }
  static when(frame: Frame): string[] {
    const s = frame.screen, part = FictionalTime.part(s.elapsed);
    return [Words.upper(part), Words.sky(part, s.weather), s.date?.short ?? ''].filter(Boolean);
  }
  // Where and when, said once and quietly under the heading of what is before you: "Bretheltaure, Galadhtaure ·
  // Morning, fair, 24 Wolfmoon". Its mark is a short neutral dash, whatever the hour: no Atlas tone off the action
  // rows (OR-513).
  // With the app, the place's own mark leads it, in place of the hour's (see PlaceMark).
  static When({ frame, extra, app }: { frame: Frame; extra?: string; app?: ReaderApp }) {
    // From the nearest to the widest, none said twice (the market-place of a town says the town).
    const [country, ...within] = Stage.where(frame), all = [...extra ? [extra] : [], ...within.toReversed(), country!];
    const where = all.filter((w, i) => w && !all.slice(0, i).some(o => o.toLowerCase().includes(w.toLowerCase())));
    return (
      <p className={`when light-${FictionalTime.part(frame.screen.elapsed)}${app ? ' marked' : ''}`} data-id="clock">
        {app && <PlaceMark.View app={app} />}
        <span className="at">{Typography.curl(where.join(', '))}</span>
        {/* How deep under the ground the company is (the owner, 4 November). */}
        {frame.screen.place.depth && <span className="depth" data-id="depth">
          {frame.screen.place.depth === 1 ? 'One storey down' : Words.upper(`${Words.many(frame.screen.place.depth, 'storey')} down`)}</span>}
        {/* Said where it is news; after, it fades where it stood, its room kept, so the heading neither blinks nor
            moves (M22's third review, OR-53: the weather line appeared and then vanished). */}
        <span className={`hour${Stage.fresh(frame) ? '' : ' stale'}`} aria-hidden={!Stage.fresh(frame) || undefined}>
          {Stage.when(frame).join(', ')}</span>
      </p>
    );
  }
  // The hour, the weather and the day are said where they are news (the owner's doctrine, 14 November: "Don't
  // continually repeat the date, time, location, and other unchanged facts"): on coming to a place, and when they have
  // changed since they were last said; not again under every act done where the company stands. Decided once a frame,
  // so that the page drawn again says the same.
  private static said?: string;
  private static readonly fresher = new WeakMap<Frame, boolean>();
  static fresh(frame: Frame): boolean {
    if (!Stage.fresher.has(frame)) {
      const hour = Stage.when(frame).join(', ');
      Stage.fresher.set(frame, !!frame.leaf.moved || hour !== Stage.said);
      Stage.said = hour;
    }
    return Stage.fresher.get(frame)!;
  }
  // What the company has to spend and to eat, said quietly under where and when, on every page of play (CL-66: it had
  // been drawn only by PlaceStage.You, which nothing rendered, so the purse was in the Book alone). A reading, not a
  // control.
  static Purse({ screen }: { screen: Screen }) {
    const p = screen.purse;
    return <p className="stage-purse" data-id="purse">
      {`${p.coin} ${p.currency ?? 'coin'} · ${p.rations} ${p.rations === 1 ? 'ration' : 'rations'}`}</p>;
  }
}

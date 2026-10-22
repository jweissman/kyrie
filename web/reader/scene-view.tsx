import { memo } from 'react';
import type { Entry } from '../engine/protocol';
import type { Screen, TargetRow } from '../../src/ui/screen-types';
import { EntryView } from './entry-view';
import { Words } from './words';

// The place: its name, where it lies, what it is like now and who is in it, then what has happened here since the
// company came. A new place is a new page; a place returned to marks what has changed.
export class SceneView {
  static View({ screen, entries }: { screen: Screen; entries: Entry[] }) {
    const here = EntryView.here(entries, screen.place.id);
    return (
      <section className="scene" key={screen.place.id} aria-label={screen.place.name}>
        <SceneView.Head screen={screen} />
        <SceneView.Prose prose={screen.prose} fresh={screen.fresh} present={SceneView.present(screen).join(' ')} />
        {here.map((e, i) => <EntryView.Memo key={e.id} entry={e} latest={i === here.length - 1} prose={screen.prose} />)}
      </section>
    );
  }
  static Head({ screen }: { screen: Screen }) {
    const where = screen.path.slice(0, -1).reverse().slice(0, 2).map(p => p.name).join(', ');
    return (
      <header className="scene-head">
        <h1 data-id="place">{Words.upper(screen.place.name)}</h1>
        {where && <p className="where">{where}{screen.dark && <b className="dark"> · no light</b>}</p>}
      </header>
    );
  }
  static readonly Prose = memo(SceneView.paragraphs);
  private static paragraphs({ prose, fresh, present }: { prose: string[]; fresh: string[]; present: string }) {
    return (
      <div className="prose now">
        {prose.map((p, i) => <p key={i} className={fresh.includes(p) ? 'new' : undefined}>{p}</p>)}
        {present && <p className="present">{present}</p>}
      </div>
    );
  }
  // Who and what is here, as they can be seen now: what each is doing, or that they lie dead.
  private static present(screen: Screen): string[] {
    return [...screen.people, ...screen.things].flatMap((t: TargetRow) => {
      if (t.says?.length) { return t.says; }
      if (t.state) { return [`${Words.upper(Words.short(t.name))} ${t.state === 'dead' ? 'lies dead' : 'is down'}.`]; }
      return [];
    });
  }
}

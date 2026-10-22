import { memo, useMemo } from 'react';
import type { Entry } from '../engine/protocol';
import type { Screen, TargetRow } from '../../src/ui/screen-types';
import { EntryView } from './entry-view';
import { Words } from './words';

// The place: its name, where it lies, what it is like now and who is in it, then what has happened here since the
// company came. A new place is a new page; a place returned to marks what has changed.
export class SceneView {
  static View({ screen, entries }: { screen: Screen; entries: Entry[] }) {
    const here = EntryView.here(entries, screen.place.id), present = SceneView.present(screen);
    // What the page already says of the place and who is in it, an entry does not say again.
    const told = useMemo(() => [...screen.prose, ...present], [screen.prose, present.join('\n')]);
    return (
      <section className="scene" key={screen.place.id} aria-label={screen.place.name}>
        <SceneView.Head screen={screen} />
        <SceneView.Prose prose={screen.prose} fresh={screen.fresh} present={present.join(' ')} />
        {here.map((e, i) => <EntryView.Memo key={e.id} entry={e} latest={i === here.length - 1} prose={told} />)}
      </section>
    );
  }
  static Head({ screen }: { screen: Screen }) {
    const where = [...new Set(screen.path.slice(0, -1).reverse().map(p => p.name))].slice(0, 2).join(', ');
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

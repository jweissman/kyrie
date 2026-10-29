import { useEffect, useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { SceneModel } from '../../../src/ui/scene';
import { Act, type Draw } from './act';
import { Words } from '../words';

// Beside who is here, at the head of the ways (Mission 18, the owner's review: what there is to do and where to find
// what you need were lost among the company's own choices and the ways): what there is to do here, of the place's
// own; and, in a settlement, where food, light, gear and remedies are found.
export class HerePane {
  // Whether the stage is laid out side by side (as stage.css lays it out at this width and way up).
  static useWide(): boolean {
    const query = '(min-width: 1024px) and (orientation: landscape)';
    const [wide, be] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
    useEffect(() => {
      if (typeof matchMedia !== 'function') { return; }
      const m = matchMedia(query), on = () => be(m.matches);
      m.addEventListener('change', on);
      return () => m.removeEventListener('change', on);
    }, []);
    return wide;
  }
  // What there is to do here, of the place's own (the skittles, the swing-boat, a penny a stair): beside who is here,
  // not among what you can do anywhere (waiting, searching).
  static Doing({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const doing = (app.menu.scene?.you ?? []).filter(SceneModel.own);
    if (!doing.length) { return null; }
    return (
      <section className="doing" aria-label="To do here" data-line="To do here">
        <p className="label">To do here</p>
        <Act.List choices={doing} draw={draw} className="column" />
      </section>
    );
  }
  // Where in the settlement what anyone needs is found (Mission 18, the owner's fifth priority): food, light, gear and
  // remedies, by the place each is found, here or a walk away. Said, not offered again: the ways to each are the ways
  // on, and whoever sells it is among the people when they are here.
  static Services({ app }: { app: ReaderApp }) {
    const screen = app.state.frame!.screen, services = screen.services ?? [];
    const town = screen.path.filter(p => p.kind === 'settlement').at(-1)?.name;
    if (!services.length || !town) { return null; }
    const places = new Map<string, { name: string; here: boolean; needs: string[] }>();
    for (const s of services) {
      const row = places.get(s.place.id) ?? { name: s.place.name, here: s.here, needs: [] };
      if (!row.needs.includes(s.need)) { row.needs.push(s.need); }
      places.set(s.place.id, row);
    }
    return (
      <section className="services" aria-label={`Found in ${town}`} data-line="Found here">
        <p className="label">In {Typography.curl(town)}</p>
        <ul>{[...places.entries()].map(([id, p]) => <li key={id} data-place={id}>
          <span className="need">{p.needs.join(' · ')}</span>
          <span className="who">{p.here ? 'Here' : Typography.curl(Words.upper(p.name))}</span></li>)}</ul>
      </section>
    );
  }
}

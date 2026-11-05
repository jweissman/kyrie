import type { ReaderApp } from '../reader-app';
import { CompanyPortraits } from '../../../src/paintings/company-portraits';
import { Glyphs } from './glyphs';

// The life chosen so far, as a small row of its emblems in the corner (the owner, 5 November): the people, the kind
// of life before, the calling and its way, and the likeness once it is the one alone (a people, a calling and how
// you present all chosen: how you present is asked on the last page, and until it has been seen nothing stands for
// it). Each changes as its choice does; it shows and decides nothing else.
export class Signature {
  static View({ app, likeness }: { app: ReaderApp; likeness: boolean }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    const before = catalog.backgrounds.find(b => b.id === m.backgroundId);
    const life = before && catalog.kinds.find(k => k.id === before.kind);
    const way = calling?.specializations.find(t => t.id === m.traits?.[0]);
    const marks = [people && { id: people.id, name: people.name }, life && { id: `life_${life.id}`, name: life.name },
      calling && { id: calling.id, name: calling.name }, way && { id: way.id, name: way.name }]
      .filter((x): x is { id: string; name: string } => !!x && Glyphs.has(x.id));
    const presentation = ({ she: 'woman', he: 'man' } as const)[m.pronouns as 'she' | 'he'];
    const face = likeness && people && calling && presentation
      && CompanyPortraits.of({ raceId: people.id, classId: calling.id, presentation, key: m.name ?? '' });
    if (!marks.length) { return null; }
    return (
      <ol className="signature" aria-label="Your life so far">
        {marks.map(x => <li key={x.id} title={x.name} data-id={x.id}><Glyphs.View id={x.id} label={x.name} /></li>)}
        {face && <li className="face" key={face.id}><img src={face.src} alt="" decoding="async" /></li>}
      </ol>
    );
  }
}

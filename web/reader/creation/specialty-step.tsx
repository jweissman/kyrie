import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Words } from '../words';
import { Card } from './card';

type Calling = Catalog['callings'][number];

// Within a calling, its way: a cleric's god, a mage's school, a warrior's or a monk's discipline, with what each
// does and what its first spells are of. Left alone, the first is taken.
export class SpecialtyStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, calling = catalog.callings.find(c => c.id === m.classId);
    if (!calling) { return null; }
    const mine = calling.specializations.find(t => t.id === m.traits?.[0]);
    return (
      <Card.Deck kind="specialties" detail={mine && <Card.Particulars title={mine.name}
        facts={SpecialtyStep.facts(mine, calling)} />}>
        {calling.specializations.map(t => <Card.View key={t.id} name={t.name} chosen={m.traits?.[0] === t.id} glyph=""
          text={/^This creature/.test(t.text ?? '') ? undefined : Words.upper((t.text ?? '').replace(/^You are /, ''))}
          rule={t.of ? `First ${calling.id === 'cleric' ? 'prayers' : 'spells'} of ${t.of}` : undefined}
          data={{ choice: `specialization:${t.id}` }}
          onChoose={() => app.opening.edit(0, 'specialization', t.id)} />)}
      </Card.Deck>
    );
  }
  static ask(calling: Calling): string {
    return calling.id === 'cleric' ? 'To which god are you sworn?' : calling.id === 'mage'
      ? 'In which school did you learn?' : `What is your way, as ${Words.article(calling.name.toLowerCase())}?`;
  }
  private static facts(t: Calling['specializations'][number], calling: Calling): string[] {
    return [...t.does ? [`${Words.upper(t.does)}.`] : [],
      ...t.of ? [`Your first ${calling.id === 'cleric' ? 'prayers' : 'spells'} are of ${t.of}.`] : []];
  }
}

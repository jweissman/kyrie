import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

type Calling = Catalog['callings'][number];

// Your calling: what each is in play, a card each with what it does in a few words, the chosen one's sentence
// beneath, and behind Details all it is by the rules (its hit points and armour, the weapons and skills it brings,
// what it casts by, what it adds to the qualities). A calling your people never follow says so.
export class CallingStep {
  static View({ app, onward }: { app: ReaderApp; onward?: ReactNode }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    return (
      <Card.Deck kind="callings" onward={onward} details={calling && { title: calling.name,
        body: <Card.Particulars facts={CallingStep.facts(calling, catalog)} /> }}>
        {catalog.callings.map(c => <Card.View key={c.id} name={c.name} line={c.line} text={c.text} glyph={c.id}
          chosen={m.classId === c.id} data={{ choice: `classId:${c.id}` }} onChoose={() => app.opening.edit(0, 'classId', c.id)}
          shut={people && !people.callings.includes(c.id) ? `Not for ${PeopleStep.plural(people)}` : undefined} />)}
      </Card.Deck>
    );
  }
  // A calling by the rules, in a few lines.
  static facts(c: Calling, catalog: Catalog): string[] {
    const kinds = [...new Set(c.weapons.map(w => CreationRules.group(w.kind).toLowerCase()))];
    const worn = c.armour.split(', ').filter(a => a !== 'clothing');
    return [c.text, `Hit points: ${c.hitDie} at first level, ${c.hitDie / 2} more at each level after.`,
      worn.length ? `Wears ${worn.join(', ')}.` : 'Wears no armour.',
      c.weapons.length ? `Fights with ${c.weapons.length > 30 ? 'any weapon' : kinds.join(', ')}.` : 'Fights with bare hands.',
      ...c.skills.length ? [`Knows ${c.skills.map(k => k.toLowerCase()).join(', ')}.`] : [],
      ...c.casts ? [`Its spells rest on ${Words.upper(c.casts)}.`] : [], PeopleStep.adds(c.qualities, catalog)];
  }
}

import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

type Calling = Catalog['callings'][number];

// Your calling: what each is in play, a card each, with its hit die and armour in a phrase, and beneath, for the
// chosen one, all it is by the rules (the weapons and skills it brings, what it casts by, what it adds to the
// qualities). A calling your people never follow says so.
export class CallingStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    return (
      <Card.Deck kind="callings" detail={calling && <Card.Particulars title={calling.name}
        facts={CallingStep.facts(calling, catalog)} />}>
        {catalog.callings.map(c => <Card.View key={c.id} name={c.name} text={c.text} glyph={c.id} chosen={m.classId === c.id}
          rule={`${c.hitDie} hit points at first · ${c.casts ? `casts by ${c.casts}` : `wears ${CallingStep.armour(c)}`}`}
          data={{ choice: `classId:${c.id}` }} onChoose={() => app.opening.edit(0, 'classId', c.id)}
          shut={people && !people.callings.includes(c.id) ? `Not for ${Words.article(people.name.toLowerCase())}.` : undefined} />)}
      </Card.Deck>
    );
  }
  private static armour(c: Calling): string { return c.armour.split(',')[0]!.trim(); }
  // A calling by the rules, in a few lines.
  static facts(c: Calling, catalog: Catalog): string[] {
    const kinds = [...new Set(c.weapons.map(w => CreationRules.group(w.kind).toLowerCase()))];
    return [`Hit points: ${c.hitDie} at first level, ${c.hitDie / 2} more at each level after.`, `Wears ${c.armour}.`,
      c.weapons.length ? `Fights with ${c.weapons.length > 30 ? 'any weapon' : kinds.join(', ')}.` : 'Fights with bare hands.',
      ...c.skills.length ? [`Knows ${c.skills.map(k => k.toLowerCase()).join(', ')}.`] : [],
      ...c.casts ? [`Casts by ${c.casts}.`] : [], PeopleStep.adds(c.qualities, catalog)];
  }
}

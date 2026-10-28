import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

type Calling = Catalog['callings'][number];

// Your calling: what each is in play, and what it is by the rules (its hit die, the armour it may wear, the weapons
// and skills it brings, what it adds to the qualities); and, for a calling that has them, the specialty within it
// (a mage's school, a cleric's god), with what its first spells are of.
export class CallingStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const people = catalog.ancestries.find(a => a.id === m.raceId), calling = catalog.callings.find(c => c.id === m.classId);
    return <>
      <Card.Deck title="Your calling" kind="callings">
        {catalog.callings.map(c => <Card.View key={c.id} name={c.name} text={c.text} chosen={m.classId === c.id}
          data={{ choice: `classId:${c.id}` }} onChoose={() => app.opening.edit(0, 'classId', c.id)}
          shut={people && !people.callings.includes(c.id) ? `Not for ${Words.article(people.name.toLowerCase())}.` : undefined}
          facts={CallingStep.facts(c, catalog)} />)}
      </Card.Deck>
      {calling && calling.specializations.length > 0 && <Card.Deck kind="specialties"
        title={calling.id === 'cleric' ? 'Sworn to' : `Your specialty as ${Words.article(calling.name.toLowerCase())}`}
        how="Or let it fall as it will: the first is taken if you choose none.">
        {calling.specializations.map(t => <Card.View key={t.id} name={t.name} chosen={m.traits?.[0] === t.id}
          text={/^This creature/.test(t.text ?? '') ? undefined : (t.text ?? '').replace(/^You are /, '')}
          data={{ choice: `specialization:${t.id}` }}
          facts={[...t.does ? [`${Words.upper(t.does)}.`] : [],
            ...t.of ? [`Your first ${calling.id === 'cleric' ? 'prayers' : 'spells'} are of ${t.of}.`] : []]}
          onChoose={() => app.opening.edit(0, 'specialization', m.traits?.[0] === t.id ? '' : t.id)} />)}
      </Card.Deck>}
    </>;
  }
  // A calling by the rules, in a few lines.
  static facts(c: Calling, catalog: Catalog): string[] {
    const kinds = [...new Set(c.weapons.map(w => CreationRules.group(w.kind).toLowerCase()))];
    return [`Hit points: ${c.hitDie} at first level, ${c.hitDie / 2} more at each level after.`, `Wears ${c.armour}.`,
      c.weapons.length ? `Fights with ${c.weapons.length > 30 ? 'any weapon' : kinds.join(', ')}.` : 'Fights with bare hands.',
      ...c.skills.length ? [`Knows ${c.skills.map(k => k.toLowerCase()).join(', ')}.`] : [],
      ...c.casts ? [`Casts by ${c.casts}.`] : [], PeopleStep.adds(c.qualities, catalog)];
  }
}

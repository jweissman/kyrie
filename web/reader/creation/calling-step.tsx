import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import type { Catalog } from '../../engine/protocol';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { Card } from './card';

type Calling = Catalog['callings'][number];

// Your calling: what each is in play, a card each with what it does in a few words, the chosen one's sentence
// beneath, and behind Details all it is by the rules (its hit points and armour, the weapons and skills it brings,
// what it casts by, what it adds to the qualities). A calling your people never follow says so.
export class CallingStep {
  static View({ app, step, onward }: { app: ReaderApp; step: CreationStep; onward?: ReactNode }) {
    const catalog = app.state.catalog!, calling = catalog.callings.find(c => c.id === step.chosen);
    return (
      <Card.Deck kind="callings" onward={onward} details={calling && { title: calling.name,
        head: { kind: 'Calling', glyph: calling.id, summary: calling.text },
        body: <Card.Particulars title="What the calling makes of you" facts={CallingStep.facts(calling, catalog).slice(1)} /> }}>
        {step.cards.map(c => <Card.View key={c.id} name={c.name} line={c.line} text={c.text} glyph={c.id} shut={c.shut}
          chosen={step.chosen === c.id} data={{ choice: `classId:${c.id}` }} onChoose={() => app.opening.choose(step.id, c.id)} />)}
      </Card.Deck>
    );
  }
  // A calling by the rules, in a few lines.
  // What the calling wants of the qualities: the dice placed there first (it adds nothing on top: see
  // Content.createCreature).
  static places(qualities: Record<string, number>, catalog: Catalog): string {
    const wanted = catalog.qualities.filter(q => (qualities[q.id] ?? 0) > 0).map(q => q.name.toLowerCase());
    return wanted.length ? `Your best rolls go to ${Words.listed(wanted)}.` : 'Takes your rolls as they fall.';
  }
  static facts(c: Calling, catalog: Catalog): string[] {
    const kinds = [...new Set(c.weapons.map(w => CreationRules.group(w.kind).toLowerCase()))];
    const worn = c.armour.split(', ').filter(a => a !== 'clothing');
    return [c.text, `Hit points: ${c.hitDie} at first level, a roll of 1d${c.hitDie} more at each level after.`,
      worn.length ? `Wears ${worn.join(', ')}.` : 'Wears no armour.',
      c.weapons.length ? `Fights with ${c.weapons.length > 30 ? 'any weapon' : kinds.join(', ')}.` : 'Fights with bare hands.',
      ...c.skills.length ? [`Knows ${c.skills.map(k => k.toLowerCase()).join(', ')}.`] : [],
      ...c.casts ? [`Its spells rest on ${Words.upper(c.casts)}.`] : [], CallingStep.places(c.qualities, catalog)];
  }
}

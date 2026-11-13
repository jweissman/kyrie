import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import { Card } from './card';

// Under which stars you were born: Imbar's twelve signs, one a month (data/imbar/sky.json), the engine's cards in its
// order (the sign drawn first, then the months after it as the sky turns), each drawn as its constellation. A deck as
// the other steps are, until the observatory realizes the same choice as a sky (TO-04).
export class SignStep {
  static View({ app, step, onward }: { app: ReaderApp; step: CreationStep; onward?: ReactNode }) {
    const chosen = step.cards.find(c => c.id === step.chosen);
    return (
      <Card.Deck kind="signs" onward={onward} details={chosen && { title: chosen.name,
        head: { kind: 'Born under', glyph: chosen.id, summary: chosen.line ?? '' },
        body: <Card.Particulars title="Born under it" facts={[chosen.line ?? chosen.name]} /> }}>
        {step.cards.map(c => <Card.View key={c.id} name={c.name} line={c.line} glyph={c.id}
          chosen={step.chosen === c.id} data={{ action: 'sign', id: c.id }} onChoose={() => app.opening.choose(step.id, c.id)} />)}
      </Card.Deck>
    );
  }
}

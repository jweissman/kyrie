import type { ChangeEvent } from 'react';
import type { ReaderApp } from '../reader-app';
import { CreationRules } from '../creation-rules';
import { Card } from './card';
import { Words } from '../words';

// Who you are: your name, and your people, each with what it is, what it adds to the qualities, and the callings it
// does not follow.
export class PeopleStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    return <>
      <label className="name-field">Your name
        <input value={m.name ?? ''} data-field="name" autoComplete="off" spellCheck={false}
          onChange={(e: ChangeEvent<HTMLInputElement>) => app.opening.edit(0, 'name', e.currentTarget.value)} /></label>
      <Card.Deck title="Your people" kind="people">
        {catalog.ancestries.map(a => <Card.View key={a.id} name={a.name} text={a.text} chosen={m.raceId === a.id}
          data={{ choice: `raceId:${a.id}` }} onChoose={() => app.opening.edit(0, 'raceId', a.id)}
          facts={[PeopleStep.adds(a.qualities, catalog), PeopleStep.closed(a.callings, catalog)].filter(Boolean)} />)}
      </Card.Deck>
    </>;
  }
  // "+1 Dexterity, −1 Constitution": what a people adds to the rolls, quality by quality.
  static adds(qualities: Record<string, number>, catalog: NonNullable<ReaderApp['state']['catalog']>): string {
    const said = catalog.qualities.filter(q => qualities[q.id]).map(q => `${CreationRules.signed(qualities[q.id]!)} ${q.name}`);
    return said.length ? `To your qualities: ${said.join(', ')}.` : 'Adds nothing to your qualities.';
  }
  private static closed(callings: string[], catalog: NonNullable<ReaderApp['state']['catalog']>): string {
    const not = catalog.callings.filter(c => !callings.includes(c.id)).map(c => c.name.toLowerCase());
    return not.length ? `Never ${Words.article(not.length > 1 ? `${not.slice(0, -1).join(', ')} or ${not.at(-1)}`
      : not[0]!)}.` : '';
  }
}

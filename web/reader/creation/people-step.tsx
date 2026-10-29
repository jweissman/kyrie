import type { ReaderApp } from '../reader-app';
import { CreationRules } from '../creation-rules';
import { Card } from './card';
import { Words } from '../words';

// Your people: each a card with what it is and its first gift by birth; the chosen one's every gift, what it adds to
// the qualities and the callings it does not follow, beneath.
export class PeopleStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, mine = catalog.ancestries.find(a => a.id === m.raceId);
    return (
      <Card.Deck kind="people" detail={mine && <Card.Particulars title={mine.name}
        facts={[...mine.gifts, PeopleStep.adds(mine.qualities, catalog), PeopleStep.closed(mine.callings, catalog)]
          .filter(Boolean)} />}>
        {catalog.ancestries.map(a => <Card.View key={a.id} name={a.name} text={a.text} glyph={a.id} chosen={m.raceId === a.id}
          rule={a.gifts[0]} data={{ choice: `raceId:${a.id}` }} onChoose={() => app.opening.edit(0, 'raceId', a.id)} />)}
      </Card.Deck>
    );
  }
  // "+1 Dexterity, −1 Constitution": what a people adds to the rolls, quality by quality.
  static adds(qualities: Record<string, number>, catalog: NonNullable<ReaderApp['state']['catalog']>): string {
    const said = catalog.qualities.filter(q => qualities[q.id]).map(q => `${CreationRules.signed(qualities[q.id]!)} ${q.name}`);
    return said.length ? `To your qualities: ${said.join(', ')}.` : 'Adds nothing to your qualities.';
  }
  static closed(callings: string[], catalog: NonNullable<ReaderApp['state']['catalog']>): string {
    const not = catalog.callings.filter(c => !callings.includes(c.id)).map(c => c.name.toLowerCase());
    return not.length ? `Never ${Words.article(not.length > 1 ? `${not.slice(0, -1).join(', ')} or ${not.at(-1)}`
      : not[0]!)}.` : '';
  }
}

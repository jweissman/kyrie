import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import { CreationRules } from '../creation-rules';
import { Card } from './card';
import { Words } from '../words';
import { CompanyPortraits } from '../../../src/paintings/company-portraits';

// Your people: each a card with what they are in a few words; the chosen one's sentence beneath, and behind Details
// its every gift, what it adds to the qualities and the callings it does not follow.
export class PeopleStep {
  static View({ app, step, onward }: { app: ReaderApp; step: CreationStep; onward?: ReactNode }) {
    const catalog = app.state.catalog!, mine = catalog.ancestries.find(a => a.id === step.chosen);
    return (
      <Card.Deck kind="people" onward={onward} details={mine && { title: mine.name,
        head: { kind: 'Ancestry', glyph: mine.id, face: PeopleStep.face(app, mine.id), summary: mine.text },
        body: <Card.Particulars title="Born of them" facts={[...mine.gifts, PeopleStep.adds(mine.qualities, catalog),
          PeopleStep.closed(mine.callings, catalog)].filter(Boolean)} /> }}>
        {step.cards.map(a => <Card.View key={a.id} name={a.name} line={a.line} text={a.text} glyph={a.id} shut={a.shut}
          chosen={step.chosen === a.id} data={{ choice: `raceId:${a.id}` }}
          onChoose={() => app.opening.choose(step.id, a.id)} />)}
      </Card.Deck>
    );
  }
  // A likeness of the people in the calling chosen, as you present if you have said, else either.
  static face(app: ReaderApp, raceId: string): string | undefined {
    const m = app.state.party[0]!, presentation = ({ she: 'woman', he: 'man' } as const)[m.pronouns as 'she' | 'he'];
    return CompanyPortraits.of({ raceId, classId: m.classId ?? 'commoner', ...presentation ? { presentation } : {},
      key: m.name ?? raceId })?.medium;
  }
  // "+1 Dexterity, −1 Constitution": what a people adds to the rolls, quality by quality.
  static adds(qualities: Record<string, number>, catalog: NonNullable<ReaderApp['state']['catalog']>): string {
    const said = catalog.qualities.filter(q => qualities[q.id]).map(q => `${CreationRules.signed(qualities[q.id]!)} ${q.name}`);
    return said.length ? `To your qualities: ${said.join(', ')}.` : 'Adds nothing to your qualities.';
  }
  // A people in the plural, as a card a calling they never follow says so ("Not for elves").
  static plural(people: { id: string; name: string }): string {
    const name = people.name.toLowerCase();
    return ({ elf: 'elves', dwarf: 'dwarves' } as Record<string, string>)[people.id] ?? (/folk$/.test(name) ? name : `${name}s`);
  }
  static closed(callings: string[], catalog: NonNullable<ReaderApp['state']['catalog']>): string {
    const not = catalog.callings.filter(c => !callings.includes(c.id)).map(c => c.name.toLowerCase());
    return not.length ? `Never ${Words.article(not.length > 1 ? `${not.slice(0, -1).join(', ')} or ${not.at(-1)}`
      : not[0]!)}.` : '';
  }
}

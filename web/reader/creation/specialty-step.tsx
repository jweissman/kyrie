import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Words } from '../words';
import { Card } from './card';
import { SpellStrip } from './spell-strip';
import { PeopleStep } from './people-step';

type Calling = Catalog['callings'][number];
type Way = Calling['specializations'][number];

// Within a calling, its way: a mage's school, a cleric's domain, a warrior's or a monk's discipline, each a card with
// its emblem and what it is for in a few words (a domain by its own name, Life or Storm: its clerics' titles had read
// as a table of trades). For one that casts, the chosen way's spells beneath, those cast from the first and the rest
// by name (OWN-15: a school had been its name and "First spells of abjuration"); for a discipline, what it is like in
// a sentence. Its rules in plain words, and each spell's in whole, are behind Details. The first the people may take
// is chosen until another is (see CreationDefaults).
export class SpecialtyStep {
  static View({ app, onward }: { app: ReaderApp; onward?: ReactNode }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, calling = catalog.callings.find(c => c.id === m.classId);
    if (!calling) { return null; }
    const mine = calling.specializations.find(t => t.id === m.traits?.[0]);
    const people = catalog.ancestries.find(a => a.id === m.raceId), who = calling.name.toLowerCase();
    return (
      <Card.Deck kind="specialties" onward={onward} details={mine && SpecialtyStep.details(mine, who)}
        after={mine?.spells && <SpellStrip.View spells={mine.spells} calling={who} />}>
        {calling.specializations.map(t => <Card.View key={t.id} name={t.name} line={t.line} glyph={t.id}
          text={SpecialtyStep.sentence(t)} chosen={m.traits?.[0] === t.id} data={{ choice: `specialization:${t.id}` }}
          shut={people?.forbids.includes(t.id) ? `Not for ${PeopleStep.plural(people)}` : undefined}
          onChoose={() => app.opening.edit(0, 'specialization', t.id)} />)}
      </Card.Deck>
    );
  }
  // Who takes a way, said of them: "You are a conduit of divine life energy" is "A vitalist is a conduit of divine
  // life energy"; "You embody…", "A cherubist embodies…".
  private static taker(t: Way): string {
    const who = Words.upper(Words.article((t.title ?? t.name).toLowerCase())), said = t.text ?? '';
    return /^You are /.test(said) ? said.replace(/^You are /, `${who} is `)
      : said.replace(/^You (\w+?)(y?) /, (_, verb: string, y: string) => `${who} ${verb}${y ? 'ies' : 's'} `);
  }
  static ask(calling: Calling): string {
    return calling.id === 'cleric' ? 'Choose your domain' : calling.id === 'mage' ? 'Choose your school' : 'Choose your way';
  }
  // A way in a sentence: a school's or a domain's as it is said of those who take it, a discipline's its own.
  private static sentence(t: Way): string {
    return Words.upper((t.text ?? '').replace(/^You are /, ''));
  }
  // Behind Details: who takes it, and its spells level by level; or a discipline's rules in plain words. None, where
  // they would only say again what is said beneath the cards.
  private static details(t: Way, calling: string): { title: string; body: ReactNode } | undefined {
    if (t.spells) {
      return { title: t.name, body: <><Card.Particulars facts={[SpecialtyStep.taker(t)]} />
        <SpellStrip.Rules spells={t.spells} calling={calling} /></> };
    }
    return t.rules?.length ? { title: t.name, body: <Card.Particulars facts={t.rules} /> } : undefined;
  }
}

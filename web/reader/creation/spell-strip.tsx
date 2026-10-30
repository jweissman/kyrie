import type { FirstSpell } from '../../engine/protocol';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';
import { Card } from './card';

// The spells a school or a god's domain sets out with (OWN-15), as they will be had: those that can be cast from the
// first, a row each under a small word for when (at will; at first level), with the emblem of what it is for, its
// name and what it does in a line; then, in a line of its own, the calling's own (every mage's Light) and those known
// now and cast later, at second and third level, by name (the first strip had shown all nine alike, a table of
// them). What each does in whole, and what its conditions do, is behind Details, level by level.
export class SpellStrip {
  static readonly levels: [number, string][] = [[0, 'At will'], [1, 'First level'], [2, 'Second level, later'],
    [3, 'Third level, later']];
  static View({ spells, calling }: { spells: FirstSpell[]; calling: string }) {
    const now = spells.filter(s => s.level <= 1 && !s.own);
    return (
      <div className="first-spells" aria-label="The spells you set out knowing">
        {SpellStrip.levels.slice(0, 2).map(([level, when]) => now.some(s => s.level === level)
          && <section key={level} className="spell-group" aria-label={when}>
            <h3 className="spell-when">{when}</h3>
            <ul>{now.filter(s => s.level === level).map(s => <li key={s.id} className="first-spell" data-spell={s.id}
              data-kind={s.kind}>
              <Glyphs.View id={s.kind} name={s.name} className="spell-glyph" />
              <span className="spell-name">{Typography.curl(s.name)}</span>
              <span className="spell-text">{Typography.curl(s.line)}</span>
            </li>)}</ul>
          </section>)}
        <p className="spell-later">{Typography.curl(SpellStrip.after(spells, calling))}</p>
      </div>
    );
  }
  // "Every mage knows Light too. Later: Burning Hands, Shocking Grasp and Sound Lance."
  static after(spells: FirstSpell[], calling: string): string {
    const own = spells.filter(s => s.own).map(s => s.name), later = spells.filter(s => s.level > 1).map(s => s.name);
    return [own.length ? `Every ${calling} knows ${SpellStrip.list(own)} too.` : '',
      later.length ? `Later: ${SpellStrip.list(later)}.` : ''].filter(Boolean).join(' ');
  }
  private static list(names: string[]): string {
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] ?? '';
  }
  // Each spell by the rules, for Details, under when it is cast: what it does in whole, then what each condition it
  // lays does and the save that resists it.
  static Rules({ spells, calling }: { spells: FirstSpell[]; calling: string }) {
    return <>{SpellStrip.levels.filter(([level]) => spells.some(s => s.level === level)).map(([level, when]) =>
      <section key={level} className="spell-rules">
        <p className="label">{when}</p>
        <ul>{spells.filter(s => s.level === level).map(s => <li key={s.id}>
          <p><b>{Typography.curl(s.name)}</b> {Typography.curl(`${s.does}.`)}
            {s.own && <span className="own">{` Every ${calling} knows it.`}</span>}</p>
          {s.rules.map((r, i) => <p key={i} className="rule">{Card.fact(r)}</p>)}
        </li>)}</ul>
      </section>)}</>;
  }
}

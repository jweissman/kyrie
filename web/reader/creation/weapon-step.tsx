import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { CreationRules } from '../creation-rules';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Card } from './card';

type Weapon = Catalog['callings'][number]['weapons'][number];

// The weapon you carry, behind Details on the last page: the one you would strike best with until you choose (OWN-14:
// fewer pages), the rest by family (blades, axes, spears and polearms, bows…), the family of the one held open, each a
// row led by its die, with what it averages a blow at your scores, the harm it does, and whether it suits you best or
// is the calling's own. Beneath, the one held by the rules. A long list scrolls down, never sideways (a warrior has
// fifty-two).
export class WeaponStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const calling = catalog.callings.find(c => c.id === m.classId), weapons = calling?.weapons ?? [];
    if (!calling || !weapons.length) {
      return <p className="how">{`${Words.upper(Words.article(calling?.name.toLowerCase() ?? 'you'))} fights with bare`
        + ' hands, and needs no weapon.'}</p>;
    }
    const best = CreationRules.best(weapons, m, catalog), chosen = weapons.find(w => w.id === (m.weapon ?? best?.id));
    const groups = [...new Set([...CreationRules.kinds.map(([, g]) => g), 'Other arms'])]
      .filter(g => weapons.some(w => CreationRules.group(w.kind) === g));
    const said = chosen && CreationRules.weapon(chosen, m, catalog);
    return <>
      {chosen && said && <Card.Particulars title={Words.upper(chosen.name)} facts={[`${Words.upper(said.harm)}.`,
        said.struck, `${Words.upper(chosen.weight || 'ordinary')} in weight; worth ${chosen.value} coin.`,
        ...said.also ? [said.also] : [], WeaponStep.blow]} />}
      {groups.map(g => <details key={g} className="kit-group" open={!!chosen && CreationRules.group(chosen.kind) === g}>
        <summary>{g}<small>{weapons.filter(w => CreationRules.group(w.kind) === g).length}</small></summary>
        <ul className="kit-rows">{weapons.filter(w => CreationRules.group(w.kind) === g)
          .sort((a, b) => CreationRules.average(a.damage) - CreationRules.average(b.damage)).map(w => <li key={w.id}>
            <button type="button" className="kit-row" data-nav aria-pressed={chosen?.id === w.id}
              data-choice={`weapon:${w.id}`} onClick={() => app.opening.edit(0, 'weapon', w.id)}>
              <span className="lead">{w.damage}</span><span className="name">{Words.upper(w.name)}</span>
              <span className="what">{WeaponStep.face(w, m, catalog)}</span>
              {(w.id === best?.id || w.own) && <span className="tag">{w.id === best?.id ? 'suits you best'
                : `a ${calling.name.toLowerCase()}’s own`}</span>}
            </button></li>)}</ul>
      </details>)}
    </>;
  }
  static readonly blow = 'A blow is a d20 that must meet a number set by your level and the foe’s armour; the quality you'
    + ' strike with adds to it, and to the harm.';
  // "5.5 a blow on average, slashing; held, medium": what a weapon does at your scores, in a phrase.
  private static face(w: Weapon, m: ReaderApp['state']['party'][number], catalog: Catalog): string {
    const harm = CreationRules.weapon(w, m, catalog).harm, avg = /, ([\d.]+) a blow/.exec(harm)?.[1];
    return Typography.curl(`${avg ?? '?'} a blow on average, ${w.type.toLowerCase()}; ${w.missile ? 'shot' : 'held'}`
      + `${w.weight ? `, ${w.weight}` : ''}.`);
  }
}

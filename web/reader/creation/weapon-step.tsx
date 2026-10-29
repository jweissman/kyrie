import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { CreationRules } from '../creation-rules';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Card } from './card';

type Weapon = Catalog['callings'][number]['weapons'][number];

// The weapon you favour: first its family (blades, axes, spears and polearms, bows…), then the weapons of that family
// your calling is trained to, each a card led by its die, with what it averages a blow at your scores, the harm it
// does, whether it is held or shot, and anything more (braced against a charge). The one you would strike best with
// is marked, and is yours until you choose. A warrior had been offered a longsword or a battleaxe and nothing said
// what either did (the owner's interim report).
export class WeaponStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const calling = catalog.callings.find(c => c.id === m.classId), weapons = calling?.weapons ?? [];
    const best = calling && CreationRules.best(weapons, m, catalog), chosen = weapons.find(w => w.id === (m.weapon ?? best?.id));
    const groups = [...new Set([...CreationRules.kinds.map(([, g]) => g), 'Other arms'])]
      .filter(g => weapons.some(w => CreationRules.group(w.kind) === g));
    const [group, open] = useState(chosen ? CreationRules.group(chosen.kind) : groups[0] ?? '');
    if (!calling || !weapons.length) {
      return <p className="how">{`${Words.upper(Words.article(calling?.name.toLowerCase() ?? 'you'))} fights with bare`
        + ' hands, and needs no weapon.'}</p>;
    }
    const said = chosen && CreationRules.weapon(chosen, m, catalog);
    return <>
      <ul className="kinds" aria-label="Kinds of weapon">{groups.map(g => <li key={g}><button type="button" className="kind"
        data-nav aria-pressed={group === g} onClick={() => open(g)}>{g}
        <small>{WeaponStep.span(weapons.filter(w => CreationRules.group(w.kind) === g))}</small></button></li>)}</ul>
      <Card.Deck kind="weapons" detail={chosen && said && <Card.Particulars title={Words.upper(chosen.name)}
        facts={[`${Words.upper(said.harm)}.`, said.struck, `${Words.upper(chosen.weight || 'ordinary')} in weight; worth`
          + ` ${chosen.value} coin.`, ...said.also ? [said.also] : [], WeaponStep.blow]} />}>
        {weapons.filter(w => CreationRules.group(w.kind) === group).sort((a, b) => CreationRules.average(a.damage)
          - CreationRules.average(b.damage)).map(w => <Card.View key={w.id} name={Words.upper(w.name)} big={w.damage}
          chosen={chosen?.id === w.id} text={WeaponStep.face(w, m, catalog)}
          rule={[w.missile ? 'Shot' : 'Held', w.weight, w.intercept && calling.braces ? 'sets against a charge' : '']
            .filter(Boolean).join(' · ')}
          tag={w.id === best?.id ? 'suits you best' : w.own ? `a ${calling.name.toLowerCase()}'s own` : undefined}
          data={{ choice: `weapon:${w.id}` }} onChoose={() => app.opening.edit(0, 'weapon', w.id)} />)}
      </Card.Deck>
    </>;
  }
  static readonly blow = 'A blow is a d20 that must meet a number set by your level and the foe’s armour; the quality you'
    + ' strike with adds to it, and to the harm.';
  // "5.5 a blow, slashing": what a weapon does at your scores, in a phrase.
  private static face(w: Weapon, m: ReaderApp['state']['party'][number], catalog: Catalog): string {
    const harm = CreationRules.weapon(w, m, catalog).harm, avg = /, ([\d.]+) a blow/.exec(harm)?.[1];
    return Typography.curl(`${avg ?? '?'} a blow on average, ${w.type.toLowerCase()}.`);
  }
  // The dice of a family, least to most: "1d4–1d10".
  private static span(ws: Weapon[]): string {
    const sorted = [...ws].sort((a, b) => CreationRules.average(a.damage) - CreationRules.average(b.damage));
    const [low, high] = [sorted[0]!.damage, sorted.at(-1)!.damage];
    return low === high ? low : `${low}–${high}`;
  }
}

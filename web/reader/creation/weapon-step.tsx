import type { ReaderApp } from '../reader-app';
import { CreationRules } from '../creation-rules';
import { Words } from '../words';
import { Card } from './card';

// The weapon you set out with: every ordinary weapon your calling is trained to, by kind, each as the rules have it
// (its die and the harm it does, what it averages a blow at your scores, whether it is held or shot and what that
// adds, and anything more: braced against a charge). The one you would strike best with is marked, and is yours until
// you choose (a warrior had been offered a longsword or a battleaxe, and nothing said what either did).
export class WeaponStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const calling = catalog.callings.find(c => c.id === m.classId), weapons = calling?.weapons ?? [];
    if (!calling || !weapons.length) {
      return <p className="how">{`${Words.upper(Words.article(calling?.name.toLowerCase() ?? 'you'))} fights with bare`
        + ' hands, and needs no weapon.'}</p>;
    }
    const best = CreationRules.best(weapons, m, catalog), chosen = m.weapon ?? best?.id;
    const groups = [...new Set([...CreationRules.kinds.map(([, g]) => g), 'Other arms'])]
      .filter(g => weapons.some(w => CreationRules.group(w.kind) === g));
    return <>
      <p className="how">{`${Words.upper(Words.article(calling.name.toLowerCase()))} is trained to ${weapons.length}`
        + ' weapons. A blow is a d20 that must meet a number set by your level and the foe\'s armour; what you strike'
        + ' with adds to it, and to the harm.'}</p>
      {groups.map(g => <Card.Deck key={g} title={g} kind="weapons">
        {weapons.filter(w => CreationRules.group(w.kind) === g).sort((a, b) => CreationRules.average(a.damage)
          - CreationRules.average(b.damage)).map(w => {
          const said = CreationRules.weapon(w, m, catalog);
          return <Card.View key={w.id} name={Words.upper(w.name)} chosen={chosen === w.id}
            tag={w.id === best?.id ? 'suits you best' : w.own ? `a ${calling.name.toLowerCase()}'s own` : undefined}
            text={`${said.harm}.`} facts={[said.struck, `${Words.upper(w.weight || 'ordinary')}; worth ${w.value} coin.`,
              ...said.also ? [said.also] : []]} data={{ choice: `weapon:${w.id}` }}
            onChoose={() => app.opening.edit(0, 'weapon', w.id)} />;
        })}
      </Card.Deck>)}
    </>;
  }
}

import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { CreationDefaults } from '../../engine/creation-defaults';
import { CreationSheet } from './creation-sheet';

type Way = Catalog['callings'][number]['specializations'][number];

// Your first-level spells, chosen (the owner, 3 November: a way of choosing spells): every first-level spell open to
// the way, a row each with what it does, those you know marked; as many as the way gives, one of them its own. Taken
// back, one leaves room for another; closed with fewer, or none of the way's own, the card's are yours again.
export class SpellChoice {
  private static n(k: number): string { return ['none', 'one', 'two', 'three', 'four', 'five', 'six'][k] ?? String(k); }
  static View({ app, way }: { app: ReaderApp; way: Way }) {
    const [open, show] = useState(false), first = way.first;
    if (!first) { return null; }
    const m = app.state.party[0]!, spells = m.spells ?? way.picks ?? [], ids = new Set(first.open.map(s => s.id));
    const chosen = spells.filter(id => ids.has(id)), left = first.count - chosen.length;
    const own = chosen.some(id => first.school.includes(id));
    const close = () => {
      if (!CreationDefaults.allowed(app.state.party[0]!.spells, way)) { app.opening.spells(0, [...way.picks ?? []]); }
      show(false);
    };
    const toggle = (id: string) => {
      const rest = spells.filter(x => !ids.has(x)), now = chosen.includes(id) ? chosen.filter(x => x !== id)
        : left > 0 ? [...chosen, id] : chosen;
      app.opening.spells(0, [...now, ...rest]);
    };
    return <>
      {/* In the page, above its way on: it had been a second footer, held to the foot of the screen under Continue
          (Mission 20's sixth round, I 12). */}
      <p className="spells-choose"><button type="button" className="quiet-word" data-nav data-action="spells"
        onClick={() => show(true)}>Choose first spells</button></p>
      {open && <CreationSheet.View title="Your first-level spells" onClose={close}>
        <p className="how">{Typography.curl(`Choose ${SpellChoice.n(first.count)}, one of them of ${way.of || way.name}. `
          + (left > 0 ? `${Words.upper(SpellChoice.n(left))} more to choose.` : !own ? `None is yet of ${way.of}.`
            : 'Take one back to choose another.'))}</p>
        {/* Not all are prepared at once (round 6, I: Bless, chosen, was not among the spells prepared). */}
        {first.count > 1 && <p className="how">{Typography.curl('The first you choose is prepared at the start; the '
          + 'others are known, and any of them can be prepared in its place with an hour\'s study, under Wait.')}</p>}
        <ul className="kit-rows">{first.open.map(s => <li key={s.id}>
          <button type="button" className="kit-row" data-nav aria-pressed={chosen.includes(s.id)}
            data-choice={`spell:${s.id}`} onClick={() => toggle(s.id)}>
            <span className="name">{Typography.curl(s.name)}</span>
            <span className="what">{Typography.curl(s.line)}</span>
            <span className="tag">{first.school.includes(s.id) ? Typography.curl(way.of || way.name) : ''}</span>
          </button></li>)}</ul>
      </CreationSheet.View>}
    </>;
  }
}

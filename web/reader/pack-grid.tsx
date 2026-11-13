import type { Choice, Section } from '../../src/ui/choice-list';
import type { ItemRow, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';
import { Act, type Draw } from './stage/act';

// What each of you carries, as the things themselves (the owner's own play, 7 November: the pack had been "a jagged
// list of buttons"): a grid of each thing's plate with its name under it, the thing chosen said beside the grid, what
// it is and what can be done with it, its acts opened by choosing it (see Folds). A thing with no plate cut is its
// name on a blank plate. Tending the company stays a list of acts under the grid.
export class PackGrid {
  static View({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const draw = Act.draw(app), sections = app.menu.sections;
    if (!sections.length) { return <p className="none">You carry nothing.</p>; }
    return <>{sections.map(sec => sec.tone === 'item'
      ? <PackGrid.Owner key={sec.id} app={app} draw={draw} section={sec} items={screen.items} />
      : <section key={sec.id}><h3>{sec.title}</h3><Act.List choices={sec.choices} draw={draw} className="column" /></section>)}
    </>;
  }
  // What is worn or in hand, the supplies a journey uses up, and everything else carried, each apart (the owner, 9
  // November: everything carried and worn had been one grid).
  static readonly stows: [ItemRow['stow'], string][] = [['worn', 'Worn and in hand'], ['supplies', 'Supplies'],
    ['carried', 'Carried']];
  // One of the company's things: the grid, and the one chosen beside it.
  static Owner({ app, draw, section, items }: { app: ReaderApp; draw: Draw; section: Section; items: ItemRow[] }) {
    // Something is always beside the grid: the one chosen, or else the first thing worn (the right of the book had stood
    // empty until a plate was touched).
    const chosen = section.choices.find(c => c.id === app.state.hovered) ?? section.choices.find(c => draw.open.has(c.id))
      ?? section.choices[0];
    return (
      <section className="pack-owner" data-owner={section.id}>
        <h3>{section.title}</h3>
        <div className="pack-body">
          <div className="pack-kept">{PackGrid.stows.map(([stow, title]) => {
            const kept = section.choices.filter(c => (items.find(i => i.id === c.id)?.stow ?? 'carried') === stow);
            return kept.length ? <div key={stow} className={`pack-stow ${stow}`} data-stow={stow}>
              <h4>{title}</h4>
              <ul className="pack-grid" aria-label={`${section.title}: ${title}`}>{kept.map(c => <li key={c.id}>
                <PackGrid.Tile app={app} draw={draw} choice={c} item={items.find(i => i.id === c.id)}
                  chosen={c === chosen} /></li>)}</ul></div> : null;
          })}</div>
          {chosen && <PackGrid.Chosen draw={draw} choice={chosen} item={items.find(i => i.id === chosen.id)} />}
        </div>
      </section>
    );
  }
  // A thing by its plate and its name; chosen, its acts opened. One with nothing to be done with it is chosen to be
  // read, as a pointer rests on it.
  static Tile({ app, draw, choice: c, item, chosen }: { app: ReaderApp; draw: Draw; choice: Choice; item?: ItemRow;
    chosen: boolean }) {
    const body = <><span className={`pack-plate${item?.plate ? '' : ' blank'}`} aria-hidden="true">
      {item?.plate && <img src={item.plate.src} alt="" decoding="async" />}</span>
      <span className="n">{Typography.curl(Words.upper(c.label))}</span>
      </>;
    const classes = `pack-tile${chosen ? ' chosen' : ''}`;
    if (c.children) { return <Act.View choice={c} draw={draw} quiet variant="glyph" className={classes}>{body}</Act.View>; }
    return <button type="button" className={classes} data-pick={c.id} aria-pressed={chosen}
      onClick={() => app.setState({ hovered: c.id })}>{body}</button>;
  }
  // Its kind's entry in the encyclopedia, opened beside the game, not instead of it (M19-147: nothing in play led to
  // it, and going there from a game and back found no game to carry on). Found there by its id (see
  // EncyclopediaHtml.script); a kind with no entry of its own opens the search for its name.
  static entry(kind: string): string { return `encyclopedia/index.html?id=item-${kind.replace(/_/g, '-')}`; }
  // The thing chosen: its plate large, its name, what it is, and what can be done with it.
  static Chosen({ draw, choice: c, item }: { draw: Draw; choice: Choice; item?: ItemRow }) {
    const acts = draw.open.has(c.id) ? c.children ?? [] : [];
    return (
      <section className="pack-chosen" aria-live="polite" data-held={c.id}>
        {item?.plate && <img className="pack-large" src={item.plate.src} alt="" decoding="async" />}
        <h4>{Typography.curl(Words.upper(c.label))}</h4>
        {c.note && <p className="pack-note">{Typography.curl(c.note)}</p>}
        {c.about && <p className="pack-about">{Typography.curl(c.about)}</p>}
        {item?.packed && <p className="pack-packed">{Typography.curl(item.packed)}</p>}
        {acts.length > 0 && <Act.List choices={acts} draw={draw} className="column" />}
        {item && <a className="pack-entry quiet-word" href={PackGrid.entry(item.kind)} target="_blank" rel="noopener">
          In the encyclopedia</a>}
      </section>
    );
  }
}

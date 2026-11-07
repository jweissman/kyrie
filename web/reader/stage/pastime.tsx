import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { SceneModel } from '../../../src/ui/scene';
import { Act, type Draw } from './act';
import { Told } from './told';

// Wait…: how long to let pass (a while, an hour, until dark, until something changes), what came of it once it has,
// and what else the company does of itself where it is (preparing spells, lighting a candle). Searching is the
// place's own touch (see GlanceStage.Resting).
export class Pastime {
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const s = app.state, exchange = s.frame!.leaf.exchange, wait = Pastime.wait(app);
    const told = s.kept && !s.pending && exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const lengths = (wait?.children ?? []).filter(c => draw.index.has(c.id)), also = Pastime.also(app);
    return (
      <div className="pastime" data-region="pastime">
        {lengths.length > 0 && <section className="pt-wait" aria-label="Wait">
          <h3>Wait</h3>
          <Pastime.Means app={app} />
          <ul className="pt-lengths">{lengths.map(c => <li key={c.id}>
            <Act.View choice={c} draw={draw} className="pt-length" marked /></li>)}</ul>
        </section>}
        <div className="pt-told" aria-live="polite">
          {s.pending ? <Told.Working pending={s.pending} /> : told && <Told.Happened exchange={told} said app={app} />}
        </div>
        {also.length > 0 && <section className="pt-also" aria-label="Also">
          <Act.List choices={also} draw={draw} className="small" marked />
        </section>}
      </div>
    );
  }
  // What waiting spends, said where it is chosen (REV-14: rest and food were opaque): the rations there are and when
  // the company next eats, whether it is hungry or worn, and its light where that matters.
  static Means({ app }: { app: ReaderApp }) {
    const e = app.state.frame?.screen.expedition;
    if (!e) { return null; }
    const food = `${e.rations} ration${e.rations === 1 ? '' : 's'}${e.nextMeal ? `, a meal due ${e.nextMeal}` : ''}`;
    const parts = [food, ...e.hungry ? ['hungry'] : [], ...e.weary ? ['worn out'] : [], ...e.light ? [e.light] : []];
    return <p className="pt-means">{parts.join(' · ')}</p>;
  }
  // The company's waiting, by what its choices do.
  static wait(app: ReaderApp): Choice | undefined {
    return (app.menu.scene?.you ?? []).find(c => c.children?.length && c.children.every(k => k.does?.startsWith('wait')));
  }
  static search(app: ReaderApp): Choice | undefined {
    return (app.menu.scene?.you ?? []).find(c => c.does === 'search');
  }
  // What else the company does of itself here: not waiting or searching, nor what the place offers (see AtHand).
  static also(app: ReaderApp): Choice[] {
    const wait = Pastime.wait(app), search = Pastime.search(app);
    return (app.menu.scene?.you ?? []).filter(c => c !== wait && c !== search && !SceneModel.own(c));
  }
}

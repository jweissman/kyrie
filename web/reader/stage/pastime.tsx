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
    const sleeps = Pastime.sleeps(app), night = lengths.some(c => c.does === 'wait_for_light');
    return (
      <div className="pastime" data-region="pastime">
        {lengths.length > 0 && <section className="pt-wait" aria-label="Wait">
          <h3>Wait</h3>
          <Pastime.Means app={app} />
          <ul className="pt-lengths">{[...lengths, ...sleeps].map(c => <li key={c.id}>
            <Act.View choice={c} draw={draw} className="pt-length" marked /></li>)}</ul>
          {!sleeps.length && <p className="pt-no-sleep">{night ? Pastime.sleepless(Pastime.host(app)) : Pastime.slept}</p>}
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
  // Sleeping, where it can be had (a rest somewhere safe, a camp in the open): among the ways of letting the hours go,
  // beside waiting for the light, which is no rest. A company that waited out a night in a cellar woke worn out, its
  // rest a line among lighting a lantern and preparing spells, or nowhere (the fresh playtest of 7 November).
  static readonly sleeping = ['rest', 'rest_unfed', 'camp'];
  static sleeps(app: ReaderApp): Choice[] {
    return (app.menu.scene?.you ?? []).filter(c => Pastime.sleeping.includes(c.does ?? ''));
  }
  // And where sleep is had, which is what brings back strength and spells: a caster who had spent both spells could not
  // find how to have them back, and a bed bought at a shrine was under its keeper's Trade (round 5).
  // Where someone here has a bed, they are named: in an inn, "Nowhere to sleep here" had stood over the innkeeper's bed
  // under Trade (round 4, the register's UI-04).
  static sleepless(host?: { name: string; wanting?: string }): string {
    if (host?.wanting) { return `A night waited out is no rest. ${host.name} has a bed, but: ${host.wanting}.`; }
    return host ? `A night waited out is no rest: ${host.name} has a bed, under Trade.`
      : 'Nowhere to sleep here: a night waited out is no rest. A bed is had of an innkeeper or a priest (under Trade), '
        + 'or a camp made out in the country.';
  }
  static readonly slept = 'Sleep brings back strength and spells: a bed had of an innkeeper or a priest (under Trade), '
    + 'or a camp made out in the country.';
  // Whoever here would give the company a bed (see TalkFocus.services).
  // And, where the bed is withheld, why (too dear for the purse: round 8, M).
  static host(app: ReaderApp): { name: string; wanting?: string } | undefined {
    const beds = (cs: Choice[]): Choice[] => cs.flatMap(c => [...(/^take_lodging/.test(c.does ?? '') ? [c] : []),
      ...beds(c.children ?? [])]);
    const who = app.menu.scene?.subjects.find(x => beds(x.choices).length);
    if (!who) { return undefined; }
    const offered = beds(who.choices);
    return { name: who.name, ...offered.every(c => c.disabled) ? { wanting: offered[0]!.disabled! } : {} };
  }
  // What else the company does of itself here: not waiting, sleeping or searching, nor what the place offers (see
  // AtHand).
  static also(app: ReaderApp): Choice[] {
    const wait = Pastime.wait(app), search = Pastime.search(app), sleeps = Pastime.sleeps(app);
    return (app.menu.scene?.you ?? []).filter(c => c !== wait && c !== search && !sleeps.includes(c)
      && !SceneModel.own(c));
  }
}

import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../menu-model';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { SceneSurface } from './scene-surface';
import { PlaceStage } from './place-stage';
import { Told } from './told';

// What can be done in and beyond a place, opened over it when the player means to do something, and gone again when
// they have (the owner, 4 November, late: a settled principle — the place at rest, its apparatus when wanted). Two
// parts side by side: where to go (the ways within the place and out of it, each a short name, what more there is to
// say of one in a line under them), and what to do here (what is worth doing, the animals and things to look at,
// what the company can do of itself), and everyone here, those on the picture and any it has no room for.
export class Explorer {
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const frame = app.state.frame!, g = frame.leaf.glance, screen = frame.screen, part = app.state.exploring;
    if (!g || !part) { return null; }
    const going = new Set(SceneSurface.open(screen, SceneSurface.choices(app), []).map(x => x.c.id));
    // What is done at a way is drawn at it (At the ways), not again among what to do here.
    const atWays = new Set(Explorer.atWays(app).flatMap(w => w.choices.flatMap(c => [c.id, ...(c.children ?? []).map(k => k.id)])));
    const acts = (app.menu.leads ?? g.acts).filter(a => {
      const c = GlanceStage.choice(app, a.choice);
      return c?.id !== MenuModel.country.id && !going.has(c?.id ?? '') && !atWays.has(c?.id ?? '');
    });
    const led = new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id));
    return (
      <div className="explorer" role="dialog" aria-modal="true" aria-label={`Explore ${screen.place.name}`}
        data-region="explorer" data-part={part}>
        <header className="explorer-head">
          <button type="button" className="explorer-shut" data-action="explore-shut" aria-label="Back to the place"
            onClick={() => app.explore()}>✕</button>
        </header>
        <div className="explorer-body">
          <section className={`explorer-go${part === 'go' ? ' first' : ''}`} aria-label="Where to go">
            <p className="part">Go</p>
            {/* The aim followed, with where to go: not on the place at rest (the owner, 5 November). */}
            <GlanceStage.Aim app={app} said={g.aim} />
            <GlanceStage.Row app={app} draw={draw} glance={g} />
            <Explorer.AtWays app={app} draw={draw} />
          </section>
          <section className={`explorer-here${part === 'here' ? ' first' : ''}`} aria-label="What to do here">
            <p className="part">Here</p>
            <GlanceStage.Acts app={app} draw={draw} acts={acts} />
            {/* The place told whole, as at rest it is told only in brief (nothing written is lost: OWN-18). */}
            <details className="about-here" data-region="about">
              <summary>{`About ${Typography.curl(screen.place.name.replace(/^The /, 'the '))}`}</summary>
              <div className="telling"><Told.Place app={app} headed={false} whole here={null} /></div>
            </details>
            <Explorer.People app={app} draw={draw} />
            <GlanceStage.Around app={app} draw={draw} led={led} apart />
            <GlanceStage.Yours app={app} draw={draw} />
          </section>
        </div>
      </div>
    );
  }
  // The ways with something on them besides going (a lock to pick, a tripwire, a thing to look at closer), each its
  // name and what can be done there: the rest are their names above, and nothing more.
  static AtWays({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const ways = Explorer.atWays(app);
    return ways.length > 0 && <div className="at-ways" data-line="At the ways">
      <p className="label">At the ways</p>
      <ul className="ways">{ways.map(w => <li key={w.exit.id} data-exit={w.exit.id}>
        <p className="at-way">{GlanceStage.short(w.exit.destination.name)}</p>
        {w.exit.blocked && <p className="at-why">{Typography.curl(w.exit.blocked)}</p>}
        {w.choices.slice(1).map(c => c.children?.length ? <PlaceStage.Hazard key={c.id} choice={c} draw={draw} />
          : <Act.View key={c.id} choice={c} draw={draw} className="way also" marked>
            {Typography.curl(Words.upper(PlaceStage.also(c.label)))}</Act.View>)}</li>)}</ul></div>;
  }
  static atWays(app: ReaderApp) {
    return PlaceStage.ways(app.state.frame!.screen, SceneSurface.choices(app)).filter(w => w.choices.length > 1);
  }
  // Everyone here by name and what they are, each the way to them.
  static People({ app, draw }: { app: ReaderApp; draw: Draw }) {
    // Whoever is with the company first, then the people of the place.
    const people = [...(app.menu.scene?.subjects ?? []).filter(x => x.kind === 'companion'), ...GlanceStage.people(app)];
    return people.length > 0 && <div className="also-here people-here" data-line="People here">
      <p className="label">{people.length === 1 ? 'Someone here' : 'People here'}</p>
      <ul className="chips">{people.map(x => <li key={x.id} data-subject={x.id}>
        <PlaceStage.Chip subject={x} draw={draw} /></li>)}</ul></div>;
  }
}

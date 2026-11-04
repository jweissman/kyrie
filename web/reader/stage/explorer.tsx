import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../menu-model';
import { Words } from '../words';
import type { Draw } from './act';
import { GlanceStage } from './glance';
import { SceneSurface } from './scene-surface';
import { PlaceStage } from './place-stage';

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
    const acts = (app.menu.leads ?? g.acts).filter(a => {
      const c = GlanceStage.choice(app, a.choice);
      return c?.id !== MenuModel.country.id && !going.has(c?.id ?? '');
    });
    const led = new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id));
    return (
      <div className="explorer" role="dialog" aria-modal="true" aria-label={`Explore ${screen.place.name}`}
        data-region="explorer" data-part={part}>
        <header className="explorer-head">
          <h2>{Typography.curl(Words.upper(screen.place.name))}</h2>
          <button type="button" className="explorer-shut" data-action="explore-shut" aria-label="Back to the place"
            onClick={() => app.explore()}>✕</button>
        </header>
        <div className="explorer-body">
          <section className={`explorer-go${part === 'go' ? ' first' : ''}`} aria-label="Where to go">
            <p className="part">Go</p>
            <GlanceStage.Row app={app} draw={draw} glance={g} />
          </section>
          <section className={`explorer-here${part === 'here' ? ' first' : ''}`} aria-label="What to do here">
            <p className="part">Here</p>
            <GlanceStage.Acts app={app} draw={draw} acts={acts} />
            <Explorer.People app={app} draw={draw} />
            <GlanceStage.Around app={app} draw={draw} led={led} apart />
            <GlanceStage.Yours app={app} draw={draw} />
          </section>
        </div>
      </div>
    );
  }
  // Everyone here by name and what they are, each the way to them.
  static People({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const people = GlanceStage.people(app);
    return people.length > 0 && <div className="also-here people-here" data-line="People here">
      <p className="label">{people.length === 1 ? 'Someone here' : 'People here'}</p>
      <ul className="chips">{people.map(x => <li key={x.id} data-subject={x.id}>
        <PlaceStage.Chip subject={x} draw={draw} /></li>)}</ul></div>;
  }
}

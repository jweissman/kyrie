import type { Examined } from '../../../src/ui/attention';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act } from './act';
import { Stage } from './stage';
import { Told } from './told';

// One thing, looked at. The thing itself first and large: what it is, what can be seen of it, and what came of the
// last thing done to it; beside it, what can be done with it, by kind of doing (look closer, handle it, work it, take
// from it, and going through it anyway, last and in red). Turning away goes back to the place.
export class ThingStage {
  static View({ app, examined }: { app: ReaderApp; examined: Examined }) {
    const s = app.state, frame = s.frame!, thing = examined.subject, draw = Act.draw(app), exchange = frame.leaf.exchange;
    // What it now looks like is said once, as it is, not again as what came of the last thing done to it.
    const seen = ThingStage.seen(frame.leaf.situation, thing.name, thing.about);
    const said = new Set(seen.map(p => Typography.curl(p)));
    const fresh = exchange && { ...exchange, lines: exchange.lines.filter(l => !said.has(Typography.curl(l.text))) };
    const told = fresh && !frame.leaf.moved && (fresh.lines.length || fresh.notes.length) ? fresh : undefined;
    return (
      <div className="thing" id="page">
        <div className="face">
          <Stage.Status frame={frame} extra={frame.screen.place.name} />
          <p className="kicker">Looking at</p>
          <h1 className="n">{Typography.curl(Words.upper(thing.name))}</h1>
          {thing.note && <p className="r">{Typography.curl(thing.note)}</p>}
          {seen.map((p, i) => <p key={i} className="seen">
            {Typography.curl(p)}</p>)}
          {s.pending ? <Told.Working pending={s.pending} /> : told && <Told.Happened exchange={told} />}
        </div>
        <div className="uses">
          {examined.groups.map(g => <section key={g.title} className={`group${g.title === 'Go through it anyway' ? ' risky' : ''}`}>
            <p className="label">{g.title}</p>
            <Act.List choices={g.choices} draw={draw} className="column" />
          </section>)}
          <p className="away"><Act.View choice={examined.back} draw={draw}>← Turn back to {Typography.curl(
            frame.screen.place.name)}</Act.View></p>
          <Act.Sheets app={app} />
        </div>
        <button type="button" className="close" data-action="back" aria-label="Turn away" onClick={app.back}>×</button>
      </div>
    );
  }
  // What can be seen of it: what is said of it where it stands, and what the place says of it by name.
  static seen(situation: string[], name: string, about?: string): string[] {
    const bare = name.replace(/^(the|a|an|some) /i, '').toLowerCase();
    return [...about ? [about] : [], ...situation.filter(p => p.toLowerCase().includes(bare) && !(about && p.includes(about)))];
  }
}

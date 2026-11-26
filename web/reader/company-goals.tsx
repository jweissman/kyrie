import type { ReaderApp } from './reader-app';
import { Typography } from '../../src/presentation/typography';
import { PageFrame } from './page-frame';
import { Sheet } from './sheet';

// The backstage as one page while the journal is not earned (compactification, the owner, 26 November: "there should
// basically be just one backstage page at this point; your company, with high-level achievements and current goals";
// OR-1244): under the company, what it means to do (the aim followed first, the rest by their words, each to follow)
// and what it has done that the game remembers (its deeds); then the book's own rows, a save and Options. The notes in
// full and the story so far are the journal's, a scholar's or a scribe's (Surfaces).
export class CompanyGoals {
  static View({ app }: { app: ReaderApp }) {
    const screen = app.state.frame!.screen, [first, ...rest] = Sheet.listed(app), deeds = screen.deeds ?? [];
    return (
      <section className="company-goals" data-region="goals" aria-label="Goals and deeds">
        <section className="notes-aims"><h3>What you mean to do</h3>
          {first ? <ul className="aims">{[first, ...rest].map(aim => <li key={Sheet.key(aim)}
            className={`aim-card${aim === first ? ' followed' : ''}`}>{Typography.curl(aim.text)}</li>)}</ul>
            : <p className="none">{screen.done.length ? 'Nothing more is asked of you.' : 'Nothing is asked of you yet.'}</p>}
        </section>
        {deeds.length > 0 && <section className="deeds" data-region="deeds"><h3>Deeds</h3>
          <ul>{deeds.map(d => <li key={d.id}><b>{d.title}</b> {Typography.curl(d.text)}</li>)}</ul></section>}
        <ol {...PageFrame.slot('menu')} className="led keep" aria-label="What can be done">
          {first && <Sheet.AimActs app={app} aim={first} />}
          <Sheet.Kept app={app} />
        </ol>
      </section>
    );
  }
}

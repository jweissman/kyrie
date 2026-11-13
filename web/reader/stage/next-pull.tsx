import type { Successor } from '../../../src/presentation/glance-types';
import { Typography } from '../../../src/presentation/typography';
import type { ReaderApp } from '../reader-app';
import { MenuModel } from '../menu-model';
import { Words } from '../words';
import { ChoiceRow } from './choice-row';

// As an aim followed is seen through, the one thing that pulls next (see Succession, M21's PL-06): said once under
// what came of it, and offered, never followed for the player. The deed's consequence (the yoke, to be hung over the
// drover's hearth at Millholm) is the act that takes it there; a lead not followed, an aim to follow or a way to go.
// A journey into another stretch of country is the map's, as every such way is (MenuModel.lead).
export class NextPull {
  static View({ app, next }: { app: ReaderApp; next: Successor }) {
    const choice = next.command ? MenuModel.lead(app.menu, next.command) : undefined;
    return <p className="next-pull" data-id="next">
      {Typography.curl(Words.upper(next.text))}{next.at ? <span className="at">{` · ${next.at}`}</span> : null}
      {next.aim ? <button type="button" className="follow-aim" data-action="follow"
        onClick={() => app.follow(next.aim)}>Follow this</button>
        : null}
      {/* What pulls next is a thing to do, a row like every act (CN-04: never a link in the prose). */}
      {!next.aim && choice && <ChoiceRow.Button className="next-act" data={{ action: 'next', choice: choice.id }} act={choice.id}
        onClick={() => app.choose(choice)} label={Typography.curl(next.label ?? choice.label)} />}
    </p>;
  }
}

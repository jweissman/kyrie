import { useState } from 'react';
import type { Lens, LensAct, Lensed, Promoted } from '../../../src/presentation/glance-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import type { Draw } from './act';
import { ChoiceRow } from './choice-row';
import { Fold, type Leaf } from '../../../src/presentation/fold';
import { GlanceStage } from './glance';
import { LensFocus, type Unit } from './lens-focus';
import { Guidance } from '../guidance';
import { PageFrame } from '../page-frame';
import { Paging } from '../../../src/frame/paging';
import { Attending } from '../../../src/ui/attention';
import { LensRows } from './lens-rows';

// A lens whose acts do not fit its four, drawn by focus (see LensFocus): each thing with more than one act one row,
// chosen to focus it; on it, a run of acts alike one row (a riddle's words, "Press the word…"); focused, the four are
// its answers, and "Leave it for now" where there is room. What the thing focused reads out (the riddle cut across the
// door: the engine's focus, Choice.focus, as the four's opener and the runner and the terminal read it) is said above
// its rows, never among them: told only in the narrative beside them, it had not been seen (the owner, 18 November,
// CL-34: "I don't see the questions"). Escape, or Leave it, goes back a level (see Explorer.key). Only where there are more than four does a pager
// still turn them (the narrow exception: many things at hand, each one row).
export class LensFocused {
  // kept: what the scene led with, kept above the lens (Lensed.kept), in its places of the four on its first page and
  // on no other, so that the lens's own rows keep their pages (the drove landing's ways by quarter had gone from three
  // pages to four under the tally-stick kept: test/lens-rows-valid).
  static View({ app, draw, lens, lensed, acts, kept = [] }: { app: ReaderApp; draw: Draw; lens: Lens; lensed: Lensed;
    acts: LensAct[]; kept?: Promoted[] }) {
    const [page, turn] = useState(0);
    const view = LensFocus.of(acts, app.state.focused ?? [], s => GlanceStage.named(app, s), LensRows.part(app, lens));
    // Paged, the row that turns the page is the fourth (never more than four in view).
    const paged = Paging.of(view.rows, GlanceStage.per, page, { lead: kept.length }), rows = paged.shown;
    const gilded = Guidance.shown(app);
    const focus = (key?: string) => app.setState({ focused: key ? [...view.focused, key] : view.focused.slice(0, -1) });
    // Drawn within the lens, as its unfocused form draws them, so that the keys reach them as they reach its rows
    // (Explorer.key: a kept row lit by the arrows had done nothing on Enter, the Slip's way onto the Strand under Wait…).
    return <div {...PageFrame.slot('menu')} className={`lens lens-${lens} lens-focus`} data-lens={lens}
      data-focus={view.focused.at(-1)}>
      {paged.at === 0 && kept.length > 0 && <GlanceStage.Acts app={app} draw={draw} acts={kept} />}
      <LensFocused.Said app={app} lensed={lensed} acts={acts} focused={view.focused} />
      <ul className="acts lens-rest">{rows.map(r => <li key={LensFocus.unit(r) ? r.key : r.choice}
        {...LensFocus.unit(r) ? {} : { 'data-subject': r.subject }}>
        {LensFocus.unit(r) ? <LensFocused.Unit unit={r} gilded={gilded} focus={focus}
          leaves={LensFocused.leaves(app, lens, r)} />
          : <GlanceStage.LensRow app={app} draw={draw} act={r} lens={lens} />}</li>)}
        {view.leave && <li><ChoiceRow.Button className="leave-focus" data={{ action: 'defocus' }}
          onClick={() => focus()} plain="neutral" label="Leave it for now" /></li>}
        {/* Marked by the fold of the rows it turns to, the pages not in view (AT-07 §5 step 3, I5): what the lens's
            mark holds from a later page is promised here, never only on the mark. */}
        {paged.pages > 1 && <li><ChoiceRow.Button className="lens-page"
          data={{ action: 'lens-page', page: String(paged.at + 1), pages: String(paged.pages) }}
          onClick={() => turn(paged.at + 1)} {...ChoiceRow.mark(Fold.mark(view.rows.filter(r => !rows.includes(r))
            .flatMap(r => LensFocused.leaves(app, lens, r)), gilded))} label="More…"
          aside={`${paged.at + 1} of ${paged.pages}`} /></li>}
      </ul>
    </div>;
  }
  // What the thing focused reads out, above its rows: the focus of the opener its acts are under (the riddle cut
  // across the door), else what the lens says is seen of it.
  static Said({ app, lensed, acts, focused }: { app: ReaderApp; lensed: Lensed; acts: LensAct[];
    focused: string[] }) {
    const key = focused[0], thing = key?.startsWith('thing:') ? key.slice('thing:'.length) : undefined;
    if (!thing) { return null; }
    const said = LensFocused.focus(app, acts.filter(a => a.subject === thing).map(a => a.choice));
    const seen = said ? [said] : lensed.subjects?.[thing]?.seen ?? [];
    return seen.length ? <div className="lens-seen focus-said" data-subject={thing}>
      {seen.map((p, i) => <p key={i} className="seen">{Typography.curl(p)}</p>)}</div> : null;
  }
  // The witnesses a row of the lens bears: its own act's, or every act gathered in it.
  static leaves(app: ReaderApp, lens: Lens, r: ReturnType<typeof LensFocus.of>['rows'][number]): Leaf[] {
    return (LensFocus.unit(r) ? r.acts : [r]).flatMap(x => LensRows.leaves(app, lens, x.choice));
  }
  // The engine's focus on the opener that holds these acts, where one does (Choice.focus).
  static focus(app: ReaderApp, ids: string[]): string | undefined {
    const within = new Set(ids), scene = app.menu.scene;
    return Attending.all([...scene?.near ?? [], ...scene?.far ?? [], ...app.menu.choices])
      .find(c => c.focus && (c.children ?? []).some(k => within.has(k.id)))?.focus;
  }
  // A thing, or its alike acts, as one row: its words and an ellipsis, its mark the colour of what is in it.
  // Its mark, of the witnesses of the acts in it (Attest).
  // Its mark the fold of the acts it gathers (Fold): it cannot be lit by anything of its own.
  static Unit({ unit, gilded, focus, leaves }: { unit: Unit; gilded: boolean; focus: (key: string) => void;
    leaves: Leaf[] }) {
    const indicator = Fold.mark(leaves, gilded);
    return <ChoiceRow.Button className="focus-row" data={{ action: 'focus', choice: unit.key }}
      onClick={() => focus(unit.key)} {...ChoiceRow.mark(indicator)}
      label={Typography.curl(unit.name)} />;
  }
}

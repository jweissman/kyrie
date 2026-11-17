import { useState } from 'react';
import type { Lens, LensAct, Lensed } from '../../../src/presentation/glance-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import type { Draw } from './act';
import { ChoiceRow } from './choice-row';
import { GlanceStage } from './glance';
import { LensFocus, type Unit } from './lens-focus';
import { Pip } from './pip';
import { Guidance } from '../guidance';
import { PageFrame } from '../page-frame';
import { Paging } from '../paging';

// A lens whose acts do not fit its four, drawn by focus (see LensFocus): each thing with more than one act one row,
// chosen to focus it; on it, a run of acts alike one row (a riddle's words, "Press the word…"); focused, the four are
// its answers, and "Leave it for now" where there is room. What is seen of the thing focused (the riddle cut across the
// door) is told in the narrative beside them (Seen), never among the rows (the owner, 15 November: no text in the
// list). Escape, or Leave it, goes back a level (see Explorer.key). Only where there are more than four does a pager
// still turn them (the narrow exception: many things at hand, each one row).
export class LensFocused {
  static View({ app, draw, lens, lensed, acts }: { app: ReaderApp; draw: Draw; lens: Lens; lensed: Lensed;
    acts: LensAct[] }) {
    const [page, turn] = useState(0);
    const view = LensFocus.of(acts, app.state.focused ?? [], s => GlanceStage.named(app, s));
    // Paged, the row that turns the page is the fourth (never more than four in view).
    const paged = Paging.of(view.rows, GlanceStage.per, page), rows = paged.shown;
    const gilded = Guidance.shown(app), aspects = new Map(lensed.promoted.map(p => [p.choice, p.aspects]));
    const focus = (key?: string) => app.setState({ focused: key ? [...view.focused, key] : view.focused.slice(0, -1) });
    return <div {...PageFrame.slot('menu')} className={`lens lens-${lens} lens-focus`} data-lens={lens}
      data-focus={view.focused.at(-1)}>
      <ul className="acts lens-rest">{rows.map(r => <li key={LensFocus.unit(r) ? r.key : r.choice}
        {...LensFocus.unit(r) ? {} : { 'data-subject': r.subject }}>
        {LensFocus.unit(r) ? <LensFocused.Unit unit={r} gilded={gilded} focus={focus} />
          : <GlanceStage.LensRow app={app} draw={draw} act={r} aspects={aspects.get(r.choice)} />}</li>)}
        {view.leave && <li><ChoiceRow.Button className="leave-focus" data={{ action: 'defocus' }}
          onClick={() => focus()} mark={ChoiceRow.neutral} markClass="neutral" label="Leave it for now" /></li>}
        {paged.pages > 1 && <li><ChoiceRow.Button className="lens-page"
          data={{ action: 'lens-page', page: String(paged.at + 1), pages: String(paged.pages) }}
          onClick={() => turn(paged.at + 1)} mark={ChoiceRow.neutral} markClass="neutral" label="More…"
          aside={`${paged.at + 1} of ${paged.pages}`} /></li>}
      </ul>
    </div>;
  }
  // What is seen of the thing focused, in the narrative: the riddle cut across the door, above its words.
  static Seen({ app }: { app: ReaderApp }) {
    const lens = GlanceStage.lens(app), key = app.state.focused?.[0];
    const thing = key?.startsWith('thing:') ? key.slice('thing:'.length) : undefined;
    const seen = thing && lens ? app.state.frame?.leaf.glance?.lenses?.[lens]?.subjects?.[thing]?.seen ?? [] : [];
    return seen.length ? <div className="lens-seen" data-subject={thing}>
      {seen.map((p, i) => <p key={i} className="seen">{Typography.curl(p)}</p>)}</div> : null;
  }
  // A thing, or its alike acts, as one row: its words and an ellipsis, its mark the colour of what is in it.
  static Unit({ unit, gilded, focus }: { unit: Unit; gilded: boolean; focus: (key: string) => void }) {
    const fill = Pip.fill(unit.aspects, gilded);
    return <ChoiceRow.Button className="focus-row" data={{ action: 'focus', choice: unit.key }}
      onClick={() => focus(unit.key)} {...fill ? { mark: fill } : { mark: ChoiceRow.neutral, markClass: 'neutral' }}
      label={Typography.curl(unit.name)} />;
  }
}

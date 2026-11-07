import type { Choice } from '../../src/ui/choice-list';
import { MenuModel } from './menu-model';
import type { ReaderApp } from './reader-app';

// A choice that opens others (Put in, Examine, what to buy, a member's row): what it opens shown beneath it, or put
// away again, and whatever else beside it was open put away.
export class Folds {
  static toggle(app: ReaderApp, choice: Choice) {
    const { frame, open } = app.state, shut = open.includes(choice.id);
    const siblings = MenuModel.siblings(app.menu, choice.id);
    // In the company, a member's row is the member: their sheet is shown as what they can do opens (a caster's row
    // opened their spells and left the first member's sheet, the follow-up review found).
    const member = app.state.view === 'company' && frame?.screen.party.some(m => m.id === choice.id)
      ? choice.id : app.state.member;
    app.setState({ open: shut ? open.filter(id => id !== choice.id)
      : [...open.filter(id => !siblings.includes(id)), choice.id], hovered: Folds.held(app), member });
  }
  // What stays in view as a fold opens: under Look…, the thing whose fold it is, in its own pane. It had been let go
  // with whatever else was pointed at, and the pane went back to the first thing at hand, with none of its acts open:
  // "Put in" and "Examine" on a rotted pack showed a torch's pane, and seemed to do nothing (the fresh playtest of 7
  // November).
  private static held(app: ReaderApp): string | undefined {
    return app.state.exploring === 'look' ? app.state.hovered : undefined;
  }
}

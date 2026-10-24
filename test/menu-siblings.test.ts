import { describe, expect, it } from 'bun:test';
import { ChoiceTree } from '../src/ui/choice-tree';
import type { Choice } from '../src/ui/choice-list';

// Opening one thing closes what is beside it, never what it is in. Found by an independent review of the deployed
// game: in a fight, Guard, inside the other abilities, opens whom to guard, and opening it closed the other abilities
// it was in, so the targets were never seen and Guard seemed to do nothing.
class Fight {
  static choice(id: string, children?: Choice[]): Choice {
    return { id, label: id, tone: 'company', ...children ? { children } : {} };
  }
  static menu() {
    const guard = this.choice('guard', [this.choice('guard:wenna'), this.choice('guard:gimble')]);
    const other = this.choice('other', [this.choice('second-wind'), this.choice('taunt'), guard]);
    const sections = [{ id: 'act', title: 'Act', tone: 'company' as const, glyph: '○',
      choices: [this.choice('strike'), other] },
    { id: 'away', title: 'Away', tone: 'company' as const, glyph: '○', choices: [this.choice('flee')] }];
    return sections;
  }
}

describe('what opening a choice closes', () => {
  it('is what is beside it in its own list, not the list it is in', () => {
    const sections = Fight.menu();
    expect(ChoiceTree.siblings([], sections, 'guard')).toEqual(['second-wind', 'taunt']);
    // At the top, as before: everything else at the top, in any section.
    expect(ChoiceTree.siblings([], sections, 'other')).toEqual(['strike', 'flee']);
  });
});

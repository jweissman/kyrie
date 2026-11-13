import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ChoiceList, type Choice } from '../../src/ui/choice-list';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionTime } from '../../src/campaign/action-time';

// What an act says it takes is what it takes, on the page and in the terminal alike: "Search here · 2 min" had taken
// twenty minutes in a crypt, and "Bury him · 1 min" two hours (round 12, A and B, T33). Every act offered in a crypt
// with something hidden in it, each taken from the same start, its stated minutes against the clock's. What it holds
// is that the page, the terminal and the clock count by one measure (ActionTime): round 12's terminal had counted by
// its own (ticks taken for minutes). A wrong measure of an act's time moves all three alike, and is not caught here.
const crypt = `
  Place house "the house" is settlement.
  Place hall "the hall" is room within house at 0, 0.
  Place crypt "the crypt" is room within house at 1, 0 underground.
  Passage stair "the crypt stair" is stair between hall and crypt.
  Company party "You" of 1 at crypt.
  Discovery bones "Under the slab, a cache of finger-bones." { Found by searching crypt. }
  Item jet "a jet box" is jeweled_box at crypt hidden until bones.
  Goal false.`;
const leaves = (cs: Choice[]): Choice[] => cs.flatMap(c => c.children?.length ? leaves(c.children) : [c]);

describe('an act, and the time it says it takes', () => {
  it('takes what the page and the terminal say', async () => {
    const t = await Tiny.start(crypt), wrong: string[] = [];
    const told = new Map(PlayerView.choices(t.campaign).map(r => [r.choice.id, ActionTime.minutes(r.action, t.world)]));
    const acts = ChoiceList.explore(t.screen).flatMap(s => leaves(s.choices)).filter(c => c.command && c.minutes);
    expect(acts.map(c => c.label)).toContain('Search here');
    for (const c of acts) {
      const u = await Tiny.start(crypt), before = u.journey.minutes();
      await u.perform(c.command!);
      const took = u.journey.minutes() - before;
      if (took !== c.minutes || (told.has(c.command!) && told.get(c.command!) !== took)) {
        wrong.push(`${c.label}: page ${c.minutes}, terminal ${told.get(c.command!)}, took ${took}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

import { describe, expect, it } from 'bun:test';
import { TerminalScene } from '../../src/cli/terminal-scene';
import type { Leaf } from '../../src/presentation/narrator';
import type { Screen } from '../../src/ui/screen-types';

// One calendar in the terminal and the runner (cold play 4, CL-47's 6): a look said "Day 1, 12:18 p.m." where every
// other turn said "17 Smoke, afternoon", and the two read as two clocks that disagreed. A look says the hour on the
// country's own date; a campaign with no calendar keeps its days counted.
const screen = (date?: { short: string; long: string }) => ({ place: { id: 'quay', name: 'the quay' }, elapsed: 26,
  clock: 'Day 1, 12:18 p.m.', ...date ? { date } : {}, aims: [], party: [],
  expedition: { daylight: 'day', rations: 3, hungry: false } }) as unknown as Screen;
const leaf = { situation: [], presence: [], changed: [] } as unknown as Leaf;
describe('the date and the hour', () => {
  it('are said on the country\'s calendar on a look, as on every other turn', () => {
    const looked = new TerminalScene().lines(screen({ short: '17 Smoke', long: '17 Smoke; autumn' }), leaf, 'look');
    expect(looked.join('\n')).toContain('17 Smoke, 12:18 p.m.');
    expect(looked.join('\n')).not.toContain('Day 1');
  });
  it('count the days where the campaign keeps no calendar', () => {
    expect(new TerminalScene().lines(screen(), leaf, 'look').join('\n')).toContain('Day 1, 12:18 p.m.');
  });
});

import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from '../support/tiny';
import { TerminalWalk } from '../../src/cli/terminal-walk';
import { WalkStyle } from '../../src/cli/walk-style';
import { TerminalColour } from '../../src/cli/terminal-colour';
import { Emphasis } from '../../src/presentation/emphasis';
import { PlayerView } from '../../src/presentation/player-view';

// The terminal's colour is the page's: one table of tones (Emphasis) for both, its colours the page's own tokens; an
// act's tones at its left edge, in true colour, or said where there is none; gold only on the followed aim's next
// step, and none while nothing is followed (the owner, 14 November: TM-03). An inn-yard and an aim by the bridge.
const yard = `
  Place reedham "Reedham" is settlement.
  Place yard "the inn-yard" is room within reedham at 0, 0 outdoors.
  Place bridge "the bridge over the Reed" is room within reedham at 0, 1 outdoors.
  Passage yard_bridge "the bridge road" is path between yard and bridge.
  Company party "You" of 1 at yard.
  Objective father when true "Your father went out by {bridge} with the cart.".
  Goal false.`;
const css = readFileSync('web/reader/foundations.css', 'utf8') + readFileSync('web/reader/glance.css', 'utf8');
const hex = (name: string) => new RegExp(`--${name}: (#[0-9A-Fa-f]{6})`).exec(css)?.[1]?.toLowerCase();
const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

describe('the terminal\'s colour', () => {
  it('is the page\'s tokens, tone by tone', () => {
    const tokens = { gold: 'gold', silver: 'tone-silver', green: 'verdigris', blue: 'azure', red: 'ember',
      violet: 'violet' } as const;
    for (const [tone, token] of Object.entries(tokens)) {
      expect([tone, ...Emphasis.rgb[tone as keyof typeof tokens]]).toEqual([tone, ...rgb(hex(token)!)]);
    }
    expect(css).toContain('--coral: oklch(73% 0.15 15)');
  });
  it('draws a tone in its own colour where the terminal has colour, and says it where it has none', () => {
    expect(TerminalColour.depth({ COLORTERM: 'truecolor' }, true)).toBe('true');
    expect([TerminalColour.depth({ NO_COLOR: '', COLORTERM: 'truecolor' }, true), TerminalColour.depth({}, false)])
      .toEqual(['none', 'none']);
    expect(TerminalColour.choice(1, 'Ask', { aspects: ['knowledge'] }, 'true')).toContain('\x1b[38;2;121;174;247m▌');
    expect(TerminalColour.choice(1, 'Ask', {}, 'true')).not.toContain('\x1b[');
    expect(TerminalColour.choice(1, 'Ask', { aspects: ['knowledge'] }, 'none')).toBe('1. Ask  [to learn]');
  });
  it('has no gold while nothing is followed, and gold on the one next step once the aim is', async () => {
    const t = await Tiny.start(yard);
    const walked = await TerminalWalk.run(t.session, WalkStyle.scripted(['look', 'follow 1', 'look', 'wait']));
    const [before, after] = walked.transcript.join('\n').split('> follow 1');
    expect(before).not.toContain('your aim');
    const gold = after!.split('\n').filter(l => /your aim/.test(l));
    expect([gold.length > 0, gold.every(l => /bridge road/.test(l))]).toEqual([true, true]);
    // The aim as the page says it: offered by its title with how to follow it; once followed, as followed, said once
    // for the change (following it), and not again after an act (the human mode's assessment: said three times).
    expect(before).toMatch(/^An aim: Your father went out by the bridge over the Reed with the cart · follow 1$/m);
    const following = /^Following: Your father went out by the bridge over the Reed with the cart\.$/m;
    expect(after!.split('> look')[0]).toMatch(following);
    expect(after!.split('> wait')[1]).not.toMatch(following);
    // Following an aim is a change of attention, not an arrival: the place is not come to again.
    expect(after!.split('> look')[0]).not.toMatch(/^the inn-yard/m);
    // Each choice the terminal leads with is drawn as the page draws the same act (by its command), in the same words.
    const named = new Map(PlayerView.choices(t.campaign).map(r => [r.choice.id, r.choice.name]));
    for (const a of t.look().glance.acts.filter(x => x.aspects.length)) {
      const words = Emphasis.drawn(a.aspects, !!a.continues).map(x => Emphasis.words[x]).join(', ');
      expect(after).toContain(`${named.get(a.command ?? a.choice)} · 10 min  [${words}]`);
    }
  });
});

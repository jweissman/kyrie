import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { PlayerView } from '../src/presentation/player-view';
import { DangerSense } from '../src/presentation/danger-sense';
import { Outmatched } from '../src/presentation/outmatched';
import { DangerAhead } from '../web/engine/danger-ahead';

// The danger of what an act here could lead to, reckoned while the player reads (OR-145 (b)): at a1's Lucky Phoenix,
// where asking Eamon about the king-barrow gives an aim whose giver warns of its band, the band is reckoned a fight
// a turn of the loop once the answer before is given, so that the ask reads its verdict kept; an input that comes
// meanwhile stops it, between two fights. The king-barrow is asked after once Eamon has said what the matter
// is (OR-423).
describe('the danger ahead', () => {
  it('is reckoned while the player reads, a fight at a time, and stops for an input', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Wenna']));
    const s = journey.session;
    for (const re of [/^Take the causeway/, /^Take the door of the Lucky Phoenix/,
    /^Ask Eamon what the matter is/]) {
      await s.leg(PlayerView.choices(s.campaign).find(c => re.test(c.choice.name))!.choice.id);
    }
    const bands = Outmatched.ahead(s.campaign);
    expect(bands.length).toBeGreaterThan(0);
    // Stopped at once, it leaves the reckoning to the act.
    const ahead = new DangerAhead();
    ahead.start(s); ahead.stop(); await ahead.done;
    // Left to run, every band ahead is settled, or known to want its whole reckoning (every fight of six won, left to
    // the act): asked after, none plays a fight, and one at least is settled.
    ahead.start(s); await ahead.done;
    const said = bands.map(b => DangerSense.advance(s.campaign, b));
    expect(said.every(v => typeof v === 'boolean' || v === 'reckon')).toBe(true);
    expect(said.some(v => typeof v === 'boolean')).toBe(true);
  }, 120000);
});

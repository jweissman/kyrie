import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// Calamy in a world that goes on: one of the independent adventures, of which a world holds the one its seed
// chooses; beyond the east march of a cold country, where the river runs out through the reeds and the estuary
// begins. Its nine days to the Kindling run from the morning after it is reached; its folk speak of it in the
// country before; and after the Kindling it goes on, changed, with no ending to close the book.
describe('Calamy in the one country', () => {
  it('is spoken of in a cold country, a province of it, and its Kindling falls nine days on from reaching it', async () => {
    const w = await WorldAssembler.assemble('cold', NodeBundleSource.shared, { region: { terrain: 'frost' } });
    expect(w.report.region.provinces!.map(p => p.name)).toContain('Calamy');
    const s = await PlaySession.start(w.path, 'cold', w.source), frontier = new Frontier('cold', NodeBundleSource.shared);
    await GeneratedWorld.travel(s, 'gate_calamy');
    await frontier.expand(s.campaign);
    const rid = 'pcalamy', L = (x: string) => `${rid}__${x}`;
    expect(s.campaign.module.entities.some(e => e.id === L('sewing_beam'))).toBe(true);
    // No ending is installed in a world that goes on.
    expect(s.campaign.module.entities.some(e => e.id === L('lending'))).toBe(false);
    const go = async (re: RegExp) => { const c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name)); if (!c) { throw new Error(`No ${re} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); } return s.perform(c.choice.id); };
    await go(/road on into Calamy/);
    expect(s.campaign.world.one('at', 'party')).toBe(L('causey'));
    await go(/causeway into the Hithe/);
    await go(/door under the lantern/);
    expect(PlayerView.choices(s.campaign).some(x => /Talk to the Almanack/.test(x.choice.name))).toBe(true);
    // The city's own days: nothing has burned at the Ashpit on the morning it is reached.
    expect(s.campaign.world.test({ kind: 'call', name: L('kindlingDone'), args: [L('ashpit')] })).toBe(false);
  }, 300000);
});

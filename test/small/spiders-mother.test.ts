import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { PlayerView } from '../../src/presentation/player-view';
import { Consequences } from '../../src/campaign/consequences';
import type { TickHost } from '../../src/campaign/campaign-tick';

// With the spiders' mother dead, what is still to do is burn her eggs (R10-13: "Still to do: deal with the spiders'
// mother" was told under the fight that killed her; E212 split the aim in the template). In the laboratory, the
// first town's undertown alone: the spiders' job done and the eggs learned of, the aim is the mother while she lives,
// and the eggs, not her, once she does not.
describe('the spiders\' mother\'s aim', () => {
  it('is to deal with her while she lives, and only to burn the eggs once she is dead', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Haze']));
    const aims = () => (PlayerView.observe(j.campaign).objectives ?? []).map(o => o.text).filter(t => /spider/.test(t));
    j.assert('low_u_done', 'low_u_spiders_job');
    j.assert('knows', 'party', 'low_u_spiders_eggs');
    j.campaign.refreshProjection();
    expect(aims()).toEqual([expect.stringMatching(/^Deal with the spiders' mother .* burn her eggs/)]);
    // Slain as the template's own Slay slays her (struckDead, then the consequence).
    j.assert('struckDead', 'low_u_mother');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    expect(aims()).toEqual([expect.stringMatching(/^Burn the spiders' eggs /)]);
  });
});

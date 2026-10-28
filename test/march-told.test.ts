import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { WorldGrid } from '../src/world/world-grid';
import { RegionGeography } from '../src/world/region-geography';
import { GeneratedWorld } from './support/generated';

// The road across a march is told by the two countries it runs between, what falls behind and what begins, not by
// the far country's land alone (the register's NAV-07). a1: Merscfaenn, a fen; west of it, whatever the seed makes.
describe('the road across a march', () => {
  it('is told by the land it leaves and the land it comes to', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, 'a1', w.source), frontier = new Frontier('a1', NodeBundleSource.shared);
    await GeneratedWorld.travel(s, 'edge_west');
    await frontier.expand(s.campaign);
    const road = PlayerView.choices(s.campaign).find(c => /^Take the road across the march/.test(c.choice.name))!;
    const event = await s.perform(road.choice.id);
    const land = (event.voiced ?? []).find(v => v.kind === 'journey-land');
    const behind = RegionGeography.terrain(w.report.region.terrain), ahead = RegionGeography.terrain(WorldGrid.drawn('a1', -1, 0).terrain);
    expect(land?.id).toMatch(/^journey-land\.march\./);
    expect(land!.text).toContain(`${ahead} country`);
    if (behind !== ahead) { expect(land!.text).toContain(`${behind} country`); }
  }, 120000);
});

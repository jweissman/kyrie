import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import type { CreatureStore } from '../src/creature-store';

// What the slain leave (M19-92, G12): a footpad cut down on the lane leaves there what he carried, his arms and his
// jerkin, to be taken as anything lying there is; nothing had been left by the slain, and a person's gear was no
// reward of a fight.
describe('what the slain leave', () => {
  it('is set down where they fell, and taken like anything lying there', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'sp/site.kyr': `Module sp "Spoils" { Place lane "the lane" is room outdoors. Company party "You" of 1 at lane.
        Person pad "a footpad" at lane { Role "a footpad, waiting in the lane". Ancestry human. Calling thief. Level 1. }
        Initially Assert hostile(pad, party). Goal false. }`,
      'sp/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'sp.campaign.json': JSON.stringify({ version: 1, name: 'sp', modules: [{ id: 'p', bundle: 'sp/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', level: 9 }] }) });
    const j = await Journey.start(source.resolve('sp.campaign.json'), 'sp', { source });
    const s = j.session, pad = () => (s.campaign as unknown as { creatures: CreatureStore }).creatures.get('p__pad_person');
    const carried = (pad().state.inventory ?? []).map(i => i.id);
    expect(carried.length).toBeGreaterThan(0);
    await j.play('Attack');
    expect(pad().state.hp).toBe(0);
    expect(pad().state.inventory ?? []).toEqual([]);
    for (const id of carried) { expect(s.campaign.world.one('at', id)).toBe('p__lane'); }
    const take = PlayerView.choices(s.campaign).filter(c => /^Collect /.test(c.choice.name));
    expect(take.length).toBe(carried.length);
    const first = take[0]!.choice.id.split(',')[1]!;
    await s.perform(take[0]!.choice.id);
    expect(s.campaign.world.one('at', first)).toBeUndefined();
  }, 60000);
});

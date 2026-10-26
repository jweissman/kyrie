import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Advancement } from '../src/rules/advancement';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// Growth that opens play, not only numbers (CMB-08): a level's development may be a skill the calling teaches, and the
// character sheet says what it would open that the company has come to and cannot do now. wren's Neblawigil: past the
// seal-stone a lone warrior rolls aside, a way south wants climbing; a level gained and climbing taken up, it is open.
describe('a level gained', () => {
  it('can be spent on a skill that opens a way the company has come to', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source), c = s.campaign;
    const take = (pattern: RegExp) => s.perform(PlayerView.choices(c).find(x => pattern.test(x.choice.id))!.choice.id);
    const store = (c as unknown as { creatures: CreatureStore }).creatures, lease = store.acquire(c.state.partyIds);
    try {
      lease.creatures.forEach(x => { x.state.experience = Advancement.threshold(2); });
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    // A night under a roof: the level comes, and with it a development.
    await GeneratedWorld.travel(s, 's1_taproom');
    await take(/^take_lodging\(/);
    expect(c.readout.creatures.find(x => x.id === c.state.partyIds[0])!.base.level).toBe(2);
    // Out to Neblawigil, a torch lit, the seal-stone rolled aside, and in as far as the way that wants climbing.
    await GeneratedWorld.travel(s, 'w3');
    await take(/^light_item\(/);
    await take(/seal_roll/);
    await GeneratedWorld.travel(s, 'w3_end');
    expect(PlayerView.choices(c).some(x => x.choice.id.startsWith('go(region__w3_south'))).toBe(false);
    const climbing = ScreenModel.build(c).party[0]!.development!.options.find(o => o.id === 'climbing')!;
    expect(climbing.opens?.length).toBeGreaterThan(0);
    await s.perform(climbing.command!);
    expect(PlayerView.choices(c).some(x => x.choice.id.startsWith('go(region__w3_south'))).toBe(true);
    // And it is kept: through the watches of the torch burning, which once lost it (a creature made again from how it
    // stands in a fight kept everything of its state but the skills taken up).
    await s.perform('wait_hour');
    expect(c.state.creatures.find(x => x.id === c.state.partyIds[0])!.state.skills).toEqual(['climbing']);
    await s.perform(PlayerView.choices(c).find(x => x.choice.id.startsWith('go(region__w3_south'))!.choice.id);
    expect(c.world.one('at', 'party')).toBe('region__w3_right');
  }, 180000);
});

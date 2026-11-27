import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the dragon beyond the ring', () => {
  it('can be beaten by an experienced company without changing combat statistics', async () => {
    const party = Array.from({ length: 3 }, (_, i) => ({
      name: `Warrior ${i + 1}`, raceId: 'human', classId: 'warrior', level: 15,
      rolled: { strength: 17, dexterity: 15, constitution: 16, intelligence: 10, wisdom: 10, charisma: 10 },
    }));
    const j = await Journey.start(campaign, 'dragon-muster', { party });
    Placed.at(j, 'tallow__lc_ring');
    j.assert('lcArenaWon', 'party');
    await j.play('Wait a while', 'To the scorched walk');
    await j.fight('^Attack$');
    expect(j.holds('able', 'party')).toBe(true);
    expect(j.holds('able', 'lc_young_dragon')).toBe(false);
    expect(j.offers('To the door of spears')).toBe(true);
  }, 10000);

  it('names its price and lets an impoverished company retreat', async () => {
    const j = await Journey.start(campaign, 'dragon-retreat');
    j.coin(0);
    Placed.at(j, 'tallow__lc_ring');
    j.assert('lcArenaWon', 'party');
    await j.play('Wait a while', 'To the scorched walk');
    expect(j.latest).toContain('Twelve coins to pass');
    expect(j.offers('Pay the young dragon of the scorched walk the price named')).toBe(false);
    await j.play('To the drowned ring');
    expect(j.at('party')).toBe('tallow__lc_ring');
    expect(j.campaign.running).toBe(true);
  }, 10000);

  it('opens the stair if the dragon is routed without being killed', async () => {
    const j = await Journey.start(campaign, 'dragon-routed');
    Placed.at(j, 'tallow__lc_wyrm_walk');
    // Isolate the gate's response from the difficult fight.
    j.assert('routed', 'lc_young_dragon');
    await j.play('Wait a while');
    expect(j.holds('able', 'lc_young_dragon')).toBe(true);
    expect(j.offers('To the door of spears')).toBe(true);
  }, 10000);

  it('lets a sufficiently wealthy company pay for passage', async () => {
    const j = await Journey.start(campaign, 'dragon-toll');
    j.coin(300);
    Placed.at(j, 'tallow__lc_ring');
    j.assert('lcArenaWon', 'party');
    await j.play('Wait a while', 'To the scorched walk');
    const gold = j.measure('quantity', 'party', 'gold');
    const hoard = j.measure('quantity', 'lc_young_dragon', 'gold');
    await j.play('Pay the young dragon of the scorched walk the price named');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 12);
    expect(j.measure('quantity', 'lc_young_dragon', 'gold')).toBe(hoard + 12);
    expect(j.holds('tolerates', 'lc_young_dragon', 'party')).toBe(true);
    expect(j.offers('To the door of spears')).toBe(true);
  }, 10000);

  it('can be encountered through the arch and fought under ordinary combat rules', async () => {
    const j = await Journey.start(campaign, 'dragon-fight');
    Placed.at(j, 'tallow__lc_ring');
    j.assert('lcArenaWon', 'party');
    await j.play('Wait a while');
    await j.play('To the scorched walk');
    expect(j.at('party')).toBe('tallow__lc_wyrm_walk');
    expect(j.at('lc_young_dragon')).toBe('tallow__lc_wyrm_walk');
    const dragon = j.campaign.actors.find(a => a.id === 'tallow__lc_young_dragon')!;
    await j.fight('^Attack$');
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'attack' && dragon.members.includes(e.actor))).toBe(true);
  }, 10000);
});

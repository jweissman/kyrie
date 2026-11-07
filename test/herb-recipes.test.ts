import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Canon } from '../src/canon/canon';

// What grows, made into remedies by what it is good for (the owner, 6 November: the plants' uses, without a second
// item system): bay, good for healing, medicine and purification, laid on with a bandage makes a herb poultice,
// steeped with healing herbs a minor potion of healing, boiled with them an antidote; and gathered, a leaf of it heals
// a little as it is.
class Herbs {
  static async start() {
    const src = new OverlayBundleSource(NodeBundleSource.shared, {
      'herbs/site.kyr': `Module herbs "Herbs" {
  Place hall "the still-room" is room. Company party "You" of 1 at hall.
  Item bay "a sprig of bay" is bay_gathered at hall. Item pad "a roll of bandages" is bandages at hall.
  Item bundle "a twist of healing herbs" is herbs at hall.
  Goal false.
}`,
      'herbs/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'herbs.campaign.json': JSON.stringify({ version: 1, name: 'herbs', modules: [{ id: 'h', bundle: 'herbs/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'cleric' }] }) });
    const s = await PlaySession.start(src.resolve('herbs.campaign.json'), 'herbs', src);
    await s.perform('wait');
    for (const thing of ['bay', 'bandages', 'healing herbs']) {
      const take = PlayerView.choices(s.campaign).find(c => c.choice.name.startsWith('Collect') && c.choice.name.includes(thing));
      if (take) { await s.perform(take.choice.id); }
    }
    return s;
  }
}

describe('the remedies of what grows', () => {
  it('makes of a herb what its plant is good for, and lets a healing leaf be used as it is', async () => {
    expect(Canon.items.bay_gathered).toMatchObject({ category: 'consumable', use: 'Heal (1d4) health to ally.' });
    expect(Canon.items.herb_poultice?.category).toBe('consumable');
    const s = await Herbs.start(), names = PlayerView.choices(s.campaign).map(c => c.choice.name);
    expect(names.filter(n => /^Ama: make /.test(n)).map(n => n.replace(/ of (a|an|the) .*/, ''))).toEqual(expect.arrayContaining([
      'Ama: make Herb poultice', 'Ama: make Minor Potion of Healing', 'Ama: make Antidote']));
  }, 60000);
});

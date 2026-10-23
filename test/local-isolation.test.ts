import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Canon } from '../src/canon/canon';
import { ItemCatalog } from '../src/item-catalog';

// Two adventures that give the same names to different things (test/fixtures/locals): at the mere, moonglass is
// treasure the mere makes and a mere hound is a territorial wolf of the reeds; at the works, moonglass is a lens
// for a lamp and a mere hound is the works' tame dog. Each is defined in its own Kyr alone, with no catalog edited;
// played one after the other in one process, each has its own, and neither's leaks into the other or stays behind.
class Locals {
  static start(name: 'mere' | 'works') {
    return PlaySession.start(`test/fixtures/locals/${name}/campaign.json`, name, NodeBundleSource.shared);
  }
  static kinds() {
    const glass = Canon.items.moonglass, hound = Canon.species.mere_hound;
    return { glass: glass && { name: glass.name, category: glass.category },
      hound: hound && { name: hound.name, like: hound.variantOf } };
  }
}

describe('an adventure\'s own kinds', () => {
  it('are its own while it is played: the same names mean other things in another adventure', async () => {
    expect(Locals.kinds()).toEqual({ glass: undefined, hound: undefined });
    const mere = await Locals.start('mere');
    expect(Locals.kinds()).toEqual({ glass: { name: 'a shard of moonglass', category: 'treasure' },
      hound: { name: 'a mere hound', like: 'wolf' } });
    expect(PlayerView.choices(mere.campaign).map(c => c.choice.name)).toContain('Collect a shard of moonglass for Ama');
    const works = await Locals.start('works');
    expect(Locals.kinds()).toEqual({ glass: { name: 'a moonglass lens', category: 'equipment' },
      hound: { name: 'a mere hound', like: 'dog' } });
    expect(ItemCatalog.definitions.moonglass?.name).toBe('a moonglass lens');
    // The mere's hounds, wolves of the reeds, hold their ground; the works' dog is tame, and can be made much of.
    expect(PlayerView.choices(works.campaign).map(c => c.choice.name)).toContain('Make much of Ash');
    // Played again, the mere has its own again, from its compiled campaign rather than from being read afresh.
    await Locals.start('mere');
    expect(Locals.kinds().glass).toEqual({ name: 'a shard of moonglass', category: 'treasure' });
  }, 60000);
  it('come back with a saved game of their adventure, whatever was played since', async () => {
    const mere = await Locals.start('mere');
    const saved = mere.checkpoint();
    await Locals.start('works');
    expect(Locals.kinds().glass?.category).toBe('equipment');
    PlaySession.resume(saved);
    expect(Locals.kinds().glass?.category).toBe('treasure');
  }, 60000);
});

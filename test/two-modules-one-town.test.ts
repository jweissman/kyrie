import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';
import type { PublicChoice } from '../src/presentation/action-presentation';

// Several modules placed in one town keep to their own places (COR-05): in a1, Lowmouth holds the town's own places,
// Wapshott's circus on its ground, the players at the lime-kiln and a quarrel in the inn's back garden. Another
// module's choice is offered at a place only by what of it is there: someone of it stood there to be asked (Gosse on
// the green), something of it there (Wapshott's bill), a way of it from there and where that way goes, or a word of
// it put to someone there (the priest asked of the players). Nothing of a module is offered anywhere it is not.
class Offered {
  static module(id: string): string | undefined { return /^([a-z0-9]+)__/.exec(id)?.[1]; }
  // What a choice at a place names of another module that is not there (the town's own and the company's are
  // everyone's).
  static strays(c: Campaign, choice: PublicChoice, here: string): string[] {
    if (choice.speaker && this.there(c, choice.speaker, here)) { return []; }
    const ways = c.world.related('connects').filter(r => r.args[1] === here || r.args[2] === here);
    const near = new Set([here, ...ways.flatMap(r => r.args)]);
    const named = [...choice.targets ?? [], ...choice.speaker ? [choice.speaker] : []]
      .filter(t => this.foreign(t, here));
    // An action of another module with nothing of it here is offered where that module is not.
    const act = this.foreign(choice.id, here) && !named.length ? [choice.id] : [];
    return [...named.filter(t => !near.has(t) && !this.there(c, t, here)), ...act];
  }
  private static foreign(id: string, here: string): boolean {
    const m = this.module(id);
    return !!m && m !== this.module(here) && m !== 'region' && !id.includes('party');
  }
  private static there(c: Campaign, id: string, here: string): boolean {
    return c.world.test(ModuleWriter.call('at', id, here));
  }
}

describe('two modules in one town', () => {
  it('offers neither\'s actions at the other\'s places', async () => {
    const c = (await DrawnWorld.start('a1', { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] }, NodeBundleSource.shared)).campaign;
    const party = c.playerActor ?? 'party', town = c.module.entities.find(e => e.name === 'Lowmouth')!;
    const rooms = c.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && e.space.parent === town.id);
    const owners = new Set(rooms.map(r => Offered.module(r.id)));
    expect([...owners].sort()).toEqual(['circus', 'fellowship', 'players', 'quarrel', 'region', 'walk']);
    const strays: string[] = [];
    for (const r of rooms) {
      const was = c.world.one('at', party)!;
      c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', party, was) },
        { kind: 'assert', call: ModuleWriter.call('at', party, r.id) }]));
      for (const { choice } of PlayerView.choices(c)) {
        if (Offered.strays(c, choice, r.id).length) { strays.push(`${r.name}: ${choice.id}`); }
      }
    }
    expect(strays).toEqual([]);
  }, 120000);
});

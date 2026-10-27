import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import type { Feature } from '../src/world/features';
import wilds from '../data/generation/scenes/wilds.json';
import items from '../data/catalog/items.json';
import skills from '../data/catalog/skills.json';

// The landmarks of wild country (a charcoal-burners' clearing, a shepherds' bothy, a cairn) were a scene and nothing
// else: a fresh play of Mission 17 stood at them and could only go on (M17-20, brief VI). Each has something now to
// look at closely: what it shows, what one with the knowledge for it makes of it, now and then something there to
// take, or a custom of the place to keep.
class Wild {
  static async start(seed: string, classId: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Aud', raceId: 'elf', classId }] });
    return PlaySession.start(w.path, seed, w.source);
  }
  // Goes to where a thing of the region's wild country stands, by its name.
  static async to(s: PlaySession, name: string): Promise<string> {
    const id = s.campaign.module.entities.find(e => /^region__z\d/.test(e.id) && e.name === name)!.id;
    await GeneratedWorld.travel(s, s.campaign.world.one('at', id)!.replace(/^region__/, ''));
    return id;
  }
  static async act(s: PlaySession, name: RegExp): Promise<string[]> {
    const c = PlayerView.choices(s.campaign).find(x => name.test(x.choice.name));
    if (!c) { throw new Error(`No ${name} among ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return (await s.perform(c.choice.id)).perceptions?.map(p => p.text) ?? [];
  }
  static seen(s: PlaySession): string[] { return ScreenModel.build(s.campaign).observed.map(o => o.text); }
}

describe('the landmarks of wild country', () => {
  it('have each something to look at closely, in words the catalog can keep', () => {
    type Kinds = { landmarks: { things?: Feature[] }[]; water: { things?: Feature[] }[] };
    const table = wilds as unknown as Record<string, Kinds>;
    const kinds = ['wood', 'fen', 'heath', 'fell'].flatMap(w => [...table[w]!.landmarks, ...table[w]!.water]);
    expect(kinds.filter(k => !k.things?.length)).toEqual([]);
    const all = kinds.flatMap(k => k.things ?? []);
    expect(all.filter(t => t.find && !(t.find.kind in items.items)).map(t => t.id)).toEqual([]);
    expect(all.filter(t => t.by && !(t.by in skills.skills)).map(t => t.id)).toEqual([]);
  });
  it('show what is there to one who looks, and something left there to take', async () => {
    const s = await Wild.start('wren', 'mage');
    const hut = await Wild.to(s, 'the turf hut');
    const looked = await Wild.act(s, /^Look closely at the turf hut/);
    expect(looked).toContain('Inside, the hut is dry and smells of smoke: a bed of bracken, and a crock with a broken lip.');
    expect(looked).toContain('Stuck in the turf over the doorway is a pine-knot torch, pitched and ready, as burners leave'
      + ' one for whoever comes after.');
    await Wild.act(s, /^Collect a pine-knot torch for Aud/);
    expect(Wild.seen(s).some(l => /pine-knot torch/.test(l))).toBe(false);
    expect(s.campaign.world.one('at', `${hut}_find`)).toBeUndefined();
  }, 120000);
  it('mean something more to one with the knowledge for it', async () => {
    const ranger = await Wild.start('wren', 'ranger'), mage = await Wild.start('wren', 'mage');
    for (const s of [ranger, mage]) { await Wild.to(s, 'the burning-rings'); }
    const reading = /longer than the oldest of these trees has stood/;
    expect((await Wild.act(ranger, /^Look closely at the burning-rings/)).some(l => reading.test(l))).toBe(true);
    expect((await Wild.act(mage, /^Look closely at the burning-rings/)).some(l => reading.test(l))).toBe(false);
  }, 120000);
  it('keep the customs of the place', async () => {
    const s = await Wild.start('pine', 'mage');
    await Wild.to(s, 'the stones of the cairn');
    expect(await Wild.act(s, /^Add a stone of your own to the cairn/))
      .toContain('Your stone is on the cairn now, with everyone else\'s.');
    expect(PlayerView.choices(s.campaign).some(x => /^Add a stone/.test(x.choice.name))).toBe(false);
  }, 120000);
});

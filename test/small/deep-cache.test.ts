import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Placed } from '../support/placed';
import { Canon } from '../../src/canon/canon';
import { ModuleWriter } from '../../src/lang/module-writer';
import { DeepCache } from '../../src/world/deep/deep-cache';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import type { DeepLayout } from '../../src/world/deep/deep-layout';

// A deep site's walled-up cache (the sites commission, item 1; register SI-03): its cue is in the room's look, told
// only in the light, and nothing of it is offered until the cue is seen (the indicator appendix: nothing reveals what
// the character does not know); then searching finds it, or lore reads the mark, or strength or a crowbar levers it
// open in an hour. What it holds is worth keeping: an arm or armour, a thing of use, a valuable, and what the kingdom
// after the makers wrote of it, which teaches who came after them. The generator's own lines (DeepCache.lines), on
// a level of one room drawn by hand; the cache's contents over many keys besides.
const purpose = DeepPurposes.all.bone!;
const layout: DeepLayout = { site: 'b', links: [], levels: [
  { id: 'top', index: 0, name: 'the top', flooded: false, rooms: [] },
  { id: 'halls', index: 1, name: 'the halls', flooded: false,
    rooms: [{ id: 'hall', level: 1, role: 'bone_hall', x: 0, y: 1, name: 'the hall of the bones', scene: '', lit: false }] }] };
const lines = DeepCache.lines(layout, purpose, { values: { kingdom: 'Aergodríce' }, key: 'tiny:b:deep' }).join('\n');
// The barrow's own valuables, as the site declares them (DeepSites.kinds).
const kinds = Object.values(purpose.valuables ?? {}).flat().map(v => `  Kind ${v.id} ${JSON.stringify(v.name)} is treasure`
  + ` worth ${v.worth} weighing ${v.weight} described ${JSON.stringify(v.text)}.`).join('\n');
const world = (lit: boolean) => `
${kinds}
  Place b "the barrow" is site. Place halls "the halls" is level within b.
  Place hall "the hall of the bones" is room within halls at 0, 1 underground.
  ${lit ? '' : 'Initially Assert unlit(hall).'}
  Discovery history_successors "After the makers came the kingdom of Aergodríce.".
  Company party "You" of 1 at hall.
${lines}
  Goal false.`;
const knows = (t: Tiny, f: string) => t.world.test(ModuleWriter.call('knows', 'party', `t__${f}`));
const offered = (t: Tiny, pattern: RegExp) => t.journey.choices().some(c => pattern.test(c.label));
const cache = 'hall_cache';
// What is told is learned as it is told, on a step: a while spent in the hall.
const arrived = async (lit: boolean, classId: string) => (await Tiny.start(world(lit),
  { party: [{ name: 'Wynn', raceId: 'human', classId }] })).play('=+1');
describe('a walled-up cache in a deep site', () => {
  it('offers nothing of itself in the dark, where its cue cannot be seen', async () => {
    const t = await arrived(false, 'warrior');
    expect(knows(t, `${cache}_noticed`)).toBe(false);
    expect(offered(t, /Lever the small stones|mark scratched/)).toBe(false);
  });
  it('is levered open by strength once seen, in an hour, and holds what is worth keeping', async () => {
    const t = await arrived(true, 'warrior');
    expect(knows(t, `${cache}_noticed`)).toBe(true);
    expect(offered(t, /mark scratched/)).toBe(false);
    const watch = t.journey.watch();
    await t.play('Lever the small stones');
    expect(t.journey.watch() - watch).toBeGreaterThanOrEqual(6);
    expect(knows(t, `${cache}_found`)).toBe(true);
    Placed.at(t.journey, `t__${cache}_chamber`);
    await t.play('Unfold the paper and read it');
    expect(knows(t, 'history_successors')).toBe(true);
  });
  it('is found by a search, and offers a reader the mark', async () => {
    const t = await arrived(true, 'mage');
    expect(offered(t, /mark scratched/)).toBe(true);
    expect(offered(t, /Lever the small stones/)).toBe(false);
    await t.play('Search here');
    expect(knows(t, `${cache}_found`)).toBe(true);
  });
  it('keeps an arm or armour, a thing of use and a valuable, whatever the key', () => {
    for (const [art, p] of Object.entries(DeepPurposes.all)) {
      for (let n = 0; n < 20; n++) {
        const kept = DeepCache.kept(p, `k${n}:${art}`), cats = kept.map(k => Canon.items[k]?.category ?? 'own');
        expect(cats.some(c => ['weapon', 'armor'].includes(c))).toBe(true);
        expect(cats.some(c => ['tool', 'gear', 'consumable', 'equipment'].includes(c))).toBe(true);
        expect(new Set(cats).size).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

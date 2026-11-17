import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';
import { DeepOrder } from '../../src/world/deep/deep-order';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import type { DeepContent } from '../../src/world/deep/deep-pacing';
import type { DeepLayout, DeepRoom } from '../../src/world/deep/deep-layout';

// A deep site's order chest (the sites commission, item 2): three marks, each one flat act; the order is on a frieze
// in another room of the same level, and a company that has seen it can open the chest; a wrong mark sets it back and
// says so; lore reads the order off the chest (a try); force opens it in an hour and breaks what is inside. The
// generator's own lines (DeepOrder.lines) on a level of two rooms drawn by hand.
const purpose = DeepPurposes.all.bone!;
const room = (id: string, x: number): DeepRoom => ({ id, level: 1, role: 'x', x, y: 1, name: id, scene: '', lit: true });
const [chest, hall] = [room('crypt', 0), room('hall', 1)];
const layout: DeepLayout = { site: 'b', links: [], levels: [{ id: 'top', index: 0, name: '', flooded: false, rooms: [] },
  { id: 'halls', index: 1, name: 'the halls', flooded: false, rooms: [chest, hall] }] };
const content: DeepContent[] = [{ room: chest, guide: 'puzzle', riddle: 'medium' }, { room: hall, guide: 'empty' }];
const lines = DeepOrder.lines(layout, content, { purpose, key: 'tiny:b:deep' }).join('\n');
const kinds = Object.values(purpose.valuables ?? {}).flat().map(v => `  Kind ${v.id} ${JSON.stringify(v.name)} is treasure`
  + ` worth ${v.worth} weighing ${v.weight} described ${JSON.stringify(v.text)}.`).join('\n');
const world = `
${kinds}
  Place b "the barrow" is site. Place halls "the halls" is level within b.
  Place crypt "the crypt" is room within halls at 0, 1 underground.
  Place hall "the long hall" is room within halls at 1, 1 underground.
  Passage arch "the arch" is passage between crypt and hall.
  Company party "You" of 1 at crypt.
${lines}
  Goal false.`;
const id = 'crypt_order';
const n = (t: Tiny) => t.world.number(ModuleWriter.call(`t__${id}_n`, `t__${id}`));
const open = (t: Tiny) => t.world.test(ModuleWriter.call('state', `t__${id}`, 't__open'));
const presses = (t: Tiny) => t.journey.choices().filter(c => /^Press the boss/.test(c.label)).map(c => c.label);
const start = (classId: string) => Tiny.start(world, { party: [{ name: 'Wynn', raceId: 'human', classId }] });
describe('an order chest in a deep site', () => {
  it('stands in place of the riddle, with three marks as three flat acts', async () => {
    expect(content[0]!.riddle).toBeUndefined();
    const t = await start('warrior');
    expect(presses(t)).toHaveLength(3);
  });
  it('opens to the frieze\'s order, and sets itself back on a wrong mark', async () => {
    const t = await start('warrior');
    await t.play('To the long hall', 'To the crypt');
    const known = t.campaign.module.entities.find(e => e.id === `t__${id}_order`)!.name;
    const order = [...known.split(':')[1]!.matchAll(/the [a-z-]+/g)].map(m => m[0]);
    expect(order).toHaveLength(3);
    await t.play(`Press the boss carved as ${order[1]}`);
    expect(n(t)).toBe(0);
    for (const mark of order) { await t.play(`Press the boss carved as ${mark}`); }
    expect(open(t)).toBe(true);
    expect(t.world.test(ModuleWriter.call('inside', `t__${id}_gift`, `t__${id}`))).toBe(true);
  });
  it('is read by lore, or forced in an hour at the cost of what it holds', async () => {
    const mage = await start('mage');
    expect(mage.journey.choices().some(c => /Read the makers' marks/.test(c.label))).toBe(true);
    const t = await start('warrior');
    expect(t.journey.choices().some(c => /Read the makers' marks/.test(c.label))).toBe(false);
    const watch = t.journey.watch();
    await t.play('Break the chest');
    expect(open(t)).toBe(true);
    expect(t.journey.watch() - watch).toBeGreaterThanOrEqual(6);
    expect(t.world.test(ModuleWriter.call('inside', `t__${id}_gift`, `t__${id}`))).toBe(false);
  });
});

import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { RegionRoom } from '../../../src/world/region-room';
import { ModuleWriter } from '../../../src/lang/index';
import type { Settlement } from '../../../src/world/region-writer';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The loft kept (OR-1130, the economy's long
// haul: the first thing in the world that is the company's own). The reference town's herb-wife lets the loft over
// her house by the week, once the company has been down under the stones: a thing left in its chest stays there
// through an expedition below, coming back up is told by her and by the loft, and its night is a safe rest. The loft as
// data/generation/town/room.kyrt writes it for the reference game (RegionRoom.reference), in a fragment.
const town = [
  'Place n "Oakhythe" is settlement at 0, 0.',
  'Place n_green "the green" is room within n at 1, 1 outdoors.',
  'Place n_taproom "Finnan\'s house" is room within n at 1, 0 indoors.',
  'Passage n_inn_door "Finnan\'s door" is door between n_taproom and n_green.',
  'Place n_wood "the old woods" is site within n at 0, 4.',
  'Place n_wood_edge "the edge of the old woods" is room within n_wood at 1, 2 outdoors.',
  'Passage n_wood_path "the path into the woods" is path between n_green and n_wood_edge taking 30 minutes.',
  'Place n_ud "the stair under the fallen stones" is room within n at 1, 7 underground 4 down.',
  'Passage n_wood_down "the steps down" is steps between n_wood_edge and n_ud.',
  'Person n_innkeeper "Finnan" at n_taproom { Role "herb-wife". Ancestry human. Peaceable. }',
  ...RegionRoom.reference({ id: 'n', name: 'Oakhythe', innkeeper: 'Finnan' } as Settlement),
  'Company party "You" of 1 at n_taproom.', 'Initially Set quantity(party, gold) to 20.', 'Goal false.',
].join('\n');
describe('World › The loft kept', () => {
  it('is let once the company has been below, and keeps what is left in its chest through an expedition', async () => {
    const t = await Tiny.start(town, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' } as never] });
    const labels = () => t.journey.choices().map(c => c.label), told = () => t.journey.taken.at(-1)?.told ?? '';
    const gold = () => t.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    // Not asked for before the company has been down.
    await t.play('?^Talk to Finnan');
    expect(labels().some(l => /for the loft, by the week/.test(l))).toBe(false);
    await t.play('?^Take your leave', '>t__n_ud', '>t__n_taproom', '^Talk to Finnan', '^Ask Finnan for the loft, by the week');
    expect(told()).toMatch(/Eight coin the week/);
    expect(gold()).toBe(12);
    await t.play('?^Take your leave', '>t__n_room');
    const put = t.journey.choices().find(c => /^put_in\([^,]*battleaxe,t__n_room_chest\)$/.test(c.command));
    const cargo = /^put_in\(([^,]+),/.exec(put?.command ?? '')?.[1] ?? '';
    expect(cargo).not.toBe('');
    await t.perform(put!.command);
    const kept = () => t.world.test(ModuleWriter.call('inside', cargo, 't__n_room_chest'));
    expect(kept()).toBe(true);
    // Down under the stones half a day, and back up.
    await t.play('>t__n_ud', '==+80', '>t__n_taproom');
    expect(told()).toMatch(/'Back, then,' says Finnan\. 'I kept your room\./);
    await t.play('>t__n_room');
    expect(told()).toMatch(/Your room is as you left it, the chest where it stood\./);
    expect(kept()).toBe(true);
    // And a safe night: the loft's own.
    await t.play('^Sleep in your own room');
    expect(told()).toMatch(/rested as you have not been since the road/);
  });
});

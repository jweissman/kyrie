import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { RegionWoods } from '../../../src/world/region-woods';
import type { Settlement } from '../../../src/world/region-writer';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The burners' bench (the owner's playtest of
// 27 November: "quests are very thin, pure fetch quests, with no connection to the broader world or to future quests";
// OR-1503). The first town's woundwort is a fetch only until it is shown: brought to the herb-wife, she asks what it
// is, and then, trusting the company, tells why the burners left the woods, which opens two things later play reads.
// The lamp under her father's bench in the hut at their clearing is there to be taken (gear by the way in), and the
// mark he saw on the stones (a door drawn shut) is what the shrine-keeper asks before she says what lies under them:
// told it, the company can say it to her unasked, never having stood at the stones, and learns the place's name, which
// the old sayings of it are asked by. The woods as data/generation/town/woods.kyrt writes them (RegionWoods), in a
// fragment.
const woods = [
  'Place n "Newmeet" is settlement at 0, 0.',
  'Place n_green "the market-place" is room within n at 1, 1 outdoors.',
  'Place elsewhere "somewhere else" is room.',
  'Person n_innkeeper "Sable" at n_green { Role "herb-wife". Ancestry human. Peaceable. }',
  'Person n_priest "Ida" at n_green { Role "shrine-keeper". Ancestry human. Peaceable. }',
  ...RegionWoods.lines({ id: 'n', name: 'Newmeet' } as Settlement, { w: 'n_ud', site: 'the old dead', old: 'the Barrow-Kin' }),
  'Company party "You" of 1 at n_wood_ride.', 'Initially Assert knows(party, n_wood_wort).', 'Goal false.',
].join('\n');
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name, args });
describe('World › The burners\' bench', () => {
  it('turns woundwort shown to the herb-wife into the burners\' lamp and the answer the shrine-keeper asks', async () => {
    const t = await Tiny.start(woods, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' } as never] });
    const knows = (f: string) => t.world.test(call('knows', 'party', `t__n_${f}`));
    const labels = () => t.journey.choices().map(c => c.label), told = () => t.journey.taken.at(-1)?.told ?? '';
    await t.play('^Take', '>t__n_wood_edge', '>t__n_green');
    // Not asked before she has seen what the company can gather: the question has no grounds yet.
    expect(labels().some(l => /why the burners left/.test(l))).toBe(false);
    // She asks what brings the company up, and what it carries, in turn (OR-850): it does not know.
    await t.play('^Talk to Sable', '?^Say you have come for what grows there', '^Say you do not know');
    expect(knows('wood_hut')).toBe(false);
    await t.play('^Ask Sable why the burners left the woods');
    expect(told()).toMatch(/A door is cut on the stone, he said, drawn shut/);
    expect([knows('wood_hut'), knows('wood_mark')]).toEqual([true, true]);
    // The shrine-keeper, told the mark unasked, says what lies under the stones: the company has never been there.
    await t.play('^Take your leave', '^Talk to Ida', '^Tell Ida a shut door is cut on the stones');
    expect(told()).toMatch(/a stair goes down, into the old dead/);
    expect([knows('ud_named'), t.world.test(call('been', 'party', 't__n_wood_stones'))]).toEqual([true, false]);
    // And in the burners' clearing, the lamp under the bench, nothing searched for.
    await t.play('^Take your leave', '>t__n_wood_edge', '>t__n_wood_ride', '>t__n_wood_burners');
    expect(t.journey.choices().some(c => c.command.startsWith('take_item(t__n_wood_lamp'))).toBe(true);
  });
});

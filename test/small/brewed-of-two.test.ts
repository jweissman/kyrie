import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';

// A thing is made of two things carried, never of one taken twice (OR-695, cold play 3, T2: "make Minor Potion of
// Healing of healing herbs and healing herbs", one twist of herbs carried, which stands for the willow bark as for
// the meadowsweet). data/rules/making.kyr: distinct(mk_first, mk_second).
const made = async (kinds: string[]) => {
  const t = await Tiny.start(`Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
    ${kinds.map((k, n) => `Item i${n} is ${k} at yard.`).join(' ')} Goal false.`,
  { horizon: ['making', 'canon'], party: [{ name: 'Hild', raceId: 'dwarf', classId: 'cleric' }] });
  for (let n = 0; n < kinds.length; n++) {
    const take = PlayerView.choices(t.campaign).find(r => /^take_item\(/.test(r.choice.id) && r.choice.id.includes(`t__i${n}`));
    await t.session.leg(take!.choice.id);
  }
  return PlayerView.choices(t.campaign).filter(r => /^(make_remedy|make_plain|experiment)\(/.test(r.choice.id))
    .map(r => r.choice.id.replace(/^\w+\(.*,(t__i\d),(t__i\d)\)$/, '$1 $2'));
};
describe('a thing made of two', () => {
  it('is not offered of one thing carried', async () => {
    expect(await made(['herbs'])).toEqual([]);
  });
  it('is offered of two, each once', async () => {
    expect(await made(['herbs', 'herbs'])).toEqual(['t__i0 t__i1']);
    expect(await made(['willow_bark', 'herbs'])).toEqual(['t__i0 t__i1']);
  });
});

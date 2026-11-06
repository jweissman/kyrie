import { describe, expect, it } from 'bun:test';
import { Lull, k } from './support/lull';

// The Lull, revised against doc/imbar/14-bible.md (see doc/imbar/adventures/the-lull.md): a company of five callings,
// what each sees (data/adventures/the-lull/fellowship.kyr), and the cleric's Office for the Easing.
const five = 'test/fixtures/the-lull/revised.campaign.json';
describe('The Lull: the Account, kept', () => {
  it('each calling sees its own thing: the piers, the badger\'s dung, the starlings, the sick-room, the unfinished T', async () => {
    const g = await Lull.start(five);
    await g.fixture('journey', 'sixways', 'dayone');
    await g.play('>lull__mill_bridge');
    expect(g.page).toMatch(/The piers are sound/);
    await g.play('>lull__hanger_path');
    expect(g.page).toMatch(/He remembers being killed/);
    await g.play('>lull__chapel');
    expect(g.page).toMatch(/Fifty-seven years of starlings/);
    await g.play('>lull__strike_post');
    expect(g.page).toMatch(/NELL/);
    await g.play('>lull__spurling_shop');
    expect(g.page).toMatch(/FROM THE WOLD OF HUME, ASKED UNLIT/);
    await g.play('>lull__hester_room');
    expect(g.page).toMatch(/What she lacks is not physic\. It is leave/);
  }, 300000);

  it('the thief reads the beam in the dark: a T begun from behind, and never finished', async () => {
    const g = await Lull.start(five);
    await g.fixture('sixnight', 'arrive', 'hob');
    await g.play('=23:30', 'Wait › An hour', 'To the Pleasure Gardens', 'To the Mill yard', 'Pack › .*torch.* › Light|a torch: Light', 'Into the mill');
    expect(g.knows('beam_stroke')).toBe(true);
    expect(g.page).toMatch(/A T\. Begun and not finished/);
  }, 300000);

  it('a cleric says the Office for the Easing, and Tobias does not do it himself in the night; no cleric, no Office', async () => {
    const g = await Lull.start(five);
    await g.fixture('phial', 'arrive');
    await g.play('Into the Lindsells', 'Hester Lindsell.s room', 'Talk to Hester', 'Talk to Hester Lindsell about something else', '^Take your leave');
    expect(g.j.matches('Office for the Easing').length).toBe(1);
    await g.play('Have Dori say the Office');
    expect(g.holds('hesterEased', 'hester')).toBe(true);
    expect(g.holds('easedByOffice', 'hester')).toBe(true);
    await g.play('Talk to Tobias', 'Ask Tobias Lindsell about the Office', '^Take your leave');
    expect(g.page).toMatch(/Nothing bought/);
    expect(g.measure('tobiasTrust', 'tobias')).toBeGreaterThanOrEqual(2);
    await g.play('=22:40');
    expect(g.holds('hesterDead', 'hester')).toBe(false);
    // The same morning, a lone warrior has no such thing to offer.
    const w = await Lull.start();
    await w.fixture('phial', 'arrive');
    await w.play('Into the Lindsells', 'Hester Lindsell.s room', 'Talk to Hester', 'Talk to Hester Lindsell about something else');
    expect(w.j.matches('Office for the Easing').length).toBe(0);
  }, 300000);
});

import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Said } from '../../src/cli/runner';

// Payoff (the experience pins' family): a bond made, left, and come back to, still holds and is answered in the world.
// "Back to a bond" had been 0 on every generated world and 1.0 in the laboratory (the experience baseline); here, the
// smallest shape: help a torch-seller free his barrow, go down the lane, come back, and his gratitude is kept (the
// runner's kept, from the world, not the words) and asks a coin less of his torches (the remembered favour, CO-16).
describe('a bond made, left and come back to', () => {
  it('holds, and is answered in what is offered', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['test/fixtures/single/barrow.kyr', '--as',
      'human/warrior/Wynn']));
    const r = new Runner(journey.session);
    let said: Said = r.said();
    const take = async (label: RegExp) => {
      const o = [...said.offer.primary, ...said.offer.rest].find(x => label.test(x.label))!;
      said = await r.ask(JSON.stringify({ act: o.id })) as Said;
    };
    const torch = () => [...said.offer.primary, ...said.offer.rest].find(o => /^Buy a torch/.test(o.label))?.label;
    expect(torch()).toMatch(/3 coin$/);
    await take(/free his barrow/);
    expect(said.changed).toEqual(['+ grateful(barrow__halm, party)']);
    await take(/^To the lane/);
    await take(/^To the yard/);
    expect(said.kept).toEqual({ held: 1, of: 1 });
    expect(torch()).toMatch(/2 coin$/);
  });
});

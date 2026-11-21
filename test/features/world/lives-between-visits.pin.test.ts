import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';
import { RunnerFind } from '../../support/runner-find';

// Three of the first town's own going on with their lives between the company's visits (the first-hour beat
// sheet's checkpoint 9: people who act on their own and remember; data/generation/town/neighbours.kyrt). Porthalen on
// three returns days apart: what Morwen Ashlock, Isaure Venn and Hesper Lowe are about has moved on, each by the
// hour has a place of their own, and Morwen and Isaure greet the company by what it last did with them.
const curl = (t: string) => t.replace(/[‘’]/g, "'");
describe('the first town\'s people, between visits', () => {
  it('have moved on by the days, keep their hours, and greet the company by what it did with them', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), look = () => curl(r.said('look').scene.lines.join(' '));
    const act = async (label: RegExp) => curl((await RunnerFind.act(r, r.said(), label)).scene.lines.join(' '));
    // The first visit: a hand at Morwen's table, laid down, and a question put to Isaure.
    await journey.play('>s1_taproom');
    await act(/^Sit down across from Morwen Ashlock/);
    await act(/^Lay your cards down/);
    await act(/^Talk to Isaure Venn$/);
    await act(/^Ask Isaure Venn what she is reading/);
    expect(look()).not.toContain('stiff as boards');
    // Two days off at Wrackham, and back.
    await journey.play('>s2_green', '==day 3 09:00', '>s1_taproom');
    const second = look();
    expect(second).toContain('Morwen Ashlock has a new pack of cards, stiff as boards');
    expect(second).toContain('Isaure Venn has drawn the hill three times on one sheet');
    expect(await act(/^Talk to Morwen Ashlock/)).toContain("'Back for your buttons,' says Morwen Ashlock.");
    expect(await act(/^Talk to Isaure Venn$/)).toContain("'Still the same page,' says Isaure Venn");
    // By the hour: Hesper Lowe in the taproom of an evening, drawing bells.
    await journey.play('==day 3 20:00');
    expect(look()).toContain('Hesper Lowe draws bells on the table in spilt beer');
    // Two days more, and back again.
    await journey.play('>s2_green', '==day 5 10:00', '>s1_taproom');
    const third = look();
    expect(third).toContain("Morwen Ashlock's new cards have gone soft at the corners already");
    expect(third).toContain('Isaure Venn is writing to her teacher');
    expect(third).not.toContain('stiff as boards');
    // Come back of an evening, Hesper is at the taproom, and her bell has gone on without the company.
    expect(third).toContain('Hesper Lowe has broken her clay mould up and begun another');
  }, 300000);
});

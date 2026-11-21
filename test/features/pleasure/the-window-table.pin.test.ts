import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ScreenModel } from '../../../src/ui/screen-model';
import { RunnerFind } from '../../support/runner-find';

// A hand at the window table, as an engagement (OR-174; the owner, 21 November: "when I'm playing cards, there
// should be an actual hand, rules, turns, and a way to finish or resign"; doc/design/focus-activity-engagement.md).
// Morwen Ashlock deals the company in only when it sits, for a penny said before it sits. While the hand is dealt the
// frame is the hand (Screen.engaged): its moves, laying the cards down and the doors out, and nothing else in the room
// (no fiddle, no haggling, no wait). Each trick is a choice of three (straight, watch her hands, cheat back), each its
// own chance; catching her makes the rest of the hand straight. Two tricks end it either way, and each ending is
// told and kept: won (two pennies back, and honestly to the end, where she learned), lost (the penny hers), laid
// down (the penny hers, and she thinks no less of you), walked out on (she remembers).
const rows = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]).map(o => o.label);
async function table() {
  const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/thief/Wenna']));
  const r = new Runner(journey.session), c = journey.session.campaign;
  const s = await RunnerFind.act(r, r.said(), /^Into the Stone Horn/);
  return { r, c, s, engaged: () => ScreenModel.build(c).engaged?.id };
}
// One trick by the hand's own rows: watch her hands until she is caught, then play it straight.
async function trick(r: Runner, s: Said): Promise<Said> {
  const move = rows(s).some(l => /^Play the trick straight, now/.test(l)) ? /^Play the trick straight, now/
    : /^Watch her hands/;
  return RunnerFind.act(r, s, move);
}
describe('a hand at the window table', () => {
  it('is sat down to for a penny, is the whole frame while dealt, and ends in two tricks, told and kept', async () => {
    const { r, s: at, engaged } = await table();
    expect(rows(at)).toContain('Take the fiddle down from over the settle');
    expect(rows(at).some(l => /^Sit down across from Morwen Ashlock .*a penny a hand/.test(l))).toBe(true);
    const coin = at.purse!.coin;
    let s = await RunnerFind.act(r, at, /^Sit down across from Morwen Ashlock/);
    expect(s.scene.lines.join(' ')).toContain('Best of three tricks. I cheat.');
    expect(s.purse!.coin).toBe(coin - 1);
    expect(engaged()).toMatch(/_cards$/);
    // The hand alone: its three moves and laying down, the doors out; nothing else of the room, and no wait.
    const dealt = rows(s);
    const moves = [/^Play the trick straight, and hope/, /^Watch her hands/, /^Cheat back/, /^Lay your cards down/];
    for (const move of moves) { expect(dealt.some(l => move.test(l))).toBe(true); }
    expect(dealt.some(l => /fiddle|Haggle|^Buy |^Read |^Wait|^Search/.test(l))).toBe(false);
    for (let tricks = 0; tricks < 3 && engaged(); tricks++) { s = await trick(r, s); }
    expect(engaged()).toBeUndefined();
    const told = s.scene.lines.join(' ');
    const won = /counts two pennies back/.test(told);
    expect(won || /puts the penny in her apron/.test(told)).toBe(true);
    expect(s.purse!.coin).toBe(won ? coin + 1 : coin - 1);
    if (won) { expect(told).toContain('forty years of fog'); }
    // The room comes back, and she knows the company for a hand played out.
    expect(rows(s)).toContain('Take the fiddle down from over the settle');
    expect((await RunnerFind.act(r, s, /^Talk to Morwen Ashlock/)).scene.lines.join(' '))
      .toContain('Back for your buttons');
  }, 240000);

  it('is laid down for the penny, or walked out on and remembered', async () => {
    const laid = await table();
    let s = await RunnerFind.act(laid.r, laid.s, /^Sit down across from Morwen Ashlock/);
    s = await RunnerFind.act(laid.r, s, /^Lay your cards down/);
    expect(s.scene.lines.join(' ')).toContain('Knowing when is most of it');
    expect(laid.engaged()).toBeUndefined();
    const out = await table();
    s = await RunnerFind.act(out.r, out.s, /^Sit down across from Morwen Ashlock/);
    s = await RunnerFind.act(out.r, s, /^Out to the landing/);
    expect(out.engaged()).toBeUndefined();
    s = await RunnerFind.act(out.r, s, /^Into the Stone Horn/);
    expect((await RunnerFind.act(out.r, s, /^Talk to Morwen Ashlock/)).scene.lines.join(' '))
      .toContain('You left a hand on my table');
  }, 240000);

  it('may be cheated at, hand after hand, and a cheat caught is never dealt in again', async () => {
    const { r, s: at, engaged } = await table();
    let s = at;
    // Hand after hand, cheating every trick, until she catches it or the purse is out.
    for (let hands = 0; hands < 6 && rows(s).some(l => /^Sit down across from Morwen Ashlock/.test(l)); hands++) {
      s = await RunnerFind.act(r, s, /^Sit down across from Morwen Ashlock/);
      for (let tricks = 0; tricks < 2 && engaged(); tricks++) { s = await RunnerFind.act(r, s, /^Cheat back/); }
      if (/At my table, I cheat/.test(s.scene.lines.join(' '))) { break; }
      expect(s.scene.lines.join(' ')).toContain('Nobody on the boats ever had the face for it');
    }
    expect(s.scene.lines.join(' ')).toContain('At my table, I cheat');
    expect(engaged()).toBeUndefined();
    expect(rows(s).some(l => /^Sit down across from Morwen Ashlock/.test(l))).toBe(false);
  }, 300000);
});

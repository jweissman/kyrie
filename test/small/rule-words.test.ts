import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import { RuleWords } from '../../src/narrative/rule-words';

// The world's words, told against the record of what has been told: a rule that says the same thing every morning
// (the bell on the east point, nine times in eight walks: the boredom census, BO-09) is told the first time, held back
// as heard already for a few days after (CampaignEvent.unsaid), then told again; across a save as in the same game.
// One whose author wrote it lines for after the first time (`again`) says them. A yard where a bell rings each first
// light and a cock crows each dawn in words of its own after the first.
const world = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation rung(). Relation crowed().
  Rule bell heard at yard when hour(clock) >= 6 and hour(clock) < 12 and not rung()
    says "From the east point the bell begins." { Assert rung(). }
  Rule bell_rested when hour(clock) >= 12 and rung() { Retract rung(). }
  Rule cock heard at yard when hour(clock) >= 6 and hour(clock) < 12 and not crowed()
    says "A cock crows." again "The cock again." { Assert crowed(). }
  Rule cock_rested when hour(clock) >= 12 and crowed() { Retract crowed(). }
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const kept = (s: PlaySession) => PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as ReturnType<PlaySession['checkpoint']>);
// Each day waited through, to dark, to first light and on past noon: what the world's words were told as that day.
async function mornings(session: PlaySession, n: number): Promise<string[][]> {
  const out: string[][] = [];
  for (let i = 0; i < n; i++) {
    const day: string[] = [];
    for (const wait of ['wait_for_dark', 'wait_for_light', ...Array(7).fill('wait_hour')] as string[]) {
      if (!session.campaign.offered().some(a => a.id === `${wait}(party)`)) { continue; }
      day.push(...RuleWords.said(await session.leg(`${wait}(party)`)).map(p => p.text));
    }
    out.push(day);
  }
  return out;
}

describe('the world\'s words, told', () => {
  it('are told the first morning, held back for days after, then told again', async () => {
    const t = await Tiny.start(world, { party }), told = await mornings(t.session, 5);
    const bells = told.map(m => m.filter(l => l.includes('bell')).length);
    expect(bells[0]).toBe(1);
    expect(bells.slice(1, 3)).toEqual([0, 0]);
    expect(bells.slice(3).some(n => n > 0)).toBe(true);
    // Held back, they are kept as heard: the event says which, and the world went on as it does.
    const held = t.campaign.history.filter(e => e.unsaid?.length);
    expect(held.length).toBeGreaterThan(0);
    expect(held.every(e => (e.perceptions ?? []).some(p => e.unsaid!.includes(p.id)))).toBe(true);
  });
  it('say the lines their author wrote for after the first time', async () => {
    const t = await Tiny.start(world, { party });
    const told = (await mornings(t.session, 3)).map(m => m.filter(l => /cock/i.test(l)));
    expect(told.map(m => m.join(''))).toEqual(['A cock crows.', 'The cock again.', 'The cock again.']);
  });
  it('go on from what was told in a game kept and opened again, as the same game does', async () => {
    const t = await Tiny.start(world, { party });
    await mornings(t.session, 1);
    const again = kept(t.session);
    expect(await mornings(again, 2)).toEqual(await mornings(t.session, 2));
  });
});

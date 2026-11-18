import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import type { CampaignEvent } from '../../src/campaign/campaign';
import { Voice } from '../../src/narrative/voice';

// The day's turn as a wait comes to it is told by the voice tables (data/voice/day.json), by where the company waits
// and the sky, and not as it was told last while another line fits: "The sky greys, then lightens. It is morning."
// had been told every morning, 23 times in eight walks (the boredom census, BO-08). What was told is the campaign's
// record (CampaignEvent.voiced), so a game kept and opened again goes on from it; and it is told once, as what the
// wait came to. A yard out of doors and a cellar under the ground.
const world = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place cellar "the cellar" is room at 1, 0 underground.
  Passage stair "a stair" is path between yard and cellar.
  Company party "You" of 1 at yard.
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const day = (e: CampaignEvent) => (e.voiced ?? []).find(v => v.kind.startsWith('day-'));
const id = new Map(Voice.tables.flatMap(t => t.lines).map(l => [l.text, l.id]));
// Days waited out in a game, to dark and to first light, by its session; what each was told as.
async function days(session: PlaySession, n: number): Promise<{ dawns: string[]; dusks: string[] }> {
  const out = { dawns: [] as string[], dusks: [] as string[] };
  for (let i = 0; i < n; i++) {
    for (const [wait, into] of [['wait_for_dark', out.dusks], ['wait_for_light', out.dawns]] as const) {
      const act = `${wait}(party)`;
      if (session.campaign.offered().some(a => a.id === act)) { into.push(day(await session.leg(act))?.text ?? ''); }
    }
  }
  return out;
}
const kept = (s: PlaySession) => PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as ReturnType<PlaySession['checkpoint']>);

describe('the day\'s turn, told', () => {
  it('is not told the same morning twice, nor the same dusk twice running, out of doors', async () => {
    const t = await Tiny.start(world, { party }), { dawns, dusks } = await days(t.session, 5);
    expect([dawns.length, dusks.length]).toEqual([5, 5]);
    expect([...dawns, ...dusks].every(l => id.get(l)?.startsWith('day-'))).toBe(true);
    // The yard's sky has its lines, and the open air two more: five mornings, five lines.
    expect(new Set(dawns).size).toBe(5);
    expect(dusks.every((d, i) => !i || d !== dusks[i - 1])).toBe(true);
  });
  it('is told once, as what the wait came to, not beside the old words', async () => {
    const t = await Tiny.start(world, { party });
    await t.perform('wait_for_dark(party)');
    await t.perform('wait_for_light(party)');
    const line = day(t.campaign.history.at(-1)!)!.text, page = (t.leaf.exchange?.lines ?? []).map(l => l.text);
    expect(page.filter(l => l.includes(line))).toHaveLength(1);
    if (line !== 'The sky greys, then lightens. It is morning.') { expect(page.join(' ')).not.toContain('The sky greys'); }
  });
  it('goes on from what was told in a game kept and opened again, as the same game does', async () => {
    const t = await Tiny.start(world, { party }), first = await days(t.session, 2), again = kept(t.session);
    const on = await days(t.session, 2), resumed = await days(again, 2);
    expect(resumed).toEqual(on);
    expect(on.dawns.filter(l => first.dawns.includes(l))).toEqual([]);
  });
  it('under the ground has no sky', async () => {
    const t = await Tiny.start(world, { party });
    await t.play('Down to the cellar');
    const { dawns, dusks } = await days(t.session, 2);
    expect(dawns.length + dusks.length).toBeGreaterThan(0);
    expect([...dawns, ...dusks].every(l => /\.underground\./.test(id.get(l) ?? ''))).toBe(true);
  });
});

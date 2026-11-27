import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { PlayerRevision } from '../../src/presentation/player-revision';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerView } from '../../src/presentation/player-view';
import { Knowing } from '../../src/presentation/knowing';
import { SkillReading } from '../../src/presentation/skill-reading';
import { CoinReading } from '../../src/presentation/coin-reading';
import { RefusalReading } from '../../src/presentation/refusal-reading';
import type { Campaign } from '../../src/campaign/campaign';

// One player revision (OR-740's first slice): one value for a campaign as it stands, which the frame, what is
// perceived, the knowledge door and what is withheld (a skill lacked, coin short, a service refused) each read, in
// place of a key of their own. Two readers of one revision read one value; a changed world or log is a new revision,
// and every reading is worked out again for it; two campaigns never share one; and what is kept is what would be
// worked out afresh, at every place of the arrivals track (test/player-revision-oracle holds the golden walk and a
// journey to the same).
const readings = (c: Campaign) => ({ frame: PlayerFrame.of(c), seen: PlayerView.observe(c), knowing: Knowing.of(c),
  skills: SkillReading.read(c), coin: CoinReading.read(c), refused: RefusalReading.read(c) });
const plain = (c: Campaign) => {
  const r = readings(c), k = r.knowing;
  return { rows: r.frame.rows, seen: r.seen, inView: [...k.inView], present: [...k.present], visited: [...k.visited],
    skills: { uses: [...r.skills.uses], wanting: r.skills.wanting }, coin: r.coin, refused: r.refused };
};
const afresh = <T>(f: () => T): T => {
  PlayerRevision.keeping = false;
  try { return f(); } finally { PlayerRevision.keeping = true; }
};
describe('a player revision', () => {
  it('is one value for every reader while nothing of it changes', async () => {
    const c = (await Arrivals.start()).campaign, revision = PlayerRevision.of(c);
    const once = readings(c), again = readings(c);
    expect(PlayerRevision.of(c)).toBe(revision);
    expect(once.frame.revision).toBe(revision);
    for (const k of Object.keys(once) as (keyof typeof once)[]) { expect(again[k]).toBe(once[k] as never); }
    expect(once.seen.choices.every((choice, i) => choice === once.frame.rows[i]!.choice)).toBe(true);
  });
  it('does not ask for offers again on an unchanged between-command revision', async () => {
    const c = (await Arrivals.start()).campaign, offered = c.offered.bind(c);
    let calls = 0;
    c.offered = () => { calls++; return offered(); };
    const revision = PlayerRevision.of(c), made = calls;
    expect(PlayerRevision.of(c)).toBe(revision);
    expect(calls).toBe(made);
    c.fighting = true;
    PlayerRevision.of(c);
    expect(calls).toBe(made + 1);
  });
  it('is a new revision, and its readings new, where the world or the log changes', async () => {
    const s = await Arrivals.start(), c = s.campaign, before = readings(c), revision = PlayerRevision.of(c);
    Arrivals.returning(s);
    const world = PlayerRevision.of(c), after = readings(c);
    expect(world).not.toBe(revision);
    for (const k of Object.keys(before) as (keyof typeof before)[]) { expect(after[k]).not.toBe(before[k] as never); }
    await s.leg(Arrivals.way(s, 'p1'));
    const moved = PlayerRevision.of(c);
    expect(moved).not.toBe(world);
    // The log's last entry written again, the world as it was: what is perceived (the chronicle) turns on it.
    const seen = PlayerView.observe(c);
    c.amend({ ...c.history.at(-1)! });
    expect(PlayerRevision.of(c)).not.toBe(moved);
    expect(PlayerView.observe(c)).not.toBe(seen);
    expect(PlayerView.observe(c)).toEqual(seen);
  });
  it('is never shared between campaigns', async () => {
    const a = (await Arrivals.start()).campaign, b = (await Arrivals.start()).campaign;
    const ra = PlayerRevision.of(a), rb = PlayerRevision.of(b);
    expect(ra).not.toBe(rb);
    expect(ra.campaign).toBe(a);
    expect(rb.campaign).toBe(b);
    expect(PlayerFrame.of(a).campaign).toBe(a);
    expect(PlayerFrame.of(b)).not.toBe(PlayerFrame.of(a));
    expect(Knowing.of(b)).not.toBe(Knowing.of(a));
  });
  it('keeps what would be worked out afresh, at every place of the track', async () => {
    const s = await Arrivals.start(), c = s.campaign;
    for (const passage of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12']) {
      const kept = plain(c), fresh = afresh(() => plain(c));
      expect(fresh).toEqual(kept);
      expect(afresh(() => PlayerRevision.of(c))).not.toBe(afresh(() => PlayerRevision.of(c)));
      await s.leg(Arrivals.way(s, passage));
    }
  });
});

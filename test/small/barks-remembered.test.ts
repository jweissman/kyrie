import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Barks } from '../../src/narrative/barks';
import { Battle } from '../../src/battle';
import { CombatTelling } from '../../src/ui/combat-telling';

// What a companion says in a fight is remembered past it (CL-37: "Gesk sneers: 'Pathetic.'" in three fights running):
// the lines said are kept in the campaign's record of what has been told (CampaignEvent.voiced, kind bark), and a
// line said in the fights just before (Barks.interval) is not said again, in the fight after a save as in the next;
// another of its kind, or nothing, is said instead. Three dens of rats in a row, a company of three, a save between.
const dens = [0, 1, 2].map(i => `
  Place den${i} "the ${['first', 'second', 'third'][i]} den" is room at ${i + 1}, 0 outdoors.
  Person rats${i} "the rats" at den${i} { Role "rats, fat and bold". Species rat. Numbers 6. Level 1. Lair den${i}. }`)
  .join('');
const world = `${dens}
  Passage p1 "a path" is path between den0 and den1.
  Passage p2 "a path" is path between den1 and den2.
  Company party "You" of 3 at den0.
  Goal false.`;
const party = ['Aud', 'Bera', 'Cole'].map(name => ({ name, raceId: 'human' as const, classId: 'warrior' as const }));
interface Fight { ids: string[]; texts: string[]; told: string }

// Each den's rats fought in turn, the game kept and opened again after each; what each fight's barks were, as the
// record keeps them and as its telling says them.
async function fights(remember = true): Promise<Fight[]> {
  const heard = Battle.prototype.heard;
  if (!remember) { Battle.prototype.heard = () => undefined; }
  try {
    let session = (await Tiny.start(world, { horizon: ['inhabitants'], party })).session;
    const out: Fight[] = [];
    for (const i of [0, 1, 2]) {
      const choices = () => Journey.of(session, true).choices();
      let battle: Battle | undefined;
      const attack = choices().find(c => /^attack\(/.test(c.command))!.command;
      const event = await session.leg(attack, b => { battle = b; return PlaySession.auto(b); });
      const barks = (event.voiced ?? []).filter(v => v.kind === 'bark');
      const told = battle ? CombatTelling.exchanges(battle.events, battle.state).map(t => t.text).join(' ') : '';
      out.push({ ids: barks.map(v => v.id), texts: barks.map(v => v.text), told });
      session = PlaySession.resume(JSON.parse(JSON.stringify(session.checkpoint())) as ReturnType<PlaySession['checkpoint']>);
      const on = choices().find(c => c.command.includes(`den${i + 1})`));
      if (on) { await session.leg(on.command); }
    }
    return out;
  } finally { Battle.prototype.heard = heard; }
}

describe('a companion\'s barks, across fights', () => {
  it('are not said again within their interval, across a save, and are said as the record keeps them', async () => {
    const fought = await fights();
    expect(fought.flatMap(f => f.ids).length).toBeGreaterThan(2);
    const said = fought.flatMap(f => f.ids);
    // Fewer than the interval in all: none said twice.
    expect(said.length).toBeLessThan(Barks.interval);
    expect(new Set(said).size).toBe(said.length);
    // Each line kept is one the fight's telling says (where the company was asked: every turn here is played for it).
    for (const f of fought) { for (const text of f.texts) { expect(f.told).toContain(text); } }
  });
  it('had been said again in the next fights without the record, and the same fights say the same', async () => {
    const forgetting = (await fights(false)).flatMap(f => f.ids);
    expect(new Set(forgetting).size).toBeLessThan(forgetting.length);
    expect((await fights()).map(f => f.ids)).toEqual((await fights()).map(f => f.ids));
  });
  it('are said again once out of the interval', () => {
    const told = Array.from({ length: Barks.interval + 1 }, (_, i) => ({ id: `line${i}`, kind: 'bark' }));
    expect(Barks.before([{ id: 'greet.1', kind: 'greet' }, ...told])).toEqual(told.slice(1).map(v => v.id));
  });
});

import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { Beside } from '../src/campaign/beside';
import type { Campaign } from '../src/campaign/campaign';
import { Gauntlet } from './support/gauntlet';
import { AsMeant } from './support/as-meant';

// The danger on the representative route (CP-18; S3-0: the warrior's drove route met seven of eight beats in 34 turns,
// with no fight and no risk, the gate-well only dark). By night a conger comes up the sea-gate's chain into the
// gate-well, where the pawl lies: heard from the gatehouse before anyone goes down, warning in the well, and coming at
// whoever stays to search the silt. The route's own lines (golden/warrior-lines.txt), by act id: Wenna and Carlin come
// to the gatehouse at half past ten at night. By day it is down in the sluice, and the weir's mage, who goes down at a
// quarter to nine in the morning, meets nothing (cold play 5). Its odds are held as the weir's are
// (test/weir-mage-odds): fought 200 times from where the company stands, by the game's own tactics.
const lines = readFileSync('doc/architecture/mission-22/golden/warrior-lines.txt', 'utf8').split('\n').filter(Boolean);
const conger = 'gate__conger', trials = 200;
const text = (s: Said) => s.scene.lines.join(' ');
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
class Odds {
  static won(c: Campaign, ours: string[]): number {
    const read = c.readout, foes = Beside.members(c.world, read.inhabitants, conger)
      .map(id => read.creatures.find(x => x.id === id)!), us = ours.map(id => read.creatures.find(x => x.id === id)!);
    return Array.from({ length: trials }, (_, i) => Gauntlet.fought(Gauntlet.between(c.catalog, us, foes, `conger-${i}`)))
      .filter(f => f.won).length / trials;
  }
}
describe('the conger in the gate-well, on the warrior\'s route', () => {
  let r: Runner, c: Campaign;
  const at: Said[] = [];
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    r = new Runner(journey.session); c = journey.session.campaign;
    for (const line of lines.slice(0, 43)) {
      const s = await AsMeant.ask(r, line);
      at.push('error' in s ? at.at(-1)! : s);
    }
    // Warned in the well, the company answers the conger, not the silt (OR-163: Engaged offers no search while a
    // threat stands): it stands its ground where the route searched, and the conger comes on.
    const stand = at.at(-1)!.offer.primary.concat(at.at(-1)!.offer.rest).find(o => o.label === 'Stand your ground')!;
    at.push(said(await r.ask(JSON.stringify({ act: stand.id }))));
  }, 120000);
  it('is heard from the gatehouse before anyone goes down, and warns in the well', () => {
    expect([at[39]!.at, text(at[39]!)]).toEqual(['gate__gatehouse', expect.stringContaining(
      'Something big is feeding in the gate-well')]);
    expect([at[41]!.at, at[41]!.moment]).toEqual(['gate__well', 'arrive']);
    expect(text(at[41]!)).toContain('A grey back as long as you are rolls past the chain');
  });
  it('comes at whoever stays in the well, and the pawl is there under the silt once it is fought', async () => {
    const fight = at[43]!;
    expect([fight.moment, fight.scene.lines[0]]).toEqual(['fight',
      'The conger comes at you out of the silt, its jaws wide.']);
    expect(fight.offer.primary.map(o => o.id)).toContain('fight:melee:gate__conger_person');
    let s = fight;
    for (let n = 0; s.moment === 'fight' && n < 40; n++) { s = said(await r.ask('{"act":"fight:auto"}')); }
    expect(text(s)).toContain('The fight is won.');
    // Its coming is told as the fight begins, never again after it is won (GR-05, S3-0's warrior step 43).
    expect(text(s)).not.toContain('comes at you out of the silt');
    // The search it broke off, made again; then the pawl taken, as the route took it.
    expect(text(said(await r.ask(lines[43]!)))).toContain('under the silt, a curved bar of iron');
    expect(text(said(await r.ask(lines[44]!)))).toContain('pawl');
    // Dead, it feeds no more: the gatehouse above says the windlass as by day (GR-04, S3-0's warrior step 46).
    const up = said(await r.ask('{"act":"go(gate__well_ladder,gate__gatehouse)"}'));
    expect([up.at, text(up)]).toEqual(['gate__gatehouse', expect.not.stringContaining('Something big is feeding')]);
    expect(text(up)).toContain('a windlass of black oak');
  }, 60000);
  // Fair for the company the route has, and a real risk alone: one conger, as the undertown sets one of each for a
  // company of one. Level 5 (an eel's hit die is a d4): Wenna alone wins 180 of 200 (90 %), with Carlin all 200;
  // at level 2 alone had won 195, no risk to speak of.
  it('is won by Wenna alone most times, and by Wenna and Carlin nearly always', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const fresh = journey.session.campaign, ids = fresh.readout.partyIds;
    const there = { kind: 'call' as const, name: 'at', args: [conger, 'gate__well'] };
    fresh.commitWorld(fresh.world.apply([{ kind: 'assert', call: there }]));
    expect(Beside.members(fresh.world, fresh.readout.inhabitants, conger)).toHaveLength(1);
    const alone = Odds.won(fresh, ids.slice(0, 1)), both = Odds.won(c, c.readout.partyIds);
    expect(alone).toBeGreaterThanOrEqual(0.8);
    expect(alone).toBeLessThanOrEqual(0.96);
    expect(both).toBeGreaterThanOrEqual(0.9);
  }, 60000);
  it('is down in the sluice by day: the weir\'s mage goes down at a quarter to nine and meets nothing', async () => {
    const cold5 = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const mage = new Runner(journey.session);
    let s: Said | undefined;
    for (const line of cold5.slice(0, 10)) { const x = await AsMeant.ask(mage, line); if (!('error' in x)) { s = x; } }
    expect(journey.session.campaign.world.one('at', conger)).toBeUndefined();
    expect(s!.moment).not.toBe('fight');
    expect(text(s!)).not.toContain('conger');
  }, 60000);
});

import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// Gosse's Company, broad pass (doc/imbar/adventures/gosses-company.md): the company's callings speak in Pentrice, a
// cleric may say the office for the lamplighter alone or before his son, and a playbill comes up from the south.
const build = (name: string) => `test/fixtures/gosse/${name}.campaign.json`;
const p = (id: string) => `pentrice__${id}`;
class Pent {
  static async start(campaign: string, seed = 'g1') { return new Pent(await Journey.start(campaign, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(a => a === 'party' ? a : p(a))); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  // Sets a scene directly: who is where, and what is so. `canon` facts and `knows` keep their own names.
  stage(...facts: [string, ...string[]][]) {
    type Staged = { world: { one(r: string, a: string): string | undefined; apply(c: Change[]): unknown }; commit(w: unknown): void };
    const c = this.j.campaign as unknown as Staged;
    const id = (a: string) => a === 'party' || a.startsWith('slack') || a.startsWith('remainder') ? a : p(a);
    const changes: Change[] = facts.flatMap(([name, ...args]): Change[] => {
      const rel = name === 'knows' || name === 'befell' ? name : p(name);
      if (name !== 'at') { return [{ kind: 'assert', call: ModuleWriter.call(rel, ...args.map(id)) }]; }
      const was = c.world.one('at', id(args[0]!));
      return [...(was ? [{ kind: 'retract', call: ModuleWriter.call('at', id(args[0]!), was) } as Change] : []),
        { kind: 'assert', call: ModuleWriter.call('at', id(args[0]!), id(args[1]!)) }];
    });
    c.commit(c.world.apply(changes));
    return this;
  }
}
const wait = 'Wait › A while';

describe("Gosse's Company: the company speaks", () => {
  it('lints', async () => {
    const f = await KyrLint.campaign('data/campaigns/gosses-company.campaign.json', new NodeBundleSource());
    expect(f.filter(x => x.level === 'error')).toEqual([]);
  }, 60000);

  it('each calling hears its own thing in its own place', async () => {
    const cases: [string, string, string, RegExp][] = [
      ['player', 'wheel', 'heardWheel', /left-hand corner of the stage/],
      ['cleric', 'nave', 'heardPlate', /rag-polish in the lettering/],
      ['thief', 'office_hall', 'heardLock', /the Master's is the cheap one/],
      ['warrior', 'bear_pen', 'heardDogs', /Watch Bowle's left hand/],
      ['ranger', 'weir_stones', 'heardWeir', /keeps the crossing the way a farmer keeps a gate/],
      ['mage', 'under_stage', 'heardStep', /carry a whisper up to the last row/],
    ];
    for (const [who, where, flag, text] of cases) {
      const g = await Pent.start(build(who));
      g.stage(['at', 'party', where]);
      await g.play(wait);
      expect(g.holds(flag, 'party')).toBe(true);
      expect(g.page).toMatch(text);
    }
  }, 240000);
});

describe("Gosse's Company: the requiem", () => {
  const lamplighter = (g: Pent) => g.stage(['at', 'party', 'nave'], ['knows', 'party', 'plate_read']);

  it('said alone, the office finds the Eighth Ordinance in the plate and costs nothing but an hour', async () => {
    const g = await Pent.start(build('cleric'));
    lamplighter(g);
    await g.play(wait);
    expect(g.j.offers('the office for Abel Tunstall the lamplighter, aloud')).toBe(false);
    await g.play('the office for Abel Tunstall the lamplighter at the plate, alone');
    expect(g.holds('requiemAlone', 'party')).toBe(true);
    expect(g.j.holds('knows', 'party', p('ordinance_dead'))).toBe(true);
    expect(g.holds('tunstallMourned', 'pentrice')).toBe(false);
    expect(g.j.offers('the office for Abel Tunstall')).toBe(false);
  }, 120000);

  it('said before his son, it is a gift: the seal, the Master a little warmer, and a man who cannot be bribed', async () => {
    const g = await Pent.start(build('cleric'));
    lamplighter(g);
    g.stage(['at', 'tunstall', 'nave']);
    const before = g.measure('clemTrust', 'clemency');
    await g.play('the office for Abel Tunstall the lamplighter, aloud');
    expect(g.holds('requiemAloud', 'party')).toBe(true);
    expect(g.holds('tunstallMourned', 'pentrice')).toBe(true);
    expect(g.measure('clemTrust', 'clemency')).toBe(before + 1);
    expect(g.j.holds('holding', 'party', 'lamplighter_seal')).toBe(true);
    expect(g.j.offers('the office for Abel Tunstall the lamplighter at the plate, alone')).toBe(false);
    // Nobody but a cleric is offered either.
    const t = await Pent.start(build('thief'));
    lamplighter(t);
    await t.play(wait);
    expect(t.j.offers('the office for Abel Tunstall')).toBe(false);
  }, 120000);

  it('Tunstall polishes the plate at six of a morning', async () => {
    const g = await Pent.start(build('cleric'));
    await g.play('=132');
    expect(g.j.campaign.world.one('at', p('tunstall'))).toBe(p('nave'));
  }, 120000);
});

describe("Gosse's Company: a playbill from the south", () => {
  it('Inchbald has it only once a ship has come out of a cellar somewhere in the world', async () => {
    const g = await Pent.start(build('player'));
    g.stage(['at', 'party', 'press_room']);
    await g.play(wait);
    expect(g.j.offers('bill he is printing for a company from the south')).toBe(false);
    g.stage(['befell', 'remainder_harboured']);
    await g.play(wait);
    expect(g.j.offers('bill he is printing for a company from the south')).toBe(true);
    await g.play('bill he is printing for a company from the south');
    expect(g.page).toMatch(/THE SHIP THAT CAME LATE/);
    expect(g.j.holds('knows', 'party', p('ship_bill'))).toBe(true);
  }, 120000);
});

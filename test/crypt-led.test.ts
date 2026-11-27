import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Outmatched } from '../src/presentation/outmatched';
import { Undertakings } from '../src/presentation/undertakings';
import { Glanced } from './support/glanced';

// The owner's play of 11 November: "Lay the dead in the crypt under the churchyard, and find out who raised them" led
// to the crypt, and there the page offered the ossuary close by and the churchyard up, neither as the aim's, and
// nothing to do: led to the threshold and abandoned. The dead and the man who raised them are in the ossuary beyond
// the crypt; the aim is toward them, by the churchyard. Come to the crypt, by the stair or back out of the ossuary,
// the way on to them is the aim's, and nothing is led as the aim's that is not (searching the crypt, the churchyard
// behind).
class Crypt {
  static async start() {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, id = (suf: string) => c.module.entities.find(e => e.id.endsWith(suf))!.id;
    // The job taken as it is taken: heard of on the notice (OR-370: a job is asked after only by one who has), and
    // given.
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', id('_u_notice')) },
      { kind: 'assert', call: ModuleWriter.call(`${id('_u_dead_job').replace(/_u_dead_job$/, '_u_given')}`, id('_u_dead_job')) }]));
    // Someone taken along: alone, the dead could end the one who plays, and the page leads to someone to take first
    // (OR-412), which is not what this spec is of.
    const help = Outmatched.help(c)!;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('travelsWith', help, 'party') }]));
    Undertakings.follow(c, c.module.objectives!.find(o => o.id.endsWith('_u_dead_job_aim'))!.id);
    return { s, c, id };
  }
  static aims(g: Glanced): string[] {
    return g.glance.acts.filter(a => a.aspects.includes('undertaking')).map(a => a.label);
  }
}
describe('the dead under the churchyard, followed', () => {
  it('leads to the churchyard, then from the crypt on to the ossuary, and not back into the dead met there', async () => {
    const { s, c, id } = await Crypt.start();
    const put = (place: string) => c.commitWorld(c.world.apply([
      { kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
    put(id('_green'));
    expect(Crypt.aims(Glanced.of(s))).toContain('To the churchyard');
    put(id('_u_crypt'));
    let g = Glanced.of(s);
    const light = g.glance.acts.find(a => a.why === 'dark' && a.command);
    if (light) { await g.perform(light.command!); g = Glanced.of(s); }
    expect(Crypt.aims(g)).toEqual(['To the ossuary']);
    await g.perform(g.glance.acts.find(a => a.label === 'To the ossuary')!.command!);
    g = Glanced.of(s);
    expect(g.screen.place.name).toBe('the ossuary');
    expect(g.screen.people.map(p => p.name).join(' ')).toMatch(/the man with the black candle/);
    const back = g.screen.exits.find(e => e.destination.id === id('_u_crypt'))!;
    await g.perform(back.acts.find(a => a.command)!.command!);
    g = Glanced.of(s);
    // Back out of the ossuary, its dead met there, who could end the one who plays as the company stands: the way
    // back in is not led (OR-412), and the need says what stands between (Guarded); nor is the crypt searched.
    expect(Crypt.aims(g)).toEqual([]);
    expect(g.glance.need?.join(' ')).toMatch(/beyond it, and beyond the company as it is/);
    expect(g.glance.acts.map(a => a.label).join(' | ')).not.toMatch(/Search here/);
    expect(g.glance.acts.filter(a => a.continues)).toEqual([]);
  }, 120000);
});

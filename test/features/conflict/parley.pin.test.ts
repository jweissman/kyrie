import { describe, expect, it } from 'bun:test';
import { Journey } from '../../../src/session/journey';
import { Tiny } from '../../support/tiny';
import { ParleyFixture } from './parley-fixture';

// A band that talks is a problem with more than one answer, each read later (OR-1392, the thinking inhabitants'
// grammar; DeepParley and data/rules/inhabitants.kyr): talked round, it tells of the way it dug when asked; lied to, it
// lets the way slip at once, and after a night falls on the company the next time it is met; warned off, it quits its
// den once the company has gone, which whoever comes by finds empty. The way is hidden until told, or searched for.
// Seeds chosen for the roll each answer needs (each spec says which).
const kyr = ParleyFixture.kyr(), party = [{ name: 'Aud', raceId: 'human', classId: 'bard' }];
const start = (seed: string) => Tiny.start(kyr, { seed, party });
const knows = (t: Tiny) => t.world.related('knows').some(r => r.args[0] === 'party' && r.args[1] === 't__cap_told');
const offered = (t: Tiny) => Journey.of(t.session).choices();
const tunnel = (t: Tiny) => offered(t).some(c => c.command === 'go(t__tun,t__vault)');
describe('Conflict › A band answered more ways than one', () => {
  it('hides the way she dug until she tells of it, or the ossuary is searched', async () => {
    const t = await start('p1');
    await t.perform('go(t__den_hall,t__hall)');
    await t.perform('go(t__hall_bones,t__bones)');
    expect(tunnel(t)).toBe(false);
    await t.perform('search(t__bones)');
    expect(knows(t)).toBe(true);
    expect(tunnel(t)).toBe(true);
  });
  it('talked round (seed p1), lets the company be, and tells of the tunnel when asked', async () => {
    const t = await start('p1');
    await t.perform('talk_round(t__cap)');
    expect(knows(t)).toBe(false);
    await t.perform('t__cap_tells');
    expect(knows(t)).toBe(true);
    await t.perform('go(t__den_hall,t__hall)');
    await t.perform('go(t__hall_bones,t__bones)');
    expect(tunnel(t)).toBe(true);
  });
  it('lied to (seed p3), lets the tunnel slip, and after a night falls on the company when it comes back', async () => {
    const t = await start('p3');
    await t.perform('pass_off(t__cap)');
    expect(knows(t)).toBe(true);
    await t.perform('go(t__den_hall,t__hall)');
    for (let i = 0; i < 30 && !t.world.related('seenThrough').length; i++) { await t.perform('wait_hour'); }
    expect(t.world.related('seenThrough').map(r => r.args)).toEqual([['t__cap', 'party']]);
    await t.perform('go(t__den_hall,t__den)');
    expect(t.leaf.exchange!.lines.map(l => l.text)).toContain('The captain comes at you!');
  });
  it('lied to badly (seed p0), falls on the company at once', async () => {
    const t = await start('p0');
    await t.perform('pass_off(t__cap)');
    expect(t.leaf.exchange!.lines.map(l => l.text).join(' ')).toContain('The lie is seen through');
    expect(knows(t)).toBe(false);
  });
  it('warned off (seed p4), quits the den once the company has gone, and the den is found empty', async () => {
    const t = await start('p4');
    await t.perform('face_down(t__cap)');
    expect(t.where('t__cap')).toBe('t__den');
    await t.perform('go(t__den_hall,t__hall)');
    expect(t.where('t__cap')).toBeUndefined();
    await t.perform('go(t__den_hall,t__den)');
    expect(JSON.stringify(t.leaf)).toContain('The den is empty.');
    // And seen at the way onto the level (OR-1449): here, the ossuary.
    await t.perform('go(t__den_hall,t__hall)');
    await t.perform('go(t__hall_bones,t__bones)');
    expect(JSON.stringify(t.leaf)).toContain('No smoke comes from the den now.');
  });
});

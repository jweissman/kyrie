import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A light that dies in the middle of an act says so: torches had gone out mid-wait and nothing said it (R7-01). A
// company's own torch burns only where it is wanted (an unlit place: FieldUse.advance), and lasts about an hour. An
// unlit adit, a torch lit, and an hour sat out; and the same hour on a lit green, where the torch keeps.
const adit = (unlit: boolean) => `
  Place adit "the old adit" is room at 0, 0 underground.
  Company party "You" of 1 at adit.
  ${unlit ? 'Initially Assert unlit(adit).' : ''}
  Goal false.`;

describe('a torch burning out', () => {
  it('is told when it goes out mid-act, in the dark, and keeps where it is not wanted', async () => {
    const dark = await Tiny.start(adit(true));
    await dark.perform('light_item(t__party_1__torch)');
    await dark.perform('wait_hour');
    expect((dark.leaf.exchange?.lines ?? []).map(l => l.text)).toContain('Ama’s torch gutters out.');
    expect(dark.screen.dark).toBe(true);
    const lit = await Tiny.start(adit(false));
    await lit.perform('light_item(t__party_1__torch)');
    await lit.perform('wait_hour');
    expect((lit.leaf.exchange?.lines ?? []).map(l => l.text)).not.toContain('Ama’s torch gutters out.');
  });
});

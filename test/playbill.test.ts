import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Canon } from '../src/canon/canon';

// A paper of a module's own, and a kind that brings what the module says it brings.
describe('a document, and a kind granting the module\'s own capability', () => {
  const probe = 'test/fixtures/probes/playbill/probe.campaign.json';
  // Wapshott's Circus's 12 (WPC-12): a playbill like the glossary of the old script was offered "Equip", and taught
  // the old script; Quittance's pm 10 (QTC-A26): a stamp was read by an action offered in every room.
  it('is carried and read where it is carried, never equipped, and teaches what it says', async () => {
    const j = await Journey.start(probe);
    expect(Canon.items.bill_kind?.slot).toBeUndefined();
    await j.play('a playbill: Take');
    const labels = j.choices().map(c => c.label);
    expect(labels.filter(l => /playbill/i.test(l) && /Equip/.test(l))).toEqual([]);
    await j.play('Pack › A playbill › Read');
    expect(j.latest).toMatch(/Strong Woman will lift a horse/);
    expect(j.holds('knows', 'party', 'bill_read')).toBe(true);
    expect(j.choices().map(c => c.label)).not.toContain('Pack › A playbill › Read');
  }, 60000);
  // The Grand Tour's 9 (GTR-09): `granting` took only the catalog's skills, so breath under the sea was a rule on
  // `holding`; and a kind with nothing to wear it by brought nothing at all.
  it('brings a capability the module declares to whoever carries it', async () => {
    const j = await Journey.start(probe);
    expect(j.choices().map(c => c.label)).not.toContain('To the bottom of the tank');
    await j.play('the brine-glass helm: Take', '^To the bottom of the tank$');
    expect(j.at('party')).toBe('p__pool');
  }, 60000);
});

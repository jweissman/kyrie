import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

// AUT-20, from the Road's F10, Thrume's F2 and The House That Grows' 13: people who go about errands of their own were
// moved by rules (a teleport, or a flag and an announcement); a Peaceable person was thought never to pursue; and a
// peaceable hound of a kind that warns had warned anyway. Someone who goes by the ways and has somewhere to be walks
// there a way at a time, taking each way's time, and can be met on the way; a peaceable one confronts nobody.
describe('one on an errand of their own', () => {
  it('walks there a way at a time, and is seen going', async () => {
    const j = await Journey.start('test/fixtures/probes/errand/probe.campaign.json');
    const where: string[] = [];
    for (let i = 0; i < 8; i++) { await j.play('Wait › A while'); where.push(j.at('p__webb')!); }
    expect([...new Set(where)]).toEqual(['p__yard', 'p__lane', 'p__keld']);
    expect(j.page).toContain('Webb takes the yard gate toward the lane to Keld.');
  }, 30000);
  it('is not warned off by a peaceable hound, whatever its kind', async () => {
    const j = await Journey.start('test/fixtures/probes/errand/probe.campaign.json');
    await j.play('Wait › A while', 'Wait › A while');
    expect(j.holds('warned', 'p__bolt', 'party')).toBe(false);
    expect(j.page).not.toMatch(/Bolt stands its ground|will not have you here/);
  }, 30000);
});

// Quittance's sd 1 (QTC-A31): someone declared in a file another author keeps, with no `Uses go` of their own, is
// given what they go by and how far ahead they plan with the errand itself, and walks six ways to it.
describe('an errand for someone declared elsewhere', () => {
  it('says what they go by and how far ahead they plan', async () => {
    const j = await Journey.start('test/fixtures/probes/errand-elsewhere/probe.campaign.json');
    for (let i = 0; i < 12; i++) { await j.play('Wait › A while'); }
    expect(j.at('p__ianthe')).toBe('p__guild');
  }, 30000);
  it('is written as it was read', () => {
    const m = ModuleParser.parse('Module m "M" { Place a "A" is room. Person i "I" at a { Role "r". } '
      + 'Pursuit p for i priority 5 when true seeks at(i, a) using go planning 14 steps. Goal false. }');
    expect(m.pursuits?.[0]).toMatchObject({ using: ['go'], planning: 14 });
    expect(ModuleWriter.write(m)).toContain('using go planning 14 steps.');
  });
});


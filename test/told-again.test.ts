import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

// Something that happens again and again, a nightly show, was told in full every time unless its author kept a fact
// of having seen it, and wrote two rules (Wapshott's Circus friction 26, WPC-26). A rule says it in full the first
// time the company hears it, and its words for again after that.
describe('a rule told again', () => {
  it('says it in full the first night, and its words for again after', async () => {
    const j = await Journey.start('test/fixtures/probes/told-again/probe.campaign.json', 't');
    await j.play('=20:00');
    expect(j.latest).toContain('The lamps go up, the barker cries the bill');
    await j.play('=day 2 20:00');
    expect(j.latest).toContain('The horses come in again, and the barker cries the bill.');
    expect(j.latest).not.toContain('The lamps go up');
    expect(j.campaign.state.told).toEqual(['p__show']);
  }, 60000);
  it('is written as it was read', () => {
    const m = ModuleParser.parse('Module m "M" { Relation shown(). Rule show when not shown() says "In full." '
      + 'again "Again." { Assert shown(). } Goal false. }');
    expect(m.rules?.[0]).toMatchObject({ say: 'In full.', again: 'Again.' });
    expect(ModuleWriter.write(m)).toContain('says "In full." again "Again."');
  });
});

// A talking creature's repertoire, said in order and round again (Quittance's wk 2, QTC-A35: a parrot that took twenty
// rules and six measures): what follows its again in turn, each `then`.
describe('a repertoire', () => {
  it('is said a line at a time, in order, and round again from its again', async () => {
    const j = await Journey.start('test/fixtures/probes/repertoire/probe.campaign.json', 'r');
    const said: string[] = [];
    for (let i = 0; i < 4; i++) { await j.play('Scratch Fusby'); said.push(j.latest.split('finger. ')[1]!.slice(0, 12)); }
    expect(said).toEqual(['‘Pieces of e', '‘Who’s a pre', '‘Mind the st', '‘Who’s a pre']);
  }, 60000);
  it('is written as it was read', () => {
    const m = ModuleParser.parse('Module m "M" { Relation shown(). Rule show when not shown() says "One." '
      + 'again "Two." then "Three." then "Four." { Assert shown(). } Goal false. }');
    expect(m.rules?.[0]).toMatchObject({ say: 'One.', again: 'Two.', then: ['Three.', 'Four.'] });
    expect(ModuleWriter.write(m)).toContain('says "One." again "Two." then "Three." then "Four."');
  });
});


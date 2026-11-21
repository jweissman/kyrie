import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { WhyProcess } from '../src/cli/why-process';
import { SemanticIds } from '../src/cli/semantic-ids';

// A Route, a Promise and an Occasion survive their lowering as records of their own (MT-30, the language review's
// Phase A; doc/architecture/mission-22/semantic-tracing.md), and `kyrie inspect --why process` answers of each, in
// the author's terms and with no installation's generated name: what is happening, what phase it is in, why it
// advanced, what can affect it, what came of it. Quittance has one of each: Fettiplace's walk to the wake (wk_to), the
// promise to Wragg the sexton (an_wragg_promise), the Hearing of the Five (hearing). The records are the compiler's
// and never saved, so no game moves (the corpus parsed and the games hashed alike before and after: see the note).
const waits = (n: number) => Array.from({ length: n }, () => 'Wait and watch, until something changes');
const declared = ['^To the Declarations Hall', 'Declare yourselves truthfully'];
const wragg = ['^To the Mortmain road', '^To the Mortmain lodge-gate', "^To Annuitants' Row",
  '^To the head of the catacomb stair', '^Promise Wragg'];
async function asked(name: string, steps: string[]): Promise<string[]> {
  const { journey: j } = await PlayTool.start(PlayTool.parse(['data/campaigns/quittance.campaign.json']));
  const r = WhyProcess.found(j.campaign.module, name)[0]!;
  const lines = WhyProcess.report(j, r, await WhyProcess.play(j, steps, r));
  // Nothing in it is the installation's name for a thing (quittance__…): the semantic id is the only name of it.
  expect(lines.filter(l => l.includes('__'))).toEqual([]);
  expect(j.campaign.save().module.semantic).toBeUndefined();
  return lines;
}
describe('a high-level declaration explained as written', () => {
  it('a Route: its legs by the clock, and where it has brought its walker', async () => {
    const lines = await asked('wk_to', [...declared, ...waits(20)]);
    expect(lines[0]).toBe('route wk_to "going up to the wake for the widows\' statements, then going home to write it'
      + ' up" (route:quittance/wk_to), written at data/adventures/quittance/q_wake.kyr:73');
    expect(lines).toContain('  phase now: row: going home to write it up');
    expect(lines.filter(l => / -> /.test(l) && /by the clock/.test(l))).toHaveLength(2);
    expect(lines).toContain('  came of it: before -> wake -> row');
    expect(lines).toContain('  where it has brought them: the Providence counter');
  }, 120000);
  it('a Promise: made by the act that makes it, broken by its own rule, and what breaking it brought', async () => {
    const lines = await asked('an_wragg_promise', [...wragg, ...waits(40)]);
    expect(lines).toContain('  happening: made to Josiah Wragg, sexton of Mortmain');
    expect(lines).toContain('  phase now: broken: broken');
    expect(lines.find(l => /unmade -> standing/.test(l))).toMatch(/by the act "Promise Wragg you will carry/);
    expect(lines.find(l => /standing -> broken/.test(l))).toMatch(/by its own rules an_wragg_promise_broken/);
    expect(lines.find(l => l.startsWith('  affected by:'))).toMatch(/"Give Tench the sexton's register/);
    expect(lines).toContain('  holds of what it brings: an_wragg_cross(party)');
  }, 120000);
  it('an Occasion: its matters taken up and closed, the choices that serve them, and its close', async () => {
    const lines = await asked('hearing', [...declared, ...waits(44)]);
    expect(lines).toContain('  happening: held at the Hall of the Five');
    expect(lines).toContain('  asks: decided(h_tables)');
    expect(lines.find(l => l.startsWith('  phase now:'))).toMatch(/^ {2}phase now: over: The Five rise\./);
    expect(lines.find(l => l.startsWith('  choices serving it:'))).toMatch(/"Rest your case"/);
    expect(lines.find(l => l.startsWith('  came of it:'))).toMatch(/^ {2}came of it: waiting -> .* -> over$/);
  }, 120000);
  it('names every one of the shipped corpus by the id the compatibility snapshot pins', async () => {
    const pinned = JSON.parse(readFileSync('test/fixtures/semantic-ids.json', 'utf8')) as string[];
    expect(await SemanticIds.corpus()).toEqual(pinned);
  }, 120000);
});

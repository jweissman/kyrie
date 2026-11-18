import { describe, expect, it } from 'bun:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SingleModule } from '../../src/campaign/single-module';
import { PlaySession } from '../../src/session/play-session';
import { JourneyCapture, type CapturedRun } from '../../src/cli/journey-capture';
import { JourneyAccount } from '../../src/cli/journey-account';
import { JourneyCompare } from '../../src/cli/journey-compare';
import { JourneyHtml } from '../../src/cli/journey-html';
import { JourneyNotes } from '../../src/cli/journey-notes';
import { ProseProvenance } from '../../src/cli/prose-provenance';

// The journey reader (doc/architecture/mission-22/journey-reader): a journey kept as the player met it, read in order
// by place, its sentences traced to where they were written, a reviewer's notes held to the words they quote, and the
// same acts played again under changed code kept apart from the capture and compared with it.
const yard = `
  Place hythe "Hythe" is settlement.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place byre "the byre" is room within hythe at 1, 0 indoors.
  Passage gate "the byre door" is door between green and byre.
  Company party "You" of 1 at green.
  Observe green_seen at green when true "A green with a well in the middle of it, and geese on the grass.".
  Observe byre_seen at byre when true "Two cows stand in the straw, and the roof leaks over one of them.".
  Goal false.`;
const at = (kyr: string) => PlaySession.start(SingleModule.source(kyr).campaign, 'tiny', SingleModule.source(kyr).source);
const args = ['test-world'];

describe('the journey reader', () => {
  it('keeps each step as it was shown: the choice, where it stood, the scene, and the transcript to it', async () => {
    const run = await JourneyCapture.record(await at(yard), { args, limit: 3, build: { commit: 'test', dirty: false } });
    expect(run.kind).toBe('captured');
    expect(run.opening.scene.prose.join(' ')).toContain('geese on the grass');
    expect(run.steps.length).toBe(3);
    const into = run.steps.find(s => s.said.scene.prose.join(' ').includes('Two cows'));
    expect(into?.label).toMatch(/byre/);
    expect(run.steps.at(-1)!.mark).toBe(run.transcript.steps.length);
  });
  it('reads the journey in order by place, a sentence told again marked with the step it was first told in', async () => {
    const run = await JourneyCapture.record(await at(yard), { args, limit: 3, build: { commit: 'test', dirty: false } });
    const steps = JourneyAccount.steps(run), places = JourneyAccount.places(steps);
    expect(places.map(p => p.name)).toEqual(['the green at Hythe', 'the byre', 'the green at Hythe']);
    const md = JourneyAccount.markdown(run);
    expect(md).toContain('*Captured: what the player was shown when it was played, at test,');
    expect(md).toMatch(/geese on the grass\. †0/);
  });
  it('traces a sentence to its Kyr declaration, a filled template to its blanks, and says where it cannot', () => {
    const p = new ProseProvenance();
    p.add('data/a.kyr', yard);
    p.add('src/b.ts', 'const s = `The ${who} counts the coin twice, and puts it away.`;');
    const seen = p.trace('Two cows stand in the straw, and the roof leaks over one of them.');
    expect(seen).toMatchObject({ how: 'exact', sources: [{ file: 'data/a.kyr', line: 8, decl: 'Observe byre_seen' }] });
    expect(p.trace('The carter counts the coin twice, and puts it away.').how).toBe('template');
    expect(p.trace('You take the key.').how).toBe('none');
  });
  it('holds a note to the words it quotes, and says when a replay no longer shows them', async () => {
    const run = await JourneyCapture.record(await at(yard), { args, limit: 1, build: { commit: 'test', dirty: false } });
    const steps = JourneyAccount.steps(run), dir = mkdtempSync(join(tmpdir(), 'kyrie-reader-'));
    expect(() => JourneyNotes.add(dir, { step: 0, kind: 'diction', quote: 'no such words', note: '' }, steps)).toThrow();
    JourneyNotes.add(dir, { step: 0, kind: 'excess', quote: "and geese on the grass", note: 'say less' }, steps);
    const notes = JourneyNotes.read(dir);
    expect(JourneyHtml.page(run, notes, new ProseProvenance(), 'scene')).toContain('<mark title="excess: say less">');
    const revised: CapturedRun = { ...structuredClone(run), kind: 'replay', policy: 'the acts of captured.json' };
    revised.opening.scene.prose = ['A green with a well in the middle of it.'];
    revised.opening.scene.lines = revised.opening.scene.lines.map(l => l.replace(', and geese on the grass', ''));
    const compared = JourneyCompare.steps(run, revised, notes);
    expect(compared[0]).toMatchObject({ same: false, notes: ['excess: “and geese on the grass” no longer shown'] });
    expect(JourneyCompare.page(run, revised, notes)).toContain('<del>and</del>');
  });
  it('replays the capture\'s acts apart from it, and stops where one is no longer offered', async () => {
    const run = await JourneyCapture.record(await at(yard), { args, limit: 2, build: { commit: 'test', dirty: false } });
    const again = await JourneyCapture.replay(await at(yard), run, 'captured.json', { commit: 'now', dirty: true });
    expect(again).toMatchObject({ kind: 'replay', of: { file: 'captured.json' } });
    expect(again.steps.map(s => s.said.scene.prose)).toEqual(run.steps.map(s => s.said.scene.prose));
    const gone = structuredClone(run);
    gone.steps[0]!.asked = { act: 'no_such_act' };
    expect((await JourneyCapture.replay(await at(yard), gone, 'captured.json')).diverged?.step).toBe(1);
  });
});

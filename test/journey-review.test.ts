import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { JourneyCapture } from '../src/cli/journey-capture';
import { JourneyReview } from '../src/cli/journey-review';
import { ReviewMarkdown } from '../src/cli/review-markdown';
import { ReviewProvenance, type Unit } from '../src/cli/review-provenance';
import { ReviewInspector } from '../src/cli/review-inspector';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerOffer } from '../src/cli/runner-offer';
import type { Campaign } from '../src/campaign/campaign';
import type { JourneyReviewV1 } from '../src/cli/review-types';

// The journey review (the adventure-structure brief §6 and §12, ST-08's Phase A), on the opening of the golden route
// as cold play 6 played it (mission-22/cold/cold-6-lines.txt), an aim followed and a look put in among its lines: the
// review changes nothing of the game, keeps the scene each choice was made from, counts only what is consequential,
// gives the world's own changes to the rules that made them, replays held to the transcript's digests, renders what
// was shown word for word, and leaves unknown what it does not know.
const args = ['--world', 'iscoed', '--as', 'human/warrior/Wenna'];
const cold = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
const lines = ['{"follow":1}', ...cold.slice(0, 5), '{"look":true}', ...cold.slice(5, 14)];
const start = (a: string[]) => JourneyCapture.start(a);
describe('a journey reviewed', () => {
  let review: JourneyReviewV1, plain: (Said | { error: string })[], digests: (string | undefined)[];
  beforeAll(async () => {
    const session = await start(args), runner = new Runner(session);
    plain = [runner.said()];
    for (const line of lines) { plain.push(await runner.ask(line)); }
    digests = session.transcript.steps.map(s => s.digest);
    review = await JourneyReview.observe(await start(args), lines, { args });
  }, 240000);
  it('is the game as it is played unobserved: every line shown, every offer, every digest', () => {
    const shown = plain.map(s => 'error' in s ? s.error : s.scene.lines);
    const kept = [review.frames[0]!.lines.map(l => l.text), ...review.steps.map(s => s.error
      ?? review.frames[s.after!]!.lines.map(l => l.text))];
    expect(kept).toEqual(shown);
    const offered = plain.flatMap(s => 'error' in s ? [] : [[...s.next?.act ? [s.next.act] : [],
      ...s.offer.primary.map(o => RunnerOffer.act(o)), ...s.offer.rest.map(o => RunnerOffer.act(o))]]);
    expect(review.frames.map(f => f.offer.map(o => o.id))).toEqual(offered);
    expect(review.source.transcript.steps.map(s => s.digest)).toEqual(digests);
  });
  it('keeps, before each choice, the scene it was chosen from with the choice in it under its words', () => {
    const acts = review.steps.filter(s => s.chosen?.from !== 'asked' && !s.error);
    expect(acts.length).toBeGreaterThan(10);
    for (const s of acts) {
      const before = review.frames[s.before]!;
      const offered = before.offer.find(o => [o.id, o.row].includes(s.chosen!.command));
      // Chosen in a talk from the place's own acts, which the runner still takes though the talk's question offers
      // only what is said to them (OR-1451: one question for every client; the cold player's kept line runs unchanged).
      if (!offered && before.offer.some(o => /^(take_leave\(|focus:place$)/.test(o.id))) { continue; }
      expect([s.n, offered?.label]).toEqual([s.n, s.chosen!.label]);
    }
    const refused = review.steps.find(s => s.error)!;
    // The cold player's next line, the clerk's question by its own id: asked already by the lead's (drove__clerk#talk,
    // refused until the runner named Doable's rows: MT-18, AT-13).
    expect([refused.chosen?.command, refused.after, refused.chosen?.from])
      .toEqual(['drove__clerk_short_t', undefined, 'not in the scene before']);
    expect([refused.consequential, refused.delta.aims, refused.events])
      .toEqual([false, { taken: [], retired: [] }, []]);
  });
  it('counts consequential steps in order, and not an aim followed nor a look', () => {
    const [followed, ...rest] = review.steps, look = review.steps.find(s => s.line === '{"look":true}')!;
    expect([followed!.consequential, look.consequential, look.chosen?.label]).toEqual([false, false, 'look']);
    expect(followed!.delta.aims.followed?.to).toBeDefined();
    const counted = rest.filter(s => s.consequential).map(s => s.consequence);
    expect(counted).toEqual(counted.map((_, i) => i + 1));
    expect(rest[0]!.consequence).toBe(1);
  });
  it('gives what the world did of its own to the rule that did it, a measure with its values', () => {
    const asked = review.steps.find(s => s.chosen?.command === 'drove__owain_count_t')!;
    const dear = asked.delta.by.find(b => b.source.kind === 'kyr' && b.source.declaration === 'region__s3_dear');
    expect(dear?.source).toMatchObject({ type: 'Rule', via: 'rule fired' });
    expect(dear?.changes).toContain('+ goodsPrice(region__s3_innkeeper, rations) = 3');
    expect(asked.delta.measures).toContainEqual({ measure: 'goodsPrice(region__s3_innkeeper, rations)', before: 2, after: 3 });
    // Owain goes to the pens once the company has left the green, not in the middle of what he asked it (OR-149).
    const owain = review.steps.flatMap(s => s.delta.by).find(b => b.changes.includes('+ at(drove__owain, drove__pens)'));
    expect(owain?.source).toMatchObject({ kind: 'kyr', declaration: 'drove__owain_to_pens', type: 'Rule' });
    expect(asked.delta.by.find(b => b.source.kind === 'kyr' && b.source.via === 'command')?.changes)
      .toContain('+ knows(party, drove__boy_count)');
  });
  it('renders every line as it was shown, word for word, read aloud or inspected', () => {
    const md = ReviewMarkdown.journey(review);
    for (const l of review.frames.flatMap(f => f.lines).filter(x => x.role !== 'heading')) { expect(md).toContain(`> ${l.text}`); }
    const inspected = ReviewInspector.step(review, 2)!;
    for (const l of review.frames[review.steps[1]!.after!]!.lines) { expect(inspected).toContain(l.text); }
    // Led: the aim followed is to ask Owain, and the topic is said to him (GR-03: a topic is its speaker's).
    expect(inspected).toContain('**→** [primary, led, named] Ask Owain how many head came down  `drove__owain_count_t`');
  });
  it('keeps the glance\'s reason for each of the four it led with, and what the world withdrew untaken', () => {
    const pens = review.frames.flatMap(f => f.offer).find(o => o.id === 'go(drove__pens_gate,drove__pens)' && o.led);
    expect([pens?.why, pens?.note]).toEqual(['named', 'your aim']);
    const freed = review.steps.find(s => s.chosen?.command === 'drove__show_drowned(party,drove__customs)')!;
    // Shown to the clerk in his talk, what could be said to him that the world no longer allows (the talk's question,
    // OR-1451: Bran's talk is the place's, not offered beside the clerk's).
    expect(review.frames[freed.after!]!.withdrawn).toContainEqual({ id: 'drove__clerk_fear',
      label: 'Ask Mardle who he counts for' });
    expect(review.frames.filter(f => f.withdrawn).every(f => f.withdrawn!.length)).toBe(true);
  });
  it('knows the Topic that told Owain\'s answer, and the observations of the opening', () => {
    const answer = review.frames[review.steps[1]!.after!]!.lines.find(l => l.text.startsWith('‘Thirty-six,’'))!;
    expect([answer.exact, answer.sources[0]]).toEqual(['exact', { kind: 'kyr', module: 'drove',
      declaration: 'drove__owain_count_t', type: 'Topic', via: 'result' }]);
    expect(review.coverage.prose.exact).toBeGreaterThan(review.coverage.prose.unknown);
  });
  it('replays held to the transcript\'s digests, apart, never touching what it replays', async () => {
    const kept = structuredClone(review), replay = await JourneyReview.replay(review, 'review.json', start);
    expect(review).toEqual(kept);
    expect([replay.source.kind, replay.source.replayedAgainst?.file]).toEqual(['replay', 'review.json']);
    expect(replay.verdicts?.every(v => v.state === 'same' && v.offer === 'same' && v.presentation === 'same')).toBe(true);
    const tampered = structuredClone(review);
    tampered.source.transcript.steps[1]!.digest = 'not-the-world';
    await expect(JourneyReview.replay(tampered, 'tampered.json', start)).rejects.toThrow(/came out otherwise/);
  }, 240000);
});
describe('a line\'s maker', () => {
  const campaign = { module: { observations: [{ id: 'mill_seen' }], rules: [{ id: 'mill_turns' }], objectives: [],
    actions: [], entities: [] }, readout: { partyIds: [], creatures: [] },
    operator: () => undefined } as unknown as Campaign;
  const p = new ReviewProvenance(campaign);
  const unit = (key: string, id: string, relay?: true): Unit => ({ key, source: p.kyr(id, 'test'), ...relay ? { relay } : {} });
  it('is the one producer of the step that made it, or the several in order', () => {
    const units = [unit('The mill stands.', 'mill_seen'), unit('Its wheel turns.', 'mill_turns')];
    expect(p.line('The mill stands.', units).exact).toBe('exact');
    expect(p.line('The mill stands. Its wheel turns.', units).sources.map(s => s.kind === 'kyr' && s.declaration))
      .toEqual(['mill_seen', 'mill_turns']);
  });
  it('stays unknown where no producer of the step made it, though the words are written in the sources', () => {
    const written = 'The smell reaches you before the sight does.';
    expect(readFileSync('data/goings-on/iscoed-drove/situation.kyr', 'utf8')).toContain(written);
    expect(p.line(written, [unit('The mill stands.', 'mill_seen')])).toEqual({ exact: 'unknown',
      sources: [{ kind: 'unknown', reason: 'no producer of this step made it' }] });
  });
  it('is unknown where two producers could each have made it, and a relay gives way to its maker', () => {
    const two = [unit('The mill stands.', 'mill_seen'), unit('The mill stands.', 'mill_turns')];
    expect(p.line('The mill stands.', two).exact).toBe('unknown');
    const relayed = [unit('The mill stands.', 'mill_seen'), unit('The mill stands.', 'mill_turns', true)];
    expect(p.line('The mill stands.', relayed).sources).toEqual([p.kyr('mill_seen', 'test')]);
  });
});

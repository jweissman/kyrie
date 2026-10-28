import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Narration } from '../src/presentation/narration';

// A fight the company chose, then one that came at it straight after, told as one: found in cov2's mine, where the
// company attacked the mud in the haulage way and the Delvers' bone hounds, who had stood their ground, came at it
// when the mud was down. The page told the hounds falling, and not the mud, nor the thief who fell to it. Here the
// rats of the smithy, come into the hounds' haulage way, are attacked there.
describe('two fights in one', () => {
  it('tells the fight the company chose, and the one that came at it after', async () => {
    const w = await WorldAssembler.assemble('cov2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'thief' }] });
    const s = await PlaySession.start(w.path, 'cov2', w.source), way = 'region__w8_haulage_haulage';
    const hounds = 'region__w8_haulage_haulage_dwellers';
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', way) },
      { kind: 'retract', call: ModuleWriter.call('unlit', way) },
      { kind: 'assert', call: ModuleWriter.call('at', 'region__w8_adit_forge_dwellers', way) },
      // The hounds have warned the company off, and their patience is spent.
      { kind: 'assert', call: ModuleWriter.call('warned', hounds, 'party') },
      { kind: 'set', call: ModuleWriter.call('patience', hounds), value: ModuleWriter.number(0) }]));
    const before = PlayerView.observe(s.campaign);
    const attack = PlayerView.choices(s.campaign).find(x => x.choice.name === 'Attack the rats')!;
    const event = await s.perform(attack.choice.id);
    const told = { event, feedback: ActionFeedbackView.read(s.campaign, event, before), said: attack.choice.name,
      moved: false };
    const leaf = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), told);
    const lines = (leaf.exchange?.lines ?? []).map(l => l.text);
    expect(lines.some(l => /^The (first|second|third|fourth) of the rats falls\.$/.test(l))).toBe(true);
    expect(lines.some(l => /bone hounds/.test(l))).toBe(true);
    expect(lines.filter(l => /^The fight is won/.test(l))).toEqual(['The fight is won.']);
  }, 60000);
  // The fight's own page closes as its last blow lands, so the account after it keeps the blow that felled each who
  // fell: the strike on whoever took the damage, and not whatever else came just before (Mabon missing a hound).
  it('keeps the blow that felled each who fell, and not what happened just before it', () => {
    const lines = ['Initiative: Wenna, the first of the pack, Mabon.', 'Mabon misses the first of the pack.',
      'Wenna takes 3 bludgeoning damage (0 HP left).', 'Wenna falls.',
      'Rharash hits the first of the pack (d20 15, needing 9: THAC0 less AC 11 less to-hit 4).',
      'The first of the pack takes 1 slashing damage (0 HP left).', 'The first of the pack falls.',
      'The fight is won.'];
    expect(Narration.tidy(lines, lines.length)).toEqual(['Wenna takes 3 bludgeoning damage (0 HP left).', 'Wenna falls.',
      'Rharash hits the first of the pack.', 'The first of the pack takes 1 slashing damage (0 HP left).',
      'The first of the pack falls.', 'The fight is won.']);
  });
});

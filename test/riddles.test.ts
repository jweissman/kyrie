import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';
import { ScreenModel } from '../src/ui/screen-model';
import { RegionRiddles } from '../src/world/region-riddles';

// A makers' work with a speaking door: Orsino's riddle cut in it, and a row of words, the answer among three wrong
// ones of its kind. A wrong word and the stone breathes cold on whoever pressed it; the right one and the door turns
// and the way in is open. a1 (Merscfaenn) has two such doors.
describe('a riddle at a door', () => {
  it('is answered from a choice of words, and opens only to the right one', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source), module = s.campaign.module;
    const door = module.entities.find(e => /_riddle$/.test(e.id))!, work = door.id.replace(/^region__|_riddle$/g, '');
    const words = module.actions.filter(a => a.id.startsWith(`${door.id}_word`));
    expect(words.length).toBe(4);
    const right = words.find(a => a.success.some(c => c.kind === 'retract'))!, wrong = words.find(a => a !== right)!;
    GeneratedWorld.put(s, work);
    await s.perform('wait');
    const offered = () => PlayerView.choices(s.campaign).map(c => c.choice.id);
    expect(offered().some(id => id.startsWith(`go(region__${work}_in,`))).toBe(false);
    const hp = ScreenModel.build(s.campaign).party[0]!.hp;
    await s.perform(offered().find(id => id.startsWith(`${wrong.id}(`))!);
    expect(ScreenModel.build(s.campaign).party[0]!.hp).toBeLessThanOrEqual(hp);
    expect(offered().some(id => id.startsWith(`go(region__${work}_in,`))).toBe(false);
    const opened = await s.perform(offered().find(id => id.startsWith(`${right.id}(`))!);
    expect(opened.response).toContain('the way in is open');
    expect(offered().some(id => id.startsWith(`go(region__${work}_in,`))).toBe(true);
    expect(offered().some(id => id.startsWith(`${right.id}(`))).toBe(false);
  }, 60000);
});

// Orsino's riddles, read through by an editor (OrsinoWorld.corrected and .repeated): the cold playtest was asked "I
// always was, yet never will be" and had to answer "Tomorrow"; and no world asks the same thing twice in other words.
describe('the riddles a world draws from', () => {
  it('answer as they ask, and none asks what another already does', () => {
    const all = Object.values(RegionRiddles.riddles).flat();
    expect(all.find(r => r.question === 'I always was, yet never will be.')?.answer).toBe('Yesterday');
    for (const answer of ['Light', 'Silence', 'Stamp', 'Cold']) { expect(all.filter(r => r.answer === answer).length).toBe(1); }
    expect(new Set(all.map(r => r.question)).size).toBe(all.length);
  });
});

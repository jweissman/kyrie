import { describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import { PlayerView } from '../src/presentation/player-view';

// Every note says how the company knows it (NAR-12: notes knowing what nobody said): seen, found, read, told by whom,
// found for itself; and only what it knew before it set out is filed so. Played in kite, come home as kin:
// the bridge-foot, Alfric asked, the notice on the well-post read, the bridge, the den. The notice had been filed as
// known before the company set out.
describe('the notes', () => {
  it('say how each thing is known, and file nothing learnt on the way as known before', async () => {
    const g = await Glanced.country('kite'), before = new Set(PlayerView.observe(g.campaign).knowledge.map(k => k.id));
    await g.choose(/,region__s2_green\)$/);
    await g.perform('talk_to(drover__son)');
    await g.perform('drover__son_plan');
    await g.choose(/notice/);
    await g.to('region__s5_s2_way');
    await g.to('region__w11');
    const view = PlayerView.observe(g.campaign), notes = g.screen.knowledge;
    // What it knew from the first: the father gone, and who at the inn would come along.
    expect([...before].sort()).toEqual(['arrival__hire', 'drover__missing']);
    const learnt = view.knowledge.filter(k => !before.has(k.id));
    expect(learnt.length).toBeGreaterThan(2);
    expect(learnt.filter(k => !k.source).map(k => k.id)).toEqual([]);
    expect(notes.filter(n => n.kind === 'known').length).toBe(before.size);
    const notice = notes.find(n => /^A notice on the post by the well/.test(n.text))!;
    expect([notice.kind, /^you saw it, /.test(notice.how)]).toEqual(['seen', true]);
    expect(notes.filter(x => x.kind !== 'known' && !x.how).map(x => x.text)).toEqual([]);
  }, 200000);
});

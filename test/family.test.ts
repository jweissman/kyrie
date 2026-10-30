import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';
import seen from '../data/paintings/seen.json';

// The family of one come home, as play 10 met them: a human mage's brother had been an elf ranger, the town's folk;
// an old man in a window on the landing and a young shepherd once he had joined; the mother a girl cutting a fish,
// greeted in the brother's words and named by her full name ("'What is it?' says Jassin Galanodel").
class Home {
  static async start() {
    const w = await WorldAssembler.assemble('mere', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Maud', raceId: 'dwarf', classId: 'cleric' }] });
    const s = await PlaySession.start(w.path, 'mere', w.source), placed = w.report.placements.find(p => p.scenario === 'drover')!;
    return { w, s, town: placed.bindings.town! };
  }
  static face(s: PlaySession, id: string) {
    return ScreenModel.build(s.campaign).people.find(p => p.id === id)?.portrait?.src;
  }
  static async act(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name) || pattern.test(x.choice.id));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
  static age(src = '') {
    return (seen as unknown as { paintings: Record<string, { age?: string }> }).paintings[/([\w-]+)\.webp$/.exec(src)?.[1] ?? '']?.age;
  }
}

describe('the family of one come home', () => {
  it('are of their people, keep one face, and are named and greeted as family', async () => {
    const { w, s, town } = await Home.start();
    const folk = w.report.region.settlements.find(t => t.id === town)!.folk;
    const son = 'drover__son', member = s.campaign.readout.inhabitants[son]![0]!;
    expect(s.campaign.readout.creatures.find(c => c.id === member)!.raceId).toBe('dwarf');
    expect(folk).not.toBe('dwarf');
    // Their given names are their own, none of the country's people's with a family name to it: play 10's mother was
    // Jassin Galanodel, at the inn where Jassin the charcoal-burner was looking for work.
    const given = (id: string) => s.campaign.module.entities.find(e => e.id === id)!.name.split(', ')[0]!.split(' ')[0]!;
    const others = s.campaign.module.entities.filter(e => e.type === 'group' && !e.id.startsWith('drover__'))
      .map(e => given(e.id));
    expect(['drover__wife', 'drover__son'].filter(id => others.includes(given(id)))).toEqual([]);
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    const met = Home.face(s, son);
    expect(Home.age(met)).not.toBe('old');
    const greeted = await Home.act(s, /^talk_to\(drover__son\)$/);
    await Home.act(s, /what he means to do$/);
    await Home.act(s, /to join the company$/);
    expect(Home.face(s, son)).toBe(met);
    GeneratedWorld.put(s, `${town}_taproom`);
    await s.perform('wait');
    expect(Home.age(Home.face(s, 'drover__wife'))).not.toBe('young');
    const turned = PlayerView.observe(s.campaign), mother = await Home.act(s, /^talk_to\(drover__wife\)$/);
    const line = (e: typeof mother) => (e.voiced ?? []).find(v => v.kind === 'address')!;
    expect(line(mother).id).not.toBe(line(greeted).id);
    expect(line(mother).text).toMatch(/your mother/i);
    // Talked to and left as she is to you: talked to as "your mother", she had been left with "You take your leave of
    // Jassin Galanodel" (M17-93).
    expect(ActionFeedbackView.read(s.campaign, mother, turned).attempt).toBe('Talk to your mother');
    const leaving = PlayerView.observe(s.campaign), left = await Home.act(s, /^take_leave\(drover__wife\)$/);
    expect(ActionFeedbackView.read(s.campaign, left, leaving).attempt).toBe('Take your leave of your mother');
  }, 120000);
  // Thorn's elf mother and son had both been Lia ("Lia the younger"), and a dwarf's mother elsewhere Ulfgar: a family
  // is named by its people's names for their sex, none of the country's people's and not each other's.
  it('names a family by names of their own', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Maud', raceId: 'elf', classId: 'mage' }] });
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    const name = (id: string) => s.campaign.module.entities.find(e => e.id === id)!.name.split(', ')[0]!;
    const [mother, brother] = [name('drover__wife'), name('drover__son')];
    expect(mother).not.toBe(brother);
    expect(brother).not.toMatch(/the younger$/);
    const others = s.campaign.module.entities.filter(e => e.type === 'group' && !e.id.startsWith('drover__'))
      .map(e => e.name.split(', ')[0]!.split(' ')[0]!);
    expect([mother, brother].filter(n => others.includes(n.split(' ')[0]!))).toEqual([]);
  }, 120000);
  // With the company, the brother says what he will do once the cart is behind it, unasked: play 10's thread ended in
  // nothing to do next, the oxen's trail a question nobody thought to put to him.
  it('has the brother speak of the oxen once the cart is behind the company', async () => {
    const { s, town } = await Home.start();
    GeneratedWorld.put(s, `${town}_green`);
    await s.perform('wait');
    await Home.act(s, /^talk_to\(drover__son\)$/);
    await Home.act(s, /what he means to do$/);
    await Home.act(s, /to join the company$/);
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drover__found_cart') }]));
    const told = await s.perform('wait');
    expect((told.perceptions ?? []).map(p => p.text).join(' ')).toMatch(/has said nothing since the ditch/);
    expect(ScreenModel.build(s.campaign).objectives.some(a => /took the drover.s oxen/.test(a))).toBe(true);
  }, 120000);
});

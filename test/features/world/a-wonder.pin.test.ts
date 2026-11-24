import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { PlaySession } from '../../../src/session/play-session';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › A wonder (OR-440; the owner's direction of
// 24 November, §8): a remarkable thing declared in Kyr on the thing itself (`Wonder natural rare for aesthetic "…"`),
// kept apart as the thing (its states), its discovery (a fact known by whoever meets it by a light) and its opportunity
// (its acts, by the ordinary rules); whence, how rare and what for each a fact of its own, never one score; met without
// any quest, and the same on a return and in a replay.
const kyr = (wonder = 'Wonder natural rare for aesthetic, scientific "A seam of pale stone takes in your light.".')
  : string => `
  Place hall "the hall" is room at 0, 0 underground. Place cave "the cave" is room at 1, 0 underground.
  Passage tunnel "the tunnel" is passage between hall and cave.
  Initially Assert unlit(cave).
  Company party "You" of 1 at hall.
  Thing seam "the seam of starstone" at cave {
    State dull "A seam of pale stone runs through the wall.".
    State kindled "The seam glows of itself.".
    Change kindle "Hold your light to the seam" from dull to kindled when not benighted(party) "Too dark.".
    ${wonder}
  }
  Rule seam_lights when state(seam, kindled) and unlit(cave) { Retract unlit(cave). }`;
const holds = (t: Tiny, name: string, ...args: string[]) => t.world.test(ModuleWriter.call(name, ...args));
describe('World › A wonder', () => {
  it('is the thing, whence it comes, how rare and what for, each a fact of its own', async () => {
    const t = await Tiny.start(kyr());
    expect([holds(t, 'wonder', 't__seam', 't__seam__wonder'), holds(t, 'marvel', 't__seam')]).toEqual([true, true]);
    expect([holds(t, 'wonderFrom', 't__seam', 'from_natural'), holds(t, 'wonderRarity', 't__seam', 'rarity_rare')])
      .toEqual([true, true]);
    expect(t.world.related('wonderFor').map(f => f.args[1])).toEqual(['for_aesthetic', 'for_scientific']);
    // No one knows it before it is met; nothing leads to it.
    expect(holds(t, 'knows', 'party', 't__seam__wonder')).toBe(false);
  });
  it('is discovered by meeting it in a light, known from then on, and the same on a return and in a replay', async () => {
    const t = await Tiny.start(kyr(), { party: [{ name: 'Wren', raceId: 'human', classId: 'warrior' }] });
    await t.play('To the cave');
    // In the dark it is not met: nothing can be seen.
    expect(holds(t, 'knows', 'party', 't__seam__wonder')).toBe(false);
    const light = [...t.glance.offer!.primary, ...t.glance.offer!.rest].find(o => /light a torch/i.test(o.label))!;
    await t.perform(light.command ?? light.choice);
    expect(holds(t, 'knows', 'party', 't__seam__wonder')).toBe(true);
    // Told as it is met, whatever else was done there (here, a torch lit).
    expect(JSON.stringify(t.leaf)).toContain('takes in your light');
    // Drawn as a wonder where it can be met (violet: the Atlas's wonder), by its own row.
    expect(t.glance.offer!.primary.find(o => /seam/.test(o.label))?.aspects).toContain('wonder');
    // Its opportunity: its act, by the ordinary rules, which keeps the cave lit of itself.
    await t.play('Hold your light to the seam');
    expect([holds(t, 'state', 't__seam', 't__kindled'), holds(t, 'unlit', 't__cave')]).toEqual([true, false]);
    // Gone and come back: the same thing, known, its discovery not told again.
    await t.play('To the hall'); await t.play('To the cave');
    expect([holds(t, 'state', 't__seam', 't__kindled'), holds(t, 'knows', 'party', 't__seam__wonder')]).toEqual([true, true]);
    expect([...t.leaf.situation, ...t.leaf.presence].join(' ')).toMatch(/glows of itself/);
    expect(JSON.stringify(t.leaf)).not.toContain('takes in your light');
    // A replay: the kept game opened again, the wonder as it was.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(t.session.checkpoint())));
    expect([again.campaign.world.test(ModuleWriter.call('state', 't__seam', 't__kindled')),
      again.campaign.world.test(ModuleWriter.call('knows', 'party', 't__seam__wonder'))]).toEqual([true, true]);
  });
  it('is refused where whence, rarity or worth is no wonder\'s, or where it affords nothing', async () => {
    await expect(Tiny.start(kyr('Wonder lucky rare for aesthetic "x".'))).rejects.toThrow(/whence/);
    await expect(Tiny.start(kyr('Wonder natural common for aesthetic "x".'))).rejects.toThrow(/how rare/);
    await expect(Tiny.start(kyr('Wonder natural rare for magic "x".'))).rejects.toThrow(/what it is for/);
    await expect(Tiny.start(`Place hall "the hall" is room at 0, 0. Company party "You" of 1 at hall.
      Thing stone "the stone" at hall { State still "A stone.". Wonder natural rare for aesthetic "x". }`))
      .rejects.toThrow(/affords nothing/);
  });
});

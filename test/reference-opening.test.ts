import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Prologue } from '../src/presentation/prologue';
import { Undertakings } from '../src/presentation/undertakings';
import { Typography } from '../src/presentation/typography';

// The reference game's opening come over the hills, on s0 (the lead's headless play of 27 November): what the opening
// tells the first place says again in no line of its own (OR-1687: the cart in the ditch had been told by the opening,
// then again as the place's life, then "You see the cart."); where work is heard of is said as the aim says it, and why
// it is not an inn (OR-1688); the first aim, followed from the road, leads in gold the way to the house it names
// (OR-1689: it had said nothing here bore on it); and the next aim's words are short, the woodwright's description his
// own (OR-1690). A whole drawn life, about ten seconds: CI's lane (test/lanes.json).
describe('the reference opening, over the hills', () => {
  it('tells nothing twice, says where work is heard of as the aim does, and leads there in gold', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const c = j.session.campaign, screen = ScreenModel.build(c);
    const opening = Prologue.of(c, screen, Prologue.title(c, screen))!;
    const glance = Narrator.leaf(c, screen, undefined, opening.opening).glance!;
    const told = [...opening.told.beats, opening.told.meeting?.text ?? ''].map(t => Typography.plain(t));
    const placed = [glance.sight?.text, glance.life?.text, glance.contents?.text].filter((t): t is string => !!t);
    expect(placed.filter(t => told.includes(Typography.plain(t)))).toEqual([]);
    expect(glance.contents).toBeUndefined();
    // Why the house: the town has no inn; the opening names the house the aim names.
    const house = c.module.entities.find(e => e.id === 'region__s1_taproom')!.name;
    expect(opening.told.beats[0]!.replace(/’/g, "'")).toContain(`has no inn. Work is heard of at ${house}`);
    expect(screen.objectives[0]).toContain(`Go to ${house}`);
    // Followed from the road, the gold is the way to the house.
    Undertakings.follow(c, 'origin__work');
    const gold = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts.filter(a => a.aspects.includes('undertaking'));
    expect(gold.map(a => a.command)).toEqual(['travel:region__s1_taproom']);
    // At the house, the next aim asks Finnan by name and his calling's first words, never his whole description.
    j.put('party', 'region__s1_taproom');
    await j.play('Wait a while');
    const next = ScreenModel.build(c).objectives[0]!;
    expect(next).toMatch(/^Ask \w+, woodwright at \w+, about the old woods/);
    expect(next).not.toMatch(/who trades|hears what is seen/);
    expect(next.split(/\s+/).length).toBeLessThanOrEqual(18);
  }, 60000);
});

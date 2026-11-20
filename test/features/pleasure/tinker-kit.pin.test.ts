import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { GeneratedWorld } from '../../support/generated';
import { RunnerFind } from '../../support/runner-find';

// Fun Friday's tinker kit (data/kits/tinker; doc/design/fun-fridays-tinker-kit.md): a practitioner of a craft at
// their characteristic work, and an opportunity to take part. Three occasions of it in Iscoed, one to a settlement,
// bound by the composer to each town's square: a travelling tinker, generated, with a child's clockwork bird
// (Porthalen); an apprentice alone with a hurdy-gurdy he has made worse (Wrackham); a guild master short of a part for
// the harbour lantern (Gatesend). Each played through the runner by the rows' words, its checks forced where the
// spec is about one way it can go; each passes by evening.
class Occasion {
  static async start(place: string) {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    GeneratedWorld.put(journey.session, place);
    return { journey, r: new Runner(journey.session), c: journey.session.campaign };
  }
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static async take(r: Runner, label: RegExp): Promise<string> {
    return Occasion.text(await RunnerFind.act(r, r.said(), label));
  }
  static offered(r: Runner, label: RegExp): boolean {
    const s = r.said();
    return [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]).some(o => label.test(o.label));
  }
  // Waited into the evening as a player waits: until dark, then an hour at a time, to six.
  static async evening(r: Runner): Promise<string> {
    const hour = () => r.session.campaign.world.number(ModuleWriter.call('hour', 'clock'));
    let told = '';
    for (let n = 0; n < 6 && hour() < 18; n++) {
      told += ` ${await Occasion.take(r, Occasion.offered(r, /^Wait until dark/) ? /^Wait until dark/ : /^Wait an hour/)}`;
    }
    if (hour() < 19) { told += ` ${await Occasion.take(r, /^Wait an hour/)}`; }
    return told;
  }
}
describe('the tinker kit, three occasions in Iscoed', () => {
  it('Porthalen: a generated tinker, a child\'s bird, a pair of hands lent, and he goes on by evening', async () => {
    const { r, c } = await Occasion.start('s1_green');
    const tinker = c.module.entities.find(e => e.id === 'tinker1Travelling__tinker')!.name;
    expect(Occasion.text(r.said('look'))).toContain("'One at a time,' he says to everyone");
    expect(Occasion.offered(r, /^Coil the bird's spring back into its barrel yourself/)).toBe(false);
    expect(await Occasion.take(r, /^Ask .* about his trade/)).toContain('the little things wait for me');
    const held = await Occasion.take(r, /^Hold the spring down while the tinker seats it/);
    expect(held).toContain('lifts its wings and sings four notes');
    expect(held).toContain("'Many hands.'");
    const evening = await Occasion.evening(r);
    expect(evening).toContain(`${tinker.split(',')[0]} packs up his barrow`);
    expect(c.world.one('at', 'tinker1Travelling__tinker')).toBeUndefined();
    expect(Occasion.offered(r, /^Hold the spring down/)).toBe(false);
  }, 180000);
  it('Porthalen: a fumbled try is a shared laugh, and the bird left unmended when he goes', async () => {
    const { journey, r } = await Occasion.start('s1_green');
    journey.roll('fail');
    expect(await Occasion.take(r, /^Try the bird's spring/)).toContain('laughs so hard she has to sit down');
    journey.roll();
    await Occasion.evening(r);
    expect(Occasion.text(r.said('look'))).toContain('spring hanging out of it like a bit of string');
  }, 180000);
  it('Wrackham: an apprentice\'s mistake seen and steadied, so that he mends it himself', async () => {
    const { journey, r } = await Occasion.start('s2_green');
    journey.roll('pass');
    expect(Occasion.text(r.said('look'))).toContain('listening to it grind');
    expect(await Occasion.take(r, /^Look at the hurdy-gurdy's wheel/)).toContain('the wheel is not round on its axle');
    const steadied = await Occasion.take(r, /^Tell Tomos to warm the glue/);
    expect(steadied).toContain('He does it all himself');
    // And after, as the place is next told: the drone under everything he does.
    expect(`${steadied} ${await Occasion.take(r, /^Wait a while/)}`).toContain('for the pleasure of it');
  }, 180000);
  it('Wrackham: or his mistress fetched, who mends it in a breath, and he does not look up after', async () => {
    const { r, c } = await Occasion.start('s2_green');
    const fetched = await Occasion.take(r, /^Go and fetch Tomos's mistress/);
    expect(fetched).toContain('Things that go round have to be round');
    expect(c.world.one('at', 'tinker2Apprentice__eira')).toBe('region__s2_green');
    expect(`${fetched} ${await Occasion.take(r, /^Wait a while/)}`).toContain('does not look up when you pass');
  }, 180000);
  it('Gatesend: a master short of a part; a torch spoiled trying, or her salvage searched, and a trade offered', async () => {
    const tried = await Occasion.start('s4_green');
    tried.journey.roll('fail');
    expect(await Occasion.take(tried.r, /^Offer the iron ring off one of your torches/)).toContain('splits on the mandrel');
    // No lockwork in the company: cutting a collar from brass is not offered to it.
    expect(Occasion.offered(tried.r, /^Cut a burner collar/)).toBe(false);
    const found = await Occasion.start('s4_green');
    found.journey.roll('pass');
    const gold = found.c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const told = await Occasion.take(found.r, /^Look through Nest Cadwgan's box of salvage/);
    expect(told).toContain("'Well found,' she says");
    expect(told).toContain("there's a bench at the back of my stall for a season");
    expect(found.c.world.test(ModuleWriter.call('knows', 'party', 'tinker3Master__trade_open'))).toBe(true);
    // Not paid: what comes of it is the work, and the opening.
    expect(found.c.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold);
  }, 180000);
});

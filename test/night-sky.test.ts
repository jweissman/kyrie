import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerOffer } from '../src/cli/runner-offer';
import { ModuleWriter } from '../src/lang/module-writer';
import { NightSkies } from '../src/narrative/night-skies';

// Fun Friday (20 November; doc/design/fun-fridays.md): the night sky watched for its own sake (#266, #114, #97). Out of
// doors after dark, anywhere; told by the sky as it is that night: the weather, the sign riding this month, and whether
// one of the company was born under it. Not by day, not indoors; and nothing is gained but the half hour.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const acts = (s: Said) => [...s.offer.primary, ...s.offer.rest].map(o => RunnerOffer.act(o));
const text = (s: Said) => s.scene.lines.join(' ');
describe('the night sky, watched', () => {
  it('is offered only out of doors after dark, and is told by the sky as it is', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign, watch = 'watch_sky(party,region__s1_green)';
    expect(acts(r.said())).not.toContain(watch);
    for (let i = 0; i < 4 && !c.world.test(ModuleWriter.call('dark')); i++) { said(await r.ask('{"act":"wait_for_dark"}')); }
    expect(acts(r.said())).toContain(watch);
    const coin = c.world.number(ModuleWriter.call('quantity', 'party', 'gold')), aims = r.said().aims?.length ?? 0;
    // Under rain, a line of rain.
    const sky = (weather: string) => {
      const was = c.world.related('state').find(x => x.args[0] === 'region__sky')!.args[1]!;
      c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('state', 'region__sky', was) },
        { kind: 'assert', call: ModuleWriter.call('state', 'region__sky', `region__weather_${weather}`) }]));
    };
    sky('rainy');
    expect(text(said(await r.ask(JSON.stringify({ act: watch }))))).toMatch(/rain|Rain/);
    // Clear, the sign this month rides, by name and its line; and the sign one of the company was born under.
    sky('clear');
    const riding = NightSkies.riding(c, c.readout.elapsed ?? 0)!;
    const wenna = c.readout.creatures.find(x => /Wenna/.test(x.name)) as { sign?: string };
    wenna.sign = riding.id;
    expect(text(said(await r.ask(JSON.stringify({ act: watch }))))).toContain(`the stars Wenna was born under`);
    expect(text(said(await r.ask(JSON.stringify({ act: watch }))))).toContain(riding.name);
    // Nothing gained but the time.
    expect([c.world.number(ModuleWriter.call('quantity', 'party', 'gold')), r.said().aims?.length ?? 0])
      .toEqual([coin, aims]);
    // Not indoors.
    said(await r.ask('{"act":"go(region__s1_inn_door,region__s1_taproom)"}'));
    expect(acts(r.said()).some(a => a.startsWith('watch_sky('))).toBe(false);
  }, 180000);
});

import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerOffer } from '../src/cli/runner-offer';
import { ModuleWriter } from '../src/lang/module-writer';
import { Instruments } from '../src/presentation/instruments';
import { ScreenModel } from '../src/ui/screen-model';
import { SettingPort } from '../src/setting-port';

// Fun Friday (20 November; doc/design/fun-fridays.md): the night sky watched for its own sake (#266, #114, #97). Out of
// doors after dark, anywhere; told by the sky as it is that night: the weather, the sign riding this month, and whether
// one of the company was born under it. Not by day, not indoors; and nothing is gained but the half hour.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const acts = (s: Said) => [...s.offer.primary, ...s.offer.rest].map(o => RunnerOffer.act(o));
const text = (s: Said) => s.scene.lines.join(' ');
describe('the night sky, watched', () => {
  for (const as of ['human/warrior/Wenna', 'elf/mage/Ilse/scholar']) {
  it(`is offered only out of doors after dark, and told by the sky instrument (${as})`, async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', as]));
    const r = new Runner(journey.session), c = journey.session.campaign, green = c.world.one('at', 'party')!;
    const town = green.replace(/_green$/, ''), watch = `watch_sky(party,${green})`;
    expect(acts(r.said())).not.toContain(watch);
    for (let i = 0; i < 4 && !c.world.test(ModuleWriter.call('dark')); i++) {
      said(await r.ask('{"act":"wait_for_dark"}'));
    }
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
    // Clear: the sign named exactly where the sky instrument names it (only one who reads the stars can), and one's
    // own sign as the instrument says it; the telling and the instrument the page shows never disagree.
    sky('clear');
    const night = Instruments.night(c, ScreenModel.build(c))!;
    const told = text(said(await r.ask(JSON.stringify({ act: watch }))));
    if (night.sign) { expect(told).toContain(night.sign.name); }
    else { expect(SettingPort.sky.signs.filter(x => told.includes(x.name))).toEqual([]); }
    // Nothing gained but the time.
    expect([c.world.number(ModuleWriter.call('quantity', 'party', 'gold')), r.said().aims?.length ?? 0])
      .toEqual([coin, aims]);
    // Not indoors.
    said(await r.ask(JSON.stringify({ act: `go(${town}_inn_door,${town}_taproom)` })));
    expect(acts(r.said()).some(a => a.startsWith('watch_sky('))).toBe(false);
  }, 180000);
  }
});

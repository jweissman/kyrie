import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { DangerSense } from '../src/presentation/danger-sense';

// The hire at Gatesend, found, afforded and taken on the weir route (Sprint 3, S3-R4 and the mage's half of S3-R3;
// CB-03's "discover, afford, recruit"). Ilse starts on Gatesend's gate-yard with 7 coin. The guest-hall's door is
// offered there; inside, Dreg says Gesk is looking for work; asked, Gesk names his price, 6 coin and his keep, within
// her purse; taken on, he is one of the company and she has 1 coin left. The one act changes the expedition: the
// corn-store's rats, the route's first fight, are reckoned hard for her alone and easier with him (their odds measured
// in test/weir-mage-odds: alone she wins 88 % since she casts where a spell fells surer than her staff, OR-208; she had
// swung it, and they were reckoned grave). Each act is taken by its id.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
const ids = (s: Said) => offered(s).map(o => RunnerOffer.act(o));
const text = (s: Said) => s.scene.lines.join(' ');
describe('the weir life\'s hire at Gatesend', () => {
  it('is told of, asks what she can pay, and once taken on changes what the rats are reckoned', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const start = r.said();
    expect([start.at, start.purse?.coin, start.company]).toEqual(['region__s4_green', 7, undefined]);
    // OR-1396: Ilse's two HP make the rats grave without help.
    expect(DangerSense.reckon(c, 'region__s4_u_rats')?.danger).toBe('grave');
    const door = 'go(region__s4_inn_door,region__s4_taproom)';
    expect(ids(start)).toContain(door);
    const hall = said(await r.ask(JSON.stringify({ act: door })));
    expect(text(hall)).toContain('Gesk there is looking for work');
    expect(ids(hall)).toContain('region__s4_traveller_brings');
    const asked = said(await r.ask(JSON.stringify({ act: 'region__s4_traveller_brings' })));
    const price = Number(/asking (\d+) coin/.exec(text(asked))?.[1]);
    expect(text(asked)).toContain('a lizardfolk warrior of level 1');
    expect(price).toBe(6);
    expect(price).toBeLessThanOrEqual(asked.purse!.coin);
    expect(ids(asked)).toContain('recruit(region__s4_traveller)');
    const hired = said(await r.ask(JSON.stringify({ act: 'recruit(region__s4_traveller)' })));
    expect(hired.purse?.coin).toBe(7 - price);
    // OR-1396: Gesk also uses the warrior's d10.
    expect(hired.company).toEqual(['Gesk, lizardfolk warrior, 15 of 15']);
    expect(c.readout.partyIds).toHaveLength(2);
    expect(['slight', 'fair']).toContain(DangerSense.reckon(c, 'region__s4_u_rats')?.danger ?? 'unreckoned');
  }, 60000);
});

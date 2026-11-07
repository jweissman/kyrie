import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Frontier } from '../src/world/frontier';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// The Dorothea (doc/imbar/07-voyage.md): a real passage between separated landmasses on the existing travel system.
// The ship is a thing that is somewhere; the company walks her decks; the clock moves her through five stations.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
class Sea {
  // The first pass's journeys keep a fixed timeline: the sea table (weather.kyr, test/dorothea-sea.test.ts) is off.
  static async start(seed = 's1') {
    const j = await Journey.start(campaign, seed);
    j.assert(k('seaQuiet'), k('hull'));
    return j;
  }
  static at(j: Journey, id: string) { return j.campaign.world.one('at', k(id)); }
  static party(j: Journey) { return j.campaign.world.one('at', 'party'); }
  static async board(j: Journey, how = 'Pay Captain Bascom six') {
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', how, "^To the Dorothea's waist");
  }
}

describe('The Dorothea', () => {
  it('embarks the company on her deck: it walks aboard, and the ship is still at the quay', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    expect(Sea.party(j)).toBe(k('deck'));
    expect(Sea.at(j, 'hull')).toBe(k('quay'));
    // Not booked, the gangway is shut.
    const g = await Sea.start();
    await g.play('^To Tolleth quay');
    expect(g.matches("^To the Dorothea's waist").length).toBe(0);
  }, 120000);

  it('carries her away on the noon ebb with the company on her deck, station by station, and lands it on another island', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('=25');
    expect(Sea.at(j, 'hull')).toBe(k('sound'));
    expect(Sea.party(j)).toBe(k('deck'));
    expect(j.matches('^To Tolleth quay').length).toBe(0);
    await j.play('=125');
    expect(Sea.at(j, 'hull')).toBe(k('open_sea'));
    await j.play('=180');
    expect(Sea.at(j, 'hull')).toBe(k('teeth'));
    expect(j.holds(k('troubled'), k('hull'))).toBe(true);
    await j.play('^To the quarterdeck', 'lie off', '=215');
    expect(Sea.at(j, 'hull')).toBe(k('jetty'));
    // Aboard still; the gangway now leads to a different landmass.
    expect(Sea.party(j)).toBe(k('helm'));
    await j.play('^To the Dorothea\'s waist', '^To Skerrow jetty');
    expect(Sea.party(j)).toBe(k('jetty'));
    expect(Sea.party(j)).not.toBe(k('quay'));
  }, 240000);

  it('leaves a company on the quay when it is not aboard at noon', async () => {
    const j = await Sea.start();
    await j.play('^To Tolleth quay', '=30');
    expect(Sea.at(j, 'hull')).toBe(k('sound'));
    expect(Sea.party(j)).toBe(k('quay'));
    expect(j.matches('^To the Dorothea').length).toBe(0);
  }, 120000);

  it('stops the count in fog and goes on from the same place when the fog is dealt with', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('=45');
    expect(j.holds(k('fog'), k('hull'))).toBe(true);
    const progress = j.measure(k('progress'), k('hull'));
    await j.play('=50');
    expect(j.measure(k('progress'), k('hull'))).toBe(progress);
    // The fog is waited out (the Captain heaves to), and then the passage resumes.
    await j.play('=95');
    expect(j.holds(k('fog'), k('hull'))).toBe(false);
    expect(j.measure(k('progress'), k('hull'))).toBeGreaterThan(progress as number);
  }, 240000);

  it('survives a save and a reload in fog, and again in the Combs, and goes on to arrive', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('=45');
    expect(j.holds(k('fog'), k('hull'))).toBe(true);
    const kept = JSON.parse(JSON.stringify(j.session.checkpoint()));
    const back = Journey.of(PlaySession.resume(kept));
    expect(back.session.canonical()).toBe(j.session.canonical());
    expect(back.campaign.world.one('at', k('hull'))).toBe(k('sound'));
    await back.play('=180');
    expect(Sea.at(back, 'hull')).toBe(k('teeth'));
    const again = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(back.session.checkpoint()))));
    expect(again.session.canonical()).toBe(back.session.canonical());
    await again.play('^To the quarterdeck', 'lie off', '=215');
    expect(Sea.at(again, 'hull')).toBe(k('jetty'));
  }, 300000);
});

describe('The Dorothea, the company aboard', () => {
  it('lets each member say what they see by what they are: the ranger at the weather, the thief at the hatch, the warrior at the Combs', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('=100');
    expect(j.page).toContain('Glass is falling');
    await j.play('=125');
    expect(j.page).toContain('He does this twice a month');
    await j.play('=180');
    expect(j.page).toContain('I would wait the five hours');
  }, 300000);
  it('lets a shamed mate take the wheel through the Combs and be the Captain\'s man again', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('=115', 'Watch what passes at the after hatch', 'Take Rune aside and say what you saw', '=180', '^To the quarterdeck');
    await j.play('Ask Rune to take her through');
    expect(Sea.at(j, 'hull')).toBeDefined();
    expect(j.holds(k('ranGap'), k('hull'))).toBe(true);
    expect(j.measure(k('water'), k('hull'))).toBe(0);
  }, 300000);
  it('puts a mate who is reported ashore with his bag, and the Combs are then the Captain\'s alone', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('=115', 'Watch what passes at the after hatch', '^To the quarterdeck', 'Tell Captain Bascom what you saw');
    expect(j.holds(k('disgraced'), k('rune'))).toBe(true);
    await j.play('=180');
    expect(j.matches('Ask Rune to take her through').length).toBe(0);
  }, 300000);
});

describe('The Dorothea, Skerrow and the way home', () => {
  const reachIsle = async (j: Journey, way = 'lie off') => {
    await Sea.board(j);
    await j.play('=180', '^To the quarterdeck', way, '=215', "^To the Dorothea's waist", '^To Skerrow jetty', '^To Skerrow green');
  };
  it('lets the company keep the island\'s lamp, take a rubbing of the table, and sail home with a surveyor', async () => {
    const j = await Sea.start();
    await Sea.board(j);
    await j.play('Ask her to come with you');
    await j.play('=180', '^To the quarterdeck', 'lie off', '=215', "^To the Dorothea's waist", '^To Skerrow jetty', '^To Skerrow green');
    expect(j.holds('following', k('quint'), 'party')).toBe(true);
    await j.play('^Into the Gull', 'Ask Silas Quillon what he wants', '^Out to');
    await j.play('Offer to stand Jory Kestle');
    expect(j.holds(k('jorySways'), 'party')).toBe(true);
    await j.play('^Into the Gull', 'Buy .*rag paper', '^Out to', '^To the path up Pharos Hill', '^To the foot of the Pharos', '^To the lamp room');
    await j.play('Take a rubbing');
    expect(j.holds(k('rubbed'), 'party')).toBe(true);
    // Given into the company's hands, not merely recorded: the rubbing is carried.
    expect(j.holds('holding', 'party', 'pharos_rubbing')).toBe(true);
    expect(j.holds(k('keptLamp'), 'party')).toBe(true);
    // The lamp is not sold, ever, however long we stay.
    await j.play('=420');
    expect(j.holds(k('tableSold'), 'party')).toBe(false);
  }, 400000);

  it('sells the Pharos\'s bronze to the factor\'s agent on the second evening if nobody speaks for it', async () => {
    const j = await Sea.start();
    await reachIsle(j);
    await j.play('^Into the Gull', 'Ask Silas Quillon what he wants');
    await j.play('=380');
    expect(j.holds(k('tableSold'), 'party')).toBe(true);
    expect(j.holds(k('lampOut'), 'party')).toBe(true);
  }, 300000);

  it('goes home on the ebb two mornings after, station by station; a company ashore is left on Skerrow', async () => {
    const j = await Sea.start();
    await reachIsle(j);
    await j.play('^To the jetty road|^To Skerrow jetty', '^To the Dorothea');
    expect(Sea.party(j)).toBe(k('deck'));
    await j.play('=435');
    expect(Sea.at(j, 'hull')).toBe(k('roads'));
    await j.play('=540');
    expect(['teeth', 'open_sea']).toContain((Sea.at(j, 'hull') ?? '').replace('dorothea__', ''));
    await j.play('=800');
    expect(Sea.at(j, 'hull')).toBe(k('quay'));
    expect(Sea.party(j)).toBe(k('deck'));
    const left = await Sea.start();
    await reachIsle(left);
    await left.play('=435');
    expect(Sea.at(left, 'hull')).toBe(k('roads'));
    expect(Sea.party(left)).toBe(k('green'));
    expect(left.holds(k('stranded'), 'party')).toBe(true);
  }, 400000);
});

describe('The Dorothea, in the ordinary world', () => {
  it('is a province of a generated country: the company walks in from the road and sails from the quay to Skerrow', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    expect(w.report.region.provinces!.map(p => p.name)).toContain('Tolleth and the Skerrow passage');
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    const j = Journey.of(s);
    await GeneratedWorld.travel(s, 'gate_tolleth');
    await frontier.expand(s.campaign);
    const c = PlayerView.choices(s.campaign).find(x => /^Take the road on into/.test(x.choice.name))!;
    await s.perform(c.choice.id);
    const t0 = Math.ceil(s.campaign.state.elapsed / 144) * 144;
    await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist");
    j.assert('ptolleth__seaQuiet', 'ptolleth__hull'); // a fixed timeline: the sea table is off here
    const at = (id: string) => s.campaign.world.one('at', `ptolleth__${id}`);
    await j.play(`=${t0 + 26}`);
    expect(at('hull')).toBe('ptolleth__sound');
    expect(s.campaign.world.one('at', 'party')).toBe('ptolleth__deck');
    // Reload mid-passage in the ordinary world, then go on: the same ship, the same place, the same company aboard.
    const reloaded = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(reloaded.canonical()).toBe(s.canonical());
    const r = Journey.of(reloaded);
    await r.play(`=${t0 + 190}`, '^To the quarterdeck', 'lie off', `=${t0 + 225}`);
    expect(reloaded.campaign.world.one('at', 'ptolleth__hull')).toBe('ptolleth__jetty');
    await r.play("^To the Dorothea's waist", '^To Skerrow jetty');
    expect(reloaded.campaign.world.one('at', 'party')).toBe('ptolleth__jetty');
    await r.play('^To Skerrow green');
    expect(reloaded.campaign.world.one('at', 'party')).toBe('ptolleth__green');
  }, 400000);
});

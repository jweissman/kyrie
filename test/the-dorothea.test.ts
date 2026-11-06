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
  static async start(seed = 's1') { return Journey.start(campaign, seed); }
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

import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

class Sink {
  // A torch from Nera first: the caves under the sink are dark.
  static readonly ridge = ['go(march__shop_door,march__shop_floor)', 'buy_item(march__nera_torch_1,march__member_party_1)',
    'go(march__shop_door,march__quay)', 'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)'];
  static readonly down = ['go(sink__sink_path,sink__lip)', 'go(sink__shaft,sink__cave)', 'use_item(march__nera_torch_1,march__member_party_1)'];
  static async play(...commands: string[]) {
    const s = await PlaySession.start('test/fixtures/march/silkholme.campaign.json', 'silk', NodeBundleSource.shared);
    for (const c of commands) { await s.perform(c); }
    return s;
  }
  static state(s: PlaySession, id: string) {
    return s.campaign.state.world.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static coins(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
}

describe('Silkholme: one quarrel, several ways through it', () => {
  it('feeding the brood-mother quiets the brood, restocks Odile, and Garth comes round after a quiet night', async () => {
    const s = await Sink.play(...Sink.ridge, 'brood__complaint', 'go(sink__sink_path,sink__lip)',
      'go(sink__terrace_steps,sink__frames)', 'brood__plea', 'go(sink__terrace_steps,sink__lip)',
      'go(sink__sink_path,march__ridge)', 'brood__carcass', ...Sink.down, 'change_thing(brood__webs_hack)',
      'go(sink__web_gallery,sink__nest)');
    expect(Sink.legal(s)).not.toContain('change_thing(brood__webs_burn)');
    await s.perform('change_thing_paying(brood__mother_feed)');
    expect(Sink.holds(s, 'brood__sated', 'brood__brood')).toBe(true);
    expect(Sink.legal(s)).not.toContain('attack(brood__brood)');
    for (const c of ['go(sink__web_gallery,sink__cave)', 'go(sink__seep,sink__frames)']) { await s.perform(c); }
    expect(Sink.state(s, 'brood__frames')).toBe('brood__winding');
    expect(Sink.legal(s)).toContain('buy_goods(silk,brood__odile)');
    const before = Sink.coins(s);
    await s.perform('brood__grateful');
    expect(Sink.coins(s)).toBe(before + 4);
    for (const c of ['go(sink__terrace_steps,sink__lip)', 'go(sink__sink_path,march__ridge)']) { await s.perform(c); }
    expect(Sink.legal(s)).toContain('brood__wait_and_see');
    while (s.campaign.state.elapsed < 90) { await s.perform('wait'); }
    expect(s.campaign.world.number(ModuleWriter.call('brood__lost', 'brood__garth'))).toBe(1);
    expect(Sink.state(s, 'brood__garth')).toBe('brood__easy');
    expect(Sink.legal(s)).toContain('brood__paid_fed');
  }, 120000);
  it('a torch to the webs drives the brood out, and burns Odile out with it', async () => {
    const s = await Sink.play(...Sink.ridge, 'take_item(brood__spare_torch,march__member_party_2)', ...Sink.down,
      'change_thing(brood__webs_burn)');
    expect(Sink.holds(s, 'brood__scattered', 'brood__brood')).toBe(true);
    expect(Sink.state(s, 'brood__frames')).toBe('brood__ruined');
    expect(Sink.state(s, 'brood__odile')).toBe('brood__bitter');
    expect(s.campaign.events.at(-1)!.perceptions!.map(p => p.text).join(' ')).toContain('Fire runs up the silk');
  }, 120000);
  it('left alone, Garth loses a ewe a night, and after the second night burns Silkholme himself', async () => {
    const s = await Sink.play(...Sink.ridge);
    const lost = () => s.campaign.world.number(ModuleWriter.call('brood__lost', 'brood__garth'));
    while (s.campaign.state.elapsed < 100) { await s.perform('wait'); }
    // The first night costs him a ewe; he is worried, not yet angry.
    expect([lost(), Sink.state(s, 'brood__garth'), Sink.state(s, 'brood__webs')])
      .toEqual([2, 'brood__worried', 'brood__whole']);
    while (s.campaign.state.elapsed < 260) { await s.perform('wait'); }
    expect(Sink.state(s, 'brood__webs')).toBe('brood__burnt');
    expect(s.campaign.events.flatMap(e => e.npc ?? []).some(d => d.actor === 'brood__garth'
      && d.action.startsWith('change_thing(brood__garth,brood__webs_burn'))).toBe(true);
    expect(Sink.state(s, 'brood__odile')).toBe('brood__bitter');
    while (s.campaign.state.elapsed < 400) { await s.perform('wait'); }
    expect(lost()).toBe(3);
  }, 120000);
  it('the brood is three spiders in one fight; killing them leaves Odile grieving', async () => {
    const s = await Sink.play(...Sink.ridge, ...Sink.down, 'change_thing(brood__webs_hack)', 'go(sink__web_gallery,sink__nest)');
    const battle = s.campaign.encounterBattle(PlayerView.resolve(s.campaign, 'attack(brood__brood)'));
    expect(battle.state.combatants.filter(f => f.team === 'goblins').map(f => f.name))
      .toEqual(['Cave spider 1', 'Cave spider 2', 'Cave spider 3']);
    battle.close();
  }, 120000);
  it('night falls in the world: dark() holds from nine to six, and the quay is described by it', async () => {
    const s = await Sink.play();
    const quay = () => JSON.stringify(PlayerView.observe(s.campaign));
    expect(quay()).toContain('Barges nose into reed-fringed piles');
    expect(quay()).toContain("A shepherd's boy is telling anyone");
    while (s.campaign.state.elapsed < 78) { await s.perform('wait'); }
    expect(Sink.holds(s, 'dark')).toBe(true);
    expect(quay()).toContain('The quay is dark and empty');
    expect(quay()).not.toContain("A shepherd's boy");
    expect(Sink.legal(s)).toContain('wait_for_light');
    await s.perform('wait_for_light');
    expect(s.campaign.state.elapsed).toBe(132);
    expect(Sink.holds(s, 'dark')).toBe(false);
    expect(Sink.legal(s)).not.toContain('wait_for_light');
  }, 120000);
});

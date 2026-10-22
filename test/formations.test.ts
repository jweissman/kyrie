import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content, type CreatureGenerationContext } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import { Effects } from '../src/effects';
import { Formations } from '../src/rules/formations';
import { Perks } from '../src/rules/perks';
import { Canon } from '../src/canon/canon';
import { Advancement } from '../src/rules/advancement';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import { Searching } from '../src/rules/searching';
import { Fighting } from '../src/rules/fighting';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';

// Orsino's party traits as one mechanism: the classes or ancestries of a company's members make a formation (three
// clerics a Clerical Synod), every member holds it, and its perks act where they should: on a heal, at a level, on a
// kill, in a sale, in a search.
class Party {
  static of(...members: [string, string][]): CreatureGenerationContext[] {
    return members.map(([raceId, classId], i) => ({ name: `Member ${i + 1}`, raceId, classId, backgroundId: 'scholar' }));
  }
  static start(party: CreatureGenerationContext[]) {
    return PlaySession.start('test/fixtures/market/campaign.json', 'formations', NodeBundleSource.shared, party);
  }
  static change(s: PlaySession, kind: 'assert' | 'retract', name: string, ...args: string[]) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind, call: ModuleWriter.call(name, ...args) }]));
  }
  static members(s: PlaySession) {
    return s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id));
  }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static async choose(s: PlaySession, prefix: string) {
    const id = PlayerView.choices(s.campaign).map(c => c.choice.id).find(c => c.startsWith(prefix));
    if (!id) { throw new Error(`Not offered: ${prefix}`); }
    return s.perform(id);
  }
}

describe('recognizing formations', () => {
  it('counts each class or ancestry a formation names as many times as it names it', () => {
    const clerics = [{ classId: 'cleric' }, { classId: 'cleric' }, { classId: 'cleric' }];
    expect(Formations.recognize(clerics)).toEqual(['synodist']);
    expect(Formations.recognize([...clerics.slice(1), { classId: 'warrior' }])).toEqual([]);
    expect(Formations.recognize([{ raceId: 'human', classId: 'thief' }, { raceId: 'elf', classId: 'mage' },
      { raceId: 'dwarf', classId: 'warrior' }])).toEqual(['fellowship']);
    expect(Formations.recognize([{ classId: 'warrior' }, { classId: 'cleric' }, { classId: 'thief' }])).toEqual(['oligarch']);
  });
  it('says which formations a company is one member short of, and what that member would have to be', () => {
    const near = Formations.near([{ raceId: 'human', classId: 'cleric' }, { raceId: 'human', classId: 'cleric' },
      { raceId: 'dwarf', classId: 'warrior' }]);
    expect(near.find(n => n.id === 'synodist')?.missing).toEqual(['cleric']);
    expect(near.find(n => n.id === 'accordant')?.missing).toEqual(['human']);
    // Either way, it is the dwarf warrior who would have to change.
    expect([near.find(n => n.id === 'synodist')?.spare, near.find(n => n.id === 'accordant')?.spare]).toEqual([[2], [2]]);
  });
  it('keeps the Synod\'s name, formation and perk as Orsino has them', () => {
    const synod = Canon.traits.synodist!;
    expect([synod.name, synod.requires?.company?.classes, synod.perks?.map(p => p.name)])
      .toEqual(['Clerical Synod', ['cleric', 'cleric', 'cleric'], ['Herbal Remedies']]);
  });
});

describe('a formation in play', () => {
  it('gives each of three clerics the Synod when the company is formed, and their healing more', async () => {
    const s = await Party.start(Party.of(['human', 'cleric'], ['dwarf', 'cleric'], ['human', 'cleric']));
    expect(Party.members(s).map(c => c.traits?.includes('synodist'))).toEqual([true, true, true]);
    const fighter = CombatProjection.fighter(Party.members(s)[0]!, 'fighters');
    expect(Effects.modifiers(fighter).bonusHealing).toBe('1d4');
    const mixed = await Party.start(Party.of(['human', 'cleric'], ['dwarf', 'cleric'], ['human', 'warrior']));
    expect(Party.members(mixed).some(c => c.traits?.includes('synodist'))).toBe(false);
  }, 60000);
  it('lets a free fellowship find, by searching, what would otherwise need a woodsman', async () => {
    const search = async (party: CreatureGenerationContext[]) => {
      const s = await Party.start(party);
      expect(PartyCapabilities.has('woodcraft', Party.members(s))).toBe(false);
      Party.change(s, 'assert', 'at', 'party', 'world__switchbacks');
      await s.perform('search(world__switchbacks)');
      return s.campaign.world.test(ModuleWriter.call('knows', 'party', 'world__goat_path_known'));
    };
    const plain = Party.of(['human', 'thief'], ['human', 'mage'], ['dwarf', 'warrior']);
    const fellowship = Party.of(['human', 'thief'], ['elf', 'mage'], ['dwarf', 'warrior']);
    expect(await search(plain)).toBe(false);
    expect(await search(fellowship)).toBe(true);
  }, 60000);
  it('takes 10 on Orsino\'s search check: Wisdom and every search bonus that holds there count', () => {
    const c = new Content('eye').createCreature('e', { raceId: 'dwarf', classId: 'warrior', backgroundId: 'scholar' });
    const base = 10 + Fighting.statMod(c.base.wisdom);
    expect(Searching.score(c)).toBe(base);
    expect(Searching.score({ ...c, traits: ['fellowship'] })).toBe(base + 5);
    expect(Searching.score({ ...c, traits: ['oligarch'] })).toBe(base);
    expect(Searching.score({ ...c, traits: ['oligarch'] }, { environment: 'urban' })).toBe(base + 10);
  });
  it('pays a thieves\' guild half again for what it sells', async () => {
    const sold: number[] = [];
    for (const party of [Party.of(['human', 'thief'], ['human', 'warrior'], ['human', 'thief']),
      Party.of(['human', 'thief'], ['elf', 'thief'], ['human', 'thief'])]) {
      const s = await Party.start(party);
      await Party.choose(s, 'take_out(world__jar,');
      Party.change(s, 'assert', 'at', 'party', 'world__counting');
      const gold = Party.gold(s);
      await Party.choose(s, 'sell(world__jar');
      sold.push(Party.gold(s) - gold);
    }
    expect(sold).toEqual([12, 18]);
  }, 60000);
});

describe('perks at a level and on a kill', () => {
  it('gives a war band an extra hit point each level', () => {
    const [plain, band] = [[], ['warbander']].map(formations => {
      const c = new Content('levels').createCreature('w', { raceId: 'human', classId: 'warrior', formations });
      c.state.experience = Advancement.threshold(3);
      Advancement.train(c, 'same');
      return c;
    });
    expect(band!.base.maxHp - plain!.base.maxHp).toBe(2);
  });
  it('rewards an oligarchy with gold and experience for each kill', () => {
    const content = new Content('spoils');
    const take = (traits: string[]) => {
      const warrior = { ...content.character('warrior', 'w', 'fighters'), traits, strength: 30 };
      const rat = { ...content.creature('wolf', 'r', 'goblins'), hp: 1 };
      const battle = new Battle({ id: 'spoils', combatants: [warrior, rat], abilities: Content.abilities }, 'spoils');
      while (!battle.state.outcome) { battle.step(battle.chosen()); }
      const w = battle.state.combatants.find(f => f.id === 'w')!;
      return [w.gold, w.experience];
    };
    const [plain, spoils] = [take([]), take(['oligarch'])];
    // 2d6 gold pieces is a coin or none; 3d8 experience is at least 3.
    expect(spoils[0]! - plain[0]!).toBeLessThanOrEqual(1);
    expect(spoils[1]! - plain[1]!).toBeGreaterThanOrEqual(3);
    expect(Perks.triggers(['oligarch'], 'onKill')).toEqual([{ gold: '2d6' }, { experience: '3d8' }]);
  });
});

describe('preparation', () => {
  it('keeps Charge out of reach until a warrior has prepared it, and then it is the only thing to do', () => {
    const content = new Content('charge');
    const warrior = content.character('warrior', 'w', 'fighters'), wolf = content.creature('wolf', 'g', 'goblins');
    const battle = new Battle({ id: 'charge', combatants: [warrior, wolf], abilities: Content.abilities }, 'charge');
    const usable = (f: typeof warrior) => battle.usable(f).map(a => a.id);
    expect(usable(warrior)).toContain('prepare_charge');
    expect(usable(warrior)).not.toContain('charge');
    expect(usable({ ...warrior, statuses: [{ id: 'preparing_to_charge', remaining: 2 }] })).toEqual(['charge']);
  });
});

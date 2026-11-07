import { describe, expect, it } from 'bun:test';
import type { Journey } from '../src/session/journey';
import { City, Q } from './support/quittance';
import { Ds } from './support/quittance-descent';

// The Descent, played by the labels a player sees (doc/adventures/quittance/quests/descent.md). The company is set down
// where a scene begins with a fact or two written into the world, as the other ways down and the Hearing do not exist
// in this file: what the lead's spine will assert (cellarLeave, witnessCount, returnSaid, following) is asserted here.

describe('Quittance: the Descent', () => {
  describe('the Slate', () => {
    it('carries the occupier\'s old claim on the cellars, for any company that reads it', async () => {
      const j = await Ds.start();
      await j.play(...City.slip);
      expect(Ds.knows(j, 'ds_claim')).toBe(true);
    }, 120000);
  });

  describe('the cellar stair', () => {
    it('is opened with picks by a company that has them, and stays open behind it', async () => {
      const j = await Ds.start();
      await j.play(...City.honest, '>quittance__exchange_court');
      expect(City.state(j, 'ds_cellar_gate', 'ds_locked')).toBe(true);
      expect(j.matches('work the cellar door').length).toBe(1);
      await j.play('work the cellar door', '>quittance__cellar_foot');
      expect(City.state(j, 'ds_cellar_gate', 'ds_unlocked')).toBe(true);
      expect(j.at('party')).toBe(Q('cellar_foot'));
      expect(Ds.rel(j, 'ds_alarm')).toBe(false);
      await j.step('^To the court of the Old Exchange$');
      expect(j.at('party')).toBe(Q('exchange_court'));
    }, 120000);
    it('is opened by the porter\'s leave, with nothing broken', async () => {
      const j = await Ds.start();
      await j.play(...City.honest, '>quittance__exchange_court');
      Ds.put(j, 'assert', 'cellarLeave', 'party');
      await j.step('Wait › A while');
      await j.step('^To the foot of the Exchange stair$');
      expect(j.at('party')).toBe(Q('cellar_foot'));
      expect(City.state(j, 'ds_cellar_gate', 'ds_unlocked')).toBe(true);
    }, 120000);
    it('can be forced by shoulder, and the noise goes down before the company', async () => {
      const j = await Ds.start();
      await j.play(...City.honest, '>quittance__exchange_court');
      const told = await j.step('put your shoulders to the cellar door');
      expect(City.state(j, 'ds_cellar_gate', 'ds_splintered')).toBe(true);
      expect(Ds.rel(j, 'ds_alarm')).toBe(true);
      expect(told + City.pages(j)).toContain('something in glass turns its head');
      expect(j.measure('tribute', Q('ds_glassmen'))).toBe(12);
    }, 120000);
  });

  describe('the heat', () => {
    it('rises in the galleries at each gallery\'s rate, and scalds at nine', async () => {
      const j = await Ds.start();
      Ds.at(j, 'glass_street');
      await j.play('>quittance__slag_a', '>quittance__slag_b');
      const h = Ds.heat(j);
      expect(h).toBeGreaterThanOrEqual(2);
      await j.play('Wait › A while', 'Wait › A while', 'Wait › A while');
      expect(Ds.heat(j)).toBeGreaterThanOrEqual(8);
      expect(City.pages(j)).toContain('breathing through your teeth');
      await j.step('Wait › A while');
      expect(Ds.heat(j)).toBeGreaterThanOrEqual(9);
      expect(City.pages(j)).toContain('Your hair smells of singeing');
    }, 120000);
    it('falls in the shade of the street and with water carried from the cistern', async () => {
      const j = await Ds.start();
      Ds.at(j, 'glass_street');
      await j.step('Fill every skin');
      expect(j.measure(Q('ds_skins'), 'party')).toBe(3);
      await j.play('>quittance__slag_a', '>quittance__slag_b', 'Wait › A while', 'Wait › A while');
      const before = Ds.heat(j);
      expect(before).toBeGreaterThanOrEqual(6);
      await j.step('Pour water over your heads');
      expect(Ds.heat(j)).toBe(before - 4);
      expect(j.measure(Q('ds_skins'), 'party')).toBe(2);
      await j.play('>quittance__glass_street', 'Wait › An hour');
      expect(Ds.heat(j)).toBe(0);
    }, 120000);
    it('is kept off by the Fire\'s leave', async () => {
      const j = await Ds.start();
      Ds.at(j, 'glass_street');
      Ds.put(j, 'assert', 'ds_leave', 'party');
      await j.play('>quittance__slag_a', '>quittance__slag_b', 'Wait › A while', 'Wait › A while');
      expect(Ds.heat(j)).toBe(0);
    }, 120000);
  });

  describe('the glass men', () => {
    const toRow = async (j: Journey) => { Ds.at(j, 'glass_street'); await j.step('>quittance__furnace_row'); };
    it('are paid the fee by a company with nothing else, and let it by', async () => {
      const j = await Ds.start();
      await toRow(j);
      const gold = Ds.gold(j);
      expect(City.page(j)).toContain('Papers');
      await j.step('Pay the glass men the price named');
      expect(Ds.gold(j)).toBe(gold - 6);
      await j.step('>quittance__hearth_below');
      expect(j.at('party')).toBe(Q('hearth_below'));
    }, 120000);
    it('are slipped past by a company that goes quietly, and are there when it comes back', async () => {
      const j = await Ds.start();
      await toRow(j);
      await j.step('slip past the glass men');
      expect(j.at('party')).toBe(Q('hearth_below'));
      expect(j.holds('able', Q('ds_glassmen'))).toBe(true);
    }, 120000);
    it('are shown a Policy of Passage, and have no quarrel', async () => {
      const j = await Ds.start();
      await j.play(...City.honest);
      Ds.at(j, 'glass_street');
      await j.step('>quittance__furnace_row');
      await j.step('Show the glass men a Policy of Passage');
      expect(j.holds('tolerates', Q('ds_glassmen'), 'party')).toBe(true);
      expect(j.holds('able', 'party')).toBe(true);
    }, 120000);
    it('are shown an adjuster\'s licence and are satisfied, unless the company was loud on the stair', async () => {
      const j = await Ds.start();
      await j.play(...City.slip);
      Ds.at(j, 'glass_street');
      await j.step('>quittance__furnace_row');
      expect(j.matches('Show the glass men an adjuster').length).toBe(1);
      const k = await Ds.start();
      await k.play(...City.slip);
      Ds.at(k, 'glass_street');
      Ds.put(k, 'assert', 'ds_alarm', 'party');
      await k.step('>quittance__furnace_row');
      expect(k.matches('Show the glass men an adjuster').length).toBe(0);
    }, 120000);
    it('are fought by a martial company, who take their cuffs, and the heat is the lighter for them', async () => {
      // A company of the sixth level, which wins this two times in three and more: at the fourth, two warriors and a
      // cleric win it one time in four whatever they do (they always had; the spec had passed on a seed that won), the
      // cleric's holy wrath now catching her own warriors in the press (the owner's ruling 3).
      const j = await Ds.start(['warrior', 'warrior', 'cleric'], 6);
      await toRow(j);
      await j.step('^the glass men: Attack');
      expect(j.holds('dead', Q('ds_glassmen'))).toBe(true);
      expect(j.holds('able', 'party')).toBe(true);
      await j.step('Go through the fallen glass men');
      expect(j.holds('ownedItem', Q('ds_cuffs_item'), 'party') || City.pages(j).includes('cuffs')).toBe(true);
      await j.play('>quittance__glass_street', '>quittance__slag_a', '>quittance__slag_b', 'Wait › A while', 'Wait › A while');
      // The slag gallery's two a watch is one with the cuffs.
      expect(Ds.heat(j)).toBeLessThan(8);
    }, 120000);
    it('beat a company with no fighters, who learn from it that the fee was cheap', async () => {
      const j = await Ds.start(['mage', 'bard', 'cleric'], 1);
      await toRow(j);
      await j.play('^the glass men: Attack');
      expect(j.holds('able', 'party')).toBe(false);
      expect(j.holds('dead', Q('ds_glassmen'))).toBe(false);
    }, 120000);
  });
});

describe('Quittance: the Descent, continued', () => {
  describe('the Strongroom', () => {
    it('opens to a company that has read the clerk\'s note, and says the closing words', async () => {
      const j = await Ds.start(['warrior', 'warrior', 'cleric']);
      Ds.at(j, 'furnace_row');
      await j.step('^Read the clerk');
      await j.step('Look closely');
      expect(Ds.knows(j, 'ds_note')).toBe(true);
      Ds.at(j, 'vault_door');
      await j.step("Say to the door: 'Quit, and welcome.'");
      expect(City.state(j, 'ds_vault_lock', 'ds_spoken')).toBe(true);
      await j.step('>quittance__vault');
      expect(j.at('party')).toBe(Q('vault'));
    }, 120000);
    it('opens to a scholar who reads the seal', async () => {
      const j = await Ds.start(['mage', 'warrior', 'cleric']);
      Ds.at(j, 'vault_door');
      expect(j.matches("Say to the door: 'Quit, and welcome.'").length).toBe(0);
      await j.step("Read the notary's seal");
      expect(j.matches("Say to the door: 'Quit, and welcome.'").length).toBe(1);
      await j.step("Say to the door: 'Quit, and welcome.'");
      expect(City.state(j, 'ds_vault_lock', 'ds_spoken')).toBe(true);
    }, 120000);
    it('shuts its ear on a company that guesses wrong three times, and then takes picks', async () => {
      const j = await Ds.start();
      Ds.at(j, 'vault_door');
      await j.play("Say to the door: 'In perpetuity", "Say to the door: 'Paid in full", "Say to the door: 'In perpetuity");
      expect(City.state(j, 'ds_vault_lock', 'ds_deaf')).toBe(true);
      expect(j.matches("Say to the door: 'Paid").length).toBe(0);
      await j.step('Work the deafened lock');
      expect(City.state(j, 'ds_vault_lock', 'ds_picked')).toBe(true);
      await j.step('>quittance__vault');
      expect(City.state(j, 'ds_policy', 'ds_scorched')).toBe(true);
      expect(j.matches('Read the clause that promises the Receipt').length).toBe(0);
      expect(j.matches('Read the clause that names the parties').length).toBe(1);
    }, 120000);
    it('lets the clauses be read in any order, and the history is the company\'s own', async () => {
      const j = await Ds.start();
      Ds.at(j, 'vault');
      expect(Ds.knows(j, 'd_treaty_text')).toBe(false);
      await j.step('Read the clause that says what is owed');
      expect(Ds.knows(j, 'd_tithe_debt')).toBe(true);
      expect(Ds.knows(j, 'd_return')).toBe(false);
      await j.step('Read the clause that lends the hearths');
      expect(Ds.knows(j, 'd_return')).toBe(true);
      expect(Ds.knows(j, 'd_treaty_text')).toBe(false);
      await j.step('Read the clause that names the parties');
      expect(Ds.knows(j, 'd_treaty_text')).toBe(true);
      await j.step('Read the clause that says who the Guest is');
      expect(Ds.knows(j, 'd_fire_is_real')).toBe(true);
      await j.step('Read the clause that promises the Receipt');
      await j.step('Read the closing words');
      expect(Ds.knows(j, 'd_return_3')).toBe(true);
      for (const n of [1, 2, 3, 4, 5]) { expect(Ds.knows(j, `ds_clause_${n}`)).toBe(true); }
    }, 120000);
    it('can be read without a lock, and with a Fire seen first, by a company that comes by the Last Stair', async () => {
      const j = await Ds.start();
      Ds.at(j, 'hearth_below');
      expect(Ds.knows(j, 'd_fire_is_real')).toBe(false);
      await j.step('Wait › A while');
      expect(Ds.knows(j, 'd_fire_is_real')).toBe(true);
      await j.step('Up to the Strongroom');
      expect(j.at('party')).toBe(Q('vault'));
    }, 120000);
  });

  describe('the glass city', () => {
    it('has a table, a cat, figures, a desk and a lamp, each with something to find', async () => {
      const j = await Ds.start();
      Ds.at(j, 'glass_street');
      await j.step('^glass table.*Look closely|the glass table.*Look closely');
      expect(City.pages(j)).toContain('child');
      await j.step('the glass cat.*Push and pull');
      expect(City.pages(j)).toContain('You decide not to do that again');
      Ds.at(j, 'slag_b');
      await j.step('the figures in the glass.*Look closely');
      expect(Ds.knows(j, 'ds_hand_known')).toBe(true);
      await j.step('^Take.*copper warding focus|warding focus');
      Ds.at(j, 'furnace_row');
      await j.step('a melted desk.*Look closely');
      expect(Ds.knows(j, 'ds_note')).toBe(true);
    }, 120000);
    it('keeps a coal in a clerk\'s lamp that wakes on the sixth day', async () => {
      const j = await Ds.start();
      expect(City.state(j, 'ds_lamp', 'ds_asleep')).toBe(true);
      Ds.at(j, 'glass_street');
      await j.step('=day 7 09:00');
      Ds.put(j, 'assert', 'tolerates', 'ds_glassmen', 'party');
      Ds.at(j, 'furnace_row');
      expect(City.state(j, 'ds_lamp', 'ds_lit')).toBe(true);
      await j.step('Lift the coal out');
      expect(j.measure('quantity', 'party', 'coal')).toBe(1);
    }, 120000);
  });
});

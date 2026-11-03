import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { City, Q } from './support/quittance';

// The Descent, played by the labels a player sees (doc/adventures/quittance/quests/descent.md). The company is set down
// where a scene begins with a fact or two written into the world, as the other ways down and the Hearing do not exist
// in this file: what the lead's spine will assert (cellarLeave, witnessCount, returnSaid, following) is asserted here.
type Cls = 'warrior' | 'mage' | 'thief' | 'cleric' | 'bard' | 'ranger' | 'monk';
const ENGINE = ['at', 'quantity', 'following', 'travelsWith', 'tolerates', 'assails', 'knows'];
const nm = (n: string) => (ENGINE.includes(n) ? n : Q(n));
const arg = (a: string) => (['party', 'gold', 'coal', 'rations'].includes(a) ? a : Q(a));
class Ds {
  static async start(classes?: Cls[], level = 4, seed = 'quittance') {
    const party = classes?.map((classId, i) => ({ name: `P${i}`, raceId: 'human', classId, level }));
    return Journey.start('data/campaigns/quittance.campaign.json', seed, party ? { party } : {});
  }
  private static c(j: Journey): any { return j.session.campaign; }
  static put(j: Journey, kind: 'assert' | 'retract', name: string, ...args: string[]) {
    const c = Ds.c(j);
    c.commitWorld(c.world.apply([{ kind, call: ModuleWriter.call(nm(name), ...args.map(arg)) }]));
  }
  static num(j: Journey, name: string, args: string[], value: number) {
    const c = Ds.c(j);
    c.commitWorld(c.world.apply([{ kind: 'set', call: ModuleWriter.call(nm(name), ...args.map(arg)), value: ModuleWriter.number(value) }]));
  }
  static at(j: Journey, place: string) { Ds.put(j, 'assert', 'at', 'party', place); }
  static heat(j: Journey) { return j.measure(Q('ds_heat'), 'party'); }
  static accord(j: Journey) { return j.measure(Q('ds_accord'), 'party'); }
  static slight(j: Journey) { return j.measure(Q('ds_slight'), 'party'); }
  static mood(j: Journey, s: string) { return City.state(j, 'ds_mood', s); }
  static rel(j: Journey, r: string, ...a: string[]) { return City.has(j, r, 'party', ...a); }
  static gold(j: Journey) { return j.measure('quantity', 'party', 'gold'); }
  static knows(j: Journey, d: string) { return City.knows(j, d); }
  // To the Fire, spoken to.
  static async speak(j: Journey) { await j.play('^the Fire.*: Talk to the Fire', '^the Fire.*: Tell the Fire that you have come'); }
  // The Fire's own answer to a thing offered: who is told, what happens.
  static async ask(j: Journey, label: string) { return j.step(`^the Fire.*: ${label}`); }
}

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
      const j = await Ds.start(['warrior', 'warrior', 'cleric'], 4);
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

  describe('the Fire', () => {
    const toFire = async (classes?: Cls[], level = 4) => {
      const j = await Ds.start(classes, level);
      Ds.at(j, 'hearth_below');
      return j;
    };
    it('is spoken to, and says what it is owed, and does not strike', async () => {
      const j = await toFire();
      expect(Ds.rel(j, 'fireHeard')).toBe(false);
      await Ds.speak(j);
      expect(Ds.rel(j, 'fireHeard')).toBe(true);
      expect(Ds.mood(j, 'ds_owed')).toBe(true);
      expect(Ds.rel(j, 'fireFed')).toBe(false);
      await Ds.ask(j, 'Ask the Fire what it is owed');
      expect(City.pages(j)).toContain('I do not complain. I count.');
    }, 120000);
    it('is sat with: three hours is a payment, the heat is the price, and the leave is the answer', async () => {
      const j = await toFire();
      await Ds.speak(j);
      await Ds.ask(j, 'Sit down in the ash');
      expect(Ds.heat(j)).toBeGreaterThanOrEqual(6);
      await Ds.ask(j, 'Sit down in the ash');
      expect(Ds.mood(j, 'ds_lonely')).toBe(true);
      expect(Ds.rel(j, 'fireFed')).toBe(false);
      await Ds.ask(j, 'Sit down in the ash');
      expect(Ds.rel(j, 'fireFed')).toBe(true);
      expect(Ds.accord(j)).toBe(3);
      await Ds.ask(j, 'Ask the Fire for leave');
      expect(Ds.rel(j, 'ds_leave')).toBe(true);
      await j.step('Wait › An hour');
      expect(Ds.heat(j)).toBeLessThan(10);
      expect(Ds.rel(j, 'fireTerms')).toBe(false);
    }, 120000);
    it('opens the First Flue from below when asked, and the Cinder Ward side has a way down at last', async () => {
      const j = await toFire();
      await Ds.speak(j);
      Ds.num(j, 'ds_accord', ['party'], 2);
      expect(City.state(j, 'ds_flue_gate', 'ds_damper')).toBe(true);
      Ds.at(j, 'flue_foot');
      expect(j.matches('First Flue').filter(m => /Up/.test(m.label)).length).toBe(0);
      Ds.at(j, 'hearth_below');
      await Ds.ask(j, 'Ask the Fire to let you climb the First Flue');
      expect(City.state(j, 'ds_flue_gate', 'ds_drawn')).toBe(true);
      Ds.at(j, 'flue_foot');
      await j.step('^Up to the First Flue|First Flue');
      expect(j.at('party')).toBe(Q('first_flue'));
      await j.step('^Down to the foot of the First Flue|foot of the First Flue');
      expect(j.at('party')).toBe(Q('flue_foot'));
    }, 120000);
    it('hears the Return from a cleric who has read it, and from a company Auberon has told', async () => {
      const j = await toFire(['cleric', 'warrior', 'thief']);
      Ds.put(j, 'assert', 'knows', 'party', 'd_return');
      await Ds.speak(j);
      expect(j.matches('Say the Return').length).toBe(0);
      Ds.put(j, 'assert', 'knows', 'party', 'd_return_3');
      expect(j.matches('Say the Return').length).toBe(1);
      await Ds.ask(j, 'Say the Return');
      expect(Ds.accord(j)).toBe(3);
      expect(Ds.rel(j, 'fireFed')).toBe(true);
      expect(Ds.mood(j, 'ds_tender')).toBe(false);
      const k = await toFire(['warrior', 'warrior', 'thief']);
      await Ds.speak(k);
      expect(k.matches('Say the Return').length).toBe(0);
      Ds.put(k, 'assert', 'returnSaid', 'party');
      await Ds.ask(k, 'Say the Return');
      expect(Ds.accord(k)).toBe(3);
    }, 120000);
    it('takes a Lent coal differently as it is named: Pip\'s grandmother, Pip, or nobody', async () => {
      const take = async (rel?: string) => {
        const j = await toFire();
        Ds.num(j, 'quantity', ['party', 'coal'], 1); Ds.num(j, 'coalExpires', ['party'], 99999);
        if (rel) { Ds.put(j, 'assert', rel, 'party'); }
        await Ds.speak(j);
        const label = rel === 'coalNamedGran' ? 'Lay the Lent coal in the ash, and say whose it was' :
          rel === 'coalNamedPip' ? 'Lay the Lent coal in the ash, and say whose child' : 'Lay the Lent coal in the ash, with nothing';
        await Ds.ask(j, label);
        expect(j.measure('quantity', 'party', 'coal')).toBe(0);
        expect(Ds.rel(j, 'fireFed')).toBe(true);
        return Ds.accord(j);
      };
      expect(await take('coalNamedGran')).toBe(3);
      expect(await take('coalNamedPip')).toBe(2);
      expect(await take()).toBe(1);
    }, 180000);
    it('counts the names of the burned as they are read: four hundred is a payment, eleven hundred the whole of it', async () => {
      const j = await toFire();
      await Ds.speak(j);
      expect(j.matches('Read the Fire the names').length).toBe(0);
      Ds.num(j, 'ds_read', ['party'], 3);
      expect(Ds.accord(j)).toBe(0);
      Ds.num(j, 'ds_read', ['party'], 4);
      await j.step('Wait › A while');
      expect(Ds.accord(j)).toBe(2);
      expect(Ds.rel(j, 'fireFed')).toBe(true);
      expect(City.pages(j)).toContain('I knew the Aldens');
      Ds.num(j, 'ds_read', ['party'], 11);
      await j.step('Wait › A while');
      expect(Ds.accord(j)).toBe(5);
      expect(Ds.mood(j, 'ds_tender')).toBe(true);
      expect(City.pages(j)).toContain('You have missed one');
    }, 120000);
    it('accepts an apology from the one who owes it, and a lesser one from the company', async () => {
      const j = await toFire();
      await Ds.speak(j);
      Ds.put(j, 'assert', 'following', 'prewitt', 'party');
      await Ds.ask(j, 'Let Sedley Prewitt say what he has done');
      expect(Ds.accord(j)).toBe(3);
      expect(City.pages(j)).toContain('That is the right man');
      expect(j.matches('Let Sedley Prewitt say').length).toBe(0);
      const k = await Ds.start();
      await k.play(...City.slip);
      Ds.at(k, 'hearth_below');
      await Ds.speak(k);
      await Ds.ask(k, 'Say, for the company');
      expect(Ds.accord(k)).toBe(1);
      Ds.put(k, 'assert', 'following', 'ottoline', 'party');
      Ds.put(k, 'assert', 'at', 'ottoline', 'hearth_below');
      await Ds.ask(k, 'Let Ottoline Prewitt say what they owe');
      expect(Ds.accord(k)).toBe(3);
    }, 180000);
    it('is warned of before it is angered, and sat with to be calmed', async () => {
      const j = await toFire();
      await Ds.speak(j);
      await Ds.ask(j, 'Offer the Fire coin');
      expect(Ds.slight(j)).toBe(1);
      expect(Ds.mood(j, 'ds_wary')).toBe(true);
      expect(City.pages(j)).toContain('You have mistaken me');
      await Ds.ask(j, 'Tell the Fire what the company will do');
      expect(Ds.slight(j)).toBe(2);
      expect(City.pages(j)).toContain('I am counting');
      expect(Ds.rel(j, 'fireWrathful')).toBe(false);
      await Ds.ask(j, 'Sit down in the ash');
      expect(Ds.slight(j)).toBe(1);
      expect(Ds.rel(j, 'fireWrathful')).toBe(false);
    }, 120000);
    it('begins the Burning for a company that bribes it and threatens it and will not be told', async () => {
      const j = await toFire(['warrior', 'cleric', 'thief'], 2);
      await Ds.speak(j);
      await Ds.ask(j, 'Offer the Fire coin');
      await Ds.ask(j, 'Tell the Fire what the company will do');
      await Ds.ask(j, 'Offer the Fire coin');
      expect(Ds.slight(j)).toBe(3);
      expect(Ds.rel(j, 'fireWrathful')).toBe(true);
      expect(Ds.mood(j, 'ds_wrathful')).toBe(true);
      expect(j.matches('Sit down in the ash').length).toBe(0);
      expect(j.matches('Ask the Fire for leave').length).toBe(0);
      expect(Ds.rel(j, 'fireTerms')).toBe(false);
    }, 120000);
    it('gives terms to a company it is tender with: a Night, a Hearthkeeper, an average', async () => {
      const j = await toFire();
      await Ds.speak(j);
      expect(j.matches('Promise the Fire a Night').length).toBe(0);
      Ds.num(j, 'ds_accord', ['party'], 5);
      await j.step('^the Fire.*: Ask the Fire what it would take');
      expect(Ds.mood(j, 'ds_tender')).toBe(true);
      await Ds.ask(j, 'Promise the Fire a Night: once every year');
      expect(Ds.rel(j, 'fireTermNight')).toBe(true);
      expect(Ds.rel(j, 'fireTerms')).toBe(true);
      expect(Ds.rel(j, 'ds_night_witnessed')).toBe(false);
      expect(Ds.rel(j, 'fireTermAverage')).toBe(false);
    }, 120000);
    it('takes the names of those who will keep the Night, if there are some', async () => {
      const j = await toFire();
      await Ds.speak(j);
      Ds.num(j, 'ds_accord', ['party'], 5);
      Ds.num(j, 'witnessCount', ['city'], 2);
      await j.step('^the Fire.*: Ask the Fire what it would take');
      await Ds.ask(j, 'Promise the Fire a Night, and give it the names');
      expect(Ds.rel(j, 'fireTermNight')).toBe(true);
      expect(Ds.rel(j, 'ds_night_witnessed')).toBe(true);
    }, 120000);
    it('consents to a general average if the company knows the Ward is declined', async () => {
      const j = await toFire();
      await Ds.speak(j);
      Ds.num(j, 'ds_accord', ['party'], 7);
      await j.step('^the Fire.*: Ask the Fire what it would take');
      expect(j.matches('Tell the Fire the Cinder Ward').length).toBe(0);
      Ds.put(j, 'assert', 'knows', 'party', 'd_decline_roll');
      await Ds.ask(j, 'Tell the Fire the Cinder Ward');
      expect(Ds.rel(j, 'fireTermAverage')).toBe(true);
      expect(Ds.rel(j, 'fireTerms')).toBe(true);
    }, 120000);
    it('keeps Prewitt, or Tobias, or Auberon, as Hearthkeeper, and does not give them back', async () => {
      const j = await toFire();
      await Ds.speak(j);
      Ds.put(j, 'assert', 'following', 'prewitt', 'party');
      await Ds.ask(j, 'Let Sedley Prewitt say what he has done');
      Ds.num(j, 'ds_accord', ['party'], 5);
      await j.step('^the Fire.*: Ask the Fire what it would take');
      await Ds.ask(j, 'Let Sedley Prewitt stay');
      expect(Ds.rel(j, 'fireTermKeeper')).toBe(true);
      expect(j.holds('following', Q('prewitt'), 'party')).toBe(false);
      expect(j.at(Q('prewitt'))).toBe(Q('hearth_below'));
      expect(j.holds(Q('ds_stays'), Q('prewitt'))).toBe(true);
      const k = await toFire();
      await Ds.speak(k);
      Ds.num(k, 'ds_accord', ['party'], 5);
      await k.step('^the Fire.*: Ask the Fire what it would take');
      expect(k.matches('Let old Auberon Hearn stay').length).toBe(0);
      Ds.put(k, 'assert', 'following', 'auberon', 'party');
      await Ds.ask(k, 'Let old Auberon Hearn stay');
      expect(k.at(Q('auberon'))).toBe(Q('hearth_below'));
      const m = await toFire();
      await Ds.speak(m);
      Ds.num(m, 'ds_accord', ['party'], 5);
      await m.step('^the Fire.*: Ask the Fire what it would take');
      Ds.put(m, 'assert', 'tobiasWilling', 'party');
      Ds.put(m, 'assert', 'travelsWith', 'tobias', 'party');
      await Ds.ask(m, 'Let Tobias Pargeter stay');
      expect(Ds.rel(m, 'fireTermKeeper')).toBe(true);
    }, 180000);
    it('gives two coals, from the sixth day, to a company it counts itself paid by', async () => {
      const j = await toFire();
      await Ds.speak(j);
      Ds.num(j, 'ds_accord', ['party'], 3);
      await Ds.ask(j, 'Sit down in the ash');
      await Ds.ask(j, 'Sit down in the ash');
      await Ds.ask(j, 'Sit down in the ash');
      expect(j.matches('Ask the Fire for coals').length).toBe(0);
      Ds.at(j, 'glass_street');
      await j.step('=day 7 09:00');
      Ds.at(j, 'hearth_below');
      await Ds.ask(j, 'Ask the Fire for coals');
      expect(j.measure('quantity', 'party', 'coal')).toBe(2);
      expect(j.matches('Ask the Fire for coals').length).toBe(0);
    }, 180000);
    it('is slain by a company strong enough, and that is ruinous: nothing else is asked of it again', async () => {
      const j = await toFire(['warrior', 'warrior', 'warrior'], 10);
      await Ds.speak(j);
      await j.step('^the Fire.*: Attack');
      expect(j.holds('dead', Q('ds_fire'))).toBe(true);
      expect(Ds.rel(j, 'fireSlain')).toBe(true);
      expect(Ds.rel(j, 'fireTerms')).toBe(false);
    }, 180000);
    it('is not slain by a company of the usual strength, who lose the fight', async () => {
      const j = await toFire(['warrior', 'cleric', 'thief'], 3);
      await j.step('^the Fire.*: Attack');
      expect(j.holds('dead', Q('ds_fire'))).toBe(false);
      expect(Ds.rel(j, 'fireSlain')).toBe(false);
      expect(j.holds('able', 'party')).toBe(false);
    }, 120000);
  });
});

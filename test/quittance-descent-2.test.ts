import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';
import { Ds } from './support/quittance-descent';

// The Descent, continued from quittance-descent.test.ts: the Fire, spoken to, sat with, paid, angered, and slain.
// As there, the company is set down where a scene begins with a fact or two written into the world.
describe('Quittance: the Descent', () => {
  describe('the Fire', () => {
    it('is spoken to, and says what it is owed, and does not strike', async () => {
      const j = await Ds.toFire();
      expect(Ds.rel(j, 'fireHeard')).toBe(false);
      await Ds.speak(j);
      expect(Ds.rel(j, 'fireHeard')).toBe(true);
      expect(Ds.mood(j, 'ds_owed')).toBe(true);
      expect(Ds.rel(j, 'fireFed')).toBe(false);
      await Ds.ask(j, 'Ask the Fire what it is owed');
      expect(City.pages(j)).toContain('I do not complain. I count.');
    }, 120000);
    it('is sat with: three hours is a payment, the heat is the price, and the leave is the answer', async () => {
      const j = await Ds.toFire();
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
      const j = await Ds.toFire();
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
      const j = await Ds.toFire(['cleric', 'warrior', 'thief']);
      Ds.put(j, 'assert', 'knows', 'party', 'd_return');
      await Ds.speak(j);
      expect(j.matches('Say the Return').length).toBe(0);
      Ds.put(j, 'assert', 'knows', 'party', 'd_return_3');
      expect(j.matches('Say the Return').length).toBe(1);
      await Ds.ask(j, 'Say the Return');
      expect(Ds.accord(j)).toBe(3);
      expect(Ds.rel(j, 'fireFed')).toBe(true);
      expect(Ds.mood(j, 'ds_tender')).toBe(false);
      const k = await Ds.toFire(['warrior', 'warrior', 'thief']);
      await Ds.speak(k);
      expect(k.matches('Say the Return').length).toBe(0);
      Ds.put(k, 'assert', 'returnSaid', 'party');
      await Ds.ask(k, 'Say the Return');
      expect(Ds.accord(k)).toBe(3);
    }, 120000);
    it('takes a Lent coal differently as it is named: Pip\'s grandmother, Pip, or nobody', async () => {
      const take = async (rel?: string) => {
        const j = await Ds.toFire();
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
      const j = await Ds.toFire();
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
      const j = await Ds.toFire();
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
      const j = await Ds.toFire();
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
      const j = await Ds.toFire(['warrior', 'cleric', 'thief'], 2);
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
  });
});

describe('Quittance: the Descent', () => {
  describe('the Fire, continued', () => {
    it('gives terms to a company it is tender with: a Night, a Hearthkeeper, an average', async () => {
      const j = await Ds.toFire();
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
      const j = await Ds.toFire();
      await Ds.speak(j);
      Ds.num(j, 'ds_accord', ['party'], 5);
      Ds.num(j, 'witnessCount', ['city'], 2);
      await j.step('^the Fire.*: Ask the Fire what it would take');
      await Ds.ask(j, 'Promise the Fire a Night, and give it the names');
      expect(Ds.rel(j, 'fireTermNight')).toBe(true);
      expect(Ds.rel(j, 'ds_night_witnessed')).toBe(true);
    }, 120000);
    it('consents to a general average if the company knows the Ward is declined', async () => {
      const j = await Ds.toFire();
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
      const j = await Ds.toFire();
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
      const k = await Ds.toFire();
      await Ds.speak(k);
      Ds.num(k, 'ds_accord', ['party'], 5);
      await k.step('^the Fire.*: Ask the Fire what it would take');
      expect(k.matches('Let old Auberon Hearn stay').length).toBe(0);
      Ds.put(k, 'assert', 'following', 'auberon', 'party');
      await Ds.ask(k, 'Let old Auberon Hearn stay');
      expect(k.at(Q('auberon'))).toBe(Q('hearth_below'));
      const m = await Ds.toFire();
      await Ds.speak(m);
      Ds.num(m, 'ds_accord', ['party'], 5);
      await m.step('^the Fire.*: Ask the Fire what it would take');
      Ds.put(m, 'assert', 'tobiasWilling', 'party');
      Ds.put(m, 'assert', 'travelsWith', 'tobias', 'party');
      await Ds.ask(m, 'Let Tobias Pargeter stay');
      expect(Ds.rel(m, 'fireTermKeeper')).toBe(true);
    }, 180000);
    it('gives two coals, from the sixth day, to a company it counts itself paid by', async () => {
      const j = await Ds.toFire();
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
      const j = await Ds.toFire(['warrior', 'warrior', 'warrior'], 10);
      await Ds.speak(j);
      await j.step('^the Fire.*: Attack');
      expect(j.holds('dead', Q('ds_fire'))).toBe(true);
      expect(Ds.rel(j, 'fireSlain')).toBe(true);
      expect(Ds.rel(j, 'fireTerms')).toBe(false);
    }, 180000);
    it('is not slain by a company of the usual strength, who lose the fight', async () => {
      const j = await Ds.toFire(['warrior', 'cleric', 'thief'], 3);
      await j.step('^the Fire.*: Attack');
      expect(j.holds('dead', Q('ds_fire'))).toBe(false);
      expect(Ds.rel(j, 'fireSlain')).toBe(false);
      expect(j.holds('able', 'party')).toBe(false);
    }, 120000);
  });
});

import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

// The Lamplighter's Round (doc/adventures/quittance/quests/lamplighter.md): Hob Tansy's last dusk in the Glass
// Quarter, four lamps each dark for a different reason, five ways to retire an old man, and the pilot-flames.
const row = [...City.honest, '>quittance__foundry_row'];
const meet = ['Talk to Hob Tansy', 'what he is doing with that pole', 'about the four lamps'];
const walk = [...meet, 'Offer to walk', '?Take your leave'];
const tinkers = ['>quittance__round_tinkers', 'Buy a gas mantle', 'Knot a new mantle', 'Light the Tinkers'];
const steps = ['>quittance__round_steps', 'Swing the Steps lamp to light the stair', 'Light the Stokers'];
const glaziers = ['>quittance__round_glaziers', "Hold Hob's taper", 'Light the Glaziers'];
const wharf = ['>quittance__round_furnace', 'Ask Nan why', 'Sit by the lamp-house', 'Light the Furnace Wharf lamp'];
const round = [...tinkers, ...steps, ...glaziers, ...wharf];
const breath = ['Wait › A while', 'Wait › A while', 'Wait › A while'];
const L = (j: any, id: string) => City.state(j, id, 'lit');
const done = (j: any, ...rels: string[]) => rels.forEach(r => expect(City.has(j, r, 'hob')).toBe(true));

describe('Quittance: the Lamplighter\'s Round', () => {
  it('finds Hob on Foundry Row at dusk, and not by day', async () => {
    const j = await City.start();
    await j.play(...row);
    expect(j.find('Talk to Hob')).toBeUndefined();
    await j.play('=day 1 17:00');
    expect(j.find('Talk to Hob')).toBeDefined();
    expect(City.pages(j)).toContain('old man');
    await j.play('=day 1 21:00');
    expect(j.find('Talk to Hob')).toBeUndefined();
  }, 120000);

  it('is chalked on the Slate and also met in the street', async () => {
    const j = await City.start();
    await j.play(...City.slip, '=day 1 09:00');
    await j.play('^Wait › A while');
    expect(City.knows(j, 'll_claim')).toBe(true);
    const k = await City.start();
    await k.play(...row, '=day 1 17:00', 'Talk to Hob Tansy', 'what he is doing with that pole');
    expect(City.knows(k, 'll_claim')).toBe(true);
  }, 120000);

  it('walks the round with Hob, lights all four, and the company sees the pilots breathe in step', async () => {
    const j = await City.start();
    await j.play(...row, '=day 2 17:00', ...walk);
    expect(City.has(j, 'll_walking', 'hob')).toBe(true);
    await j.play(...round);
    for (const l of ['ll_lamp_t', 'll_lamp_s', 'll_lamp_g', 'll_lamp_f']) { expect(L(j, l)).toBe(true); }
    expect(City.has(j, 'll_roundDone', 'hob')).toBe(true);
    expect(City.knows(j, 'd_pilots_step')).toBe(false);
    await j.play(...breath);
    expect(City.knows(j, 'd_pilots_step')).toBe(true);
    expect(City.state(j, 'll_lamp_f', 'lit')).toBe(true);
    expect(City.said(j)).toContain('Every lamp in the Quarter goes out in the same instant');
    expect(City.said(j)).toContain('all of them are lit again, together');
  }, 180000);

  it('does not teach the pilots when the company is not there to see the breath', async () => {
    const j = await City.start();
    await j.play(...row, '=day 2 17:00', ...walk, ...round);
    await j.play('>quittance__brick_lane');
    await j.play('=+12');
    expect(City.knows(j, 'd_pilots_step')).toBe(false);
    await j.play('>quittance__foundry_row', ...breath);
    expect(City.knows(j, 'd_pilots_step')).toBe(true);
  }, 180000);

  it('puts out the lamps at dawn, so that the Round is a thing done at dusk', async () => {
    const j = await City.start();
    await j.play(...row, '=day 2 17:00', ...walk, ...round, ...breath, '=day 3 09:00');
    expect(City.state(j, 'll_lamp_t', 'ready')).toBe(true);
    expect(City.state(j, 'll_lamp_s', 'ready')).toBe(true);
  }, 180000);

  it('lets Hob tell what he knows only after he has been walked two lamps, and teaches the pilots only on sight', async () => {
    const j = await City.start();
    await j.play(...row, '=day 2 17:00', ...walk, 'Ask Hob whether the lamps ever do anything odd');
    expect(City.has(j, 'll_told', 'hob')).toBe(false);
    expect(City.said(j)).toContain('Lamps do what lamps do');
    await j.play('?Take your leave', ...tinkers, ...steps, 'Talk to Hob Tansy', 'what it is he hasn.t said');
    expect(City.has(j, 'll_told', 'hob')).toBe(true);
    expect(City.knows(j, 'd_pilots_step')).toBe(false);
  }, 180000);

  describe('the lamps, each its own kind of problem', () => {
    it('Tinkers\' Court: a mantle, bought', async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 17:00', ...walk, '>quittance__round_tinkers');
      expect(City.state(j, 'll_lamp_t', 'dead')).toBe(true);
      const gold = City.gold(j);
      await j.play('Buy a gas mantle', 'Knot a new mantle');
      expect(City.gold(j)).toBe(gold - 2);
      expect(City.state(j, 'll_lamp_t', 'ready')).toBe(true);
    }, 120000);
    it('Tinkers\' Court: a mantle, found in the Hall\'s locked locker by lockwork', async () => {
      const j = await City.start();
      await j.play(...row, '>quittance__lamplighters_hall');
      expect(City.state(j, 'll_locker', 'locked')).toBe(true);
      await j.play("Pick the stores locker", '^Take', '>quittance__round_tinkers', 'Knot a new mantle');
      expect(City.state(j, 'll_lamp_t', 'ready')).toBe(true);
    }, 120000);
    it('Stokers\' Steps: for the widow, for the pawnbroker, or two lamps at five coin', async () => {
      for (const [label, rel] of [['Swing the Steps lamp to light the stair', 'll_sideSteps'], ['Swing the Steps lamp to light the pawnbroker', 'll_sideShop'], ['Pay the Company for a second bracket', 'll_sideBoth']]) {
        const j = await City.start();
        await j.play(...row, '>quittance__round_steps', 'Talk to Mrs Strood', 'what the quarrel is', '?Take your leave', 'Talk to Mr Beadle', 'what the quarrel is', '?Take your leave');
        const gold = City.gold(j), gasco = City.regard(j, 'gasco');
        await j.play(label);
        expect(City.state(j, 'll_lamp_s', 'ready')).toBe(true);
        done(j, rel);
        expect(City.regard(j, 'gasco')).toBe(rel === 'll_sideBoth' ? gasco + 1 : gasco);
        if (rel === 'll_sideBoth') { expect(City.gold(j)).toBe(gold - 5); }
        await j.play('Wait › A while');
        expect(City.pages(j)).toMatch(/shelling peas|fiddles|Two lamps on the Steps/);
      }
    }, 240000);
    it('Stokers\' Steps: sharing the lamp-rate is a hard persuasion with one try, and a failure leaves the quarrel', async () => {
      const j = await City.start();
      await j.play(...row, '>quittance__round_steps');
      expect(j.find('Talk both of them into sharing')).toBeDefined();
      await j.play('?Talk both of them into sharing');
      const ok = City.has(j, 'll_sideBoth', 'hob');
      expect(City.state(j, 'll_lamp_s', ok ? 'ready' : 'quarrel')).toBe(true);
      expect(j.find('Talk both of them into sharing')).toBeUndefined();
      expect(j.find('Swing the Steps lamp to light the stair') !== undefined).toBe(!ok);
    }, 120000);
    it('Glaziers\' Passage: the lamp will not take the tinder; the shed flame will give a taper', async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 17:00', ...walk, '>quittance__round_glaziers', 'Light the corner lamp from the tinder-box');
      expect(City.state(j, 'll_lamp_g', 'out')).toBe(true);
      expect(City.has(j, 'll_tinderTried', 'hob')).toBe(true);
      await j.play("Hold Hob's taper");
      expect(City.state(j, 'll_lamp_g', 'ready')).toBe(true);
      expect(City.state(j, 'll_shed', 'given')).toBe(true);
    }, 120000);
    it('Furnace Wharf: the child is found, and four ways bring her down', async () => {
      for (const step of ['Coax Nan down', 'Climb the ladder', 'Sit by the lamp-house', 'Ask Hob to tell Nan']) {
        const j = await City.start();
        await j.play(...row, '=day 2 17:00', ...walk);
        if (step.startsWith('Ask Hob')) { await j.play(...tinkers, ...steps, '>quittance__round_furnace'); } else { await j.play('>quittance__round_furnace'); }
        expect(City.knows(j, 'll_nan_hid')).toBe(true);
        expect(City.state(j, 'll_lamp_f', 'occupied')).toBe(true);
        await j.play(`?${step}`);
        const out = City.state(j, 'll_lamp_f', 'ready');
        if (step.startsWith('Sit') || step.startsWith('Ask Hob')) { expect(out).toBe(true); }
        if (out) { done(j, 'll_childOut'); }
        if (!out) { expect(City.state(j, 'll_lamp_f', 'occupied')).toBe(true); }
        if (step.startsWith('Ask Hob')) { expect(City.has(j, 'll_moved', 'hob')).toBe(true); }
      }
    }, 300000);
    it('will not light a lamp with a child in it', async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 17:00', ...walk, '>quittance__round_furnace');
      expect(j.find('Light the Furnace Wharf lamp')).toBeUndefined();
    }, 120000);
    it('will not light a lamp by day', async () => {
      const j = await City.start();
      await j.play(...row, '>quittance__round_tinkers', 'Buy a gas mantle', 'Knot a new mantle');
      expect(j.find('Light the Tinkers')).toBeUndefined();
    }, 120000);
  });

  describe('how an old man is retired', () => {
    const lit = async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 17:00', ...meet, '?Take your leave', '>quittance__gas_yard', 'Talk to Foreman Gudgeon', 'pays a lamplighter anything', '?Take your leave',
        '>quittance__foundry_row', 'Offer to walk', '?Take your leave', ...round, ...breath);
      return j;
    };
    it('pension: the Company\'s, refused to his face, kept as a thing that was offered; the Company is pleased', async () => {
      const j = await lit(), gasco = City.regard(j, 'gasco');
      await j.play('>quittance__lamplighters_hall', 'Talk to Hob Tansy');
      const from = j.taken.length;
      await j.play('Put the Gas Company');
      expect(City.pages(j, from)).toContain('does not move his head');
      done(j, 'll_ended', 'll_howPension', 'll_bitter');
      expect(City.regard(j, 'gasco')).toBe(gasco + 1);
      expect(City.has(j, 'keeper', 'glass')).toBe(false);
      expect(City.has(j, 'witness', 'hob')).toBe(false);
      await j.play('Ask Hob how he does');
      expect(City.said(j, from)).toContain('What\'s the time');
    }, 240000);
    it('a place at the Hall: the title and the chair, which he hates', async () => {
      const j = await lit();
      await j.play('>quittance__lamplighters_hall', 'Talk to Warden Quoyle', 'what the Hall will do for Hob', '?Take your leave',
        'Talk to Warden Quoyle', 'Ask the Warden to give Hob the chair');
      done(j, 'll_ended', 'll_howPlace', 'll_bitter');
      expect(City.said(j)).toContain('Keeper of the Tinder-boxes');
      expect(City.has(j, 'keeper', 'glass')).toBe(false);
      await j.play('Ask Hob how he does in the chair');
      expect(City.said(j)).toContain('It\'s a good chair');
    }, 240000);
    it('left to finish: he lights the Steps by smell and breaks his wrist on the fiftieth; and says what he knows', async () => {
      const j = await City.start();
      await j.play(...row, '=day 5 17:00', ...walk, ...tinkers, '>quittance__round_steps', 'Give Hob the taper, step back');
      done(j, 'll_ended', 'll_howFinish', 'll_hurt', 'll_moved');
      expect(City.has(j, 'keeper', 'glass')).toBe(false);
      await j.play(">quittance__lamplighters_hall");
      expect(City.pages(j)).toContain('splinted');
    }, 240000);
    it('told plainly: he hands over the taper and the Round; the Hall shuts its book; the Gas Company is slighted', async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 17:00', 'Talk to Hob Tansy', 'what he is doing with that pole', 'Tell Hob plainly');
      done(j, 'll_handed', 'll_howPlain', 'll_hallClosed', 'll_told');
      expect(City.has(j, 'll_slighted_gasco', 'party')).toBe(true);
      await j.play('?Take your leave', ...round, ...breath);
      expect(City.knows(j, 'd_pilots_step')).toBe(true);
      await j.play('>quittance__lamplighters_hall');
      expect(City.pages(j)).toContain('NOT OPEN');
      await j.play('=day 3 09:00', 'Ask Hob how it is to be told');
      expect(City.said(j)).toContain('Cold');
    }, 300000);
    it('the hearth: sweep the Hall\'s flue, move Hob with what he saw, and he keeps the fire for the Night', async () => {
      const j = await lit();
      await j.play("Ask Hob what he", '?Take your leave').catch(() => undefined);
      await j.play('Talk to Hob Tansy', 'what it is he hasn.t said', '?Take your leave');
      expect(City.has(j, 'keeper', 'glass')).toBe(false);
      await j.play('Talk to Hob Tansy', 'Tell Hob what you saw');
      done(j, 'll_moved');
      await j.play('Ask Hob whether he would say', '?Take your leave');
      expect(City.has(j, 'witness', 'hob')).toBe(true);
      await j.play('>quittance__lamplighters_hall', 'Talk to Warden Quoyle', 'whether the Hall could keep its old hearth', '?Take your leave', 'Sweep the Lamplighters');
      expect(City.has(j, 'll_flueClear', 'hob')).toBe(true);
      await j.play('Talk to Warden Quoyle', 'Tell the Warden the flue is clear', '?Take your leave', 'Talk to Hob Tansy', 'Ask Hob to light the Hall');
      done(j, 'll_ended', 'll_howHearth');
      expect(City.has(j, 'keeper', 'glass')).toBe(true);
      expect(City.has(j, 'witness', 'hob')).toBe(true);
      expect(City.said(j)).toContain('Keeper,');
      await j.play('Ask Hob how the hearth draws');
      expect(City.said(j)).toContain('Like a good dog');
      expect(City.arc(j, 'gaunt')).toBe(0);
    }, 300000);
    it('the hearth is not offered to a company that told him plainly, nor before the flue is swept', async () => {
      const j = await lit();
      await j.play('>quittance__lamplighters_hall');
      expect(j.find('Ask Hob to light the Hall')).toBeUndefined();
    }, 240000);
  });

  describe('the world without the company', () => {
    it('on the last night Hob walks the Round alone and falls on the Steps', async () => {
      const j = await City.start();
      await j.play(...row, '=day 5 22:00');
      done(j, 'll_ended', 'll_howFell', 'll_hurt');
      expect(City.said(j)).toContain('misses the fiftieth step');
      await j.play('>quittance__lamplighters_hall', 'Ask Hob how he comes to be here');
      expect(City.said(j)).toContain('fell off the Steps');
      expect(City.regard(j, 'gasco')).toBe(0);
    }, 240000);
    it('a company that began the Round and let it lapse is marked by the Gas Company', async () => {
      const j = await City.start();
      await j.play(...row, '=day 5 17:00', ...walk, '=day 5 22:00');
      done(j, 'll_ended');
      expect(City.has(j, 'll_slighted_gasco', 'party')).toBe(true);
      expect(City.regard(j, 'gasco')).toBe(0);
    }, 240000);
    it('a Round done early and never decided is closed by the notice, and Hob is bitter', async () => {
      const j = await City.start();
      await j.play(...row, '=day 2 17:00', ...walk, ...round, '=day 5 22:00');
      done(j, 'll_ended', 'll_howDrift', 'll_bitter');
    }, 300000);
  });
});

import { describe, expect, it } from 'bun:test';
import { Gaunt, build, phases } from './support/gaunt';

// A Winter in Carth's smaller journeys: the ways through the night at Carth, and the city's strands one at a time.
// Each starts at the Penitent's Cross and plays only what it needs.
const custody = ['Talk to Beadle', 'Ask the beadle what the commission', 'Take Ninian Hern into your custody'];
const reeve = ['Into the vigil-house', 'Talk to Raistrick', 'Ask Raistrick what he keeps', 'Ask Raistrick whose', 'Out to the road'];
const walk = (sorry = 'Tell him: yes. That is what love is', dead = 'Tell him: their names', fork = 'Call after him: neither') =>
  ['To the Proxy\'s Stone', sorry, dead, 'To the Drove Fork', fork, 'To the top of Carth Fell', 'To the yard at Carth', 'Into the house at Carth'];
const down = ['=139', 'Out to the yard', 'To the road across the Levels', 'To the Fell Gate'];
const paid = ['To the Row', 'To the Long Shambles', 'To the Stand', 'Hire a proxy', 'To the Long Shambles'];

describe('A Winter in Carth: the night at Carth, every way through it', () => {
  it('refused at the Cross, Hern is at Carth before you, and walks into Gaunt by himself on Shrove Monday', async () => {
    const g = await Gaunt.start();
    await g.play('Talk to Beadle', 'Ask the beadle what the commission', 'Tell the beadle you will not', 'To the Proxy\'s Stone',
      'To the Drove Fork', 'To the top of Carth Fell', 'To the yard at Carth', 'Into the house at Carth');
    expect(g.page).toMatch(/I’ll go on up; you’ll catch me up, or you won’t/);
    expect(g.at('hern')).toBe('house_place');
    // No road questions for a company that did not walk with him.
    expect(g.holds('askedSorry', 'party')).toBe(false);
    await g.until(220);
    expect(g.holds('hernGaoled', 'hern')).toBe(true);
  }, 180000);

  it('let go at the Drove Fork, he is gone; with nobody at Carth to give the child a coat, the child does not wake; the Consistory sits to an empty floor', async () => {
    const g = await Gaunt.start();
    await g.play(...custody, 'To the Proxy\'s Stone', 'Tell him: no. Sorrow is your own', 'Tell him: nothing', 'To the Drove Fork',
      'Let him go down the drovers', 'To the top of Carth Fell', 'To the yard at Carth', 'Into the house at Carth', '=139');
    expect(g.holds('hernFled', 'hern')).toBe(true);
    expect(g.holds('dowsieDead', 'dowsie')).toBe(true);
    expect(g.page).toMatch(/she is not rocking her/);
    await g.until();
    expect(g.ending()).toEqual(['the_flight']);
    expect(g.page).toMatch(/Dowsie Scaife lies in the byre at Carth beside her grandfather/);
  }, 240000);

  it('the letter of the vigil: the hearth lit at dusk, raked and packed with snow before three, and lit again when the Ash-reeve has gone', async () => {
    const g = await Gaunt.start();
    await g.play(...phases('letter').road!, ...phases('letter').carth!);
    expect(g.page).toMatch(/‘Wet,’ he says\. ‘Cold\.’/);
    expect(g.holds('vigilBroken', 'carth_vigil')).toBe(false);
    expect(g.holds('dowsieSafe', 'dowsie')).toBe(true);
    expect(g.holds('hernCoat', 'hern')).toBe(false);
    expect(g.page).toMatch(/‘Kept,’ he says, as if trying the word for weight/);
    await g.play(...phases('letter').down!);
    // The fire was lit, and the vigil was kept, so nobody owes it.
    expect(g.measure('pains', 'party')).toBe(1);
  }, 240000);

  it('for a thief, a lie to the Ash-reeve about a child\'s fever: told well it holds, told badly it does not', async () => {
    const g = await Gaunt.start(build('thief'), 'g2');
    await g.play(...custody, ...walk('Tell him: it is a trade', 'Tell him: nothing'), '=72', 'Strike a light from the tinderbox', '=114',
      'Tell the man at the hearth the warmth is the child');
    await g.play('=120');
    const held = g.holds('reeveDeceived', 'raistrick');
    expect(g.holds('vigilBroken', 'carth_vigil')).toBe(!held);
    expect(g.page).toMatch(held ? /I’ve known a fever warm a stone/ : /A child’s fever doesn’t make a fire/);
  }, 240000);

  it('for a ranger, the beasts brought in from the byre: no fire, and enough', async () => {
    const g = await Gaunt.start(build('ranger'), 'g1');
    await g.play(...custody, ...walk(), '=72', 'Bring the cow and the calf', '=140');
    expect(g.holds('beastsIn', 'carth_vigil')).toBe(true);
    expect(g.holds('dowsieSafe', 'dowsie')).toBe(true);
    expect(g.holds('hernCoat', 'hern')).toBe(false);
    expect(g.holds('vigilBroken', 'carth_vigil')).toBe(false);
    expect(g.page).toMatch(/You can’t let a fire go out that’s a cow|That’s how it was/);
  }, 240000);

  it('Hern tells the Scaifes what he refused: Annis has Will light the fire for her own child, and the debt is the house\'s, not the company\'s', async () => {
    const g = await Gaunt.start();
    await g.play(...custody, 'To the Proxy\'s Stone', 'Tell him: yes. That is what love is', 'Tell him: their names', 'Ask Hern what penance',
      'To the Drove Fork', 'Call after him: neither', 'To the top of Carth Fell', 'To the yard at Carth', 'Into the house at Carth',
      'Talk to Annis', 'Ask Annis Scaife why there is no fire', 'Take your leave', 'Ask Hern to tell the Scaifes', '=140');
    expect(g.page).toMatch(/Let him see what it costs\. Let him sit in it/);
    expect(g.page).toMatch(/Now we’re nothing\. Now we owe/);
    expect(g.holds('vigilBroken', 'carth_vigil')).toBe(true);
    expect(g.holds('brokeVigil', 'party')).toBe(false);
  }, 240000);
});

describe('A Winter in Carth: the city\'s strands', () => {
  it('Thackray keeps one night of his own forty at Carth, and comes back grey, and not sorry any more', async () => {
    const g = await Gaunt.start();
    await g.play(...custody, ...reeve, ...walk(), 'Talk to Annis', 'Ask Annis Scaife why there is no fire', 'Ask Annis who paid', 'Take your leave',
      ...down, ...paid, '=164', 'Into the Wood Exchange', 'Talk to Alderman', 'Ask Alderman Thackray whose forty nights',
      'Ask Alderman Thackray to keep one night', 'Out to the Long Shambles', 'Into the Fat Lamb', 'Take a bed', '=300', 'Out to the Long Shambles',
      'Into the Wood Exchange', 'Talk to Alderman', 'Ask Alderman Thackray about his night');
    expect(g.knows('thackray_vigil')).toBe(true);
    expect(g.holds('nightAtCarth', 'thackray')).toBe(true);
    expect(g.page).toMatch(/Sorry was warm/);
  }, 300000);

  it('the widow\'s thoughts: Abel\'s fast taken over, Joan thinks harder, and on Fastens\' Eve at the Fat Lamb she says it', async () => {
    const g = await Gaunt.start(build('warrior'), 'g1');
    await g.play(...custody, ...walk(), '=90', 'Get into the box-bed', ...down, 'To the Row', 'To the Long Shambles', 'To the Stand',
      'Talk to Abel', 'Ask Abel Lumb whose', 'Ask Abel Lumb why', 'Take Abel Lumb\'s fast', 'To the Long Shambles', 'To Tanners\' Row',
      'Into Mistress Pickersgill', 'Talk to Mistress Joan', 'Ask Mistress Pickersgill about her penances', 'Ask Mistress Pickersgill why she needs',
      'Out to Tanners', 'To the Long Shambles', 'Into the Fat Lamb', 'Take a bed', '=356', 'Bring Abel Lumb to Mistress Pickersgill');
    expect(g.holds('joanThinksHarder', 'joan')).toBe(true);
    expect(g.holds('betrothed', 'joan')).toBe(true);
    expect(g.page).toMatch(/I’ve been paying you to starve for wanting you/);
    await g.until();
    expect(g.page).toMatch(/The banns of Joan Pickersgill, widow, and Abel Lumb, proxy/);
  }, 300000);

  it('the Bishop\'s Wood: the woodmen paid, a sledge loaded at the deadfall before the wolves, and the Row\'s stove lit', async () => {
    const g = await Gaunt.start(build('warrior'), 'g1');
    await g.play(...custody, ...walk(), '=90', 'Get into the box-bed', '=139', 'Out to the yard', 'To the road across the Levels',
      'To the edge of the Bishop', 'Give the Wood-reeve\'s woodmen what', 'To the deadfall', 'Cut and load a sledge', 'sledge of dead wood: Take',
      'To the edge of the Bishop', 'To the road across the Levels', 'To the Fell Gate', 'To the Row', 'Into the Barefoot Hall', 'Talk to Bess',
      'Ask Bess Ackroyd about the Barefoot', 'Give a sledge of dead wood');
    expect(g.holds('broughtWood', 'party')).toBe(true);
    expect(g.page).toMatch(/Let them say it at the Consistory/);
  }, 300000);

  it('the tower: the unbuilding seen from Gaol Lane, Joby told, and the Master of the Fabric\'s bargain taken for the Scaifes\' rent', async () => {
    const g = await Gaunt.start();
    await g.fixture('recant');
    expect(g.measure('pains', 'party')).toBe(0);
    expect(g.page).toMatch(/Remitted,’ he says\. He does not ask how/);
    expect(g.holds('hernHeardHawise', 'hern')).toBe(true);
    expect(g.holds('hernWillLive', 'hern')).toBe(true);
    await g.until();
    expect(g.ending()).toEqual(['the_recantation']);
    expect(g.page).toMatch(/It’s still too salt/);
  }, 400000);
});

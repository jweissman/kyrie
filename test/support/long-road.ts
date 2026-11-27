import { Journey } from '../../src/session/journey';
import { Placed } from './placed';

export const campaign = 'data/adventures/tallow/long-campaign.campaign.json';

export const reflectedLanding = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  Placed.at(j, 'tallow__lc_ring');
  await j.play('Examine the balance beside the arch', 'Place the one-dot weight',
    'Place the three-dot weight', 'Place the five-dot weight',
    'Examine the pool beneath the balanced weights', 'To the reflected landing');
  return j;
};

export const prepared = async (seed = 'long-road') => {
  const j = await Journey.start(campaign, seed);
  await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
    'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
    'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
    'Ask Merren why the road matters', 'Ask Merren what she needs from Swallet', 'Out to Swallet green',
    'Sell the buyer a drawing of the entrances', 'Into the Chandler\'s Arms', 'Tell Merren what happened to the drawing',
    'Give two days of rations to Merren\'s repair crew', '==+60');
  return j;
};

export const convoyOnPortal = async (seed = 'long-road') => {
  const j = await prepared(seed);
  await j.play('Ask Merren who else wants the road',
    'Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal', '==+30',
    'Out to Swallet green', 'Into Usk\'s store', 'Buy › A flask of lamp oil',
    'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration');
  Placed.at(j, 'tallow__gate_house');
  await j.play('To the Calx Way — free the gate-wheel\'s pawl with lamp oil',
    'To the Calx Way — turn the wheel and raise the Calx Gate');
  Placed.at(j, 'tallow__calx_way');
  await j.play('Wait a while');
  Placed.at(j, 'tallow__green');
  await j.play('Hear the Ferryman\'s offer', 'Tell the Ferryman the road runs through the hill');
  Placed.at(j, 'tallow__tally_room');
  await j.play('Ask Cador about the Ferryman\'s food', 'Pay Cador four coin to refuse the Ferryman\'s order');
  Placed.at(j, 'tallow__green');
  await j.play('Into the Chandler\'s Arms', 'Ask Merren who feeds the road guard', 'Out to Swallet green',
    'To Swallet lane', 'To the west road\'s end', 'Buy the Ferryman\'s people out of their food for three coin');
  Placed.at(j, 'tallow__green');
  await j.play(`==${j.measure('lcVanguardDue', 'party') + 19}`);
  return j;
};

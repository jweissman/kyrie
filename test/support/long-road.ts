import { Journey } from '../../src/session/journey';

export const campaign = 'data/adventures/tallow/long-campaign.campaign.json';

export const prepared = async () => {
  const j = await Journey.start(campaign, 'long-road');
  await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
    'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
    'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
    'Ask Merren why the road matters', 'Ask Merren what she needs from Swallet', 'Out to Swallet green',
    'Sell the buyer a drawing of the entrances', 'Into the Chandler\'s Arms',
    'Give two days of rations to Merren\'s repair crew', '==+60');
  return j;
};

import { expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

it('cannot give relief to Tib after he dies', async () => {
  const j = await Journey.start('data/adventures/tallow/long-ford.campaign.json', 'long-road');
  j.put('elland', 'tallow__green');
  j.assert('knows', 'party', 'relief_need');
  Placed.at(j, 'tallow__green');
  expect(j.offers('Give Tib two rations for Sallowfield')).toBe(true);
  j.assert('struckDead', 'elland');
  Consequences.slay(j.campaign as unknown as TickHost);
  j.campaign.refreshProjection();
  expect(j.holds('able', 'elland')).toBe(false);
  expect(j.offers('Give Tib two rations for Sallowfield')).toBe(false);
}, 10000);

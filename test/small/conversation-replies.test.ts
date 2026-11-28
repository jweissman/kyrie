import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayerView } from '../../src/presentation/player-view';
import { Tiny } from '../support/tiny';

const topic = (path: string, id: string) => {
  const source = readFileSync(path, 'utf8');
  const found = source.match(new RegExp(`  Topic ${id} with [\\s\\S]*?\\n  }`));
  if (!found) { throw new Error(`Missing ${id} in ${path}`); }
  return found[0];
};
const yard = `Place yard "the yard" is room at 0, 0 indoors.
  Company party "You" of 1 at yard.`;
const offered = (t: Tiny, id: string) => PlayerView.choices(t.campaign)
  .some(row => (row.action.schema ?? row.action.id) === `t__${id}`);
const refresh = (t: Tiny) => { t.campaign.refreshProjection(); t.look(); };

describe('consequential answers in Hessel and Gosse’s Company', () => {
  it('lets Pyne prepare for an actual impediment, even if it is learned after his fear', async () => {
    const path = 'data/adventures/hessel/banns.kyr';
    const t = await Tiny.start(`${yard}
      Place ebbas "Saint Ebba's" is room at 1, 0 indoors.
      Person pyne "Mr Pyne" at yard { Role "the curate". Peaceable. }
      Discovery rupert_married "Rupert has a wife.".
      Relation pyneReady(group). Relation bannsDone(place). Relation bannsWithdrawn(place).
      ${topic(path, 'pyne_dream')}
      ${topic(path, 'pyne_warned')}
      Goal false.`);
    expect(offered(t, 'pyne_warned')).toBe(false);
    await t.perform('t__pyne_dream');
    expect(offered(t, 'pyne_warned')).toBe(false);
    t.journey.assert('knows', 'party', 'rupert_married');
    refresh(t);
    expect(offered(t, 'pyne_warned')).toBe(true);
    await t.perform('t__pyne_warned');
    expect(t.journey.holds('pyneReady', 'pyne')).toBe(true);
  });

  it('lets Hetty choose to speak on Sunday only with the chairmen’s backing', async () => {
    const path = 'data/adventures/hessel/oldtown.kyr';
    const t = await Tiny.start(`${yard}
      Place ebbas "Saint Ebba's" is room at 1, 0 indoors.
      Person hetty "Hetty Quiney" at yard { Role "a milliner". Peaceable. }
      Person chairmen "the chairmen" at yard { Role "the chairmen". Peaceable. }
      Discovery rupert_married "Rupert has a wife.".
      Initially Assert knows(party, rupert_married).
      Relation hettyWilling(group). Relation hettyChurch(group). Relation stoodWith(group).
      Relation bannsWithdrawn(place). Measure goodwill(group).
      ${topic(path, 'hetty_ultimatum')}
      ${topic(path, 'hetty_church')}
      Goal false.`);
    await t.perform('t__hetty_ultimatum');
    expect(offered(t, 'hetty_church')).toBe(false);
    t.journey.assert('stoodWith', 'party');
    refresh(t);
    expect(offered(t, 'hetty_church')).toBe(true);
    await t.perform('t__hetty_church');
    expect(t.journey.holds('hettyChurch', 'hetty')).toBe(true);
  });

  it('lets the company answer Dorcas with the truth before she leaves', async () => {
    const path = 'data/adventures/gosses-company/troupe.kyr';
    const t = await Tiny.start(`${yard}
      Person dorcas "Dorcas Quaile" at yard { Role "an actor". Peaceable. }
      Discovery fallow_wardrobe "Fallow wants Dorcas for the wardrobe, not the stage.".
      Relation fallowOffered(group). Relation dorcasStays(group). Relation dorcasGone(group).
      Initially Assert fallowOffered(dorcas). Initially Assert knows(party, fallow_wardrobe).
      ${topic(path, 'dorcas_fallow')}
      ${topic(path, 'dorcas_truth')}
      Goal false.`);
    expect(offered(t, 'dorcas_truth')).toBe(false);
    await t.perform('t__dorcas_fallow');
    expect(offered(t, 'dorcas_truth')).toBe(true);
    await t.perform('t__dorcas_truth');
    expect(t.journey.holds('dorcasStays', 'dorcas')).toBe(true);
  });
});

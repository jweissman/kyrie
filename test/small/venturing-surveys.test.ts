import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { Knowing } from '../../src/presentation/knowing';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';

const halls = `
  Place region "the catchment" is region.
  Place distant "the distant country" is region.
  Place town "the town" is settlement within region at 0, 0.
  Place far_town "the far town" is settlement within distant at 0, 0.
  Place hall "the west hall" is room within town at 0, 0 outdoors.
  Place east "the east hall" is room within town at 1, 0 outdoors.
  Place vault "the old vault" is room within town at 2, 0 outdoors.
  Place far_vault "the far vault" is room within far_town at 0, 0 outdoors.
  Company party "You" of 1 at hall.
  Person westkeeper "Westkeeper" at hall { Role "a Guild surveyor". Peaceable. }
  Person eastkeeper "Eastkeeper" at east { Role "a Guild surveyor". Peaceable. }
  Passage lane "the lane" is path between hall and east.
  Passage track "the vault track" is path between east and vault.
  Initially Assert guildHall(hall). Initially Assert guildHall(east).
  Initially Assert guildKeeper(westkeeper). Initially Assert guildKeeper(eastkeeper).
  Initially Assert guildRange(hall, region). Initially Assert guildRange(east, region).
  Initially Assert guild_member(party).
  Kind cup_kind "a silver cup" is treasure worth 5 weighing 1 described "A silver cup.".
  Item cup "the silver cup" is cup_kind at vault.
  Item remote "the distant cup" is cup_kind at far_vault.
  Item sale_cup "the cup for sale" is cup_kind at east.
  Initially Assert forSale(sale_cup).
  Goal false.`;

const rules = ['world', 'venturing'];
const surveyRows = (t: Tiny) => PlayerFrame.of(t.campaign).rows
  .filter(row => row.action.schema === 'guild_survey');

describe('world-backed Venturing Guild surveys', () => {
  it('shares fresh leads across halls, teaches a real location, and guides the chosen expedition through recovery', async () => {
    const t = await Tiny.start(halls, { rules });
    const report = 't__cup__guild_survey';
    expect(surveyRows(t).map(row => row.action.bindings?.find)).toEqual(['t__cup']);
    expect(Knowing.of(t.campaign).teaches(surveyRows(t)[0]!.action)).toBe(true);
    await t.play('Ask Westkeeper for a lead to the silver cup');
    expect(t.journey.holds('knows', 'party', report)).toBe(true);
    expect(t.screen.map.some(place => place.id === 't__vault')).toBe(true);
    t.follow('cup__guild_survey');
    expect(t.gold.map(act => act.choice)).toEqual(['travel:t__vault']);
    await t.play('To the east hall');
    expect(surveyRows(t)).toEqual([]);
    expect(t.journey.find('Ask Eastkeeper for another survey')).toBeDefined();
    expect(t.gold.map(act => act.choice)).toEqual(['exit:t__vault']);
    await t.play('To the old vault', 'Take');
    expect(t.journey.holds('recovered', 'cup')).toBe(true);
    expect(t.screen.aims?.some(aim => aim.id === report)).not.toBe(true);
    await t.play('>t__east', 'Ask Eastkeeper for another survey');
    expect(t.journey.taken.at(-1)?.told).toContain('No fresh local find');
    const other = await Tiny.start(halls, { rules });
    expect(surveyRows(other).map(row => row.action.bindings?.find)).toEqual(['t__cup']);
    expect(other.journey.holds('knows', 'party', report)).toBe(false);
  });

  it('queries new installations after exhaustion and preserves issued leads through save and resume', async () => {
    const t = await Tiny.start(halls, { rules });
    await t.play('Ask Westkeeper for a lead to the silver cup');
    expect(surveyRows(t)).toEqual([]);
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'single/guild-new/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'],
        imports: ['party'], globals: ['party'] }),
      'single/guild-new/site.kyr': `Module fresh "A newly realised site" {
        Entity party: group "Your company".
        Place district "the new district" is region.
        Place ruin "the new ruin" is site within district at 0, 0.
        Place cellar "the new cellar" is room within ruin at 0, 0 outdoors.
        Discovery writing "A mathematical proof cut into a brass disk." { Found by searching cellar. }
        Item disk "the new brass disk" is map at cellar hidden until writing.
        Initially Assert wonder(disk, writing). Initially Assert wonderFrom(disk, from_technological).
      }`,
    });
    await t.campaign.install({ id: 'fresh', bundle: source.resolve('single/guild-new/module.json'), imports: { party: 't.party' },
      within: 't__region' }, source);
    t.look();
    expect(surveyRows(t).map(row => row.action.bindings?.find)).toEqual(['fresh__disk']);
    await t.play('Ask Westkeeper for a lead to the new brass disk');
    const resumed = Journey.of(PlaySession.resume(t.session.checkpoint()));
    expect(resumed.holds('knows', 'party', 'fresh__disk__guild_survey')).toBe(true);
    expect(resumed.campaign.module.objectives?.some(aim => aim.id === 'fresh__disk__guild_survey')).toBe(true);
    expect(resumed.find('Ask Westkeeper for a lead to the new brass disk')).toBeUndefined();
  });

  it('surveys container treasure in a visited place and withdraws a moved report with a warning', async () => {
    const t = await Tiny.start(halls.replace('Item cup "the silver cup" is cup_kind at vault.', `
      Thing chest "the oak chest" at vault { State open "An open chest.". }
      Item cup "the silver cup" is cup_kind nowhere.
      Initially Assert inside(cup, chest). Initially Assert been(party, vault).
      Topic move_chest with westkeeper "Send the chest north" when true once {
        Says "'The chest has gone north.'".
        On discuss { Retract at(chest, vault). Assert at(chest, far_vault). }
      }`), { rules });
    expect(surveyRows(t).map(row => row.action.bindings?.find)).toEqual(['t__cup']);
    await t.play('Ask Westkeeper for a lead to the silver cup');
    t.follow('cup__guild_survey');
    expect(t.gold.map(act => act.choice)).toEqual(['travel:t__vault']);
    await t.play('Send the chest north');
    expect(t.journey.holds('stale', 't__cup__guild_survey')).toBe(true);
    expect(t.journey.holds('guildWarned', 'party', 't__cup__guild_survey')).toBe(true);
    expect(t.journey.taken.at(-1)?.told).toContain("The Guild's survey is out of date");
    expect(t.screen.aims?.some(aim => aim.id === 't__cup__guild_survey')).not.toBe(true);
    expect(surveyRows(t)).toEqual([]);
  });

  it('rejects an authored identity that collides with a generated survey', async () => {
    await expect(Tiny.start(`${halls}
      Entity cup__guild_survey: fact "An unrelated report".`, { rules }))
      .rejects.toThrow('Guild survey identity already declared: t__cup__guild_survey');
  });
});

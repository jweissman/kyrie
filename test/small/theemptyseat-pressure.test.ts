import { describe, expect, it } from 'bun:test';
import { Journey } from '../../src/session/journey';
import { Endings } from '../../src/lang/index';
import { PlaySession } from '../../src/session/play-session';
import { Undertakings } from '../../src/presentation/undertakings';
import { Narrator } from '../../src/presentation/narrator';
import { ScreenModel } from '../../src/ui/screen-model';
import steps from '../fixtures/theemptyseat/journey.json';

const campaign = 'data/campaigns/theemptyseat.campaign.json';
const ward = 'seatcity__ward';
const firstAct = async (proof: 'keep' | 'burn', courier: 'stop' | 'sell' = 'stop') => {
  const j = await Journey.start(campaign, 'pressure', { strict: true });
  const beginning = steps.succession.filter(step => step !== "Tell Hest about Tarian's bargain");
  await j.play(...(courier === 'stop' ? steps.succession : beginning),
    ...(proof === 'keep' ? steps.keepEvidence : steps.burnEvidence));
  if (courier === 'sell') {
    await j.play('>theemptyseat__guild_hall', "Ask Tarian to carry the Queen's summons");
  }
  return j;
};
const supper = async (j: Journey) => {
  await j.play('>theemptyseat__guild_hall', '=until matterOpen(welcome)',
    '^Make room for .* at supper', '=until matterOpen(confidences)', '^Stay to hear .* after supper');
  await j.play('=until occasionOver(supper)', '>theemptyseat__oath_hall', '=until matterOpen(shelter)');
};
const settle = async (j: Journey, order: string, ruler: string) => {
  await j.play(order, '=until matterOpen(war_command)', ruler, '=until siegeSettled(party)');
  return Endings.reached(j.campaign.world)?.title;
};
const openGate = 'Commit the watch and stores to bring the refugee carts in';
const crown = 'Ask Aled to take the crown and answer for the open gate';
const compact = 'Give Gareth the defence command until the siege is over';

describe('the Empty Seat carries causes across acts', () => {
  it('makes hospitality earn a returning witness and lets burned proof lead to a witnessed kingship', async () => {
    const j = await firstAct('burn');
    await supper(j);
    expect(j.holds('guestConfided', 'burned_guest')).toBe(true);
    expect(j.at('burned_guest')).toBe('theemptyseat__oath_hall');
    expect(j.measure('quantity', 'party', 'rations')).toBe(1);
    const restored = Journey.of(PlaySession.resume(j.session.checkpoint()), true);
    expect(await settle(restored, openGate, crown)).toBe('The beds without crowns');
    expect(restored.holds('befell', 'ri_evidence_sacrificed')).toBe(true);
    expect(restored.holds('befell', 'ri_evidence_kept')).toBe(false);
    expect(restored.holds('promiseKept', 'shelter_promise')).toBe(true);
    expect(restored.holds('holds', 'aled', ward)).toBe(true);
    expect(restored.at('refugees')).toBe('theemptyseat__palace_kitchen');
    expect(restored.holds('within', 'refugees', ward)).toBe(true);
  });

  it('does not replace burned evidence with an unseen witness when supper is missed', async () => {
    const j = await firstAct('burn');
    await j.play('>theemptyseat__oath_hall', '=until matterOpen(shelter)', openGate,
      '=until matterOpen(war_command)');
    expect(j.holds('guestConfided', 'burned_guest')).toBe(false);
    expect(j.find(crown)).toBeUndefined();
    expect(await j.play(compact, '=until siegeSettled(party)')).toContain('Gareth');
    expect(j.holds('befell', 'ri_emergency_compact')).toBe(true);
    expect(j.holds('befell', 'ri_succession_united')).toBe(false);
  });

  it('keeps documentary proof useful even when the company misses the visitor', async () => {
    const j = await firstAct('keep');
    await j.play('>theemptyseat__oath_hall', '=until matterOpen(shelter)');
    expect(j.holds('guestConfided', 'kept_guest')).toBe(false);
    expect(await settle(j, openGate, crown)).toBe('The beds without crowns');
    expect(j.holds('befell', 'ri_succession_united')).toBe(true);
  });

  it('makes a sold route detain the letter-bearer and costs an escort to undo that harm', async () => {
    const j = await firstAct('keep', 'sell');
    await j.play('>theemptyseat__guild_hall', '=until matterOpen(welcome)');
    expect(j.holds('detained', 'kept_guest')).toBe(true);
    expect(j.measure('escortReserve', ward)).toBe(1);
    expect(j.find('^Make room for')).toBeUndefined();
    await j.play('Send a wall escort to bring the detained visitor in');
    expect(j.holds('detained', 'kept_guest')).toBe(false);
    expect(j.measure('escortReserve', ward)).toBe(0);
    await j.play('>theemptyseat__oath_hall', '=until matterOpen(shelter)');
    expect(j.find(openGate)).toBeUndefined();
    expect(j.measure('assaultStrength', ward)).toBeGreaterThanOrEqual(6);
  });

  it('lets an early warning save the visitor without pretending the sold approach is secret again', async () => {
    const j = await firstAct('keep', 'sell');
    await j.play("Ask Hest to change the arriving witnesses' route", '=until matterOpen(welcome)');
    expect(j.holds('detained', 'kept_guest')).toBe(false);
    expect(j.at('kept_guest')).toBe('theemptyseat__guild_hall');
    await supper(j);
    expect(j.holds('befell', 'ri_court_betrayed')).toBe(true);
    expect(j.measure('assaultStrength', ward)).toBeGreaterThanOrEqual(6);
    const attack = j.measure('assaultStrength', ward), escorts = j.measure('escortReserve', ward);
    await j.play("Ask Tarian to name the Ferryman's blind approach");
    expect(j.measure('assaultStrength', ward)).toBe(attack);
    expect(j.measure('escortReserve', ward)).toBe(escorts);
  });

  it('makes the safe closed-gate plan break the first-act promise and cost Aled his assent', async () => {
    const j = await firstAct('keep');
    await supper(j);
    await j.play('Seal the north gate before the last carts arrive', '=until matterOpen(war_command)');
    expect(j.holds('promiseBroken', 'shelter_promise')).toBe(true);
    expect(j.find(crown)).toBeUndefined();
    await j.play(compact, '=until siegeSettled(party)');
    expect(Endings.reached(j.campaign.world)?.title).toBe('The unused linen');
    expect(j.holds('holds', 'gareth', ward)).toBe(true);
    expect(j.at('refugees')).toBe('theemptyseat__north_gate');
  });

  it('lets pressure advance offstage and makes unanswered business materially worse than a chosen order', async () => {
    const j = await Journey.start(campaign, 'pressure', { strict: true });
    await j.play('>seatcity__square', '=until siegeSettled(party)');
    expect(j.holds('publiclyProclaimed', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'ri_succession_open')).toBe(false);
    expect(j.holds('occasionOver', 'supper')).toBe(true);
    expect(j.holds('befell', 'ri_siege_begun')).toBe(true);
    expect(j.holds('befell', 'ri_succession_fractured')).toBe(true);
    expect(j.measure('wardDefence', ward)).toBeLessThan(j.measure('assaultStrength', ward));
    expect(j.holds('knows', 'party', 'siege_warning')).toBe(false);
    expect(j.holds('holds', 'ash_column', ward)).toBe(true);
    expect(j.campaign.running).toBe(true);
    expect(j.find('Ask the herald who succeeds the king')).toBeUndefined();
    expect(j.seen()).not.toContain('have not named his successor');
    expect(j.seen()).not.toContain('A runner tears through the square');
  });

  it('gives a nearby rumour-follower a real gold path to an unresolved council decision', async () => {
    const j = await firstAct('keep');
    await j.play('>theemptyseat__guild_hall', '=until befell(ri_siege_begun)', '=+3',
      'Ask Hest for the latest news from Dun Rì');
    expect(j.holds('knows', 'party', 'ri_siege_begun')).toBe(true);
    expect(j.holds('ordersGiven', 'party')).toBe(false);
    Undertakings.follow(j.campaign, 'theemptyseat__council_warning');
    const glance = Narrator.leaf(j.campaign, ScreenModel.build(j.campaign)).glance!;
    expect(glance.acts.filter(act => act.continues)).toHaveLength(1);
    await j.play('>theemptyseat__oath_hall');
    expect(j.find(openGate)).toBeDefined();
    expect(await settle(j, openGate, crown)).toBe('The beds without crowns');
  });
});

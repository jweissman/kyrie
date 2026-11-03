import { describe, expect, it, setDefaultTimeout } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type PolicyName } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Invariants, type Violation } from '../src/autoplay/invariants';
import type { CreatureGenerationContext } from '../src/content';
import { Ombra, home } from './support/ombra';

// The Nine Quiets (monk.kyr): the Bare Brothers' cloister, Brother Amery, and the nine temptations the city sets a
// guest of the Order, one a day: the Mouth, the Name, the Hand, the Back, the Step, the Hoard, the Tongue, the Face and
// the Crown. Each is kept, broken or missed; the Door at the Drawing depends on how many were kept and how. The
// campaign is the real one unless OMBRA_CAMPAIGN says otherwise (the steps were played against a module with stubs for
// the other authors' persons: data/campaigns/zz.campaign.json, uncommitted).
setDefaultTimeout(240000);
const campaign = process.env.OMBRA_CAMPAIGN ?? home;
const monk = () => Ombra.one('monk', 'miner', 'human', 'Ines');
const begin = (seed = 'monk', party = monk()) => Ombra.start(campaign, seed, party);
// From the end of the delta road to the cloister garth, and the cord given for the bell.
const toGarth = ['^To the Customs Steps', '^To Strangers', '^To Counting Row', '^To the Chapel steps', 'Into the cloister'];
const bell = [...toGarth, 'Climb the beam'];
const toSquare = ['^Out to the Chapel steps', '^To Counting Row', '^To Strangers'];
const toGarthFromSquare = ['^To Counting Row', '^To the Chapel steps', 'Into the cloister'];
const toGarthFromSteps = ['^To Strangers', ...toGarthFromSquare];

describe('The Nine Quiets: taking the cord', () => {
  it('is taken by the bell: a ladder, a rope, no charm at all; and nobody can say no to a man who has mended it', async () => {
    const g = await begin();
    await g.play(...toGarth);
    expect(g.page).toMatch(/Brother Wick, a young Brother, with a bundle/);
    expect(g.holds('mo_vow', 'party')).toBe(false);
    await g.play('Climb the beam');
    expect(g.holds('mo_vow', 'party')).toBe(true);
    expect(g.holds('mo_vow_bell', 'party')).toBe(true);
    expect(g.carries('mo_cord')).toBe(true);
    expect(g.knows('mo_quiets_known')).toBe(true);
    expect(g.holds('arcBegun', 'party', 'hand_door')).toBe(true);
    expect(g.page).toMatch(/I cannot say no to a man who has mended my bell/);
    expect(g.page).toMatch(/was taken in by the Bare Brothers, and given the cord/);
  });

  it('is refused to a mask: the Brothers do not speak to masks, and masks do not speak to the Brothers', async () => {
    const g = await begin('monk-mask');
    await g.play('^To the Customs Steps', '^To Strangers', '^Into the Wardrobe Annex', 'Talk to Ferris', 'Rent the Heron', '?Take your leave',
      'Put on the Heron', '^Out to Strangers', '^To Counting Row', '^To the Chapel steps', 'Into the cloister', 'Talk to Brother Amery', 'Speak to Brother Amery');
    expect(g.page).toMatch(/The Brothers do not speak to masks/);
    expect(g.j.offers('Ask Brother Amery to take you in')).toBe(false);
  });

  it('is pleaded for, hard (persuasion), or won by looking at his hands (insight), if the die allows: each leaves him thinking something else', async () => {
    let seen = 0;
    for (const seed of ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']) {
      const g = await begin(seed);
      await g.play(...toGarth.slice(0, 4), 'Into the cloister', 'Talk to Brother Amery', 'Ask Brother Amery to take you in',
        '?Look at Brother Amery', '?Tell Brother Amery you have come for the Quiets');
      if (g.holds('mo_vow_read', 'party')) {
        expect(g.knows('mo_amery_afraid')).toBe(true);
        expect(g.page).toMatch(/nobody has looked at my hands/);
        seen++;
      }
      if (g.holds('mo_vow_pleaded', 'party')) { expect(g.page).toMatch(/It will be the first thing the Quiets take/); seen++; }
      if (seen) { expect(g.holds('mo_vow', 'party')).toBe(true); break; }
      // A failure is not offered again at once; the bell is always there.
      expect(g.j.offers('Climb the beam')).toBe(true);
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe('The Nine Quiets: all nine kept', () => {
  it('is the Door: five or more kept, and a Brother\'s mind changed by a night sat through, not by proof; the crowd sits down', async () => {
    const g = await begin('monk-nine');
    await g.play(...bell, '=day 1 12:00', ...toSquare);
    // 1. The Mouth: the child's pies, gathered without a word.
    expect(g.holds('mo_open', 'mo_q1')).toBe(true);
    await g.play('Kneel in the wet');
    expect(g.holds('moQuiet', 'party', 'mo_q1')).toBe(true);
    expect(g.measure('moKept', 'party')).toBe(1);
    // 2. The Name: a man fined for nothing, and the Bare stands by.
    await g.play('=day 2 12:00', '^Into the Wardrobe Annex', 'Stand at the end');
    // 3. The Hand: the Hospice's own bell.
    await g.play('^Out to Strangers', '=day 3 12:00', '^Into the Hospice', "Take up Mother Tibb's hand-bell", '^Out to Strangers');
    // 4. The Back: a woman on the steps, three hours of her silence.
    await g.play('=day 4 12:00', '^To the Customs Steps', 'Sit down on the wet step', ...toGarthFromSteps);
    expect(g.measure('moKept', 'party')).toBe(4);
    // 5. The Step: a boy of nineteen goes to the Swap, and a lantern is carried.
    await g.play('=day 5 17:00', "Carry Brother Wick's lantern");
    expect(g.holds('mo_wick_gone', 'party')).toBe(true);
    // 6. The Hoard: a ladle beside the cook. 7 comes after the Reading.
    await g.play('=day 6 12:00', "^To the Brothers' refectory", 'Take a ladle', '=day 6 20:00', 'Talk to Brother Amery', 'Sit with Brother Amery through the Reading',
      '?Take your leave');
    expect(g.measure('moKept', 'party')).toBe(6);
    expect(g.measure('moPresence', 'party')).toBeGreaterThanOrEqual(3);
    // The reading and three Quiets kept by staying: he lets go of the Rule, at the next light, and says so.
    await g.play('=day 7 08:00');
    expect(g.holds('mo_brothers_stand', 'party')).toBe(true);
    expect(g.page).toMatch(/The Brothers will stand\. All of us|nine abreast/);
    // 7. The Tongue: Tibb, and the eleven, and a true answer.
    await g.play('^To the cloister garth', '^Out to the Chapel steps', '^To Counting Row', '^To Strangers', '^Into the Hospice', '=day 7 20:30',
      'Talk to Mother Tibb', 'Tell her that you do not know', '?Take your leave');
    // 8. The Face: a white domino, and a bow.
    await g.play('=day 8 12:00', '^Out to Strangers', '^To Counting Row', '^To the Chapel steps', 'Bow to them');
    expect(g.measure('moKept', 'party')).toBe(8);
    expect(g.holds('mo_honoured', 'party')).toBe(false);
    // 9. The Crown.
    await g.play('=day 9 18:00');
    expect(g.holds('handReady', 'party', 'hand_door')).toBe(true);
    await g.play("Stand in the Chapel's door");
    expect(g.holds('mo_door_stood', 'party')).toBe(true);
    expect(g.holds('handPlayed', 'party', 'hand_door')).toBe(true);
    expect(g.holds('arcDone', 'party', 'hand_door')).toBe(true);
    expect(g.measure('moKept', 'party')).toBe(9);
    expect(g.measure('moDoor', 'party')).toBe(3);
    expect(g.page).toMatch(/four thousand people sitting down in the rain/);
    expect(g.page).toMatch(/stood in the Chapel.s door at the Drawing, and did nothing/);
    // The closing account.
    await g.play('=day 9 23:30');
    expect(g.page).toMatch(/Of Brother Amery: he stood at the end of the line of nine/);
    expect(g.page).toMatch(/Of the Nine Quiets: all nine were kept/);
    expect(g.page).toMatch(/Of Brother Wick: a boy in a pierrot half-mask/);
    expect(g.page).toMatch(/Of the woman on the Customs Steps/);
  });

  it('keeps what it has kept across days: a Quiet met is shut and is not set again', async () => {
    const g = await begin('monk-keep');
    await g.play(...bell, '=day 1 12:00', ...toSquare, 'Kneel in the wet');
    expect(g.holds('mo_open', 'mo_q1')).toBe(false);
    expect(g.holds('mo_shut', 'mo_q1')).toBe(true);
    await g.play('=day 3 08:00');
    expect(g.holds('moQuiet', 'party', 'mo_q1')).toBe(true);
    expect(g.measure('moKept', 'party')).toBe(1);
    expect(g.holds('mo_open', 'mo_q1')).toBe(false);
    expect(g.carries('mo_cord')).toBe(true);
  });
});

describe('The Nine Quiets: broken, missed, and answered', () => {
  it('lets the hour go by: a Quiet missed is neither kept nor broken, and the thing happens without you', async () => {
    const g = await begin('monk-miss');
    await g.play(...bell, '=day 2 08:00');
    expect(g.holds('mo_missed', 'party', 'mo_q1')).toBe(true);
    expect(g.page).toMatch(/The hour of the Quiet of the Mouth has gone by, and nothing was kept or broken in it/);
    expect(g.measure('moKept', 'party')).toBe(0);
    expect(g.measure('moBroken', 'party')).toBe(0);
    expect(g.holds('moBroke', 'party', 'mo_q1')).toBe(false);
  });

  it('speaks to the man: a bare mouth is only counted (heat), where a face is heard; and the Name aloud is the Watch\'s count too', async () => {
    const g = await begin('monk-speak');
    await g.play(...bell, '=day 1 12:00', ...toSquare, 'Tell the man to stop');
    expect(g.holds('moBroke', 'party', 'mo_q1')).toBe(true);
    expect(g.measure('moMercy', 'party')).toBe(1);
    expect(g.measure('heat', 'party')).toBe(1);
    expect(g.page).toMatch(/You said a word to nobody, and have been counted for it/);
    // The Name: said aloud in the Annex, to every square by dusk: two heat, and a man ruined; the whisper would have
    // cost none.
    await g.play('=day 2 12:00', '^Into the Wardrobe Annex', 'Name Orrin Gadd aloud');
    expect(g.holds('named', 'mo_inspector')).toBe(true);
    expect(g.holds('moBroke', 'party', 'mo_q2')).toBe(true);
    expect(g.measure('heat', 'party')).toBeGreaterThanOrEqual(2);
    expect(g.page).toMatch(/you have bought it with a man/);
  });

  it('strikes, hoards, lies and takes the face: broken for love and broken for pride are different, and the Order counts them differently', async () => {
    const g = await begin('monk-break');
    await g.play(...bell, '=day 1 12:00', ...toSquare, '=day 3 12:00', '^Into the Hospice', 'Strike the man');
    expect(g.holds('moBroke', 'party', 'mo_q3')).toBe(true);
    expect(g.measure('heat', 'party')).toBeGreaterThanOrEqual(2);
    expect(g.page).toMatch(/a Bare who struck a mask/);
    // The Back, by coin: the courtesy that lets a person be left.
    await g.play('^Out to Strangers', '=day 4 12:00', '^To the Customs Steps', 'Give her four coin');
    expect(g.holds('moBroke', 'party', 'mo_q4')).toBe(true);
    // The Hoard, for the ninth night's sake (broken, with mercy); the Tongue, kindly (broken, with mercy); the Face,
    // for pride.
    await g.play(...toGarthFromSteps, '=day 6 12:00', "^To the Brothers' refectory", 'Keep your rations, and keep the store shut');
    expect(g.measure('moMercy', 'party')).toBe(1);
    await g.play('^To the cloister garth', '^Out to the Chapel steps', '^To Counting Row', '^To Strangers', '^Into the Hospice', '=day 7 20:30',
      'Talk to Mother Tibb', 'Tell her that they were all right', '?Take your leave');
    expect(g.measure('moMercy', 'party')).toBe(2);
    await g.play('=day 8 12:00', '^Out to Strangers', '^To Counting Row', '^To the Chapel steps', 'Take the white domino');
    expect(g.holds('mo_honoured', 'party')).toBe(true);
    expect(g.measure('moKept', 'party')).toBe(0);
    expect(g.measure('moBroken', 'party')).toBe(5);
    // Fewer than five kept: the Door is not offered, and the closing account says the cord hangs loose.
    await g.play('=day 9 18:30');
    expect(g.holds('handReady', 'party', 'hand_door')).toBe(false);
    expect(g.j.offers("Stand in the Chapel's door")).toBe(false);
    await g.play('=day 9 23:30');
    expect(g.page).toMatch(/Of the Nine Quiets: more were broken than kept/);
  });

  it('tells Brother Amery what was broken for another, and is told it was answered; and he is changed by it', async () => {
    const g = await begin('monk-answer');
    await g.play(...bell, '=day 1 12:00', ...toSquare, 'Tell the man to stop', ...toGarthFromSquare, '=day 1 21:00', '^To the Brothers. refectory', 'Talk to Brother Amery');
    expect(g.measure('moMercy', 'party')).toBe(1);
    expect(g.j.offers('Tell Brother Amery what you did')).toBe(true);
    await g.play('Tell Brother Amery what you did');
    expect(g.measure('moMercy', 'party')).toBe(0);
    expect(g.measure('moAnswered', 'party')).toBe(1);
    expect(g.measure('moKept', 'party')).toBe(1);
    expect(g.page).toMatch(/Then it is not broken\. It was answered/);
    // Not yet changed: one lever only. The Reading is the other.
    expect(g.holds('mo_brothers_stand', 'party')).toBe(false);
    await g.play('?Take your leave', '=day 2 20:30', 'Talk to Brother Amery', 'Sit with Brother Amery through the Reading');
    await g.play('=day 3 08:00');
    expect(g.holds('mo_brothers_stand', 'party')).toBe(true);
  });

  it('argues Brother Wick out of the door, if the die allows, and breaks the Quiet in doing it; or lets him go', async () => {
    let stayed = false, went = false;
    for (const seed of ['w1', 'w2', 'w3', 'w4', 'w5', 'w6']) {
      const g = await begin(seed);
      await g.play(...bell, '=day 5 17:00', 'Talk to Brother Wick', 'Tell Brother Wick that he is a Brother');
      expect(g.holds('moBroke', 'party', 'mo_q5')).toBe(true);
      if (g.holds('mo_wick_stays', 'party')) { stayed = true; expect(g.holds('mo_wick_gone', 'party')).toBe(false); }
      else { went = true; expect(g.holds('mo_wick_gone', 'party')).toBe(true); }
      if (stayed && went) { break; }
    }
    expect(stayed || went).toBe(true);
    const h = await begin('wick-go');
    await h.play(...bell, '=day 5 17:00', 'Let him go without a word');
    expect(h.holds('moQuiet', 'party', 'mo_q5')).toBe(true);
    expect(h.holds('mo_wick_gone', 'party')).toBe(true);
    expect(h.at('mo_wick')).toBe('ombra__offstage');
  });

  it('is left to a Brother who is not there: Wick goes at the Swap whether or not anyone carries the lantern', async () => {
    const g = await begin('monk-swap');
    await g.play(...bell, '=day 6 06:00');
    expect(g.holds('mo_wick_gone', 'party')).toBe(true);
    expect(g.page).toMatch(/somebody in the cloister goes out of the garth door with a bundle/);
  });
});

describe('The Nine Quiets: the Door, spoken', () => {
  it('is stood in as a face, and the crowd takes hold; or spoken to, and the speech is the crowd\'s now', async () => {
    // Five kept by staying, the Face taken at the eighth: the Door is held as a person holds it.
    const g = await begin('monk-face');
    await g.play(...bell, '=day 1 12:00', ...toSquare, 'Kneel in the wet', '=day 2 12:00', '^Into the Wardrobe Annex', 'Stand at the end', '^Out to Strangers',
      '=day 3 12:00', '^Into the Hospice', "Take up Mother Tibb's hand-bell", '^Out to Strangers', '=day 4 12:00', '^To the Customs Steps', 'Sit down on the wet step',
      ...toGarthFromSteps, '=day 5 17:00', "Carry Brother Wick's lantern");
    await g.play('=day 8 12:00', '^Out to the Chapel steps', 'Take the white domino');
    await g.play('=day 9 18:00');
    expect(g.measure('moKept', 'party')).toBe(5);
    await g.play("Stand in the Chapel's door");
    expect(g.measure('moDoor', 'party')).toBe(1);
    expect(g.page).toMatch(/They see a face\. A white domino of honour/);
  });
});

// The offered-action exploration: whatever the page offers, taken by players of several tempers, with the cord, checked
// at every step against what play must keep true.
async function explore(seed: string, policy: PolicyName, steps: number) {
  const party = [{ name: 'Ines', raceId: 'human', classId: 'monk' } as CreatureGenerationContext];
  const s = await PlaySession.start(campaign, seed, NodeBundleSource.shared, party);
  const player = new AutoPlayer(policy, new Draw(`${seed}:ombra-monk:${policy}`)), metrics = AutoplayRun.empty();
  const failures: string[] = [];
  for (let step = 0; step < steps && s.campaign.running; step++) {
    const move = player.next(AutoplayRun.situation(s, step));
    if (!move) { failures.push(`softlock at ${step}`); break; }
    try { await AutoplayRun.apply(s, move, player, metrics); } catch (e) {
      failures.push(`step ${step} ${JSON.stringify(move)}: ${(e as Error).message}`); break;
    }
    const violations: Violation[] = [...Invariants.creatures(s), ...Invariants.offered(s), ...Invariants.party(s),
      ...step % 40 === 39 ? Invariants.roundtrip(s) : []];
    if (violations.length) { failures.push(`step ${step}: ${violations[0]!.kind} ${violations[0]!.message}`); break; }
  }
  const again = await PlaySession.start(campaign, seed, NodeBundleSource.shared, party);
  await again.replay(s.transcript.steps);
  return { failures, metrics, replayed: again.canonical() === s.canonical() };
}

describe('The Nine Quiets, explored', () => {
  for (const [seed, policy] of [['quiet-a', 'mixed'], ['quiet-b', 'explore']] as const) {
    it(`is played by a ${policy} player, a monk, through its offered commands, and stays sound`, async () => {
      const r = await explore(seed, policy as PolicyName, 250);
      expect(r.failures).toEqual([]);
      expect(r.replayed).toBe(true);
      expect(r.metrics.commands).toBeGreaterThan(20);
    }, 300000);
  }
});

import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The fourth cold play of the golden route (mission-22/cold/cold-4-report.md), its one change held where it was met:
// every scene says, in its own prose and the first time it is seen, what is there and what is happening (CL-42), and
// the king answers his crown being lifted (CL-44). The play is replayed by its own lines, as the cold player sent them.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-4-lines.txt', 'utf8').split('\n').filter(Boolean);
describe('the golden route, after the fourth cold play', () => {
  const told: Said[] = [];
  let first: Said;
  let runner: Runner;
  // Each turn said, up to the crown taken (the cold play's 90th line), and the lines each said.
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    runner = new Runner(journey.session);
    first = runner.said();
    for (const line of lines.slice(0, 90)) {
      const s = await runner.ask(line);
      if (!('error' in s)) { told.push(s); }
    }
  }, 240000);
  const at = (place: string, moment: Said['moment'] = 'arrive') => told.find(s => s.at === place && s.moment === moment);
  const text = (s: Said | undefined) => s?.scene.lines.join('\n') ?? '';
  // Defect 1: the arrival had not said Bran was taken nor that Owain is your cousin, until a look or a follow.
  it('opens on why the company is on the landing, before the place', () => {
    const said = first.scene.lines, place = said.findIndex(l => l.startsWith('the landing at Porthalen'));
    expect(said.slice(0, place).join(' ')).toMatch(/They counted, and they took Bran\..*Owain is at your elbow, your cousin/);
    expect(said.slice(place).join(' ')).not.toContain('They took Bran');
    expect(said.some(l => l.startsWith('An aim: '))).toBe(true);
  });
  // Defect 13: a room's things had been in its acts alone.
  it('says what lies in a room the first time it is come to', () => {
    expect(text(at('region__w8_barrow_passage'))).toContain('You see a string of amber beads.');
    expect(text(at('region__w8_barrow_chamber'))).toContain('You see a fishing net.');
    expect(text(at('region__w8_barrow_back_stone'))).toContain('You see scattered coins, a damp notebook and a rotted pack.');
  });
  // Defect 17: a fight had opened on a line of hit points, and an ossuary on "The snakes are here."
  it('opens a fight on what came at the company, and says what the snakes are', () => {
    expect(told.find(s => s.moment === 'fight')?.scene.lines[0]).toBe('The agile ghouls come at you without a sound.');
    expect(text(at('region__w8_halls_ossuary'))).toContain('The snakes are here, each an adder, grey-brown');
  });
  // Defect 19: the torch had gone out in the fight with no word, and the dark come on after it.
  it('says the torch went out in the fight', () => {
    const after = told.find(s => s.at === 'region__w8_halls_stair_foot' && s.moment === 'outcome'
      && text(s).includes('The fight is won.'));
    expect(text(after)).toMatch(/Wenna.s torch gutters out\.[\s\S]*It is pitch dark/);
  });
  // CL-44, defects 22–24: no label before the king's own paragraph; his crown lifted, he comes; and the way out of
  // the barrow is one act, not seven.
  it('has the king come for his crown, and the barrow left in one act', () => {
    const hall = text(at('region__w8_grave_heart'));
    expect(hall).not.toContain('is here: a mummy');
    expect(hall).toContain('A dead body bound in brown linen');
    const taken = told.at(-1)!;
    expect([taken.moment, taken.scene.lines[0]]).toEqual(['fight',
      "The crown comes up off the king's head, and his dry hands close on the air where it was. Then he is off the bier and coming for you."]);
    expect(at('region__w8_barrow_back_stone')?.offer.rest.find(o => o.label === 'Out to Holyking')?.id)
      .toBe('travel:region__w8');
  });
});

import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { BeforeRooms } from './support/before-rooms';

// The fourth cold play of the golden route (mission-22/cold/cold-4-report.md), its one change held where it was met:
// every scene says, in its own prose and the first time it is seen, what is there and what is happening (CL-42), and
// the king answers his crown being lifted (CL-44). The play is replayed by its own lines, as the cold player sent them.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-4-lines.txt', 'utf8').split('\n').filter(Boolean);
describe('the golden route, after the fourth cold play', () => {
  const told: Said[] = [], byLine: (Said | undefined)[] = [];
  let first: Said;
  let runner: Runner;
  // Each turn said, up to the crown taken (the cold play's 90th line), and the lines each said.
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    runner = new Runner(BeforeRooms.set(journey.session));
    first = runner.said();
    for (const line of lines.slice(0, 90)) {
      const s = await runner.ask(line);
      byLine.push('error' in s ? undefined : s);
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
  // CL-47: the follow's look had said Owain's whole answer again, and the dog's greeting, after the act that said them;
  // and a companion's bark after a kill had been said word for word in two fights (T49, T74).
  it('says nothing twice: not the act\'s telling again on a look, nor a bark again in a later fight', () => {
    const owain = /Thirty-six,. says Owain/;
    expect(told[0]!.scene.lines.some(l => owain.test(l))).toBe(true);
    expect(told[1]!.scene.lines.some(l => owain.test(l) || l.startsWith('Patch barks'))).toBe(false);
    expect(told.filter(s => text(s).includes('does not look pleased')).length).toBeLessThanOrEqual(1);
  });
  // CL-45: asking Owain on the landing had made aims of the salt-pans and the sea-gate from signs never said; CL-49:
  // the reeve's own topics had stood in the rest while she was spoken to (the 14th line greets her, the 15th tells her
  // of Mardle).
  it('says the signs an act on the landing learns from, and leads by whom the company is speaking with', () => {
    const owain = text(byLine[0]);
    expect(owain).toContain('looking up the river for the fuel boat from Reedbridge, two days late');
    expect(owain).toContain('the reeve’s seal at its foot');
    // Said, and leads, not aims (HP-01): the sea-gate is held once the reeve is asked of it, not from her notice seen.
    expect(byLine[0]!.aims?.map(a => a.text).join(' ')).not.toContain('sea-gate at Gatesend');
    expect(byLine[0]!.aims?.map(a => a.text).join(' ')).not.toContain('fuel boat');
    const led = (s: Said | undefined) => s!.offer.primary.map(o => o.id);
    // First after the company's own story's (the drove's aftermath, Owain's word led as kin: the green's signs leads,
    // not aims, and nothing else held once Bran is out, HP-01), and before anything else of the green.
    const spoken = (s: Said | undefined) => led(s).filter(id => !id.startsWith('drove__'));
    expect(spoken(byLine[13])[0]).toMatch(/^gate__reeve_/);
    expect(spoken(byLine[14])[0]).toMatch(/^gate__reeve_/);
    // And Gwil Pryce, greeted with nothing to say to him, says what his boats are for.
    expect(led(byLine[16])).toContain('gate__wright_boats');
  });
  // CL-45's (4), the lead's ruling: the factor's question had been led on the landing before he was named; someone not
  // met is led as talking to them, the question after it; Bran, whom the aim names, is asked by name.
  it('leads someone not yet met as talking to them, the question after it', () => {
    const labels = (s: Said | undefined) => s!.offer.primary.map(o => o.label);
    // The company's head is called by its kingdom, not "the factor", beside Aster of the Exchange (CL-49's 12).
    expect(labels(byLine[0])).toContain('Talk to the Guldríce agent — ask about the king-barrow');
    expect(labels(byLine[0]).join(' ')).not.toContain('Ask the Guldríce agent');
    expect(labels(byLine[0]).join(' ')).not.toContain('the factor');
    expect(labels(at('drove__customs'))).toContain('Ask Bran what happened');
  });
  // CL-48's 21: the north recess marked heard, and what is heard from it held for a look; it is said on coming.
  it('says what is heard along a way marked heard, on coming to it', () => {
    const chamber = at('region__w8_barrow_chamber')!;
    expect([...chamber.offer.primary, ...chamber.offer.rest].some(o => o.marks.includes('heard'))).toBe(true);
    expect(text(chamber)).toContain('From the north recess comes the scrape of a whetstone on steel');
    expect(text(at('region__w8_halls_stair_foot'))).toContain('From the hall of the bones comes a cold');
  });
});

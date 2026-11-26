import { beforeAll, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { LocalObservations } from '../src/campaign/local-observations';
import { ScreenModel } from '../src/ui/screen-model';
import { Scenery } from '../src/ui/scenery';
import { Fits } from '../src/ui/fits';
import { AsMeant } from './support/as-meant';
import { ColdFour } from './support/cold-four';

// What the golden route tells and paints, against what the company is in (Sprint 3, S3-4 and S3-5; NP-01, NP-02,
// OA-13): the warrior come down the drove road and the elf mage of the weir, played by cold plays 4 and 5's own lines
// on the world as shipped, each as it was meant (AsMeant: a question to someone now one step off, a way taken at its
// risk; a line not offered now otherwise is refused and kept, as the plays' logs keep theirs), and each frame
// read as a reader would. A painting of dusk at eight in the morning, of the moon in a well at a quarter to nine, of a
// window's daylight four rooms under a barrow; the drove's sale cried to a mage in a kitchen at Gatesend; a word with
// one who is dead.
interface Frame { at: string; name: string; daylight: string; under: boolean; weather: string; painted: string;
  lines: string[]; talks: string[]; dead: string[]; inTown: boolean }
const routes = [
  ['the warrior on the drove road', 'human/warrior/Wenna', 'doc/architecture/mission-22/cold/cold-4-lines.txt', 90],
  ['the mage of the weir', 'elf/mage/Ilse/scholar', 'doc/architecture/mission-22/cold/cold-5-lines.txt', 96]] as const;
// The fourth play's lines with what the world now asks after them (ColdFour: the footpads its road to Holyking now
// stops for, and the ghouls' fight pressed on).
async function walk(as: string, play: string, n: number): Promise<Frame[]> {
  const sent = play === ColdFour.path ? ColdFour.played(n) : readFileSync(play, 'utf8').split('\n').filter(Boolean)
    .slice(0, n);
  const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', as]));
  const r = new Runner(journey.session), frames: Frame[] = [];
  for (const line of sent) {
    const x = await AsMeant.ask(r, line);
    if ('error' in x) { continue; }
    const c = journey.session.campaign, w = c.world, screen = ScreenModel.build(c), painting = Scenery.seen(screen);
    // One who has joined the company is read as dead (CreatureFacts): not them.
    const along = new Set(w.relates('travelsWith') ? w.related('travelsWith').map(t => t.args[0]!) : []);
    const dead = w.relates('dead') ? w.related('dead').map(d => d.args[0]!).filter(d => !along.has(d)) : [];
    const offered = [...x.offer.primary, ...x.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
    frames.push({ at: screen.place.id, name: screen.place.name, daylight: screen.expedition.daylight,
      under: !!screen.place.underground, weather: screen.weather ?? '', lines: x.scene.lines,
      painted: painting ? `${painting}: ${Fits.words(painting)}` : '',
      talks: offered.flatMap(o => /^(?:talk_to\(|talk:)([^,)]+)/.exec(o.id)?.[1] ?? []), dead,
      inTown: LocalObservations.inArea(w, 'party', 'region__s1') });
  }
  return frames;
}
// Each frame that breaks a claim, by where and when, so a failure says which.
const breaking = (frames: Frame[], broken: (f: Frame) => boolean) =>
  frames.filter(broken).map(f => `${f.name} (${f.daylight}, ${f.weather || 'under'}): ${f.painted}`);

for (const [who, as, play, n] of routes) {
  describe(`the golden route told and painted, for ${who}`, () => {
    let frames: Frame[] = [];
    beforeAll(async () => { frames = await walk(as, play, n); }, 120000);
    it('paints no dusk or moon by day, and no daylight at evening or night', () => {
      expect(frames.length).toBeGreaterThan(60);
      expect(frames.filter(f => f.painted).length).toBeGreaterThan(20);
      const late = /\b(dusk|night|moon|moonlit|starlit|sunset)\b/;
      expect(breaking(frames, f => f.daylight === 'day' && late.test(f.painted))).toEqual([]);
      expect(breaking(frames, f => f.daylight !== 'day' && /\b(daylight|sunlit|sunny|bright day)\b/.test(f.painted)))
        .toEqual([]);
    });
    it('paints no sky, window or daylight under the ground, and nothing clear or sunny in the rain', () => {
      expect(frames.some(f => f.under && f.painted)).toBe(true);
      expect(breaking(frames, f => f.under && /\b(sky|daylight|windows?|moon|sunlit|hillside)\b/.test(f.painted)))
        .toEqual([]);
      expect(breaking(frames, f => /rain|storm|snow|fog/.test(f.weather) && /\b(clear|sunny|sunlit)\b/.test(f.painted)))
        .toEqual([]);
    });
    // NP-02: the drove's sale is Porthalen's, done on Mardle's clock wherever the company is and heard only in the
    // town.
    it('tells the drove\'s sale only to a company in Porthalen', () => {
      const sale = /nails a paper to the customs-house|buyer from Wrackham|The sale begins at the pens|sent Bran/;
      expect(frames.filter(f => f.lines.some(l => sale.test(l)) && !f.inTown).map(f => f.name)).toEqual([]);
    });
    // S3-5: the dead do not speak. Something is killed on each route (the barrow's dwellers, the corn-store's rats).
    it('offers no word with one who is dead', () => {
      expect(frames.some(f => f.dead.length)).toBe(true);
      expect(frames.flatMap(f => f.talks.filter(t => f.dead.includes(t)).map(t => `${f.name}: ${t}`))).toEqual([]);
    });
  });
}

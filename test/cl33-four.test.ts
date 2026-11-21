import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';
import type { Frame } from '../src/creation/protocol';
import { ClientParity } from '../scripts/client-parity';
import { AsMeant } from './support/as-meant';
import { BeforeRooms } from './support/before-rooms';

// CL-33, the act that matters marked among the four (cold play 5: "the offer is a wall where the act that matters is
// unmarked"): at each turn of the golden route's first hour where the followed aim has a step here (the engine's own
// lead, Glance.continuance), that step is among the four, gold, in its own words, in the runner's offer and in the
// page's projection alike. Played by the cold plays' own lines: the weir's sea-gate (cold play 5) and the drove road's
// fuel boat (the golden warrior's walk). The same turns on the page, at a desk and on a phone, are
// test/cl33-four-browser's.
class Four {
  static async play(as: string, file: string, n: number): Promise<{ r: Runner; s: Said }> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', as]));
    const r = new Runner(BeforeRooms.set(journey.session));
    let s = r.said();
    for (const line of readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(0, n)) {
      const x = await AsMeant.ask(r, line);
      if (!('error' in x)) { s = x; }
    }
    return { r, s };
  }
  // The step the engine says, and where each client draws it.
  static read(r: Runner, s: Said) {
    const g = r.leaf!.glance!, c = g.continuance, witness = c && 'witness' in c ? c.witness : undefined;
    const frame = { title: '', screen: ScreenModel.build(r.session.campaign), entries: [], leaf: r.leaf, opening: [],
      chronicle: [], transcript: { steps: [] } } as unknown as Frame;
    const page = ClientParity.drawn(frame).four.find(a => a.choice === witness);
    const runner = s.offer.primary.find(o => o.id === witness);
    return { kind: c?.kind, witness, gold: g.acts.find(a => a.choice === witness)?.continues, page, runner };
  }
}
const weir = 'doc/architecture/mission-22/cold/cold-5-lines.txt', drove = 'doc/architecture/mission-22/golden/warrior-walk.txt';
describe('the act that matters, among the four and gold (CL-33)', () => {
  it('at the gate-well, the pawl found: taking it (cold play 5\'s 6)', async () => {
    const { r, s } = await Four.play('elf/mage/Ilse/scholar', weir, 9);
    const at = Four.read(r, s);
    expect([at.kind, at.witness, at.gold]).toEqual(['gilded', 'gate__pawl#look', true]);
    expect(at.page?.continues).toBe(true);
    expect(at.runner?.label).toMatch(/pawl/i);
    expect(at.runner?.aspects).toContain('undertaking');
  }, 180000);
  it('at the windlass with Gesk hired, the wind gold among the four (its 10); and after a try that did not come off,'
    + ' said as that, not as nothing bearing on the aim', async () => {
    const failed = await Four.play('elf/mage/Ilse/scholar', weir, 18);
    expect(failed.s.scene.lines.join(' ')).toContain('The drum will not come round');
    const c = failed.r.leaf!.glance!.continuance!;
    expect(c.kind === 'frontier' && c.said).toBe('Set the pawl in its socket and wind the sea-gate shut: that try did not'
      + ' come off. Another may, or more hands.');
    const { r, s } = await Four.play('elf/mage/Ilse/scholar', weir, 22);
    const at = Four.read(r, s);
    expect([at.kind, at.gold]).toEqual(['step', true]);
    expect(at.runner?.label).toMatch(/^Set the pawl in its socket and wind the sea-gate shut · an even chance/);
    expect(at.page?.continues).toBe(true);
  }, 240000);
  it('turned to Ianto at the staithe: poling his boat among what is had of him, first', async () => {
    const { s } = await Four.play('human/warrior/Wenna', drove, 22);
    expect(s.moment).toBe('inspect');
    expect(s.offer.primary[0]?.label).toMatch(/^Pole Ianto's fuel boat down the cut/);
    expect(s.offer.primary[0]?.aspects).toContain('undertaking');
  }, 180000);
});

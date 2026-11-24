import { afterAll, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DeemWorkbench } from '../../src/cli/deem-workbench';
import { WorkbenchSources } from '../../src/cli/workbench-sources';
import { WorkbenchStudy, type Study } from '../../src/cli/workbench-study';

// The Deem workbench (BRIEF §7): settlements drawn by seed as a player meets them, judged with a reason, drawn again
// by the same seeds after the data is revised, each verdict said to stand or to have been revised; where a field came
// from (the template's expression, the tables and the group it was drawn in, the Kyr template's options); and the
// echoes a country's towns make of one another. The settlements study under
// doc/architecture/mission-22-beta/workbench is the demonstration.
const dir = mkdtempSync(join(tmpdir(), 'kyrie-deem-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
describe('the Deem workbench', () => {
  it('draws the same settlements from the same seed, the home town with its troubles', () => {
    const study = WorkbenchStudy.draw(dir, { generator: 'settlement', seed: 'pin', n: 6, given: {} });
    expect(study.samples.map(s => s.key).slice(0, 2)).toEqual(['pin-0/s1', 'pin-0/s2']);
    expect(study.samples[0]!.fields['undertown.store']).toBeDefined();
    expect(study.samples[1]!.fields['undertown.store']).toBeUndefined();
    expect(WorkbenchSources.sample('settlement', 'pin', 6)).toEqual(study.samples);
  });
  it('keeps a verdict with its reason, and says on replay whether the sample was revised', () => {
    WorkbenchStudy.judge(dir, '2', 'reject', 'too plain');
    WorkbenchStudy.judge(dir, '3', 'select', 'good');
    let { redrawn } = WorkbenchStudy.replay(dir);
    expect(redrawn.find(r => r.n === 2)?.standing).toBe('rejected, still as it was');
    expect(redrawn.find(r => r.n === 3)?.standing).toBe('selected, as it was');
    // As the data stood when the study was drawn: the inn of the second town otherwise.
    const kept = JSON.parse(readFileSync(WorkbenchStudy.file(dir), 'utf8')) as Study, inn = kept.samples[1]!.fields.inn!;
    kept.samples[1]!.fields.inn = 'the Old Inn';
    writeFileSync(WorkbenchStudy.file(dir), JSON.stringify(kept));
    ({ redrawn } = WorkbenchStudy.replay(dir));
    expect(redrawn.find(r => r.n === 2)).toMatchObject({ standing: 'rejected, revised', changed: [['inn', 'the Old Inn', inn]] });
  });
  it('says where a field came from: the tables and group it was drawn in, or the options of its Kyr template', () => {
    const study = WorkbenchStudy.load(dir), home = study.samples[0]!;
    const inn = WorkbenchSources.source('settlement', home, 'inn');
    expect(inn.tables.map(t => `${t.table}[${t.group}]`)).toEqual(['innAdjective[default]', 'innObject[default]']);
    expect(inn.tables.every(t => t.drawn.length > 0)).toBe(true);
    const store = WorkbenchSources.source('settlement', home, 'undertown.store');
    expect(store.options?.filter(o => o.drawn).map(o => o.option)).toEqual([home.fields['undertown.store']!]);
    const lines: string[] = [];
    expect(DeemWorkbench.main(['inspect', dir, '1', 'name'], l => lines.push(l))).toBe(0);
    expect(lines.join('\n')).toMatch(/placeFeature\[/);
  });
  it('finds the echoes among a country\'s towns, and what a Deem template wants given to run alone', () => {
    const town = (n: number, inn: string) => ({ n, key: `k/${n}`, group: 'one country', fields: { inn } });
    expect(WorkbenchStudy.echoes({ samples: [town(1, 'the Dancing Unicorn'), town(2, 'the Laughing Unicorn'),
      town(3, 'the Blue Boar')] } as unknown as Study)).toEqual(['one country: inn "unicorn" in #1, #2']);
    expect(WorkbenchSources.blind('settlement')).toMatch(/wants #_index/);
    expect(WorkbenchSources.blind('wonder')).toBe('runs alone');
  });
});

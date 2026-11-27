import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Glob } from 'bun';
import { FeatureMap } from '../feature-map';
import { PlanningInstruments } from '../planning-instruments';
import { RegisterKinds } from '../register-kinds';
import { RegisterTickets, type Row } from '../register-tickets';
import { ColdPlay } from './cold-play';
import { HealthScoreModel, type AspectInput, type HealthInput, type HealthScore, type Ratchet } from './score';

interface Target { id: string; name: string; path: string; field: string; why: string }
interface Reference { sha: string; ids: Set<string>; rows: Row[]; kinds: ReturnType<typeof RegisterKinds.read>;
  sources: Record<string, string> }
export interface Snapshot {
  date: string;
  sha: string;
  sources: Record<string, string>;
  historyReferences: { grace: string; yesterday: string };
  components: HealthScore;
}

export class HealthRead {
  static readonly root = RegisterTickets.root;
  static readonly targets = 'scripts/health/zero-targets.json';
  static readonly history = 'doc/architecture/health-history.jsonl';
  static git(args: string[], root = this.root): string {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
  }
  static blob(data: string | Buffer): string {
    const bytes = Buffer.from(data);
    return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  }
  static before(date: string, root = this.root): Reference {
    const sha = this.git(['rev-list', '--first-parent', '-1', `--before=${date}T00:00:00Z`, 'HEAD'], root);
    if (!sha) { throw new Error(`No register history before ${date}; fetch enough Git history to cover the grace period`); }
    const sources: Record<string, string> = {};
    const files = [...RegisterTickets.files, RegisterKinds.file];
    const contents = files.map(file => {
      const data = execFileSync('git', ['show', `${sha}:${file}`], {
        cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
      });
      sources[`${sha}:${file}`] = this.blob(data);
      return data;
    });
    const rows = RegisterTickets.rows(contents.slice(0, 2).join('\n\n'));
    const kinds = JSON.parse(contents[2]!) as ReturnType<typeof RegisterKinds.read>;
    return { sha, sources, rows, kinds, ids: new Set(rows.map(row => row.id)) };
  }
  static field(value: unknown, path: string): unknown {
    for (const key of path ? path.split('.') : []) {
      if (!value || typeof value !== 'object' || !(key in value)) { throw new Error(`Missing ratchet field ${path}`); }
      value = (value as Record<string, unknown>)[key];
    }
    return value;
  }
  static ratchets(targets: Target[]): Ratchet[] {
    if (new Set(targets.map(t => t.id)).size !== targets.length) { throw new Error('Duplicate zero-target ratchet'); }
    return targets.map(t => {
      if (!t.id || !t.name || !t.why || !t.path) { throw new Error('Incomplete zero-target ratchet'); }
      const json: unknown = JSON.parse(readFileSync(join(this.root, t.path), 'utf8'));
      const value = this.field(json, t.field), count = Array.isArray(value) ? value.length : value;
      if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
        throw new Error(`Invalid ratchet ${t.id} in ${t.path}`);
      }
      return { id: t.id, name: t.name, why: t.why, count };
    });
  }
  static aspects(reference: Reference): AspectInput[] {
    const tree = FeatureMap.tree(), caps = FeatureMap.capabilities(), atlas = FeatureMap.read();
    const pins = FeatureMap.pins(atlas);
    return tree.map(aspect => ({ id: aspect.n, name: aspect.name, capabilities:
      aspect.sections.flatMap(section => section.capabilities.map(cap => {
        const filed = new Set(cap.rows ?? []);
        const due = reference.rows.some(row => row.state !== 'reference' && row.state !== 'duplicate'
          && (filed.has(row.id) || RegisterKinds.kind(row.id, reference.kinds) !== 'defect')
          && FeatureMap.placed(row, caps)?.id === cap.id);
        const names = cap.pins ?? [];
        const met = names.length > 0 && names.every(name => {
          const matches = pins.filter(pin => pin.describe === name);
          return matches.length > 0 && matches.every(pin => pin.state === 'met');
        });
        return { id: cap.id, title: cap.title, due, met };
      })) }));
  }
  static paths(targets: Target[]): string[] {
    const atlas = FeatureMap.read();
    const features = [...new Glob('test/features/*/*.pin.test.ts').scanSync(this.root)];
    const experience = atlas.experience.flatMap(family => Object.keys(family.specs).map(file => `${file}.test.ts`));
    const rounds = join(this.root, ColdPlay.directory);
    const evidence = existsSync(rounds) ? readdirSync(rounds).filter(f => f.endsWith('.json'))
      .map(f => `${ColdPlay.directory}/${f}`) : [];
    return [...new Set([this.targets, ...targets.map(t => t.path), ...RegisterTickets.files,
      'doc/architecture/feature-map.json', 'doc/architecture/features.json', RegisterKinds.file,
      'doc/architecture/mission-22/planning.json', 'scripts/feature-map.ts', 'scripts/planning-instruments.ts',
      'scripts/planning-views.ts', 'scripts/register-kinds.ts', 'scripts/register-tickets.ts',
      'scripts/health/cold-play.ts', 'scripts/health/read.ts', 'scripts/health/report.ts', 'scripts/health/score.ts',
      ...features, ...experience, ...evidence])].sort();
  }
  static snapshot(date: string): Snapshot {
    const day = ColdPlay.date(date);
    if (!Number.isFinite(day)) { throw new Error(`Invalid health date ${date}`); }
    const cutoff = new Date(day - 6 * ColdPlay.day).toISOString().slice(0, 10);
    const grace = this.before(cutoff), yesterday = this.before(date);
    const targets = JSON.parse(readFileSync(join(this.root, this.targets), 'utf8')) as Target[];
    const rows = PlanningInstruments.placed().filter(r => r.kind === 'defect' && r.slice);
    const input: HealthInput = { date, rounds: ColdPlay.read(this.root), aspects: this.aspects(grace),
      p0: rows.filter(r => r.pri === 'P0').map(r => r.id),
      p1: rows.filter(r => r.pri === 'P1').map(r => ({ id: r.id, status: r.status,
        existedYesterday: yesterday.ids.has(r.id) })), ratchets: this.ratchets(targets) };
    const sources = Object.fromEntries(this.paths(targets)
      .map(path => [path, this.blob(readFileSync(join(this.root, path)))]));
    return { date, sha: this.git(['rev-parse', 'HEAD']), sources: { ...sources, ...grace.sources, ...yesterday.sources },
      historyReferences: { grace: grace.sha, yesterday: yesterday.sha }, components: HealthScoreModel.compute(input) };
  }
}

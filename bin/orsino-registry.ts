#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'node:fs';
import { OrsinoCorpus } from './orsino-corpus';
import { OrsinoExtract } from '../src/registry/orsino-extract';
import { OrsinoRegistry } from '../src/registry/orsino-registry';
import { OrsinoReport } from '../src/registry/orsino-report';
import { KyrLinks } from '../src/registry/kyr-links';

class Options {
  constructor(private readonly args: string[]) {}
  get(name: string, fallback: string): string {
    const i = this.args.indexOf(`--${name}`);
    return i >= 0 && this.args[i + 1] ? this.args[i + 1]! : fallback;
  }
}
const [command = 'generate', ...rest] = process.argv.slice(2);
const options = new Options(rest);
const source = options.get('source', '../orsino');
const out = options.get('out', 'data/orsino/registry.json');

if (command === 'generate') {
  const snapshot = OrsinoExtract.snapshot(OrsinoCorpus.load(source));
  writeFileSync(out, `${JSON.stringify(snapshot, null, 1)}\n`);
  const unresolved = snapshot.entries.flatMap(e => e.references.filter(r => !r.resolved).map(r => `${e.id} -> ${r.ref}`));
  console.log(`${snapshot.entries.length} entries in ${Object.keys(snapshot.families).length} families from orsino@${snapshot.source.revision.slice(0, 12)}`);
  console.log(`${unresolved.length} unresolved references`);
} else if (command === 'report' || command === 'check') {
  const registry = new OrsinoRegistry(JSON.parse(readFileSync('data/orsino/registry.json', 'utf8')),
    JSON.parse(readFileSync('data/orsino/adaptations.json', 'utf8')));
  const problems = [...registry.problems(), ...KyrLinks.problems(registry.ledger)];
  problems.forEach(p => console.error(p));
  if (command === 'report') {
    writeFileSync(options.get('report', 'doc/architecture/orsino-coverage.md'), OrsinoReport.render(registry));
  }
  for (const g of registry.gaps().slice(0, 12)) { console.log(`${String(g.entries).padStart(4)}  ${g.feature}`); }
  if (problems.length) { process.exit(1); }
} else {
  console.error('usage: bun bin/orsino-registry.ts generate|report|check [--source ../orsino] [--out data/orsino/registry.json]');
  process.exit(1);
}
